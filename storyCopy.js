/* V39.7: shared on-screen copy. Kept separate from saved Firestore state. */
export const ASYA_QUOTE = '“From which stars have we fallen\nto meet each other here?”\n– F. Nietzche';
export const ASYA_QUOTE_SINGLE_LINE = '“From which stars have we fallen to meet each other here?” – F. Nietzche';

/** Legacy display-only migration. Never rewrites a user's Firebase data. */
export function displayedAsyaText(text, characterId) {
  const raw = String(text ?? '');
  if (characterId !== 'Asya') return raw;
  return /^\s*print\s*\(\s*(['"])hello\s*world\1\s*\)\s*;?\s*$/i.test(raw)
    ? ASYA_QUOTE
    : raw;
}
