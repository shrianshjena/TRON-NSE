const TICKER_PATTERN = /^[A-Z0-9&.\-]+$/;
const MAX_TICKER_LENGTH = 20;

/**
 * Sanitize and validate an NSE ticker symbol.
 *
 * - Trims whitespace
 * - Converts to uppercase
 * - Validates against allowed characters (A-Z, 0-9, &, ., -)
 * - Enforces max length of 20 characters
 *
 * @returns Sanitized ticker string
 * @throws Error if ticker is invalid
 */
export function sanitizeTicker(input: string): string {
  if (!input || typeof input !== 'string') {
    throw new Error('Ticker symbol is required');
  }

  const sanitized = input.trim().toUpperCase();

  if (sanitized.length === 0) {
    throw new Error('Ticker symbol cannot be empty');
  }

  if (sanitized.length > MAX_TICKER_LENGTH) {
    throw new Error(
      `Ticker symbol exceeds maximum length of ${MAX_TICKER_LENGTH} characters`
    );
  }

  if (!TICKER_PATTERN.test(sanitized)) {
    throw new Error(
      `Invalid ticker symbol "${sanitized}". Only A-Z, 0-9, &, ., and - are allowed.`
    );
  }

  return sanitized;
}

/**
 * Check if a string is a valid ticker symbol without throwing.
 */
export function isValidTicker(input: string): boolean {
  try {
    sanitizeTicker(input);
    return true;
  } catch {
    return false;
  }
}
