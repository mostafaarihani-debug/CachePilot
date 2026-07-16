import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Download, Play, Shield, Zap, ArrowRight } from 'lucide-react';

const scanCategories = [
  { name: 'Browser Cache', icon: '🌐', size: '1.2 GB', color: '#4DA3FF' },
  { name: 'System Temp', icon: '⚙️', size: '847 MB', color: '#38D27A' },
  { name: 'Windows Update', icon: '🔄', size: '2.1 GB', color: '#F5B84A' },
  { name: 'Thumbnails', icon: '🖼️', size: '356 MB', color: '#FF6B6B' },
  { name: 'DNS Cache', icon: '🔗', size: '12 MB', color: '#A78BFA' },
  { name: 'Crash Dumps', icon: '💥', size: '189 MB', color: '#FB923C' },
];

function ScanVisualization() {
  const [progress, setProgress] = useState(0);
  const [activeCategory, setActiveCategory] = useState(0);
  const [scanning, setScanning] = useState(false);
  const [freed, setFreed] = useState('0 MB');

  useEffect(() => {
    if (!scanning) return;

    const interval = setInterval(() => {
      setProgress((p) => {
        if (p >= 100) {
          setScanning(false);
          return 100;
        }
        const next = p + 0.8;
        const catIdx = Math.min(Math.floor((next / 100) * scanCategories.length), scanCategories.length - 1);
        setActiveCategory(catIdx);

        const totalBytes = (next / 100) * 4704;
        setFreed(`${(totalBytes / 1000).toFixed(1)} GB`);
        return next;
      });
    }, 50);

    return () => clearInterval(interval);
  }, [scanning]);

  const handleStart = () => {
    setProgress(0);
    setActiveCategory(0);
    setFreed('0 MB');
    setScanning(true);
  };

  return (
    <div style={{
      width: '100%',
      maxWidth: 480,
      background: '#111520',
      border: '1px solid #2B3441',
      borderRadius: 16,
      overflow: 'hidden',
      boxShadow: '0 25px 50px rgba(0, 0, 0, 0.4), 0 0 60px rgba(77, 163, 255, 0.08)',
    }}>
      {/* Title bar */}
      <div style={{
        padding: '12px 16px',
        borderBottom: '1px solid #2B3441',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#FF6B6B' }} />
          <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#F5B84A' }} />
          <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#38D27A' }} />
        </div>
        <span style={{ fontSize: 12, color: '#5A6478', fontFamily: 'var(--font-mono)' }}>
          {scanning ? 'Scanning...' : progress >= 100 ? 'Complete' : 'Ready'}
        </span>
      </div>

      {/* Scan area */}
      <div style={{ padding: '20px 20px 16px' }}>
        {/* Progress bar */}
        <div style={{
          height: 4,
          background: '#1A2030',
          borderRadius: 2,
          marginBottom: 20,
          overflow: 'hidden',
        }}>
          <motion.div
            style={{
              height: '100%',
              background: 'linear-gradient(90deg, #4DA3FF, #38D27A)',
              borderRadius: 2,
            }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.1 }}
          />
        </div>

        {/* Categories */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {scanCategories.map((cat, i) => {
            const isActive = i === activeCategory && scanning;
            const isDone = i < activeCategory || (progress >= 100);
            return (
              <div
                key={cat.name}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  padding: '10px 12px',
                  borderRadius: 10,
                  background: isActive ? 'rgba(77, 163, 255, 0.08)' : 'transparent',
                  border: `1px solid ${isActive ? 'rgba(77, 163, 255, 0.2)' : 'transparent'}`,
                  transition: 'all 0.3s ease',
                }}
              >
                <span style={{ fontSize: 16, width: 24, textAlign: 'center' }}>{cat.icon}</span>
                <span style={{
                  flex: 1,
                  fontSize: 13,
                  fontWeight: 500,
                  color: isDone ? '#8A94A6' : isActive ? '#E8EDF5' : '#5A6478',
                  fontFamily: 'var(--font-body)',
                }}>
                  {cat.name}
                </span>
                <span style={{
                  fontSize: 12,
                  fontFamily: 'var(--font-mono)',
                  fontWeight: 500,
                  color: isDone ? '#38D27A' : isActive ? cat.color : '#5A6478',
                  minWidth: 60,
                  textAlign: 'right',
                }}>
                  {isDone ? cat.size : isActive ? (
                    <motion.span
                      animate={{ opacity: [1, 0.5, 1] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                    >
                      {cat.size}
                    </motion.span>
                  ) : '—'}
                </span>
                {isDone && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    style={{ color: '#38D27A', fontSize: 14 }}
                  >
                    ✓
                  </motion.span>
                )}
              </div>
            );
          })}
        </div>

        {/* Result bar */}
        <div style={{
          marginTop: 16,
          padding: '12px 16px',
          background: '#0B0D11',
          borderRadius: 10,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          <span style={{ fontSize: 12, color: '#8A94A6' }}>
            {progress >= 100 ? 'Space recoverable' : 'Scanning...'}
          </span>
          <span style={{
            fontSize: 18,
            fontWeight: 700,
            fontFamily: 'var(--font-mono)',
            color: progress >= 100 ? '#38D27A' : '#4DA3FF',
          }}>
            {freed}
          </span>
        </div>

        {/* Action button */}
        {!scanning && progress < 100 && (
          <button
            onClick={handleStart}
            style={{
              width: '100%',
              marginTop: 12,
              padding: '12px 0',
              background: 'linear-gradient(135deg, #4DA3FF, #2B8AFF)',
              border: 'none',
              borderRadius: 10,
              color: 'white',
              fontSize: 14,
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              transition: 'all 0.2s',
            }}
          >
            <Play style={{ width: 16, height: 16 }} />
            {progress >= 100 ? 'Scan Again' : 'Start Scan'}
          </button>
        )}
      </div>
    </div>
  );
}

export function Hero() {
  return (
    <section style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '120px 24px 80px',
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Background gradient */}
      <div style={{
        position: 'absolute',
        top: '-30%',
        left: '50%',
        transform: 'translateX(-50%)',
        width: 800,
        height: 600,
        background: 'radial-gradient(ellipse, rgba(77, 163, 255, 0.08) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />

      <div style={{
        maxWidth: 1200,
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 60,
        position: 'relative',
        zIndex: 1,
      }}>
        {/* Left: Copy */}
        <div style={{ flex: 1, maxWidth: 560 }}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              padding: '6px 14px',
              background: 'rgba(77, 163, 255, 0.1)',
              border: '1px solid rgba(77, 163, 255, 0.2)',
              borderRadius: 100,
              marginBottom: 24,
            }}>
              <Zap style={{ width: 14, height: 14, color: '#4DA3FF' }} />
              <span style={{ fontSize: 13, fontWeight: 500, color: '#4DA3FF' }}>
                Free & Open Source
              </span>
            </div>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            style={{
              fontSize: 56,
              fontWeight: 800,
              lineHeight: 1.1,
              margin: 0,
              fontFamily: 'var(--font-display)',
              letterSpacing: '-0.02em',
            }}
          >
            Clean your PC
            <br />
            <span className="gradient-text">in one click.</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            style={{
              fontSize: 18,
              lineHeight: 1.6,
              color: '#8A94A6',
              marginTop: 20,
              maxWidth: 440,
            }}
          >
            See what's slowing you down, understand why each cache exists,
            and safely remove only what you choose. No hidden deletes,
            no surprise logouts.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            style={{ display: 'flex', gap: 12, marginTop: 32, flexWrap: 'wrap' }}
          >
            <a href="https://github.com/mostafaarihani-debug/CachePilot/releases/download/v1.1.7/CachePilot-Setup-1.1.7.exe" className="btn-primary" style={{ fontSize: 16, padding: '16px 32px' }}>
              <Download style={{ width: 18, height: 18 }} />
              Download
            </a>
            <a href="#features" className="btn-secondary" style={{ fontSize: 16, padding: '16px 32px' }}>
              See Features
              <ArrowRight style={{ width: 18, height: 18 }} />
            </a>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 16,
              marginTop: 32,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <Shield style={{ width: 14, height: 14, color: '#38D27A' }} />
              <span style={{ fontSize: 13, color: '#5A6478' }}>100% local</span>
            </div>
            <div style={{ width: 1, height: 14, background: '#2B3441' }} />
            <span style={{ fontSize: 13, color: '#5A6478' }}>No data leaves your PC</span>
          </motion.div>
        </div>

        {/* Right: Scan visualization */}
        <motion.div
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          style={{ flex: 1, display: 'flex', justifyContent: 'flex-end' }}
        >
          <ScanVisualization />
        </motion.div>
      </div>

      <style>{`
        @media (max-width: 900px) {
          section > div { flex-direction: column !important; }
          section > div > div:first-child { max-width: 100% !important; text-align: center; }
          section > div > div:last-child { justify-content: center !important; }
        }
        @media (max-width: 600px) {
          section h1 { font-size: 36px !important; }
        }
      `}</style>
    </section>
  );
}
