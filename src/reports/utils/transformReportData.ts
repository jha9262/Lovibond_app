import type {
  ReportApiResponse,
  ReportData,
  ReportTopHeader,
  ReportBottomDetails,
  ReportMetaDetails,
  TestResultRow,
  ReportLogs,
} from '../types';

/**
 * Transforms the raw API response from the ESP32 device into a typed
 * ReportData object ready for template rendering.
 *
 * This is the single point of data transformation — the template never
 * touches raw API data directly.
 */
export function transformReportData(raw: ReportApiResponse | null | undefined): ReportData {
  if (!raw) {
    return emptyReport();
  }

  const root = raw.SD_DOWNLOAD_RECORD ?? raw;

  const topHeader: ReportTopHeader =
    (root as any).META_TOP_DETAILS ?? raw.META_TOP_DETAILS ?? {};

  const bottomDetails: ReportBottomDetails =
    (root as any).META_BOTTOM_DETAILS ?? raw.META_BOTTOM_DETAILS ?? {};

  const meta: ReportMetaDetails =
    (root as any).META_DETAILS ?? raw.META_DETAILS ?? {};

  const rawLogs: ReportLogs =
    (root as any).REPORT_LOGS ?? raw.REPORT_LOGS ?? {};

  const testResults = parseTestResults(rawLogs);

  return { topHeader, bottomDetails, meta, testResults };
}

/* ── helpers ──────────────────────────────────────────────────── */

/** Parse the REPORT_LOGS object (R_1, R_2 …) into sorted TestResultRow[]. */
function parseTestResults(logs: ReportLogs): TestResultRow[] {
  return Object.keys(logs)
    .sort((a, b) => {
      const numA = parseInt(a.replace(/\D/g, ''), 10) || 0;
      const numB = parseInt(b.replace(/\D/g, ''), 10) || 0;
      return numA - numB;
    })
    .map((key, idx) => {
      const row = logs[key];
      if (!row || !Array.isArray(row)) {
        return emptyRow(idx + 1);
      }
      return {
        srNo:             row[0] ?? String(idx + 1),
        parameter:        row[1] ?? '',
        unit:             row[2] ?? '',
        referenceMethod:  row[3] ?? '',
        analyticalValue:  row[4] ?? '',
        acceptableLimit:  row[5] ?? '',
        permissibleLimit: row[6] ?? '',
      };
    });
}

function emptyRow(index: number): TestResultRow {
  return {
    srNo: String(index),
    parameter: '',
    unit: '',
    referenceMethod: '',
    analyticalValue: '',
    acceptableLimit: '',
    permissibleLimit: '',
  };
}

function emptyReport(): ReportData {
  return {
    topHeader: {},
    bottomDetails: {},
    meta: {},
    testResults: [],
  };
}
