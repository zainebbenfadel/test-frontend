// src/pages/AboutPage.jsx
import { useEffect } from 'react';

export default function AboutPage() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div style={{ background: 'var(--cream)', minHeight: '100vh', paddingTop: '30px' }}>

      {/* Hero */}
      <section style={{ background: 'var(--navy)', padding: '100px 40px', textAlign: 'center' }}>
        <p style={{ color: 'var(--gold)', fontStyle: 'italic', fontSize: '18px', letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: '16px',fontFamily: "'Cormorant Garamond', serif", }}>Our Story</p>
        <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 'clamp(42px, 7vw, 82px)', fontWeight: 600, color: '#fff', lineHeight: 1.1, margin: '0 auto 24px', maxWidth: '700px'  }}>
          We believe travel should feel <em style={{ color: 'var(--gold)', fontStyle: 'italic' }}>extraordinary.</em>
        </h1>
        <p style={{ color: 'rgba(255,255,255,0.65)', fontSize: '18px', maxWidth: '560px', margin: '0 auto', lineHeight: 1.7 ,fontFamily: "'Cormorant Garamond', serif", }}>
          Mabiti'i was founded on a simple idea: the places we stay shape the memories we make. So we set out to build something better.
        </p>
      </section>

      {/* Mission */}
      <section style={{ maxWidth: '800px', margin: '0 auto', padding: '80px 40px' }}>
        <h2 style={{ fontFamily: "'Cormorant Garamond', serif", color: 'var(--navy)', fontSize: '42px', fontWeight: 600, marginBottom: '24px' }}>Our Mission</h2>
        <p style={{ color: 'var(--text-mid)', fontSize: '17px', lineHeight: 1.8, marginBottom: '20px' }}>
          We handpick every property, verify every host, and personally vet each listing before it appears on our platform. No algorithm decides what's "good enough" — our team does.
        </p>
        <p style={{ color: 'var(--text-mid)', fontSize: '17px', lineHeight: 1.8 }}>
          From a cliffside villa in Santorini to a cedar cabin on the Oregon coast, every NestAway property is chosen for one reason: it genuinely moved us.
        </p>
      </section>

      {/* Values */}
      <section style={{ background: 'var(--navy)', padding: '80px 40px' }}>
        <div style={{ maxWidth: '900px', margin: '0 auto' }}>
          <h2 style={{ color: '#fff', fontSize: '38px',fontFamily: "'Cormorant Garamond', serif", fontWeight: 700, marginBottom: '48px', textAlign: 'center' }}>What We Stand For</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '32px', fontFamily: "'Cormorant Garamond', serif"}}>
            {[
              { title: 'Curation Over Quantity', text: 'We would rather list 100 exceptional properties than 10,000 mediocre ones.' },
              { title: 'Trust at Every Step', text: 'Every host is verified. Every review is real. Every booking is protected.' },
              { title: 'Experiences, Not Just Stays', text: 'We connect guests with local hosts, guides, and experiences that go beyond four walls.' },
            ].map((v) => (
              <div key={v.title} style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(201,168,76,0.2)', borderRadius: '16px', padding: '32px' }}>
                <h3 style={{ color: 'var(--gold)', fontSize: '18px', fontWeight: 700, marginBottom: '12px' }}>{v.title}</h3>
                <p style={{ color: 'rgba(255,255,255,0.65)', fontSize: '15px', lineHeight: 1.7, margin: 0 }}>{v.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team / Closing */}
      <section style={{ maxWidth: '700px', margin: '0 auto', padding: '80px 40px', textAlign: 'center' }}>
        <h2 style={{ color: 'var(--navy)', fontSize: '38px', fontWeight: 700, marginBottom: '24px',fontFamily: "'Cormorant Garamond', serif" }}>Built by travelers, for travelers.</h2>
        <p style={{ color: 'var(--text-mid)', fontSize: '17px', lineHeight: 1.8 }}>
          Our small team is spread across four continents. We've slept in treehouses, rented fishing boats in Greece, and gotten lost in Kyoto backstreets. We build NestAway the way we wish every travel platform worked.
        </p>
      </section>

    </div>
  );
}