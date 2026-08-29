import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

/* ──────────────────────────────────────────────────────────────
   Logo Mark
   ────────────────────────────────────────────────────────────── */
const LogoMark: React.FC<{ size?: 'sm' | 'md' }> = ({ size = 'md' }) => (
  <div
    className={`flex items-center justify-center rounded-xl bg-cp-600 font-black text-white shadow-sm select-none ${
      size === 'sm' ? 'w-7 h-7 text-xs' : 'w-9 h-9 text-sm'
    }`}
  >
    CP
  </div>
);

/* ──────────────────────────────────────────────────────────────
   Inline SVG Icons (Handcrafted Vector Assets)
   ────────────────────────────────────────────────────────────── */
const ShieldCheckIcon: React.FC<{ className?: string }> = ({ className = 'w-5 h-5' }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
  </svg>
);

const ShieldAlertIcon: React.FC<{ className?: string }> = ({ className = 'w-5 h-5' }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m0 3.75h.007v.008H12v-.008zM12 3s7.5 3 7.5 8.25c0 5.25-4.5 9-7.5 10.5-3-1.5-7.5-5.25-7.5-10.5C4.5 6 12 3 12 3z" />
  </svg>
);

const TrendingUpIcon: React.FC<{ className?: string }> = ({ className = 'w-5 h-5' }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18L9 11.25l4.306 4.307a11.95 11.95 0 005.814-5.519l2.74-1.22m0 0l-5.94-2.28m5.94 2.28l-2.28 5.941" />
  </svg>
);

const TargetIcon: React.FC<{ className?: string }> = ({ className = 'w-5 h-5' }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m0 13.5V21m9-9h-2.25M5.25 12H3m15.364 6.364l-1.591-1.591M6.227 6.227L4.636 4.636m12.728 0l-1.591 1.591M6.227 17.773l-1.591 1.591M12 7.5a4.5 4.5 0 100 9 4.5 4.5 0 000-9z" />
  </svg>
);

const AlertTriangleIcon: React.FC<{ className?: string }> = ({ className = 'w-4 h-4' }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
  </svg>
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
          ? 'bg-white/90 backdrop-blur-md border-b border-gray-200/80 shadow-xs'
          : 'bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <LogoMark size="sm" />
          <span className="text-base font-bold text-gray-900 tracking-tight">ControlPlane.ai</span>
        </div>

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

        <button
          onClick={() => navigate('/app')}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-cp-600 text-white text-sm font-semibold hover:bg-cp-700 transition-colors shadow-xs"
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
      <div aria-hidden className="pointer-events-none absolute inset-0 flex items-center justify-center">
        <div className="w-[800px] h-[600px] rounded-full bg-cp-100/50 opacity-60 blur-3xl" />
      </div>

      <div className="relative max-w-5xl mx-auto px-6 text-center">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-cp-50 border border-cp-200/80 mb-8">
          <span className="w-1.5 h-1.5 rounded-full bg-cp-600" />
          <span className="text-xs font-semibold tracking-wider text-cp-800 uppercase">
            Responsible AI Governance Platform
          </span>
        </div>

        <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-gray-900 leading-[1.08] tracking-tight mb-6">
          Real-Time Governance for{' '}
          <span className="relative inline-block">
            <span className="relative z-10 text-cp-600">Enterprise AI.</span>
            <span
              aria-hidden
              className="absolute -bottom-1 left-0 right-0 h-3 bg-cp-100 -skew-x-3 rounded"
            />
          </span>
        </h1>

        <p className="text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed mb-10 font-normal">
          ControlPlane.ai intercepts model responses in real time. Validate grounding, redact PII,
          block prompt injections, and track stateful valuation drift before outputs reach end users.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-14">
          <button
            onClick={() => navigate('/app')}
            className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full bg-cp-600 text-white font-semibold text-base hover:bg-cp-700 transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5"
          >
            Launch Dashboard
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
            </svg>
          </button>
          <button
            onClick={() => scrollTo('architecture')}
            className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full border border-gray-200 text-gray-700 font-semibold text-base hover:border-cp-300 hover:text-cp-600 transition-all bg-white"
          >
            View Architecture
          </button>
        </div>

        <div className="inline-flex flex-col sm:flex-row items-center gap-4 sm:gap-10 px-8 py-4.5 rounded-2xl bg-white border border-gray-200/80 shadow-xs">
          {[
            { value: '< 2ms', label: 'Tier 1 Latency Budget' },
            { value: '100%', label: 'Deterministic Policy SLA' },
            { value: '3', label: 'Enterprise Benchmarks' },
          ].map((stat, i) => (
            <React.Fragment key={stat.label}>
              {i > 0 && <div className="hidden sm:block w-px h-8 bg-gray-200" />}
              <div className="text-center sm:text-left">
                <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
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
      title: 'Bereavement Policy Hallucination',
      summary:
        "Customer support AI promised a non-existent 50% retroactive bereavement refund. Civil tribunal held the airline liable for policy claims generated by its ungrounded AI model.",
      impact: 'Legal liability & financial restitution',
    },
    {
      company: 'Zillow iBuying',
      title: 'Compounding Valuation Model Drift',
      summary:
        "Automated valuation model experienced stateful upward pricing drift across sequential decisions, overvaluing housing stock. Resulted in a $304M asset write-down.",
      impact: '$304M inventory write-down',
    },
    {
      company: 'Enterprise Copilot',
      title: 'PII Exfiltration in Response Output',
      summary:
        'Internal support assistant echoed unredacted payment card details and SSNs in response payloads visible to unauthorized internal operational teams.',
      impact: 'Regulatory non-compliance risk',
    },
  ];

  return (
    <section className="py-24 bg-white" id="scenarios">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-100 border border-slate-200 mb-5">
            <span className="text-xs font-semibold tracking-wider text-slate-700 uppercase">Case Benchmarks</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 tracking-tight">
            Documented Failure Modes in Production AI
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {incidents.map((inc) => (
            <div
              key={inc.company}
              className="relative bg-white border border-gray-200/90 rounded-2xl p-7 shadow-xs hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 flex flex-col"
            >
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-100 border border-slate-200 mb-5 self-start">
                <span className="w-1.5 h-1.5 rounded-full bg-slate-600" />
                <span className="text-[10px] font-semibold tracking-wider text-slate-700 uppercase">Documented Event</span>
              </div>

              <h3 className="text-xl font-bold text-gray-900 mb-1">{inc.company}</h3>
              <p className="text-xs font-semibold text-cp-700 mb-4">{inc.title}</p>
              <p className="text-sm text-gray-600 leading-relaxed flex-1">{inc.summary}</p>

              <div className="mt-5 pt-4 border-t border-gray-100 flex items-center gap-2">
                <AlertTriangleIcon className="w-4 h-4 text-rose-700 shrink-0" />
                <span className="text-xs font-medium text-rose-900">{inc.impact}</span>
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
      icon: ShieldCheckIcon,
      title: 'PII Redaction Scanner',
      desc: 'Deterministic regex engine with Luhn validation for credit cards, SSNs, and credentials.',
    },
    {
      icon: ShieldAlertIcon,
      title: 'Prompt Injection Sentinel',
      desc: 'Fast pattern matching for jailbreaks, system prompt extraction, and adversarial instruction.',
    },
    {
      icon: TrendingUpIcon,
      title: 'Valuation Drift Tracking',
      desc: 'Stateful Exponential Moving Average (EMA) detector catching cumulative multi-turn pricing drift.',
    },
    {
      icon: TargetIcon,
      title: 'NLI Grounding Verifier',
      desc: 'Unit-aware claim decomposition validating model output against RAG context documents.',
    },
  ];

  return (
    <section className="py-24 bg-gray-50/70 border-y border-gray-200/80" id="how-it-works">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-cp-50 border border-cp-200 mb-5">
            <span className="text-xs font-semibold tracking-wider text-cp-800 uppercase">Architecture</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 tracking-tight mb-4">
            Multi-Tier Pipeline & Policy Router
          </h2>
          <p className="text-base text-gray-600 max-w-2xl mx-auto">
            Parallel fast scanners evaluate high-frequency security risks in under 2ms, triggering deep NLI verification only when required.
          </p>
        </div>

        {/* Architecture Flow Diagram */}
        <div className="bg-white border border-gray-200 rounded-2xl p-8 mb-16 shadow-xs" id="architecture">
          <div className="flex flex-col items-center gap-6">
            <div className="flex items-center gap-3 text-xs font-mono font-medium text-gray-600">
              <span className="px-3 py-1.5 bg-gray-100 border border-gray-200 rounded-lg">User Request</span>
              <span>→</span>
              <span className="px-3 py-1.5 bg-gray-100 border border-gray-200 rounded-lg">LLM Inference</span>
              <span>→</span>
              <span className="px-3 py-1.5 bg-cp-50 border border-cp-200 text-cp-700 font-semibold rounded-lg">Candidate Output</span>
            </div>

            <div className="w-full max-w-3xl border-2 border-cp-200 bg-cp-50/30 rounded-2xl p-6 relative">
              <div className="absolute -top-3 left-6 px-3 py-0.5 bg-cp-600 text-white text-[10px] font-bold rounded-md uppercase tracking-wider">
                ControlPlane.ai Gateway
              </div>

              <div className="space-y-4 pt-2">
                <div className="bg-white border border-gray-200 rounded-xl p-4">
                  <div className="text-[11px] font-bold tracking-wider text-gray-500 uppercase mb-3">
                    Tier 1 — Parallel Fast Scanners (&lt;2ms)
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div className="flex items-center gap-2 p-2.5 bg-gray-50 border border-gray-200/80 rounded-lg text-xs font-medium text-gray-800">
                      <ShieldCheckIcon className="w-4 h-4 text-cp-600" />
                      <span>PII Redactor</span>
                    </div>
                    <div className="flex items-center gap-2 p-2.5 bg-gray-50 border border-gray-200/80 rounded-lg text-xs font-medium text-gray-800">
                      <ShieldAlertIcon className="w-4 h-4 text-cp-600" />
                      <span>Injection Sentinel</span>
                    </div>
                    <div className="flex items-center gap-2 p-2.5 bg-gray-50 border border-gray-200/80 rounded-lg text-xs font-medium text-gray-800">
                      <TrendingUpIcon className="w-4 h-4 text-cp-600" />
                      <span>Drift Sentinel</span>
                    </div>
                  </div>
                </div>

                <div className="bg-white border border-gray-200 rounded-xl p-4">
                  <div className="text-[11px] font-bold tracking-wider text-gray-500 uppercase mb-3">
                    Tier 2 — Conditional Grounding Verifier (NLI)
                  </div>
                  <div className="flex items-center gap-2 p-2.5 bg-cp-50/80 border border-cp-200/80 rounded-lg text-xs font-medium text-cp-900">
                    <TargetIcon className="w-4 h-4 text-cp-600" />
                    <span>Unit-Aware Atomic Entailment Verification against RAG Context</span>
                  </div>
                </div>

                <div className="flex items-center justify-between bg-gray-900 text-white rounded-xl p-4 text-xs font-mono">
                  <span className="font-semibold text-gray-300">Policy Router Action Matrix</span>
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded text-[10px]">ALLOW</span>
                    <span className="px-2 py-0.5 bg-blue-500/20 text-blue-300 border border-blue-500/30 rounded text-[10px]">INLINE_EDIT</span>
                    <span className="px-2 py-0.5 bg-amber-500/20 text-amber-300 border border-amber-500/30 rounded text-[10px]">QUARANTINE</span>
                    <span className="px-2 py-0.5 bg-rose-500/20 text-rose-300 border border-rose-500/30 rounded text-[10px]">BLOCK</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 text-xs font-mono font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-4 py-2 rounded-xl">
              <ShieldCheckIcon className="w-4 h-4" />
              <span>Sanitized & Governed Payload Delivered to Client</span>
            </div>
          </div>
        </div>

        {/* Feature Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((f) => {
            const Icon = f.icon;
            return (
              <div
                key={f.title}
                className="bg-white border border-gray-200/90 rounded-2xl p-6 shadow-xs hover:shadow-md transition-all"
              >
                <div className="w-10 h-10 rounded-xl bg-cp-50 border border-cp-100 flex items-center justify-center text-cp-600 mb-4">
                  <Icon className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-gray-900 mb-2">{f.title}</h3>
                <p className="text-xs text-gray-600 leading-relaxed">{f.desc}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

/* ──────────────────────────────────────────────────────────────
   Footer
   ────────────────────────────────────────────────────────────── */
const Footer: React.FC = () => (
  <footer className="bg-gray-900 text-gray-400 py-12 border-t border-gray-800">
    <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-6 text-xs">
      <div className="flex items-center gap-3">
        <LogoMark size="sm" />
        <div>
          <div className="font-bold text-white text-sm">ControlPlane.ai</div>
          <div className="text-gray-500">Real-Time Risk Detection & Governance Gateway</div>
        </div>
      </div>

      <div className="text-center md:text-right text-gray-500">
        <div>Accenture Innovation Challenge 2026 — Track: AI Oversight</div>
        <div className="mt-1 font-mono text-gray-400">Team High Performance Athletes</div>
      </div>
    </div>
  </footer>
);

/* ──────────────────────────────────────────────────────────────
   Landing Main Export
   ────────────────────────────────────────────────────────────── */
export const Landing: React.FC = () => {
  return (
    <div className="min-h-screen bg-white font-sans text-gray-900 antialiased">
      <Navbar />
      <Hero />
      <RealFailures />
      <HowItWorks />
      <Footer />
    </div>
  );
};
