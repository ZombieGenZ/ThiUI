import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { User, Mail, Phone, Save, Package, Heart, Lock, Shield, MapPin } from 'lucide-react';
import { toast } from 'react-toastify';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

interface UserProfile {
  id: string;
  full_name: string;
  phone: string;
  avatar_url: string;
}

export function ProfilePage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [orderCount, setOrderCount] = useState(0);
  const [favoriteCount, setFavoriteCount] = useState(0);
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [profile, setProfile] = useState<UserProfile>({
    id: '',
    full_name: '',
    phone: '',
    avatar_url: '',
  });
  const [address, setAddress] = useState('');

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    loadProfile();
  }, [user]);

  const loadProfile = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') throw error;

      if (data) {
        setProfile(data);
        setAddress(data.address || '');
      } else {
        setProfile({
          id: user.id,
          full_name: '',
          phone: '',
          avatar_url: '',
        });
      }

      const { count: ordersCount } = await supabase
        .from('orders')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id);

      const { count: favoritesCount } = await supabase
        .from('favorites')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id);

      setOrderCount(ordersCount || 0);
      setFavoriteCount(favoritesCount || 0);
    } catch (error) {
      console.error('Error loading profile:', error);
      toast.error('Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setSaving(true);
    try {
      const { data: existingProfile } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', user.id)
        .maybeSingle();

      if (existingProfile) {
        const { error } = await supabase
          .from('profiles')
          .update({
            full_name: profile.full_name,
            phone: profile.phone,
            address: address,
            updated_at: new Date().toISOString(),
          })
          .eq('id', user.id);

        if (error) throw error;
      } else {
        const { error } = await supabase.from('profiles').insert({
          id: user.id,
          full_name: profile.full_name,
          phone: profile.phone,
          address: address,
        });

        if (error) throw error;
      }

      toast.success('Profile updated successfully!');
    } catch (error) {
      console.error('Error saving profile:', error);
      toast.error('Failed to save profile');
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!passwordData.currentPassword) {
      toast.error('Please enter your current password');
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }

    if (passwordData.newPassword.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    if (passwordData.newPassword === passwordData.currentPassword) {
      toast.error('New password must be different from current password');
      return;
    }

    setChangingPassword(true);
    try {
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: user?.email || '',
        password: passwordData.currentPassword,
      });

      if (signInError) {
        toast.error('Current password is incorrect');
        setChangingPassword(false);
        return;
      }

      const { error } = await supabase.auth.updateUser({
        password: passwordData.newPassword,
      });

      if (error) throw error;

      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setShowPasswordForm(false);

      toast.success('Password changed successfully! You will be signed out for security.');

      await supabase.auth.signOut({ scope: 'global' });

      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (error: any) {
      console.error('Error changing password:', error);
      toast.error(error.message || 'Failed to change password');
    } finally {
      setChangingPassword(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-brand-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-50 to-neutral-100 py-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-4xl font-display font-bold text-neutral-900 mb-2">My Account</h1>
          <p className="text-neutral-600">Manage your profile and preferences</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
              <div className="bg-gradient-to-br from-brand-600 to-brand-700 px-6 py-8 text-white relative">
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16"></div>
                <div className="relative">
                  <div className="w-24 h-24 mx-auto rounded-full bg-white/20 flex items-center justify-center backdrop-blur-sm border-4 border-white/30 mb-4">
                    {profile.avatar_url ? (
                      <img
                        src={profile.avatar_url}
                        alt="Profile"
                        className="w-full h-full rounded-full object-cover"
                      />
                    ) : (
                      <User className="w-12 h-12" />
                    )}
                  </div>
                  <h2 className="text-center text-xl font-bold mb-1">{profile.full_name || 'Full Name'}</h2>
                  <p className="text-center text-brand-100 text-sm">{user?.email}</p>
                </div>
              </div>

              <div className="p-6 space-y-4">
                <Link
                  to="/orders"
                  className="flex items-center justify-between p-4 rounded-xl bg-neutral-50 hover:bg-neutral-100 transition-all group"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-lg bg-brand-100 flex items-center justify-center group-hover:scale-110 transition-transform">
                      <Package className="w-5 h-5 text-brand-600" />
                    </div>
                    <span className="font-semibold text-neutral-900">My Orders</span>
                  </div>
                  <span className="text-2xl font-bold text-brand-600">{orderCount}</span>
                </Link>

                <Link
                  to="/favorites"
                  className="flex items-center justify-between p-4 rounded-xl bg-neutral-50 hover:bg-neutral-100 transition-all group"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-lg bg-red-100 flex items-center justify-center group-hover:scale-110 transition-transform">
                      <Heart className="w-5 h-5 text-red-500" />
                    </div>
                    <span className="font-semibold text-neutral-900">Favorites</span>
                  </div>
                  <span className="text-2xl font-bold text-red-500">{favoriteCount}</span>
                </Link>

                <button
                  onClick={() => setShowPasswordForm(!showPasswordForm)}
                  className="w-full flex items-center justify-between p-4 rounded-xl bg-neutral-50 hover:bg-neutral-100 transition-all group"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-lg bg-neutral-200 flex items-center justify-center group-hover:scale-110 transition-transform">
                      <Shield className="w-5 h-5 text-neutral-700" />
                    </div>
                    <span className="font-semibold text-neutral-900">Change Password</span>
                  </div>
                </button>
              </div>
            </div>
          </div>

          <div className="lg:col-span-2 space-y-8">
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
              <div className="bg-gradient-to-r from-neutral-800 to-neutral-700 px-6 py-4">
                <h3 className="text-white font-semibold text-lg">Personal Information</h3>
              </div>

              <form onSubmit={handleSave} className="p-6 space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-neutral-700 mb-2">
                    Full Name
                  </label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
                    <input
                      type="text"
                      value={profile.full_name}
                      onChange={(e) => setProfile({ ...profile, full_name: e.target.value })}
                      placeholder="Enter your full name"
                      className="w-full pl-12 pr-4 py-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-neutral-700 mb-2">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
                    <input
                      type="email"
                      value={user?.email || ''}
                      disabled
                      className="w-full pl-12 pr-4 py-3 border border-neutral-300 rounded-lg bg-neutral-100 text-neutral-500 cursor-not-allowed"
                    />
                  </div>
                  <p className="mt-1 text-xs text-neutral-500">Email cannot be changed</p>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-neutral-700 mb-2">
                    Phone Number
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
                    <input
                      type="tel"
                      value={profile.phone}
                      onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                      placeholder="Enter your phone number"
                      className="w-full pl-12 pr-4 py-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-neutral-700 mb-2">
                    Address
                  </label>
                  <div className="relative">
                    <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
                    <input
                      type="text"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      placeholder="Enter your address"
                      className="w-full pl-12 pr-4 py-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all"
                    />
                  </div>
                </div>

                <div className="flex space-x-4 pt-4">
                  <button
                    type="submit"
                    disabled={saving}
                    className="flex-1 bg-brand-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-brand-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                  >
                    <Save className="w-5 h-5" />
                    <span>{saving ? 'Saving...' : 'Save Changes'}</span>
                  </button>
                </div>
              </form>
            </div>

            {showPasswordForm && (
              <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
              <div className="bg-gradient-to-r from-neutral-800 to-neutral-700 px-6 py-4">
                <h3 className="text-white font-semibold text-lg">Change Password</h3>
              </div>

              <form onSubmit={handleChangePassword} className="p-6 space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-neutral-700 mb-2">
                    Current Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
                    <input
                      type="password"
                      value={passwordData.currentPassword}
                      onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                      placeholder="Enter current password"
                      className="w-full pl-12 pr-4 py-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-neutral-700 mb-2">
                    New Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
                    <input
                      type="password"
                      value={passwordData.newPassword}
                      onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                      placeholder="Enter new password"
                      className="w-full pl-12 pr-4 py-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all"
                      required
                    />
                  </div>
                  <p className="mt-1 text-xs text-neutral-500">Minimum 6 characters</p>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-neutral-700 mb-2">
                    Confirm New Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
                    <input
                      type="password"
                      value={passwordData.confirmPassword}
                      onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                      placeholder="Confirm new password"
                      className="w-full pl-12 pr-4 py-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all"
                      required
                    />
                  </div>
                </div>

                <div className="flex space-x-4">
                  <button
                    type="submit"
                    disabled={changingPassword}
                    className="flex-1 bg-brand-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-brand-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                  >
                    <Lock className="w-5 h-5" />
                    <span>{changingPassword ? 'Changing...' : 'Change Password'}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowPasswordForm(false);
                      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
                    }}
                    className="px-6 py-3 border-2 border-neutral-300 text-neutral-700 rounded-lg font-semibold hover:bg-neutral-50 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </form>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
