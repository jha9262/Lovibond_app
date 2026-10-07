import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Loader2, MapPin, AlertCircle } from 'lucide-react';
import { Sample } from '../../types';
import { SAMPLE_LIMITS } from '../../constants/sampleLimits';

interface SampleFormProps {
  initialValues?: Partial<Sample>;
  onSubmit: (sample: Partial<Sample>) => void;
  onCancel: () => void;
  submitLabel?: string;
  isSubmitting?: boolean;
  isEdit?: boolean;
}

const toDateTimeInput = (value?: string | number | null) => {
  if (value === undefined || value === null || value === '') return '';
  const match = String(value).trim().match(/^(\d{4})[/-](\d{2})[/-](\d{2})[-T ](\d{2}):(\d{2})/);
  if (match) return `${match[1]}-${match[2]}-${match[3]}T${match[4]}:${match[5]}`;

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
};

const EMPTY_VALUES = {
  sampleId: '',
  userId: '',
  createdDate: toDateTimeInput(new Date().toISOString()),
  endDate: '',
  modeOfSample: '',
  sampleType: '',
  source: '',
  mainSource: '',
  customer: '',
  customerAddress: '',
  sampleDateOfIssue: '',
  habitation: '',
  testVillage: '',
  testTaluka: '',
  testDistrict: '',
  testAddress: '',
  latitude: '',
  longitude: '',
  sampleSubmittedDate: '',
  customerReferenceNo: '',
  sampleSubmittedBy: '',
  testReportNo: '',
};

type FormValues = typeof EMPTY_VALUES;

const inputClass = (hasError: boolean) =>
  [
    'w-full rounded-lg border bg-white px-3 py-2 text-sm text-industrial-900',
    'placeholder:text-industrial-400 outline-none transition',
    'focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20',
    'disabled:bg-industrial-50 disabled:cursor-not-allowed',
    hasError ? 'border-red-400 focus:border-red-500 focus:ring-red-500/20' : 'border-industrial-200',
  ].join(' ');

// Sample text fields accept letters, numbers, and spaces. This also removes
// punctuation from pasted text because every field is controlled by React.
const sanitizeText = (value: string) => value.replace(/[^a-zA-Z0-9 ]/g, '');
const sanitizeIdentifier = (value: string) => value.replace(/[^a-zA-Z0-9\-_]/g, '');
const sanitizeCoordinate = (value: string) => value.replace(/[^0-9.-]/g, '');

const Field = ({
  label,
  required,
  error,
  children,
}: {
  label: string;
  required?: boolean;
  error?: string;
  children: React.ReactNode;
}) => (
  <div>
    <label className={`block text-[11px] font-bold text-industrial-600 mb-1 ${label === 'Customer' ? 'normal-case tracking-normal' : 'uppercase tracking-wider'}`}>
      {label}
      {required && <span className="text-red-500 ml-0.5">*</span>}
    </label>
    {children}
    {error && (
      <p className="mt-1 flex items-center gap-1 text-[11px] font-medium text-red-500">
        <AlertCircle size={11} /> {error}
      </p>
    )}
  </div>
);

const SectionHeading = ({ children, action }: { children: React.ReactNode; action?: React.ReactNode }) => (
  <div className="sm:col-span-2 flex items-center justify-between border-b border-industrial-100 pb-2 mt-2 mb-1">
    <h3 className="text-sm font-bold text-industrial-900">{children}</h3>
    {action}
  </div>
);

const SampleForm: React.FC<SampleFormProps> = ({
  initialValues,
  onSubmit,
  onCancel,
  submitLabel = 'Create Sample',
  isSubmitting = false,
  isEdit = false,
}) => {
  const [values, setValues] = useState<FormValues>(EMPTY_VALUES);
  const [errors, setErrors] = useState<Partial<Record<keyof FormValues, string>>>({});
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [locLoading, setLocLoading] = useState(false);
  const [locError, setLocError] = useState('');
  const [isLocationFetched, setIsLocationFetched] = useState(false);

  useEffect(() => {
    if (initialValues && Object.keys(initialValues).length > 0) {
      setValues({
        sampleId: initialValues.sampleId || '',
        userId: initialValues.userId || '',
        createdDate: toDateTimeInput(initialValues.createdDate),
        endDate: toDateTimeInput(initialValues.endDate),
        modeOfSample: initialValues.modeOfSample || '',
        sampleType: initialValues.sampleType || '',
        source: initialValues.source || '',
        mainSource: initialValues.mainSource || '',
        customer: initialValues.customer || '',
        customerAddress: initialValues.customerAddress || '',
        sampleDateOfIssue: initialValues.sampleDateOfIssue || '',
        habitation: initialValues.habitation || '',
        testVillage: initialValues.testVillage || '',
        testTaluka: initialValues.testTaluka || '',
        testDistrict: initialValues.testDistrict || '',
        testAddress: initialValues.testAddress || '',
        latitude:
          initialValues.latitude !== undefined && initialValues.latitude !== null
            ? String(initialValues.latitude)
            : '',
        longitude:
          initialValues.longitude !== undefined && initialValues.longitude !== null
            ? String(initialValues.longitude)
            : '',
        sampleSubmittedDate: initialValues.sampleSubmittedDate || '',
        customerReferenceNo: initialValues.customerReferenceNo || '',
        sampleSubmittedBy: initialValues.sampleSubmittedBy || '',
        testReportNo: initialValues.testReportNo || '',
      });
    } else {
      setValues(EMPTY_VALUES);
    }
    setErrors({});
    setHasSubmitted(false);
    setLocError('');
    setIsLocationFetched(false);
  }, [initialValues]);

  const set = useCallback((key: keyof FormValues, val: string) => {
    setValues((prev) => ({ ...prev, [key]: val }));
    setErrors((prev) => ({ ...prev, [key]: '' }));
  }, []);

  const fetchLocation = () => {
    if (!navigator.geolocation) {
      setIsLocationFetched(false);
      setLocError('Geolocation is not supported by your browser. Please enter manually.');
      return;
    }
    setLocLoading(true);
    setLocError('');
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const lat = Number(pos.coords.latitude.toFixed(6));
        const lng = Number(pos.coords.longitude.toFixed(6));

        // Immediately update coordinates in form
        setValues((prev) => ({
          ...prev,
          latitude: String(lat),
          longitude: String(lng),
        }));
        setErrors((prev) => ({ ...prev, latitude: '', longitude: '' }));

        // Attempt reverse geocoding to auto-fill village, taluka, district, and address
        try {
          let village = '';
          let taluka = '';
          let district = '';
          let address = '';
          let locationResolved = false;

          // 1. Try Nominatim (OpenStreetMap)
          try {
            const controller = new AbortController();
            const timer = setTimeout(() => controller.abort(), 4000);
            const res = await fetch(
              `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`,
              {
                headers: { 'Accept-Language': 'en', 'User-Agent': 'LovibondWaterApp/1.0' },
                signal: controller.signal,
              }
            );
            clearTimeout(timer);
            if (res.ok) {
              const data = await res.json();
              const addr = data.address || {};

              // Extract village / locality
              const rawVillage = addr.village || addr.hamlet || addr.suburb || addr.neighbourhood || addr.residential || addr.town || addr.city || '';
              village = rawVillage.replace(/\s+village$/i, '').trim();

              // Extract taluka / subdistrict matching the field name cleanly
              const rawTaluka = addr.taluka || addr.taluk || addr.tehsil || addr.subdistrict || (addr.county !== addr.state_district ? addr.county : '') || '';
              taluka = (rawTaluka || (addr.county || '').replace(/\s+(district|dist\.?)$/i, ''))
                .replace(/\s+(taluka|taluk|tehsil|subdistrict|block)$/i, '').trim();

              // Extract district without redundant "district" suffix
              const rawDistrict = addr.state_district || addr.district || addr.county || '';
              district = rawDistrict.replace(/\s+(district|dist\.?)$/i, '').trim();

              // Keep Address limited to street/local details. Village, taluka,
              // district, state, and country are represented in their own fields.
              const administrativeNames = [village, taluka, district]
                .filter(Boolean)
                .map((part) => part.toLowerCase().replace(/\s+/g, ' ').trim());
              const parts = [
                addr.house_number,
                addr.road,
                addr.pedestrian,
                addr.path,
                addr.neighbourhood,
                addr.suburb,
              ].filter((part: unknown): part is string => typeof part === 'string' && part.trim() !== '')
                .filter((part) => !administrativeNames.includes(part.toLowerCase().replace(/\s+/g, ' ').trim()));
              const uniqueParts = Array.from(new Set(parts));
              address = uniqueParts.join(', ');
              locationResolved = Boolean(village || taluka || district || address);
            }
          } catch (osmErr) {
            console.warn('[SampleForm] Nominatim reverse-geocode failed:', osmErr);
          }

          // 2. Fallback to BigDataCloud if needed
          if (!village && !district) {
            try {
              const controller = new AbortController();
              const timer = setTimeout(() => controller.abort(), 4000);
              const res = await fetch(
                `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lng}&localityLanguage=en`,
                { signal: controller.signal }
              );
              clearTimeout(timer);
              if (res.ok) {
                const data = await res.json();
                const admin = data.localityInfo?.administrative || [];
                const adminDistrict = admin.find((a: any) => a.adminLevel === 5 || a.description?.toLowerCase().includes('district'))?.name
                  || admin[2]?.name || '';
                const adminTaluka = admin.find((a: any) => a.adminLevel === 6 || a.description?.toLowerCase().includes('taluk') || a.description?.toLowerCase().includes('subdistrict') || a.description?.toLowerCase().includes('tehsil'))?.name
                  || admin[3]?.name || '';

                village = (data.locality || data.city || '').replace(/\s+village$/i, '').trim();
                taluka = (adminTaluka || data.locality || '').replace(/\s+(taluka|taluk|tehsil|subdistrict|block)$/i, '').trim();
                district = (adminDistrict || data.principalSubdivision || '').replace(/\s+(district|dist\.?)$/i, '').trim();

                const informative = data.localityInfo?.informative || [];
                address = Array.from(new Set(informative
                  .filter((item: any) => /street|road|avenue|lane|highway|path/i.test(`${item?.name || ''} ${item?.description || ''}`))
                  .map((item: any) => String(item?.name || '').trim())
                  .filter(Boolean))).join(', ');
                locationResolved = Boolean(village || taluka || district || address);
              }
            } catch (bdcErr) {
              console.warn('[SampleForm] BigDataCloud reverse-geocode failed:', bdcErr);
            }
          }

          setValues((prev) => ({
            ...prev,
            latitude: String(lat),
            longitude: String(lng),
            testVillage: locationResolved ? sanitizeText(village) : prev.testVillage,
            testTaluka: locationResolved ? sanitizeText(taluka) : prev.testTaluka,
            testDistrict: locationResolved ? sanitizeText(district) : prev.testDistrict,
            testAddress: locationResolved ? sanitizeText(address) : prev.testAddress,
          }));
          setIsLocationFetched(locationResolved);
          setLocError(locationResolved ? '' : 'Unable to fetch location details. Please enter the location manually.');
          setErrors((prev) => ({
            ...prev,
            latitude: '',
            longitude: '',
            testVillage: '',
            testTaluka: '',
            testDistrict: '',
            testAddress: '',
          }));
        } catch (err: any) {
          console.warn('[SampleForm] Reverse geocoding error:', err);
          setIsLocationFetched(false);
          setLocError('Unable to fetch location details. Please enter the location manually.');
        } finally {
          setLocLoading(false);
        }
      },
      (error) => {
        setIsLocationFetched(false);
        const messages: Record<number, string> = {
          [error.PERMISSION_DENIED]: 'Location access was denied. Please allow location permissions in your browser.',
          [error.POSITION_UNAVAILABLE]: 'Location information is currently unavailable.',
          [error.TIMEOUT]: 'Location request timed out. Please enter manually.',
        };
        setLocError(messages[error.code] || 'Unable to fetch location. Please enter latitude and longitude manually.');
        setLocLoading(false);
      },
      { enableHighAccuracy: true, timeout: 8000, maximumAge: 60000 }
    );
  };

  const getErrors = (): Partial<Record<keyof FormValues, string>> => {
    const errs: Partial<Record<keyof FormValues, string>> = {};
    const invalidCharRegex = /[^a-zA-Z0-9 ]/;
    const invalidIdRegex = /[^a-zA-Z0-9\-_]/;

    if (!values.sampleId.trim()) {
      errs.sampleId = 'Sample ID is required.';
    } else if (invalidIdRegex.test(values.sampleId)) {
      errs.sampleId = 'Commas and special characters are not allowed.';
    } else if (values.sampleId.length > SAMPLE_LIMITS.SAMPLE_ID) {
      errs.sampleId = `Max ${SAMPLE_LIMITS.SAMPLE_ID} characters`;
    }

    if (!values.userId.trim()) {
      errs.userId = 'User ID is required.';
    } else if (invalidIdRegex.test(values.userId)) {
      errs.userId = 'Commas and special characters are not allowed.';
    } else if (values.userId.length > SAMPLE_LIMITS.USER_ID) {
      errs.userId = `Max ${SAMPLE_LIMITS.USER_ID} characters`;
    }

    const textFields: (keyof FormValues)[] = [
      'modeOfSample', 'sampleType', 'source', 'mainSource', 'customer',
      'habitation', 'testVillage', 'testTaluka', 'testDistrict', 'testAddress'
    ];
    for (const f of textFields) {
      if (values[f] && invalidCharRegex.test(values[f])) {
        errs[f] = 'Commas and special characters are not allowed.';
      }
    }

    if (values.modeOfSample.length > SAMPLE_LIMITS.MODE_OF_SAMPLE) errs.modeOfSample = `Max ${SAMPLE_LIMITS.MODE_OF_SAMPLE} characters`;
    if (values.sampleType.length > SAMPLE_LIMITS.SAMPLE_TYPE) errs.sampleType = `Max ${SAMPLE_LIMITS.SAMPLE_TYPE} characters`;
    if (values.source.length > SAMPLE_LIMITS.SAMPLE_SOURCE) errs.source = `Max ${SAMPLE_LIMITS.SAMPLE_SOURCE} characters`;
    if (values.mainSource.length > SAMPLE_LIMITS.MAIN_SOURCE) errs.mainSource = `Max ${SAMPLE_LIMITS.MAIN_SOURCE} characters`;
    if (values.customer.length > SAMPLE_LIMITS.CUSTOMER) errs.customer = `Max ${SAMPLE_LIMITS.CUSTOMER} characters`;
    if (values.customerAddress.length > SAMPLE_LIMITS.CUSTOMER_ADDRESS) errs.customerAddress = `Max ${SAMPLE_LIMITS.CUSTOMER_ADDRESS} characters`;
    if (values.customerReferenceNo.length > SAMPLE_LIMITS.CUSTOMER_REFERENCE_NO) errs.customerReferenceNo = `Max ${SAMPLE_LIMITS.CUSTOMER_REFERENCE_NO} characters`;
    if (values.sampleSubmittedBy.length > SAMPLE_LIMITS.SAMPLE_SUBMITTED_BY) errs.sampleSubmittedBy = `Max ${SAMPLE_LIMITS.SAMPLE_SUBMITTED_BY} characters`;
    if (values.testReportNo.length > SAMPLE_LIMITS.TEST_REPORT_NO) errs.testReportNo = `Max ${SAMPLE_LIMITS.TEST_REPORT_NO} characters`;

    // Dates limit is essentially length of string but we can enforce it just in case
    if (values.sampleDateOfIssue.length > SAMPLE_LIMITS.SAMPLE_DATE_OF_ISSUE) errs.sampleDateOfIssue = `Invalid date`;
    if (values.sampleSubmittedDate.length > SAMPLE_LIMITS.SAMPLE_SUBMITTED_DATE) errs.sampleSubmittedDate = `Invalid date`;

    if (values.habitation.length > SAMPLE_LIMITS.HABITATION) errs.habitation = `Max ${SAMPLE_LIMITS.HABITATION} characters`;
    if (values.testVillage.length > SAMPLE_LIMITS.SAMPLE_TEST_VILLAGE) errs.testVillage = `Max ${SAMPLE_LIMITS.SAMPLE_TEST_VILLAGE} characters`;
    if (values.testTaluka.length > SAMPLE_LIMITS.SAMPLE_TEST_TALUKA) errs.testTaluka = `Max ${SAMPLE_LIMITS.SAMPLE_TEST_TALUKA} characters`;
    if (values.testDistrict.length > SAMPLE_LIMITS.SAMPLE_TEST_DISTRICT) errs.testDistrict = `Max ${SAMPLE_LIMITS.SAMPLE_TEST_DISTRICT} characters`;
    if (values.testAddress.length > SAMPLE_LIMITS.SAMPLE_TEST_ADDRESS) errs.testAddress = `Max ${SAMPLE_LIMITS.SAMPLE_TEST_ADDRESS} characters`;

    if (values.latitude.trim()) {
      if (values.latitude.length > SAMPLE_LIMITS.SAMPLE_TEST_LATITUDE) errs.latitude = `Max ${SAMPLE_LIMITS.SAMPLE_TEST_LATITUDE} characters`;
      const n = Number(values.latitude);
      if (isNaN(n) || n < -90 || n > 90) errs.latitude = 'Must be between -90 and 90.';
    }
    if (values.longitude.trim()) {
      if (values.longitude.length > SAMPLE_LIMITS.SAMPLE_TEST_LONGITUDE) errs.longitude = `Max ${SAMPLE_LIMITS.SAMPLE_TEST_LONGITUDE} characters`;
      const n = Number(values.longitude);
      if (isNaN(n) || n < -180 || n > 180) errs.longitude = 'Must be between -180 and 180.';
    }
    return errs;
  };

  const validate = (): boolean => {
    const errs = getErrors();
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const currentErrors = getErrors();
  const hasLimitError = Object.values(currentErrors).some(err => err.includes('Max '));

  const getDisplayError = (key: keyof FormValues) => {
    const err = currentErrors[key];
    if (!err) return undefined;
    if (err.includes('required') && !hasSubmitted) return undefined;
    return err;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setHasSubmitted(true);
    if (!validate()) return;
    onSubmit({
      sampleId: values.sampleId.trim(),
      userId: values.userId.trim(),
      createdDate: values.createdDate,
      endDate: values.endDate,
      modeOfSample: values.modeOfSample.trim(),
      sampleType: values.sampleType.trim(),
      source: values.source.trim(),
      mainSource: values.mainSource.trim(),
      customer: values.customer.trim(),
      customerAddress: values.customerAddress.trim(),
      sampleDateOfIssue: values.sampleDateOfIssue,
      habitation: values.habitation.trim(),
      testVillage: values.testVillage.trim(),
      testTaluka: values.testTaluka.trim(),
      testDistrict: values.testDistrict.trim(),
      testAddress: values.testAddress.trim(),
      latitude: values.latitude.trim() !== '' ? Number(values.latitude) : '',
      longitude: values.longitude.trim() !== '' ? Number(values.longitude) : '',
      sampleSubmittedDate: values.sampleSubmittedDate,
      customerReferenceNo: values.customerReferenceNo.trim(),
      sampleSubmittedBy: values.sampleSubmittedBy.trim(),
      testReportNo: values.testReportNo.trim(),
    });
  };

  const txt = (key: keyof FormValues, placeholder: string, disabled?: boolean, overrideLabel?: string) => {
    const fieldError = getDisplayError(key);
    const isError = !!fieldError;

    const labelStr = overrideLabel || (key === 'modeOfSample' ? 'Mode of Sample' : key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase()));
    const maxLength = ({
      customer: SAMPLE_LIMITS.CUSTOMER,
      habitation: SAMPLE_LIMITS.HABITATION,
      customerReferenceNo: SAMPLE_LIMITS.CUSTOMER_REFERENCE_NO,
      sampleSubmittedBy: SAMPLE_LIMITS.SAMPLE_SUBMITTED_BY,
      testReportNo: SAMPLE_LIMITS.TEST_REPORT_NO,
    } as Partial<Record<keyof FormValues, number>>)[key];

    return (
      <Field label={labelStr} error={fieldError}>
        <input
          type="text"
          value={values[key]}
          onChange={(e) => set(key, sanitizeText(e.target.value))}
          maxLength={maxLength}
          placeholder={placeholder}
          disabled={isSubmitting || !!disabled}
          className={inputClass(isError)}
        />
      </Field>
    );
  };

  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-col h-full">
      <div className="grid grid-cols-1 gap-x-6 gap-y-4 sm:grid-cols-2 p-6 overflow-y-auto">
        <SectionHeading>General Information</SectionHeading>

        <Field label="Sample ID" required error={getDisplayError('sampleId')}>
          <input type="text" value={values.sampleId}
            onChange={(e) => set('sampleId', sanitizeIdentifier(e.target.value))}
            placeholder="Enter sample ID"
            disabled={isSubmitting || isEdit}
            className={inputClass(!!getDisplayError('sampleId'))} />
        </Field>

        <Field label="User ID" required error={getDisplayError('userId')}>
          <input type="text" value={values.userId}
            onChange={(e) => set('userId', sanitizeIdentifier(e.target.value))}
            placeholder="Enter user ID"
            disabled={isSubmitting || isEdit}
            className={inputClass(!!getDisplayError('userId'))} />
        </Field>

        {txt('modeOfSample', 'Enter mode of sample')}
        {txt('sampleType', 'Enter sample type')}
        {txt('source', 'Enter sample source')}
        {txt('mainSource', 'Enter main source')}
        {txt('customer', 'Enter customer name', false, 'Customer Name')}

        <Field label="Customer Address" error={getDisplayError('customerAddress')}>
          <input type="text" value={values.customerAddress}
            onChange={(e) => set('customerAddress', sanitizeText(e.target.value))}
            maxLength={SAMPLE_LIMITS.CUSTOMER_ADDRESS}
            placeholder="Enter customer address"
            disabled={isSubmitting} className={inputClass(!!getDisplayError('customerAddress'))} />
        </Field>

        <Field label="Date of Issue" error={getDisplayError('sampleDateOfIssue')}>
          <input type="date" value={values.sampleDateOfIssue}
            onChange={(e) => set('sampleDateOfIssue', e.target.value)}
            disabled={isSubmitting} className={inputClass(!!getDisplayError('sampleDateOfIssue'))} />
        </Field>

        <Field label="Submitted Date" error={getDisplayError('sampleSubmittedDate')}>
          <input type="date" value={values.sampleSubmittedDate}
            onChange={(e) => set('sampleSubmittedDate', e.target.value)}
            disabled={isSubmitting} className={inputClass(!!getDisplayError('sampleSubmittedDate'))} />
        </Field>

        {txt('habitation', 'Enter habitation', false, 'Habitation')}

        <Field label="Customer Reference No.">
          <input type="text" value={values.customerReferenceNo}
            onChange={(e) => set('customerReferenceNo', sanitizeText(e.target.value))}
            maxLength={SAMPLE_LIMITS.CUSTOMER_REFERENCE_NO}
            placeholder="Enter customer reference no."
            disabled={isSubmitting} className={inputClass(false)} />
        </Field>

        <Field label="Sample Submitted By">
          <input type="text" value={values.sampleSubmittedBy}
            onChange={(e) => set('sampleSubmittedBy', sanitizeText(e.target.value))}
            maxLength={SAMPLE_LIMITS.SAMPLE_SUBMITTED_BY}
            placeholder="Enter submitted by"
            disabled={isSubmitting} className={inputClass(false)} />
        </Field>

        <Field label="Test Report No.">
          <input type="text" value={values.testReportNo}
            onChange={(e) => set('testReportNo', sanitizeText(e.target.value))}
            maxLength={SAMPLE_LIMITS.TEST_REPORT_NO}
            placeholder="Enter test report no."
            disabled={isSubmitting} className={inputClass(false)} />
        </Field>

        <SectionHeading
          action={
            <button
              type="button"
              onClick={fetchLocation}
              disabled={isSubmitting || locLoading}
              title="Fetch all location details automatically"
              className="inline-flex items-center gap-1.5 rounded-lg border border-brand-200 bg-brand-50 px-3 py-1.5 text-xs font-semibold text-brand-700 hover:bg-brand-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {locLoading ? <Loader2 size={13} className="animate-spin" /> : <MapPin size={13} />}
              <span>{locLoading ? 'Fetching...' : 'Fetch Location'}</span>
            </button>
          }
        >
          Location Details
        </SectionHeading>

        {txt('testVillage', 'Enter village', isLocationFetched, 'Village')}
        {txt('testTaluka', 'Enter taluka', isLocationFetched, 'Taluka')}
        {txt('testDistrict', 'Enter district', isLocationFetched, 'District')}

        <div className="sm:col-span-2">
          {txt('testAddress', 'Enter test address', isLocationFetched, 'Address')}
        </div>

        <Field label="Latitude" error={getDisplayError('latitude')}>
          <input type="text" inputMode="decimal" pattern="[0-9.-]*" value={values.latitude}
          onChange={(e) => set('latitude', sanitizeCoordinate(e.target.value))}
            placeholder="e.g. 23.0225" disabled={isSubmitting || isLocationFetched}
            className={inputClass(!!getDisplayError('latitude'))} />
        </Field>

        <Field label="Longitude" error={getDisplayError('longitude')}>
          <input type="text" inputMode="decimal" pattern="[0-9.-]*" value={values.longitude}
          onChange={(e) => set('longitude', sanitizeCoordinate(e.target.value))}
            placeholder="e.g. 72.5714" disabled={isSubmitting || isLocationFetched}
            className={inputClass(!!getDisplayError('longitude'))} />
        </Field>

        {locError && (
          <div className="sm:col-span-2">
            <p className="flex items-center gap-1.5 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs font-medium text-amber-700">
              <AlertCircle size={13} className="shrink-0" />
              {locError}
            </p>
          </div>
        )}

      </div>

      <div className="flex justify-end gap-3 border-t border-industrial-100 p-4 bg-gray-50/80 sticky bottom-0 z-10 shrink-0">
        <button type="button" onClick={onCancel} disabled={isSubmitting}
          className="rounded-lg border border-industrial-200 bg-white px-5 py-2.5 text-sm font-semibold text-industrial-700 shadow-xs hover:bg-industrial-50 disabled:opacity-50 transition-colors">
          Cancel
        </button>
        <button type="submit" disabled={isSubmitting || hasLimitError}
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-brand-600 px-6 py-2.5 text-sm font-bold text-white shadow-md hover:bg-brand-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-[0.99]">
          {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
          <span>{submitLabel}</span>
        </button>
      </div>
    </form>
  );
};

export default SampleForm;
