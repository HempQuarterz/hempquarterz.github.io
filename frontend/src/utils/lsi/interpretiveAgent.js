/**
 * Interpretive AI Agent - LLM-Powered Reflection Insights
 *
 * Combines acoustic pattern analysis with linguistic echo detection
 * to generate AI-powered spiritual reflection insights using LLM integration.
 *
 * FAITH ALIGNMENT: This agent interprets prayer patterns through the lens
 * of ancient Hebrew and Greek Scripture, revealing potential spiritual themes
 * without claiming divine revelation or prophetic authority.
 *
 * Architecture:
 * 1. Receives pattern recognition data (acoustic features, phonemes)
 * 2. Receives linguistic echo data (Hebrew/Greek root matches)
 * 3. Constructs contextual LLM prompt with faith guardrails
 * 4. Generates reflection insights via OpenAI/Claude API
 * 5. Stores results in session_analysis table
 */

import { supabase } from '../../config/supabase';

/**
 * LLM Provider Configuration
 *
 * Supports multiple LLM providers:
 * - OpenAI (GPT-4, GPT-3.5)
 * - Anthropic Claude (Claude 3 Opus/Sonnet/Haiku)
 * - Fallback to local/mock mode for demo
 */
export const LLM_PROVIDERS = {
  OPENAI: 'openai',
  CLAUDE: 'claude',
  MOCK: 'mock' // Demo mode
};

export const LLM_MODELS = {
  // OpenAI Models
  GPT4: 'gpt-4-turbo-preview',
  GPT35: 'gpt-3.5-turbo',

  // Claude Models
  CLAUDE_OPUS: 'claude-3-opus-20240229',
  CLAUDE_SONNET: 'claude-3-sonnet-20240229',
  CLAUDE_HAIKU: 'claude-3-haiku-20240307'
};

/**
 * Reflection Insight Template
 *
 * Structure of AI-generated reflection insights.
 */
export const REFLECTION_TEMPLATE = {
  summary: '', // 1-2 sentence overview
  acousticThemes: [], // Themes from acoustic patterns
  linguisticEchoes: [], // Hebrew/Greek connections
  scriptureReferences: [], // Related Bible verses
  spiritualInsights: [], // AI-generated interpretations
  reflectionPrompts: [], // Questions for user contemplation
  disclaimer: 'AI-generated interpretation for personal reflection only. Not prophetic or authoritative.'
};

/**
 * InterpretiveAgent Class
 *
 * Main service for generating AI-powered spiritual reflection insights.
 */
export class InterpretiveAgent {
  constructor(options = {}) {
    this.provider = options.provider || LLM_PROVIDERS.MOCK;
    this.model = options.model || this.getDefaultModel();
    // SECURITY: API keys are stored server-side only, never in browser
    // The backend proxy handles API key management
    this.maxTokens = options.maxTokens || 1000;
    this.temperature = options.temperature || 0.7;
  }

  /**
   * Get default model for selected provider
   */
  getDefaultModel() {
    switch (this.provider) {
      case LLM_PROVIDERS.OPENAI:
        return LLM_MODELS.GPT35;
      case LLM_PROVIDERS.CLAUDE:
        return LLM_MODELS.CLAUDE_HAIKU; // Default: Claude Haiku (cost-effective)
      default:
        return 'mock';
    }
  }

  /**
   * Generate reflection insights from session data
   *
   * @param {Object} sessionData - Complete session data
   * @param {Object} sessionData.patterns - Acoustic pattern analysis
   * @param {Object} sessionData.echoes - Linguistic echo detection results
   * @param {Object} sessionData.metadata - Session metadata (duration, etc.)
   * @returns {Promise<Object>} Reflection insights
   */
  async generateInsights(sessionData) {
    try {
      console.log('🤖 Generating reflection insights...');

      // Validate input data
      if (!sessionData || !sessionData.patterns || !sessionData.echoes) {
        throw new Error('Invalid session data - missing patterns or echoes');
      }

      // Extract key data
      const { patterns, echoes, metadata } = sessionData;

      // Construct contextual prompt
      const prompt = this.constructPrompt(patterns, echoes, metadata);

      // Generate insights via LLM
      const rawInsights = await this.callLLM(prompt);

      // Parse and structure insights
      const structuredInsights = this.parseInsights(rawInsights, echoes);

      // Validate and sanitize
      const validatedInsights = this.validateInsights(structuredInsights);

      console.log('✅ Reflection insights generated successfully');
      return {
        success: true,
        insights: validatedInsights,
        provider: this.provider,
        model: this.model
      };

    } catch (error) {
      console.error('❌ Error generating insights:', error);
      return {
        success: false,
        error: error.message,
        fallbackInsights: this.generateFallbackInsights(sessionData)
      };
    }
  }

  /**
   * Construct LLM prompt with context and guardrails
   *
   * @param {Object} patterns - Acoustic patterns
   * @param {Array} echoes - Linguistic echoes
   * @param {Object} metadata - Session metadata
   * @returns {String} Formatted prompt
   */
  constructPrompt(patterns, echoes, metadata) {
    const { summary: patternSummary } = patterns;
    const topEchoes = echoes.slice(0, 3); // Top 3 matches

    const prompt = `You are a spiritual reflection assistant analyzing a prayer session through the lens of ancient Hebrew and Greek Scripture.

**FAITH ALIGNMENT GUARDRAILS:**
- This is interpretive analysis for personal reflection only
- Do NOT claim prophetic authority or divine revelation
- Present insights as "potential themes" and "possible connections"
- Encourage the user to seek guidance from Scripture and spiritual mentors
- Remain humble and acknowledge limitations

**SESSION DATA:**

**Acoustic Patterns:**
- Duration: ${metadata.duration} seconds
- Dominant Pattern: ${patternSummary.dominantPattern || 'N/A'}
- Average Frequency: ${patternSummary.averageFrequency || 0} Hz
- Average Intensity: ${patternSummary.averageIntensity || 0} dB
- Total Patterns: ${patternSummary.totalPatterns || 0}

**Linguistic Echoes (Phonetic Matches to Hebrew/Greek Roots):**
${topEchoes.length > 0 ? topEchoes.map((echo, i) => `
${i + 1}. **${echo.word}** (${echo.transliteration}) - ${echo.strongsNumber}
   - Meaning: ${echo.meaning}
   - Theme: ${echo.theme}
   - Similarity: ${(echo.similarity * 100).toFixed(1)}%
   - Scripture References: ${echo.scriptureReferences?.slice(0, 2).join(', ') || 'N/A'}
`).join('\n') : 'No significant linguistic echoes detected.'}

**YOUR TASK:**
Generate a spiritual reflection insight (200-300 words) that:

1. **Summarizes** the session's acoustic and linguistic patterns
2. **Identifies** potential spiritual themes based on Hebrew/Greek root meanings
3. **Suggests** connections to biblical concepts (via Strong's roots detected)
4. **Offers** 2-3 reflection questions for personal contemplation
5. **Includes** relevant Scripture references (if echoes were detected)

**FORMAT YOUR RESPONSE AS JSON:**
{
  "summary": "1-2 sentence overview",
  "acousticThemes": ["theme1", "theme2"],
  "linguisticConnections": ["connection1", "connection2"],
  "scriptureReferences": ["Book Chapter:Verse", ...],
  "spiritualInsights": ["insight1", "insight2", "insight3"],
  "reflectionPrompts": ["question1", "question2", "question3"]
}

**REMEMBER:** This is interpretive analysis for personal reflection, not prophetic revelation.`;

    return prompt;
  }

  /**
   * Call LLM API via secure backend proxy
   *
   * SECURITY: All LLM calls go through the backend proxy.
   * API keys are stored server-side only, never in browser.
   *
   * @param {String} prompt - Constructed prompt
   * @returns {Promise<String>} Raw LLM response
   */
  async callLLM(prompt) {
    // MOCK MODE: Return demo insights (no API call)
    if (this.provider === LLM_PROVIDERS.MOCK) {
      console.warn('⚠️ Using mock LLM mode - configure backend proxy for production');
      return this.getMockLLMResponse();
    }

    // PRODUCTION: Always use secure backend proxy
    // API keys are stored on the server, never exposed to browser
    return await this.callLLMViaProxy(prompt);
  }

  /**
   * Call LLM via backend proxy (recommended for production)
   *
   * @param {String} prompt - Prompt text
   * @returns {Promise<String>} LLM response
   */
  async callLLMViaProxy(prompt) {
    const proxyUrl = process.env.REACT_APP_PROXY_URL || 'http://localhost:3001';
    const response = await fetch(`${proxyUrl}/api/lsi/generate-insights`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        provider: this.provider,
        model: this.model,
        prompt,
        maxTokens: this.maxTokens,
        temperature: this.temperature
      })
    });

    if (!response.ok) {
      throw new Error(`Proxy API error: ${response.status} ${response.statusText}`);
    }

    const result = await response.json();
    return result.insights || result.content || result.text;
  }

  // SECURITY: Direct API call methods have been removed.
  // All LLM calls now go through the secure backend proxy at /api/lsi/generate-insights
  // API keys are stored server-side only (OPENAI_API_KEY, ANTHROPIC_API_KEY)
  // See /backend/server.js for proxy implementation

  /**
   * Mock LLM response for demo mode
   */
  getMockLLMResponse() {
    return JSON.stringify({
      summary: "Your prayer session reveals potential themes of spiritual breath and divine presence, with phonetic echoes suggesting connections to Hebrew 'ruach' (Spirit/Wind).",
      acousticThemes: [
        "Crescendo pattern suggesting increasing spiritual intensity",
        "Repetitive frequency patterns indicating meditative focus",
        "Moderate tempo suggesting contemplative prayer rather than ecstatic praise"
      ],
      linguisticConnections: [
        "Phonetic similarity to רוּחַ (ruach, H7307) - Spirit, Wind, Breath",
        "Echoes of שָׁלוֹם (shalom, H7965) - Peace, Wholeness, Completeness",
        "Possible resonance with אָמֵן (amen, H543) - Firm, Faithful, Trustworthy"
      ],
      scriptureReferences: [
        "Genesis 1:2 - Spirit (ruach) of God hovering over the waters",
        "John 3:8 - Wind (pneuma) blows where it wishes",
        "Ezekiel 37:9 - Prophesy to the breath (ruach), come from the four winds"
      ],
      spiritualInsights: [
        "Your utterances may reflect a heart seeking the presence of the Holy Spirit (Ruach HaKodesh)",
        "The acoustic patterns suggest a journey from quiet contemplation toward increasing spiritual engagement",
        "Linguistic echoes to Hebrew roots of 'breath' and 'spirit' may indicate the Spirit's work in prayer beyond conscious words"
      ],
      reflectionPrompts: [
        "What was your heart's desire as you began this prayer session?",
        "Do the detected themes of 'Spirit' and 'breath' resonate with what you were expressing?",
        "How might the Spirit be inviting you deeper into communion through this prayer language?"
      ]
    });
  }

  /**
   * Parse LLM response into structured format
   *
   * @param {String} rawResponse - Raw LLM text
   * @param {Array} echoes - Original echo data for enrichment
   * @returns {Object} Structured insights
   */
  parseInsights(rawResponse, echoes) {
    try {
      // Attempt JSON parse
      const jsonMatch = rawResponse.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);

        // Enrich with original echo data
        return {
          ...parsed,
          detectedEchoes: echoes.slice(0, 3).map(echo => ({
            word: echo.word,
            transliteration: echo.transliteration,
            strongsNumber: echo.strongsNumber,
            meaning: echo.meaning,
            theme: echo.theme,
            similarity: echo.similarity
          })),
          disclaimer: REFLECTION_TEMPLATE.disclaimer
        };
      }

      // Fallback: Parse as plain text
      return this.parsePlainTextInsights(rawResponse, echoes);

    } catch (error) {
      console.error('❌ Error parsing LLM response:', error);
      return this.parsePlainTextInsights(rawResponse, echoes);
    }
  }

  /**
   * Parse plain text response (fallback)
   */
  parsePlainTextInsights(text, echoes) {
    return {
      summary: text.substring(0, 200) + '...',
      acousticThemes: ['Pattern analysis available in full report'],
      linguisticConnections: echoes.slice(0, 3).map(e => `${e.transliteration} - ${e.meaning}`),
      scriptureReferences: echoes.flatMap(e => e.scriptureReferences || []).slice(0, 3),
      spiritualInsights: [text],
      reflectionPrompts: [
        'What themes stand out to you from this analysis?',
        'How do these linguistic echoes resonate with your prayer experience?'
      ],
      detectedEchoes: echoes.slice(0, 3),
      disclaimer: REFLECTION_TEMPLATE.disclaimer
    };
  }

  /**
   * Validate and sanitize insights
   *
   * @param {Object} insights - Structured insights
   * @returns {Object} Validated insights
   */
  validateInsights(insights) {
    return {
      summary: this.sanitizeText(insights.summary || ''),
      acousticThemes: this.sanitizeArray(insights.acousticThemes || []),
      linguisticConnections: this.sanitizeArray(insights.linguisticConnections || []),
      scriptureReferences: this.sanitizeArray(insights.scriptureReferences || []),
      spiritualInsights: this.sanitizeArray(insights.spiritualInsights || []),
      reflectionPrompts: this.sanitizeArray(insights.reflectionPrompts || []),
      detectedEchoes: insights.detectedEchoes || [],
      disclaimer: REFLECTION_TEMPLATE.disclaimer,
      generatedAt: new Date().toISOString()
    };
  }

  /**
   * Sanitize text to prevent XSS
   */
  sanitizeText(text) {
    if (typeof text !== 'string') return '';
    return text
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .substring(0, 2000); // Max length
  }

  /**
   * Sanitize array of strings
   */
  sanitizeArray(arr) {
    if (!Array.isArray(arr)) return [];
    return arr.map(item => this.sanitizeText(item)).filter(item => item.length > 0);
  }

  /**
   * Generate fallback insights (when LLM fails)
   */
  generateFallbackInsights(sessionData) {
    const { echoes = [], patterns = {} } = sessionData;
    const topEcho = echoes[0];

    return {
      summary: topEcho
        ? `Your session detected phonetic echoes of ${topEcho.transliteration} (${topEcho.meaning})`
        : 'Prayer session analysis available',
      acousticThemes: patterns.summary?.dominantPattern
        ? [`${patterns.summary.dominantPattern} acoustic pattern detected`]
        : [],
      linguisticConnections: echoes.slice(0, 3).map(e => `${e.transliteration} - ${e.meaning}`),
      scriptureReferences: echoes.flatMap(e => e.scriptureReferences || []).slice(0, 3),
      spiritualInsights: ['Detailed analysis temporarily unavailable - review detected echoes above'],
      reflectionPrompts: [
        'What was your heart posture during this prayer?',
        'Do the detected linguistic echoes align with your spiritual focus?'
      ],
      detectedEchoes: echoes.slice(0, 3),
      disclaimer: REFLECTION_TEMPLATE.disclaimer,
      generatedAt: new Date().toISOString(),
      fallback: true
    };
  }

  /**
   * Save insights to database
   *
   * @param {String} sessionId - Prayer session ID
   * @param {Object} insights - Generated insights
   * @returns {Promise<Object>} Save result
   */
  async saveInsights(sessionId, insights) {
    try {
      const { data, error } = await supabase
        .from('session_analysis')
        .insert({
          session_id: sessionId,
          analysis_type: 'ai_interpretation',
          analysis_data: insights,
          ai_provider: this.provider,
          ai_model: this.model,
          confidence_score: this.calculateConfidenceScore(insights)
        });

      if (error) throw error;

      console.log(`✅ Insights saved to database for session ${sessionId}`);
      return { success: true, data };

    } catch (error) {
      console.error('❌ Error saving insights:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Calculate confidence score based on data quality
   */
  calculateConfidenceScore(insights) {
    let score = 0.5; // Base score

    if (insights.detectedEchoes?.length > 0) score += 0.2;
    if (insights.scriptureReferences?.length > 0) score += 0.1;
    if (insights.spiritualInsights?.length >= 3) score += 0.1;
    if (!insights.fallback) score += 0.1;

    return Math.min(1.0, score);
  }
}

/**
 * Export default singleton instance
 *
 * Default: MOCK mode for demo/development
 * Production: Change to CLAUDE once backend proxy is deployed with API keys
 *
 * To enable production LLM:
 * 1. Deploy backend proxy (see /backend/README.md)
 * 2. Configure ANTHROPIC_API_KEY on the backend
 * 3. Set REACT_APP_PROXY_URL in frontend environment
 * 4. Change provider below to LLM_PROVIDERS.CLAUDE
 */
export default new InterpretiveAgent({
  provider: LLM_PROVIDERS.MOCK  // Change to LLM_PROVIDERS.CLAUDE when backend is ready
});
