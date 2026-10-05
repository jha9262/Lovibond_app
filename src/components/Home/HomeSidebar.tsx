import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  CircleDot,
  ClipboardList,
  FlaskConical,
  LayoutDashboard,
  X,
  Settings,
  HelpCircle,
  ChevronDown,
  ChevronUp,
  Sliders,
  Wifi,
  Users,
  Database,
  FileSearch,
} from 'lucide-react';

const mainNavItems = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'samples', label: 'Samples', icon: ClipboardList },
  { id: 'electrochemistry', label: 'Electrochemistry', icon: FlaskConical },
  { id: 'photometry', label: 'Photometer', icon: CircleDot },
  { id: 'other-parameters', label: 'Other Parameters', icon: Sliders },
  { id: 'report', label: 'Report', icon: FileSearch },
];


const settingsSubItems = [
  { id: 'device-communication', label: 'Device Communication', to: '/settings/device-communication', icon: Sliders },
  { id: 'wifi', label: 'WiFi Configuration', to: '/settings/wifi', icon: Wifi },
  { id: 'user-management', label: 'User Management', to: '/settings/user-management', icon: Users },
  { id: 'sample-logs', label: 'Test Parameter', to: '/settings/sample-logs', icon: Database },
];

const bottomItems = [
  { id: 'support', label: 'Support', icon: HelpCircle },
];

interface HomeSidebarProps {
  activeSection?: string;
  onSelect?: (id: string) => void;
  mobile?: boolean;
  onClose?: () => void;
}

const HomeSidebar: React.FC<HomeSidebarProps> = ({ activeSection, onSelect, mobile = false, onClose }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const isSamplesRoute = location.pathname === '/samples' || location.pathname.startsWith('/samples/');
  const isSettingsRoute = location.pathname.toLowerCase().startsWith('/settings') || location.pathname.toLowerCase() === '/users';
  const isReportRoute = location.pathname.toLowerCase().startsWith('/report');

  const [isSettingsExpanded, setIsSettingsExpanded] = useState(isSettingsRoute);

  // Show all settings sub-items
  const visibleSettingsSubItems = settingsSubItems;

  useEffect(() => {
    if (isSettingsRoute) {
      setIsSettingsExpanded(true);
      sessionStorage.setItem('lovibond_last_settings_route', location.pathname);
    }
  }, [isSettingsRoute, location.pathname]);

  const handleNavClick = (id: string) => {
    if (id === 'samples') {
      navigate('/samples');
      if (onSelect) onSelect('samples');
      if (onClose) onClose();
      return;
    }

    if (id === 'report') {
      navigate('/report');
      if (onSelect) onSelect('report');
      if (onClose) onClose();
      return;
    }

    const isOtherRoute = isSamplesRoute || isSettingsRoute || isReportRoute;

    if (id === 'dashboard' || id === 'electrochemistry' || id === 'photometry' || id === 'other-parameters') {
      if (isOtherRoute) {
        navigate('/LIVE', { state: { section: id } });
      } else if (onSelect) {
        onSelect(id);
      }
      if (onClose) onClose();
      return;
    }

    if (onSelect) onSelect(id);
    if (onClose) onClose();
  };

  const handleToggleSettings = () => {
    if (!isSettingsRoute) {
      const defaultTarget = '/settings/device-communication';
      const target = sessionStorage.getItem('lovibond_last_settings_route') || defaultTarget;
      navigate(target);
      setIsSettingsExpanded(true);
      if (onClose) onClose();
    } else {
      setIsSettingsExpanded((prev) => !prev);
    }
  };

  const handleSubItemClick = (to: string) => {
    sessionStorage.setItem('lovibond_last_settings_route', to);
    navigate(to);
    if (onClose) onClose();
  };

  return (
    <aside className={`flex h-full w-64 flex-col border-r border-industrial-200 bg-[#F8F9FC] ${mobile ? 'shadow-2xl' : ''}`}>
      <div className="flex items-center justify-between border-b border-industrial-100 px-5 py-5">
        <div className="flex items-center gap-3.5">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-600 text-white shadow-sm shadow-brand-600/25 shrink-0">
            <FlaskConical size={22} />
          </div>
          <div>
            <h2 className="text-base font-black tracking-tight text-industrial-900 leading-tight">Lovibond</h2>
            <p className="text-xs font-semibold text-industrial-500 tracking-wide mt-0.5">Water Analysis</p>
          </div>
        </div>
        {mobile && (
          <button onClick={onClose} className="rounded-lg p-2 text-industrial-500 hover:bg-industrial-100">
            <X size={20} />
          </button>
        )}
      </div>

      <nav className="flex-1 space-y-1 p-3 overflow-y-auto">
        {mainNavItems.map(({ id, label, icon: Icon }) => {
          const isActive = isSamplesRoute
            ? id === 'samples'
            : isReportRoute
              ? id === 'report'
              : !isSettingsRoute && !isReportRoute && activeSection === id;

          return (
            <button
              key={id}
              onClick={() => handleNavClick(id)}
              className={`group flex w-full items-center gap-3 rounded-lg px-3.5 py-2.5 text-left text-sm font-semibold transition-all ${isActive
                  ? 'bg-brand-600 text-white shadow-md shadow-brand-600/25'
                  : 'text-industrial-600 hover:bg-brand-50 hover:text-brand-700'
                }`}
            >
              <Icon size={18} className={isActive ? 'text-white' : 'text-industrial-400 group-hover:text-brand-600'} />
              <span className="uppercase tracking-wide">{label}</span>
            </button>
          );
        })}

        <div className="pt-0.5">
          <button
            type="button"
            onClick={handleToggleSettings}
            className={`group flex w-full items-center justify-between rounded-lg px-3.5 py-2.5 text-left text-sm font-semibold transition-all ${isSettingsRoute
                ? 'bg-brand-50/70 text-brand-700 font-bold'
                : 'text-industrial-600 hover:bg-brand-50 hover:text-brand-700'
              }`}
          >
            <div className="flex items-center gap-3">
              <Settings
                size={18}
                className={
                  isSettingsRoute
                    ? 'text-brand-600'
                    : 'text-industrial-400 group-hover:text-brand-600'
                }
              />
              <span className="uppercase tracking-wide">Settings</span>
            </div>
            <span
              onClick={(e) => {
                e.stopPropagation();
                setIsSettingsExpanded((prev) => !prev);
              }}
              className="p-1 hover:bg-brand-100/50 rounded transition-colors"
            >
              {isSettingsExpanded ? (
                <ChevronUp size={16} className={isSettingsRoute ? 'text-brand-600' : 'text-industrial-400'} />
              ) : (
                <ChevronDown size={16} className={isSettingsRoute ? 'text-brand-600' : 'text-industrial-400'} />
              )}
            </span>
          </button>

          {isSettingsExpanded && (
            <div className="mt-1.5 ml-4 pl-3 border-l-2 border-brand-200 space-y-1 py-0.5">
              {visibleSettingsSubItems.map(({ id, label, to, icon: SubIcon }) => {
                const isSubActive =
                  location.pathname.toLowerCase() === to.toLowerCase() ||
                  (to === '/settings/user-management' && location.pathname.toLowerCase() === '/users');
                return (
                  <button
                    key={id}
                    type="button"
                    onClick={() => handleSubItemClick(to)}
                    className={`group flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-xs transition-all ${isSubActive
                        ? 'bg-brand-600 text-white font-bold shadow-md shadow-brand-600/25'
                        : 'text-industrial-600 hover:bg-brand-50 hover:text-brand-700 font-medium'
                      }`}
                  >
                    <SubIcon
                      size={14}
                      className={`shrink-0 ${isSubActive ? 'text-white' : 'text-industrial-400 group-hover:text-brand-600'
                        }`}
                    />
                    <span className="leading-snug text-[11px] uppercase tracking-wide">{label}</span>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </nav>

      <div className="border-t border-industrial-200 p-3 space-y-1">
        {bottomItems.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            disabled
            className="group flex w-full items-center gap-3 rounded-lg px-3.5 py-2.5 text-left text-sm font-medium text-industrial-400 cursor-not-allowed"
          >
            <Icon size={18} className="text-industrial-300" />
            <span className="uppercase tracking-wide">{label}</span>
          </button>
        ))}
      </div>
    </aside>
  );
};

export default HomeSidebar;
