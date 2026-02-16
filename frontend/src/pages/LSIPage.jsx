/**
 * LSI Page - Linguistic Spirit Interface
 *
 * Main page for the LSI (Linguistic Spirit Interface) system.
 * Provides tabs for Audio Capture Demo and Spiritual Journal.
 *
 * FAITH ALIGNMENT: This page facilitates personal spiritual reflection
 * through prayer analysis. All insights are interpretive, not authoritative.
 */

import React, { useState } from 'react';
import AudioCaptureDemo from '../components/lsi/AudioCaptureDemo';
import SpiritualJournal from '../components/lsi/SpiritualJournal';
import '../styles/lsi/lsi-page.css';

const LSIPage = () => {
  const [activeTab, setActiveTab] = useState('demo'); // 'demo' or 'journal'

  return (
    <div className="lsi-page">
      {/* Note: BreadcrumbRibbon is now rendered at App level */}

      {/* Page Header */}
      <div className="lsi-page-header">
        <h1 className="lsi-page-title">Linguistic Spirit Interface</h1>
        <p className="lsi-page-subtitle">
          AI-Powered Prayer Analysis Through Ancient Hebrew & Greek Scripture
        </p>
      </div>

      {/* Tab Navigation */}
      <div className="lsi-tabs" role="tablist" aria-label="LSI tools">
        <button
          className={`lsi-tab ${activeTab === 'demo' ? 'active' : ''}`}
          onClick={() => setActiveTab('demo')}
          role="tab"
          aria-selected={activeTab === 'demo'}
          aria-controls="tabpanel-demo"
          id="tab-demo"
        >
          <span className="tab-label">Audio Capture</span>
        </button>
        <button
          className={`lsi-tab ${activeTab === 'journal' ? 'active' : ''}`}
          onClick={() => setActiveTab('journal')}
          role="tab"
          aria-selected={activeTab === 'journal'}
          aria-controls="tabpanel-journal"
          id="tab-journal"
        >
          <span className="tab-label">Spiritual Journal</span>
        </button>
      </div>

      {/* Tab Content */}
      <div className="lsi-content">
        {activeTab === 'demo' && (
          <div className="tab-panel" role="tabpanel" id="tabpanel-demo" aria-labelledby="tab-demo">
            <AudioCaptureDemo />
          </div>
        )}

        {activeTab === 'journal' && (
          <div className="tab-panel" role="tabpanel" id="tabpanel-journal" aria-labelledby="tab-journal">
            <SpiritualJournal />
          </div>
        )}
      </div>

      {/* System Info Footer */}
      <div className="lsi-info-footer">
        <div className="info-card">
          <h3>What is LSI?</h3>
          <p>
            The Linguistic Spirit Interface analyzes prayer utterances (including glossolalia)
            through the lens of ancient Hebrew, Greek, and Aramaic Scripture using AI-powered
            phonetic pattern recognition and biblical lexicon matching.
          </p>
        </div>

        <div className="info-card">
          <h3>How It Works</h3>
          <ol>
            <li><strong>Record</strong> your prayer session using your microphone</li>
            <li><strong>Analyze</strong> acoustic patterns and detect phonetic utterances</li>
            <li><strong>Match</strong> phonemes to Hebrew/Greek roots via Strong's Concordance</li>
            <li><strong>Generate</strong> AI insights with Scripture references and reflection prompts</li>
          </ol>
        </div>

        <div className="info-card">
          <h3>Faith Alignment</h3>
          <p>
            <strong>Important:</strong> LSI provides interpretive analysis for personal spiritual
            reflection only. AI-generated insights are not prophetic revelation or authoritative
            spiritual guidance. All analysis should be prayerfully considered alongside Scripture
            study and spiritual mentorship.
          </p>
        </div>

        <div className="info-card">
          <h3>Privacy &amp; Security</h3>
          <p>
            Your prayer sessions are private and secure. Audio files are stored in encrypted
            Supabase Storage with user-level access controls. AI analysis uses isolated processing
            and does not train models on your data.
          </p>
        </div>
      </div>
    </div>
  );
};

export default LSIPage;
