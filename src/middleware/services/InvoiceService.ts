import supabase from "../database/SupabaseService"
import { keysToCamelCase } from "../helpers/toCamelCase";
import { Invoice, InvoiceItem, Client } from "../types"

export class InvoiceService {
    public async getAllInvoices(): Promise<Invoice[]> {
        try {
            const { data: invoices, error } = await supabase
                .from('invoices')
                .select(`
                    *,
                    client:clients(*),
                    items:invoice_items(*)
                `)
                .order('id', { ascending: true });
            if (error) {
                console.error('Supabase error:', error);
                throw error;
            }
            return keysToCamelCase(invoices) as Invoice[];
        } catch (err) {
            console.log('Error fetching invoices', err);
            throw err;
        }
    }

    public async getInvoiceById(id: number): Promise<{ invoice: Invoice, client: Client, items: InvoiceItem[] } | null> {
        try {
            const { data: invoice, error } = await supabase
                .from('invoices')
                .select(`
                    *,
                    client:clients(*),
                    items:invoice_items(*)
                `)
                .eq('id', id)
                .single();
            if (error) {
                console.error(`Error fetching invoice ${id}:`, error);
                throw error;
            }
            return invoice as { invoice: Invoice, client: Client, items: InvoiceItem[] };
        } catch (error) {
            console.error(`Error fetching invoice ${id}:`, error);
            throw error;
        }
    }
}