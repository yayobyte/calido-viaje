import supabase from "../database/SupabaseService"
import { Client } from "../types"

export class ClientService {
    public async getAllClients(): Promise<Client[]> {
        try {
            const { data: clients, error } = await supabase
                .from('clients')
                .select('*')
                .order('id', { ascending: true });
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

    public async getClientsById(id: number) {
        try {
            const clients = await this.getAllClients();
            return clients.find(client => client.id === id) || null;
        } catch (error) {
            console.error(`Error fetching invoice ${id}:`, error);
            throw error;
        }
    }
}