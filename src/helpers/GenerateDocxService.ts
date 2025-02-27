import PizZip from 'pizzip';
import PizZipUtils from 'pizzip/utils/index.js';
import Docxtemplater from 'docxtemplater';
import expressionParser from 'docxtemplater/expressions';
import { saveAs } from 'file-saver';
import { Invoice } from '../middleware/types';

type TemplateName = 'invoice_mirko.docx'

export const mapInvoiceInfo = (invoice: Invoice) => {
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
                item_amount: Number(item.quantity * item.unitPrice).toLocaleString(),
                item_total: partialTotal
            })
        }),
        total: total.toLocaleString(),
    }
}

const loadFile = async (url: string, callback: (error: unknown, content: unknown) => void) => {
    PizZipUtils.getBinaryContent(url, callback);
};

export const generateDocument = (documentData: unknown, templateName: TemplateName, fileName: string) => {
    loadFile(
        `./${templateName}`,
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
          doc.render(documentData);
          
          const out = doc.getZip().generate({
            type: 'blob',
            mimeType:
              'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
          });
          saveAs(out, fileName);
        }
      );
  };