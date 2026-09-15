(() => {
  const siteUrl = 'https://www.epirusestate.com';
  const requestedPage = new URLSearchParams(window.location.search).get('page');
  const propertyId = new URLSearchParams(window.location.search).get('id');
  const properties = Array.isArray(window.PROTOTYPE_PROPERTIES) ? window.PROTOTYPE_PROPERTIES : [];
  const englishProperties = window.PROTOTYPE_TRANSLATIONS?.en?.properties || [];
  const sourceProperty = properties.find((item) => String(item.id) === String(propertyId));
  const property = sourceProperty ? { ...sourceProperty, ...(englishProperties.find((item) => String(item.id) === String(propertyId)) || {}) } : null;
  const setMeta = (name, content, attribute = 'name') => {
    let element = document.head.querySelector(`meta[${attribute}="${name}"]`);
    if (!element) {
      element = document.createElement('meta');
      element.setAttribute(attribute, name);
      document.head.appendChild(element);
    }
    element.setAttribute('content', content);
  };
  const setCanonical = (url) => {
    let element = document.head.querySelector('link[rel="canonical"]');
    if (!element) {
      element = document.createElement('link');
      element.rel = 'canonical';
      document.head.appendChild(element);
    }
    element.href = url;
  };
  const addSchema = (schema) => {
    const element = document.createElement('script');
    element.type = 'application/ld+json';
    element.textContent = JSON.stringify(schema);
    document.head.appendChild(element);
  };

  addSchema({
    '@context': 'https://schema.org',
    '@type': 'RealEstateAgent',
    '@id': `${siteUrl}/#organization`,
    name: 'Epirus Estate',
    url: `${siteUrl}/`,
    email: 'tatosxristos@gmail.com',
    telephone: '+30 694 486 6469',
    address: { '@type': 'PostalAddress', addressLocality: 'Parga', addressRegion: 'Epirus', addressCountry: 'GR' },
    areaServed: ['Epirus', 'Parga', 'Preveza', 'Ammoudia', 'Kanallaki', 'Vrachos', 'Loutsa', 'Mytikas', 'Igoumenitsa']
  });
  addSchema({ '@context': 'https://schema.org', '@type': 'WebSite', '@id': `${siteUrl}/#website`, name: 'Epirus Estate', url: `${siteUrl}/`, publisher: { '@id': `${siteUrl}/#organization` } });

  if (requestedPage === 'property' && property) {
    const title = `${property.title} | Epirus Estate`;
    const description = `${property.title} in ${property.location}. ${property.description}`.replace(/\s+/g, ' ').slice(0, 155);
    const url = `${siteUrl}/?page=property&id=${encodeURIComponent(property.id)}`;
    document.title = title;
    setMeta('description', description);
    setMeta('og:title', title, 'property');
    setMeta('og:description', description, 'property');
    setMeta('og:url', url, 'property');
    setMeta('og:image', `${siteUrl}${property.image}`, 'property');
    setCanonical(url);
    const heading = document.querySelector('.property-heading h1');
    if (heading) heading.textContent = property.title;
    addSchema({
      '@context': 'https://schema.org',
      '@type': 'RealEstateListing',
      name: property.title,
      description,
      url,
      image: (property.images || [property.image]).map((image) => `${siteUrl}${image}`),
      datePosted: '2026-01-01',
      offers: { '@type': 'Offer', price: String(property.price).replace(/[^0-9.]/g, '') || undefined, priceCurrency: 'EUR' },
      address: { '@type': 'PostalAddress', addressLocality: property.location, addressRegion: 'Epirus', addressCountry: 'GR' },
      provider: { '@id': `${siteUrl}/#organization` }
    });
  } else if (requestedPage === 'properties') {
    document.title = 'Properties for Sale in Epirus, Greece | Epirus Estate';
    setMeta('description', 'Browse villas, houses, land and investment properties for sale across Epirus, Greece, including Parga, Preveza, Ammoudia and the Ionian coast.');
    setCanonical(`${siteUrl}/?page=properties`);
     const heading = document.querySelector('.landing-center h1');
     if (heading) heading.textContent = 'Properties for Sale in Epirus, Greece';
     const discovery = document.createElement('nav');
     discovery.setAttribute('aria-label', 'Explore Epirus property markets');
     discovery.innerHTML = '<a href="/locations/parga/">Properties for sale in Parga</a> · <a href="/locations/preveza/">Properties for sale in Preveza</a> · <a href="/property-types/villas/">Villas for sale in Epirus</a> · <a href="/property-types/beachfront/">Beachfront properties in Epirus</a>';
     discovery.style.cssText = 'display:flex;flex-wrap:wrap;gap:12px;justify-content:center;padding:18px 24px;background:#f4f0e8;font-size:12px;line-height:1.5;position:relative;z-index:2';
     document.querySelector('.region-section')?.before(discovery);
  } else {
    const heading = document.querySelector('.landing-center h1');
    if (heading) heading.textContent = 'Properties for Sale in Epirus, Greece';
    const discovery = document.createElement('nav');
    discovery.setAttribute('aria-label', 'Explore Epirus property markets');
    discovery.innerHTML = '<a href="/locations/parga/">Properties for sale in Parga</a> · <a href="/locations/preveza/">Properties for sale in Preveza</a> · <a href="/property-types/villas/">Villas for sale in Epirus</a> · <a href="/property-types/beachfront/">Beachfront properties in Epirus</a>';
    discovery.style.cssText = 'display:flex;flex-wrap:wrap;gap:12px;justify-content:center;padding:18px 24px;background:#f4f0e8;font-size:12px;line-height:1.5;position:relative;z-index:2';
    document.querySelector('.region-section')?.before(discovery);
  }
})();
