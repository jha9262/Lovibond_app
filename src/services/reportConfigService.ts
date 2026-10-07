import api from './api';

export interface ReportConfiguration {
  // 1. TOP HEADER
  R_H_1: string;
  R_H_2: string;

  // 2. MIDDLE HEADER
  M_H_1: string;
  M_H_2: string;
  M_H_3: string;
  M_H_4: string;
  M_H_5: string;

  // 3. REPORT INFORMATION
  DISCIPLINE: string;
  GROUP: string;

  // 4. APPROVAL / SIGNATURE
  CHECKED_BY_NAME: string;
  CHECKED_BY_DES: string;
  ISSUED_BY_NAME: string;
  ISSUED_BY_DES: string;

  // 5. FOOTER INFORMATION
  M_F_1: string;
  L_F_1: string;
  M_F_2: string;
}

export const DEFAULT_REPORT_CONFIG: ReportConfiguration = {
  // Top Header
  R_H_1: 'DL/7.8/F-01',
  R_H_2: 'TC-117',

  // Middle Header
  M_H_1: 'Gujarat Water Supply & Sewerage Board',
  M_H_2: 'Central Laboratory',
  M_H_3: 'State Referral Institute',
  M_H_4: 'Gujarat Jalseva Training Institute',
  M_H_5: "Sector-15, 'G' - Road, Gandhinagar - 382016",

  // Report Information
  DISCIPLINE: 'Chemical Testing',
  GROUP: 'Drinking Water',

  // Approval / Signature
  CHECKED_BY_NAME: 'Prins Patel',
  CHECKED_BY_DES: 'Analyst',
  ISSUED_BY_NAME: 'Nisha Bhojak',
  ISSUED_BY_DES: 'Quality Manager',

  // Footer Information
  M_F_1: "Sector-15, 'G'-Road, Gandhinagar-382016",
  L_F_1: 'O.W.No CL/GJTI/263/of 2026, Dt. 22/May/2026',
  M_F_2: 'Phone No.:- (079) 23246694, Fax No.:- (079) 23223243, E-mail: cl.gjti.20@gmail.com',
};

const STORAGE_KEY = 'lovibond_report_configuration';

export const reportConfigService = {
  /**
   * Fetches the report configuration from GET /api/report-configuration.
   * Falls back to localStorage cache or default values if the endpoint is unavailable.
   */
  async getReportConfiguration(): Promise<ReportConfiguration> {
    try {
      const response = await api.get('/api/report-configuration');
      const data = response.data?.data || response.data || {};

      const config: ReportConfiguration = {
        R_H_1: data.R_H_1 ?? data.META_TOP_DETAILS?.R_H_1 ?? DEFAULT_REPORT_CONFIG.R_H_1,
        R_H_2: data.R_H_2 ?? data.META_TOP_DETAILS?.R_H_2 ?? DEFAULT_REPORT_CONFIG.R_H_2,
        M_H_1: data.M_H_1 ?? data.META_TOP_DETAILS?.M_H_1 ?? DEFAULT_REPORT_CONFIG.M_H_1,
        M_H_2: data.M_H_2 ?? data.META_TOP_DETAILS?.M_H_2 ?? DEFAULT_REPORT_CONFIG.M_H_2,
        M_H_3: data.M_H_3 ?? data.META_TOP_DETAILS?.M_H_3 ?? DEFAULT_REPORT_CONFIG.M_H_3,
        M_H_4: data.M_H_4 ?? data.META_TOP_DETAILS?.M_H_4 ?? DEFAULT_REPORT_CONFIG.M_H_4,
        M_H_5: data.M_H_5 ?? data.META_TOP_DETAILS?.M_H_5 ?? DEFAULT_REPORT_CONFIG.M_H_5,
        DISCIPLINE: data.DISCIPLINE ?? data.META_DETAILS?.DISCIPLINE ?? DEFAULT_REPORT_CONFIG.DISCIPLINE,
        GROUP: data.GROUP ?? data.META_DETAILS?.GROUP ?? DEFAULT_REPORT_CONFIG.GROUP,
        CHECKED_BY_NAME: data.CHECKED_BY_NAME ?? data.META_BOTTOM_DETAILS?.CHECKED_BY_NAME ?? DEFAULT_REPORT_CONFIG.CHECKED_BY_NAME,
        CHECKED_BY_DES: data.CHECKED_BY_DES ?? data.META_BOTTOM_DETAILS?.CHECKED_BY_DES ?? DEFAULT_REPORT_CONFIG.CHECKED_BY_DES,
        ISSUED_BY_NAME: data.ISSUED_BY_NAME ?? data.META_BOTTOM_DETAILS?.ISSUED_BY_NAME ?? DEFAULT_REPORT_CONFIG.ISSUED_BY_NAME,
        ISSUED_BY_DES: data.ISSUED_BY_DES ?? data.META_BOTTOM_DETAILS?.ISSUED_BY_DES ?? DEFAULT_REPORT_CONFIG.ISSUED_BY_DES,
        M_F_1: data.M_F_1 ?? data.META_BOTTOM_DETAILS?.M_F_1 ?? DEFAULT_REPORT_CONFIG.M_F_1,
        L_F_1: data.L_F_1 ?? data.META_BOTTOM_DETAILS?.L_F_1 ?? DEFAULT_REPORT_CONFIG.L_F_1,
        M_F_2: data.M_F_2 ?? data.META_BOTTOM_DETAILS?.M_F_2 ?? DEFAULT_REPORT_CONFIG.M_F_2,
      };

      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
      } catch {
        // Ignore localStorage quota errors
      }

      return config;
    } catch (err) {
      console.warn('[reportConfigService] Could not reach GET /api/report-configuration. Using local cache/defaults.', err);
      try {
        const cached = localStorage.getItem(STORAGE_KEY);
        if (cached) {
          const parsed = JSON.parse(cached);
          return { ...DEFAULT_REPORT_CONFIG, ...parsed };
        }
      } catch {
        // Ignore JSON parse errors
      }
      return { ...DEFAULT_REPORT_CONFIG };
    }
  },

  /**
   * Updates report configuration via PUT /api/report-configuration.
   * Strictly uses PUT as requested (never POST).
   */
  async updateReportConfiguration(config: ReportConfiguration): Promise<any> {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
    } catch {
      // Ignore localStorage quota errors
    }

    try {
      const response = await api.put('/api/report-configuration', config, {
        headers: {
          'Content-Type': 'application/json',
        },
      });
      return response.data;
    } catch (err: any) {
      console.warn('[reportConfigService] PUT /api/report-configuration failed:', err);
      throw err;
    }
  },
};

export default reportConfigService;

