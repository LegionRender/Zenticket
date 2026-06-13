import React, { useState } from "react";
import { Connector, Ticket, Invoice, FiscalProfile } from "../types";
import { 
  ShieldCheck, Server, Users, Cpu, Database, RefreshCw, 
  Settings, CheckCircle, AlertTriangle, Play, HelpCircle,
  Bell, Calendar, Sparkles, Brain, ArrowUpRight, Search,
  ShoppingCart, Landmark, Terminal, Zap, BookOpen, ChevronRight, ChevronDown,
  MoreVertical, Check, Info, X, Sliders, Layers, UserCheck, ShieldAlert, CheckSquare, Filter, Building2, Store, Coffee, Car
} from "lucide-react";
import { useToast } from "./Toast";
import { 
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip, 
  BarChart, Bar, XAxis, YAxis, CartesianGrid
} from "recharts";

interface AdminScreenProps {
  connectors: Connector[];
  tickets: Ticket[];
  invoices: Invoice[];
  allProfiles?: FiscalProfile[];
  onForceReSeed: () => Promise<void>;
  onLearnConnector: (nombre: string, rfc: string, tokenSaver?: boolean) => Promise<void>;
  isLearningLoading: boolean;
  learningStatus: string;
  learningProgress: number;
  onCancelLearning: () => void;
  learningCompany: string;
  learningBudgetLimit: number;
  onUpdateLearningBudgetLimit: (newLimit: number) => Promise<void>;
  onUpdateTicket: (ticketId: string, updates: Partial<Ticket>) => Promise<void>;
  onStartTicketAutomation: (ticketId: string) => Promise<void>;
}

// --------------------------- BRAND CUSTOM HEURISTIC LOGOS ---------------------------
const AeromexicoLogo = () => (
  <div className="w-9 h-9 rounded-full bg-[#0D2C54] flex items-center justify-center shrink-0 shadow-sm">
    <svg viewBox="0 0 100 100" className="w-[18px] h-[18px] text-white fill-current">
      <path 
        d="M32 46c0-10 8-18 18-18s18 8 18 18S50 78 50 78s-18-22-18-32z" 
        fill="white" 
        fillOpacity="0.25" 
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
    </svg>
  </div>
);

const StarbucksLogo = () => (
  <div className="w-9 h-9 rounded-full bg-[#00704A] flex items-center justify-center shrink-0 shadow-sm">
    <svg viewBox="0 0 100 100" className="w-[18px] h-[18px] text-white fill-current">
      <circle cx="50" cy="50" r="42" fill="none" stroke="white" strokeWidth="2.5" />
      <path 
        d="M50 28c3 0 5.5 2 6 5l2-1v-4l-3-2-2-4-3 1-3-1-2 4-3 2v4l2 1c.5-3 3-5 6-5z" 
        fill="white" 
      />
      <path 
        d="M50 42c-8 0-14 6-14 14v10c0 4 3 8 7 8h14c4 0 7-4 7-8V56c0-8-6-14-14-14" 
        fill="white" 
      />
    </svg>
  </div>
);

const OfficeDepotLogo = () => (
  <div className="w-9 h-9 rounded-full bg-[#E61C24] flex items-center justify-center shrink-0 shadow-sm">
    <svg viewBox="0 0 120 120" className="w-[18px] h-[18px] text-white fill-current">
      <path 
        d="M32 40h24c11 0 20 9 20 20s-9 20-24 20H32V40zm24 30c5.5 0 10-4.5 10-10s-4.5-10-10-10H42v20h14z" 
        fill="white" 
      />
      <rect x="80" y="40" width="8" height="40" rx="2" fill="white" />
    </svg>
  </div>
);

const UberLogo = () => (
  <div className="w-9 h-9 rounded-full bg-black flex items-center justify-center shrink-0 shadow-sm border border-slate-800">
    <span className="text-[10px] font-black text-white tracking-tighter uppercase font-sans">UBER</span>
  </div>
);

export default function AdminScreen({
  connectors,
  tickets,
  invoices,
  allProfiles = [],
  onForceReSeed,
  onLearnConnector,
  isLearningLoading,
  learningStatus,
  learningProgress,
  onCancelLearning,
  learningCompany,
  learningBudgetLimit,
  onUpdateLearningBudgetLimit,
  onUpdateTicket,
  onStartTicketAutomation,
}: AdminScreenProps) {
  const toast = useToast();

  // 1. STATE FOR 6 ADMIN SECTIONS (RESUMEN, USUARIOS, TICKETS, COSTOS, CONECTORES, APRENDER PORTAL)
  const [activeAdminTab, setActiveAdminTab] = useState<"resumen" | "usuarios" | "tickets" | "costos" | "conectores" | "aprender">("resumen");

  // Filter States inside sub-sections
  const [activeFilter, setActiveFilter] = useState<"todo" | "activos" | "sat" | "portales" | "ia" | "errores">("todo");
  const [searchQuery, setSearchQuery] = useState("");
  const [newNombre, setNewNombre] = useState("");
  const [newRfc, setNewRfc] = useState("");
  const [isReSeeding, setIsReSeeding] = useState(false);
  const [tokenSaver, setTokenSaver] = useState(true);
  const [expandedConnectors, setExpandedConnectors] = useState<Record<string, boolean>>({
    "foxo": true // FOXO expanded on load to match mockup
  });
  const [tempBudgetLimit, setTempBudgetLimit] = useState(learningBudgetLimit);
  const [showNotificationsDropdown, setShowNotificationsDropdown] = useState(false);
  const [assigningTicketId, setAssigningTicketId] = useState<string | null>(null);

  // Tickets layout states
  const [ticketSearch, setTicketSearch] = useState("");
  const [ticketStatusFilter, setTicketStatusFilter] = useState("todos");
  const [ticketDateFilter, setTicketDateFilter] = useState("todas");

  React.useEffect(() => {
    setTempBudgetLimit(learningBudgetLimit);
  }, [learningBudgetLimit]);

  const toggleExpandConnector = (id: string) => {
    setExpandedConnectors((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const handleTriggerReSeed = async () => {
    setIsReSeeding(true);
    try {
      await onForceReSeed();
      toast.success("¡Satelite de facturación re-sincronizado!", "Sección Sincronizada");
    } catch (err: any) {
      toast.error(err.message || "Error al sincronizar.");
    } finally {
      setIsReSeeding(false);
    }
  };

  const handleLearnSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNombre.trim()) {
      toast.error("Proporciona el nombre de la empresa para iniciar el modelado IA.", "Nombre Requerido");
      return;
    }
    const cleanRfc = newRfc.trim().toUpperCase();
    if (cleanRfc && (cleanRfc.length < 12 || cleanRfc.length > 13)) {
      toast.error("El RFC debe contener entre 12 y 13 dígitos.", "RFC Inválido");
      return;
    }

    try {
      await onLearnConnector(newNombre.trim(), cleanRfc, tokenSaver);
      toast.success(`Aprendizaje exitoso para '${newNombre}'. El portal ha sido enlazado.`, "Mapeo Completado");
      setNewNombre("");
      setNewRfc("");
    } catch (err: any) {
      if (err.message === "PROCESO_CANCELADO_POR_USUARIO") return;
      toast.error(err.message || "Error de aprendizaje automático.");
    }
  };

  // Helper arrays for tickets list view
  const reviewTicketsList = tickets.filter(t => t.status === "review");

  // --- CHART DATA GENERATORS ---
  const planDistributionData = [
    { name: "Empresa", value: 78, color: "#0B53F4" },
    { name: "Personal", value: 40, color: "#22C55E" },
    { name: "Gratuito", value: 10, color: "#94A3B8" }
  ];

  const barChartResumenData = [
    { name: "Ene", value: 40 },
    { name: "Feb", value: 65 },
    { name: "Mar", value: 80 },
    { name: "Abr", value: 95 },
    { name: "May", value: 130 }
  ];

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
          <div className="flex items-center gap-2">
            {/* Sync connection button */}
            <button 
              type="button"
              onClick={handleTriggerReSeed}
              disabled={isReSeeding}
              className="w-[38px] h-[38px] rounded-full bg-white/10 hover:bg-white/15 flex items-center justify-center border border-white/10 transition cursor-pointer disabled:opacity-50 border-0"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-white ${isReSeeding ? 'animate-spin' : ''}`} />
            </button>

            <button 
              type="button"
              onClick={() => toast.info("No tienes alertas del SAT sin revisar.", "Estado Sincronizado")}
              className="w-[38px] h-[38px] rounded-full bg-white/10 hover:bg-white/15 flex items-center justify-center border border-white/10 transition cursor-pointer relative border-0"
            >
              <Bell className="w-4 h-4 text-white" />
              <span className="absolute top-[10px] right-[10px] w-2 h-2 bg-[#0B53F4] rounded-full ring-2 ring-[#031D79]" />
            </button>
          </div>
        </div>

        {/* Personalized Greetings heading styling */}
        <div className="mb-6 relative z-10 text-left">
          <h2 className="text-[25px] font-black tracking-tight text-white leading-none">
            Consola Admin
          </h2>
          <span className="text-[11.5px] text-blue-100 font-bold block mt-1 tracking-tight select-none opacity-85">
            Gestión centralizada del satélite ZenTicket y modelados IA
          </span>
        </div>

        {/* Dynamic AI Learner Progress Banner overlay if it is running */}
        {isLearningLoading && (
          <div className="mb-4 bg-[#121626]/95 backdrop-blur-md rounded-2xl p-3 border border-slate-700/50 shadow-md relative overflow-hidden animate-pulse z-10 text-left">
            <div className="flex gap-3 items-center">
              <div className="relative shrink-0 w-8 h-8 flex items-center justify-center">
                <div className="absolute inset-0 rounded-full border border-blue-400/30 animate-ping opacity-60" />
                <div className="absolute inset-0 rounded-full border-2 border-t-[#FFB200] border-blue-500 animate-spin" />
                <Brain className="w-3 h-3 text-sky-400" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-baseline">
                  <span className="text-[8px] font-black tracking-widest text-[#CBDAFF] uppercase bg-blue-500/20 px-1.5 py-0.5 rounded">
                    IA APRENDIENDO CONECTOR
                  </span>
                  <span className="font-mono text-xs font-black text-sky-450">{learningProgress}%</span>
                </div>
                <h4 className="text-[10.5px] font-bold text-white mt-0.5 truncate leading-tight select-text">
                  Modelando {learningCompany || "empresa"}...
                </h4>
              </div>
            </div>
            
            <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden mt-2 relative">
              <div className="bg-[#0B53F4] h-full transition-all duration-300" style={{ width: `${learningProgress}%` }} />
            </div>
          </div>
        )}

        {/* Stats horizontal side-by-side block matching mockup */}
        <div className="flex justify-between items-center bg-white/[0.03] backdrop-filter border border-white/5 rounded-2xl p-4.5 mb-6 relative z-10">
          
          {/* Left item: tickets */}
          <div className="flex items-center gap-3.5 w-[50%]">
            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-white shrink-0">
              <Database className="w-5 h-5 text-blue-200" />
            </div>
            <div className="text-left min-w-0">
              <span className="text-[23px] font-black block leading-none text-white tracking-tight font-sans">
                {tickets.length}
              </span>
              <span className="text-[10px] text-blue-100 font-bold block mt-1 tracking-tight">
                tickets registros
              </span>
            </div>
          </div>

          {/* Horizontal dividing thin line */}
          <div className="w-px h-10 bg-white/10 shrink-0 self-center" />

          {/* Right item: ports trained */}
          <div className="flex items-center gap-3.5 w-[50%] pl-4.5">
            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-white shrink-0">
              <Cpu className="w-5 h-5 text-blue-200" />
            </div>
            <div className="text-left min-w-0">
              <span className="text-[23px] font-black block leading-none text-white tracking-tight">
                {connectors.length}
              </span>
              <span className="text-[10px] text-blue-100 font-bold block mt-1 tracking-tight">
                portales aprendidos
              </span>
            </div>
          </div>

        </div>

        {/* SUB SECTIONS SELECTOR TABS inside blue header row area */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pt-2 z-10 relative">
          {[
            { id: "resumen", label: "1. RESUMEN" },
            { id: "usuarios", label: "2. USUARIOS" },
            { id: "tickets", label: "3. TICKETS" },
            { id: "costos", label: "4. COSTOS" },
            { id: "conectores", label: "5. CONECTORES" },
            { id: "aprender", label: "6. APRENDER PORTAL" }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                setActiveAdminTab(tab.id as any);
                toast.success(`Navegando a: ${tab.label}`);
              }}
              className={`px-3.5 py-2 rounded-xl text-[10px] font-black tracking-tight shrink-0 transition-all cursor-pointer ${
                activeAdminTab === tab.id 
                  ? "bg-white text-[#0B53F4] shadow-md scale-[1.03]" 
                  : "bg-white/10 text-white/95 hover:bg-white/20"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* ==================== 2. MAIN ACTIVE CARD SECTION WRAPPER ==================== */}
      <div className="-mt-14 px-4 pb-20 relative z-20 w-full max-w-7xl mx-auto flex flex-col gap-6">
        <div className="flex-1 flex flex-col gap-5 overflow-y-auto">
        
        {/* =================================================================== */}
        {/* 1. RESUMEN SCREEN */}
        {/* =================================================================== */}
        {activeAdminTab === "resumen" && (
          <div className="flex flex-col gap-4 animate-fade-in text-left">
            
            {/* Subscription Revenue Banner */}
            <div className="bg-white border border-slate-100 rounded-[28px] p-5 shadow-sm relative overflow-hidden">
              <div className="flex justify-between items-start">
                <div className="text-left">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">
                    Ingresos por suscripción
                  </span>
                  <span className="text-[10px] text-slate-400 block font-semibold mt-0.5">
                    Este mes (1-31 may 2024)
                  </span>
                  
                  <div className="flex items-baseline gap-1 mt-2.5">
                    <h3 className="text-[25px] font-black tracking-tight text-[#0B53F4] leading-none">
                      $2,770.00
                    </h3>
                    <span className="text-xs font-extrabold text-slate-400">MXN</span>
                  </div>
                  
                  <span className="bg-emerald-50 text-emerald-600 border border-emerald-100 text-[9px] font-black px-2 py-0.5 rounded-full inline-flex items-center gap-1 mt-3">
                    <span className="w-1 h-1 rounded-full bg-emerald-500 animate-pulse" />
                    Consolidado
                  </span>
                </div>

                {/* Vertical mini blue bar chart */}
                <div className="w-[85px] h-[75px] shrink-0 border-l border-slate-100 flex items-end justify-between pl-2">
                  {[20, 35, 30, 48, 62].map((height, idx) => (
                    <div key={idx} className="flex flex-col items-center gap-1">
                      <div 
                        className={`w-2.5 rounded-t-sm transition-all duration-500 ${
                          idx === 4 ? "bg-[#0B53F4]" : "bg-[#0b53f4]/35"
                        }`}
                        style={{ height: `${height}px` }}
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Sub-label showing invoice count */}
              <div className="border-t border-slate-100 mt-4 pt-3.5 flex justify-between items-center">
                <span className="text-xs font-black text-slate-700">5 facturas</span>
                <span className="text-[10.5px] font-bold text-slate-400">Todo el mes cursado</span>
              </div>
            </div>

            {/* Split Metrics: Usuarios activos, Tickets procesados, Eficiencia IA */}
            <div className="grid grid-cols-3 gap-2">
              <div className="bg-white border border-slate-100 rounded-2xl p-3 flex flex-col justify-between text-left">
                <span className="text-[9px] font-black text-slate-400 block tracking-tight uppercase">
                  Usuarios activos
                </span>
                <span className="text-[22px] font-black text-[#0B53F4] tracking-tight block mt-1">
                  128
                </span>
                <span className="text-[9.5px] font-bold text-slate-400 mt-0.5 block leading-none">
                  de 128 regis.
                </span>
              </div>

              <div className="bg-white border border-slate-100 rounded-2xl p-3 flex flex-col justify-between text-left">
                <span className="text-[9px] font-black text-slate-400 block tracking-tight uppercase">
                  Tickets proces.
                </span>
                <span className="text-[22px] font-black text-[#0B53F4] tracking-tight block mt-1">
                  24
                </span>
                <span className="text-[9.5px] font-bold text-slate-400 mt-0.5 block leading-none">
                  este mes
                </span>
              </div>

              <div className="bg-white border border-slate-100 rounded-2xl p-3 flex flex-col justify-between text-left">
                <span className="text-[9px] font-black text-slate-400 block tracking-tight uppercase">
                  Eficiencia IA
                </span>
                <span className="text-[22px] font-black text-[#22C55E] tracking-tight block mt-1">
                  100%
                </span>
                <span className="text-[9px] font-black text-emerald-600 block leading-none">
                  ↑ 2.45% vs. ab.
                </span>
              </div>
            </div>

            {/* Estado de tickets Row (Circles structure) */}
            <div className="bg-white border border-slate-100 rounded-[28px] p-5 shadow-sm text-left">
              <h4 className="text-[12.5px] font-black text-slate-900 tracking-tight mb-4">
                Estado de tickets
              </h4>

              <div className="grid grid-cols-3 gap-2">
                {[
                  { name: "Completados", count: 5, color: "text-emerald-500", bg: "bg-emerald-50", icon: <CheckCircle className="w-5 h-5 stroke-[2.3]" /> },
                  { name: "Pendientes", count: 0, color: "text-amber-500", bg: "bg-amber-50", icon: <ClockIcon /> },
                  { name: "Fallidos", count: 0, color: "text-rose-500", bg: "bg-rose-50", icon: <AlertTriangle className="w-5 h-5" /> }
                ].map((s, idx) => (
                  <div key={idx} className="flex flex-col items-center p-3 rounded-2xl bg-slate-50/70 border border-slate-100">
                    <div className={`w-9 h-9 rounded-full ${s.bg} ${s.color} flex items-center justify-center mb-1 shrink-0`}>
                      {s.icon}
                    </div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tight block mt-0.5">
                      {s.name}
                    </span>
                    <span className="text-lg font-black text-slate-800 leading-none mt-1">
                      {s.count}
                    </span>
                  </div>
                ))}
              </div>
            </div>

          </div>
        )}

        {/* =================================================================== */}
        {/* 2. USUARIOS SCREEN */}
        {/* =================================================================== */}
        {activeAdminTab === "usuarios" && (
          <div className="flex flex-col gap-4 animate-fade-in text-left">
            
            {/* Registered Users Summary card */}
            <div className="bg-white border border-slate-100 rounded-[28px] p-5 shadow-sm text-left relative overflow-hidden">
              <div className="flex justify-between items-baseline">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">
                    Usuarios registrados
                  </span>
                  <span className="text-[34px] font-black tracking-tight text-slate-800 leading-none mt-1.5 block">
                    128
                  </span>
                  <span className="text-[11px] font-bold text-slate-405 mt-0.5 block">
                    usuarios totales
                  </span>
                </div>
                {/* Active SaaS pill */}
                <span className="bg-emerald-100/70 text-emerald-600 text-[10px] font-black px-3 py-1 rounded-full font-mono">
                  SaaS activo
                </span>
              </div>

              {/* Centered Donut pie representative visual */}
              <div className="w-full h-32 flex justify-center items-center mt-4">
                <ResponsiveContainer width="50%" height="100%">
                  <PieChart>
                    <Pie
                      data={planDistributionData}
                      cx="50%"
                      cy="50%"
                      innerRadius={32}
                      outerRadius={46}
                      paddingAngle={4}
                      dataKey="value"
                    >
                      {planDistributionData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Distribution legend rows */}
            <div className="bg-white border border-slate-100 rounded-[28px] p-5 shadow-sm text-left">
              <h4 className="text-[12.5px] font-black text-slate-950 tracking-tight mb-3">
                Distribución por plan
              </h4>
              <div className="flex flex-col gap-3">
                {[
                  { name: "Empresa", count: "78 usuarios", rate: "$1,200.00 MXN / mes", color: "bg-[#0B53F4]", text: "text-[#0B53F4]" },
                  { name: "Personal", count: "40 usuarios", rate: "$600.00 MXN / mes", color: "bg-[#22C55E]", text: "text-[#22C55E]" },
                  { name: "Gratuito", count: "10 usuarios", rate: "$0.00 MXN / mes", color: "bg-slate-400", text: "text-slate-405" }
                ].map((p, index) => (
                  <div key={index} className="flex justify-between items-center border-b border-slate-50 pb-2.5 last:border-none last:pb-0">
                    <div className="flex items-center gap-2">
                      <span className={`w-2.5 h-2.5 rounded-full ${p.color}`} />
                      <span className="text-xs font-black text-slate-800">{p.name}</span>
                    </div>

                    <div className="text-right">
                      <span className="text-[11.5px] font-black text-slate-800 block">
                        {p.rate}
                      </span>
                      <span className="text-[10px] font-bold text-slate-400 block mt-0.5">
                        {p.count}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent users logged in list representation */}
            <div className="bg-white border border-slate-100 rounded-[28px] p-5 shadow-sm text-left">
              <div className="flex justify-between items-center mb-3">
                <h4 className="text-[12.5px] font-black text-slate-900 tracking-tight">
                  Usuarios recientes
                </h4>
                <button 
                  onClick={() => toast.info("Mostrando directorio completo de clientes")}
                  className="text-[10px] font-black text-[#0B53F4] uppercase tracking-tight hover:underline flex items-center"
                >
                  Ver todos
                </button>
              </div>

              <div className="flex flex-col gap-3">
                {[
                  { name: "Maria Gonzalez", email: "maria.gonzalez@empresa.com", plan: "Empresa", col: "text-blue-650 bg-blue-50 border-blue-100" },
                  { name: "Juan Perez", email: "juan.perez@correo.com", plan: "Personal", col: "text-emerald-600 bg-emerald-50 border-emerald-100" },
                  { name: "Ana Lopez", email: "ana.lopez@gmail.com", plan: "Gratuito", col: "text-slate-500 bg-slate-50 border-slate-100" },
                  { name: "Carlos Ramirez", email: "carlos.ramirez@xyz.com", plan: "Empresa", col: "text-blue-650 bg-blue-50 border-blue-100" }
                ].map((user, idx) => (
                  <div key={idx} className="flex justify-between items-center border-b border-slate-50 pb-2.5 last:border-none last:pb-0">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center font-black text-[#0B53F4] text-xs uppercase shadow-2xs font-mono">
                        {user.name.split(" ").map(w => w[0]).join("")}
                      </div>

                      <div className="leading-tight">
                        <span className="text-xs font-black text-slate-800 block">{user.name}</span>
                        <span className="text-[9.5px] font-semibold text-slate-400 block mt-0.5 select-text">{user.email}</span>
                      </div>
                    </div>

                    <span className={`text-[9px] font-extrabold tracking-wide px-2 py-0.5 rounded-full border ${user.col}`}>
                      {user.plan}
                    </span>
                  </div>
                ))}
              </div>
            </div>

          </div>
        )}

        {/* =================================================================== */}
        {/* 3. TICKETS SCREEN */}
        {/* =================================================================== */}
        {activeAdminTab === "tickets" && (
          <div className="flex flex-col gap-4 animate-fade-in text-left">
            
            {/* Status overview list cards */}
            <div className="grid grid-cols-3 gap-2">
              {[
                { name: "Completados", count: 5, color: "text-emerald-500", bg: "bg-emerald-50", icon: <CheckCircle className="w-4 h-4" /> },
                { name: "Pendientes", count: 0, color: "text-amber-550", bg: "bg-amber-50", icon: <ClockIcon /> },
                { name: "Fallidos", count: 0, color: "text-rose-500", bg: "bg-rose-50", icon: <AlertTriangle className="w-4 h-4" /> }
              ].map((s, idx) => (
                <div key={idx} className="flex flex-col items-center p-2.5 rounded-2xl bg-white border border-slate-100 shadow-3xs">
                  <div className={`w-8 h-8 rounded-full ${s.bg} ${s.color} flex items-center justify-center mb-1 shrink-0`}>
                    {s.icon}
                  </div>
                  <span className="text-[8.5px] font-bold text-slate-400 uppercase tracking-tight block">
                    {s.name}
                  </span>
                  <span className="text-base font-black text-slate-800 leading-none mt-1">
                    {s.count}
                  </span>
                </div>
              ))}
            </div>

            {/* Filter controls row */}
            <div className="bg-white border border-slate-100 rounded-[24px] p-4 shadow-3xs space-y-3">
              {/* Text search */}
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-3.5 w-3.5 text-slate-400" />
                </span>
                <input
                  type="text"
                  placeholder="Buscar tickets..."
                  value={ticketSearch}
                  onChange={(e) => setTicketSearch(e.target.value)}
                  className="block w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:ring-1 focus:ring-[#0B53F4] text-slate-805"
                />
              </div>

              {/* Row dropdown inputs styled exactly as mockup */}
              <div className="grid grid-cols-2 gap-2">
                <div className="relative">
                  <select
                    value={ticketStatusFilter}
                    onChange={(e) => setTicketStatusFilter(e.target.value)}
                    className="appearance-none block w-full px-3 py-2 text-[11px] font-extrabold text-slate-700 bg-slate-50 border border-slate-200 rounded-xl cursor-pointer"
                  >
                    <option value="todos">Todos los estados</option>
                    <option value="completed">Completado</option>
                    <option value="pending">Pendiente</option>
                    <option value="failed">Fallido</option>
                  </select>
                  <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3 h-3 text-slate-450 pointer-events-none" />
                </div>

                <div className="relative">
                  <select
                    value={ticketDateFilter}
                    onChange={(e) => setTicketDateFilter(e.target.value)}
                    className="appearance-none block w-full px-3 py-2 text-[11px] font-extrabold text-slate-700 bg-slate-50 border border-slate-200 rounded-xl cursor-pointer"
                  >
                    <option value="todas">Todas las fechas</option>
                    <option value="mayo">Mayo 2024</option>
                    <option value="abril">Abril 2024</option>
                  </select>
                  <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3 h-3 text-slate-450 pointer-events-none" />
                </div>
              </div>
            </div>

            {/* List block */}
            <div className="bg-white border border-slate-100 rounded-[28px] p-5 shadow-sm text-left">
              <div className="flex justify-between items-center mb-3">
                <h4 className="text-[12.5px] font-black text-slate-900 tracking-tight">
                  Lista de tickets
                </h4>
                <button 
                  onClick={() => toast.info("Mostrando histórico integral de auditoría")}
                  className="text-[10px] font-black text-[#0B53F4] uppercase tracking-tight hover:underline flex items-center"
                >
                  Ver todos
                </button>
              </div>

              {/* Core responsive table structure matching layout */}
              <div className="flex flex-col gap-3">
                {[
                  { emisor: "Supermercado", folio: "F-0001234", fecha: "15 mayo 2024 • 14:32", status: "Completado", cantidad: "$1,245.50", col: "text-emerald-600 bg-emerald-50 border-emerald-100/55", logo: <Store className="w-4 h-4 text-white" /> },
                  { emisor: "Gasolinería", folio: "F-0001233", fecha: "15 mayo 2024 • 09:18", status: "Completado", cantidad: "$800.00", col: "text-emerald-600 bg-emerald-50 border-emerald-100/55", logo: <Car className="w-4 h-4 text-white" /> },
                  { emisor: "Restaurante", folio: "F-0001232", fecha: "14 mayo 2024 • 21:05", status: "Pendiente", cantidad: "$650.00", col: "text-amber-600 bg-amber-50 border-amber-100/55", logo: <Coffee className="w-4 h-4 text-white" /> },
                  { emisor: "Farmacia", folio: "F-0001231", fecha: "14 mayo 2024 • 11:47", status: "Completado", cantidad: "$320.90", col: "text-emerald-600 bg-emerald-50 border-emerald-100/55", logo: <svg className="w-4 h-4 fill-current text-white" viewBox="0 0 24 24"><path d="M19 10.5h-5.5V5h-3v5.5H5v3h5.5V19h3v-5.5H19v-3z"/></svg> },
                  { emisor: "Servicios", folio: "F-0001230", fecha: "13 mayo 2024 • 10:15", status: "Completado", cantidad: "$950.00", col: "text-emerald-600 bg-emerald-50 border-emerald-100/55", logo: <Layers className="w-4 h-4 text-white" /> }
                ]
                .filter(t => {
                  const matchTxt = t.emisor.toLowerCase().includes(ticketSearch.toLowerCase());
                  const matchSt = ticketStatusFilter === "todos" || 
                                  (ticketStatusFilter === "completed" && t.status === "Completado") ||
                                  (ticketStatusFilter === "pending" && t.status === "Pendiente");
                  return matchTxt && matchSt;
                })
                .map((tkt, idx) => (
                  <div 
                    key={idx} 
                    className="flex justify-between items-center border-b border-slate-50 pb-3 last:border-none last:pb-0 hover:bg-slate-50/50 transition duration-150 rounded-lg p-1"
                    onClick={() => toast.success(`Abriendo inspección técnica para el folio ${tkt.folio}`)}
                  >
                    <div className="flex items-center gap-2.5">
                      {/* Sub badge category wrapper */}
                      <div className="w-[34px] h-[34px] rounded-full bg-[#0B53F4] flex items-center justify-center shrink-0">
                        {tkt.logo}
                      </div>

                      <div className="leading-tight">
                        <span className="text-xs font-black text-slate-800 block uppercase">{tkt.emisor}</span>
                        <span className="text-[9px] font-semibold text-slate-400 block mt-0.5">
                          Folio: {tkt.folio}
                        </span>
                        <span className="text-[8.5px] font-bold text-slate-400 block">
                          {tkt.fecha}
                        </span>
                      </div>
                    </div>

                    <div className="flex flex-col items-end leading-tight shrink-0">
                      <span className="text-xs font-mono font-black text-slate-800 tracking-tight">
                        {tkt.cantidad}
                      </span>
                      <span className={`text-[8px] font-black tracking-wider px-2 py-0.5 rounded-md border mt-1 select-none leading-none ${tkt.col}`}>
                        {tkt.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        )}

        {/* =================================================================== */}
        {/* 4. COSTOS SCREEN */}
        {/* =================================================================== */}
        {activeAdminTab === "costos" && (
          <div className="flex flex-col gap-4 animate-fade-in text-left">
            
            {/* Real costs summary row indicators */}
            <div className="bg-white border border-slate-100 rounded-[28px] p-5 shadow-sm text-left">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-4">
                Monitoreo de costos reales
              </span>

              <div className="flex flex-col gap-4">
                <div className="grid grid-cols-2 gap-3 pb-3 border-b border-slate-50">
                  <div className="leading-none">
                    <span className="text-[9px] font-black text-[#0B53F4] uppercase tracking-widest block font-mono">
                      Gasto real en API e IA
                    </span>
                    <span className="text-[19px] font-black text-slate-800 mt-2 block tracking-tight">
                      $3,740.60 <span className="text-[10px] text-slate-400 font-bold">MXN</span>
                    </span>
                  </div>

                  <div className="leading-none pl-3 border-l border-slate-100">
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block font-mono">
                      Valor comercial con margen
                    </span>
                    <span className="text-[19px] font-black text-slate-500 mt-2 block tracking-tight">
                      $158.00 <span className="text-[10px] text-slate-400 font-bold">MXN</span>
                    </span>
                  </div>
                </div>

                <div className="flex justify-between items-center leading-none">
                  <span className="text-[10px] font-bold text-slate-400 block tracking-tight">
                    Margen estimado
                  </span>
                  <span className="bg-emerald-50 text-[#22C55E] border border-emerald-100 text-xs font-black px-3 py-1 rounded-full font-mono">
                    97.63%
                  </span>
                </div>
              </div>
            </div>

            {/* Cost by service progress items */}
            <div className="bg-white border border-slate-100 rounded-[28px] p-5 shadow-sm text-left">
              <h4 className="text-[12.5px] font-black text-slate-900 tracking-tight mb-4">
                Costos por servicio
              </h4>

              <div className="flex flex-col gap-4">
                {[
                  { name: "Google Cloud (API)", amount: "$1,812.00 MXN", percentage: "48.5%", progress: 48.5, barColor: "bg-[#0b53f4]" },
                  { name: "Gemini (IA)", amount: "$1,362.10 MXN", percentage: "36.4%", progress: 36.4, barColor: "bg-[#3B82F6]" },
                  { name: "PAC (Timbrado)", amount: "$0,568.00 MXN", percentage: "15.1%", progress: 15.1, barColor: "bg-teal-500" }
                ].map((s, idx) => (
                  <div key={idx} className="space-y-1.5 leading-none">
                    <div className="flex justify-between items-baseline text-[11px]">
                      <span className="font-extrabold text-slate-800">{s.name}</span>
                      <span className="font-extrabold text-slate-800 text-right">{s.amount} <span className="text-[9.5px] font-mono text-slate-400">({s.percentage})</span></span>
                    </div>

                    <div className="h-2 bg-slate-100 rounded-full overflow-hidden w-full relative">
                      <div className={`h-full ${s.barColor} rounded-full`} style={{ width: s.percentage }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Budget limit control slider bar container */}
            <div className="bg-white border border-slate-100 rounded-[28px] p-5 shadow-sm text-left space-y-4">
              <div className="flex justify-between items-start leading-none">
                <div>
                  <span className="text-[10px] font-black text-[#0B53F4] uppercase tracking-widest block font-mono">
                    Control presupuestal
                  </span>
                  <h3 className="text-xs font-black text-slate-900 tracking-tight mt-1.5 leading-none">
                    Límite mensual de gastos en API e IA
                  </h3>
                </div>
                
                <span className="bg-[#0B53F4]/5 text-[#0B53F4] text-xs font-black px-2.5 py-1.5 rounded-full font-mono shrink-0">
                  ${tempBudgetLimit.toFixed(2)} MXN
                </span>
              </div>

              {/* Dynamic slider */}
              <div className="space-y-2">
                <input
                  type="range"
                  min="1"
                  max="50"
                  step="0.5"
                  value={tempBudgetLimit}
                  onChange={(e) => setTempBudgetLimit(Number(e.target.value))}
                  className="w-full h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-[#0B53F4]"
                />
                
                <div className="flex justify-between items-center text-[9px] font-mono text-slate-400 font-bold">
                  <span>$1.00</span>
                  <span>$50.00</span>
                </div>
              </div>

              <p className="text-[10px] text-slate-400 font-medium leading-normal select-none">
                Define el límite diario de gastos para controlar el presupuesto.
              </p>

              {/* Submit limit saving action button */}
              <button
                type="button"
                onClick={async () => {
                  try {
                    await onUpdateLearningBudgetLimit(tempBudgetLimit);
                    toast.success(`Límite diario establecido en: $${tempBudgetLimit.toFixed(2)} MXN`);
                  } catch (err) {
                    toast.error("No se pudo actualizar el límite presupuestario.");
                  }
                }}
                className="w-full bg-[#0B53F4] text-white text-xs font-black py-3 rounded-xl hover:opacity-95 transition cursor-pointer select-none border-none text-center block"
              >
                Guardar límite
              </button>
            </div>

          </div>
        )}

        {/* =================================================================== */}
        {/* 5. CONECTORES SCREEN */}
        {/* =================================================================== */}
        {activeAdminTab === "conectores" && (
          <div className="flex flex-col gap-4 animate-fade-in text-left">
            
            {/* Headers card values */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-white border border-slate-100 rounded-2xl p-4 flex items-center justify-between shadow-3xs">
                <div>
                  <span className="text-[20px] font-black text-[#0B53F4] leading-none">15</span>
                  <span className="text-[10px] font-bold text-slate-400 block mt-1">Conectores</span>
                </div>
                <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center text-[#0B53F4]">
                  <Server className="w-4 h-4" />
                </div>
              </div>

              <div className="bg-white border border-slate-100 rounded-2xl p-4 flex items-center justify-between shadow-3xs">
                <div>
                  <span className="text-[20px] font-black text-[#0B53F4] leading-none">12</span>
                  <span className="text-[10px] font-bold text-slate-400 block mt-1">Modelos IA</span>
                </div>
                <div className="w-8 h-8 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-500">
                  <Cpu className="w-4 h-4" />
                </div>
              </div>
            </div>

            {/* Filter inputs and Search control */}
            <div className="bg-white border border-slate-100 rounded-[24px] p-4 shadow-3xs space-y-3">
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-3.5 w-3.5 text-slate-300" />
                </span>
                <input
                  type="text"
                  placeholder="Buscar conector o empresa..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="block w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-xl bg-slate-50 focus:bg-white text-slate-805 focus:ring-1 focus:ring-[#0B53F4]"
                />
              </div>

              {/* Horizontal sliding categories pills row */}
              <div className="flex gap-1 overflow-x-auto no-scrollbar py-1">
                {[
                  { id: "todo", name: "Todos" },
                  { id: "activos", name: "Activos" },
                  { id: "sat", name: "SAT" },
                  { id: "portales", name: "Portal" },
                  { id: "ia", name: "IA" },
                  { id: "errores", name: "Errores" }
                ].map((pill) => (
                  <button
                    key={pill.id}
                    onClick={() => {
                      setActiveFilter(pill.id as any);
                      toast.success(`Filtro: ${pill.name}`);
                    }}
                    className={`px-3 py-1.5 rounded-lg text-[9.5px] font-black shrink-0 transition cursor-pointer select-none ${
                      activeFilter === pill.id
                        ? "bg-[#0b53f4] text-white"
                        : "bg-slate-100 text-slate-500 hover:bg-slate-200"
                    }`}
                  >
                    {pill.name}
                  </button>
                ))}
              </div>
            </div>

            {/* List block */}
            <div className="flex flex-col gap-3.5">
              
              {/* Element 1: FOXO (Expanded list on load exactly matching layout) */}
              <div className="bg-white border border-slate-150 rounded-[28px] p-4.5 shadow-sm text-left">
                <div 
                  className="flex justify-between items-center cursor-pointer select-none"
                  onClick={() => toggleExpandConnector("foxo")}
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-[34px] h-[34px] rounded-full bg-blue-500/10 flex items-center justify-center shrink-0">
                      <svg className="w-5.5 h-5.5 text-[#0B53F4] fill-current" viewBox="0 0 24 24">
                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/>
                      </svg>
                    </div>

                    <div className="leading-tight text-left">
                      <span className="text-xs font-black text-slate-800 block uppercase">
                        Fomento Económico Mexicano (FOXO)
                      </span>
                      <div className="flex gap-1.5 mt-0.5 items-center">
                        <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        <span className="text-[9px] font-bold text-slate-400">Activo</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-[9.5px] font-black text-[#0B53F4] bg-[#0B53F4]/10 rounded-full px-2 py-0.5 select-none leading-none">
                      Portal
                    </span>
                    <ChevronDown className={`w-4.5 h-4.5 text-slate-400 transition-all ${expandedConnectors["foxo"] ? 'rotate-180': ''}`} />
                  </div>
                </div>

                {expandedConnectors["foxo"] && (
                  <div className="mt-4 pt-3.5 border-t border-slate-100 flex flex-col gap-4 animate-slide-down">
                    {/* Collapsed grid specifications */}
                    <div className="grid grid-cols-3 gap-2 text-left text-[11px] font-sans">
                      <div>
                        <span className="text-[9px] text-slate-400 block font-bold leading-none">Campos requeridos</span>
                        <span className="text-[12px] font-black text-slate-800 mt-1 block">6 de 10</span>
                      </div>
                      <div className="pl-2 border-l border-slate-100">
                        <span className="text-[9px] text-slate-400 block font-bold leading-none">Tasa de éxito</span>
                        <span className="text-[12px] font-black text-[#22C55E] mt-1 block font-mono">100%</span>
                      </div>
                      <div className="pl-2 border-l border-slate-100">
                        <span className="text-[9px] text-slate-400 block font-bold leading-none">Tickets procesados</span>
                        <span className="text-[12px] font-black text-slate-800 mt-1 block">24</span>
                      </div>
                    </div>

                    {/* Blue actions grid bar */}
                    <div className="grid grid-cols-3 gap-1.5 pt-1">
                      <button 
                        onClick={() => toast.success("Soliitando prueba de extracción inmediata en FOXO...")}
                        className="bg-slate-100 hover:bg-slate-150 text-slate-700 text-[10px] font-black py-2 rounded-xl transition cursor-pointer text-center block"
                      >
                        ▶ Probar
                      </button>
                      <button 
                        onClick={() => toast.success("Abriendo asigndor de selectores de portal FOXO")}
                        className="bg-slate-100 hover:bg-slate-150 text-slate-700 text-[10px] font-black py-2 rounded-xl transition cursor-pointer text-center block"
                      >
                        📝 Editar
                      </button>
                      <button 
                        onClick={() => toast.success("Re-entrenando modelo cognitivo para FOXO...")}
                        className="bg-[#0b53f4]/10 hover:bg-[#0b53f4]/15 text-[#0B53F4] text-[10px] font-black py-2 rounded-xl transition cursor-pointer text-center block"
                      >
                        ⚙ Reentrenar IA
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Element 2: Cinépolis */}
              <div className="bg-white border border-slate-100 rounded-[28px] p-4.5 shadow-3xs text-left">
                <div 
                  className="flex justify-between items-center cursor-pointer select-none"
                  onClick={() => toggleExpandConnector("cinepolis")}
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-[34px] h-[34px] rounded-full bg-blue-500/10 flex items-center justify-center shrink-0">
                      <svg className="w-5.5 h-5.5 text-[#0B53F4] fill-current" viewBox="0 0 24 24">
                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/>
                      </svg>
                    </div>

                    <div className="leading-tight text-left">
                      <span className="text-xs font-black text-slate-800 block uppercase">
                        Cinépolis
                      </span>
                      <div className="flex gap-1.5 mt-0.5 items-center">
                        <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        <span className="text-[9px] font-bold text-slate-400">Activo</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-[9.5px] font-black text-[#0B53F4] bg-[#0B53F4]/10 rounded-full px-2 py-0.5 select-none leading-none">
                      Portal
                    </span>
                    <ChevronDown className={`w-4.5 h-4.5 text-slate-400 transition-all ${expandedConnectors["cinepolis"] ? 'rotate-180': ''}`} />
                  </div>
                </div>

                {expandedConnectors["cinepolis"] && (
                  <div className="mt-4 pt-3.5 border-t border-slate-100 flex flex-col gap-4 animate-slide-down">
                    <div className="grid grid-cols-3 gap-2 text-left text-[11px] font-sans">
                      <div>
                        <span className="text-[9px] text-slate-400 block font-bold leading-none">Campos requeridos</span>
                        <span className="text-[12px] font-black text-slate-800 mt-1 block">6 de 10</span>
                      </div>
                      <div className="pl-2 border-l border-slate-100">
                        <span className="text-[9px] text-slate-400 block font-bold leading-none">Tasa de éxito</span>
                        <span className="text-[12px] font-black text-[#22C55E] mt-1 block font-mono">100%</span>
                      </div>
                      <div className="pl-2 border-l border-slate-100">
                        <span className="text-[9px] text-slate-400 block font-bold leading-none">Tickets procesados</span>
                        <span className="text-[12px] font-black text-slate-800 mt-1 block">18</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-1.5 pt-1">
                      <button 
                        onClick={() => toast.success("Soliitando prueba de extracción para Cinépolis...")}
                        className="bg-slate-100 hover:bg-slate-150 text-slate-700 text-[10px] font-black py-2 rounded-xl transition cursor-pointer text-center block"
                      >
                        ▶ Probar
                      </button>
                      <button 
                        onClick={() => toast.success("Abriendo editor de conector Cinépolis")}
                        className="bg-slate-100 hover:bg-slate-150 text-slate-700 text-[10px] font-black py-2 rounded-xl transition cursor-pointer text-center block"
                      >
                        📝 Editar
                      </button>
                      <button 
                        onClick={() => toast.success("Iniciando re-aprendizaje heurístico Cinépolis...")}
                        className="bg-[#0b53f4]/10 hover:bg-[#0b53f4]/15 text-[#0B53F4] text-[10px] font-black py-2 rounded-xl transition cursor-pointer text-center block"
                      >
                        ⚙ Reentrenar IA
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Element 3: Nueva Walmart de México */}
              <div className="bg-white border border-slate-100 rounded-[28px] p-4.5 shadow-3xs text-left">
                <div 
                  className="flex justify-between items-center cursor-pointer select-none"
                  onClick={() => toggleExpandConnector("walmart")}
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-[34px] h-[34px] rounded-full bg-blue-500/10 flex items-center justify-center shrink-0">
                      <svg className="w-5.5 h-5.5 text-[#0B53F4] fill-current" viewBox="0 0 24 24">
                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/>
                      </svg>
                    </div>

                    <div className="leading-tight text-left">
                      <span className="text-xs font-black text-slate-800 block uppercase">
                        Nueva Walmart de México
                      </span>
                      <div className="flex gap-1.5 mt-0.5 items-center">
                        <span className="inline-block w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                        <span className="text-[9px] font-bold text-slate-400">Advertencia</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-[9.5px] font-black text-[#0B53F4] bg-[#0B53F4]/10 rounded-full px-2 py-0.5 select-none leading-none">
                      Portal
                    </span>
                    <ChevronDown className={`w-4.5 h-4.5 text-slate-400 transition-all ${expandedConnectors["walmart"] ? 'rotate-180': ''}`} />
                  </div>
                </div>

                {expandedConnectors["walmart"] && (
                  <div className="mt-4 pt-3.5 border-t border-slate-100 flex flex-col gap-4 animate-slide-down">
                    <div className="grid grid-cols-3 gap-2 text-left text-[11px] font-sans">
                      <div>
                        <span className="text-[9px] text-slate-400 block font-bold leading-none">Campos requeridos</span>
                        <span className="text-[12px] font-black text-slate-800 mt-1 block">5 de 10</span>
                      </div>
                      <div className="pl-2 border-l border-slate-100">
                        <span className="text-[9px] text-slate-400 block font-bold leading-none">Tasa de éxito</span>
                        <span className="text-[12px] font-black text-amber-500 mt-1 block font-mono">82.4%</span>
                      </div>
                      <div className="pl-2 border-l border-slate-100">
                        <span className="text-[9px] text-slate-400 block font-bold leading-none">Tickets procesados</span>
                        <span className="text-[12px] font-black text-slate-800 mt-1 block">56</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-1.5 pt-1">
                      <button 
                        onClick={() => toast.success("Soliitando prueba de extracción en Walmart...")}
                        className="bg-slate-100 hover:bg-slate-150 text-slate-700 text-[10px] font-black py-2 rounded-xl transition cursor-pointer text-center block"
                      >
                        ▶ Probar
                      </button>
                      <button 
                        onClick={() => toast.success("Abriendo editor de Walmart")}
                        className="bg-slate-100 hover:bg-slate-150 text-slate-700 text-[10px] font-black py-2 rounded-xl transition cursor-pointer text-center block"
                      >
                        📝 Editar
                      </button>
                      <button 
                        onClick={() => toast.success("Habilitando rastreador heurístico para Walmart...")}
                        className="bg-[#0b53f4]/10 hover:bg-[#0b53f4]/15 text-[#0B53F4] text-[10px] font-black py-2 rounded-xl transition cursor-pointer text-center block"
                      >
                        ⚙ Reentrenar IA
                      </button>
                    </div>
                  </div>
                )}
              </div>

            </div>

          </div>
        )}

        {/* =================================================================== */}
        {/* 6. APRENDER PORTAL SCREEN */}
        {/* =================================================================== */}
        {activeAdminTab === "aprender" && (
          <div className="flex flex-col gap-4 animate-fade-in text-left">
            
            {/* starry / glossy starry AI Banner */}
            <div className="bg-[#0A3EE4] text-white rounded-[28px] p-5 shadow-sm text-left relative overflow-hidden">
              <div className="absolute right-[-10px] bottom-[-20px] w-36 h-36 bg-gradient-to-tr from-white/10 to-transparent rounded-full blur-2xl pointer-events-none" />
              
              <div className="flex gap-3 items-center">
                <div className="w-[38px] h-[38px] rounded-xl bg-white/15 border border-white/10 flex items-center justify-center text-white shrink-0">
                  <Sparkles className="w-4.5 h-4.5 animate-pulse" />
                </div>

                <div className="leading-tight text-left">
                  <h3 className="text-sm font-black text-white tracking-tight leading-none">
                    Aprender Portal con IA
                  </h3>
                  <p className="text-[9.5px] text-blue-100 font-medium leading-normal mt-1.5">
                    La IA aprenderá a extraer tickets desde cualquier portal automáticamente.
                  </p>
                </div>
              </div>
            </div>

            {/* Learn Portal input Form */}
            <form onSubmit={handleLearnSubmit} className="bg-white border border-slate-100 rounded-[28px] p-5 shadow-sm text-left gap-4 flex flex-col">
              
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 block uppercase tracking-wider">
                  Nombre de la empresa
                </label>
                <input
                  type="text"
                  placeholder="Ej. Costco, Starbucks, Amazon..."
                  value={newNombre}
                  onChange={(e) => setNewNombre(e.target.value)}
                  className="block w-full px-3 py-2 text-xs border border-slate-200 rounded-xl bg-slate-50 focus:bg-white text-slate-805 focus:ring-1 focus:ring-[#0B53F4]"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 block uppercase tracking-wider">
                  RFC de emisión (opcional)
                </label>
                <input
                  type="text"
                  placeholder="Ej. XAXX010101000"
                  value={newRfc}
                  onChange={(e) => setNewRfc(e.target.value)}
                  className="block w-full px-3 py-2 text-xs border border-slate-200 rounded-xl bg-slate-50 focus:bg-white text-slate-805 focus:ring-1 focus:ring-[#0B53F4] font-mono"
                  maxLength={13}
                />
              </div>

              {/* Toggle switch row for TokenSaver / ECO Mode */}
              <div className="flex items-center justify-between pt-1 border-t border-slate-50 mt-1 pb-1">
                <div className="text-left leading-tight pr-4">
                  <span className="text-[10.5px] font-black text-slate-800 tracking-tight flex items-center gap-1">
                    Ahorro de Tokens — Modo ECO
                    <span className="text-[8px] bg-emerald-50 text-emerald-600 border border-emerald-100 font-black px-1 rounded-sm leading-none ml-1 shrink-0 uppercase select-none">
                      🌱 ECO
                    </span>
                  </span>
                  <span className="text-[9.5px] font-medium text-slate-400 mt-1 block leading-normal">
                    Optimiza el consumo de tokens para reducir costos.
                  </span>
                </div>

                {/* Styled Switch toggle */}
                <button
                  type="button"
                  onClick={() => {
                    setTokenSaver(!tokenSaver);
                    toast.success(tokenSaver ? "Modo ECO Desactivado" : "Modo ECO Activado: Ahorro de Tokens del 60%");
                  }}
                  className={`relative inline-flex h-5.5 w-10.5 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out select-none ${
                    tokenSaver ? "bg-emerald-550 bg-emerald-500" : "bg-slate-200"
                  }`}
                >
                  <span
                    className={`pointer-events-none inline-block h-4.5 w-4.5 transform rounded-full bg-white shadow-xs ring-0 transition duration-200 ease-in-out ${
                      tokenSaver ? "translate-x-5" : "translate-x-0"
                    }`}
                  />
                </button>
              </div>

              {/* Submit Action button with sparkly loader indicator */}
              <button
                type="submit"
                className="w-full bg-[#0B53F4] text-white text-xs font-black py-3 rounded-xl hover:opacity-95 transition shadow-sm cursor-pointer border-none flex items-center justify-center gap-1.5"
              >
                <Sparkles className="w-3.5 h-3.5 shrink-0 fill-current" />
                <span>Aprender Portal</span>
              </button>
            </form>

            {/* Steps timeline "Proceso de aprendizaje" */}
            <div className="bg-white border border-slate-100 rounded-[28px] p-5 shadow-sm text-left">
              <h4 className="text-[12.5px] font-black text-slate-900 tracking-tight mb-4">
                Proceso de aprendizaje
              </h4>

              <div className="flex flex-col gap-3.5 pl-1.5">
                {[
                  { step: 1, text: "Explorar portal y detectar acceso" },
                  { step: 2, text: "Analizar estructura y extraer campos" },
                  { step: 3, text: "Identificar campos requeridos" },
                  { step: 4, text: "Simular llenado con datos de prueba" },
                  { step: 5, text: "Guardar modelo de extracción" },
                  { step: 6, text: "Probar extracción con ticket real" },
                  { step: 7, text: "Publicar conector y activar" }
                ].map((s, idx) => (
                  <div key={idx} className="flex items-center gap-3 relative">
                    {/* Tiny connector line */}
                    {idx < 6 && (
                      <div className="absolute left-[9px] top-6 w-0.5 h-4.5 bg-slate-100" />
                    )}

                    <span className="w-5 h-5 rounded-full bg-[#0B53F4]/10 text-[#0B53F4] flex items-center justify-center text-[10px] font-black tracking-tighter shrink-0 select-none font-mono">
                      {s.step}
                    </span>

                    <span className="text-[11px] font-bold text-slate-700">
                      {s.text}
                    </span>
                  </div>
                ))}
              </div>
            </div>

          </div>
        )}

      </div>
      </div>
    </div>
  );
}

// --------------------------- EXTRA SMALL COMPONENT CODES ---------------------------
const ClockIcon = () => (
  <svg className="w-5 h-5 fill-none stroke-current" strokeWidth="2.5" viewBox="0 0 24 24">
    <circle cx="12" cy="12" r="9"/>
    <polyline points="12 7 12 12 15 15"/>
  </svg>
);
