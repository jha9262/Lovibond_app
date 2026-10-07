import React from 'react';
import { Document, Page, View, Text, Image } from '@react-pdf/renderer';
import { BRAND_LOGO_FALLBACK_URL } from '../constants/branding';
import { S } from './reportStyles';
import type { ReportData } from './types';

/* ── null-safe display helper ────────────────────────────────── */
const v = (val: string | null | undefined, fallback = '\u2014'): string => {
  if (val === null || val === undefined) return fallback;
  const s = String(val).trim();
  if (s === '' || s.toLowerCase() === 'null' || s.toLowerCase() === 'n/a') return fallback;
  return s;
};

/* ── Props ────────────────────────────────────────────────────── */
interface TestReportTemplateProps {
  data: ReportData;
}

/**
 * Pure PDF template component for A4 laboratory Test Reports.
 *
 * IMPORTANT: This template contains ZERO data fetching or transformation.
 * It receives fully typed `ReportData` and renders a professional,
 * selectable, searchable PDF document.
 *
 * Data transformation happens in utils/transformReportData.ts.
 */
export const TestReportTemplate: React.FC<TestReportTemplateProps> = ({ data }) => {
  const { topHeader, bottomDetails, meta, testResults } = data;
  // React-PDF doesn't support the sidebar's image onError fallback, so use the
  // packaged local asset directly for reliable preview and download rendering.
  const logoSrc = BRAND_LOGO_FALLBACK_URL;

  /* ── derived display values ────────────────────────────────── */
  const infoRight: [string, string | undefined][] = [
    ['Customer Ref. No.:',        meta['CUSTOMER REF NO']],
    ['Sample Submitted By:',      meta['SAMPLE SUBMITTED BY']],
    ['Date of Sample Receipt:',   meta['DATE OF SAMPLE RECEIPT']],
    ['Analysis Starting Date:',   meta['ANALYSIS STARTING DATE']],
    ['Analysis Completion Date:', meta['ANALYSIS END DATE']],
    ['ULR No.:',                  meta.ULR_NO],
    ['Discipline:',               meta.DISCIPLINE],
    ['Group:',                    meta.GROUP],
  ];

  const detailRows: [string, string | undefined, string, string | undefined][] = [
    ['Test Report No.',  meta['TEST REPORT NO'],  'Date of Issue',  meta['DATE OF ISSUE']],
    ['Sample ID',        meta['SAMPLE ID'],       'Mode of Sample', meta['MODE OF SAMPLE']],
    ['Main Source',      meta['MAIN SOURCE'],     'Source',         meta.SAMPLE_SOURCE],
    ['Location',         meta.LOCATION,           'Habitation',     meta.HABITATION],
    ['Village',          meta.VILLAGE,            'District',       meta.DISTRICT],
    ['Taluka',           meta.TALUKA,             'Longitude',      meta.LONGITUDE],
    ['Latitude',         meta.LATITUDE,           'Sample Type',    meta['SAMPLE TYPE']],
  ];

  return (
    <Document>
      <Page size="A4" style={S.page}>
        <View style={S.outerBorder}>

          {/* ── HEADER ─────────────────────────────────────────── */}
          <View style={S.header}>
            <View style={S.headerLogo}>
              <Image src={logoSrc} style={S.logoImage} />
            </View>
            <View style={S.headerCenter}>
              <Text style={S.hLine1}>{v(topHeader.M_H_1, 'Gujarat Water Supply & Sewerage Board')}</Text>
              <Text style={S.hLine2}>{v(topHeader.M_H_2, 'Central Laboratory')}</Text>
              <Text style={S.hLine3}>{v(topHeader.M_H_3, 'State Referral Institute')}</Text>
              <Text style={S.hLine4}>{v(topHeader.M_H_4, 'Gujarat Jalseva Training Institute')}</Text>
              <Text style={S.hLine5}>{v(topHeader.M_H_5, "Sector-15, 'G' - Road, Gandhinagar - 382016")}</Text>
            </View>
            <View style={S.headerAccreditation}>
              <Image src={logoSrc} style={S.logoImage} />
              <Text style={S.accreditationRef}>{v(topHeader.R_H_1, '')}</Text>
              <Text style={S.accreditationRef}>{v(topHeader.R_H_2, '')}</Text>
            </View>
          </View>

          {/* ── TITLE ──────────────────────────────────────────── */}
          <Text style={S.title}>TEST REPORT</Text>

          {/* ── INFO SECTION ───────────────────────────────────── */}
          <View style={S.infoSection}>
            <View style={S.infoCol}>
              <View style={S.infoRow}>
                <Text style={S.infoLabel}>Name &amp; Address of Customer:</Text>
              </View>
              <View style={S.infoRow}>
                <Text style={S.infoVal}>{v(meta['CUSTOMER NAME'], '')}</Text>
              </View>
              <View style={S.infoRow}>
                <Text style={S.infoVal}>
                  {v(meta['CUSTOMER ADDRESS '] || meta['CUSTOMER ADDRESS'], '')}
                </Text>
              </View>
            </View>
            <View style={S.infoCol}>
              {infoRight.map(([label, val]) => (
                <View style={S.infoRow} key={label}>
                  <Text style={S.infoLabel}>{label} </Text>
                  <Text style={S.infoVal}>{v(val, '')}</Text>
                </View>
              ))}
            </View>
          </View>

          {/* ── DETAILS TABLE ──────────────────────────────────── */}
          <View style={S.dtable}>
            {detailRows.map(([l1, v1, l2, v2], i) => (
              <View style={[S.drow, i > 0 ? { marginTop: -0.6 } : {}]} key={l1}>
                <Text style={S.dlbl}>{l1}</Text>
                <Text style={S.dval}>{v(v1)}</Text>
                <Text style={[S.dlbl, { borderLeft: 0 }]}>{l2}</Text>
                <Text style={S.dval}>{v(v2)}</Text>
              </View>
            ))}
          </View>

          {/* ── RESULTS INTRO ──────────────────────────────────── */}
          <Text style={S.intro}>Kindly find herewith the Analyzed Results</Text>

          {/* ── RESULTS TABLE ──────────────────────────────────── */}
          <View style={S.rtable}>
            {/* header row */}
            <View style={S.rhead}>
              <Text style={S.thSr}>Sr.{'\n'}No.</Text>
              <Text style={S.thParam}>Parameter</Text>
              <Text style={S.thUnit}>Unit</Text>
              <Text style={S.thMethod}>Reference Method</Text>
              <Text style={S.thAccept}>Acceptable{'\n'}Limit</Text>
              <Text style={S.thPermis}>Permissible Limit in the{'\n'}Absence of Alternate Source</Text>
              <Text style={S.thResult}>Analytical{'\n'}Value</Text>
            </View>
            {/* body rows — dynamically populated from API data */}
            {testResults.map((row, i) => (
              <View style={S.rrow} key={`result-${i}`}>
                <Text style={S.tdSr}>{v(row.srNo, '')}</Text>
                <Text style={S.tdParam}>{v(row.parameter, '')}</Text>
                <Text style={S.tdUnit}>{v(row.unit, '')}</Text>
                <Text style={S.tdMethod}>{v(row.referenceMethod, '')}</Text>
                <Text style={S.tdAccept}>{v(row.acceptableLimit, '\u2014')}</Text>
                <Text style={S.tdPermis}>{v(row.permissibleLimit, '\u2014')}</Text>
                <Text style={S.tdResult}>{v(row.analyticalValue, '\u2014')}</Text>
              </View>
            ))}
          </View>

          {/* ── NOTES ──────────────────────────────────────────── */}
          <View style={S.notes}>
            <Text style={S.notesH}>This Report is issued under the following terms &amp; conditions:</Text>
            <Text style={S.notesI}>1. This report is referring only to the tested sample and for applicable parameters.</Text>
            <Text style={S.notesI}>2. This sample will be destroyed after retention time unless otherwise specified specially.</Text>
            <Text style={S.notesI}>3. This report is not to be reproduced wholly or in part, and can't be used as evidence in court of law.</Text>
            <Text style={S.notesI}>4. Please refer back page for IS 10500:2012 (2nd Revision) limits.</Text>
          </View>

          {/* ── SIGNATURES ─────────────────────────────────────── */}
          <View style={S.sigs}>
            <View style={S.sig}>
              <Text style={S.sigLbl}>Checked By :</Text>
              <View style={S.sigSpace} />
              <Text style={S.sigName}>{v(bottomDetails.CHECKED_BY_NAME, '')}</Text>
              <Text style={S.sigDes}>{v(bottomDetails.CHECKED_BY_DES, '')}</Text>
            </View>
            <View style={S.sig}>
              <Text style={S.sigLbl}>Issued By :</Text>
              <View style={S.sigSpace} />
              <Text style={S.sigName}>{v(bottomDetails.ISSUED_BY_NAME, '')}</Text>
              <Text style={S.sigDes}>{v(bottomDetails.ISSUED_BY_DES, '')}</Text>
            </View>
          </View>

          {/* ── FOOTER ─────────────────────────────────────────── */}
          <View style={S.footer}>
            <Text style={S.footerEnd}>
              ————————————  End of the Test Report  ————————————
            </Text>
            <Text style={S.footerOw}>{v(bottomDetails.L_F_1, '')}</Text>
            <Text style={S.footerAddr}>{v(bottomDetails.M_F_1, '')}</Text>
            <Text style={S.footerContact}>{v(bottomDetails.M_F_2, '')}</Text>
          </View>

        </View>
      </Page>
    </Document>
  );
};

export default TestReportTemplate;
