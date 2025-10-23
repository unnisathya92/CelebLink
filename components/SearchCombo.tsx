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
    setSuggestions([]); // Clear suggestions to prevent re-showing
  };

  return (
    <div ref={wrapperRef} className="relative group">
      <label className="block text-sm font-semibold text-text mb-3 flex items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-gradient-to-r from-blue-500 to-purple-500"></span>
        {label}
      </label>
      <div className="relative">
        {value && value.img && (
          <div className="absolute left-4 top-1/2 -translate-y-1/2 z-10">
            <img
              src={value.img}
              alt={value.name}
              className="w-10 h-10 rounded-xl object-cover ring-2 ring-white/10"
            />
          </div>
        )}
        <input
          type="text"
          role="combobox"
          aria-expanded={isOpen}
          aria-controls="suggestions-listbox"
          aria-autocomplete="list"
          className={`w-full ${value && value.img ? 'pl-16' : 'pl-5'} pr-12 py-4 bg-surface/50 border-2 border-border/50 rounded-2xl text-text placeholder-muted focus:outline-none focus:border-accent/50 focus:bg-surface transition-all duration-300 hover:border-border`}
          placeholder={`Search for ${label.toLowerCase()}...`}
          value={value ? value.name : query}
          onChange={(e) => {
            const newQuery = e.target.value;
            setQuery(newQuery);
            if (value && newQuery !== value.name) {
              onSelect(null as any); // Clear selection only if user is typing something different
            }
          }}
          onKeyDown={handleKeyDown}
          onFocus={() => {
            // Don't reopen if we already have a value selected
            if (value) {
              setIsOpen(false);
            }
          }}
        />
        {loading && (
          <div className="absolute right-4 top-1/2 -translate-y-1/2">
            <div className="w-5 h-5 border-2 border-accent/30 border-t-accent rounded-full animate-spin" />
          </div>
        )}
        {!loading && (
          <div className="absolute right-4 top-1/2 -translate-y-1/2 text-muted">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        )}
      </div>

      {isOpen && suggestions.length > 0 && (
        <div
          id="suggestions-listbox"
          role="listbox"
          className="absolute z-50 w-full mt-3 glass-strong rounded-2xl shadow-glow max-h-[400px] overflow-y-auto animate-scale-in"
        >
          {suggestions.map((suggestion, index) => (
            <div
              key={suggestion.qid}
              role="option"
              aria-selected={index === selectedIndex}
              className={`flex items-center gap-4 px-5 py-4 cursor-pointer transition-all duration-200 first:rounded-t-2xl last:rounded-b-2xl ${
                index === selectedIndex
                  ? 'bg-accent/20 border-l-4 border-accent'
                  : 'hover:bg-white/5 border-l-4 border-transparent'
              }`}
              onClick={() => handleSelect(suggestion)}
            >
              {suggestion.img ? (
                <div className="relative">
                  <img
                    src={suggestion.img}
                    alt={suggestion.name}
                    className="w-12 h-12 rounded-xl object-cover flex-shrink-0 ring-2 ring-white/10"
                  />
                  <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-blue-500/20 to-purple-500/20"></div>
                </div>
              ) : (
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500/20 to-purple-500/20 flex items-center justify-center flex-shrink-0 ring-2 ring-white/10">
                  <span className="text-text text-lg font-semibold">
                    {suggestion.name[0]}
                  </span>
                </div>
              )}
              <div className="flex-1 min-w-0">
                <div className="text-text font-semibold truncate text-lg">
                  {suggestion.name}
                </div>
                {suggestion.description && (
                  <div className="text-muted text-sm truncate mt-0.5">
                    {suggestion.description}
                  </div>
                )}
              </div>
              <svg className={`w-5 h-5 flex-shrink-0 transition-opacity ${index === selectedIndex ? 'opacity-100 text-accent' : 'opacity-0'}`} fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
