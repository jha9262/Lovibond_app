import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './AppHeader';
import Live from '../pages/Live';
import UsersPage from '../pages/UsersPage';
import ReportPage from '../components/Report/ReportPage';
import ReportViewPage from '../components/Report/ReportViewPage';
import ReportPreviewPage from '../components/Report/ReportPreviewPage';
import SamplesDirectory from '../pages/samples/SamplesDirectory';
import CreateSample from '../pages/samples/CreateSample';
import SampleDetails from '../pages/samples/SampleDetails';
import EditSample from '../pages/samples/EditSample';
import WifiConfiguration from '../pages/settings/WifiConfiguration';
import DeviceCommunicationPage from '../pages/settings/DeviceCommunicationPage';
import UserManagementPage from '../pages/settings/UserManagementPage';
import SampleLogsPage from '../pages/settings/SampleLogsPage';
import ReportConfigurationPage from '../pages/settings/ReportConfigurationPage';

const SettingsRedirect: React.FC = () => {
  const target = sessionStorage.getItem('lovibond_last_settings_route') || '/settings/device-communication';
  return <Navigate to={target} replace />;
};

const Main: React.FC = () => {
  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/" element={<Navigate to="/LIVE" replace />} />
        <Route path="/LIVE" element={<Live />} />
        <Route path="/samples" element={<SamplesDirectory />} />
        <Route path="/samples/create" element={<CreateSample />} />
        <Route path="/samples/:sampleId" element={<SampleDetails />} />
        <Route path="/samples/:sampleId/edit" element={<EditSample />} />
        <Route path="/users" element={<UsersPage />} />
        <Route path="/settings" element={<SettingsRedirect />} />
        <Route path="/settings/device-communication" element={<DeviceCommunicationPage />} />
        <Route path="/settings/wifi" element={<WifiConfiguration />} />
        <Route path="/settings/user-management" element={<UserManagementPage />} />
        <Route path="/settings/sample-logs" element={<SampleLogsPage />} />
        <Route path="/settings/report-configuration" element={<ReportConfigurationPage />} />
        <Route path="/SETTINGS" element={<SettingsRedirect />} />
        <Route path="/report" element={<ReportPage />} />
        <Route path="/ReportView" element={<ReportViewPage />} />
        <Route path="/reports/:reportId/preview" element={<ReportPreviewPage />} />
        <Route path="*" element={<Navigate to="/LIVE" replace />} />
      </Routes>
    </>
  );
};

export default Main;
