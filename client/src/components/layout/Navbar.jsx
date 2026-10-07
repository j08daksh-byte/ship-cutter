import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Cpu, Menu, X, ArrowUpRight } from 'lucide-react';

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('');
  const location = useLocation();
  const navigate = useNavigate();

  const navLinks = [
    { label: 'About', href: '/#about', id: 'about' },
    { label: 'How It Works', href: '/#how-it-works', id: 'how-it-works' },
    { label: 'Capabilities', href: '/#services', id: 'services' },
    { label: 'Gallery', href: '/#gallery', id: 'gallery' },
    { label: 'Field Logs', href: '/#field-logs', id: 'field-logs' },
    { label: 'Contact', href: '/#contact', id: 'contact' },
  ];

  // Active section tracking via IntersectionObserver when on homepage
  useEffect(() => {
    if (location.pathname !== '/') {
      setActiveSection('');
      return;
    }

    const observerCallback = (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          setActiveSection(entry.target.id);
        }
      });
    };

    const observer = new IntersectionObserver(observerCallback, {
      rootMargin: '-20% 0px -70% 0px',
      threshold: 0,
    });

    navLinks.forEach((link) => {
      const el = document.getElementById(link.id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [location.pathname]);

  const handleNavClick = (e, item) => {
    setMobileMenuOpen(false);

    if (item.href.startsWith('/#')) {
      const targetId = item.id;
      if (location.pathname === '/') {
        e.preventDefault();
        const element = document.getElementById(targetId);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'start' });
          window.history.pushState(null, '', item.href);
          setActiveSection(targetId);
        }
      } else {
        // From other pages, navigate to home with hash
        e.preventDefault();
        navigate(item.href);
      }
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full bg-black/85 backdrop-blur-md border-b border-dark-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand Logo */}
        <Link to="/" className="flex items-center gap-3 group">
          <div className="w-9 h-9 rounded-lg bg-neutral-900 border border-neutral-700 flex items-center justify-center text-white group-hover:border-neutral-400 group-hover:shadow-glow-sm transition-all duration-300">
            <Cpu className="w-5 h-5 text-accent-cyan" />
          </div>
          <div className="flex flex-col">
            <span className="font-bold tracking-wider text-base text-white flex items-center gap-1.5">
              TITAN-CUT
              <span className="text-[10px] uppercase font-mono px-1.5 py-0.2 bg-neutral-800 text-neutral-300 rounded border border-neutral-700">
                AI BOT
              </span>
            </span>
            <span className="text-[10px] text-text-secondary tracking-widest uppercase">
              Robotic Ship Dismantling
            </span>
          </div>
        </Link>

        {/* Desktop Navigation Links (Smooth scroll active) */}
        <nav className="hidden md:flex items-center gap-7">
          {navLinks.map((item) => {
            const isActive =
              (location.pathname === '/' && activeSection === item.id) ||
              location.hash === `#${item.id}`;

            return (
              <a
                key={item.label}
                href={item.href}
                onClick={(e) => handleNavClick(e, item)}
                className={`text-sm font-medium transition-all duration-200 cursor-pointer relative py-1 ${
                  isActive
                    ? 'text-white font-semibold'
                    : 'text-neutral-400 hover:text-white'
                }`}
              >
                {item.label}
                {isActive && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-accent-cyan rounded-full shadow-glow-sm" />
                )}
              </a>
            );
          })}
        </nav>

        {/* Right CTA */}
        <div className="hidden md:flex items-center gap-4">
          <div className="flex items-center gap-2 text-xs text-neutral-400 bg-neutral-900/90 px-3 py-1.5 rounded-full border border-dark-border">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="font-mono text-emerald-400 font-medium">ROBOT ONLINE</span>
          </div>

          <Link
            to="/operations/live"
            className="btn-primary group flex items-center gap-1.5 shadow-glow-sm"
          >
            <span>Live Operations</span>
            <ArrowUpRight className="w-4 h-4 text-black group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
          </Link>
        </div>

        {/* Mobile menu toggle */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden p-2 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-900 border border-transparent hover:border-neutral-800"
          aria-label="Toggle navigation menu"
        >
          {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-dark-border bg-black/95 px-4 pt-3 pb-6 space-y-3">
          {navLinks.map((item) => (
            <a
              key={item.label}
              href={item.href}
              onClick={(e) => handleNavClick(e, item)}
              className="block py-2.5 text-base font-medium text-neutral-300 hover:text-white transition-colors cursor-pointer"
            >
              {item.label}
            </a>
          ))}
          <div className="pt-3 border-t border-dark-border flex flex-col gap-3">
            <div className="flex items-center gap-2 text-xs text-emerald-400 py-1 font-mono">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>Titan-X1 Robotic Unit Active</span>
            </div>
            <Link
              to="/operations/live"
              onClick={() => setMobileMenuOpen(false)}
              className="btn-primary w-full text-center"
            >
              Launch Dashboard
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}

