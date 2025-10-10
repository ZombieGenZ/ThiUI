import { useEffect } from 'react';

interface PageMetadataOptions {
  title: string;
  description: string;
}

export function usePageMetadata({ title, description }: PageMetadataOptions) {
  useEffect(() => {
    if (title) {
      document.title = `${title} | FurniCraft Furniture`;
    }

    if (description) {
      let metaTag = document.querySelector<HTMLMetaElement>('meta[name="description"]');

      if (!metaTag) {
        metaTag = document.createElement('meta');
        metaTag.name = 'description';
        document.head.appendChild(metaTag);
      }

      metaTag.content = description;
    }
  }, [title, description]);
}
