import { StyleSheet } from '@react-pdf/renderer';

/**
 * Professional A4 Test Report PDF styles.
 * Separated from the template for clean architecture.
 * Uses Times-Roman / Times-Bold for an official laboratory report look.
 */
export const S = StyleSheet.create({
  /* ── page ───────────────────────────────────────────────────── */
  page: {
    fontFamily: 'Times-Roman',
    fontSize: 8,
    color: '#000',
    paddingTop: 18,
    paddingBottom: 18,
    paddingLeft: 24,
    paddingRight: 24,
    lineHeight: 1.15,
  },

  /* ── outer border ──────────────────────────────────────────── */
  outerBorder: {
    border: '1pt solid #000',
    padding: 8,
    flexGrow: 1,
  },

  /* ── header ─────────────────────────────────────────────────── */
  header: {
    borderBottom: '1.2pt solid #000',
    paddingBottom: 5,
    marginBottom: 3,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerLogo: { width: 70, minHeight: 56, alignItems: 'flex-start', justifyContent: 'center', flexShrink: 0 },
  logoImage: { width: 40, height: 40, objectFit: 'contain' },
  logoMark: {
    width: 42,
    height: 42,
    border: '1pt solid #333',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoMarkText: { fontSize: 7, fontFamily: 'Times-Bold', textAlign: 'center' },
  headerCenter: { flex: 1, alignItems: 'center', paddingHorizontal: 5 },
  headerAccreditation: { width: 70, minHeight: 56, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  accreditationRef: { fontSize: 6, textAlign: 'center', marginTop: 1 },
  hLine1: { fontSize: 11, fontFamily: 'Times-Bold', letterSpacing: 0.2 },
  hLine2: { fontSize: 9, fontFamily: 'Times-Bold', marginTop: 3 },
  hLine3: { fontSize: 8, marginTop: 3 },
  hLine4: { fontSize: 8, fontFamily: 'Times-Bold', marginTop: 3 },
  hLine5: { fontSize: 7.5, marginTop: 3 },

  /* ── title ──────────────────────────────────────────────────── */
  title: {
    textAlign: 'center',
    fontSize: 13,
    fontFamily: 'Times-Bold',
    textDecoration: 'underline',
    marginTop: 4,
    marginBottom: 5,
  },

  /* ── info section (customer / sample) ───────────────────────── */
  infoSection: {
    flexDirection: 'row',
    borderTop: '0.8pt solid #000',
    borderBottom: '0.8pt solid #000',
    paddingTop: 2,
    paddingBottom: 2,
    marginBottom: 3,
    gap: 6,
  },
  infoCol: { flex: 1 },
  infoRow: { flexDirection: 'row', marginBottom: 0.5 },
  infoLabel: { fontFamily: 'Times-Bold', fontSize: 7.5, marginRight: 2 },
  infoVal: { fontSize: 7.5, flex: 1, flexWrap: 'wrap' },

  /* ── details grid (two-column key-value pairs) ──────────────── */
  dtable: { marginBottom: 3 },
  drow: { flexDirection: 'row', minHeight: 17.5 },
  dlbl: {
    width: '18%',
    border: '0.6pt solid #000',
    padding: '3pt 5pt',
    fontFamily: 'Times-Bold',
    fontSize: 8,
    backgroundColor: '#f0f0f0',
  },
  dval: {
    width: '32%',
    border: '0.6pt solid #000',
    borderLeft: 0,
    padding: '3pt 5pt',
    fontSize: 8,
  },

  /* ── results intro ─────────────────────────────────────────── */
  intro: {
    fontSize: 8.5,
    fontFamily: 'Times-Bold',
    textDecoration: 'underline',
    marginBottom: 2,
  },

  /* ── results table ─────────────────────────────────────────── */
  rtable: { marginBottom: 2 },
  rhead: { flexDirection: 'row', backgroundColor: '#e8e8e8' },
  rrow: { flexDirection: 'row', minHeight: 19 },

  /* header cells */
  thSr:     { width: '5%',  border: '0.6pt solid #000', padding: '3pt 2pt', fontSize: 7.5, fontFamily: 'Times-Bold', textAlign: 'center' },
  thParam:  { width: '18%', border: '0.6pt solid #000', borderLeft: 0, padding: '3pt 3pt', fontSize: 7.5, fontFamily: 'Times-Bold', textAlign: 'center' },
  thUnit:   { width: '7%',  border: '0.6pt solid #000', borderLeft: 0, padding: '3pt 2pt', fontSize: 7.5, fontFamily: 'Times-Bold', textAlign: 'center' },
  thMethod: { width: '28%', border: '0.6pt solid #000', borderLeft: 0, padding: '3pt 3pt', fontSize: 7.5, fontFamily: 'Times-Bold', textAlign: 'center' },
  thAccept: { width: '11%', border: '0.6pt solid #000', borderLeft: 0, padding: '3pt 2pt', fontSize: 7.5, fontFamily: 'Times-Bold', textAlign: 'center' },
  thPermis: { width: '19%', border: '0.6pt solid #000', borderLeft: 0, padding: '3pt 2pt', fontSize: 7.5, fontFamily: 'Times-Bold', textAlign: 'center' },
  thResult: { width: '12%', border: '0.6pt solid #000', borderLeft: 0, padding: '3pt 2pt', fontSize: 7.5, fontFamily: 'Times-Bold', textAlign: 'center' },

  /* body cells */
  tdSr:     { width: '5%',  border: '0.6pt solid #000', borderTop: 0, padding: '3pt 2pt', fontSize: 8, textAlign: 'center' },
  tdParam:  { width: '18%', border: '0.6pt solid #000', borderLeft: 0, borderTop: 0, padding: '3pt 3pt', fontSize: 8, textAlign: 'left' },
  tdUnit:   { width: '7%',  border: '0.6pt solid #000', borderLeft: 0, borderTop: 0, padding: '3pt 2pt', fontSize: 8, textAlign: 'center' },
  tdMethod: { width: '28%', border: '0.6pt solid #000', borderLeft: 0, borderTop: 0, padding: '3pt 3pt', fontSize: 7, textAlign: 'left' },
  tdAccept: { width: '11%', border: '0.6pt solid #000', borderLeft: 0, borderTop: 0, padding: '3pt 2pt', fontSize: 8, textAlign: 'center' },
  tdPermis: { width: '19%', border: '0.6pt solid #000', borderLeft: 0, borderTop: 0, padding: '3pt 2pt', fontSize: 8, textAlign: 'center' },
  tdResult: { width: '12%', border: '0.6pt solid #000', borderLeft: 0, borderTop: 0, padding: '3pt 2pt', fontSize: 8, fontFamily: 'Times-Bold', textAlign: 'center' },

  /* ── notes ──────────────────────────────────────────────────── */
  notes: { marginBottom: 2 },
  notesH: { fontSize: 8, fontFamily: 'Times-Bold', marginBottom: 0.5 },
  notesI: { fontSize: 7.5, marginBottom: 0 },

  /* ── signatures ─────────────────────────────────────────────── */
  sigs: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 3,
    marginHorizontal: 24,
  },
  sig: { alignItems: 'center', minWidth: 80 },
  sigLbl: { fontSize: 8, fontFamily: 'Times-Bold', marginBottom: 1 },
  sigSpace: { height: 12 },
  sigName: { fontSize: 8, fontFamily: 'Times-Bold' },
  sigDes: { fontSize: 7 },

  /* ── footer ─────────────────────────────────────────────────── */
  footer: {
    borderTop: '0.6pt solid #ccc',
    paddingTop: 2,
    marginTop: 3,
    alignItems: 'center',
  },
  footerEnd: { fontSize: 8, fontFamily: 'Times-Bold', marginBottom: 1 },
  footerOw: { fontSize: 7.5, marginBottom: 0.5 },
  footerAddr: { fontSize: 7.5, marginBottom: 0.5 },
  footerContact: { fontSize: 7 },
});
