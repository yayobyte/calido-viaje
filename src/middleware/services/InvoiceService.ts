import supabase from "../database/SupabaseService"
import { Invoice, Client } from "../types"

export class InvoiceService {
    private baseUrl: string
    constructor(baseUrl: string) {
        this.baseUrl = baseUrl
    }

    public async getAllInvoices(): Promise<Client[]> {
        try {
            const { data: clients, error } = await supabase
                .from('clients')
                .select('*')
                .order('id', { ascending: true });
            console.log(clients)
            if (error) {
                console.error('Supabase error:', error);
                throw error;
            }
            return clients as Client[]
        } catch (err) {
            console.log('Error fetching invoices', err)
            throw err
        }
    }

    public async getInvoiceById(id: number) {
        try {
            const invoices = await this.getAllInvoices();
            return invoices.find(invoice => invoice.id === id) || null;
        } catch (error) {
            console.error(`Error fetching invoice ${id}:`, error);
            throw error;
        }
    }

    public async saveInvoice(invoice: Invoice) {
        try {
            const response = await fetch(`${this.baseUrl}/data.json`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(invoice)
            });
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
        } catch (error) {
            console.error('Error saving invoice:', error);
            throw error;
        }
    }
}