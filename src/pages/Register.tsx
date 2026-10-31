import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Sprout, UserPlus, CheckCircle2 } from 'lucide-react';
import { register as registerApi } from '../api/auth.js';
import { useAuth } from '../context/AuthContext.js';
import toast from 'react-hot-toast';

const registerFormSchema = z.object({
  email: z.string().trim().toLowerCase().email('Please enter a valid email address'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .max(72)
    .regex(/[A-Z]/, 'Must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Must contain at least one number'),
  fullName: z.string().trim().min(2, 'Name must be at least 2 characters'),
  region: z.string().trim().optional(),
});

type RegisterFormData = z.infer<typeof registerFormSchema>;

export const Register: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerFormSchema),
    defaultValues: {
      email: '',
      password: '',
      fullName: '',
      region: '',
    },
  });

  const onSubmit = async (data: RegisterFormData) => {
    setIsSubmitting(true);
    try {
      const res = await registerApi(data);
      login(res.token, res.user);
      toast.success(`Account registered! Welcome, ${res.user.fullName}`);
      navigate('/dashboard');
    } catch (err: any) {
      toast.error(err.response?.data?.error?.message || 'Registration failed. Email may already be in use.');
    } finally {
      setIsSubmitting(false);
    }
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
          Create Your Agronomist Account
        </h2>
        <p className="text-xs text-soil-600">
          Start diagnosing crop pathology and tracking field vigor today.
        </p>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-md px-4">
        <div className="bg-cream-100 py-8 px-6 sm:px-8 rounded-2xl border border-soil-600/15 warm-shadow space-y-6">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-soil-700 mb-1">
                Full Name / Farm Title
              </label>
              <input
                type="text"
                {...register('fullName')}
                placeholder="Ramesh Sharma / Green Meadows"
                className="w-full bg-cream-50 border border-soil-600/20 focus:border-leaf-600 rounded-xl px-3.5 py-2.5 text-xs text-soil-900 focus:outline-none focus:ring-1 focus:ring-leaf-600"
              />
              {errors.fullName && (
                <p className="text-[11px] text-rust-600 mt-1">{errors.fullName.message}</p>
              )}
            </div>

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
                Agricultural Region / State
              </label>
              <input
                type="text"
                {...register('region')}
                placeholder="Punjab, India / California, US"
                className="w-full bg-cream-50 border border-soil-600/20 focus:border-leaf-600 rounded-xl px-3.5 py-2.5 text-xs text-soil-900 focus:outline-none focus:ring-1 focus:ring-leaf-600"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-soil-700 mb-1">
                Password
              </label>
              <input
                type="password"
                {...register('password')}
                placeholder="Minimum 8 characters with Upper, Lower & Number"
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
                <UserPlus className="w-4 h-4 text-wheat-300" />
              )}
              <span>{isSubmitting ? 'Creating Account…' : 'Register Field Account'}</span>
            </button>
          </form>

          <div className="text-center text-xs text-soil-600">
            Already registered?{' '}
            <Link to="/login" className="font-semibold text-leaf-700 hover:text-leaf-800 underline">
              Sign in to your account
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
