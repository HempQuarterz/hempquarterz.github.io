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
              <h2>About the All4Yah Project</h2>
              <p>
                The <strong>All4Yah Project</strong> is a &ldquo;Digital Dead Sea Scrolls&rdquo; initiative dedicated to
                restoring the Word verse by verse using original manuscripts, transparent scholarship,
                and modern technology.
              </p>
              <p>
                We use the <strong>Westminster Leningrad Codex</strong> (Hebrew OT),
                the <strong>SBL Greek New Testament</strong> (Greek NT), and
                the <strong>World English Bible</strong> (English) to provide parallel manuscript views
                with divine name restoration.
              </p>

              <h3>Divine Name Restorations:</h3>
              <ul className="about-restorations-list">
                <li><strong>&#1497;&#1492;&#1493;&#1492;</strong> (H3068) &rarr; <strong className="restored-name">Yahuah</strong> - The personal name of the Creator (5,518x in OT)</li>
                <li><strong>&#1497;&#1492;&#1493;&#1513;&#1506;</strong> (H3091) / <strong>&#7992;&#951;&#963;&#959;&#8166;&#962;</strong> (G2424) &rarr; <strong className="restored-name">Yahusha</strong> - &ldquo;Yahuah saves&rdquo;</li>
                <li><strong>&#1488;&#1500;&#1492;&#1497;&#1501;</strong> (H430) / <strong>&#952;&#949;&#972;&#962;</strong> (G2316) &rarr; <strong className="restored-name">Elohim</strong> - Mighty One, Creator</li>
              </ul>

              <p className="about-mission-quote">
                <strong>Mission:</strong> &ldquo;This is my name forever, the name you shall call me from
                generation to generation.&rdquo; - Exodus 3:15
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
      <div className="tab-navigation" role="tablist" aria-label="Manuscript tools">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`tab-button ${activeTab === tab.id ? 'active' : ''}`}
            title={tab.description}
            role="tab"
            aria-selected={activeTab === tab.id}
            aria-controls={`consolidated-tabpanel-${tab.id}`}
            id={`consolidated-tab-${tab.id}`}
          >
            <span className="tab-icon" aria-hidden="true">
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
      <div
        className="tab-content"
        role="tabpanel"
        id={`consolidated-tabpanel-${activeTab}`}
        aria-labelledby={`consolidated-tab-${activeTab}`}
      >
        {renderTabContent()}
      </div>
    </div>
  );
};

export default ConsolidatedPanel;

