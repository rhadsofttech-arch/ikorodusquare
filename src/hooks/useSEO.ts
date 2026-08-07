import { useEffect } from 'react';

export interface SEOProps {
  title?: string;
  description?: string;
  keywords?: string;
  ogImage?: string;
  ogType?: 'website' | 'article' | 'product' | 'profile';
  canonicalUrl?: string;
}

export function useSEO({
  title,
  description,
  keywords,
  ogImage,
  ogType = 'website',
  canonicalUrl,
}: SEOProps) {
  useEffect(() => {
    const siteName = 'IkoroduSquare';
    const defaultTagline = 'Verified Business Directory & Marketplace in Ikorodu, Lagos';

    // Formulate title
    const fullTitle = title
      ? `${title} | ${siteName}`
      : `${siteName} - ${defaultTagline}`;

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
      link.setAttribute('href', url || window.location.href);
    };

    // Description Meta
    const metaDescription =
      description ||
      'IkoroduSquare is the premier business directory and verified marketplace for local stores, artisans, and service providers across Sabo, Ebute, Agric, Ipakodo, and Ikorodu Central, Lagos State.';
    setMetaTag('meta[name="description"]', 'name', 'description', metaDescription);

    // Keywords Meta
    const metaKeywords =
      keywords ||
      'Ikorodu businesses, Ikorodu marketplace, Sabo Ikorodu, Ebute Ikorodu, Agric Ikorodu, local vendors Lagos, buy local Ikorodu, Ikorodu business directory';
    setMetaTag('meta[name="keywords"]', 'name', 'keywords', metaKeywords);

    // Open Graph Meta Tags for Social Sharing & Search Crawlers
    setMetaTag('meta[property="og:site_name"]', 'property', 'og:site_name', siteName);
    setMetaTag('meta[property="og:title"]', 'property', 'og:title', fullTitle);
    setMetaTag('meta[property="og:description"]', 'property', 'og:description', metaDescription);
    setMetaTag('meta[property="og:type"]', 'property', 'og:type', ogType);
    setMetaTag('meta[property="og:url"]', 'property', 'og:url', canonicalUrl || window.location.href);

    if (ogImage) {
      setMetaTag('meta[property="og:image"]', 'property', 'og:image', ogImage);
    }

    // Twitter Meta Tags
    setMetaTag('meta[name="twitter:card"]', 'name', 'twitter:card', ogImage ? 'summary_large_image' : 'summary');
    setMetaTag('meta[name="twitter:title"]', 'name', 'twitter:title', fullTitle);
    setMetaTag('meta[name="twitter:description"]', 'name', 'twitter:description', metaDescription);

    // Canonical URL
    setCanonicalLink(canonicalUrl);

  }, [title, description, keywords, ogImage, ogType, canonicalUrl]);
}
