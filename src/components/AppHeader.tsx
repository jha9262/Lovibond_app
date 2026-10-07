import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from './ui';
import { User, Activity, LogOut } from 'lucide-react';
import ConfirmationModal from './ConfirmationModal';

const getBreadcrumb = (pathname: string, state: any) => {
  const p = pathname.toLowerCase();
  if (p === '/live' || p === '/') {
    const section = state?.section || 'dashboard';
    switch (section) {
      case 'electrochemistry':
        return { category: 'Testing', title: 'Electrochemistry' };
      case 'photometry':
        return { category: 'Testing', title: 'Photometer' };
      case 'other-parameters':
        return { category: 'Testing', title: 'Other Parameters' };
      case 'samples':
        return { category: 'Management', title: 'Samples' };
      default:
        return { category: 'System Overview', title: 'Dashboard' };
    }
  }
  if (p.startsWith('/samples/create')) return { category: 'Samples', title: 'Create Sample' };
  if (p.includes('/edit')) return { category: 'Samples', title: 'Edit Sample' };
  if (p.startsWith('/samples/')) return { category: 'Samples', title: 'Sample Details' };
  if (p === '/samples') return { category: 'Management', title: 'Sample Directory' };
  if (p === '/settings/sample-logs') return { category: 'Settings', title: 'Test Parameter' };
  if (p === '/settings/wifi') return { category: 'Settings', title: 'WiFi Configuration' };
  if (p === '/settings/device-communication') return { category: 'Settings', title: 'Device Communication' };
  if (p === '/settings/user-management') return { category: 'Settings', title: 'User Management' };
  if (p === '/settings/report-configuration') return { category: 'Settings', title: 'Report Configuration' };
  if (p.startsWith('/report')) return { category: 'Analytics', title: 'Reports & Logs' };
  if (p === '/users') return { category: 'Administration', title: 'User Management' };
  return { category: 'System', title: 'Water Analysis' };
};

const AppHeader: React.FC = () => {
  const { isAuthenticated, userId, userName, role, isMaster, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const breadcrumb = getBreadcrumb(location.pathname, location.state);

  if (!isAuthenticated) {
    navigate('/Login');
    return null;
  }

  return (
    <nav className="sticky top-0 z-50 bg-white border-b border-industrial-200 shadow-xs">
      <div className="w-full px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-[52px] gap-4">
          {/* Left: Dynamic Breadcrumb / Active Page Indicator */}
          <div className="flex items-center gap-3 min-w-0 shrink-0">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-brand-50 text-brand-600 border border-brand-100/60 shadow-2xs">
              <Activity size={16} />
            </div>
            <div className="flex flex-col min-w-0">
              <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-industrial-400 leading-none">
                <span>Lovibond</span>
                <span className="text-industrial-300">/</span>
                <span className="text-brand-600 font-extrabold">{breadcrumb.category}</span>
              </div>
              <h1 className="text-xs font-black text-industrial-900 uppercase tracking-tight truncate leading-tight mt-1">
                {breadcrumb.title}
              </h1>
            </div>
          </div>

          {/* Right: User Profile, Log Out */}
          <div className="flex items-center gap-3 shrink-0">
            {/* User Badge */}
            <div className="flex items-center gap-2 px-2.5 py-1.5 bg-industrial-50 border border-industrial-200 rounded-xl">
              <div className="w-5 h-5 rounded-lg bg-brand-100 text-brand-700 flex items-center justify-center font-black text-[10px]">
                <User size={12} />
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-1.5">
                  <span className="text-[8px] text-industrial-400 font-bold uppercase tracking-widest leading-none">User</span>
                  <span className={`text-[8px] font-black uppercase px-1.5 py-0.5 rounded leading-none ${
                    String(role).toUpperCase() === 'MASTER'
                      ? 'bg-amber-100 text-amber-800 border border-amber-300'
                      : String(role).toUpperCase() === 'ADMIN'
                        ? 'bg-purple-100 text-purple-700 border border-purple-200'
                        : 'bg-blue-50 text-blue-700 border border-blue-200'
                    }`}>
                    {role || 'USER'}
                  </span>
                </div>
                <span className="text-xs text-industrial-900 font-black uppercase tracking-wide leading-none mt-0.5">{userName || userId || 'LOVIBOND'}</span>
              </div>
            </div>

            {/* Log Out Button */}
            <Button
              variant="secondary"
              onClick={() => setIsModalOpen(true)}
              icon={LogOut}
              label="Log Out"
              className="!px-3 !py-1.5 text-xs font-bold border-industrial-200 hover:border-blue-200 hover:bg-blue-50 hover:text-blue-600 transition-colors"
            />
          </div>
        </div>
      </div>

      {isModalOpen && (
        <ConfirmationModal
          message="Are you sure you want to log out?"
          onConfirm={() => {
            logout();
            setIsModalOpen(false);
          }}
          onCancel={() => setIsModalOpen(false)}
        />
      )}
    </nav>
  );
};

export { AppHeader };
export default AppHeader;
