export const formattedDate = (date: string) => {
    return new Date(date).toLocaleDateString('es-CO', {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
    })
}