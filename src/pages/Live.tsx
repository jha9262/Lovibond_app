import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Menu } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import DashboardOverview from '../components/Home/DashboardOverview';
import HomeSidebar from '../components/Home/HomeSidebar';
import SampleManagement from '../components/Home/SampleManagement';
import ElectrochemistryPage from '../components/Electrochemistry/ElectrochemistryPage';
import PhotometryPage from '../components/Photometry/PhotometryPage';
import OtherParametersPage from '../components/OtherParameters/OtherParametersPage';
import { sampleService } from '../services/sampleService';
import { Sample, PaginationInfo } from '../types';

const Live: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [activeSection, setActiveSection] = useState('dashboard');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const [samples, setSamples] = useState<Sample[]>([]);
  const [pagination, setPagination] = useState<PaginationInfo>({ page: 1, limit: 1000, total: 0, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const requestRef = useRef({ page: 1, limit: 1000, search: '' });

  useEffect(() => {
    if (location.state?.section) {
      setActiveSection(location.state.section);
    }
  }, [location.state]);

  const loadSamples = useCallback(async (params = {}) => {
    const request = { ...requestRef.current, ...params };
    requestRef.current = request;
    try {
      setLoading(true);
      setError(false);
      const result = await sampleService.getSamples(request);
      setSamples(result.data);
      setPagination(result.pagination);
    } catch (err) {
      console.error('Unable to load samples:', err);
      setError(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadSamples();
  }, [loadSamples]);

  const selectSection = (section: string) => {
    if (section === 'samples') {
      navigate('/samples');
      setIsMobileMenuOpen(false);
      return;
    }
    if (section === 'report') {
      navigate('/report');
      setIsMobileMenuOpen(false);
      return;
    }
    if (section === 'settings') {
      const target = sessionStorage.getItem('lovibond_last_settings_route') || '/settings/device-communication';
      navigate(target);
      setIsMobileMenuOpen(false);
      return;
    }
    setActiveSection(section);
    setIsMobileMenuOpen(false);
  };

  const createSample = async (payloads: any) => {
    const requests = Array.isArray(payloads) ? payloads : [payloads];
    const response = await sampleService.createSamples(requests);
    await loadSamples({ page: 1 });
    return { createdCount: response.created.length, failedCount: response.failed.length, failedPayloads: response.failed };
  };

  const renderSection = () => {
    switch (activeSection) {
      case 'samples':
        return <SampleManagement samples={samples} pagination={pagination} loading={loading} error={error} onRequestSamples={loadSamples} onCreateSample={createSample} />;
      case 'electrochemistry':
        return <ElectrochemistryPage samples={samples} />;
      case 'photometry':
        return <PhotometryPage samples={samples} />;
      case 'other-parameters':
        return <OtherParametersPage samples={samples} />;
      default:
        return <DashboardOverview samples={samples} totalCount={pagination.total} loading={loading} error={error} onViewSamples={() => navigate('/samples')} onRetry={loadSamples} />;
    }
  };

  return (
    <main className="flex min-h-[calc(100vh-4rem)] bg-industrial-50 text-industrial-900">
      <div className="hidden shrink-0 md:block"><HomeSidebar activeSection={activeSection} onSelect={selectSection} /></div>

      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <button aria-label="Close menu" onClick={() => setIsMobileMenuOpen(false)} className="absolute inset-0 bg-industrial-900/40" />
          <div className="relative h-full w-72"><HomeSidebar mobile activeSection={activeSection} onSelect={selectSection} onClose={() => setIsMobileMenuOpen(false)} /></div>
        </div>
      )}

      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-3 border-b border-industrial-200 bg-white px-4 py-3 md:hidden">
          <button onClick={() => setIsMobileMenuOpen(true)} className="rounded-lg bg-industrial-100 p-2 text-industrial-700"><Menu size={20} /></button>
          <span className="text-sm font-black text-industrial-900">HOME</span>
        </div>
        <div className="px-4 sm:px-6 lg:px-8 pt-3 pb-8">{renderSection()}</div>
      </div>
    </main>
  );
};

export default Live;