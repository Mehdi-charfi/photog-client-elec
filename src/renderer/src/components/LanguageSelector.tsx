import React from 'react';
import { useTranslation } from 'react-i18next';

const languages = [
  { code: 'fr', name: 'Français', flag: '/flags/fr.svg', native: 'Français' },
  { code: 'en', name: 'English', flag: '/flags/gb.svg', native: 'English' },
  { code: 'de', name: 'Deutsch', flag: '/flags/de.svg', native: 'Deutsch' },
  { code: 'it', name: 'Italiano', flag: '/flags/it.svg', native: 'Italiano' },
  { code: 'pl', name: 'Polski', flag: '/flags/pl.svg', native: 'Polski' },
  { code: 'pt', name: 'Português', flag: '/flags/pt.svg', native: 'Português' },
  { code: 'cs', name: 'Czech', flag: '/flags/cs.svg', native: 'Čeština' },
];

export const LanguageSelector: React.FC = () => {
  const { i18n } = useTranslation();

  return (
    <div className="flex flex-col items-center gap-4 sm:gap-6 py-4 px-2 sm:px-4">
      {languages.map((language) => (
        <div
          key={language.code}
          className="relative w-12 h-12 sm:w-14 md:w-16 sm:h-14 md:h-16 group"
        >
          <button
            type="button"
            onClick={() => i18n.changeLanguage(language.code)}
            className={`
              relative
              w-full h-full
              rounded-full
              overflow-hidden
              transition-all
              duration-300
              transform
              bg-white/5
              ${i18n.language === language.code 
                ? 'ring-4 ring-white scale-110 shadow-lg' 
                : 'hover:ring-2 ring-white/50 hover:scale-105'
              }
            `}
            aria-label={`Change language to ${language.name}`}
          >
            {/* Flag Image with Error Handling */}
            <img 
              src={language.flag} 
              alt={language.name}
              className="w-full h-full object-cover"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.onerror = null; // Prevent infinite loop
                target.style.backgroundColor = '#f3f4f6'; // Light gray background
                target.style.padding = '0.5rem';
                target.src = `data:image/svg+xml,${encodeURIComponent(`
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <rect width="20" height="15" x="2" y="4.5" rx="2"/>
                    <path d="M12 8.5v7m-3.5-3.5h7"/>
                  </svg>
                `)}`;
              }}
            />

            {/* Overlay on hover */}
            <div className={`
              absolute inset-0
              flex flex-col items-center justify-center
              bg-black/60 backdrop-blur-sm
              transition-opacity duration-300
              ${i18n.language === language.code ? 'opacity-0' : 'opacity-0 group-hover:opacity-100'}
            `}>
              {/* Native Name */}
              <span className="text-white text-[10px] sm:text-xs font-medium">
                {language.native}
              </span>
            </div>

            {/* Selected Indicator */}
            {i18n.language === language.code && (
              <div className="absolute inset-0 border-4 border-white rounded-full animate-pulse" />
            )}
          </button>

          {/* Language Details Tooltip - Tablet and Desktop */}
          <div className={`
            absolute 
            hidden sm:block
            left-full ml-3 top-1/2 -translate-y-1/2
            bg-white/90 backdrop-blur
            px-3 py-2
            rounded-lg
            shadow-lg
            whitespace-nowrap
            transition-all duration-300
            opacity-0 translate-x-2
            pointer-events-none
            group-hover:opacity-100 group-hover:translate-x-0
            z-50
          `}>
            <div className="text-sm font-medium text-gray-900">{language.name}</div>
            <div className="text-xs text-gray-600">{language.native}</div>
            
            {/* Arrow */}
            <div className="absolute left-0 top-1/2 -translate-x-1 -translate-y-1/2 w-2 h-2 bg-white/90 transform rotate-45" />
          </div>

          {/* Mobile Tooltip */}
          <div className={`
            sm:hidden
            absolute 
            left-1/2 -translate-x-1/2
            -top-10
            bg-white/90 backdrop-blur
            px-2 py-1
            rounded-lg
            shadow-lg
            whitespace-nowrap
            transition-all duration-300
            opacity-0 -translate-y-2
            pointer-events-none
            group-hover:opacity-100 group-hover:translate-y-0
            z-50
            text-center
          `}>
            <div className="text-xs font-medium text-gray-900">{language.name}</div>
            
            {/* Arrow */}
            <div className="absolute left-1/2 -translate-x-1/2 bottom-0 translate-y-1/2 w-2 h-2 bg-white/90 transform rotate-45" />
          </div>
        </div>
      ))}
    </div>
  );
};