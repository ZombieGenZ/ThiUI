import { useEffect } from 'react';
import type { DetailedHTMLProps, HTMLAttributes } from 'react';

declare global {
  namespace JSX {
    interface IntrinsicElements {
      'model-viewer': DetailedHTMLProps<HTMLAttributes<HTMLElement>, HTMLElement> & {
        src?: string;
        alt?: string;
        poster?: string;
        ar?: boolean | '';
        'ar-modes'?: string;
        'camera-controls'?: boolean | '';
        'auto-rotate'?: boolean | '';
        'camera-orbit'?: string;
        'field-of-view'?: string;
        exposure?: string | number;
        'shadow-intensity'?: string | number;
        'shadow-softness'?: string | number;
        'interaction-prompt'?: string;
        loading?: 'auto' | 'lazy' | 'eager';
      };
    }
  }
}

interface ProductModelViewerProps {
  src: string;
  alt: string;
  poster?: string;
}

export function ProductModelViewer({ src, alt, poster }: ProductModelViewerProps) {
  useEffect(() => {
    const existingModuleScript = document.getElementById('model-viewer-module');
    const existingNoModuleScript = document.getElementById('model-viewer-nomodule');

    if (!existingModuleScript) {
      const script = document.createElement('script');
      script.id = 'model-viewer-module';
      script.type = 'module';
      script.src = 'https://cdn.jsdelivr.net/npm/@google/model-viewer/dist/model-viewer.min.js';
      script.crossOrigin = 'anonymous';
      document.head.appendChild(script);
    }

    if (!existingNoModuleScript) {
      const script = document.createElement('script');
      script.id = 'model-viewer-nomodule';
      script.noModule = true;
      script.src = 'https://cdn.jsdelivr.net/npm/@google/model-viewer/dist/model-viewer-legacy.js';
      script.crossOrigin = 'anonymous';
      document.head.appendChild(script);
    }
  }, []);

  return (
    <div className="w-full bg-neutral-100 rounded-xl overflow-hidden shadow-lg border border-neutral-200">
      <model-viewer
        src={src}
        poster={poster}
        alt={alt}
        ar
        ar-modes="webxr scene-viewer quick-look"
        camera-controls
        auto-rotate
        exposure="1"
        shadow-intensity="1"
        shadow-softness="0.5"
        interaction-prompt="none"
        loading="lazy"
        style={{ width: '100%', height: '480px', backgroundColor: '#f3f4f6' }}
      />
    </div>
  );
}
