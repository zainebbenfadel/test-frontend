// src/pages/DestinationsPage.jsx
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

const allAlgerianWilayas = [
  { name: 'Adrar', stays: '120', emoji: '🏜️', img: './photos/adrar.jpg' },
  { name: 'Chlef', stays: '85', emoji: '🌾', img: './photos/chlef.jpg' },
  { name: 'Laghouat', stays: '60', emoji: '🏜️', img: './photos/laghouat.jpg' },
  { name: 'Oum El Bouaghi', stays: '45', emoji: '🏞️', img: './photos/Oum El Bouaghi.jpg' },
  { name: 'Batna', stays: '110', emoji: '🏛️', img: './photos/Batna.jpg' },
  { name: 'Béjaïa', stays: '210', emoji: '🏖️', img: './photos/Béjaïa.jpg' },
  { name: 'Biskra', stays: '95', emoji: '🌴', img: './photos/Biskra.jpg' },
  { name: 'Béchar', stays: '55', emoji: '🏜️', img: './photos/Bechar.jpg' },
  { name: 'Blida', stays: '130', emoji: '🌳', img: './photos/Blida.jpg' },
  { name: 'Bouira', stays: '70', emoji: '⛰️', img: './photos/Bouira.jpg' },
  { name: 'Tamanrasset', stays: '80', emoji: '🏔️', img: './photos/Tamanrasset.jpg' },
  { name: 'Tébessa', stays: '50', emoji: '🏛️', img: './photos/Tebessa.jpg' },
  { name: 'Tlemcen', stays: '140', emoji: '🕌', img: './photos/Tlemcen.jpg' },
  { name: 'Tiaret', stays: '65', emoji: '🏞️', img: './photos/Tiaret.jpg' },
  { name: 'Tizi Ouzou', stays: '160', emoji: '⛰️', img: './photos/Tizi Ouzou.jpg' },
  { name: 'Alger', stays: '240', emoji: '🌆', img: './photos/w1.jpg' },
  { name: 'Djelfa', stays: '55', emoji: '🏜️', img: './photos/Djelfa.jpg' },
  { name: 'Jijel', stays: '95', emoji: '🏖️', img: './photos/Jijel.jpg' },
  { name: 'Sétif', stays: '125', emoji: '🏔️', img: './photos/setif.jpg' },
  { name: 'Saïda', stays: '45', emoji: '🌾', img: './photos/saida.jpg' },
  { name: 'Skikda', stays: '85', emoji: '🏖️', img: './photos/Skikda.jpg' },
  { name: 'Sidi Bel Abbès', stays: '70', emoji: '🌾', img: './photos/Sidi Bel Abbes.jpg' },
  { name: 'Annaba', stays: '110', emoji: '🏖️', img: './photos/Annaba.jpg' },
  { name: 'Guelma', stays: '50', emoji: '🌳', img: './photos/Guelma.jpg' },
  { name: 'Constantine', stays: '135', emoji: '🏛️', img: './photos/w4.jpg' },
  { name: 'Médéa', stays: '75', emoji: '⛰️', img: './photos/Media.jpg' },
  { name: 'Mostaganem', stays: '90', emoji: '🏖️', img: './photos/Mostaganem.jpg' },
  { name: "M'Sila", stays: '50', emoji: '🏜️', img: "./photos/M'sila.jpg" },
  { name: 'Mascara', stays: '60', emoji: '🌾', img: './photos/Mascara.jpg' },
  { name: 'Ouargla', stays: '55', emoji: '🏜️', img: './photos/Ouargla.jpg' },
  { name: 'Oran', stays: '200', emoji: '🗼', img: './photos/Oran.jpg' },
  { name: 'El Bayadh', stays: '35', emoji: '🏜️', img: './photos/El bayadh.jpg' },
  { name: 'Illizi', stays: '30', emoji: '🏔️', img: './photos/Illizi.jpg' },
  { name: 'Bordj Bou Arréridj', stays: '65', emoji: '🏞️', img: './photos/Bordj Bou Arréridj.jpg' },
  { name: 'Boumerdès', stays: '105', emoji: '🏖️', img: './photos/boumerdès.jpg' },
  { name: 'El Tarf', stays: '70', emoji: '🌳', img: './photos/El Tarf.jpg' },
  { name: 'Tindouf', stays: '25', emoji: '🏜️', img: './photos/Tindouf.jpg' },
  { name: 'Tissemsilt', stays: '40', emoji: '⛰️', img: './photos/Tissemsilt.jpg' },
  { name: 'El Oued', stays: '45', emoji: '🏜️', img: './photos/El Oued.jpg' },
  { name: 'Khenchela', stays: '50', emoji: '🏔️', img: './photos/Khenchela.jpg' },
  { name: 'Souk Ahras', stays: '45', emoji: '🏛️', img: './photos/Souk Ahras.jpg' },
  { name: 'Tipaza', stays: '100', emoji: '🏛️', img: './photos/Tipaza.jpg' },
  { name: 'Mila', stays: '55', emoji: '🌾', img: './photos/Mila.jpg' },
  { name: 'Aïn Defla', stays: '60', emoji: '🌳', img: './photos/Aïn Defla.jpg' },
  { name: 'Naâma', stays: '30', emoji: '🏜️', img: './photos/Naama.jpg' },
  { name: 'Aïn Témouchent', stays: '55', emoji: '🏖️', img: './photos/Ain temouchent.jpg' },
  { name: 'Ghardaïa', stays: '80', emoji: '🏛️', img: './photos/Gerdaya.jpg' },
  { name: 'Relizane', stays: '60', emoji: '🌾', img: './photos/Relizane.jpg' },
];

const featuredDestinations = [
  { name: 'Alger', stays: '1,240', emoji: '🌴', img: './photos/w1.jpg' },
  { name: 'Oran', stays: '870', emoji: '🗼', img: './photos/Oran.jpg' },
  { name: 'Jijel', stays: '430', emoji: '🏔️', img: './photos/Jijel.jpg' },
  { name: 'Constantine', stays: '650', emoji: '🌸', img: './photos/w4.jpg' },
  { name: 'Béjaïa', stays: '2,100', emoji: '🗽', img: './photos/Béjaïa.jpg' },
  { name: 'Annaba', stays: '380', emoji: '🍋', img: './photos/Annaba.jpg' },
  { name: 'Ghardaïa', stays: '1,560', emoji: '🏙️', img: './photos/Gerdaya.jpg' },
  { name: 'Tipaza', stays: '490', emoji: '🌊', img: './photos/Tipaza.jpg' },
];

function DestinationsPage({ showToast }) {
  const navigate = useNavigate();
  const [showAllWilayas, setShowAllWilayas] = useState(false);
  const [displayedWilayas, setDisplayedWilayas] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredWilayas, setFilteredWilayas] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const searchInputRef = useRef(null);
  const dropdownRef = useRef(null);
  const searchContainerRef = useRef(null);

  useEffect(() => {
    setDisplayedWilayas(allAlgerianWilayas.slice(0, 6));
    setFilteredWilayas(allAlgerianWilayas);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry, i) => {
        if (entry.isIntersecting) {
          setTimeout(() => entry.target.classList.add('visible'), i * 80);
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1 });
    document.querySelectorAll('.fade-up').forEach(el => observer.observe(el));
    return () => observer.disconnect();
  }, [displayedWilayas]);

  const handleSearchChange = (value) => {
    setSearchTerm(value);
    setShowDropdown(true);
    setHighlightedIndex(-1);

    if (value.trim() === '') {
      setIsSearching(false);
      setFilteredWilayas(allAlgerianWilayas);
      setDisplayedWilayas(showAllWilayas ? allAlgerianWilayas : allAlgerianWilayas.slice(0, 6));
    } else {
      setIsSearching(true);
      const filtered = allAlgerianWilayas.filter(w =>
        w.name.toLowerCase().includes(value.toLowerCase())
      );
      setFilteredWilayas(filtered);
    }
  };

  const selectWilaya = (wilayaName) => {
    setSearchTerm('');
    setShowDropdown(false);
    setIsSearching(false);
    setDisplayedWilayas(showAllWilayas ? allAlgerianWilayas : allAlgerianWilayas.slice(0, 6));
    localStorage.setItem('selectedWilaya', JSON.stringify({ name: wilayaName, fromDestinationsPage: true }));
    localStorage.setItem('searchParams', JSON.stringify({ destination: wilayaName, checkIn: '', checkOut: '', guests: 2, days: 7 }));
    showToast(`📍 Showing houses in ${wilayaName}...`);
    navigate('/stays');
  };

  const handleKeyDown = (e) => {
    if (!showDropdown || filteredWilayas.length === 0) return;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlightedIndex(prev => prev < filteredWilayas.length - 1 ? prev + 1 : prev);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlightedIndex(prev => (prev > 0 ? prev - 1 : -1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (highlightedIndex >= 0 && filteredWilayas[highlightedIndex]) {
        selectWilaya(filteredWilayas[highlightedIndex].name);
      }
    } else if (e.key === 'Escape') {
      setShowDropdown(false);
    }
  };

  const handleShowMore = () => {
    setShowAllWilayas(true);
    if (searchTerm.trim() === '') setDisplayedWilayas(allAlgerianWilayas);
    showToast(`✨ Showing all ${allAlgerianWilayas.length} Algerian wilayas`);
  };

  const handleShowLess = () => {
    setShowAllWilayas(false);
    if (searchTerm.trim() === '') setDisplayedWilayas(allAlgerianWilayas.slice(0, 6));
    showToast('✨ Showing featured wilayas');
  };

  const handleWilayaClick = (wilayaName) => {
    localStorage.setItem('selectedWilaya', JSON.stringify({ name: wilayaName, fromDestinationsPage: true }));
    localStorage.setItem('searchParams', JSON.stringify({ destination: wilayaName, checkIn: '', checkOut: '', guests: 2, days: 7 }));
    showToast(`📍 Showing houses in ${wilayaName}...`);
    navigate('/stays');
  };

  const handleImageError = (e) => {
    const wilayaName = e.target.alt;
    const canvas = document.createElement('canvas');
    canvas.width = 400;
    canvas.height = 300;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#2c1810';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#c9a84c';
    ctx.font = 'bold 24px "DM Sans", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(wilayaName || 'Algeria', canvas.width / 2, canvas.height / 2);
    ctx.font = '16px "DM Sans", sans-serif';
    ctx.fillStyle = '#ffffff';
    ctx.fillText('✨ Coming Soon', canvas.width / 2, canvas.height / 2 + 40);
    e.target.src = canvas.toDataURL();
  };

  const dropdownWilayas = searchTerm ? filteredWilayas : allAlgerianWilayas;

  return (
    <>
      <style>{`
        .dest-page-hero {
          background: var(--navy, #2c1810);
          padding-top: 140px;
          padding-bottom: 80px;
          text-align: center;
          color: #fff;
        }
        .dest-search-wrap {
          max-width: 560px;
          margin: 40px auto 0;
          padding: 0 20px;
          position: relative;
          z-index: 100;
        }
        .dest-search-container {
          position: relative;
          width: 100%;
        }
        .dest-search-box {
          display: flex;
          align-items: center;
          background: white;
          border-radius: 60px;
          box-shadow: 0 8px 20px rgba(0,0,0,0.18);
          border: 1.5px solid rgba(201,168,76,0.4);
          overflow: visible;
        }
        .dest-search-icon {
          padding: 0 14px 0 18px;
          display: flex;
          align-items: center;
          flex-shrink: 0;
        }
        .dest-search-input {
          flex: 1;
          border: none;
          outline: none;
          background: transparent;
          padding: 16px 0;
          font-size: 15px;
          font-family: 'DM Sans', sans-serif;
          font-weight: 500;
          color: #2c1810;
        }
        .dest-search-input::placeholder { color: #aaa; }
        .dest-search-clear {
          padding: 0 18px;
          display: flex;
          align-items: center;
          cursor: pointer;
          color: #c9a84c;
          font-size: 18px;
          flex-shrink: 0;
        }
        .dest-dropdown {
          position: absolute;
          top: calc(100% + 8px);
          left: 0;
          right: 0;
          background: white;
          border-radius: 20px;
          box-shadow: 0 10px 30px rgba(0,0,0,0.15);
          max-height: 380px;
          overflow-y: auto;
          z-index: 9999;
          border: 1px solid #e0e0e0;
        }
        .dest-dropdown-header {
          padding: 10px 20px;
          background: #f9f6f0;
          border-bottom: 1px solid #e0e0e0;
          font-size: 12px;
          color: #666;
          font-weight: 500;
          border-radius: 20px 20px 0 0;
          position: sticky;
          top: 0;
        }
        .dest-dropdown-item {
          padding: 11px 20px;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 12px;
          transition: background 0.15s;
          border-bottom: 1px solid #f5f5f5;
        }
        .dest-dropdown-item:last-child { border-bottom: none; }
        .dest-dropdown-item:hover, .dest-dropdown-item.highlighted {
          background: #f5f0e8;
        }

        /* Featured grid */
        .dest-featured-section {
          background: var(--cream, #faf8f3);
          padding: 60px 48px;
        }
        .dest-featured-grid {
          display: grid;
          max-width: 1400px;
          margin: 0 auto;
          gap: 16px;
          grid-template-columns: repeat(4, 1fr);
          grid-template-rows: 280px 140px 140px;
        }
        .dest-card {
          border-radius: 16px;
          overflow: hidden;
          position: relative;
          cursor: pointer;
          box-shadow: 0 4px 16px rgba(0,0,0,0.10);
          transition: transform 0.25s, box-shadow 0.25s;
        }
        .dest-card:hover { transform: translateY(-4px); box-shadow: 0 12px 32px rgba(0,0,0,0.18); }
        .dest-card-large {
          grid-column: span 2;
          grid-row: span 3;
        }
        .dest-card img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
          transition: transform 0.4s;
        }
        .dest-card:hover img { transform: scale(1.04); }
        .dest-overlay {
          position: absolute;
          bottom: 0; left: 0; right: 0;
          background: linear-gradient(to top, rgba(44,24,16,0.85) 0%, transparent 100%);
          padding: 28px 20px 20px;
        }
        .dest-name {
          color: #fff;
          font-size: 20px;
          font-weight: 700;
          font-family: 'DM Sans', sans-serif;
          margin-bottom: 4px;
        }
        .dest-card-large .dest-name { font-size: 28px; }
        .dest-count {
          color: rgba(255,255,255,0.75);
          font-size: 13px;
          font-family: 'DM Sans', sans-serif;
        }

        /* Wilayas grid */
        .dest-wilayas-section {
          background: var(--cream, #faf8f3);
          padding: 0 48px 80px;
        }
        .dest-wilayas-inner { max-width: 1400px; margin: 0 auto; }
        .dest-wilayas-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-end;
          margin-bottom: 40px;
        }
        .dest-wilayas-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 20px;
        }
        .dest-wilaya-card {
          border-radius: 14px;
          overflow: hidden;
          height: 200px;
          position: relative;
          cursor: pointer;
          box-shadow: 0 3px 12px rgba(0,0,0,0.09);
          transition: transform 0.25s, box-shadow 0.25s;
        }
        .dest-wilaya-card:hover { transform: translateY(-3px); box-shadow: 0 10px 28px rgba(0,0,0,0.16); }
        .dest-wilaya-card img {
          width: 100%; height: 100%; object-fit: cover;
          display: block; transition: transform 0.4s;
        }
        .dest-wilaya-card:hover img { transform: scale(1.04); }
        .toggle-btn {
          background: transparent;
          border: 2px solid #c9a84c;
          color: #c9a84c;
          padding: 10px 24px;
          border-radius: 40px;
          cursor: pointer;
          font-size: 14px;
          font-weight: 600;
          font-family: 'DM Sans', sans-serif;
          transition: all 0.2s;
          white-space: nowrap;
        }
        .toggle-btn:hover { background: #c9a84c; color: white; }
        .view-all-btn {
          display: block;
          margin: 40px auto 0;
          background: #c9a84c;
          color: white;
          padding: 13px 36px;
          border-radius: 40px;
          border: none;
          font-size: 15px;
          font-weight: 600;
          font-family: 'DM Sans', sans-serif;
          cursor: pointer;
          transition: background 0.2s;
        }
        .view-all-btn:hover { background: #b8963e; }

        /* Animation */
        .fade-up {
          opacity: 0;
          transform: translateY(20px);
          transition: opacity 0.6s cubic-bezier(0.2, 0.9, 0.4, 1.1), transform 0.6s cubic-bezier(0.2, 0.9, 0.4, 1.1);
        }
        .fade-up.visible {
          opacity: 1;
          transform: translateY(0);
        }

        @media (max-width: 900px) {
          .dest-featured-grid {
            grid-template-columns: 1fr 1fr;
            grid-template-rows: auto;
          }
          .dest-card-large { grid-column: span 2; grid-row: span 1; height: 260px; }
          .dest-wilayas-grid { grid-template-columns: repeat(2, 1fr); }
          .dest-featured-section, .dest-wilayas-section { padding-left: 20px; padding-right: 20px; }
        }
        @media (max-width: 600px) {
          .dest-featured-grid { grid-template-columns: 1fr; }
          .dest-card-large { grid-column: span 1; grid-row: span 1; height: 220px; }
          .dest-wilayas-grid { grid-template-columns: 1fr; }
          .dest-wilayas-header { flex-direction: column; align-items: flex-start; gap: 16px; }
        }
      `}</style>

      {/* Hero */}
      <div className="dest-page-hero">
        <div className="section-eyebrow" style={{ justifyContent: 'center', color: 'var(--gold, #c9a84c)' }}>
          Explore Algeria
        </div>
        <h1 className="section-title" style={{ color: '#fff', textAlign: 'center' }}>
          Top <em>Destinations</em>
        </h1>
        <p className="section-sub" style={{ color: 'rgba(255,255,255,0.55)', textAlign: 'center', maxWidth: '500px', margin: '12px auto 0' }}>
          From sun-drenched coastlines to storied city streets — every corner of Algeria awaits.
        </p>

        {/* Search */}
        <div className="dest-search-wrap">
          <div className="dest-search-container" ref={searchContainerRef}>
            <div className="dest-search-box">
              <div className="dest-search-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#c9a84c" strokeWidth="2.5">
                  <circle cx="11" cy="11" r="8"/>
                  <path d="m21 21-4.35-4.35"/>
                </svg>
              </div>
              <input
                ref={searchInputRef}
                className="dest-search-input"
                type="text"
                placeholder="Search for a wilaya… (e.g., Alger, Oran, Béjaïa)"
                value={searchTerm}
                onChange={e => handleSearchChange(e.target.value)}
                onFocus={() => {
                  if (searchTerm) setShowDropdown(true);
                }}
                onKeyDown={handleKeyDown}
              />
              {searchTerm && (
                <div
                  className="dest-search-clear"
                  onClick={() => {
                    setSearchTerm('');
                    setIsSearching(false);
                    setShowDropdown(false);
                    setFilteredWilayas(allAlgerianWilayas);
                    setDisplayedWilayas(showAllWilayas ? allAlgerianWilayas : allAlgerianWilayas.slice(0, 6));
                  }}
                >
                  <span>✕</span>
                </div>
              )}
            </div>

            {showDropdown && (
              <div className="dest-dropdown" ref={dropdownRef}>
                <div className="dest-dropdown-header">📍 Select a wilaya to explore</div>
                {!searchTerm && (
                  <div
                    className="dest-dropdown-item"
                    onClick={() => setShowDropdown(false)}
                  >
                    <span style={{ fontSize: 20 }}>✨</span>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 600, color: '#c9a84c' }}>Type to search for a wilaya</div>
                      <div style={{ fontSize: 12, color: '#999' }}>{allAlgerianWilayas.length} provinces available</div>
                    </div>
                  </div>
                )}
                {dropdownWilayas.map((wilaya, index) => (
                  <div
                    key={wilaya.name}
                    className={`dest-dropdown-item${highlightedIndex === index ? ' highlighted' : ''}`}
                    onClick={() => selectWilaya(wilaya.name)}
                    onMouseEnter={() => setHighlightedIndex(index)}
                    onMouseLeave={() => setHighlightedIndex(-1)}
                  >
                    <span style={{ fontSize: 22 }}>{wilaya.emoji}</span>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 600, color: '#2c1810' }}>{wilaya.name}</div>
                      <div style={{ fontSize: 12, color: '#999' }}>{wilaya.stays}+ stays available</div>
                    </div>
                    <span style={{ color: '#c9a84c', fontSize: 14 }}>→</span>
                  </div>
                ))}
                {dropdownWilayas.length === 0 && searchTerm && (
                  <div style={{ padding: '20px', textAlign: 'center', color: '#999' }}>
                    No wilayas found matching "{searchTerm}"
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Featured Grid */}
      {!isSearching && (
        <section className="dest-featured-section">
          <div className="dest-featured-grid">
            {featuredDestinations.map((dest, index) => (
              <div
                key={dest.name}
                className={`dest-card fade-up${index === 0 ? ' dest-card-large' : ''}`}
                onClick={() => handleWilayaClick(dest.name)}
              >
                <img src={dest.img} alt={dest.name} onError={handleImageError} />
                <div className="dest-overlay">
                  <div className="dest-name">{dest.name}</div>
                  <div className="dest-count">{dest.stays} stays available</div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* All Wilayas */}
      <div className="dest-wilayas-section">
        <div className="dest-wilayas-inner">
          <div className="dest-wilayas-header">
            <div>
              <div className="section-eyebrow">Discover Algeria</div>
              <h2 className="section-title"><em>Wilayas</em></h2>
              <p className="section-sub">Explore all {allAlgerianWilayas.length} provinces of Algeria</p>
            </div>
            {!isSearching && (
              <button className="toggle-btn" onClick={showAllWilayas ? handleShowLess : handleShowMore}>
                {showAllWilayas ? 'Show Less ▲' : `Show All ${allAlgerianWilayas.length} Wilayas ▼`}
              </button>
            )}
          </div>

          <div className="dest-wilayas-grid">
            {displayedWilayas.map((wilaya) => (
              <div
                key={wilaya.name}
                className="dest-wilaya-card fade-up"
                onClick={() => handleWilayaClick(wilaya.name)}
              >
                <img src={wilaya.img} alt={wilaya.name} onError={handleImageError} />
                <div className="dest-overlay">
                  <div className="dest-name">
                    <span style={{ marginRight: 6 }}>{wilaya.emoji}</span>{wilaya.name}
                  </div>
                  <div className="dest-count">{wilaya.stays}+ stays available</div>
                </div>
              </div>
            ))}
          </div>

          {!showAllWilayas && !isSearching && (
            <button className="view-all-btn" onClick={handleShowMore}>
              View All {allAlgerianWilayas.length} Wilayas →
            </button>
          )}
        </div>
      </div>
    </>
  );
}

export default DestinationsPage;