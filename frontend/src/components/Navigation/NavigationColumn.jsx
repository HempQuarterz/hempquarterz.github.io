/**
 * NavigationColumn - Miller Column for Bible Navigation
 * Displays a scrollable list of books (grouped by testament) or
 * a grid of selectable number items (chapters/verses)
 * with search/filter functionality for books
 */

import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Search } from 'lucide-react';

// Stagger animation variants for number grids
const gridVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.015,
      delayChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, scale: 0.9, y: 10 },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: { type: "spring", stiffness: 150, damping: 15 }
  }
};

// Book list row animation
const bookRowVariants = {
  hidden: { opacity: 0, x: -8 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { type: "spring", stiffness: 200, damping: 20 }
  }
};

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

  // Filter logic for books
  const filteredData = useMemo(() => {
    if (type !== 'book') return data;

    return data.filter((item) => {
      const matchesSearch = item.name.toLowerCase().includes(filter.toLowerCase());
      const matchesTestament = testamentFilter === 'All' || item.testament === testamentFilter;
      return matchesSearch && matchesTestament;
    });
  }, [data, filter, testamentFilter, type]);

  // Group books by testament when showing all
  const groupedBooks = useMemo(() => {
    if (type !== 'book') return null;

    // When a specific testament is selected, just return one group
    if (testamentFilter !== 'All') {
      const labels = { Old: 'Old Testament', New: 'New Testament', Deuterocanon: 'Deuterocanonical & Apocrypha' };
      return [{ testament: labels[testamentFilter] || testamentFilter, books: filteredData }];
    }

    const old = filteredData.filter(b => b.testament === 'Old');
    const nw = filteredData.filter(b => b.testament === 'New');
    const dc = filteredData.filter(b => b.testament === 'Deuterocanon');
    const groups = [];
    if (old.length > 0) groups.push({ testament: 'Old Testament', books: old });
    if (nw.length > 0) groups.push({ testament: 'New Testament', books: nw });
    if (dc.length > 0) groups.push({ testament: 'Deuterocanonical & Apocrypha', books: dc });
    return groups;
  }, [type, filteredData, testamentFilter]);

  // Column type label for count
  const countLabel = type === 'book'
    ? `${filteredData.length} books`
    : type === 'chapter'
    ? `${filteredData.length} chapters`
    : `${filteredData.length} verses`;

  // Column modifier class
  const columnModifier = type === 'book'
    ? 'nav-column-wrapper--books'
    : type === 'verse'
    ? 'nav-column-wrapper--verses'
    : '';

  return (
    <div
      className={`nav-column-wrapper ${columnModifier} ${
        isActive ? 'nav-column-wrapper--active' : 'nav-column-wrapper--hidden'
      }`}
    >
      {/* Header Section */}
      <div className="nav-col-header">
        <div className="nav-col-header-row">
          <h3 className="nav-col-title">{title}</h3>
          <span className="nav-col-count">{countLabel}</span>
        </div>

        {/* Book Specific Controls */}
        {type === 'book' && (
          <div className="nav-book-controls">
            {/* Search */}
            <div className="nav-search-wrapper">
              <Search className="nav-search-icon" size={14} />
              <input
                type="text"
                placeholder="Find Book..."
                className="nav-search-input"
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
              />
            </div>

            {/* Testament Tabs */}
            <div className="nav-testament-tabs">
              {[['All', 'All'], ['Old', 'OT'], ['New', 'NT'], ['Deuterocanon', 'DC']].map(([value, label]) => (
                <button
                  key={value}
                  onClick={() => setTestamentFilter(value)}
                  className={`nav-testament-tab ${
                    testamentFilter === value ? 'nav-testament-tab--active' : ''
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Content Area */}
      <div className="nav-col-content nav-column">
        {type === 'book' ? (
          /* Book List with Testament Sections */
          <motion.div
            className="nav-book-list"
            variants={gridVariants}
            initial="hidden"
            animate="visible"
            key={`books-${filteredData.length}-${testamentFilter}`}
          >
            {groupedBooks.map((group) => (
              <div key={group.testament} className="nav-testament-section">
                {/* Testament Section Header */}
                <div className="nav-testament-section-header">
                  <span className="nav-testament-section-title">{group.testament}</span>
                  <span className="nav-testament-section-count">{group.books.length}</span>
                </div>

                {/* Book Rows */}
                {group.books.map((book) => {
                  const isSelected = selectedItem?.id === book.id || selectedItem?.name === book.name;

                  return (
                    <motion.button
                      key={book.id}
                      variants={bookRowVariants}
                      onClick={() => onSelect(book)}
                      whileHover={{ x: 4 }}
                      whileTap={{ scale: 0.98 }}
                      className={`nav-book-row ${isSelected ? 'nav-book-row--selected' : ''}`}
                    >
                      <span className="nav-book-row-name">{book.name}</span>
                      <span className="nav-book-row-chapters">{book.chapters} ch</span>
                    </motion.button>
                  );
                })}
              </div>
            ))}
          </motion.div>
        ) : (
          /* Number Grid for Chapters & Verses */
          <motion.div
            className="nav-grid nav-grid--numbers"
            variants={gridVariants}
            initial="hidden"
            animate="visible"
            key={`${type}-${filteredData.length}`}
          >
            {filteredData.map((item, idx) => {
              const isSelected = selectedItem === item;
              const label = typeof item === 'object' ? item.name : item;

              return (
                <motion.button
                  key={idx}
                  variants={itemVariants}
                  onClick={() => onSelect(item)}
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  className={`nav-grid-item nav-grid-item--number ${
                    isSelected ? 'nav-grid-item--selected nav-item-selected' : ''
                  }`}
                >
                  <span className="nav-grid-item-label nav-grid-item-label--number">
                    {label}
                  </span>
                </motion.button>
              );
            })}
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default NavigationColumn;
