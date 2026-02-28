// Maps legacy Ionicons names (stored before emoji migration) to emojis
const ICON_NAME_MAP: Record<string, string> = {
  sunny: '☀️',
  laptop: '💻',
  water: '💧',
  book: '📚',
  moon: '🌙',
  fitness: '🏋️',
  walk: '🚶',
  run: '🏃',
  bicycle: '🚴',
  nutrition: '🥗',
  medkit: '💊',
  heart: '❤️',
  happy: '😊',
  star: '⭐',
  flame: '🔥',
  trophy: '🏆',
  brush: '🎨',
  musical: '🎵',
  leaf: '🌿',
  bed: '😴',
  brain: '🧠',
  timer: '⏱️',
  pencil: '✏️',
  journal: '📓',
  yoga: '🧘',
  target: '🎯',
};

/**
 * Resolves a habit icon field to an emoji string.
 * - If the value is already an emoji (non-ASCII), returns it as-is.
 * - If it matches a legacy Ionicons name, returns the mapped emoji.
 * - Otherwise returns the fallback '✨'.
 */
export function resolveIcon(icon?: string | null): string {
  if (!icon) return '✨';
  if (/[^\u0000-\u007F]/.test(icon)) return icon;
  return ICON_NAME_MAP[icon] ?? '✨';
}
