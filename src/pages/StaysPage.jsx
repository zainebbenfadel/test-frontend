// src/pages/StaysPage.jsx
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchProperties } from '../services/propertiesApi';
import { useAuth } from '../context/AuthContext';
import { addToWishlist, removeFromWishlist, getWishlistIds } from '../services/wishlistApi';

const ALL_WILAYAS = [
  { name: 'Adrar', emoji: '🏜️' },
  { name: 'Chlef', emoji: '🌾' },
  { name: 'Laghouat', emoji: '🏜️' },
  { name: 'Oum El Bouaghi', emoji: '🏞️' },
  { name: 'Batna', emoji: '🏛️' },
  { name: 'Béjaïa', emoji: '🏖️' },
  { name: 'Biskra', emoji: '🌴' },
  { name: 'Béchar', emoji: '🏜️' },
  { name: 'Blida', emoji: '🌳' },
  { name: 'Bouira', emoji: '⛰️' },
  { name: 'Tamanrasset', emoji: '🏔️' },
  { name: 'Tébessa', emoji: '🏛️' },
  { name: 'Tlemcen', emoji: '🕌' },
  { name: 'Tiaret', emoji: '🏞️' },
  { name: 'Tizi Ouzou', emoji: '⛰️' },
  { name: 'Alger', emoji: '🌆' },
  { name: 'Djelfa', emoji: '🏜️' },
  { name: 'Jijel', emoji: '🏖️' },
  { name: 'Sétif', emoji: '🏔️' },
  { name: 'Saïda', emoji: '🌾' },
  { name: 'Skikda', emoji: '🏖️' },
  { name: 'Sidi Bel Abbès', emoji: '🌾' },
  { name: 'Annaba', emoji: '🏖️' },
  { name: 'Guelma', emoji: '🌳' },
  { name: 'Constantine', emoji: '🏛️' },
  { name: 'Médéa', emoji: '⛰️' },
  { name: 'Mostaganem', emoji: '🏖️' },
  { name: "M'Sila", emoji: '🏜️' },
  { name: 'Mascara', emoji: '🌾' },
  { name: 'Ouargla', emoji: '🏜️' },
  { name: 'Oran', emoji: '🗼' },
  { name: 'El Bayadh', emoji: '🏜️' },
  { name: 'Illizi', emoji: '🏔️' },
  { name: 'Bordj Bou Arréridj', emoji: '🏞️' },
  { name: 'Boumerdès', emoji: '🏖️' },
  { name: 'El Tarf', emoji: '🌳' },
  { name: 'Tindouf', emoji: '🏜️' },
  { name: 'Tissemsilt', emoji: '⛰️' },
  { name: 'El Oued', emoji: '🏜️' },
  { name: 'Khenchela', emoji: '🏔️' },
  { name: 'Souk Ahras', emoji: '🏛️' },
  { name: 'Tipaza', emoji: '🏛️' },
  { name: 'Mila', emoji: '🌾' },
  { name: 'Aïn Defla', emoji: '🌳' },
  { name: 'Naâma', emoji: '🏜️' },
  { name: 'Aïn Témouchent', emoji: '🏖️' },
  { name: 'Ghardaïa', emoji: '🏛️' },
  { name: 'Relizane', emoji: '🌾' },
];

function StaysPage({ showToast, onOpenBooking }) {
  const navigate = useNavigate();
  const { user, isGuest } = useAuth();

  const [listings, setListings] = useState([]);
  const [allListings, setAllListings] = useState([]);
  const [activeCategory, setActiveCategory] = useState('all');
  const [loading, setLoading] = useState(true);

  // Wishlist state: Set of offer_ids saved by the logged-in guest
  const [wishlistIds, setWishlistIds] = useState(new Set());
  const [wishlistLoading, setWishlistLoading] = useState({});

  // Search state
  const [searchDestination, setSearchDestination] = useState('');
  const [checkInDate, setCheckInDate] = useState('');
  const [checkOutDate, setCheckOutDate] = useState('');
  const [guestCount, setGuestCount] = useState('');
  const [numberOfDays, setNumberOfDays] = useState(0);
  const [rentalType, setRentalType] = useState('day');
  const [searchPerformed, setSearchPerformed] = useState(false);

  // Wilaya autocomplete state
  const [showWilayaDropdown, setShowWilayaDropdown] = useState(false);
  const [wilayaSuggestions, setWilayaSuggestions] = useState([]);
  const [highlightedWilaya, setHighlightedWilaya] = useState(-1);
  const destinationRef = useRef(null);
  const dropdownRef = useRef(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        destinationRef.current && !destinationRef.current.contains(e.target) &&
        dropdownRef.current && !dropdownRef.current.contains(e.target)
      ) {
        setShowWilayaDropdown(false);
        setHighlightedWilaya(-1);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Load wishlist IDs when guest is logged in
  useEffect(() => {
    if (user && isGuest()) {
      getWishlistIds(user.user_id)
        .then(ids => setWishlistIds(new Set(ids)))
        .catch(() => {});
    } else {
      setWishlistIds(new Set());
    }
  }, [user]);

  // Filter wilaya suggestions as user types
  const handleDestinationChange = (e) => {
    const val = e.target.value;
    setSearchDestination(val);
    if (val.trim() === '') {
      setWilayaSuggestions([]);
      setShowWilayaDropdown(false);
      setHighlightedWilaya(-1);
    } else {
      const matches = ALL_WILAYAS.filter(w =>
        w.name.toLowerCase().includes(val.toLowerCase())
      );
      setWilayaSuggestions(matches);
      setShowWilayaDropdown(matches.length > 0);
      setHighlightedWilaya(-1);
    }
  };

  const handleWilayaSelect = (wilayaName) => {
    setSearchDestination(wilayaName);
    setShowWilayaDropdown(false);
    setHighlightedWilaya(-1);
  };

  const handleDestinationKeyDown = (e) => {
    if (!showWilayaDropdown || wilayaSuggestions.length === 0) return;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlightedWilaya(prev => (prev < wilayaSuggestions.length - 1 ? prev + 1 : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlightedWilaya(prev => (prev > 0 ? prev - 1 : wilayaSuggestions.length - 1));
    } else if (e.key === 'Enter' && highlightedWilaya >= 0) {
      e.preventDefault();
      handleWilayaSelect(wilayaSuggestions[highlightedWilaya].name);
    } else if (e.key === 'Escape') {
      setShowWilayaDropdown(false);
      setHighlightedWilaya(-1);
    }
  };

  const calculateDays = (checkIn, checkOut) => {
    if (!checkIn || !checkOut) return 0;
    const start = new Date(checkIn);
    const end = new Date(checkOut);
    const diffTime = Math.abs(end - start);
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const getRentalTypeForDuration = (days) => {
    if (days < 30) return 'day';
    if (days < 365) return 'month';
    return 'year';
  };

  // ✅ FIXED: Price is already in DZD, no multiplication needed
  const formatPrice = (price, rentalType) => {
    const dzdPrice = price;
    const period = rentalType === 'day' ? 'night' : rentalType === 'month' ? 'month' : 'year';
    return `${dzdPrice.toLocaleString('fr-DZ')} DA / ${period}`;
  };

  const getFirstImage = (property) => {
    if (!property.img) return 'https://picsum.photos/id/104/600/450';
    if (Array.isArray(property.img) && property.img.length > 0) return property.img[0];
    if (typeof property.img === 'string') return property.img;
    return 'https://picsum.photos/id/104/600/450';
  };

  const performSearch = () => {
    if (allListings.length === 0) return;
    const dest = searchDestination;
    const guests = guestCount ? parseInt(guestCount) : 0;

    if (!dest) {
      showToast('📍 Please enter a destination');
      return;
    }

    if (checkInDate && checkOutDate) {
      const days = calculateDays(checkInDate, checkOutDate);
      if (days < 1) { showToast('❌ Check-out date must be after check-in date'); return; }
      if (days > 365) { showToast('⚠️ Maximum stay is 365 days'); return; }
      setNumberOfDays(days);
      setRentalType(getRentalTypeForDuration(days));
    }

    const filtered = allListings.filter(property => {
      let matches = true;
      if (dest.trim() !== '') {
        matches = matches && (
          property.wilaya?.toLowerCase().includes(dest.toLowerCase()) ||
          property.location?.toLowerCase().includes(dest.toLowerCase())
        );
      }
      if (guests > 0) matches = matches && (property.voyageurs && property.voyageurs >= guests);
      if (activeCategory !== 'all') matches = matches && (property.category === activeCategory);
      return matches;
    });

    setListings(filtered);
    setSearchPerformed(true);
    filtered.length === 0
      ? showToast(`No properties found in ${dest}`)
      : showToast(`✨ Found ${filtered.length} properties in ${dest}`);
  };

  const clearSearch = () => {
    setSearchDestination('');
    setCheckInDate('');
    setCheckOutDate('');
    setGuestCount('');
    setNumberOfDays(0);
    setRentalType('day');
    setSearchPerformed(false);
    setListings(allListings);
    setShowWilayaDropdown(false);
    showToast('✨ All filters cleared');
  };

  useEffect(() => {
    const selectedWilaya = localStorage.getItem('selectedWilaya');
    fetchProperties()
      .then(data => {
        setAllListings(data);
        setListings(data);
        setLoading(false);
        if (selectedWilaya) {
          try {
            const { name, fromDestinationsPage } = JSON.parse(selectedWilaya);
            if (fromDestinationsPage && name) {
              const filteredByWilaya = data.filter(property => {
                const propertyWilaya = property.wilaya?.toLowerCase() || '';
                const propertyLocation = property.location?.toLowerCase() || '';
                const searchName = name.toLowerCase();
                return propertyWilaya.includes(searchName) || propertyLocation.includes(searchName);
              });
              setSearchDestination(name);
              setSearchPerformed(true);
              setListings(filteredByWilaya);
              filteredByWilaya.length === 0
                ? showToast(`📍 No properties found in ${name}`)
                : showToast(`📍 Showing ${filteredByWilaya.length} properties in ${name}`);
              localStorage.removeItem('selectedWilaya');
              return;
            }
          } catch (err) {
            console.error('Error parsing selectedWilaya:', err);
          }
        }
        setListings(data);
      })
      .catch((err) => {
        console.error('Error fetching properties:', err);
        showToast('❌ Failed to load properties');
        setLoading(false);
      });
  }, []);

  const filterCategory = (category) => {
    setActiveCategory(category);
    if (searchPerformed) {
      const guests = guestCount ? parseInt(guestCount) : 0;
      const filtered = allListings.filter(property => {
        let matches = true;
        if (searchDestination.trim() !== '') {
          matches = matches && (
            property.wilaya?.toLowerCase().includes(searchDestination.toLowerCase()) ||
            property.location?.toLowerCase().includes(searchDestination.toLowerCase())
          );
        }
        if (guests > 0) matches = matches && (property.voyageurs && property.voyageurs >= guests);
        if (numberOfDays > 0) matches = matches && (property.rental_type === rentalType);
        if (category !== 'all') matches = matches && (property.category === category);
        return matches;
      });
      setListings(filtered);
      showToast(`✦ Showing ${filtered.length} stays`);
    } else {
      const filtered = category === 'all' ? allListings : allListings.filter(l => l.category === category);
      setListings(filtered);
      showToast(`✦ Showing ${filtered.length} stays`);
    }
  };

  const toggleWishlist = async (e, propertyId) => {
    e.stopPropagation();

    if (!user || !isGuest()) {
      showToast('🔒 Sign in as a guest to save properties');
      return;
    }

    const isSaved = wishlistIds.has(propertyId);
    setWishlistIds(prev => {
      const next = new Set(prev);
      isSaved ? next.delete(propertyId) : next.add(propertyId);
      return next;
    });
    setWishlistLoading(prev => ({ ...prev, [propertyId]: true }));

    try {
      if (isSaved) {
        await removeFromWishlist(user.user_id, propertyId);
        showToast('💔 Removed from wishlist');
      } else {
        await addToWishlist(user.user_id, propertyId);
        showToast('❤️ Saved to wishlist');
      }
    } catch (err) {
      setWishlistIds(prev => {
        const next = new Set(prev);
        isSaved ? next.add(propertyId) : next.delete(propertyId);
        return next;
      });
      showToast(`❌ ${err.message}`);
    } finally {
      setWishlistLoading(prev => ({ ...prev, [propertyId]: false }));
    }
  };

  if (loading) return <p style={{ textAlign: 'center', padding: 40 }}>Loading stays...</p>;

  return (
    <>
      {/* Page Hero with Search Bar */}
      <div style={{ background: 'white', borderBottom: '1px solid #e0e0e0', paddingTop: '100px', paddingBottom: '30px' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 40px' }}>
          {/* Search Bar */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            background: 'white',
            borderRadius: '48px',
            border: '1px solid #e0e0e0',
            boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
            overflow: 'visible',
            maxWidth: '900px',
            margin: '0 auto',
            position: 'relative',
            zIndex: 50,
          }}>
            {/* Destination Field */}
            <div
              ref={destinationRef}
              style={{ flex: 1.5, padding: '14px 20px', borderRight: '1px solid #e0e0e0', position: 'relative' }}
            >
              <div style={{ fontSize: '12px', fontWeight: 600, marginBottom: '4px', color: '#333' }}>Where</div>
              <input
                type="text"
                placeholder="Search destinations"
                value={searchDestination}
                onChange={handleDestinationChange}
                onKeyDown={handleDestinationKeyDown}
                onFocus={() => {
                  if (wilayaSuggestions.length > 0) setShowWilayaDropdown(true);
                }}
                style={{
                  width: '100%',
                  border: 'none',
                  outline: 'none',
                  fontSize: '14px',
                  background: 'transparent',
                  fontFamily: 'inherit',
                  color: '#333',
                }}
              />

              {/* Wilaya Autocomplete Dropdown */}
              {showWilayaDropdown && (
                <div
                  ref={dropdownRef}
                  style={{
                    position: 'absolute',
                    top: 'calc(100% + 8px)',
                    left: '-1px',
                    width: '300px',
                    background: 'white',
                    borderRadius: '16px',
                    border: '1px solid #e0e0e0',
                    boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
                    maxHeight: '280px',
                    overflowY: 'auto',
                    zIndex: 200,
                    scrollbarWidth: 'thin',
                    scrollbarColor: '#c9a84c #f5f5f5',
                  }}
                >
                  {wilayaSuggestions.map((wilaya, index) => {
                    const isHighlighted = index === highlightedWilaya;
                    const termLower = searchDestination.toLowerCase();
                    const nameLower = wilaya.name.toLowerCase();
                    const matchIdx = nameLower.indexOf(termLower);
                    return (
                      <div
                        key={wilaya.name}
                        onMouseDown={(e) => { e.preventDefault(); handleWilayaSelect(wilaya.name); }}
                        onMouseEnter={() => setHighlightedWilaya(index)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '12px',
                          padding: '10px 16px',
                          cursor: 'pointer',
                          background: isHighlighted ? 'rgba(201,168,76,0.08)' : 'transparent',
                          borderBottom: index < wilayaSuggestions.length - 1 ? '1px solid #f0f0f0' : 'none',
                          borderRadius: index === wilayaSuggestions.length - 1 ? '0 0 16px 16px' : '0',
                          transition: 'background 0.1s',
                        }}
                      >
                        <span style={{
                          width: '32px', height: '32px', borderRadius: '8px',
                          background: 'rgba(201,168,76,0.1)',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontSize: '15px', flexShrink: 0,
                        }}>
                          {wilaya.emoji}
                        </span>
                        <span style={{ fontSize: '14px', color: '#222', fontWeight: 500 }}>
                          {matchIdx === -1 ? wilaya.name : (
                            <>
                              {wilaya.name.slice(0, matchIdx)}
                              <span style={{ color: '#c9a84c', fontWeight: 700 }}>
                                {wilaya.name.slice(matchIdx, matchIdx + searchDestination.length)}
                              </span>
                              {wilaya.name.slice(matchIdx + searchDestination.length)}
                            </>
                          )}
                        </span>
                        <svg style={{ marginLeft: 'auto', flexShrink: 0 }} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={isHighlighted ? '#c9a84c' : '#ccc'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                          <circle cx="12" cy="10" r="3"/>
                        </svg>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Check In Field */}
            <div style={{ flex: 1, padding: '14px 20px', borderRight: '1px solid #e0e0e0' }}>
              <div style={{ fontSize: '12px', fontWeight: 600, marginBottom: '4px', color: '#333' }}>Check in</div>
              <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                <input
                  type="date"
                  value={checkInDate}
                  onChange={(e) => setCheckInDate(e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                  style={{
                    width: '100%', border: 'none', outline: 'none', fontSize: '14px',
                    background: 'transparent', fontFamily: 'inherit', color: '#333',
                    opacity: checkInDate ? 1 : 0, cursor: 'pointer',
                  }}
                />
                {!checkInDate && (
                  <span style={{ position: 'absolute', left: 0, color: '#999', fontSize: '14px', pointerEvents: 'none' }}>
                    Add date
                  </span>
                )}
                <svg style={{ position: 'absolute', right: 0, width: '18px', height: '18px', color: '#999', pointerEvents: 'none' }}
                  fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2" strokeWidth="2"/>
                  <line x1="8" y1="2" x2="8" y2="6" strokeWidth="2"/>
                  <line x1="16" y1="2" x2="16" y2="6" strokeWidth="2"/>
                  <line x1="3" y1="10" x2="21" y2="10" strokeWidth="2"/>
                </svg>
              </div>
            </div>

            {/* Check Out Field */}
            <div style={{ flex: 1, padding: '14px 20px', borderRight: '1px solid #e0e0e0' }}>
              <div style={{ fontSize: '12px', fontWeight: 600, marginBottom: '4px', color: '#333' }}>Check out</div>
              <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                <input
                  type="date"
                  value={checkOutDate}
                  onChange={(e) => setCheckOutDate(e.target.value)}
                  min={checkInDate || new Date().toISOString().split('T')[0]}
                  style={{
                    width: '100%', border: 'none', outline: 'none', fontSize: '14px',
                    background: 'transparent', fontFamily: 'inherit', color: '#333',
                    opacity: checkOutDate ? 1 : 0, cursor: 'pointer',
                  }}
                />
                {!checkOutDate && (
                  <span style={{ position: 'absolute', left: 0, color: '#999', fontSize: '14px', pointerEvents: 'none' }}>
                    Add date
                  </span>
                )}
                <svg style={{ position: 'absolute', right: 0, width: '18px', height: '18px', color: '#999', pointerEvents: 'none' }}
                  fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2" strokeWidth="2"/>
                  <line x1="8" y1="2" x2="8" y2="6" strokeWidth="2"/>
                  <line x1="16" y1="2" x2="16" y2="6" strokeWidth="2"/>
                  <line x1="3" y1="10" x2="21" y2="10" strokeWidth="2"/>
                </svg>
              </div>
            </div>

            {/* Guests Field */}
            <div style={{ flex: 1, padding: '14px 20px', borderRight: '1px solid #e0e0e0' }}>
              <div style={{ fontSize: '12px', fontWeight: 600, marginBottom: '4px', color: '#333' }}>Guests</div>
              <input
                type="number"
                placeholder="Add guests"
                value={guestCount}
                onChange={(e) => setGuestCount(e.target.value)}
                min="1"
                style={{
                  width: '100%', border: 'none', outline: 'none', fontSize: '14px',
                  background: 'transparent', fontFamily: 'inherit', color: '#333',
                }}
              />
            </div>

            {/* Search Button */}
            <button
              onClick={performSearch}
              style={{
                background: '#c9a84c', border: 'none', borderRadius: '40px',
                width: '48px', height: '48px', margin: '8px',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer', transition: 'background 0.2s ease', flexShrink: 0,
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = '#b8963e'}
              onMouseLeave={(e) => e.currentTarget.style.background = '#c9a84c'}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" width="18" height="18">
                <circle cx="11" cy="11" r="8"/>
                <path d="m21 21-4.35-4.35"/>
              </svg>
            </button>
          </div>

          {/* Search Summary */}
          {searchPerformed && searchDestination && (
            <div style={{ textAlign: 'center', marginTop: '20px', fontSize: '13px', color: '#666' }}>
              <span>🔍 {listings.length} property(s) found in <strong>{searchDestination}</strong></span>
              {numberOfDays > 0 && <span style={{ marginLeft: '15px' }}>📅 {numberOfDays} days ({rentalType} rate)</span>}
              {guestCount && <span style={{ marginLeft: '15px' }}>👥 {guestCount} guest(s)</span>}
              <button onClick={clearSearch} style={{ marginLeft: '15px', background: 'none', border: 'none', color: '#c9a84c', cursor: 'pointer', textDecoration: 'underline' }}>
                Clear
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Category Filters */}
      <div style={{ background: 'white', padding: '20px 40px 0', borderBottom: '1px solid #e0e0e0' }}>
        <div style={{ display: 'flex', gap: '24px', overflowX: 'auto', maxWidth: '1200px', margin: '0 auto', justifyContent: 'center' }}>
          {[
            { value: 'all', label: 'All Properties' },
            { value: 'Touristic', label: '🌍 Touristic' },
            { value: 'Quotidian', label: '🏠 Quotidian' }
          ].map(cat => (
            <button
              key={cat.value}
              onClick={() => filterCategory(cat.value)}
              style={{
                padding: '8px 0',
                background: 'transparent',
                color: activeCategory === cat.value ? '#c9a84c' : '#666',
                border: 'none',
                borderBottom: activeCategory === cat.value ? '2px solid #c9a84c' : '2px solid transparent',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: 500,
                transition: 'all 0.2s',
                whiteSpace: 'nowrap'
              }}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Listings Grid */}
      <section id="stays" style={{ background: '#f5f5f5', paddingTop: '40px', paddingBottom: '60px' }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 40px' }}>
          {listings.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '80px', color: '#999' }}>
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>🏠</div>
              <h3>No properties found</h3>
              <p style={{ marginTop: '8px' }}>Try adjusting your search criteria</p>
              <button onClick={clearSearch} style={{ marginTop: '20px', padding: '10px 24px', background: '#c9a84c', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>
                Start New Search
              </button>
            </div>
          ) : (
            Object.entries(
              listings.reduce((groups, l) => {
                const key = l.wilaya || l.location || 'Other';
                if (!groups[key]) groups[key] = [];
                groups[key].push(l);
                return groups;
              }, {})
            ).map(([groupName, items]) => (
              <div key={groupName} style={{ marginBottom: '40px' }}>
                <h2 style={{ fontSize: '22px', fontWeight: 600, color: '#222', marginBottom: '20px' }}>{groupName}</h2>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '24px' }}>
                  {items.map(l => {
                    const isSaved = wishlistIds.has(l.property_id);
                    const isLoadingHeart = wishlistLoading[l.property_id];
                    return (
                      <div
                        key={l.property_id}
                        style={{
                          cursor: 'pointer', background: 'white', borderRadius: '12px', overflow: 'hidden',
                          transition: 'transform 0.2s, box-shadow 0.2s', boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                        }}
                        onClick={() => navigate(`/property/${l.property_id}`)}
                        onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.12)'; }}
                        onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.08)'; }}
                      >
                        <div style={{ position: 'relative', width: '100%', aspectRatio: '4 / 3', overflow: 'hidden' }}>
                          <img
                            src={getFirstImage(l)} alt={l.title}
                            style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                            onError={(e) => { e.target.src = 'https://picsum.photos/id/104/600/450'; }}
                          />
                          {l.badge && (
                            <div style={{ position: 'absolute', top: 12, left: 12, background: '#fff', color: '#222', fontSize: 12, fontWeight: 500, padding: '4px 10px', borderRadius: 20 }}>
                              {l.badge}
                            </div>
                          )}
                          {searchPerformed && numberOfDays > 0 && l.rental_type === rentalType && (
                            <div style={{ position: 'absolute', bottom: 12, right: 12, background: 'rgba(0,0,0,0.75)', color: '#c9a84c', fontSize: 11, fontWeight: 600, padding: '4px 8px', borderRadius: 4 }}>
                              Total: {Math.round(l.price * (rentalType === 'day' ? numberOfDays : rentalType === 'month' ? Math.ceil(numberOfDays / 30) : numberOfDays / 365)).toLocaleString('fr-DZ')} DA
                            </div>
                          )}

                          {/* Heart / Wishlist Button */}
                          <button
                            onClick={(e) => toggleWishlist(e, l.offer_id ?? l.property_id)}
                            disabled={isLoadingHeart}
                            title={isSaved ? 'Remove from wishlist' : 'Save to wishlist'}
                            style={{
                              position: 'absolute', top: 12, right: 12,
                              background: isSaved ? 'rgba(230,57,70,0.15)' : 'rgba(0,0,0,0.25)',
                              border: isSaved ? '1.5px solid rgba(230,57,70,0.5)' : '1.5px solid rgba(255,255,255,0.3)',
                              borderRadius: '50%',
                              width: 36, height: 36,
                              display: 'flex', alignItems: 'center', justifyContent: 'center',
                              cursor: isLoadingHeart ? 'wait' : 'pointer',
                              transition: 'all 0.2s',
                              backdropFilter: 'blur(4px)',
                              padding: 0,
                            }}
                            onMouseEnter={e => { if (!isLoadingHeart) e.currentTarget.style.transform = 'scale(1.15)'; }}
                            onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; }}
                          >
                            <svg width="18" height="18" viewBox="0 0 32 32" fill={isSaved ? '#e63946' : 'none'}>
                              <path
                                d="M16 28C16 28 4 20 4 12C4 8.686 6.686 6 10 6C12.2 6 14.1 7.2 16 9.2C17.9 7.2 19.8 6 22 6C25.314 6 28 8.686 28 12C28 20 16 28 16 28Z"
                                stroke={isSaved ? '#e63946' : 'white'}
                                strokeWidth="2.5"
                              />
                            </svg>
                          </button>
                        </div>

                        <div style={{ padding: '12px' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '4px' }}>
                            <h3 style={{ fontSize: '15px', fontWeight: 600, color: '#222', margin: 0 }}>{l.title}</h3>
                            <div style={{ fontSize: '13px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                              <span>★</span> {l.avgRating?.toFixed(1) || 'New'}
                            </div>
                          </div>
                          <p style={{ fontSize: '13px', color: '#717171', margin: '0 0 4px 0' }}>{l.wilaya || l.location}</p>
                          <p style={{ fontSize: '12px', color: '#999', margin: '0 0 8px 0' }}>
                            🛏️ {l.chambres || '?'} bed • 🚿 {l.salle_de_bain || '?'} bath • 👥 {l.voyageurs || '?'} guests
                          </p>
                          <div style={{ fontWeight: 600, color: '#222', fontSize: '14px' }}>
                            {formatPrice(l.price, l.rental_type)}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))
          )}
        </div>
      </section>
    </>
  );
}

export default StaysPage;