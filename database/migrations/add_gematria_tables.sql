-- Gematria Tables Migration
-- FAITH ALIGNMENT: These tables store linguistic patterns for study purposes only.
-- All gematria values are observational aids, not sources of revelation.

-- Hebrew letters with their gematria values
CREATE TABLE IF NOT EXISTS hebrew_letters (
  id SERIAL PRIMARY KEY,
  char TEXT NOT NULL UNIQUE,           -- "א", "ב", etc.
  name TEXT NOT NULL,                  -- "aleph", "bet", etc.
  transliteration TEXT,                -- "alef", "bet", etc.
  value_standard INTEGER NOT NULL,     -- 1, 2, 3... 400
  value_final INTEGER,                 -- 500, 600, 700, 800, 900 (for sofit letters)
  value_katan INTEGER NOT NULL,        -- 1-9 reduced value
  is_final BOOLEAN DEFAULT FALSE,      -- true for ך ם ן ף ץ
  position INTEGER,                    -- Position in alphabet (1-22)
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Greek letters with their isopsephy values
CREATE TABLE IF NOT EXISTS greek_letters (
  id SERIAL PRIMARY KEY,
  char TEXT NOT NULL UNIQUE,           -- "Α", "α", etc.
  name TEXT NOT NULL,                  -- "alpha", "beta", etc.
  transliteration TEXT,                -- "alpha", "beta", etc.
  value_standard INTEGER NOT NULL,     -- 1, 2, 3... 800
  value_katan INTEGER NOT NULL,        -- 1-9 reduced value
  is_uppercase BOOLEAN DEFAULT FALSE,
  position INTEGER,                    -- Position in alphabet (1-24)
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Number themes: biblical significance of numbers
-- IMPORTANT: These are scriptural observations, not numerological mysticism
CREATE TABLE IF NOT EXISTS number_themes (
  n INTEGER PRIMARY KEY,
  title TEXT NOT NULL,                 -- "Chai (Life)", "Completion", etc.
  hebrew_word TEXT,                    -- Hebrew word with this value
  greek_word TEXT,                     -- Greek word with this value
  summary TEXT NOT NULL,               -- Short theological explanation
  scriptural_basis TEXT,               -- Why this number is significant in Scripture
  verse_references JSONB DEFAULT '[]', -- Array of verse references
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_hebrew_letters_value_standard
  ON hebrew_letters(value_standard);
CREATE INDEX IF NOT EXISTS idx_hebrew_letters_value_final
  ON hebrew_letters(value_final) WHERE value_final IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_greek_letters_value_standard
  ON greek_letters(value_standard);

CREATE INDEX IF NOT EXISTS idx_number_themes_n
  ON number_themes(n);

-- Insert Hebrew letters data
INSERT INTO hebrew_letters (char, name, transliteration, value_standard, value_katan, position, is_final) VALUES
  ('א', 'Aleph', 'alef', 1, 1, 1, false),
  ('ב', 'Bet', 'bet', 2, 2, 2, false),
  ('ג', 'Gimel', 'gimel', 3, 3, 3, false),
  ('ד', 'Dalet', 'dalet', 4, 4, 4, false),
  ('ה', 'He', 'he', 5, 5, 5, false),
  ('ו', 'Vav', 'vav', 6, 6, 6, false),
  ('ז', 'Zayin', 'zayin', 7, 7, 7, false),
  ('ח', 'Het', 'het', 8, 8, 8, false),
  ('ט', 'Tet', 'tet', 9, 9, 9, false),
  ('י', 'Yod', 'yod', 10, 1, 10, false),
  ('כ', 'Kaf', 'kaf', 20, 2, 11, false),
  ('ך', 'Kaf Sofit', 'kaf', 20, 2, 11, true),
  ('ל', 'Lamed', 'lamed', 30, 3, 12, false),
  ('מ', 'Mem', 'mem', 40, 4, 13, false),
  ('ם', 'Mem Sofit', 'mem', 40, 4, 13, true),
  ('נ', 'Nun', 'nun', 50, 5, 14, false),
  ('ן', 'Nun Sofit', 'nun', 50, 5, 14, true),
  ('ס', 'Samekh', 'samekh', 60, 6, 15, false),
  ('ע', 'Ayin', 'ayin', 70, 7, 16, false),
  ('פ', 'Pe', 'pe', 80, 8, 17, false),
  ('ף', 'Pe Sofit', 'pe', 80, 8, 17, true),
  ('צ', 'Tzadi', 'tzadi', 90, 9, 18, false),
  ('ץ', 'Tzadi Sofit', 'tzadi', 90, 9, 18, true),
  ('ק', 'Qof', 'qof', 100, 1, 19, false),
  ('ר', 'Resh', 'resh', 200, 2, 20, false),
  ('ש', 'Shin', 'shin', 300, 3, 21, false),
  ('ת', 'Tav', 'tav', 400, 4, 22, false)
ON CONFLICT (char) DO NOTHING;

-- Update final letter values for Gadol system
UPDATE hebrew_letters SET value_final = 500 WHERE char = 'ך';
UPDATE hebrew_letters SET value_final = 600 WHERE char = 'ם';
UPDATE hebrew_letters SET value_final = 700 WHERE char = 'ן';
UPDATE hebrew_letters SET value_final = 800 WHERE char = 'ף';
UPDATE hebrew_letters SET value_final = 900 WHERE char = 'ץ';

-- Insert Greek letters data
INSERT INTO greek_letters (char, name, transliteration, value_standard, value_katan, position, is_uppercase) VALUES
  ('Α', 'Alpha', 'alpha', 1, 1, 1, true),
  ('α', 'Alpha', 'alpha', 1, 1, 1, false),
  ('Β', 'Beta', 'beta', 2, 2, 2, true),
  ('β', 'Beta', 'beta', 2, 2, 2, false),
  ('Γ', 'Gamma', 'gamma', 3, 3, 3, true),
  ('γ', 'Gamma', 'gamma', 3, 3, 3, false),
  ('Δ', 'Delta', 'delta', 4, 4, 4, true),
  ('δ', 'Delta', 'delta', 4, 4, 4, false),
  ('Ε', 'Epsilon', 'epsilon', 5, 5, 5, true),
  ('ε', 'Epsilon', 'epsilon', 5, 5, 5, false),
  ('Ζ', 'Zeta', 'zeta', 7, 7, 6, true),
  ('ζ', 'Zeta', 'zeta', 7, 7, 6, false),
  ('Η', 'Eta', 'eta', 8, 8, 7, true),
  ('η', 'Eta', 'eta', 8, 8, 7, false),
  ('Θ', 'Theta', 'theta', 9, 9, 8, true),
  ('θ', 'Theta', 'theta', 9, 9, 8, false),
  ('Ι', 'Iota', 'iota', 10, 1, 9, true),
  ('ι', 'Iota', 'iota', 10, 1, 9, false),
  ('Κ', 'Kappa', 'kappa', 20, 2, 10, true),
  ('κ', 'Kappa', 'kappa', 20, 2, 10, false),
  ('Λ', 'Lambda', 'lambda', 30, 3, 11, true),
  ('λ', 'Lambda', 'lambda', 30, 3, 11, false),
  ('Μ', 'Mu', 'mu', 40, 4, 12, true),
  ('μ', 'Mu', 'mu', 40, 4, 12, false),
  ('Ν', 'Nu', 'nu', 50, 5, 13, true),
  ('ν', 'Nu', 'nu', 50, 5, 13, false),
  ('Ξ', 'Xi', 'xi', 60, 6, 14, true),
  ('ξ', 'Xi', 'xi', 60, 6, 14, false),
  ('Ο', 'Omicron', 'omicron', 70, 7, 15, true),
  ('ο', 'Omicron', 'omicron', 70, 7, 15, false),
  ('Π', 'Pi', 'pi', 80, 8, 16, true),
  ('π', 'Pi', 'pi', 80, 8, 16, false),
  ('Ρ', 'Rho', 'rho', 100, 1, 17, true),
  ('ρ', 'Rho', 'rho', 100, 1, 17, false),
  ('Σ', 'Sigma', 'sigma', 200, 2, 18, true),
  ('σ', 'Sigma', 'sigma', 200, 2, 18, false),
  ('ς', 'Sigma', 'sigma', 200, 2, 18, false),
  ('Τ', 'Tau', 'tau', 300, 3, 19, true),
  ('τ', 'Tau', 'tau', 300, 3, 19, false),
  ('Υ', 'Upsilon', 'upsilon', 400, 4, 20, true),
  ('υ', 'Upsilon', 'upsilon', 400, 4, 20, false),
  ('Φ', 'Phi', 'phi', 500, 5, 21, true),
  ('φ', 'Phi', 'phi', 500, 5, 21, false),
  ('Χ', 'Chi', 'chi', 600, 6, 22, true),
  ('χ', 'Chi', 'chi', 600, 6, 22, false),
  ('Ψ', 'Psi', 'psi', 700, 7, 23, true),
  ('ψ', 'Psi', 'psi', 700, 7, 23, false),
  ('Ω', 'Omega', 'omega', 800, 8, 24, true),
  ('ω', 'Omega', 'omega', 800, 8, 24, false)
ON CONFLICT (char) DO NOTHING;

-- Insert number themes (doctrinally safe, scripturally based)
INSERT INTO number_themes (n, title, hebrew_word, summary, scriptural_basis, verse_references) VALUES
  (1, 'Echad - Unity', 'אחד', 'The oneness and unity of Yah', 'Deuteronomy 6:4 declares "Hear, O Israel: Yahuah our Elohim is one Yahuah"', '["Deut 6:4", "Zech 14:9"]'),
  (3, 'Divine Completeness', '', 'Divine perfection and completeness', 'Holy, Holy, Holy (Isaiah 6:3); Father, Son, Spirit', '["Isa 6:3", "1 John 5:7"]'),
  (7, 'Sheva - Completion', 'שבע', 'Completion, perfection, rest', 'Seven days of creation; seventh-day Sabbath; seven churches, seals, trumpets', '["Gen 2:2", "Exod 20:10", "Rev 1:4"]'),
  (8, 'New Beginning', '', 'Resurrection, new creation', 'Eighth day circumcision; resurrection on first day (eighth from previous Sabbath)', '["Gen 17:12", "John 20:26"]'),
  (10, 'Yod - Divine Order', 'י', 'Law, testimony, divine order', 'Ten Commandments; ten plagues; tithe (tenth)', '["Exod 20:1-17", "Exod 7-12", "Lev 27:30"]'),
  (12, 'Governmental Perfection', '', 'Tribes, apostles, gates', 'Twelve tribes of Israel; twelve apostles; twelve gates of New Jerusalem', '["Gen 49", "Matt 10:1-4", "Rev 21:12"]'),
  (18, 'Chai - Life', 'חי', 'Life, living', '"I am Yahuah your Elohim" (Lev 18:5); numerical value of "life"', '["Lev 18:5", "Deut 30:19"]'),
  (26, 'YHWH - The Name', 'יהוה', 'The divine name Yahuah', 'The Tetragrammaton (יהוה) has gematria value of 26', '["Exod 3:14-15", "Ps 83:18"]'),
  (40, 'Testing and Trial', '', 'Period of testing, probation', 'Flood (40 days/nights); wilderness (40 years); Yahusha''s temptation (40 days)', '["Gen 7:12", "Num 14:33-34", "Matt 4:2"]'),
  (50, 'Jubilee and Freedom', '', 'Pentecost, jubilee, liberty', 'Fifty days to Pentecost; Year of Jubilee (50th year)', '["Lev 23:16", "Lev 25:10", "Acts 2:1"]'),
  (70, 'Nations of the World', '', 'The Gentile nations', 'Seventy nations (Genesis 10); seventy elders; seventy disciples', '["Gen 10", "Exod 24:1", "Luke 10:1"]'),
  (120, 'End of Flesh', '', 'Divinely appointed time', 'Moses'' lifespan; upper room gathering', '["Deut 34:7", "Acts 1:15"]'),
  (153, 'Elect Remnant', '', 'Fullness of the elect', 'Miraculous catch of fish', '["John 21:11"]'),
  (666, 'Number of Man', '', 'Human imperfection, mark of the beast', 'Number of a man; falls short of divine perfection (777)', '["Rev 13:18"]'),
  (777, 'Divine Perfection', '', 'Absolute perfection of Yah', 'Triple sevens represent complete divine perfection', '["Rev 1:4"]'),
  (888, 'Yahusha (Jesus)', 'Ἰησοῦς', 'The name of the Messiah in Greek isopsephy', 'Ἰησοῦς (Jesus) in Greek gematria equals 888, representing new creation', '["Matt 1:21", "John 1:1"]')
ON CONFLICT (n) DO NOTHING;

-- Add comments for documentation
COMMENT ON TABLE hebrew_letters IS 'Hebrew alphabet with gematria values for study purposes only';
COMMENT ON TABLE greek_letters IS 'Greek alphabet with isopsephy values for study purposes only';
COMMENT ON TABLE number_themes IS 'Biblical significance of numbers - scriptural observations, not numerology';

COMMENT ON COLUMN number_themes.summary IS 'Doctrinally safe explanation based on Scripture';
COMMENT ON COLUMN number_themes.scriptural_basis IS 'Why this number matters in biblical context';
