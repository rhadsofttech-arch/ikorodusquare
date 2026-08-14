import { CATEGORIES, INITIAL_VENDORS, INITIAL_PRODUCTS } from '../data/mockData';
import { Vendor, Product, Category } from '../types';

export const SITE_URL = 'https://www.ikorodusquare.com.ng';
export const SITE_NAME = 'IkoroduSquare';
export const DEFAULT_OG_IMAGE = 'https://www.ikorodusquare.com.ng/og-image.jpg';

export interface PageMetadata {
  title: string;
  description: string;
  keywords: string;
  canonicalUrl: string;
  ogImage: string;
  ogType: 'website' | 'article' | 'product' | 'profile' | 'business.business';
  jsonLd: any[];
  semanticHtml: string;
}

export function generateRobotsTxt(): string {
  return `# IkoroduSquare Robots.txt
User-agent: *
Allow: /
Allow: /store/
Allow: /product/
Allow: /directory
Allow: /marketplace
Allow: /categories
Allow: /promotions-pricing
Allow: /register-vendor

# Disallow private user accounts and admin portals
Disallow: /admin
Disallow: /admin-portal
Disallow: /vendor-portal
Disallow: /customer-portal
Disallow: /api/

Sitemap: ${SITE_URL}/sitemap.xml
`;
}

export function generateSitemapXml(vendors: Vendor[] = INITIAL_VENDORS, products: Product[] = INITIAL_PRODUCTS): string {
  const approvedVendors = vendors.filter((v) => v.status === 'approved');
  const approvedProducts = products.filter((p) => p.status === 'approved');
  const now = new Date().toISOString().split('T')[0];

  const staticUrls = [
    { loc: `${SITE_URL}/`, priority: '1.0', changefreq: 'daily' },
    { loc: `${SITE_URL}/directory`, priority: '0.9', changefreq: 'daily' },
    { loc: `${SITE_URL}/marketplace`, priority: '0.9', changefreq: 'daily' },
    { loc: `${SITE_URL}/categories`, priority: '0.8', changefreq: 'weekly' },
    { loc: `${SITE_URL}/promotions-pricing`, priority: '0.7', changefreq: 'weekly' },
    { loc: `${SITE_URL}/register-vendor`, priority: '0.7', changefreq: 'monthly' },
  ];

  const categoryUrls = CATEGORIES.map((cat) => ({
    loc: `${SITE_URL}/directory?category=${encodeURIComponent(cat.name)}`,
    priority: '0.8',
    changefreq: 'weekly',
  }));

  const vendorUrls = approvedVendors.map((v) => ({
    loc: `${SITE_URL}/store/${encodeURIComponent(v.slug || v.id)}`,
    priority: '0.8',
    changefreq: 'weekly',
  }));

  const productUrls = approvedProducts.map((p) => ({
    loc: `${SITE_URL}/product/${encodeURIComponent(p.id)}`,
    priority: '0.7',
    changefreq: 'weekly',
  }));

  const allUrls = [...staticUrls, ...categoryUrls, ...vendorUrls, ...productUrls];

  const xmlEntries = allUrls
    .map(
      (u) => `  <url>
    <loc>${u.loc}</loc>
    <lastmod>${now}</lastmod>
    <changefreq>${u.changefreq}</changefreq>
    <priority>${u.priority}</priority>
  </url>`
    )
    .join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${xmlEntries}
</urlset>
`;
}

export function getPageMetadata(
  urlPath: string,
  vendors: Vendor[] = INITIAL_VENDORS,
  products: Product[] = INITIAL_PRODUCTS
): PageMetadata {
  const cleanPath = urlPath.split('?')[0].split('#')[0];
  const approvedVendors = vendors.filter((v) => v.status === 'approved');
  const approvedProducts = products.filter((p) => p.status === 'approved');

  // 1. Vendor Storefront: /store/:slug
  if (cleanPath.startsWith('/store/')) {
    const slug = decodeURIComponent(cleanPath.replace('/store/', '')).trim().toLowerCase();
    const vendor = approvedVendors.find(
      (v) => (v.slug && v.slug.toLowerCase() === slug) || v.id.toLowerCase() === slug
    );

    if (vendor) {
      const canonicalUrl = `${SITE_URL}/store/${vendor.slug || vendor.id}`;
      const ogImage = vendor.coverImageUrl || vendor.logoUrl || DEFAULT_OG_IMAGE;
      const vendorProducts = approvedProducts.filter((p) => p.vendorId === vendor.id);

      const title = `${vendor.businessName} | ${vendor.category} in ${vendor.area}, Ikorodu | IkoroduSquare`;
      const description =
        vendor.description ||
        `${vendor.businessName} is a verified ${vendor.category} (${vendor.subcategory}) business in ${vendor.area}, Ikorodu, Lagos State. View contact details, location, and products on IkoroduSquare.`;
      const keywords = `${vendor.businessName}, ${vendor.category} Ikorodu, ${vendor.subcategory}, ${vendor.area} shops, buy from ${vendor.businessName}, vendors in ${vendor.area}`;

      const localBusinessJsonLd = {
        '@context': 'https://schema.org',
        '@type': 'LocalBusiness',
        name: vendor.businessName,
        image: ogImage,
        description: vendor.description,
        telephone: vendor.phone,
        url: canonicalUrl,
        address: {
          '@type': 'PostalAddress',
          streetAddress: vendor.address,
          addressLocality: vendor.area,
          addressRegion: 'Lagos State',
          addressCountry: 'NG',
        },
        geo: {
          '@type': 'GeoCoordinates',
          latitude: 6.6194,
          longitude: 3.5105,
        },
        priceRange: '₦₦',
        openingHoursSpecification: [
          {
            '@type': 'OpeningHoursSpecification',
            dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
            opens: '08:00',
            closes: '18:30',
          },
        ],
      };

      const breadcrumbsJsonLd = {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: [
          {
            '@type': 'ListItem',
            position: 1,
            name: 'Home',
            item: `${SITE_URL}/`,
          },
          {
            '@type': 'ListItem',
            position: 2,
            name: 'Business Directory',
            item: `${SITE_URL}/directory`,
          },
          {
            '@type': 'ListItem',
            position: 3,
            name: vendor.businessName,
            item: canonicalUrl,
          },
        ],
      };

      const productsListHtml = vendorProducts
        .map(
          (p) => `<li>
            <a href="/product/${p.id}"><strong>${escapeHtml(p.name)}</strong> - ₦${p.price.toLocaleString()}</a>
            <p>${escapeHtml(p.description)}</p>
          </li>`
        )
        .join('');

      const semanticHtml = `
        <article class="vendor-storefront-seo">
          <nav aria-label="Breadcrumb">
            <a href="/">Home</a> &gt; <a href="/directory">Business Directory</a> &gt; <span>${escapeHtml(vendor.businessName)}</span>
          </nav>
          <header>
            <h1>${escapeHtml(vendor.businessName)}</h1>
            <p class="category-badge"><strong>Category:</strong> ${escapeHtml(vendor.category)} (${escapeHtml(vendor.subcategory || 'Local Business')})</p>
            <p class="location-badge"><strong>Location:</strong> ${escapeHtml(vendor.address || vendor.area)}, ${escapeHtml(vendor.area)}, Ikorodu, Lagos State</p>
            <p class="phone-badge"><strong>Contact:</strong> ${escapeHtml(vendor.phone)}</p>
          </header>
          <section>
            <h2>About ${escapeHtml(vendor.businessName)}</h2>
            <p>${escapeHtml(vendor.description)}</p>
          </section>
          ${
            vendorProducts.length > 0
              ? `<section>
                  <h2>Products & Catalog Available at ${escapeHtml(vendor.businessName)}</h2>
                  <ul>${productsListHtml}</ul>
                </section>`
              : ''
          }
          <section>
            <h2>Customer Reviews & Rating</h2>
            <p>Rated <strong>${vendor.rating || 5.0}/5.0</strong> based on ${vendor.reviewCount || 1} verified customer reviews on IkoroduSquare.</p>
          </section>
        </article>
      `;

      return {
        title,
        description,
        keywords,
        canonicalUrl,
        ogImage,
        ogType: 'business.business',
        jsonLd: [localBusinessJsonLd, breadcrumbsJsonLd],
        semanticHtml,
      };
    }
  }

  // 2. Product Page: /product/:id
  if (cleanPath.startsWith('/product/')) {
    const productId = decodeURIComponent(cleanPath.replace('/product/', '')).trim();
    const product = approvedProducts.find((p) => p.id === productId || p.slug === productId);
    if (product) {
      const vendor = approvedVendors.find((v) => v.id === product.vendorId);
      const canonicalUrl = `${SITE_URL}/product/${product.id}`;
      const ogImage = product.images?.[0] || vendor?.coverImageUrl || DEFAULT_OG_IMAGE;

      const title = `${product.name} (₦${product.price.toLocaleString()}) | ${product.vendorName} Ikorodu | IkoroduSquare`;
      const description = `${product.name} available for ₦${product.price.toLocaleString()} from ${product.vendorName} in ${product.vendorArea}, Ikorodu. ${product.description || ''}`;
      const keywords = `${product.name}, ${product.category}, buy ${product.name} Ikorodu, ${product.vendorName}, ${product.vendorArea} shopping`;

      const productJsonLd = {
        '@context': 'https://schema.org',
        '@type': 'Product',
        name: product.name,
        image: product.images,
        description: product.description,
        offers: {
          '@type': 'Offer',
          price: product.price,
          priceCurrency: 'NGN',
          availability: product.availability === 'In Stock' || (product.stock ?? 1) > 0 ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
          seller: {
            '@type': 'Organization',
            name: product.vendorName,
          },
        },
      };

      const breadcrumbsJsonLd = {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: [
          {
            '@type': 'ListItem',
            position: 1,
            name: 'Home',
            item: `${SITE_URL}/`,
          },
          {
            '@type': 'ListItem',
            position: 2,
            name: 'Marketplace',
            item: `${SITE_URL}/marketplace`,
          },
          {
            '@type': 'ListItem',
            position: 3,
            name: product.name,
            item: canonicalUrl,
          },
        ],
      };

      const semanticHtml = `
        <article class="product-page-seo">
          <nav aria-label="Breadcrumb">
            <a href="/">Home</a> &gt; <a href="/marketplace">Product Marketplace</a> &gt; <span>${escapeHtml(product.name)}</span>
          </nav>
          <header>
            <h1>${escapeHtml(product.name)}</h1>
            <p class="price-tag"><strong>Price:</strong> ₦${product.price.toLocaleString()}</p>
            <p class="vendor-tag"><strong>Vendor:</strong> <a href="/store/${vendor ? vendor.slug : product.vendorId}">${escapeHtml(product.vendorName)}</a> (${escapeHtml(product.vendorArea)}, Ikorodu)</p>
            <p class="category-tag"><strong>Category:</strong> ${escapeHtml(product.category)}</p>
          </header>
          <section>
            <h2>Product Details</h2>
            <p>${escapeHtml(product.description)}</p>
          </section>
        </article>
      `;

      return {
        title,
        description,
        keywords,
        canonicalUrl,
        ogImage,
        ogType: 'product',
        jsonLd: [productJsonLd, breadcrumbsJsonLd],
        semanticHtml,
      };
    }
  }

  // 3. Directory Page: /directory
  if (cleanPath === '/directory') {
    const title = 'Verified Business Directory in Ikorodu | IkoroduSquare';
    const description =
      'Browse verified shops, artisan services, restaurants, hotels, fashion designers, and local businesses in Sabo, Agric, Ebute, and across Ikorodu.';
    const keywords = 'Ikorodu business directory, verified vendors Ikorodu, shops in Sabo, artisans in Ebute, services in Agric Ikorodu';
    const canonicalUrl = `${SITE_URL}/directory`;

    const topStores = approvedVendors
      .slice(0, 15)
      .map(
        (v) => `<li>
          <a href="/store/${v.slug}"><strong>${escapeHtml(v.businessName)}</strong></a> (${escapeHtml(v.category)} - ${escapeHtml(v.area)})
          <p>${escapeHtml(v.description)}</p>
        </li>`
      )
      .join('');

    const semanticHtml = `
      <section class="directory-seo">
        <h1>Ikorodu Business Directory</h1>
        <p>Discover verified local businesses, registered merchants, and artisan services across all districts of Ikorodu, Lagos State.</p>
        <h2>Featured Verified Businesses in Ikorodu</h2>
        <ul>${topStores}</ul>
      </section>
    `;

    return {
      title,
      description,
      keywords,
      canonicalUrl,
      ogImage: DEFAULT_OG_IMAGE,
      ogType: 'website',
      jsonLd: [
        {
          '@context': 'https://schema.org',
          '@type': 'CollectionPage',
          name: 'Ikorodu Business Directory',
          url: canonicalUrl,
          description,
        },
      ],
      semanticHtml,
    };
  }

  // 4. Marketplace Page: /marketplace
  if (cleanPath === '/marketplace') {
    const title = 'Product Marketplace in Ikorodu | Buy Direct on WhatsApp | IkoroduSquare';
    const description =
      'Shop electronics, clothing, bakeries, groceries, hotel rooms, home furniture, and building materials from verified Ikorodu merchants with zero buyer fee.';
    const keywords = 'Ikorodu marketplace, buy products Ikorodu, Sabo market deals, electronics Sabo, bread Agric, furniture Ebute';
    const canonicalUrl = `${SITE_URL}/marketplace`;

    const topProducts = approvedProducts
      .slice(0, 15)
      .map(
        (p) => `<li>
          <a href="/product/${p.id}"><strong>${escapeHtml(p.name)}</strong> - ₦${p.price.toLocaleString()}</a> (by ${escapeHtml(p.vendorName)})
        </li>`
      )
      .join('');

    const semanticHtml = `
      <section class="marketplace-seo">
        <h1>Ikorodu Local Product Marketplace</h1>
        <p>Discover authentic products, fresh food, and deals from verified stores across Ikorodu.</p>
        <h2>Trending Marketplace Items</h2>
        <ul>${topProducts}</ul>
      </section>
    `;

    return {
      title,
      description,
      keywords,
      canonicalUrl,
      ogImage: DEFAULT_OG_IMAGE,
      ogType: 'website',
      jsonLd: [
        {
          '@context': 'https://schema.org',
          '@type': 'CollectionPage',
          name: 'Ikorodu Product Marketplace',
          url: canonicalUrl,
          description,
        },
      ],
      semanticHtml,
    };
  }

  // 5. Default Homepage: /
  const title = 'IkoroduSquare | Local Business Directory & Marketplace in Ikorodu';
  const description =
    'Discover verified local businesses, products, hotels, and services across Ikorodu. Shop local, find businesses, and connect directly with vendors on IkoroduSquare.';
  const keywords =
    'Ikorodu businesses, Ikorodu marketplace, Sabo Ikorodu, Ebute Ikorodu, Agric Ikorodu, local vendors Lagos, buy local Ikorodu, Ikorodu business directory, Accommodation Ikorodu';
  const canonicalUrl = `${SITE_URL}/`;

  const orgJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: SITE_NAME,
    url: SITE_URL,
    logo: DEFAULT_OG_IMAGE,
    description: 'Premier Hyperlocal Digital Business Directory and Marketplace for Ikorodu, Lagos State, Nigeria.',
    address: {
      '@type': 'PostalAddress',
      addressLocality: 'Ikorodu',
      addressRegion: 'Lagos State',
      addressCountry: 'NG',
    },
  };

  const websiteJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: SITE_NAME,
    url: SITE_URL,
    potentialAction: {
      '@type': 'SearchAction',
      target: `${SITE_URL}/marketplace?q={search_term_string}`,
      'query-input': 'required name=search_term_string',
    },
  };

  const categoryLinksHtml = CATEGORIES.map(
    (c) => `<li><a href="/directory?category=${encodeURIComponent(c.name)}">${escapeHtml(c.name)}</a>: ${escapeHtml(c.description)}</li>`
  ).join('');

  const featuredStoresHtml = approvedVendors
    .slice(0, 10)
    .map(
      (v) => `<li><a href="/store/${v.slug}"><strong>${escapeHtml(v.businessName)}</strong></a> (${escapeHtml(v.category)} - ${escapeHtml(v.area)})</li>`
    )
    .join('');

  const semanticHtml = `
    <section class="homepage-seo-root">
      <h1>Ikorodu’s Hyperlocal Directory & Marketplace</h1>
      <p>Find local businesses, shop authentic products, and connect directly on WhatsApp with verified vendors across all districts of Ikorodu.</p>
      
      <h2>Explore Business Categories in Ikorodu</h2>
      <ul>${categoryLinksHtml}</ul>

      <h2>Verified Local Businesses in Ikorodu</h2>
      <ul>${featuredStoresHtml}</ul>

      <nav aria-label="Main Navigation">
        <a href="/directory">Business Directory</a> | 
        <a href="/marketplace">Product Marketplace</a> | 
        <a href="/categories">All Categories</a> | 
        <a href="/promotions-pricing">Vendor Advertising Rates</a> | 
        <a href="/register-vendor">Register Your Business</a>
      </nav>
    </section>
  `;

  return {
    title,
    description,
    keywords,
    canonicalUrl,
    ogImage: DEFAULT_OG_IMAGE,
    ogType: 'website',
    jsonLd: [orgJsonLd, websiteJsonLd],
    semanticHtml,
  };
}

export function injectSeoIntoHtml(
  htmlTemplate: string,
  urlPath: string,
  vendors: Vendor[] = INITIAL_VENDORS,
  products: Product[] = INITIAL_PRODUCTS
): string {
  const meta = getPageMetadata(urlPath, vendors, products);

  let updated = htmlTemplate;

  // Replace Title
  if (updated.includes('<title>')) {
    updated = updated.replace(/<title>[\s\S]*?<\/title>/i, `<title>${escapeHtml(meta.title)}</title>`);
  } else {
    updated = updated.replace('</head>', `  <title>${escapeHtml(meta.title)}</title>\n</head>`);
  }

  // Replace or inject meta description
  if (updated.includes('name="description"')) {
    updated = updated.replace(/<meta\s+name="description"\s+content="[^"]*"\s*\/?>/i, `<meta name="description" content="${escapeAttr(meta.description)}" />`);
  } else {
    updated = updated.replace('</head>', `  <meta name="description" content="${escapeAttr(meta.description)}" />\n</head>`);
  }

  // Replace or inject meta keywords
  if (updated.includes('name="keywords"')) {
    updated = updated.replace(/<meta\s+name="keywords"\s+content="[^"]*"\s*\/?>/i, `<meta name="keywords" content="${escapeAttr(meta.keywords)}" />`);
  } else {
    updated = updated.replace('</head>', `  <meta name="keywords" content="${escapeAttr(meta.keywords)}" />\n</head>`);
  }

  // Replace or inject canonical link
  if (updated.includes('rel="canonical"')) {
    updated = updated.replace(/<link\s+rel="canonical"\s+href="[^"]*"\s*\/?>/i, `<link rel="canonical" href="${escapeAttr(meta.canonicalUrl)}" />`);
  } else {
    updated = updated.replace('</head>', `  <link rel="canonical" href="${escapeAttr(meta.canonicalUrl)}" />\n</head>`);
  }

  // Replace Open Graph Tags
  updated = updated.replace(/<meta\s+property="og:title"\s+content="[^"]*"\s*\/?>/i, `<meta property="og:title" content="${escapeAttr(meta.title)}" />`);
  updated = updated.replace(/<meta\s+property="og:description"\s+content="[^"]*"\s*\/?>/i, `<meta property="og:description" content="${escapeAttr(meta.description)}" />`);
  updated = updated.replace(/<meta\s+property="og:url"\s+content="[^"]*"\s*\/?>/i, `<meta property="og:url" content="${escapeAttr(meta.canonicalUrl)}" />`);
  updated = updated.replace(/<meta\s+property="og:image"\s+content="[^"]*"\s*\/?>/i, `<meta property="og:image" content="${escapeAttr(meta.ogImage)}" />`);
  updated = updated.replace(/<meta\s+property="og:type"\s+content="[^"]*"\s*\/?>/i, `<meta property="og:type" content="${escapeAttr(meta.ogType)}" />`);

  // Replace Twitter Tags
  updated = updated.replace(/<meta\s+name="twitter:title"\s+content="[^"]*"\s*\/?>/i, `<meta name="twitter:title" content="${escapeAttr(meta.title)}" />`);
  updated = updated.replace(/<meta\s+name="twitter:description"\s+content="[^"]*"\s*\/?>/i, `<meta name="twitter:description" content="${escapeAttr(meta.description)}" />`);
  updated = updated.replace(/<meta\s+name="twitter:url"\s+content="[^"]*"\s*\/?>/i, `<meta name="twitter:url" content="${escapeAttr(meta.canonicalUrl)}" />`);
  updated = updated.replace(/<meta\s+name="twitter:image"\s+content="[^"]*"\s*\/?>/i, `<meta name="twitter:image" content="${escapeAttr(meta.ogImage)}" />`);

  // Inject JSON-LD Script tag into <head>
  const jsonLdScript = `\n    <script id="json-ld-schema" type="application/ld+json">\n${JSON.stringify(meta.jsonLd, null, 2)}\n    </script>`;
  if (updated.includes('id="json-ld-schema"')) {
    updated = updated.replace(/<script\s+id="json-ld-schema"\s+type="application\/ld\+json">[\s\S]*?<\/script>/i, jsonLdScript.trim());
  } else {
    updated = updated.replace('</head>', `${jsonLdScript}\n</head>`);
  }

  // Pre-render semantic HTML inside <div id="root">
  if (meta.semanticHtml && updated.includes('<div id="root"></div>')) {
    updated = updated.replace('<div id="root"></div>', `<div id="root">${meta.semanticHtml}</div>`);
  }

  return updated;
}

function escapeHtml(str: string = ''): string {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function escapeAttr(str: string = ''): string {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
