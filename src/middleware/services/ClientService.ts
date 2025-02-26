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
            console.log('Error fetching clients', err)
            throw err
        }
    }

    public async getClientById(id: number): Promise<Client | null> {
        try {
            const { data: client, error } = await supabase
                .from('clients')
                .select('*')
                .eq('id', id)
                .single();
            if (error) {
                console.error(`Error fetching client ${id}:`, error);
                throw error;
            }
            return client as Client;
        } catch (error) {
            console.error(`Error fetching client ${id}:`, error);
            throw error;
        }
    }
}