import PizZip from 'pizzip';
import PizZipUtils from 'pizzip/utils/index.js';
import Docxtemplater from 'docxtemplater';
import expressionParser from 'docxtemplater/expressions';
import { saveAs } from 'file-saver';

type TemplateName = 'invoice_mirko.docx'

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