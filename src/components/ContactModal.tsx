import React, { useState } from 'react';
import { STUDIO_INFO, SERVICES } from '../Data/portfolioData';
import {
  X,
  Send,
  CheckCircle2,
  Copy,
  Check,
  Phone,
  Mail,
  MapPin,
  Sparkles,
  MessageSquare,
} from 'lucide-react';

interface ContactModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ContactModal: React.FC<ContactModalProps> = ({ isOpen, onClose }) => {
  const [formData, setFormData] = useState({
    name: '',
    brand: '',
    email: '',
    phone: '',
    service: SERVICES[0]?.title || 'Product Photography',
    message: '',
  });

  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);

  if (!isOpen) return null;

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(label);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Structured WhatsApp inquiry message payload
  const handleWhatsAppSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const payload =
      `*NEW STUDIO INQUIRY - TO THE INFINITY STUDIO*\n` +
      `━━━━━━━━━━━━━━━━━━━━━\n` +
      `*Client Name:* ${formData.name.trim() || 'Prospective Client'}\n` +
      (formData.brand.trim() ? `*Brand / Company:* ${formData.brand.trim()}\n` : '') +
      `*Service Required:* ${formData.service}\n` +
      (formData.email.trim() ? `*Email:* ${formData.email.trim()}\n` : '') +
      (formData.phone.trim() ? `*Phone:* ${formData.phone.trim()}\n` : '') +
      `\n*Project Brief:* ${formData.message.trim() || 'Interested in booking a photography shoot.'}\n` +
      `━━━━━━━━━━━━━━━━━━━━━\n` +
      `_Sent via 3D Virtual Art Gallery_`;

    const whatsappUrl = `https://wa.me/919664568706?text=${encodeURIComponent(payload)}`;
    window.open(whatsappUrl, '_blank');
    setIsSubmitted(true);
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-dialog contact-modal-dialog" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="modal-header">
          <div className="modal-header-brand">
            <span className="modal-eyebrow">Direct Commission</span>
            <h2 className="modal-title">Get in Touch with Sarvesh</h2>
          </div>
          <button type="button" className="modal-close-btn" onClick={onClose} aria-label="Close">
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="modal-scroll-body">
          <div className="contact-editorial-grid">
            {/* Left Column: Studio Photo, Location & Quick Contacts */}
            <div className="contact-info-panel">
              <div className="contact-studio-cover">
                <img
                  src={STUDIO_INFO.studioShotUrl || '/images/contact-3.png'}
                  alt="Studio Setup"
                  className="studio-cover-img"
                />
                <div className="studio-location-pill">
                  <MapPin size={13} />
                  <span>{STUDIO_INFO.location}</span>
                </div>
              </div>

              <div className="contact-card-box">
                <h4 className="contact-brand-title">{STUDIO_INFO.name}</h4>
                <p className="contact-tagline-text">{STUDIO_INFO.tagline}</p>

                <div className="contact-details-rows">
                  {/* Phone */}
                  <div className="contact-row">
                    <div className="contact-row-left">
                      <Phone size={15} />
                      <a href={`tel:${STUDIO_INFO.phoneRaw}`} className="contact-link">
                        {STUDIO_INFO.phone}
                      </a>
                    </div>
                    <button
                      type="button"
                      className="copy-field-btn"
                      onClick={() => handleCopy(STUDIO_INFO.phoneRaw, 'phone')}
                      title="Copy phone"
                    >
                      {copiedField === 'phone' ? <Check size={14} /> : <Copy size={14} />}
                    </button>
                  </div>

                  {/* Email */}
                  <div className="contact-row">
                    <div className="contact-row-left">
                      <Mail size={15} />
                      <a href={`mailto:${STUDIO_INFO.email}`} className="contact-link">
                        {STUDIO_INFO.email}
                      </a>
                    </div>
                    <button
                      type="button"
                      className="copy-field-btn"
                      onClick={() => handleCopy(STUDIO_INFO.email, 'email')}
                      title="Copy email"
                    >
                      {copiedField === 'email' ? <Check size={14} /> : <Copy size={14} />}
                    </button>
                  </div>

                  {/* Instagram */}
                  <div className="contact-row">
                    <div className="contact-row-left">
                      <Sparkles size={15} />
                      <a
                        href={STUDIO_INFO.instagram}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="contact-link"
                      >
                        {STUDIO_INFO.instagramHandle}
                      </a>
                    </div>
                    <button
                      type="button"
                      className="copy-field-btn"
                      onClick={() => handleCopy(STUDIO_INFO.instagram, 'instagram')}
                      title="Copy Instagram link"
                    >
                      {copiedField === 'instagram' ? <Check size={14} /> : <Copy size={14} />}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Interactive Shoot Commission Form */}
            <div className="contact-form-panel">
              {isSubmitted ? (
                <div className="submission-success-card">
                  <CheckCircle2 size={48} className="success-icon" />
                  <h3>Inquiry Dispatched!</h3>
                  <p>
                    Your project details have been formulated into a direct WhatsApp payload to
                    Sarvesh Chaudhari. We look forward to creating exceptional imagery for your
                    brand.
                  </p>
                  <button
                    type="button"
                    className="editorial-btn primary"
                    onClick={() => setIsSubmitted(false)}
                  >
                    Send Another Inquiry
                  </button>
                </div>
              ) : (
                <form onSubmit={handleWhatsAppSubmit} className="inquiry-form">
                  <div className="form-intro">
                    <h3 className="form-heading">Initiate Project Inquiry</h3>
                    <p className="form-subheading">
                      Fill out your shoot parameters below to start an instant discussion.
                    </p>
                  </div>

                  <div className="form-grid-two">
                    <div className="form-group">
                      <label htmlFor="name">Your Name *</label>
                      <input
                        type="text"
                        id="name"
                        name="name"
                        required
                        placeholder="e.g. Elena Rostova"
                        value={formData.name}
                        onChange={handleChange}
                        className="form-input"
                      />
                    </div>

                    <div className="form-group">
                      <label htmlFor="brand">Brand / Organization</label>
                      <input
                        type="text"
                        id="brand"
                        name="brand"
                        placeholder="e.g. Chanel / Aesop"
                        value={formData.brand}
                        onChange={handleChange}
                        className="form-input"
                      />
                    </div>
                  </div>

                  <div className="form-grid-two">
                    <div className="form-group">
                      <label htmlFor="email">Email Address</label>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        placeholder="contact@brand.com"
                        value={formData.email}
                        onChange={handleChange}
                        className="form-input"
                      />
                    </div>

                    <div className="form-group">
                      <label htmlFor="phone">Phone / WhatsApp</label>
                      <input
                        type="tel"
                        id="phone"
                        name="phone"
                        placeholder="+91 98765 43210"
                        value={formData.phone}
                        onChange={handleChange}
                        className="form-input"
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label htmlFor="service">Desired Service *</label>
                    <select
                      id="service"
                      name="service"
                      value={formData.service}
                      onChange={handleChange}
                      className="form-select"
                    >
                      {SERVICES.map((s) => (
                        <option key={s.id} value={s.title}>
                          {s.title}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label htmlFor="message">Project Brief & Details *</label>
                    <textarea
                      id="message"
                      name="message"
                      required
                      rows={4}
                      placeholder="Share your timeline, product quantity, moodboard references, and deliverables needed..."
                      value={formData.message}
                      onChange={handleChange}
                      className="form-textarea"
                    />
                  </div>

                  <button type="submit" className="editorial-btn primary full-width">
                    <MessageSquare size={16} />
                    <span>Send Inquiry to Studio (WhatsApp)</span>
                    <Send size={15} />
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
