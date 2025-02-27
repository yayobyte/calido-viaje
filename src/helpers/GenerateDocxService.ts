import PizZip from 'pizzip';
import PizZipUtils from 'pizzip/utils/index.js';
import Docxtemplater from 'docxtemplater';
import expressionParser from 'docxtemplater/expressions';
import { saveAs } from 'file-saver';
import { Invoice } from '../middleware/types';

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

const loadFile = async (url: string, callback: (error: unknown, content: unknown) => void) => {
    PizZipUtils.getBinaryContent(url, callback);
};

export const generateDocument = () => {
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