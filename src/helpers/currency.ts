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