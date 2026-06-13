// src/components/Footer.jsx
import React from 'react';
import { Link } from 'react-router-dom';

const socials = [
  {
    label: 'X',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.737-8.835L1.254 2.25H8.08l4.253 5.622 5.91-5.622Zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
      </svg>
    ),
  },
  {
    label: 'Instagram',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
        <circle cx="12" cy="12" r="4"/>
        <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none"/>
      </svg>
    ),
  },
  {
    label: 'Facebook',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
        <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>
      </svg>
    ),
  },
  {
    label: 'YouTube',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
        <path d="M22.54 6.42a2.78 2.78 0 0 0-1.95-1.96C18.88 4 12 4 12 4s-6.88 0-8.59.46A2.78 2.78 0 0 0 1.46 6.42 29 29 0 0 0 1 12a29 29 0 0 0 .46 5.58a2.78 2.78 0 0 0 1.95 1.96C5.12 20 12 20 12 20s6.88 0 8.59-.46a2.78 2.78 0 0 0 1.95-1.96A29 29 0 0 0 23 12a29 29 0 0 0-.46-5.58zM9.75 15.02V8.98L15.5 12l-5.75 3.02z"/>
      </svg>
    ),
  },
];

function Footer({ showToast }) {
  return (
    <footer>
      <div className="footer-grid">
        <div className="footer-brand">
           <Link to="/" className="nav-logo">
                 <span className="logo-icon">        <img src="/photos/logo2.png"  alt="MyHomeCity Logo" className="logo-img"  />
         </span>
                 Mabiti'<span>i</span>
               </Link>
                   <p>Connecting Algerians with homes across every wilaya — short stays, long stays, and everything in between. Pay easily in Dinar.</p>

          <div className="footer-socials">
  {socials.map(({ label, icon }) => (
    <button
      key={label}
      className="social-btn"
      onClick={() => showToast(`Opening ${label}...`)}
      aria-label={label}
    >
      {icon}
    </button>
  ))}
</div>

        </div>
        <div className="footer-col">
          <h5>Explore</h5>
          <ul>
             <li><Link to="/stays">All Listings</Link></li>
            <li><a href="#">Short-term Stays</a></li>
            <li><a href="#">Long-term Rentals</a></li>
            <li><a href="#">Seaside Properties</a></li>
            <li><a href="#">Sahara Experiences</a></li>

            
          </ul>
        </div>
        <div className="footer-col">
          <h5>Hosting</h5>
          <ul>
           <li><Link to="/host">List Your Home</Link></li>
            <li><a href="#">Host Guide</a></li>
            <li><a href="#">Baridi Mob Payments</a></li>
            <li><a href="#">Host Community</a></li>
            <li><a href="#">Help Center</a></li>
          </ul>
        </div>
        <div className="footer-col">
          <h5>Company</h5>
          <ul>
           <li><Link to="/about">About Mabit'i</Link></li>
            <li><a href="#">Our Mission</a></li>
            <li><a href="#">Trust & Safety</a></li>
            <li><a href="#">Press</a></li>
            <li><a href="#">Contact Us</a></li>
          </ul>
        </div>
      </div>
      <div className="footer-bottom">
              <span>© 2026 Mabit'i. All rights reserved. — Made in Algeria </span>

        <div className="footer-bottom-links">
         <a href="#">Privacy</a>
          <a href="#">Terms</a>
          <a href="#">Legal Notice</a>
          <a href="#">Cookies</a>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
