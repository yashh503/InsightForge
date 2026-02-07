/**
 * Color Theme Configuration for InsightForge
 *
 * Provides preset color themes for PDF and PPT report generation.
 * Each theme includes colors for both hex format (PDF) and non-hash format (PPT).
 */

const PRESET_THEMES = {
  default: {
    id: 'default',
    name: 'InsightForge Blue',
    // PPT format (without #)
    primary: '2563EB',
    secondary: '64748B',
    success: '16A34A',
    danger: 'DC2626',
    text: '1E293B',
    lightText: '64748B',
    white: 'FFFFFF',
    background: 'F8FAFC',
    accent: '8B5CF6',
    accentLight: 'EDE9FE',
    // PDF format (with #)
    primaryHex: '#2563EB',
    secondaryHex: '#64748B',
    successHex: '#16A34A',
    dangerHex: '#DC2626',
    textHex: '#1E293B',
    lightTextHex: '#64748B',
    borderHex: '#E2E8F0',
    backgroundHex: '#F8FAFC',
    accentHex: '#8B5CF6',
    // Chart colors
    chartColors: ['2563EB', '16A34A', 'F59E0B', 'DC2626', '8B5CF6', '06B6D4'],
  },

  emerald: {
    id: 'emerald',
    name: 'Forest Emerald',
    // PPT format
    primary: '059669',
    secondary: '6B7280',
    success: '16A34A',
    danger: 'DC2626',
    text: '1F2937',
    lightText: '6B7280',
    white: 'FFFFFF',
    background: 'ECFDF5',
    accent: '14B8A6',
    accentLight: 'CCFBF1',
    // PDF format
    primaryHex: '#059669',
    secondaryHex: '#6B7280',
    successHex: '#16A34A',
    dangerHex: '#DC2626',
    textHex: '#1F2937',
    lightTextHex: '#6B7280',
    borderHex: '#D1FAE5',
    backgroundHex: '#ECFDF5',
    accentHex: '#14B8A6',
    // Chart colors
    chartColors: ['059669', '14B8A6', '16A34A', '0D9488', '047857', '10B981'],
  },

  purple: {
    id: 'purple',
    name: 'Royal Purple',
    // PPT format
    primary: '7C3AED',
    secondary: '64748B',
    success: '10B981',
    danger: 'EF4444',
    text: '1E1B4B',
    lightText: '6366F1',
    white: 'FFFFFF',
    background: 'FAF5FF',
    accent: 'A855F7',
    accentLight: 'F3E8FF',
    // PDF format
    primaryHex: '#7C3AED',
    secondaryHex: '#64748B',
    successHex: '#10B981',
    dangerHex: '#EF4444',
    textHex: '#1E1B4B',
    lightTextHex: '#6366F1',
    borderHex: '#E9D5FF',
    backgroundHex: '#FAF5FF',
    accentHex: '#A855F7',
    // Chart colors
    chartColors: ['7C3AED', 'A855F7', '8B5CF6', 'C084FC', '6366F1', 'EC4899'],
  },

  slate: {
    id: 'slate',
    name: 'Professional Slate',
    // PPT format
    primary: '334155',
    secondary: '64748B',
    success: '22C55E',
    danger: 'EF4444',
    text: '0F172A',
    lightText: '64748B',
    white: 'FFFFFF',
    background: 'F8FAFC',
    accent: '475569',
    accentLight: 'F1F5F9',
    // PDF format
    primaryHex: '#334155',
    secondaryHex: '#64748B',
    successHex: '#22C55E',
    dangerHex: '#EF4444',
    textHex: '#0F172A',
    lightTextHex: '#64748B',
    borderHex: '#E2E8F0',
    backgroundHex: '#F8FAFC',
    accentHex: '#475569',
    // Chart colors
    chartColors: ['334155', '475569', '64748B', '94A3B8', '1E293B', '0F172A'],
  },

  coral: {
    id: 'coral',
    name: 'Sunset Coral',
    // PPT format
    primary: 'F97316',
    secondary: '78716C',
    success: '22C55E',
    danger: 'EF4444',
    text: '292524',
    lightText: '78716C',
    white: 'FFFFFF',
    background: 'FFF7ED',
    accent: 'FB923C',
    accentLight: 'FFEDD5',
    // PDF format
    primaryHex: '#F97316',
    secondaryHex: '#78716C',
    successHex: '#22C55E',
    dangerHex: '#EF4444',
    textHex: '#292524',
    lightTextHex: '#78716C',
    borderHex: '#FED7AA',
    backgroundHex: '#FFF7ED',
    accentHex: '#FB923C',
    // Chart colors
    chartColors: ['F97316', 'FB923C', 'FBBF24', 'F59E0B', 'EA580C', 'DC2626'],
  },
};

/**
 * Get a theme by ID
 * @param {string} themeId - The theme identifier
 * @returns {Object} The theme object with all color values
 */
export function getTheme(themeId) {
  return PRESET_THEMES[themeId] || PRESET_THEMES.default;
}

/**
 * Get all available themes
 * @returns {Object} All preset themes
 */
export function getAllThemes() {
  return PRESET_THEMES;
}

/**
 * Get theme names and IDs for UI display
 * @returns {Array} Array of {id, name} objects
 */
export function getThemeList() {
  return Object.values(PRESET_THEMES).map(theme => ({
    id: theme.id,
    name: theme.name,
  }));
}

export { PRESET_THEMES };
