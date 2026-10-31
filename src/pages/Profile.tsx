import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { User, Key, Globe, Trash2, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext.js';
import { updateProfile, changePassword, deleteAccount } from '../api/auth.js';
import { PageHeader } from '../components/layout/PageHeader.js';
import toast from 'react-hot-toast';

const profileSchema = z.object({
  fullName: z.string().trim().min(2, 'Name must be at least 2 characters'),
  region: z.string().trim().optional(),
  language: z.enum(['en', 'hi', 'bn', 'te', 'ta', 'mr']),
});

type ProfileFormData = z.infer<typeof profileSchema>;

const passwordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z
    .string()
    .min(8, 'Must be at least 8 characters')
    .regex(/[A-Z]/, 'Must contain an uppercase letter')
    .regex(/[a-z]/, 'Must contain a lowercase letter')
    .regex(/[0-9]/, 'Must contain a number'),
});

type PasswordFormData = z.infer<typeof passwordSchema>;

export const Profile: React.FC = () => {
  const { user, setUser, logout } = useAuth();
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [isDeletingAccount, setIsDeletingAccount] = useState(false);
  const [deletePassword, setDeletePassword] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const {
    register: regProfile,
    handleSubmit: handleProfileSubmit,
    formState: { errors: profileErrors },
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      fullName: user?.fullName || '',
      region: user?.region || '',
      language: (user?.language as any) || 'en',
    },
  });

  const {
    register: regPassword,
    handleSubmit: handlePasswordSubmit,
    reset: resetPasswordForm,
    formState: { errors: passwordErrors },
  } = useForm<PasswordFormData>({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      currentPassword: '',
      newPassword: '',
    },
  });

  const onUpdateProfile = async (data: ProfileFormData) => {
    setIsUpdatingProfile(true);
    try {
      const res = await updateProfile(data);
      setUser(res.user);
      toast.success('Profile preferences updated');
    } catch {
      toast.error('Failed to update profile');
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  const onChangePassword = async (data: PasswordFormData) => {
    setIsChangingPassword(true);
    try {
      await changePassword(data);
      toast.success('Password changed successfully');
      resetPasswordForm();
    } catch (err: any) {
      toast.error(err.response?.data?.error?.message || 'Failed to change password');
    } finally {
      setIsChangingPassword(false);
    }
  };

  const onDeleteAccount = async () => {
    if (!deletePassword) {
      toast.error('Please enter your password to confirm account deletion');
      return;
    }

    setIsDeletingAccount(true);
    try {
      await deleteAccount({ password: deletePassword });
      toast.success('Account deleted permanently');
      logout();
      window.location.href = '/';
    } catch (err: any) {
      toast.error(err.response?.data?.error?.message || 'Failed to delete account');
      setIsDeletingAccount(false);
    }
  };

  return (
    <div className="space-y-8 max-w-3xl mx-auto">
      <PageHeader
        title="Agronomist Profile & Settings"
        kicker="Account Preferences"
        description="Manage your visual advisory language, regional growing zones, security credentials, and data retention."
      />

      {/* Profile Details Form */}
      <div className="p-6 rounded-2xl bg-cream-100 border border-soil-600/15 warm-shadow space-y-4">
        <div className="flex items-center gap-2 pb-3 border-b border-soil-600/10">
          <User className="w-4 h-4 text-leaf-700" />
          <h3 className="font-serif text-base font-bold text-soil-950">Personal & Regional Settings</h3>
        </div>

        <form onSubmit={handleProfileSubmit(onUpdateProfile)} className="space-y-4 text-xs">
          <div>
            <label className="block font-medium text-soil-700 mb-1">Email Address</label>
            <input
              type="text"
              disabled
              value={user?.email || ''}
              className="w-full bg-cream-200/50 border border-soil-600/15 rounded-xl px-3.5 py-2 text-soil-600 cursor-not-allowed"
            />
            <span className="text-[10px] text-soil-500">Email cannot be changed</span>
          </div>

          <div>
            <label className="block font-medium text-soil-700 mb-1">Full Name</label>
            <input
              type="text"
              {...regProfile('fullName')}
              className="w-full bg-cream-50 border border-soil-600/20 focus:border-leaf-600 rounded-xl px-3.5 py-2 text-soil-900 focus:outline-none"
            />
            {profileErrors.fullName && (
              <p className="text-rust-600 mt-1">{profileErrors.fullName.message}</p>
            )}
          </div>

          <div>
            <label className="block font-medium text-soil-700 mb-1">Farming Region / State</label>
            <input
              type="text"
              {...regProfile('region')}
              placeholder="e.g. Punjab, India"
              className="w-full bg-cream-50 border border-soil-600/20 focus:border-leaf-600 rounded-xl px-3.5 py-2 text-soil-900 focus:outline-none"
            />
          </div>

          <div>
            <label className="block font-medium text-soil-700 mb-1">
              Advisory Output Language Preference
            </label>
            <select
              {...regProfile('language')}
              className="w-full bg-cream-50 border border-soil-600/20 focus:border-leaf-600 rounded-xl px-3.5 py-2 text-soil-900 focus:outline-none"
            >
              <option value="en">English (Default)</option>
              <option value="hi">हिंदी (Hindi)</option>
              <option value="bn">বাংলা (Bengali)</option>
              <option value="te">తెలుగు (Telugu)</option>
              <option value="ta">தமிழ் (Tamil)</option>
              <option value="mr">मराठी (Marathi)</option>
            </select>
            <span className="text-[10px] text-soil-500">
              Gemini will output human-readable diagnosis and treatment advice in this language
            </span>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={isUpdatingProfile}
              className="px-5 py-2 rounded-xl bg-leaf-700 hover:bg-leaf-800 disabled:opacity-50 text-cream-50 font-semibold btn-press transition-colors cursor-pointer"
            >
              {isUpdatingProfile ? 'Saving…' : 'Save Preferences'}
            </button>
          </div>
        </form>
      </div>

      {/* Change Password Form */}
      <div className="p-6 rounded-2xl bg-cream-100 border border-soil-600/15 warm-shadow space-y-4">
        <div className="flex items-center gap-2 pb-3 border-b border-soil-600/10">
          <Key className="w-4 h-4 text-soil-700" />
          <h3 className="font-serif text-base font-bold text-soil-950">Change Password</h3>
        </div>

        <form onSubmit={handlePasswordSubmit(onChangePassword)} className="space-y-4 text-xs">
          <div>
            <label className="block font-medium text-soil-700 mb-1">Current Password</label>
            <input
              type="password"
              {...regPassword('currentPassword')}
              className="w-full bg-cream-50 border border-soil-600/20 focus:border-leaf-600 rounded-xl px-3.5 py-2 text-soil-900 focus:outline-none"
            />
            {passwordErrors.currentPassword && (
              <p className="text-rust-600 mt-1">{passwordErrors.currentPassword.message}</p>
            )}
          </div>

          <div>
            <label className="block font-medium text-soil-700 mb-1">New Password</label>
            <input
              type="password"
              {...regPassword('newPassword')}
              placeholder="Minimum 8 characters with Upper, Lower & Number"
              className="w-full bg-cream-50 border border-soil-600/20 focus:border-leaf-600 rounded-xl px-3.5 py-2 text-soil-900 focus:outline-none"
            />
            {passwordErrors.newPassword && (
              <p className="text-rust-600 mt-1">{passwordErrors.newPassword.message}</p>
            )}
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={isChangingPassword}
              className="px-5 py-2 rounded-xl bg-leaf-700 hover:bg-leaf-800 disabled:opacity-50 text-cream-50 font-semibold btn-press transition-colors cursor-pointer"
            >
              {isChangingPassword ? 'Updating…' : 'Update Password'}
            </button>
          </div>
        </form>
      </div>

      {/* Danger Zone: Delete Account */}
      <div className="p-6 rounded-2xl bg-rust-50/70 border border-rust-500/30 space-y-3">
        <div className="flex items-center gap-2">
          <Trash2 className="w-4 h-4 text-rust-600" />
          <h3 className="font-serif text-base font-bold text-rust-900">Delete Account & Data</h3>
        </div>
        <p className="text-xs text-soil-700">
          Permanently delete your account, registered fields, uploaded photos, and historical pathology scans. This action is irreversible.
        </p>
        <button
          type="button"
          onClick={() => setShowDeleteModal(true)}
          className="px-4 py-2 rounded-xl bg-rust-500 hover:bg-rust-600 text-white text-xs font-semibold btn-press transition-colors cursor-pointer"
        >
          Delete Account
        </button>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-soil-950/50 backdrop-blur-xs">
          <div className="bg-cream-50 rounded-2xl border border-soil-600/20 max-w-md w-full p-6 space-y-4 warm-shadow-lg text-xs">
            <div className="flex items-center gap-2 text-rust-700">
              <AlertTriangle className="w-5 h-5" />
              <h4 className="font-serif text-base font-bold">Confirm Account Deletion</h4>
            </div>

            <p className="text-soil-700">
              All your fields, stored photos, and AI diagnostic records will be permanently removed in accordance with data privacy standards.
            </p>

            <div>
              <label className="block font-medium text-soil-700 mb-1">
                Enter your password to confirm:
              </label>
              <input
                type="password"
                value={deletePassword}
                onChange={(e) => setDeletePassword(e.target.value)}
                placeholder="Your current password"
                className="w-full bg-cream-100 border border-soil-600/20 rounded-xl px-3 py-2 text-soil-900 focus:outline-none"
              />
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 rounded-xl bg-cream-100 hover:bg-cream-200 text-soil-800 font-medium cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={onDeleteAccount}
                disabled={isDeletingAccount || !deletePassword}
                className="px-4 py-2 rounded-xl bg-rust-500 hover:bg-rust-600 disabled:opacity-50 text-white font-semibold cursor-pointer"
              >
                {isDeletingAccount ? 'Deleting…' : 'Permanently Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
