import React, { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowLeft, BarChart3, Check, ChevronRight, FileText, ImagePlus, LayoutList, LogOut, Mail, Pencil, Plus, Save, Search, Settings, Star, Trash2, UploadCloud, X } from 'lucide-react';
import { PROPERTIES } from './App';
import {
  AdminProperty,
  Inquiry,
  adminLogin,
  adminLogout,
  checkAdminSession,
  createProperty as apiCreateProperty,
  deleteProperty as apiDeleteProperty,
  fetchInquiries,
  fetchProperties,
  updateProperty as apiUpdateProperty,
} from './propertyStore';

const defaultProperty: AdminProperty = {
  id: 0,
  title: '',
  location: '',
  price: '',
  type: 'house',
  beds: '-',
  baths: '-',
  sqm: '',
  image: '',
  images: [],
  featured: false,
  description: '',
};

const formatDate = (date: string) => new Intl.DateTimeFormat('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }).format(new Date(date));

const getGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 18) return 'Good afternoon';
  return 'Good evening';
};

export function AdminPanel() {
  const [authStatus, setAuthStatus] = useState<'checking' | 'in' | 'out'>('checking');
  const [passwordInput, setPasswordInput] = useState('');
  const [loginError, setLoginError] = useState('');
  const [loggingIn, setLoggingIn] = useState(false);

  const [properties, setProperties] = useState<AdminProperty[]>(() => PROPERTIES as unknown as AdminProperty[]);
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [activeView, setActiveView] = useState<'overview' | 'listings' | 'inquiries'>('overview');
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [query, setQuery] = useState('');
  const [saved, setSaved] = useState(false);
  const [savingProperty, setSavingProperty] = useState(false);
  const [saveError, setSaveError] = useState('');
  const [selectedInquiry, setSelectedInquiry] = useState<Inquiry | null>(null);

  useEffect(() => {
    checkAdminSession().then((authenticated) => setAuthStatus(authenticated ? 'in' : 'out'));
  }, []);

  useEffect(() => {
    if (authStatus !== 'in') return;
    fetchProperties(PROPERTIES as unknown as AdminProperty[]).then(setProperties);
    fetchInquiries().then(setInquiries).catch(() => {});
  }, [authStatus]);

  const handleLogin = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoggingIn(true);
    setLoginError('');
    const ok = await adminLogin(passwordInput);
    setLoggingIn(false);
    if (ok) {
      setPasswordInput('');
      setAuthStatus('in');
    } else {
      setLoginError('Incorrect password.');
    }
  };

  const handleLogout = async () => {
    await adminLogout();
    setAuthStatus('out');
  };

  const selectedProperty = properties.find((property) => property.id === selectedId) || null;
  const filteredProperties = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    if (!normalizedQuery) return properties;
    return properties.filter((property) => `${property.title} ${property.location} ${property.type}`.toLowerCase().includes(normalizedQuery));
  }, [properties, query]);

  const isDraft = (id: number) => id < 0;

  const saveProperty = async (nextProperty: AdminProperty) => {
    setSavingProperty(true);
    setSaveError('');
    try {
      const persisted = isDraft(nextProperty.id)
        ? await apiCreateProperty(nextProperty)
        : await apiUpdateProperty(nextProperty);
      setProperties((current) => current.map((property) => property.id === nextProperty.id ? persisted : property));
      setSelectedId(persisted.id);
      setSaved(true);
      window.setTimeout(() => setSaved(false), 2200);
    } catch (error) {
      setSaveError(error instanceof Error ? error.message : 'Unable to save this listing.');
    } finally {
      setSavingProperty(false);
    }
  };

  const createProperty = () => {
    const draft = { ...defaultProperty, id: -Date.now() };
    setProperties((current) => [draft, ...current]);
    setSelectedId(draft.id);
    setActiveView('listings');
  };

  const deleteProperty = async (id: number) => {
    if (!isDraft(id)) {
      if (!window.confirm('Delete this listing?')) return;
      await apiDeleteProperty(id);
    }
    setProperties((current) => current.filter((property) => property.id !== id));
    setSelectedId(null);
  };

  const closeEditor = (id: number) => {
    if (isDraft(id)) {
      setProperties((current) => current.filter((property) => property.id !== id));
    }
    setSelectedId(null);
  };

  if (authStatus === 'checking') {
    return <div className="admin-shell admin-loading">Loading…</div>;
  }

  if (authStatus === 'out') {
    return (
      <div className="admin-login-screen">
        <form className="admin-login-card" onSubmit={handleLogin}>
          <span className="admin-brand-mark">E</span>
          <h1>Owner Desk</h1>
          <p>Sign in to manage listings and inquiries.</p>
          <input
            type="password"
            value={passwordInput}
            onChange={(event) => setPasswordInput(event.target.value)}
            placeholder="Admin password"
            autoFocus
          />
          {loginError && <span className="admin-login-error">{loginError}</span>}
          <button type="submit" className="admin-primary" disabled={loggingIn}>{loggingIn ? 'Signing in…' : 'Sign in'}</button>
        </form>
      </div>
    );
  }

  return (
    <div className="admin-shell">
      <aside className="admin-sidebar">
        <a className="admin-brand" href="/" aria-label="Back to Epirus Estate">
          <span className="admin-brand-mark">E</span>
          <span><strong>EPIRUS</strong><small>OWNER DESK</small></span>
        </a>
        <div className="admin-workspace"><span className="admin-status-dot" /> Live workspace</div>
        <nav className="admin-nav" aria-label="Admin navigation">
          <button className={activeView === 'overview' ? 'active' : ''} onClick={() => setActiveView('overview')}><BarChart3 size={17} /> Overview</button>
          <button className={activeView === 'listings' ? 'active' : ''} onClick={() => setActiveView('listings')}><LayoutList size={17} /> Listings <span>{properties.length}</span></button>
          <button className={activeView === 'inquiries' ? 'active' : ''} onClick={() => setActiveView('inquiries')}><Mail size={17} /> Inquiries <span>{inquiries.length}</span></button>
        </nav>
        <div className="admin-sidebar-bottom">
          <button><Settings size={17} /> Settings</button>
          <button onClick={handleLogout}><LogOut size={17} /> Log out</button>
        </div>
      </aside>

      <main className="admin-main">
        <header className="admin-topbar">
          <div><p className="admin-kicker">EPIRUS REAL ESTATE / OWNER DESK</p><h1>{activeView === 'overview' ? `${getGreeting()}, Christos` : activeView === 'listings' ? 'Listings' : 'Inquiries'}</h1></div>
          <div className="admin-top-actions">
            {saved && <span className="admin-saved"><Check size={15} /> Saved</span>}
            <button className="admin-avatar" aria-label="Owner profile">C</button>
          </div>
        </header>

        {activeView === 'overview' && (
          <Overview properties={properties} inquiries={inquiries} onListings={() => setActiveView('listings')} onInquiries={() => setActiveView('inquiries')} />
        )}

        {activeView === 'listings' && (
          <section className="admin-content">
            <div className="admin-toolbar">
              <label className="admin-search"><Search size={17} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search listings" /></label>
              <div className="admin-toolbar-actions"><button className="admin-primary" onClick={createProperty}><Plus size={17} /> Create listing</button></div>
            </div>
            <div className={`admin-listing-layout ${selectedProperty ? '' : 'full'}`}>
              <div className="admin-table-wrap">
                <table className="admin-table">
                  <thead>
                    <tr><th>#</th><th>Property</th><th>Type</th><th>Price</th><th>Featured</th><th>Status</th><th>Action</th></tr>
                  </thead>
                  <tbody>
                    {filteredProperties.map((property, index) => (
                      <tr className={selectedId === property.id ? 'selected' : ''} key={property.id}>
                        <td className="admin-table-index">{index + 1}</td>
                        <td>
                          <button className="admin-listing-name" onClick={() => setSelectedId(property.id)}>
                            <img src={property.image || '/about-photo.jpg'} alt="" />
                            <span><strong>{property.title || 'Untitled listing'}</strong><small>{property.location || 'Location pending'}</small></span>
                          </button>
                        </td>
                        <td><i className="admin-pill admin-pill-type">{property.type}</i></td>
                        <td>{property.price || 'Price on request'}</td>
                        <td>{property.featured ? <i className="admin-pill admin-pill-featured">Yes</i> : <i className="admin-pill admin-pill-muted">No</i>}</td>
                        <td><i className="admin-pill admin-pill-active">Active</i></td>
                        <td>
                          <div className="admin-row-actions">
                            <button className="admin-icon-chip edit" onClick={() => setSelectedId(property.id)} aria-label="Edit listing"><Pencil size={14} /></button>
                            <button className="admin-icon-chip delete" onClick={() => deleteProperty(property.id)} aria-label="Delete listing"><Trash2 size={14} /></button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {filteredProperties.length === 0 && <div className="admin-empty">No listings match your search.</div>}
              </div>
              {selectedProperty && <PropertyEditor property={selectedProperty} onSave={saveProperty} onDelete={deleteProperty} onClose={() => closeEditor(selectedProperty.id)} saving={savingProperty} saveError={saveError} />}
            </div>
          </section>
        )}

        {activeView === 'inquiries' && (
          <section className="admin-content">
            <div className="admin-toolbar"><div><p className="admin-kicker">CONTACT FORM</p><h2 className="admin-section-title">Latest conversations</h2></div><span className="admin-count">{inquiries.length} total</span></div>
            <div className="admin-inquiry-layout">
              <div className="admin-inquiry-list">
                {inquiries.map((inquiry) => <button className={`admin-inquiry-row ${selectedInquiry?.id === inquiry.id ? 'selected' : ''}`} key={inquiry.id} onClick={() => setSelectedInquiry(inquiry)}><span className="admin-inquiry-avatar">{inquiry.name.charAt(0).toUpperCase()}</span><span><strong>{inquiry.name}</strong><small>{inquiry.interest || 'General inquiry'} · {formatDate(inquiry.createdAt)}</small></span><ChevronRight size={17} /></button>)}
                {inquiries.length === 0 && <div className="admin-empty"><Mail size={30} /><strong>No inquiries yet</strong><span>New contact form answers will appear here.</span></div>}
              </div>
              {selectedInquiry && <InquiryDetail inquiry={selectedInquiry} onClose={() => setSelectedInquiry(null)} />}
            </div>
          </section>
        )}
      </main>
    </div>
  );
}

function Overview({ properties, inquiries, onListings, onInquiries }: { properties: AdminProperty[]; inquiries: Inquiry[]; onListings: () => void; onInquiries: () => void }) {
  const featured = properties.filter((property) => property.featured).length;
  return <section className="admin-content">
    <div className="admin-welcome"><div><p className="admin-kicker">TUESDAY, 22 SEPTEMBER 2026</p><h2>Here is what is happening today.</h2></div><button className="admin-primary" onClick={onListings}><Plus size={17} /> New listing</button></div>
    <div className="admin-stat-grid"><button onClick={onListings}><span>Active listings</span><strong>{properties.length}</strong><small><span className="admin-up">+{featured}</span> featured properties</small></button><button onClick={onInquiries}><span>New inquiries</span><strong>{inquiries.length}</strong><small>From contact form</small></button><button onClick={onListings}><span>Property types</span><strong>{new Set(properties.map((property) => property.type)).size}</strong><small>Across your catalog</small></button></div>
    <div className="admin-overview-grid"><div className="admin-panel"><div className="admin-panel-heading"><div><p className="admin-kicker">CATALOG</p><h3>Recent listings</h3></div><button onClick={onListings}>View all <ArrowLeft size={15} /></button></div>{properties.slice(0, 5).map((property) => <button className="admin-mini-row" key={property.id} onClick={onListings}><img src={property.image || '/about-photo.jpg'} alt="" /><span><strong>{property.title}</strong><small>{property.location}</small></span><b>{property.price}</b></button>)}</div><div className="admin-panel admin-inbox-preview"><div className="admin-panel-heading"><div><p className="admin-kicker">INBOX</p><h3>Recent inquiries</h3></div><button onClick={onInquiries}>View all <ArrowLeft size={15} /></button></div>{inquiries.slice(0, 4).map((inquiry) => <button className="admin-mini-inquiry" key={inquiry.id} onClick={onInquiries}><span className="admin-inquiry-avatar">{inquiry.name.charAt(0).toUpperCase()}</span><span><strong>{inquiry.name}</strong><small>{inquiry.message || 'No message'}</small></span></button>)}{inquiries.length === 0 && <div className="admin-preview-empty">Your inbox is clear.</div>}</div></div>
  </section>;
}

function PropertyEditor({ property, onSave, onDelete, onClose, saving, saveError }: { property: AdminProperty; onSave: (property: AdminProperty) => Promise<void>; onDelete: (id: number) => void; onClose: () => void; saving: boolean; saveError: string }) {
  const [draft, setDraft] = useState<AdminProperty>(property);
  const [photoError, setPhotoError] = useState('');
  const [compressingPhotos, setCompressingPhotos] = useState(false);
  const setField = (field: keyof AdminProperty, value: string | boolean) => setDraft((current) => ({ ...current, [field]: value }));
  const addImages = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setPhotoError('');
    setCompressingPhotos(true);
    try {
      const dataUrls = await Promise.all(Array.from(files).map(compressPhoto));
      setDraft((current) => {
        const images = [...current.images, ...dataUrls];
        return { ...current, images, image: current.image || images[0] || '' };
      });
    } catch (error) {
      setPhotoError(error instanceof Error ? error.message : 'Unable to process the selected photo.');
    } finally {
      setCompressingPhotos(false);
    }
  };
  const removeImage = (index: number) => {
    setDraft((current) => {
      const images = current.images.filter((_, i) => i !== index);
      return { ...current, images, image: images[0] || '' };
    });
  };
  const setCoverImage = (index: number) => {
    setDraft((current) => {
      if (index <= 0 || index >= current.images.length) return current;
      const images = [...current.images];
      const [chosen] = images.splice(index, 1);
      images.unshift(chosen);
      return { ...current, images, image: chosen };
    });
  };
  return <aside className="admin-editor"><div className="admin-editor-heading"><div><p className="admin-kicker">EDIT LISTING</p><h2>{draft.title || 'New listing'}</h2></div><button className="admin-icon-button" onClick={onClose} aria-label="Close editor"><X size={18} /></button></div><div className="admin-editor-body"><label>Title<input value={draft.title} onChange={(event) => setField('title', event.target.value)} /></label><label>Location<input value={draft.location} onChange={(event) => setField('location', event.target.value)} /></label><div className="admin-form-grid"><label>Price<input value={draft.price} onChange={(event) => setField('price', event.target.value)} /></label><label>Type<select value={draft.type} onChange={(event) => setField('type', event.target.value)}><option value="house">House</option><option value="villa">Villa</option><option value="land">Land</option><option value="apartment">Apartment</option><option value="commercial">Commercial</option></select></label><label>Beds<input value={draft.beds} onChange={(event) => setField('beds', event.target.value)} /></label><label>Baths<input value={draft.baths} onChange={(event) => setField('baths', event.target.value)} /></label><label>Size (m²)<input value={draft.sqm} onChange={(event) => setField('sqm', event.target.value)} /></label></div><label>Description<textarea rows={7} value={draft.description} onChange={(event) => setField('description', event.target.value)} /></label><label className="admin-checkbox"><input type="checkbox" checked={Boolean(draft.featured)} onChange={(event) => setField('featured', event.target.checked)} /> Feature this property</label><div className="admin-photo-field"><span className="admin-photo-field-label"><ImagePlus size={16} /> Property photos <small>Hover a photo and click the star to make it the cover image</small></span>{draft.images.length > 0 && <div className="admin-photo-grid"><AnimatePresence initial={false}>{draft.images.map((image, index) => <motion.div className={`admin-photo-thumb${index === 0 ? ' is-cover' : ''}`} key={image} layout initial={{ opacity: 0, scale: 0.85 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.85 }} transition={{ duration: 0.25, ease: 'easeOut' }}><img src={image} alt="" />{index === 0 ? <span className="admin-photo-cover-badge"><Star size={11} /> Cover</span> : <button type="button" className="admin-photo-cover-button" onClick={() => setCoverImage(index)} aria-label="Set as cover photo"><Star size={13} /></button>}<button type="button" className="admin-photo-remove" onClick={() => removeImage(index)} aria-label="Remove photo"><X size={13} /></button></motion.div>)}</AnimatePresence></div>}{photoError && <span className="admin-login-error">{photoError}</span>}<label className="admin-upload-button"><UploadCloud size={15} /> {compressingPhotos ? 'Preparing photos…' : 'Upload photos'}<input type="file" accept="image/jpeg,image/png,image/webp" multiple disabled={compressingPhotos} onChange={(event) => { void addImages(event.target.files); event.target.value = ''; }} hidden /></label></div></div><div className="admin-editor-footer">{saveError && <span className="admin-login-error">{saveError}</span>}<button className="admin-danger" onClick={() => onDelete(draft.id)} disabled={saving}><Trash2 size={16} /> Delete</button><button className="admin-primary" onClick={() => void onSave(draft)} disabled={saving || compressingPhotos}><Save size={16} /> {saving ? 'Saving…' : 'Save listing'}</button></div></aside>;
}

async function compressPhoto(file: File): Promise<string> {
  let bitmap: ImageBitmap;
  try {
    bitmap = await createImageBitmap(file);
  } catch {
    throw new Error(`Could not read "${file.name}" as an image.`);
  }

  try {
    let maxDimension = 1800;
    let quality = 0.84;
    for (let attempt = 0; attempt < 8; attempt += 1) {
      const scale = Math.min(1, maxDimension / Math.max(bitmap.width, bitmap.height));
      const canvas = document.createElement('canvas');
      canvas.width = Math.max(1, Math.round(bitmap.width * scale));
      canvas.height = Math.max(1, Math.round(bitmap.height * scale));
      const context = canvas.getContext('2d');
      if (!context) throw new Error('Your browser could not prepare the selected photo.');
      context.drawImage(bitmap, 0, 0, canvas.width, canvas.height);

      const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/webp', quality));
      if (blob && blob.size <= 1_500_000) {
        return await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => typeof reader.result === 'string' ? resolve(reader.result) : reject(new Error('Unable to read the compressed photo.'));
          reader.onerror = () => reject(reader.error ?? new Error('Unable to read the compressed photo.'));
          reader.readAsDataURL(blob);
        });
      }

      maxDimension *= 0.82;
      quality = Math.max(0.5, quality - 0.06);
    }
    throw new Error(`"${file.name}" is too large to upload. Choose a smaller photo.`);
  } finally {
    bitmap.close();
  }
}

function InquiryDetail({ inquiry, onClose }: { inquiry: Inquiry; onClose: () => void }) {
  return <aside className="admin-editor admin-inquiry-detail"><div className="admin-editor-heading"><div><p className="admin-kicker">INQUIRY / {formatDate(inquiry.createdAt)}</p><h2>{inquiry.name}</h2></div><button className="admin-icon-button" onClick={onClose} aria-label="Close inquiry"><X size={18} /></button></div><div className="admin-editor-body"><a className="admin-contact-link" href={`mailto:${inquiry.email}`}><Mail size={16} /> {inquiry.email}</a>{inquiry.phone && <p className="admin-detail-line"><strong>Phone</strong>{inquiry.phone}</p>}<p className="admin-detail-line"><strong>Interested in</strong>{inquiry.interest || 'Not specified'}</p><p className="admin-detail-line"><strong>Locations</strong>{inquiry.locations || 'Not specified'}</p><p className="admin-detail-line"><strong>Property types</strong>{inquiry.types || 'Not specified'}</p><p className="admin-detail-line"><strong>Budget</strong>{inquiry.budget || 'Not specified'}</p><p className="admin-detail-line"><strong>Preferred contact</strong>{inquiry.contactMethod || 'Not specified'}{inquiry.bestTime && ` · ${inquiry.bestTime}`}</p><div className="admin-message"><p className="admin-kicker">MESSAGE</p><p>{inquiry.message || 'No message provided.'}</p></div></div></aside>;
}
