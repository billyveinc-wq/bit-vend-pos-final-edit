export const getAppCurrency = (): string => {
  try {
    const saved = localStorage.getItem('pos-app-settings');
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed && typeof parsed.currency === 'string') return parsed.currency;
    }
  } catch {}
  return 'USD';
};

export const formatCurrency = (amount: number, currency?: string, locale?: string) => {
  const code = currency || getAppCurrency();
  try {
    return new Intl.NumberFormat(locale || undefined, { style: 'currency', currency: code, maximumFractionDigits: 2 }).format(amount);
  } catch {
    // Fallback: simple prefix with code
    return `${code} ${amount.toFixed(2)}`;
  }
};
