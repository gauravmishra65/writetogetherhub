import { useEffect } from 'react';

/**
 * Sets the document title and meta description for a page.
 * Use on every route component to give each page a unique, descriptive title.
 */
export function useDocumentTitle(title: string, description?: string) {
  useEffect(() => {
    document.title = title;

    if (description) {
      let meta = document.querySelector('meta[name="description"]');
      if (!meta) {
        meta = document.createElement('meta');
        meta.setAttribute('name', 'description');
        document.head.appendChild(meta);
      }
      meta.setAttribute('content', description);
    }
  }, [title, description]);
}
