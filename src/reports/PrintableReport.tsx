/**
 * Backward-compatible re-export.
 *
 * The PDF template has been refactored into a clean architecture:
 *   - Template:    ./TestReportTemplate.tsx   (pure PDF layout)
 *   - Styles:      ./reportStyles.ts          (separated stylesheet)
 *   - Types:       ./types.ts                 (TypeScript interfaces)
 *   - Transformer: ./utils/transformReportData.ts (API → typed data)
 *   - Generator:   ./generatePdf.ts           (download utility)
 *
 * This file maintains the original export signature so that existing
 * consumers (ReportPreviewPage, etc.) continue to work without changes.
 */
import React from 'react';
import { TestReportTemplate } from './TestReportTemplate';
import { transformReportData } from './utils/transformReportData';
import { MOCK_REPORT_DATA } from './mockReportData';
import type { ReportApiResponse } from './types';

/* ── wrapper that accepts raw API data (backward compat) ─────────── */
interface ReportDocProps {
  data?: ReportApiResponse | any;
}

export const ReportDocument: React.FC<ReportDocProps> = ({ data = MOCK_REPORT_DATA }) => {
  const reportData = transformReportData(data);
  return <TestReportTemplate data={reportData} />;
};

export default ReportDocument;
