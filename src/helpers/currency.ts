/**
 * Formats a number as Colombian currency without decimals.
 * @param amount - The amount to format.
 * @returns The formatted currency string.
 */
export const formatColombianCurrency = (amount: number): string => {
    return amount.toLocaleString('es-CO', {
        style: 'currency',
        currency: 'COP',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    });
};

export const formatCurrency = (amount: number, currency: string = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
    }).format(amount);
  };