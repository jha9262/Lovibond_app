import React from 'react';
import { pdf } from '@react-pdf/renderer';
import { ReportDocument } from './PrintableReport';
import type { ReportApiResponse } from './types';

/**
 * Generates a real, searchable A4 PDF from backend API data
 * and triggers a browser download.
 *
 * Flow: API data → transformReportData → TestReportTemplate → PDF blob → download
 *
 * @param apiData  Raw report JSON from the device API
 * @param fileName Desired filename (without .pdf extension)
 * @returns        The generated Blob for additional processing if needed
 */
export async function generateAndDownloadPdf(
  apiData: ReportApiResponse,
  fileName: string = 'test_report',
): Promise<Blob> {
  // ReportDocument handles: raw API data → transform → template rendering
  const element = React.createElement(ReportDocument, { data: apiData });
  const blob = await pdf(element as any).toBlob();

  // Trigger browser download
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = fileName.endsWith('.pdf') ? fileName : `${fileName}.pdf`;
  anchor.click();
  URL.revokeObjectURL(url);

  return blob;
}
