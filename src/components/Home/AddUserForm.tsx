import React, { useState, useEffect } from 'react';
import { UserPlus, X, Eye, EyeOff } from 'lucide-react';
import { User } from '../../types';

interface AddUserFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmitUser: (user: Partial<User>) => Promise<boolean>;
  user?: User | null;
}

const AddUserForm: React.FC<AddUserFormProps> = ({ isOpen, onClose, onSubmitUser, user }) => {
  const isEditing = Boolean(user);
  const [values, setValues] = useState({
    userId: '',
    name: '',
    designation: '',
    role: 'USER',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (isOpen) {
      setValues({
        userId: user?.userId || '',
        name: user?.name || '',
        designation: user?.designation || '',
        role: user?.role || 'USER',
        password: '',
      });
      setErrors({});
      setShowPassword(false);
    }
  }, [isOpen, user]);

  if (!isOpen) return null;

  const updateField = (field: string, value: string) => {
    setValues((current) => ({ ...current, [field]: value }));
    if (errors[field]) {
      setErrors((current) => ({ ...current, [field]: '' }));
    }
  };

  const handleUserIdChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Letters, numbers, _, -; no spaces (max 15)
    const val = e.target.value.replace(/[^A-Za-z0-9_-]/g, '').slice(0, 15);
    updateField('userId', val);
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Any normal name characters; spaces allowed (max 15)
    const val = e.target.value.replace(/[^A-Za-z0-9\s.'-]/g, '').slice(0, 15);
    updateField('name', val);
  };

  const handleDesignationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Text; spaces allowed (max 15)
    const val = e.target.value.replace(/[^A-Za-z0-9\s./&'-]/g, '').slice(0, 15);
    updateField('designation', val);
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Any characters/symbols; no spaces (max 15)
    const val = e.target.value.replace(/\s/g, '').slice(0, 15);
    updateField('password', val);
  };

  const validate = () => {
    const nextErrors: Record<string, string> = {};
    const userId = values.userId.trim();
    if (!userId) {
      nextErrors.userId = 'User ID is required.';
    } else if (userId.length > 15) {
      nextErrors.userId = 'Maximum 15 characters allowed.';
    } else if (!/^[A-Za-z0-9_-]+$/.test(userId)) {
      nextErrors.userId = 'Only letters, numbers, _, and - allowed (no spaces).';
    }

    const name = values.name.trim();
    if (!name) {
      nextErrors.name = 'Full Name is required.';
    } else if (name.length > 15) {
      nextErrors.name = 'Maximum 15 characters allowed.';
    }

    const designation = values.designation.trim();
    if (!designation) {
      nextErrors.designation = 'Designation is required.';
    } else if (designation.length > 15) {
      nextErrors.designation = 'Maximum 15 characters allowed.';
    }

    const password = values.password;
    if (!password && !isEditing) {
      nextErrors.password = 'Password is required.';
    } else if (password && /\s/.test(password)) {
      nextErrors.password = 'No spaces allowed in password.';
    } else if (password && password.length < 4) {
      nextErrors.password = 'Minimum 4 characters required.';
    } else if (password && password.length > 15) {
      nextErrors.password = 'Maximum 15 characters allowed.';
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (isSubmitting || !validate()) return;
    setIsSubmitting(true);
    try {
      const success = await onSubmitUser({
        userId: values.userId.trim(),
        name: values.name.trim().replace(/\s{2,}/g, ' '),
        designation: values.designation.trim().replace(/\s{2,}/g, ' '),
        role: values.role || 'USER',
        password: values.password,
      });

      if (success) {
        onClose();
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm animate-in fade-in duration-200">
      <section className="overflow-hidden rounded-xl bg-white shadow-2xl w-full max-w-md animate-in zoom-in-95 duration-200">
        <div className="border-b border-industrial-100 px-6 py-4 flex items-center justify-between bg-industrial-50/50">
          <div className="flex items-center gap-2">
            <UserPlus size={18} className="text-brand-500" />
            <h2 className="text-base font-bold text-industrial-900">{isEditing ? 'Edit User' : 'Create New User'}</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-industrial-400 hover:bg-industrial-100 hover:text-industrial-700 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={submit} className="p-6">
          <div className="flex flex-col gap-4">
            <div>
              <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-industrial-700">User ID</label>
              <input
                type="text"
                value={values.userId}
                onChange={handleUserIdChange}
                maxLength={15}
                disabled={isEditing}
                placeholder="e.g. operator1"
                className={`w-full rounded-lg bg-[#f0f4f8] px-4 py-2.5 text-sm font-medium text-industrial-900 outline-none transition focus:ring-2 focus:ring-brand-500/20 disabled:cursor-not-allowed disabled:opacity-70 ${errors.userId ? 'border border-red-500' : 'border border-transparent'}`}
              />
              {errors.userId && <p className="mt-1.5 text-xs font-semibold text-red-500">{errors.userId}</p>}
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-industrial-700">Full Name</label>
              <input
                type="text"
                value={values.name}
                onChange={handleNameChange}
                maxLength={15}
                placeholder="e.g. Machine Operator"
                className={`w-full rounded-lg bg-[#f0f4f8] px-4 py-2.5 text-sm font-medium text-industrial-900 outline-none transition focus:ring-2 focus:ring-brand-500/20 ${errors.name ? 'border border-red-500' : 'border border-transparent'}`}
              />
              {errors.name && <p className="mt-1.5 text-xs font-semibold text-red-500">{errors.name}</p>}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-industrial-700">Designation</label>
                <input
                  type="text"
                  value={values.designation}
                  onChange={handleDesignationChange}
                  maxLength={15}
                  placeholder="e.g. Operator"
                  className={`w-full rounded-lg bg-[#f0f4f8] px-4 py-2.5 text-sm font-medium text-industrial-900 outline-none transition focus:ring-2 focus:ring-brand-500/20 ${errors.designation ? 'border border-red-500' : 'border border-transparent'}`}
                />
                {errors.designation && <p className="mt-1.5 text-xs font-semibold text-red-500">{errors.designation}</p>}
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-industrial-700">Role</label>
                {['USER', 'ADMIN'].includes(values.role.toUpperCase()) ? (
                  <select
                    value={values.role.toUpperCase()}
                    onChange={(e) => updateField('role', e.target.value)}
                    className="w-full rounded-lg bg-[#f0f4f8] px-3 py-2.5 text-sm font-bold text-industrial-900 outline-none transition focus:ring-2 focus:ring-brand-500/20 border border-transparent"
                  >
                    <option value="USER">USER</option>
                    <option value="ADMIN">ADMIN</option>
                  </select>
                ) : (
                  <div className="rounded-lg bg-[#f0f4f8] px-3 py-2.5 text-sm font-bold text-industrial-500">{values.role.toUpperCase() || 'USER'}</div>
                )}
              </div>
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-industrial-700">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={values.password}
                  onChange={handlePasswordChange}
                  maxLength={15}
                  placeholder={isEditing ? 'Leave blank to keep current password' : 'e.g. password123'}
                  className={`w-full rounded-lg bg-[#f0f4f8] pl-4 pr-10 py-2.5 text-sm font-medium text-industrial-900 outline-none transition focus:ring-2 focus:ring-brand-500/20 ${errors.password ? 'border border-red-500' : 'border border-transparent'}`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-industrial-400 hover:text-industrial-600 transition-colors"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {errors.password && <p className="mt-1.5 text-xs font-semibold text-red-500">{errors.password}</p>}
              <p className="mt-1 text-[11px] text-industrial-400">Max 15 characters. Any characters and symbols allowed; no spaces. Passwords are never displayed in the user list.</p>
            </div>
          </div>

          <div className="mt-6 flex items-center justify-end gap-3 pt-4 border-t border-industrial-100">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg px-5 py-2.5 text-sm font-bold text-industrial-700 hover:bg-industrial-100 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              style={{ backgroundColor: '#4a35e8' }}
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-brand-600 px-6 py-2.5 text-sm font-bold text-white shadow-md hover:bg-brand-700 active:scale-[0.99] transition-all disabled:cursor-wait disabled:opacity-70"
            >
              {isSubmitting ? 'Saving…' : isEditing ? 'Save Changes' : 'Create User'}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
};

export default AddUserForm;
