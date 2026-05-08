import React, { useEffect } from 'react';

interface SeoHeadProps {
  title?: string;
  description?: string;
  canonical?: string;
  ogImage?: string;
  ogType?: string;
}

export const SeoHead: React.FC<SeoHeadProps> = ({
  title = 'Weedy - Najlepsza wyszukiwarka punktów konopnych i CBD w Polsce',
  description = 'Znajdź najbliższe punkty CBD, sklepy konopne i dispensaries w Twojej okolicy. Najdokładniejsza mapa i lista punktów konopnych w Polsce.',
  canonical = window.location.origin,
  ogImage = '/og-image.png',
  ogType = 'website',
}) => {
  useEffect(() => {
    document.title = title;

    // Helper to update or create meta tags
    const updateMetaTag = (name: string, content: string, attr: string = 'name') => {
      let element = document.querySelector(`meta[${attr}="${name}"]`);
      if (!element) {
        element = document.createElement('meta');
        element.setAttribute(attr, name);
        document.head.appendChild(element);
      }
      element.setAttribute('content', content);
    };

    updateMetaTag('description', description);
    updateMetaTag('og:title', title, 'property');
    updateMetaTag('og:description', description, 'property');
    updateMetaTag('og:image', ogImage, 'property');
    updateMetaTag('og:type', ogType, 'property');
    updateMetaTag('og:url', window.location.href, 'property');
    updateMetaTag('twitter:card', 'summary_large_image');
    updateMetaTag('twitter:title', title);
    updateMetaTag('twitter:description', description);
    updateMetaTag('twitter:image', ogImage);

    // Update canonical link
    let link: HTMLLinkElement | null = document.querySelector('link[rel="canonical"]');
    if (!link) {
      link = document.createElement('link');
      link.setAttribute('rel', 'canonical');
      document.head.appendChild(link);
    }
    link.setAttribute('href', canonical);
  }, [title, description, canonical, ogImage, ogType]);

  return null;
};
