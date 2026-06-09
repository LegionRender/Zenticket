import React, { useState } from "react";
import { Invoice } from "../types";
import { 
  TrendingUp, Calendar, PieChart, ShoppingBag, 
  Utensils, Car, Home, Plus, Info, ChevronRight, FileText
} from "lucide-react";
import { useToast } from "./Toast";

interface VaultScreenProps {
  invoices: Invoice[];
  onTabChange?: (tab: "capturar" | "tickets" | "conectores" | "historial" | "resumen" | "cuenta" | "admin") => void;
}

export default function VaultScreen({ invoices, onTabChange }: VaultScreenProps) {
  const toast = useToast();
  // Allow toggling between high-fidelity layout (from screenshot) and live uploaded CFDI data
  const [dataMode, setDataMode] = useState<"simulated" | "real">("simulated");

  // Format currency helper
  const formatCurrency = (value: number) => {
    return value.toLocaleString("es-MX", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  // Switch modes helper
  const toggleDataMode = (mode: "simulated" | "real") => {
    setDataMode(mode);
    if (mode === "real") {
      toast.success(`Mostrando ${invoices.length} facturas registradas en la base cloud.`, "Datos Reales SAT");
    } else {
      toast.info("Mostrando métricas consolidadas del reporte de Septiembre.", "Reporte Simulado");
    }
  };

  // Calculate real values from User invoices if any
  const realTotalSpent = invoices.reduce((sum, inv) => sum + (inv.total || 0), 0);
  const realTransactionsCount = invoices.length;

  // Simple category solver for real data
  const getRealCategorySum = (categoryLabel: string) => {
    return invoices.reduce((sum, inv) => {
      const emisor = (inv.nombreEmisor || "").toLowerCase();
      if (categoryLabel === "Alimentación" && (emisor.includes("starbucks") || emisor.includes("coffee") || emisor.includes("oxxo") || emisor.includes("restaurante") || emisor.includes("cafe"))) {
        return sum + inv.total;
      }
      if (categoryLabel === "Transporte" && (emisor.includes("uber") || emisor.includes("didi") || emisor.includes("gas") || emisor.includes("pemex"))) {
        return sum + inv.total;
      }
      if (categoryLabel === "Vivienda" && (emisor.includes("renta") || emisor.includes("cfe") || emisor.includes("luz") || emisor.includes("agua") || emisor.includes("telmex"))) {
        return sum + inv.total;
      }
      if (categoryLabel === "Compras" && (emisor.includes("walmart") || emisor.includes("costco") || emisor.includes("amazon") || emisor.includes("mercado"))) {
        return sum + inv.total;
      }
      // fallback to Compras
      if (categoryLabel === "Compras") {
        return sum + inv.total;
      }
      return sum;
    }, 0);
  };

  return (
    <div className="max-w-xl mx-auto space-y-6 font-sans text-left mt-2 relative select-none pb-24">
      
      {/* 0. SMART MODE SWITCHER FOR TESTING */}
      <div className="flex items-center justify-between bg-white border border-slate-200/50 px-4.5 py-3 rounded-2xl shadow-[0_4px_20px_rgba(15,23,42,0.02)]">
        <div className="flex items-center gap-2">
          <Info className="w-4.5 h-4.5 text-[#0B53F4] shrink-0" />
          <div className="leading-tight text-left">
            <span className="text-[11px] font-black text-slate-805 block">Visualización de Gastos</span>
            <span className="text-[9.5px] text-slate-400 block">Alterna entre plantilla idéntica o datos vivos</span>
          </div>
        </div>

        <div className="flex bg-[#F1F3FE] p-1 rounded-xl border border-slate-100 shadow-inner">
          <button
            type="button"
            onClick={() => toggleDataMode("simulated")}
            className={`px-3 py-1 text-[10px] font-black uppercase rounded-lg transition-all cursor-pointer ${
              dataMode === "simulated"
                ? "bg-[#0B53F4] text-white shadow-xs"
                : "text-slate-450 hover:text-slate-800"
            }`}
          >
            Fidelidad
          </button>
          <button
            type="button"
            onClick={() => toggleDataMode("real")}
            className={`px-3 py-1 text-[10px] font-black uppercase rounded-lg transition-all cursor-pointer ${
              dataMode === "real"
                ? "bg-[#0B53F4] text-white shadow-xs"
                : "text-slate-450 hover:text-slate-800"
            }`}
          >
            Mis Datos ({invoices.length})
          </button>
        </div>
      </div>

      {/* 1. BLUE CARD - TOTAL GASTOS */}
      <div className="bg-[#0B53F4] text-white rounded-3xl p-6 shadow-md relative overflow-hidden select-none">
        {/* Subtle white circle back accent */}
        <div className="absolute top-0 right-0 w-36 h-36 bg-gradient-to-tr from-white/10 to-transparent rounded-full blur-2xl pointer-events-none" />
        
        {/* Top title and month selection label matching screenshot */}
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-black text-blue-200 uppercase tracking-widest block font-sans">
            TOTAL GASTOS (MES)
          </span>
          <span className="bg-white/15 backdrop-blur-md text-[10.5px] font-bold text-white px-3.5 py-1 rounded-full leading-none">
            {dataMode === "simulated" ? "Septiembre" : "Este Mes"}
          </span>
        </div>

        {/* Large cash indicator */}
        <div className="flex items-baseline mt-4 leading-none font-sans">
          <span className="text-2xl font-black text-blue-200 mr-1.5">$</span>
          <span className="text-4xl font-extrabold tracking-tight">
            {dataMode === "simulated" ? "2,485.60" : formatCurrency(realTotalSpent)}
          </span>
        </div>

        {/* Lower pill values */}
        <div className="flex items-center gap-3.5 mt-5 text-[11px] font-bold leading-none">
          <span className="bg-white/15 px-3 py-1.5 rounded-full flex items-center gap-1.5">
            ↘ 12% vs ago
          </span>
          <span className="text-blue-105/90">
            {dataMode === "simulated" ? "142 transacciones" : `${realTransactionsCount} transacciones`}
          </span>
        </div>
      </div>

      {/* 2. EVOLUCIÓN HISTORIC MINI-CHART CARD */}
      <div className="bg-white border border-slate-200/50 rounded-3xl p-5.5 shadow-[0_4px_20px_rgba(15,23,42,0.02)]">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-black text-slate-800 tracking-tight font-sans">Evolución</h3>
          <span className="text-xs font-black text-[#0B53F4] font-sans">
            Sep: $2.4k
          </span>
        </div>

        {/* Custom graphic bars aligned horizontally exactly as pictured */}
        <div className="flex items-end justify-between h-36 pt-6 pb-2.5 px-3">
          {/* Jun */}
          <div className="flex flex-col items-center flex-1 max-w-[42px] h-full justify-end">
            <div className="w-full flex-1 flex items-end justify-center mb-1.5">
              <div className="w-9 bg-[#EBF1FF] rounded-t-lg transition-all hover:bg-[#D7E4FF]" style={{ height: "35%" }} />
            </div>
            <span className="text-[11px] text-slate-400 font-bold">Jun</span>
          </div>
          {/* Jul */}
          <div className="flex flex-col items-center flex-1 max-w-[42px] h-full justify-end">
            <div className="w-full flex-1 flex items-end justify-center mb-1.5">
              <div className="w-9 bg-[#EBF1FF] rounded-t-lg transition-all hover:bg-[#D7E4FF]" style={{ height: "65%" }} />
            </div>
            <span className="text-[11px] text-slate-400 font-bold">Jul</span>
          </div>
          {/* Ago */}
          <div className="flex flex-col items-center flex-1 max-w-[42px] h-full justify-end">
            <div className="w-full flex-1 flex items-end justify-center mb-1.5">
              <div className="w-9 bg-[#EBF1FF] rounded-t-lg transition-all hover:bg-[#D7E4FF]" style={{ height: "55%" }} />
            </div>
            <span className="text-[11px] text-slate-400 font-bold">Ago</span>
          </div>
          {/* Sep (Active blue bar) */}
          <div className="flex flex-col items-center flex-1 max-w-[42px] h-full justify-end">
            <div className="w-full flex-1 flex items-end justify-center mb-1.5">
              <div className="w-9 bg-[#0B53F4] rounded-t-lg shadow-sm transition-all hover:bg-[#0747D1]" style={{ height: "88%" }} />
            </div>
            <span className="text-[11px] text-[#0B53F4] font-extrabold">Sep</span>
          </div>
        </div>
      </div>

      {/* 3. DISTRIBUCIÓN PROGRESS INDICATORS CARD */}
      <div className="bg-white border border-slate-200/50 rounded-3xl p-5.5 shadow-[0_4px_20px_rgba(15,23,42,0.02)]">
        <div className="flex items-center justify-between pb-3.5">
          <h3 className="text-base font-black text-slate-800 tracking-tight font-sans">Distribución</h3>
          <PieChart className="w-4.5 h-4.5 text-slate-400 stroke-[2.3]" />
        </div>

        {/* Core breakdown progress values bar by bar */}
        <div className="space-y-4">
          {/* Alimentación Bar */}
          <div className="space-y-1.5 text-left">
            <div className="flex justify-between items-center text-xs">
              <span className="font-extrabold text-slate-800 font-sans">Alimentación</span>
              <span className="text-xs text-slate-500 font-medium font-sans">
                {dataMode === "simulated" ? "$840.00 (34%)" : `$${getRealCategorySum("Alimentación").toFixed(2)} (${realTotalSpent > 0 ? Math.round((getRealCategorySum("Alimentación")/realTotalSpent)*100) : 0}%)`}
              </span>
            </div>
            <div className="w-full bg-[#EBF1FF]/70 h-1.5 rounded-full overflow-hidden">
              <div className="bg-[#0B53F4] h-full rounded-full transition-all duration-300" style={{ width: dataMode === "simulated" ? "34%" : `${realTotalSpent > 0 ? (getRealCategorySum("Alimentación")/realTotalSpent)*100 : 0}%` }} />
            </div>
          </div>

          {/* Housing / Vivienda & Otros Bar */}
          <div className="space-y-1.5 text-left">
            <div className="flex justify-between items-center text-xs">
              <span className="font-extrabold text-slate-800 font-sans">Vivienda & Otros</span>
              <span className="text-xs text-slate-500 font-medium font-sans">
                {dataMode === "simulated" ? "$1,645.60 (66%)" : `$${(realTotalSpent - getRealCategorySum("Alimentación")).toFixed(2)} (${realTotalSpent > 0 ? Math.round(((realTotalSpent - getRealCategorySum("Alimentación"))/realTotalSpent)*100) : 0}%)`}
              </span>
            </div>
            <div className="w-full bg-[#EBF1FF]/70 h-1.5 rounded-full overflow-hidden">
              <div className="bg-[#3B82F6] h-full rounded-full transition-all duration-300" style={{ width: dataMode === "simulated" ? "66%" : `${realTotalSpent > 0 ? ((realTotalSpent - getRealCategorySum("Alimentación"))/realTotalSpent)*100 : 0}%` }} />
            </div>
          </div>
        </div>
      </div>

      {/* 4. TITLE DESGLOSE POR CATEGORÍA */}
      <div className="text-left pt-2">
        <h2 className="text-lg font-extrabold text-slate-800 tracking-tight font-sans">Desglose por Categoría</h2>
      </div>

      {/* 2X2 CATEGORIES GRID CAPSULES */}
      <div className="grid grid-cols-2 gap-4">
        {/* Alimentación Box */}
        <div className="bg-white border border-slate-200/55 p-5 rounded-3xl shadow-[0_4px_20px_rgba(15,23,42,0.02)] hover:border-slate-300 transition text-left flex flex-col justify-between">
          <div className="w-10 h-10 bg-[#0B53F4]/10 rounded-full flex items-center justify-center text-[#0B53F4] mb-3.5 self-start">
            <Utensils className="w-5.5 h-5.5 stroke-[2.3]" />
          </div>
          <div className="leading-tight">
            <span className="text-xs text-slate-400 font-bold block font-sans">Alimentación</span>
            <span className="text-base font-black text-slate-805 mt-1 block font-sans">
              {dataMode === "simulated" ? "$840.20" : `$${getRealCategorySum("Alimentación").toFixed(2)}`}
            </span>
          </div>
        </div>

        {/* Transporte Box */}
        <div className="bg-white border border-slate-200/55 p-5 rounded-3xl shadow-[0_4px_20px_rgba(15,23,42,0.02)] hover:border-slate-300 transition text-left flex flex-col justify-between">
          <div className="w-10 h-10 bg-[#0B53F4]/10 rounded-full flex items-center justify-center text-[#0B53F4] mb-3.5 self-start">
            <Car className="w-5.5 h-5.5 stroke-[2.3]" />
          </div>
          <div className="leading-tight">
            <span className="text-xs text-slate-400 font-bold block font-sans">Transporte</span>
            <span className="text-base font-black text-slate-805 mt-1 block font-sans">
              {dataMode === "simulated" ? "$320.45" : `$${getRealCategorySum("Transporte").toFixed(2)}`}
            </span>
          </div>
        </div>

        {/* Vivienda Box */}
        <div className="bg-white border border-slate-200/55 p-5 rounded-3xl shadow-[0_4px_20px_rgba(15,23,42,0.02)] hover:border-slate-300 transition text-left flex flex-col justify-between">
          <div className="w-10 h-10 bg-[#0B53F4]/10 rounded-full flex items-center justify-center text-[#0B53F4] mb-3.5 self-start">
            <Home className="w-5.5 h-5.5 stroke-[2.3]" />
          </div>
          <div className="leading-tight">
            <span className="text-xs text-slate-400 font-bold block font-sans">Vivienda</span>
            <span className="text-base font-black text-slate-805 mt-1 block font-sans">
              {dataMode === "simulated" ? "$950.00" : `$${getRealCategorySum("Vivienda").toFixed(2)}`}
            </span>
          </div>
        </div>

        {/* Compras Box */}
        <div className="bg-white border border-slate-200/55 p-5 rounded-3xl shadow-[0_4px_20px_rgba(15,23,42,0.02)] hover:border-slate-300 transition text-left flex flex-col justify-between">
          <div className="w-10 h-10 bg-[#0B53F4]/10 rounded-full flex items-center justify-center text-[#0B53F4] mb-3.5 self-start">
            <ShoppingBag className="w-5.5 h-5.5 stroke-[2.3]" />
          </div>
          <div className="leading-tight">
            <span className="text-xs text-slate-400 font-bold block font-sans">Compras</span>
            <span className="text-base font-black text-slate-800 mt-1 block font-sans">
              {dataMode === "simulated" ? "$374.95" : `$${getRealCategorySum("Compras").toFixed(2)}`}
            </span>
          </div>
        </div>
      </div>

      {/* 5. TITLE ÚLTIMOS GASTOS & LINK ROW */}
      <div className="flex items-center justify-between pt-2 px-0.5">
        <h2 className="text-lg font-extrabold text-slate-800 tracking-tight font-sans">Últimos Gastos</h2>
        <button
          type="button"
          onClick={() => {
            if (onTabChange) {
              onTabChange("tickets");
              toast.info("Mostrando detalle completo de tickets de facturación.", "Tickets Guardados");
            } else {
              toast.info("Acción disponible vinculando tickets.", "Navegación");
            }
          }}
          className="text-xs font-bold text-[#0B53F4] hover:underline cursor-pointer bg-transparent"
        >
          Ver todo
        </button>
      </div>

      {/* TRANSACTION ITEMS LOGS PANEL */}
      <div className="space-y-3.5">
        {dataMode === "simulated" ? (
          <>
          {/* Mercadona Item */}
          <div className="bg-white border border-slate-200/55 rounded-3xl p-4.5 flex items-center justify-between shadow-[0_4px_20px_rgba(15,23,42,0.02)]">
            <div className="flex items-center gap-3.5 text-left">
              <div className="w-10 h-10 bg-[#0B53F4]/10 rounded-full flex items-center justify-center text-[#0B53F4] shrink-0">
                <FileText className="w-5 h-5 stroke-[2.2]" />
              </div>
              <div className="leading-tight">
                <span className="text-sm font-black text-slate-800 block font-sans">Mercadona Super</span>
                <span className="text-xs text-slate-400 block mt-0.5 font-sans">Ayer, 18:42 • Alimentación</span>
              </div>
            </div>
            <span className="text-sm font-black text-rose-600 font-mono tracking-tight shrink-0">
              -$42.50
            </span>
          </div>

          {/* Uber Spain Item */}
          <div className="bg-white border border-slate-200/55 rounded-3xl p-4.5 flex items-center justify-between shadow-[0_4px_20px_rgba(15,23,42,0.02)]">
            <div className="flex items-center gap-3.5 text-left">
              <div className="w-10 h-10 bg-[#0B53F4]/10 rounded-full flex items-center justify-center text-[#0B53F4] shrink-0">
                <Car className="w-5 h-5 stroke-[2.2]" />
              </div>
              <div className="leading-tight">
                <span className="text-sm font-black text-slate-800 block font-sans">Uber Spain</span>
                <span className="text-xs text-slate-400 block mt-0.5 font-sans">12 Sep • Transporte</span>
              </div>
            </div>
            <span className="text-sm font-black text-rose-600 font-mono tracking-tight shrink-0">
              -$15.20
            </span>
          </div>
          </>
        ) : invoices.length === 0 ? (
          <div className="bg-white border border-dashed border-slate-200/80 p-8 rounded-3xl text-center">
            <Info className="w-7 h-7 text-slate-300 mx-auto mb-2" />
            <p className="text-xs text-slate-450 font-bold">No has registrado facturas aún en el SAT para este periodo.</p>
          </div>
        ) : (
          invoices.slice(0, 4).map((inv) => {
            // dynamic icon resolution for invoices
            const isTransport = (inv.nombreEmisor || "").toLowerCase().includes("uber") || (inv.nombreEmisor || "").toLowerCase().includes("didi");
            return (
              <div key={inv.id} className="bg-white border border-slate-200/55 rounded-3xl p-4.5 flex items-center justify-between shadow-[0_4px_20px_rgba(15,23,42,0.02)]">
                <div className="flex items-center gap-3.5 text-left">
                  <div className="w-10 h-10 bg-[#0B53F4]/10 rounded-full flex items-center justify-center text-[#0B53F4] shrink-0">
                    {isTransport ? <Car className="w-5 h-5 stroke-[2.2]" /> : <FileText className="w-5 h-5 stroke-[2.2]" />}
                  </div>
                  <div className="leading-tight max-w-[240px]">
                    <span className="text-sm font-black text-slate-800 block truncate font-sans">{inv.nombreEmisor}</span>
                    <span className="text-xs text-slate-400 block mt-0.5 font-sans">
                      {new Date(inv.createdAt).toLocaleString("es-MX", { dateStyle: "short" })} • {isTransport ? "Transporte" : "Compras"}
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
  );
}
