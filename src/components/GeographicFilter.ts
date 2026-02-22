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
  private currentRegionId: string = 'global';
  private onChangeCallback?: (event: GeographicFilterChangeEvent) => void;

  constructor(containerId: string, onChange?: (event: GeographicFilterChangeEvent) => void) {
    const el = document.getElementById(containerId);
    if (!el) throw new Error(`Container ${containerId} not found`);
    this.container = el;
    this.onChangeCallback = onChange;
    this.render();
    this.selectElement = this.container.querySelector('select')!;
    this.attachListeners();
  }

  private render(): void {
    const html = `
      <div class="geographic-filter">
        <svg class="geo-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="12" cy="12" r="10"/>
          <line x1="2" y1="12" x2="22" y2="12"/>
          <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
        </svg>
        <select class="geo-select" id="geoSelect">
          ${this.buildOptions()}
        </select>
      </div>
    `;
    this.container.innerHTML = html;
  }

  private buildOptions(): string {
    const groups: Record<string, string[]> = {};

    // Initialize known groups
    const knownGroups = ['global', 'north-america', 'usa', 'mexico', 'canada', 'middle-east', 'europe', 'asia', 'latin-america', 'africa'];
    knownGroups.forEach(key => groups[key] = []);

    // Group regions by hierarchy
    GEOGRAPHIC_REGIONS.forEach((region) => {
      const option = `<option value="${region.id}" ${region.id === this.currentRegionId ? 'selected' : ''}>${escapeHtml(region.label)}</option>`;

      if (region.type === 'global') {
        groups['global']!.push(option);
      } else if (region.parent) {
        if (!groups[region.parent]) {
          groups[region.parent] = [];
        }
        groups[region.parent]!.push(option);
      }
    });

    // Build hierarchical tree structure
    let html = groups['global']!.join('');

    // North America - Continent level
    html += `<optgroup label="━━━ ${t('components.geoFilter.northAmerica')} ━━━">`;

    // USA
    const usaRegion = getRegionById('usa');
    if (usaRegion) {
      html += `<option value="usa">${escapeHtml(usaRegion.label)}</option>`;
      if (groups['usa']!.length > 0) {
        html += `<optgroup label="  ├─ States & Cities">`;
        html += groups['usa']!.join('');
        html += '</optgroup>';
      }
    }

    // Mexico
    const mexicoRegion = getRegionById('mexico');
    if (mexicoRegion) {
      html += `<option value="mexico">${escapeHtml(mexicoRegion.label)}</option>`;
      if (groups['mexico']!.length > 0) {
        html += `<optgroup label="  ├─ Cities">`;
        html += groups['mexico']!.join('');
        html += '</optgroup>';
      }
    }

    // Canada
    const canadaRegion = getRegionById('canada');
    if (canadaRegion) {
      html += `<option value="canada">${escapeHtml(canadaRegion.label)}</option>`;
      if (groups['canada']!.length > 0) {
        html += `<optgroup label="  └─ Cities">`;
        html += groups['canada']!.join('');
        html += '</optgroup>';
      }
    }

    html += '</optgroup>';

    // Middle East - Continent level
    html += `<optgroup label="━━━ ${t('components.geoFilter.middleEast')} ━━━">`;

    ['israel', 'iran', 'saudi-arabia', 'uae'].forEach((countryId, index, arr) => {
      const countryRegion = getRegionById(countryId);
      if (countryRegion) {
        html += `<option value="${countryId}">${escapeHtml(countryRegion.label)}</option>`;
        const parentGroup = groups[countryId];
        if (parentGroup && parentGroup.length > 0) {
          const isLast = index === arr.length - 1;
          html += `<optgroup label="  ${isLast ? '└' : '├'}─ Cities">`;
          html += parentGroup.join('');
          html += '</optgroup>';
        }
      }
    });

    html += '</optgroup>';

    // Europe - Continent level
    html += `<optgroup label="━━━ ${t('components.geoFilter.europe')} ━━━">`;

    ['ukraine', 'russia', 'france', 'uk'].forEach((countryId, index, arr) => {
      const countryRegion = getRegionById(countryId);
      if (countryRegion) {
        html += `<option value="${countryId}">${escapeHtml(countryRegion.label)}</option>`;
        const parentGroup = groups[countryId];
        if (parentGroup && parentGroup.length > 0) {
          const isLast = index === arr.length - 1;
          html += `<optgroup label="  ${isLast ? '└' : '├'}─ Cities">`;
          html += parentGroup.join('');
          html += '</optgroup>';
        }
      }
    });

    html += '</optgroup>';

    // Asia & Pacific - Continent level
    html += `<optgroup label="━━━ ${t('components.geoFilter.asia')} ━━━">`;

    ['china', 'taiwan', 'japan', 'south-korea', 'australia'].forEach((countryId, index, arr) => {
      const countryRegion = getRegionById(countryId);
      if (countryRegion) {
        html += `<option value="${countryId}">${escapeHtml(countryRegion.label)}</option>`;
        const parentGroup = groups[countryId];
        if (parentGroup && parentGroup.length > 0) {
          const isLast = index === arr.length - 1;
          html += `<optgroup label="  ${isLast ? '└' : '├'}─ Cities">`;
          html += parentGroup.join('');
          html += '</optgroup>';
        }
      }
    });

    html += '</optgroup>';

    // Latin America - Continent level (if regions exist)
    const latinAmericaRegion = getRegionById('latin-america');
    if (latinAmericaRegion) {
      html += `<optgroup label="━━━ ${t('components.geoFilter.latinAmerica')} ━━━">`;
      html += `<option value="latin-america">${escapeHtml(latinAmericaRegion.label)}</option>`;
      html += '</optgroup>';
    }

    // Africa - Continent level (if regions exist)
    const africaRegion = getRegionById('africa');
    if (africaRegion) {
      html += `<optgroup label="━━━ ${t('components.geoFilter.africa')} ━━━">`;
      html += `<option value="africa">${escapeHtml(africaRegion.label)}</option>`;
      html += '</optgroup>';
    }

    return html;
  }

  private attachListeners(): void {
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
