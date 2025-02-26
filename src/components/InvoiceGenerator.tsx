import { useEffect, useState } from 'react';
import PizZip from 'pizzip';
import PizZipUtils from 'pizzip/utils/index.js';
import Docxtemplater from 'docxtemplater';
import expressionParser from 'docxtemplater/expressions';
import { saveAs } from 'file-saver';

import styles from './InvoiceGenerator.module.css'
import { Invoice } from '../middleware/types';
import { InvoiceService } from '../middleware/services/InvoiceService';

const mapInvoiceInfo = (invoice: Invoice): any => {
    return {
        customer_name: invoice.client.name,
        customer_phone: invoice.client.phone,
        customer_email: invoice.client.email,
        customer_website: invoice.client.website,
        id_factura: invoice.invoiceNumber,
        date_issued: new Date(invoice.dateIssued).toLocaleString(),
        items: invoice.items.map((item) => ({
            item_description: item.description,
            item_quantity: item.quantity.toLocaleString(),
            item_price: item.unitPrice.toLocaleString(),
            item_amount: item.total.toLocaleString(),
        })),
        total: invoice.total.toLocaleString()
    }
}

const invoiceService = new InvoiceService();

function InvoiceGenerator() {
  
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [selectedInvoice, setSelectedInvoice] = useState<number>(0);
  const [invoiceDetails, setInvoiceDetails] = useState<{ invoice: Invoice, items: InvoiceItem[] } | null>(null);

  useEffect(() => {
      const fetchInvoices = async () => {
          try {
              const data = await invoiceService.getAllInvoices();
              setInvoices(data);
              console.log(data)
          } catch (error) {
              console.error('Failed to fetch invoices:', error);
          }
      };
      fetchInvoices();
  }, []);

  const handleSelectInvoice = async (id: number) => {
      try {
          const details = await invoiceService.getInvoiceWithItems(id);
          setInvoiceDetails(details);
          setSelectedInvoice(id);
      } catch (error) {
          console.error(`Failed to fetch invoice ${id}:`, error);
      }
  };

  const loadFile = async (url: string, callback: (error: unknown, content: unknown) => void) => {
    PizZipUtils.getBinaryContent(url, callback);
  };

  const generateDocument = () => {
    loadFile(
        './invoice_mirko.docx',
        function (error, content) {
          if (error) {
            throw error;
          }
          const zip = new PizZip(content as string | ArrayBuffer | Uint8Array);
          const doc = new Docxtemplater(zip, {
            paragraphLoop: true,
            linebreaks: true,
            parser: expressionParser,
          });
          doc.render(mapInvoiceInfo(invoices?.[selectedInvoice] || {
            id: 0,
            invoiceNumber: '',
            client: { name: '', phone: '', email: '', website: '' },
            dateIssued: new Date().toISOString(),
            items: [],
            total: 0
          }));
          
          const out = doc.getZip().generate({
            type: 'blob',
            mimeType:
              'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
          });
          saveAs(out, `factura_${invoices?.[selectedInvoice]['invoiceNumber']}`);
        }
      );
  };

  return (
    <div className={styles.container}>
        <h1 className={styles.title}>Invoice Generator</h1>
        <table className={styles.table}>
            <thead>
                <tr>
                    <th>Invoice #</th>
                    <th>Date Issued</th>
                    <th>Client</th>
                    <th>Actions</th>
                </tr>
            </thead>
            <tbody>
                {invoices.map((inv) => (
                    <tr key={inv.id}>
                        <td>{inv.invoiceNumber}</td>
                        <td>{new Date(inv.createdAt).toLocaleDateString('es-CO', {
                                weekday: "long",
                                year: "numeric",
                                month: "long",
                                day: "numeric",
                            })}
                        </td>
                        <td>{inv.client.name}</td>
                        <td>
                            <button onClick={() => handleSelectInvoice(inv.id)}>Select</button>
                        
                            <button onClick={() => generateDocument(inv.id)}>Generate Word</button>
                        </td>
                    </tr>
                ))}
            </tbody>
        </table>
        {invoiceDetails && (
            <div>
                <h2>Invoice Details</h2>
                <p>Invoice Number: {invoiceDetails.invoice.invoiceNumber}</p>
                <p>Date Issued: {new Date(invoiceDetails.invoice.dateIssued).toLocaleDateString()}</p>
                <p>Total: {invoiceDetails.invoice.total}</p>
                <h3>Items</h3>
                <ul>
                    {invoiceDetails.items.map(item => (
                        <li key={item.id}>
                            {item.description} - {item.quantity} x {item.unitPrice} = {item.total}
                        </li>
                    ))}
                </ul>
            </div>
        )}
    </div>
);
}

export default InvoiceGenerator;