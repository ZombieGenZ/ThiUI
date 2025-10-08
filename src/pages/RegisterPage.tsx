import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, User, Eye, EyeOff, AlertCircle, CheckCircle2, UserPlus } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export function RegisterPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [mounted, setMounted] = useState(false);
  const { signUp } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    setMounted(true);
  }, []);

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
    setPasswordStrength(calculatePasswordStrength(value));
  };

  const getPasswordStrengthColor = () => {
    if (passwordStrength <= 1) return 'bg-red-500';
    if (passwordStrength <= 2) return 'bg-orange-500';
    if (passwordStrength <= 3) return 'bg-yellow-500';
    if (passwordStrength <= 4) return 'bg-green-500';
    return 'bg-green-600';
  };

  const getPasswordStrengthText = () => {
    if (passwordStrength <= 1) return 'Yếu';
    if (passwordStrength <= 2) return 'Trung bình';
    if (passwordStrength <= 3) return 'Khá';
    if (passwordStrength <= 4) return 'Mạnh';
    return 'Rất mạnh';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      if (!fullName.trim()) {
        throw new Error('Vui lòng nhập họ tên');
      }
      if (password.length < 8) {
        throw new Error('Mật khẩu phải có ít nhất 8 ký tự');
      }
      if (password !== confirmPassword) {
        throw new Error('Mật khẩu xác nhận không khớp');
      }

      const { error } = await signUp(email, password, fullName);
      if (error) throw error;

      setSuccess('Tạo tài khoản thành công! Đang chuyển đến trang đăng nhập...');
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (err: any) {
      setError(err.message || 'Có lỗi xảy ra');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-50 via-white to-neutral-50 flex items-center justify-center px-4 py-12 relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_20%,rgba(34,197,94,0.1),transparent_50%),radial-gradient(circle_at_30%_80%,rgba(34,197,94,0.08),transparent_50%)]" />

      <div className={`w-full max-w-md relative z-10 transition-all duration-700 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
        <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl p-8 border border-white/20 relative overflow-hidden group hover:shadow-brand-200/50 transition-all duration-500">
          <div className="absolute inset-0 bg-gradient-to-br from-brand-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

          <div className="relative z-10">
            <div className="text-center mb-8 space-y-4">
              <Link to="/" className="inline-block mb-2 transform hover:scale-105 transition-transform duration-300">
                <span className="font-serif text-4xl">
                  <span className="text-brand-600 inline-block hover:text-brand-700 transition-colors">Zombie</span>
                  <span className="text-neutral-900">Shop</span>
                </span>
              </Link>

              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-brand-500 to-brand-600 rounded-2xl mb-4 shadow-lg shadow-brand-200 animate-float">
                <UserPlus className="w-8 h-8 text-white" />
              </div>

              <h1 className="font-serif text-4xl mb-2 font-bold text-neutral-900 animate-slide-up">
                Đăng ký
              </h1>
              <p className="text-gray-600 animate-slide-up" style={{ animationDelay: '100ms' }}>
                Tạo tài khoản mới để bắt đầu
              </p>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-6 text-sm flex items-start space-x-2 animate-shake">
                <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            {success && (
              <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-xl mb-6 text-sm flex items-start space-x-2 animate-bounce-in">
                <CheckCircle2 className="w-5 h-5 flex-shrink-0 mt-0.5" />
                <span>{success}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="group animate-slide-up" style={{ animationDelay: '200ms' }}>
                <label className="block text-sm font-semibold mb-2 text-gray-700">Họ và tên</label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-brand-600 transition-colors duration-300" />
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full pl-12 pr-4 py-3.5 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-all duration-300 bg-white/50 backdrop-blur-sm hover:bg-white focus:bg-white"
                    placeholder="Nguyễn Văn A"
                    required
                  />
                </div>
              </div>

              <div className="group animate-slide-up" style={{ animationDelay: '300ms' }}>
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

              <div className="group animate-slide-up" style={{ animationDelay: '400ms' }}>
                <label className="block text-sm font-semibold mb-2 text-gray-700">Mật khẩu</label>
                <div>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-brand-600 transition-colors duration-300" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => handlePasswordChange(e.target.value)}
                      className="w-full pl-12 pr-12 py-3.5 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-all duration-300 bg-white/50 backdrop-blur-sm hover:bg-white focus:bg-white"
                      placeholder="••••••••"
                      required
                      minLength={8}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-brand-600 transition-all duration-300 p-1 hover:bg-brand-50 rounded-lg"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                  {password && (
                    <div className="mt-3 animate-fade-in">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs text-gray-600 font-medium">Độ mạnh mật khẩu</span>
                        <span className={`text-xs font-bold ${
                          passwordStrength <= 1 ? 'text-red-600' :
                          passwordStrength <= 2 ? 'text-orange-600' :
                          passwordStrength <= 3 ? 'text-yellow-600' :
                          'text-green-600'
                        }`}>{getPasswordStrengthText()}</span>
                      </div>
                      <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className={`h-full transition-all duration-500 ${getPasswordStrengthColor()}`}
                          style={{ width: `${(passwordStrength / 5) * 100}%` }}
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="group animate-slide-up" style={{ animationDelay: '500ms' }}>
                <label className="block text-sm font-semibold mb-2 text-gray-700">Xác nhận mật khẩu</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-brand-600 transition-colors duration-300" />
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full pl-12 pr-12 py-3.5 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-all duration-300 bg-white/50 backdrop-blur-sm hover:bg-white focus:bg-white"
                    placeholder="••••••••"
                    required
                    minLength={8}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-brand-600 transition-all duration-300 p-1 hover:bg-brand-50 rounded-lg"
                  >
                    {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                {confirmPassword && password !== confirmPassword && (
                  <p className="mt-2 text-xs text-red-600 flex items-center space-x-1 animate-shake">
                    <AlertCircle className="w-3 h-3" />
                    <span>Mật khẩu không khớp</span>
                  </p>
                )}
                {confirmPassword && password === confirmPassword && (
                  <p className="mt-2 text-xs text-green-600 flex items-center space-x-1 animate-fade-in">
                    <CheckCircle2 className="w-3 h-3" />
                    <span>Mật khẩu khớp</span>
                  </p>
                )}
              </div>

              <button
                type="submit"
                disabled={loading || password !== confirmPassword}
                className="w-full bg-gradient-to-r from-brand-600 to-brand-700 text-white py-3.5 rounded-xl hover:from-brand-700 hover:to-brand-800 transition-all duration-300 font-semibold disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-brand-200 hover:shadow-xl hover:shadow-brand-300 transform hover:-translate-y-1 active:translate-y-0 animate-slide-up relative overflow-hidden group/btn"
                style={{ animationDelay: '600ms' }}
              >
                <span className="absolute inset-0 bg-white/20 translate-y-full group-hover/btn:translate-y-0 transition-transform duration-300" />
                {loading ? (
                  <span className="flex items-center justify-center space-x-2 relative z-10">
                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    <span>Đang xử lý...</span>
                  </span>
                ) : (
                  <span className="relative z-10">Đăng ký</span>
                )}
              </button>
            </form>

            <div className="mt-8 text-center text-sm animate-slide-up" style={{ animationDelay: '700ms' }}>
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-4 bg-white text-gray-500">hoặc</span>
                </div>
              </div>

              <p className="text-gray-600 mt-6">
                Đã có tài khoản?{' '}
                <Link
                  to="/login"
                  className="text-brand-600 font-bold hover:text-brand-700 hover:underline transition-all inline-flex items-center gap-1"
                >
                  Đăng nhập ngay
                  <svg className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </Link>
              </p>
            </div>
          </div>
        </div>

        <div className="text-center mt-6 animate-slide-up" style={{ animationDelay: '800ms' }}>
          <Link to="/" className="text-sm text-gray-600 hover:text-gray-900 transition-all inline-flex items-center gap-2 hover:gap-3">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Về trang chủ
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
        @keyframes bounce-in {
          0% { opacity: 0; transform: scale(0.9); }
          50% { transform: scale(1.05); }
          100% { opacity: 1; transform: scale(1); }
        }
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .animate-float {
          animation: float 3s ease-in-out infinite;
        }
        .animate-shake {
          animation: shake 0.3s ease-in-out;
        }
        .animate-bounce-in {
          animation: bounce-in 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
        }
        .animate-fade-in {
          animation: fade-in 0.3s ease-out;
        }
        .animate-slide-up {
          animation: slideUp 0.5s ease-out forwards;
          opacity: 0;
        }
      `}</style>
    </div>
  );
}
