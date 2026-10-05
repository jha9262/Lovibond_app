import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Menu } from 'lucide-react';
import UserManagement from '../components/Home/UserManagement';
import HomeSidebar from '../components/Home/HomeSidebar';
import { userService } from '../services/userService';
import { User, PaginationInfo } from '../types';

const UsersPage: React.FC<{ isEmbedded?: boolean }> = ({ isEmbedded }) => {
  const [users, setUsers] = useState<User[]>([]);
  const [userPagination, setUserPagination] = useState<PaginationInfo>({ page: 1, limit: 10, total: 0, totalPages: 1 });
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [userError, setUserError] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const userRequestRef = useRef({ page: 1, limit: 10, search: '' });

  const loadUsers = useCallback(async (params = {}) => {
    const request = { ...userRequestRef.current, ...params };
    userRequestRef.current = request;
    try {
      setLoadingUsers(true);
      setUserError(false);
      const result = await userService.getUsers(request);
      setUsers(result.data);
      setUserPagination(result.pagination);
    } catch (err) {
      console.error('Unable to load users:', err);
      setUserError(true);
    } finally {
      setLoadingUsers(false);
    }
  }, []);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  const createUser = async (payloads: any) => {
    const requests = Array.isArray(payloads) ? payloads : [payloads];
    const response = await userService.createUsers(requests);
    await loadUsers({ page: 1 });
    return { createdCount: response.created.length, failedCount: response.failed.length, failedPayloads: response.failed };
  };

  const updateUser = async (originalUserId: string, payload: Partial<User>) => {
    await userService.updateUser(originalUserId, payload);
    await loadUsers();
  };

  const deleteUser = async (userId: string) => {
    await userService.deleteUser(userId);
    await loadUsers();
  };

  const content = (
    <div className={`w-full ${isEmbedded ? '' : 'p-4 sm:p-6 lg:p-8 max-w-[1600px] mx-auto'}`}>
      <UserManagement
        users={users}
        pagination={userPagination}
        loading={loadingUsers}
        error={userError}
        onRequestUsers={loadUsers}
        onCreateUser={createUser}
        onUpdateUser={updateUser}
        onDeleteUser={deleteUser}
      />
    </div>
  );

  if (isEmbedded) {
    return <div className="w-full h-full">{content}</div>;
  }

  return (
    <main className="flex min-h-[calc(100vh-4rem)] bg-industrial-50 text-industrial-900">
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
            <HomeSidebar
              mobile
              activeSection="settings"
              onClose={() => setIsMobileMenuOpen(false)}
            />
          </div>
        </div>
      )}

      <div className="min-w-0 flex-1">
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
            USERS
          </span>
        </div>
        {content}
      </div>
    </main>
  );
};

export default UsersPage;
