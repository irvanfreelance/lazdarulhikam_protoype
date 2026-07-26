import React, { useState, useRef, useEffect } from 'react';

/**
 * Text input with a filtered dropdown of options — type to search instead of
 * scrolling a native <select>. With allowFreeText, typed text that matches no
 * option is still committed as-is (used for things like donor names); without
 * it, the field reverts to the last valid selection if you don't pick one.
 */
const SearchableSelect = ({
  options, // [{ value, label }]
  value,
  onChange,
  placeholder = 'Cari...',
  allowFreeText = false,
  className = 'form-input'
}) => {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [highlightIndex, setHighlightIndex] = useState(0);
  const wrapRef = useRef(null);

  const selectedOption = options.find(o => o.value === value);
  const displayValue = isOpen ? query : (selectedOption ? selectedOption.label : (allowFreeText ? (value || '') : ''));

  useEffect(() => {
    const onDocMouseDown = (e) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', onDocMouseDown);
    return () => document.removeEventListener('mousedown', onDocMouseDown);
  }, []);

  const filtered = query
    ? options.filter(o => o.label.toLowerCase().includes(query.toLowerCase()))
    : options;

  const openWithCurrent = () => {
    setQuery(selectedOption ? selectedOption.label : (allowFreeText ? (value || '') : ''));
    setIsOpen(true);
    setHighlightIndex(0);
  };

  const selectOption = (opt) => {
    onChange(opt.value);
    setIsOpen(false);
    setQuery('');
  };

  const handleChange = (e) => {
    const v = e.target.value;
    setQuery(v);
    setIsOpen(true);
    setHighlightIndex(0);
    if (allowFreeText) onChange(v);
  };

  const handleKeyDown = (e) => {
    if (!isOpen) return;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlightIndex(i => Math.min(i + 1, filtered.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlightIndex(i => Math.max(i - 1, 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (filtered[highlightIndex]) selectOption(filtered[highlightIndex]);
      else setIsOpen(false);
    } else if (e.key === 'Escape') {
      setIsOpen(false);
    }
  };

  return (
    <div ref={wrapRef} style={{ position: 'relative' }}>
      <input
        type="text"
        className={className}
        placeholder={placeholder}
        value={displayValue}
        onFocus={openWithCurrent}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        onBlur={() => setTimeout(() => setIsOpen(false), 120)}
        autoComplete="off"
      />
      {isOpen && (
        <div className="searchable-select-dropdown">
          {filtered.length > 0 ? (
            filtered.map((opt, idx) => (
              <div
                key={opt.value}
                className={`searchable-select-option ${idx === highlightIndex ? 'active' : ''}`}
                onMouseDown={(e) => { e.preventDefault(); selectOption(opt); }}
                onMouseEnter={() => setHighlightIndex(idx)}
              >
                {opt.label}
              </div>
            ))
          ) : (
            <div className="searchable-select-empty">
              {allowFreeText ? 'Tidak ada saran — tekan Enter untuk pakai teks ini' : 'Tidak ditemukan'}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SearchableSelect;
