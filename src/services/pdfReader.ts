import path from 'path';

const pdfjsLib: any = require('pdfjs-dist/build/pdf.js');
const WORKER_PATH = path.join(
    __dirname,
    '..', // out of utils
    '..', // out of src
    'node_modules',
    'pdfjs-dist',
    'legacy', // <-- NOTE: Use the legacy directory
    'build',
    'pdf.worker.js'
);
pdfjsLib.GlobalWorkerOptions.workerSrc = WORKER_PATH;

export const extractPdfText = async (pdfUrl: string, page: number) => {
    const pdf = await pdfjsLib.getDocument(pdfUrl).promise;
    const pdfPage = await pdf.getPage(page);
    const textContent = await pdfPage.getTextContent();
    const text = textContent.items.map((item: any) => item.str).join(' ');
    return text;
};
