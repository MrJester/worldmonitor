import { GEOGRAPHIC_REGIONS, getRegionById, type GeographicRegion } from '@/config/geographic-regions';
import { escapeHtml } from '@/utils/sanitize';
import { t } from '@/services/i18n';

export interface GeographicFilterChangeEvent {
  regionId: string;
  region: GeographicRegion;
}

export class GeographicFilter {
  private container: HTMLElement;
  private selectElement: HTMLSelectElement;
  private searchInput: HTMLInputElement | null = null;
  private currentRegionId: string = 'global';
  private onChangeCallback?: (event: GeographicFilterChangeEvent) => void;
  private isOpen: boolean = false;

  constructor(containerId: string, onChange?: (event: GeographicFilterChangeEvent) => void) {
    const el = document.getElementById(containerId);
    if (!el) throw new Error(`Container ${containerId} not found`);
    this.container = el;
    this.onChangeCallback = onChange;
    this.render();
    this.selectElement = this.container.querySelector('select')!;
    this.searchInput = this.container.querySelector('.geo-search-input');
    this.attachListeners();
  }

  private render(): void {
    const currentRegion = getRegionById(this.currentRegionId);
    const displayLabel = currentRegion ? currentRegion.label : 'Global';

    const html = `
      <div class="geographic-filter">
        <svg class="geo-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="12" cy="12" r="10"/>
          <line x1="2" y1="12" x2="22" y2="12"/>
          <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
        </svg>
        <div class="geo-custom-dropdown">
          <div class="geo-dropdown-button">
            <span class="geo-dropdown-label">${escapeHtml(displayLabel)}</span>
            <svg class="geo-dropdown-arrow" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="6 9 12 15 18 9"></polyline>
            </svg>
          </div>
          <div class="geo-dropdown-container" style="display: none;">
            <div class="geo-search-container">
              <svg class="geo-search-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="11" cy="11" r="8"></circle>
                <path d="m21 21-4.35-4.35"></path>
              </svg>
              <input type="text" class="geo-search-input" placeholder="Search regions..." />
            </div>
            <div class="geo-options-list">
              ${this.buildOptions()}
            </div>
          </div>
        </div>
        <select class="geo-select" id="geoSelect" style="display: none;">
          ${this.buildOptionsForSelect()}
        </select>
      </div>
    `;
    this.container.innerHTML = html;
  }

  private buildOptions(): string {
    // Build custom dropdown items with search support
    let html = '';

    // Global
    const globalRegion = getRegionById('global');
    if (globalRegion) {
      html += this.buildOption(globalRegion, 0);
    }

    html += '<div class="geo-separator"></div>';

    // North America
    html += this.buildContinentSection('north-america', t('components.geoFilter.northAmerica'), [
      { countryId: 'usa', label: 'United States', children: ['california', 'texas', 'tennessee', 'new-york', 'florida', 'knoxville', 'san-francisco', 'los-angeles', 'new-york-city', 'washington-dc', 'miami'] },
      { countryId: 'mexico', label: 'Mexico', children: ['puerto-vallarta', 'mexico-city'] },
      { countryId: 'canada', label: 'Canada', children: [] },
    ]);

    html += '<div class="geo-separator"></div>';

    // Middle East
    html += this.buildContinentSection('middle-east', t('components.geoFilter.middleEast'), [
      { countryId: 'israel', label: 'Israel', children: ['jerusalem', 'tel-aviv'] },
      { countryId: 'iran', label: 'Iran', children: ['tehran'] },
      { countryId: 'saudi-arabia', label: 'Saudi Arabia', children: [] },
      { countryId: 'uae', label: 'United Arab Emirates', children: [] },
    ]);

    html += '<div class="geo-separator"></div>';

    // Europe
    html += this.buildContinentSection('europe', t('components.geoFilter.europe'), [
      { countryId: 'france', label: 'France', children: ['paris'] },
      { countryId: 'russia', label: 'Russia', children: [] },
      { countryId: 'uk', label: 'United Kingdom', children: ['london'] },
      { countryId: 'ukraine', label: 'Ukraine', children: ['kyiv'] },
    ]);

    html += '<div class="geo-separator"></div>';

    // Asia & Pacific
    html += this.buildContinentSection('asia', t('components.geoFilter.asia'), [
      { countryId: 'australia', label: 'Australia', children: ['sydney'] },
      { countryId: 'china', label: 'China', children: ['shanghai'] },
      { countryId: 'japan', label: 'Japan', children: ['tokyo'] },
      { countryId: 'south-korea', label: 'South Korea', children: ['seoul'] },
      { countryId: 'taiwan', label: 'Taiwan', children: ['taipei'] },
    ]);

    html += '<div class="geo-separator"></div>';

    // Latin America
    const latinAmericaRegion = getRegionById('latin-america');
    if (latinAmericaRegion) {
      html += this.buildOption(latinAmericaRegion, 0, '🌎');
    }

    // Africa
    const africaRegion = getRegionById('africa');
    if (africaRegion) {
      html += this.buildOption(africaRegion, 0, '🌍');
    }

    return html;
  }

  private buildContinentSection(continentId: string, _continentLabel: string, countries: Array<{countryId: string, label: string, children: string[]}>): string {
    let html = '';
    const continentRegion = getRegionById(continentId);

    if (continentRegion) {
      html += this.buildOption(continentRegion, 0, '🌐');

      // Sort countries alphabetically
      const sortedCountries = countries.sort((a, b) => a.label.localeCompare(b.label));

      sortedCountries.forEach(country => {
        const countryRegion = getRegionById(country.countryId);
        if (countryRegion) {
          html += this.buildOption(countryRegion, 1, '├─');

          // Get and sort children (states/cities)
          const children = country.children
            .map(childId => getRegionById(childId))
            .filter(r => r !== undefined)
            .sort((a, b) => a!.label.localeCompare(b!.label));

          children.forEach((childRegion, index) => {
            const isLast = index === children.length - 1;
            html += this.buildOption(childRegion!, 2, isLast ? '└─' : '├─');
          });
        }
      });
    }

    return html;
  }

  private buildOption(region: GeographicRegion, level: number, prefix: string = ''): string {
    const indent = '  '.repeat(level);
    const isSelected = region.id === this.currentRegionId ? 'selected' : '';
    const displayText = prefix ? `${indent}${prefix} ${region.label}` : region.label;

    return `<div class="geo-option ${isSelected}" data-region-id="${region.id}" data-search-text="${escapeHtml(region.label.toLowerCase())}" data-level="${level}">
      ${escapeHtml(displayText)}
    </div>`;
  }

  private buildOptionsForSelect(): string {
    // Build standard select options for hidden select element (fallback)
    let html = '<option value="global">Global</option>';

    GEOGRAPHIC_REGIONS.forEach(region => {
      if (region.type !== 'global') {
        html += `<option value="${region.id}">${escapeHtml(region.label)}</option>`;
      }
    });

    return html;
  }

  private attachListeners(): void {
    const dropdownButton = this.container.querySelector('.geo-dropdown-button') as HTMLElement;
    const dropdownContainer = this.container.querySelector('.geo-dropdown-container') as HTMLElement;
    const optionsList = this.container.querySelector('.geo-options-list') as HTMLElement;

    // Toggle dropdown
    dropdownButton?.addEventListener('click', (e) => {
      e.stopPropagation();
      this.isOpen = !this.isOpen;
      if (dropdownContainer) {
        dropdownContainer.style.display = this.isOpen ? 'block' : 'none';
      }
      if (this.isOpen && this.searchInput) {
        setTimeout(() => this.searchInput?.focus(), 50);
      }
    });

    // Close dropdown when clicking outside
    document.addEventListener('click', (e) => {
      const target = e.target as HTMLElement;
      if (!this.container.contains(target)) {
        this.isOpen = false;
        if (dropdownContainer) {
          dropdownContainer.style.display = 'none';
        }
        if (this.searchInput) {
          this.searchInput.value = '';
          this.filterOptions('');
        }
      }
    });

    // Handle search input
    this.searchInput?.addEventListener('input', (e) => {
      const query = (e.target as HTMLInputElement).value.toLowerCase();
      this.filterOptions(query);
    });

    // Handle option selection
    optionsList?.addEventListener('click', (e) => {
      const target = e.target as HTMLElement;
      const option = target.closest('.geo-option') as HTMLElement;
      if (!option) return;

      const regionId = option.dataset.regionId;
      if (!regionId) return;

      const region = getRegionById(regionId);
      if (!region) return;

      this.currentRegionId = regionId;
      this.selectElement.value = regionId;

      // Update UI
      const label = this.container.querySelector('.geo-dropdown-label');
      if (label) {
        label.textContent = region.label;
      }

      // Close dropdown
      this.isOpen = false;
      if (dropdownContainer) {
        dropdownContainer.style.display = 'none';
      }

      // Clear search
      if (this.searchInput) {
        this.searchInput.value = '';
        this.filterOptions('');
      }

      // Update selected state
      optionsList.querySelectorAll('.geo-option').forEach(opt => opt.classList.remove('selected'));
      option.classList.add('selected');

      if (this.onChangeCallback) {
        this.onChangeCallback({ regionId, region });
      }
    });

    // Fallback: handle native select change
    this.selectElement.addEventListener('change', () => {
      const regionId = this.selectElement.value;
      const region = getRegionById(regionId);
      if (!region) return;

      this.currentRegionId = regionId;

      if (this.onChangeCallback) {
        this.onChangeCallback({ regionId, region });
      }
    });
  }

  private filterOptions(query: string): void {
    const optionsList = this.container.querySelector('.geo-options-list');
    if (!optionsList) return;

    const options = optionsList.querySelectorAll('.geo-option');
    const separators = optionsList.querySelectorAll('.geo-separator');

    if (!query) {
      // Show all
      options.forEach(opt => (opt as HTMLElement).style.display = 'block');
      separators.forEach(sep => (sep as HTMLElement).style.display = 'block');
      return;
    }

    // Hide separators during search
    separators.forEach(sep => (sep as HTMLElement).style.display = 'none');

    options.forEach(opt => {
      const searchText = (opt as HTMLElement).dataset.searchText || '';
      if (searchText.includes(query)) {
        (opt as HTMLElement).style.display = 'block';
      } else {
        (opt as HTMLElement).style.display = 'none';
      }
    });
  }

  public getCurrentRegion(): GeographicRegion {
    return getRegionById(this.currentRegionId) || GEOGRAPHIC_REGIONS[0]!;
  }

  public setRegion(regionId: string): void {
    const region = getRegionById(regionId);
    if (!region) return;

    this.currentRegionId = regionId;
    this.selectElement.value = regionId;

    if (this.onChangeCallback) {
      this.onChangeCallback({ regionId, region });
    }
  }

  public destroy(): void {
    this.container.innerHTML = '';
  }
}
