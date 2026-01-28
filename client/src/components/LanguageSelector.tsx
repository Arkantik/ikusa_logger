import { storage } from '@neutralinojs/lib';
import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { LuChevronDown } from 'react-icons/lu';
import Icon from './ui/Icon';

const languages = [
    { code: 'en', name: 'English', flag: '🇺🇸' },
    { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
    { code: 'fr', name: 'Français', flag: '🇫🇷' },
    { code: 'es', name: 'Español', flag: '🇪🇸' },
];

const LANGUAGE_STORAGE_KEY = 'app_language';

function LanguageSelector() {
    const { i18n, t } = useTranslation();
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const currentLang = languages.find(l => l.code === i18n.language?.substring(0, 2)) || languages[0];

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const changeLanguage = async (code: string) => {
        try {
            await i18n.changeLanguage(code);
            await storage.setData(LANGUAGE_STORAGE_KEY, code);

            setIsOpen(false);
        } catch (error) {
            console.error('Failed to change language:', error);
        }
    };

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="cursor-pointer flex items-center gap-2 p-2.5 rounded-xl transition-all duration-300 hover:bg-white/10 text-gray-300 hover:text-white"
                title={t('header.changeLanguage')}
            >
                <span className="h-5 flex items-center">{currentLang.flag}</span>
                <Icon icon={LuChevronDown} size="sm" className={`transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
            </button>

            {isOpen && (
                <div className="absolute right-0 top-full mt-2 w-40 glass-card rounded-xl border border-white/10 shadow-xl overflow-hidden z-50 bg-[#1c1c29]!">
                    {languages.map((lang) => (
                        <button
                            key={lang.code}
                            onClick={() => changeLanguage(lang.code)}
                            className={`cursor-pointer w-full flex items-center gap-3 p-2.5 text-sm transition-colors hover:bg-white/10 ${lang.code === currentLang.code ? 'bg-white/5 text-white' : 'text-gray-300'
                                }`}
                        >
                            <span>{lang.flag}</span>
                            <span>{lang.name}</span>
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}

export default LanguageSelector;
