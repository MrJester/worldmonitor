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
    const groups: Record<string, string[]> = {
      global: [],
      continents: [],
      'north-america': [],
      usa: [],
      mexico: [],
      canada: [],
      'middle-east': [],
      europe: [],
      asia: [],
    };

    // Group regions by hierarchy
    GEOGRAPHIC_REGIONS.forEach((region) => {
      const option = `<option value="${region.id}" ${region.id === this.currentRegionId ? 'selected' : ''}>${escapeHtml(region.label)}</option>`;

      if (region.type === 'global') {
        groups.global.push(option);
      } else if (region.type === 'continent') {
        groups.continents.push(option);
      } else if (region.parent) {
        if (!groups[region.parent]) {
          groups[region.parent] = [];
        }
        groups[region.parent].push(option);
      }
    });

    // Build hierarchical optgroups
    let html = (groups.global || []).join('');

    if ((groups.continents || []).length > 0) {
      html += `<optgroup label="── ${t('components.geoFilter.continents')} ──">`;
      html += (groups.continents || []).join('');
      html += '</optgroup>';
    }

    // North America group
    if ((groups['north-america'] || []).length > 0) {
      html += `<optgroup label="── ${t('components.geoFilter.northAmerica')} ──">`;
      html += (groups['north-america'] || []).join('');

      // USA nested
      if ((groups.usa || []).length > 0) {
        html += `<optgroup label="  └─ ${t('components.geoFilter.usa')}">`;
        html += (groups.usa || []).join('');
        html += '</optgroup>';
      }

      // Mexico nested
      if ((groups.mexico || []).length > 0) {
        html += `<optgroup label="  └─ ${t('components.geoFilter.mexico')}">`;
        html += (groups.mexico || []).join('');
        html += '</optgroup>';
      }

      // Canada nested
      if ((groups.canada || []).length > 0) {
        html += `<optgroup label="  └─ ${t('components.geoFilter.canada')}">`;
        html += (groups.canada || []).join('');
        html += '</optgroup>';
      }

      html += '</optgroup>';
    }

    // Middle East group
    if ((groups['middle-east'] || []).length > 0) {
      html += `<optgroup label="── ${t('components.geoFilter.middleEast')} ──">`;
      html += (groups['middle-east'] || []).join('');

      // Add sub-regions
      ['israel', 'iran', 'saudi-arabia', 'uae'].forEach((parentId) => {
        if ((groups[parentId] || []).length > 0) {
          const parent = getRegionById(parentId);
          if (parent) {
            html += `<optgroup label="  └─ ${escapeHtml(parent.label)}">`;
            html += (groups[parentId] || []).join('');
            html += '</optgroup>';
          }
        }
      });

      html += '</optgroup>';
    }

    // Europe group
    if ((groups.europe || []).length > 0) {
      html += `<optgroup label="── ${t('components.geoFilter.europe')} ──">`;
      html += (groups.europe || []).join('');

      // Add sub-regions
      ['ukraine', 'russia', 'france', 'uk'].forEach((parentId) => {
        if ((groups[parentId] || []).length > 0) {
          const parent = getRegionById(parentId);
          if (parent) {
            html += `<optgroup label="  └─ ${escapeHtml(parent.label)}">`;
            html += (groups[parentId] || []).join('');
            html += '</optgroup>';
          }
        }
      });

      html += '</optgroup>';
    }

    // Asia group
    if ((groups.asia || []).length > 0) {
      html += `<optgroup label="── ${t('components.geoFilter.asia')} ──">`;
      html += (groups.asia || []).join('');

      // Add sub-regions
      ['china', 'taiwan', 'japan', 'south-korea', 'australia'].forEach((parentId) => {
        if ((groups[parentId] || []).length > 0) {
          const parent = getRegionById(parentId);
          if (parent) {
            html += `<optgroup label="  └─ ${escapeHtml(parent.label)}">`;
            html += (groups[parentId] || []).join('');
            html += '</optgroup>';
          }
        }
      });

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
