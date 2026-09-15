const requestedPage = new URLSearchParams(window.location.search).get('page');
if (requestedPage === 'property') {
  document.body.classList.remove('page-landing');
  document.body.classList.add('page-property');
}

const header = document.querySelector('#site-header');
const menuButton = document.querySelector('.menu-toggle');
const form = document.querySelector('form');
const listingList = document.querySelector('.listing-list');
const pagination = document.querySelector('.pagination');
const faqItems = document.querySelectorAll('.faq-item');
const propertyModal = document.querySelector('.property-modal');
const privacyModal = document.querySelector('#privacy-modal');
const cookieConsent = document.querySelector('[data-cookie-consent]');
const cookieSettings = document.querySelectorAll('[data-cookie-settings]');
const modalImage = propertyModal?.querySelector('.modal-image>img');
const modalGallery = propertyModal?.querySelector('.modal-gallery');
const propertyPage = document.querySelector('.property-page');
const photoLightbox = document.querySelector('.photo-lightbox');
const lightboxImage = photoLightbox?.querySelector('img');
const lightboxPrevious = photoLightbox?.querySelector('.lightbox-previous');
const lightboxNext = photoLightbox?.querySelector('.lightbox-next');
const lightboxCounter = photoLightbox?.querySelector('.lightbox-counter');
const lightboxFilmstrip = photoLightbox?.querySelector('.lightbox-filmstrip');
const languageButton = document.querySelector('.language');
const heroSearch = document.querySelector('.hero-search');
const filterBar = document.querySelector('.filter-bar');
const locationFilterButton = document.createElement('button');
locationFilterButton.className = 'filter-button';
locationFilterButton.innerHTML = '⌖ <span>Location</span>⌄';
filterBar?.insertBefore(locationFilterButton, filterBar.querySelector('.filter-next'));
let allProperties = [];
let filteredProperties = [];
let currentPage = 1;
const propertiesPerPage = 10;
let lightboxPhotos = [];
let lightboxIndex = 0;
let activeFilterMenu;
const locationAliases = {parga: ['parga', 'πάργα', 'πάργας'], preveza: ['preveza', 'πρέβεζα', 'πρέβεζης'], ioannina: ['ioannina', 'ιωάννινα'], arta: ['arta', 'άρτα'], igoumenitsa: ['igoumenitsa', 'ηγουμενίτσα']};
const categoryTerms = {urban: ['house', 'apartment', 'residential'], apartment: ['apartment'], complex: ['complex'], villa: ['villa'], house: ['house'], chalet: ['chalet'], commercial: ['hotel', 'office', 'commercial'], hotel: ['hotel'], office: ['office'], land: ['land', 'plot']};
const locationGroups = [
  {label: 'Parga area', terms: ['parga', 'πάργα', 'πάργας', 'kanalaki', 'καναλακι', 'καναλλάκι', 'ammoudia', 'αμμουδιά', 'kastri', 'καστρί', 'agia kyriaki', 'αγία κυριακή', 'skala', 'σκάλα', 'tsouknida', 'τσουκνίδα', 'valanidousa', 'βαλανιδούσα', 'narkissos', 'νάρκισσος']},
  {label: 'Preveza area', terms: ['preveza', 'πρέβεζα', 'πρέβεζης', 'skafidaki', 'σκαφιδάκι', 'lygia', 'λυγιά', 'mytikas', 'μύτικας', 'mesopotamo', 'μεσοπόταμο', 'μεσοπόταμος']},
  {label: 'Loutsa and Vrachos coast', terms: ['loutsa', 'λούτσα', 'vrachos', 'βράχος']}
];
let currentLanguage = 'en';
let sourceProperties = [];
let propertyTranslations = {};

function saveCookieConsent(value) {
  localStorage.setItem('epirus_cookie_consent_v3', value);
  document.cookie = `epirus_cookie_consent_v3=${value}; max-age=31536000; path=/; SameSite=Lax`;
  if (cookieConsent) cookieConsent.hidden = true;
}

function showCookieConsent() {
  if (cookieConsent) cookieConsent.hidden = false;
}

if (cookieConsent && !localStorage.getItem('epirus_cookie_consent_v3')) showCookieConsent();
cookieConsent?.querySelector('[data-cookie-allow]')?.addEventListener('click', () => saveCookieConsent('accepted'));
cookieConsent?.querySelector('[data-cookie-decline]')?.addEventListener('click', () => saveCookieConsent('declined'));
cookieSettings.forEach((button) => button.addEventListener('click', showCookieConsent));

document.querySelectorAll('img[src^="/public/"]').forEach((image) => {
  image.src = image.getAttribute('src').replace('/public/', '');
});

document.querySelectorAll('img[src^="/ui-prototype/"]').forEach((image) => {
  image.src = new URL(image.getAttribute('src').replace(/^\/+/, ''), document.baseURI).href;
});

const languageText = {
  en: {home: 'Home', properties: 'Properties', about: 'About us', services: 'Services', contact: 'Contact', sell: 'Sell with us ↗', search: 'Search', viewAll: 'View all properties ↗', allFilters: 'All filters (1)', forSale: 'For sale', propertyType: 'Property type', amenities: 'Amenities', price: 'Price', size: 'Size', location: 'Location', list: 'List', map: 'Map', relevance: 'Relevance', saveSearch: 'Save search', results: 'properties for sale in Epirus', allPhotos: 'All photos', enlarge: 'Click a photo to enlarge', description: 'Description', details: 'Details', ask: 'Ask about this property ↗', previous: 'Previous photo', next: 'Next photo', close: 'Close photo viewer', faq: 'Frequently asked questions.', faqIntro: 'A few useful answers for your first steps toward finding a property in Epirus.', name: 'Name', email: 'Email', phone: 'Phone', message: 'Message', send: 'Send inquiry', back: '← Back to properties'},
  el: {home: 'Αρχική', properties: 'Ακίνητα', about: 'Σχετικά', services: 'Υπηρεσίες', contact: 'Επικοινωνία', sell: 'Πουλήστε μαζί μας ↗', search: 'Αναζήτηση', viewAll: 'Δείτε όλα τα ακίνητα ↗', allFilters: 'Όλα τα φίλτρα (1)', forSale: 'Προς πώληση', propertyType: 'Τύπος ακινήτου', amenities: 'Παροχές', price: 'Τιμή', size: 'Μέγεθος', location: 'Τοποθεσία', list: 'Λίστα', map: 'Χάρτης', relevance: 'Σχετικότητα', saveSearch: 'Αποθήκευση αναζήτησης', results: 'ακίνητα προς πώληση στην Ήπειρο', allPhotos: 'Όλες οι φωτογραφίες', enlarge: 'Πατήστε σε φωτογραφία για μεγέθυνση', description: 'Περιγραφή', details: 'Λεπτομέρειες', ask: 'Ρωτήστε για το ακίνητο ↗', previous: 'Προηγούμενη φωτογραφία', next: 'Επόμενη φωτογραφία', close: 'Κλείσιμο προβολής φωτογραφιών', faq: 'Συχνές ερωτήσεις.', faqIntro: 'Χρήσιμες απαντήσεις για τα πρώτα σας βήματα στην αγορά ακινήτου στην Ήπειρο.', name: 'Όνομα', email: 'Email', phone: 'Τηλέφωνο', message: 'Μήνυμα', send: 'Αποστολή ερωτήματος', back: '← Πίσω στα ακίνητα'}
};

Object.assign(languageText.en, {searchEpirus: 'Search in Epirus', heroEyebrow: 'EPIRUS REAL ESTATE · NORTHWESTERN GREECE', heroTitle: 'Explore exceptional<br><em>properties in Epirus</em>', featured: 'Featured property', viewProperty: 'View property ↗', chooseLocation: 'Choose location⌄', regionEyebrow: 'The Epirus region', regionTitle: 'Where Mountains Meet<br><em>the Ionian Sea</em>', regionBody: "Epirus is Greece's best-kept secret. From the pristine beaches of Parga and Sivota to the dramatic Vikos Gorge and the historic stone villages of Zagori.", exploreRegions: 'Explore regions', guidance: 'A little guidance', startConversation: 'Start a conversation', contactTitle: "Let's find your<br><em>place in Epirus.</em>", contactBody: 'Tell us what you are looking for and we will be in touch.', yourName: 'Your name', howHelp: 'How can we help?'});
Object.assign(languageText.el, {searchEpirus: 'Αναζήτηση στην Ήπειρο', heroEyebrow: 'EPIRUS REAL ESTATE · ΒΟΡΕΙΟΔΥΤΙΚΗ ΕΛΛΑΔΑ', heroTitle: 'Ανακαλύψτε εξαιρετικά<br><em>ακίνητα στην Ήπειρο</em>', featured: 'Επιλεγμένο ακίνητο', viewProperty: 'Δείτε το ακίνητο ↗', chooseLocation: 'Επιλέξτε τοποθεσία⌄', regionEyebrow: 'Η περιοχή της Ηπείρου', regionTitle: 'Εκεί όπου τα βουνά συναντούν<br><em>το Ιόνιο</em>', regionBody: 'Η Ήπειρος είναι το καλύτερα κρυμμένο μυστικό της Ελλάδας. Από τις παραλίες της Πάργας και των Συβότων μέχρι το φαράγγι του Βίκου και τα πέτρινα χωριά του Ζαγορίου.', exploreRegions: 'Εξερευνήστε τις περιοχές', guidance: 'Χρήσιμες πληροφορίες', startConversation: 'Ξεκινήστε μια συζήτηση', contactTitle: 'Βρείτε το<br><em>δικό σας μέρος.</em>', contactBody: 'Πείτε μας τι αναζητάτε και θα επικοινωνήσουμε μαζί σας.', yourName: 'Το όνομά σας', howHelp: 'Πώς μπορούμε να βοηθήσουμε;'});

function setLanguageText(selector, key) {
  const element = document.querySelector(selector);
  if (element) element.textContent = languageText[currentLanguage][key];
}

function localizeProperties() {
  const translated = propertyTranslations[currentLanguage] || [];
  const translationsById = new Map(translated.map((property) => [String(property.id), property]));
  return sourceProperties.map((property) => ({
    ...property,
    ...(translationsById.get(String(property.id)) || {})
  }));
}

function applyLanguage() {
  const text = languageText[currentLanguage];
  document.documentElement.lang = currentLanguage === 'el' ? 'el' : 'en';
  languageButton.textContent = currentLanguage === 'en' ? 'ΕΛ' : 'EN';
  [['.desktop-nav a:nth-child(1)', 'home'], ['.desktop-nav a:nth-child(2)', 'properties'], ['.desktop-nav a:nth-child(3)', 'about'], ['.desktop-nav a:nth-child(4)', 'services'], ['.sell-link', 'sell'], ['.mobile-nav a:nth-child(1)', 'home'], ['.mobile-nav a:nth-child(2)', 'properties'], ['.mobile-nav a:nth-child(3)', 'about'], ['.mobile-nav a:nth-child(4)', 'services'], ['.mobile-nav a:nth-child(5)', 'contact'], ['.search-button', 'search'], ['.view-all-properties', 'viewAll'], ['.faq-section h2', 'faq'], ['.faq-intro', 'faqIntro'], ['.property-description h2', 'description'], ['.property-facts h2', 'details'], ['.property-contact', 'ask'], ['.back-results', 'back'], ['.all-photos-heading strong', 'allPhotos'], ['.all-photos-heading span', 'enlarge'], ['.hero-search a', 'search']].forEach(([selector, key]) => setLanguageText(selector, key));
  document.querySelectorAll('.filter-button span').forEach((element, index) => { element.textContent = [text.allFilters, text.forSale, text.propertyType, text.amenities, text.price, text.size, text.location][index] || element.textContent; });
  document.querySelectorAll('.view-tab span').forEach((element, index) => { element.textContent = [text.list, text.map][index]; });
  const resultText = document.querySelector('.results-context p');
  if (resultText) resultText.innerHTML = `<strong>${allProperties.length || 38}</strong> ${text.results} · page ${currentPage}`;
  document.querySelectorAll('.sort-button').forEach((element) => { element.textContent = `↕  ${text.relevance}⌄`; });
  document.querySelectorAll('.save-search').forEach((element) => { element.textContent = `♧  ${text.saveSearch}`; });
  document.querySelectorAll('.category-band strong').forEach((element, index) => { element.textContent = currentLanguage === 'el' ? ['Αστικά ακίνητα', 'Βίλες και κατοικίες', 'Επαγγελματικά και επενδυτικά', 'Οικόπεδα και αποκλειστικά'][index] : ['Urban residential', 'Villas and residences', 'Commercial and investment', 'Lands and exclusives'][index]; });
  setLanguageText('.gallery-back', currentLanguage === 'el' ? 'back' : 'back');
  if (document.querySelector('.gallery-back')) document.querySelector('.gallery-back').textContent = text.back.replace('properties', currentLanguage === 'el' ? 'ακίνητα' : 'properties');
  document.querySelectorAll('.gallery-pills span').forEach((element, index) => { element.textContent = currentLanguage === 'el' ? ['▧ φωτογραφίες', '▣ κατόψεις', '▹ βίντεο'][index] : ['▧ photos', '▣ floor plans', '▹ video'][index]; });
  document.querySelectorAll('.gallery-actions button').forEach((element, index) => { if (index === 0) element.setAttribute('aria-label', currentLanguage === 'el' ? 'Κοινοποίηση ακινήτου' : 'Share property'); });
  if (lightboxCounter && lightboxPhotos.length) lightboxCounter.textContent = `${lightboxIndex + 1} ${currentLanguage === 'el' ? 'από' : 'of'} ${lightboxPhotos.length} · ${currentLanguage === 'el' ? 'Φωτογραφία' : 'Photo'}`;
  document.querySelectorAll('.faq-item button span').forEach((element, index) => { element.textContent = currentLanguage === 'el' ? ['Μπορούν οι αλλοδαποί να αγοράσουν ακίνητο στην Ελλάδα;', 'Ποια έξοδα να περιμένω κατά την αγορά;', 'Πόσο διαρκεί η διαδικασία αγοράς;', 'Μπορώ να νοικιάσω το ακίνητό μου στην Ήπειρο;'][index] : ['Can foreigners buy property in Greece?', 'What costs should I expect when buying property?', 'How long does the buying process take?', 'Can I rent out my property in Epirus?'][index]; });
  document.querySelectorAll('.contact label').forEach((element, index) => { element.childNodes[0].textContent = [text.name, text.email, text.phone, text.message][index]; });
  const heroTitle = document.querySelector('.landing-center h1');
  if (heroTitle) heroTitle.innerHTML = text.heroTitle;
  setLanguageText('.quick-search span', 'searchEpirus');
  setLanguageText('.landing-center .eyebrow', 'heroEyebrow');
  setLanguageText('.landing-feature .feature-label', 'featured');
  setLanguageText('.landing-feature a', 'viewProperty');
  setLanguageText('.breadcrumbs button', 'chooseLocation');
  setLanguageText('.region-copy .eyebrow', 'regionEyebrow');
  const regionTitle = document.querySelector('.region-copy h2');
  if (regionTitle) regionTitle.innerHTML = text.regionTitle;
  const regionBody = document.querySelector('.region-copy>p:not(.eyebrow)');
  if (regionBody) regionBody.textContent = text.regionBody;
  setLanguageText('.region-button', 'exploreRegions');
  setLanguageText('.services-heading .eyebrow', 'guidance');
  setLanguageText('.contact .eyebrow', 'startConversation');
  const contactTitle = document.querySelector('.contact h2');
  if (contactTitle) contactTitle.innerHTML = text.contactTitle;
  const contactBody = document.querySelector('.contact > div > p:last-child');
  if (contactBody) contactBody.textContent = text.contactBody;
  const contactInputs = document.querySelectorAll('.contact form input, .contact form textarea');
  if (contactInputs[0]) contactInputs[0].placeholder = text.yourName;
  if (contactInputs[3]) contactInputs[3].placeholder = text.howHelp;
}

heroSearch?.querySelector('a')?.addEventListener('click', (event) => {
  event.preventDefault();
  const values = [...heroSearch.querySelectorAll('select, input')].map((element) => element.value.trim());
  const params = new URLSearchParams({page: 'properties', status: values[0], price: values[1], location: values[2]});
  window.location.href = `index.html?${params.toString()}#properties`;
});

languageButton?.addEventListener('click', () => {
  currentLanguage = currentLanguage === 'en' ? 'el' : 'en';
  if (sourceProperties.length) {
    allProperties = localizeProperties();
    filteredProperties = allProperties;
    showPage(1);
    renderFeaturedProperty(allProperties[activeSlide]);
  }
  applyLanguage();
});
applyLanguage();

window.addEventListener('scroll', () => header.classList.toggle('scrolled', window.scrollY > 24));

const slides = [...document.querySelectorAll('.landing-slide')];
const slideCount = document.querySelector('.slide-count');
const featuredPanel = document.querySelector('.landing-feature');
let activeSlide = 0;

function renderFeaturedProperty(property) {
  if (!featuredPanel || !property) return;
  const label = featuredPanel.querySelector('.feature-label');
  const title = featuredPanel.querySelector('h2');
  const description = featuredPanel.querySelector('p');
  const link = featuredPanel.querySelector('a');
  if (slides[activeSlide]?.hasAttribute('data-static-slide')) return;
  const image = property.images?.[0] || property.image;
  if (label) label.textContent = `${languageText[currentLanguage].featured} · ${String(activeSlide + 1).padStart(2, '0')} / ${String(slides.length).padStart(2, '0')}`;
  if (title) title.textContent = property.title;
  if (description) description.textContent = `${property.location} · ${property.price}`;
  if (link) link.href = `index.html?page=property&id=${encodeURIComponent(property.id)}`;
  if (image && slides[activeSlide]) {
    const slideImage = slides[activeSlide].querySelector('img');
    if (slideImage) {
      slideImage.src = imagePath(image);
      slideImage.alt = property.title;
    }
  }
}

function showSlide(nextSlide) {
  activeSlide = (nextSlide + slides.length) % slides.length;
  slides.forEach((slide, index) => slide.classList.toggle('active', index === activeSlide));
  if (slideCount) slideCount.textContent = `${String(activeSlide + 1).padStart(2, '0')} / ${String(slides.length).padStart(2, '0')}`;
  renderFeaturedProperty(allProperties[activeSlide]);
}

menuButton?.addEventListener('click', () => {
  const open = header.classList.toggle('menu-open');
  menuButton.setAttribute('aria-expanded', String(open));
  menuButton.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
});

document.querySelectorAll('.mobile-nav a').forEach((link) => link.addEventListener('click', () => {
  header.classList.remove('menu-open');
  menuButton.setAttribute('aria-expanded', 'false');
  menuButton.setAttribute('aria-label', 'Open menu');
}));

function bindSaveButtons() {
  return;
}

function escapeHtml(value) {
  return String(value ?? '-').replace(/[&<>'"]/g, (character) => ({'&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;'}[character]));
}

function imagePath(path) {
  if (!path) return '';
  if (/^(https?:|data:|blob:)/.test(path)) return path;
  return new URL(path.replace(/^\/+/, ''), document.baseURI).href;
}

function propertyCard(property) {
  const image = property.images?.[0] || property.image;
  const photos = property.images?.length || 1;
  return `<article class="listing-card" data-property-id="${escapeHtml(property.id)}"><div class="listing-image"><img src="${imagePath(image)}" alt="${escapeHtml(property.title)}"><span class="photo-count">▧ ${photos}</span></div><div class="listing-details"><span class="listing-label">${escapeHtml(property.type)} · ${escapeHtml(property.location)}</span><h2>${escapeHtml(property.title)}</h2><strong class="listing-price">${escapeHtml(property.price)}</strong><div class="details-row"><span>▣ &nbsp; ${escapeHtml(property.sqm)} m²</span><span>⌂ &nbsp; ${escapeHtml(property.beds)}</span><span>♧ &nbsp; ${escapeHtml(property.baths)}</span></div><p>${escapeHtml(property.description)}</p><div class="listing-bottom"><span>EPIRUS REAL ESTATE · ID ${escapeHtml(property.id)}</span><div><button class="round-action" aria-label="Email listing">✉</button><button class="round-action save" aria-label="Save listing">♡</button></div></div><span class="ribbon ${property.featured ? '' : 'olive-ribbon'}">${property.featured ? 'FEATURED' : 'CURRENT SITE'}</span></div></article>`;
}

function getFallbackProperty(card) {
  const img = card.querySelector('img');
  const label = card.querySelector('.listing-label')?.textContent?.trim() || '';
  const title = card.querySelector('h2')?.textContent?.trim() || 'Property';
  const price = card.querySelector('.listing-price')?.textContent?.trim() || 'Price on request';
  const description = card.querySelector('.listing-details p')?.textContent?.trim() || 'Property description unavailable';
  const detailsRow = card.querySelector('.details-row')?.textContent || '';
  const labelParts = label.split('·').map((part) => part.trim());
  const propertyType = labelParts.length > 1 ? labelParts[0] : 'property';
  const location = labelParts.length > 1 ? labelParts[1] : 'Epirus';
  const sqmMatch = detailsRow.match(/\d[\d,\s.]*\s*m²/);
  const bedsMatch = detailsRow.match(/⌂\s*\u00A0?\s*([^\n\r]+)/);
  const bathsMatch = detailsRow.match(/♧\s*\u00A0?\s*([^\n\r]+)/);
  const imageSrc = img?.getAttribute('src') || '';

  return {
    id: card.dataset.propertyId || title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') || 'fallback-property',
    type: propertyType,
    location,
    title,
    price,
    sqm: sqmMatch ? sqmMatch[0].replace(/m²/gi, '').trim() : '-',
    beds: bedsMatch ? bedsMatch[1].trim().replace(/\s+/g, ' ') : '-',
    baths: bathsMatch ? bathsMatch[1].trim().replace(/\s+/g, ' ') : '-',
    description,
    image: imageSrc,
    images: imageSrc ? [imageSrc] : [],
    featured: !/example/i.test(title) && !/example/i.test(card.textContent)
  };
}

function renderPropertyPage(property) {
  if (!propertyPage || !property) return;
  const image = property.images?.[0] || property.image;
  propertyPage.querySelector('.property-main-photo img').src = imagePath(image);
  propertyPage.querySelector('.property-main-photo img').alt = property.title;
  propertyPage.querySelector('.property-page-label').textContent = `${property.type} · ${property.location}`;
  propertyPage.querySelector('.property-heading h1').textContent = property.title;
  propertyPage.querySelector('.property-heading>strong').textContent = property.price;
  propertyPage.querySelector('.property-specs').innerHTML = `<span>▣ &nbsp; ${escapeHtml(property.sqm)} m²</span><span>⌂ &nbsp; ${escapeHtml(property.beds)} bedrooms</span><span>♧ &nbsp; ${escapeHtml(property.baths)} bathrooms</span>`;
  propertyPage.querySelector('.property-description p').textContent = property.description;
  propertyPage.querySelector('.property-facts>div').innerHTML = `<span>Property type<strong>${escapeHtml(property.type)}</strong></span><span>Location<strong>${escapeHtml(property.location)}</strong></span><span>Bedrooms<strong>${escapeHtml(property.beds)}</strong></span><span>Bathrooms<strong>${escapeHtml(property.baths)}</strong></span><span>Property size<strong>${escapeHtml(property.sqm)} m²</strong></span><span>Reference<strong>EP-${escapeHtml(property.id)}</strong></span>`;
  propertyPage.querySelector('.property-photo-count').textContent = `${property.images?.length || 1} photos`;
  propertyPage.querySelector('.property-gallery-grid').innerHTML = (property.images || [image]).slice(1, 5).map((photo) => `<img src="${imagePath(photo)}" alt="${escapeHtml(property.title)}">`).join('');
  propertyPage.querySelector('.property-all-photos').innerHTML = (property.images || [image]).map((photo, index) => `<img src="${imagePath(photo)}" alt="${escapeHtml(property.title)} - photo ${index + 1}">`).join('');
}

function openLightbox(image) {
  if (!photoLightbox || !lightboxImage) return;
  const allPhotoImages = [...propertyPage.querySelectorAll('.property-all-photos img')];
  lightboxPhotos = allPhotoImages.length ? allPhotoImages : [...propertyPage.querySelectorAll('.property-gallery img')];
  lightboxIndex = Math.max(0, lightboxPhotos.findIndex((photo) => photo.src === image.src));
  lightboxFilmstrip.replaceChildren(...lightboxPhotos.map((photo, index) => { const thumbnail = document.createElement('img'); thumbnail.src = photo.src; thumbnail.alt = photo.alt; thumbnail.dataset.index = String(index); return thumbnail; }));
  showLightboxPhoto();
  photoLightbox.hidden = false;
  document.body.classList.add('lightbox-open');
}

function showLightboxPhoto() {
  const image = lightboxPhotos[lightboxIndex];
  if (!image) return;
  lightboxImage.src = image.src;
  lightboxImage.alt = image.alt;
  lightboxCounter.textContent = `${lightboxIndex + 1} of ${lightboxPhotos.length} · Photo`;
  lightboxFilmstrip.querySelectorAll('img').forEach((thumbnail, index) => thumbnail.classList.toggle('active', index === lightboxIndex));
}

lightboxPrevious?.addEventListener('click', () => { lightboxIndex = (lightboxIndex - 1 + lightboxPhotos.length) % lightboxPhotos.length; showLightboxPhoto(); });
lightboxNext?.addEventListener('click', () => { lightboxIndex = (lightboxIndex + 1) % lightboxPhotos.length; showLightboxPhoto(); });

lightboxFilmstrip?.addEventListener('click', (event) => {
  const thumbnail = event.target.closest('img');
  if (!thumbnail) return;
  lightboxIndex = Number(thumbnail.dataset.index);
  showLightboxPhoto();
});

propertyPage?.querySelector('.property-gallery')?.addEventListener('click', (event) => {
  const image = event.target.closest('img');
  if (image) openLightbox(image);
});

photoLightbox?.querySelectorAll('[data-close-lightbox]').forEach((element) => element.addEventListener('click', () => {
  photoLightbox.hidden = true;
  document.body.classList.remove('lightbox-open');
}));

function openProperty(property, card) {
  const title = property?.title || card.querySelector('h2').textContent;
  const image = property?.images?.[0] || property?.image || card.querySelector('.listing-image img').getAttribute('src');
  propertyModal.querySelector('.modal-label').textContent = property ? `${property.type} · ${property.location}` : card.querySelector('.listing-label').textContent;
  propertyModal.querySelector('#modal-title').textContent = title;
  propertyModal.querySelector('.modal-price').textContent = property?.price || card.querySelector('.listing-price').textContent;
  propertyModal.querySelector('.modal-details').innerHTML = property ? `▣ ${escapeHtml(property.sqm)} m² &nbsp;&nbsp; ⌂ ${escapeHtml(property.beds)} &nbsp;&nbsp; ♧ ${escapeHtml(property.baths)}` : card.querySelector('.details-row').innerHTML;
  propertyModal.querySelector('.modal-description').textContent = property?.description || card.querySelector('.listing-details p').textContent;
  propertyModal.querySelector('.modal-facts-grid').innerHTML = property ? `<span>Bedrooms<strong>${escapeHtml(property.beds)}</strong></span><span>Bathrooms<strong>${escapeHtml(property.baths)}</strong></span><span>Property size<strong>${escapeHtml(property.sqm)} m²</strong></span><span>Property type<strong>${escapeHtml(property.type)}</strong></span><span>Location<strong>${escapeHtml(property.location)}</strong></span><span>Reference<strong>EP-${escapeHtml(property.id)}</strong></span>` : '<span>Listing details<strong>Available on request</strong></span>';
  modalImage.src = imagePath(image.startsWith('../') ? image.replace('../public', '') : image);
  modalImage.alt = title;
  modalGallery.replaceChildren();
  (property?.images || [image]).slice(0, 5).forEach((photo) => { const thumbnail = document.createElement('img'); thumbnail.src = imagePath(photo); thumbnail.alt = title; thumbnail.addEventListener('click', () => { modalImage.src = imagePath(photo); }); modalGallery.append(thumbnail); });
  propertyModal.hidden = false;
  document.body.classList.add('modal-open');
}

listingList?.addEventListener('click', (event) => {
  if (event.target.closest('button')) return;
  const card = event.target.closest('.listing-card');
  if (!card) return;
  const property = allProperties.find((item) => String(item.id) === card.dataset.propertyId);
  if (property) window.location.href = `index.html?page=property&id=${encodeURIComponent(property.id)}`;
  else openProperty(property, card);
});

propertyModal?.querySelectorAll('[data-close-modal]').forEach((element) => element.addEventListener('click', () => {
  propertyModal.hidden = true;
  document.body.classList.remove('modal-open');
}));

document.querySelectorAll('[data-open-privacy]').forEach((button) => button.addEventListener('click', (event) => {
  event.preventDefault();
  if (!privacyModal) return;
  privacyModal.hidden = false;
  document.body.classList.add('modal-open');
}));

privacyModal?.querySelectorAll('[data-close-privacy]').forEach((element) => element.addEventListener('click', () => {
  privacyModal.hidden = true;
  document.body.classList.remove('modal-open');
}));

document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && propertyModal && !propertyModal.hidden) {
    propertyModal.hidden = true;
    document.body.classList.remove('modal-open');
  }
  if (event.key === 'Escape' && privacyModal && !privacyModal.hidden) {
    privacyModal.hidden = true;
    document.body.classList.remove('modal-open');
  }
  if (event.key === 'Escape' && photoLightbox && !photoLightbox.hidden) {
    photoLightbox.hidden = true;
    document.body.classList.remove('lightbox-open');
  }
  if (photoLightbox && !photoLightbox.hidden && (event.key === 'ArrowLeft' || event.key === 'ArrowRight')) {
    lightboxIndex = (lightboxIndex + (event.key === 'ArrowRight' ? 1 : -1) + lightboxPhotos.length) % lightboxPhotos.length;
    showLightboxPhoto();
  }
});

function showPage(pageNumber) {
  currentPage = pageNumber;
  const start = (pageNumber - 1) * propertiesPerPage;
  const visibleProperties = filteredProperties.slice(start, start + propertiesPerPage);
  listingList.replaceChildren(...(visibleProperties.length ? visibleProperties.map(propertyCard).map((html) => {
    const template = document.createElement('template');
    template.innerHTML = html;
    return template.content.firstElementChild;
  }) : [Object.assign(document.createElement('p'), {className: 'no-results', textContent: currentLanguage === 'el' ? 'Δεν βρέθηκαν ακίνητα με αυτά τα κριτήρια.' : 'No properties match these search criteria.'})]));
  updatePagination(Math.max(1, Math.ceil(filteredProperties.length / propertiesPerPage)));
  pagination.querySelectorAll('button').forEach((button) => button.classList.toggle('current', button.textContent.trim() === String(pageNumber)));
  const resultText = languageText[currentLanguage].results;
  document.querySelector('.results-context p').innerHTML = `<strong>${filteredProperties.length}</strong> ${resultText} · page ${pageNumber}`;
  bindSaveButtons();
}

function updatePagination(maxPage) {
  pagination?.querySelectorAll('button').forEach((button) => {
    const pageNumber = Number(button.textContent.trim());
    if (pageNumber) button.hidden = pageNumber > maxPage;
  });
}

function updatePageButtons() {
  if (!pagination) return;
  const maxPage = Math.max(1, Math.ceil(filteredProperties.length / propertiesPerPage));
  pagination.querySelectorAll('button').forEach((button) => {
    const label = button.textContent.trim();
    const pageNumber = Number(label);
    if (!Number.isNaN(pageNumber)) {
      button.hidden = pageNumber > maxPage;
    }
    button.classList.toggle('current', label === String(currentPage));
  });
}

function setPropertyFilter(filter) {
  const matches = categoryTerms[filter] || [];
  filteredProperties = allProperties.filter((property) => matches.some((term) => `${property.type} ${property.title} ${property.description}`.toLowerCase().includes(term)));
  showPage(1);
}

function updateCategoryCounts(properties) {
  document.querySelectorAll('.category-band button[data-filter]').forEach((button) => {
    const filter = button.dataset.filter;
    const count = properties.filter((property) => {
      const searchable = typeof property === 'string' ? property.toLowerCase() : `${property.type} ${property.title} ${property.description}`.toLowerCase();
      return (categoryTerms[filter] || []).some((term) => searchable.includes(term));
    }).length;
    const label = button.dataset.label || button.textContent.replace(/\s*\([^)]*\)/, '').trim();
    button.dataset.label = label;
    button.textContent = `${label} (${count})`;
  });
}

document.querySelectorAll('.category-band button').forEach((button) => button.addEventListener('click', () => setPropertyFilter(button.dataset.filter)));

function closeFilterMenu() {
  activeFilterMenu?.remove();
  activeFilterMenu = null;
}

function applyFilterCriteria(criteria) {
  filteredProperties = allProperties.filter((property) => {
    const searchable = `${property.type} ${property.title} ${property.location} ${property.description}`.toLowerCase();
    const numericPrice = Number(String(property.price).replace(/[^0-9]/g, ''));
    const numericSize = Number(String(property.sqm).replace(/[^0-9]/g, ''));
    const locationMatch = criteria.locationTerms
      ? criteria.excludeLocationGroups
        ? !locationGroups.some((group) => group.terms.some((term) => searchable.includes(term)))
        : criteria.locationTerms.some((term) => searchable.includes(term))
      : (!criteria.location || searchable.includes(criteria.location));
    return locationMatch && (!criteria.type || searchable.includes(criteria.type)) && (!criteria.amenity || searchable.includes(criteria.amenity)) && (!criteria.price || (criteria.price === 'under' ? numericPrice > 0 && numericPrice < 200000 : numericPrice >= 200000 && numericPrice <= 500000)) && (!criteria.size || (criteria.size === 'small' ? numericSize > 0 && numericSize < 120 : numericSize >= 120)) && (!criteria.status || (criteria.status === 'rent' ? /rent|rental|ενοικ/.test(searchable) : !/rent|rental|ενοικ/.test(searchable)));
  });
  showPage(1);
}

function openFilterMenu(button, options) {
  closeFilterMenu();
  const menu = document.createElement('div');
  menu.className = 'filter-menu';
  options.forEach((option) => {
    const choice = document.createElement('button');
    choice.type = 'button';
    choice.textContent = option.label;
    choice.addEventListener('click', () => { closeFilterMenu(); option.action(); });
    menu.append(choice);
  });
  document.body.append(menu);
  const buttonRect = button.getBoundingClientRect();
  const menuGap = 6;
  const menuTop = buttonRect.bottom + menuGap + menu.offsetHeight <= window.innerHeight
    ? buttonRect.bottom + menuGap
    : Math.max(8, buttonRect.top - menuGap - menu.offsetHeight);
  const menuLeft = Math.min(buttonRect.left, window.innerWidth - menu.offsetWidth - 8);
  menu.style.left = `${Math.max(8, menuLeft)}px`;
  menu.style.top = `${menuTop}px`;
  activeFilterMenu = menu;
}

filterBar?.querySelectorAll('.filter-button').forEach((button, index) => button.addEventListener('click', () => {
  const text = button.textContent.toLowerCase();
  if (index === 0) {
    openFilterMenu(button, [
      {label: 'All properties', action: () => applyFilterCriteria({})},
      {label: 'For sale', action: () => applyFilterCriteria({status: 'sale'})},
      {label: 'For rent', action: () => applyFilterCriteria({status: 'rent'})},
      {label: 'Villas', action: () => applyFilterCriteria({type: 'villa'})},
      {label: 'Houses', action: () => applyFilterCriteria({type: 'house'})},
      {label: 'Land', action: () => applyFilterCriteria({type: 'land'})},
      {label: 'Under €200,000', action: () => applyFilterCriteria({price: 'under'})},
      {label: '€200,000 - €500,000', action: () => applyFilterCriteria({price: 'mid'})}
    ]);
    return;
  }
  if (text.includes('for sale')) { openFilterMenu(button, [{label: 'For sale', action: () => applyFilterCriteria({status: 'sale'})}, {label: 'For rent', action: () => applyFilterCriteria({status: 'rent'})}]); return; }
  if (text.includes('property type')) { openFilterMenu(button, [{label: 'All property types', action: () => applyFilterCriteria({})}, {label: 'Villas', action: () => applyFilterCriteria({type: 'villa'})}, {label: 'Houses', action: () => applyFilterCriteria({type: 'house'})}, {label: 'Land', action: () => applyFilterCriteria({type: 'land'})}, {label: 'Apartments', action: () => applyFilterCriteria({type: 'apartment'})}]); return; }
  if (text.includes('location') || text.includes('τοποθεσία')) {
    const groupedLocations = locationGroups.filter((group) => allProperties.some((property) => {
      const location = String(property.location || '').toLowerCase();
      return group.terms.some((term) => location.includes(term));
    }));
    const groupedProperties = new Set(groupedLocations.flatMap((group) => group.terms));
    const hasOtherLocations = allProperties.some((property) => {
      const location = String(property.location || '').toLowerCase();
      return ![...groupedProperties].some((term) => location.includes(term));
    });
    const options = [
      {label: 'All locations', action: () => applyFilterCriteria({})},
      ...groupedLocations.map((group) => ({label: group.label, action: () => applyFilterCriteria({locationTerms: group.terms})})),
      ...(hasOtherLocations ? [{label: 'Other locations', action: () => applyFilterCriteria({locationTerms: [], excludeLocationGroups: true})}] : [])
    ];
    openFilterMenu(button, options);
    return;
  }
  if (text.includes('price')) { openFilterMenu(button, [{label: 'Any price', action: () => applyFilterCriteria({})}, {label: 'Under €200,000', action: () => applyFilterCriteria({price: 'under'})}, {label: '€200,000 - €500,000', action: () => applyFilterCriteria({price: 'mid'})}]); return; }
  if (text.includes('size')) { openFilterMenu(button, [{label: 'Any size', action: () => applyFilterCriteria({})}, {label: 'Under 120 m²', action: () => applyFilterCriteria({size: 'small'})}, {label: '120 m² and above', action: () => applyFilterCriteria({size: 'large'})}]); return; }
  openFilterMenu(button, [{label: 'Any amenities', action: () => applyFilterCriteria({})}, {label: 'Furnished', action: () => applyFilterCriteria({amenity: 'furnished'})}, {label: 'Sea view', action: () => applyFilterCriteria({amenity: 'sea'})}, {label: 'Pool', action: () => applyFilterCriteria({amenity: 'pool'})}]);
}));

document.addEventListener('click', (event) => { if (activeFilterMenu && !event.target.closest('.filter-menu,.filter-button')) closeFilterMenu(); });

async function loadOriginalProperties() {
  if (!listingList || !pagination) return;
  try {
    if (Array.isArray(window.PROTOTYPE_PROPERTIES)) {
      sourceProperties = window.PROTOTYPE_PROPERTIES;
    } else {
      const source = await fetch('../src/App.tsx').then((response) => response.text());
      const arrayMatch = source.match(/const\s+PROPERTIES\s*=\s*(\[[\s\S]*?\]);/);
      if (!arrayMatch) throw new Error('Property array could not be read from App.tsx');
      sourceProperties = Function(`return ${arrayMatch[1]}`)();
    }

    try {
      const translationObject = window.PROTOTYPE_TRANSLATIONS;
      if (!translationObject) throw new Error('Local translation data could not be loaded');
      propertyTranslations = Object.fromEntries(Object.entries(translationObject).map(([language, value]) => [language, value.properties || []]));
    } catch (translationError) {
      console.error('Property translations could not be loaded:', translationError);
      propertyTranslations = { en: [], el: [] };
    }

    allProperties = localizeProperties();
    filteredProperties = allProperties;
    renderFeaturedProperty(allProperties[activeSlide]);
    updateCategoryCounts(allProperties);
    const params = new URLSearchParams(window.location.search);
    const statusQuery = params.get('status') || '';
    const locationQuery = (params.get('location') || '').toLowerCase();
    const priceQuery = params.get('price') || '';
    if (params.get('page') === 'properties' && (locationQuery || priceQuery === 'Under €200,000' || priceQuery === '€200,000 - €500,000')) {
      filteredProperties = allProperties.filter((property) => {
        const searchable = `${property.title} ${property.location} ${property.description}`.toLowerCase();
        const locationTerms = locationAliases[locationQuery] || [locationQuery];
        const locationMatch = !locationQuery || locationQuery === 'location' || locationTerms.some((term) => searchable.includes(term));
        const rentalMatch = statusQuery === 'For rent' ? /rent|rental|ενοικ/.test(searchable) : statusQuery === 'For sale' ? !/rent|rental|ενοικ/.test(searchable) : true;
        const numericPrice = Number(String(property.price).replace(/[^0-9]/g, ''));
        const priceMatch = priceQuery === 'Under €200,000' ? numericPrice > 0 && numericPrice < 200000 : priceQuery === '€200,000 - €500,000' ? numericPrice >= 200000 && numericPrice <= 500000 : true;
        return locationMatch && priceMatch && rentalMatch;
      });
    }
    if (new URLSearchParams(window.location.search).get('page') === 'property') {
      renderPropertyPage(allProperties.find((property) => String(property.id) === new URLSearchParams(window.location.search).get('id')) || allProperties[0]);
      return;
    }
    const maxPage = Math.ceil(filteredProperties.length / propertiesPerPage);
    updatePagination(maxPage);
    showPage(1);
  } catch (error) {
    const fallbackCards = [...listingList.querySelectorAll('.listing-card')];
    const params = new URLSearchParams(window.location.search);
    const locationQuery = (params.get('location') || '').toLowerCase();
    const priceQuery = params.get('price') || '';
    const matchingCards = fallbackCards.filter((card) => {
      const searchable = card.textContent.toLowerCase();
      const locationTerms = locationAliases[locationQuery] || [locationQuery];
      const locationMatch = !locationQuery || locationTerms.some((term) => searchable.includes(term));
      const priceMatch = !priceQuery || priceQuery === 'Any price' || (priceQuery === 'Under €200,000' && /€(125|160),000/.test(card.textContent)) || (priceQuery === '€200,000 - €500,000' && /€250,000/.test(card.textContent));
      return locationMatch && priceMatch;
    });
    if (locationQuery || priceQuery && priceQuery !== 'Any price') {
      listingList.replaceChildren(...(matchingCards.length ? matchingCards : [Object.assign(document.createElement('p'), {className: 'no-results', textContent: 'No properties match these search criteria.'})]));
      const resultText = document.querySelector('.results-context p');
      if (resultText) resultText.innerHTML = `<strong>${matchingCards.length} properties</strong> for sale in Epirus`;
    }
    allProperties = fallbackCards.map(getFallbackProperty);
    filteredProperties = allProperties;
    updateCategoryCounts(allProperties);
    updatePagination(Math.max(1, Math.ceil(allProperties.length / propertiesPerPage)));
    showPage(1);
    bindSaveButtons();
  }
}

pagination?.querySelectorAll('button').forEach((button) => button.addEventListener('click', () => {
  const maxPage = Math.max(1, Math.ceil(filteredProperties.length / propertiesPerPage));
  const current = currentPage;
  const label = button.textContent.trim();
  const requested = label === 'Next ›' ? Math.min(maxPage, current + 1) : label === '‹ Previous' ? Math.max(1, current - 1) : label === '«' ? 1 : label === '»' ? maxPage : Number(label);
  if (requested && allProperties.length) showPage(requested);
}));

loadOriginalProperties();

faqItems.forEach((item) => item.querySelector('button').addEventListener('click', () => {
  const isOpen = item.classList.toggle('open');
  item.querySelector('button').setAttribute('aria-expanded', String(isOpen));
  item.querySelector('button strong').textContent = isOpen ? '−' : '+';
}));

form.addEventListener('submit', async (event) => {
  event.preventDefault();
  const button = form.querySelector('button');
  const formData = new FormData(form);
  const originalLabel = button.innerHTML;

  button.disabled = true;
  button.textContent = 'Sending...';
  form.setAttribute('aria-busy', 'true');

  try {
    const response = await fetch('https://formsubmit.co/ajax/tatosxristos@gmail.com', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({
        name: formData.get('name'),
        email: formData.get('email'),
        phone: formData.get('phone'),
        message: formData.get('message'),
        _subject: 'New Contact Form Submission from Epirus Website'
      })
    });

    if (!response.ok) throw new Error('Form submission failed');

    button.innerHTML = 'Inquiry sent <span>✓</span>';
    button.classList.add('sent');
    form.reset();
    window.setTimeout(() => {
      button.innerHTML = originalLabel;
      button.classList.remove('sent');
      button.disabled = false;
      form.removeAttribute('aria-busy');
    }, 3000);
  } catch (error) {
    console.error('Form submission error:', error);
    button.innerHTML = 'Try again <span>↗</span>';
    button.disabled = false;
    form.removeAttribute('aria-busy');
  }
});

propertyPage?.querySelector('.property-all-photos')?.addEventListener('click', (event) => {
  const image = event.target.closest('img');
  if (image) openLightbox(image);
});