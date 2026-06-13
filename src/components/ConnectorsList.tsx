import React, { useState } from "react";
import { Connector, ConnectorField } from "../types";
import { 
  Link2, Search, Cpu, CheckCircle, Database, HelpCircle, Loader2, X, 
  Layers, Coffee, Utensils, Car, Home, ShoppingBag, ArrowRight, ChevronDown,
  Bell, Clock
} from "lucide-react";
import { useToast } from "./Toast";
import { AnimatePresence, motion } from "motion/react";

interface ConnectorsListProps {
  connectors: Connector[];
  onLearnConnector: (nombre: string, rfc: string) => Promise<void>;
  isLoading: boolean;
}

const CATEGORY_ORDER: Record<string, number> = {
  "Alimentación": 1,
  "Transporte": 2,
  "Vivienda": 3,
  "Compras": 4
};

export function getConnectorCategory(name: string): string {
  const n = name.toLowerCase();
  if (
    n.includes("starbucks") || 
    n.includes("alsea") || 
    n.includes("mcdonald") || 
    n.includes("oxxo") || 
    n.includes("caf") || 
    n.includes("restaurante") || 
    n.includes("vips") || 
    n.includes("toks") || 
    n.includes("dominos") || 
    n.includes("burger")
  ) {
    return "Alimentación";
  }
  if (
    n.includes("uber") || 
    n.includes("didi") || 
    n.includes("cabify") || 
    n.includes("gas") || 
    n.includes("pemex") || 
    n.includes("combustible") || 
    n.includes("autopista") || 
    n.includes("viaducto") || 
    n.includes("peaje")
  ) {
    return "Transporte";
  }
  if (
    n.includes("cfe") || 
    n.includes("telmex") || 
    n.includes("izzi") || 
    n.includes("luz") || 
    n.includes("agua") || 
    n.includes("naturgy") || 
    n.includes("internet") || 
    n.includes("gas natural")
  ) {
    return "Vivienda";
  }
  return "Compras";
}

const getCategoryIcon = (category: string) => {
  switch (category) {
    case "Alimentación":
      return <Utensils className="w-4 h-4 text-amber-600 stroke-[2.3]" />;
    case "Transporte":
      return <Car className="w-4 h-4 text-indigo-600 stroke-[2.3]" />;
    case "Vivienda":
      return <Home className="w-4 h-4 text-emerald-600 stroke-[2.3]" />;
    default:
      return <ShoppingBag className="w-4 h-4 text-[#0B53F4] stroke-[2.3]" />;
  }
};

const getCategoryStyles = (category: string) => {
  switch (category) {
    case "Alimentación":
      return "bg-amber-50 border-amber-150/50 text-amber-800";
    case "Transporte":
      return "bg-indigo-50 border-indigo-150/50 text-indigo-800";
    case "Vivienda":
      return "bg-emerald-50 border-emerald-150/50 text-emerald-800";
    default:
      return "bg-blue-50 border-blue-150/50 text-[#0B53F4]";
  }
};

export default function ConnectorsList({ connectors, onLearnConnector, isLoading }: ConnectorsListProps) {
  const toast = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [newNombre, setNewNombre] = useState("");
  const [newRfc, setNewRfc] = useState("");
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  
  // Manage expanded state for each connector by id/name
  const [expandedConnectors, setExpandedConnectors] = useState<Record<string, boolean>>({});

  const toggleExpand = (id: string) => {
    setExpandedConnectors((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const formatGenerationDate = (dateStr?: string) => {
    if (!dateStr) return "08/06/2026";
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return "08/06/2026";
      return d.toLocaleDateString("es-MX", { day: "2-digit", month: "short", year: "numeric" });
    } catch {
      return "08/06/2026";
    }
  };
  
  // Modal layout states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalSearchQuery, setModalSearchQuery] = useState("");
  const [modalActiveCategory, setModalActiveCategory] = useState<string>("Todos");

  const handleLearnSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    if (!newNombre.trim()) {
      setMessage({ type: "error", text: "Proporciona el nombre de la empresa para buscar." });
      return;
    }
    const cleanRfc = newRfc.trim().toUpperCase();
    if (cleanRfc && (cleanRfc.length < 12 || cleanRfc.length > 13)) {
      setMessage({ type: "error", text: "Si proporcionas RFC, debe ser de 12 o 13 caracteres." });
      return;
    }

    try {
      await onLearnConnector(newNombre.trim(), cleanRfc);
      setMessage({
        type: "success",
        text: `¡Portal de Facturación aprendido exitosamente con IA para '${newNombre}'! Se han extraído campos, selectores e instrucciones.`,
      });
      setNewNombre("");
      setNewRfc("");
    } catch (err: any) {
      if (err.message === "PROCESO_CANCELADO_POR_USUARIO") {
        setMessage(null);
        return;
      }
      setMessage({ type: "error", text: err.message || "Error al aprender el portal." });
    }
  };

  // Helper to categorize and sort lists
  const getSortedAndMappedList = (list: Connector[]) => {
    return [...list].sort((a, b) => {
      const catA = getConnectorCategory(a.nombre);
      const catB = getConnectorCategory(b.nombre);
      const orderA = CATEGORY_ORDER[catA] || 99;
      const orderB = CATEGORY_ORDER[catB] || 99;
      if (orderA !== orderB) {
        return orderA - orderB;
      }
      return a.nombre.localeCompare(b.nombre);
    });
  };

  // Main screen connectors (sorted by category, filtered by searchQuery, sliced to max 3)
  const sortedGlobalList = getSortedAndMappedList(connectors);
  
  const mainFilteredConnectors = sortedGlobalList.filter((c) =>
    c.nombre.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.rfc.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  const displayedMainConnectors = mainFilteredConnectors.slice(0, 3);

  // Modal connectors list filtered with separate sub-states to keep search completely distinct
  const modalFilteredConnectors = sortedGlobalList.filter((c) => {
    const matchesSearch = 
      c.nombre.toLowerCase().includes(modalSearchQuery.toLowerCase()) ||
      c.rfc.toLowerCase().includes(modalSearchQuery.toLowerCase());
      
    if (!matchesSearch) return false;
    
    if (modalActiveCategory !== "Todos") {
      return getConnectorCategory(c.nombre) === modalActiveCategory;
    }
    return true;
  });

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
            Portales SAT
          </h2>
          <span className="text-[11.5px] text-blue-100 font-bold block mt-1 tracking-tight select-none opacity-85">
            Biblioteca de conectores y aprendizaje de portales
          </span>
        </div>

        {/* Stats horizontal side-by-side block matching mockup */}
        <div className="flex justify-between items-center bg-white/[0.03] backdrop-filter border border-white/5 rounded-2xl p-4.5 mb-1.5 relative z-10">
          
          {/* Left item: tickets procesados */}
          <div className="flex items-center gap-3.5 w-[50%]">
            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-white shrink-0">
              <Database className="w-5 h-5 text-blue-200" />
            </div>
            <div className="text-left min-w-0">
              <span className="text-[23px] font-black block leading-none text-white tracking-tight font-sans">
                {connectors.length}
              </span>
              <span className="text-[10px] text-blue-100 font-bold block mt-1 tracking-tight">
                conectores activos
              </span>
            </div>
          </div>

          {/* Horizontal dividing thin line */}
          <div className="w-px h-10 bg-white/10 shrink-0 self-center" />

          {/* Right item: por facturar */}
          <div className="flex items-center gap-3.5 w-[50%] pl-4.5">
            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-white shrink-0">
              <Cpu className="w-5 h-5 text-blue-200" />
            </div>
            <div className="text-left min-w-0">
              <span className="text-[13.5px] font-bold block leading-none text-white tracking-tight">
                AUTO-CONCILIABLE
              </span>
              <span className="text-[10px] text-blue-100 font-bold block mt-1 tracking-tight leading-relaxed">
                con Aprendizaje IA
              </span>
            </div>
          </div>

        </div>
      </div>

      {/* ==================== 2. MAIN ACTIVE CARD SECTION WRAPPER ==================== */}
      <div className="-mt-14 px-4 pb-20 relative z-20 w-full max-w-7xl mx-auto flex flex-col gap-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 font-body text-left relative">
      
      {/* LEFT: Search & Add Learning Form */}
      <div className="lg:col-span-1 bg-white border border-slate-200/40 rounded-3xl p-6 shadow-sm h-fit relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-[#0B53F4]/5 rounded-full blur-2xl pointer-events-none" />
        
        <h3 className="font-display font-extrabold text-base text-slate-900 tracking-tight mb-2 flex items-center gap-2">
          <Cpu className="w-5 h-5 text-[#0B53F4] shrink-0" />
          Aprender Portal con IA
        </h3>
        <p className="text-xs text-slate-500 mb-5 leading-relaxed font-medium">
          Si el emisor del ticket no tiene un conector activo, buscaremos el portal de facturación en Google y propondremos reglas de automatización.
        </p>

        <form onSubmit={handleLearnSubmit} className="space-y-4">
          <div>
            <label className="block text-[10px] font-black text-blue-600/70 uppercase tracking-widest mb-1.5 font-display">
              Nombre de la Empresa / Tienda
            </label>
            <input
              type="text"
              required
              value={newNombre}
              onChange={(e) => setNewNombre(e.target.value)}
              placeholder="e.g. Costco México, Uber, Starbucks"
              className="w-full text-xs bg-slate-50 border border-slate-200 focus:border-[#0B53F4] hover:bg-slate-50/80 rounded-xl px-4 py-3 text-slate-900 placeholder-slate-400 focus:outline-none transition-all font-body"
            />
          </div>

          <div>
            <label className="block text-[10px] font-black text-blue-600/70 uppercase tracking-widest mb-1.5 font-display">
              RFC Emisor (Opcional)
            </label>
            <input
              type="text"
              maxLength={13}
              value={newRfc}
              onChange={(e) => setNewRfc(e.target.value.toUpperCase())}
              placeholder="e.g. CCO8605231N4"
              className="w-full text-xs font-mono bg-slate-50 border border-slate-200 focus:border-[#0B53F4] hover:bg-slate-50/80 rounded-xl px-4 py-3 text-slate-900 placeholder-slate-400 focus:outline-none transition-all uppercase"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-2 text-xs font-bold uppercase tracking-wider zt-btn-primary hover:transform-none text-white py-3.5 px-4 rounded-full transition shadow-md shadow-[#0B53F4]/15 active:scale-[0.98] disabled:opacity-55 cursor-pointer leading-none"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin shrink-0" />
                <span>Interpretando Portal...</span>
              </>
            ) : (
              <>
                <Cpu className="w-4 h-4 shrink-0" />
                <span>Aprender Portal</span>
              </>
            )}
          </button>
        </form>

        {message && (
          <div
            className={`mt-4 p-3.5 rounded-2xl text-[11px] leading-relaxed flex items-start gap-2 border text-left ${
              message.type === "success"
                ? "bg-emerald-50 border-emerald-150 text-emerald-700"
                : "bg-rose-50 border-rose-150 text-rose-700"
            }`}
          >
            <CheckCircle className={`w-4 h-4 shrink-0 mt-0.5 ${message.type === "success" ? "text-emerald-600" : "text-rose-600"}`} />
            <span>{message.text}</span>
          </div>
        )}
      </div>

      {/* RIGHT: Connectors Directory Preview (Max 3) */}
      <div className="lg:col-span-2 bg-white border border-slate-200/40 rounded-3xl p-6 shadow-sm flex flex-col justify-between relative overflow-hidden min-h-[480px]">
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#0B53F4]/5 rounded-full blur-2xl pointer-events-none" />

        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-5 relative z-10">
          <div>
            <h3 className="font-display font-extrabold text-[#0b1020] text-base flex items-center gap-2">
              <Database className="w-5 h-5 text-[#0B53F4] shrink-0" />
              Biblioteca de Conectores ({connectors.length})
            </h3>
            <p className="text-xs text-slate-500 mt-1 font-medium">
              Ordenados automáticamente por categoría de consumo.
            </p>
          </div>

          <div className="relative shrink-0 w-full sm:w-auto font-body">
            <Search className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar conector..."
              className="text-xs text-slate-800 bg-slate-50 border border-slate-200 focus:border-[#0B53F4] hover:bg-slate-50/80 rounded-xl pl-9 pr-4 py-3 w-full sm:w-52 focus:outline-none transition-all"
            />
          </div>
        </div>

        {displayedMainConnectors.length === 0 ? (
          <div className="border border-dashed border-slate-200 rounded-2xl p-10 text-center my-auto relative z-10">
            <HelpCircle className="w-10 h-10 text-slate-300 mx-auto mb-3 opacity-40" />
            <p className="text-xs font-semibold text-slate-800">No se encontraron conectores</p>
            <p className="text-[11px] text-slate-450 mt-1">Intenta buscar por otro término.</p>
          </div>
        ) : (
          <div className="space-y-4 relative z-10 flex-1">
            {displayedMainConnectors.map((connector) => {
              const fields: ConnectorField[] = JSON.parse(connector.fieldsJson);
              const steps: string[] = JSON.parse(connector.flowJson);
              const category = getConnectorCategory(connector.nombre);
              const connectorId = connector.id || connector.nombre;
              const isExpanded = !!expandedConnectors[connectorId];

              return (
                <div
                  key={connector.id}
                  className="bg-white border border-slate-150/70 rounded-2xl shadow-3xs hover:border-[#0B53F4]/20 transition-all duration-150 text-left relative overflow-hidden"
                >
                  {/* Clickable Header */}
                  <div 
                    onClick={() => toggleExpand(connectorId)}
                    className="p-4 flex items-center justify-between gap-3 cursor-pointer select-none hover:bg-slate-50/50 transition-colors"
                  >
                    <div className="flex items-center gap-3.5 min-w-0">
                      {/* Icon */}
                      <div className="w-10 h-10 rounded-xl bg-slate-50/90 border border-slate-100 flex items-center justify-center shrink-0">
                        {getCategoryIcon(category)}
                      </div>
                      <div className="min-w-0">
                        <h4 className="font-extrabold text-slate-900 text-sm truncate leading-tight">
                          {connector.nombre}
                        </h4>
                        <span className="text-[10px] text-slate-400 font-mono mt-0.5 block leading-none">
                          📅 Generado: {formatGenerationDate(connector.createdAt)}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2.5 shrink-0">
                      <a
                        href={connector.portalUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="text-[10.5px] bg-[#EBF1FF]/60 hover:bg-[#EBF1FF] text-[#0B53F4] px-2.5 py-1.5 rounded-lg flex items-center gap-1 font-black transition-colors border border-[#0B53F4]/5"
                      >
                        <Link2 className="w-3.5 h-3.5 shrink-0" />
                        <span>Visitar</span>
                      </a>

                      <motion.div
                        animate={{ rotate: isExpanded ? 180 : 0 }}
                        transition={{ type: "spring", stiffness: 300, damping: 20 }}
                        className="text-slate-400 p-0.5"
                      >
                        <ChevronDown className="w-4 h-4 stroke-[2.5]" />
                      </motion.div>
                    </div>
                  </div>

                  {/* Expandable data container */}
                  <AnimatePresence initial={false}>
                    {isExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.22, ease: "easeOut" }}
                        className="overflow-hidden"
                      >
                        <div className="px-4.5 pb-4.5 pt-3 border-t border-slate-100 bg-slate-50/15 space-y-4">
                          <div className="flex gap-2 flex-wrap items-center">
                            <span className="text-[10px] bg-slate-100 text-slate-655 px-2.5 py-1 rounded-md font-mono font-bold">
                              RFC Emisor: {connector.rfc || "N/A"}
                            </span>
                            <div className={`flex items-center gap-1 px-2.5 py-0.5 rounded-lg border text-[9px] font-extrabold tracking-wide uppercase ${getCategoryStyles(category)}`}>
                              {getCategoryIcon(category)}
                              <span>{category}</span>
                            </div>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <h5 className="text-[9px] font-black text-slate-400 mb-1.5 uppercase tracking-wider font-mono">
                                Campos requeridos
                              </h5>
                              <div className="flex flex-wrap gap-1">
                                {fields.map((field) => (
                                  <span
                                    key={field.key}
                                    className="bg-white border border-slate-100 text-[9.5px] text-slate-705 px-2 py-1 rounded-md font-mono shadow-4xs"
                                  >
                                    {field.name}
                                  </span>
                                ))}
                              </div>
                            </div>

                            <div>
                              <h5 className="text-[9px] font-black text-slate-400 mb-1.5 uppercase tracking-wider font-mono font-bold">
                                Flujo automático de automatización
                              </h5>
                              <ol className="text-[10px] text-slate-600 list-decimal pl-4.5 space-y-1 font-medium font-sans">
                                {steps.map((step, idx) => (
                                  <li key={idx} className="pl-0.5">{step}</li>
                                ))}
                              </ol>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        )}

        {/* VIEW ALL CONNECTORS LINK BUTTON */}
        <div className="mt-5 pt-3.5 border-t border-slate-100/80 relative z-10">
          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            className="w-full py-3.5 bg-slate-50 hover:bg-[#F1F3FE] border border-slate-200 text-slate-700 hover:text-[#0B53F4] hover:border-[#0B53F4]/20 font-extrabold text-[11px] uppercase tracking-wider rounded-xl flex items-center justify-center gap-2 transition duration-200 cursor-pointer shadow-3xs"
          >
            <Layers className="w-4 h-4 text-slate-400 group-hover:text-[#0B53F4] transition" />
            <span>Ver Biblioteca Completa ({connectors.length})</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
      </div>
      </div>

      {/* IMMERSIVE SLIDE-OVER OR POPUP DIALOG MODAL (NOT ON MAIN SCREEN) */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            
            {/* Dark blur overlay backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="absolute inset-0 bg-slate-900/35 backdrop-blur-md cursor-zoom-out"
            />

            {/* Modal Body Card */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              transition={{ type: "spring", damping: 25, stiffness: 350 }}
              className="relative w-full max-w-2xl bg-white border border-slate-200 rounded-[32px] shadow-2xl p-6 md:p-8 flex flex-col max-h-[85vh] overflow-hidden z-10 text-left font-sans"
            >
              {/* Header section with Close */}
              <div className="flex items-start justify-between mb-4">
                <div>
                  <div className="flex items-center gap-2 bg-[#EBF1FF] border border-[#0B53F4]/15 rounded-xl px-2.5 py-1 text-[#0B53F4] text-[10px] font-extrabold uppercase tracking-widest w-fit mb-1.5">
                    <Database className="w-3.5 h-3.5 stroke-[2.3]" />
                    <span>ZenTicket Connectors</span>
                  </div>
                  
                  <h3 className="text-xl font-black text-slate-900 tracking-tight">
                    Biblioteca de Portales de Consumo
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">
                    Explora todos los conectores automatizados del SAT organizados por tipo de gasto.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="p-2 text-slate-400 hover:text-slate-700 bg-slate-50 hover:bg-slate-100 rounded-xl transition cursor-pointer"
                >
                  <X className="w-5 h-5 stroke-[2.2]" />
                </button>
              </div>

              {/* SEARCH & CATEGORY SELECTOR SYSTEM inside modal */}
              <div className="space-y-4 mb-5 pb-4 border-b border-slate-100">
                <div className="relative">
                  <Search className="absolute left-3.5 top-4 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    value={modalSearchQuery}
                    onChange={(e) => setModalSearchQuery(e.target.value)}
                    placeholder="Buscar conector por nombre, comercio o RFC..."
                    className="w-full text-xs text-slate-800 bg-slate-50 border border-slate-205 focus:border-[#0B53F4] hover:bg-slate-50/80 rounded-xl pl-10 pr-4 py-3.5 focus:outline-none transition-all font-sans"
                  />
                </div>

                {/* Categories Tab Selector */}
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none scroll-smooth">
                  {["Todos", "Alimentación", "Transporte", "Vivienda", "Compras"].map((cat) => {
                    const isActive = modalActiveCategory === cat;
                    return (
                      <button
                        key={cat}
                        type="button"
                        onClick={() => setModalActiveCategory(cat)}
                        className={`text-[10.5px] font-black uppercase tracking-wider px-3.5 py-2 rounded-xl transition cursor-pointer shrink-0 border select-none ${
                          isActive
                            ? "bg-[#0B53F4] border-[#0B53F4] text-white shadow-sm"
                            : "bg-slate-50 border-slate-150 hover:bg-slate-100 text-slate-600"
                        }`}
                      >
                        <div className="flex items-center gap-1.5">
                          {cat !== "Todos" && getCategoryIcon(cat)}
                          <span>{cat}</span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Scrollable grid list of connectors */}
              <div className="flex-1 overflow-y-auto space-y-4 pr-1.5 scrollbar-none">
                {modalFilteredConnectors.length === 0 ? (
                  <div className="py-14 border border-dashed border-slate-150 rounded-2.5xl text-center">
                    <HelpCircle className="w-10 h-10 text-slate-300 mx-auto mb-2 opacity-50" />
                    <p className="text-sm font-extrabold text-slate-800">No hay conectores</p>
                    <p className="text-xs text-slate-400 mt-1">Intente cambiar la categoría o buscar otra empresa.</p>
                  </div>
                ) : (
                  modalFilteredConnectors.map((connector) => {
                    const fields: ConnectorField[] = JSON.parse(connector.fieldsJson);
                    const steps: string[] = JSON.parse(connector.flowJson);
                    const category = getConnectorCategory(connector.nombre);
                    const connectorId = `modal-${connector.id || connector.nombre}`;
                    const isExpanded = !!expandedConnectors[connectorId];

                    return (
                      <div
                        key={connector.id}
                        className="bg-white border border-slate-200/60 rounded-2.5xl shadow-4xs hover:border-[#0B53F4]/20 transition-all duration-150 overflow-hidden text-left"
                      >
                        {/* Interactive header block */}
                        <div 
                          onClick={() => toggleExpand(connectorId)}
                          className="p-5 flex items-center justify-between gap-3 cursor-pointer select-none hover:bg-slate-50/50 transition-colors"
                        >
                          <div className="flex items-center gap-3.5 min-w-0">
                            {/* Icon circular badge */}
                            <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border border-slate-150/60 bg-slate-50 shadow-4xs">
                              {getCategoryIcon(category)}
                            </div>

                            <div className="min-w-0">
                              <h4 className="font-extrabold text-[#0E1629] text-[14.5px] truncate leading-tight">
                                {connector.nombre}
                              </h4>
                              <span className="text-[10px] text-slate-400 font-mono mt-0.5 block leading-none">
                                📅 Generación: {formatGenerationDate(connector.createdAt)}
                              </span>
                            </div>
                          </div>

                          <div className="flex items-center gap-3 shrink-0">
                            {/* External visit link */}
                            <a
                              href={connector.portalUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              onClick={(e) => e.stopPropagation()}
                              className="text-xs bg-[#EBF1FF]/60 hover:bg-[#EBF1FF] text-[#0B53F4] px-3 py-1.5 rounded-lg flex items-center gap-1 font-black transition-colors border border-[#0B53F4]/5"
                            >
                              <Link2 className="w-3.5 h-3.5 shrink-0" />
                              <span>Visitar Portal</span>
                            </a>

                            {/* Chevron indicating expandable action */}
                            <motion.div
                              animate={{ rotate: isExpanded ? 180 : 0 }}
                              transition={{ type: "spring", stiffness: 300, damping: 20 }}
                              className="text-slate-400 p-0.5"
                            >
                              <ChevronDown className="w-4 h-4 stroke-[2.5]" />
                            </motion.div>
                          </div>
                        </div>

                        {/* Expandable detail section with elegant content cards */}
                        <AnimatePresence initial={false}>
                          {isExpanded && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: "auto", opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.22, ease: "easeOut" }}
                              className="overflow-hidden"
                            >
                              <div className="px-5 pb-5 pt-3.5 border-t border-slate-150/60 bg-slate-50/15 space-y-4">
                                <div className="flex gap-2 flex-wrap items-center">
                                  {/* RFC ID */}
                                  <span className="text-[10px] bg-slate-100 text-slate-655 px-2.5 py-1 rounded-md font-mono font-bold">
                                    RFC Emisor: {connector.rfc || "N/A"}
                                  </span>

                                  {/* Category code */}
                                  <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md border text-[9px] font-extrabold tracking-wide uppercase ${getCategoryStyles(category)}`}>
                                    {getCategoryIcon(category)}
                                    <span>{category}</span>
                                  </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                  <div>
                                    <h5 className="text-[9.5px] font-black text-slate-400 mb-2 uppercase tracking-wider font-mono">
                                      Campos requeridos en formulario
                                    </h5>
                                    <div className="flex flex-wrap gap-1.5">
                                      {fields.map((f) => (
                                        <div
                                          key={f.key}
                                          className="text-[9.5px] bg-[#FAF9FE] border border-slate-105 px-2 py-1.5 rounded-lg flex flex-col font-mono shadow-3xs"
                                        >
                                          <span className="font-bold text-[#0B53F4]">{f.name}</span>
                                          <span className="text-[8px] text-slate-400 block truncate max-w-[170px] mt-0.5">
                                            Selector: {f.selector}
                                          </span>
                                        </div>
                                      ))}
                                    </div>
                                  </div>

                                  <div>
                                    <h5 className="text-[9.5px] font-black text-slate-400 mb-2 uppercase tracking-wider font-mono font-bold">
                                      Flujo de automatización Playwright/SAT
                                    </h5>
                                    <ol className="text-[10px] text-slate-600 list-decimal pl-4.5 space-y-1.5 leading-relaxed font-sans font-medium">
                                      {steps.map((s, idx) => (
                                        <li key={idx} className="pl-0.5">{s}</li>
                                      ))}
                                    </ol>
                                  </div>
                                </div>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Footer metadata info */}
              <div className="mt-5 pt-3.5 border-t border-slate-100 flex justify-between items-center text-[10px] text-slate-400 font-extrabold select-none">
                <span>Vía API Playwright Cloud</span>
                <span>Actualizado: 2026-06-08</span>
              </div>
            </motion.div>

          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
