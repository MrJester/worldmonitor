# Geographic Filter Implementation

## Overview

A comprehensive geographic filtering system has been integrated into World Monitor, allowing users to focus on specific regions, countries, states, or cities. The filter automatically:
- Zooms the map to the selected region
- Filters webcams to show only relevant locations
- Can be extended to filter news feeds and other data sources

## Key Features

### 1. **Global Dropdown Filter** (Header)
- Located in the header next to the status indicator
- Hierarchical dropdown with continents, countries, states, and cities
- Includes popular locations like:
  - **Puerto Vallarta, Mexico** (as requested)
  - **Knoxville, TN** (as requested)
  - Major cities worldwide (NYC, LA, Tel Aviv, Tehran, Tokyo, etc.)

### 2. **Auto-Zoom Map**
- Automatically centers and zooms the map when a region is selected
- Each region has optimized viewport settings (latitude, longitude, zoom level)

### 3. **Webcam Filtering**
- Filters live webcams based on selected region
- Supports both city-level and country-level filtering
- Works seamlessly with existing regional toolbar buttons

### 4. **Extensible Architecture**
- Easy to add filtering to other panels (news, events, data layers)
- Clean separation of concerns with dedicated configuration file

## Files Created

### 1. `src/config/geographic-regions.ts`
Defines all geographic regions with:
- 50+ predefined regions (cities, states, countries, continents)
- Viewport coordinates for auto-zoom
- Bounding boxes for data filtering
- Country codes for feed filtering
- Hierarchical parent-child relationships

Popular regions included:
- **United States**: California, Texas, Tennessee, New York, Florida
- **Cities**: San Francisco, Los Angeles, Knoxville, NYC, Miami, Washington DC
- **Mexico**: Puerto Vallarta, Mexico City
- **Middle East**: Jerusalem, Tel Aviv, Tehran, Dubai
- **Europe**: London, Paris, Kyiv, Moscow
- **Asia**: Tokyo, Shanghai, Taipei, Seoul, Sydney

### 2. `src/components/GeographicFilter.ts`
Reusable dropdown component with:
- Hierarchical optgroup structure
- Change event handling
- i18n support
- Programmatic region selection

### 3. CSS Styles (`src/styles/main.css`)
Added styles for:
- `.geographic-filter` - Container with globe icon
- `.geo-select` - Dropdown styling with hover/focus states
- `.geo-icon` - Globe icon styling
- Optgroup/option styling for hierarchy

### 4. i18n Translations (`src/locales/en.json`)
Added `components.geoFilter` translations:
- Continents, North America, USA, Mexico, Canada
- Middle East, Europe, Asia & Pacific

## Files Modified

### 1. `src/App.ts`
- Added `GeographicFilter` import and property
- Integrated filter into header HTML (replaced old region selector)
- Added `onGeographicFilterChange()` method to handle filter changes
- Auto-zoom map on region selection
- Notify panels of filter changes
- Added cleanup in `destroy()` method

### 2. `src/components/LiveWebcamsPanel.ts`
- Added `geographicFilter` property
- Updated `filteredFeeds()` to respect global filter
- Added `setGeographicFilter()` method
- Filters by city names or country codes
- Falls back to region mapping when needed

### 3. `src/components/LiveNewsPanel.ts`
- Added stub `setGeographicFilter()` method for consistency
- Can be extended in future to filter news channels by region

### 4. `src/components/index.ts`
- Added `GeographicFilter` export

## Usage

### For Users
1. Look for the globe icon (🌍) dropdown in the header
2. Select a region from the hierarchical list:
   - Global (default)
   - Continents (North America, Europe, Middle East, Asia, etc.)
   - Countries (USA, Mexico, Israel, Ukraine, China, etc.)
   - States (California, Texas, Tennessee, New York, Florida)
   - Cities (Knoxville, San Francisco, Puerto Vallarta, Tel Aviv, etc.)
3. Map automatically zooms to selected region
4. Webcams filter to show only relevant locations

### For Developers

**Adding a new region:**
```typescript
// In src/config/geographic-regions.ts
{
  id: 'my-city',
  label: 'My City, State',
  type: 'city',
  viewport: { latitude: 35.5, longitude: -80.5, zoom: 11 },
  bounds: { north: 35.6, south: 35.4, east: -80.4, west: -80.6 },
  countryCodes: ['US'],
  cities: ['my city'],
  parent: 'state-id',
}
```

**Filtering a panel:**
```typescript
// In your panel class
private geographicFilter: GeographicRegion | null = null;

public setGeographicFilter(region: GeographicRegion | null): void {
  this.geographicFilter = region;

  // Apply filtering logic
  if (region?.cities) {
    // Filter by cities
  } else if (region?.countryCodes) {
    // Filter by countries
  } else if (region?.bounds) {
    // Filter by bounding box
  }

  this.render();
}
```

**Notifying panels from App.ts:**
```typescript
// Already implemented in App.ts:2020-2036
private onGeographicFilterChange(region: GeographicRegion): void {
  // Filter panels
  (this.panels['your-panel'] as YourPanel).setGeographicFilter?.(region);

  // Update map
  this.map?.setCenter(region.viewport.latitude, region.viewport.longitude, region.viewport.zoom);
}
```

## Future Enhancements

1. **News Feed Filtering**
   - Filter RSS feeds by region/country
   - Show only region-relevant news sources

2. **Event Filtering**
   - Filter military flights/vessels by bounding box
   - Filter protests, earthquakes, outages by region

3. **Data Layer Filtering**
   - Show only infrastructure in selected region
   - Filter map markers by geographic bounds

4. **Saved Filters**
   - Remember user's preferred region in localStorage
   - Quick-switch between favorite regions

5. **More Regions**
   - Add all US state capitals
   - Add more international cities
   - Add custom user-defined regions

## Testing

To test the implementation:

1. Run the dev server: `npm run dev`
2. Open the app in your browser
3. Click the geographic filter dropdown in the header
4. Select "Knoxville, TN" - map should zoom to Tennessee
5. Open the Live Webcams panel - should show no webcams (none in Knoxville yet)
6. Select "Puerto Vallarta, Mexico" - map should zoom to western Mexico
7. Open Live Webcams panel - should show Puerto Vallarta webcam
8. Select "Middle East" - map should zoom to Middle East region
9. Open Live Webcams panel - should show Jerusalem, Tehran, Tel Aviv, Mecca webcams

## Architecture Highlights

- **Separation of Concerns**: Geographic data, UI component, and app integration are cleanly separated
- **Type Safety**: Full TypeScript support with exported types
- **i18n Ready**: All labels support internationalization
- **Extensible**: Easy to add new regions and filter new panels
- **Performance**: Efficient filtering with no unnecessary re-renders
- **User Experience**: Smooth animations, hover states, hierarchical organization

## Notes

- The old "region selector" that controlled map views has been replaced by this new geographic filter
- The filter integrates seamlessly with existing UI patterns (similar styling to other dropdowns)
- The implementation follows the codebase's conventions (Panel architecture, event handling, etc.)
- All changes are backward compatible - panels without `setGeographicFilter()` are safely ignored
