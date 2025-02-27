export const formattedDate = (date: string) => {
    return new Date(date).toLocaleDateString('es-CO', {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
    })
}

/**
 * Formats a date as DD/MM/YYYY in Colombian Spanish format
 * @param date - The date to format
 * @returns Formatted date string (e.g., "26/02/2025")
 */
export const formattedShortDate = (date: Date | string) => {
    const dateObj = date instanceof Date ? date : new Date(date);
    
    return dateObj.toLocaleDateString('es-CO', {
        day: "2-digit",
        month: "2-digit",
        year: "numeric"
    });
}

/**
 * Formats a date as DD MMM YYYY in Colombian Spanish format
 * @param date - The date to format
 * @returns Formatted date string (e.g., "26 feb. 2025") 
 */
export const formattedMediumDate = (date: Date | string) => {
    const dateObj = date instanceof Date ? date : new Date(date);
    
    return dateObj.toLocaleDateString('es-CO', {
        day: "2-digit",
        month: "short",
        year: "numeric"
    });
}