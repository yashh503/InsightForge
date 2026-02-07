// Icons
const CheckIcon = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
  </svg>
);

const PaletteIcon = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
  </svg>
);

/**
 * Color Theme Presets
 * Matches backend/config/colorThemes.js
 */
const THEMES = [
  {
    id: 'default',
    name: 'InsightForge Blue',
    shortName: 'Blue',
    color: '#2563EB',
    gradient: 'linear-gradient(135deg, #2563EB 0%, #8B5CF6 100%)',
  },
  {
    id: 'emerald',
    name: 'Forest Emerald',
    shortName: 'Emerald',
    color: '#059669',
    gradient: 'linear-gradient(135deg, #059669 0%, #14B8A6 100%)',
  },
  {
    id: 'purple',
    name: 'Royal Purple',
    shortName: 'Purple',
    color: '#7C3AED',
    gradient: 'linear-gradient(135deg, #7C3AED 0%, #A855F7 100%)',
  },
  {
    id: 'slate',
    name: 'Professional Slate',
    shortName: 'Slate',
    color: '#334155',
    gradient: 'linear-gradient(135deg, #334155 0%, #64748B 100%)',
  },
  {
    id: 'coral',
    name: 'Sunset Coral',
    shortName: 'Coral',
    color: '#F97316',
    gradient: 'linear-gradient(135deg, #F97316 0%, #FBBF24 100%)',
  },
];

/**
 * Color Theme Picker Component
 * Allows users to select a color theme for PDF/PPT reports
 */
function ColorThemePicker({ selectedTheme, onThemeChange, darkMode }) {
  return (
    <div className={`p-5 rounded-2xl border transition-all ${
      darkMode
        ? 'bg-slate-800/50 border-slate-700'
        : 'bg-white border-slate-200 shadow-sm'
    }`}>
      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
          darkMode ? 'bg-indigo-500/20' : 'bg-indigo-50'
        }`}>
          <PaletteIcon className={`w-5 h-5 ${darkMode ? 'text-indigo-400' : 'text-indigo-600'}`} />
        </div>
        <div>
          <h4 className={`font-semibold text-sm ${darkMode ? 'text-white' : 'text-slate-900'}`}>
            Report Color Theme
          </h4>
          <p className={`text-xs ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
            Choose a color scheme for your PDF and PowerPoint
          </p>
        </div>
      </div>

      {/* Theme Grid */}
      <div className="grid grid-cols-5 gap-3">
        {THEMES.map((theme) => (
          <button
            key={theme.id}
            onClick={() => onThemeChange(theme.id)}
            className={`group relative p-1.5 rounded-xl transition-all duration-200 ${
              selectedTheme === theme.id
                ? darkMode
                  ? 'ring-2 ring-offset-2 ring-offset-slate-800 ring-white'
                  : 'ring-2 ring-offset-2 ring-offset-white ring-slate-900'
                : 'hover:scale-105'
            }`}
            title={theme.name}
          >
            {/* Color swatch */}
            <div
              className="w-full h-10 aspect-square rounded-lg shadow-sm transition-transform group-hover:scale-105"
              style={{ background: theme.gradient }}
            />

            {/* Check mark overlay */}
            {selectedTheme === theme.id && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-6 h-6 bg-white rounded-full flex items-center justify-center shadow-lg">
                  <CheckIcon className="w-4 h-4 text-slate-900" />
                </div>
              </div>
            )}

            {/* Theme name */}
            <span className={`block text-xs mt-1.5 text-center font-medium truncate ${
              selectedTheme === theme.id
                ? darkMode ? 'text-white' : 'text-slate-900'
                : darkMode ? 'text-slate-400' : 'text-slate-600'
            }`}>
              {theme.shortName}
            </span>
          </button>
        ))}
      </div>

      {/* Selected theme info */}
      <div className={`mt-4 pt-3 border-t flex items-center justify-between ${
        darkMode ? 'border-slate-700' : 'border-slate-100'
      }`}>
        <span className={`text-xs ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
          Selected:
        </span>
        <div className="flex items-center gap-2">
          <div
            className="w-4 h-4 rounded-full shadow-sm"
            style={{ background: THEMES.find(t => t.id === selectedTheme)?.color }}
          />
          <span className={`text-xs font-medium ${darkMode ? 'text-white' : 'text-slate-900'}`}>
            {THEMES.find(t => t.id === selectedTheme)?.name}
          </span>
        </div>
      </div>
    </div>
  );
}

export default ColorThemePicker;
