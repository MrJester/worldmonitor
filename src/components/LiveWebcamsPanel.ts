import { Panel } from './Panel';
import { isDesktopRuntime, getRemoteApiBaseUrl } from '@/services/runtime';
import { escapeHtml } from '@/utils/sanitize';
import { t } from '../services/i18n';
import { trackWebcamSelected, trackWebcamRegionFiltered } from '@/services/analytics';
import { getRegionHierarchy } from '@/config/geographic-regions';
import type { GeographicRegion } from '@/config/geographic-regions';

type WebcamRegion = 'middle-east' | 'europe' | 'asia' | 'americas';

interface WebcamFeed {
  id: string;
  city: string;
  country: string;
  region: WebcamRegion;
  channelHandle?: string;
  fallbackVideoId?: string;
  customEmbedUrl?: string; // For non-YouTube embeds (iframe)
  mjpegUrl?: string; // For MJPEG streams (img tag)
}

// Verified YouTube live stream IDs — validated Feb 2026 via title cross-check.
// IDs may rotate; update when stale.
const WEBCAM_FEEDS: WebcamFeed[] = [
  // Middle East — Jerusalem & Tehran adjacent (conflict hotspots)
  { id: 'jerusalem', city: 'Jerusalem', country: 'Israel', region: 'middle-east', channelHandle: '@TheWesternWall', fallbackVideoId: 'UyduhBUpO7Q' },
  { id: 'tehran', city: 'Tehran', country: 'Iran', region: 'middle-east', channelHandle: '@IranHDCams', fallbackVideoId: '-zGuR1qVKrU' },
  { id: 'tel-aviv', city: 'Tel Aviv', country: 'Israel', region: 'middle-east', channelHandle: '@IsraelLiveCam', fallbackVideoId: '-VLcYT5QBrY' },
  { id: 'mecca', city: 'Mecca', country: 'Saudi Arabia', region: 'middle-east', channelHandle: '@MakkahLive', fallbackVideoId: 'DEcpmPUbkDQ' },
  // Europe
  { id: 'kyiv', city: 'Kyiv', country: 'Ukraine', region: 'europe', channelHandle: '@DWNews', fallbackVideoId: '-Q7FuPINDjA' },
  { id: 'odessa', city: 'Odessa', country: 'Ukraine', region: 'europe', channelHandle: '@UkraineLiveCam', fallbackVideoId: 'e2gC37ILQmk' },
  { id: 'paris', city: 'Paris', country: 'France', region: 'europe', channelHandle: '@PalaisIena', fallbackVideoId: 'OzYp4NRZlwQ' },
  { id: 'st-petersburg', city: 'St. Petersburg', country: 'Russia', region: 'europe', channelHandle: '@SPBLiveCam', fallbackVideoId: 'CjtIYbmVfck' },
  { id: 'london', city: 'London', country: 'UK', region: 'europe', channelHandle: '@EarthCam', fallbackVideoId: 'Lxqcg1qt0XU' },
  // Americas
  { id: 'washington', city: 'Washington DC', country: 'USA', region: 'americas', channelHandle: '@AxisCommunications', fallbackVideoId: '1wV9lLe14aU' },
  { id: 'new-york', city: 'New York', country: 'USA', region: 'americas', channelHandle: '@EarthCam', fallbackVideoId: '4qyZLflp-sI' },
  { id: 'los-angeles', city: 'Los Angeles', country: 'USA', region: 'americas', channelHandle: '@VeniceVHotel', fallbackVideoId: 'EO_1LWqsCNE' },
  { id: 'miami', city: 'Miami', country: 'USA', region: 'americas', channelHandle: '@FloridaLiveCams', fallbackVideoId: '5YCajRjvWCg' },
  // Puerto Vallarta, Mexico - multiple beach and city views
  { id: 'puerto-vallarta-thrive', city: 'Puerto Vallarta', country: 'Mexico', region: 'americas', customEmbedUrl: 'https://www.ipcamlive.com/player/player.php?alias=66a7fb01a47a4&autoplay=1' },
  { id: 'puerto-vallarta-daquiri-dicks', city: 'Puerto Vallarta', country: 'Mexico', region: 'americas', customEmbedUrl: 'https://g3.ipcamlive.com/player/player.php?alias=662abcbe448a7' },
  { id: 'puerto-vallarta-hyatt', city: 'Puerto Vallarta', country: 'Mexico', region: 'americas', channelHandle: '@WebcamsdeMexico', fallbackVideoId: 'RY3iDXftbMc' },
  { id: 'puerto-vallarta-MarinaTowers01', city: 'Puerto Vallarta', country: 'Mexico', region: 'americas', customEmbedUrl: 'https://g3.ipcamlive.com/player/player.php?alias=66a9467052d59' },
  { id: 'puerto-vallarta-MarinaTowers02', city: 'Puerto Vallarta', country: 'Mexico', region: 'americas', customEmbedUrl: 'https://g1.ipcamlive.com/player/player.php?alias=651f4ad1bab43' },
  { id: 'puerto-vallarta-MarinaTowers03', city: 'Puerto Vallarta', country: 'Mexico', region: 'americas', customEmbedUrl: 'https://g3.ipcamlive.com/player/player.php?alias=656637e067099' },
  // Asia-Pacific — Taipei first (strait hotspot), then Shanghai, Tokyo, Seoul
  { id: 'taipei', city: 'Taipei', country: 'Taiwan', region: 'asia', channelHandle: '@JackyWuTaipei', fallbackVideoId: 'z_fY1pj1VBw' },
  { id: 'shanghai', city: 'Shanghai', country: 'China', region: 'asia', channelHandle: '@SkylineWebcams', fallbackVideoId: '76EwqI5XZIc' },
  { id: 'tokyo', city: 'Tokyo', country: 'Japan', region: 'asia', channelHandle: '@TokyoLiveCam4K', fallbackVideoId: '4pu9sF5Qssw' },
  { id: 'seoul', city: 'Seoul', country: 'South Korea', region: 'asia', channelHandle: '@UNvillage_live', fallbackVideoId: '-JhoMGoAfFc' },
  { id: 'sydney', city: 'Sydney', country: 'Australia', region: 'asia', channelHandle: '@WebcamSydney', fallbackVideoId: '7pcL-0Wo77U' },
];

const MAX_GRID_CELLS = 4;

type ViewMode = 'grid' | 'single';
type RegionFilter = 'all' | WebcamRegion;

export class LiveWebcamsPanel extends Panel {
  private viewMode: ViewMode = 'grid';
  private regionFilter: RegionFilter = 'all';
  private activeFeed: WebcamFeed = WEBCAM_FEEDS[0]!;
  private toolbar: HTMLElement | null = null;
  private iframes: (HTMLIFrameElement | HTMLImageElement)[] = [];
  private observer: IntersectionObserver | null = null;
  private isVisible = false;
  private idleTimeout: ReturnType<typeof setTimeout> | null = null;
  private boundIdleResetHandler!: () => void;
  private boundVisibilityHandler!: () => void;
  private readonly IDLE_PAUSE_MS = 5 * 60 * 1000;
  private isIdle = false;
  private geographicFilter: import('@/config/geographic-regions').GeographicRegion | null = null;
  private floatingOverlay: HTMLElement | null = null;
  private currentCameraIndex = 0;
  private isExpanded = false;

  constructor() {
    super({
      id: 'live-webcams',
      title: t('panels.liveWebcams'),
      onPopOut: () => this.openFloatingOverlay()
    });
    this.element.classList.add('panel-wide');
    this.createToolbar();
    this.setupIntersectionObserver();
    this.setupIdleDetection();
    this.render();
  }

  private openFloatingOverlay(): void {
    if (this.floatingOverlay) {
      this.closeFloatingOverlay();
      return;
    }

    this.floatingOverlay = document.createElement('div');
    this.floatingOverlay.className = 'webcam-floating-overlay';

    const container = document.createElement('div');
    container.className = 'webcam-floating-container';

    const header = document.createElement('div');
    header.className = 'webcam-floating-header';

    const title = document.createElement('div');
    title.className = 'webcam-floating-title';
    title.textContent = t('panels.liveWebcams');

    const controls = document.createElement('div');
    controls.className = 'webcam-floating-controls';

    const expandBtn = document.createElement('button');
    expandBtn.className = 'webcam-floating-btn';
    expandBtn.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"/></svg>';
    expandBtn.title = 'Toggle grid';
    expandBtn.addEventListener('click', () => this.toggleExpanded());

    const closeBtn = document.createElement('button');
    closeBtn.className = 'webcam-floating-btn';
    closeBtn.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 6L6 18M6 6l12 12"/></svg>';
    closeBtn.title = 'Close';
    closeBtn.addEventListener('click', () => this.closeFloatingOverlay());

    controls.appendChild(expandBtn);
    controls.appendChild(closeBtn);

    header.appendChild(title);
    header.appendChild(controls);

    const content = document.createElement('div');
    content.className = 'webcam-floating-content';

    const prevBtn = document.createElement('button');
    prevBtn.className = 'webcam-nav-btn webcam-nav-prev';
    prevBtn.innerHTML = '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M15 18l-6-6 6-6"/></svg>';
    prevBtn.addEventListener('click', () => this.navigateCamera(-1));

    const nextBtn = document.createElement('button');
    nextBtn.className = 'webcam-nav-btn webcam-nav-next';
    nextBtn.innerHTML = '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 18l6-6-6-6"/></svg>';
    nextBtn.addEventListener('click', () => this.navigateCamera(1));

    content.appendChild(prevBtn);
    content.appendChild(nextBtn);

    container.appendChild(header);
    container.appendChild(content);

    this.floatingOverlay.appendChild(container);
    document.body.appendChild(this.floatingOverlay);

    // Allow container to be draggable
    this.makeDraggable(container, header);

    this.renderFloatingContent(content);
  }

  private makeDraggable(container: HTMLElement, handle: HTMLElement): void {
    let isDragging = false;
    let currentX = 0;
    let currentY = 0;
    let initialX = 0;
    let initialY = 0;

    handle.style.cursor = 'move';

    handle.addEventListener('mousedown', (e) => {
      isDragging = true;
      initialX = e.clientX - currentX;
      initialY = e.clientY - currentY;
    });

    document.addEventListener('mousemove', (e) => {
      if (isDragging) {
        e.preventDefault();
        currentX = e.clientX - initialX;
        currentY = e.clientY - initialY;
        container.style.transform = `translate(${currentX}px, ${currentY}px)`;
      }
    });

    document.addEventListener('mouseup', () => {
      isDragging = false;
    });
  }

  private closeFloatingOverlay(): void {
    if (this.floatingOverlay) {
      this.floatingOverlay.remove();
      this.floatingOverlay = null;
      this.isExpanded = false;
    }
  }

  private toggleExpanded(): void {
    this.isExpanded = !this.isExpanded;
    const content = this.floatingOverlay?.querySelector('.webcam-floating-content');
    if (content) {
      this.renderFloatingContent(content as HTMLElement);
    }
  }

  private navigateCamera(direction: number): void {
    const feeds = this.filteredFeeds;
    this.currentCameraIndex = (this.currentCameraIndex + direction + feeds.length) % feeds.length;
    const content = this.floatingOverlay?.querySelector('.webcam-floating-content');
    if (content) {
      this.renderFloatingContent(content as HTMLElement);
    }
  }

  private renderFloatingContent(content: HTMLElement): void {
    content.innerHTML = '';
    const feeds = this.filteredFeeds;

    if (this.isExpanded) {
      // Show grid of cameras (3x3 = 9 feeds)
      const grid = document.createElement('div');
      grid.className = 'webcam-floating-grid';

      const displayFeeds = feeds.slice(0, 9);
      displayFeeds.forEach(feed => {
        const cell = document.createElement('div');
        cell.className = 'webcam-floating-cell';

        const label = document.createElement('div');
        label.className = 'webcam-cell-label';
        label.innerHTML = `<span class="webcam-live-dot"></span><span class="webcam-city">${escapeHtml(feed.city)}</span>`;

        const iframe = this.createIframe(feed);
        cell.appendChild(iframe);
        cell.appendChild(label);
        grid.appendChild(cell);
      });

      content.appendChild(grid);
      content.parentElement?.classList.add('expanded');
    } else {
      // Show single camera
      const feed = feeds[this.currentCameraIndex] || feeds[0];
      if (!feed) return;

      const wrapper = document.createElement('div');
      wrapper.className = 'webcam-floating-single';

      const label = document.createElement('div');
      label.className = 'webcam-floating-label';
      label.innerHTML = `<span class="webcam-live-dot"></span><span class="webcam-city">${escapeHtml(feed.city)}, ${escapeHtml(feed.country)}</span>`;

      const iframe = this.createIframe(feed);
      wrapper.appendChild(iframe);
      wrapper.appendChild(label);

      const indicator = document.createElement('div');
      indicator.className = 'webcam-camera-indicator';
      indicator.textContent = `${this.currentCameraIndex + 1} / ${feeds.length}`;
      wrapper.appendChild(indicator);

      content.appendChild(wrapper);
      content.parentElement?.classList.remove('expanded');
    }
  }

  private get filteredFeeds(): WebcamFeed[] {
    let feeds = WEBCAM_FEEDS;

    // Apply local region filter (toolbar buttons)
    if (this.regionFilter !== 'all') {
      feeds = feeds.filter(f => f.region === this.regionFilter);
    }

    // Apply geographic filter with cascading (global filter dropdown)
    if (this.geographicFilter && this.geographicFilter.id !== 'global') {
      feeds = this.applyCascadingFilter(feeds);
    }

    return feeds;
  }

  /**
   * Apply cascading filter - try specific region first, then walk up the hierarchy
   */
  private applyCascadingFilter(feeds: WebcamFeed[]): WebcamFeed[] {
    if (!this.geographicFilter) return feeds;

    console.log('[LiveWebcams] applyCascadingFilter called with', feeds.length, 'feeds for region:', this.geographicFilter.label);

    // Get hierarchy: puerto-vallarta -> mexico -> north-america -> global
    const hierarchy = getRegionHierarchy(this.geographicFilter.id);
    console.log('[LiveWebcams] Hierarchy:', hierarchy.map(r => r.label));

    // Try each level of the hierarchy from most specific to least specific
    for (const region of hierarchy) {
      console.log('[LiveWebcams] Trying level:', region.label, 'cities:', region.cities, 'countryCodes:', region.countryCodes);
      const filtered = this.filterByRegion(feeds, region);
      console.log('[LiveWebcams] Filtered result:', filtered.length, 'webcams');
      if (filtered.length > 0) {
        console.log(`[LiveWebcams] Found ${filtered.length} webcams at level: ${region.label}`);
        return filtered;
      }
    }

    // If nothing found at any level, return empty
    console.log('[LiveWebcams] No webcams found at any hierarchy level');
    return [];
  }

  /**
   * Filter feeds by a specific region
   */
  private filterByRegion(feeds: WebcamFeed[], region: GeographicRegion): WebcamFeed[] {
    const { cities, countryCodes } = region;

    // Try city matching first
    if (cities && cities.length > 0) {
      const cityMatches = feeds.filter(f => {
        const cityLower = f.city.toLowerCase();
        const countryLower = f.country.toLowerCase();
        return cities.some(c => {
          const searchTerm = c.toLowerCase();
          return cityLower.includes(searchTerm) ||
                 searchTerm.includes(cityLower) ||
                 countryLower.includes(searchTerm);
        });
      });
      if (cityMatches.length > 0) return cityMatches;
    }

    // Try country code matching
    if (countryCodes && countryCodes.length > 0) {
      const regionMapping: Record<string, WebcamRegion> = {
        'US': 'americas',
        'MX': 'americas',
        'CA': 'americas',
        'IL': 'middle-east',
        'IR': 'middle-east',
        'SA': 'middle-east',
        'AE': 'middle-east',
        'UA': 'europe',
        'RU': 'europe',
        'FR': 'europe',
        'GB': 'europe',
        'CN': 'asia',
        'TW': 'asia',
        'JP': 'asia',
        'KR': 'asia',
        'AU': 'asia',
      };
      const allowedRegions = new Set(countryCodes.map(cc => regionMapping[cc]).filter(Boolean));
      if (allowedRegions.size > 0) {
        return feeds.filter(f => allowedRegions.has(f.region));
      }
    }

    return [];
  }

  private static readonly ALL_GRID_IDS = ['jerusalem', 'tehran', 'kyiv', 'washington'];

  private get gridFeeds(): WebcamFeed[] {
    if (this.regionFilter === 'all') {
      return LiveWebcamsPanel.ALL_GRID_IDS
        .map(id => WEBCAM_FEEDS.find(f => f.id === id)!)
        .filter(Boolean);
    }
    return this.filteredFeeds.slice(0, MAX_GRID_CELLS);
  }

  private createToolbar(): void {
    this.toolbar = document.createElement('div');
    this.toolbar.className = 'webcam-toolbar';

    const regionGroup = document.createElement('div');
    regionGroup.className = 'webcam-toolbar-group';

    const regions: { key: RegionFilter; label: string }[] = [
      { key: 'all', label: t('components.webcams.regions.all') },
      { key: 'middle-east', label: t('components.webcams.regions.mideast') },
      { key: 'europe', label: t('components.webcams.regions.europe') },
      { key: 'americas', label: t('components.webcams.regions.americas') },
      { key: 'asia', label: t('components.webcams.regions.asia') },
    ];

    regions.forEach(({ key, label }) => {
      const btn = document.createElement('button');
      btn.className = `webcam-region-btn${key === this.regionFilter ? ' active' : ''}`;
      btn.dataset.region = key;
      btn.textContent = label;
      btn.addEventListener('click', () => this.setRegionFilter(key));
      regionGroup.appendChild(btn);
    });

    const viewGroup = document.createElement('div');
    viewGroup.className = 'webcam-toolbar-group';

    const gridBtn = document.createElement('button');
    gridBtn.className = `webcam-view-btn${this.viewMode === 'grid' ? ' active' : ''}`;
    gridBtn.dataset.mode = 'grid';
    gridBtn.innerHTML = '<svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" stroke="none"><rect x="3" y="3" width="8" height="8" rx="1"/><rect x="13" y="3" width="8" height="8" rx="1"/><rect x="3" y="13" width="8" height="8" rx="1"/><rect x="13" y="13" width="8" height="8" rx="1"/></svg>';
    gridBtn.title = 'Grid view';
    gridBtn.addEventListener('click', () => this.setViewMode('grid'));

    const singleBtn = document.createElement('button');
    singleBtn.className = `webcam-view-btn${this.viewMode === 'single' ? ' active' : ''}`;
    singleBtn.dataset.mode = 'single';
    singleBtn.innerHTML = '<svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" stroke="none"><rect x="3" y="3" width="18" height="14" rx="2"/><rect x="3" y="19" width="18" height="2" rx="1"/></svg>';
    singleBtn.title = 'Single view';
    singleBtn.addEventListener('click', () => this.setViewMode('single'));

    viewGroup.appendChild(gridBtn);
    viewGroup.appendChild(singleBtn);

    this.toolbar.appendChild(regionGroup);
    this.toolbar.appendChild(viewGroup);
    this.element.insertBefore(this.toolbar, this.content);
  }

  private setRegionFilter(filter: RegionFilter): void {
    if (filter === this.regionFilter) return;
    trackWebcamRegionFiltered(filter);
    this.regionFilter = filter;
    this.toolbar?.querySelectorAll('.webcam-region-btn').forEach(btn => {
      (btn as HTMLElement).classList.toggle('active', (btn as HTMLElement).dataset.region === filter);
    });
    const feeds = this.filteredFeeds;
    if (feeds.length > 0 && !feeds.includes(this.activeFeed)) {
      this.activeFeed = feeds[0]!;
    }
    this.render();
  }

  private setViewMode(mode: ViewMode): void {
    if (mode === this.viewMode) return;
    this.viewMode = mode;
    this.toolbar?.querySelectorAll('.webcam-view-btn').forEach(btn => {
      (btn as HTMLElement).classList.toggle('active', (btn as HTMLElement).dataset.mode === mode);
    });
    this.render();
  }

  private buildEmbedUrl(feed: WebcamFeed): string {
    // Use custom embed URL if provided
    if (feed.customEmbedUrl) {
      return feed.customEmbedUrl;
    }

    // Otherwise use YouTube embed
    const videoId = feed.fallbackVideoId!;
    if (isDesktopRuntime()) {
      const remoteBase = getRemoteApiBaseUrl();
      const params = new URLSearchParams({
        videoId,
        autoplay: '1',
        mute: '1',
      });
      return `${remoteBase}/api/youtube/embed?${params.toString()}`;
    }
    return `https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&mute=1&controls=0&modestbranding=1&playsinline=1&rel=0`;
  }

  private createIframe(feed: WebcamFeed): HTMLIFrameElement | HTMLImageElement {
    // MJPEG streams use img tag instead of iframe
    if (feed.mjpegUrl) {
      console.log('[LiveWebcams] Creating MJPEG stream for:', feed.city, feed.mjpegUrl);
      const img = document.createElement('img');
      img.className = 'webcam-iframe'; // Reuse same styling
      img.src = feed.mjpegUrl;
      img.alt = `${feed.city} live webcam`;
      img.style.cssText = 'width: 100%; height: 100%; object-fit: cover;';
      img.addEventListener('error', (e) => {
        console.error('[LiveWebcams] MJPEG stream error for', feed.city, e);
        img.alt = 'Stream unavailable';
        img.style.background = '#000';
      });
      img.addEventListener('load', () => {
        console.log('[LiveWebcams] MJPEG stream loaded for', feed.city);
      });
      return img as unknown as HTMLIFrameElement;
    }

    const iframe = document.createElement('iframe');
    iframe.className = 'webcam-iframe';
    iframe.title = `${feed.city} live webcam`;
    iframe.allowFullscreen = true;

    // Custom embeds need very permissive settings to work
    if (feed.customEmbedUrl) {
      console.log('[LiveWebcams] Creating custom embed iframe for:', feed.city, feed.customEmbedUrl);
      // Maximum permissions for third-party players
      iframe.allow = 'autoplay; camera; microphone; encrypted-media; picture-in-picture; fullscreen; geolocation';
      // Don't restrict referrer for third-party embeds
      iframe.referrerPolicy = 'unsafe-url';
      // Set loading to eager for custom embeds
      iframe.setAttribute('loading', 'eager');
      // No sandbox restrictions - allow everything needed for custom players
      // Add error handler
      iframe.addEventListener('error', (e) => {
        console.error('[LiveWebcams] Iframe error for', feed.city, e);
      });
      iframe.addEventListener('load', () => {
        console.log('[LiveWebcams] Iframe loaded successfully for', feed.city);
      });
    } else {
      // YouTube embeds with standard security
      iframe.setAttribute('loading', 'lazy');
      iframe.allow = 'autoplay; encrypted-media; picture-in-picture';
      iframe.referrerPolicy = 'strict-origin-when-cross-origin';
      iframe.setAttribute('sandbox', 'allow-scripts allow-same-origin allow-presentation');
    }

    // Set src after attributes are configured
    iframe.src = this.buildEmbedUrl(feed);

    return iframe;
  }

  private render(): void {
    this.destroyIframes();

    if (!this.isVisible || this.isIdle) {
      this.content.innerHTML = '<div class="webcam-placeholder">Webcams paused</div>';
      return;
    }

    if (this.viewMode === 'grid') {
      this.renderGrid();
    } else {
      this.renderSingle();
    }
  }

  private renderGrid(): void {
    this.content.innerHTML = '';
    this.content.className = 'panel-content webcam-content';

    const grid = document.createElement('div');
    grid.className = 'webcam-grid';

    this.gridFeeds.forEach(feed => {
      const cell = document.createElement('div');
      cell.className = 'webcam-cell';
      cell.addEventListener('click', () => {
        trackWebcamSelected(feed.id, feed.city, 'grid');
        this.activeFeed = feed;
        this.setViewMode('single');
      });

      const label = document.createElement('div');
      label.className = 'webcam-cell-label';
      label.innerHTML = `<span class="webcam-live-dot"></span><span class="webcam-city">${escapeHtml(feed.city.toUpperCase())}</span>`;

      const iframe = this.createIframe(feed);
      cell.appendChild(iframe);
      cell.appendChild(label);
      grid.appendChild(cell);
      this.iframes.push(iframe);
    });

    this.content.appendChild(grid);
  }

  private renderSingle(): void {
    this.content.innerHTML = '';
    this.content.className = 'panel-content webcam-content';

    const wrapper = document.createElement('div');
    wrapper.className = 'webcam-single';

    const iframe = this.createIframe(this.activeFeed);
    wrapper.appendChild(iframe);
    this.iframes.push(iframe);

    const switcher = document.createElement('div');
    switcher.className = 'webcam-switcher';

    const backBtn = document.createElement('button');
    backBtn.className = 'webcam-feed-btn webcam-back-btn';
    backBtn.innerHTML = '<svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" stroke="none"><rect x="3" y="3" width="8" height="8" rx="1"/><rect x="13" y="3" width="8" height="8" rx="1"/><rect x="3" y="13" width="8" height="8" rx="1"/><rect x="13" y="13" width="8" height="8" rx="1"/></svg> Grid';
    backBtn.addEventListener('click', () => this.setViewMode('grid'));
    switcher.appendChild(backBtn);

    this.filteredFeeds.forEach(feed => {
      const btn = document.createElement('button');
      btn.className = `webcam-feed-btn${feed.id === this.activeFeed.id ? ' active' : ''}`;
      btn.textContent = feed.city;
      btn.addEventListener('click', () => {
        trackWebcamSelected(feed.id, feed.city, 'single');
        this.activeFeed = feed;
        this.render();
      });
      switcher.appendChild(btn);
    });

    this.content.appendChild(wrapper);
    this.content.appendChild(switcher);
  }

  private destroyIframes(): void {
    this.iframes.forEach(element => {
      if (element instanceof HTMLIFrameElement) {
        element.src = 'about:blank';
      }
      element.remove();
    });
    this.iframes = [];
  }

  private setupIntersectionObserver(): void {
    this.observer = new IntersectionObserver(
      (entries) => {
        const wasVisible = this.isVisible;
        this.isVisible = entries.some(e => e.isIntersecting);
        if (this.isVisible && !wasVisible && !this.isIdle) {
          this.render();
        } else if (!this.isVisible && wasVisible) {
          this.destroyIframes();
        }
      },
      { threshold: 0.1 }
    );
    this.observer.observe(this.element);
  }

  private setupIdleDetection(): void {
    this.boundVisibilityHandler = () => {
      if (document.hidden) {
        if (this.idleTimeout) clearTimeout(this.idleTimeout);
      } else {
        if (this.isIdle) {
          this.isIdle = false;
          if (this.isVisible) this.render();
        }
        this.boundIdleResetHandler();
      }
    };
    document.addEventListener('visibilitychange', this.boundVisibilityHandler);

    this.boundIdleResetHandler = () => {
      if (this.idleTimeout) clearTimeout(this.idleTimeout);
      if (this.isIdle) {
        this.isIdle = false;
        if (this.isVisible) this.render();
      }
      this.idleTimeout = setTimeout(() => {
        this.isIdle = true;
        this.destroyIframes();
        this.content.innerHTML = '<div class="webcam-placeholder">Webcams paused — move mouse to resume</div>';
      }, this.IDLE_PAUSE_MS);
    };

    ['mousedown', 'keydown', 'scroll', 'touchstart', 'mousemove'].forEach(event => {
      document.addEventListener(event, this.boundIdleResetHandler, { passive: true });
    });

    this.boundIdleResetHandler();
  }

  public refresh(): void {
    if (this.isVisible && !this.isIdle) {
      this.render();
    }
  }

  public setGeographicFilter(region: import('@/config/geographic-regions').GeographicRegion | null): void {
    console.log('[LiveWebcams] setGeographicFilter called with:', region?.label, region?.id);
    this.geographicFilter = region;

    // When a specific region is selected, determine which toolbar button to activate
    if (region && region.id !== 'global') {
      // Map geographic regions to toolbar regions
      const toolbarRegion = this.getToolbarRegionForGeographic(region);
      if (toolbarRegion) {
        this.regionFilter = toolbarRegion;
        this.toolbar?.querySelectorAll('.webcam-region-btn').forEach(btn => {
          (btn as HTMLElement).classList.toggle('active', (btn as HTMLElement).dataset.region === toolbarRegion);
        });
        console.log('[LiveWebcams] Set toolbar region to:', toolbarRegion);
      }
    } else {
      // Reset to 'all' when global is selected
      this.regionFilter = 'all';
      this.toolbar?.querySelectorAll('.webcam-region-btn').forEach(btn => {
        (btn as HTMLElement).classList.toggle('active', (btn as HTMLElement).dataset.region === 'all');
      });
    }

    // Update active feed if needed
    const feeds = this.filteredFeeds;
    console.log('[LiveWebcams] Filtered feeds:', feeds.length, feeds.map(f => f.city));
    if (feeds.length > 0 && !feeds.includes(this.activeFeed)) {
      this.activeFeed = feeds[0]!;
    }
    // Force render by temporarily setting isVisible to true
    const wasVisible = this.isVisible;
    console.log('[LiveWebcams] isVisible before render:', this.isVisible, 'isIdle:', this.isIdle);
    this.isVisible = true;
    this.render();
    this.isVisible = wasVisible;
  }

  /**
   * Map geographic region to toolbar region button
   */
  private getToolbarRegionForGeographic(region: import('@/config/geographic-regions').GeographicRegion): RegionFilter | null {
    const { countryCodes } = region;

    if (!countryCodes || countryCodes.length === 0) {
      return null;
    }

    // Map country codes to toolbar regions
    const countryToRegion: Record<string, WebcamRegion> = {
      'US': 'americas', 'MX': 'americas', 'CA': 'americas', 'BR': 'americas', 'AR': 'americas',
      'IL': 'middle-east', 'IR': 'middle-east', 'SA': 'middle-east', 'AE': 'middle-east', 'JO': 'middle-east',
      'UA': 'europe', 'RU': 'europe', 'FR': 'europe', 'GB': 'europe', 'DE': 'europe', 'IT': 'europe',
      'CN': 'asia', 'TW': 'asia', 'JP': 'asia', 'KR': 'asia', 'AU': 'asia', 'IN': 'asia',
    };

    // Return the first matching region
    for (const code of countryCodes) {
      if (countryToRegion[code]) {
        return countryToRegion[code];
      }
    }

    return null;
  }

  public destroy(): void {
    if (this.idleTimeout) {
      clearTimeout(this.idleTimeout);
      this.idleTimeout = null;
    }
    document.removeEventListener('visibilitychange', this.boundVisibilityHandler);
    ['mousedown', 'keydown', 'scroll', 'touchstart', 'mousemove'].forEach(event => {
      document.removeEventListener(event, this.boundIdleResetHandler);
    });
    this.observer?.disconnect();
    this.destroyIframes();
    this.closeFloatingOverlay();
    super.destroy();
  }
}
