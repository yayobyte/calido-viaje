import { useEffect, useState } from 'react';
import PizZip from 'pizzip';
import PizZipUtils from 'pizzip/utils/index.js';
import Docxtemplater from 'docxtemplater';
import expressionParser from 'docxtemplater/expressions';
import { saveAs } from 'file-saver';

import styles from './InvoiceGenerator.module.css'
import { Invoice } from '../middleware/types';

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


function InvoiceGenerator() {
  
  const [invoiceData, setInvoiceData] = useState<Invoice[] | null>(null);
  const [selectedInvoice] = useState<number>(0)

  useEffect(() => {
    fetch('/data.json')
      .then((res) => res.json())
      .then((data) => setInvoiceData(data));
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
          doc.render(mapInvoiceInfo(invoiceData?.[selectedInvoice] || {
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
          saveAs(out, `factura_${invoiceData?.[selectedInvoice]['invoiceNumber']}`);
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
          <th>Select</th>
        </tr>
      </thead>
      <tbody>
        {invoiceData?.map((inv) => (
          <tr key={inv.id}>
            <td>{inv.invoiceNumber}</td>
            <td>{new Date(inv.dateIssued).toLocaleDateString()}</td>
            <td>{inv.client.name}</td>
            <td>
            <div className={styles.buttonGroup}>
                <button 
                    className={styles.generateButton}
                    onClick={() => generateDocument()}
                >
                    Generate Word
                </button>
                </div>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
  );
}

export default InvoiceGenerator;