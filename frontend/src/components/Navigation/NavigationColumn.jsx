/**
 * NavigationColumn - Miller Column for Bible Navigation
 * Displays a scrollable grid of selectable items (books, chapters, or verses)
 * with search/filter functionality for books
 */

import React, { useState, useMemo } from 'react';
import { Search } from 'lucide-react';

const NavigationColumn = ({
  data,
  type, // 'book' | 'chapter' | 'verse'
  selectedItem,
  onSelect,
  title,
  isActive
}) => {
  const [filter, setFilter] = useState('');
  const [testamentFilter, setTestamentFilter] = useState('All');

  // Grid layout based on type
  const getGridClass = () => {
    switch (type) {
      case 'book':
        return 'grid-cols-2 gap-2';
      case 'chapter':
      case 'verse':
        return 'grid-cols-5 md:grid-cols-6 gap-2';
      default:
        return 'grid-cols-2 gap-2';
    }
  };

  // Filter logic for books
  const filteredData = useMemo(() => {
    if (type !== 'book') return data;

    return data.filter((item) => {
      const matchesSearch = item.name.toLowerCase().includes(filter.toLowerCase());
      const matchesTestament = testamentFilter === 'All' || item.testament === testamentFilter;
      return matchesSearch && matchesTestament;
    });
  }, [data, filter, testamentFilter, type]);

  return (
    <div
      className={`
        nav-column flex-col h-full bg-royal-800/30 md:border-r border-slate-700/50 transition-all duration-300
        ${isActive ? 'flex w-full md:w-1/3' : 'hidden md:flex md:w-1/3'}
      `}
    >
      {/* Header Section */}
      <div className="p-4 border-b border-slate-700/50 bg-royal-900/60 backdrop-blur-sm z-10 sticky top-0">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-brand-gold font-cinzel font-bold tracking-widest text-sm uppercase">
            {title}
          </h3>
          <span className="text-xs text-slate-500 font-mono">{filteredData.length} Items</span>
        </div>

        {/* Book Specific Controls */}
        {type === 'book' && (
          <div className="space-y-3">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-2 top-2 text-slate-500" size={14} />
              <input
                type="text"
                placeholder="Find Book..."
                className="w-full bg-slate-800/50 border border-slate-700 rounded-md py-1.5 pl-8 pr-2 text-xs text-slate-200 focus:border-brand-gold/50 focus:outline-none transition-colors placeholder:text-slate-600"
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
              />
            </div>

            {/* Testament Tabs */}
            <div className="flex p-1 bg-slate-800/50 rounded-lg">
              {['All', 'Old', 'New'].map((t) => (
                <button
                  key={t}
                  onClick={() => setTestamentFilter(t)}
                  className={`
                    flex-1 text-[10px] uppercase tracking-wider font-bold py-1.5 rounded-md transition-all
                    ${testamentFilter === t
                      ? 'bg-brand-gold text-royal-900 shadow-sm'
                      : 'text-slate-500 hover:text-slate-300'
                    }
                  `}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Grid Content */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden p-3 custom-scrollbar">
        <div className={`grid ${getGridClass()} auto-rows-min`}>
          {filteredData.map((item, idx) => {
            // Determine if selected
            const isSelected = type === 'book'
              ? selectedItem?.id === item.id || selectedItem?.name === item.name
              : selectedItem === item;

            // Label display
            const label = typeof item === 'object' ? item.name : item;

            return (
              <button
                key={idx}
                onClick={() => onSelect(item)}
                className={`
                  nav-item relative overflow-hidden group rounded-lg border transition-all duration-200
                  flex flex-col items-center justify-center text-center
                  ${type === 'book' ? 'h-16 p-2' : 'h-12'}
                  ${isSelected
                    ? 'nav-item-selected bg-gradient-to-br from-brand-gold/20 to-brand-gold/10 border-brand-gold/50 text-brand-gold shadow-[0_0_10px_rgba(212,175,55,0.15)]'
                    : 'bg-slate-800/40 border-slate-700/50 text-slate-400 hover:bg-slate-700/60 hover:border-slate-600 hover:text-slate-200'
                  }
                `}
              >
                <span className={`
                  ${type === 'book' ? 'font-serif font-bold text-sm' : 'font-sans font-semibold text-lg'}
                `}>
                  {label}
                </span>

                {/* Book Testament Badge */}
                {type === 'book' && item.testament && (
                  <span className="text-[9px] uppercase tracking-widest text-slate-600 mt-1 group-hover:text-brand-gold/50 transition-colors">
                    {item.testament}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default NavigationColumn;
