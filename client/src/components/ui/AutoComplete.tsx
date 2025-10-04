import { useState, useRef, useEffect, forwardRef } from 'react';
import Input from './Input';

interface AutoCompleteProps {
    items?: string[];
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    required?: boolean;
    id?: string;
    className?: string;
}

function AutoComplete({
    items = [],
    value,
    onChange,
    placeholder = '',
    required = false,
    id,
    className
}: AutoCompleteProps) {
    const [selectedSuggestion, setSelectedSuggestion] = useState(-1);
    const [suggestions, setSuggestions] = useState<{ name: string; button?: HTMLButtonElement }[]>([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        filterSuggestions();
    }, [value, items]);

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setShowSuggestions(false);
            }
        }

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    useEffect(() => {
        function handleKeyDown(event: KeyboardEvent) {
            if (event.key === 'Escape') {
                setSuggestions([]);
            } else if (event.key === 'ArrowDown') {
                if (suggestions.length > 0) {
                    selectSuggestion(1);
                }
            } else if (event.key === 'ArrowUp') {
                if (suggestions.length > 0) {
                    selectSuggestion(-1);
                }
            }
        }

        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [suggestions, selectedSuggestion]);

    function filterSuggestions() {
        const filtered = items
            .filter(
                (item) => item.toLowerCase().includes(value.toLowerCase()) && value.length > 0 && value !== item
            )
            .slice(0, 3)
            .map((item) => ({ name: item, button: undefined }));

        setSuggestions(filtered);
        setSelectedSuggestion(-1);
    }

    function selectSuggestion(dir: -1 | 1) {
        if (suggestions.length > 0) {
            let newIndex = selectedSuggestion + dir;

            if (newIndex >= suggestions.length) {
                newIndex = -1;
            } else if (newIndex === -2) {
                newIndex = suggestions.length - 1;
            }

            setSelectedSuggestion(newIndex);

            if (newIndex === -1) {
                inputRef.current?.focus();
                setTimeout(() => {
                    inputRef.current?.setSelectionRange(value.length, value.length);
                }, 0);
            } else {
                suggestions[newIndex].button?.focus();
            }
        }
    }

    const inputWidth = inputRef.current?.clientWidth || 'auto';

    return (
        <div ref={containerRef}>
            <Input
                id={id}
                className={className}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                required={required}
                placeholder={placeholder}
                ref={inputRef}
                onFocus={() => setShowSuggestions(true)}
            />
            {suggestions.length > 0 && showSuggestions && (
                <div
                    className="border border-gray-600 mt-1 absolute bg-background z-50 rounded-lg overflow-hidden"
                    style={{ width: inputWidth }}
                >
                    {suggestions.map((suggestion, index) => (
                        <button
                            key={index}
                            ref={(el) => {
                                if (el) suggestion.button = el;
                            }}
                            className="p-2 w-full text-left text-cta-muted hover:text-cta outline-none focus:bg-cta focus:text-black"
                            onClick={() => {
                                onChange(suggestion.name);
                                setShowSuggestions(false);
                            }}
                        >
                            {suggestion.name}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}

export default AutoComplete;