import React from "react";
import { Invoice } from "../types";
import { 
  TrendingUp, PieChart, ShoppingBag, 
  Utensils, Car, Home, Plus, Info, FileText, Bell, Database, Sparkles
} from "lucide-react";
import { useToast } from "./Toast";

interface VaultScreenProps {
  invoices: Invoice[];
  onTabChange?: (tab: "capturar" | "tickets" | "conectores" | "historial" | "resumen" | "cuenta" | "admin") => void;
}

export default function VaultScreen({ invoices, onTabChange }: VaultScreenProps) {
  const toast = useToast();

  // Format currency helper
  const formatCurrency = (value: number) => {
    return value.toLocaleString("es-MX", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  // Calculate real values from User invoices
  const realTotalSpent = invoices.reduce((sum, inv) => sum + (inv.total || 0), 0);
  const realTransactionsCount = invoices.length;

  // Simple category solver for real data
  const getRealCategorySum = (categoryLabel: string) => {
    return invoices.reduce((sum, inv) => {
      const emisor = (inv.nombreEmisor || "").toLowerCase();
      
      if (categoryLabel === "Alimentación" && (
        emisor.includes("starbucks") || 
        emisor.includes("coffee") || 
        emisor.includes("oxxo") || 
        emisor.includes("restaurante") || 
        emisor.includes("cafe") || 
        emisor.includes("comer") ||
        emisor.includes("vips")
      )) {
        return sum + inv.total;
      }
      if (categoryLabel === "Transporte" && (
        emisor.includes("uber") || 
        emisor.includes("didi") || 
        emisor.includes("gas") || 
        emisor.includes("pemex") || 
        emisor.includes("repsol") || 
        emisor.includes("combust")
      )) {
        return sum + inv.total;
      }
      if (categoryLabel === "Vivienda" && (
        emisor.includes("renta") || 
        emisor.includes("cfe") || 
        emisor.includes("luz") || 
        emisor.includes("agua") || 
        emisor.includes("telmex") || 
        emisor.includes("telcel") || 
        emisor.includes("internet")
      )) {
        return sum + inv.total;
      }
      if (categoryLabel === "Compras" && (
        emisor.includes("walmart") || 
        emisor.includes("costco") || 
        emisor.includes("amazon") || 
        emisor.includes("mercado") || 
        emisor.includes("soriana") || 
        emisor.includes("chedraui") || 
        emisor.includes("merca")
      )) {
        return sum + inv.total;
      }
      
      // If it doesn't match and we are requesting Compras, act as fallback
      if (categoryLabel === "Compras" && 
        !(emisor.includes("starbucks") || emisor.includes("coffee") || emisor.includes("oxxo") || emisor.includes("restaurante") || emisor.includes("cafe") || emisor.includes("comer") || emisor.includes("vips")) &&
        !(emisor.includes("uber") || emisor.includes("didi") || emisor.includes("gas") || emisor.includes("pemex") || emisor.includes("repsol") || emisor.includes("combust")) &&
        !(emisor.includes("renta") || emisor.includes("cfe") || emisor.includes("luz") || emisor.includes("agua") || emisor.includes("telmex") || emisor.includes("telcel") || emisor.includes("internet"))
      ) {
        return sum + inv.total;
      }
      return sum;
    }, 0);
  };

  const alimentacionSum = getRealCategorySum("Alimentación");
  const transporteSum = getRealCategorySum("Transporte");
  const viviendaSum = getRealCategorySum("Vivienda");
  const comprasSum = getRealCategorySum("Compras");

  // Dynamic monthly aggregates
  const months = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];
  const currentMonthIdx = new Date().getMonth();
  const last4MonthsIndices = [
    (currentMonthIdx - 3 + 12) % 12,
    (currentMonthIdx - 2 + 12) % 12,
    (currentMonthIdx - 1 + 12) % 12,
    currentMonthIdx
  ];

  const monthlyAggregates = last4MonthsIndices.map((monthIdx) => {
    const total = invoices.reduce((sum, inv) => {
      const invDate = new Date(inv.createdAt);
      if (invDate.getMonth() === monthIdx) {
        return sum + (inv.total || 0);
      }
      return sum;
    }, 0);
    return {
      label: months[monthIdx],
      total: total
    };
  });

  const maxMonthTotal = Math.max(...monthlyAggregates.map(m => m.total), 1);

  return (
    <div className="w-full flex flex-col font-sans select-none text-left bg-[#F4F7FC] min-h-screen animate-fade-in_50">
      
      {/* ==================== 1. DEEP ROYAL BLUE HEADER STATUS BLOCK ==================== */}
      <div className="bg-gradient-to-b from-[#0B3EE4] via-[#05229C] to-[#01144F] text-white pt-10 pb-24 px-5 rounded-b-[40px] shadow-lg relative overflow-hidden shrink-0">
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

          {/* Right Action: Notification bell translucent badge */}
          <button 
            type="button"
            onClick={() => toast.info("No tienes alertas del SAT sin revisar.", "Estado sincronizado")}
            className="w-[38px] h-[38px] rounded-full bg-white/10 hover:bg-white/15 flex items-center justify-center border border-white/10 transition cursor-pointer relative border-0"
          >
            <Bell className="w-4 h-4 text-white" />
            <span className="absolute top-[10px] right-[10px] w-2 h-2 bg-[#0B53F4] rounded-full ring-2 ring-[#031D79]" />
          </button>
        </div>

        {/* Personalized Greetings heading styling */}
        <div className="mb-6 relative z-10 text-left">
          <h2 className="text-[25px] font-black tracking-tight text-white leading-none">
            Bóveda CFDI
          </h2>
          <span className="text-[11.5px] text-blue-100 font-bold block mt-1 tracking-tight select-none opacity-85">
            Monitorea la acumulación de tus facturas SAT y gastos corporativos
          </span>
         <span className="inline-block bg-blue-500/20 text-blue-100 text-[9.5px] font-bold px-2 py-0.5 rounded-full mt-2 select-none border border-blue-400/10">
           Mes activo: <strong className="text-white font-black uppercase text-[10px]">{months[currentMonthIdx]}</strong>
         </span>
        </div>

        {/* Stats horizontal side-by-side block matching mockup */}
        <div className="flex justify-between items-center bg-white/[0.03] backdrop-filter border border-white/5 rounded-2xl p-4.5 mb-1.5 relative z-10">
          
          {/* Left item: real total spent */}
          <div className="flex items-center gap-3.5 w-[50%]">
            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-white shrink-0">
              <TrendingUp className="w-5 h-5 text-blue-200" />
            </div>
            <div className="text-left min-w-0">
              <span className="text-[21px] font-black block leading-none text-white tracking-tight">
                ${formatCurrency(realTotalSpent)}
              </span>
              <span className="text-[10px] text-blue-100 font-bold block mt-1 tracking-tight">
                MXN acumulados
              </span>
            </div>
          </div>

          {/* Horizontal dividing thin line */}
          <div className="w-px h-10 bg-white/10 shrink-0 self-center" />

          {/* Right item: real transaction count */}
          <div className="flex items-center gap-3.5 w-[50%] pl-4.5">
            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-white shrink-0">
              <Database className="w-5 h-5 text-blue-200" />
            </div>
            <div className="text-left min-w-0">
              <span className="text-[23px] font-black block leading-none text-white tracking-tight font-mono">
                {realTransactionsCount}
              </span>
              <span className="text-[10px] text-blue-100 font-bold block mt-1 tracking-tight">
                facturas sat listadas
              </span>
            </div>
          </div>

        </div>
      </div>

      {/* ==================== 2. MAIN ACTIVE CARD SECTION WRAPPER ==================== */}
      <div className="-mt-14 px-4 pb-20 relative z-20 w-full max-w-7xl mx-auto flex flex-col gap-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* LEFT COLUMN - STATS & CHART (lg:col-span-7) */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* TOTAL GASTOS CARD */}
          <div className="zt-btn-primary hover:transform-none hover:shadow-[0_12px_30px_rgba(37,99,255,0.35)] text-white rounded-3xl p-6 shadow-md relative overflow-hidden select-none">
            {/* Subtle white circle back accent */}
            <div className="absolute top-0 right-0 w-36 h-36 bg-gradient-to-tr from-white/10 to-transparent rounded-full blur-2xl pointer-events-none" />
            
            {/* Top title and month selection label */}
            <div className="flex items-center justify-between font-display">
              <span className="text-[10px] font-black text-blue-150 uppercase tracking-widest block">
                TOTAL GASTOS REALES (MES)
              </span>
              <span className="bg-white/15 backdrop-blur-md text-[10.5px] font-bold text-white px-3.5 py-1 rounded-full leading-none">
                {months[currentMonthIdx]}
              </span>
            </div>

            {/* Large cash indicator */}
            <div className="flex items-baseline mt-4 leading-none select-none">
              <span className="text-2xl font-black text-blue-200 mr-1.5 font-display">$</span>
              <span className="text-4xl font-extrabold tracking-tight font-display">
                {formatCurrency(realTotalSpent)}
              </span>
            </div>

            {/* Lower pill values */}
            <div className="flex items-center gap-3.5 mt-5 text-[11px] font-bold leading-none">
              <span className="bg-white/15 px-3 py-1.5 rounded-full flex items-center gap-1.5">
                Realizado
              </span>
              <span className="text-blue-100/90 font-mono">
                {realTransactionsCount} {realTransactionsCount === 1 ? "transacción" : "transacciones"}
              </span>
            </div>
          </div>

          {/* EVOLUCIÓN HISTORIC MINI-CHART CARD */}
          <div className="bg-white border border-slate-200/50 rounded-3xl p-5.5 shadow-[0_4px_20px_rgba(15,23,42,0.02)]">
            <div className="flex items-center justify-between">
              <h3 className="font-display font-extrabold text-[17px] text-slate-800 tracking-tight">Evolución de Gastos</h3>
              <span className="text-xs font-black text-[#0B53F4] font-display">
                {months[currentMonthIdx]}: ${realTotalSpent.toFixed(2)}
              </span>
            </div>

            {/* Dynamic graphic bars aligned horizontally */}
            <div className="flex items-end justify-between h-36 pt-6 pb-2.5 px-3">
              {monthlyAggregates.map((m, idx) => {
                const heightPercent = maxMonthTotal > 0 ? (m.total / maxMonthTotal) * 100 : 0;
                const isActive = idx === 3;
                return (
                  <div key={idx} className="flex flex-col items-center flex-1 max-w-[42px] h-full justify-end">
                    <div className="w-full flex-1 flex items-end justify-center mb-1.5">
                      <div 
                        className={`w-9 rounded-t-lg transition-all ${
                          isActive 
                            ? "bg-[#0B53F4] shadow-sm hover:bg-[#0747D1]" 
                            : "bg-[#EBF1FF] hover:bg-[#D7E4FF]"
                        }`} 
                        style={{ height: `${Math.max(heightPercent, 4)}%` }} // Minimum height 4% for design aesthetics
                        title={`${m.label}: $${m.total.toFixed(2)}`}
                      />
                    </div>
                    <span className={`text-[11px] font-bold ${isActive ? "text-[#0B53F4] font-extrabold" : "text-slate-400"}`}>
                      {m.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* ÚLTIMOS GASTOS REALES */}
          <div className="space-y-4">
            <div className="flex items-center justify-between pt-2 px-0.5">
              <h2 className="font-display font-extrabold text-lg text-slate-850 tracking-tight">Últimos Gastos Reales</h2>
              <button
                type="button"
                onClick={() => {
                  if (onTabChange) {
                    onTabChange("tickets");
                    toast.info("Mostrando detalle completo de tickets de facturación.", "Tickets Guardados");
                  }
                }}
                className="text-xs font-bold text-[#0B53F4] hover:underline cursor-pointer bg-transparent"
              >
                Ver todo
              </button>
            </div>

            {/* TRANSACTION ITEMS LOGS PANEL */}
            <div className="space-y-3.5">
              {invoices.length === 0 ? (
                <div className="bg-white border border-dashed border-slate-200/80 p-8 rounded-3xl text-center">
                  <Info className="w-7 h-7 text-slate-300 mx-auto mb-2" />
                  <p className="text-xs text-slate-450 font-bold">No has registrado facturas aún en el SAT para este periodo.</p>
                </div>
              ) : (
                invoices.slice(0, 5).map((inv) => {
                  const emName = inv.nombreEmisor || "Emisor";
                  const isTransport = emName.toLowerCase().includes("uber") || emName.toLowerCase().includes("didi") || emName.toLowerCase().includes("repsol") || emName.toLowerCase().includes("gas");
                  const isAli = emName.toLowerCase().includes("starbucks") || emName.toLowerCase().includes("coffee") || emName.toLowerCase().includes("cafe") || emName.toLowerCase().includes("restaurante") || emName.toLowerCase().includes("oxxo");
                  
                  return (
                    <div key={inv.id || inv.folioFiscal} className="bg-white border border-slate-200/55 rounded-3xl p-4.5 flex items-center justify-between shadow-[0_4px_20px_rgba(15,23,42,0.02)]">
                      <div className="flex items-center gap-3.5 text-left">
                        <div className="w-10 h-10 bg-[#0B53F4]/10 rounded-full flex items-center justify-center text-[#0B53F4] shrink-0">
                          {isTransport ? (
                            <Car className="w-5 h-5 stroke-[2.2]" />
                          ) : isAli ? (
                            <Utensils className="w-5 h-5 stroke-[2.2]" />
                          ) : (
                            <FileText className="w-5 h-5 stroke-[2.2]" />
                          )}
                        </div>
                        <div className="leading-tight max-w-[240px]">
                          <span className="text-sm font-black text-slate-800 block truncate font-sans">{emName}</span>
                          <span className="text-xs text-slate-400 block mt-0.5 font-sans">
                            {new Date(inv.createdAt).toLocaleString("es-MX", { dateStyle: "short" })} • {isTransport ? "Transporte" : isAli ? "Alimentación" : "Compras"}
                          </span>
                        </div>
                      </div>
                      <span className="text-sm font-black text-rose-600 font-mono tracking-tight shrink-0">
                        -${inv.total.toFixed(2)}
                      </span>
                    </div>
                  );
                })
              )}
            </div>
          </div>

        </div>

        {/* RIGHT COLUMN - DISTRIBUTION & BREAKDOWN (lg:col-span-5) */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* DISTRIBUCIÓN PROGRESS INDICATORS CARD */}
          <div className="bg-white border border-slate-200/50 rounded-3xl p-5.5 shadow-[0_4px_20px_rgba(15,23,42,0.02)]">
            <div className="flex items-center justify-between pb-3.5">
              <h3 className="font-display font-extrabold text-base text-slate-800 tracking-tight">Distribución por Categorías</h3>
              <PieChart className="w-4.5 h-4.5 text-slate-400 stroke-[2.3]" />
            </div>

            {/* Core breakdown progress values bar by bar */}
            <div className="space-y-4">
              {/* Alimentación Bar */}
              <div className="space-y-1.5 text-left">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-extrabold text-slate-800 font-sans">Alimentación</span>
                  <span className="text-xs text-slate-500 font-medium font-sans">
                    ${alimentacionSum.toFixed(2)} ({realTotalSpent > 0 ? Math.round((alimentacionSum / realTotalSpent) * 100) : 0}%)
                  </span>
                </div>
                <div className="w-full bg-[#EBF1FF]/70 h-1.5 rounded-full overflow-hidden">
                  <div 
                    className="bg-[#0B53F4] h-full rounded-full transition-all duration-300" 
                    style={{ width: `${realTotalSpent > 0 ? (alimentacionSum / realTotalSpent) * 100 : 0}%` }} 
                  />
                </div>
              </div>

              {/* Compras Bar */}
              <div className="space-y-1.5 text-left">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-extrabold text-slate-800 font-sans">Compras</span>
                  <span className="text-xs text-slate-500 font-medium font-sans">
                    ${comprasSum.toFixed(2)} ({realTotalSpent > 0 ? Math.round((comprasSum / realTotalSpent) * 100) : 0}%)
                  </span>
                </div>
                <div className="w-full bg-[#EBF1FF]/70 h-1.5 rounded-full overflow-hidden">
                  <div 
                    className="bg-[#3B82F6] h-full rounded-full transition-all duration-300" 
                    style={{ width: `${realTotalSpent > 0 ? (comprasSum / realTotalSpent) * 100 : 0}%` }} 
                  />
                </div>
              </div>

              {/* Transporte Bar */}
              <div className="space-y-1.5 text-left">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-extrabold text-slate-800 font-sans">Transporte</span>
                  <span className="text-xs text-slate-500 font-medium font-sans">
                    ${transporteSum.toFixed(2)} ({realTotalSpent > 0 ? Math.round((transporteSum / realTotalSpent) * 100) : 0}%)
                  </span>
                </div>
                <div className="w-full bg-[#EBF1FF]/70 h-1.5 rounded-full overflow-hidden">
                  <div 
                    className="bg-[#10B981] h-full rounded-full transition-all duration-300" 
                    style={{ width: `${realTotalSpent > 0 ? (transporteSum / realTotalSpent) * 100 : 0}%` }} 
                  />
                </div>
              </div>
            </div>
          </div>

          {/* DESGLOSE POR CATEGORÍA */}
          <div className="space-y-4">
            <div className="text-left pt-2">
              <h2 className="font-display font-extrabold text-lg text-slate-800 tracking-tight">Desglose por Categoría</h2>
            </div>

            {/* 2X2 CATEGORIES GRID CAPSULES */}
            <div className="grid grid-cols-2 gap-4">
              {/* Alimentación Box */}
              <div className="bg-white border border-slate-200/55 p-5 rounded-3xl shadow-[0_4px_20px_rgba(15,23,42,0.02)] hover:border-slate-300 transition text-left flex flex-col justify-between">
                <div className="w-10 h-10 bg-[#0B53F4]/10 rounded-full flex items-center justify-center text-[#0B53F4] mb-3.5 self-start">
                  <Utensils className="w-5.5 h-5.5 stroke-[2.3]" />
                </div>
                <div className="leading-tight">
                  <span className="text-xs text-slate-450 font-bold block font-sans">Alimentación</span>
                  <span className="text-base font-black text-slate-850 mt-1 block font-sans">
                    ${alimentacionSum.toFixed(2)}
                  </span>
                </div>
              </div>

              {/* Transporte Box */}
              <div className="bg-white border border-slate-200/55 p-5 rounded-3xl shadow-[0_4px_20px_rgba(15,23,42,0.02)] hover:border-slate-300 transition text-left flex flex-col justify-between">
                <div className="w-10 h-10 bg-[#10B981]/10 rounded-full flex items-center justify-center text-[#10B981] mb-3.5 self-start">
                  <Car className="w-5.5 h-5.5 stroke-[2.3]" />
                </div>
                <div className="leading-tight">
                  <span className="text-xs text-slate-450 font-bold block font-sans">Transporte</span>
                  <span className="text-base font-black text-slate-850 mt-1 block font-sans">
                    ${transporteSum.toFixed(2)}
                  </span>
                </div>
              </div>

              {/* Vivienda Box */}
              <div className="bg-white border border-slate-200/55 p-5 rounded-3xl shadow-[0_4px_20px_rgba(15,23,42,0.02)] hover:border-slate-300 transition text-left flex flex-col justify-between">
                <div className="w-10 h-10 bg-[#EF4444]/15 rounded-full flex items-center justify-center text-[#EF4444] mb-3.5 self-start">
                  <Home className="w-5.5 h-5.5 stroke-[2.3]" />
                </div>
                <div className="leading-tight">
                  <span className="text-xs text-slate-450 font-bold block font-sans">Vivienda</span>
                  <span className="text-base font-black text-slate-850 mt-1 block font-sans">
                    ${viviendaSum.toFixed(2)}
                  </span>
                </div>
              </div>

              {/* Compras Box */}
              <div className="bg-white border border-slate-200/55 p-5 rounded-3xl shadow-[0_4px_20px_rgba(15,23,42,0.02)] hover:border-slate-300 transition text-left flex flex-col justify-between">
                <div className="w-10 h-10 bg-[#3B82F6]/10 rounded-full flex items-center justify-center text-[#3B82F6] mb-3.5 self-start">
                  <ShoppingBag className="w-5.5 h-5.5 stroke-[2.3]" />
                </div>
                <div className="leading-tight">
                  <span className="text-xs text-slate-450 font-bold block font-sans">Compras</span>
                  <span className="text-base font-black text-slate-850 mt-1 block font-sans">
                    ${comprasSum.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          </div>

        </div>

      </div>

      {/* 6. FLOATING ACTION BUTTON (FAB) FOR MOBILE - GO TO CAMERA CAPTURE */}
      {onTabChange && (
        <button
          id="GastosFABButton"
          type="button"
          onClick={() => {
            onTabChange("capturar");
            toast.info("Abre o arrastra un ticket para procesarlo por OCR.", "Capturando");
          }}
          className="fixed bottom-24 right-5 z-55 w-14 h-14 bg-[#0B53F4] text-white rounded-full flex items-center justify-center shadow-[0_8px_24px_rgba(11,83,244,0.35)] hover:bg-[#0747D1] active:scale-95 cursor-pointer transition duration-150 relative"
          title="Capturar nuevo ticket"
        >
          <Plus className="w-6.5 h-6.5 stroke-[3] text-white" />
        </button>
      )}
      </div>
    </div>
  );
}
