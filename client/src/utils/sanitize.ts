/**
 * Input sanitization utilities for XSS protection
 */

/**
 * Sanitize HTML string to prevent XSS attacks
 */
export function sanitizeHTML(input: string): string {
  if (!input) return '';

  const map: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#x27;',
    '/': '&#x2F;',
  };

  return input.replace(/[&<>"'/]/g, (char) => map[char] || char);
}

/**
 * Sanitize string for use in URLs
 */
export function sanitizeURL(url: string): string {
  if (!url) return '';

  try {
    const parsed = new URL(url);

    if (!['http:', 'https:'].includes(parsed.protocol)) {
      return '';
    }

    return parsed.toString();
  } catch {
    return '';
  }
}

/**
 * Sanitize user input text
 */
export function sanitizeText(input: string): string {
  if (!input) return '';

  return input
    .trim()
    .replace(/[<>]/g, '')
    .slice(0, 10000);
}

/**
 * Validate email format
 */
export function isValidEmail(email: string): boolean {
  if (!email) return false;

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email) && email.length <= 320;
}

/**
 * Sanitize filename to prevent directory traversal
 */
export function sanitizeFilename(filename: string): string {
  if (!filename) return '';

  return filename
    .replace(/[^a-zA-Z0-9._-]/g, '_')
    .replace(/^\.+/, '')
    .replace(/\.{2,}/g, '.')
    .slice(0, 255);
}

/**
 * Validate and sanitize file upload
 */
export function validateFileUpload(file: File, maxSizeMB: number = 10, allowedTypes: string[] = []): { valid: boolean; error?: string } {
  if (!file) {
    return { valid: false, error: 'No file provided' };
  }

  if (file.size > maxSizeMB * 1024 * 1024) {
    return { valid: false, error: `File size exceeds ${maxSizeMB}MB limit` };
  }

  if (allowedTypes.length > 0 && !allowedTypes.includes(file.type)) {
    return { valid: false, error: 'File type not allowed' };
  }

  const safeName = sanitizeFilename(file.name);
  if (!safeName) {
    return { valid: false, error: 'Invalid filename' };
  }

  return { valid: true };
}
