import React, { useState } from 'react';
import { 
  X, User as UserIcon, Lock, Camera, Phone, Mail, 
  ShieldCheck, Check, AlertCircle, LogOut, KeyRound, Image 
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { USER_AVATARS, getUserAvatar } from '../../utils/imageUtils';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const PRESET_AVATARS = [
  { label: 'Faizan (Owner)', url: USER_AVATARS.OWNER },
  { label: 'Manager Badge', url: USER_AVATARS.MANAGER },
  { label: 'Cashier 1', url: USER_AVATARS.CASHIER_1 },
  { label: 'Cashier 2', url: USER_AVATARS.CASHIER_2 },
  { label: 'Default Rider', url: USER_AVATARS.DEFAULT },
];

export const ProfileModal: React.FC<ProfileModalProps> = ({ isOpen, onClose }) => {
  const { currentUser, updateProfile, logout } = useAuth();

  const [activeTab, setActiveTab] = useState<'details' | 'avatar' | 'security'>('details');
  const [name, setName] = useState(currentUser.name);
  const [email, setEmail] = useState(currentUser.email || '');
  const [phone, setPhone] = useState(currentUser.phone || '');
  const [avatarUrl, setAvatarUrl] = useState(currentUser.avatar || '');
  
  // Password change state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [statusMsg, setStatusMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [saving, setSaving] = useState(false);

  if (!isOpen) return null;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      setStatusMsg({ type: 'error', text: 'Image file size must be less than 2MB.' });
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target?.result as string;
      setAvatarUrl(base64);
    };
    reader.readAsDataURL(file);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatusMsg(null);

    if (newPassword) {
      if (newPassword.length < 5) {
        setStatusMsg({ type: 'error', text: 'New password must be at least 5 characters long.' });
        return;
      }
      if (newPassword !== confirmPassword) {
        setStatusMsg({ type: 'error', text: 'New passwords do not match.' });
        return;
      }
    }

    setSaving(true);
    const res = await updateProfile({
      name,
      email,
      phone,
      avatar: avatarUrl,
      currentPassword: currentPassword || undefined,
      newPassword: newPassword || undefined
    });
    setSaving(false);

    if (res.success) {
      setStatusMsg({ type: 'success', text: 'Profile & credentials updated successfully in MongoDB!' });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setTimeout(() => {
        setStatusMsg(null);
      }, 3000);
    } else {
      setStatusMsg({ type: 'error', text: res.message || 'Failed to update profile.' });
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-[#111622] rounded-2xl border border-[#1E2638] shadow-2xl max-w-lg w-full flex flex-col my-auto overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-[#1E2638] flex items-center justify-between bg-[#0B0E14]">
          <div className="flex items-center gap-3">
            <div className="relative">
              <img
                src={getUserAvatar(avatarUrl || currentUser.avatar, currentUser.role, currentUser.username)}
                alt={currentUser.name}
                className="w-11 h-11 rounded-full object-cover border-2 border-rose-600 shadow-md"
              />
              <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-[#111622] rounded-full"></span>
            </div>
            <div>
              <h3 className="font-extrabold text-white text-base leading-tight">{currentUser.name}</h3>
              <p className="text-xs text-slate-400 flex items-center gap-1.5 mt-0.5">
                <span className="capitalize font-mono px-1.5 py-0.2 rounded bg-rose-950/60 text-rose-400 border border-rose-800/40 text-[10px]">
                  {currentUser.role}
                </span>
                <span>• @{currentUser.username}</span>
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl hover:bg-[#1A2234] text-slate-400 hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex border-b border-[#1E2638] bg-[#0E121B] text-xs">
          <button
            type="button"
            onClick={() => setActiveTab('details')}
            className={`flex-1 py-2.5 font-bold transition flex items-center justify-center gap-1.5 border-b-2 ${
              activeTab === 'details'
                ? 'border-rose-600 text-rose-400 bg-[#141A28]'
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            <UserIcon className="w-3.5 h-3.5" />
            <span>Profile Info</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('avatar')}
            className={`flex-1 py-2.5 font-bold transition flex items-center justify-center gap-1.5 border-b-2 ${
              activeTab === 'avatar'
                ? 'border-rose-600 text-rose-400 bg-[#141A28]'
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            <Camera className="w-3.5 h-3.5" />
            <span>Change Photo</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('security')}
            className={`flex-1 py-2.5 font-bold transition flex items-center justify-center gap-1.5 border-b-2 ${
              activeTab === 'security'
                ? 'border-rose-600 text-rose-400 bg-[#141A28]'
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            <KeyRound className="w-3.5 h-3.5" />
            <span>Security / Password</span>
          </button>
        </div>

        {/* Status Alerts */}
        {statusMsg && (
          <div className={`p-3 mx-4 mt-3 rounded-xl text-xs font-semibold flex items-center gap-2 ${
            statusMsg.type === 'success'
              ? 'bg-emerald-950/60 border border-emerald-800/40 text-emerald-300'
              : 'bg-rose-950/60 border border-rose-800/40 text-rose-300'
          }`}>
            {statusMsg.type === 'success' ? <Check className="w-4 h-4 shrink-0 text-emerald-400" /> : <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />}
            <span>{statusMsg.text}</span>
          </div>
        )}

        {/* Content Form */}
        <form onSubmit={handleSave} className="p-4 sm:p-5 space-y-4 text-xs">
          {activeTab === 'details' && (
            <div className="space-y-3">
              <div>
                <label className="font-bold text-slate-300 block mb-1">Display Name</label>
                <div className="relative">
                  <UserIcon className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={e => setName(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 bg-[#0B0E14] border border-[#1E2638] rounded-xl text-white focus:outline-none focus:border-rose-500 transition"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-300 block mb-1">Email Address</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 bg-[#0B0E14] border border-[#1E2638] rounded-xl text-white focus:outline-none focus:border-rose-500 transition"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-300 block mb-1">Phone Number</label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 bg-[#0B0E14] border border-[#1E2638] rounded-xl text-white focus:outline-none focus:border-rose-500 transition"
                  />
                </div>
              </div>

              <div className="p-3 bg-[#0B0E14] border border-[#1E2638] rounded-xl space-y-1 text-[11px] text-slate-400">
                <div className="flex justify-between">
                  <span>Account ID:</span>
                  <span className="font-mono text-white font-bold">{currentUser.id}</span>
                </div>
                <div className="flex justify-between">
                  <span>Username:</span>
                  <span className="font-mono text-rose-400 font-bold">@{currentUser.username}</span>
                </div>
                <div className="flex justify-between">
                  <span>Assigned Counter:</span>
                  <span className="text-slate-300 font-medium">{currentUser.counterId || 'Main Terminal'}</span>
                </div>
                <div className="flex justify-between">
                  <span>Last Login:</span>
                  <span className="text-slate-300">{currentUser.lastLogin || 'Active now'}</span>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'avatar' && (
            <div className="space-y-4">
              <div className="flex items-center gap-4 p-3 bg-[#0B0E14] border border-[#1E2638] rounded-xl">
                <img
                  src={getUserAvatar(avatarUrl || currentUser.avatar, currentUser.role, currentUser.username)}
                  alt="Preview"
                  className="w-16 h-16 rounded-full object-cover border-2 border-rose-500 shrink-0"
                />
                <div className="space-y-1.5 flex-1">
                  <span className="font-bold text-white block">Current Avatar Preview</span>
                  <label className="cursor-pointer inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#1B2232] hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-semibold transition border border-slate-700">
                    <Camera className="w-3.5 h-3.5 text-rose-400" />
                    <span>Upload from Device</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-300 block mb-1">Or Paste Image URL</label>
                <input
                  type="url"
                  placeholder="https://images.unsplash.com/..."
                  value={avatarUrl}
                  onChange={e => setAvatarUrl(e.target.value)}
                  className="w-full px-3 py-2 bg-[#0B0E14] border border-[#1E2638] rounded-xl text-white focus:outline-none focus:border-rose-500 transition text-xs font-mono"
                />
              </div>

              <div>
                <span className="font-bold text-slate-300 block mb-2">Or Choose from MotoPro Presets:</span>
                <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                  {PRESET_AVATARS.map((preset, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setAvatarUrl(preset.url)}
                      className={`p-1 rounded-xl border flex flex-col items-center gap-1 transition group ${
                        avatarUrl === preset.url
                          ? 'border-rose-500 bg-rose-950/40'
                          : 'border-[#1E2638] bg-[#0B0E14] hover:border-slate-600'
                      }`}
                    >
                      <img
                        src={preset.url}
                        alt={preset.label}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                      <span className="text-[9px] text-slate-400 truncate w-full text-center">
                        {preset.label.split(' ')[0]}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'security' && (
            <div className="space-y-3">
              <div className="p-3 bg-amber-950/20 border border-amber-800/30 rounded-xl text-[11px] text-amber-300">
                Leave password fields blank if you only want to update your name, photo, or contact details.
              </div>

              <div>
                <label className="font-bold text-slate-300 block mb-1">Current Password</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    placeholder="Enter existing password"
                    value={currentPassword}
                    onChange={e => setCurrentPassword(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 bg-[#0B0E14] border border-[#1E2638] rounded-xl text-white focus:outline-none focus:border-rose-500 transition"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-300 block mb-1">New Password</label>
                <div className="relative">
                  <KeyRound className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    placeholder="At least 5 characters"
                    value={newPassword}
                    onChange={e => setNewPassword(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 bg-[#0B0E14] border border-[#1E2638] rounded-xl text-white focus:outline-none focus:border-rose-500 transition"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-300 block mb-1">Confirm New Password</label>
                <div className="relative">
                  <KeyRound className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    placeholder="Re-type new password"
                    value={confirmPassword}
                    onChange={e => setConfirmPassword(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 bg-[#0B0E14] border border-[#1E2638] rounded-xl text-white focus:outline-none focus:border-rose-500 transition"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex items-center justify-between pt-3 border-t border-[#1E2638]">
            <button
              type="button"
              onClick={() => {
                if (confirm('Log out from your current MotoPro account session?')) {
                  logout();
                  onClose();
                }
              }}
              className="px-3 py-2 text-rose-400 hover:text-white hover:bg-rose-950/40 rounded-xl font-bold flex items-center gap-1.5 transition text-xs border border-rose-900/30"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Log Out</span>
            </button>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-slate-400 hover:text-white hover:bg-[#161C2C] rounded-xl font-semibold transition"
              >
                Close
              </button>
              <button
                type="submit"
                disabled={saving}
                className="px-5 py-2 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-xl transition shadow-lg shadow-rose-600/30 flex items-center gap-1.5"
              >
                {saving ? (
                  <span>Saving...</span>
                ) : (
                  <>
                    <Check className="w-4 h-4" />
                    <span>Save Changes</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
