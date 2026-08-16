/**
 * URL normalization and display formatting helpers for external websites and social media profiles.
 */

export function normalizeExternalUrl(
  input: string | undefined | null,
  type: 'website' | 'instagram' | 'facebook' | 'tiktok' = 'website'
): string {
  if (!input) return '';
  const trimmed = input.trim();
  if (!trimmed) return '';

  // Already a full URL with scheme
  if (/^https?:\/\//i.test(trimmed)) {
    return trimmed;
  }

  // Handle leading protocol-relative //
  if (trimmed.startsWith('//')) {
    return `https:${trimmed}`;
  }

  if (type === 'website') {
    return `https://${trimmed}`;
  }

  if (type === 'instagram') {
    if (/^(?:www\.)?instagram\.com\//i.test(trimmed)) {
      return `https://${trimmed}`;
    }
    const cleanHandle = trimmed.replace(/^@/, '').trim();
    return `https://instagram.com/${cleanHandle}`;
  }

  if (type === 'facebook') {
    if (/^(?:www\.)?(?:facebook\.com|fb\.com)\//i.test(trimmed)) {
      return `https://${trimmed}`;
    }
    const cleanHandle = trimmed.replace(/^@/, '').trim();
    return `https://facebook.com/${cleanHandle}`;
  }

  if (type === 'tiktok') {
    if (/^(?:www\.)?tiktok\.com\//i.test(trimmed)) {
      return `https://${trimmed}`;
    }
    const cleanHandle = trimmed.replace(/^@/, '').trim();
    return `https://tiktok.com/@${cleanHandle}`;
  }

  return `https://${trimmed}`;
}

export function formatSocialDisplayLabel(
  input: string | undefined | null,
  type: 'website' | 'instagram' | 'facebook' | 'tiktok'
): string {
  if (!input) return '';
  const trimmed = input.trim();
  if (!trimmed) return '';

  if (type === 'website') {
    return trimmed
      .replace(/^https?:\/\//i, '')
      .replace(/^www\./i, '')
      .replace(/\/+$/, '');
  }

  if (type === 'instagram') {
    const match = trimmed.match(/(?:instagram\.com\/)?@?([a-zA-Z0-9._]+)/i);
    const handle = match && match[1] ? match[1].replace(/\/.*$/, '') : trimmed.replace(/^@/, '');
    return `@${handle}`;
  }

  if (type === 'facebook') {
    const match = trimmed.match(/(?:facebook\.com|fb\.com)\/@?([a-zA-Z0-9._-]+)/i);
    if (match && match[1]) {
      return match[1].replace(/\/.*$/, '');
    }
    return trimmed.replace(/^https?:\/\/(?:www\.)?(?:facebook\.com|fb\.com)\/?/i, '') || 'Facebook Page';
  }

  if (type === 'tiktok') {
    const match = trimmed.match(/(?:tiktok\.com\/@?)([a-zA-Z0-9._]+)/i);
    const handle = match && match[1] ? match[1].replace(/\/.*$/, '') : trimmed.replace(/^@/, '');
    return `@${handle}`;
  }

  return trimmed;
}
