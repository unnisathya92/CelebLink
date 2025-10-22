'use client';

import { useState, useEffect, useRef } from 'react';
import type { Suggestion } from '@/lib/wikidata';

interface SearchComboProps {
  label: string;
  value: Suggestion | null;
  onSelect: (suggestion: Suggestion) => void;
}

export default function SearchCombo({
  label,
  value,
  onSelect,
}: SearchComboProps) {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [loading, setLoading] = useState(false);
  const debounceTimer = useRef<NodeJS.Timeout | null>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);

  // Fetch suggestions with debounce
  useEffect(() => {
    if (!query.trim()) {
      setSuggestions([]);
      setIsOpen(false);
      return;
    }

    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }

    debounceTimer.current = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetch(
          `/api/autocomplete?q=${encodeURIComponent(query)}`
        );
        if (res.ok) {
          const data = await res.json();
          setSuggestions(data.suggestions || []);
          setIsOpen(true);
        }
      } catch (error) {
        console.error('Autocomplete error:', error);
      } finally {
        setLoading(false);
      }
    }, 180);

    return () => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
    };
  }, [query]);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen || suggestions.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex((prev) =>
          prev < suggestions.length - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex((prev) => (prev > 0 ? prev - 1 : prev));
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0 && selectedIndex < suggestions.length) {
          handleSelect(suggestions[selectedIndex]);
        }
        break;
      case 'Escape':
        e.preventDefault();
        setIsOpen(false);
        setSelectedIndex(-1);
        break;
    }
  };

  const handleSelect = (suggestion: Suggestion) => {
    onSelect(suggestion);
    setQuery(suggestion.name);
    setIsOpen(false);
    setSelectedIndex(-1);
  };

  return (
    <div ref={wrapperRef} className="relative">
      <label className="block text-sm font-medium text-text mb-2">
        {label}
      </label>
      <div className="relative">
        <input
          type="text"
          role="combobox"
          aria-expanded={isOpen}
          aria-controls="suggestions-listbox"
          aria-autocomplete="list"
          className="w-full px-4 py-3 bg-surface border border-border rounded-xl text-text placeholder-muted focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent transition-all"
          placeholder={`Search for ${label.toLowerCase()}...`}
          value={value ? value.name : query}
          onChange={(e) => {
            setQuery(e.target.value);
            if (value) onSelect(null as any); // Clear selection
          }}
          onKeyDown={handleKeyDown}
        />
        {loading && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            <div className="w-5 h-5 border-2 border-accent border-t-transparent rounded-full animate-spin" />
          </div>
        )}
      </div>

      {isOpen && suggestions.length > 0 && (
        <div
          id="suggestions-listbox"
          role="listbox"
          className="absolute z-50 w-full mt-2 bg-surface border border-border rounded-xl shadow-2xl max-h-96 overflow-y-auto"
        >
          {suggestions.map((suggestion, index) => (
            <div
              key={suggestion.qid}
              role="option"
              aria-selected={index === selectedIndex}
              className={`flex items-center gap-3 px-4 py-3 cursor-pointer transition-colors ${
                index === selectedIndex
                  ? 'bg-accent bg-opacity-20'
                  : 'hover:bg-border'
              }`}
              onClick={() => handleSelect(suggestion)}
            >
              {suggestion.img ? (
                <img
                  src={suggestion.img}
                  alt={suggestion.name}
                  className="w-8 h-8 rounded-full object-cover flex-shrink-0"
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-border flex items-center justify-center flex-shrink-0">
                  <span className="text-muted text-xs">
                    {suggestion.name[0]}
                  </span>
                </div>
              )}
              <div className="flex-1 min-w-0">
                <div className="text-text font-medium truncate">
                  {suggestion.name}
                </div>
                {suggestion.description && (
                  <div className="text-muted text-sm truncate">
                    {suggestion.description}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
