import { formatColombianCurrency } from "../../helpers/currency"
import { formattedMediumDate } from "../../helpers/date"
import { Invoice } from "../../middleware/types"

export const mapInvoiceInfo = (invoice: Invoice) => {
    let total = 0
    return {
        customer_id: invoice.client.nit || "",
        customer_name: invoice.client.name || "",
        customer_phone: invoice.client.phone || "",
        customer_email: invoice.client.email || "",
        customer_website: invoice.client.website || "",
        id_factura: invoice.invoiceNumber,
        date_issued: formattedMediumDate(invoice.createdAt),
        items: invoice.items.map((item) => {
            const partialTotal = Number(item.quantity * item.unitPrice)
            total = total + partialTotal
            return ({
                item_description: item.description,
                item_quantity: item.quantity,
                item_price: formatColombianCurrency(item.unitPrice),
                item_amount: formatColombianCurrency(Number(item.quantity * item.unitPrice)),
                item_total: formatColombianCurrency(partialTotal)
            })
        }),
        total: formatColombianCurrency(total),
    }
}