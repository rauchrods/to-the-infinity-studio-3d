import React from 'react';
import { STUDIO_INFO, SERVICES } from '../Data/portfolioData';
import { X, Check, ArrowRight, Phone, Mail, MapPin, Award } from 'lucide-react';

interface AboutModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenContact: () => void;
}

export const AboutModal: React.FC<AboutModalProps> = ({
  isOpen,
  onClose,
  onOpenContact,
}) => {
  if (!isOpen) return null;

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-dialog about-modal-dialog" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="modal-header">
          <div className="modal-header-brand">
            <span className="modal-eyebrow">The Studio</span>
            <h2 className="modal-title">About {STUDIO_INFO.founder}</h2>
          </div>
          <button type="button" className="modal-close-btn" onClick={onClose} aria-label="Close">
            <X size={20} />
          </button>
        </div>

        {/* Content Body */}
        <div className="modal-scroll-body">
          <div className="about-editorial-grid">
            {/* Left Column: Authentic Studio Portrait */}
            <div className="about-portrait-card">
              <div className="portrait-image-wrapper">
                <img
                  src={STUDIO_INFO.portraitUrl || '/images/about-3.png'}
                  alt={STUDIO_INFO.founder}
                  className="portrait-img"
                />
                <div className="portrait-badge">
                  <Award size={14} />
                  <span>Commercial & Editorial</span>
                </div>
              </div>
              <div className="portrait-meta">
                <span className="founder-fullname">{STUDIO_INFO.founder}</span>
                <span className="founder-location">
                  <MapPin size={13} />
                  {STUDIO_INFO.location}
                </span>
              </div>
              <div className="studio-tagline-quote">
                "{STUDIO_INFO.tagline}"
              </div>
            </div>

            {/* Right Column: Bio Narrative & Curated Services */}
            <div className="about-narrative-card">
              <div className="narrative-section">
                <h3 className="section-title">Defining Brands Through Precision</h3>
                <p className="narrative-paragraph">{STUDIO_INFO.bio}</p>
              </div>

              <div className="narrative-section">
                <h4 className="section-subtitle">Studio Expertise</h4>
                <p className="narrative-paragraph">{STUDIO_INFO.expertise}</p>
              </div>

              <div className="narrative-section">
                <h4 className="section-subtitle">Curated Services & Deliverables</h4>
                <div className="services-spec-list">
                  {SERVICES.map((srv) => (
                    <div key={srv.id} className="service-spec-item">
                      <div className="service-title-row">
                        <Check size={16} className="service-check-icon" />
                        <span className="service-name">{srv.title}</span>
                      </div>
                      <p className="service-desc">{srv.description}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Call to action */}
              <div className="about-cta-footer">
                <button
                  type="button"
                  className="editorial-btn primary"
                  onClick={() => {
                    onClose();
                    onOpenContact();
                  }}
                >
                  <span>Book Studio Shoot / Commission</span>
                  <ArrowRight size={16} />
                </button>
                <div className="quick-links-row">
                  <a href={`tel:${STUDIO_INFO.phoneRaw}`} className="quick-link">
                    <Phone size={14} />
                    <span>{STUDIO_INFO.phone}</span>
                  </a>
                  <a href={`mailto:${STUDIO_INFO.email}`} className="quick-link">
                    <Mail size={14} />
                    <span>{STUDIO_INFO.email}</span>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
