import React, { useState } from 'react';
import { Search, Edit2, Trash2, Plus, Users, ShieldAlert } from 'lucide-react';
import toast from 'react-hot-toast';
import { Button } from '../ui';
import AddUserForm from './AddUserForm';
import { User, PaginationInfo } from '../../types';
import ConfirmationModal from '../ConfirmationModal';

const TableSkeleton = () => (
  <div className="space-y-3 p-5 animate-pulse">
    {[1, 2, 3, 4, 5].map((item) => (
      <div key={item} className="h-11 rounded-lg bg-industrial-100" />
    ))}
  </div>
);

interface UserDirectoryProps {
  users: User[];
  pagination: PaginationInfo;
  loading: boolean;
  error: boolean;
  onRequest: (params: any) => void;
  onEdit: (user: User) => void;
  onDelete: (user: User) => void;
}

const UserDirectory: React.FC<UserDirectoryProps> = ({ users, pagination, loading, error, onRequest, onEdit, onDelete }) => {
  const [query, setQuery] = useState('');
  const request = (next: any) => onRequest({ page: pagination.page, limit: pagination.limit, search: query, ...next });
  const changeSearch = (value: string) => { setQuery(value); onRequest({ page: 1, limit: pagination.limit, search: value }); };

  return (
    <section className="overflow-hidden rounded-xl border border-industrial-200 bg-white shadow-sm flex flex-col w-full">
      <div className="flex flex-col gap-4 border-b border-industrial-100 p-5 sm:flex-row sm:items-center sm:justify-between bg-industrial-50/50">
        <div className="flex items-center gap-2">
          <Users size={18} className="text-industrial-500" />
          <h2 className="text-base font-bold text-industrial-900">USER DIRECTORY</h2>
        </div>
        <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:items-center">
          <label className="relative block w-full sm:w-64">
            <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-industrial-400" size={15} />
            <input
              value={query}
              onChange={(event) => changeSearch(event.target.value)}
              placeholder="Search users..."
              className="w-full rounded-lg border border-industrial-200 py-2 pl-9 pr-3 text-sm text-industrial-900 outline-none transition placeholder:text-industrial-400 focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
            />
          </label>
        </div>
      </div>

      {loading ? <TableSkeleton /> : error ? (
        <div className="px-6 py-16 text-center">
          <ShieldAlert size={32} className="mx-auto text-industrial-400 mb-3" />
          <p className="text-base font-bold text-industrial-900">Unable to load users</p>
          <p className="mt-1 text-sm text-industrial-500">The user data could not be retrieved from the server.</p>
          <Button label="Retry Connection" variant="secondary" className="mt-5 h-9 text-sm px-5 py-0 mx-auto" onClick={() => request({})} />
        </div>
      ) : users.length ? (
        <>
          <div className="overflow-x-auto flex-1 w-full">
            <table className="w-full min-w-[650px] text-left">
              <thead className="bg-industrial-50 text-[10px] font-bold uppercase tracking-wider text-industrial-500 border-b border-industrial-100">
                <tr>
                  <th className="px-5 py-3.5 w-16">No</th>
                  <th className="px-5 py-3.5">User ID</th>
                  <th className="px-5 py-3.5">Name</th>
                  <th className="px-5 py-3.5">Role</th>
                  <th className="px-5 py-3.5">Designation</th>
                  <th className="px-5 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-industrial-100">
                {users.map((user, index) => (
                  <tr key={user.userId} className="text-sm text-industrial-700 hover:bg-brand-50/50 transition-colors">
                    <td className="whitespace-nowrap px-5 py-4 font-medium text-industrial-500">
                      {(pagination.page - 1) * pagination.limit + index + 1}
                    </td>
                    <td className="whitespace-nowrap px-5 py-4 font-bold text-industrial-900">{user.userId}</td>
                    <td className="px-5 py-4 font-semibold text-industrial-800">{user.name || '—'}</td>
                    <td className="px-5 py-4">
                      <span className={`inline-flex items-center rounded-md px-2 py-0.5 text-[11px] font-black uppercase ${String(user.role).toUpperCase() === 'MASTER'
                        ? 'bg-amber-100 text-amber-800 border border-amber-300'
                        : String(user.role).toUpperCase() === 'ADMIN'
                          ? 'bg-purple-100 text-purple-700 border border-purple-200'
                          : 'bg-blue-50 text-blue-700 border border-blue-200'
                        }`}>
                        {user.role || 'USER'}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-industrial-600">
                      <span className="inline-flex items-center rounded-md bg-industrial-100 px-2 py-1 text-xs font-medium text-industrial-700">
                        {user.designation || '—'}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button aria-label={`Edit ${user.userId}`} onClick={() => onEdit(user)} className="rounded-md border border-industrial-200 bg-white p-1.5 text-industrial-500 hover:border-brand-300 hover:bg-brand-50 hover:text-brand-700 transition-colors">
                          <Edit2 size={14} />
                        </button>
                        <button aria-label={`Delete ${user.userId}`} onClick={() => onDelete(user)} className="rounded-md border border-industrial-200 bg-white p-1.5 text-industrial-500 hover:border-red-200 hover:bg-red-50 hover:text-red-600 transition-colors">
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-industrial-100 px-5 py-4 bg-white">
            <p className="text-sm text-industrial-500">
              {pagination.total === 0 ? (
                'No users found'
              ) : (
                <>
                  Showing{' '}
                  <span className="font-semibold text-brand-700">
                    {Math.min((pagination.page - 1) * pagination.limit + 1, pagination.total)}
                  </span>{' '}
                  to{' '}
                  <span className="font-semibold text-brand-700">
                    {Math.min(pagination.page * pagination.limit, pagination.total)}
                  </span>{' '}
                  of{' '}
                  <span className="font-semibold text-industrial-900">{pagination.total}</span>{' '}
                  users
                </>
              )}
            </p>
            {pagination.totalPages > 1 && (
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => request({ page: pagination.page - 1 })}
                  disabled={pagination.page <= 1}
                  className="px-3 py-1.5 text-xs font-bold text-industrial-700 bg-white border border-industrial-200 rounded-lg hover:bg-industrial-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  Previous
                </button>

                <div className="flex items-center gap-1">
                  {Array.from(
                    { length: Math.min(pagination.totalPages, 15) },
                    (_, i) => i + 1
                  ).map((pageNum) => (
                    <button
                      key={pageNum}
                      type="button"
                      onClick={() => request({ page: pageNum })}
                      className={`w-7 h-7 flex items-center justify-center text-xs font-bold rounded-lg transition-colors ${
                        pageNum === pagination.page
                          ? 'bg-brand-600 text-white shadow-sm'
                          : 'text-industrial-700 hover:bg-industrial-100 border border-transparent'
                      }`}
                    >
                      {pageNum}
                    </button>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={() => request({ page: pagination.page + 1 })}
                  disabled={pagination.page >= pagination.totalPages}
                  className="px-3 py-1.5 text-xs font-bold text-industrial-700 bg-white border border-industrial-200 rounded-lg hover:bg-industrial-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  Next
                </button>
              </div>
            )}
          </div>
        </>
      ) : (
        <div className="px-6 py-20 text-center flex flex-col items-center">
          <div className="h-12 w-12 rounded-full bg-industrial-50 flex items-center justify-center mb-4 border border-industrial-100">
            <Users size={20} className="text-industrial-400" />
          </div>
          <p className="text-base font-bold text-industrial-900">{query ? 'No users found' : 'No users available'}</p>
          <p className="mt-1 text-sm text-industrial-500">{query ? 'Try adjusting your search criteria.' : 'Create a new user using the form above.'}</p>
        </div>
      )}
    </section>
  );
};

interface UserManagementProps {
  users: User[];
  pagination: PaginationInfo;
  loading: boolean;
  error: boolean;
  onRequestUsers: (params: any) => void;
  onCreateUser: (payload: any) => Promise<any>;
  onUpdateUser: (originalUserId: string, payload: Partial<User>) => Promise<void>;
  onDeleteUser: (userId: string) => Promise<void>;
}

const UserManagement: React.FC<UserManagementProps> = ({ users, pagination, loading, error, onRequestUsers, onCreateUser, onUpdateUser, onDeleteUser }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);

  const handleCreateUser = async (payload: Partial<User>) => {
    try {
      if (editingUser) {
        await onUpdateUser(editingUser.userId, payload);
        toast.success('User updated successfully');
      } else {
        const result = await onCreateUser([payload]);
        if (result.failedCount > 0) {
          toast.error('A user with this ID may already exist');
          return false;
        }
        toast.success('User created successfully');
      }
      setEditingUser(null);
      return true;
    } catch (createError: any) {
      toast.error(createError?.message || 'Unable to create user');
      return false;
    }
  };

  const closeForm = () => {
    setIsModalOpen(false);
    setEditingUser(null);
  };

  const confirmDelete = async () => {
    if (!userToDelete) return;
    try {
      await onDeleteUser(userToDelete.userId);
      toast.success('User deleted successfully');
    } catch (deleteError: any) {
      toast.error(deleteError?.message || 'Unable to delete user');
    } finally {
      setUserToDelete(null);
    }
  };

  return (
    <div className="w-full flex flex-col gap-6">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between bg-white px-6 py-5 rounded-2xl shadow-sm border border-industrial-100 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-brand-500/5 rounded-full blur-3xl pointer-events-none -translate-y-1/2 translate-x-1/4"></div>
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-1.5">
            <div className="h-1.5 w-1.5 rounded-full bg-brand-500"></div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-brand-600/70">Settings / User Management</p>
          </div>
          <h1 className="text-xl sm:text-2xl font-black tracking-tight text-industrial-900 uppercase display-font">User Management</h1>
        </div>
        <div className="relative z-10">
          <button
            onClick={() => { setEditingUser(null); setIsModalOpen(true); }}
            style={{ backgroundColor: '#4a35e8' }}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-brand-600 px-6 py-2.5 text-xs font-bold uppercase tracking-wider text-white shadow-md shadow-brand-600/20 hover:bg-brand-700 active:scale-[0.99] transition-all shrink-0"
          >
            <Plus size={16} />
            <span>Create User</span>
          </button>
        </div>
      </header>

      <AddUserForm
        isOpen={isModalOpen}
        onClose={closeForm}
        onSubmitUser={handleCreateUser}
        user={editingUser}
      />

      <UserDirectory
        users={users}
        pagination={pagination}
        loading={loading}
        error={error}
        onRequest={onRequestUsers}
        onEdit={(user) => { setEditingUser(user); setIsModalOpen(true); }}
        onDelete={setUserToDelete}
      />
      {userToDelete && (
        <ConfirmationModal
          message={`Delete user ${userToDelete.userId}?`}
          onConfirm={() => { void confirmDelete(); }}
          onCancel={() => setUserToDelete(null)}
        />
      )}
    </div>
  );
};

export default UserManagement;
