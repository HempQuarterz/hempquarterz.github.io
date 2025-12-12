/**
 * ConsolidatedPanel Component
 * Tabbed interface consolidating all manuscript features
 * Reduces vertical scrolling with modern tab navigation
 */

import React, { useState } from 'react';
import CrossReferencePanel from './CrossReferencePanel';
import ParallelPassageViewer from './ParallelPassageViewer';
import NetworkGraphViewer from './NetworkGraphViewer';
import ThematicDiscoveryPanel from './ThematicDiscoveryPanel';
import TimelineViewer from './TimelineViewer';
import AudioPlayer from './AudioPlayer';
import ManuscriptIcon from './icons/ManuscriptIcon';
import '../styles/consolidated-panel.css';

const ConsolidatedPanel = ({
  book,
  chapter,
  verse,
  currentVerseText,
  onNavigate
}) => {
  const [activeTab, setActiveTab] = useState('cross-refs');

  const tabs = [
    {
      id: 'cross-refs',
      label: 'Cross-Refs',
      icon: 'reference',
      description: 'Cross-references to other verses'
    },
    {
      id: 'parallel',
      label: 'Parallel',
      icon: 'books',
      description: 'Parallel passages & quotations'
    },
    {
      id: 'network',
      label: 'Network',
      icon: 'network',
      description: 'Interactive reference graph'
    },
    {
      id: 'discovery',
      label: 'Discovery',
      icon: 'discovery',
      description: 'AI thematic search'
    },
    {
      id: 'timeline',
      label: 'Timeline',
      icon: 'timeline',
      description: 'Historical context'
    },
    {
      id: 'audio',
      label: 'Audio',
      icon: 'audio',
      description: 'Text-to-speech player'
    },
    {
      id: 'about',
      label: 'About',
      icon: 'info',
      description: 'Project information'
    }
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'cross-refs':
        return (
          <div className="tab-content-wrapper">
            <CrossReferencePanel
              book={book}
              chapter={chapter}
              verse={verse}
              onReferenceClick={onNavigate}
            />
          </div>
        );

      case 'parallel':
        return (
          <div className="tab-content-wrapper">
            <ParallelPassageViewer
              book={book}
              chapter={chapter}
              verse={verse}
              onNavigate={onNavigate}
            />
          </div>
        );

      case 'network':
        return (
          <div className="tab-content-wrapper">
            <NetworkGraphViewer
              book={book}
              chapter={chapter}
              verse={verse}
              onNavigate={onNavigate}
              maxDepth={2}
            />
          </div>
        );

      case 'discovery':
        return (
          <div className="tab-content-wrapper">
            <ThematicDiscoveryPanel
              book={book}
              chapter={chapter}
              verse={verse}
              currentVerseText={currentVerseText}
              onNavigate={onNavigate}
            />
          </div>
        );

      case 'timeline':
        return (
          <div className="tab-content-wrapper">
            <TimelineViewer
              book={book}
              chapter={chapter}
              verse={verse}
              onNavigate={onNavigate}
            />
          </div>
        );

      case 'audio':
        return (
          <div className="tab-content-wrapper">
            <AudioPlayer
              verseText={currentVerseText}
              verseReference={`${book} ${chapter}:${verse}`}
              manuscript="WEB"
            />
          </div>
        );

      case 'about':
        return (
          <div className="tab-content-wrapper">
            <div className="about-content">
              <h2 style={{
                color: '#2E7D32',
                marginBottom: '1rem',
                fontFamily: 'Libre Baskerville, serif'
              }}>
                About the All4Yah Project
              </h2>
              <p style={{ fontSize: '1.05rem', lineHeight: '1.8', color: '#333', marginBottom: '1rem' }}>
                The <strong>All4Yah Project</strong> is a "Digital Dead Sea Scrolls" initiative dedicated to
                restoring the Word verse by verse using original manuscripts, transparent scholarship,
                and modern technology.
              </p>
              <p style={{ fontSize: '1.05rem', lineHeight: '1.8', color: '#333', marginBottom: '1rem' }}>
                We use the <strong>Westminster Leningrad Codex</strong> (Hebrew OT),
                the <strong>SBL Greek New Testament</strong> (Greek NT), and
                the <strong>World English Bible</strong> (English) to provide parallel manuscript views
                with divine name restoration.
              </p>

              <h3 style={{
                color: '#2E7D32',
                marginTop: '1.5rem',
                marginBottom: '0.75rem',
                fontSize: '1.2rem'
              }}>
                Divine Name Restorations:
              </h3>
              <ul style={{
                fontSize: '1rem',
                lineHeight: '1.8',
                color: '#333',
                listStyle: 'none',
                paddingLeft: 0
              }}>
                <li>✦ <strong>יהוה</strong> (H3068) → <strong className="restored-name">Yahuah</strong> - The personal name of the Creator (5,518× in OT)</li>
                <li>✦ <strong>יהושע</strong> (H3091) / <strong>Ἰησοῦς</strong> (G2424) → <strong className="restored-name">Yahusha</strong> - "Yahuah saves"</li>
                <li>✦ <strong>אלהים</strong> (H430) / <strong>θεός</strong> (G2316) → <strong className="restored-name">Elohim</strong> - Mighty One, Creator</li>
              </ul>

              <p style={{
                marginTop: '1.5rem',
                fontSize: '0.95rem',
                color: '#666',
                fontStyle: 'italic'
              }}>
                <strong>Mission:</strong> "This is my name forever, the name you shall call me from
                generation to generation." - Exodus 3:15
              </p>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="consolidated-panel">
      {/* Tab Navigation */}
      <div className="tab-navigation">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`tab-button ${activeTab === tab.id ? 'active' : ''}`}
            title={tab.description}
          >
            <span className="tab-icon">
              <ManuscriptIcon
                name={tab.icon}
                size={20}
                color={activeTab === tab.id ? 'var(--primary)' : 'var(--text-secondary)'}
              />
            </span>
            <span className="tab-label">{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="tab-content">
        {renderTabContent()}
      </div>
    </div>
  );
};

export default ConsolidatedPanel;

