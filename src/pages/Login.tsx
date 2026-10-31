import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Sprout, LogIn, Key, Sparkles } from 'lucide-react';
import { login as loginApi } from '../api/auth.js';
import { useAuth } from '../context/AuthContext.js';
import toast from 'react-hot-toast';

const loginFormSchema = z.object({
  email: z.string().trim().email('Please enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
});

type LoginFormData = z.infer<typeof loginFormSchema>;

export const Login: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const queryParams = new URLSearchParams(location.search);
  const isExpired = queryParams.get('expired') === '1';

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginFormSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = async (data: LoginFormData) => {
    setIsSubmitting(true);
    try {
      const res = await loginApi(data);
      login(res.token, res.user);
      toast.success(`Welcome back, ${res.user.fullName}`);
      navigate('/dashboard');
    } catch (err: any) {
      toast.error(err.response?.data?.error?.message || 'Invalid email or password credentials');
    } finally {
      setIsSubmitting(false);
    }
  };

  const fillDemoAccount = () => {
    setValue('email', 'demo@agrilens.app');
    setValue('password', 'DemoPassword123!');
    toast.success('Demo farm credentials loaded');
  };

  return (
    <div className="min-h-screen bg-cream-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center space-y-2">
        <Link to="/" className="inline-flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-xl bg-leaf-700 text-cream-50 flex items-center justify-center warm-shadow-sm">
            <Sprout className="w-5 h-5 text-wheat-300" />
          </div>
          <span className="font-serif text-2xl font-bold text-soil-900">AgriLens</span>
        </Link>
        <h2 className="font-serif text-xl font-bold text-soil-950">
          Sign In to Your Field Station
        </h2>
        <p className="text-xs text-soil-600">
          Access your visual scans, crop timelines, and advisory reports.
        </p>

        {isExpired && (
          <div className="p-3 bg-ochre-100 border border-ochre-500/30 rounded-xl text-xs text-ochre-800 font-medium">
            Your previous session has expired. Please log in again.
          </div>
        )}
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-md px-4">
        <div className="bg-cream-100 py-8 px-6 sm:px-8 rounded-2xl border border-soil-600/15 warm-shadow space-y-6">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-soil-700 mb-1">
                Email Address
              </label>
              <input
                type="email"
                {...register('email')}
                placeholder="farmer@domain.com"
                className="w-full bg-cream-50 border border-soil-600/20 focus:border-leaf-600 rounded-xl px-3.5 py-2.5 text-xs text-soil-900 focus:outline-none focus:ring-1 focus:ring-leaf-600"
              />
              {errors.email && (
                <p className="text-[11px] text-rust-600 mt-1">{errors.email.message}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-medium text-soil-700 mb-1">
                Password
              </label>
              <input
                type="password"
                {...register('password')}
                placeholder="••••••••"
                className="w-full bg-cream-50 border border-soil-600/20 focus:border-leaf-600 rounded-xl px-3.5 py-2.5 text-xs text-soil-900 focus:outline-none focus:ring-1 focus:ring-leaf-600"
              />
              {errors.password && (
                <p className="text-[11px] text-rust-600 mt-1">{errors.password.message}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-leaf-700 hover:bg-leaf-800 disabled:opacity-50 text-cream-50 text-xs font-semibold warm-shadow-sm btn-press transition-colors cursor-pointer"
            >
              {isSubmitting ? (
                <div className="w-4 h-4 border-2 border-cream-50 border-t-transparent rounded-full animate-spin" />
              ) : (
                <LogIn className="w-4 h-4 text-wheat-300" />
              )}
              <span>{isSubmitting ? 'Verifying Credentials…' : 'Sign In'}</span>
            </button>
          </form>

          {/* Quick Demo Fill Button */}
          <div className="pt-2 border-t border-soil-600/10">
            <button
              type="button"
              onClick={fillDemoAccount}
              className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-cream-50 hover:bg-cream-200 text-soil-800 text-xs font-medium border border-soil-600/20 transition-colors btn-press cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 text-ochre-600" />
              <span>Fill Demo Credentials (demo@agrilens.app)</span>
            </button>
          </div>

          <div className="text-center text-xs text-soil-600">
            Don’t have a field account yet?{' '}
            <Link to="/register" className="font-semibold text-leaf-700 hover:text-leaf-800 underline">
              Create an account
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
