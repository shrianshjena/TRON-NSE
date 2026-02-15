const inrFormatter = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const numberFormatter = new Intl.NumberFormat('en-IN', {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const percentFormatter = new Intl.NumberFormat('en-IN', {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
  signDisplay: 'always',
});

/**
 * Format a number as INR currency (e.g., "Rs.1,23,456.78").
 */
export function formatINR(num: number | null | undefined): string {
  if (num == null || isNaN(num)) return '--';
  return inrFormatter.format(num);
}

/**
 * Format a number with Indian locale grouping (e.g., "1,23,456.78").
 */
export function formatNumber(num: number | null | undefined): string {
  if (num == null || isNaN(num)) return '--';
  return numberFormatter.format(num);
}

/**
 * Format a number as a percentage with sign (e.g., "+12.34%").
 */
export function formatPercent(num: number | null | undefined): string {
  if (num == null || isNaN(num)) return '--';
  return `${percentFormatter.format(num)}%`;
}

/**
 * Format large numbers as market cap display.
 * Uses Cr (crore) and L Cr (lakh crore) notation.
 */
export function formatMarketCap(num: number | null | undefined): string {
  if (num == null || isNaN(num)) return '--';

  const abs = Math.abs(num);
  const sign = num < 0 ? '-' : '';

  if (abs >= 1e12) {
    // Lakh crore
    return `${sign}${(abs / 1e12).toFixed(2)} L Cr`;
  }
  if (abs >= 1e7) {
    // Crore
    return `${sign}${(abs / 1e7).toFixed(2)} Cr`;
  }
  if (abs >= 1e5) {
    // Lakh
    return `${sign}${(abs / 1e5).toFixed(2)} L`;
  }
  return formatINR(num);
}

/**
 * Format volume with abbreviated suffixes (K, L, Cr).
 */
export function formatVolume(num: number | null | undefined): string {
  if (num == null || isNaN(num)) return '--';

  const abs = Math.abs(num);
  const sign = num < 0 ? '-' : '';

  if (abs >= 1e7) {
    return `${sign}${(abs / 1e7).toFixed(2)} Cr`;
  }
  if (abs >= 1e5) {
    return `${sign}${(abs / 1e5).toFixed(2)} L`;
  }
  if (abs >= 1e3) {
    return `${sign}${(abs / 1e3).toFixed(2)} K`;
  }
  return `${sign}${abs}`;
}

/**
 * Format a date string or Date object to "DD MMM YYYY" format.
 */
export function formatDate(date: string | Date | null | undefined): string {
  if (!date) return '--';
  const d = typeof date === 'string' ? new Date(date) : date;
  if (isNaN(d.getTime())) return '--';

  return d.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

/**
 * Format a date string or Date object to "DD MMM YYYY, HH:mm" format.
 */
export function formatTimestamp(date: string | Date | null | undefined): string {
  if (!date) return '--';
  const d = typeof date === 'string' ? new Date(date) : date;
  if (isNaN(d.getTime())) return '--';

  return d.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });
}
