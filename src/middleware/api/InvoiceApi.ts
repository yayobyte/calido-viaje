import { InvoiceService } from "../services/InvoiceService";

export abstract class InvoiceApi {
    static async getAllInvoices () {
        const invoiceService = new InvoiceService('')
        const invoices = await invoiceService.getAllInvoices()
    }
}