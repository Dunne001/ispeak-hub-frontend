import { useState } from 'react';
import { Camera, Eye, EyeOff } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../lib/api';
import { useAuth } from '../context/AuthContext';

export default function Profile() {
  const { user, setUser } = useAuth();
  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [savingInfo, setSavingInfo] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  const handleInfoSave = async (e) => {
    e.preventDefault();
    setSavingInfo(true);
    try {
      const res = await api.patch('/profile', { name, phone });
      setUser?.(res.data);
      toast.success('Profile updated');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not update profile.');
    } finally {
      setSavingInfo(false);
    }
  };

  const handleAvatarChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const data = new FormData();
    data.append('avatar', file);

    setUploadingAvatar(true);
    try {
      const res = await api.post('/profile/avatar', data, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setUser?.(res.data);
      toast.success('Photo updated');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not upload photo.');
    } finally {
      setUploadingAvatar(false);
    }
  };

  const initial = user?.name?.[0]?.toUpperCase() || '?';

  return (
    <div className="max-w-xl">
      <h1 className="mb-1 text-2xl font-semibold text-navy">Profile</h1>
      <p className="mb-6 text-sm text-navy/60">Manage your account details</p>

      <div className="mb-6 flex items-center gap-4 rounded-xl border border-navy/10 bg-white p-4 shadow-sm">
        <div className="relative">
          {user?.avatar_url ? (
            <img
              src={user.avatar_url}
              alt={user.name}
              className="h-16 w-16 rounded-full object-cover"
            />
          ) : (
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-gold to-gold-light font-display text-xl font-semibold text-navy">
              {initial}
            </div>
          )}
          <label className="absolute -bottom-1 -right-1 flex h-6 w-6 cursor-pointer items-center justify-center rounded-full bg-navy text-cream shadow-sm transition hover:bg-navy-light">
            <Camera size={13} />
            <input type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} disabled={uploadingAvatar} />
          </label>
        </div>
        <div>
          <p className="font-medium text-navy">{user?.name}</p>
          <p className="text-sm text-navy/50">{user?.email}</p>
          {uploadingAvatar && <p className="text-xs text-gold">Uploading…</p>}
        </div>
      </div>

      <form onSubmit={handleInfoSave} className="mb-6 space-y-4 rounded-xl border border-navy/10 bg-white p-4 shadow-sm">
        <div>
          <label className="mb-1 block text-sm font-medium text-navy">Name</label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full rounded-lg border border-navy/20 px-3 py-2"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-navy">Phone</label>
          <input
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="2547XXXXXXXX"
            className="w-full rounded-lg border border-navy/20 px-3 py-2"
          />
        </div>
        <button
          type="submit"
          disabled={savingInfo}
          className="rounded-lg bg-navy px-4 py-2 text-sm font-medium text-cream transition hover:bg-navy-light disabled:opacity-50"
        >
          {savingInfo ? 'Saving…' : 'Save changes'}
        </button>
      </form>

      <ChangePasswordForm />
    </div>
  );
}

function ChangePasswordForm() {
  const [current, setCurrent] = useState('');
  const [next, setNext] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNext, setShowNext] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (next !== confirm) {
      toast.error('New passwords do not match');
      return;
    }
    setSubmitting(true);
    try {
      await api.patch('/profile', { current_password: current, password: next });
      toast.success('Password changed');
      setCurrent('');
      setNext('');
      setConfirm('');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not change password.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 rounded-xl border border-navy/10 bg-white p-4 shadow-sm">
      <h2 className="font-medium text-navy">Change password</h2>
      <div className="relative">
        <input
          type={showCurrent ? 'text' : 'password'}
          required
          placeholder="Current password"
          value={current}
          onChange={(e) => setCurrent(e.target.value)}
          className="w-full rounded-lg border border-navy/20 px-3 py-2 pr-10"
        />
        <button type="button" onClick={() => setShowCurrent((v) => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-navy/40" tabIndex={-1}>
          {showCurrent ? <EyeOff size={18} /> : <Eye size={18} />}
        </button>
      </div>
      <div className="relative">
        <input
          type={showNext ? 'text' : 'password'}
          required
          minLength={8}
          placeholder="New password"
          value={next}
          onChange={(e) => setNext(e.target.value)}
          className="w-full rounded-lg border border-navy/20 px-3 py-2 pr-10"
        />
        <button type="button" onClick={() => setShowNext((v) => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-navy/40" tabIndex={-1}>
          {showNext ? <EyeOff size={18} /> : <Eye size={18} />}
        </button>
      </div>
      <input
        type={showNext ? 'text' : 'password'}
        required
        minLength={8}
        placeholder="Confirm new password"
        value={confirm}
        onChange={(e) => setConfirm(e.target.value)}
        className="w-full rounded-lg border border-navy/20 px-3 py-2"
      />
      <button
        type="submit"
        disabled={submitting}
        className="rounded-lg bg-navy px-4 py-2 text-sm font-medium text-cream transition hover:bg-navy-light disabled:opacity-50"
      >
        {submitting ? 'Changing…' : 'Change password'}
      </button>
    </form>
  );
}