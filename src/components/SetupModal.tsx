"use client";

import { useRef, useState, type MouseEvent } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { useGameStore, type ColorChoice } from "@/store/gameStore";

gsap.registerPlugin(useGSAP);

const COLOR_OPTIONS: { value: ColorChoice; label: string; sub: string; code: string }[] = [
  { value: "white", label: "ฝ่ายขาว", sub: "เดินก่อนทุกเกม", code: "WHT" },
  { value: "random", label: "สุ่ม", sub: "ให้เกมสุ่มสีให้", code: "RND" },
  { value: "black", label: "ฝ่ายดำ", sub: "AI เดินตาแรก", code: "BLK" },
];

const ELO_PRESETS = [800, 1000, 1200, 1400, 1600, 1800, 2000, 2300, 2600];

export default function SetupModal() {
  const startGame = useGameStore((s) => s.startGame);
  const [choice, setChoice] = useState<ColorChoice>("white");
  const [elo, setElo] = useState(1200);

  const modalRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const magneticBtnRef = useRef<HTMLButtonElement>(null);
  const colorRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const eloRef = useRef<HTMLDivElement>(null);

  // Entry animation
  useGSAP(() => {
    const ctx = gsap.context(() => {
      // Modal container snap-in
      gsap.fromTo(
        modalRef.current,
        { opacity: 0, scale: 0.95, y: 20 },
        { opacity: 1, scale: 1, y: 0, duration: 0.25, ease: "power2.out" }
      );

      // Content stagger
      const children = contentRef.current?.children;
      if (children) {
        gsap.fromTo(
          children,
          { opacity: 0, x: -16 },
          { opacity: 1, x: 0, duration: 0.2, ease: "power2.out", stagger: 0.06, delay: 0.1 }
        );
      }

      // Color cards pop
      gsap.fromTo(
        colorRefs.current.filter(Boolean),
        { opacity: 0, y: 12, scale: 0.95 },
        { opacity: 1, y: 0, scale: 1, duration: 0.18, ease: "back.out(1.4)", stagger: 0.05, delay: 0.2 }
      );
    }, modalRef);

    return () => ctx.revert();
  }, []);

  // Magnetic cursor interaction
  const handleMouseMove = (e: MouseEvent<HTMLButtonElement>) => {
    const btn = magneticBtnRef.current;
    if (!btn) return;

    const rect = btn.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;

    gsap.to(btn, {
      x: x * 0.2,
      y: y * 0.3,
      duration: 0.15,
      ease: "power2.out",
    });
  };

  const handleMouseLeave = () => {
    const btn = magneticBtnRef.current;
    if (!btn) return;
    gsap.to(btn, {
      x: 0,
      y: 0,
      duration: 0.2,
      ease: "elastic.out(1, 0.5)",
    });
  };

  // Color selection with GSAP feedback
  const handleColorSelect = (idx: number, value: ColorChoice) => {
    setChoice(value);
    const btn = colorRefs.current[idx];
    if (btn) {
      gsap.fromTo(
        btn,
        { scale: 0.95 },
        { scale: 1, duration: 0.15, ease: "back.out(2)" }
      );
    }
  };

  // ELO slider change animation
  const handleEloChange = (value: number) => {
    setElo(value);
    if (eloRef.current) {
      gsap.fromTo(
        eloRef.current,
        { scale: 1.1, color: "var(--accent-hazard)" },
        { scale: 1, color: "var(--accent-hazard)", duration: 0.2, ease: "power2.out" }
      );
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-6 py-12 bg-[var(--bg-base)]">
      <div 
        ref={modalRef}
        className="w-full max-w-xl tactical-panel p-8 sm:p-10 opacity-0"
      >
        {/* Hazard stripe header */}
        <div className="absolute top-0 left-0 right-0 h-1 hazard-stripes animate-hazard-scroll" />
        
        <div ref={contentRef}>
          {/* Header Block */}
          <div className="flex items-center gap-3 mb-1">
            <span className="status-dot text-[var(--accent-hazard)]" />
            <p className="pixel-text text-[10px] tracking-[0.3em] text-[var(--accent-hazard)]">
              NEW // SESSION
            </p>
          </div>
          
          <h1 className="font-display text-3xl md:text-4xl font-black italic uppercase tracking-tight mb-2 text-[var(--foreground)]">
            ตั้งค่าเกม
          </h1>
          
          <div className="flex items-center gap-2 mb-10">
            <span className="notation text-[10px] text-[var(--foreground-dim)] tracking-wider">
              SYS.CHESS.AI_COACH.v2.1
            </span>
            <span className="flex-1 h-px bg-[var(--border-heavy)]" />
            <span className="notation text-[10px] text-[var(--accent-orange)]">
              READY
            </span>
          </div>

          {/* Color Selection */}
          <div className="mb-10">
            <div className="flex items-center gap-2 mb-4">
              <span className="w-1 h-4 bg-[var(--accent-hazard)]" />
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-[var(--foreground-dim)]">
                เลือกสีที่จะเล่น
              </p>
            </div>
            
            <div className="grid grid-cols-3 gap-3">
              {COLOR_OPTIONS.map((opt, idx) => (
                <button
                  key={opt.value}
                  ref={(el) => { colorRefs.current[idx] = el; }}
                  onClick={() => handleColorSelect(idx, opt.value)}
                  className={`group relative border-2 p-4 text-left transition-all duration-150 cursor-pointer 
                    ${choice === opt.value
                      ? "border-[var(--accent-hazard)] bg-[var(--bg-panel-raised)]"
                      : "border-[var(--border-heavy)] hover:border-[var(--accent-orange)] bg-[var(--bg-panel)]"
                    }
                  `}
                  style={{ clipPath: "polygon(0 0, calc(100% - 6px) 0, 100% 6px, 100% 100%, 6px 100%, 0 calc(100% - 6px))" }}
                >
                  {/* Selection indicator */}
                  {choice === opt.value && (
                    <div className="absolute top-0 right-0 w-0 h-0 border-t-[20px] border-r-[20px] border-t-[var(--accent-hazard)] border-r-transparent" />
                  )}
                  
                  <div className="flex items-center gap-2 mb-2">
                    <span className="pixel-text text-[10px] text-[var(--accent-orange)]">
                      {opt.code}
                    </span>
                    <span
                      className={`inline-block w-3 h-3 border ${
                        opt.value === "white"
                          ? "bg-[var(--color-board-light)] border-[var(--foreground-dim)]"
                          : opt.value === "black"
                            ? "bg-[#1a1a1a] border-[var(--foreground-dim)]"
                            : "bg-gradient-to-br from-[var(--color-board-light)] to-[#1a1a1a] border-[var(--foreground-dim)]"
                      }`}
                    />
                  </div>
                  
                  <span className="font-bold text-sm text-[var(--foreground)] uppercase tracking-wide">
                    {opt.label}
                  </span>
                  <p className="text-[10px] text-[var(--foreground-dim)] mt-1 leading-tight">
                    {opt.sub}
                  </p>
                </button>
              ))}
            </div>
          </div>

          {/* ELO Difficulty Selection */}
          <div className="mb-12">
            <div className="flex items-center gap-2 mb-4">
              <span className="w-1 h-4 bg-[var(--accent-crimson)]" />
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-[var(--foreground-dim)]">
                ระดับความยาก
              </p>
            </div>
            
            <div className="flex items-baseline justify-between mb-4 px-1">
              <span className="pixel-text text-[10px] text-[var(--foreground-dim)]">
                DIFFICULTY_RATING
              </span>
              <div ref={eloRef} className="flex items-baseline gap-2">
                <span className="notation text-3xl font-bold text-[var(--accent-hazard)]">
                  {elo}
                </span>
                <span className="pixel-text text-xs text-[var(--foreground-dim)]">
                  ELO
                </span>
              </div>
            </div>

            {/* Custom Range Slider - Tactical Style */}
            <div className="relative mb-4">
              <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-1 bg-[var(--bg-panel-raised)]" />
              <div 
                className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-[var(--accent-hazard)] transition-all duration-150"
                style={{ width: `${((elo - 800) / (2850 - 800)) * 100}%` }}
              />
              <input
                type="range"
                min={800}
                max={2850}
                step={50}
                value={elo}
                onChange={(e) => handleEloChange(Number(e.target.value))}
                className="relative w-full h-6 bg-transparent appearance-none cursor-pointer
                  [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-5 
                  [&::-webkit-slider-thumb]:bg-[var(--accent-hazard)] [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-[var(--bg-base)]
                  [&::-webkit-slider-thumb]:shadow-[0_0_10px_rgba(255,214,0,0.5)]
                  [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:h-5 [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-[var(--bg-base)]
                  [&::-moz-range-thumb]:bg-[var(--accent-hazard)] [&::-moz-range-thumb]:cursor-pointer"
              />
            </div>

            <div className="flex flex-wrap gap-2">
              {ELO_PRESETS.map((preset) => (
                <button
                  key={preset}
                  onClick={() => handleEloChange(preset)}
                  className={`notation text-[11px] px-3 py-1.5 border-2 cursor-pointer transition-all duration-150 
                    ${elo === preset
                      ? "border-[var(--accent-hazard)] text-[var(--accent-hazard)] bg-[var(--accent-hazard)]/10"
                      : "border-[var(--border-heavy)] text-[var(--foreground-dim)] hover:border-[var(--accent-orange)] hover:text-[var(--foreground)]"
                    }
                  `}
                >
                  {preset}
                </button>
              ))}
            </div>
          </div>

          {/* Magnetic Start Button */}
          <button
            ref={magneticBtnRef}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            onClick={() => startGame(choice, elo)}
            className="w-full tactical-btn-primary text-lg py-4 relative overflow-hidden group"
          >
            {/* Scanline overlay */}
            <span className="absolute inset-0 bg-[repeating-linear-gradient(0deg,transparent,transparent_2px,rgba(0,0,0,0.1)_2px,rgba(0,0,0,0.1)_4px)] pointer-events-none z-10" />
            
            {/* Hover flash */}
            <span className="absolute inset-0 bg-white/0 group-hover:bg-white/10 transition-colors duration-150" />
            
            <span className="relative z-20 tracking-[0.15em] font-black uppercase">
              [ เริ่มเกม ]
            </span>
          </button>

          {/* Footer Warning */}
          <div className="mt-6 flex items-start gap-3 px-4 py-3 border border-[var(--border-heavy)] bg-[var(--bg-panel)]">
            <span className="pixel-text text-[var(--accent-orange)] text-lg leading-none mt-0.5">!</span>
            <p className="text-[11px] text-[var(--foreground-dim)] leading-relaxed">
              คำแนะนำจาก AI ต้องใช้{" "}
              <span className="font-medium text-[var(--accent-cyan)]">Ollama</span>{" "}
              รันอยู่ในเครื่อง (localhost:11434) พร้อมโมเดลที่ดึงไว้แล้ว
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}