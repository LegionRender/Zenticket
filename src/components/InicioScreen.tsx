import React from "react";
import { Ticket, Invoice, FiscalProfile } from "../types";
import { 
  Bell, ChevronRight, Camera, Check, 
  AlertCircle, Ticket as TicketIcon, Clock, 
  PieChart as PieChartIcon, Headphones, User,
  ShieldCheck, Loader2, Coffee
} from "lucide-react";
import { toast } from "sonner";

interface InicioScreenProps {
  tickets: Ticket[];
  invoices: Invoice[];
  fiscalProfile: FiscalProfile | null;
  onTabChange: (tab: string) => void;
  currentUserEmail?: string | null;
}

export default function InicioScreen({
  tickets = [],
  invoices = [],
  fiscalProfile,
  onTabChange,
  currentUserEmail
}: InicioScreenProps) {
  
  // Extract user first name dynamically from profile or email
  const fullName = fiscalProfile?.razonSocial || "";
  const firstName = fullName ? (fullName.split(" ")[0] || "Usuario") : (currentUserEmail ? currentUserEmail.split("@")[0] : "Usuario");

  // Dynamic values parsed in real time from our actual collections
  const totalTicketsCount = tickets.length;
  
  // 1. Pendientes (extracted, review, failed state we can address)
  const pendingToInvoiceCount = tickets.filter(
    (t) => t.status === "extracted" || t.status === "review"
  ).length;

  // 2. En Proceso (currently running through automation engine)
  const inProcessCount = tickets.filter(
    (t) => t.status === "processing"
  ).length;

  // 3. Facturas Emitidas (completed invoices counts in Vault)
  const emittedInvoicesCount = invoices.length;

  // 4. Critical alerts/failures needing admin or custom review attention
  const attentionNeededCount = tickets.filter(
    (t) => t.status === "failed"
  ).length;

  // Style helper for provider logos dynamically
  const getProviderLogo = (provider: string) => {
    const p = provider ? provider.toLowerCase() : "";
    if (p.includes("costco")) {
      return (
        <div className="w-[42px] h-[42px] rounded-xl border border-blue-100 bg-blue-50/50 flex flex-col items-center justify-center shrink-0">
          <span className="text-[10px] font-black text-blue-600 tracking-tighter uppercase">COST</span>
          <span className="text-[8px] font-extrabold text-red-500 tracking-widest leading-none">CO</span>
        </div>
      );
    }
    if (p.includes("oxxo")) {
      return (
        <div className="w-[42px] h-[42px] rounded-xl border border-red-150 bg-red-50/50 flex items-center justify-center shrink-0">
          <span className="text-[10px] font-black text-red-650 tracking-wider italic uppercase">OXXO</span>
        </div>
      );
    }
    if (p.includes("starbucks") || p.includes("alsea")) {
      return (
        <div className="w-[42px] h-[42px] rounded-xl border border-teal-100 bg-teal-50/50 flex items-center justify-center shrink-0">
          <span className="text-[12px] font-black text-teal-700">☕</span>
        </div>
      );
    }
    if (p.includes("walmart") || p.includes("aurrera")) {
      return (
        <div className="w-[42px] h-[42px] rounded-xl border border-indigo-100 bg-indigo-50/50 flex items-center justify-center shrink-0">
          <span className="text-[14px] font-black text-indigo-600">🛒</span>
        </div>
      );
    }
    
    // Default dynamic initials avatar
    const letter = provider ? provider.charAt(0).toUpperCase() : "T";
    return (
      <div className="w-[42px] h-[42px] rounded-xl border border-slate-150 bg-slate-50 flex items-center justify-center shrink-0 text-slate-800 font-display font-black text-sm">
        {letter}
      </div>
    );
  };

  return (
    <div className="flex flex-col text-[#07122F] font-sans select-none min-h-screen bg-[#F4F7FC]">
      
      {/* ==================== 1. DEEP ROYAL BLUE HEADER STATUS BLOCK ==================== */}
      <div className="bg-gradient-to-b from-[#0B3EE4] via-[#05229C] to-[#01144F] text-white pt-10 pb-20 px-5 rounded-b-[40px] shadow-lg relative overflow-hidden shrink-0">
        <div className="absolute right-[-20%] top-[-20%] w-60 h-60 rounded-full bg-blue-500/20 blur-3xl pointer-events-none" />
        <div className="absolute left-[-20%] bottom-[-20%] w-48 h-48 rounded-full bg-teal-400/10 blur-2xl pointer-events-none" />

        {/* Top Header Navbar: Avatar, Logo & Bell */}
        <div className="flex items-center justify-between mb-6 relative z-10">
          {/* Dynamic initials avatar (Replaced Unsplash mock image) */}
          <div className="w-[38px] h-[38px] rounded-full border border-white/20 bg-white/10 shrink-0 flex items-center justify-center font-display font-extrabold text-[12px] uppercase tracking-wider text-white shadow-inner">
            {firstName.slice(0, 2)}
          </div>

          {/* Centered ZenTicket Logo */}
          <div className="flex items-center gap-1.5 justify-center">
            <svg viewBox="0 0 100 100" className="w-[22px] h-[22px] text-white fill-current">
              <path d="M50 20C42 35 48 58 50 64C52 58 58 35 50 20Z" opacity="0.9" />
              <path d="M46 64C41 58 26 48 15 50C28 55 42 58 46 64Z" opacity="0.75" />
              <path d="M54 64C59 58 74 48 85 50C72 55 58 58 54 64Z" opacity="0.75" />
            </svg>
            <span className="text-[17.5px] font-black tracking-tight text-white select-none">
              ZenTicket
            </span>
          </div>

          {/* Right Action: Admin shield & Notification bell translucent badge */}
          <div className="flex items-center gap-2">
            {currentUserEmail === "legionrender@gmail.com" && (
              <button 
                onClick={() => onTabChange("admin")}
                className="w-[38px] h-[38px] rounded-full bg-amber-500/15 hover:bg-amber-500/25 flex items-center justify-center border border-amber-500/40 transition cursor-pointer relative"
                title="Consola de Administración (Admin)"
              >
                <ShieldCheck className="w-[18px] h-[18px] text-amber-400 stroke-[2.2]" />
                <span className="absolute -top-1 -right-1 bg-amber-500 text-white font-extrabold text-[7px] px-1 rounded-full border border-[#01144F] leading-tight">ADM</span>
              </button>
            )}

            <button 
              onClick={() => toast.info("No tienes alertas del SAT sin revisar.", { description: "Estado sincronizado" })}
              className="w-[38px] h-[38px] rounded-full bg-white/10 hover:bg-white/15 flex items-center justify-center border border-white/10 transition cursor-pointer relative"
            >
              <Bell className="w-4 h-4 text-white" />
              {attentionNeededCount > 0 && (
                <span className="absolute top-[10px] right-[10px] w-2.5 h-2.5 bg-amber-500 rounded-full ring-2 ring-[#031D79]" />
              )}
            </button>
          </div>
        </div>

        {/* Personalized Greetings heading styling */}
        <div className="mb-6 relative z-10 text-left">
          <h2 className="text-[25px] font-black tracking-tight text-white leading-none">
            Hola, {firstName}
          </h2>
          <span className="text-[11.5px] text-blue-100 font-semibold block mt-1.5 tracking-tight select-none opacity-85">
            {totalTicketsCount === 0 
              ? "Te damos la bienvenida a tu gestor contable" 
              : `Tienes ${totalTicketsCount} tickets en tu historial operativo`}
          </span>
        </div>

        {/* Stats horizontal side-by-side block matching mockup */}
        <div className="flex justify-between items-center bg-white/[0.03] backdrop-filter border border-white/5 rounded-2xl p-4.5 mb-1.5 relative z-10">
          
          {/* Left item: tickets este mes (computed real-time) */}
          <div className="flex items-center gap-3.5 w-[50%]">
            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-white shrink-0">
              <TicketIcon className="w-5 h-5 text-blue-200" />
            </div>
            <div className="text-left min-w-0">
              <span className="text-[23px] font-black block leading-none text-white tracking-tight">
                {totalTicketsCount}
              </span>
              <span className="text-[10px] text-blue-100 font-bold block mt-1 tracking-tight">
                tickets totales
              </span>
            </div>
          </div>

          {/* Horizontal dividing thin line */}
          <div className="w-px h-10 bg-white/10 shrink-0 self-center" />

          {/* Right item: por facturar (computed real-time) */}
          <div className="flex items-center gap-3.5 w-[50%] pl-4.5">
            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-white shrink-0">
              <svg className="w-5 h-5 text-blue-200 fill-none stroke-current" strokeWidth="2" viewBox="0 0 24 24">
                <rect x="4" y="2" width="16" height="20" rx="2" />
                <path d="M12 11h2.5a1.5 1.5 0 0 1 0 3H12V11zM11 8h2.5a1.5 1.5 0 0 0 0-3H11v3zM12 5v14" />
              </svg>
            </div>
            <div className="text-left min-w-0">
              <span className="text-[23px] font-black block leading-none text-white tracking-tight">
                {pendingToInvoiceCount}
              </span>
              <span className="text-[10px] text-blue-100 font-bold block mt-1 tracking-tight">
                por procesar
              </span>
            </div>
          </div>

        </div>

      </div>

      {/* ==================== 2. MAIN FLOATING INNER LAYOUT ==================== */}
      <div className="flex-1 px-4 pb-12 flex flex-col gap-5 -mt-14 relative z-20">

        {/* 2.1 SCANNER FLOATING CARD (STYLISH BLUE GRADIENT) - MAIN DIRECT ACTION CTA */}
        <button 
          onClick={() => onTabChange("capturar")}
          className="w-full bg-gradient-to-r from-[#0B53F4] to-[#124ADB] rounded-[24px] p-5 shadow-[0_12px_28px_rgba(11,83,244,0.30)] border border-blue-400/10 flex items-center justify-between text-left transition hover:scale-[1.01] active:scale-[0.98] cursor-pointer"
        >
          <div className="flex items-center gap-3.5">
            
            <div className="w-[48px] h-[48px] rounded-xl border border-white/40 flex items-center justify-center relative bg-white/5 shrink-0">
              <span className="absolute top-1 left-1 w-2 h-2 border-t-2 border-l-2 border-white rounded-tl-xs" />
              <span className="absolute top-1 right-1 w-2 h-2 border-t-2 border-r-2 border-white rounded-tr-xs" />
              <span className="absolute bottom-1 left-1 w-2 h-2 border-b-2 border-l-2 border-white rounded-bl-xs" />
              <span className="absolute bottom-1 right-1 w-2 h-2 border-b-2 border-r-2 border-white rounded-br-xs" />
              
              <Camera className="w-[20px] h-[20px] text-white" strokeWidth={2.2} />
            </div>

            <div>
              <h3 className="text-[17px] font-black tracking-tight text-white leading-none">
                Escanear ticket
              </h3>
              <span className="text-[10px] text-blue-100 font-bold block mt-1 tracking-tight opacity-90 leading-tight">
                Captura un ticket y timbra tu factura SAT al instante
              </span>
            </div>

          </div>

          <ChevronRight className="w-5 h-5 text-white/90 shrink-0" strokeWidth={2.5} />
        </button>

        {/* 2.2 RESUMEN DE ACTIVIDAD CARDS (GRID OF 3 REAL-TIME STATUS BLOCKS) */}
        <div className="flex flex-col gap-3">
          <h4 className="text-[14px] font-black text-[#07122F] tracking-tight text-left">
            Estado de tu facturación
          </h4>

          <div className="grid grid-cols-3 gap-2.5">
            {/* Card 1: Pendientes */}
            <div 
              onClick={() => onTabChange("tickets")}
              className="bg-white border border-slate-100 rounded-[18px] p-3 flex flex-col justify-between text-left h-[88px] cursor-pointer hover:border-blue-200 transition-all shadow-3xs"
            >
              <div className="w-7 h-7 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
                <span className="text-xs font-black select-none">!</span>
              </div>

              <div className="leading-none mt-1">
                <span className="text-[10px] font-bold text-slate-500 block tracking-tight">
                  Pendientes
                </span>
                <span className="text-[18px] font-black text-slate-800 tracking-tight block mt-1">
                  {pendingToInvoiceCount}
                </span>
              </div>
            </div>

            {/* Card 2: En Proceso */}
            <div 
              onClick={() => onTabChange("tickets")}
              className="bg-white border border-slate-100 rounded-[18px] p-3 flex flex-col justify-between text-left h-[88px] cursor-pointer hover:border-blue-200 transition-all shadow-3xs"
            >
              <div className="w-7 h-7 rounded-full bg-blue-50 text-[#0B53F4] flex items-center justify-center shrink-0">
                <Clock className="w-3.5 h-3.5" />
              </div>

              <div className="leading-none mt-1">
                <span className="text-[10px] font-bold text-slate-500 block tracking-tight">
                  En proceso
                </span>
                <span className="text-[18px] font-black text-slate-800 tracking-tight block mt-1">
                  {inProcessCount}
                </span>
              </div>
            </div>

            {/* Card 3: Facturadas */}
            <div 
              onClick={() => onTabChange("gastos")}
              className="bg-white border border-slate-100 rounded-[18px] p-3 flex flex-col justify-between text-left h-[88px] cursor-pointer hover:border-blue-200 transition-all shadow-3xs"
            >
              <div className="w-7 h-7 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                <div className="w-4 h-4 rounded-sm border border-emerald-650 flex items-center justify-center">
                  <Check className="w-2.5 h-2.5 stroke-[3]" />
                </div>
              </div>

              <div className="leading-none mt-1">
                <span className="text-[10px] font-bold text-slate-500 block tracking-tight">
                  Emitidas
                </span>
                <span className="text-[18px] font-black text-slate-800 tracking-tight block mt-1">
                  {emittedInvoicesCount}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* 2.3 ROW GRID: RECONOCIMIENTO & CONTROL */}
        <div className="grid grid-cols-2 gap-3.5">
          
          {/* Card left: Alertas y Pendientes */}
          <div className="bg-white border border-slate-100 rounded-[22px] p-4 text-left shadow-3xs flex flex-col h-[154px] justify-between">
            <h4 className="text-[12px] font-black text-slate-800 tracking-tight">
              Control de Alertas
            </h4>

            <div className="flex-1 flex flex-col gap-2.5 justify-center">
              {attentionNeededCount > 0 ? (
                <div 
                  onClick={() => onTabChange("tickets")}
                  className="flex items-center justify-between group cursor-pointer"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <div className="w-5 h-5 rounded-full bg-red-100 flex items-center justify-center shrink-0">
                      <span className="text-[10px] font-black text-red-650">!</span>
                    </div>
                    <span className="text-[9.5px] font-bold text-red-700 truncate tracking-tight group-hover:underline">
                      {attentionNeededCount} ticket(s) con error
                    </span>
                  </div>
                  <ChevronRight className="w-3.5 h-3.5 text-red-500 shrink-0" />
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 rounded-full bg-emerald-50 flex items-center justify-center shrink-0">
                    <Check className="w-3 h-3 text-emerald-650" />
                  </div>
                  <span className="text-[9.5px] font-semibold text-slate-500 tracking-tight">
                    Ningún ticket con fallas SAT.
                  </span>
                </div>
              )}

              <div className="h-px bg-slate-100" />

              <div 
                onClick={() => onTabChange("cuenta")}
                className="flex items-center justify-between group cursor-pointer"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <div className="w-5 h-5 rounded-full bg-blue-50 flex items-center justify-center shrink-0">
                    <User className="w-3 h-3 text-blue-600" />
                  </div>
                  <div className="leading-tight min-w-0">
                    <span className="text-[9.5px] font-bold text-slate-700 block truncate tracking-tight group-hover:text-[#0B53F4]">
                      Verificación fiscal
                    </span>
                    <span className="text-[9px] font-semibold text-slate-400 block truncate">
                      {fiscalProfile ? "RFC Configurado" : "Faltan datos fiscales"}
                    </span>
                  </div>
                </div>
                <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              </div>
            </div>
          </div>

          {/* Card right: Plan de Facturación Real */}
          <div className="bg-white border border-slate-105 rounded-[22px] p-4 text-left shadow-3xs flex flex-col justify-between h-[154px]">
            <div>
              <h4 className="text-[11.5px] font-black text-slate-400 tracking-wider uppercase">
                TU PLAN
              </h4>
              <span className="text-[16px] font-black text-slate-900 block mt-1 tracking-tight">
                {fiscalProfile?.plan === "empresa" ? "Zen Empresa" : fiscalProfile?.plan === "personal" ? "Zen Personal" : "Plan Gratuito"}
              </span>
              <span className="text-[10px] font-bold text-blue-600 block tracking-tight mt-0.5">
                Servicio Operativo
              </span>
            </div>

            <div>
              <div className="h-2.5 bg-slate-100 rounded-full w-full overflow-hidden relative">
                <div className="h-full bg-[#0B53F4] rounded-full" style={{ width: fiscalProfile?.plan === "empresa" ? "95%" : "70%" }} />
              </div>
              <span className="text-[9px] font-extrabold text-slate-400 block mt-2 tracking-tight">
                {fiscalProfile?.plan === "empresa" ? "Timbrados ilimitados habilitados" : "Plan optimizado de inicio rápido"}
              </span>
            </div>
          </div>

        </div>

        {/* ==================== 2.4 ACTIVIDAD RECIENTE (100% REAL LIVE DATA) ==================== */}
        <div className="flex flex-col gap-3">
          <div className="flex justify-between items-center px-1">
            <h4 className="text-[14px] font-black text-slate-900 tracking-tight">
              Actividad reciente
            </h4>
            {totalTicketsCount > 0 && (
              <button 
                onClick={() => onTabChange("tickets")}
                className="text-[11.5px] font-black text-[#0B53F4] uppercase tracking-wider flex items-center gap-1 hover:underline cursor-pointer"
              >
                Ver todo <span>→</span>
              </button>
            )}
          </div>

          <div className="bg-white border border-slate-100 rounded-[24px] p-4.5 shadow-3xs flex flex-col gap-3.5">
            {totalTicketsCount === 0 ? (
              /* AESTHETIC EMPTY STATE CONTAINER WITH DIRECT CLEAN CALL-TO-ACTION */
              <div className="py-8 px-4 flex flex-col items-center justify-center text-center">
                <div className="w-[56px] h-[56px] rounded-full bg-blue-50 flex items-center justify-center text-blue-600 mb-3.5 shadow-3xs border border-blue-50">
                  <TicketIcon className="w-6 h-6 stroke-[1.8]" />
                </div>
                <h5 className="text-[14px] font-black text-slate-850 tracking-tight">
                  No hay tickets registrados
                </h5>
                <p className="text-[11px] text-slate-500 font-semibold max-w-[240px] mt-1 leading-relaxed">
                  Toma una foto de tu ticket de compra para automatizar tu facturación CFDI 4.0 al instante.
                </p>
                <button
                  onClick={() => onTabChange("capturar")}
                  className="mt-4 px-5 py-2.5 bg-[#0B53F4] hover:bg-blue-600 active:scale-95 text-white font-bold text-[11px] uppercase tracking-wider rounded-xl transition shadow-sm"
                >
                  Subir primer ticket
                </button>
              </div>
            ) : (
              /* REAL LIVE TICKETS DATA (Sorted newest first, showing top 4) */
              tickets.slice(0, 4).map((tick, index) => {
                const providerName = tick.nombreEmisor || "Establecimiento";
                const totalText = tick.total ? `$${tick.total.toLocaleString("es-MX", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : "$0.00";
                
                // Formatted display date
                let displayDate = "Fecha reciente";
                if (tick.fechaCompra) {
                  displayDate = tick.fechaCompra;
                } else if (tick.createdAt) {
                  try {
                    displayDate = new Date(tick.createdAt).toLocaleDateString("es-MX", {
                      day: "numeric",
                      month: "short",
                      year: "numeric"
                    });
                  } catch (e) {}
                }

                return (
                  <div key={tick.id || index} className="flex flex-col gap-3.5">
                    {index > 0 && <div className="h-px bg-slate-100" />}
                    <div 
                      onClick={() => {
                        toast.info(`Monto: ${totalText}`, { description: `Establecimiento: ${providerName}` });
                        onTabChange("tickets");
                      }}
                      className="flex justify-between items-center hover:bg-slate-50/50 transition p-1 rounded-xl cursor-pointer"
                    >
                      <div className="flex items-center gap-3">
                        {getProviderLogo(providerName)}
                        <div className="text-left leading-tight">
                          <span className="text-[12.5px] font-black text-slate-800 block uppercase">
                            {providerName}
                          </span>
                          <span className="text-[10px] font-semibold text-slate-400 block mt-1">
                            {displayDate}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="text-[12.5px] font-mono font-black text-slate-800 tracking-tight">
                          {totalText}
                        </span>
                        
                        {tick.status === "completed" ? (
                          <span className="bg-emerald-50 text-[9px] font-extrabold tracking-wide text-emerald-600 px-2.5 py-0.5 rounded-full select-none leading-tight">
                            Validado
                          </span>
                        ) : tick.status === "processing" ? (
                          <span className="bg-blue-50 text-[9px] font-extrabold tracking-wide text-blue-600 px-2.5 py-0.5 rounded-full select-none leading-tight animate-pulse flex items-center gap-1">
                            <Loader2 className="w-2.5 h-2.5 animate-spin" />
                            Progreso
                          </span>
                        ) : tick.status === "review" ? (
                          <span className="bg-amber-50 text-[9px] font-extrabold tracking-wide text-amber-500 px-2.5 py-0.5 rounded-full select-none leading-tight">
                            Atención
                          </span>
                        ) : (
                          <span className="bg-rose-50 text-[9px] font-extrabold tracking-wide text-rose-500 px-2.5 py-0.5 rounded-full select-none leading-tight">
                            Erróneo
                          </span>
                        )}
                        <ChevronRight className="w-4 h-4 text-slate-400 shrink-0" />
                      </div>
                    </div>
                  </div>
                );
              })
            )}

          </div>
        </div>

        {/* 2.5 STREAMLINED ACTIONABLE CARDS GRID (Exactly 3, removed redundant/hardcoded ones) */}
        <div className="grid grid-cols-3 gap-2.5 px-0.5">
          {/* Card 1: Mis tickets */}
          <button 
            type="button"
            onClick={() => onTabChange("tickets")}
            className="bg-white border border-slate-100 rounded-[18px] p-3 flex flex-col items-center justify-center gap-2 group transition hover:scale-[1.03] active:scale-95 cursor-pointer shadow-3xs h-[88px]"
          >
            <div className="w-9 h-9 rounded-full bg-blue-50/70 group-hover:bg-[#EBF1FF] text-[#0B53F4] flex items-center justify-center transition">
              <TicketIcon className="w-4.5 h-4.5 text-[#0B53F4]" />
            </div>
            <span className="text-[10px] font-extrabold text-slate-700 group-hover:text-[#0B53F4] text-center tracking-tight leading-none mt-0.5 select-none uppercase">
              Mis tickets
            </span>
          </button>

          {/* Card 2: Control de Gastos */}
          <button 
            type="button"
            onClick={() => onTabChange("gastos")}
            className="bg-white border border-slate-100 rounded-[18px] p-3 flex flex-col items-center justify-center gap-2 group transition hover:scale-[1.03] active:scale-95 cursor-pointer shadow-3xs h-[88px]"
          >
            <div className="w-9 h-9 rounded-full bg-blue-50/70 group-hover:bg-[#EBF1FF] text-[#0B53F4] flex items-center justify-center transition">
              <PieChartIcon className="w-4.5 h-4.5 text-[#0B53F4]" />
            </div>
            <span className="text-[10px] font-extrabold text-slate-700 group-hover:text-[#0B53F4] text-center tracking-tight leading-none mt-0.5 select-none uppercase">
              Mis Gastos
            </span>
          </button>

          {/* Card 3: Datos de Cuenta */}
          <button 
            type="button"
            onClick={() => onTabChange("cuenta")}
            className="bg-white border border-slate-100 rounded-[18px] p-3 flex flex-col items-center justify-center gap-2 group transition hover:scale-[1.03] active:scale-95 cursor-pointer shadow-3xs h-[88px]"
          >
            <div className="w-9 h-9 rounded-full bg-blue-50/70 group-hover:bg-[#EBF1FF] text-[#0B53F4] flex items-center justify-center transition">
              <User className="w-4.5 h-4.5 text-[#0B53F4]" />
            </div>
            <span className="text-[10px] font-extrabold text-slate-700 group-hover:text-[#0B53F4] text-center tracking-tight leading-none mt-0.5 select-none uppercase">
              Mi Cuenta
            </span>
          </button>
        </div>

      </div>

    </div>
  );
}
