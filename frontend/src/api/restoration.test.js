import { describe, it, expect, beforeEach, vi } from 'vitest';

const mockSelect = vi.fn();
const mockOrder = vi.fn();
const mockFrom = vi.fn();

vi.mock('../config/supabase', () => ({
  supabase: {
    from: (...args) => mockFrom(...args),
  },
}));

const HEBREW_YHWH = 'יהוה';
const HEBREW_YEHOSHUA = 'יהושע';

const sampleMappings = [
  {
    strong_number: 'H3068',
    original_text: HEBREW_YHWH,
    restored_rendering: 'Yahuah',
    context_rules: { language: 'hebrew' },
  },
  {
    strong_number: 'H3091',
    original_text: HEBREW_YEHOSHUA,
    restored_rendering: 'Yahusha',
    context_rules: { language: 'hebrew' },
  },
  {
    strong_number: null,
    original_text: 'LORD',
    restored_rendering: 'Yahuah',
    context_rules: { language: 'english', pattern: '/\\bLORD\\b/g' },
  },
  {
    strong_number: null,
    original_text: 'God',
    restored_rendering: 'Elohim',
    context_rules: { language: 'english', whole_word: true },
  },
];

beforeEach(async () => {
  mockFrom.mockClear();
  mockSelect.mockClear();
  mockOrder.mockClear();
  mockOrder.mockResolvedValue({ data: sampleMappings, error: null });
  mockSelect.mockReturnValue({ order: mockOrder });
  mockFrom.mockReturnValue({ select: mockSelect });

  const mod = await import('./restoration.js');
  mod.clearMappingsCache();
});

describe('restoreByStrongsNumbers', () => {
  it('replaces YHWH with Yahuah when H3068 is present', async () => {
    const { restoreByStrongsNumbers } = await import('./restoration.js');
    const result = await restoreByStrongsNumbers(
      `בראשית ברא ${HEBREW_YHWH} את השמים`,
      ['H3068'],
      'hebrew'
    );

    expect(result.restored).toBe(true);
    expect(result.text).toContain('Yahuah');
    expect(result.text).not.toContain(HEBREW_YHWH);
    expect(result.restorations).toHaveLength(1);
    expect(result.restorations[0].strongNumber).toBe('H3068');
  });

  it('returns text unchanged when no relevant Strong numbers match', async () => {
    const { restoreByStrongsNumbers } = await import('./restoration.js');
    const original = 'plain text with no divine names';
    const result = await restoreByStrongsNumbers(original, ['H9999'], 'hebrew');

    expect(result.restored).toBe(false);
    expect(result.text).toBe(original);
    expect(result.restorations).toEqual([]);
  });

  it('counts multiple occurrences of the same word', async () => {
    const { restoreByStrongsNumbers } = await import('./restoration.js');
    const text = `${HEBREW_YHWH} אלהי ${HEBREW_YHWH}`;
    const result = await restoreByStrongsNumbers(text, ['H3068'], 'hebrew');

    expect(result.restorations[0].count).toBe(2);
    expect(result.text.match(/Yahuah/g)).toHaveLength(2);
  });
});

describe('restoreByPattern', () => {
  it('replaces LORD with Yahuah using regex pattern', async () => {
    const { restoreByPattern } = await import('./restoration.js');
    const result = await restoreByPattern('In the beginning the LORD created', 'english');

    expect(result.restored).toBe(true);
    expect(result.text).toContain('Yahuah');
    expect(result.text).not.toContain('LORD');
  });

  it('replaces "God" using whole_word matching, not as substring', async () => {
    const { restoreByPattern } = await import('./restoration.js');
    // "Godliness" should NOT be replaced; standalone "God" should
    const result = await restoreByPattern('Godliness in God is great', 'english');

    expect(result.text).toContain('Godliness');
    expect(result.text).toContain('Elohim');
    expect(result.text).not.toMatch(/\bGod\b/);
  });

  it('returns unrestored when no patterns match', async () => {
    const { restoreByPattern } = await import('./restoration.js');
    const result = await restoreByPattern('plain prose with nothing to swap', 'english');

    expect(result.restored).toBe(false);
    expect(result.restorations).toEqual([]);
  });
});

describe('mapping cache', () => {
  it('loads mappings only once across calls', async () => {
    const { restoreByStrongsNumbers } = await import('./restoration.js');
    await restoreByStrongsNumbers('a', ['H3068'], 'hebrew');
    await restoreByStrongsNumbers('b', ['H3068'], 'hebrew');
    await restoreByStrongsNumbers('c', ['H3068'], 'hebrew');

    expect(mockFrom).toHaveBeenCalledTimes(1);
    expect(mockFrom).toHaveBeenCalledWith('name_mappings');
  });

  it('reloads after clearMappingsCache', async () => {
    const { restoreByStrongsNumbers, clearMappingsCache } = await import('./restoration.js');
    await restoreByStrongsNumbers('a', ['H3068'], 'hebrew');
    clearMappingsCache();
    await restoreByStrongsNumbers('b', ['H3068'], 'hebrew');

    expect(mockFrom).toHaveBeenCalledTimes(2);
  });
});
