import React from 'react';
import { STUDIO_INFO } from './Data/portfolioData';
import { AboutModal } from './components/AboutModal';
import { ContactModal } from './components/ContactModal';
import type { GalleryItem } from './types';
import {
  X,
  Compass,
  Eye,
  Maximize2,
  Sparkles,
  ArrowRight,
  Info,
  Send,
} from 'lucide-react';

interface OverlayProps {
  isLocked: boolean;
  onEnterFPS: () => void;
  selectedArtwork: GalleryItem | null;
  onCloseInspect: () => void;
  hoveredArtwork: GalleryItem | null;
  onJumpToArtwork: (id: string) => void;
  artworks: GalleryItem[];
}

export const GalleryOverlay: React.FC<OverlayProps> = ({
  isLocked,
  onEnterFPS,
  selectedArtwork,
  onCloseInspect,
  hoveredArtwork,
  onJumpToArtwork,
  artworks,
}) => {
  const [showCatalog, setShowCatalog] = React.useState(false);
  const [showAbout, setShowAbout] = React.useState(false);
  const [showContact, setShowContact] = React.useState(false);

  return (
    <div className="gallery-ui-container">
      {/* 1. Top Navigation Bar */}
      <header className="gallery-header">
        <div className="brand-group">
          <span className="brand-badge">3D Virtual Space</span>
          <h1 className="brand-title">{STUDIO_INFO.shortName}</h1>
          <p className="brand-subtitle">{STUDIO_INFO.role}</p>
        </div>

        <div className="header-actions">
          <button
            type="button"
            className="action-pill-btn"
            onClick={() => setShowCatalog(!showCatalog)}
          >
            <Compass size={15} />
            <span>Artwork Index ({artworks.length})</span>
          </button>

          <button
            type="button"
            className="action-pill-btn"
            onClick={() => setShowAbout(true)}
          >
            <Info size={15} />
            <span>About Studio</span>
          </button>

          <button
            type="button"
            className="action-pill-btn primary"
            onClick={() => setShowContact(true)}
          >
            <Send size={14} />
            <span>Commission Shoot</span>
          </button>
        </div>
      </header>

      {/* 2. FPS Center Crosshair (visible when roaming) */}
      {!selectedArtwork && (
        <div className={`crosshair-reticle ${hoveredArtwork ? 'active' : ''}`}>
          <div className="reticle-dot" />
          {hoveredArtwork && (
            <div className="reticle-hover-tooltip">
              <span className="tooltip-cat">{hoveredArtwork.categoryLabel}</span>
              <span className="tooltip-title">{hoveredArtwork.title}</span>
              <span className="tooltip-hint">Click gold-framed photo to inspect</span>
            </div>
          )}
        </div>
      )}

      {/* 3. Bottom Controls HUD Prompt */}
      {!isLocked && !selectedArtwork && (
        <div className="fps-guide-bar">
          <div className="guide-content">
            <div className="keys-preview">
              <span className="key-tag">W</span>
              <span className="key-tag">A</span>
              <span className="key-tag">S</span>
              <span className="key-tag">D</span>
              <span className="key-label">to Walk</span>
              <span className="divider">•</span>
              <span className="key-tag">Mouse</span>
              <span className="key-label">to Look</span>
              <span className="divider">•</span>
              <span className="key-tag">Click</span>
              <span className="key-label">Photo to Inspect</span>
            </div>
            <button
              type="button"
              className="enter-gallery-btn"
              onClick={onEnterFPS}
            >
              <Eye size={17} />
              <span>Click to Enter Roam Mode</span>
            </button>
          </div>
        </div>
      )}

      {/* 4. Active Artwork Inspection Modal Drawer */}
      {selectedArtwork && (
        <aside className="inspect-drawer animate-slide-left">
          <div className="inspect-header">
            <span className="category-pill">{selectedArtwork.categoryLabel}</span>
            <button
              type="button"
              className="close-drawer-btn"
              onClick={onCloseInspect}
              aria-label="Close Inspection"
            >
              <X size={20} />
            </button>
          </div>

          <div className="inspect-body">
            <h2 className="inspect-title">{selectedArtwork.title}</h2>
            {selectedArtwork.client && (
              <div className="client-meta">
                <span className="meta-label">Client / Editorial</span>
                <span className="meta-value">{selectedArtwork.client}</span>
              </div>
            )}

            <div className="inspect-image-preview">
              <img
                src={selectedArtwork.imageSrc}
                alt={selectedArtwork.title}
                loading="eager"
              />
              <a
                href={selectedArtwork.imageSrc}
                target="_blank"
                rel="noopener noreferrer"
                className="fullres-link"
              >
                <Maximize2 size={14} />
                <span>Open High-Res File</span>
              </a>
            </div>

            <p className="inspect-description">
              {selectedArtwork.description ||
                'Precision studio lighting capturing tactile texture, glass refraction, and curated props in a controlled studio setting.'}
            </p>

            <div className="inspect-footer">
              <div className="studio-signature">
                <Sparkles size={16} />
                <span>Shot in Mumbai by {STUDIO_INFO.founder}</span>
              </div>
              <button
                type="button"
                className="resume-walking-btn"
                onClick={onCloseInspect}
              >
                <span>Continue Roaming Gallery</span>
                <ArrowRight size={16} />
              </button>
            </div>
          </div>
        </aside>
      )}

      {/* 5. Artwork Directory Drawer (Click to jump camera) */}
      {showCatalog && (
        <div className="modal-backdrop" onClick={() => setShowCatalog(false)}>
          <div
            className="catalog-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="catalog-header">
              <div>
                <h2>Gallery Directory</h2>
                <p>Select any frame to teleport directly in front of it</p>
              </div>
              <button
                type="button"
                className="close-drawer-btn"
                onClick={() => setShowCatalog(false)}
              >
                <X size={20} />
              </button>
            </div>

            <div className="catalog-grid">
              {artworks.map((item, idx) => (
                <div
                  key={item.id}
                  className="catalog-card"
                  onClick={() => {
                    onJumpToArtwork(item.id);
                    setShowCatalog(false);
                  }}
                >
                  <div className="card-thumb-wrap">
                    <img
                      src={item.imageSrc}
                      alt={item.title}
                      className="card-thumb-img"
                      loading="lazy"
                    />
                    <span className="card-index">#{idx + 1}</span>
                  </div>
                  <div className="card-info">
                    <span className="card-cat">{item.categoryLabel}</span>
                    <h3 className="card-title">{item.title}</h3>
                    {item.client && <span className="card-client">{item.client}</span>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 6. Reusable About Studio Editorial Modal */}
      <AboutModal
        isOpen={showAbout}
        onClose={() => setShowAbout(false)}
        onOpenContact={() => setShowContact(true)}
      />

      {/* 7. Reusable Direct Shoot Commission Modal */}
      <ContactModal
        isOpen={showContact}
        onClose={() => setShowContact(false)}
      />
    </div>
  );
};
