import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { authService } from '../services/authService';
import toast from 'react-hot-toast';
import { Input, Button } from '../components/ui';
import { Activity, AlertCircle, User as UserIcon, LockKeyhole } from 'lucide-react';

const LoginPage: React.FC = () => {
  const [formData, setFormData] = useState({ userId: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (errorMessage) setErrorMessage(null);
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanUserId = formData.userId.trim();
    if (!cleanUserId || !formData.password) {
      const msg = 'User ID and Password are required';
      setErrorMessage(msg);
      toast.error(msg);
      return;
    }

    setLoading(true);
    setErrorMessage(null);

    try {
      const response = await authService.login({
        USER_ID: cleanUserId,
        PASSWORD: formData.password,
      });

      if (response.success) {
        toast.success(response.message || 'Login successful');
        login(response.USER_ID || cleanUserId, response.ROLE || 'ADMIN', response.USER_NAME);
        navigate('/LIVE');
      } else {
        const errorMsg = response.message || 'Invalid User ID or Password';
        setErrorMessage(errorMsg);
        toast.error(errorMsg);
      }
    } catch (err: any) {
      const errorMsg = err?.message || 'Login failed. Please check device connection.';
      setErrorMessage(errorMsg);
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-industrial-50 relative overflow-hidden">
      {/* Premium Background Elements */}
      <div className="absolute inset-0 bg-white">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-brand-500/10 rounded-full blur-[120px] opacity-70 pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-indigo-500/5 rounded-full blur-[100px] opacity-60 pointer-events-none" />
      </div>

      <div className="relative z-10 w-full max-w-[420px] px-6">
        <div className="bg-white/80 backdrop-blur-xl border border-white/40 shadow-[0_8px_40px_-12px_rgba(0,0,0,0.1)] rounded-3xl overflow-hidden">
          <div className="px-8 pt-10 pb-8 flex flex-col items-center text-center">
            <div className="w-14 h-14 bg-brand-50 text-brand-600 rounded-2xl flex items-center justify-center mb-6 shadow-sm border border-brand-100/50">
              <Activity className="w-7 h-7" />
            </div>
            <h1 className="text-2xl font-bold text-industrial-900 tracking-tight mb-2 display-font">
              System Access
            </h1>
            <p className="text-industrial-500 text-sm">
              Enter your credentials to continue to the dashboard
            </p>
          </div>

          <div className="px-8 pb-10">
            {errorMessage && (
              <div className="mb-5 p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-semibold flex items-center gap-2.5">
                <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
                <span>{errorMessage}</span>
              </div>
            )}

            <form className="space-y-5" onSubmit={handleSubmit}>
              <Input
                label="User ID"
                name="userId"
                value={formData.userId}
                placeholder="e.g. admin"
                onChange={handleChange}
                disabled={loading}
                icon={UserIcon}
                required
                autoComplete="username"
              />
              <Input
                label="Password"
                type="password"
                name="password"
                value={formData.password}
                placeholder="••••••••"
                onChange={handleChange}
                disabled={loading}
                icon={LockKeyhole}
                required
                autoComplete="current-password"
              />

              <div className="pt-2">
                <Button
                  variant="primary"
                  disabled={loading}
                  className="w-full py-3 text-sm font-semibold shadow-brand-500/25 hover:shadow-brand-500/40 transition-all rounded-xl cursor-pointer"
                  label={loading ? 'Authenticating...' : 'Sign In'}
                  type="submit"
                />
              </div>
            </form>
          </div>
        </div>

        <div className="mt-8 text-center">
          <p className="text-xs text-industrial-400 font-medium">
            Secure connection established &bull; v2.4.0
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;