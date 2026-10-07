import axios from 'axios';
import { API_BASE_URL } from '../config';
import { Sample, PaginatedResponse } from '../types';

const API_URL = API_BASE_URL;

const toDeviceDateTime = (value: string | undefined, dateSeparator: '/' | '-') => {
  if (!value) return '';
  const match = value.match(/^(\d{4})[/-](\d{2})[/-](\d{2})[-T ](\d{2}):(\d{2})(?::(\d{2}))?/);
  if (match) {
    return `${match[1]}${dateSeparator}${match[2]}${dateSeparator}${match[3]}-${match[4]}:${match[5]}:${match[6] || '00'}`;
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  const pad = (part: number) => String(part).padStart(2, '0');
  return `${date.getFullYear()}${dateSeparator}${pad(date.getMonth() + 1)}${dateSeparator}${pad(date.getDate())}-${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
};

const apiClient = axios.create({
  baseURL: API_URL,
  timeout: 10000,
});

const normaliseSample = (sample: any, key: string = ''): Sample | null => {
  if (!sample) return null;
  return {
    key: key || sample.key || '',
    sampleId: String(sample.sampleId ?? sample.SAMPLE_ID ?? sample.sample_id ?? sample.id ?? sample.ID ?? ''),
    userId: String(sample.userId ?? sample.USER_ID ?? sample.user_id ?? ''),
    userName: String(sample.userName ?? sample.USER_NAME ?? ''),
    modeOfSample: String(sample.modeOfSample ?? sample.MODE_OF_SAMPLE ?? sample.SAMPLE_MODE ?? sample.mode_of_sample ?? sample.mode ?? ''),
    sampleType: String(sample.sampleType ?? sample.SAMPLE_TYPE ?? sample.sample_type ?? sample.type ?? ''),
    source: String(sample.source ?? sample.SOURCE ?? sample.SAMPLE_SOURCE ?? ''),
    mainSource: String(sample.mainSource ?? sample.MAIN_SOURCE ?? ''),
    customer: String(sample.customer ?? sample.CUSTOMER_NAME ?? sample.CUSTOMER ?? ''),
    customerAddress: String(sample.customerAddress ?? sample.CUSTOMER_ADDRESS ?? ''),
    habitation: String(sample.habitation ?? sample.HABITATION ?? sample.SAMPLE_HABITATION ?? ''),
    district: String(sample.district ?? sample.DISTRICT ?? sample.SAMPLE_DISTRICT ?? sample.SAMPLE_TEST_DISTRICT ?? ''),
    sampleDateOfIssue: String(sample.sampleDateOfIssue ?? sample.DATE_OF_ISSUE ?? sample.SAMPLE_DATE_OF_ISSUE ?? ''),
    sampleSubmittedDate: String(sample.sampleSubmittedDate ?? sample.SUBMITTED_DATE ?? sample.SAMPLE_SUBMITTED_DATE ?? ''),
    sampleSubmittedBy: String(sample.sampleSubmittedBy ?? sample.SUBMITTED_BY ?? sample.SAMPLE_SUBMITTED_BY ?? ''),
    customerReferenceNo: String(sample.customerReferenceNo ?? sample.CUSTOMER_REF_NO ?? sample.CUSTOMER_REFERENCE_NO ?? ''),
    sampleReceiptDate: String(sample.sampleReceiptDate ?? sample.SAMPLE_RECEIPT_DATE ?? ''),
    testReportNo: String(sample.testReportNo ?? sample.TEST_REPORT_NO ?? ''),
    endDate: String(sample.endDate ?? sample.END_DATE_TIME ?? sample.END_DATE ?? ''),
    latitude: (() => {
      const val = sample.latitude ?? sample.SAMPLE_LATITUDE ?? sample.LATITUDE ?? sample.SAMPLE_TEST_LATITUDE ?? '';
      return val !== '' && val !== null && val !== undefined ? val : '';
    })(),
    longitude: (() => {
      const val = sample.longitude ?? sample.SAMPLE_LONGITUDE ?? sample.LONGITUDE ?? sample.SAMPLE_TEST_LONGITUDE ?? '';
      return val !== '' && val !== null && val !== undefined ? val : '';
    })(),
    testAddress: String(sample.testAddress ?? sample.SAMPLE_ADDRESS ?? sample.SAMPLE_TEST_ADDRESS ?? ''),
    testVillage: String(sample.testVillage ?? sample.SAMPLE_VILLAGE ?? sample.SAMPLE_TEST_VILLAGE ?? ''),
    testTaluka: String(sample.testTaluka ?? sample.SAMPLE_TALUKA ?? sample.SAMPLE_TEST_TALUKA ?? ''),
    testDistrict: String(sample.testDistrict ?? sample.SAMPLE_DISTRICT ?? sample.SAMPLE_TEST_DISTRICT ?? ''),
    createdDate: sample.createdDate ?? sample.createdAt ?? sample.SAMPLE_DATE_TIME ?? sample.SAMPLE_DATE ?? sample.CREATE_DATE_TIME ?? sample.CREATE_DATE ?? '',
  };
};

const parseSampleResponse = (data: any) => {
  if (typeof data !== 'string') return data;

  try {
    return JSON.parse(data);
  } catch (error) {
    console.error('[sampleService] Failed to parse sample response:', error);
    return data;
  }
};

const readSamplePage = (response: any): { samples: Sample[]; total: number | null } => {
  const data = parseSampleResponse(response);

  const configuration =
    data?.SAMPLE_CONFIGURATION ??
    data?.sampleConfiguration ??
    data?.data?.SAMPLE_CONFIGURATION ??
    data?.data?.sampleConfiguration;

  const samplesSource =
    configuration?.SAMPLES ??
    data?.SAMPLES ??
    data?.samples ??
    data?.data?.SAMPLES ??
    data?.data?.samples ??
    data?.data ??
    data;

  let samples: Sample[] = [];
  if (Array.isArray(samplesSource)) {
    samples = samplesSource.map((sample) => normaliseSample(sample)).filter(Boolean) as Sample[];
  } else if (samplesSource && typeof samplesSource === 'object') {
    samples = Object.entries(samplesSource)
      .map(([key, sample]) => normaliseSample(sample, key))
      .filter(Boolean) as Sample[];
  }

  // Extract real total count from device
  const total =
    configuration?.TOTAL_SAMPLE_CREATED ??
    configuration?.AVAILABLE_SAMPLE ??
    configuration?.SAMPLE_AVAILABLE_COUNT ??
    configuration?.SAMPLE_TOTAL_COUNT ??
    configuration?.TOTAL_COUNT ??
    configuration?.SAMPLE_COUNT ??
    configuration?.TOTAL_SAMPLES ??
    configuration?.TOTAL ??
    configuration?.COUNT ??
    data?.TOTAL_SAMPLE_CREATED ??
    data?.AVAILABLE_SAMPLE ??
    data?.SAMPLE_AVAILABLE_COUNT ??
    data?.SAMPLE_TOTAL_COUNT ??
    data?.TOTAL_COUNT ??
    data?.SAMPLE_COUNT ??
    data?.TOTAL_SAMPLES ??
    data?.total ??
    data?.TOTAL ??
    null;

  return {
    samples,
    total: typeof total === 'number' ? total : total != null ? Number(total) : null,
  };
};

// Fetch ONE page from the device (ESP32 backend expects strictly ?page=X without limit)
const fetchDeviceSamplePage = async (
  page: number
): Promise<{ samples: Sample[]; total: number | null }> => {
  try {
    const { data } = await apiClient.get('/SAMPLE_CONFIGURATION', {
      params: { page },
    });
    return readSamplePage(data);
  } catch (error: any) {
    // If the device responds with 400 or 404 for page > 1, it means we reached the end of available samples
    if (page > 1 && (error.response?.status === 400 || error.response?.status === 404)) {
      console.log(`[sampleService] Page ${page} reached end of samples (status ${error.response.status}).`);
      return { samples: [], total: null };
    }
    throw error;
  }
};

// Fetch ALL samples (used only when searching)
const getAllSamplesFromDevice = async (): Promise<Sample[]> => {
  const backendPageSize = 5;
  const maximumPages = 200;
  const samplesById = new Map<string, Sample>();
  let deviceTotal: number | null = null;

  for (let page = 1; page <= maximumPages; page += 1) {
    if (deviceTotal != null && samplesById.size >= deviceTotal) {
      break;
    }

    let pageResult: { samples: Sample[]; total: number | null };
    try {
      pageResult = await fetchDeviceSamplePage(page);
    } catch (err: any) {
      if (page > 1) break;
      throw err;
    }

    const { samples, total } = pageResult;
    if (total != null && deviceTotal == null) {
      deviceTotal = total;
    }

    const countBefore = samplesById.size;
    samples.forEach((sample) => {
      const key =
        sample.sampleId.trim().toLowerCase() ||
        sample.key ||
        `page-${page}-${samplesById.size}`;
      samplesById.set(key, sample);
    });

    if (
      samples.length === 0 ||
      samplesById.size === countBefore ||
      samples.length < backendPageSize ||
      (deviceTotal != null && samplesById.size >= deviceTotal)
    ) {
      break;
    }
  }

  return Array.from(samplesById.values());
};

export const sampleService = {
  recentSamplesCache: { data: null as Sample[] | null, timestamp: 0 },

  async getRecentSamples(limit = 5): Promise<Sample[]> {
    const now = Date.now();
    if (this.recentSamplesCache.data && now - this.recentSamplesCache.timestamp < 60000) {
      return this.recentSamplesCache.data;
    }
    try {
      const { data } = await apiClient.get(`/samples?limit=${limit}&sort=created_desc`);
      let rawSamples: Sample[] = [];
      if (Array.isArray(data)) {
        rawSamples = data.map((s: any) => normaliseSample(s)).filter(Boolean) as Sample[];
      } else if (data?.data && Array.isArray(data.data)) {
        rawSamples = data.data.map((s: any) => normaliseSample(s)).filter(Boolean) as Sample[];
      } else {
        const res = await this.getSamples({ limit, page: 1 });
        rawSamples = res.data;
      }

      const result = rawSamples
        .sort((a, b) => new Date(b.createdDate || 0).getTime() - new Date(a.createdDate || 0).getTime())
        .slice(0, limit);

      this.recentSamplesCache = { data: result, timestamp: now };
      return result;
    } catch (error) {
      const res = await this.getSamples({ limit, page: 1 });
      const result = res.data
        .sort((a, b) => new Date(b.createdDate || 0).getTime() - new Date(a.createdDate || 0).getTime())
        .slice(0, limit);
      this.recentSamplesCache = { data: result, timestamp: now };
      return result;
    }
  },

  async getSamples({
    page = 1,
    limit = 5,
    search = '',
  }: {
    page?: number;
    limit?: number;
    search?: string;
  } = {}): Promise<PaginatedResponse<Sample>> {
    try {
      const safeLimit = Math.max(1, Number.isFinite(limit) && limit > 0 ? limit : 5);
      const safePage = Math.max(1, Number.isFinite(page) && page > 0 ? page : 1);
      const searchLower = search.toLowerCase().trim();

      // ---------- CASE 1: No search → real device pagination ----------
      if (!searchLower) {
        const devicePageSize = 5;

        const startIndex = (safePage - 1) * safeLimit;
        const endIndex = startIndex + safeLimit;

        const firstDevicePage = Math.floor(startIndex / devicePageSize) + 1;
        const lastDevicePage = Math.floor((endIndex - 1) / devicePageSize) + 1;

        const collected: Sample[] = [];
        let deviceTotal: number | null = null;

        for (let p = firstDevicePage; p <= lastDevicePage; p++) {
          // If we already know the total count from the device and collected all, stop!
          if (deviceTotal != null && (collected.length >= deviceTotal || (p - 1) * devicePageSize >= deviceTotal)) {
            break;
          }

          let pageResult: { samples: Sample[]; total: number | null };
          try {
            pageResult = await fetchDeviceSamplePage(p);
          } catch (err: any) {
            if (p > 1) {
              console.warn(`[sampleService] Stopping pagination at page ${p}:`, err.message);
              break;
            }
            throw err;
          }

          const { samples, total } = pageResult;
          collected.push(...samples);

          if (total != null) {
            deviceTotal = total;
          }

          if (
            samples.length === 0 ||
            samples.length < devicePageSize ||
            (deviceTotal != null && collected.length >= deviceTotal)
          ) {
            break;
          }
        }

        // Slice the exact window the UI asked for
        const sliceStart = startIndex % devicePageSize;
        const pageSamples = collected.slice(sliceStart, sliceStart + safeLimit);

        // If deviceTotal is still unknown, try fetching total from /DASHBOARD_INNVENTORY_INFORMATION
        if (deviceTotal == null) {
          try {
            const { data: invData } = await apiClient.get('/DASHBOARD_INNVENTORY_INFORMATION');
            const inv = invData?.DCN_LOGGER_DATA;
            const count = inv?.TOTAL_SAMPLE_CREATED ?? inv?.AVAILABLE_SAMPLE;
            if (count != null && !isNaN(Number(count)) && Number(count) > 0) {
              deviceTotal = Number(count);
            }
          } catch (_) {}
        }

        // Use real total from device
        let total = deviceTotal != null ? deviceTotal : collected.length;
        let totalPages = Math.max(1, Math.ceil(total / safeLimit));

        // If the current page returned a full page of 5 items, there is at least one more page!
        if (pageSamples.length === safeLimit && safePage >= totalPages) {
          totalPages = safePage + 1;
          total = totalPages * safeLimit;
        }

        return {
          data: pageSamples,
          pagination: {
            page: safePage,
            limit: safeLimit,
            total,
            totalPages,
          },
        };
      }

      // ---------- CASE 2: Search is present → load everything & filter ----------
      const rawSamples = await getAllSamplesFromDevice();

      const filtered = rawSamples.filter((s) => {
        const id = String(s.sampleId || '').toLowerCase();
        const user = String(s.userId || s.userName || '').toLowerCase();
        const type = String(s.sampleType || '').toLowerCase();
        const district = String(s.district || '').toLowerCase();
        const mode = String(s.modeOfSample || '').toLowerCase();
        const source = String(s.source || '').toLowerCase();
        const habitation = String(s.habitation || '').toLowerCase();
        const customer = String(s.customer || '').toLowerCase();

        return (
          id.includes(searchLower) ||
          user.includes(searchLower) ||
          type.includes(searchLower) ||
          district.includes(searchLower) ||
          mode.includes(searchLower) ||
          source.includes(searchLower) ||
          habitation.includes(searchLower) ||
          customer.includes(searchLower)
        );
      });

      const total = filtered.length;
      const totalPages = Math.max(1, Math.ceil(total / safeLimit));
      const clampedPage = Math.min(safePage, totalPages);
      const startIndex = (clampedPage - 1) * safeLimit;

      return {
        data: filtered.slice(startIndex, startIndex + safeLimit),
        pagination: {
          page: clampedPage,
          limit: safeLimit,
          total,
          totalPages,
        },
      };
    } catch (error: any) {
      console.error('[sampleService] Failed to fetch samples:', error);
      throw new Error(
        error.response?.data?.message || 'Unable to retrieve sample data from device.'
      );
    }
  },

  async getSampleById(sampleId: string): Promise<Sample> {
    const cleanId = String(sampleId || '').trim();

    // 1. Check in cached recent samples
    if (this.recentSamplesCache?.data) {
      const cached = this.recentSamplesCache.data.find(
        (s) => String(s.sampleId || '').trim().toLowerCase() === cleanId.toLowerCase()
      );
      if (cached) return cached;
    }

    // 2. Fetch using getSamples which uses the verified device pagination API
    try {
      const res = await this.getSamples({ page: 1, limit: 100, search: cleanId });
      const found = res.data.find(
        (s) => String(s.sampleId || '').trim().toLowerCase() === cleanId.toLowerCase()
      );
      if (found) return found;

      // Also try without search filter in case server-side search is strict
      if (cleanId) {
        const allRes = await this.getSamples({ page: 1, limit: 100 });
        const match = allRes.data.find(
          (s) => String(s.sampleId || '').trim().toLowerCase() === cleanId.toLowerCase()
        );
        if (match) return match;
      }
    } catch (err: any) {
      console.warn('[sampleService] getSamples in getSampleById failed:', err?.message);
    }

    // 3. Direct /SAMPLE_CONFIGURATION query fallback with JSON string handling
    try {
      let { data } = await apiClient.get('/SAMPLE_CONFIGURATION?page=1');
      if (typeof data === 'string') {
        try {
          data = JSON.parse(data);
        } catch { }
      }
      let rawSamples: Sample[] = [];
      if (data?.SAMPLE_CONFIGURATION?.SAMPLES) {
        rawSamples = Object.entries(data.SAMPLE_CONFIGURATION.SAMPLES)
          .map(([k, v]) => normaliseSample(v, k))
          .filter(Boolean) as Sample[];
      } else if (Array.isArray(data)) {
        rawSamples = data.map((s) => normaliseSample(s)).filter(Boolean) as Sample[];
      } else if (Array.isArray(data?.samples)) {
        rawSamples = data.samples.map((s: any) => normaliseSample(s)).filter(Boolean) as Sample[];
      }

      const found = rawSamples.find(
        (s) => String(s.sampleId || '').trim().toLowerCase() === cleanId.toLowerCase()
      );
      if (found) return found;
    } catch (error: any) {
      console.warn('[sampleService] /SAMPLE_CONFIGURATION query failed, trying REST fallback:', error?.message);
    }

    // 4. REST endpoint fallback
    try {
      const { data } = await apiClient.get(`/SAMPLE_CONFIGURATION/${encodeURIComponent(sampleId)}`);
      const sample = normaliseSample(data);
      if (sample) return sample;
    } catch (restErr) {
      console.error('[sampleService] Failed to fetch sample by ID:', restErr);
    }

    throw new Error('Sample not found');
  },

  async createSample(sampleData: Partial<Sample>): Promise<{ success: boolean; sample: Sample | null }> {
    const payload = {
      SAMPLE_ID: sampleData.sampleId,
      SAMPLE_DATE_TIME: toDeviceDateTime(sampleData.createdDate || new Date().toISOString(), '/'),
      USER_ID: sampleData.userId || '',
      END_DATE_TIME: toDeviceDateTime(sampleData.endDate, '-'),
      SAMPLE_LONGITUDE: sampleData.longitude !== '' && sampleData.longitude !== undefined ? String(sampleData.longitude) : '',
      SAMPLE_LATITUDE: sampleData.latitude !== '' && sampleData.latitude !== undefined ? String(sampleData.latitude) : '',
      SAMPLE_ADDRESS: sampleData.testAddress || '',
      SAMPLE_VILLAGE: sampleData.testVillage || '',
      SAMPLE_TALUKA: sampleData.testTaluka || '',
      SAMPLE_DISTRICT: sampleData.testDistrict || '',
      CUSTOMER_NAME: sampleData.customer || '',
      CUSTOMER_ADDRESS: sampleData.customerAddress || '',
      SAMPLE_SOURCE: sampleData.source || '',
      MAIN_SOURCE: sampleData.mainSource || '',
      MODE_OF_SAMPLE: sampleData.modeOfSample || '',
      SAMPLE_TYPE: sampleData.sampleType || '',
      SAMPLE_HABITATION: sampleData.habitation || '',
      DATE_OF_ISSUE: sampleData.sampleDateOfIssue || '',
      SUBMITTED_DATE: sampleData.sampleSubmittedDate || '',
      SUBMITTED_BY: sampleData.sampleSubmittedBy || '',
      TEST_REPORT_NO: sampleData.testReportNo || '',
      CUSTOMER_REF_NO: sampleData.customerReferenceNo || '',
    };
    console.log('[sampleService] createSample payload:', JSON.stringify(payload));

    try {
      await apiClient.post(
        '/SAMPLE_CONFIGURATION',
        {
          SAMPLE_CONFIGURATION: {
            SAMPLE_AVAILABLE_COUNT: 0,
            NEW_SAMPLE_ADD_COUNT: 1,
            SAMPLES: {
              S_1: payload,
            },
          },
        },
        { headers: { 'Content-Type': 'application/json' } }
      );
      return { success: true, sample: normaliseSample(payload) };
    } catch (error: any) {
      if (error.response?.status === 404) {
        const { data } = await apiClient.post('/samples', payload);
        return { success: true, sample: normaliseSample(data || payload) };
      }
      console.error('[sampleService] Failed to create sample:', error);

      // Extract the actual backend error message from various response formats
      let backendMessage = '';
      const respData = error.response?.data;
      if (respData) {
        if (typeof respData === 'string') {
          // Backend returned a plain string error
          try {
            const parsed = JSON.parse(respData);
            backendMessage = parsed.MESSAGE || parsed.message || parsed.error || respData;
          } catch {
            backendMessage = respData;
          }
        } else if (typeof respData === 'object') {
          backendMessage = respData.MESSAGE || respData.message || respData.error || respData.Error || respData.ERROR || '';
          // Check for nested error structures
          if (!backendMessage && respData.SAMPLE_CONFIGURATION) {
            backendMessage = respData.SAMPLE_CONFIGURATION.MESSAGE || respData.SAMPLE_CONFIGURATION.message || '';
          }
        }
      }

      throw new Error(backendMessage || 'Unable to save sample.');
    }
  },

  async updateSample(sampleId: string, sampleData: Partial<Sample>): Promise<{ success: boolean; sample: Sample | null }> {
    console.log('[sampleService] updateSample: deleting old sample then re-creating with updated data');

    try {
      // Step 1: Delete the existing sample
      await this.deleteSample(sampleId);

      // Step 2: Create the sample with updated data
      const result = await this.createSample({
        ...sampleData,
        sampleId: sampleData.sampleId || sampleId,
      });

      return { success: true, sample: result.sample };
    } catch (error: any) {
      console.error('[sampleService] Failed to update sample:', error);
      throw new Error(error?.message || 'Unable to update sample.');
    }
  },

  async deleteSample(sampleId: string): Promise<boolean> {
    const body = {
      SAMPLE_CONFIGURATION: {
        SAMPLE_AVAILABLE_COUNT: 2,
        NEW_SAMPLE_ADD_COUNT: 0,
        SAMPLES: {
          S_1: {
            SAMPLE_ID: sampleId,
          },
        },
      },
    };
    try {
      await apiClient.delete('/SAMPLE_CONFIGURATION', {
        data: body,
        headers: { 'Content-Type': 'application/json' },
      });
      return true;
    } catch (error: any) {
      if (error.response?.status === 404 || error.response?.status === 405) {
        await apiClient.post('/SAMPLE_CONFIGURATION', body, {
          headers: { 'Content-Type': 'application/json' },
        });
        return true;
      }
      console.error('[sampleService] Failed to delete sample:', error);
      throw new Error(error.response?.data?.message || 'Unable to delete sample.');
    }
  },

  async createSamples(samplesList: Partial<Sample>[]): Promise<{ created: (Sample | null)[]; failed: any[] }> {
    try {
      const samplesObj = samplesList.reduce((acc: any, p, index) => {
        acc[`S_${index + 1}`] = {
          SAMPLE_ID: p.sampleId,
          SAMPLE_DATE_TIME: toDeviceDateTime(p.createdDate || new Date().toISOString(), '/'),
          USER_ID: p.userId || '',
          END_DATE_TIME: toDeviceDateTime(p.endDate, '-'),
          SAMPLE_LONGITUDE: p.longitude !== '' && p.longitude !== undefined ? String(p.longitude) : '',
          SAMPLE_LATITUDE: p.latitude !== '' && p.latitude !== undefined ? String(p.latitude) : '',
          SAMPLE_ADDRESS: p.testAddress || '',
          SAMPLE_VILLAGE: p.testVillage || '',
          SAMPLE_TALUKA: p.testTaluka || '',
          SAMPLE_DISTRICT: p.testDistrict || '',
          CUSTOMER_NAME: p.customer || '',
          CUSTOMER_ADDRESS: p.customerAddress || '',
          SAMPLE_SOURCE: p.source || '',
          MAIN_SOURCE: p.mainSource || '',
          MODE_OF_SAMPLE: p.modeOfSample || '',
          SAMPLE_TYPE: p.sampleType || '',
          SAMPLE_HABITATION: p.habitation || '',
          DATE_OF_ISSUE: p.sampleDateOfIssue || '',
          SUBMITTED_DATE: p.sampleSubmittedDate || '',
          SUBMITTED_BY: p.sampleSubmittedBy || '',
          TEST_REPORT_NO: p.testReportNo || '',
          CUSTOMER_REF_NO: p.customerReferenceNo || '',
        };
        return acc;
      }, {});

      await apiClient.post('/SAMPLE_CONFIGURATION', {
        SAMPLE_CONFIGURATION: { SAMPLE_AVAILABLE_COUNT: 0, NEW_SAMPLE_ADD_COUNT: samplesList.length, SAMPLES: samplesObj },
      }, { headers: { 'Content-Type': 'application/json' } });

      return { created: samplesList.map((s) => normaliseSample(s)), failed: [] };
    } catch (error) {
      console.error('[sampleService] Failed to bulk create samples:', error);
      throw new Error('Unable to save samples to the device.');
    }
  },

  async getSampleLogs(): Promise<any> {
    try {
      let { data } = await apiClient.get('/REPORT_DEFAULT_CONFIGURATION');
      if (typeof data === 'string') {
        try {
          data = JSON.parse(data);
        } catch (e) {
          console.error('[sampleService] Failed to parse JSON:', e);
        }
      }
      return data;
    } catch (error) {
      console.error('[sampleService] Failed to fetch sample logs:', error);
      throw error;
    }
  },

  async updateSampleLogs(selectedLogs: any[], totalCount?: number): Promise<any> {
    try {
      const LISTS: Record<string, any> = {};
      selectedLogs.forEach((log, index) => {
        const { originalKey, ...cleanLog } = log;
        // The ESP32 strictly expects the keys in the payload to be L_1, L_2, etc., 
        // up to LIST_COUNT, regardless of what parameter we are actually updating.
        const key = `L_${index + 1}`;
        LISTS[key] = cleanLog;
      });

      const payload = {
        LIST_COUNT: totalCount || selectedLogs.length,
        LISTS
      };
      console.log('[sampleService] Submitting test parameters:', JSON.stringify(payload));

      let response;
      try {
        response = await apiClient.patch('/REPORT_DEFAULT_CONFIGURATION', payload, {
          headers: { 'Content-Type': 'application/json' }
        });
      } catch (patchError: any) {
        throw patchError;
      }
      return response.data;
    } catch (error) {
      console.error('[sampleService] Failed to update sample logs:', error);
      throw error;
    }
  },
};
