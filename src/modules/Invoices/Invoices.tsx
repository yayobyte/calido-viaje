import { useEffect, useState } from 'react';
import styles from './Invoices.module.css'
import Loader from '../../components/ui/loader/Loader';
import { Invoice } from '../../middleware/types';
import { InvoiceService } from '../../middleware/services/InvoiceService';
import { formattedDate } from '../../helpers/date';
import { formatColombianCurrency } from '../../helpers/currency';
import { generateDocument } from '../../helpers/generateDoc';
import { mapInvoiceInfo } from './helper';
import Table from '../../components/ui/Table/Table';
import Button from '../../components/ui/Button/Button';

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
    generateDocument(mappedFileData, 'invoice_mirko.docx', `factura_${invoices[selectedInvoice].id}_${invoices[selectedInvoice].client.name}.docx`)
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

  // Define table columns
  const columns = [
    {
      header: 'Invoice #',
      key: 'invoiceNumber',
      mobilePriority: 1
    },
    {
      header: 'Date Issued',
      key: 'createdAt',
      render: (item: Invoice) => formattedDate(item.createdAt),
      mobilePriority: 2
    },
    {
      header: 'Client',
      key: 'client',
      render: (item: Invoice) => item.client.name, // Always use render for objects
      mobilePriority: 0,
      mobileRender: (item: Invoice) => item.client.name // Also add mobileRender
    },
    {
      header: 'Actions',
      key: 'actions',
      render: (item: Invoice) => (
        <Button
          variant="primary"
          size="small"
          onClick={() => handleSelect(invoices.indexOf(item))}
        >
          Select Invoice
        </Button>
      ),
      mobilePriority: 999 // Don't show in mobile content
    }
  ];

  // Define item detail table columns (if an invoice is selected)
  const itemColumns = currentInvoice ? [
    {
      header: 'Description',
      key: 'description',
      mobilePriority: 0
    },
    {
      header: 'Quantity',
      key: 'quantity',
      mobilePriority: 1
    },
    {
      header: 'Unit Price',
      key: 'unitPrice',
      render: (item: any) => formatColombianCurrency(item.unitPrice),
      mobilePriority: 2
    },
    {
      header: 'Total',
      key: 'total',
      render: (item: any) => formatColombianCurrency((item.quantity * item.unitPrice)),
      mobilePriority: 3
    }
  ] : [];

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Invoices</h1>
      
      <Table
        data={invoices}
        columns={columns}
        keyExtractor={(item) => item.id.toString()}
        emptyMessage="No invoices found"
        cardTitleKey="invoiceNumber"
        cardSubtitleKey=""
        cardActions={(item) => (
          <>
            <div className={styles.cardClientInfo}>Client: {item.client.name}</div>
            <Button
              variant="primary"
              size="medium"
              fullWidth={true}
              onClick={() => handleSelect(invoices.indexOf(item))}
            >
              Select Invoice
            </Button>
          </>
        )}
      />

      {currentInvoice && (
        <div className={styles.invoiceDetails}>
          <div className={styles.invoiceHeader}>
            <div>
              <h2>Invoice: #{currentInvoice.invoiceNumber}</h2>
              <p><i>{formattedDate(currentInvoice.createdAt)}</i></p>
              <div>
                <h3>{formatColombianCurrency(currentInvoice.total)}</h3>  
              </div>
            </div>
            <div className={styles.buttonGroup}>
              <Button 
                variant="secondary"
                size="medium"
                onClick={handleGenerateDocx}
                className={styles.generateButton}
              >
                Generate Invoice
              </Button>
            </div>
          </div>
          
          <Table
            data={currentInvoice.items}
            columns={itemColumns}
            keyExtractor={(item) => item.id.toString()}
            emptyMessage="No items in this invoice"
          />
          
          <div className={styles.invoiceTotal}>
            <strong>Total: {formatColombianCurrency(currentInvoice.total)}</strong>
          </div>
        </div>
      )}
    </div>
  );
}

export default Invoices;