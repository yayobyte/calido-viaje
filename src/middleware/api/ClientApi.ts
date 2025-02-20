import { ClientService } from "../services/ClientService";

export abstract class ClientsApi {
    static async getAllClients () {
        const clientService = new ClientService()
        return await clientService.getAllClients()
    }
}