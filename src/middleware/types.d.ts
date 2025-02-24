export interface Client {
    id?: number
    name: string,
    phone: string,
    email: string,
    website: string,
}

export interface Item {
    description: string,
    quantity: number,
    unitPrice: number,
    total: number
}

export interface Invoice {
    id: number
    invoiceNumber: string
    client: Client,
    dateIssued: string,
    items: Array<Item>
    total: number
}