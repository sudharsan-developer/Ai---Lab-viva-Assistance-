import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axiosClient from '../api/axios';
import { useAuth } from '../context/AuthContext';

/* ═══════════════════════════════════════════════════════════
   PARTICLE CANVAS — animated white glowing dots
═══════════════════════════════════════════════════════════ */
const ParticleCanvas = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    const resize = () => {
      canvas.width  = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    // Create particles
    const PARTICLE_COUNT = 120;
    const particles = Array.from({ length: PARTICLE_COUNT }, () => ({
      x:    Math.random() * canvas.width,
      y:    Math.random() * canvas.height,
      r:    Math.random() * 1.8 + 0.3,
      vx:   (Math.random() - 0.5) * 0.35,
      vy:   -(Math.random() * 0.5 + 0.1),   // mostly upward
      alpha: Math.random() * 0.7 + 0.2,
      pulse: Math.random() * Math.PI * 2,    // phase offset for twinkle
    }));

    let raf;
    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      particles.forEach(p => {
        p.pulse += 0.02;
        const glow = 0.5 + 0.5 * Math.sin(p.pulse);
        const alpha = p.alpha * (0.6 + 0.4 * glow);

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r * (1 + 0.3 * glow), 0, Math.PI * 2);

        // White glow gradient
        const grad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r * 4);
        grad.addColorStop(0,   `rgba(255,255,255,${alpha})`);
        grad.addColorStop(0.4, `rgba(180,210,255,${alpha * 0.5})`);
        grad.addColorStop(1,   'rgba(100,160,255,0)');
        ctx.fillStyle = grad;
        ctx.fill();

        p.x += p.vx;
        p.y += p.vy;

        // Wrap around edges
        if (p.y < -10)              p.y = canvas.height + 10;
        if (p.y > canvas.height+10) p.y = -10;
        if (p.x < -10)              p.x = canvas.width + 10;
        if (p.x > canvas.width+10)  p.x = -10;
      });

      raf = requestAnimationFrame(draw);
    };
    draw();

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed', inset: 0,
        pointerEvents: 'none', zIndex: 0,
      }}
    />
  );
};

/* ═══════════════════════════════════════════════════════════
   BOTTOM WAVE SVG
═══════════════════════════════════════════════════════════ */
const BottomWave = () => (
  <svg
    viewBox="0 0 1440 200"
    style={{
      position: 'fixed', bottom: 0, left: 0, width: '100%',
      pointerEvents: 'none', zIndex: 0, opacity: 0.25,
    }}
    preserveAspectRatio="none"
  >
    <defs>
      <linearGradient id="wg1" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%"   stopColor="#7c3aed"/>
        <stop offset="50%"  stopColor="#2563eb"/>
        <stop offset="100%" stopColor="#06b6d4"/>
      </linearGradient>
      <linearGradient id="wg2" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%"   stopColor="#06b6d4"/>
        <stop offset="50%"  stopColor="#7c3aed"/>
        <stop offset="100%" stopColor="#ec4899"/>
      </linearGradient>
    </defs>
    <path d="M0,80 C240,160 480,0 720,80 C960,160 1200,0 1440,80 L1440,200 L0,200 Z" fill="url(#wg1)"/>
    <path d="M0,120 C360,40 720,200 1080,120 C1260,80 1380,160 1440,140 L1440,200 L0,200 Z" fill="url(#wg2)" opacity="0.6"/>
  </svg>
);

/* ═══════════════════════════════════════════════════════════
   GLOBAL KEYFRAMES
═══════════════════════════════════════════════════════════ */
const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap');

  * { box-sizing: border-box; margin: 0; padding: 0; }

  @keyframes fadeSlideUp {
    from { opacity:0; transform:translateY(24px); }
    to   { opacity:1; transform:translateY(0); }
  }
  @keyframes logoFloat {
    0%,100% { transform: translateY(0) rotate(-2deg); }
    50%      { transform: translateY(-10px) rotate(2deg); }
  }
  @keyframes shimmer {
    0%   { background-position: -200% center; }
    100% { background-position:  200% center; }
  }
  @keyframes borderGlow {
    0%,100% { box-shadow: 0 0 10px rgba(124,58,237,0.3), 0 0 30px rgba(37,99,235,0.1); }
    50%      { box-shadow: 0 0 20px rgba(124,58,237,0.6), 0 0 60px rgba(6,182,212,0.2); }
  }
  @keyframes pulse {
    0%,100% { opacity:1; }
    50%      { opacity:0.6; }
  }
  @keyframes spin { to { transform:rotate(360deg); } }

  .lp-root {
    font-family: 'Inter', 'Segoe UI', sans-serif;
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 24px 16px;
    position: relative;
    overflow: hidden;
    background: linear-gradient(135deg,
      #030817 0%, #080d2a 15%, #0c1244 30%,
      #0f0a2e 45%, #1a0845 60%,
      #090e28 75%, #060b24 100%);
  }

  /* ── left content ── */
  .lp-left {
    flex: 1;
    max-width: 560px;
    padding-right: 48px;
    animation: fadeSlideUp .7s ease both;
    position: relative; z-index: 1;
  }
  .lp-logo-wrap {
    display: flex; align-items: center; gap: 16px; margin-bottom: 20px;
    animation: fadeSlideUp .5s ease both;
  }
  .lp-logo-icon {
    width: 72px; height: 72px; border-radius: 20px;
    background: linear-gradient(135deg,#7c3aed,#2563eb,#06b6d4);
    display: flex; align-items: center; justify-content: center;
    font-size: 36px;
    box-shadow: 0 8px 32px rgba(124,58,237,0.5), 0 0 60px rgba(6,182,212,0.2);
    animation: logoFloat 4s ease-in-out infinite;
    flex-shrink: 0;
  }
  .lp-brand {
    display: flex; flex-direction: column;
  }
  .lp-brand-name {
    font-size: 28px; font-weight: 900; letter-spacing: 0.12em;
    background: linear-gradient(90deg,#a78bfa,#60a5fa,#22d3ee,#a78bfa);
    background-size: 200%;
    -webkit-background-clip: text; -webkit-text-fill-color: transparent;
    animation: shimmer 3s linear infinite;
  }
  .lp-brand-sub {
    font-size: 11px; font-weight: 600; letter-spacing: 0.2em;
    color: rgba(167,139,250,0.6); text-transform: uppercase;
  }

  .lp-title {
    font-size: 34px; font-weight: 800; line-height: 1.2;
    color: #fff; margin-bottom: 8px;
    animation: fadeSlideUp .6s .1s ease both;
  }
  .lp-title span {
    background: linear-gradient(90deg,#a78bfa,#60a5fa,#22d3ee);
    -webkit-background-clip: text; -webkit-text-fill-color: transparent;
  }
  .lp-desc {
    font-size: 14px; color: rgba(148,163,184,0.85); line-height: 1.65;
    max-width: 440px; margin-bottom: 32px;
    animation: fadeSlideUp .6s .2s ease both;
  }

  /* ── Feature cards ── */
  .lp-cards {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 12px;
    animation: fadeSlideUp .6s .3s ease both;
  }
  .lp-card {
    background: rgba(255,255,255,0.04);
    border: 1px solid rgba(124,58,237,0.25);
    border-radius: 16px;
    padding: 20px 12px;
    text-align: center;
    cursor: default;
    transition: all .25s ease;
    backdrop-filter: blur(8px);
    display: flex; flex-direction: column;
    align-items: center; gap: 10px;
  }
  .lp-card:hover {
    background: rgba(124,58,237,0.15);
    border-color: rgba(124,58,237,0.55);
    transform: translateY(-4px);
    box-shadow: 0 8px 24px rgba(124,58,237,0.25), 0 0 40px rgba(6,182,212,0.1);
  }
  .lp-card-icon {
    font-size: 32px; line-height: 1;
    filter: drop-shadow(0 0 8px rgba(139,92,246,0.6));
  }
  .lp-card-title {
    font-size: 12px; font-weight: 700; color: #e2e8f0;
    letter-spacing: 0.03em; line-height: 1.3;
  }

  /* ── right card ── */
  .lp-card-wrap {
    flex-shrink: 0;
    width: 100%; max-width: 480px;
    position: relative; z-index: 1;
    animation: fadeSlideUp .7s .15s ease both;
  }
  .lp-login-card {
    background: rgba(10,12,35,0.75);
    backdrop-filter: blur(24px) saturate(1.5);
    border: 1px solid rgba(124,58,237,0.3);
    border-radius: 28px;
    padding: 40px 40px 36px;
    animation: borderGlow 3s ease-in-out infinite;
    position: relative; overflow: hidden;
  }
  .lp-login-card::before {
    content:'';
    position:absolute; top:0; left:0; right:0; height:3px;
    background: linear-gradient(90deg,#7c3aed,#2563eb,#06b6d4,#7c3aed);
    background-size: 200%;
    animation: shimmer 2.5s linear infinite;
  }

  .lp-welcome {
    font-size: 28px; font-weight: 800; color: #fff;
    margin-bottom: 4px;
  }
  .lp-welcome-sub {
    font-size: 13px; color: rgba(148,163,184,0.75); margin-bottom: 20px;
  }
  .lp-divider-line {
    height: 2px; border-radius: 2px; margin-bottom: 24px;
    background: linear-gradient(90deg,#7c3aed,#2563eb,#06b6d4);
    opacity: 0.6;
  }

  /* tabs */
  .lp-tabs {
    display: grid; grid-template-columns: 1fr 1fr;
    background: rgba(255,255,255,0.04);
    border: 1px solid rgba(255,255,255,0.08);
    border-radius: 14px; padding: 5px; margin-bottom: 28px;
    gap: 4px;
  }
  .lp-tab {
    padding: 11px 8px; border-radius: 10px; border: none;
    cursor: pointer; font-weight: 700; font-size: 13px;
    transition: all .25s ease;
    display: flex; align-items: center; justify-content: center; gap: 6px;
  }
  .lp-tab-active {
    background: linear-gradient(135deg,#7c3aed,#2563eb);
    color: #fff;
    box-shadow: 0 4px 18px rgba(124,58,237,0.45);
  }
  .lp-tab-inactive {
    background: transparent; color: rgba(255,255,255,0.45);
  }
  .lp-tab-inactive:hover { color: rgba(255,255,255,0.75); background: rgba(255,255,255,0.06); }

  /* error */
  .lp-error {
    background: rgba(239,68,68,0.1); border: 1px solid rgba(239,68,68,0.3);
    border-radius: 12px; padding: 12px 14px; margin-bottom: 18px;
    color: #fca5a5; font-size: 13px;
    display: flex; align-items: center; gap: 8px;
    animation: fadeSlideUp .25s ease;
  }

  /* form */
  .lp-label {
    display: block; font-size: 12px; font-weight: 700;
    color: rgba(148,163,184,0.9); letter-spacing: 0.08em;
    text-transform: uppercase; margin-bottom: 8px;
  }
  .lp-input-wrap { position: relative; margin-bottom: 20px; }
  .lp-input-icon {
    position: absolute; left: 14px; top: 50%; transform: translateY(-50%);
    font-size: 15px; pointer-events: none; opacity: 0.6;
  }
  .lp-input {
    width: 100%; padding: 13px 44px;
    background: rgba(255,255,255,0.05);
    border: 1px solid rgba(124,58,237,0.22);
    border-radius: 12px; color: #e2e8f0; font-size: 14px;
    outline: none; transition: border .2s, box-shadow .2s;
    font-family: inherit;
  }
  .lp-input:focus {
    border-color: rgba(124,58,237,0.7);
    box-shadow: 0 0 0 3px rgba(124,58,237,0.15);
  }
  .lp-input::placeholder { color: rgba(148,163,184,0.45); }
  .lp-eye {
    position: absolute; right: 14px; top: 50%; transform: translateY(-50%);
    background: none; border: none; cursor: pointer;
    color: rgba(148,163,184,0.5); font-size: 11px; font-weight: 700;
    padding: 4px 6px; transition: color .2s;
  }
  .lp-eye:hover { color: rgba(148,163,184,0.9); }

  /* submit */
  .lp-submit {
    width: 100%; padding: 15px;
    background: linear-gradient(135deg, #7c3aed 0%, #2563eb 50%, #06b6d4 100%);
    border: none; border-radius: 14px;
    color: #fff; font-weight: 800; font-size: 15px; cursor: pointer;
    box-shadow: 0 6px 28px rgba(124,58,237,0.45), 0 0 60px rgba(6,182,212,0.1);
    transition: opacity .2s, transform .15s, box-shadow .2s;
    margin-top: 4px; letter-spacing: 0.02em;
  }
  .lp-submit:hover:not(:disabled) {
    opacity: 0.88; transform: translateY(-2px);
    box-shadow: 0 10px 36px rgba(124,58,237,0.55), 0 0 80px rgba(6,182,212,0.15);
  }
  .lp-submit:disabled { opacity: 0.6; cursor: not-allowed; }

  /* demo */
  .lp-demo-sep {
    display: flex; align-items: center; gap: 10px;
    margin: 22px 0 16px; color: rgba(148,163,184,0.35); font-size: 11px;
  }
  .lp-demo-sep::before, .lp-demo-sep::after {
    content:''; flex:1; height:1px;
    background: rgba(255,255,255,0.08);
  }
  .lp-demo-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
  .lp-demo-card {
    padding: 12px 14px; border-radius: 12px; cursor: pointer;
    transition: all .2s;
    border: 1px solid rgba(255,255,255,0.08);
    background: rgba(255,255,255,0.03);
  }
  .lp-demo-card:hover { background: rgba(124,58,237,0.14); border-color: rgba(124,58,237,0.35); }
  .lp-demo-role { font-size: 11px; font-weight: 700; margin-bottom: 5px; color: #a78bfa; }
  .lp-demo-role-staff { color: #60a5fa; }
  .lp-demo-cred { font-size: 11px; color: rgba(148,163,184,0.6); font-family: monospace; line-height: 1.6; }

  /* ── RESPONSIVE ── */
  .lp-layout {
    display: flex; align-items: center;
    gap: 0; width: 100%; max-width: 1200px;
    position: relative; z-index: 1;
  }

  @media (max-width: 1024px) {
    .lp-left { padding-right: 32px; }
    .lp-title { font-size: 27px; }
    .lp-cards { grid-template-columns: repeat(3, 1fr); }
  }
  @media (max-width: 768px) {
    .lp-root { padding: 16px; align-items: flex-start; overflow-y: auto; }
    .lp-layout { flex-direction: column; gap: 32px; }
    .lp-left { max-width: 100%; padding-right: 0; }
    .lp-title { font-size: 24px; }
    .lp-cards { grid-template-columns: repeat(2, 1fr); }
    .lp-card-wrap { max-width: 100%; }
    .lp-login-card { padding: 28px 24px 24px; }
    .lp-welcome { font-size: 22px; }
  }
  @media (max-width: 420px) {
    .lp-cards { grid-template-columns: 1fr; }
    .lp-brand-name { font-size: 22px; }
  }
`;

/* ═══════════════════════════════════════════════════════════
   MAIN LOGIN PAGE
═══════════════════════════════════════════════════════════ */
const LoginPage = () => {
  const location   = useLocation();
  const defaultTab = location.pathname.startsWith('/staff') ? 'staff' : 'student';
  const [activeTab, setActiveTab] = useState(defaultTab);

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPw,   setShowPw]   = useState(false);
  const [error,    setError]    = useState('');
  const [loading,  setLoading]  = useState(false);

  const { login }  = useAuth();
  const navigate   = useNavigate();

  // Reset form on tab switch
  useEffect(() => {
    setUsername(''); setPassword(''); setError(''); setShowPw(false);
  }, [activeTab]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!username.trim()) { setError('Please enter your username.'); return; }
    if (!password.trim()) { setError('Please enter your password.'); return; }

    setLoading(true);
    try {
      const endpoint = activeTab === 'student'
        ? '/auth/student/login'
        : '/auth/staff/login';

      const res = await axiosClient.post(endpoint, {
        username: username.trim().toLowerCase(),
        password,
      });

      const { user, token } = res.data;
      login(user, token, activeTab);
      navigate(activeTab === 'student' ? '/student/dashboard' : '/staff/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid username or password.');
    } finally {
      setLoading(false);
    }
  };

  const fillDemo = (role) => {
    setActiveTab(role);
    if (role === 'student') { setUsername('25pca04001'); setPassword('student123'); }
    else                    { setUsername('srinivasan'); setPassword('staff123'); }
    setError('');
  };

  const features = [
    { icon: '🤖', title: 'AI Preparation'  },
    { icon: '📋', title: 'Smart Questions' },
    { icon: '📊', title: 'Performance'     },
  ];

  return (
    <>
      <style>{STYLES}</style>

      {/* Animated particle canvas */}
      <ParticleCanvas />
      {/* Bottom waves */}
      <BottomWave />

      {/* Extra glow orbs */}
      <div style={{
        position:'fixed', top:'-20%', left:'-10%',
        width:'500px', height:'500px', borderRadius:'50%',
        background:'radial-gradient(circle,rgba(124,58,237,0.12) 0%,transparent 70%)',
        pointerEvents:'none', zIndex:0,
      }}/>
      <div style={{
        position:'fixed', bottom:'-10%', right:'-5%',
        width:'420px', height:'420px', borderRadius:'50%',
        background:'radial-gradient(circle,rgba(6,182,212,0.1) 0%,transparent 70%)',
        pointerEvents:'none', zIndex:0,
      }}/>
      <div style={{
        position:'fixed', top:'35%', right:'20%',
        width:'280px', height:'280px', borderRadius:'50%',
        background:'radial-gradient(circle,rgba(236,72,153,0.06) 0%,transparent 70%)',
        pointerEvents:'none', zIndex:0,
      }}/>

      {/* Main layout */}
      <div className="lp-root">
        <div className="lp-layout">

          {/* ════════════ LEFT SIDE ════════════ */}
          <div className="lp-left">

            {/* Logo + Brand */}
            <div className="lp-logo-wrap">
              <div className="lp-logo-icon">🎓</div>
              <div className="lp-brand">
                <div className="lp-brand-name">AI VIVA SYSTEM</div>
                <div className="lp-brand-sub">Powered by Gemini AI</div>
              </div>
            </div>

            {/* Title */}
            <h1 className="lp-title">
              AI-Powered Viva <span>Preparation</span> &amp;<br />
              Performance Evaluation
            </h1>

            {/* Description */}
            <p className="lp-desc">
              An intelligent examination platform that generates personalised
              MCQ questions using Gemini AI, reads them aloud via voice
              assistant, evaluates your performance instantly, and provides
              detailed analytics — all in one place.
            </p>

            {/* Feature cards */}
            <div className="lp-cards">
              {features.map((f) => (
                <div className="lp-card" key={f.title}>
                  <div className="lp-card-icon">{f.icon}</div>
                  <div className="lp-card-title">{f.title}</div>
                </div>
              ))}
            </div>
          </div>

          {/* ════════════ RIGHT — LOGIN CARD ════════════ */}
          <div className="lp-card-wrap">
            <div className="lp-login-card">

              {/* Header */}
              <h2 className="lp-welcome">Welcome Back! 👋</h2>
              <p className="lp-welcome-sub">Login to continue your learning journey</p>
              <div className="lp-divider-line" />

              {/* Role tabs */}
              <div className="lp-tabs">
                <button
                  className={`lp-tab ${activeTab==='student' ? 'lp-tab-active' : 'lp-tab-inactive'}`}
                  onClick={() => setActiveTab('student')}
                >
                  🎓 Student
                </button>
                <button
                  className={`lp-tab ${activeTab==='staff' ? 'lp-tab-active' : 'lp-tab-inactive'}`}
                  onClick={() => setActiveTab('staff')}
                >
                  👨‍🏫 Staff
                </button>
              </div>

              {/* Error */}
              {error && (
                <div className="lp-error">
                  <span>⚠️</span> {error}
                </div>
              )}

              {/* Form */}
              <form onSubmit={handleSubmit} autoComplete="off" noValidate>

                {/* Username */}
                <label className="lp-label">Username</label>
                <div className="lp-input-wrap">
                  <span className="lp-input-icon">👤</span>
                  <input
                    className="lp-input"
                    type="text"
                    value={username}
                    onChange={e => setUsername(e.target.value)}
                    placeholder={activeTab==='student' ? 'Enter your register number' : 'Enter your username'}
                    autoComplete="off"
                  />
                </div>

                {/* Password */}
                <label className="lp-label">Password</label>
                <div className="lp-input-wrap">
                  <span className="lp-input-icon">🔒</span>
                  <input
                    className="lp-input"
                    type={showPw ? 'text' : 'password'}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    autoComplete="new-password"
                    style={{ paddingRight: '72px' }}
                  />
                  <button type="button" className="lp-eye" onClick={() => setShowPw(p => !p)}>
                    {showPw ? '🙈 Hide' : '👁 Show'}
                  </button>
                </div>

                {/* Submit */}
                <button type="submit" className="lp-submit" disabled={loading}>
                  {loading ? (
                    <span style={{display:'flex',alignItems:'center',justifyContent:'center',gap:'10px'}}>
                      <span style={{
                        width:'16px',height:'16px',
                        border:'2.5px solid rgba(255,255,255,0.3)',
                        borderTopColor:'#fff',borderRadius:'50%',
                        display:'inline-block',animation:'spin .7s linear infinite',
                      }}/>
                      Signing in...
                    </span>
                  ) : (
                    `Sign In as ${activeTab === 'student' ? 'Student' : 'Staff'} →`
                  )}
                </button>
              </form>

              {/* Demo credentials */}
              <div className="lp-demo-sep">DEMO CREDENTIALS — CLICK TO FILL</div>
              <div className="lp-demo-grid">
                <div className="lp-demo-card" onClick={() => fillDemo('student')}>
                  <div className="lp-demo-role">🎓 Student</div>
                  <div className="lp-demo-cred">
                    user: 25pca04001<br/>pass: student123
                  </div>
                </div>
                <div className="lp-demo-card" onClick={() => fillDemo('staff')}>
                  <div className="lp-demo-role lp-demo-role-staff">👨‍🏫 Staff</div>
                  <div className="lp-demo-cred">
                    user: srinivasan<br/>pass: staff123
                  </div>
                </div>
              </div>

            </div>
          </div>
          {/* ── end right ── */}

        </div>
      </div>
    </>
  );
};

export default LoginPage;
