import { useEffect, useState } from 'react';
import { pdfjs } from 'react-pdf';

// Handles PDF loading, numPages, errors, and pdfjs worker setup
export function usePdfViewer() {
  const [numPages, setNumPages] = useState(0);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Use local worker for Next.js production
    pdfjs.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.js';
  }, []);

  const onLoadSuccess = ({ numPages }: { numPages: number }) => setNumPages(numPages);
  const onLoadError = (err: Error) => setError(err.message);

  return { numPages, error, onLoadSuccess, onLoadError };
}
