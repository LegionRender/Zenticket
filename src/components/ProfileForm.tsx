import React, { useState } from "react";
import { FiscalProfile } from "../types";
import { 
  Save, AlertCircle, Sparkles, CreditCard, Shield, HelpCircle, 
  CheckCircle, Info, ChevronRight, Palette, Bell, Globe, 
  BookOpen, MessageSquare, Trash2, LogOut, Plus, MoreVertical, Pencil,
  ArrowLeft, Smartphone, Lock, X, Infinity, Check, Sliders, Volume2, ShieldCheck, HeartPulse
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { auth } from "../firebase";
import { signOut } from "firebase/auth";
import { useToast } from "./Toast";

interface ProfileFormProps {
  initialProfile: FiscalProfile | null;
  onSave: (profile: FiscalProfile) => Promise<void>;
  isSaving: boolean;
  currentUserEmail?: string | null;
}

export default function ProfileForm({ 
  initialProfile, 
  onSave, 
  isSaving,
  currentUserEmail 
}: ProfileFormProps) {
  const toast = useToast();
  // Fiscal Profile state registers
  const [rfc, setRfc] = useState(initialProfile?.rfc || "CABE850101ABC");
  const [razonSocial, setRazonSocial] = useState(initialProfile?.razonSocial || "RICARDO CASTRO BECERRIL");
  const [regimenFiscal, setRegimenFiscal] = useState(initialProfile?.regimenFiscal || "626");
  const [codigoPostal, setCodigoPostal] = useState(initialProfile?.codigoPostal || "02000");
  const [usoCFDI, setUsoCFDI] = useState(initialProfile?.usoCFDI || "G03");
  const [personalGeminiKey, setPersonalGeminiKey] = useState(initialProfile?.personalGeminiKey || "");
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Toggle state to switch between high-fidelity dashboard (default) vs edit SAT credentials
  const [isEditingFiscal, setIsEditingFiscal] = useState(false);

  // Extra Personal and preference parameters matching the detailed mockup
  const [nombreCompleto, setNombreCompleto] = useState("Julian Daniels");
  const [correoElectronico, setCorreoElectronico] = useState("julian.d@zenticket.mx");
  const [telefono, setTelefono] = useState("+52 55 1234 5678");
  const [correoRecepcion, setCorreoRecepcion] = useState("facturas@ejemplo.com");
  const [facturacionAutomatica, setFacturacionAutomatica] = useState(false);
  const [metodoRecepcion, setMetodoRecepcion] = useState("Ambos"); // "Correo", "Descarga", "Ambos"
  const [dosPasos, setDosPasos] = useState(false);

  // States for active dialog/modal settings
  const [activeModal, setActiveModal] = useState<"apariencia" | "notificaciones" | "idioma" | "faq" | "tutorial" | "soporte" | "plan" | null>(null);
  
  // Apariencia states
  const [themeChoice, setThemeChoice] = useState<"light" | "dark" | "system">(
    () => (localStorage.getItem("zenticket_theme") as "light" | "dark" | "system") || "light"
  );
  const [fontSizeChoice, setFontSizeChoice] = useState<"small" | "medium" | "large">(
    () => (localStorage.getItem("zenticket_font_size") as "small" | "medium" | "large") || "medium"
  );
  const [borderRadiusChoice, setBorderRadiusChoice] = useState<"compact" | "standard" | "extra">(
    () => (localStorage.getItem("zenticket_border_radius") as "compact" | "standard" | "extra") || "standard"
  );

  React.useEffect(() => {
    // 1. Theme
    let activeTheme = themeChoice;
    if (themeChoice === "system") {
      activeTheme = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
    }
    document.documentElement.setAttribute("data-theme", activeTheme);
    if (activeTheme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }

    // 2. Font Size
    document.documentElement.setAttribute("data-font-size", fontSizeChoice);

    // 3. Border Radius
    document.documentElement.setAttribute("data-radius", borderRadiusChoice);
  }, [themeChoice, fontSizeChoice, borderRadiusChoice]);

  React.useEffect(() => {
    if (initialProfile) {
      setRfc(initialProfile.rfc || "");
      setRazonSocial(initialProfile.razonSocial || "");
      setRegimenFiscal(initialProfile.regimenFiscal || "626");
      setCodigoPostal(initialProfile.codigoPostal || "");
      setUsoCFDI(initialProfile.usoCFDI || "G03");
      setPersonalGeminiKey(initialProfile.personalGeminiKey || "");
    }
  }, [initialProfile]);

  // Notificaciones states
  const [notifInvoices, setNotifInvoices] = useState(true);
  const [notifConnectors, setNotifConnectors] = useState(true);
  const [notifEmailDaily, setNotifEmailDaily] = useState(false);

  // Idioma states
  const [languageChoice, setLanguageChoice] = useState("es-MX");

  // Soporte states
  const [supportSubject, setSupportSubject] = useState("");
  const [supportMessage, setSupportMessage] = useState("");
  const [supportEmail, setSupportEmail] = useState("");

  // FAQ accordion active state index (-1 means none open)
  const [openFaqIndex, setOpenFaqIndex] = useState<number>(-1);

  // Tutorial slide step index (0 to 2)
  const [tutorialStep, setTutorialStep] = useState<number>(0);

  // Display user details dynamically if logged in
  const currentUser = auth.currentUser;
  const userInitials = currentUser?.displayName
    ? currentUser.displayName.split(" ").slice(0, 2).map(n => n[0]).join("").toUpperCase()
    : "JD";
  const userFullName = currentUser?.displayName || "Julian Daniels";
  const userDisplayEmail = currentUser?.email || "julian.d@zenticket.mx";

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (err) {
      console.error("Error signing out: ", err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);

    // Basic SAT field validations
    const cleanedRFC = rfc.trim().toUpperCase();
    if (cleanedRFC.length < 12 || cleanedRFC.length > 13) {
      toast.error("El RFC debe tener exactamente 12 o 13 caracteres.", "Error de Validación");
      return;
    }
    if (!razonSocial.trim()) {
      toast.error("Debe ingresar una Razón Social o Nombre Legal.", "Error de Validación");
      return;
    }
    if (codigoPostal.length !== 5 || isNaN(Number(codigoPostal))) {
      toast.error("El Código Postal de la dirección fiscal debe tener 5 dígitos.", "Error de Validación");
      return;
    }

    try {
      await onSave({
        userId: initialProfile?.userId || "guest",
        rfc: cleanedRFC,
        razonSocial: razonSocial.trim().toUpperCase(),
        regimenFiscal,
        codigoPostal: codigoPostal.trim(),
        usoCFDI,
        createdAt: initialProfile?.createdAt || new Date().toISOString(),
        personalGeminiKey: personalGeminiKey.trim(),
      });
      toast.success("¡Perfil y preferencias guardadas exitosamente!", "Cambios Guardados");
      
      // Return smoothly back to view tab after short grace delay
      setTimeout(() => {
        setIsEditingFiscal(false);
      }, 1000);
    } catch (err: any) {
      toast.error(err.message || "Error al actualizar perfil.", "Error");
    }
  };

  const autofillDemo = () => {
    setRfc("GOMJ890112S89");
    setRazonSocial("JUAN GOMEZ MARTINEZ");
    setRegimenFiscal("612");
    setCodigoPostal("03100");
    setUsoCFDI("G03");
    toast.success("Campos completados con datos demo del SAT.", "Autocompletar");
  };

  if (isEditingFiscal) {
    return (
      <div id="fiscal-form-pane" className="max-w-xl mx-auto bg-[#F8F9FE] border border-slate-200/50 shadow-sm rounded-3xl p-5 sm:p-7 animate-fade-in_50 font-sans text-left mt-2 relative select-none">
        
        {/* TOP BAR / NAVIGATION HEADER exactly as pictured */}
        <div className="flex bg-white border-b border-slate-100 px-5 py-4 items-center justify-between sticky top-0 z-30 font-sans -mx-5 -mt-5 sm:-mx-7 sm:-mt-7 rounded-t-3xl mb-6">
          <div className="flex items-center gap-3">
            <button 
              type="button" 
              onClick={() => setIsEditingFiscal(false)}
              className="text-[#0B53F4] hover:opacity-80 transition cursor-pointer p-1.5 focus:outline-none"
            >
              <ArrowLeft className="w-5.5 h-5.5 stroke-[2.5]" />
            </button>
            <span className="text-base font-black text-slate-900 tracking-tight">Editar Perfil</span>
          </div>
          <img 
            src="https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=200" 
            alt="User thumbnail avatar" 
            className="w-10 h-10 rounded-full border border-slate-200/80 shadow-xs object-cover"
            referrerPolicy="no-referrer"
          />
        </div>

        {/* PROFILE PICTURE CARD CONTAINER as pictured with circle ring and blue overlay badge */}
        <div className="bg-white border border-[#EBF1FF] rounded-3xl p-6 flex flex-col items-center justify-center relative mb-6 shadow-xs">
          <div className="relative w-24 h-24 rounded-full border-[3px] border-white ring-[4px] ring-[#0B53F4]/20 flex items-center justify-center overflow-visible">
            <img 
              src="https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=200" 
              alt="Julian Daniels Portrait" 
              className="w-full h-full rounded-full object-cover"
              referrerPolicy="no-referrer"
            />
            {/* Small Blue pencil badge attached exactly bottom right */}
            <button 
              type="button"
              onClick={() => toast.info("Función de cambio de fotografía estará disponible en la versión móvil nativa.", "Foto de Perfil")}
              className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-[#0B53F4] hover:bg-[#0747D1] text-white flex items-center justify-center shadow-md border-2 border-white cursor-pointer transition active:scale-95"
            >
              <Pencil className="w-3.5 h-3.5 text-white" />
            </button>
          </div>
          <button 
            type="button" 
            onClick={() => toast.info("Configura tu avatar usando Gravatar o sube tu foto directamente.", "Cambiar foto")}
            className="text-xs font-bold text-[#0B53F4] hover:underline mt-3"
          >
            Cambiar foto
          </button>
        </div>

        {/* SECTION 1: DATOS PERSONALES */}
        <h3 className="text-base font-black text-[#0B53F4] uppercase tracking-wide mb-3 mt-4 ml-1 pl-1">
          Datos Personales
        </h3>
        
        <div className="bg-white border border-slate-200/60 rounded-3xl p-5 space-y-4 shadow-2xs mb-6">
          {/* Nombre Completo */}
          <div className="space-y-1">
            <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-widest ml-1">
              Nombre Completo
            </label>
            <input
              type="text"
              value={nombreCompleto}
              onChange={(e) => setNombreCompleto(e.target.value)}
              className="w-full text-sm font-medium bg-[#F8F9FE] border border-slate-200/70 focus:border-[#0B53F4] focus:ring-1 focus:ring-[#0B53F4]/20 rounded-2xl px-4 py-3 text-slate-800 focus:outline-none transition-all placeholder-slate-400"
            />
          </div>

          {/* Correo Electrónico */}
          <div className="space-y-1">
            <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-widest ml-1">
              Correo Electrónico
            </label>
            <input
              type="email"
              value={correoElectronico}
              onChange={(e) => setCorreoElectronico(e.target.value)}
              className="w-full text-sm font-medium bg-[#F8F9FE] border border-slate-200/70 focus:border-[#0B53F4] focus:ring-1 focus:ring-[#0B53F4]/20 rounded-2xl px-4 py-3 text-slate-800 focus:outline-none transition-all placeholder-slate-400"
            />
          </div>

          {/* Teléfono */}
          <div className="space-y-1">
            <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-widest ml-1">
              Teléfono
            </label>
            <input
              type="text"
              value={telefono}
              onChange={(e) => setTelefono(e.target.value)}
              className="w-full text-sm font-medium bg-[#F8F9FE] border border-slate-200/70 focus:border-[#0B53F4] focus:ring-1 focus:ring-[#0B53F4]/20 rounded-2xl px-4 py-3 text-slate-800 focus:outline-none transition-all placeholder-slate-400"
            />
          </div>

          {/* Inline grid columns for Fecha de Registro and Plan Actual */}
          <div className="grid grid-cols-2 gap-4 pt-1">
            <div className="space-y-1">
              <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-widest ml-1">
                Fecha de Registro
              </label>
              <div className="w-full text-sm font-bold bg-[#EBF1FF]/60 border border-[#EBF1FF] rounded-2xl px-4 py-3.5 text-slate-600 cursor-not-allowed select-none">
                12 Oct 2023
              </div>
            </div>

            <div className="space-y-1">
              <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-widest ml-1">
                Plan Actual
              </label>
              <div className="w-full text-sm font-black bg-[#EBF1FF]/60 border border-[#EBF1FF] rounded-2xl px-4 py-3.5 text-[#0B53F4] cursor-not-allowed select-none">
                Pro Automation
              </div>
            </div>
          </div>
        </div>

        {/* SECTION 2: DATOS FISCALES */}
        <div className="flex items-center justify-between mb-3 mt-8 ml-1 pl-1">
          <h3 className="text-base font-black text-[#0B53F4] uppercase tracking-wide">
            Datos Fiscales
          </h3>
          <button
            onClick={autofillDemo}
            type="button"
            className="text-[10px] font-bold flex items-center gap-1 text-[#0B53F4] bg-[#0B53F4]/5 hover:bg-[#0B53F4]/10 border border-[#0B53F4]/10 px-2.5 py-1 rounded-lg transition"
          >
            <Sparkles className="w-3 h-3" />
            Llenar Demo
          </button>
        </div>

        <div className="bg-white border border-slate-200/60 rounded-3xl p-5 space-y-4 shadow-2xs mb-6">
          {/* RFC */}
          <div className="space-y-1">
            <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-widest ml-1">
              RFC
            </label>
            <input
              type="text"
              maxLength={13}
              value={rfc}
              onChange={(e) => setRfc(e.target.value.toUpperCase())}
              placeholder="RFC de 12 o 13 dígitos"
              className="w-full text-sm font-mono bg-[#F8F9FE] border border-slate-200/70 focus:border-[#0B53F4] focus:ring-1 focus:ring-[#0B53F4]/20 rounded-2xl px-4 py-3 text-slate-800 focus:outline-none transition-all placeholder-slate-400"
            />
          </div>

          {/* Razón Social */}
          <div className="space-y-1">
            <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-widest ml-1">
              Razón Social
            </label>
            <input
              type="text"
              value={razonSocial}
              onChange={(e) => setRazonSocial(e.target.value)}
              placeholder="Tal como figura en constancia SAT"
              className="w-full text-sm font-medium bg-[#F8F9FE] border border-slate-200/70 focus:border-[#0B53F4] focus:ring-1 focus:ring-[#0B53F4]/20 rounded-2xl px-4 py-3 text-slate-800 focus:outline-none transition-all placeholder-slate-400"
            />
          </div>

          {/* Régimen Fiscal */}
          <div className="space-y-1">
            <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-widest ml-1">
              Régimen Fiscal
            </label>
            <div className="relative">
              <select
                value={regimenFiscal}
                onChange={(e) => setRegimenFiscal(e.target.value)}
                className="w-full text-sm font-medium bg-[#F8F9FE] border border-slate-200/70 focus:border-[#0B53F4] rounded-2xl px-4 py-3.5 text-slate-800 focus:outline-none transition-all cursor-pointer appearance-none"
              >
                <option value="601">601 - General de Ley Personas Morales</option>
                <option value="603">603 - Personas Morales con Fines no Lucrativos</option>
                <option value="605">605 - Sueldos y Salarios e Ingresos Asimilados</option>
                <option value="606">606 - Arrendamiento</option>
                <option value="612">612 - Actividades Empresariales y Profesionales</option>
                <option value="626">626 - RESICO (Régimen de Confianza)</option>
              </select>
              <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-450 font-bold">&#9662;</div>
            </div>
          </div>

          {/* Código Postal Fiscal */}
          <div className="space-y-1">
            <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-widest ml-1">
              Código Postal Fiscal
            </label>
            <input
              type="text"
              maxLength={5}
              value={codigoPostal}
              onChange={(e) => setCodigoPostal(e.target.value.replace(/\D/g, ""))}
              placeholder="02000"
              className="w-full text-sm font-mono bg-[#F8F9FE] border border-slate-200/70 focus:border-[#0B53F4] focus:ring-1 focus:ring-[#0B53F4]/20 rounded-2xl px-4 py-3 text-slate-800 focus:outline-none transition-all placeholder-slate-400"
            />
          </div>

          {/* Uso CFDI Predeterminado */}
          <div className="space-y-1">
            <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-widest ml-1">
              Uso CFDI Predeterminado
            </label>
            <div className="relative">
              <select
                value={usoCFDI}
                onChange={(e) => setUsoCFDI(e.target.value)}
                className="w-full text-sm font-medium bg-[#F8F9FE] border border-slate-200/70 focus:border-[#0B53F4] rounded-2xl px-4 py-3.5 text-slate-800 focus:outline-none transition-all cursor-pointer appearance-none"
              >
                <option value="G01">G01 - Adquisición de mercancías</option>
                <option value="G03">G03 - Gastos en general</option>
                <option value="D01">D01 - Honorarios médicos, dentales y hospitalarios</option>
                <option value="D02">D02 - Gastos médicos por incapacidad o discapacidad</option>
                <option value="D04">D04 - Donativos</option>
                <option value="S01">S01 - Sin efectos fiscales</option>
              </select>
              <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-450 font-bold">&#9662;</div>
            </div>
          </div>

          {/* Correo para Recepción de Facturas */}
          <div className="space-y-1">
            <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-widest ml-1">
              Correo para Recepción de Facturas
            </label>
            <input
              type="email"
              value={correoRecepcion}
              onChange={(e) => setCorreoRecepcion(e.target.value)}
              className="w-full text-sm font-medium bg-[#F8F9FE] border border-slate-200/70 focus:border-[#0B53F4] focus:ring-1 focus:ring-[#0B53F4]/20 rounded-2xl px-4 py-3 text-slate-800 focus:outline-none transition-all placeholder-slate-400"
            />
          </div>
        </div>

        {/* SECTION: OPTIMIZACIÓN IA (GEMINI) */}
        <h3 className="text-base font-black text-[#0B53F4] uppercase tracking-wide mb-3 mt-8 ml-1 pl-1 flex items-center gap-1.5">
          <Sparkles className="w-5 h-5 text-[#0B53F4] fill-violet-200 animate-pulse" />
          <span>Inteligencia Artificial Personal</span>
        </h3>

        <div className="bg-gradient-to-br from-violet-50/50 to-white border border-violet-100 rounded-3xl p-5 shadow-2xs mb-6 space-y-4 text-left">
          <div className="leading-tight">
            <span className="text-xs font-black text-violet-600 uppercase tracking-wider block mb-1">PROCESAMIENTO CON TU PROPIO AGENTE</span>
            <span className="text-[11px] text-slate-500 block leading-relaxed">
              Conecta tu propia cuenta de Gemini para optimizar el análisis de tus tickets con estructuras de facturación altamente complejas, reducir la latencia de procesamiento, y elevar los límites de peticiones mensuales.
            </span>
          </div>

          <div className="space-y-1">
            <label className="block text-[10px] font-black text-[#0B53F4] uppercase tracking-widest ml-1 font-sans">
              GEMINI API KEY PERSONAL
            </label>
            <div className="relative">
              <input
                type="password"
                value={personalGeminiKey}
                onChange={(e) => setPersonalGeminiKey(e.target.value)}
                placeholder="AIzaSy..."
                className="w-full text-xs font-mono bg-white border border-slate-200 focus:border-[#0B53F4] focus:ring-1 focus:ring-[#0B53F4]/20 rounded-2xl pl-4 pr-10 py-3 text-slate-800 focus:outline-none transition-all placeholder-slate-400"
              />
              <button
                type="button"
                onClick={() => {
                  if (personalGeminiKey) {
                    toast.info(`Clave de Gemini configurada. Longitud: ${personalGeminiKey.length} caracteres.`, "Seguridad IA");
                  } else {
                    window.open("https://aistudio.google.com/apikey", "_blank");
                    toast.info("Abriendo Google AI Studio para que obtengas tu API Key gratuita.", "Lector de Claves");
                  }
                }}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-[#0B53F4] transition bg-transparent cursor-pointer"
                title={personalGeminiKey ? "Información de la Clave" : "Obtener API Key Gratis"}
              >
                <HelpCircle className="w-4 h-4" />
              </button>
            </div>
            <div className="flex items-center gap-1.5 mt-2 ml-1 text-[10px] text-slate-450 font-bold">
              {personalGeminiKey ? (
                <span className="text-emerald-600 flex items-center gap-1 font-semibold">
                  <CheckCircle className="w-3.5 h-3.5 fill-emerald-100" /> Clave configurada. Los procesos complejos utilizarán tu propio límite.
                </span>
              ) : (
                <span className="text-slate-450">
                  ¿No tienes una API Key? Obtén una de forma gratuita en <a href="https://aistudio.google.com/apikey" target="_blank" rel="noopener noreferrer" className="text-[#0B53F4] underline hover:text-[#0747D1]">Google AI Studio</a>.
                </span>
              )}
            </div>
          </div>
        </div>

        {/* SECTION 3: PREFERENCIAS */}
        <h3 className="text-base font-black text-[#0B53F4] uppercase tracking-wide mb-3 mt-8 ml-1 pl-1">
          Preferencias
        </h3>

        <div className="bg-white border border-slate-200/60 rounded-3xl p-5 space-y-5 shadow-2xs mb-6">
          {/* Facturación Automática Switch Row */}
          <div className="flex items-center justify-between gap-4">
            <div className="text-left leading-tight">
              <span className="text-sm font-bold text-slate-800 block">Facturación Automática</span>
              <span className="text-[11px] text-slate-400 block mt-1">Generar CFDI al detectar pago</span>
            </div>
            {/* iOS Styled Premium Toggle Switch Inactive by default matching picture */}
            <button
              type="button"
              onClick={() => setFacturacionAutomatica(!facturacionAutomatica)}
              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                facturacionAutomatica ? "bg-[#0B53F4]" : "bg-slate-300"
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                  facturacionAutomatica ? "translate-x-5" : "translate-x-0"
                }`}
              />
            </button>
          </div>

          {/* Método de Recepción Label & Horizontal Button Grid */}
          <div className="space-y-2 pt-2 border-t border-slate-100/70">
            <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-widest ml-1">
              Método de Recepción
            </label>
            <div className="flex gap-3">
              {["Correo", "Descarga", "Ambos"].map((option) => {
                const isActive = metodoRecepcion === option;
                return (
                  <button
                    key={option}
                    type="button"
                    onClick={() => setMetodoRecepcion(option)}
                    className={`flex-1 py-3 text-xs font-bold rounded-xl transition cursor-pointer select-none border ${
                      isActive 
                        ? "bg-[#EBF1FF]/75 border-2 border-[#0B53F4] text-[#0B53F4] shadow-xs" 
                        : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    {option}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* SECTION 4: SEGURIDAD */}
        <h3 className="text-base font-black text-[#0B53F4] uppercase tracking-wide mb-3 mt-8 ml-1 pl-1">
          Seguridad
        </h3>

        <div className="bg-white border border-slate-200/60 rounded-3xl p-5 space-y-4 shadow-2xs mb-6">
          {/* Cambiar Contraseña list row */}
          <button
            type="button"
            onClick={() => toast.info("Por favor revise su bandeja de entrada. Le enviaremos un correo de restablecimiento de contraseña.", "Seguridad")}
            className="w-full flex items-center justify-between p-3.5 bg-slate-50/50 hover:bg-[#EBF1FF]/20 border border-slate-100 rounded-2xl transition text-left focus:outline-none cursor-pointer group"
          >
            <div className="flex items-center gap-3">
              <Lock className="w-5 h-5 text-[#0B53F4]/80 stroke-[2.2]" />
              <span className="text-sm font-bold text-slate-800">Cambiar Contraseña</span>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 transition-transform" />
          </button>

          {/* Autenticación en dos pasos switch wrapper */}
          <div className="flex items-center justify-between gap-4 py-2 border-t border-slate-100/70">
            <div className="text-left leading-tight">
              <span className="text-sm font-bold text-slate-800 block">Autenticación en Dos Pasos</span>
              <span className="text-[11px] text-slate-400 block mt-1">Protege tu cuenta con SMS o App</span>
            </div>
            {/* iOS Styled switch */}
            <button
              type="button"
              onClick={() => {
                setDosPasos(!dosPasos);
                toast.success(dosPasos ? "Doble autenticación desactivada." : "Autenticación de dos pasos configurada correctamente.", "Seguridad 2FA");
              }}
              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                dosPasos ? "bg-[#0B53F4]" : "bg-slate-300"
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                  dosPasos ? "translate-x-5" : "translate-x-0"
                }`}
              />
            </button>
          </div>

          {/* Dispositivos Vinculados block with nested iPhone Item */}
          <div className="space-y-2.5 pt-3 border-t border-slate-100/70 text-left">
            <span className="block text-[11px] font-bold text-slate-400 uppercase tracking-widest ml-1">
              Dispositivos Vinculados
            </span>

            <div className="flex items-center justify-between p-4.5 bg-[#FAF9FE] border border-slate-200/50 rounded-2xl shadow-2xs">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-[#EBF1FF] rounded-full flex items-center justify-center text-[#0B53F4] shrink-0">
                  <Smartphone className="w-5.5 h-5.5 stroke-[2.2]" />
                </div>
                <div className="leading-tight text-left">
                  <span className="text-sm font-bold text-slate-800 block">iPhone 15 Pro</span>
                  <span className="text-[10px] text-slate-400 block mt-1 font-medium">iOS 17 • Activo ahora</span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => toast.warning("La desactivación del dispositivo principal requiere re-autenticar la aplicación.", "Dispositivos")}
                className="text-[#E11D48] hover:text-rose-700 text-xs font-bold select-none cursor-pointer hover:underline bg-transparent"
              >
                Cerrar Sesión
              </button>
            </div>
          </div>
        </div>

        {/* BOTTOM GLOBAL GUARDAR CAMBIOS ACTION BUTTON */}
        <button
          type="button"
          onClick={handleSubmit}
          disabled={isSaving}
          className="w-full bg-[#0B53F4] hover:bg-[#0747D1] disabled:opacity-50 text-white font-black text-sm py-4.5 rounded-2xl transition flex items-center justify-center gap-2 cursor-pointer shadow-md shadow-[#0B53F4]/15 active:scale-[0.98] mt-8 select-none"
        >
          <Save className="w-4.5 h-4.5 text-white stroke-[2.2]" />
          <span>{isSaving ? "Guardando..." : "Guardar Cambios"}</span>
        </button>

      </div>
    );
  }

  if (activeModal !== null) {
    return (
      <div id="subpage-form-pane" className="max-w-xl mx-auto bg-[#F8F9FE] border border-slate-200/50 shadow-sm rounded-3xl p-5 sm:p-7 animate-fade-in_50 font-sans text-left mt-2 relative select-none">
        
        {/* TOP BAR / NAVIGATION HEADER exactly as pictured */}
        <div className="flex bg-white border-b border-slate-100 px-5 py-4 items-center justify-between sticky top-0 z-30 font-sans -mx-5 -mt-5 sm:-mx-7 sm:-mt-7 rounded-t-3xl mb-6">
          <div className="flex items-center gap-3">
            <button 
              type="button" 
              onClick={() => setActiveModal(null)}
              className="text-[#0B53F4] hover:opacity-80 transition cursor-pointer p-1.5 focus:outline-none"
            >
              <ArrowLeft className="w-5.5 h-5.5 stroke-[2.5]" />
            </button>
            <span className="text-base font-black text-slate-900 tracking-tight">
              {activeModal === "plan" ? "Gestionar Plan" : 
               activeModal === "apariencia" ? "Apariencia" : 
               activeModal === "notificaciones" ? "Notificaciones" : 
               activeModal === "idioma" ? "Seleccionar Idioma" : 
               activeModal === "faq" ? "Preguntas Frecuentes" : 
               activeModal === "tutorial" ? "Guía Rápida" : 
               "Soporte Técnico"}
            </span>
          </div>
          <img 
            src="https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=200" 
            alt="User thumbnail avatar" 
            className="w-10 h-10 rounded-full border border-slate-200/80 shadow-xs object-cover"
            referrerPolicy="no-referrer"
          />
        </div>

        {/* CONTAINER CONTENT */}
        <div className="space-y-6">
          {activeModal === "plan" && (
            <div className="space-y-5">
              {/* Header Banner */}
              <div className="text-center px-2 py-1 space-y-2">
                <h2 className="text-[21px] font-black leading-tight text-slate-900 tracking-tight">
                  Lleva tu contabilidad al<br />siguiente nivel
                </h2>
                <p className="text-xs text-slate-450 font-semibold leading-relaxed max-w-xs mx-auto">
                  Automatización total a un clic. Olvídate de la carga administrativa y enfócate en lo que realmente importa: tu negocio.
                </p>
              </div>

              {/* TU PLAN ACTUAL BOX */}
              <div className="bg-white border border-[#EBF1FF] rounded-2.5xl p-4.5 shadow-2xs flex items-center justify-between select-none">
                <div className="text-left leading-tight">
                  <span className="text-[9.5px] font-black text-slate-400 uppercase tracking-widest block mb-0.5">
                    TU PLAN ACTUAL
                  </span>
                  <div className="flex items-center gap-1.5 mt-1">
                    <span className="text-base font-black text-slate-800">Pro Automation</span>
                    <span className="bg-emerald-50 text-emerald-600 border border-emerald-100 text-[8.5px] uppercase font-black px-2 py-0.5 rounded-full tracking-wider flex items-center gap-0.5 shadow-xs">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> Activo
                    </span>
                  </div>
                </div>
                <button 
                  type="button"
                  onClick={() => {
                    setActiveModal(null);
                    toast.success("Mostrando tu historial de CFDI timbrados en el Buzón Activo.", "Facturas y Recibos");
                  }}
                  className="bg-[#EBF1FF] hover:bg-[#DDECFF] text-[#0B53F4] text-[11px] font-extrabold px-3.5 py-2.5 rounded-xl transition cursor-pointer"
                >
                  Ver recibos
                </button>
              </div>

              {/* PLANS SECTIONS COLUMN */}
              <div className="space-y-4 pt-1">
                
                {/* Plan Gratuito */}
                <div className="bg-white border border-slate-200/60 rounded-3xl p-5 shadow-[0_3px_10px_rgba(0,0,0,0.01)] relative text-left">
                  <div className="flex justify-between items-start mb-2.5">
                    <div>
                      <h4 className="text-base font-black text-slate-800">Plan Gratuito</h4>
                      <p className="text-[11px] text-slate-400 font-semibold mt-0.5">Ideal para personas físicas comenzando.</p>
                    </div>
                    <div className="text-right leading-none">
                      <span className="text-base font-extrabold text-slate-900">$0</span>
                      <span className="text-[9px] text-slate-400 font-bold block mt-1 uppercase tracking-wider">MXN/mes</span>
                    </div>
                  </div>
                  
                  <div className="space-y-2 pt-3 border-t border-slate-50 mb-4 flex flex-col">
                    <div className="flex items-center gap-2.5 text-xs font-bold text-slate-650">
                      <Check className="w-4 h-4 text-[#0B53F4] stroke-[3.5]" />
                      <span>5 facturas por mes</span>
                    </div>
                    <div className="flex items-center gap-2.5 text-xs font-bold text-slate-650">
                      <Check className="w-4 h-4 text-[#0B53F4] stroke-[3.5]" />
                      <span>Soporte básico</span>
                    </div>
                    <div className="flex items-center gap-2.5 text-xs font-bold text-slate-400 line-through decoration-slate-300">
                      <X className="w-4 h-4 text-slate-300 stroke-[3.5]" />
                      <span>IA Portal Learning</span>
                    </div>
                  </div>
                  
                  <button 
                    type="button"
                    onClick={() => {
                      setActiveModal(null);
                      toast.success("Manteniendo configuración actual de Plan Gratuito.", "Suscripción");
                    }}
                    className="w-full bg-white hover:bg-slate-50 border-2 border-[#0B53F4] text-[#0B53F4] text-xs font-black py-3 rounded-xl transition cursor-pointer text-center active:scale-98"
                  >
                    Mantener Gratis
                  </button>
                </div>

                {/* Plan Personal (RECOMMENDED) */}
                <div className="bg-white border-2 border-[#0B53F4] rounded-3xl p-5 shadow-xs relative text-left overflow-visible">
                  {/* RECOMMENDED CENTRAL BADGE */}
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#0B53F4] text-white text-[8.5px] uppercase font-black px-4 py-1 rounded-full tracking-widest shadow-sm select-none">
                    RECOMENDADO
                  </div>
                  
                  <div className="flex justify-between items-start mb-2.5 mt-0.5">
                    <div>
                      <h4 className="text-base font-black text-slate-800">Plan Personal</h4>
                      <p className="text-[11px] text-slate-455 font-semibold mt-0.5">Perfecto para RESICO y servicios prof.</p>
                    </div>
                    <div className="text-right leading-none">
                      <span className="text-base font-extrabold text-[#0B53F4]">$290</span>
                      <span className="text-[9px] text-[#0B53F4] font-black block mt-1 uppercase tracking-wider">MXN/mes</span>
                    </div>
                  </div>
                  
                  <div className="space-y-2 pt-3 border-t border-slate-50 mb-4 flex flex-col">
                    <div className="flex items-center gap-2.5 text-xs font-black text-[#0B53F4]">
                      <Sparkles className="w-4 h-4 text-[#0B53F4] fill-[#0B53F4]/10 stroke-[2.2]" />
                      <span>100 facturas/mes</span>
                    </div>
                    <div className="flex items-center gap-2.5 text-xs font-bold text-slate-650">
                      <Check className="w-4 h-4 text-[#0B53F4] stroke-[3.5]" />
                      <span>IA Portal Learning</span>
                    </div>
                    <div className="flex items-center gap-2.5 text-xs font-bold text-slate-650">
                      <Check className="w-4 h-4 text-[#0B53F4] stroke-[3.5]" />
                      <span>Recibos automatizados</span>
                    </div>
                    <div className="flex items-center gap-2.5 text-xs font-bold text-slate-650">
                      <Check className="w-4 h-4 text-[#0B53F4] stroke-[3.5]" />
                      <span>Soporte prioritario</span>
                    </div>
                  </div>
                  
                  <button 
                    type="button"
                    onClick={() => {
                      setActiveModal(null);
                      toast.success("Has solicitado cambiar al Plan Personal. Redirigiendo de forma segura para confirmar método de pago...", "ZenTicket Billing");
                    }}
                    className="w-full bg-[#0B53F4] hover:bg-[#0747D1] text-white text-xs font-black py-3 rounded-xl transition cursor-pointer text-center shadow-md shadow-[#0B53F4]/10 active:scale-98"
                  >
                    Elegir Plan Personal
                  </button>
                </div>

                {/* Plan Empresa */}
                <div className="bg-white border border-slate-200/60 rounded-3xl p-5 shadow-[0_3px_10px_rgba(0,0,0,0.01)] relative text-left">
                  <div className="flex justify-between items-start mb-2.5">
                    <div>
                      <h4 className="text-base font-black text-slate-800">Plan Empresa</h4>
                      <p className="text-[11px] text-slate-400 font-semibold mt-0.5">Personas Morales y alto volumen.</p>
                    </div>
                    <div className="text-right leading-none">
                      <span className="text-base font-extrabold text-slate-900">$950</span>
                      <span className="text-[9px] text-slate-400 font-bold block mt-1 uppercase tracking-wider">MXN/mes</span>
                    </div>
                  </div>
                  
                  <div className="space-y-2 pt-3 border-t border-slate-50 mb-4 flex flex-col">
                    <div className="flex items-center gap-2.5 text-xs font-bold text-slate-650">
                      <Infinity className="w-4 h-4 text-[#0B53F4] stroke-[2.5]" />
                      <span>Facturas Ilimitadas</span>
                    </div>
                    <div className="flex items-center gap-2.5 text-xs font-bold text-slate-650">
                      <Plus className="w-4 h-4 text-[#0B53F4] stroke-[3]" />
                      <span>Acceso multi-usuario</span>
                    </div>
                    <div className="flex items-center gap-2.5 text-xs font-bold text-slate-650">
                      <Plus className="w-4 h-4 text-[#0B53F4] stroke-[3]" />
                      <span>Acceso API robusta</span>
                    </div>
                    <div className="flex items-center gap-2.5 text-xs font-bold text-slate-650">
                      <Plus className="w-4 h-4 text-[#0B53F4] stroke-[3]" />
                      <span>Account Manager dedicado</span>
                    </div>
                  </div>
                  
                  <button 
                    type="button"
                    onClick={() => {
                      setActiveModal(null);
                      toast.info("Nuestro equipo de Enterprise se pondrá en contacto contigo para cotizar y configurar tu acceso corporativo.", "ZenTicket Corporativos");
                    }}
                    className="w-full bg-[#EBF1FF]/80 hover:bg-[#DDECFF] text-[#0B53F4] text-xs font-black py-3 rounded-xl transition cursor-pointer text-center active:scale-98"
                  >
                    Contratar Empresa
                  </button>
                </div>

              </div>
            </div>
          )}

          {activeModal === "apariencia" && (
            <div className="space-y-6 text-left">
              {/* Theme Choice Segment */}
              <div className="space-y-2.5">
                <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-widest ml-1 mb-1">
                  Selecciona el Tema
                </label>
                <div className="grid grid-cols-3 gap-2.5">
                  {[
                    { id: "light", label: "Claro", icon: Palette },
                    { id: "dark", label: "Oscuro", icon: Palette },
                    { id: "system", label: "Sistema", icon: Sliders }
                  ].map((item) => {
                    const isActive = themeChoice === item.id;
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => {
                          setThemeChoice(item.id as "light" | "dark" | "system");
                          toast.success(`Estilo visual ${item.label} seleccionado exitosamente.`, "Configuración Guardada");
                        }}
                        className={`flex flex-col items-center justify-center p-4 rounded-2.5xl transition cursor-pointer border-2 text-center select-none active:scale-95 ${
                          isActive 
                            ? "bg-[#EBF1FF] border-[#0B53F4] text-[#0B53F4]" 
                            : "bg-white border-slate-200 text-slate-600 hover:bg-slate-55"
                        }`}
                      >
                        <item.icon className="w-5 h-5 mb-1.5" />
                        <span className="text-xs font-extrabold">{item.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Font Size Selector */}
              <div className="space-y-2.5 pt-4 border-t border-slate-100">
                <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-widest ml-1 mb-1">
                  Tamaño de la Fuente (In-App)
                </label>
                <div className="flex gap-2.5">
                  {[
                    { id: "small", label: "Chico" },
                    { id: "medium", label: "Estándar" },
                    { id: "large", label: "Grande" }
                  ].map((item) => {
                    const isActive = fontSizeChoice === item.id;
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => {
                          setFontSizeChoice(item.id as "small" | "medium" | "large");
                          toast.success(`Escala tipográfica fijada en ${item.label}.`, "Configuración Guardada");
                        }}
                        className={`flex-1 py-3.5 text-xs font-black rounded-2xl transition cursor-pointer border ${
                          isActive 
                            ? "bg-[#EBF1FF] border-[#0B53F4] text-[#0B53F4]" 
                            : "bg-white border-slate-200 text-slate-600 hover:bg-slate-55"
                        }`}
                      >
                        {item.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Border Radius */}
              <div className="space-y-2.5 pt-4 border-t border-slate-100">
                <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-widest ml-1 mb-1">
                  Redondeado de Tarjetas
                </label>
                <div className="flex gap-2.5">
                  {[
                    { id: "compact", label: "Compacto" },
                    { id: "standard", label: "Estándar" },
                    { id: "extra", label: "Extra" }
                  ].map((item) => {
                    const isActive = borderRadiusChoice === item.id;
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => {
                          setBorderRadiusChoice(item.id as "compact" | "standard" | "extra");
                          toast.success(`Redondeado visual fijado en ${item.label}.`, "Configuración Guardada");
                        }}
                        className={`flex-1 py-3.5 text-xs font-black rounded-2xl transition cursor-pointer border ${
                          isActive 
                            ? "bg-[#EBF1FF] border-[#0B53F4] text-[#0B53F4]" 
                            : "bg-white border-slate-200 text-slate-600 hover:bg-slate-55"
                        }`}
                      >
                        {item.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Save Action */}
              <div className="pt-4">
                <button
                  type="button"
                  onClick={() => {
                    localStorage.setItem("zenticket_theme", themeChoice);
                    localStorage.setItem("zenticket_font_size", fontSizeChoice);
                    localStorage.setItem("zenticket_border_radius", borderRadiusChoice);
                    setActiveModal(null);
                    toast.success("Las preferencias estéticas se guardaron en la memoria persistente local y se aplicaron.", "Apariencia");
                  }}
                  className="w-full py-4.5 bg-[#0B53F4] hover:bg-[#0747D1] text-white text-sm font-black rounded-2.5xl transition shadow-md shadow-[#0B53F4]/10 cursor-pointer text-center active:scale-98"
                >
                  Confirmar y Aplicar
                </button>
              </div>
            </div>
          )}

          {activeModal === "notificaciones" && (
            <div className="space-y-5 text-left">
              <p className="text-xs text-slate-455 font-bold ml-1 mb-3">
                Establece qué actividades emitirán notificaciones automáticas inmediatas e informes consolidados.
              </p>

              <div className="bg-white border border-slate-200/50 rounded-3xl overflow-hidden divide-y divide-slate-100">
                {/* Switch Row Item 1 */}
                <div className="flex items-center justify-between p-4.5">
                  <div className="text-left leading-tight pr-3">
                    <span className="text-sm font-bold text-slate-800 block">Nuevas Facturas Descargadas</span>
                    <span className="text-[11px] text-slate-400 block mt-1">Avisar inmediatamente al timbrar nuevos folios</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setNotifInvoices(!notifInvoices)}
                    className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                      notifInvoices ? "bg-[#0B53F4]" : "bg-slate-300"
                    }`}
                  >
                    <span
                      className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                        notifInvoices ? "translate-x-5" : "translate-x-0"
                      }`}
                    />
                  </button>
                </div>

                {/* Switch Row Item 2 */}
                <div className="flex items-center justify-between p-4.5">
                  <div className="text-left leading-tight pr-3">
                    <span className="text-sm font-bold text-slate-800 block">Alertas de Conectores</span>
                    <span className="text-[11px] text-slate-400 block mt-1">Desconexiones técnicas o peticiones de CAPTCHA del SAT</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setNotifConnectors(!notifConnectors)}
                    className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                      notifConnectors ? "bg-[#0B53F4]" : "bg-slate-300"
                    }`}
                  >
                    <span
                      className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                        notifConnectors ? "translate-x-5" : "translate-x-0"
                      }`}
                    />
                  </button>
                </div>

                {/* Switch Row Item 3 */}
                <div className="flex items-center justify-between p-4.5">
                  <div className="text-left leading-tight pr-3">
                    <span className="text-sm font-bold text-slate-800 block">Resumen Diario Consolidado</span>
                    <span className="text-[11px] text-slate-400 block mt-1">Envío por correo de movimientos contables clave del día</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setNotifEmailDaily(!notifEmailDaily)}
                    className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                      notifEmailDaily ? "bg-[#0B53F4]" : "bg-slate-300"
                    }`}
                  >
                    <span
                      className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                        notifEmailDaily ? "translate-x-5" : "translate-x-0"
                      }`}
                    />
                  </button>
                </div>
              </div>

              <div className="pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setActiveModal(null);
                    toast.success("Notificaciones programadas de forma satisfactoria.", "Configuración Guardada");
                  }}
                  className="w-full py-4.5 bg-[#0B53F4] hover:bg-[#0747D1] text-white text-sm font-black rounded-2.5xl transition shadow-md shadow-[#0B53F4]/10 cursor-pointer text-center active:scale-98"
                >
                  Guardar Ajustes
                </button>
              </div>
            </div>
          )}

          {activeModal === "idioma" && (
            <div className="space-y-4 text-left">
              <p className="text-xs text-slate-455 font-bold ml-1 mb-3">
                Establece el idioma nativo para la interfaz de ZenTicket, correos informativos y exportaciones contables.
              </p>

              <div className="bg-white border border-slate-200/50 rounded-3xl overflow-hidden divide-y divide-slate-100">
                {[
                  { id: "es-MX", label: "Español (América Latina)", flag: "🇲🇽" },
                  { id: "en-US", label: "English (United States)", flag: "🇺🇸" },
                  { id: "pt-BR", label: "Português (Brasil)", flag: "🇧🇷" }
                ].map((item) => {
                  const isSelected = languageChoice === item.id;
                  return (
                    <div 
                      key={item.id}
                      onClick={() => {
                        setLanguageChoice(item.id);
                        toast.success(`Idioma cambiado a ${item.label}`, "Cambio Aplicado");
                      }}
                      className="flex items-center justify-between p-4.5 hover:bg-slate-50 transition cursor-pointer select-none"
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-xl shrink-0">{item.flag}</span>
                        <span className="text-sm font-bold text-slate-700">{item.label}</span>
                      </div>
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition ${
                        isSelected ? "border-[#0B53F4] bg-[#0B53F4]/10" : "border-slate-300"
                      }`}>
                        {isSelected && <div className="w-2.5 h-2.5 rounded-full bg-[#0B53F4]" />}
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="pt-4">
                <button
                  type="button"
                  onClick={() => setActiveModal(null)}
                  className="w-full py-4.5 bg-[#0B53F4] hover:bg-[#0747D1] text-white text-sm font-black rounded-2.5xl transition shadow-md shadow-[#0B53F4]/15 cursor-pointer text-center active:scale-98"
                >
                  Confirmar Idioma
                </button>
              </div>
            </div>
          )}

          {activeModal === "faq" && (
            <div className="space-y-4 text-left">
              <p className="text-xs text-slate-455 font-bold ml-1 mb-2">
                ¿Tienes dudas sobre los procesos fiscales o el timbrado automático del SAT? Consulta nuestro manual guiado inmediato.
              </p>

              <div className="space-y-3">
                {[
                  {
                    q: "¿Cómo se descargan automáticamente las facturas?",
                    a: "ZenTicket se conecta a las APIs privadas del SAT y de tus proveedores de forma cifrada mediante tokens seguros, leyendo tus CFDI emitidos y recibidos de inmediato cada vez que se emiten."
                  },
                  {
                    q: "¿El timbrado consume saldo secundario de timbrado?",
                    a: "No. Con ZenTicket tienes timbrados directos cubiertos integralmente en tus facturas periódicas de acuerdo a los límites autorizados en tu suscripción mensual."
                  },
                  {
                    q: "¿Qué sucede si un ticket de comercio falla en el reconocimiento?",
                    a: "Nuestra IA OCR inteligente cuenta con tolerancia y reintentos automáticos. Si un ticket es de baja calidad o tiene datos ambiguos, se enviará de inmediato al Buzón de Espera para un ajuste manual visual rápido."
                  },
                  {
                    q: "¿Es seguro resguardar mis sellos fiscales CSD?",
                    a: "Totalmente. Los Certificados de Sello Digital (CSD) y credenciales CIEC se almacenan y resguardan bajo encriptación de estándar bancario militar AES-256 en reposo, garantizando el máximo nivel de cumplimiento y confidencialidad."
                  }
                ].map((item, index) => {
                  const isOpen = openFaqIndex === index;
                  return (
                    <div 
                      key={index}
                      className="bg-white border border-slate-100 rounded-2.5xl p-4.5 shadow-5xs transition-all"
                    >
                      <button
                        type="button"
                        onClick={() => setOpenFaqIndex(isOpen ? -1 : index)}
                        className="w-full flex items-center justify-between text-left focus:outline-none bg-transparent border-none outline-none cursor-pointer"
                      >
                        <span className="text-xs font-black text-slate-800 pr-4">{item.q}</span>
                        <ChevronRight className={`w-4 h-4 text-slate-400 shrink-0 transition-transform ${isOpen ? "rotate-90 text-[#0B53F4]" : ""}`} />
                      </button>
                      
                      <AnimatePresence>
                        {isOpen && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1, marginTop: 12 }}
                            exit={{ height: 0, opacity: 0, marginTop: 0 }}
                            className="overflow-hidden"
                          >
                            <p className="text-[11.5px] text-slate-500 font-medium leading-relaxed border-t border-slate-50 pt-3">
                              {item.a}
                            </p>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  );
                })}
              </div>

              <div className="pt-4">
                <button
                  type="button"
                  onClick={() => setActiveModal(null)}
                  className="w-full py-4 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-black rounded-2xl transition cursor-pointer text-center"
                >
                  Cerrar Glosario
                </button>
              </div>
            </div>
          )}

          {activeModal === "tutorial" && (
            <div className="space-y-6 text-center">
              {/* Slides Panel */}
              <div className="py-4.5 px-3 flex flex-col items-center justify-center">
                {tutorialStep === 0 && (
                  <motion.div 
                    key="step0"
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="space-y-4"
                  >
                    <div className="w-18 h-18 rounded-3xl bg-[#EBF1FF] text-[#0B53F4] flex items-center justify-center mx-auto shadow-md shadow-[#0B53F4]/10">
                      <Plus className="w-9 h-9 stroke-[2.2]" />
                    </div>
                    <h3 className="text-lg font-black text-slate-850">1. Sube tus Tickets</h3>
                    <p className="text-xs text-slate-450 font-bold max-w-xs mx-auto leading-relaxed">
                      Carga una foto de tu ticket de compra o arrastra el archivo. Nuestro procesador OCR leerá automáticamente la fecha, emisor, RFC e importe desglosado en un par de segundos.
                    </p>
                  </motion.div>
                )}

                {tutorialStep === 1 && (
                  <motion.div 
                    key="step1"
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="space-y-4"
                  >
                    <div className="w-18 h-18 rounded-3xl bg-[#EBF1FF] text-[#0B53F4] flex items-center justify-center mx-auto shadow-md shadow-[#0B53F4]/10">
                      <Sliders className="w-8 h-8 stroke-[2.2]" />
                    </div>
                    <h3 className="text-lg font-black text-slate-850">2. Activa tus Conectores</h3>
                    <p className="text-xs text-slate-450 font-bold max-w-xs mx-auto leading-relaxed">
                      Vincula ZenTicket con tus servicios recurrentes preferidos (Uber, Didi, Starbucks) para que descargue tus CFDI sin que tengas que acceder a cada portal uno a uno.
                    </p>
                  </motion.div>
                )}

                {tutorialStep === 2 && (
                  <motion.div 
                    key="step2"
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="space-y-4"
                  >
                    <div className="w-18 h-18 rounded-3xl bg-[#EBF1FF] text-[#0B53F4] flex items-center justify-center mx-auto shadow-md shadow-[#0B53F4]/10">
                      <Sparkles className="w-8 h-8 fill-[#0B53F4]/10 stroke-[2.2]" />
                    </div>
                    <h3 className="text-lg font-black text-slate-855">3. Genera tus CFDI SAT</h3>
                    <p className="text-xs text-slate-450 font-bold max-w-xs mx-auto leading-relaxed">
                      Una vez validados, ZenTicket timbra tus CFDIs oficiales bajo las últimas normativas fiscales de Facturación 4.0 del SAT y los deposita directamente en tu nube.
                    </p>
                  </motion.div>
                )}
              </div>

              {/* Stepper Dots Indicator */}
              <div className="flex items-center justify-center gap-1.5">
                {[0, 1, 2].map((dot) => (
                  <div 
                    key={dot}
                    className={`h-2 rounded-full transition-all duration-200 ${
                      tutorialStep === dot ? "w-6 bg-[#0B53F4]" : "w-2 bg-slate-200"
                    }`}
                  />
                ))}
              </div>

              {/* Stepper Buttons */}
              <div className="flex gap-3 pt-3 border-t border-slate-100">
                {tutorialStep > 0 ? (
                  <button
                    type="button"
                    onClick={() => setTutorialStep(tutorialStep - 1)}
                    className="flex-1 py-3.5 bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-black rounded-xl transition cursor-pointer"
                  >
                    Anterior
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => setActiveModal(null)}
                    className="flex-1 py-3.5 bg-white border border-slate-200 text-slate-500 hover:bg-slate-55 text-xs font-black rounded-xl transition cursor-pointer"
                  >
                    Omitir
                  </button>
                )}

                {tutorialStep < 2 ? (
                  <button
                    type="button"
                    onClick={() => setTutorialStep(tutorialStep + 1)}
                    className="flex-1 py-3.5 bg-[#0B53F4] text-white text-xs font-black rounded-xl transition hover:bg-[#0747D1] cursor-pointer"
                  >
                    Siguiente
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      setActiveModal(null);
                      toast.success("¡Bienvenido al sistema! Ahora estás capacitado para utilizar ZenTicket.", "Guía Completada");
                    }}
                    className="flex-1 py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black rounded-xl transition cursor-pointer shadow-md shadow-emerald-500/10"
                  >
                    ¡Comenzar!
                  </button>
                )}
              </div>
            </div>
          )}

          {activeModal === "soporte" && (
            <div className="space-y-4 text-left">
              <p className="text-xs text-slate-450 font-bold ml-1 mb-2">
                Si tienes problemas con la autenticación CIEC SAT, facturas rechazadas o descargas, envía un reporte directo a nuestros ingenieros de guardia.
              </p>

              <div className="space-y-3.5">
                {/* Subject Selection */}
                <div className="space-y-1">
                  <label className="block text-[10.5px] font-bold text-slate-400 uppercase tracking-widest ml-1">
                    Categoría del Incidente
                  </label>
                  <select 
                    value={supportSubject}
                    onChange={(e) => setSupportSubject(e.target.value)}
                    className="w-full text-xs font-bold bg-white border border-slate-200/80 focus:border-[#0B53F4] focus:ring-1 focus:ring-[#0B53F4]/20 rounded-xl px-3.5 py-3 text-slate-800 focus:outline-none transition-all cursor-pointer"
                  >
                    <option value="error_conector">Error con Conectores (Didi/Uber/Starbucks)</option>
                    <option value="duda_sat">Problema de Timbrado SAT Facturación 4.0</option>
                    <option value="billing">Dudas de Facturación y Planes de Pago</option>
                    <option value="ocr_problem">Error de Escáneo / Lectura OCR Ticket</option>
                  </select>
                </div>

                {/* Correo Electrónico de contacto */}
                <div className="space-y-1">
                  <label className="block text-[10.5px] font-bold text-slate-400 uppercase tracking-widest ml-1">
                    Correo Electrónico de Respuesta
                  </label>
                  <input 
                    type="email"
                    value={supportEmail}
                    onChange={(e) => setSupportEmail(e.target.value)}
                    placeholder="tu-correo@empresa.com"
                    className="w-full text-xs font-medium bg-white border border-slate-200/80 focus:border-[#0B53F4] focus:ring-1 focus:ring-[#0B53F4]/20 rounded-xl px-3.5 py-3 text-slate-800 focus:outline-none transition-all placeholder-slate-400"
                  />
                </div>

                {/* Text area message description */}
                <div className="space-y-1">
                  <label className="block text-[10.5px] font-bold text-slate-400 uppercase tracking-widest ml-1">
                    Descripción Detallada
                  </label>
                  <textarea 
                    rows={4}
                    value={supportMessage}
                    onChange={(e) => setSupportMessage(e.target.value)}
                    placeholder="Describe qué conector falló o el folio del ticket con error..."
                    className="w-full text-xs font-medium bg-white border border-slate-200/80 focus:border-[#0B53F4] focus:ring-1 focus:ring-[#0B53F4]/20 rounded-xl px-4 py-3 text-slate-800 focus:outline-none transition-all placeholder-slate-400 resize-none"
                  />
                </div>
              </div>

              <div className="pt-3">
                <button
                  type="button"
                  onClick={() => {
                    if (!supportMessage.trim()) {
                      toast.error("Por favor complete la descripción de su incidente técnico.", "Falta Información");
                      return;
                    }
                    setActiveModal(null);
                    toast.success("Tu ticket de soporte #FBT-9428 se ha emitido correctamente. Nos pondremos en contacto contigo en un plazo menor a 15 minutos.", "Solicitud Registrada");
                  }}
                  className="w-full py-4 bg-[#0B53F4] hover:bg-[#0747D1] text-white text-xs font-black rounded-2xl transition flex items-center justify-center gap-1.5 shadow-md shadow-[#0B53F4]/10 cursor-pointer text-center active:scale-98"
                >
                  <MessageSquare className="w-4 h-4 text-white" />
                  <span>Enviar a Soporte Técnico</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div id="account-tab-dashboard" className="max-w-md mx-auto space-y-6 font-sans text-left animate-fade-in_50 pb-8 select-none">
      
      {/* 1. Profile card with larger rounded border andJD Avatar */}
      <div className="bg-white border border-slate-200/50 rounded-3xl p-5 shadow-[0_4px_20px_rgba(15,23,42,0.02)] flex items-center justify-between font-sans">
        <div className="flex items-center gap-4">
          {/* Blue initials circular emblem */}
          <div className="w-14 h-14 rounded-full bg-[#0B53F4] flex items-center justify-center text-white text-lg font-bold font-sans tracking-wide shrink-0 shadow-sm shadow-[#0B53F4]/15">
            {userInitials}
          </div>
          <div className="leading-tight text-left">
            <h4 className="text-base font-black text-slate-800">
              {userFullName}
            </h4>
            <p className="text-xs text-slate-400 mt-1">
              {userDisplayEmail}
            </p>
          </div>
        </div>

        {/* Edit Button styled Indigo like screenshot */}
        <button
          onClick={() => setIsEditingFiscal(true)}
          className="bg-[#ebf1ff] hover:bg-[#dee8ff] text-[#0B53F4] text-xs font-bold px-4 py-2 rounded-xl transition active:scale-[0.98] cursor-pointer"
        >
          Editar
        </button>
      </div>

      {/* 2. SUSCRIPCIÓN Header & Detail Panel */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between select-none">
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
            Suscripción
          </span>
        </div>

        <div className="bg-white border border-slate-200/50 rounded-3xl p-5 shadow-[0_4px_20px_rgba(15,23,42,0.02)] space-y-4">
          <div className="flex items-start justify-between">
            <div className="text-left">
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-slate-800">Pro Automation</span>
                <span className="bg-[#ebf1ff] text-[#0B53F4] text-[9px] uppercase font-black px-2 py-0.5 rounded-md tracking-wider">
                  Activo
                </span>
              </div>
              <p className="text-[11px] text-slate-400 mt-1">
                Facturado mensual • Prox: 24 Oct
              </p>
            </div>
            {/* Amount details */}
            <div className="text-right flex items-baseline gap-1">
              <span className="text-lg font-black text-slate-800">$580</span>
              <span className="text-[10px] text-slate-400 font-bold">/mes<br/><span className="text-[8px] tracking-wide block text-right">(MXN)</span></span>
            </div>
          </div>

          {/* Usage with progress bar */}
          <div className="space-y-2 pt-1 border-t border-slate-100">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400 font-bold">Uso Mensual</span>
              <span className="text-[#0B53F4] font-mono font-bold">840 / 1,000 Facturas</span>
            </div>
            <div className="w-full bg-[#EBF1FF] rounded-full h-2 overflow-hidden">
              <div 
                className="bg-[#0B53F4] h-full rounded-full transition-all duration-300"
                style={{ width: "84%" }}
              />
            </div>
          </div>

          {/* Action button */}
          <button 
            onClick={() => {
              setActiveModal("plan");
            }}
            className="w-full bg-[#0B53F4] hover:bg-[#0747D1] text-white text-xs font-black py-3.5 rounded-2.5xl transition flex items-center justify-center gap-1.5 shadow-md shadow-[#0B53F4]/10 cursor-pointer active:scale-[0.98]"
          >
            <span>Gestionar Plan</span>
            <span>→</span>
          </button>
        </div>
      </div>

      {/* 3. MÉTODOS DE PAGO Header & Custom List */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
            Métodos de pago
          </span>
          <button 
            onClick={() => {
              setIsEditingFiscal(true);
            }}
            className="text-[10px] font-black text-[#0B53F4] hover:underline cursor-pointer bg-transparent border-none outline-none"
          >
            + Agregar
          </button>
        </div>

        <div className="bg-white border border-slate-200/50 rounded-3xl overflow-hidden divide-y divide-slate-100 shadow-[0_4px_20px_rgba(15,23,42,0.02)]">
          {/* Card Item 1: VISA */}
          <div className="flex items-center justify-between p-4.5 hover:bg-slate-50/40 transition">
            <div className="flex items-center gap-3.5">
              {/* Premium Black rectangular card logo block */}
              <div className="w-12 h-8 bg-[#010915] rounded-lg flex items-center justify-center text-[10px] text-white font-serif font-extrabold italic tracking-wider select-none shadow-sm">
                VISA
              </div>
              <div className="text-left leading-none">
                <span className="text-sm font-bold text-slate-800 block">•••• 4242</span>
                <span className="text-[11px] text-slate-400 mt-1.5 block">Vence 12/26</span>
              </div>
            </div>
            {/* Predeterminado Badge */}
            <span className="bg-[#EBF1FF] border border-[#DDECFF] text-[#0B53F4] text-[8px] uppercase font-black px-2 py-1 rounded-md tracking-wider leading-none">
              Predeterminado
            </span>
          </div>

          {/* Card Item 2: Mastercard */}
          <div className="flex items-center justify-between p-4.5 hover:bg-slate-50/40 transition">
            <div className="flex items-center gap-3.5">
              {/* Premium Red circular double bubble graphic card box */}
              <div className="w-12 h-8 bg-rose-600 rounded-lg flex items-center justify-center text-xs text-white font-sans font-black italic select-none shadow-sm relative overflow-hidden">
                <div className="absolute w-6 h-6 rounded-full bg-amber-500/85 -right-1.5 -bottom-1" />
                <span className="relative z-10 text-[9px] uppercase tracking-tighter">MC</span>
              </div>
              <div className="text-left leading-none">
                <span className="text-sm font-bold text-slate-800 block">•••• 8812</span>
                <span className="text-[11px] text-slate-400 mt-1.5 block">Vence 08/25</span>
              </div>
            </div>
            {/* Options vertical dot */}
            <button className="text-slate-400 hover:text-slate-600 transition p-1.5 rounded-lg bg-transparent border-none outline-none cursor-pointer">
              <MoreVertical className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* 4. CONFIGURACIÓN Header & Options List with interactive components */}
      <div className="space-y-2.5">
        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">
          Configuración
        </span>

        <div className="bg-white border border-slate-200/50 rounded-3xl overflow-hidden divide-y divide-slate-100 shadow-[0_4px_20px_rgba(15,23,42,0.02)]">
          
          {/* Item #1: Apariencia */}
          <div 
            onClick={() => setActiveModal("apariencia")}
            className="flex items-center justify-between p-4.5 hover:bg-slate-50 transition cursor-pointer"
          >
            <div className="flex items-center gap-3.5">
              <div className="w-9 h-9 rounded-full bg-[#ebf1ff] flex items-center justify-center text-[#0B53F4]">
                <Palette className="w-5 h-5 stroke-[2]" />
              </div>
              <span className="text-sm font-bold text-slate-800">Apariencia</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-xs text-slate-400 font-bold">
                {themeChoice === "light" ? "Claro" : themeChoice === "dark" ? "Oscuro" : "Sistema"}
              </span>
              <ChevronRight className="w-4 h-4 text-slate-350" />
            </div>
          </div>

          {/* Item #2: Notificaciones */}
          <div 
            onClick={() => setActiveModal("notificaciones")}
            className="flex items-center justify-between p-4.5 hover:bg-slate-50 transition cursor-pointer"
          >
            <div className="flex items-center gap-3.5">
              <div className="w-9 h-9 rounded-full bg-[#ebf1ff] flex items-center justify-center text-[#0B53F4]">
                <Bell className="w-5 h-5 stroke-[2]" />
              </div>
              <span className="text-sm font-bold text-slate-800">Notificaciones</span>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-350" />
          </div>

          {/* Item #3: Idioma */}
          <div 
            onClick={() => setActiveModal("idioma")}
            className="flex items-center justify-between p-4.5 hover:bg-slate-50 transition cursor-pointer"
          >
            <div className="flex items-center gap-3.5">
              <div className="w-9 h-9 rounded-full bg-[#ebf1ff] flex items-center justify-center text-[#0B53F4]">
                <Globe className="w-5 h-5 stroke-[2]" />
              </div>
              <span className="text-sm font-bold text-slate-800">Idioma</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-xs text-slate-400 font-bold">
                {languageChoice === "es-MX" ? "Español (MX)" : languageChoice === "en-US" ? "English (US)" : "Português (BR)"}
              </span>
              <ChevronRight className="w-4 h-4 text-slate-350" />
            </div>
          </div>

          {/* Item #3.5: Inteligencia Artificial (Gemini) */}
          <div 
            onClick={() => setIsEditingFiscal(true)}
            className="flex items-center justify-between p-4.5 hover:bg-violet-50/50 transition cursor-pointer bg-violet-50/10"
          >
            <div className="flex items-center gap-3.5">
              <div className="w-9 h-9 rounded-full bg-violet-100 flex items-center justify-center text-violet-600">
                <Sparkles className="w-5 h-5 stroke-[2] animate-pulse" />
              </div>
              <div className="text-left leading-tight">
                <span className="text-sm font-bold text-slate-800 block">Optimización IA (Gemini)</span>
                <span className="text-[10px] text-slate-400 font-semibold block mt-0.5">
                  {personalGeminiKey ? "✓ Conectado con tu Api Key personal" : "Usa tu cuenta de Gemini para tickets complejos"}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-1.5">
              {personalGeminiKey ? (
                <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md">ACTIVO</span>
              ) : (
                <span className="text-[10px] font-bold text-slate-400">CONFIGURAR</span>
              )}
              <ChevronRight className="w-4 h-4 text-violet-500" />
            </div>
          </div>

          {/* Item #4: Seguridad y Privacidad -> triggers editable Form! */}
          <div 
            onClick={() => setIsEditingFiscal(true)}
            className="flex items-center justify-between p-4.5 hover:bg-slate-55 transition cursor-pointer"
          >
            <div className="flex items-center gap-3.5">
              <div className="w-9 h-9 rounded-full bg-[#ebf1ff] flex items-center justify-center text-[#0B53F4]">
                <Shield className="w-5 h-5 stroke-[2]" />
              </div>
              <div className="text-left leading-tight">
                <span className="text-sm font-bold text-slate-800 block">Datos Fiscales (SAT)</span>
                <span className="text-[10px] text-slate-400 font-semibold block mt-0.5">Seguridad y timbrado CFDI v4.0</span>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-[#0B53F4]" />
          </div>
        </div>
      </div>

      {/* 5. AYUDA Header & Columns */}
      <div className="space-y-2.5">
        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">
          Ayuda
        </span>

        <div className="grid grid-cols-3 gap-3">
          {/* FAQ */}
          <div 
            onClick={() => { setActiveModal("faq"); setOpenFaqIndex(-1); }}
            className="bg-white border border-slate-200/50 rounded-2.5xl p-4 flex flex-col items-center justify-center gap-3 hover:bg-slate-50 transition text-center shadow-[0_4px_20px_rgba(15,23,42,0.02)] py-5 cursor-pointer active:scale-95"
          >
            <div className="w-10 h-10 rounded-full bg-[#ebf1ff] flex items-center justify-center text-[#0B53F4]">
              <HelpCircle className="w-5.5 h-5.5 stroke-[2.5]" />
            </div>
            <span className="text-xs font-black text-slate-800 tracking-tight">FAQ</span>
          </div>

          {/* Tutoriales */}
          <div 
            onClick={() => { setActiveModal("tutorial"); setTutorialStep(0); }}
            className="bg-white border border-slate-200/50 rounded-2.5xl p-4 flex flex-col items-center justify-center gap-3 hover:bg-slate-50 transition text-center shadow-[0_4px_20px_rgba(15,23,42,0.02)] py-5 cursor-pointer active:scale-95"
          >
            <div className="w-10 h-10 rounded-full bg-[#ebf1ff] flex items-center justify-center text-[#0B53F4]">
              <BookOpen className="w-5.5 h-5.5 stroke-[2.5]" />
            </div>
            <span className="text-xs font-black text-slate-800 tracking-tight">Tutoriales</span>
          </div>

          {/* Soporte */}
          <div 
            onClick={() => { setActiveModal("soporte"); setSupportSubject("error_conector"); setSupportMessage(""); setSupportEmail(currentUser?.email || "julian.d@zenticket.mx"); }}
            className="bg-white border border-slate-200/50 rounded-2.5xl p-4 flex flex-col items-center justify-center gap-3 hover:bg-slate-50 transition text-center shadow-[0_4px_20px_rgba(15,23,42,0.02)] py-5 cursor-pointer active:scale-95"
          >
            <div className="w-10 h-10 rounded-full bg-[#ebf1ff] flex items-center justify-center text-[#0B53F4]">
              <MessageSquare className="w-5.5 h-5.5 stroke-[2.5]" />
            </div>
            <span className="text-xs font-black text-slate-800 tracking-tight">Soporte</span>
          </div>
        </div>
      </div>

      {/* 6. Cerrar Sesión & Eliminar Cuenta buttons */}
      <div className="space-y-4 pt-4">
        {/* White prominent border Cerrar Sesión */}
        <button
          onClick={handleLogout}
          className="w-full py-4 bg-white hover:bg-slate-50 border border-slate-200/60 text-slate-700 font-bold text-sm rounded-2xl flex items-center justify-center gap-2 transition duration-150 active:scale-[0.98] shadow-xs cursor-pointer"
        >
          <LogOut className="w-4 h-4 text-slate-500" />
          <span>Cerrar Sesión</span>
        </button>

        {/* Gray/Red small trash Eliminar Cuenta button */}
        <button
          type="button"
          onClick={() => {
            alert("Esta acción eliminará de forma irreversible todo tu historial fiscal, CFDI timbrados e información confidencial. Contacta a soporte técnico para confirmar la desactivación permanente.");
          }}
          className="w-full flex items-center justify-center gap-1.5 py-2 text-rose-500 hover:text-rose-600 font-bold text-xs bg-transparent border-none outline-none cursor-pointer tracking-wide font-sans"
        >
          <Trash2 className="w-3.5 h-3.5 shrink-0" />
          <span>Eliminar Cuenta</span>
        </button>
      </div>

    </div>
  );
}
