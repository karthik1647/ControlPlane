import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

/* ──────────────────────────────────────────────────────────────
   Logo mark – reused in navbar and footer
   ────────────────────────────────────────────────────────────── */
const LogoMark: React.FC<{ size?: 'sm' | 'md' }> = ({ size = 'md' }) => (
  <div
    className={`flex items-center justify-center rounded-xl bg-cp-600 font-black text-white shadow-lg select-none ${
      size === 'sm' ? 'w-7 h-7 text-xs' : 'w-9 h-9 text-sm'
    }`}
  >
    CP
  </div>
);

/* ──────────────────────────────────────────────────────────────
   Sticky Navbar
   ────────────────────────────────────────────────────────────── */
const Navbar: React.FC = () => {
  const [scrolled, setScrolled] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handler);
    return () => window.removeEventListener('scroll', handler);
  }, []);

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-white/90 backdrop-blur-md border-b border-gray-200 shadow-sm'
          : 'bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        {/* Left: Logo */}
        <div className="flex items-center gap-2.5">
          <LogoMark size="sm" />
          <span className="text-base font-bold text-gray-900 tracking-tight">ControlPlane.ai</span>
        </div>

        {/* Center: Nav links */}
        <div className="hidden md:flex items-center gap-8">
          {[
            { label: 'How It Works', id: 'how-it-works' },
            { label: 'Scenarios', id: 'scenarios' },
            { label: 'Architecture', id: 'architecture' },
          ].map((link) => (
            <button
              key={link.id}
              onClick={() => scrollTo(link.id)}
              className="text-sm font-medium text-gray-600 hover:text-cp-600 transition-colors"
            >
              {link.label}
            </button>
          ))}
        </div>

        {/* Right: CTA */}
        <button
          onClick={() => navigate('/app')}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-cp-600 text-white text-sm font-semibold hover:bg-cp-700 transition-colors shadow-md shadow-cp-600/25"
        >
          Launch Dashboard
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
          </svg>
        </button>
      </div>
    </nav>
  );
};

/* ──────────────────────────────────────────────────────────────
   Hero Section
   ────────────────────────────────────────────────────────────── */
const Hero: React.FC = () => {
  const navigate = useNavigate();
  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-white pt-20">
      {/* Subtle purple radial glow */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 flex items-center justify-center"
      >
        <div className="w-[800px] h-[600px] rounded-full bg-cp-100 opacity-60 blur-3xl" />
      </div>
      <div
        aria-hidden
        className="pointer-events-none absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2"
      >
        <div className="w-[600px] h-[400px] rounded-full bg-cp-200 opacity-30 blur-[120px]" />
      </div>

      <div className="relative max-w-5xl mx-auto px-6 text-center">
        {/* Eyebrow */}
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-cp-100 border border-cp-200 mb-8">
          <span className="w-1.5 h-1.5 rounded-full bg-cp-600 animate-pulse" />
          <span className="text-xs font-bold tracking-widest text-cp-700 uppercase">
            Responsible AI Governance
          </span>
        </div>

        {/* H1 */}
        <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black text-gray-900 leading-[1.05] tracking-tight mb-6">
          Stop your AI before it makes a{' '}
          <span className="relative">
            <span className="relative z-10 text-cp-600">costly mistake.</span>
            <span
              aria-hidden
              className="absolute -bottom-1 left-0 right-0 h-3 bg-cp-100 -skew-x-3 rounded"
            />
          </span>
        </h1>

        {/* Subtext */}
        <p className="text-lg sm:text-xl text-gray-500 max-w-3xl mx-auto leading-relaxed mb-10">
          Enterprise AI systems are making high-stakes decisions without oversight. ControlPlane.ai
          intercepts every AI response in real time — blocking hallucinations, PII leaks, and
          compounding errors before they reach your users.
        </p>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-14">
          <button
            onClick={() => navigate('/app')}
            className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full bg-cp-600 text-white font-semibold text-base hover:bg-cp-700 transition-all shadow-xl shadow-cp-600/30 hover:shadow-2xl hover:shadow-cp-600/40 hover:-translate-y-0.5"
          >
            Launch Demo
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
            </svg>
          </button>
          <button
            onClick={() => scrollTo('architecture')}
            className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full border-2 border-gray-200 text-gray-700 font-semibold text-base hover:border-cp-300 hover:text-cp-600 transition-all"
          >
            View Architecture
          </button>
        </div>

        {/* Trust stats */}
        <div className="inline-flex flex-col sm:flex-row items-center gap-4 sm:gap-10 px-8 py-5 rounded-2xl bg-white border border-gray-200 shadow-lg">
          {[
            { value: '< 2ms', label: 'Gateway Latency' },
            { value: '15 / 15', label: 'Tests Passing' },
            { value: '3', label: 'Enterprise Use Cases' },
          ].map((stat, i) => (
            <React.Fragment key={stat.label}>
              {i > 0 && <div className="hidden sm:block w-px h-8 bg-gray-200" />}
              <div className="text-center sm:text-left">
                <div className="text-2xl font-black text-cp-600">{stat.value}</div>
                <div className="text-xs font-medium text-gray-500 mt-0.5">{stat.label}</div>
              </div>
            </React.Fragment>
          ))}
        </div>
      </div>
    </section>
  );
};

/* ──────────────────────────────────────────────────────────────
   Real Failures Section
   ────────────────────────────────────────────────────────────── */
const RealFailures: React.FC = () => {
  const incidents = [
    {
      company: 'Air Canada',
      title: 'Bereavement Chatbot Hallucination',
      summary:
        "Air Canada's chatbot invented a retroactive bereavement discount policy that didn't exist. When a passenger followed the AI's advice, the airline was sued and ordered by the tribunal to honour the fabricated refund.",
      cost: 'Legal liability + reputation damage',
    },
    {
      company: 'Zillow',
      title: 'AI Valuation Model Compounding Drift',
      summary:
        "Zillow's automated valuation model produced offers that compounded upward across sequential decisions, systematically overvaluing properties. The drift went undetected until it triggered a $304M write-down and a 25% workforce reduction.",
      cost: '$304M write-down + 2,000 jobs lost',
    },
    {
      company: 'Enterprise AI Copilot',
      title: 'PII Leaked Through AI Response',
      summary:
        'An internal AI copilot returned customer credit card numbers and personal email addresses in unredacted responses visible to multiple support agents. The incident triggered a mandatory GDPR data-breach notification.',
      cost: 'GDPR violation exposure + breach notification',
    },
  ];

  return (
    <section className="py-24 bg-white" id="scenarios">
      <div className="max-w-7xl mx-auto px-6">
        {/* Section header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-red-50 border border-red-200 mb-5">
            <span className="text-xs font-bold tracking-widest text-red-600 uppercase">The Problem</span>
          </div>
          <h2 className="text-4xl sm:text-5xl font-black text-gray-900 tracking-tight">
            Real failures. Real consequences.
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {incidents.map((inc) => (
            <div
              key={inc.company}
              className="relative bg-white border border-gray-200 rounded-2xl p-7 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-200 flex flex-col"
            >
              {/* REAL INCIDENT badge */}
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-red-50 border border-red-200 mb-5 self-start">
                <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
                <span className="text-[10px] font-bold tracking-wider text-red-600 uppercase">Real Incident</span>
              </div>

              <h3 className="text-xl font-black text-gray-900 mb-1">{inc.company}</h3>
              <p className="text-sm font-semibold text-gray-500 mb-4">{inc.title}</p>
              <p className="text-sm text-gray-600 leading-relaxed flex-1">{inc.summary}</p>

              <div className="mt-5 pt-4 border-t border-gray-100 flex items-start gap-2">
                <svg className="w-4 h-4 text-red-500 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                </svg>
                <span className="text-xs font-semibold text-red-600">{inc.cost}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

/* ──────────────────────────────────────────────────────────────
   How It Works / Architecture Section
   ────────────────────────────────────────────────────────────── */
const HowItWorks: React.FC = () => {
  const features = [
    {
      icon: '🔒',
      title: 'PII Redaction',
      desc: 'Regex + Luhn-validated credit card detection with automatic in-place sanitization before delivery.',
    },
    {
      icon: '🛑',
      title: 'Injection Blocking',
      desc: 'Jailbreak and prompt injection heuristic matching that hard-blocks threats in under 10ms.',
    },
    {
      icon: '📈',
      title: 'Drift Detection',
      desc: 'Stateful exponential moving average per-asset that catches compounding valuation drift across turns.',
    },
    {
      icon: '🎯',
      title: 'Hallucination Guard',
      desc: 'NLI-based grounding against RAG context documents. Claims unsupported by policy are blocked.',
    },
  ];

  return (
    <section className="py-24 bg-cp-50" id="how-it-works">
      <div className="max-w-7xl mx-auto px-6">
        {/* Section header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-cp-100 border border-cp-200 mb-5">
            <span className="text-xs font-bold tracking-widest text-cp-700 uppercase">The Solution</span>
          </div>
          <h2 className="text-4xl sm:text-5xl font-black text-gray-900 tracking-tight">
            Two-tier protection. Sub-2ms overhead.
          </h2>
        </div>

        {/* Pipeline diagram */}
        <div id="architecture" className="bg-white border border-gray-200 rounded-3xl p-8 mb-14 shadow-sm overflow-x-auto">
          <div className="min-w-[640px]">
            {/* Top flow: Prompt → LLM → Candidate Response */}
            <div className="flex items-center justify-center gap-0 mb-6">
              {[
                { label: 'User Prompt', color: 'bg-gray-100 border-gray-300 text-gray-700' },
                null,
                { label: 'LLM Model', color: 'bg-blue-50 border-blue-300 text-blue-700' },
                null,
                { label: 'Candidate Response', color: 'bg-orange-50 border-orange-300 text-orange-700' },
              ].map((item, i) =>
                item === null ? (
                  <svg key={i} className="w-8 h-4 text-gray-400 shrink-0" fill="none" viewBox="0 0 32 16">
                    <path d="M1 8h28M22 2l8 6-8 6" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                ) : (
                  <div key={item.label} className={`px-4 py-2 rounded-xl border font-semibold text-sm ${item.color}`}>
                    {item.label}
                  </div>
                )
              )}
            </div>

            {/* Down arrow */}
            <div className="flex justify-center mb-4">
              <div className="flex flex-col items-center gap-1">
                <div className="w-px h-6 bg-gray-300" />
                <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 16 16">
                  <path d="M8 2v10M3 8l5 5 5-5" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <span className="text-xs text-gray-400 font-medium">Intercepted</span>
              </div>
            </div>

            {/* Gateway box */}
            <div className="border-2 border-cp-400 rounded-2xl p-5 bg-cp-50 mb-5">
              <div className="text-center mb-4">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cp-600 text-white text-xs font-bold">
                  ControlPlane.ai Gateway
                </span>
              </div>

              {/* Tier 1 */}
              <div className="bg-white border border-cp-200 rounded-xl p-4 mb-3">
                <div className="text-xs font-bold text-cp-700 uppercase tracking-wider mb-3">
                  Tier 1 — Parallel Fast Scanners ({'<'}80ms budget)
                </div>
                <div className="grid grid-cols-3 gap-3">
                  {['🔒 PII Redaction', '🛑 Injection Sentinel', '📈 Drift Detection'].map((s) => (
                    <div key={s} className="bg-cp-50 border border-cp-200 rounded-lg px-3 py-2 text-xs font-medium text-cp-800 text-center">
                      {s}
                    </div>
                  ))}
                </div>
              </div>

              {/* Tier 2 */}
              <div className="bg-white border border-cp-200 rounded-xl p-4 mb-3">
                <div className="text-xs font-bold text-cp-700 uppercase tracking-wider mb-3">
                  Tier 2 — Conditional Grounding Verifier (NLI)
                </div>
                <div className="flex justify-center">
                  <div className="bg-cp-50 border border-cp-200 rounded-lg px-4 py-2 text-xs font-medium text-cp-800">
                    🎯 Hallucination Guard — Grounding Score against RAG context
                  </div>
                </div>
              </div>

              {/* Priority Router */}
              <div className="flex items-center justify-center gap-4">
                <div className="bg-white border border-gray-300 rounded-lg px-3 py-2 text-xs font-semibold text-gray-700">
                  Priority Router
                </div>
                <svg className="w-5 h-4 text-gray-400" fill="none" viewBox="0 0 20 16">
                  <path d="M1 8h16M12 2l6 6-6 6" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                {[
                  { label: 'ALLOW', color: 'bg-green-100 border-green-400 text-green-700' },
                  { label: 'EDIT', color: 'bg-blue-100 border-blue-400 text-blue-700' },
                  { label: 'HOLD', color: 'bg-amber-100 border-amber-400 text-amber-700' },
                  { label: 'BLOCK', color: 'bg-red-100 border-red-400 text-red-700' },
                ].map((a) => (
                  <div key={a.label} className={`border rounded-lg px-2.5 py-1.5 text-[11px] font-bold ${a.color}`}>
                    {a.label}
                  </div>
                ))}
              </div>
            </div>

            {/* Down arrow to user */}
            <div className="flex justify-center mb-4">
              <div className="flex flex-col items-center gap-1">
                <svg className="w-4 h-4 text-green-500" fill="none" viewBox="0 0 16 16">
                  <path d="M8 2v10M3 8l5 5 5-5" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <div className="px-4 py-2 rounded-xl border bg-green-50 border-green-300 text-green-700 font-semibold text-sm">
                  Safe Response → User
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Feature cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {features.map((f) => (
            <div
              key={f.title}
              className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-200"
            >
              <div className="text-3xl mb-4">{f.icon}</div>
              <h3 className="text-base font-bold text-gray-900 mb-2">{f.title}</h3>
              <p className="text-sm text-gray-500 leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

/* ──────────────────────────────────────────────────────────────
   Scenarios Preview Section
   ────────────────────────────────────────────────────────────── */
const ScenariosPreview: React.FC = () => {
  const navigate = useNavigate();

  return (
    <section className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-cp-100 border border-cp-200 mb-5">
            <span className="text-xs font-bold tracking-widest text-cp-700 uppercase">Demo Scenarios</span>
          </div>
          <h2 className="text-4xl sm:text-5xl font-black text-gray-900 tracking-tight">
            Two documented enterprise failures. Intercepted.
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* SC-01 Air Canada */}
          <div className="bg-white border border-gray-200 rounded-3xl p-8 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-200 flex flex-col">
            <div className="flex items-start justify-between mb-6">
              <div>
                <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">SC-01</div>
                <h3 className="text-2xl font-black text-gray-900">Air Canada</h3>
                <p className="text-sm text-gray-500 mt-1">Bereavement Policy Hallucination</p>
              </div>
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-red-50 border border-red-200 text-xs font-bold text-red-600">
                GROUNDING BLOCK
              </span>
            </div>
            <p className="text-sm text-gray-600 leading-relaxed flex-1 mb-6">
              The AI fabricates a retroactive 50% bereavement discount directly contradicted by the
              airline's official tariff policy. ControlPlane.ai's Tier 2 grounding verifier catches the
              unsupported claim and returns a policy-compliant fallback response.
            </p>
            <div className="flex items-center justify-between pt-5 border-t border-gray-100">
              <div className="flex items-center gap-2 text-xs text-gray-500">
                <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
                Hallucination detected — claim blocked
              </div>
              <button
                onClick={() => navigate('/app')}
                className="text-sm font-semibold text-cp-600 hover:text-cp-700 transition-colors flex items-center gap-1"
              >
                Try in Dashboard
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                </svg>
              </button>
            </div>
          </div>

          {/* SC-04 Zillow */}
          <div className="bg-white border border-gray-200 rounded-3xl p-8 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-200 flex flex-col">
            <div className="flex items-start justify-between mb-6">
              <div>
                <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">SC-04</div>
                <h3 className="text-2xl font-black text-gray-900">Zillow</h3>
                <p className="text-sm text-gray-500 mt-1">Compounding Valuation Drift (+25%)</p>
              </div>
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-50 border border-amber-200 text-xs font-bold text-amber-600">
                DRIFT QUARANTINE
              </span>
            </div>
            <p className="text-sm text-gray-600 leading-relaxed mb-5">
              A 5-turn valuation sequence where the AI's property estimate drifts from $410k to $500k.
              Stateful drift tracking catches the compounding anomaly before a $304M mistake repeats.
            </p>

            {/* Turn sequence badges */}
            <div className="flex items-center gap-2 mb-6 flex-wrap">
              {[
                { label: '✓ ALLOW', color: 'bg-green-50 border-green-300 text-green-700', title: '$410k' },
                { label: '✓ ALLOW', color: 'bg-green-50 border-green-300 text-green-700', title: '$425k' },
                { label: '✓ ALLOW', color: 'bg-green-50 border-green-300 text-green-700', title: '$445k' },
                { label: '⚠ EDIT', color: 'bg-amber-50 border-amber-300 text-amber-700', title: '$470k' },
                { label: '🚨 HOLD', color: 'bg-red-50 border-red-300 text-red-700', title: '$500k' },
              ].map((turn, i) => (
                <div key={i} className="flex flex-col items-center gap-1">
                  <span className="text-[10px] font-mono text-gray-400">T{i + 1}: {turn.title}</span>
                  <span className={`px-2.5 py-1 rounded-full border text-[11px] font-bold ${turn.color}`}>
                    {turn.label}
                  </span>
                </div>
              ))}
            </div>

            <div className="flex items-center justify-between pt-5 border-t border-gray-100 mt-auto">
              <div className="flex items-center gap-2 text-xs text-gray-500">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                Drift Score D_t = 3.30σ at Turn 5
              </div>
              <button
                onClick={() => navigate('/app')}
                className="text-sm font-semibold text-cp-600 hover:text-cp-700 transition-colors flex items-center gap-1"
              >
                Try in Dashboard
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

/* ──────────────────────────────────────────────────────────────
   Footer
   ────────────────────────────────────────────────────────────── */
const Footer: React.FC = () => {
  const navigate = useNavigate();
  return (
    <footer className="bg-brand-dark text-white py-16">
      <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
        {/* Left */}
        <div>
          <div className="flex items-center gap-2.5 mb-3">
            <div className="w-8 h-8 rounded-xl bg-cp-600 flex items-center justify-center text-white font-black text-sm">
              CP
            </div>
            <span className="text-base font-bold">ControlPlane.ai</span>
          </div>
          <p className="text-sm text-cp-300 max-w-xs leading-relaxed">
            Real-time AI governance gateway. Intercept, inspect, and act — before your AI makes a costly mistake.
          </p>
          <button
            onClick={() => navigate('/app')}
            className="mt-5 inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-cp-600 text-white text-sm font-semibold hover:bg-cp-500 transition-colors"
          >
            Launch Dashboard →
          </button>
        </div>

        {/* Right */}
        <div className="text-right">
          <p className="text-sm font-semibold text-cp-200 mb-1">
            Built for Accenture Innovation Challenge 2026
          </p>
          <p className="text-sm text-cp-300">
            Team High Performance Athletes
          </p>
          <p className="text-sm text-cp-400 mt-0.5">
            Karthik &amp; Premnadh Reddy
          </p>
          <p className="text-xs text-cp-500 mt-3">
            MIT License · ControlPlane.ai Prototype v1.0
          </p>
        </div>
      </div>
    </footer>
  );
};

/* ──────────────────────────────────────────────────────────────
   Landing Page Composition
   ────────────────────────────────────────────────────────────── */
export const Landing: React.FC = () => {
  return (
    <div className="bg-white text-gray-900 font-sans">
      <Navbar />
      <Hero />
      <RealFailures />
      <HowItWorks />
      <ScenariosPreview />
      <Footer />
    </div>
  );
};
