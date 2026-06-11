import React from "react";
import { ASSETS } from "@/lib/assets";
import { TID } from "@/lib/testIds";
import { ZenMascot } from "@/components/brand/Logo";
import ZenAura from "@/components/brand/ZenAura";
import { CreditCard, XCircle, Sliders } from "lucide-react";

const FinalCTA = ({ onCtaClick, onDemoClick }) => {
  return (
    <section
      data-testid={TID.cta.root}
      className="relative overflow-hidden text-white"
      style={{ background: "#040714" }}
    >
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: `url(${ASSETS.ctaBg})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          opacity: 0.95,
        }}
      />
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "linear-gradient(180deg, rgba(4,7,20,0.6) 0%, rgba(4,7,20,0.4) 50%, rgba(4,7,20,0.85) 100%)",
        }}
      />

      <div className="relative max-w-[1240px] mx-auto px-6 lg:px-8 py-16 lg:py-20">
        <div className="grid lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-4 flex justify-center items-center relative min-h-[420px] lg:min-h-[480px]">
            {/* Fallback aura — shows through when the video can't decode */}
            <div className="absolute inset-0 -mx-4 lg:-mx-8">
              <ZenAura theme="dark" intensity={0.9} />
            </div>
            {/* Animated video aura behind the mascot — tightly faded edges */}
            <div
              className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full overflow-hidden pointer-events-none"
              style={{
                width: 520,
                height: 520,
                maxWidth: "100%",
                WebkitMaskImage:
                  "radial-gradient(circle, #000 18%, rgba(0,0,0,0.55) 38%, rgba(0,0,0,0.18) 55%, transparent 70%)",
                maskImage:
                  "radial-gradient(circle, #000 18%, rgba(0,0,0,0.55) 38%, rgba(0,0,0,0.18) 55%, transparent 70%)",
              }}
            >
              <video
                className="w-full h-full object-cover"
                src={ASSETS.ctaVideo}
                autoPlay
                loop
                muted
                playsInline
                preload="auto"
                aria-hidden
              />
            </div>
            <ZenMascot
              size={358}
              className="relative z-10"
              style={{ filter: "drop-shadow(0 24px 50px rgba(86,140,255,0.55))" }}
            />
          </div>
          <div className="lg:col-span-8">
            <h2 className="font-display font-extrabold text-[32px] sm:text-[40px] lg:text-[48px] leading-[1.05] tracking-tight">
              Dedica tu tiempo a <span className="zt-grad-text">tu negocio,</span>
              <br /> no a tus <span className="zt-grad-text">facturas</span>
            </h2>
            <p className="mt-4 text-[14.5px] text-white/65 max-w-[600px]">
              Únete a miles de personas que ya eliminaron el estrés de facturar.
            </p>

            <div className="mt-7 flex flex-wrap gap-3">
              <button
                data-testid={TID.cta.primary}
                onClick={onCtaClick}
                className="zt-btn-primary text-white text-[15px] font-semibold px-6 py-3.5 rounded-full"
              >
                Comenzar Gratis
              </button>
              <button
                data-testid={TID.cta.secondary}
                onClick={onDemoClick}
                className="zt-btn-ghost-dark text-white text-[15px] font-medium px-5 py-3.5 rounded-full"
              >
                Solicitar Demo
              </button>
            </div>

            <div className="mt-7 flex flex-wrap gap-x-7 gap-y-3 text-[12.5px] text-white/55">
              <span className="inline-flex items-center gap-2">
                <CreditCard size={14} className="text-white/40" /> Sin tarjeta de crédito
              </span>
              <span className="inline-flex items-center gap-2">
                <XCircle size={14} className="text-white/40" /> Cancela cuando quieras
              </span>
              <span className="inline-flex items-center gap-2">
                <Sliders size={14} className="text-white/40" /> Configúralo en 1 minuto
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FinalCTA;
