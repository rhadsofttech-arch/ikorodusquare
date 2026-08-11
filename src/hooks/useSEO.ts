import { useEffect } from 'react';

export interface SEOProps {
  title?: string;
  description?: string;
  keywords?: string;
  ogImage?: string;
  ogType?: 'website' | 'article' | 'product' | 'profile' | 'business.business';
  canonicalUrl?: string;
  robots?: string;
  jsonLd?: Record<string, any> | Array<Record<string, any>>;
}

export function useSEO({
  title,
  description,
  keywords,
  ogImage,
  ogType = 'website',
  canonicalUrl,
  robots = 'index, follow',
  jsonLd,
}: SEOProps) {
  useEffect(() => {
    const siteName = 'IkoroduSquare';
    const defaultTagline = 'Local Business Directory & Marketplace in Ikorodu';
    const defaultOgImage = 'https://www.ikorodusquare.com.ng/og-image.jpg';

    // Formulate title cleanly without double siteName
    let fullTitle = title || `${siteName} | ${defaultTagline}`;
    if (title && !title.toLowerCase().includes('ikorodusquare')) {
      fullTitle = `${title} | ${siteName}`;
    }

    document.title = fullTitle;

    // Helper to safely create or set meta elements
    const setMetaTag = (selector: string, attrName: string, attrVal: string, content: string) => {
      let element = document.querySelector(selector) as HTMLMetaElement | null;
      if (!element) {
        element = document.createElement('meta');
        element.setAttribute(attrName, attrVal);
        document.head.appendChild(element);
      }
      element.setAttribute('content', content);
    };

    // Helper for canonical link tag
    const setCanonicalLink = (url?: string) => {
      let link = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
      if (!link) {
        link = document.createElement('link');
        link.setAttribute('rel', 'canonical');
        document.head.appendChild(link);
      }
      const targetUrl = url || (typeof window !== 'undefined' ? window.location.href : 'https://www.ikorodusquare.com.ng/');
      link.setAttribute('href', targetUrl);
    };

    // Description Meta
    const metaDescription =
      description ||
      'Discover verified local businesses, products and services across Ikorodu. Shop local, find businesses and connect directly with vendors on IkoroduSquare.';
    setMetaTag('meta[name="description"]', 'name', 'description', metaDescription);

    // Keywords Meta
    const metaKeywords =
      keywords ||
      'Ikorodu businesses, Ikorodu marketplace, Sabo Ikorodu, Ebute Ikorodu, Agric Ikorodu, local vendors Lagos, buy local Ikorodu, Ikorodu business directory';
    setMetaTag('meta[name="keywords"]', 'name', 'keywords', metaKeywords);

    // Robots Meta
    setMetaTag('meta[name="robots"]', 'name', 'robots', robots);

    // Image URL resolution
    const finalOgImage = ogImage || defaultOgImage;

    // Open Graph Meta Tags for Social Sharing & Search Crawlers
    const currentUrl = canonicalUrl || (typeof window !== 'undefined' ? window.location.href : 'https://www.ikorodusquare.com.ng/');
    setMetaTag('meta[property="og:site_name"]', 'property', 'og:site_name', siteName);
    setMetaTag('meta[property="og:title"]', 'property', 'og:title', fullTitle);
    setMetaTag('meta[property="og:description"]', 'property', 'og:description', metaDescription);
    setMetaTag('meta[property="og:type"]', 'property', 'og:type', ogType);
    setMetaTag('meta[property="og:url"]', 'property', 'og:url', currentUrl);
    setMetaTag('meta[property="og:image"]', 'property', 'og:image', finalOgImage);

    // Twitter Meta Tags
    setMetaTag('meta[name="twitter:card"]', 'name', 'twitter:card', 'summary_large_image');
    setMetaTag('meta[name="twitter:title"]', 'name', 'twitter:title', fullTitle);
    setMetaTag('meta[name="twitter:description"]', 'name', 'twitter:description', metaDescription);
    setMetaTag('meta[name="twitter:image"]', 'name', 'twitter:image', finalOgImage);

    // Canonical URL
    setCanonicalLink(canonicalUrl);

    // Dynamic JSON-LD Script Tag Injection
    let scriptElement = document.querySelector('script[id="json-ld-schema"]') as HTMLScriptElement | null;
    if (jsonLd) {
      if (!scriptElement) {
        scriptElement = document.createElement('script');
        scriptElement.setAttribute('type', 'application/ld+json');
        scriptElement.setAttribute('id', 'json-ld-schema');
        document.head.appendChild(scriptElement);
      }
      scriptElement.textContent = JSON.stringify(jsonLd);
    } else if (scriptElement) {
      scriptElement.remove();
    }
  }, [title, description, keywords, ogImage, ogType, canonicalUrl, robots, jsonLd]);
}
