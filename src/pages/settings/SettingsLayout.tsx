import React, { useState } from 'react';
import { Menu } from 'lucide-react';
import HomeSidebar from '../../components/Home/HomeSidebar';

const SettingsLayout = ({ children }: { children: React.ReactNode }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <main className="flex min-h-[calc(100vh-4rem)] w-full bg-industrial-50 text-industrial-900">
      <div className="hidden shrink-0 md:block">
        <HomeSidebar activeSection="settings" />
      </div>

      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <button
            type="button"
            aria-label="Close menu"
            onClick={() => setIsMobileMenuOpen(false)}
            className="absolute inset-0 bg-industrial-900/40 backdrop-blur-xs"
          />
          <div className="relative h-full w-72">
            <HomeSidebar mobile activeSection="settings" onClose={() => setIsMobileMenuOpen(false)} />
          </div>
        </div>
      )}

      <div className="min-w-0 flex-1 w-full flex flex-col">
        <div className="flex items-center gap-3 border-b border-industrial-200 bg-white px-4 py-3 md:hidden">
          <button
            type="button"
            onClick={() => setIsMobileMenuOpen(true)}
            className="rounded-lg bg-industrial-100 p-2 text-industrial-700 hover:bg-industrial-200 transition-colors"
            aria-label="Open sidebar navigation"
          >
            <Menu size={20} />
          </button>
          <span className="text-sm font-black text-industrial-900 uppercase tracking-wide">
            SETTINGS
          </span>
        </div>

        <div className="w-full flex-1 px-4 sm:px-6 lg:px-8 pt-2.5 pb-6">
          {children}
        </div>
      </div>
    </main>
  );
};

export default SettingsLayout;