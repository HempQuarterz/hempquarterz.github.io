/**
 * GematriaPanel Component
 * Interactive panel for exploring gematria values and number themes
 *
 * FAITH ALIGNMENT: All calculations are linguistic study aids.
 * This tool does NOT claim to reveal hidden meanings or prophecy.
 * "AI may measure patterns, but only Yah can interpret meaning."
 */

import React, { useState, useEffect } from 'react';
import {
  calculateGematria,
  getGematriaBreakdown,
  GEMATRIA_SYSTEMS,
  NOTABLE_VALUES
} from '../utils/gematria';
import { supabase } from '../config/supabase';
import '../styles/gematria.css';

const GematriaPanel = ({ initialText = '', initialLanguage = 'hebrew', onClose }) => {
  const [inputText, setInputText] = useState(initialText);
  const [language, setLanguage] = useState(initialLanguage);
  const [system, setSystem] = useState('standard');
  const [results, setResults] = useState(null);
  const [breakdown, setBreakdown] = useState([]);
  const [numberThemes, setNumberThemes] = useState([]);
  const [selectedTab, setSelectedTab] = useState('calculator');
  const [showDisclaimer, setShowDisclaimer] = useState(true);

  // Load number themes from database
  useEffect(() => {
    loadNumberThemes();
  }, []);

  const loadNumberThemes = async () => {
    try {
      const { data, error } = await supabase
        .from('number_themes')
        .select('*')
        .order('n', { ascending: true });

      if (error) throw error;
      setNumberThemes(data || []);
    } catch (err) {
      console.error('Failed to load number themes:', err);
    }
  };

  // Calculate gematria when inputs change
  useEffect(() => {
    if (!inputText.trim()) {
      setResults(null);
      setBreakdown([]);
      return;
    }

    const result = calculateGematria(inputText, language, system);
    setResults(result);

    const breakdownData = getGematriaBreakdown(inputText, result.language || language, system);
    setBreakdown(breakdownData);
  }, [inputText, language, system]);

  const handleSystemChange = (newSystem) => {
    setSystem(newSystem);
  };

  const handleLanguageChange = (newLanguage) => {
    setLanguage(newLanguage);
  };

  const getNotableValue = (value) => {
    return NOTABLE_VALUES[value] || null;
  };

  const getThemeForValue = (value) => {
    return numberThemes.find(theme => theme.n === value);
  };

  const renderCalculator = () => (
    <div className="gematria-calculator">
      {/* Language Toggle */}
      <div className="gematria-language-toggle" role="group" aria-label="Language selection">
        <button
          className={`lang-btn ${language === 'hebrew' ? 'active' : ''}`}
          onClick={() => handleLanguageChange('hebrew')}
          aria-label="Select Hebrew language"
          aria-pressed={language === 'hebrew'}
        >
          <span className="lang-badge" aria-hidden="true">HEB</span> Hebrew
        </button>
        <button
          className={`lang-btn ${language === 'greek' ? 'active' : ''}`}
          onClick={() => handleLanguageChange('greek')}
          aria-label="Select Greek language"
          aria-pressed={language === 'greek'}
        >
          <span className="lang-badge" aria-hidden="true">GRK</span> Greek
        </button>
      </div>

      {/* Input Area */}
      <div className="gematria-input-area">
        <label htmlFor="gematria-text-input" className="visually-hidden">
          Enter {language === 'hebrew' ? 'Hebrew' : 'Greek'} text for gematria calculation
        </label>
        <textarea
          id="gematria-text-input"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder={
            language === 'hebrew'
              ? 'Enter Hebrew text... (e.g., יהוה, חיים, שלום)'
              : 'Enter Greek text... (e.g., Ἰησοῦς, ἀγάπη)'
          }
          dir={language === 'hebrew' ? 'rtl' : 'ltr'}
          className="gematria-input"
          rows={3}
        />
      </div>

      {/* System Selector */}
      <div className="gematria-system-selector">
        <label>Calculation System:</label>
        <div className="system-buttons">
          {Object.entries(GEMATRIA_SYSTEMS).map(([key, info]) => {
            // Filter systems based on language support
            if (language === 'greek' && !info.greek) return null;
            if (language === 'hebrew' && !info.hebrew) return null;

            return (
              <button
                key={key}
                className={`system-btn ${system === key ? 'active' : ''}`}
                onClick={() => handleSystemChange(key)}
                title={info.description}
              >
                {info.name.split(' ')[0]}
              </button>
            );
          })}
        </div>
      </div>

      {/* Results Display */}
      {results && results.value > 0 && (
        <div className="gematria-results">
          <div className="gematria-result-header">
            <div className="result-value">{results.value}</div>
            <div className="result-system">{GEMATRIA_SYSTEMS[system]?.name}</div>
          </div>

          {results.normalized !== results.original && (
            <div className="result-normalized">
              <strong>Normalized:</strong> <span dir={language === 'hebrew' ? 'rtl' : 'ltr'}>{results.normalized}</span>
            </div>
          )}

          {/* Letter Breakdown */}
          {breakdown.length > 0 && (
            <div className="gematria-breakdown">
              <h4>Letter-by-Letter Breakdown:</h4>
              <div className="breakdown-grid">
                {breakdown.map((item, idx) => (
                  <div key={idx} className="breakdown-item">
                    <span className="breakdown-char" dir={language === 'hebrew' ? 'rtl' : 'ltr'}>
                      {item.char}
                    </span>
                    <span className="breakdown-equals">=</span>
                    <span className="breakdown-value">{item.value}</span>
                  </div>
                ))}
              </div>
              <div className="breakdown-sum">
                Total: {results.value}
              </div>
            </div>
          )}

          {/* Notable Value Info */}
          {getNotableValue(results.value) && (
            <div className="notable-value-card">
              <h4>Notable Biblical Value</h4>
              {(() => {
                const notable = getNotableValue(results.value);
                return (
                  <>
                    <div className="notable-title">{notable.name}</div>
                    <div className="notable-meaning">{notable.meaning}</div>
                    {notable.hebrew && (
                      <div className="notable-word" dir="rtl">
                        Hebrew: {notable.hebrew}
                      </div>
                    )}
                    {notable.reference && (
                      <div className="notable-reference">
                        Reference: {notable.reference}
                      </div>
                    )}
                  </>
                );
              })()}
            </div>
          )}

          {/* Database Theme Info */}
          {getThemeForValue(results.value) && (
            <div className="theme-card">
              <h4>Scriptural Significance</h4>
              {(() => {
                const theme = getThemeForValue(results.value);
                return (
                  <>
                    <div className="theme-title">{theme.title}</div>
                    {theme.hebrew_word && (
                      <div className="theme-word" dir="rtl">
                        {theme.hebrew_word}
                      </div>
                    )}
                    {theme.greek_word && (
                      <div className="theme-word">
                        {theme.greek_word}
                      </div>
                    )}
                    <div className="theme-summary">{theme.summary}</div>
                    <div className="theme-basis">{theme.scriptural_basis}</div>
                    {theme.verse_references && theme.verse_references.length > 0 && (
                      <div className="theme-references">
                        <strong>References:</strong> {theme.verse_references.join(', ')}
                      </div>
                    )}
                  </>
                );
              })()}
            </div>
          )}
        </div>
      )}
    </div>
  );

  const renderNumberThemes = () => (
    <div className="number-themes-list">
      <h3>Biblical Number Themes</h3>
      <p className="themes-intro">
        These are scriptural observations of how specific numbers appear throughout the Bible.
        They are study patterns, not mystical interpretations.
      </p>

      <div className="themes-grid">
        {numberThemes.map((theme) => (
          <div key={theme.n} className="theme-item">
            <div className="theme-item-number">{theme.n}</div>
            <div className="theme-item-content">
              <h4>{theme.title}</h4>
              {theme.hebrew_word && (
                <div className="theme-item-word" dir="rtl">
                  {theme.hebrew_word}
                </div>
              )}
              {theme.greek_word && (
                <div className="theme-item-word">
                  {theme.greek_word}
                </div>
              )}
              <p className="theme-item-summary">{theme.summary}</p>
              {theme.verse_references && theme.verse_references.length > 0 && (
                <div className="theme-item-refs">
                  {theme.verse_references.join(', ')}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="gematria-panel">
      {/* Faith Alignment Disclaimer */}
      {showDisclaimer && (
        <div className="faith-disclaimer">
          <div className="disclaimer-content">
            <span className="disclaimer-icon">⚠️</span>
            <div className="disclaimer-text">
              <strong>Study Aid Notice:</strong> Gematria values are linguistic patterns for
              educational reflection only. All meaning comes from Scripture and the Ruach ha'Qodesh
              (Holy Spirit), not from numerical calculations. This tool does not claim revelation,
              prophecy, or hidden power.
            </div>
            <button
              className="disclaimer-close"
              onClick={() => setShowDisclaimer(false)}
              aria-label="Dismiss"
            >
              ×
            </button>
          </div>
        </div>
      )}

      {/* Panel Header */}
      <div className="gematria-panel-header">
        <h2>Gematria Explorer</h2>
        {onClose && (
          <button onClick={onClose} className="panel-close-btn" aria-label="Close">
            ×
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="gematria-tabs" role="tablist" aria-label="Gematria tools">
        <button
          className={`tab ${selectedTab === 'calculator' ? 'active' : ''}`}
          onClick={() => setSelectedTab('calculator')}
          role="tab"
          aria-selected={selectedTab === 'calculator'}
          aria-controls="gematria-tabpanel-calculator"
          id="gematria-tab-calculator"
        >
          Calculator
        </button>
        <button
          className={`tab ${selectedTab === 'themes' ? 'active' : ''}`}
          onClick={() => setSelectedTab('themes')}
          role="tab"
          aria-selected={selectedTab === 'themes'}
          aria-controls="gematria-tabpanel-themes"
          id="gematria-tab-themes"
        >
          Number Themes ({numberThemes.length})
        </button>
      </div>

      {/* Tab Content */}
      <div className="gematria-panel-content">
        {selectedTab === 'calculator' && (
          <div role="tabpanel" id="gematria-tabpanel-calculator" aria-labelledby="gematria-tab-calculator">
            {renderCalculator()}
          </div>
        )}
        {selectedTab === 'themes' && (
          <div role="tabpanel" id="gematria-tabpanel-themes" aria-labelledby="gematria-tab-themes">
            {renderNumberThemes()}
          </div>
        )}
      </div>
    </div>
  );
};

export default GematriaPanel;
