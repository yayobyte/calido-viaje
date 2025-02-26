import { useEffect, useState } from 'react';
import PizZip from 'pizzip';
import PizZipUtils from 'pizzip/utils/index.js';
import Docxtemplater from 'docxtemplater';
import expressionParser from 'docxtemplater/expressions';
import { saveAs } from 'file-saver';
import styles from './InvoiceGenerator.module.css'

import { Invoice, InvoiceItem } from '../middleware/types';
import { InvoiceService } from '../middleware/services/InvoiceService';
import { formattedDate } from '../helpers/Date';
import { formatColombianCurrency } from '../helpers/currency';

const invoiceService = new InvoiceService();

const mapInvoiceInfo = (invoice: Invoice) => {
    let total = 0
    return {
        customer_name: invoice.client.name,
        customer_phone: invoice.client.phone,
        customer_email: invoice.client.email,
        customer_website: invoice.client.website,
        id_factura: invoice.invoiceNumber,
        date_issued: new Date(invoice.createdAt).toLocaleString(),
        items: invoice.items.map((item) => {
            const partialTotal = Number(item.quantity * item.unitPrice)
            total = total + partialTotal
            return ({
                item_description: item.description,
                item_quantity: item.quantity.toLocaleString(),
                item_price: item.unitPrice.toLocaleString(),
                item_amount: Number(item.quantity * item.unitPrice),
                item_total: partialTotal
            })
        }),
        total,
    }
}

function InvoiceGenerator() {
  
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [selectedInvoice, setSelectedInvoice] = useState<number>(0);

  const currentInvoice = invoices?.[selectedInvoice]

  const handleSelect = (invoiceId: number) => {
    setSelectedInvoice(invoiceId)
  }

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
                {invoices.map((inv, index) => (
                    <tr key={inv.id}>
                        <td>{inv.invoiceNumber}</td>
                        <td>{formattedDate(inv.createdAt)}
                        </td>
                        <td>{inv.client.name}</td>
                        <td>
                            <button onClick={() => handleSelect(index)}>Select Invoice</button>
                        </td>
                    </tr>
                ))}
            </tbody>
        </table>
        {currentInvoice && (
            <div>
                <hr />
                <h2>Invoice Details</h2>
                <p>Invoice Number: {currentInvoice.invoiceNumber}</p>
                <p>Date Issued: {formattedDate(currentInvoice.createdAt)}</p>
                <p>Total: </p>
                <h3>Items</h3>
                <table className={styles.table}>
                    <thead>
                        <tr>
                            <th>Description</th>
                            <th>Quantity</th>
                            <th>Unit Price</th>
                            <th>Total</th>
                        </tr>
                    </thead>
                    <tbody>
                        {currentInvoice.items.map(item =>  (
                                <tr key={item.id}>
                                    <td>{item.description}</td>
                                    <td>{item.quantity}</td>
                                    <td>{formatColombianCurrency(item.unitPrice)}</td>
                                    <td>{formatColombianCurrency((item.quantity * item.unitPrice))}</td>
                                </tr>
                            )
                        )}
                        <tr>
                            <td colSpan={3} style={{textAlign: 'right'}}><strong>Total:</strong></td>
                            <td><strong>{formatColombianCurrency(currentInvoice.total)}</strong></td>
                        </tr>
                    </tbody>
                </table>
            </div>
        )}
    </div>
);
}

export default InvoiceGenerator;