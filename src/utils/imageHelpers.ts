const DEFAULT_PRODUCT_IMAGE =
  'https://images.pexels.com/photos/1350789/pexels-photo-1350789.jpeg?auto=compress&cs=tinysrgb&w=1600';

export function normalizeImageUrl(url?: string | null, fallback: string = DEFAULT_PRODUCT_IMAGE) {
  if (!url) return fallback;

  const trimmed = url.trim();
  if (!trimmed) {
    return fallback;
  }

  const hasQuery = trimmed.includes('?');

  if (/^https?:/i.test(trimmed)) {
    if (trimmed.includes('images.pexels.com') && !hasQuery) {
      return `${trimmed}?auto=compress&cs=tinysrgb&w=1600`;
    }
    return trimmed;
  }

  if (trimmed.startsWith('/')) {
    const baseUrl = import.meta.env.VITE_SUPABASE_URL;
    if (baseUrl) {
      return `${baseUrl}${trimmed}`;
    }
  }

  return trimmed;
}

export { DEFAULT_PRODUCT_IMAGE };
