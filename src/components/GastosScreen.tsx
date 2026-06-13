import React, { useState } from "react";
import { Invoice, Ticket } from "../types";
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell
} from "recharts";
import { 
  Calendar, ChevronRight, Bell, Sparkles, TrendingUp, BarChart3, 
  HelpCircle, Home, Layers, Building, History, User, ShieldCheck,
  ChevronDown, Filter, FileText, Download, Share2, Plus, ArrowUpRight
} from "lucide-react";
import { toast } from "sonner";
import fondoPleca1 from "@/Fondo pleca 1.png";

interface GastosScreenProps {
  invoices: Invoice[];
  tickets: Ticket[];
  onTabChange: (tab: string) => void;
}

// 1. HIGH-FIDELITY BRAND SVG LOGOS
const AeromexicoLogo = () => (
  <svg viewBox="0 0 100 100" className="w-5 h-5 text-white fill-current">
    <ellipse cx="50" cy="50" rx="46" ry="46" fill="#0D2C54" />
    {/* Stylized profile of Aztec Eagle Warrior */}
    <path 
      d="M32 46c0-10 8-18 18-18s18 8 18 18S50 78 50 78s-18-22-18-32z" 
      fill="white" 
      fillOpacity="0.15" 
    />
    <path 
      d="M38 52c3-4 8-12 12-14 3-1.5 6-.5 8 1.5s1 5-1 7-7 6-11 6c-3 0-5.5-.5-8-.5zM56 34c1-1.5 3-2 5-1s2 3 1 4.5-3 2-5 1-2-3-1-4.5z" 
      fill="white" 
    />
    <path 
      d="M48 36c4 0 8 4 10 9s1 9-3 12c-3.5 2.5-8 1.5-10-2s-1-9 3-19z" 
      fill="white" 
      fillOpacity="0.7"
    />
    <path 
      d="M42 55c5 0 9-1 12-3s4-5 2-7-6-2-9 0-5 5-5 10z" 
      fill="#0B53F4" 
    />
  </svg>
);

const StarbucksLogo = () => (
  <svg viewBox="0 0 100 100" className="w-5 h-5 text-white fill-current">
    <circle cx="50" cy="50" r="48" fill="#00704A" />
    <circle cx="50" cy="50" r="42" fill="none" stroke="white" strokeWidth="2" />
    {/* Mermaid central icon representation */}
    <path 
      d="M50 20c-1 0-2 1-2 2v2c0 2 2 4 4 4s4-2 4-4V22c0-1-1-2-2-2zM40 34c5 0 8 5 8 8s-3 6-8 6-8-3-8-6 3-8 8-8zm20 0c5 0 8 5 8 8s-3 6-8 6-8-3-8-6 3-8 8-8z" 
      fill="white" 
      fillOpacity="0.25"
    />
    {/* Mermaid Crown and hair flow */}
    <path 
      d="M50 28c3 0 5.5 2 6 5l2-1v-4l-3-2-2-4-3 1-3-1-2 4-3 2v4l2 1c.5-3 3-5 6-5z" 
      fill="white" 
    />
    <path 
      d="M50 42c-8 0-14 6-14 14v10c0 4 3 8 7 8h14c4 0 7-4 7-8V56c0-8-6-14-14-14zm0-6c1.5 0 3 1.5 3 3s-1.5 3-3 3-3-1.5-3-3 1.5-3 3-3z" 
      fill="white" 
    />
  </svg>
);

const OfficeDepotLogo = () => (
  <svg viewBox="0 0 120 120" className="w-5 h-5 text-white fill-current">
    <circle cx="60" cy="60" r="54" fill="#E61C24" />
    {/* Stylized 'OD' icon representation */}
    <path 
      d="M32 40h24c11 0 20 9 20 20s-9 20-24 20H32V40zm24 30c5.5 0 10-4.5 10-10s-4.5-10-10-10H42v20h14z" 
      fill="white" 
    />
    <rect x="80" y="40" width="8" height="40" rx="2" fill="white" />
  </svg>
);

const UberLogo = () => (
  <svg viewBox="0 0 100 100" className="w-5 h-5 text-white fill-current">
    <circle cx="50" cy="50" r="48" fill="black" />
    {/* Stylized Uber font symbol */}
    <text 
      x="50%" 
      y="56%" 
      dominantBaseline="middle" 
      textAnchor="middle" 
      fill="white" 
      fontSize="24" 
      fontFamily="sans-serif" 
      fontWeight="900"
      letterSpacing="-1px"
    >
      Uber
    </text>
  </svg>
);

export default function GastosScreen({ invoices, tickets, onTabChange }: GastosScreenProps) {
  const [selectedMonth, setSelectedMonth] = useState("Mayo 2024");

  // Sum up invoices to keep dynamic sync
  const totalDbSum = invoices.reduce((acc, inv) => acc + (inv.total || 0), 0);
  const displayTotal = totalDbSum;

  const getCategory = (nombreEmisor?: string) => {
    const name = (nombreEmisor || "").toLowerCase();
    if (
      name.includes("pemex") ||
      name.includes("gas") ||
      name.includes("gasolina") ||
      name.includes("uber") ||
      name.includes("aeromexico") ||
      name.includes("tax") ||
      name.includes("vuelo") ||
      name.includes("vuela") ||
      name.includes("car") ||
      name.includes("caseta")
    ) {
      return "Transporte";
    }
    if (
      name.includes("starbucks") ||
      name.includes("coffee") ||
      name.includes("café") ||
      name.includes("restaurante") ||
      name.includes("arcos") ||
      name.includes("subway") ||
      name.includes("comida") ||
      name.includes("alimento") ||
      name.includes("oxxo") ||
      name.includes("costco") ||
      name.includes("walmart") ||
      name.includes("aurrera") ||
      name.includes("chedraui") ||
      name.includes("heb") ||
      name.includes("super")
    ) {
      return "Alimentos";
    }
    if (
      name.includes("office") ||
      name.includes("depot") ||
      name.includes("papeleria") ||
      name.includes("compu") ||
      name.includes("apple") ||
      name.includes("amazon") ||
      name.includes("adobe") ||
      name.includes("telmex") ||
      name.includes("microsoft") ||
      name.includes("liverpool")
    ) {
      return "Oficina";
    }
    return "Otros";
  };

  const categoryTotals = invoices.reduce(
    (acc, inv) => {
      const cat = getCategory(inv.nombreEmisor);
      acc[cat] = (acc[cat] || 0) + (inv.total || 0);
      return acc;
    },
    { Transporte: 0, Alimentos: 0, Oficina: 0, Otros: 0 } as Record<string, number>
  );

  const getPercentageString = (catAmount: number) => {
    if (displayTotal === 0) return "0%";
    return `${Math.round((catAmount / displayTotal) * 100)}%`;
  };

  // 1. FULL DENSE 31-DAY DATASET FOR THE DENSE COLUMN BAR CHART (Evolución de gastos)
  const daysInMonth = Array.from({ length: 31 }, (_, i) => {
    const dayNum = i + 1;
    let amount = 0;

    // Sum up real database invoices matching this specific day
    invoices.forEach((inv) => {
      if (inv.createdAt) {
        try {
          const date = new Date(inv.createdAt);
          if (!isNaN(date.getTime()) && date.getDate() === dayNum) {
            amount += (inv.total || 0);
          }
        } catch (e) {
          console.warn("Invalid date format in invoice:", inv.createdAt);
        }
      }
    });

    return {
      dayLabel: `${dayNum} May`,
      dayNum,
      amount
    };
  });

  const maxDayObj = daysInMonth.reduce((max, d) => d.amount > max.amount ? d : max, { dayNum: 0, amount: 0 });

  // Custom tick formatter to ONLY render specific dates: 1 May, 8 May, 15 May, 22 May, 31 May
  const formatXAxisTick = (tickVal: string) => {
    const subset = ["1 May", "8 May", "15 May", "22 May", "31 May"];
    return subset.includes(tickVal) ? tickVal : "";
  };

  const handleShare = () => {
    toast.success("Enlace de reporte de gastos copiado al portapapeles.");
  };

  return (
    <div className="flex flex-col text-slate-800 font-sans select-none pb-28 animate-fade-in text-left bg-[#F4F7FC] min-h-screen">
      
      {/* ==================== 1. ROYAL BLUE FLUID TOP BLOCK ==================== */}
      <div 
        className="text-white bg-gradient-to-b from-[#0B3EE4] via-[#05229C] to-[#01144F] pt-12 pb-8 px-4 md:px-8 rounded-b-[40px] shadow-lg relative overflow-hidden shrink-0"
      >
        <div className="absolute inset-0 bg-gradient-to-b from-blue-750/30 via-slate-900/10 to-[#011E66]/40 pointer-events-none" />
        {/* Glow Vectors */}
        <div className="absolute right-[-20%] top-[-10%] w-[320px] h-[320px] rounded-full bg-blue-400/20 blur-3xl pointer-events-none" />
        <div className="absolute left-[-20%] bottom-[-10%] w-[280px] h-[280px] rounded-full bg-teal-400/10 blur-3xl pointer-events-none" />

        {/* TOP STATUS ROW WITH AVATAR, BRAND & NOTIFICATION */}
        <div className="flex items-center justify-between mb-7 relative z-10">
          <div className="flex items-center gap-2.5">
            {/* Elegant bearded avatar from mockup */}
            <div className="w-10 h-10 rounded-full border border-white/30 overflow-hidden shadow-inner bg-white/10 shrink-0">
              <img 
                src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=256&auto=format&fit=crop" 
                alt="Avatar" 
                className="w-full h-full object-cover"
              />
            </div>
            {/* ZenTicket Label */}
            <div className="flex items-center gap-1.5">
              {/* White flower emblem representation */}
              <svg viewBox="0 0 100 100" className="w-5 h-5 text-white fill-current">
                <path d="M50 15c-5 12-18 20-18 28c0 10 8 18 18 18s18-8 18-18c0-8-13-16-18-28zm0 41c-7.2 0-13-5.8-13-13c0-5.8 9.2-12.7 13-17.7c3.8 5 13 11.9 13 17.7c0 7.2-5.8 13-13 13z" fill="white" />
                <path d="M50 30c-2.8 0-5 2.2-5 5s2.2 5 5 5s5-2.2 5-5s-2.2-5-5-5z" fill="white" />
              </svg>
              <span className="text-[15px] font-black tracking-tight text-white/95">
                ZenTicket
              </span>
            </div>
          </div>

          {/* Glowing notifications bell */}
          <button 
            onClick={() => toast.info("No tienes notificaciones pendientes")}
            className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/15 flex items-center justify-center transition cursor-pointer relative"
          >
            <Bell className="w-[18px] h-[18px] text-white" />
            <span className="absolute top-1.5 right-1.5 w-[7px] h-[7px] bg-[#3B82F6] rounded-full ring-2 ring-[#0B53F4]" />
          </button>
        </div>

        {/* MID HEADER ROW: TITLE + DROPDOWNS */}
        <div className="flex items-center justify-between pb-6 relative z-10">
          <h2 className="text-2xl font-black text-white tracking-tight">
            Mis Gastos
          </h2>

          <div className="flex items-center gap-2">
            {/* Date selection drawer button */}
            <button 
              onClick={() => toast.info("Historial cargado para Mayo 2024")}
              className="flex items-center gap-1.5 bg-white/10 border border-white/10 rounded-xl px-3.5 py-1.5 text-xs font-black text-white transition hover:bg-white/15 cursor-pointer"
            >
              <Calendar className="w-3.5 h-3.5 text-white" />
              <span>{selectedMonth}</span>
              <ChevronDown className="w-3 h-3 text-white/70" />
            </button>

            {/* Funnel filters icon */}
            <button 
              onClick={() => toast.info("Filtros avanzados activos")}
              className="w-8 h-8 rounded-xl bg-white/10 hover:bg-white/15 border border-white/10 flex items-center justify-center text-white transition cursor-pointer"
            >
              <Filter className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* ==================== 2. MAIN BLUE SUMMARY CARD (NESTED) ==================== */}
        <div className="bg-gradient-to-r from-[#0C58FF] to-[#0A49D6] rounded-[28px] p-5 shadow-lg border border-white/15 relative overflow-hidden flex flex-col text-left z-10 select-none">
          {/* Subtle interior glow decoration */}
          <div className="absolute right-[-10px] top-6 w-32 h-32 rounded-full bg-white/5 blur-xl pointer-events-none" />
          
          <div className="flex items-center justify-between">
            <span className="text-white/80 font-bold uppercase text-[10.5px] tracking-widest">
              Total de gastos
            </span>
            <ChevronRight className="w-4 h-4 text-white/90" />
          </div>

          <div className="flex items-baseline gap-2 mt-2">
            <h3 className="text-3xl font-black tracking-tight leading-none text-white font-sans">
              ${displayTotal.toLocaleString("es-MX", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </h3>
            <span className="text-[13px] font-bold text-white/75">
              MXN
            </span>
          </div>

          <div className="flex items-center justify-between mt-5 pt-1">
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold text-blue-100/80">
                vs. abril 2024
              </span>
              <div className="flex items-center gap-0.5 bg-[#DCFCE7]/20 border border-[#DCFCE7]/15 text-[#4ADE80] font-black text-[10.5px] px-2 py-0.5 rounded-full">
                <ChevronDown className="w-3 h-3 stroke-[2.5]" />
                <span>12.4%</span>
              </div>
            </div>

            {/* Sparkline layout - elegant raw curve with green indicator dot */}
            <div className="relative w-[110px] h-8 shrink-0 flex items-end">
              <svg className="w-full h-full" viewBox="0 0 100 30" fill="none">
                <path 
                  d="M 5,22 C 18,24 25,12 35,16 C 45,21 55,2 68,14 C 76,20 86,10 93,10" 
                  stroke="white" 
                  strokeWidth="2.2" 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                />
                <circle cx="93" cy="10" r="3.2" fill="#22C55E animate-pulse" />
                <circle cx="93" cy="10" r="5" fill="#22C55E" fillOpacity="0.3" className="animate-ping" />
              </svg>
            </div>
          </div>

          {/* Thin dividing separator line */}
          <div className="border-t border-white/10 my-4.5" />

          {/* BOTTOM COLUMN ROW FOR MOVIMIENTOS AND FACTURAS */}
          <div className="grid grid-cols-2 divide-x divide-white/10">
            {/* Movimientos half */}
            <div className="flex items-center gap-3 pr-2">
              <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center text-white shrink-0">
                <BarChart3 className="w-4.5 h-4.5" strokeWidth={2.4} />
              </div>
              <div className="text-left leading-none">
                <span className="text-lg font-black text-white">{tickets.length}</span>
                <span className="text-[10px] font-semibold text-blue-100/75 block mt-0.5">movimientos</span>
              </div>
            </div>

            {/* Facturas half */}
            <div className="flex items-center gap-3 pl-4">
              <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center text-white shrink-0">
                <FileText className="w-4.5 h-4.5" strokeWidth={2.4} />
              </div>
              <div className="text-left leading-none">
                <span className="text-lg font-black text-white">{invoices.length}</span>
                <span className="text-[10px] font-semibold text-blue-100/75 block mt-0.5">facturas</span>
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* ==================== 3. SMOOTH WHITE CONTAINER PANEL ==================== */}
      <div className="bg-white rounded-t-[36px] -mt-6 px-4 md:px-8 pt-7 flex flex-col gap-6.5 relative z-20">
        
        {/* CATEGORIES SECTION (POR CATEGORÍA) */}
        <div className="text-left">
          <div className="flex justify-between items-center mb-3.5">
            <h4 className="text-[13px] font-black text-slate-900 tracking-tight">
              Por categoría
            </h4>
            <button 
              onClick={() => toast.info("Mostrando desglose de categorías principales")}
              className="text-xs font-black text-[#0B53F4] hover:underline flex items-center gap-0.5 cursor-pointer"
            >
              <span>Ver todo</span>
              <ChevronRight className="w-3.5 h-3.5 stroke-[2.5]" />
            </button>
          </div>

          {/* Category Cards Side-by-Side (matching Layout 4) */}
          <div className="grid grid-cols-4 gap-2">
            {[
              { name: "Transporte", amount: `$${categoryTotals.Transporte.toLocaleString("es-MX", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`, percentage: getPercentageString(categoryTotals.Transporte), color: "bg-[#0B53F4]", textCol: "text-[#0B53F4]", bgLight: "bg-blue-50/70", iconPath: <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24"><path d="M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11c-.66 0-1.21.42-1.42 1.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99zM6.5 16c-.83 0-1.5-.67-1.5-1.5S5.67 13 6.5 13s1.5.67 1.5 1.5S7.33 16 6.5 16zm11 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zM5 11l1.5-4.5h11L19 11H5z"/></svg> },
              { name: "Alimentos", amount: `$${categoryTotals.Alimentos.toLocaleString("es-MX", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`, percentage: getPercentageString(categoryTotals.Alimentos), color: "bg-[#22C55E]", textCol: "text-[#22C55E]", bgLight: "bg-emerald-50/70", iconPath: <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24"><path d="M11 9H9V2H7v7H5V2H3v7c0 2.12 1.66 3.84 3.75 3.97V22h2.5v-9.03C11.34 12.84 13 11.12 13 9V2h-2v7zm10-4H18V2h-2v11h2.5V22H21V5z"/></svg> },
              { name: "Oficina", amount: `$${categoryTotals.Oficina.toLocaleString("es-MX", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`, percentage: getPercentageString(categoryTotals.Oficina), color: "bg-[#F97316]", textCol: "text-[#F97316]", bgLight: "bg-orange-50/70", iconPath: <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24"><path d="M20 6h-4V4c0-1.11-.89-2-2-2h-4c-1.11 0-2 .89-2 2v2H4c-1.11 0-1.99.89-1.99 2L2 19c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V8c0-1.11-.89-2-2-2zm-6 0h-4V4h4v2z"/></svg> },
              { name: "Otros", amount: `$${categoryTotals.Otros.toLocaleString("es-MX", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`, percentage: getPercentageString(categoryTotals.Otros), color: "bg-[#64748B]", textCol: "text-[#64748B]", bgLight: "bg-slate-100/70", iconPath: <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24"><path d="M6 10c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm12 0c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm-6 0c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"/></svg> },
            ].map((cat, idx) => (
              <div 
                key={idx}
                className="bg-slate-50 border border-slate-100 rounded-2xl p-2.5 flex flex-col items-center text-center shadow-3xs transition hover:translate-y-[-2px] hover:shadow-xs cursor-pointer select-none"
              >
                {/* Custom filled badge bubble */}
                <div className={`w-[38px] h-[38px] rounded-full ${cat.color} text-white flex items-center justify-center mb-1.5 shrink-0`}>
                  {cat.iconPath}
                </div>
                <span className="text-[10px] font-bold text-slate-400 block tracking-tight">
                  {cat.name}
                </span>
                <span className="text-xs font-black text-slate-800 tracking-tight mt-0.5 block">
                  {cat.amount}
                </span>
                <span className="text-[9.5px] font-bold text-slate-400 mt-0.5 block">
                  {cat.percentage}
                </span>

                {/* Micro capsule progress indicator */}
                <div className="w-10 h-[3.5px] bg-slate-200/50 rounded-full mt-2.5 overflow-hidden">
                  <div className={`h-full ${cat.color}`} style={{ width: cat.percentage }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ==================== CHARTS EVOLUTION BAR LIST ==================== */}
        <div className="bg-[#FAFBFD]/80 border border-slate-100 rounded-[28px] p-4.5 shadow-[0_4px_12px_rgba(15,23,42,0.01)] text-left relative mt-0.5">
          
          <div className="flex justify-between items-center mb-4.5">
            <h4 className="text-[13px] font-black text-slate-900 tracking-tight">
              Evolución de gastos
            </h4>
            <button 
              onClick={() => toast.info("Generando reporte de conciliaciones SAT...")}
              className="text-xs font-black text-[#0B53F4] hover:underline flex items-center gap-0.5"
            >
              <span>Ver reporte</span>
              <ChevronRight className="w-3.5 h-3.5 stroke-[2.5]" />
            </button>
          </div>

          <div className="w-full h-40 select-none relative pr-1 pt-1.5">
            
            {/* Absolute hovering badge pointing to the peak day dynamically */}
            {maxDayObj.amount > 0 && (
              <div 
                className="absolute top-[2px] z-30 pointer-events-none transition-all duration-300"
                style={{ left: `${Math.min(90, Math.max(5, (maxDayObj.dayNum / 31) * 100 - 3))}%` }}
              >
                <div className="bg-[#0B53F4] text-white text-[9.5px] font-black tracking-wide px-2 py-1 rounded-[6px] shadow-sm relative flex flex-col items-center animate-pulse">
                  <span>${maxDayObj.amount.toLocaleString("es-MX", { maximumFractionDigits: 0 })}</span>
                  {/* Downward triangle indicator arrow */}
                  <div className="w-1.5 h-1.5 bg-[#0B53F4] transform rotate-45 -mb-1 mt-0.5" />
                </div>
              </div>
            )}

            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={daysInMonth} margin={{ top: 12, right: 0, left: -26, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                <XAxis 
                  dataKey="dayLabel" 
                  axisLine={false} 
                  tickLine={false} 
                  tickFormatter={formatXAxisTick}
                  tick={{ fill: "#94A3B8", fontSize: 9, fontWeight: "bold" }}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  ticks={[0, 1000, 2000, 3000]}
                  tickFormatter={(val) => `$${val.toLocaleString()}`}
                  tick={{ fill: "#94A3B8", fontSize: 9, fontWeight: "bold" }}
                />
                <Tooltip 
                  cursor={{ fill: "rgba(11,83,244,0.03)" }}
                  contentStyle={{ 
                    backgroundColor: "#0f172a", 
                    borderRadius: "10px", 
                    color: "#fff", 
                    border: "none", 
                    fontSize: "10px", 
                    fontWeight: "bold",
                    padding: "6px 10px"
                  }}
                />
                <Bar 
                  dataKey="amount" 
                  radius={[3, 3, 0, 0]} 
                  barSize={5.5}
                >
                  {daysInMonth.map((entry, index) => (
                    // Highlight the single peak bar for 15 May with royal blue, other bars slightly soft. 
                    <Cell 
                      key={`cell-${index}`} 
                      fill={entry.dayNum === 15 ? "#0B53F4" : "#0B53F4"} 
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* ==================== RECENT EXPENSES LIST (GASTOS RECIENTES) ==================== */}
        <div className="text-left mt-1">
          <div className="flex justify-between items-center mb-3.5">
            <h4 className="text-[13px] font-black text-slate-900 tracking-tight">
              Gastos recientes
            </h4>
            <button 
              onClick={() => toast.info("Mostrando todas las facturas consolidadas")}
              className="text-xs font-black text-[#0B53F4] hover:underline flex items-center gap-0.5"
            >
              <span>Ver todo</span>
              <ChevronRight className="w-3.5 h-3.5 stroke-[2.5]" />
            </button>
          </div>

          <div className="flex flex-col gap-3">
            {invoices.length === 0 ? (
              <div className="bg-white border border-slate-100 rounded-3xl p-8 text-center text-slate-400 font-medium">
                <FileText className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                <span>No tienes facturas emitidas guardadas en la base de datos.</span>
              </div>
            ) : (
              invoices.slice(0, 10).map((gasto, index) => {
                const cat = getCategory(gasto.nombreEmisor);
                const badgeColor = 
                  cat === "Transporte" ? "bg-blue-50 text-[#0B53F4] border-blue-100/50" :
                  cat === "Alimentos" ? "bg-emerald-50 text-emerald-600 border-emerald-100/50" :
                  cat === "Oficina" ? "bg-orange-50 text-orange-600 border-orange-100/50" :
                  "bg-slate-100 text-slate-600 border-slate-200/50";

                const emisorInitials = (gasto.nombreEmisor || "T").substring(0, 2).toUpperCase();

                const renderLogo = () => {
                  const emName = (gasto.nombreEmisor || "").toLowerCase();
                  if (emName.includes("starbucks")) {
                    return <StarbucksLogo />;
                  }
                  if (emName.includes("uber") || emName.includes("aeromexico")) {
                    return <UberLogo />;
                  }
                  if (emName.includes("depot") || emName.includes("office")) {
                    return <OfficeDepotLogo />;
                  }
                  return (
                    <div className="w-10 h-10 bg-[#0B53F4]/10 text-[#0B53F4] rounded-full flex items-center justify-center font-black text-xs font-mono shrink-0">
                      {emisorInitials}
                    </div>
                  );
                };

                let dStr = "Reciente";
                if (gasto.createdAt) {
                  try {
                    const d = new Date(gasto.createdAt);
                    if (!isNaN(d.getTime())) {
                      dStr = d.toLocaleDateString("es-MX", { day: "numeric", month: "short", year: "numeric" });
                    }
                  } catch {}
                }

                return (
                  <div 
                    key={gasto.id || index}
                    className="bg-white border-b border-slate-100 pb-3 flex items-center justify-between transition group hover:border-[#0B53F4]/10 cursor-pointer"
                    onClick={() => {
                      if (onTabChange) onTabChange("tickets");
                    }}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-[42px] h-[42px] rounded-full overflow-hidden flex items-center justify-center shrink-0">
                        {renderLogo()}
                      </div>

                      <div className="text-left">
                        <span className="text-[12.5px] font-black text-slate-800 block uppercase tracking-tight">
                          {gasto.nombreEmisor || "Emisor Desconocido"}
                        </span>
                        <span className="text-[10.5px] text-slate-400 font-bold block mt-0.5">
                          {dStr}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className={`text-[9.5px] font-black tracking-wide px-2.5 py-1 rounded-full border ${badgeColor}`}>
                        {cat}
                      </span>

                      <div className="flex items-center gap-2">
                        <span className="text-[12.5px] font-mono font-black text-slate-800">
                          ${(gasto.total || 0).toLocaleString("es-MX", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </span>
                        <ChevronRight className="w-4 h-4 text-slate-350 stroke-[2.3] transition group-hover:text-slate-600 group-hover:translate-x-0.5" />
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Centered blue hyperlink: Ver todos los gastos */}
          <div className="flex justify-center mt-6">
            <button
              onClick={() => toast.info("Abriendo filtros de reporte fiscal completo")}
              className="text-xs font-black text-[#0B53F4] hover:text-blue-700 transition flex items-center gap-1 cursor-pointer"
            >
              <span>Ver todos los gastos</span>
              <span className="text-[13px]">→</span>
            </button>
          </div>
        </div>

      </div>

    </div>
  );
}
