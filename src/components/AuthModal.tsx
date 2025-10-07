import { useState } from 'react';
import { X, Mail, Lock, User, Eye, EyeOff, CheckCircle2, AlertCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AuthModal({ isOpen, onClose }: AuthModalProps) {
  const [mode, setMode] = useState<'signin' | 'signup' | 'reset'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [passwordStrength, setPasswordStrength] = useState(0);

  const { signIn, signUp, resetPassword } = useAuth();

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      if (mode === 'signin') {
        const { error } = await signIn(email, password);
        if (error) throw error;
        onClose();
      } else if (mode === 'signup') {
        if (!fullName.trim()) {
          throw new Error('Please enter your full name');
        }
        if (password.length < 8) {
          throw new Error('Password must be at least 8 characters long');
        }
        if (password !== confirmPassword) {
          throw new Error('Passwords do not match');
        }
        const { error } = await signUp(email, password, fullName);
        if (error) throw error;
        setSuccess('Account created successfully! You can now sign in.');
        setTimeout(() => {
          setMode('signin');
          setSuccess('');
          setPassword('');
          setConfirmPassword('');
          setFullName('');
        }, 2000);
      } else if (mode === 'reset') {
        const { error } = await resetPassword(email);
        if (error) throw error;
        setSuccess('Password reset link sent to your email!');
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const calculatePasswordStrength = (pass: string) => {
    let strength = 0;
    if (pass.length >= 8) strength++;
    if (pass.length >= 12) strength++;
    if (/[a-z]/.test(pass) && /[A-Z]/.test(pass)) strength++;
    if (/\d/.test(pass)) strength++;
    if (/[^a-zA-Z\d]/.test(pass)) strength++;
    return strength;
  };

  const handlePasswordChange = (value: string) => {
    setPassword(value);
    if (mode === 'signup') {
      setPasswordStrength(calculatePasswordStrength(value));
    }
  };

  const getPasswordStrengthColor = () => {
    if (passwordStrength <= 1) return 'bg-red-500';
    if (passwordStrength <= 2) return 'bg-orange-500';
    if (passwordStrength <= 3) return 'bg-yellow-500';
    if (passwordStrength <= 4) return 'bg-green-500';
    return 'bg-green-600';
  };

  const getPasswordStrengthText = () => {
    if (passwordStrength <= 1) return 'Weak';
    if (passwordStrength <= 2) return 'Fair';
    if (passwordStrength <= 3) return 'Good';
    if (passwordStrength <= 4) return 'Strong';
    return 'Very Strong';
  };

  return (
    <>
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 transition-opacity animate-fade-in"
        onClick={onClose}
      />

      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md relative animate-scale-in pointer-events-auto border border-gray-100">
          <button
            onClick={onClose}
            className="absolute right-4 top-4 p-2 hover:bg-gray-100 rounded-full transition-colors"
           
          >
            <X className="w-5 h-5" />
          </button>

          <div className="p-8">
            <div className="text-center mb-6">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-brand-100 rounded-full mb-4">
                <User className="w-8 h-8 text-brand-600" />
              </div>
              <h2 className="font-serif text-3xl mb-2 font-bold text-neutral-900">
                {mode === 'signin' ? 'Welcome Back' : mode === 'signup' ? 'Create Account' : 'Reset Password'}
              </h2>
              <p className="text-gray-600">
                {mode === 'signin'
                  ? 'Sign in to access your account'
                  : mode === 'signup'
                  ? 'Join our community and start shopping'
                  : 'Enter your email to receive a reset link'}
              </p>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-4 text-sm flex items-start space-x-2 animate-shake">
                <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            {success && (
              <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-xl mb-4 text-sm flex items-start space-x-2">
                <CheckCircle2 className="w-5 h-5 flex-shrink-0 mt-0.5" />
                <span>{success}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {mode === 'signup' && (
                <div>
                  <label className="block text-sm font-medium mb-2">Full Name</label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="w-full pl-12 pr-4 py-3.5 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-all"
                      placeholder="John Doe"
                      required
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium mb-2">Email</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-12 pr-4 py-3.5 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-all"
                    placeholder="you@example.com"
                    required
                  />
                </div>
              </div>

              {mode !== 'reset' && (
                <div>
                  <label className="block text-sm font-medium mb-2">Password</label>
                  <div>
                    <div className="relative">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={(e) => handlePasswordChange(e.target.value)}
                        className="w-full pl-12 pr-12 py-3.5 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-all"
                        placeholder="••••••••"
                        required
                        minLength={mode === 'signup' ? 8 : 6}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                      >
                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                    {mode === 'signup' && password && (
                      <div className="mt-2">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs text-gray-600">Password strength</span>
                          <span className="text-xs font-semibold text-gray-700">{getPasswordStrengthText()}</span>
                        </div>
                        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div
                            className={`h-full transition-all duration-300 ${getPasswordStrengthColor()}`}
                            style={{ width: `${(passwordStrength / 5) * 100}%` }}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {mode === 'signup' && (
                <div>
                  <label className="block text-sm font-medium mb-2">Confirm Password</label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full pl-12 pr-12 py-3.5 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-all"
                      placeholder="••••••••"
                      required
                      minLength={8}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                  {confirmPassword && password !== confirmPassword && (
                    <p className="mt-1 text-xs text-red-600 flex items-center space-x-1">
                      <AlertCircle className="w-3 h-3" />
                      <span>Passwords do not match</span>
                    </p>
                  )}
                </div>
              )}

              {mode === 'signin' && (
                <div className="flex items-center justify-between text-sm">
                  <label className="flex items-center space-x-2">
                    <input type="checkbox" className="rounded" />
                    <span>Remember me</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => setMode('reset')}
                    className="text-black hover:underline"
                   
                  >
                    Forgot password?
                  </button>
                </div>
              )}

              <button
                type="submit"
                disabled={loading || (mode === 'signup' && password !== confirmPassword)}
                className="w-full bg-brand-600 text-white py-3.5 rounded-xl hover:bg-brand-700 transition-all font-semibold disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 active:translate-y-0"
              >
                {loading ? (
                  <span className="flex items-center justify-center space-x-2">
                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    <span>Please wait...</span>
                  </span>
                ) : (
                  mode === 'signin' ? 'Sign In' : mode === 'signup' ? 'Create Account' : 'Send Reset Link'
                )}
              </button>
            </form>

            <div className="mt-6 text-center text-sm">
              {mode === 'signin' ? (
                <p>
                  Don't have an account?{' '}
                  <button
                    onClick={() => {
                      setMode('signup');
                      setError('');
                      setSuccess('');
                      setPassword('');
                      setConfirmPassword('');
                    }}
                    className="text-brand-600 font-semibold hover:underline transition-colors"
                  >
                    Sign up
                  </button>
                </p>
              ) : (
                <p>
                  Already have an account?{' '}
                  <button
                    onClick={() => {
                      setMode('signin');
                      setError('');
                      setSuccess('');
                      setPassword('');
                      setConfirmPassword('');
                    }}
                    className="text-brand-600 font-semibold hover:underline transition-colors"
                  >
                    Sign in
                  </button>
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes scale-in {
          from {
            opacity: 0;
            transform: scale(0.9) translateY(10px);
          }
          to {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }
        @keyframes fade-in {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-5px); }
          75% { transform: translateX(5px); }
        }
        .animate-scale-in {
          animation: scale-in 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
        }
        .animate-fade-in {
          animation: fade-in 0.2s ease-out;
        }
        .animate-shake {
          animation: shake 0.3s ease-in-out;
        }
      `}</style>
    </>
  );
}
