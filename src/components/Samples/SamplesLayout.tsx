import React, { useState } from 'react';
import { Menu } from 'lucide-react';
import HomeSidebar from '../Home/HomeSidebar';

const SamplesLayout = ({ children }: { children: React.ReactNode }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <main className="flex min-h-[calc(100vh-4rem)] w-full bg-industrial-50 text-industrial-900">

      {/* Desktop Sidebar */}
      <div className="hidden shrink-0 md:block">
        <HomeSidebar activeSection="samples" />
      </div>

      {/* Mobile Sidebar */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <button
            type="button"
            aria-label="Close menu"
            onClick={() => setIsMobileMenuOpen(false)}
            className="absolute inset-0 bg-industrial-900/40 backdrop-blur-xs"
          />

          <div className="relative h-full w-72">
            <HomeSidebar
              mobile
              activeSection="samples"
              onClose={() => setIsMobileMenuOpen(false)}
            />
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="min-w-0 flex-1 w-full">

        {/* Mobile Header */}
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
            SAMPLES
          </span>
        </div>

        {/* Page Content */}
        <div className="w-full min-w-0 p-4 sm:p-6 lg:p-8">
          {children}
        </div>

      </div>
    </main>
  );
};

export default SamplesLayout;