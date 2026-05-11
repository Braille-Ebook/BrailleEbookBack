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

export const pdfSizeCalculator = async (pdfUrl: string) => {
    const pdf = await pdfjsLib.getDocument(pdfUrl).promise;
    return pdf.numPages;
};
