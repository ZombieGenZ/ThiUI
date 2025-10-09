import { useEffect, useState } from 'react';
import { Sofa, Armchair, Lamp } from 'lucide-react';

interface LoadingScreenProps {
  onLoadComplete: () => void;
}

export function LoadingScreen({ onLoadComplete }: LoadingScreenProps) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const progressInterval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(progressInterval);
          setTimeout(() => onLoadComplete(), 300);
          return 100;
        }
        return prev + 2;
      });
    }, 25);

    return () => clearInterval(progressInterval);
  }, [onLoadComplete]);

  return (
    <div className="fixed inset-0 z-50 bg-gradient-to-br from-neutral-50 via-white to-neutral-100 flex items-center justify-center overflow-hidden">
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-20 left-20 animate-float-slow">
          <Sofa className="w-32 h-32 text-brand-600" />
        </div>
        <div className="absolute top-40 right-32 animate-float-medium">
          <Armchair className="w-24 h-24 text-brand-500" />
        </div>
        <div className="absolute bottom-32 left-40 animate-float-fast">
          <Lamp className="w-28 h-28 text-brand-400" />
        </div>
        <div className="absolute bottom-40 right-40 animate-float-slow">
          <Sofa className="w-36 h-36 text-brand-300" />
        </div>
      </div>

      <div className="relative z-10 text-center px-4 max-w-2xl">
        <div className="mb-12 animate-fade-in-up">
          <div className="flex items-center justify-center space-x-4 mb-6">
            <div className="w-16 h-16 bg-gradient-to-br from-brand-500 to-brand-700 rounded-2xl flex items-center justify-center transform rotate-12 animate-bounce-subtle">
              <Sofa className="w-10 h-10 text-white" />
            </div>
            <h1 className="font-display text-5xl md:text-6xl text-neutral-900 tracking-tight font-bold">
              FurniCraft
            </h1>
          </div>
          <p className="text-lg text-neutral-600 font-light tracking-wide">
            Crafting Beautiful Spaces
          </p>
        </div>

        <div className="mb-8">
          <div className="flex items-center justify-center space-x-3 mb-4">
            <div className={`w-3 h-3 rounded-full bg-brand-600 transition-all duration-300 ${progress > 20 ? 'animate-pulse' : 'opacity-30'}`} />
            <div className={`w-3 h-3 rounded-full bg-brand-600 transition-all duration-300 ${progress > 40 ? 'animate-pulse' : 'opacity-30'}`} />
            <div className={`w-3 h-3 rounded-full bg-brand-600 transition-all duration-300 ${progress > 60 ? 'animate-pulse' : 'opacity-30'}`} />
            <div className={`w-3 h-3 rounded-full bg-brand-600 transition-all duration-300 ${progress > 80 ? 'animate-pulse' : 'opacity-30'}`} />
          </div>
        </div>

        <div className="w-80 md:w-96 mx-auto">
          <div className="h-2 bg-neutral-200 rounded-full overflow-hidden shadow-inner">
            <div
              className="h-full bg-gradient-to-r from-brand-500 via-brand-600 to-brand-700 transition-all duration-300 ease-out rounded-full"
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="flex justify-between mt-3 text-sm text-neutral-500">
            <span>Setting up your experience</span>
            <span className="font-semibold text-brand-600">{progress}%</span>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes float-slow {
          0%, 100% {
            transform: translateY(0px) rotate(0deg);
          }
          50% {
            transform: translateY(-20px) rotate(5deg);
          }
        }
        @keyframes float-medium {
          0%, 100% {
            transform: translateY(0px) rotate(0deg);
          }
          50% {
            transform: translateY(-15px) rotate(-5deg);
          }
        }
        @keyframes float-fast {
          0%, 100% {
            transform: translateY(0px) rotate(0deg);
          }
          50% {
            transform: translateY(-25px) rotate(3deg);
          }
        }
        @keyframes fade-in-up {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes bounce-subtle {
          0%, 100% {
            transform: rotate(12deg) translateY(0);
          }
          50% {
            transform: rotate(12deg) translateY(-10px);
          }
        }
        .animate-float-slow {
          animation: float-slow 6s ease-in-out infinite;
        }
        .animate-float-medium {
          animation: float-medium 4s ease-in-out infinite;
        }
        .animate-float-fast {
          animation: float-fast 5s ease-in-out infinite;
        }
        .animate-fade-in-up {
          animation: fade-in-up 0.8s ease-out;
        }
        .animate-bounce-subtle {
          animation: bounce-subtle 2s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}
