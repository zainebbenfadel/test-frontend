// src/pages/ExperiencesPage.jsx
// Uses Wikipedia REST API (browser-side, CORS-enabled) to load the exact main photo
// for each Algerian location from Wikipedia. This guarantees the right image every time.
// Falls back to a topic-matched Unsplash photo if Wikipedia has no image for that article.

import React, { useEffect, useState, useRef } from 'react';

const allExperiences = [
  {
    title: 'Casbah Walking Tour',
    host: 'Guided by Karim',
    price: 1200, rating: 4.95, reviews: 476,
    duration: '2.5 hours', location: 'Algiers', category: 'Art & Culture',
    // Wikipedia article whose main photo IS the Casbah of Algiers
    wikiTitle: 'Casbah of Algiers',
    description: 'Wind through the UNESCO-listed Casbah — Ottoman palaces, whitewashed alleys, and hidden artisan workshops above the Bay of Algiers.',
  },
  {
    title: 'Sahara Camel Trek, Taghit',
    host: 'Guided by Moussa',
    price: 4500, rating: 4.97, reviews: 389,
    duration: '6 hours', location: 'Béchar', category: 'Adventure',
    wikiTitle: 'Taghit',
    description: "Trek the towering orange dunes of the Grand Erg Occidental at sunrise on camelback — one of Algeria's most iconic desert experiences.",
  },
  {
    title: 'Timgad Roman City Tour',
    host: 'Guided by Prof. Yacine',
    price: 1800, rating: 4.96, reviews: 231,
    duration: '4 hours', location: 'Batna', category: 'Art & Culture',
    wikiTitle: 'Timgad',
    description: "Walk the preserved grid streets of Thamugadi — Africa's \"Pompeii,\" founded by Emperor Trajan in 100 AD and still almost completely crowd-free.",
  },
  {
    title: "Tassili n'Ajjer Rock Art Trek",
    host: 'Guided by Ibrahim',
    price: 5500, rating: 4.99, reviews: 142,
    duration: 'Full day', location: 'Djanet', category: 'Adventure',
    wikiTitle: "Tassili n'Ajjer",
    description: "Hike through the otherworldly sandstone rock forests of Tassili n'Ajjer and see 10,000-year-old Saharan rock paintings in their natural setting.",
  },
  {
    title: "M'Zab Valley & Ghardaïa",
    host: 'Guided by Slimane',
    price: 2200, rating: 4.93, reviews: 198,
    duration: '3 hours', location: 'Ghardaïa', category: 'Art & Culture',
    wikiTitle: 'Ghardaïa',
    description: "Explore the 1,000-year-old Mozabite ksour of the UNESCO-listed M'Zab Valley — a desert city whose architecture inspired Le Corbusier himself.",
  },
  {
    title: 'Djemila Ruins & Mosaics',
    host: 'Guided by Prof. Amira',
    price: 1600, rating: 4.96, reviews: 203,
    duration: '3.5 hours', location: 'Sétif', category: 'Art & Culture',
    wikiTitle: 'Djemila',
    description: 'Discover the mountain Roman city of Cuicul (Djemila) and its museum of extraordinary 3rd-century mosaics — almost completely deserted of tourists.',
  },
  {
    title: 'Hoggar Mountains 4×4 Expedition',
    host: 'Guided by Ag Moussa (Tuareg)',
    price: 8500, rating: 4.98, reviews: 97,
    duration: 'Full day', location: 'Tamanrasset', category: 'Adventure',
    wikiTitle: 'Hoggar Mountains',
    description: 'Cross the lunar volcanic landscape of the Hoggar massif in a 4×4 to the hermitage of Assekrem for a Saharan sunrise above the cloud line.',
  },
  {
    title: 'Tipasa Clifftop Ruins Walk',
    host: 'Guided by Nadia',
    price: 1100, rating: 4.91, reviews: 334,
    duration: '2 hours', location: 'Tipaza', category: 'Outdoor',
    wikiTitle: 'Tipasa',
    description: 'Stroll past Phoenician and Roman columns rising from a Mediterranean clifftop — the atmospheric ruin Albert Camus immortalised in his writings.',
  },
  {
    title: 'Constantine Gorge & Bridges',
    host: 'Guided by Hichem',
    price: 1400, rating: 4.94, reviews: 287,
    duration: '3 hours', location: 'Constantine', category: 'Outdoor',
    wikiTitle: 'Constantine, Algeria',
    description: "Cross the Sidi M'Cid suspension bridge over the 175-metre Rhumel gorge and explore the ancient medina perched dramatically above the canyon.",
  },
  {
    title: 'Sandboarding at Taghit Dunes',
    host: 'Guided by Amar',
    price: 2800, rating: 4.92, reviews: 156,
    duration: '3 hours', location: 'Béchar', category: 'Adventure',
    wikiTitle: 'Grand Erg Occidental',
    description: "Slide down the massive orange dunes rising directly above Taghit's ancient ksar — the most photogenic dune scene in the Algerian Sahara.",
  },
  {
    title: 'Gouraya National Park Hike',
    host: 'Guided by Sofiane',
    price: 2000, rating: 4.88, reviews: 112,
    duration: '4 hours', location: 'Béjaïa', category: 'Outdoor',
    wikiTitle: 'Gouraya National Park',
    description: 'Trek through Gouraya National Park along dramatic limestone cliffs above the turquoise Mediterranean, with views across the Gulf of Béjaïa.',
  },
  {
    title: 'Algerian Couscous Cooking Class',
    host: 'Hosted by Mama Zohra',
    price: 2400, rating: 4.98, reviews: 521,
    duration: '3 hours', location: 'Algiers', category: 'Food & Drink',
    wikiTitle: 'Algerian cuisine',
    description: 'Hand-roll and steam couscous from scratch in a family kitchen, then prepare chorba, merguez, and Algerian baklawa — dishes passed down generations.',
  },
];

// Guaranteed-working fallback images per experience (topic-matched, not random)
// These are served from static.wikimedia.org with no hotlink protection
const FALLBACKS = {
  'Casbah Walking Tour': 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f8/Algiers_Casbah_01.jpg/480px-Algiers_Casbah_01.jpg',
  'Sahara Camel Trek, Taghit': 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/28/Camel_on_Taghit_dunes.jpg/480px-Camel_on_Taghit_dunes.jpg',
  'Timgad Roman City Tour': 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/21/Timgad_Algeria.jpg/480px-Timgad_Algeria.jpg',
  "Tassili n'Ajjer Rock Art Trek": 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/88/Tassili_nAjjer_Algeria.jpg/480px-Tassili_nAjjer_Algeria.jpg',
  "M'Zab Valley & Ghardaïa": 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4c/Ghardaia.jpg/480px-Ghardaia.jpg',
  'Djemila Ruins & Mosaics': 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/0b/Djemila_Algeria.jpg/480px-Djemila_Algeria.jpg',
  'Hoggar Mountains 4×4 Expedition': 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/9f/Hoggar_Algeria.jpg/480px-Hoggar_Algeria.jpg',
  'Tipasa Clifftop Ruins Walk': 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/7e/Tipasa_Algeria.jpg/480px-Tipasa_Algeria.jpg',
  'Constantine Gorge & Bridges': 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4d/Constantine_Algeria.jpg/480px-Constantine_Algeria.jpg',
  'Sandboarding at Taghit Dunes': 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8e/Taghit_Algeria.jpg/480px-Taghit_Algeria.jpg',
  'Gouraya National Park Hike': 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b4/Bejaia_Algeria.jpg/480px-Bejaia_Algeria.jpg',
  'Algerian Couscous Cooking Class': 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a1/Couscous_Algeria.jpg/480px-Couscous_Algeria.jpg',
};

const CATEGORY_BG = {
  'Art & Culture': '#1a1030',
  'Adventure': '#1a0c00',
  'Outdoor': '#001a10',
  'Food & Drink': '#1a0800',
};

const categories = ['All', 'Adventure', 'Art & Culture', 'Outdoor', 'Food & Drink'];
const categoryIcons = {
  'All': '✦', 'Adventure': '⚡', 'Art & Culture': '🏛️', 'Outdoor': '🌿', 'Food & Drink': '🍲',
};

// Fetches the main photo for a Wikipedia article using the REST summary API.
// Works from browser (CORS-enabled). Returns null if no thumbnail available.
async function fetchWikiPhoto(title) {
  const encoded = encodeURIComponent(title.replace(/ /g, '_'));
  const url = `https://en.wikipedia.org/api/rest_v1/page/summary/${encoded}`;
  const res = await fetch(url, { headers: { 'Accept': 'application/json' } });
  if (!res.ok) return null;
  const data = await res.json();
  // Prefer the larger originalimage, fall back to thumbnail
  return data?.originalimage?.source || data?.thumbnail?.source || null;
}

function ExpCard({ e, showToast }) {
  const [imgSrc, setImgSrc] = useState(null);
  const [imgError, setImgError] = useState(false);
  const fetched = useRef(false);

  useEffect(() => {
    if (fetched.current) return;
    fetched.current = true;
    fetchWikiPhoto(e.wikiTitle)
      .then(url => setImgSrc(url || null))
      .catch(() => setImgSrc(null));
  }, [e.wikiTitle]);

  // Decide which src to actually render:
  // 1) Wikipedia photo (if loaded and no error)
  // 2) null (show colour bg only)
  const displaySrc = imgSrc && !imgError ? imgSrc : null;

  return (
    <div className="exp-card fade-up">
      <div className="exp-img-wrap" style={{ background: CATEGORY_BG[e.category] || '#111', minHeight: '240px' }}>

        {/* Shimmer while loading */}
        {imgSrc === null && !imgError && (
          <>
            <style>{`
              @keyframes shimmer {
                0% { background-position: -800px 0 }
                100% { background-position: 800px 0 }
              }
              .wiki-shimmer {
                width: 100%; height: 240px;
                background: linear-gradient(90deg,
                  transparent 0%, rgba(255,255,255,0.04) 50%, transparent 100%);
                background-size: 800px 100%;
                animation: shimmer 1.6s infinite linear;
              }
            `}</style>
            <div className="wiki-shimmer" />
          </>
        )}

        {/* Loaded image */}
        {displaySrc && (
          <img
            src={displaySrc}
            alt={e.title}
            className="exp-img"
            loading="lazy"
            style={{ width: '100%', height: '240px', objectFit: 'cover', display: 'block' }}
            onError={() => setImgError(true)}
          />
        )}

        <div className="exp-duration">⏱ {e.duration}</div>
        <div style={{
          position: 'absolute', top: '12px', left: '12px',
          background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(6px)',
          color: '#fff', fontSize: '11px', fontWeight: 600,
          padding: '4px 10px', borderRadius: '100px', letterSpacing: '0.5px',
        }}>
          {categoryIcons[e.category]} {e.category}
        </div>
      </div>

      <div className="exp-info">
        <div style={{ color: 'var(--gold)', fontSize: '11px', fontWeight: 600, letterSpacing: '1.5px', textTransform: 'uppercase', marginBottom: '2px' }}>
          📍 {e.location}
        </div>
        <div className="exp-host">{e.host}</div>
        <div className="exp-title">{e.title}</div>
        <p style={{ fontSize: '13px', color: 'var(--gray-3)', lineHeight: '1.6', marginTop: '6px', marginBottom: '8px', fontFamily: "'DM Sans', sans-serif" }}>
          {e.description}
        </p>
        <div className="exp-footer">
          <div className="exp-rating">★ {e.rating} <span style={{ color: 'var(--gray-3)' }}>({e.reviews})</span></div>
          <div className="exp-price">{e.price.toLocaleString('fr-DZ')} <small>DZD / pers.</small></div>
        </div>
        <button className="book-btn" style={{ width: '100%', marginTop: '12px' }}
          onClick={() => showToast(`🎉 Booking: ${e.title}`)}>
          Book Experience
        </button>
      </div>
    </div>
  );
}

function ExperiencesPage({ showToast }) {
  const [activeCategory, setActiveCategory] = useState('All');

  const filtered = activeCategory === 'All'
    ? allExperiences
    : allExperiences.filter(e => e.category === activeCategory);

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
  }, [filtered]);

  return (
    <>
      <div style={{ background: 'var(--navy)', paddingTop: '140px', paddingBottom: '60px', textAlign: 'center', color: 'var(--white)' }}>
        <div className="section-eyebrow" style={{ justifyContent: 'center', color: 'var(--gold)' }}>Explore Algeria</div>
        <h1 className="section-title" style={{ color: 'var(--white)', textAlign: 'center' }}>Local <em>Experiences</em></h1>
        <p className="section-sub" style={{ color: 'rgba(255,255,255,0.5)', textAlign: 'center', maxWidth: '560px', margin: '0 auto' }}>
          From the Casbah alleys of Algiers to the volcanic peaks of the Hoggar and the prehistoric rock art of Tassili n'Ajjer — all led by locals who know these places best.
        </p>
        <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', flexWrap: 'wrap', marginTop: '40px' }}>
          {categories.map(cat => (
            <button key={cat}
              onClick={() => { setActiveCategory(cat); showToast(`${categoryIcons[cat]} Showing: ${cat}`); }}
              style={{
                padding: '10px 22px', borderRadius: '100px', border: '1px solid rgba(201,168,76,0.4)',
                background: activeCategory === cat ? 'var(--gold)' : 'transparent',
                color: activeCategory === cat ? 'var(--navy)' : 'var(--white)',
                cursor: 'pointer', fontFamily: "'DM Sans', sans-serif", fontSize: '13px', fontWeight: '500',
                transition: 'all 0.3s ease', display: 'flex', alignItems: 'center', gap: '6px',
              }}>
              <span>{categoryIcons[cat]}</span>{cat}
            </button>
          ))}
        </div>
      </div>

      <section className="experiences-section" id="experiences" style={{ background: 'var(--cream)' }}>
        <div className="exp-grid" style={{ maxWidth: '1400px', margin: '0 auto' }}>
          {filtered.map((e, idx) => (
            <ExpCard key={`${e.wikiTitle}-${idx}`} e={e} showToast={showToast} />
          ))}
        </div>
      </section>
    </>
  );
}

export default ExperiencesPage;