import { useEffect } from 'react';

export function useSEO(title: string, description: string, path?: string) {
  useEffect(() => {
    // Title
    document.title = title;

    // Meta description
    let meta = document.querySelector('meta[name="description"]');
    if (!meta) {
      meta = document.createElement('meta');
      meta.setAttribute('name', 'description');
      document.head.appendChild(meta);
    }
    meta.setAttribute('content', description);

    // Canonical link
    const canonicalHref = window.location.origin + (path || window.location.pathname);
    let link = document.querySelector('link[rel="canonical"]');
    if (!link) {
      link = document.createElement('link');
      link.setAttribute('rel', 'canonical');
      document.head.appendChild(link);
    }
    link.setAttribute('href', canonicalHref);
  }, [title, description, path]);
}
