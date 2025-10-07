import { useEffect, useState } from 'react';
import { ShoppingCart, Sofa, Armchair, Lamp, Eye } from 'lucide-react';

type CursorType = 'default' | 'explore' | 'cart';

export function CustomCursor() {
  const [position, setPosition] = useState({ x: -100, y: -100 });
  const [cursorType, setCursorType] = useState<CursorType>('default');
  const [isVisible, setIsVisible] = useState(false);
  const [isClicking, setIsClicking] = useState(false);

  useEffect(() => {
    const updateCursor = (e: MouseEvent) => {
      setPosition({ x: e.clientX, y: e.clientY });
      setIsVisible(true);

      const target = e.target as HTMLElement;

      if (target.closest('[data-cursor="cart"]')) {
        setCursorType('cart');
      } else if (target.closest('[data-cursor="explore"]') || target.closest('button, a, input, textarea, select')) {
        setCursorType('explore');
      } else {
        setCursorType('default');
      }
    };

    const handleMouseDown = () => setIsClicking(true);
    const handleMouseUp = () => setIsClicking(false);
    const hideCursor = () => setIsVisible(false);

    document.addEventListener('mousemove', updateCursor);
    document.addEventListener('mousedown', handleMouseDown);
    document.addEventListener('mouseup', handleMouseUp);
    document.addEventListener('mouseleave', hideCursor);

    return () => {
      document.removeEventListener('mousemove', updateCursor);
      document.removeEventListener('mousedown', handleMouseDown);
      document.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('mouseleave', hideCursor);
    };
  }, []);

  if (!isVisible) return null;

  const renderCursor = () => {
    const scale = isClicking ? 'scale-90' : 'scale-100';

    switch (cursorType) {
      case 'cart':
        return (
          <div className={`relative transition-transform duration-150 ${scale}`}>
            <div className="absolute -inset-2 bg-brand-600 rounded-full opacity-20 animate-ping" />
            <div className="relative w-12 h-12 bg-brand-600 rounded-full flex items-center justify-center shadow-lg">
              <ShoppingCart className="w-6 h-6 text-white" />
            </div>
          </div>
        );
      case 'explore':
        return (
          <div className={`relative transition-transform duration-150 ${scale}`}>
            <div className="absolute -inset-1 bg-neutral-900 rounded-full opacity-20 animate-pulse" />
            <div className="relative w-10 h-10 bg-neutral-900 rounded-full flex items-center justify-center shadow-lg">
              <Eye className="w-5 h-5 text-white" />
            </div>
          </div>
        );
      default:
        return (
          <div className={`relative transition-transform duration-150 ${scale}`}>
            <div className="w-2 h-2 bg-neutral-900 rounded-full" />
            <div className="absolute inset-0 w-8 h-8 -translate-x-3 -translate-y-3 border-2 border-neutral-900 rounded-full opacity-30" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
              <Sofa className="w-4 h-4 text-neutral-900 opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
          </div>
        );
    }
  };

  return (
    <>
      <div
        className="fixed pointer-events-none transition-all duration-150 ease-out"
        style={{
          left: position.x,
          top: position.y,
          transform: 'translate(-50%, -50%)',
          zIndex: 999999,
        }}
      >
        {renderCursor()}
      </div>

      <style>{`
        * {
          cursor: none !important;
        }
        body {
          cursor: none !important;
        }
        button, a, input, textarea, select {
          cursor: none !important;
        }
      `}</style>
    </>
  );
}
