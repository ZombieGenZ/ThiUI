import { useEffect, useState } from 'react';
import { Eye, Star, ShoppingCart, Sofa, Armchair } from 'lucide-react';

type CursorType = 'default' | 'chair' | 'sofa' | 'explore' | 'zoom' | 'star' | 'cart';

export function CustomCursor() {
  const [position, setPosition] = useState({ x: -100, y: -100 });
  const [cursorType, setCursorType] = useState<CursorType>('default');
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const updateCursor = (e: MouseEvent) => {
      setPosition({ x: e.clientX, y: e.clientY });
      setIsVisible(true);

      const target = e.target as HTMLElement;

      if (target.closest('[data-cursor="chair"]')) {
        setCursorType('chair');
      } else if (target.closest('[data-cursor="sofa"]')) {
        setCursorType('sofa');
      } else if (target.closest('[data-cursor="zoom"]')) {
        setCursorType('zoom');
      } else if (target.closest('[data-cursor="star"]')) {
        setCursorType('star');
      } else if (target.closest('[data-cursor="explore"]') || target.closest('button, a')) {
        setCursorType('explore');
      } else if (target.closest('[data-cursor="cart"]')) {
        setCursorType('cart');
      } else {
        setCursorType('default');
      }
    };

    const hideCursor = () => setIsVisible(false);

    document.addEventListener('mousemove', updateCursor);
    document.addEventListener('mouseleave', hideCursor);

    return () => {
      document.removeEventListener('mousemove', updateCursor);
      document.removeEventListener('mouseleave', hideCursor);
    };
  }, []);

  if (!isVisible) return null;

  const renderCursor = () => {
    const iconClass = "w-6 h-6 text-white";

    switch (cursorType) {
      case 'chair':
        return <Armchair className={iconClass} />;
      case 'sofa':
        return <Sofa className={iconClass} />;
      case 'zoom':
        return (
          <div className="flex flex-col items-center">
            <Eye className={iconClass} />
            <span className="text-xs text-white mt-1">View 360°</span>
          </div>
        );
      case 'star':
        return <Star className={iconClass} fill="white" />;
      case 'explore':
        return <div className="w-3 h-3 bg-white rounded-full" />;
      case 'cart':
        return <ShoppingCart className={iconClass} />;
      default:
        return <div className="w-4 h-4 bg-white rounded-full" />;
    }
  };

  return (
    <div
      className="fixed pointer-events-none z-[9999] mix-blend-difference transition-transform duration-100"
      style={{
        left: position.x,
        top: position.y,
        transform: 'translate(-50%, -50%)',
      }}
    >
      <div className="animate-cursor-pulse">
        {renderCursor()}
      </div>

      <style>{`
        * {
          cursor: none !important;
        }
        @keyframes cursor-pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.1); }
        }
        .animate-cursor-pulse {
          animation: cursor-pulse 2s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}
