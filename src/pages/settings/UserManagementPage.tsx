import React from 'react';
import SettingsLayout from './SettingsLayout';
import UsersPage from '../UsersPage';

const UserManagementPage: React.FC = () => {
  return (
    <SettingsLayout>
      <div className="w-full h-full">
        <UsersPage isEmbedded={true} />
      </div>
    </SettingsLayout>
  );
};

export default UserManagementPage;