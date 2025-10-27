/**
 * ProvenanceInfoPanel Component
 * Displays manuscript provenance information including:
 * - Provenance confidence score (0.0-1.0)
 * - Manuscript sources and attestation
 * - Canon inclusion (Protestant, Catholic, Orthodox, Ethiopian)
 * - Era and language information
 *
 * Provides transparency about the scholarly credibility of biblical texts
 */

import React, { useState } from 'react';
import CanonicalBadge from './CanonicalBadge';
import '../styles/provenance-info.css';

const ProvenanceInfoPanel = ({
  book,
  compact = false,
  showDetails = true
}) => {
  const [isExpanded, setIsExpanded] = useState(!compact);

  if (!book) {
    return null;
  }

  const {
    book_code,
    book_name,
    canonical_tier,
    canonical_status,
    provenance_confidence = 0,
    manuscript_sources = [],
    included_in_canons = [],
    era,
    language_origin,
    language_extant,
    quoted_in_nt = [],
    notes
  } = book;

  // Calculate confidence color and label
  const getConfidenceLevel = (score) => {
    if (score >= 0.90) return { label: 'Very High', className: 'very-high' };
    if (score >= 0.80) return { label: 'High', className: 'high' };
    if (score >= 0.70) return { label: 'Moderate', className: 'moderate' };
    if (score >= 0.60) return { label: 'Fair', className: 'fair' };
    return { label: 'Low', className: 'low' };
  };

  const confidenceLevel = getConfidenceLevel(provenance_confidence);
  const confidencePercent = Math.round(provenance_confidence * 100);

  return (
    <div className={`provenance-panel ${compact ? 'compact' : ''}`}>
      {/* Header */}
      <div className="panel-header">
        <div className="header-content">
          <h3 className="panel-title">
            <span className="title-icon">📜</span>
            {book_name}
            {book_code && <span className="book-code">({book_code})</span>}
          </h3>
          <CanonicalBadge
            tier={canonical_tier}
            showEmoji={true}
            showLabel={!compact}
            compact={compact}
          />
        </div>
        {compact && (
          <button
            className="expand-btn"
            onClick={() => setIsExpanded(!isExpanded)}
            aria-label={isExpanded ? 'Collapse details' : 'Expand details'}
          >
            {isExpanded ? '▼' : '▶'}
          </button>
        )}
      </div>

      {/* Confidence Score */}
      <div className="confidence-section">
        <div className="confidence-header">
          <span className="confidence-label">Provenance Confidence</span>
          <span className={`confidence-value ${confidenceLevel.className}`}>
            {confidencePercent}% <span className="confidence-tag">({confidenceLevel.label})</span>
          </span>
        </div>
        <div className="confidence-bar-container">
          <div
            className={`confidence-bar ${confidenceLevel.className}`}
            style={{ width: `${confidencePercent}%` }}
            role="progressbar"
            aria-valuenow={confidencePercent}
            aria-valuemin="0"
            aria-valuemax="100"
          />
        </div>
        <p className="confidence-description">
          Based on manuscript attestation, scholarly consensus, and textual evidence
        </p>
      </div>

      {/* Expanded Details */}
      {isExpanded && showDetails && (
        <>
          {/* Canon Inclusion */}
          {included_in_canons && included_in_canons.length > 0 && (
            <div className="info-section">
              <h4 className="section-title">Included in Canons</h4>
              <div className="canon-tags">
                {included_in_canons.map(canon => (
                  <span key={canon} className="canon-tag">
                    {canon}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Era and Language */}
          <div className="info-section">
            <h4 className="section-title">Historical Context</h4>
            <div className="info-grid">
              {era && (
                <div className="info-item">
                  <span className="info-label">Era:</span>
                  <span className="info-value">{era}</span>
                </div>
              )}
              {language_origin && (
                <div className="info-item">
                  <span className="info-label">Original Language:</span>
                  <span className="info-value">{language_origin}</span>
                </div>
              )}
              {language_extant && (
                <div className="info-item">
                  <span className="info-label">Extant Language(s):</span>
                  <span className="info-value">{language_extant}</span>
                </div>
              )}
              {canonical_status && (
                <div className="info-item">
                  <span className="info-label">Status:</span>
                  <span className="info-value">{canonical_status}</span>
                </div>
              )}
            </div>
          </div>

          {/* Manuscript Sources */}
          {manuscript_sources && manuscript_sources.length > 0 && (
            <div className="info-section">
              <h4 className="section-title">Manuscript Attestation</h4>
              <ul className="source-list">
                {manuscript_sources.map((source, index) => (
                  <li key={index} className="source-item">
                    {source}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* NT Quotations */}
          {quoted_in_nt && quoted_in_nt.length > 0 && (
            <div className="info-section">
              <h4 className="section-title">Quoted in New Testament</h4>
              <div className="nt-quotes">
                {quoted_in_nt.map((quote, index) => (
                  <span key={index} className="nt-quote">
                    {quote}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Notes */}
          {notes && (
            <div className="info-section">
              <h4 className="section-title">Additional Notes</h4>
              <p className="notes-text">{notes}</p>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default ProvenanceInfoPanel;
