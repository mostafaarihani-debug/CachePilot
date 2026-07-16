import { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { StatsBar } from './components/StatsBar';
import { Features } from './components/Features';
import { HowItWorks } from './components/HowItWorks';
import { Pricing } from './components/Pricing';
import { Footer } from './components/Footer';
import { Legal } from './components/Legal';

export default function App() {
  const [hash, setHash] = useState(window.location.hash.replace('#', ''));

  useEffect(() => {
    const onHashChange = () => setHash(window.location.hash.replace('#', ''));
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, []);

  const isLegalPage = hash === 'terms' || hash === 'privacy';

  return (
    <div style={{ minHeight: '100vh' }}>
      {isLegalPage ? (
        <>
          <Navbar />
          <Legal />
        </>
      ) : (
        <>
          <Navbar />
          <Hero />
          <StatsBar />
          <Features />
          <HowItWorks />
          <Pricing />
          <Footer />
        </>
      )}
    </div>
  );
}
