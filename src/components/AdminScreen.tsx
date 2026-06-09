import React, { useState } from "react";
import { Connector, Ticket, Invoice } from "../types";
import { 
  Shield, Server, Users, Cpu, Database, RefreshCw, 
  Settings, CheckCircle, AlertTriangle, Play, HelpCircle,
  Bell, Calendar, Sparkles, Brain, ArrowUpRight, Search,
  ShoppingCart, Landmark, Terminal, Zap, BookOpen, ChevronRight,
  MoreVertical, Check, Info
} from "lucide-react";
import { useToast } from "./Toast";

interface AdminScreenProps {
  connectors: Connector[];
  tickets: Ticket[];
  invoices: Invoice[];
  onForceReSeed: () => Promise<void>;
  onLearnConnector: (nombre: string, rfc: string) => Promise<void>;
  isLearningLoading: boolean;
}

export default function AdminScreen({
  connectors,
  tickets,
  invoices,
  onForceReSeed,
  onLearnConnector,
  isLearningLoading,
}: AdminScreenProps) {
  const toast = useToast();
  const [activeFilter, setActiveFilter] = useState<"todo" | "activos" | "sat" | "portales">("todo");
  const [searchQuery, setSearchQuery] = useState("");
  const [newNombre, setNewNombre] = useState("");
  const [newRfc, setNewRfc] = useState("");
  const [isReSeeding, setIsReSeeding] = useState(false);
  const [logsTime, setLogsTime] = useState<string>(new Date().toLocaleTimeString());

  // Handle re-seed SAT connectors
  const handleTriggerReSeed = async () => {
    setIsReSeeding(true);
    try {
      await onForceReSeed();
      toast.success("¡Conectores base re-sincronizados correctamente!", "Satelite Sincronizado");
    } catch (err: any) {
      toast.error(err.message || "Error al resembrar.", "Sincronización Fallida");
    } finally {
      setIsReSeeding(false);
    }
  };

  // Handle learn new portal
  const handleLearnSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNombre.trim()) {
      toast.error("Proporciona el nombre de la empresa para iniciar el modelado IA.", "Nombre Requerido");
      return;
    }
    const cleanRfc = newRfc.trim().toUpperCase();
    if (cleanRfc && (cleanRfc.length < 12 || cleanRfc.length > 13)) {
      toast.error("El RFC proporcionado debe contener entre 12 y 13 dígitos.", "RFC Inválido");
      return;
    }

    try {
      await onLearnConnector(newNombre.trim(), cleanRfc);
      toast.success(
        `¡Portal '${newNombre}' mapeado exitosamente! Se han programado selectores dinámicos de facturación.`,
        "Entrenamiento Exitoso"
      );
      setNewNombre("");
      setNewRfc("");
    } catch (err: any) {
      toast.error(err.message || "No se pudo entrenar la IA para este portal.", "Error de Aprendizaje");
    }
  };

  // Filter connectors dynamically based on search and category pill selection
  const filteredConnectors = connectors.filter((c) => {
    // 1. Filter by search query
    const matchesSearch = 
      c.nombre.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.rfc.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (!matchesSearch) return false;

    // 2. Filter by category pill selector
    if (activeFilter === "todo") return true;
    if (activeFilter === "sat") {
      return c.nombre.toLowerCase().includes("sat") || c.rfc === "SAT970701NN3";
    }
    if (activeFilter === "portales") {
      return !c.nombre.toLowerCase().includes("sat") && c.rfc !== "SAT970701NN3";
    }
    if (activeFilter === "activos") {
      // Return established / seed system-wide connectors
      return c.userId === "system";
    }
    return true;
  });

  return (
    <div className="max-w-xl mx-auto space-y-6 font-sans text-left mt-2 relative select-none pb-24">
      
      {/* 1. TOP HEADER BRANDED ROW */}
      <div className="flex bg-white border-b border-slate-100 px-5 py-4 items-center justify-between sticky top-0 z-30 font-sans -mx-4 -mt-6 sm:-mx-8 sm:-mt-8 rounded-t-3xl mb-3 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full border border-slate-200/80 overflow-hidden flex items-center justify-center bg-slate-50">
            <img 
              src="https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=200" 
              alt="User Avatar" 
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
          </div>
          <span className="text-base font-black text-[#0B53F4] tracking-tight">ZenTicket Admin</span>
        </div>
        
        <div className="flex items-center gap-3">
          <button 
            type="button"
            onClick={handleTriggerReSeed}
            disabled={isReSeeding}
            title="Sincronizar base"
            className="text-[#0B53F4] bg-[#0B53F4]/5 hover:bg-[#0B53F4]/10 transition p-2 rounded-xl border border-[#0B53F4]/10 cursor-pointer disabled:opacity-60"
          >
            <RefreshCw className={`w-4 h-4 text-[#0B53F4] ${isReSeeding ? "animate-spin" : ""}`} />
          </button>
          <button 
            onClick={() => toast.info("No hay nuevas alertas de red en este momento.", "Alertas")}
            className="text-[#0B53F4] hover:opacity-80 transition relative bg-transparent border-none outline-none p-1 cursor-pointer"
          >
            <Bell className="w-5.5 h-5.5 stroke-[2.3]" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-rose-500 rounded-full border-2 border-white" />
          </button>
        </div>
      </div>

      {/* 2. SECTION TITLE */}
      <div className="flex items-center justify-between px-1">
        <h2 className="text-xl font-black text-slate-800 tracking-tight">Resumen del Negocio</h2>
        <button
          onClick={() => toast.info("Filtro temporal bloqueado a mes corriente para auditoría.", "Periodo Activo")}
          type="button"
          className="text-xs font-bold text-[#0B53F4] bg-white border border-[#EBF1FF] hover:bg-slate-50/60 px-3 py-1.5 rounded-xl transition shadow-2xs flex items-center gap-1.5"
        >
          <Calendar className="w-3.5 h-3.5" />
          <span>Este Mes</span>
        </button>
      </div>

      {/* 3. MONTHLY INCOME BLUE CARD */}
      <div className="bg-[#0B53F4] text-white rounded-3xl p-6 shadow-md relative overflow-hidden select-none">
        <div className="absolute top-0 right-0 w-36 h-36 bg-gradient-to-tr from-white/10 to-transparent rounded-full blur-2xl pointer-events-none" />
        <span className="text-[10px] font-black text-blue-200 uppercase tracking-widest block font-mono">INGRESOS MENSUALES</span>
        <h2 className="text-3xl font-black mt-2 tracking-tight">$487,200 MXN</h2>
        <div className="flex items-center gap-2 mt-4 text-xs font-bold leading-none">
          <span className="bg-white/15 px-2.5 py-1 rounded-full flex items-center gap-1">
            📈 12%
          </span>
          <span className="text-blue-100/90">vs. $435,000 MXN mes ant.</span>
        </div>
      </div>

      {/* 4. TOTAL SUBSCRIBERS AND ANNUAL FORECAST */}
      <div className="grid grid-cols-2 gap-4">
        {/* Total usuarios */}
        <div className="bg-white border border-slate-200/70 rounded-3xl p-5 shadow-2xs flex flex-col justify-between">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block leading-none">TOTAL USUARIOS</span>
          <div className="flex items-baseline gap-2 mt-2 leading-none">
            <span className="text-2xl font-black text-slate-800 font-sans">1,284</span>
            <span className="text-xs font-black text-emerald-500 font-sans">+12%</span>
          </div>
        </div>

        {/* Proyección anual */}
        <div className="bg-white border border-slate-200/70 rounded-3xl p-5 shadow-2xs flex flex-col justify-between">
          <div className="flex justify-between items-baseline leading-none">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">PROYECCIÓN ANUAL</span>
          </div>
          <div className="flex justify-between items-end mt-2 leading-none">
            <span className="text-xs font-bold text-slate-500">65% de Meta</span>
            <span className="text-xs font-black text-slate-800">$5.8M</span>
          </div>
          <div className="w-full bg-slate-100 h-2 rounded-full mt-2.5 overflow-hidden">
            <div className="bg-[#0B53F4] h-full rounded-full transition-all duration-500" style={{ width: "65%" }} />
          </div>
        </div>
      </div>

      {/* 5. ACCOUNT DISTRIBUTION SPLIT PROGRESS */}
      <div className="bg-white border border-slate-200/70 rounded-3xl p-5 shadow-2xs">
        <span className="text-[10.5px] font-bold text-slate-400 uppercase tracking-widest block">DISTRIBUCIÓN DE CUENTAS</span>
        
        {/* Multi-segmented single bar */}
        <div className="flex w-full h-2.5 rounded-full mt-3 overflow-hidden bg-slate-100 shadow-inner">
          <div className="bg-[#0B53F4]" style={{ width: "65%" }} title="Pro Auto (65%)" />
          <div className="bg-blue-400" style={{ width: "25%" }} title="Business (25%)" />
          <div className="bg-blue-200" style={{ width: "10%" }} title="Free (10%)" />
        </div>

        {/* Labels below */}
        <div className="grid grid-cols-3 gap-2 mt-4 text-left border-t border-slate-50 pt-3">
          <div>
            <span className="text-[10px] text-slate-400 block font-bold">Pro Auto</span>
            <span className="text-sm font-extrabold text-slate-705 block mt-0.5">840</span>
          </div>
          <div>
            <span className="text-[10px] text-slate-400 block font-bold">Business</span>
            <span className="text-sm font-extrabold text-slate-705 block mt-0.5">320</span>
          </div>
          <div>
            <span className="text-[10px] text-slate-400 block font-bold">Free</span>
            <span className="text-sm font-extrabold text-slate-705 block mt-0.5">124</span>
          </div>
        </div>
      </div>

      {/* 6. APRENDER PORTAL CON IA (INTERACTIVE TRAINING BUILDER) */}
      <div id="ai-training-builder-card" className="bg-white border border-slate-200/75 rounded-3xl p-6 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-[#0B53F4]/5 rounded-full blur-2xl pointer-events-none" />
        
        {/* Rounded interactive floating badge matching the picture */}
        <div className="flex gap-4 items-start pb-5">
          <div className="w-12 h-12 rounded-full bg-[#0B53F4]/10 border border-[#0B53F4]/15 flex items-center justify-center text-[#0B53F4] shrink-0">
            <Brain className="w-6 h-6 stroke-[2.3]" />
          </div>
          <div className="text-left leading-tight">
            <h3 className="text-base font-black text-slate-9 tracking-tight">Aprender Portal con IA</h3>
            <p className="text-xs text-slate-450 mt-1">Registra y entrena nuevas integraciones con el poder de la IA</p>
          </div>
        </div>

        <form onSubmit={handleLearnSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-widest ml-1">
              Nombre de la empresa
            </label>
            <input
              type="text"
              required
              value={newNombre}
              onChange={(e) => setNewNombre(e.target.value)}
              placeholder="Costco, Starbucks, Amazon..."
              className="w-full text-sm font-medium bg-[#F1F3FE]/70 border border-slate-200/40 hover:bg-[#F1F3FE] focus:border-[#0B53F4] focus:ring-1 focus:ring-[#0B53F4]/20 rounded-2xl px-4 py-3.5 text-slate-800 placeholder-slate-400 focus:outline-none transition-all"
            />
          </div>

          <div className="space-y-1">
            <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-widest ml-1">
              RFC Emisor (Opcional)
            </label>
            <input
              type="text"
              maxLength={13}
              value={newRfc}
              onChange={(e) => setNewRfc(e.target.value.toUpperCase())}
              placeholder="ABCD123456XYZ"
              className="w-full text-sm font-mono font-bold bg-[#F1F3FE]/70 border border-slate-200/40 hover:bg-[#F1F3FE] focus:border-[#0B53F4] focus:ring-1 focus:ring-[#0B53F4]/20 rounded-2xl px-4 py-3.5 text-slate-800 placeholder-slate-400 focus:outline-none transition-all uppercase"
            />
          </div>

          <button
            type="submit"
            disabled={isLearningLoading}
            className="w-full bg-[#0B53F4] hover:bg-[#0747D1] disabled:opacity-55 text-white font-black text-sm py-4 rounded-2xl transition flex items-center justify-center gap-2 cursor-pointer shadow-md shadow-[#0B53F4]/15 active:scale-[0.98] select-none"
          >
            {isLearningLoading ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin shrink-0 text-white" />
                <span>Mapeando Selectores...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 text-white fill-white shrink-0" />
                <span>Aprender Portal</span>
              </>
            )}
          </button>
        </form>
      </div>

      {/* 7. CONNECTORS AND AI MODELS COUNT SIDE-BY-SIDE */}
      <div className="grid grid-cols-2 gap-4">
        {/* Connectores badge */}
        <div 
          onClick={() => {
            setActiveFilter("todo");
            toast.info("Mostrando biblioteca completa de conectores.", "Biblioteca");
          }}
          className="bg-[#E4ECFE]/70 border border-[#CBD9FE] rounded-3xl p-4.5 cursor-pointer hover:bg-[#E4ECFE] active:scale-95 transition-all text-left flex items-center justify-between"
        >
          <div>
            <span className="text-[10px] font-bold text-[#0B53F4] uppercase tracking-wider block">CONECTORES</span>
            <span className="text-xl font-black text-[#0B53F4] mt-1 block">42</span>
          </div>
          <div className="w-9 h-9 bg-white rounded-full flex items-center justify-center text-[#0B53F4]">
            <RefreshCw className="w-5 h-5 stroke-[2]" />
          </div>
        </div>

        {/* Modelos IA badge */}
        <div 
          onClick={() => {
            setActiveFilter("sat");
            toast.info("Filtrando por conectores optimizados por modelos IA del SAT.", "Modelos SAT");
          }}
          className="bg-[#E4ECFE]/70 border border-[#CBD9FE] rounded-3xl p-4.5 cursor-pointer hover:bg-[#E4ECFE] active:scale-95 transition-all text-left flex items-center justify-between"
        >
          <div>
            <span className="text-[10px] font-bold text-[#0B53F4] uppercase tracking-wider block">MODELOS IA</span>
            <span className="text-xl font-black text-[#0B53F4] mt-1 block">15</span>
          </div>
          <div className="w-9 h-9 bg-white rounded-full flex items-center justify-center text-[#0B53F4]">
            <Brain className="w-5 h-5 stroke-[2]" />
          </div>
        </div>
      </div>

      {/* 8. BIBLIOTECA DE CONECTORES & CATEGORIES FILTER */}
      <div className="space-y-4 pt-3">
        <h3 className="text-base font-black text-slate-800 tracking-tight pl-1">Biblioteca de Conectores</h3>
        
        {/* Search Input Box */}
        <div className="relative">
          <Search className="absolute left-4.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-400 stroke-[2.3]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar por Nombre o RFC..."
            className="w-full text-sm font-medium bg-white border border-slate-200/90 focus:border-[#0B53F4] focus:ring-1 focus:ring-[#0B53F4]/20 rounded-2xl pl-12 pr-5 py-3.5 text-slate-800 focus:outline-none transition-all placeholder-slate-400"
          />
        </div>

        {/* Category Pills Slider */}
        <div className="flex gap-2.5 overflow-x-auto pb-1 scrollbar-none select-none">
          {[
            { id: "todo", label: "Todo" },
            { id: "activos", label: "Activos" },
            { id: "sat", label: "SAT" },
            { id: "portales", label: "Portales" },
          ].map((pill) => {
            const isActive = activeFilter === pill.id;
            return (
              <button
                key={pill.id}
                type="button"
                onClick={() => setActiveFilter(pill.id as any)}
                className={`px-4.5 py-1.5 text-xs font-bold rounded-full transition-all cursor-pointer whitespace-nowrap leading-none ${
                  isActive 
                    ? "bg-[#0B53F4] text-white shadow-xs"
                    : "bg-[#EBF1FF]/70 hover:bg-[#EBF1FF] text-[#0B53F4]"
                }`}
              >
                {pill.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* 9 & 10. CONNECTOR CARDS LIBRARY (EXACTLY AS SPECIFIED IN DESIGN) */}
      <div className="space-y-4 pt-2">
        {filteredConnectors.length === 0 ? (
          <div className="bg-white border border-dashed border-slate-200 p-8 rounded-3xl text-center">
            <Info className="w-8 h-8 text-slate-300 mx-auto mb-2" />
            <p className="text-xs text-slate-550 font-bold">Ningún conector coincide con los filtros especificados.</p>
          </div>
        ) : (
          filteredConnectors.map((c) => {
            // Customize connectors display elements based on current name
            const isSAT = c.nombre.toLowerCase().includes("sat") || c.rfc === "SAT970701NN3";
            const isLiverpool = c.nombre.toLowerCase().includes("liverpool");
            const isWalmart = c.nombre.toLowerCase().includes("walmart");
            const isOxxo = c.nombre.toLowerCase().includes("oxxo");

            // Build dynamic representation parameters matching high fidelity designs
            const logoBg = isSAT ? "bg-[#EBF1FF] text-[#0B53F4]" : "bg-[#F1F3FE] text-[#0B53F4]";
            const logoIcon = isSAT ? <Landmark className="w-5.5 h-5.5 stroke-[2.2]" /> : <ShoppingCart className="w-5.5 h-5.5 stroke-[2.2]" />;
            
            // Custom label badges
            let badgeText = "GLOBAL";
            let badgeBg = "bg-emerald-550/10 text-emerald-650 border-emerald-500/10";
            if (isLiverpool || isOxxo) {
              badgeText = "RESTRINGIDO";
              badgeBg = "bg-amber-550/15 text-amber-650 border-amber-500/10";
            } else if (c.userId !== "system") {
              badgeText = "MOCKUP IA";
              badgeBg = "bg-blue-550/10 text-[#0B53F4] border-blue-500/10";
            }

            // Required fields array
            let requireFieldsPills = ["RFC Emisor", "e.firma / CIEC", "Rango Fechas"];
            if (isLiverpool) requireFieldsPills = ["Código de Venta", "Importe"];
            else if (isWalmart) requireFieldsPills = ["RFC Receptor", "Número de Ticket", "C.P."];
            else if (isOxxo) requireFieldsPills = ["RFC Cliente", "Folio Venta", "Fecha Compra"];

            // Form element selectors map
            let selectorMappingRows = [
              { label: "Input RFC", code: "#txtRFC" },
              { label: "Submit", code: ".btn-search" }
            ];
            if (isLiverpool) {
              selectorMappingRows = [
                { label: "Ticket ID", code: "#ticket_num" },
                { label: "Total", code: "input[name='amt']" }
              ];
            } else if (isWalmart) {
              selectorMappingRows = [
                { label: "TC #", code: "input[id='tcNum']" },
                { label: "Postal", code: "input[id='cpClient']" }
              ];
            }

            // Steps text
            let flowStepsLabels = ["ACCEDER", "AUTH", "FETCH", "RESULTADO"];
            if (isLiverpool) flowStepsLabels = ["TICKET", "DATOS", "XML"];
            else if (isWalmart) flowStepsLabels = ["TC_VAL", "CP_AUTH", "TIMBRE"];
            else if (isOxxo) flowStepsLabels = ["INGRESO", "FOLIOS", "DESCARGA"];

            return (
              <div 
                key={c.id} 
                className="bg-white border border-slate-202 shadow-xs hover:border-slate-300 rounded-3xl p-5 space-y-4"
              >
                {/* Top Identity Row */}
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 ${logoBg}`}>
                      {logoIcon}
                    </div>
                    <div className="text-left leading-tight">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-sm font-black text-slate-805">{c.nombre}</span>
                        <span className={`text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full border ${badgeBg}`}>
                          {badgeText}
                        </span>
                      </div>
                      <span className="text-[10px] text-slate-400 font-mono font-bold block mt-1 uppercase tracking-wide">
                        {c.rfc}
                      </span>
                    </div>
                  </div>

                  <a 
                    href={c.portalUrl} 
                    target="_blank" 
                    rel="noreferrer" 
                    className="text-[#0B53F4] hover:underline text-xs font-bold shrink-0 flex items-center gap-1 cursor-pointer bg-transparent"
                  >
                    <span>Portal</span>
                    <ArrowUpRight className="w-3.5 h-3.5 stroke-[2.3]" />
                  </a>
                </div>

                {/* Subcontainer Background Panel exactly as pictured in the mockup */}
                <div className="bg-[#FAF9FF] border border-slate-100 rounded-2xl p-4.5 space-y-4">
                  {/* Fields lists */}
                  <div className="space-y-1 text-left">
                    <span className="block text-[9px] font-black text-slate-400 uppercase tracking-widest font-mono">
                      CAMPOS REQUERIDOS
                    </span>
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {requireFieldsPills.map((p, index) => (
                        <span 
                          key={index} 
                          className="px-2.5 py-1 text-[10px] font-bold bg-white border border-slate-200/50 text-slate-600 rounded-lg shadow-3xs"
                        >
                          {p}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Mapping Grid */}
                  <div className="space-y-1 text-left pt-1">
                    <span className="block text-[9px] font-black text-slate-400 uppercase tracking-widest font-mono">
                      MAPEO DE FORMULARIOS
                    </span>
                    <div className="flex items-center flex-wrap gap-x-4 gap-y-1.5 pt-1.5">
                      {selectorMappingRows.map((row, index) => (
                        <div key={index} className="flex items-center gap-1 text-[10px] font-bold font-mono">
                          <span className="text-slate-450 font-sans">{row.label}</span>
                          <span className="text-[#0B53F4] bg-[#EBF1FF]/60 border border-[#EBF1FF] px-1.5 py-0.5 rounded-lg">
                            {row.code}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Flow Steps Progress Indicator */}
                  <div className="space-y-1 text-left pt-1">
                    <span className="block text-[9px] font-black text-slate-400 uppercase tracking-widest font-mono">
                      FLUJO GUÍA AUTOMÁTICO
                    </span>
                    
                    {/* Stepper Grid Container */}
                    <div className="relative mt-3 px-1">
                      {/* Connection Line */}
                      <div className="absolute top-4 left-4 right-4 h-0.5 bg-slate-200/80 -z-0" />
                      
                      <div className="flex items-center justify-between relative z-10">
                        {flowStepsLabels.map((stLabel, idx) => (
                          <div key={idx} className="flex flex-col items-center">
                            <div className="w-8 h-8 rounded-full bg-[#0B53F4] text-white flex items-center justify-center font-black text-xs border-[3px] border-white shadow-xs">
                              {idx + 1}
                            </div>
                            <span className="text-[8px] font-black text-slate-450 uppercase tracking-wider block mt-1.5 font-mono">
                              {stLabel}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                </div>
              </div>
            );
          })
        )}
      </div>

      {/* 11. LOGS DE ENTRENAMIENTO EN TIEMPO REAL */}
      <div className="space-y-3 pt-3">
        <h3 className="text-xs font-black text-slate-400 uppercase tracking-wider font-mono pl-1">
          LOGS DE ENTRENAMIENTO EN TIEMPO REAL
        </h3>

        {/* Real Console Design exactly matching layout */}
        <div className="bg-[#0D1527] border border-[#1E293B] rounded-3xl p-5 shadow-lg relative overflow-hidden select-text text-left">
          
          {/* Top logs header block */}
          <div className="flex items-center justify-between border-b border-white/5 pb-3">
            <span className="text-[10px] font-black text-white/90 uppercase tracking-widest font-mono flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-indigo-500 shrink-0" />
              💻 IA ENGINE STATUS
            </span>
            <button 
              onClick={() => toast.info("Guías técnicas de integración, selectores y Playwright en docs.zenticket.mx", "Soporte Técnico")}
              className="text-[#38BDF8] hover:underline text-[10px] font-bold font-mono tracking-wider flex items-center gap-1.5 cursor-pointer bg-transparent"
            >
              <span>🌐 Docs</span>
            </button>
          </div>

          {/* Core Logs Code Body */}
          <div className="font-mono text-[10.5px] text-[#38BDF8] py-4 space-y-2 min-h-[160px] max-h-[220px] overflow-y-auto leading-relaxed select-text scrollbar-none antialiased">
            <div className="text-white/40 font-semibold flex gap-2">
              <span>[12:25:47]</span> 
              <span className="text-white font-black uppercase">AI_LEARN:</span> 
              <span>Generando guía de pasos visuales...</span>
            </div>
            <div className="text-white/40 font-semibold flex gap-2">
              <span>[12:25:50]</span> 
              <span className="text-[#A78BFA] font-black uppercase">AI_LEARN:</span> 
              <span className="text-slate-350">Escaneando selectores de formulario...</span>
            </div>
            <div className="text-white/40 font-semibold flex gap-2">
              <span>[12:25:54]</span> 
              <span className="text-white font-black uppercase">AI_LEARN:</span> 
              <span>Generando guía de pasos visuales...</span>
            </div>
            <div className="text-white/40 font-semibold flex gap-2">
              <span>[12:25:57]</span> 
              <span className="text-white font-black uppercase">AI_LEARN:</span> 
              <span>Generando guía de pasos visuales...</span>
            </div>
          </div>

          {/* Simulated Controls Row matching screenshot capsules footer */}
          <div className="flex flex-wrap gap-2 pt-3 border-t border-white/5 justify-between">
            <button 
              type="button"
              onClick={() => {
                setLogsTime(new Date().toLocaleTimeString());
                toast.success("Consola del Playwright Worker depurada correctamente.", "Consola Limpia");
              }}
              className="px-3.5 py-2 text-[9.5px] font-black font-semibold uppercase tracking-wider text-[#94A3B8] hover:text-white bg-slate-800/40 hover:bg-slate-800 border border-slate-700/50 rounded-xl cursor-pointer transition select-none"
            >
              Depurar Selectores
            </button>
            <button 
              type="button"
              onClick={() => toast.info("Guía de entrenamiento AI generada. Analizando puertos activos de Node.", "Manual AI")}
              className="px-3.5 py-2 text-[9.5px] font-black font-semibold uppercase tracking-wider text-[#94A3B8] hover:text-white bg-slate-800/40 hover:bg-slate-800 border border-slate-700/50 rounded-xl cursor-pointer transition select-none"
            >
              Guía de Entrenamiento
            </button>
            <button 
              type="button"
              onClick={() => toast.info(JSON.stringify(connectors[0] || {}, null, 2), "Mapeador JSON de Pruebas")}
              className="px-3 py-2 text-[9.5px] font-black font-semibold uppercase tracking-wider text-[#94A3B8] hover:text-white bg-slate-800/40 hover:bg-slate-800 border border-slate-700/50 rounded-xl cursor-pointer transition select-none font-mono"
            >
              Ver JSON
            </button>
          </div>
        </div>
      </div>

      {/* 12. BOTTOM RED DE EXTRACCIÓN HARDWARE STATUS CARD CARD */}
      <div className="bg-[#FAF9FF] border border-slate-200/60 rounded-3xl p-5 flex items-center justify-between shadow-2xs select-none">
        <div className="flex items-center gap-3.5">
          {/* Green-colored server icon block */}
          <div className="w-10 h-10 bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 rounded-full flex items-center justify-center shrink-0">
            <Database className="w-5.5 h-5.5 stroke-[2.2]" />
          </div>
          <div className="text-left leading-tight">
            <span className="text-sm font-black text-slate-800 block">Red de Extracción</span>
            <span className="text-[10px] text-slate-400 block mt-1 font-semibold font-mono">Latencia Media: 120ms</span>
          </div>
        </div>

        <div className="text-right leading-tight">
          <span className="text-sm font-black text-[#0B53F4] block font-mono">12.5k req/s</span>
          <span className="text-[9px] text-[#0B53F4]/70 block mt-1 font-black uppercase tracking-wider font-mono">MXN Localization</span>
        </div>
      </div>

    </div>
  );
}
