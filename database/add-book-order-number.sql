-- Migration: Add order_number column for biblical/chronological book ordering
-- Purpose: Enable books dropdown to display in traditional biblical order instead of alphabetical

-- Step 1: Add order_number column
ALTER TABLE canonical_books
ADD COLUMN IF NOT EXISTS order_number INTEGER;

-- Step 2: Populate order_number with biblical book order
-- Old Testament (1-39)
UPDATE canonical_books SET order_number = 1 WHERE book_code = 'GEN';
UPDATE canonical_books SET order_number = 2 WHERE book_code = 'EXO';
UPDATE canonical_books SET order_number = 3 WHERE book_code = 'LEV';
UPDATE canonical_books SET order_number = 4 WHERE book_code = 'NUM';
UPDATE canonical_books SET order_number = 5 WHERE book_code = 'DEU';
UPDATE canonical_books SET order_number = 6 WHERE book_code = 'JOS';
UPDATE canonical_books SET order_number = 7 WHERE book_code = 'JDG';
UPDATE canonical_books SET order_number = 8 WHERE book_code = 'RUT';
UPDATE canonical_books SET order_number = 9 WHERE book_code = '1SA';
UPDATE canonical_books SET order_number = 10 WHERE book_code = '2SA';
UPDATE canonical_books SET order_number = 11 WHERE book_code = '1KI';
UPDATE canonical_books SET order_number = 12 WHERE book_code = '2KI';
UPDATE canonical_books SET order_number = 13 WHERE book_code = '1CH';
UPDATE canonical_books SET order_number = 14 WHERE book_code = '2CH';
UPDATE canonical_books SET order_number = 15 WHERE book_code = 'EZR';
UPDATE canonical_books SET order_number = 16 WHERE book_code = 'NEH';
UPDATE canonical_books SET order_number = 17 WHERE book_code = 'EST';
UPDATE canonical_books SET order_number = 18 WHERE book_code = 'JOB';
UPDATE canonical_books SET order_number = 19 WHERE book_code = 'PSA';
UPDATE canonical_books SET order_number = 20 WHERE book_code = 'PRO';
UPDATE canonical_books SET order_number = 21 WHERE book_code = 'ECC';
UPDATE canonical_books SET order_number = 22 WHERE book_code = 'SNG';
UPDATE canonical_books SET order_number = 23 WHERE book_code = 'ISA';
UPDATE canonical_books SET order_number = 24 WHERE book_code = 'JER';
UPDATE canonical_books SET order_number = 25 WHERE book_code = 'LAM';
UPDATE canonical_books SET order_number = 26 WHERE book_code = 'EZK';
UPDATE canonical_books SET order_number = 27 WHERE book_code = 'DAN';
UPDATE canonical_books SET order_number = 28 WHERE book_code = 'HOS';
UPDATE canonical_books SET order_number = 29 WHERE book_code = 'JOL';
UPDATE canonical_books SET order_number = 30 WHERE book_code = 'AMO';
UPDATE canonical_books SET order_number = 31 WHERE book_code = 'OBA';
UPDATE canonical_books SET order_number = 32 WHERE book_code = 'JON';
UPDATE canonical_books SET order_number = 33 WHERE book_code = 'MIC';
UPDATE canonical_books SET order_number = 34 WHERE book_code = 'NAM';
UPDATE canonical_books SET order_number = 35 WHERE book_code = 'HAB';
UPDATE canonical_books SET order_number = 36 WHERE book_code = 'ZEP';
UPDATE canonical_books SET order_number = 37 WHERE book_code = 'HAG';
UPDATE canonical_books SET order_number = 38 WHERE book_code = 'ZEC';
UPDATE canonical_books SET order_number = 39 WHERE book_code = 'MAL';

-- New Testament (40-66)
UPDATE canonical_books SET order_number = 40 WHERE book_code = 'MAT';
UPDATE canonical_books SET order_number = 41 WHERE book_code = 'MRK';
UPDATE canonical_books SET order_number = 42 WHERE book_code = 'LUK';
UPDATE canonical_books SET order_number = 43 WHERE book_code = 'JHN';
UPDATE canonical_books SET order_number = 44 WHERE book_code = 'ACT';
UPDATE canonical_books SET order_number = 45 WHERE book_code = 'ROM';
UPDATE canonical_books SET order_number = 46 WHERE book_code = '1CO';
UPDATE canonical_books SET order_number = 47 WHERE book_code = '2CO';
UPDATE canonical_books SET order_number = 48 WHERE book_code = 'GAL';
UPDATE canonical_books SET order_number = 49 WHERE book_code = 'EPH';
UPDATE canonical_books SET order_number = 50 WHERE book_code = 'PHP';
UPDATE canonical_books SET order_number = 51 WHERE book_code = 'COL';
UPDATE canonical_books SET order_number = 52 WHERE book_code = '1TH';
UPDATE canonical_books SET order_number = 53 WHERE book_code = '2TH';
UPDATE canonical_books SET order_number = 54 WHERE book_code = '1TI';
UPDATE canonical_books SET order_number = 55 WHERE book_code = '2TI';
UPDATE canonical_books SET order_number = 56 WHERE book_code = 'TIT';
UPDATE canonical_books SET order_number = 57 WHERE book_code = 'PHM';
UPDATE canonical_books SET order_number = 58 WHERE book_code = 'HEB';
UPDATE canonical_books SET order_number = 59 WHERE book_code = 'JAS';
UPDATE canonical_books SET order_number = 60 WHERE book_code = '1PE';
UPDATE canonical_books SET order_number = 61 WHERE book_code = '2PE';
UPDATE canonical_books SET order_number = 62 WHERE book_code = '1JN';
UPDATE canonical_books SET order_number = 63 WHERE book_code = '2JN';
UPDATE canonical_books SET order_number = 64 WHERE book_code = '3JN';
UPDATE canonical_books SET order_number = 65 WHERE book_code = 'JUD';
UPDATE canonical_books SET order_number = 66 WHERE book_code = 'REV';

-- Deuterocanonical/Apocryphal Books (67+)
-- Following Catholic/Orthodox ordering
UPDATE canonical_books SET order_number = 67 WHERE book_code = 'TOB';  -- Tobit
UPDATE canonical_books SET order_number = 68 WHERE book_code = 'JDT';  -- Judith
UPDATE canonical_books SET order_number = 69 WHERE book_code = 'ESG';  -- Additions to Esther
UPDATE canonical_books SET order_number = 70 WHERE book_code = 'WIS';  -- Wisdom of Solomon
UPDATE canonical_books SET order_number = 71 WHERE book_code = 'SIR';  -- Sirach (Ecclesiasticus)
UPDATE canonical_books SET order_number = 72 WHERE book_code = 'BAR';  -- Baruch
UPDATE canonical_books SET order_number = 73 WHERE book_code = 'LJE';  -- Letter of Jeremiah
UPDATE canonical_books SET order_number = 74 WHERE book_code = 'S3Y';  -- Prayer of Azariah and Song of the Three
UPDATE canonical_books SET order_number = 75 WHERE book_code = 'SUS';  -- Susanna
UPDATE canonical_books SET order_number = 76 WHERE book_code = 'BEL';  -- Bel and the Dragon
UPDATE canonical_books SET order_number = 77 WHERE book_code = '1MA';  -- 1 Maccabees
UPDATE canonical_books SET order_number = 78 WHERE book_code = '2MA';  -- 2 Maccabees
UPDATE canonical_books SET order_number = 79 WHERE book_code = '1ES';  -- 1 Esdras (3 Ezra)
UPDATE canonical_books SET order_number = 80 WHERE book_code = 'MAN';  -- Prayer of Manasseh
UPDATE canonical_books SET order_number = 81 WHERE book_code = 'PS2';  -- Psalm 151
UPDATE canonical_books SET order_number = 82 WHERE book_code = '3MA';  -- 3 Maccabees
UPDATE canonical_books SET order_number = 83 WHERE book_code = '2ES';  -- 2 Esdras (4 Ezra)
UPDATE canonical_books SET order_number = 84 WHERE book_code = '4MA';  -- 4 Maccabees

-- Ethiopian Orthodox additions
UPDATE canonical_books SET order_number = 85 WHERE book_code = 'ENO';  -- 1 Enoch
UPDATE canonical_books SET order_number = 86 WHERE book_code = 'JUB';  -- Jubilees
UPDATE canonical_books SET order_number = 87 WHERE book_code = 'MEQ';  -- Meqabyan

-- Step 3: Add index for performance
CREATE INDEX IF NOT EXISTS idx_canonical_books_order_number ON canonical_books(order_number);

-- Step 4: Verify the order
SELECT order_number, book_code, book_name, canonical_tier
FROM canonical_books
ORDER BY order_number
LIMIT 10;

-- Verification complete
SELECT
  'Migration complete. Added order_number column and populated with biblical book order.' as status,
  COUNT(*) as total_books,
  COUNT(order_number) as books_with_order
FROM canonical_books;
