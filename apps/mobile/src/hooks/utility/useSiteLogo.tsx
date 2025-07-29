import { useEffect, useState } from 'react';
import { Images } from '../../../assets/images';

// Helper: Parse <link rel="icon" ...> and <link rel="shortcut icon" ...>
function parseFavicon(html: string, siteOrigin: string): string | undefined {
  // Match: <link rel="icon" href="..."> or <link rel="shortcut icon" href="...">
  const iconRegex = /<link\s+[^>]*rel=["'](?:shortcut )?icon["'][^>]*href=["']([^"']+)["'][^>]*>/i;
  const match = iconRegex.exec(html);
  if (match && match[1]) {
    // Handle relative URLs
    try {
      return new URL(match[1], siteOrigin).toString();
    } catch {
      return undefined;
    }
  }
  return undefined;
}

export const useSiteLogo = (siteOrigin: string | undefined) => {
  const [logoURL, setLogoURL] = useState(Images.Misc.Globe);

  useEffect(() => {
    if (!siteOrigin) return;

    fetch(siteOrigin)
      .then((response) => response.text())
      .then((html) => {
        const faviconURL = parseFavicon(html, siteOrigin);
        if (faviconURL) {
          setLogoURL(faviconURL);
        }
      })
      .catch(() => {
        // fallback, don't update logoURL
      });
  }, [siteOrigin]);

  return logoURL;
};
