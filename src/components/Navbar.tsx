import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Button } from './ui';
import { User, LogOut } from 'lucide-react';
import ConfirmationModal from './ConfirmationModal';

const Navbar: React.FC = () => {
  const { isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);

  if (!isAuthenticated) {
    navigate('/Login');
    return null;
  }

  return (
    <nav className="sticky top-0 z-50 bg-white border-b border-industrial-200 shadow-sm">
      <div className="w-full px-4 sm:px-6 lg:px-8">
        <div className="flex justify-end items-center h-14">
          <div className="flex items-center space-x-3">
            <div className="flex items-center gap-2 px-3 py-2 bg-industrial-50 border border-industrial-200 rounded-lg">
              <User size={16} className="text-brand-600" />
              <div className="flex flex-col">
                <span className="text-[10px] text-industrial-400 font-bold uppercase tracking-widest leading-none">User</span>
                <span className="mt-0.5 text-xs text-industrial-900 font-black uppercase">LOVIBOND</span>
              </div>
            </div>
            <Button
              variant="secondary"
              onClick={() => setIsModalOpen(true)}
              icon={LogOut}
              label="Log Out"
              className="!px-3 !py-1.5 border-blue-100 hover:bg-blue-50 hover:text-blue-600"
            />
          </div>
        </div>
      </div>

      {isModalOpen && (
        <ConfirmationModal
          message="Are you sure you want to log out?"
          onConfirm={() => { logout(); setIsModalOpen(false); }}
          onCancel={() => setIsModalOpen(false)}
        />
      )}
    </nav>
  );
};

export default Navbar;