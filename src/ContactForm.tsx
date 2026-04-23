import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Send, CheckCircle, MapPin, Phone, Mail, Clock, Facebook } from 'lucide-react';
import { countryCodes } from './countryCodes';

export function ContactForm({ t }: { t: any }) {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    countryCode: '+30',
    phone: '',
    interest: '',
    locations: [] as string[],
    types: [] as string[],
    budgetMin: 0,
    budgetMax: 1000000,
    contactMethod: '',
    bestTime: '',
    message: '',
    privacy: false
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [submitState, setSubmitState] = useState<'idle' | 'loading' | 'success'>('idle');

  const calculateProgress = () => {
    let completed = 0;
    const total = 11;
    
    if (formData.firstName.length >= 2) completed++;
    if (formData.lastName.length >= 2) completed++;
    if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) completed++;
    if (formData.phone.length >= 10 && /^\d+$/.test(formData.phone)) completed++;
    if (formData.interest) completed++;
    if (formData.locations.length > 0) completed++;
    if (formData.types.length > 0) completed++;
    if (formData.contactMethod) completed++;
    if (formData.bestTime) completed++;
    if (formData.message.length > 0 && formData.message.length <= 500) completed++;
    if (formData.privacy) completed++;

    return Math.round((completed / total) * 100);
  };

  const progress = calculateProgress();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const checked = type === 'checkbox' ? (e.target as HTMLInputElement).checked : undefined;
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const toggleArrayItem = (field: 'locations' | 'types', value: string) => {
    setFormData(prev => {
      const array = prev[field];
      if (array.includes(value)) {
        return { ...prev, [field]: array.filter(item => item !== value) };
      } else {
        return { ...prev, [field]: [...array, value] };
      }
    });
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setTouched(prev => ({ ...prev, [name]: true }));
    
    let error = '';
    if (name === 'firstName' || name === 'lastName') {
      if (value.trim().length < 2) error = 'Minimum 2 characters required';
    } else if (name === 'email') {
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) error = 'Invalid email format';
    } else if (name === 'phone') {
      const digitCount = value.replace(/\D/g, '').length;
      if (digitCount > 0 && digitCount < 8) error = 'Please enter a valid phone number';
    }
    
    setErrors(prev => ({ ...prev, [name]: error }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const hasErrors = Object.values(errors).some(err => !!err);
    if (hasErrors) {
      const allTouched = Object.keys(formData).reduce((acc, key) => ({ ...acc, [key]: true }), {});
      setTouched(allTouched);
      // Removed the alert, the inline red text on inputs will be enough
      return;
    }
    
    setSubmitState('loading');
    
    try {
      const response = await fetch('https://formsubmit.co/ajax/tatosxristos@gmail.com', {
        method: "POST",
        headers: { 
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        },
        body: JSON.stringify({
            name: `${formData.firstName} ${formData.lastName}`,
            email: formData.email,
            phone: `${formData.countryCode} ${formData.phone}`,
            interest: formData.interest,
            locations: formData.locations.join(', '),
            types: formData.types.join(', '),
            budget: `${formData.budgetMin} - ${formData.budgetMax}`,
            contactMethod: formData.contactMethod,
            bestTime: formData.bestTime,
            message: formData.message,
            _subject: 'New Contact Form Submission from Epirus Website'
        })
      });
      
      if (response.ok) {
        setSubmitState('success');
        setTimeout(() => {
          setSubmitState('idle');
          setFormData({
            firstName: '', lastName: '', email: '', countryCode: '+30', phone: '', interest: '',
            locations: [], types: [], budgetMin: 0, budgetMax: 1000000,
            contactMethod: '', bestTime: '', message: '', privacy: false
          });
          setTouched({});
        }, 3000);
      } else {
        throw new Error('Form submission failed');
      }
    } catch (error) {
      console.error("Form submission error:", error);
      setSubmitState('idle');
      alert('There was an error sending your message. Please try again later.');
    }
  };

  const renderPhoneInput = () => {
    const hasValue = formData.phone?.toString().length > 0;
    const hasError = touched.phone && errors.phone;
    const isValid = touched.phone && !errors.phone && hasValue;

    return (
      <div className="relative mb-6">
        <div className={`relative border-b-2 transition-colors duration-300 flex items-center min-h-[48px] ${hasError ? 'border-red-500' : 'border-stone/30 focus-within:border-terracotta'}`}>
          <div className="relative flex items-center bg-transparent text-aegean w-[80px] shrink-0 h-full">
            <input
              type="text"
              name="countryCode"
              value={formData.countryCode}
              onChange={handleChange}
              list="country-codes-list"
              className="appearance-none bg-transparent outline-none pr-4 text-base font-medium w-full z-10 placeholder-stone/50"
              placeholder="+Code"
            />
            <datalist id="country-codes-list">
              {countryCodes.map((c, i) => (
                <option key={`${c.code}-${i}`} value={c.code}>
                  {c.flag} {c.name}
                </option>
              ))}
            </datalist>
            <div className="absolute right-0 pointer-events-none text-aegean/50">
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
            </div>
          </div>
          <div className="relative flex-grow h-full">
            <input
              type="tel"
              name="phone"
              value={formData.phone as string}
              onChange={handleChange}
              onBlur={handleBlur}
              className="w-full bg-transparent pb-1 pt-5 outline-none text-aegean peer text-base"
              required
            />
            <label 
              className={`absolute left-0 transition-all duration-300 pointer-events-none text-sm
                peer-focus:-translate-y-4 peer-focus:text-xs peer-focus:text-terracotta
                ${hasValue ? '-translate-y-4 text-xs text-stone' : 'bottom-1 text-stone/70'}`}
            >
              {t.contactForm.phone} <span className="text-terracotta">*</span>
            </label>
          </div>
        </div>
        {hasError && <p className="absolute -bottom-5 left-0 text-[10px] text-red-500">{errors.phone}</p>}
        {isValid && <CheckCircle className="absolute right-0 bottom-2 w-4 h-4 text-terracotta" />}
      </div>
    );
  };

  const renderFloatingInput = ({ name, label, type = 'text', required = false, prefix = '' }: any) => {
    const hasValue = formData[name as keyof typeof formData]?.toString().length > 0;
    const hasError = touched[name] && errors[name];
    const isValid = touched[name] && !errors[name] && hasValue;

    return (
      <div className="relative mb-6">
        <div className={`relative border-b-2 transition-colors duration-300 min-h-[48px] flex items-center ${hasError ? 'border-red-500' : 'border-stone/30 focus-within:border-terracotta'}`}>
          {prefix && (
            <span className="absolute left-0 bottom-1 text-aegean font-medium">{prefix}</span>
          )}
          <input
            type={type}
            name={name}
            value={formData[name as keyof typeof formData] as string}
            onChange={handleChange}
            onBlur={handleBlur}
            className={`w-full bg-transparent pb-1 pt-5 outline-none text-aegean text-base ${prefix ? 'pl-10' : ''} peer`}
            required={required}
          />
          <label 
            className={`absolute left-0 transition-all duration-300 pointer-events-none text-sm
              ${prefix ? 'peer-focus:left-0 peer-focus:-translate-y-4 peer-focus:text-xs peer-focus:text-terracotta' : 'peer-focus:-translate-y-4 peer-focus:text-xs peer-focus:text-terracotta'} 
              ${hasValue ? '-translate-y-4 text-xs text-stone' : 'bottom-1 text-stone/70'} 
              ${prefix && !hasValue ? 'left-10' : ''}`}
          >
            {label} {required && <span className="text-terracotta">*</span>}
          </label>
        </div>
        {hasError && <p className="absolute -bottom-5 left-0 text-[10px] text-red-500">{errors[name]}</p>}
        {isValid && name === 'email' && <CheckCircle className="absolute right-0 bottom-2 w-4 h-4 text-terracotta" />}
      </div>
    );
  };

  const SectionDivider = () => (
    <div className="flex items-center justify-center my-8 opacity-20">
      <div className="h-px bg-aegean flex-grow"></div>
      <div className="w-1.5 h-1.5 rotate-45 bg-terracotta mx-3"></div>
      <div className="h-px bg-aegean flex-grow"></div>
    </div>
  );

  const SectionLabel = ({ text }: { text: string }) => (
    <h4 className="text-[10px] uppercase tracking-[0.2em] text-terracotta font-bold mb-6">{text}</h4>
  );

  const formatCurrency = (val: number) => {
    if (val >= 1000000) return '€1,000,000+';
    return '€' + val.toLocaleString();
  };

  return (
    <div className="w-full max-w-[1080px] mx-auto flex flex-col lg:grid lg:grid-cols-[1fr_300px] gap-12">
      {/* Form Card */}
      <div className="bg-white lg:bg-ivory rounded-xl shadow-sm border border-stone/10 relative overflow-hidden animate-slideUpFade">
        {/* Left Accent Bar */}
        <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-terracotta"></div>
        
        {/* Progress Bar - Full width at top */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-stone/5">
          <div 
            className="h-full bg-terracotta transition-all duration-700 ease-in-out shadow-[0_0_10px_rgba(193,68,14,0.3)]"
            style={{ width: `${progress}%` }}
          ></div>
        </div>

        <div className="p-6 md:p-12 pt-10">
          <div className="flex justify-between items-center mb-10">
            <p className="text-[10px] text-stone font-bold uppercase tracking-[0.2em]">
              {t.contactForm.completion}: <span className="text-terracotta">{progress}%</span>
            </p>
          </div>

          <form onSubmit={handleSubmit}>
            {submitState === 'success' && (
              <div className="bg-[#4A7C59]/10 border border-[#4A7C59]/30 text-[#4A7C59] px-6 py-8 rounded-lg mb-10 flex flex-col items-center justify-center text-center animate-slideUpFade">
                <CheckCircle className="w-16 h-16 mb-4" />
                <h3 className="font-serif text-2xl mb-2">Message Sent!</h3>
                <p className="text-sm">Thank you for reaching out. Our team will contact you within 24 hours.</p>
              </div>
            )}

            {/* Group 1: Personal Info */}
            <div className={`form-section animate-slideUpFade ${submitState === 'success' ? 'opacity-50 pointer-events-none' : ''}`} style={{ animationDelay: '0.1s' }}>
              <SectionLabel text={t.contactForm.personalInfo} />
              <div className="flex flex-col md:grid md:grid-cols-2 gap-x-6">
                {renderFloatingInput({ name: "firstName", label: t.contactForm.firstName, required: true })}
                {renderFloatingInput({ name: "lastName", label: t.contactForm.lastName, required: true })}
              </div>
              <div className="flex flex-col md:grid md:grid-cols-2 gap-x-6">
                {renderFloatingInput({ name: "email", label: t.contactForm.email, type: "email", required: true })}
                {renderPhoneInput()}
              </div>
            </div>

            <SectionDivider />

            {/* Group 2: Property Preferences */}
            <div className="form-section animate-slideUpFade" style={{ animationDelay: '0.2s' }}>
              <SectionLabel text={t.contactForm.propPrefs} />
              
              <div className="mb-10">
                <label className="block text-xs font-bold uppercase tracking-widest text-aegean mb-4">{t.contactForm.propInterest} <span className="text-terracotta">*</span></label>
                <div className="relative">
                  <select 
                    name="interest" 
                    value={formData.interest} 
                    onChange={handleChange}
                    className="w-full bg-transparent border-b-2 border-stone/20 pb-2 pt-2 outline-none text-aegean appearance-none focus:border-terracotta transition-colors text-base"
                    required
                  >
                    <option value="" disabled></option>
                    <option value="buy">{t.contactForm.interestOptions.buy}</option>
                    <option value="rent">{t.contactForm.interestOptions.rent}</option>
                    <option value="sell">{t.contactForm.interestOptions.sell}</option>
                    <option value="invest">{t.contactForm.interestOptions.invest}</option>
                    <option value="general">{t.contactForm.interestOptions.general}</option>
                  </select>
                  <div className="absolute right-0 top-3 pointer-events-none text-aegean/50">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                  </div>
                </div>
              </div>

              <div className="mb-10">
                <label className="block text-xs font-bold uppercase tracking-widest text-aegean mb-4">{t.contactForm.locationPref}</label>
                <div className="flex flex-wrap gap-2">
                  {Object.entries(t.contactForm.locations).map(([key, label]) => (
                    <button
                      key={key}
                      type="button"
                      onClick={() => toggleArrayItem('locations', key)}
                      className={`px-4 py-2.5 rounded text-xs tracking-wider transition-all duration-200 border ${
                        formData.locations.includes(key)
                          ? 'bg-aegean text-ivory border-aegean shadow-md'
                          : 'bg-white text-aegean border-stone/20 hover:border-aegean'
                      }`}
                    >
                      {label as string}
                    </button>
                  ))}
                </div>
              </div>

              <div className="mb-10">
                <label className="block text-xs font-bold uppercase tracking-widest text-aegean mb-4">{t.contactForm.propType}</label>
                <div className="flex flex-wrap gap-2">
                  {Object.entries(t.contactForm.types).map(([key, label]) => (
                    <button
                      key={key}
                      type="button"
                      onClick={() => toggleArrayItem('types', key)}
                      className={`px-4 py-2.5 rounded text-xs tracking-wider transition-all duration-200 border ${
                        formData.types.includes(key)
                          ? 'bg-aegean text-ivory border-aegean shadow-md'
                          : 'bg-white text-aegean border-stone/20 hover:border-aegean'
                      }`}
                    >
                      {label as string}
                    </button>
                  ))}
                </div>
              </div>

              <div className="mb-10">
                <label className="block text-xs font-bold uppercase tracking-widest text-aegean mb-8">{t.contactForm.budget}</label>
                <div className="px-2">
                  <div className="relative w-full h-1.5 bg-stone/10 rounded-full mb-8">
                    <input
                      type="range"
                      min="0"
                      max="1000000"
                      step="50000"
                      value={formData.budgetMin}
                      onChange={(e) => setFormData(prev => ({ ...prev, budgetMin: Math.min(Number(e.target.value), prev.budgetMax - 50000) }))}
                      className="absolute w-full h-2 opacity-0 cursor-pointer z-30"
                      aria-label="Minimum Budget"
                    />
                    <input
                      type="range"
                      min="0"
                      max="1000000"
                      step="50000"
                      value={formData.budgetMax}
                      onChange={(e) => setFormData(prev => ({ ...prev, budgetMax: Math.max(Number(e.target.value), prev.budgetMin + 50000) }))}
                      className="absolute w-full h-2 opacity-0 cursor-pointer z-40"
                      aria-label="Maximum Budget"
                    />
                    <div 
                      className="absolute h-full bg-terracotta rounded-full z-10"
                      style={{
                        left: `${(formData.budgetMin / 1000000) * 100}%`,
                        right: `${100 - (formData.budgetMax / 1000000) * 100}%`
                      }}
                    ></div>
                    <div 
                      className="absolute w-5 h-5 bg-white border-2 border-aegean rounded-full -mt-[7px] z-20 shadow-md pointer-events-none"
                      style={{ left: `calc(${(formData.budgetMin / 1000000) * 100}% - 10px)` }}
                    ></div>
                    <div 
                      className="absolute w-5 h-5 bg-white border-2 border-aegean rounded-full -mt-[7px] z-20 shadow-md pointer-events-none"
                      style={{ left: `calc(${(formData.budgetMax / 1000000) * 100}% - 10px)` }}
                    ></div>
                  </div>
                  <p className="text-sm text-aegean font-semibold text-center">
                    {t.contactForm.selectedRange}: <span className="text-terracotta">{formatCurrency(formData.budgetMin)} — {formatCurrency(formData.budgetMax)}</span>
                  </p>
                </div>
              </div>
            </div>

            <SectionDivider />

            {/* Group 3: Contact Preferences */}
            <div className="form-section animate-slideUpFade" style={{ animationDelay: '0.3s' }}>
              <SectionLabel text={t.contactForm.contactPrefs} />
              
              <div className="mb-10">
                <label className="block text-xs font-bold uppercase tracking-widest text-aegean mb-4">{t.contactForm.contactMethod} <span className="text-terracotta">*</span></label>
                <div className="flex flex-wrap gap-3">
                  {[
                    { id: 'phone', icon: Phone, label: t.contactForm.methods.phone },
                    { id: 'whatsapp', icon: Phone, label: t.contactForm.methods.whatsapp },
                    { id: 'email', icon: Mail, label: t.contactForm.methods.email }
                  ].map(method => (
                    <button
                      key={method.id}
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, contactMethod: method.id }))}
                      className={`flex items-center gap-2 px-6 py-3 rounded text-xs tracking-wider transition-all duration-200 border min-h-[48px] ${
                        formData.contactMethod === method.id
                          ? 'bg-aegean text-ivory border-aegean shadow-md'
                          : 'bg-white text-aegean border-stone/20 hover:border-aegean'
                      }`}
                    >
                      <method.icon className="w-3.5 h-3.5" /> {method.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="mb-10">
                <label className="block text-xs font-bold uppercase tracking-widest text-aegean mb-4">{t.contactForm.bestTime} <span className="text-terracotta">*</span></label>
                <div className="relative">
                  <select 
                    name="bestTime" 
                    value={formData.bestTime} 
                    onChange={handleChange}
                    className="w-full bg-transparent border-b-2 border-stone/20 pb-2 pt-2 outline-none text-aegean appearance-none focus:border-terracotta transition-colors text-base"
                    required
                  >
                    <option value="" disabled></option>
                    <option value="morning">{t.contactForm.times.morning}</option>
                    <option value="afternoon">{t.contactForm.times.afternoon}</option>
                    <option value="evening">{t.contactForm.times.evening}</option>
                    <option value="anytime">{t.contactForm.times.anytime}</option>
                  </select>
                  <div className="absolute right-0 top-3 pointer-events-none text-aegean/50">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                  </div>
                </div>
              </div>
            </div>

            <SectionDivider />

            {/* Group 4: Your Message */}
            <div className="form-section animate-slideUpFade" style={{ animationDelay: '0.4s' }}>
              <SectionLabel text={t.contactForm.yourMessage} />
              
              <div className="relative mb-10">
                <div className={`relative border-b-2 transition-colors duration-300 ${formData.message.length > 500 ? 'border-red-500' : 'border-stone/20 focus-within:border-terracotta'}`}>
                  <textarea
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    rows={4}
                    className="w-full bg-transparent pb-2 pt-6 outline-none text-aegean peer resize-none text-base"
                    required
                  />
                  <label 
                    className={`absolute left-0 transition-all duration-300 pointer-events-none text-sm
                      ${formData.message.length > 0 ? '-translate-y-4 text-xs text-stone' : 'bottom-4 text-stone/70'} 
                      peer-focus:-translate-y-4 peer-focus:text-xs peer-focus:text-terracotta`}
                  >
                    {t.contactForm.message} <span className="text-terracotta">*</span>
                  </label>
                </div>
                <div className={`absolute right-0 -bottom-6 text-[10px] font-bold ${formData.message.length > 500 ? 'text-red-500' : 'text-stone/50'}`}>
                  {formData.message.length} / 500
                </div>
              </div>

              <div className="mb-10 flex items-start gap-4">
                <div className="relative flex items-center mt-0.5">
                  <input
                    type="checkbox"
                    name="privacy"
                    id="privacy-checkbox"
                    checked={formData.privacy}
                    onChange={handleChange}
                    className="peer appearance-none w-6 h-6 border-2 border-aegean/30 rounded checked:bg-aegean checked:border-aegean transition-all cursor-pointer"
                    required
                  />
                  <svg className="absolute w-4 h-4 left-1 top-1 text-ivory opacity-0 peer-checked:opacity-100 pointer-events-none transition-opacity" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <label className="text-sm font-medium text-aegean/80 leading-relaxed cursor-pointer select-none" htmlFor="privacy-checkbox">
                  {t.contactForm.privacy} <span className="text-terracotta">*</span>
                </label>
              </div>

              <button 
                type="submit" 
                disabled={submitState !== 'idle'}
                className={`w-full py-4 rounded overflow-hidden relative transition-all duration-300 uppercase tracking-widest text-sm font-bold flex items-center justify-center gap-3 min-h-[52px] shadow-lg
                  ${submitState === 'idle' ? 'bg-aegean text-white hover:bg-terracotta active:scale-95' : ''}
                  ${submitState === 'loading' ? 'bg-aegean/80 text-white cursor-wait' : ''}
                  ${submitState === 'success' ? 'bg-[#4A7C59] text-white' : ''}
                `}
              >
                {submitState === 'idle' && (
                  <>
                    <Send className="w-4 h-4" />
                    {t.contactForm.submit}
                  </>
                )}
                {submitState === 'loading' && (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    {t.contactForm.sending}
                  </>
                )}
                {submitState === 'success' && (
                  <>
                    <CheckCircle className="w-5 h-5" />
                    {t.contactForm.success}
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Info Sidebar - Moves below on mobile */}
      <div className="animate-slideUpFade" style={{ animationDelay: '0.5s' }}>
        <div className="lg:sticky lg:top-28 bg-white lg:bg-transparent rounded-xl p-6 lg:p-0">
          <h3 className="font-serif text-2xl text-aegean mb-8 border-b border-stone/10 pb-4 lg:border-0">{t.contactForm.subtitle}</h3>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:flex lg:flex-col gap-8 mb-10">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded shadow-sm bg-ivory flex items-center justify-center shrink-0">
                <MapPin className="w-5 h-5 text-terracotta" />
              </div>
              <div>
                <p className="text-[10px] font-bold text-stone uppercase tracking-widest mb-1">Office</p>
                <p className="text-sm text-aegean font-medium leading-relaxed">{t.contactForm.contactInfo.address}</p>
              </div>
            </div>
            
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded shadow-sm bg-ivory flex items-center justify-center shrink-0">
                <Phone className="w-5 h-5 text-terracotta" />
              </div>
              <div>
                <p className="text-[10px] font-bold text-stone uppercase tracking-widest mb-1">Phone</p>
                <p className="text-sm text-aegean font-medium">{t.contactForm.contactInfo.phone}</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded shadow-sm bg-ivory flex items-center justify-center shrink-0">
                <Mail className="w-5 h-5 text-terracotta" />
              </div>
              <div>
                <p className="text-[10px] font-bold text-stone uppercase tracking-widest mb-1">Email</p>
                <p className="text-sm text-aegean font-medium break-all">{t.contactForm.contactInfo.email}</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded shadow-sm bg-ivory flex items-center justify-center shrink-0">
                <Clock className="w-5 h-5 text-terracotta" />
              </div>
              <div>
                <p className="text-[10px] font-bold text-stone uppercase tracking-widest mb-1">Hours</p>
                <p className="text-sm text-aegean font-medium">{t.contactForm.contactInfo.hours}</p>
              </div>
            </div>
          </div>

          <div className="bg-stone/5 rounded-lg p-5 mb-8 border border-stone/10 border-dashed">
            <p className="text-xs text-aegean font-semibold text-center italic leading-relaxed">
              {t.contactForm.contactInfo.response}
            </p>
          </div>

          <div className="flex justify-center gap-6">
            <a href="https://www.facebook.com/profile.php?id=100085624124196" target="_blank" rel="noreferrer" className="w-12 h-12 rounded-full border-2 border-stone/10 flex items-center justify-center text-aegean hover:bg-aegean hover:text-ivory hover:scale-110 transition-all shadow-sm" aria-label="Facebook">
              <Facebook className="w-5 h-5" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
