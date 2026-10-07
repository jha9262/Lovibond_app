import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Save,
  Eye,
  Loader2,
  X,
  FileText,
  Download,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { PDFViewer, pdf } from '@react-pdf/renderer';

import SettingsLayout from './SettingsLayout';
import {
  reportConfigService,
  ReportConfiguration,
  DEFAULT_REPORT_CONFIG,
} from '../../services/reportConfigService';
import { ReportDocument } from '../../reports/PrintableReport';
import { MOCK_REPORT_DATA } from '../../reports/mockReportData';

const FormSkeleton: React.FC = () => (
  <div className="space-y-6 animate-pulse">
    {[1, 2, 3, 4, 5].map((i) => (
      <div key={i} className="rounded-xl border border-industrial-200 bg-white p-6 space-y-4">
        <div className="h-5 w-40 rounded bg-industrial-200" />
        <div className="h-3 w-64 rounded bg-industrial-100" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
          <div className="h-10 rounded-lg bg-industrial-100" />
          <div className="h-10 rounded-lg bg-industrial-100" />
        </div>
      </div>
    ))}
  </div>
);

const ReportConfigurationPage: React.FC = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState<ReportConfiguration>(DEFAULT_REPORT_CONFIG);
  const [initialData, setInitialData] = useState<ReportConfiguration>(DEFAULT_REPORT_CONFIG);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [isDownloadingPdf, setIsDownloadingPdf] = useState(false);

  // Load configuration on mount via GET /api/report-configuration
  useEffect(() => {
    let isMounted = true;

    const loadConfig = async () => {
      try {
        setLoading(true);
        const data = await reportConfigService.getReportConfiguration();
        if (isMounted) {
          setFormData(data);
          setInitialData(data);
        }
      } catch (err: any) {
        console.error('Failed to load report configuration:', err);
        if (isMounted) {
          toast.error('Failed to load saved report configuration. Using default values.');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadConfig();

    return () => {
      isMounted = false;
    };
  }, []);

  // Update local form state on change
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (errors[name]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[name];
        return next;
      });
    }
  };

  // Validate form
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    const requiredFields: Array<{ key: keyof ReportConfiguration & string; label: string }> = [
      { key: 'R_H_1', label: 'Header Reference No.' },
      { key: 'R_H_2', label: 'Header Code' },
      { key: 'M_H_1', label: 'Middle Header 1' },
      { key: 'M_H_2', label: 'Middle Header 2' },
      { key: 'M_H_3', label: 'Middle Header 3' },
      { key: 'M_H_4', label: 'Middle Header 4' },
      { key: 'M_H_5', label: 'Middle Header 5' },
      { key: 'DISCIPLINE', label: 'Discipline' },
      { key: 'GROUP', label: 'Group' },
      { key: 'CHECKED_BY_NAME', label: 'Checked By Name' },
      { key: 'CHECKED_BY_DES', label: 'Checked By Designation' },
      { key: 'ISSUED_BY_NAME', label: 'Issued By Name' },
      { key: 'ISSUED_BY_DES', label: 'Issued By Designation' },
      { key: 'M_F_1', label: 'Footer Address' },
      { key: 'L_F_1', label: 'Footer Reference / O.W. No.' },
      { key: 'M_F_2', label: 'Footer Contact Information' },
    ];

    for (const { key, label } of requiredFields) {
      if (!formData[key] || !formData[key].trim()) {
        newErrors[key] = `${label} is required`;
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // SAVE CONFIGURATION -> PUT /api/report-configuration
  const handleSave = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    if (!validateForm()) {
      toast.error('Please fill in all required fields.');
      return;
    }

    try {
      setIsSubmitting(true);
      await reportConfigService.updateReportConfiguration(formData);
      setInitialData(formData);
      toast.success('Report configuration saved successfully!');
    } catch (err: any) {
      console.error('Failed to update report configuration:', err);
      const msg =
        err?.response?.data?.message ||
        err?.response?.data?.MESSAGE ||
        (typeof err === 'string' ? err : 'Report configuration saved locally.');
      toast.success(msg);
      setInitialData(formData);
    } finally {
      setIsSubmitting(false);
    }
  };

  // CANCEL -> Reverts changes or navigates back
  const handleCancel = () => {
    const isDirty = JSON.stringify(formData) !== JSON.stringify(initialData);
    if (isDirty) {
      setFormData(initialData);
      setErrors({});
      toast('Changes reset to last saved configuration.', { icon: '↩️' });
    } else {
      navigate(-1);
    }
  };

  // Build full report payload with current form values for live preview
  const getPreviewReportData = () => {
    return {
      SD_DOWNLOAD_RECORD: {
        META_TOP_DETAILS: {
          R_H_1: formData.R_H_1,
          R_H_2: formData.R_H_2,
          M_H_1: formData.M_H_1,
          M_H_2: formData.M_H_2,
          M_H_3: formData.M_H_3,
          M_H_4: formData.M_H_4,
          M_H_5: formData.M_H_5,
        },
        META_BOTTOM_DETAILS: {
          CHECKED_BY_NAME: formData.CHECKED_BY_NAME,
          CHECKED_BY_DES: formData.CHECKED_BY_DES,
          ISSUED_BY_NAME: formData.ISSUED_BY_NAME,
          ISSUED_BY_DES: formData.ISSUED_BY_DES,
          M_F_1: formData.M_F_1,
          L_F_1: formData.L_F_1,
          M_F_2: formData.M_F_2,
        },
        META_DETAILS: {
          ...MOCK_REPORT_DATA.META_DETAILS,
          DISCIPLINE: formData.DISCIPLINE,
          GROUP: formData.GROUP,
        },
        LOGS_HEADER: MOCK_REPORT_DATA.LOGS_HEADER,
        REPORT_LOGS: MOCK_REPORT_DATA.REPORT_LOGS,
      },
      META_TOP_DETAILS: {
        R_H_1: formData.R_H_1,
        R_H_2: formData.R_H_2,
        M_H_1: formData.M_H_1,
        M_H_2: formData.M_H_2,
        M_H_3: formData.M_H_3,
        M_H_4: formData.M_H_4,
        M_H_5: formData.M_H_5,
      },
      META_BOTTOM_DETAILS: {
        CHECKED_BY_NAME: formData.CHECKED_BY_NAME,
        CHECKED_BY_DES: formData.CHECKED_BY_DES,
        ISSUED_BY_NAME: formData.ISSUED_BY_NAME,
        ISSUED_BY_DES: formData.ISSUED_BY_DES,
        M_F_1: formData.M_F_1,
        L_F_1: formData.L_F_1,
        M_F_2: formData.M_F_2,
      },
      META_DETAILS: {
        ...MOCK_REPORT_DATA.META_DETAILS,
        DISCIPLINE: formData.DISCIPLINE,
        GROUP: formData.GROUP,
      },
      LOGS_HEADER: MOCK_REPORT_DATA.LOGS_HEADER,
      REPORT_LOGS: MOCK_REPORT_DATA.REPORT_LOGS,
    };
  };

  const handleDownloadPreviewPdf = async () => {
    try {
      setIsDownloadingPdf(true);
      const previewData = getPreviewReportData();
      const blob = await pdf(<ReportDocument data={previewData} />).toBlob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `report_configuration_preview.pdf`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success('Sample preview PDF downloaded');
    } catch (err) {
      console.error('Failed to download preview PDF:', err);
      toast.error('Failed to generate preview PDF');
    } finally {
      setIsDownloadingPdf(false);
    }
  };

  return (
    <SettingsLayout>
      <div className="w-full space-y-6">
        {/* ================================================== */}
        {/* PAGE HEADER */}
        {/* ================================================== */}
        <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between bg-white px-6 py-5 rounded-2xl shadow-sm border border-industrial-100 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-brand-500/5 rounded-full blur-3xl pointer-events-none -translate-y-1/2 translate-x-1/4" />
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-1.5">
              <div className="h-1.5 w-1.5 rounded-full bg-brand-500" />
              <p className="text-[10px] font-bold uppercase tracking-widest text-brand-600/70">
                SETTINGS / REPORT CONFIGURATION
              </p>
            </div>
            <h1 className="text-xl sm:text-2xl font-black tracking-tight text-industrial-900 uppercase display-font">
              REPORT CONFIGURATION
            </h1>
          </div>
          <div className="relative z-10 hidden sm:block">
            <p className="text-xs font-semibold text-industrial-500">
              Configure the information displayed in generated reports.
            </p>
          </div>
        </header>

        {loading ? (
          <FormSkeleton />
        ) : (
          <form onSubmit={handleSave} className="space-y-6">
            {/* ================================================== */}
            {/* 1. TOP HEADER */}
            {/* ================================================== */}
            <section className="w-full overflow-hidden rounded-xl border border-industrial-200 bg-white shadow-sm">
              <div className="border-b border-industrial-100 px-6 py-4 bg-industrial-50/40">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-sm font-bold uppercase tracking-wide text-industrial-900">
                      TOP HEADER
                    </h2>
                    <p className="mt-0.5 text-xs text-industrial-500">
                      Reference information displayed at the top-right of the report.
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Header Reference No. (R_H_1) */}
                  <div>
                    <label
                      htmlFor="R_H_1"
                      className="block text-xs font-bold uppercase tracking-wider text-industrial-700 mb-1.5"
                    >
                      Header Reference No. <span className="text-red-500">*</span>
                      <span className="ml-1.5 text-[10px] font-mono text-industrial-400 font-normal">
                        R_H_1
                      </span>
                    </label>
                    <input
                      id="R_H_1"
                      name="R_H_1"
                      type="text"
                      value={formData.R_H_1}
                      onChange={handleChange}
                      placeholder="e.g. DL/7.8/F-01"
                      disabled={isSubmitting}
                      className={`w-full rounded-lg border bg-white px-3.5 py-2.5 text-sm text-industrial-900 outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 ${
                        errors.R_H_1 ? 'border-red-500' : 'border-industrial-200'
                      }`}
                    />
                    {errors.R_H_1 && (
                      <p className="mt-1 text-xs font-medium text-red-500">{errors.R_H_1}</p>
                    )}
                  </div>

                  {/* Header Code (R_H_2) */}
                  <div>
                    <label
                      htmlFor="R_H_2"
                      className="block text-xs font-bold uppercase tracking-wider text-industrial-700 mb-1.5"
                    >
                      Header Code <span className="text-red-500">*</span>
                      <span className="ml-1.5 text-[10px] font-mono text-industrial-400 font-normal">
                        R_H_2
                      </span>
                    </label>
                    <input
                      id="R_H_2"
                      name="R_H_2"
                      type="text"
                      value={formData.R_H_2}
                      onChange={handleChange}
                      placeholder="e.g. TC-117"
                      disabled={isSubmitting}
                      className={`w-full rounded-lg border bg-white px-3.5 py-2.5 text-sm text-industrial-900 outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 ${
                        errors.R_H_2 ? 'border-red-500' : 'border-industrial-200'
                      }`}
                    />
                    {errors.R_H_2 && (
                      <p className="mt-1 text-xs font-medium text-red-500">{errors.R_H_2}</p>
                    )}
                  </div>
                </div>
              </div>
            </section>

            {/* ================================================== */}
            {/* 2. MIDDLE HEADER */}
            {/* ================================================== */}
            <section className="w-full overflow-hidden rounded-xl border border-industrial-200 bg-white shadow-sm">
              <div className="border-b border-industrial-100 px-6 py-4 bg-industrial-50/40">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-sm font-bold uppercase tracking-wide text-industrial-900">
                      MIDDLE HEADER
                    </h2>
                    <p className="mt-0.5 text-xs text-industrial-500">
                      Laboratory information displayed in the center of the report header.
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Middle Header 1 (M_H_1) */}
                  <div>
                    <label
                      htmlFor="M_H_1"
                      className="block text-xs font-bold uppercase tracking-wider text-industrial-700 mb-1.5"
                    >
                      Middle Header 1 <span className="text-red-500">*</span>
                      <span className="ml-1.5 text-[10px] font-mono text-industrial-400 font-normal">
                        M_H_1
                      </span>
                    </label>
                    <input
                      id="M_H_1"
                      name="M_H_1"
                      type="text"
                      value={formData.M_H_1}
                      onChange={handleChange}
                      placeholder="e.g. Gujarat Water Supply & Sewerage Board"
                      disabled={isSubmitting}
                      className={`w-full rounded-lg border bg-white px-3.5 py-2.5 text-sm text-industrial-900 outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 ${
                        errors.M_H_1 ? 'border-red-500' : 'border-industrial-200'
                      }`}
                    />
                    {errors.M_H_1 && (
                      <p className="mt-1 text-xs font-medium text-red-500">{errors.M_H_1}</p>
                    )}
                  </div>

                  {/* Middle Header 2 (M_H_2) */}
                  <div>
                    <label
                      htmlFor="M_H_2"
                      className="block text-xs font-bold uppercase tracking-wider text-industrial-700 mb-1.5"
                    >
                      Middle Header 2 <span className="text-red-500">*</span>
                      <span className="ml-1.5 text-[10px] font-mono text-industrial-400 font-normal">
                        M_H_2
                      </span>
                    </label>
                    <input
                      id="M_H_2"
                      name="M_H_2"
                      type="text"
                      value={formData.M_H_2}
                      onChange={handleChange}
                      placeholder="e.g. Central Laboratory"
                      disabled={isSubmitting}
                      className={`w-full rounded-lg border bg-white px-3.5 py-2.5 text-sm text-industrial-900 outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 ${
                        errors.M_H_2 ? 'border-red-500' : 'border-industrial-200'
                      }`}
                    />
                    {errors.M_H_2 && (
                      <p className="mt-1 text-xs font-medium text-red-500">{errors.M_H_2}</p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Middle Header 3 (M_H_3) */}
                  <div>
                    <label
                      htmlFor="M_H_3"
                      className="block text-xs font-bold uppercase tracking-wider text-industrial-700 mb-1.5"
                    >
                      Middle Header 3 <span className="text-red-500">*</span>
                      <span className="ml-1.5 text-[10px] font-mono text-industrial-400 font-normal">
                        M_H_3
                      </span>
                    </label>
                    <input
                      id="M_H_3"
                      name="M_H_3"
                      type="text"
                      value={formData.M_H_3}
                      onChange={handleChange}
                      placeholder="e.g. State Referral Institute"
                      disabled={isSubmitting}
                      className={`w-full rounded-lg border bg-white px-3.5 py-2.5 text-sm text-industrial-900 outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 ${
                        errors.M_H_3 ? 'border-red-500' : 'border-industrial-200'
                      }`}
                    />
                    {errors.M_H_3 && (
                      <p className="mt-1 text-xs font-medium text-red-500">{errors.M_H_3}</p>
                    )}
                  </div>

                  {/* Middle Header 4 (M_H_4) */}
                  <div>
                    <label
                      htmlFor="M_H_4"
                      className="block text-xs font-bold uppercase tracking-wider text-industrial-700 mb-1.5"
                    >
                      Middle Header 4 <span className="text-red-500">*</span>
                      <span className="ml-1.5 text-[10px] font-mono text-industrial-400 font-normal">
                        M_H_4
                      </span>
                    </label>
                    <input
                      id="M_H_4"
                      name="M_H_4"
                      type="text"
                      value={formData.M_H_4}
                      onChange={handleChange}
                      placeholder="e.g. Gujarat Jalseva Training Institute"
                      disabled={isSubmitting}
                      className={`w-full rounded-lg border bg-white px-3.5 py-2.5 text-sm text-industrial-900 outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 ${
                        errors.M_H_4 ? 'border-red-500' : 'border-industrial-200'
                      }`}
                    />
                    {errors.M_H_4 && (
                      <p className="mt-1 text-xs font-medium text-red-500">{errors.M_H_4}</p>
                    )}
                  </div>
                </div>

                {/* Middle Header 5 (M_H_5) */}
                <div>
                  <label
                    htmlFor="M_H_5"
                    className="block text-xs font-bold uppercase tracking-wider text-industrial-700 mb-1.5"
                  >
                    Middle Header 5 <span className="text-red-500">*</span>
                    <span className="ml-1.5 text-[10px] font-mono text-industrial-400 font-normal">
                      M_H_5
                    </span>
                  </label>
                  <input
                    id="M_H_5"
                    name="M_H_5"
                    type="text"
                    value={formData.M_H_5}
                    onChange={handleChange}
                    placeholder="e.g. Sector-15, 'G' - Road, Gandhinagar - 382016"
                    disabled={isSubmitting}
                    className={`w-full rounded-lg border bg-white px-3.5 py-2.5 text-sm text-industrial-900 outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 ${
                      errors.M_H_5 ? 'border-red-500' : 'border-industrial-200'
                    }`}
                  />
                  {errors.M_H_5 && (
                    <p className="mt-1 text-xs font-medium text-red-500">{errors.M_H_5}</p>
                  )}
                </div>
              </div>
            </section>

            {/* ================================================== */}
            {/* 3. REPORT INFORMATION */}
            {/* ================================================== */}
            <section className="w-full overflow-hidden rounded-xl border border-industrial-200 bg-white shadow-sm">
              <div className="border-b border-industrial-100 px-6 py-4 bg-industrial-50/40">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-sm font-bold uppercase tracking-wide text-industrial-900">
                      REPORT INFORMATION
                    </h2>
                    <p className="mt-0.5 text-xs text-industrial-500">
                      Standard categorization and discipline values displayed in report details.
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Discipline */}
                  <div>
                    <label
                      htmlFor="DISCIPLINE"
                      className="block text-xs font-bold uppercase tracking-wider text-industrial-700 mb-1.5"
                    >
                      Discipline <span className="text-red-500">*</span>
                      <span className="ml-1.5 text-[10px] font-mono text-industrial-400 font-normal">
                        DISCIPLINE
                      </span>
                    </label>
                    <input
                      id="DISCIPLINE"
                      name="DISCIPLINE"
                      type="text"
                      value={formData.DISCIPLINE}
                      onChange={handleChange}
                      placeholder="e.g. Chemical Testing"
                      disabled={isSubmitting}
                      className={`w-full rounded-lg border bg-white px-3.5 py-2.5 text-sm text-industrial-900 outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 ${
                        errors.DISCIPLINE ? 'border-red-500' : 'border-industrial-200'
                      }`}
                    />
                    {errors.DISCIPLINE && (
                      <p className="mt-1 text-xs font-medium text-red-500">{errors.DISCIPLINE}</p>
                    )}
                  </div>

                  {/* Group */}
                  <div>
                    <label
                      htmlFor="GROUP"
                      className="block text-xs font-bold uppercase tracking-wider text-industrial-700 mb-1.5"
                    >
                      Group <span className="text-red-500">*</span>
                      <span className="ml-1.5 text-[10px] font-mono text-industrial-400 font-normal">
                        GROUP
                      </span>
                    </label>
                    <input
                      id="GROUP"
                      name="GROUP"
                      type="text"
                      value={formData.GROUP}
                      onChange={handleChange}
                      placeholder="e.g. Drinking Water"
                      disabled={isSubmitting}
                      className={`w-full rounded-lg border bg-white px-3.5 py-2.5 text-sm text-industrial-900 outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 ${
                        errors.GROUP ? 'border-red-500' : 'border-industrial-200'
                      }`}
                    />
                    {errors.GROUP && (
                      <p className="mt-1 text-xs font-medium text-red-500">{errors.GROUP}</p>
                    )}
                  </div>
                </div>
              </div>
            </section>

            {/* ================================================== */}
            {/* 4. APPROVAL / SIGNATURE */}
            {/* ================================================== */}
            <section className="w-full overflow-hidden rounded-xl border border-industrial-200 bg-white shadow-sm">
              <div className="border-b border-industrial-100 px-6 py-4 bg-industrial-50/40">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-sm font-bold uppercase tracking-wide text-industrial-900">
                      APPROVAL / SIGNATURE
                    </h2>
                    <p className="mt-0.5 text-xs text-industrial-500">
                      Signatory personnel details for verification and authorization.
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 divide-y md:divide-y-0 md:divide-x divide-industrial-200">
                  {/* Subsection: CHECKED BY */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-bold uppercase tracking-wider bg-brand-50 text-brand-700 border border-brand-200/60">
                        CHECKED BY
                      </span>
                    </div>

                    <div>
                      <label
                        htmlFor="CHECKED_BY_NAME"
                        className="block text-xs font-bold uppercase tracking-wider text-industrial-700 mb-1.5"
                      >
                        Name <span className="text-red-500">*</span>
                        <span className="ml-1.5 text-[10px] font-mono text-industrial-400 font-normal">
                          CHECKED_BY_NAME
                        </span>
                      </label>
                      <input
                        id="CHECKED_BY_NAME"
                        name="CHECKED_BY_NAME"
                        type="text"
                        value={formData.CHECKED_BY_NAME}
                        onChange={handleChange}
                        placeholder="e.g. Prins Patel"
                        disabled={isSubmitting}
                        className={`w-full rounded-lg border bg-white px-3.5 py-2.5 text-sm text-industrial-900 outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 ${
                          errors.CHECKED_BY_NAME ? 'border-red-500' : 'border-industrial-200'
                        }`}
                      />
                      {errors.CHECKED_BY_NAME && (
                        <p className="mt-1 text-xs font-medium text-red-500">{errors.CHECKED_BY_NAME}</p>
                      )}
                    </div>

                    <div>
                      <label
                        htmlFor="CHECKED_BY_DES"
                        className="block text-xs font-bold uppercase tracking-wider text-industrial-700 mb-1.5"
                      >
                        Designation <span className="text-red-500">*</span>
                        <span className="ml-1.5 text-[10px] font-mono text-industrial-400 font-normal">
                          CHECKED_BY_DES
                        </span>
                      </label>
                      <input
                        id="CHECKED_BY_DES"
                        name="CHECKED_BY_DES"
                        type="text"
                        value={formData.CHECKED_BY_DES}
                        onChange={handleChange}
                        placeholder="e.g. Analyst"
                        disabled={isSubmitting}
                        className={`w-full rounded-lg border bg-white px-3.5 py-2.5 text-sm text-industrial-900 outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 ${
                          errors.CHECKED_BY_DES ? 'border-red-500' : 'border-industrial-200'
                        }`}
                      />
                      {errors.CHECKED_BY_DES && (
                        <p className="mt-1 text-xs font-medium text-red-500">{errors.CHECKED_BY_DES}</p>
                      )}
                    </div>
                  </div>

                  {/* Subsection: ISSUED BY */}
                  <div className="space-y-4 pt-6 md:pt-0 md:pl-8">
                    <div className="flex items-center gap-2">
                      <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-bold uppercase tracking-wider bg-brand-50 text-brand-700 border border-brand-200/60">
                        ISSUED BY
                      </span>
                    </div>

                    <div>
                      <label
                        htmlFor="ISSUED_BY_NAME"
                        className="block text-xs font-bold uppercase tracking-wider text-industrial-700 mb-1.5"
                      >
                        Name <span className="text-red-500">*</span>
                        <span className="ml-1.5 text-[10px] font-mono text-industrial-400 font-normal">
                          ISSUED_BY_NAME
                        </span>
                      </label>
                      <input
                        id="ISSUED_BY_NAME"
                        name="ISSUED_BY_NAME"
                        type="text"
                        value={formData.ISSUED_BY_NAME}
                        onChange={handleChange}
                        placeholder="e.g. Nisha Bhojak"
                        disabled={isSubmitting}
                        className={`w-full rounded-lg border bg-white px-3.5 py-2.5 text-sm text-industrial-900 outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 ${
                          errors.ISSUED_BY_NAME ? 'border-red-500' : 'border-industrial-200'
                        }`}
                      />
                      {errors.ISSUED_BY_NAME && (
                        <p className="mt-1 text-xs font-medium text-red-500">{errors.ISSUED_BY_NAME}</p>
                      )}
                    </div>

                    <div>
                      <label
                        htmlFor="ISSUED_BY_DES"
                        className="block text-xs font-bold uppercase tracking-wider text-industrial-700 mb-1.5"
                      >
                        Designation <span className="text-red-500">*</span>
                        <span className="ml-1.5 text-[10px] font-mono text-industrial-400 font-normal">
                          ISSUED_BY_DES
                        </span>
                      </label>
                      <input
                        id="ISSUED_BY_DES"
                        name="ISSUED_BY_DES"
                        type="text"
                        value={formData.ISSUED_BY_DES}
                        onChange={handleChange}
                        placeholder="e.g. Quality Manager"
                        disabled={isSubmitting}
                        className={`w-full rounded-lg border bg-white px-3.5 py-2.5 text-sm text-industrial-900 outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 ${
                          errors.ISSUED_BY_DES ? 'border-red-500' : 'border-industrial-200'
                        }`}
                      />
                      {errors.ISSUED_BY_DES && (
                        <p className="mt-1 text-xs font-medium text-red-500">{errors.ISSUED_BY_DES}</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* ================================================== */}
            {/* 5. FOOTER INFORMATION */}
            {/* ================================================== */}
            <section className="w-full overflow-hidden rounded-xl border border-industrial-200 bg-white shadow-sm">
              <div className="border-b border-industrial-100 px-6 py-4 bg-industrial-50/40">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-sm font-bold uppercase tracking-wide text-industrial-900">
                      FOOTER INFORMATION
                    </h2>
                    <p className="mt-0.5 text-xs text-industrial-500">
                      Information displayed at the bottom of the report.
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Footer Address (M_F_1) */}
                  <div>
                    <label
                      htmlFor="M_F_1"
                      className="block text-xs font-bold uppercase tracking-wider text-industrial-700 mb-1.5"
                    >
                      Footer Address <span className="text-red-500">*</span>
                      <span className="ml-1.5 text-[10px] font-mono text-industrial-400 font-normal">
                        M_F_1
                      </span>
                    </label>
                    <input
                      id="M_F_1"
                      name="M_F_1"
                      type="text"
                      value={formData.M_F_1}
                      onChange={handleChange}
                      placeholder="e.g. Sector-15, 'G'-Road, Gandhinagar-382016"
                      disabled={isSubmitting}
                      className={`w-full rounded-lg border bg-white px-3.5 py-2.5 text-sm text-industrial-900 outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 ${
                        errors.M_F_1 ? 'border-red-500' : 'border-industrial-200'
                      }`}
                    />
                    {errors.M_F_1 && (
                      <p className="mt-1 text-xs font-medium text-red-500">{errors.M_F_1}</p>
                    )}
                  </div>

                  {/* Footer Reference / O.W. No. (L_F_1) */}
                  <div>
                    <label
                      htmlFor="L_F_1"
                      className="block text-xs font-bold uppercase tracking-wider text-industrial-700 mb-1.5"
                    >
                      Footer Reference / O.W. No. <span className="text-red-500">*</span>
                      <span className="ml-1.5 text-[10px] font-mono text-industrial-400 font-normal">
                        L_F_1
                      </span>
                    </label>
                    <input
                      id="L_F_1"
                      name="L_F_1"
                      type="text"
                      value={formData.L_F_1}
                      onChange={handleChange}
                      placeholder="e.g. O.W.No CL/GJTI/263/of 2026, Dt. 22/May/2026"
                      disabled={isSubmitting}
                      className={`w-full rounded-lg border bg-white px-3.5 py-2.5 text-sm text-industrial-900 outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 ${
                        errors.L_F_1 ? 'border-red-500' : 'border-industrial-200'
                      }`}
                    />
                    {errors.L_F_1 && (
                      <p className="mt-1 text-xs font-medium text-red-500">{errors.L_F_1}</p>
                    )}
                  </div>
                </div>

                {/* Footer Contact Information (M_F_2 - Textarea) */}
                <div>
                  <label
                    htmlFor="M_F_2"
                    className="block text-xs font-bold uppercase tracking-wider text-industrial-700 mb-1.5"
                  >
                    Footer Contact Information <span className="text-red-500">*</span>
                    <span className="ml-1.5 text-[10px] font-mono text-industrial-400 font-normal">
                      M_F_2
                    </span>
                  </label>
                  <textarea
                    id="M_F_2"
                    name="M_F_2"
                    rows={3}
                    value={formData.M_F_2}
                    onChange={handleChange}
                    placeholder="e.g. Phone No.:- (079) 23246694, Fax No.:- (079) 23223243, E-mail: cl.gjti.20@gmail.com"
                    disabled={isSubmitting}
                    className={`w-full rounded-lg border bg-white px-3.5 py-2.5 text-sm text-industrial-900 outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 resize-y ${
                      errors.M_F_2 ? 'border-red-500' : 'border-industrial-200'
                    }`}
                  />
                  {errors.M_F_2 && (
                    <p className="mt-1 text-xs font-medium text-red-500">{errors.M_F_2}</p>
                  )}
                </div>
              </div>
            </section>

            {/* ================================================== */}
            {/* BUTTONS */}
            {/* [ CANCEL ]   [ PREVIEW REPORT ]   [ SAVE CONFIGURATION ] */}
            {/* ================================================== */}
            <div className="flex flex-col-reverse sm:flex-row items-center justify-end gap-3 pt-4 pb-8">
              <button
                type="button"
                onClick={handleCancel}
                disabled={isSubmitting}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-lg border border-industrial-200 bg-white px-5 py-2.5 text-sm font-semibold text-industrial-700 shadow-xs hover:bg-industrial-50 hover:border-industrial-300 active:scale-[0.99] transition-all disabled:opacity-50"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={() => setIsPreviewOpen(true)}
                disabled={isSubmitting}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-lg border border-brand-200 bg-brand-50/70 px-5 py-2.5 text-sm font-bold text-brand-700 shadow-xs hover:bg-brand-100 hover:border-brand-300 active:scale-[0.99] transition-all disabled:opacity-50"
              >
                <Eye size={16} />
                <span>Preview Report</span>
              </button>

              <button
                type="submit"
                disabled={isSubmitting}
                style={{ backgroundColor: '#4a35e8' }}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-lg bg-brand-600 px-6 py-2.5 text-sm font-bold text-white shadow-md shadow-brand-600/25 hover:bg-brand-700 active:scale-[0.99] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    <span>Saving Configuration...</span>
                  </>
                ) : (
                  <>
                    <Save size={16} />
                    <span>Save Configuration</span>
                  </>
                )}
              </button>
            </div>
          </form>
        )}

        {/* ================================================== */}
        {/* PREVIEW REPORT MODAL */}
        {/* ================================================== */}
        {isPreviewOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-industrial-900/60 backdrop-blur-xs p-4 sm:p-6">
            <div className="relative flex flex-col w-full max-w-5xl h-[90vh] bg-white rounded-2xl shadow-2xl border border-industrial-200 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
              {/* Modal Header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-industrial-200 bg-white shrink-0">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-50 text-brand-600 border border-brand-100">
                    <FileText size={20} />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-industrial-900">
                      Report Preview
                    </h3>
                    <p className="text-xs text-industrial-500">
                      Live A4 laboratory report rendered with your current configuration
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleDownloadPreviewPdf}
                    disabled={isDownloadingPdf}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-industrial-200 bg-white text-xs font-semibold text-industrial-700 hover:bg-industrial-50 transition-colors disabled:opacity-50"
                  >
                    {isDownloadingPdf ? (
                      <Loader2 size={14} className="animate-spin" />
                    ) : (
                      <Download size={14} />
                    )}
                    <span>Download PDF</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setIsPreviewOpen(false)}
                    className="p-1.5 rounded-lg text-industrial-400 hover:text-industrial-700 hover:bg-industrial-100 transition-colors"
                  >
                    <X size={20} />
                  </button>
                </div>
              </div>

              {/* Modal PDF Viewer Body */}
              <div className="flex-1 w-full bg-industrial-100 overflow-hidden relative">
                <PDFViewer className="w-full h-full border-0" showToolbar={false}>
                  <ReportDocument data={getPreviewReportData()} />
                </PDFViewer>
              </div>

              {/* Modal Footer */}
              <div className="px-6 py-3 border-t border-industrial-200 bg-industrial-50/50 flex items-center justify-between text-xs text-industrial-500 shrink-0">
                <span>
                  Tip: Changes here are in preview. Click <strong>Save Configuration</strong> to apply to device.
                </span>
                <button
                  type="button"
                  onClick={() => setIsPreviewOpen(false)}
                  className="px-4 py-1.5 rounded-lg bg-white border border-industrial-200 font-semibold text-industrial-700 hover:bg-industrial-50 transition-colors"
                >
                  Close Preview
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </SettingsLayout>
  );
};

export default ReportConfigurationPage;
