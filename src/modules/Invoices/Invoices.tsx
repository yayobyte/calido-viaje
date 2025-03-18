import { useEffect, useState } from 'react';
import styles from './Invoices.module.css'
import Loader from '../../components/ui/loader/Loader';
import { Invoice, Payment } from '../../middleware/types';
import { InvoiceService } from '../../middleware/services/InvoiceService';
import { formattedDate } from '../../helpers/date';
import { formatColombianCurrency } from '../../helpers/currency';
import { generateDocument } from '../../helpers/generateDoc';
import { mapInvoiceInfo } from './helper';
import Table from '../../components/ui/table/Table';
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
      render: (item: Invoice) => item.client.name,
      mobilePriority: 0,
      mobileRender: (item: Invoice) => item.client.name
    },
    {
      header: 'Total',
      key: 'total',
      render: (item: Invoice) => formatColombianCurrency(item.total || 0),
      mobilePriority: 3
    },
    {
      header: 'Status',
      key: 'paymentStatus',
      render: (item: Invoice) => (
        <span className={`${styles.paymentStatus} ${styles[item.paymentStatus || 'unpaid']}`}>
          {item.paymentStatus === 'paid' ? 'Paid' : 
           item.paymentStatus === 'partial' ? 'Partial' : 'Unpaid'}
        </span>
      ),
      mobilePriority: 4
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
  
  // Define payment detail table columns
  const paymentColumns = currentInvoice ? [
    {
      header: 'Payment Date',
      key: 'paymentDate',
      render: (item: Payment) => formattedDate(item.paymentDate),
      mobilePriority: 0
    },
    {
      header: 'Amount',
      key: 'amount',
      render: (item: Payment) => formatColombianCurrency(Number(item.amount)),
      mobilePriority: 1
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
            <div className={styles.cardPaymentInfo}>
              <span className={`${styles.paymentStatus} ${styles[item.paymentStatus || 'unpaid']}`}>
                {item.paymentStatus === 'paid' ? 'Paid' : 
                 item.paymentStatus === 'partial' ? 'Partial' : 'Unpaid'}
              </span>
              <span>{formatColombianCurrency(item.total || 0)}</span>
            </div>
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
              <div className={styles.paymentSummary}>
                <div className={styles.paymentSummaryItem}>
                  <span>Total:</span> 
                  <strong>{formatColombianCurrency(currentInvoice.total || 0)}</strong>
                </div>
                <div className={styles.paymentSummaryItem}>
                  <span>Paid:</span> 
                  <strong>{formatColombianCurrency(currentInvoice.totalPaid || 0)}</strong>
                </div>
                <div className={styles.paymentSummaryItem}>
                  <span>Balance:</span> 
                  <strong>{formatColombianCurrency(currentInvoice.balanceDue || 0)}</strong>
                </div>
                <div className={styles.paymentSummaryItem}>
                  <span>Status:</span> 
                  <span className={`${styles.paymentStatus} ${styles[currentInvoice.paymentStatus || 'unpaid']}`}>
                    {currentInvoice.paymentStatus === 'paid' ? 'Paid' : 
                     currentInvoice.paymentStatus === 'partial' ? 'Partial' : 'Unpaid'}
                  </span>
                </div>
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
          
          <h3>Items</h3>
          <Table
            data={currentInvoice.items}
            columns={itemColumns}
            keyExtractor={(item) => item.id.toString()}
            emptyMessage="No items in this invoice"
          />
          
          <h3>Payments</h3>
          <Table
            data={currentInvoice.payments || []}
            columns={paymentColumns}
            keyExtractor={(item) => item.id.toString()}
            emptyMessage="No payments recorded for this invoice"
          />
          
          <div className={styles.invoiceTotal}>
            <div>
              <strong>Invoice Total: {formatColombianCurrency(currentInvoice.total || 0)}</strong>
            </div>
            <div>
              <strong>Payments Total: {formatColombianCurrency(currentInvoice.totalPaid || 0)}</strong>
            </div>
            <div>
              <strong>Balance Due: {formatColombianCurrency(currentInvoice.balanceDue || 0)}</strong>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Invoices;