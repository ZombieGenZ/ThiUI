import { useEffect, useState } from 'react';
import { Sofa, Sparkles, Package, Truck } from 'lucide-react';

interface LoadingScreenProps {
  onLoadComplete: () => void;
}

export function LoadingScreen({ onLoadComplete }: LoadingScreenProps) {
  const [progress, setProgress] = useState(0);
  const [stage, setStage] = useState(0);

  const stages = [
    { icon: Package, text: 'Loading products', min: 0, max: 25 },
    { icon: Sparkles, text: 'Setting up shop', min: 25, max: 60 },
    { icon: Truck, text: 'Preparing delivery', min: 60, max: 90 },
    { icon: Sofa, text: 'Almost ready', min: 90, max: 100 },
  ];

  useEffect(() => {
    const progressInterval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(progressInterval);
          setTimeout(() => onLoadComplete(), 500);
          return 100;
        }
        return prev + 1.5;
      });
    }, 20);

    return () => clearInterval(progressInterval);
  }, [onLoadComplete]);

  useEffect(() => {
    const currentStage = stages.findIndex(s => progress >= s.min && progress < s.max);
    if (currentStage !== -1) {
      setStage(currentStage);
    } else if (progress >= 100) {
      setStage(stages.length - 1);
    }
  }, [progress]);

  const CurrentIcon = stages[stage].icon;

  return (
    <div className="fixed inset-0 z-50 bg-gradient-to-br from-neutral-900 via-neutral-800 to-black flex items-center justify-center overflow-hidden">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-brand-500 rounded-full blur-3xl animate-pulse-slow" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-brand-600 rounded-full blur-3xl animate-pulse-slow animation-delay-1000" />
          <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-white rounded-full blur-3xl animate-pulse-slow animation-delay-2000" />
        </div>

        <div className="absolute inset-0">
          {[...Array(30)].map((_, i) => (
            <div
              key={i}
              className="absolute animate-float-particle"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 5}s`,
                animationDuration: `${5 + Math.random() * 5}s`,
              }}
            >
              <div className="w-2 h-2 bg-white/20 rounded-full" />
            </div>
          ))}
        </div>
      </div>

      <div className="relative z-10 text-center px-4 max-w-2xl">
        <div className="mb-16 animate-fade-in-up">
          <div className="flex items-center justify-center mb-8">
            <div className="relative">
              <div className="absolute inset-0 bg-brand-500 blur-2xl opacity-50 animate-pulse" />
              <div className="relative w-24 h-24 bg-gradient-to-br from-brand-400 via-brand-500 to-brand-700 rounded-3xl flex items-center justify-center transform rotate-12 shadow-2xl">
                <Sofa className="w-14 h-14 text-white animate-bounce-smooth" />
              </div>
            </div>
          </div>

          <h1 className="font-serif text-6xl md:text-7xl text-white tracking-tight font-bold mb-4 animate-glow">
            ZombieShop
          </h1>
          <p className="text-xl text-white/70 font-light tracking-wider">
            Crafting Your Perfect Space
          </p>
        </div>

        <div className="mb-12 flex items-center justify-center space-x-4">
          <div className="w-16 h-16 bg-white/10 backdrop-blur-sm rounded-2xl flex items-center justify-center animate-scale-pulse">
            <CurrentIcon className="w-8 h-8 text-brand-400" />
          </div>
          <div className="text-left">
            <p className="text-white/90 font-medium text-lg">{stages[stage].text}</p>
            <p className="text-white/50 text-sm">Please wait...</p>
          </div>
        </div>

        <div className="w-full max-w-md mx-auto">
          <div className="relative h-3 bg-white/10 backdrop-blur-sm rounded-full overflow-hidden shadow-2xl">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer" />
            <div
              className="h-full bg-gradient-to-r from-brand-400 via-brand-500 to-brand-600 transition-all duration-300 ease-out rounded-full relative overflow-hidden"
              style={{ width: `${progress}%` }}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer-fast" />
            </div>
          </div>

          <div className="flex justify-between mt-4 text-sm">
            <span className="text-white/60">{Math.round(progress)}%</span>
            <div className="flex space-x-1">
              {stages.map((_, i) => (
                <div
                  key={i}
                  className={`w-2 h-2 rounded-full transition-all duration-300 ${
                    i === stage
                      ? 'bg-brand-400 w-6'
                      : i < stage
                      ? 'bg-brand-500/50'
                      : 'bg-white/20'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes pulse-slow {
          0%, 100% { opacity: 0.1; transform: scale(1); }
          50% { opacity: 0.2; transform: scale(1.1); }
        }
        @keyframes float-particle {
          0%, 100% { transform: translateY(0) translateX(0); opacity: 0.3; }
          25% { opacity: 0.1; }
          50% { transform: translateY(-50px) translateX(30px); opacity: 0.5; }
          75% { opacity: 0.2; }
        }
        @keyframes fade-in-up {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes bounce-smooth {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-15px); }
        }
        @keyframes scale-pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.05); }
        }
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        @keyframes shimmer-fast {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(200%); }
        }
        @keyframes glow {
          0%, 100% { text-shadow: 0 0 20px rgba(255,255,255,0.3); }
          50% { text-shadow: 0 0 40px rgba(255,255,255,0.5); }
        }
        .animate-pulse-slow { animation: pulse-slow 4s ease-in-out infinite; }
        .animate-float-particle { animation: float-particle 8s ease-in-out infinite; }
        .animate-fade-in-up { animation: fade-in-up 1s ease-out; }
        .animate-bounce-smooth { animation: bounce-smooth 2s ease-in-out infinite; }
        .animate-scale-pulse { animation: scale-pulse 2s ease-in-out infinite; }
        .animate-shimmer { animation: shimmer 2s ease-in-out infinite; }
        .animate-shimmer-fast { animation: shimmer-fast 1s ease-in-out infinite; }
        .animate-glow { animation: glow 3s ease-in-out infinite; }
        .animation-delay-1000 { animation-delay: 1s; }
        .animation-delay-2000 { animation-delay: 2s; }
      `}</style>
    </div>
  );
}
