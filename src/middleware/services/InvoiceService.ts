import supabase from "../database/SupabaseService"
import { keysToCamelCase } from "../helpers/toCamelCase";
import { Invoice, Payment } from "../types"

export class InvoiceService {
    private processAllInvoices = (invoices: Invoice[]) => {
        return invoices.map((invoice) => {
            // Calculate total from items
            let total: number = 0
            invoice.items.map((item) => {
                total = total + (item.quantity * item.unitPrice)
                return item
            })
            
            // Calculate total amount paid from payments
            let totalPaid: number = 0
            if (invoice.payments && invoice.payments.length > 0) {
                totalPaid = invoice.payments.reduce((sum, payment) => sum + Number(payment.amount), 0);
            }
            
            // Calculate remaining balance
            const balanceDue = total - totalPaid;
            
            return {
                ...invoice,
                total,
                totalPaid,
                balanceDue,
                paymentStatus: this.determinePaymentStatus(total, totalPaid)
            }
        })
    }
    
    // Helper method to determine payment status
    private determinePaymentStatus(total: number, paid: number): 'paid' | 'partial' | 'unpaid' {
        if (paid >= total) return 'paid';
        if (paid > 0) return 'partial';
        return 'unpaid';
    }

    public async getAllInvoices(): Promise<Invoice[]> {
        try {
            // First, fetch invoices with client and items
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
            
            const casedInvoices = keysToCamelCase(invoices) as Invoice[];
            
            // Now, fetch all payments in a separate query
            const { data: paymentsData, error: paymentsError } = await supabase
                .from('payments')
                .select('*');
                
            if (paymentsError) {
                console.error('Supabase error fetching payments:', paymentsError);
                throw paymentsError;
            }
            
            const casedPayments = keysToCamelCase(paymentsData) as Payment[];
            
            // Group payments by invoice ID
            const paymentsByInvoice: Record<number, Payment[]> = {};
            
            casedPayments.forEach(payment => {
                if (!paymentsByInvoice[payment.invoiceId]) {
                    paymentsByInvoice[payment.invoiceId] = [];
                }
                paymentsByInvoice[payment.invoiceId].push(payment);
            });
            
            // Add payments to their corresponding invoices
            casedInvoices.forEach(invoice => {
                invoice.payments = paymentsByInvoice[invoice.id] || [];
            });
            
            return this.processAllInvoices(casedInvoices);
        } catch (err) {
            console.log('Error fetching invoices', err);
            throw err;
        }
    }

    public async getInvoiceById(id: number): Promise<Invoice | null> {
        try {
            // Fetch invoice with client and items
            const { data: invoiceData, error } = await supabase
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
            
            const casedInvoice = keysToCamelCase(invoiceData) as Invoice;
            
            // Fetch payments for this specific invoice
            const { data: paymentsData, error: paymentsError } = await supabase
                .from('payments')
                .select('*')
                .eq('invoice_id', id);
                
            if (paymentsError) {
                console.error(`Error fetching payments for invoice ${id}:`, paymentsError);
                throw paymentsError;
            }
            
            // Add payments to the invoice
            casedInvoice.payments = keysToCamelCase(paymentsData) as Payment[];
            
            // Process the invoice to calculate totals
            const processedInvoice = this.processAllInvoices([casedInvoice])[0];
            
            return processedInvoice;
        } catch (error) {
            console.error(`Error fetching invoice ${id}:`, error);
            throw error;
        }
    }
}