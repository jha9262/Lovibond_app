/**
 * TypeScript interfaces for the Test Report PDF generation system.
 * Defines the contract between backend API data and the PDF template.
 * Template and data remain completely separate through these types.
 */

/* ── Top Header Section ─ Organization Branding ──────────────── */
export interface ReportTopHeader {
  LOGO_URL?: string;
  R_H_1?: string;   // Right header line 1 (document reference)
  R_H_2?: string;   // Right header line 2 (TC number)
  M_H_1?: string;   // Main header line 1 (organization name)
  M_H_2?: string;   // Main header line 2 (department)
  M_H_3?: string;   // Main header line 3 (institute type)
  M_H_4?: string;   // Main header line 4 (institute name)
  M_H_5?: string;   // Main header line 5 (address)
}

/* ── Bottom Section ─ Signatures & Footer ────────────────────── */
export interface ReportBottomDetails {
  CHECKED_BY_NAME?: string;
  CHECKED_BY_DES?: string;
  ISSUED_BY_NAME?: string;
  ISSUED_BY_DES?: string;
  L_F_1?: string;   // Left footer (order / work number)
  M_F_1?: string;   // Middle footer (address)
  M_F_2?: string;   // Middle footer (contact info)
}

/* ── Meta Details ─ Customer & Sample Information ────────────── */
export interface ReportMetaDetails {
  'CUSTOMER NAME'?: string;
  'CUSTOMER REF NO'?: string;
  'CUSTOMER ADDRESS'?: string;
  'CUSTOMER ADDRESS '?: string;   // API sometimes has trailing space
  'SAMPLE SUBMITTED BY'?: string;
  'TEST REPORT NO'?: string;
  'ANALYSIS STARTING DATE'?: string;
  'ANALYSIS END DATE'?: string;
  DISCIPLINE?: string;
  GROUP?: string;
  ULR_NO?: string;
  'DATE OF SAMPLE RECEIPT'?: string;
  'DATE OF ISSUE'?: string;
  'SAMPLE ID'?: string;
  'MODE OF SAMPLE'?: string;
  'MAIN SOURCE'?: string;
  SAMPLE_SOURCE?: string;
  HABITATION?: string;
  'SAMPLE TYPE'?: string;
  LOCATION?: string;
  VILLAGE?: string;
  TALUKA?: string;
  DISTRICT?: string;
  LATITUDE?: string;
  LONGITUDE?: string;
  [key: string]: string | undefined;
}

/* ── Single Test Result Row ──────────────────────────────────── */
export interface TestResultRow {
  srNo: string;
  parameter: string;
  unit: string;
  referenceMethod: string;
  analyticalValue: string;
  acceptableLimit: string;
  permissibleLimit: string;
}

/* ── Report Logs (backend format: keyed by R_1, R_2 …) ───────── */
export interface ReportLogs {
  [key: string]: string[] | null;
}

/* ── Raw API Response ────────────────────────────────────────── */
export interface ReportApiResponse {
  SD_DOWNLOAD_RECORD?: {
    META_TOP_DETAILS?: ReportTopHeader;
    META_BOTTOM_DETAILS?: ReportBottomDetails;
    META_DETAILS?: ReportMetaDetails;
    LOGS_HEADER?: string[];
    REPORT_LOGS?: ReportLogs;
  };
  SD_LOG_RECORD?: unknown;
  META_TOP_DETAILS?: ReportTopHeader;
  META_BOTTOM_DETAILS?: ReportBottomDetails;
  META_DETAILS?: ReportMetaDetails;
  LOGS_HEADER?: string[];
  REPORT_LOGS?: ReportLogs;
}

/* ── Transformed Data ─ Ready for Template Rendering ─────────── */
export interface ReportData {
  topHeader: ReportTopHeader;
  bottomDetails: ReportBottomDetails;
  meta: ReportMetaDetails;
  testResults: TestResultRow[];
}
