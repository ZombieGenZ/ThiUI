import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, AlertCircle, Sparkles } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [mounted, setMounted] = useState(false);
  const { signIn } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const { error } = await signIn(email, password);
      if (error) throw error;
      navigate('/');
    } catch (err: any) {
      setError(err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-50 via-white to-neutral-50 flex items-center justify-center px-4 py-12 relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(34,197,94,0.1),transparent_50%),radial-gradient(circle_at_70%_80%,rgba(34,197,94,0.08),transparent_50%)]" />

      <div className={`w-full max-w-md relative z-10 transition-all duration-700 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
        <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl p-8 border border-white/20 relative overflow-hidden group hover:shadow-brand-200/50 transition-all duration-500">
          <div className="absolute inset-0 bg-gradient-to-br from-brand-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

          <div className="relative z-10">
            <div className="text-center mb-8 space-y-4">
              <Link to="/" className="inline-block mb-2 transform hover:scale-105 transition-transform duration-300">
                <span className="font-display text-4xl">
                  <span className="text-brand-600 inline-block hover:text-brand-700 transition-colors">Zombie</span>
                  <span className="text-neutral-900">Shop</span>
                </span>
              </Link>

              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-brand-500 to-brand-600 rounded-2xl mb-4 shadow-lg shadow-brand-200 animate-float">
                <Sparkles className="w-8 h-8 text-white" />
              </div>

              <h1 className="font-display text-4xl mb-2 font-bold text-neutral-900 animate-slide-up">
                Sign In
              </h1>
              <p className="text-gray-600 animate-slide-up" style={{ animationDelay: '100ms' }}>
                Welcome back
              </p>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-6 text-sm flex items-start space-x-2 animate-shake">
                <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="group animate-slide-up" style={{ animationDelay: '200ms' }}>
                <label className="block text-sm font-semibold mb-2 text-gray-700">Email</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-brand-600 transition-colors duration-300" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-12 pr-4 py-3.5 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-all duration-300 bg-white/50 backdrop-blur-sm hover:bg-white focus:bg-white"
                    placeholder="you@example.com"
                    required
                  />
                </div>
              </div>

              <div className="group animate-slide-up" style={{ animationDelay: '300ms' }}>
                <label className="block text-sm font-semibold mb-2 text-gray-700">Password</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-brand-600 transition-colors duration-300" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-12 pr-12 py-3.5 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-all duration-300 bg-white/50 backdrop-blur-sm hover:bg-white focus:bg-white"
                    placeholder="••••••••"
                    required
                    minLength={6}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-brand-600 transition-all duration-300 p-1 hover:bg-brand-50 rounded-lg"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between text-sm animate-slide-up" style={{ animationDelay: '400ms' }}>
                <label className="flex items-center space-x-2 cursor-pointer group/check">
                  <input type="checkbox" className="rounded border-gray-300 text-brand-600 focus:ring-brand-500 transition-all" />
                  <span className="group-hover/check:text-brand-600 transition-colors">Remember me</span>
                </label>
                <Link
                  to="/forgot-password"
                  className="text-brand-600 hover:text-brand-700 font-semibold hover:underline transition-all"
                >
                  Forgot password?
                </Link>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-brand-600 to-brand-700 text-white py-3.5 rounded-xl hover:from-brand-700 hover:to-brand-800 transition-all duration-300 font-semibold disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-brand-200 hover:shadow-xl hover:shadow-brand-300 transform hover:-translate-y-1 active:translate-y-0 animate-slide-up relative overflow-hidden group/btn"
                style={{ animationDelay: '500ms' }}
              >
                <span className="absolute inset-0 bg-white/20 translate-y-full group-hover/btn:translate-y-0 transition-transform duration-300" />
                {loading ? (
                  <span className="flex items-center justify-center space-x-2 relative z-10">
                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    <span>Processing...</span>
                  </span>
                ) : (
                  <span className="relative z-10">Sign In</span>
                )}
              </button>
            </form>

            <div className="mt-8 text-center text-sm animate-slide-up" style={{ animationDelay: '600ms' }}>
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-4 bg-white text-gray-500">or</span>
                </div>
              </div>

              <p className="text-gray-600 mt-6">
                Don't have an account?{' '}
                <Link
                  to="/register"
                  className="text-brand-600 font-bold hover:text-brand-700 hover:underline transition-all inline-flex items-center gap-1"
                >
                  Sign up now
                  <svg className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </Link>
              </p>
            </div>
          </div>
        </div>

        <div className="text-center mt-6 animate-slide-up" style={{ animationDelay: '700ms' }}>
          <Link to="/" className="text-sm text-gray-600 hover:text-gray-900 transition-all inline-flex items-center gap-2 hover:gap-3">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to home
          </Link>
        </div>
      </div>

      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-5px); }
          75% { transform: translateX(5px); }
        }
        .animate-float {
          animation: float 3s ease-in-out infinite;
        }
        .animate-shake {
          animation: shake 0.3s ease-in-out;
        }
        .animate-slide-up {
          animation: slideUp 0.5s ease-out forwards;
          opacity: 0;
        }
      `}</style>
    </div>
  );
}
