import { useEffect, useState } from 'react';

import styles from './Invoices.module.css'
import Loader from '../../components/ui/loader/Loader';
import { Invoice } from '../../middleware/types';
import { InvoiceService } from '../../middleware/services/InvoiceService';
import { formattedDate } from '../../helpers/date';
import { formatColombianCurrency } from '../../helpers/currency';
import { generateDocument } from '../../helpers/generateDoc';
import { mapInvoiceInfo } from './helper';

const invoiceService = new InvoiceService();

function Invoices() {
  
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [selectedInvoice, setSelectedInvoice] = useState<number>(-1);
  const [loading, setLoading] = useState<boolean>(true);

  const currentInvoice = invoices?.[selectedInvoice]

  const handleSelect = (invoiceId: number) => {
    setSelectedInvoice(invoiceId)
  }

  const handleGenerateDocx = () => {
    const mappedFileData = mapInvoiceInfo(invoices[selectedInvoice])
    generateDocument(mappedFileData, 'invoice_mirko.docx', `factura_/${invoices[selectedInvoice].id}_${invoices[selectedInvoice].createdAt}.docx`)
  }

  useEffect(() => {
      const fetchInvoices = async () => {
          try {
              const data = await invoiceService.getAllInvoices();
              setInvoices(data);
          } catch (error) {
              console.error('Failed to fetch invoices:', error);
          } finally {
            setLoading(false);
        }
      };
      fetchInvoices();
  }, []);

    if (loading) {
        return <Loader />; // Show loader while data is being fetched
    }

  return (
    <div className={styles.container}>
        <h1 className={styles.title}>Invoices</h1>
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
            <div className={styles.invoiceDetails}>
                <div className={styles.invoiceHeader}>
                    <div>
                        <h2>Invoice Details: #{currentInvoice.invoiceNumber}</h2>
                        <p>Date Issued: <i>{formattedDate(currentInvoice.createdAt)}</i></p>
                        <p>Total: <strong>{formatColombianCurrency(currentInvoice.total)}</strong></p>
                    </div>
                    <div className={styles.buttonGroup}>
                        <button 
                            className={styles.generateButton}
                            onClick={handleGenerateDocx}
                        >
                            Generate Invoice
                        </button>
                    </div>
                    
                </div>
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

export default Invoices;