import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Flame,
  Activity,
  ArrowRight,
  Play,
  Pause,
  Bot,
  ShieldCheck,
  Zap,
  Gauge,
  Thermometer,
  Layers,
  X
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function HeroSection() {
  const [isPlaying, setIsPlaying] = useState(true);
  const [showVideoModal, setShowVideoModal] = useState(false);

  return (
    <section className="relative min-h-[92vh] flex items-center justify-center overflow-hidden border-b border-dark-border/60 bg-transparent">
      {/* Ambient Gradient Overlays for High-Contrast Hero Text */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent" />
        <div className="absolute inset-0 bg-radial-gradient from-transparent via-black/40 to-black/80" />

        {/* Ambient Grid overlay */}
        <div
          className="absolute inset-0 opacity-15"
          style={{
            backgroundImage: 'radial-gradient(circle, #555555 1px, transparent 1px)',
            backgroundSize: '32px 32px',
          }}
        />
      </div>

      {/* Video Simulation HUD Badges in Top Corners */}
      <div className="absolute top-6 left-6 z-20 hidden md:flex items-center gap-3">
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-neutral-950/80 border border-dark-border backdrop-blur-md text-[11px] font-mono text-neutral-300">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span>ROBOT TELEMETRY: LIVE LINK (30 FPS)</span>
        </div>
      </div>

      <div className="absolute top-6 right-6 z-20 hidden md:flex items-center gap-2">
        <button
          onClick={() => setIsPlaying(!isPlaying)}
          className="px-3 py-1.5 rounded-full bg-neutral-900/80 border border-dark-border text-[11px] font-mono text-neutral-300 hover:text-white flex items-center gap-1.5 backdrop-blur-md transition-colors"
        >
          {isPlaying ? <Pause className="w-3 h-3 text-cyan-400" /> : <Play className="w-3 h-3 text-cyan-400" />}
          <span>{isPlaying ? 'PAUSE BG STREAM' : 'PLAY BG STREAM'}</span>
        </button>
      </div>

      {/* Hero Central Content */}
      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center py-20">
        <motion.div
          initial={{ opacity: 0, y: 25 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        >
          {/* Top Pill */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-neutral-900/90 border border-neutral-700/80 text-xs text-neutral-300 mb-8 backdrop-blur-md shadow-glow-sm">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
            <span className="font-mono text-cyan-300 font-semibold tracking-wide">AUTONOMOUS SHIP CUTTING PLATFORM</span>
            <span className="text-neutral-600 hidden sm:inline">•</span>
            <span className="text-neutral-400 hidden sm:inline">ZERO-PERSONNEL HAZARD ZONES</span>
          </div>

          {/* Main Headline */}
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-white uppercase leading-[1.08]">
            Heavy Metal Robotic <br />
            <span className="bg-gradient-to-r from-white via-neutral-200 to-neutral-500 bg-clip-text text-transparent">
              Dismantling & Yield Control
            </span>
          </h1>

          {/* Subtitle */}
          <p className="mt-6 text-sm sm:text-base lg:text-lg text-text-secondary max-w-3xl mx-auto leading-relaxed">
            Eliminate shipyard casualties and accelerate dry dock scrapping cycles by <span className="text-white font-semibold">400%</span>.
            Autonomous magnetic crawler units execute millimeter-precise thermal cuts guided by AI neural vision and live spectrometry.
          </p>

          {/* CTA Group */}
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to="/operations/live"
              className="btn-primary text-sm px-8 py-3.5 w-full sm:w-auto font-semibold flex items-center justify-center gap-2 group shadow-glow"
            >
              <Activity className="w-4 h-4 text-black" />
              <span>Launch Live Dashboard</span>
              <ArrowRight className="w-4 h-4 text-black group-hover:translate-x-1 transition-transform" />
            </Link>

            <button
              onClick={() => setShowVideoModal(true)}
              className="btn-secondary text-sm px-7 py-3.5 w-full sm:w-auto flex items-center justify-center gap-2 group"
            >
              <div className="w-5 h-5 rounded-full bg-cyan-500/20 border border-cyan-400/40 flex items-center justify-center">
                <Play className="w-2.5 h-2.5 text-cyan-300 fill-cyan-300" />
              </div>
              <span>Watch Robot Cut Demo (1080p)</span>
            </button>

            <Link
              to="/dashboard/chatbot"
              className="btn-outline text-sm px-6 py-3.5 w-full sm:w-auto flex items-center justify-center gap-2"
            >
              <Bot className="w-4 h-4 text-accent-cyan" />
              <span>AI Cutting Advisor</span>
            </Link>
          </div>
        </motion.div>

        {/* Live Crawler Telemetry HUD Bar */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-3.5 border-t border-dark-border pt-10 text-left"
        >
          <div className="card-surface p-4 bg-neutral-950/80 border-dark-border">
            <div className="flex items-center justify-between text-neutral-400 text-xs mb-1 font-mono">
              <span>PLASMA POWER</span>
              <Flame className="w-3.5 h-3.5 text-orange-400" />
            </div>
            <div className="text-xl font-bold font-mono text-white">400 AMPS</div>
            <div className="text-[11px] text-neutral-500 font-mono">O2 / Compressed Air Shield</div>
          </div>

          <div className="card-surface p-4 bg-neutral-950/80 border-dark-border">
            <div className="flex items-center justify-between text-neutral-400 text-xs mb-1 font-mono">
              <span>TRAVERSE VELOCITY</span>
              <Gauge className="w-3.5 h-3.5 text-accent-cyan" />
            </div>
            <div className="text-xl font-bold font-mono text-cyan-300">142.5 CM/MIN</div>
            <div className="text-[11px] text-neutral-500 font-mono">Continuous feed tracking</div>
          </div>

          <div className="card-surface p-4 bg-neutral-950/80 border-dark-border">
            <div className="flex items-center justify-between text-neutral-400 text-xs mb-1 font-mono">
              <span>MAX PLATE THICKNESS</span>
              <Layers className="w-3.5 h-3.5 text-emerald-400" />
            </div>
            <div className="text-xl font-bold font-mono text-white">80 MM STEEL</div>
            <div className="text-[11px] text-neutral-500 font-mono">AH36 marine grade alloy</div>
          </div>

          <div className="card-surface p-4 bg-neutral-950/80 border-dark-border">
            <div className="flex items-center justify-between text-neutral-400 text-xs mb-1 font-mono">
              <span>MAGNETIC TRACTION</span>
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            </div>
            <div className="text-xl font-bold font-mono text-emerald-400">850 KG HOLD</div>
            <div className="text-[11px] text-neutral-500 font-mono">Vertical & inverted grip</div>
          </div>
        </motion.div>
      </div>

      {/* Video Demo Modal */}
      <AnimatePresence>
        {showVideoModal && (
          <div
            onClick={() => setShowVideoModal(false)}
            className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="max-w-4xl w-full bg-dark-card border border-neutral-700 rounded-2xl overflow-hidden shadow-2xl"
            >
              <div className="p-4 border-b border-dark-border flex items-center justify-between bg-neutral-950">
                <div className="flex items-center gap-2">
                  <Flame className="w-4 h-4 text-orange-400" />
                  <span className="text-xs font-mono font-bold text-white uppercase">
                    TITAN-X1 PRO — FIELD CUTTING RECORDING (400A PLASMA)
                  </span>
                </div>
                <button
                  onClick={() => setShowVideoModal(false)}
                  className="p-1 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="relative aspect-video bg-black flex items-center justify-center overflow-hidden">
                <img
                  src="https://images.unsplash.com/photo-1504917599217-d4dc5ebe6122?auto=format&fit=crop&w=1600&q=80"
                  alt="Robot cutting preview"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center text-center p-6">
                  <div className="w-16 h-16 rounded-full bg-cyan-500/20 border border-cyan-400 flex items-center justify-center text-cyan-300 mb-4 animate-pulse">
                    <Flame className="w-8 h-8 text-cyan-300" />
                  </div>
                  <h3 className="text-lg font-bold text-white">Autonomous Plasma Hull Penetration</h3>
                  <p className="text-xs text-neutral-300 max-w-md mt-2 font-mono">
                    High-definition thermal plasma torch cutting 35mm transverse bulkhead with auxiliary slag exhaust vacuum and computer-vision seam tracking.
                  </p>
                  <span className="badge bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] font-mono mt-4">
                    ZERO WORKER INJURIES RECORDED
                  </span>
                </div>
              </div>

              <div className="p-4 bg-neutral-950 border-t border-dark-border flex items-center justify-between text-xs text-neutral-400 font-mono">
                <span>Feed: 142 cm/min • Arc: 18,400°C</span>
                <button
                  onClick={() => setShowVideoModal(false)}
                  className="btn-primary text-xs px-4 py-1.5"
                >
                  Close Video
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </section>
  );
}

