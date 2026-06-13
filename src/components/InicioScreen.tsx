import React from "react";
import { Ticket, Invoice, FiscalProfile } from "../types";
import { 
  Bell, ChevronRight, Camera, Check, 
  AlertCircle, Ticket as TicketIcon, Clock, 
  PieChart as PieChartIcon, Headphones, ChevronDown,
  ShieldCheck
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
  tickets,
  invoices,
  fiscalProfile,
  onTabChange,
  currentUserEmail
}: InicioScreenProps) {
  
  // Extract user first name
  const fullName = fiscalProfile?.razonSocial || "RICARDO CASTRO";
  const firstName = fullName.split(" ")[0] || "Ricardo";

  // Dynamic values or high-fidelity mockup values from image
  const ticketsThisMonthCount = 24;
  const pendingToInvoiceCount = 5;
  const inProcessCount = 5;
  const emittedInvoicesCount = 18;
  const attentionNeededCount = 2;

  return (
    <div className="flex flex-col text-slate-800 font-sans select-none min-h-screen bg-[#F4F7FC]">
      
      {/* ==================== 1. DEEP ROYAL BLUE HEADER STATUS BLOCK ==================== */}
      <div className="bg-gradient-to-b from-[#0B3EE4] via-[#05229C] to-[#01144F] text-white pt-10 pb-20 px-5 rounded-b-[40px] shadow-lg relative overflow-hidden shrink-0">
        <div className="absolute right-[-20%] top-[-20%] w-60 h-60 rounded-full bg-blue-500/20 blur-3xl pointer-events-none" />
        <div className="absolute left-[-20%] bottom-[-20%] w-48 h-48 rounded-full bg-teal-400/10 blur-2xl pointer-events-none" />

        {/* Top Header Navbar: Avatar, Logo & Bell */}
        <div className="flex items-center justify-between mb-6 relative z-10">
          {/* User Profile Avatar */}
          <div className="w-[38px] h-[38px] rounded-full overflow-hidden border border-white/20 bg-white/10 shrink-0 shadow-inner">
            <img 
              src="https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?q=80&w=256&auto=format&fit=crop" 
              alt="Profile" 
              className="w-full h-full object-cover"
            />
          </div>

          {/* Centered ZenTicket Logo */}
          <div className="flex items-center gap-1.5 justify-center">
            {/* Elegant Triple Leaf Lotus Vector resembling ZenTicket brand icon */}
            <svg viewBox="0 0 100 100" className="w-[22px] h-[22px] text-white fill-current">
              <path d="M50 20C42 35 48 58 50 64C52 58 58 35 50 20Z" opacity="0.9" />
              <path d="M46 64C41 58 26 48 15 50C28 55 42 58 46 64Z" opacity="0.75" />
              <path d="M54 64C59 58 74 48 85 50C72 55 58 58 54 64Z" opacity="0.75" />
            </svg>
            <span className="text-[17.5px] font-black tracking-tight text-white select-none font-sans">
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
              <span className="absolute top-[10px] right-[10px] w-2 h-2 bg-[#0B53F4] rounded-full ring-2 ring-[#031D79]" />
            </button>
          </div>
        </div>

        {/* Personalized Greetings heading styling */}
        <div className="mb-6 relative z-10 text-left">
          <h2 className="text-[25px] font-black tracking-tight text-white leading-none">
            Hola, {firstName}
          </h2>
          <span className="text-[11.5px] text-blue-100 font-bold block mt-1 tracking-tight select-none opacity-85">
            Resumen de tu facturación
          </span>
        </div>

        {/* Stats horizontal side-by-side block matching mockup */}
        <div className="flex justify-between items-center bg-white/[0.03] backdrop-filter border border-white/5 rounded-2xl p-4.5 mb-1.5 relative z-10">
          
          {/* Left item: tickets este mes */}
          <div className="flex items-center gap-3.5 w-[50%]">
            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-white shrink-0">
              <TicketIcon className="w-5 h-5 text-blue-200" />
            </div>
            <div className="text-left min-w-0">
              <span className="text-[23px] font-black block leading-none text-white tracking-tight">
                {ticketsThisMonthCount}
              </span>
              <span className="text-[10px] text-blue-100 font-bold block mt-1 tracking-tight">
                tickets este mes
              </span>
            </div>
          </div>

          {/* Horizontal dividing thin line */}
          <div className="w-px h-10 bg-white/10 shrink-0 self-center" />

          {/* Right item: por facturar */}
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
                por facturar
              </span>
            </div>
          </div>

        </div>

        {/* "Ver todos" Link row */}
        <div className="flex justify-end relative z-10 mt-1 pb-1">
          <button 
            type="button"
            onClick={() => onTabChange("tickets")}
            className="text-[11.5px] font-black text-[#60A5FA] uppercase tracking-wider flex items-center gap-1 hover:underline cursor-pointer select-none"
          >
            Ver todos <span>→</span>
          </button>
        </div>

      </div>

      {/* ==================== 2. MAIN FLOATING INNER LAYOUT ==================== */}
      <div className="flex-1 px-4 pb-12 flex flex-col gap-5 -mt-14 relative z-20">

        {/* 2.1 SCANNER FLOATING CARD (STYLISH BLUE GRADIENT) */}
        <button 
          onClick={() => onTabChange("capturar")}
          className="w-full bg-gradient-to-r from-[#0B53F4] to-[#124ADB] rounded-[24px] p-5 shadow-[0_12px_28px_rgba(11,83,244,0.30)] border border-blue-400/10 flex items-center justify-between text-left transition hover:scale-[1.01] active:scale-[0.98] cursor-pointer"
        >
          <div className="flex items-center gap-3.5">
            
            {/* White Scanner corners representation container containing white Camera icon */}
            <div className="w-[48px] h-[48px] rounded-xl border border-white/40 flex items-center justify-center relative bg-white/5 shrink-0">
              {/* Four decorative corner markers */}
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
                Captura un ticket y automatiza tu factura
              </span>
            </div>

          </div>

          <ChevronRight className="w-5 h-5 text-white/90 shrink-0" strokeWidth={2.5} />
        </button>

        {/* 2.2 RESUMEN DE ACTIVIDAD CARDS (GRID OF 3 STATUS COPIED FROM DESIGN) */}
        <div className="flex flex-col gap-3">
          <h4 className="text-[14px] font-black text-slate-900 tracking-tight text-left">
            Resumen de actividad
          </h4>

          <div className="grid grid-cols-3 gap-2.5">
            {/* Card 1: En Proceso */}
            <div 
              onClick={() => onTabChange("tickets")}
              className="bg-white border border-slate-105 rounded-[18px] p-3 flex flex-col justify-between text-left h-[88px] cursor-pointer hover:border-blue-200 transition-all shadow-3xs"
            >
              <div className="w-7 h-7 rounded-full bg-emerald-50 text-[#10B981] flex items-center justify-center shrink-0">
                {/* Check in rounded-circle design */}
                <div className="w-4 h-4 rounded-sm border border-[#10B981] flex items-center justify-center">
                  <Check className="w-2.5 h-2.5 stroke-[3]" />
                </div>
              </div>

              <div className="leading-none mt-1">
                <span className="text-[10px] font-bold text-slate-400 block tracking-tight">
                  En proceso
                </span>
                <span className="text-[18px] font-black text-slate-800 tracking-tight block mt-1">
                  {inProcessCount}
                </span>
              </div>
            </div>

            {/* Card 2: Emitidas */}
            <div 
              onClick={() => onTabChange("gastos")}
              className="bg-white border border-slate-105 rounded-[18px] p-3 flex flex-col justify-between text-left h-[88px] cursor-pointer hover:border-blue-200 transition-all shadow-3xs"
            >
              <div className="w-7 h-7 rounded-full bg-blue-50 text-[#0B53F4] flex items-center justify-center shrink-0">
                <svg className="w-4 h-4" stroke="currentColor" fill="none" strokeWidth="2.5" viewBox="0 0 24 24">
                  <rect x="4" y="4" width="16" height="16" rx="2" />
                  <line x1="8" y1="10" x2="16" y2="10" />
                  <line x1="8" y1="14" x2="12" y2="14" />
                </svg>
              </div>

              <div className="leading-none mt-1">
                <span className="text-[10px] font-bold text-slate-400 block tracking-tight">
                  Emitidas
                </span>
                <span className="text-[18px] font-black text-slate-800 tracking-tight block mt-1">
                  {emittedInvoicesCount}
                </span>
              </div>
            </div>

            {/* Card 3: Atención */}
            <div 
              onClick={() => onTabChange("tickets")}
              className="bg-white border border-slate-105 rounded-[18px] p-3 flex flex-col justify-between text-left h-[88px] cursor-pointer hover:border-blue-200 transition-all shadow-3xs"
            >
              <div className="w-7 h-7 rounded-full bg-rose-50 text-rose-500 flex items-center justify-center shrink-0">
                <span className="text-sm font-black italic select-none">!</span>
              </div>

              <div className="leading-none mt-1">
                <span className="text-[10px] font-bold text-slate-400 block tracking-tight">
                  Atención
                </span>
                <span className="text-[18px] font-black text-slate-800 tracking-tight block mt-1">
                  {attentionNeededCount}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* 2.3 ROW GRID: PENDIENTES & TU PLAN */}
        <div className="grid grid-cols-2 gap-3.5">
          
          {/* Card left: Pendientes */}
          <div className="bg-white border border-slate-105 rounded-[22px] p-4 text-left shadow-3xs flex flex-col h-[154px]">
            <h4 className="text-[12px] font-black text-slate-900 tracking-tight mb-2">
              Pendientes
            </h4>

            <div className="flex-1 flex flex-col gap-2.5 justify-center">
              {/* Row 1 */}
              <div 
                onClick={() => {
                  toast.warning("2 tickets requieren que asocies su connector comercial.");
                  onTabChange("tickets");
                }}
                className="flex items-center justify-between group cursor-pointer"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <div className="w-5 h-5 rounded-full bg-amber-100 flex items-center justify-center shrink-0">
                    <span className="text-[10px] font-black text-amber-600">!</span>
                  </div>
                  <span className="text-[9.5px] font-bold text-slate-700 truncate tracking-tight group-hover:text-[#0B53F4]">
                    2 tickets requieren revisión
                  </span>
                </div>
                <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              </div>

              {/* Dividing separator item */}
              <div className="h-px bg-slate-100" />

              {/* Row 2 */}
              <div 
                onClick={() => {
                  toast.info("Por favor actualiza tus datos de facturación en Cuenta.");
                  onTabChange("cuenta");
                }}
                className="flex items-center justify-between group cursor-pointer"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <div className="w-5 h-5 rounded-full bg-blue-50 flex items-center justify-center shrink-0">
                    <span className="text-[9.5px] font-extrabold text-[#0B53F4] font-mono leading-none">i</span>
                  </div>
                  <div className="leading-tight min-w-0">
                    <span className="text-[9.5px] font-bold text-slate-700 block truncate tracking-tight group-hover:text-[#0B53F4]">
                      1 factura necesita
                    </span>
                    <span className="text-[9px] font-bold text-slate-500 block truncate tracking-tight">
                      datos fiscales
                    </span>
                  </div>
                </div>
                <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              </div>
            </div>
          </div>

          {/* Card right: Tu plan */}
          <div className="bg-white border border-slate-105 rounded-[22px] p-4 text-left shadow-3xs flex flex-col justify-between h-[154px]">
            <div>
              <h4 className="text-[12px] font-black text-slate-400 tracking-wider uppercase">
                Tu plan
              </h4>
              <span className="text-[16px] font-black text-slate-900 block mt-1 tracking-tight">
                Zen Pro
              </span>
              <span className="text-[10px] font-bold text-blue-600 block tracking-tight mt-0.5">
                76% disponible
              </span>
            </div>

            {/* Custom stylized beautiful layout blue progress bar */}
            <div>
              <div className="h-2.5 bg-slate-100 rounded-full w-full overflow-hidden relative">
                <div className="h-full bg-[#0B53F4] rounded-full" style={{ width: "76%" }} />
              </div>
              <span className="text-[9px] font-extrabold text-slate-400 block mt-2 tracking-tight">
                Quedan 152 facturas este mes
              </span>
            </div>
          </div>

        </div>

        {/* 2.4 ACTIVIDAD RECIENTE (LIST OF 4 RECEIPTS AS IN GRAPHIC) */}
        <div className="flex flex-col gap-3">
          <div className="flex justify-between items-center px-1">
            <h4 className="text-[14px] font-black text-slate-900 tracking-tight">
              Actividad reciente
            </h4>
            <button 
              onClick={() => onTabChange("tickets")}
              className="text-[11.5px] font-black text-[#0B53F4] uppercase tracking-wider flex items-center gap-1 hover:underline cursor-pointer"
            >
              Ver todo <span>→</span>
            </button>
          </div>

          <div className="bg-white border border-slate-105 rounded-[24px] p-4.5 shadow-3xs flex flex-col gap-3.5">
            
            {/* Item 1: Costco */}
            <div 
              onClick={() => {
                toast.success("Detalle del ticket: Costco ($1,245.50)");
              }}
              className="flex justify-between items-center hover:bg-slate-50/55 transition p-1 rounded-xl cursor-pointer"
            >
              <div className="flex items-center gap-3">
                {/* Costco styled logo container */}
                <div className="w-[42px] h-[42px] rounded-xl border border-slate-150/80 bg-white flex items-center justify-center shrink-0 shadow-3xs overflow-hidden">
                  <div className="flex flex-col items-center leading-none">
                    <span className="text-[10px] font-black text-blue-600 tracking-tighter uppercase">COST</span>
                    <span className="text-[8px] font-extrabold text-red-500 tracking-widest leading-none">CO</span>
                  </div>
                </div>

                <div className="text-left leading-tight">
                  <span className="text-[12.5px] font-black text-slate-800 block uppercase">
                    Costco
                  </span>
                  <span className="text-[10px] font-bold text-slate-400 block mt-0.5">
                    14 may 2024
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-[12.5px] font-mono font-black text-slate-800 tracking-tight">
                  $1,245.50
                </span>
                <span className="bg-emerald-50 text-[9.5px] font-extrabold tracking-wide text-emerald-600 px-2 py-0.5 rounded-full leading-tight select-none mt-0.5">
                  Completado
                </span>
                <ChevronRight className="w-4 h-4 text-slate-400 shrink-0" />
              </div>
            </div>

            {/* Divider line */}
            <div className="h-px bg-slate-100" />

            {/* Item 2: OXXO */}
            <div 
              onClick={() => {
                toast.success("Detalle del ticket: OXXO ($320.90)");
              }}
              className="flex justify-between items-center hover:bg-slate-50/55 transition p-1 rounded-xl cursor-pointer"
            >
              <div className="flex items-center gap-3">
                {/* OXXO styled logo container */}
                <div className="w-[42px] h-[42px] rounded-xl border border-slate-150/80 bg-white flex items-center justify-center shrink-0 shadow-3xs overflow-hidden">
                  <div className="bg-red-600 border border-amber-300 w-10 h-6.5 rounded flex items-center justify-center leading-none">
                    <span className="text-[9.5px] font-black text-white tracking-widest italic uppercase">OXXO</span>
                  </div>
                </div>

                <div className="text-left leading-tight">
                  <span className="text-[12.5px] font-black text-slate-800 block uppercase">
                    OXXO
                  </span>
                  <span className="text-[10px] font-bold text-slate-400 block mt-0.5">
                    14 may 2024
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-[12.5px] font-mono font-black text-slate-800 tracking-tight">
                  $320.90
                </span>
                <span className="bg-emerald-50 text-[9.5px] font-extrabold tracking-wide text-emerald-600 px-2 py-0.5 rounded-full leading-tight select-none mt-0.5 animate-pulse">
                  Completado
                </span>
                <ChevronRight className="w-4 h-4 text-slate-400 shrink-0" />
              </div>
            </div>

            {/* Divider line */}
            <div className="h-px bg-slate-100" />

            {/* Item 3: Farmacia Guadalajara */}
            <div 
              onClick={() => {
                toast.success("Detalle del ticket: Farmacia Guadalajara ($95.00)");
              }}
              className="flex justify-between items-center hover:bg-slate-50/55 transition p-1 rounded-xl cursor-pointer"
            >
              <div className="flex items-center gap-3">
                {/* Guadalajara logo circle patterns */}
                <div className="w-[42px] h-[42px] rounded-xl border border-slate-150/80 bg-white flex items-center justify-center shrink-0 shadow-3xs overflow-hidden">
                  <div className="w-7 h-7 rounded-full bg-blue-100 flex items-center justify-center">
                    <div className="w-4 h-4 rounded-full bg-[#0B53F4] text-white flex items-center justify-center text-[8px] font-extrabold">
                      G
                    </div>
                  </div>
                </div>

                <div className="text-left leading-tight">
                  <span className="text-[12.5px] font-black text-slate-800 block uppercase">
                    Farmacia Guadalajara
                  </span>
                  <span className="text-[10px] font-bold text-slate-400 block mt-0.5">
                    13 may 2024
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-[12.5px] font-mono font-black text-slate-800 tracking-tight">
                  $95.00
                </span>
                <span className="bg-emerald-50 text-[9.5px] font-extrabold tracking-wide text-emerald-600 px-2 py-0.5 rounded-full leading-tight select-none mt-0.5">
                  Completado
                </span>
                <ChevronRight className="w-4 h-4 text-slate-400 shrink-0" />
              </div>
            </div>

            {/* Divider line */}
            <div className="h-px bg-slate-100" />

            {/* Item 4: Restaurante Los Arcos */}
            <div 
              onClick={() => {
                toast.success("Detalle del ticket: Restaurante Los Arcos ($650.00)");
              }}
              className="flex justify-between items-center hover:bg-slate-50/55 transition p-1 rounded-xl cursor-pointer"
            >
              <div className="flex items-center gap-3">
                {/* Orange rounded circles with fork representation */}
                <div className="w-[42px] h-[42px] rounded-xl border border-slate-150/80 bg-white flex items-center justify-center shrink-0 shadow-3xs overflow-hidden">
                  <div className="w-7.5 h-7.5 rounded-full bg-orange-100 flex items-center justify-center text-orange-600">
                    <svg className="w-4.5 h-4.5 fill-current" viewBox="0 0 24 24">
                      <path d="M11 9H9V2H7v7H5V2H3v7c0 2.12 1.66 3.84 3.75 3.97V22h2.5v-10.03C11.34 11.84 13 10.12 13 9V2h-2v7zm5-3v8h2.5v8h2V2h-2c-1.38 0-2.5 1.1-2.5 4z" />
                    </svg>
                  </div>
                </div>

                <div className="text-left leading-tight">
                  <span className="text-[12.5px] font-black text-slate-800 block uppercase">
                    Restaurante Los Arcos
                  </span>
                  <span className="text-[10px] font-bold text-slate-400 block mt-0.5">
                    12 may 2024
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-[12.5px] font-mono font-black text-slate-800 tracking-tight">
                  $650.00
                </span>
                <span className="bg-amber-50 text-[9.5px] font-extrabold tracking-wide text-amber-500 px-2 py-0.5 rounded-full leading-tight select-none mt-0.5">
                  Pendiente
                </span>
                <ChevronRight className="w-4 h-4 text-slate-400 shrink-0" />
              </div>
            </div>

          </div>
        </div>

        {/* 2.5 QUICK ACTIONS ROW AS EXPLICIT CARDS IN DESIGN GRID */}
        <div className="grid grid-cols-4 gap-2 px-0.5">
          {/* Card 1: Mis tickets */}
          <button 
            type="button"
            onClick={() => onTabChange("tickets")}
            className="bg-white border border-slate-105 rounded-[18px] p-3 flex flex-col items-center justify-center gap-2 group transition hover:scale-[1.03] active:scale-95 cursor-pointer shadow-3xs h-[88px]"
          >
            <div className="w-9 h-9 rounded-full bg-blue-50/70 group-hover:bg-[#EBF1FF] text-[#0B53F4] flex items-center justify-center transition">
              <TicketIcon className="w-4.5 h-4.5 text-[#0B53F4]" />
            </div>
            <span className="text-[10px] font-black text-slate-705 group-hover:text-[#0B53F4] text-center tracking-tight leading-none mt-0.5 select-none">
              Mis tickets
            </span>
          </button>

          {/* Card 2: Historial */}
          <button 
            type="button"
            onClick={() => onTabChange("historial")}
            className="bg-white border border-slate-105 rounded-[18px] p-3 flex flex-col items-center justify-center gap-2 group transition hover:scale-[1.03] active:scale-95 cursor-pointer shadow-3xs h-[88px]"
          >
            <div className="w-9 h-9 rounded-full bg-blue-50/70 group-hover:bg-[#EBF1FF] text-[#0B53F4] flex items-center justify-center transition">
              <Clock className="w-4.5 h-4.5 text-[#0B53F4]" />
            </div>
            <span className="text-[10px] font-black text-slate-705 group-hover:text-[#0B53F4] text-center tracking-tight leading-none mt-0.5 select-none">
              Historial
            </span>
          </button>

          {/* Card 3: Gastos */}
          <button 
            type="button"
            onClick={() => onTabChange("gastos")}
            className="bg-white border border-slate-105 rounded-[18px] p-3 flex flex-col items-center justify-center gap-2 group transition hover:scale-[1.03] active:scale-95 cursor-pointer shadow-3xs h-[88px]"
          >
            <div className="w-9 h-9 rounded-full bg-blue-50/70 group-hover:bg-[#EBF1FF] text-[#0B53F4] flex items-center justify-center transition">
              <PieChartIcon className="w-4.5 h-4.5 text-[#0B53F4]" />
            </div>
            <span className="text-[10px] font-black text-slate-75 group-hover:text-[#0B53F4] text-center tracking-tight leading-none mt-0.5 select-none">
              Gastos
            </span>
          </button>

          {/* Card 4: Ayuda */}
          <button 
            type="button"
            onClick={() => toast.success("Soporte ZenTicket de guardia activado.", { description: "Nos comunicaremos a legiorender@gmail.com" })}
            className="bg-white border border-slate-105 rounded-[18px] p-3 flex flex-col items-center justify-center gap-2 group transition hover:scale-[1.03] active:scale-95 cursor-pointer shadow-3xs h-[88px]"
          >
            <div className="w-9 h-9 rounded-full bg-blue-50/70 group-hover:bg-[#EBF1FF] text-[#0B53F4] flex items-center justify-center transition">
              <Headphones className="w-4.5 h-4.5 text-[#0B53F4]" />
            </div>
            <span className="text-[10px] font-black text-slate-75 group-hover:text-[#0B53F4] text-center tracking-tight leading-none mt-0.5 select-none">
              Ayuda
            </span>
          </button>
        </div>

      </div>

    </div>
  );
}
