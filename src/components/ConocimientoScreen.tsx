import React, { useState } from "react";
import { BookOpen, Search, HelpCircle, ChevronRight, ArrowLeft, MessageSquare, ShieldCheck, Cpu, Zap, Star, Bell } from "lucide-react";
import { useToast } from "./Toast";

interface FAQItem {
  id: string;
  question: string;
  answer: string;
  category: string;
}

const FAQS: FAQItem[] = [
  {
    id: "scan",
    question: "¿Cómo funciona el escaneo de tickets de consumo?",
    answer: "Nuestro motor inteligente de visión por computadora procesa la foto de tu ticket, detecta el código de facturación (Folio), RFC del emisor, fecha y el monto total neto del consumo en milisegundos de forma robótica.",
    category: "Funcionamiento"
  },
  {
    id: "auto",
    question: "¿Qué pasa si un ticket no se factura automáticamente?",
    answer: "Si un portal SAT comercial remoto está saturado o experimenta fallas, nuestro robot reintentará el timbrado en segundo plano de manera programada para asegurar la emisión de tu comprobante oficial (XML y de representación PDF).",
    category: "Procesamiento"
  },
  {
    id: "portals",
    question: "¿Cómo puedo conectar mis portales corporativos comerciales?",
    answer: "Utiliza la sección 'Portales SAT' para ver las plataformas conectadas de forma global (Alsea, Walmart, Oxxo, etc.) o entrena a nuestro agente de inteligencia artificial en vivo para adaptarlo a cualquier portal de facturación en México.",
    category: "Integraciones"
  },
  {
    id: "security",
    question: "¿Es seguro almacenar mis facturas en la Bóveda CFDI?",
    answer: "Totalmente. Tus datos fiscales de receptor, las llaves públicas de timbrado robótico y las facturas se resguardan de forma encriptada bajo la infraestructura de seguridad en la nube de Firebase, cumpliendo con los estándares SAT de México.",
    category: "Seguridad"
  },
  {
    id: "plans",
    question: "¿Cuáles son los límites de presupuesto y costo por factura?",
    answer: "Nuestra automatización ofrece tarifas competitivas de procesamiento robótico ($2.50 MXN por factura procesada existiendo conector, y $15.00 MXN para entrenamiento de nuevos portales complejos). Puedes delimitar topes presupuestarios desde el panel de Auditoría.",
    category: "Planes"
  },
  {
    id: "cfdi",
    question: "¿Qué versiones de CFDI están soportadas?",
    answer: "Soportamos plenamente la emisión e interpretación de comprobantes fiscales bajo la versión estándar CFDI 4.0 aprobada por el SAT, incluyendo el correcto manejo del Régimen Simplificado de Confianza (RESICO) y demás regímenes vigentes.",
    category: "Seguridad"
  }
];

interface ConocimientoScreenProps {
  onTabChange: (tab: string) => void;
}

export default function ConocimientoScreen({ onTabChange }: ConocimientoScreenProps) {
  const toast = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [openFaq, setOpenFaq] = useState<string | null>(null);
  
  const filteredFaqs = FAQS.filter(faq => {
    const matchesSearch = faq.question.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          faq.answer.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory ? faq.category === selectedCategory : true;
    return matchesSearch && matchesCategory;
  });

  const categories = ["Funcionamiento", "Procesamiento", "Integraciones", "Seguridad", "Planes"];

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

        {/* Title & Subtitle */}
        <div className="mb-6 relative z-10 text-left flex items-start gap-3">
          <button 
            onClick={() => onTabChange("cuenta")} 
            className="p-2.5 rounded-2xl bg-white/10 hover:bg-white/15 text-white transition active:scale-95 cursor-pointer border-0 mt-0.5"
          >
            <ArrowLeft className="w-4.5 h-4.5" />
          </button>
          <div>
            <h2 className="text-[25px] font-black tracking-tight text-white leading-none">
              Conocimiento
            </h2>
            <span className="text-[11.5px] text-blue-100 font-bold block mt-1 tracking-tight select-none opacity-85">
              Soporte, documentación y preguntas de facturación digital
            </span>
          </div>
        </div>

        {/* Stats highlight box */}
        <div className="flex justify-between items-center bg-white/[0.03] backdrop-filter border border-white/5 rounded-2xl p-4.5 mb-1.5 relative z-10">
          {/* Left item: articles */}
          <div className="flex items-center gap-3.5 w-[50%]">
            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-white shrink-0">
              <BookOpen className="w-5 h-5 text-blue-200" />
            </div>
            <div className="text-left min-w-0">
              <span className="text-[23px] font-black block leading-none text-white tracking-tight font-sans">
                {FAQS.length}
              </span>
              <span className="text-[10px] text-blue-100 font-bold block mt-1 tracking-tight">
                artículos de ayuda
              </span>
            </div>
          </div>

          {/* Horizontal dividing thin line */}
          <div className="w-px h-10 bg-white/10 shrink-0 self-center" />

          {/* Right item: soporte en vivo */}
          <div className="flex items-center gap-3.5 w-[50%] pl-4.5">
            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-white shrink-0">
              <MessageSquare className="w-5 h-5 text-blue-200" />
            </div>
            <div className="text-left min-w-0">
              <span className="text-[13.5px] font-bold block leading-none text-white tracking-tight">
                SOPORTE CHAT
              </span>
              <span className="text-[10px] text-blue-100 font-bold block mt-1 tracking-tight">
                en horario hábil
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ==================== 2. MAIN ACTIVE CARD SECTION WRAPPER ==================== */}
      <div className="-mt-14 px-4 pb-20 relative z-20 w-full max-w-7xl mx-auto flex flex-col gap-6">

      {/* Dynamic Search Box */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Buscar artículos o preguntas de soporte..."
          className="w-full bg-slate-50 hover:bg-slate-100/75 focus:bg-white text-[13px] text-slate-800 font-medium pl-12 pr-4 py-3.5 rounded-2xl border border-slate-200/50 focus:border-[#0B53F4] focus:ring-2 focus:ring-[#0B53F4]/10 outline-none transition-all block"
        />
        {searchQuery && (
          <button 
            onClick={() => setSearchQuery("")}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600 font-bold"
          >
            Limpiar
          </button>
        )}
      </div>

      {/* Categories chips filter bar */}
      <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
        <button
          onClick={() => setSelectedCategory(null)}
          className={`px-4 py-2 rounded-xl text-xs font-bold tracking-wide transition shrink-0 cursor-pointer ${
            selectedCategory === null 
              ? "bg-[#0B53F4] text-white shadow-xs shadow-blue-500/20" 
              : "bg-slate-50 hover:bg-slate-100 text-slate-500 hover:text-slate-700"
          }`}
        >
          Todos
        </button>
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-4 py-2 rounded-xl text-xs font-bold tracking-wide transition shrink-0 cursor-pointer ${
              selectedCategory === cat 
                ? "bg-[#0B53F4] text-white shadow-xs shadow-blue-500/20" 
                : "bg-slate-50 hover:bg-slate-100 text-slate-500 hover:text-slate-700"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Interactive Accordion FAQs Container */}
      <div className="bg-white border border-slate-100 rounded-3xl p-5 sm:p-6 shadow-[0_4px_20px_rgba(15,23,42,0.02)] flex flex-col gap-3">
        <div className="flex items-center gap-2 mb-2 border-b border-slate-100/80 pb-3">
          <HelpCircle className="w-5 h-5 text-[#0B53F4]" />
          <h3 className="text-sm font-black uppercase text-slate-800 tracking-wider">
            Preguntas Frecuentes
          </h3>
        </div>

        {filteredFaqs.length === 0 ? (
          <div className="py-8 text-center text-slate-400 font-medium text-xs">
            No encontramos respuestas para "{searchQuery}". Intentelo de nuevo.
          </div>
        ) : (
          <div className="divide-y divide-slate-100/80">
            {filteredFaqs.map((faq) => {
              const isOpen = openFaq === faq.id;
              return (
                <div key={faq.id} className="py-3.5 first:pt-1 last:pb-1">
                  <button
                    onClick={() => setOpenFaq(isOpen ? null : faq.id)}
                    className="w-full flex items-center justify-between text-left gap-3 focus:outline-none group cursor-pointer"
                  >
                    <span className="text-[13px] font-bold text-slate-700 group-hover:text-[#0B53F4] transition duration-150 leading-snug">
                      {faq.question}
                    </span>
                    <span className={`text-[#0B53F4] transition-transform duration-200 shrink-0 ${isOpen ? "rotate-90" : ""}`}>
                      <ChevronRight className="w-4 h-4 stroke-[2.5]" />
                    </span>
                  </button>
                  {isOpen && (
                    <div className="mt-2 text-xs text-slate-500 font-medium leading-relaxed bg-slate-50/50 p-3 rounded-xl border border-slate-150/30 animate-fade-in_50">
                      {faq.answer}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Quick guides / Quick Cards below FAQ */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Resource 1 */}
        <div className="bg-slate-50 border border-slate-200/40 p-4.5 rounded-2xl flex items-start gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center text-[#0B53F4] shrink-0">
            <Cpu className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-xs font-black text-slate-800 transition">Mapeadores Robóticos</h4>
            <p className="text-[10.5px] text-slate-400 font-medium mt-1 leading-snug">
              Nuestra IA aprende automáticamente trayectorias de portales para timbrar más rápido.
            </p>
          </div>
        </div>

        {/* Resource 2 */}
        <div className="bg-slate-50 border border-slate-200/40 p-4.5 rounded-2xl flex items-start gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center text-[#0B53F4] shrink-0">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-xs font-black text-slate-800 transition">Garantía de Sello Digital</h4>
            <p className="text-[10.5px] text-slate-400 font-medium mt-1 leading-snug">
              Validamos cada XML emitido contra la base del SAT para garantizar su perfecta deducción.
            </p>
          </div>
        </div>
      </div>

      {/* Still need help CTA */}
      <div className="bg-gradient-to-r from-slate-900 to-[#071330] text-white rounded-3xl p-5 relative overflow-hidden flex items-center justify-between text-left shadow-md">
        <div className="absolute right-[-20px] top-[-10px] w-32 h-32 rounded-full bg-blue-500/10 blur-xl pointer-events-none" />
        <div className="flex-1 pr-3">
          <h4 className="text-sm font-black tracking-tight mb-0.5">¿Aún tienes dudas?</h4>
          <p className="text-slate-400 text-[10px] font-medium leading-relaxed max-w-[210px]">
            Chatea en vivo con nuestros técnicos sobre problemas de facturas o carga de archivos.
          </p>
        </div>
        <button 
          onClick={() => window.open ? window.open("mailto:legionrender@gmail.com") : alert("Soporte notificado")}
          className="bg-[#0B53F4] hover:bg-blue-600 active:scale-95 text-white text-[10px] font-black px-3.5 py-2.5 rounded-xl transition cursor-pointer shrink-0 inline-flex items-center gap-1.5 shadow-sm"
        >
          <MessageSquare className="w-3.5 h-3.5" />
          <span>Soporte</span>
        </button>
      </div>

      </div>
    </div>
  );
}
