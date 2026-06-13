import React, { useState, useEffect } from "react";
import { FiscalProfile, PaymentCard } from "../types";
import { 
  User, Mail, FileText, CreditCard, TrendingUp, HardDrive, Crown,
  Shield, Globe, HelpCircle, BookOpen, MessageSquare, Settings,
  ChevronRight, ChevronLeft, Plus, Trash2, LogOut, Sun, Moon,
  Monitor, Pencil, ShieldCheck, Check, CheckCircle, Wifi, Sparkles,
  Upload, Save, X, Phone, UserCheck, Bell
} from "lucide-react";
import { auth } from "../firebase";
import { signOut } from "firebase/auth";
import { useToast } from "./Toast";

interface ProfileFormProps {
  initialProfile: FiscalProfile | null;
  onSave: (profile: FiscalProfile) => Promise<void>;
  isSaving: boolean;
  currentUserEmail?: string | null;
  onTabChange?: (tab: string) => void;
}

export default function ProfileForm({ 
  initialProfile, 
  onSave, 
  isSaving,
  currentUserEmail,
  onTabChange
}: ProfileFormProps) {
  const toast = useToast();

  // --- 1. CORE FIRESTORE / PROFILE STATE REPRESENTATION ---
  const [rfc, setRfc] = useState(initialProfile?.rfc || "XAXX010101000");
  const [razonSocial, setRazonSocial] = useState(initialProfile?.razonSocial || "Luis Martínez Studio");
  const [regimenFiscal, setRegimenFiscal] = useState(initialProfile?.regimenFiscal || "622 – Personas Físicas con Actividades Empresariales");
  const [codigoPostal, setCodigoPostal] = useState(initialProfile?.codigoPostal || "01000");
  const [usoCFDI, setUsoCFDI] = useState(initialProfile?.usoCFDI || "G03 – Gastos en general");
  const [personalGeminiKey, setPersonalGeminiKey] = useState(initialProfile?.personalGeminiKey || "");
  const [userName, setUserName] = useState("Luis Martínez");
  const [userEmail, setUserEmail] = useState(currentUserEmail || initialProfile?.userId || "luis.martinez@email.com");
  
  // Usage summary stats configuration (editable too!)
  const [ticketsProcessedCount, setTicketsProcessedCount] = useState(128);
  const [monthlyExpensesAmount, setMonthlyExpensesAmount] = useState("$18,560 MXN");
  const [planUsagePercentage, setPlanUsagePercentage] = useState("92%");
  const [storageUsedBytes, setStorageUsedBytes] = useState("2.4 GB");

  // Keep state matching backend profile if it changes
  useEffect(() => {
    if (initialProfile) {
      if (initialProfile.rfc) setRfc(initialProfile.rfc);
      if (initialProfile.razonSocial) setRazonSocial(initialProfile.razonSocial);
      if (initialProfile.regimenFiscal) setRegimenFiscal(initialProfile.regimenFiscal);
      if (initialProfile.codigoPostal) setCodigoPostal(initialProfile.codigoPostal);
      if (initialProfile.usoCFDI) setUsoCFDI(initialProfile.usoCFDI);
      if (initialProfile.personalGeminiKey) setPersonalGeminiKey(initialProfile.personalGeminiKey);
    }
  }, [initialProfile]);

  // --- 2. ACTIVE VIEW MODE & INTERACTION LAYERS ---
  // Sub-tabs corresponding to the 4 mockups shown in the user's design reference when on mobile / single mockup layout
  // 0: Perfil, 1: Suscripción, 2: Pagos, 3: Configuración
  const [activeSubTab, setActiveSubTab] = useState<number>(0);
  
  // Real-time custom-styled slider state for Credit Cards (Pagos screen)
  const [activeCardIndex, setActiveCardIndex] = useState(0);
  const mockCards = [
    { brand: "VISA", last4: "4242", expiry: "08/28", holder: userName, color: "from-[#0F56F1] to-[#1E3A8A]", principal: true },
    { brand: "MASTERCARD", last4: "8812", expiry: "12/26", holder: userName, color: "from-[#1E1B4B] to-[#312E81]", principal: false },
    { brand: "AMEX", last4: "1004", expiry: "05/27", holder: userName, color: "from-[#115E59] to-[#134E5A]", principal: false }
  ];

  // Appearance Choice setup synced with the real layout theme
  const [customTheme, setCustomTheme] = useState<"light" | "dark" | "system">(
    () => (localStorage.getItem("zenticket_theme") as "light" | "dark" | "system") || "light"
  );

  const applyAppTheme = (choice: "light" | "dark" | "system") => {
    setCustomTheme(choice);
    localStorage.setItem("zenticket_theme", choice);
    
    let active = choice;
    if (choice === "system") {
      active = "light"; // Default clean presentation light theme
    }
    
    document.documentElement.setAttribute("data-theme", active);
    if (active === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
    toast.success(`Apariencia fijada en modo ${choice === "light" ? "Claro" : choice === "dark" ? "Oscuro" : "Sistema"}`, "Ajuste de Apariencia");
  };

  // Notificación local toggles
  const [notifTicket, setNotifTicket] = useState(true);
  const [notifFactura, setNotifFactura] = useState(true);
  const [notifRenovacion, setNotifRenovacion] = useState(true);
  const [notifPush, setNotifPush] = useState(false);

  // Form overlay states (native drawers inside mobile frames)
  const [showEditProfileModal, setShowEditProfileModal] = useState(false);
  const [showEditFiscalModal, setShowEditFiscalModal] = useState(false);
  const [showAddCardModal, setShowAddCardModal] = useState(false);

  // Add Card State
  const [newCardNum, setNewCardNum] = useState("");
  const [newCardExp, setNewCardExp] = useState("08/28");
  const [newCardBrand, setNewCardBrand] = useState<"VISA" | "MASTERCARD" | "AMEX">("VISA");

  // Handle Logout
  const handleSignOut = async () => {
    try {
      await signOut(auth);
      toast.success("Has cerrado sesión de forma segura.", "Sesión Cerrada");
    } catch (err) {
      console.error("Error signing out: ", err);
      toast.error("No se pudo cerrar la sesión.");
    }
  };

  // Handle Save
  const handleSaveProfileChanges = async (
    customName?: string, 
    customEmail?: string,
    customRfc?: string, 
    customRazonSocial?: string, 
    customRegimen?: string, 
    customCP?: string, 
    customUso?: string
  ) => {
    try {
      const finalRfc = (customRfc || rfc).trim().toUpperCase();
      const finalRazonSocial = (customRazonSocial || razonSocial).trim();
      const finalRegimen = (customRegimen || regimenFiscal).trim();
      const finalCP = (customCP || codigoPostal).trim();
      const finalUso = (customUso || usoCFDI).trim();

      await onSave({
        userId: initialProfile?.userId || "guest",
        rfc: finalRfc,
        razonSocial: finalRazonSocial,
        regimenFiscal: finalRegimen,
        codigoPostal: finalCP,
        usoCFDI: finalUso,
        createdAt: initialProfile?.createdAt || new Date().toISOString(),
        personalGeminiKey: personalGeminiKey.trim(),
        plan: initialProfile?.plan || "personal"
      });

      if (customName) setUserName(customName);
      if (customEmail) setUserEmail(customEmail);

      toast.success("Datos guardados en Firestore correctamente.", "Sincronización Exitosa");
      setShowEditProfileModal(false);
      setShowEditFiscalModal(false);
    } catch (err: any) {
      toast.error(err.message || "Fallo al guardar perfil en la nube.");
    }
  };

  // INNER TEMPLATE FUNCTIONS TO RENDER CUSTOM SCREENS INSIDE A SPECIFIC PHONEMODEL
  const renderHeader = (title: string, subtitle: string) => {
    return (
      <div className="relative pt-3 pb-8 px-5 text-left z-20">
        {/* Deep Royal Blue Backing Gradient */}
        <div className="absolute top-0 left-0 right-0 h-[145px] bg-gradient-to-b from-[#0B3EE4] via-[#05229C] to-[#01144F] rounded-b-[32px] -z-10 shadow-xs" />

        {/* Brand Bar */}
        <div className="flex h-11 items-center justify-between mb-4">
          <div className="flex items-center gap-1.5 text-white">
            <svg viewBox="0 0 100 100" className="w-[22px] h-[22px] text-white fill-current">
              <path d="M50 20C42 35 48 58 50 64C52 58 58 35 50 20Z" opacity="0.9" />
              <path d="M46 64C41 58 26 48 15 50C28 55 42 58 46 64Z" opacity="0.75" />
              <path d="M54 64C59 58 74 48 85 50C72 55 58 58 54 64Z" opacity="0.75" />
            </svg>
            <span className="text-[17.5px] font-black tracking-tight text-white select-none font-sans">
              ZenTicket
            </span>
          </div>
          <div className="flex items-center gap-2">
            <img 
              src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=150" 
              alt="Luis Martínez Portrait" 
              className="w-7 h-7 rounded-full border border-white/60 shadow-xs object-cover cursor-pointer hover:scale-105 transition"
              referrerPolicy="no-referrer"
              onClick={() => setShowEditProfileModal(true)}
            />
            <div 
              onClick={() => toast.info("Tienes 3 nuevas alertas de timbrado del SAT.", "Notificaciones")}
              className="relative w-7 h-7 bg-white/15 backdrop-blur-md rounded-full flex items-center justify-center text-white cursor-pointer hover:bg-white/25 transition shadow-3xs"
            >
              <Bell className="w-3.5 h-3.5 stroke-[2.2]" />
              <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-rose-500 text-white rounded-full flex items-center justify-center text-[8px] font-extrabold shadow-sm">3</span>
            </div>
          </div>
        </div>

        {/* Title Details inside blue panel */}
        <div className="pt-1.5 leading-tight select-none">
          <h2 className="text-[21px] font-black text-white tracking-tight leading-tight">{title}</h2>
          <p className="text-[10.5px] text-blue-100/80 font-semibold mt-1 leading-snug">{subtitle}</p>
        </div>
      </div>
    );
  };

  // --- SUBVIEW 1: PERFIL ---
  const renderPerfilView = () => {
    return (
      <div className="flex-1 flex flex-col bg-[#F4F7FC] h-full relative text-left">
        {renderHeader("Mi Perfil", "Gestiona tu información y preferencias.")}

        {/* SCROLLABLE VIEW CONTAINER */}
        <div className="flex-1 overflow-y-auto px-5 pb-6 -mt-3.5 relative z-30 scrollbar-none space-y-4">
          
          {/* Main User Card */}
          <div className="bg-white border border-slate-100 rounded-3xl p-5 shadow-sm text-center relative select-none">
            {/* Avatar circle */}
            <div className="relative w-20 h-20 rounded-full border-[3px] border-white ring-4 ring-[#0B53F4]/15 overflow-hidden mx-auto shadow-xs">
              <img 
                src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200" 
                alt="Portrait" 
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </div>

            {/* User display details */}
            <div className="mt-3.5 leading-snug">
              <h3 className="text-base font-extrabold text-slate-800">{userName}</h3>
              <p className="text-[11px] text-slate-400 mt-1 font-semibold flex items-center justify-center gap-1 select-all hover:text-[#0B53F4] transition cursor-pointer" onClick={() => setShowEditProfileModal(true)}>
                <span>{userEmail}</span>
                <ChevronRight className="w-3 h-3 text-slate-400 shrink-0" />
              </p>
            </div>

            {/* Plan Badge */}
            <div className="mt-3 inline-block bg-[#0B53F4]/8 text-[#0B53F4] text-[10px] font-black uppercase tracking-widest px-4 py-1.5 rounded-full select-none leading-none">
              Cuenta Pro
            </div>
          </div>

          {/* Edit Button */}
          <button 
            onClick={() => setShowEditProfileModal(true)}
            className="w-full bg-[#0B53F4] hover:bg-[#0747D1] text-white py-3.5 rounded-2xl font-extrabold text-xs flex items-center justify-center gap-2 transition active:scale-[0.98] cursor-pointer shadow-md shadow-[#0B53F4]/10 select-none"
          >
            <Pencil className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>Editar perfil</span>
          </button>

          {/* Usage Metrics label & grid */}
          <div className="space-y-2 pt-1 select-none">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1 block">Resumen de uso</span>
            
            <div className="grid grid-cols-2 gap-3">
              {/* Box 1 */}
              <div className="bg-white border border-slate-100 rounded-2.5xl p-4 shadow-3xs flex flex-col gap-2.5 text-left leading-tight">
                <div className="w-8 h-8 rounded-full bg-[#0B53F4]/10 text-[#0B53F4] flex items-center justify-center shrink-0">
                  <FileText className="w-4 h-4 stroke-[2.4]" />
                </div>
                <div>
                  <span className="text-base font-extrabold text-slate-800 block">{ticketsProcessedCount}</span>
                  <span className="text-[9.5px] text-slate-400 font-semibold block mt-0.5 whitespace-nowrap">Tickets procesados</span>
                </div>
              </div>

              {/* Box 2 */}
              <div className="bg-white border border-slate-100 rounded-2.5xl p-4 shadow-3xs flex flex-col gap-2.5 text-left leading-tight">
                <div className="w-8 h-8 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                  <CreditCard className="w-4 h-4 stroke-[2.4]" />
                </div>
                <div>
                  <span className="text-base font-extrabold text-slate-800 block truncate">{monthlyExpensesAmount}</span>
                  <span className="text-[9.5px] text-slate-400 font-semibold block mt-0.5 whitespace-nowrap">Gastos del mes</span>
                </div>
              </div>

              {/* Box 3 */}
              <div className="bg-white border border-slate-100 rounded-2.5xl p-4 shadow-3xs flex flex-col gap-2.5 text-left leading-tight">
                <div className="w-8 h-8 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
                  <TrendingUp className="w-4 h-4 stroke-[2.4]" />
                </div>
                <div>
                  <span className="text-base font-extrabold text-slate-800 block">{planUsagePercentage}</span>
                  <span className="text-[9.5px] text-slate-400 font-semibold block mt-0.5 whitespace-nowrap">Uso del plan</span>
                </div>
              </div>

              {/* Box 4 */}
              <div className="bg-white border border-slate-100 rounded-2.5xl p-4 shadow-3xs flex flex-col gap-2.5 text-left leading-tight">
                <div className="w-8 h-8 rounded-full bg-indigo-50 text-indigo-500 flex items-center justify-center shrink-0">
                  <HardDrive className="w-4 h-4 stroke-[2.4]" />
                </div>
                <div>
                  <span className="text-base font-extrabold text-slate-800 block">{storageUsedBytes}</span>
                  <span className="text-[9.5px] text-slate-400 font-semibold block mt-0.5 whitespace-nowrap">Almacenamiento</span>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    );
  };

  // --- SUBVIEW 2: SUSCRIPCIÓN ---
  const renderSuscripcionView = () => {
    return (
      <div className="flex-1 flex flex-col bg-[#F4F7FC] h-full relative text-left">
        {renderHeader("Suscripción", "Administra tu plan y beneficios.")}

        <div className="flex-1 overflow-y-auto px-5 pb-6 -mt-3.5 relative z-30 scrollbar-none space-y-4">
          
          {/* Blue Pro Card */}
          <div className="bg-[#0B53F4] text-white rounded-3xl p-5 shadow-md relative overflow-hidden select-none flex flex-col justify-between">
            {/* Background mesh glow */}
            <div className="absolute -top-12 -right-12 w-28 h-28 bg-[#ffffff15] rounded-full blur-xl pointer-events-none" />
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <Crown className="w-5 h-5 text-amber-400 fill-amber-400 stroke-none" />
                <span className="font-extrabold text-xs uppercase tracking-wider">Pro Automation</span>
              </div>
              <span className="bg-[#10B981] text-white text-[9.5px] uppercase font-black px-2.5 py-0.5 rounded-full flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
                Activo
              </span>
            </div>

            <div className="pt-3 pb-1 leading-none">
              <h3 className="text-2xl font-black font-sans">$580 <span className="text-xs font-medium text-blue-100">MXN / mes</span></h3>
              <p className="text-[10px] opacity-75 mt-1 font-semibold">Renovación: 15 junio 2024</p>
            </div>

            {/* Ticket Progress Meter */}
            <div className="space-y-1.5 pt-3 border-t border-white/10 mt-2">
              <div className="flex justify-between text-[10px] font-bold opacity-90 leading-tight">
                <span>840 de 1,000 tickets utilizados</span>
                <span>84%</span>
              </div>
              <div className="w-full bg-white/20 rounded-full h-1.5 overflow-hidden">
                <div className="bg-white h-full transition-all duration-500" style={{ width: "84%" }} />
              </div>
            </div>
          </div>

          {/* Options Grid */}
          <div className="grid grid-cols-2 gap-3 select-none">
            {/* Sub-Item 1 */}
            <div 
              onClick={() => toast.info("Beneficios Pro: Timbrado ilimitado con SAT, OCR automatizado por IA context-aware, soporte 24/7 y multi-RFC.", "Tus Beneficios")}
              className="bg-white border border-slate-100 rounded-2.5xl p-3.5 text-left flex flex-col gap-1 hover:bg-slate-50 transition cursor-pointer"
            >
              <div className="w-7 h-7 rounded-full bg-[#0B53F4]/10 text-[#0B53F4] flex items-center justify-center shrink-0">
                <Shield className="w-4 h-4 stroke-[2.4]" />
              </div>
              <span className="text-[11.5px] font-extrabold text-slate-800 mt-1 block">Beneficios</span>
              <span className="text-[9px] text-[#A1A5B7] font-semibold block leading-tight">Todo lo que incluye tu plan</span>
            </div>

            {/* Sub-Item 2 */}
            <div 
              onClick={() => toast.info("Planes disponibles: Personal ($0), Pro ($580/mes) y Enterprise (A medida). ¿Deseas solicitar cotización?", "Cambio de Plan")}
              className="bg-white border border-slate-100 rounded-2.5xl p-3.5 text-left flex flex-col gap-1 hover:bg-slate-50 transition cursor-pointer"
            >
              <div className="w-7 h-7 rounded-full bg-cyan-50 text-cyan-600 flex items-center justify-center shrink-0">
                <Globe className="w-4 h-4 stroke-[2.4]" />
              </div>
              <span className="text-[11.5px] font-extrabold text-slate-800 mt-1 block">Cambiar plan</span>
              <span className="text-[9px] text-[#A1A5B7] font-semibold block leading-tight">Mejora o cambia tu plan</span>
            </div>

            {/* Sub-Item 3 */}
            <div 
              onClick={() => toast.info("Historial de cobros: Último pago procesado el 15 de mayo de 2024. Plan al día.", "Cobros")}
              className="bg-white border border-slate-100 rounded-2.5xl p-3.5 text-left flex flex-col gap-1 hover:bg-slate-50 transition cursor-pointer"
            >
              <div className="w-7 h-7 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
                <FileText className="w-4 h-4 stroke-[2.4]" />
              </div>
              <span className="text-[11.5px] font-extrabold text-slate-800 mt-1 block">Historial de cobros</span>
              <span className="text-[9px] text-[#A1A5B7] font-semibold block leading-tight">Revisa tus pagos</span>
            </div>

            {/* Sub-Item 4 */}
            <div 
              onClick={() => toast.info("Descarga fiscal: Facturas fiscales (XML/PDF) disponibles en tu Bóveda contable.", "Comprobantes fiscales")}
              className="bg-white border border-slate-100 rounded-2.5xl p-3.5 text-left flex flex-col gap-1 hover:bg-slate-50 transition cursor-pointer"
            >
              <div className="w-7 h-7 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
                <CheckCircle className="w-4 h-4 stroke-[2.4]" />
              </div>
              <span className="text-[11.5px] font-extrabold text-slate-800 mt-1 block">Comprobantes</span>
              <span className="text-[9px] text-[#A1A5B7] font-semibold block leading-tight">Descarga tus facturas</span>
            </div>
          </div>

          {/* Action buttons */}
          <div className="space-y-2.5 pt-1">
            <button 
              onClick={() => toast.info("Mostrando panel de gestión de facturación con Stripe de forma segura.", "Stripe Portal")}
              className="w-full bg-[#0B53F4] hover:bg-[#0747D1] text-white py-3.5 rounded-2xl font-black text-xs flex items-center justify-center gap-1.5 shadow-md shadow-[#0B53F4]/15 active:scale-95 transition cursor-pointer"
            >
              <Settings className="w-4 h-4 text-white stroke-[2.3]" />
              <span>Gestionar plan</span>
            </button>

            <button 
              onClick={() => toast.info("Mostrando tabla comparativa de beneficios para planes Gratis, Pro y Enterprise.", "Comparación")}
              className="w-full bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 py-3 rounded-2xl font-black text-xs flex items-center justify-center gap-1.5 active:scale-95 transition cursor-pointer"
            >
              <TrendingUp className="w-4 h-4 text-slate-500 stroke-[2.3]" />
              <span>Comparativa de planes</span>
            </button>
          </div>

        </div>
      </div>
    );
  };

  // --- SUBVIEW 3: PAGOS (Y FACTURACIÓN) ---
  const renderPagosView = () => {
    return (
      <div className="flex-1 flex flex-col bg-[#F4F7FC] h-full relative text-left">
        {renderHeader("Pagos y facturación", "Gestiona tus métodos de pago y datos fiscales.")}

        <div className="flex-1 overflow-y-auto px-5 pb-6 -mt-3.5 relative z-30 scrollbar-none space-y-4">
          
          {/* Card slider container */}
          <div className="relative group">
            <div className={`p-5 rounded-3xl bg-gradient-to-r ${mockCards[activeCardIndex].color} text-white relative shadow-lg min-h-[176px] flex flex-col justify-between transition-all duration-300 transform scale-100 font-sans`}>
              <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-tr from-white/10 to-transparent rounded-full blur-lg pointer-events-none" />
              
              {/* Card top row */}
              <div className="flex justify-between items-center select-none z-10 leading-none">
                <span className="text-xs font-black tracking-wide flex items-center gap-1.5">
                  <span className="w-3.5 h-3.5 bg-white/35 rounded-full block border border-white/20" />
                  ZenTicket
                </span>
                <Wifi className="w-4 h-4 stroke-[2.5] rotate-90 text-white/90" />
              </div>

              {/* Gold Microchip */}
              <div className="mt-3 w-10 h-7 bg-amber-400 rounded-lg flex items-center justify-center select-none shadow-xs border border-amber-300/40 relative z-10 overflow-hidden">
                <div className="absolute left-0 right-0 top-1 h-0.5 bg-black/15" />
                <div className="absolute left-0 right-0 bottom-1 h-0.5 bg-black/15" />
                <div className="absolute top-0 bottom-0 left-3 w-0.5 bg-black/15" />
                <div className="absolute top-0 bottom-0 right-3 w-0.5 bg-black/15" />
              </div>

              {/* Monospace numbers */}
              <div className="text-[17px] tracking-widest font-black font-mono text-center my-2.5 z-10">
                ••••  ••••  ••••  {mockCards[activeCardIndex].last4}
              </div>

              {/* Contactless wave logo on the far right of index */}
              {mockCards[activeCardIndex].principal && (
                <div className="absolute left-5 bottom-12 z-10">
                  <span className="bg-white text-[#0B53F4] text-[8.5px] uppercase font-black px-2.5 py-0.5 rounded shadow-2xs tracking-wider">
                    Principal
                  </span>
                </div>
              )}

              {/* Expiry / holder footer */}
              <div className="flex justify-between items-end text-[10px] font-sans z-10 leading-none select-none mt-1">
                <div className="text-left">
                  <span className="text-[7px] text-white/60 block uppercase tracking-wider mb-0.5 font-bold">Titular</span>
                  <span className="font-extrabold font-mono text-[10.5px]">{mockCards[activeCardIndex].holder.toUpperCase()}</span>
                  <span className="text-[7px] text-white/50 block font-mono mt-1 font-semibold">Vence {mockCards[activeCardIndex].expiry}</span>
                </div>
                
                <span className="text-[15px] font-black italic tracking-tighter text-white font-serif">{mockCards[activeCardIndex].brand}</span>
              </div>
            </div>

            {/* Slider triggers */}
            <button
              onClick={() => setActiveCardIndex((prev) => (prev > 0 ? prev - 1 : mockCards.length - 1))}
              className="absolute left-1 top-[42%] -translate-y-1/2 w-8 h-8 rounded-full bg-white/25 hover:bg-white/45 text-white flex items-center justify-center backdrop-blur-xs shadow-xs focus:outline-none transition active:scale-90 z-20 cursor-pointer border-0"
            >
              <ChevronLeft className="w-5 h-5 stroke-[2.5]" />
            </button>
            <button
              onClick={() => setActiveCardIndex((prev) => (prev < mockCards.length - 1 ? prev + 1 : 0))}
              className="absolute right-1 top-[42%] -translate-y-1/2 w-8 h-8 rounded-full bg-white/25 hover:bg-white/45 text-white flex items-center justify-center backdrop-blur-xs shadow-xs focus:outline-none transition active:scale-90 z-20 cursor-pointer border-0"
            >
              <ChevronRight className="w-5 h-5 stroke-[2.5]" />
            </button>
          </div>

          {/* Dots Indicator */}
          <div className="flex justify-center items-center gap-1.5 py-0.5 select-none">
            {mockCards.map((_, dotIdx) => (
              <button
                key={dotIdx}
                onClick={() => setActiveCardIndex(dotIdx)}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  activeCardIndex === dotIdx ? "w-3 bg-[#0B53F4]" : "w-1.5 bg-slate-300"
                } border-0`}
              />
            ))}
          </div>

          {/* Add payment method */}
          <button 
            type="button"
            onClick={() => setShowAddCardModal(true)}
            className="w-full py-4 px-4.5 bg-white border border-slate-100 rounded-2xl shadow-3xs flex items-center justify-between text-[#0B53F4] text-xs font-bold hover:bg-slate-50 transition select-none cursor-pointer group border-0 outline-none"
          >
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-[#0B53F4]/10 text-[#0B53F4] flex items-center justify-center">
                <Plus className="w-4 h-4 stroke-[2.5]" />
              </div>
              <span>Agregar método de pago</span>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 transition-transform" />
          </button>

          {/* Fiscal attributes SAT titles */}
          <div className="space-y-2 select-none pt-2 text-left">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1 block">Datos fiscales SAT</span>
            
            <div className="bg-white border border-slate-100/85 rounded-2.5xl p-4 shadow-3xs space-y-3 text-[11px] leading-snug">
              <div className="flex justify-between items-start">
                <span className="text-slate-400 font-bold uppercase tracking-wider text-[9px]">RFC</span>
                <span className="text-slate-800 font-black font-mono select-all uppercase">{rfc}</span>
              </div>
              <div className="flex justify-between items-start border-t border-slate-50 pt-2.5">
                <span className="text-slate-400 font-bold uppercase tracking-wider text-[9px]">Razón social</span>
                <span className="text-slate-800 font-extrabold max-w-[170px] text-right">{razonSocial}</span>
              </div>
              <div className="flex justify-between items-start border-t border-slate-50 pt-2.5">
                <span className="text-slate-400 font-bold uppercase tracking-wider text-[9px]">Régimen fiscal</span>
                <span className="text-slate-800 font-semibold max-w-[170px] text-right leading-tight">{regimenFiscal}</span>
              </div>
              <div className="flex justify-between items-start border-t border-slate-50 pt-2.5">
                <span className="text-slate-400 font-bold uppercase tracking-wider text-[9px]">Uso de CFDI</span>
                <span className="text-slate-700 font-semibold max-w-[170px] text-right">{usoCFDI}</span>
              </div>
            </div>

            {/* SAT execution triggers */}
            <div className="grid grid-cols-3 gap-2 pt-1 font-sans">
              <button 
                onClick={() => setShowEditFiscalModal(true)}
                className="py-2.5 bg-white border border-slate-200 rounded-xl text-[10px] font-bold text-slate-700 hover:bg-slate-50 transition active:scale-95 flex flex-col items-center justify-center gap-1 shadow-3xs cursor-pointer box-border"
              >
                <Pencil className="w-3.5 h-3.5 text-[#0B53F4] stroke-[2.2]" />
                <span>Editar</span>
              </button>

              <button 
                onClick={() => toast.info("Carga tu constancia en PDF para actualizar automáticamente tus datos con OCR de alta precisión.", "Cargar Situación Fiscal")}
                className="py-2.5 bg-white border border-slate-200 rounded-xl text-[10px] font-bold text-slate-700 hover:bg-slate-50 transition active:scale-95 flex flex-col items-center justify-center gap-1 shadow-3xs cursor-pointer box-border"
              >
                <Upload className="w-3.5 h-3.5 text-[#0B53F4] stroke-[2.2]" />
                <span>Subir constancia</span>
              </button>

              <button 
                onClick={() => {
                  const toastId = toast.loading("Verificando existencia del RFC en los servidores LCO del SAT...");
                  setTimeout(() => {
                    toast.removeToast(toastId);
                    toast.success("¡Información fiscal activa! Datos sincronizados correctamente.", "SAT Validado");
                  }, 1200);
                }}
                className="py-2.5 bg-white border border-slate-200 rounded-xl text-[10px] font-bold text-slate-700 hover:bg-slate-50 transition active:scale-95 flex flex-col items-center justify-center gap-1 shadow-3xs cursor-pointer box-border"
              >
                <CheckCircle className="w-3.5 h-3.5 text-emerald-600 stroke-[2.2]" />
                <span>Validar datos</span>
              </button>
            </div>
          </div>

        </div>
      </div>
    );
  };

  // --- SUBVIEW 4: CONFIGURACIÓN ---
  const renderConfiguracionView = () => {
    return (
      <div className="flex-1 flex flex-col bg-[#F4F7FC] h-full relative text-left">
        {renderHeader("Configuración", "Personaliza tu experiencia en ZenTicket.")}

        <div className="flex-1 overflow-y-auto px-5 pb-6 -mt-3.5 relative z-30 scrollbar-none space-y-4">
          
          {/* Main configuration settings block */}
          <div className="bg-white border border-slate-100 rounded-2.5xl overflow-hidden divide-y divide-slate-50 shadow-3xs text-xs font-semibold text-slate-850 select-none">
            
            {/* Row 1 */}
            <div className="flex items-center justify-between p-3.5 hover:bg-slate-50/50 transition cursor-pointer" onClick={() => toast.info("Preferencias generales configuradas con éxito.", "Ajustes de Sistema")}>
              <div className="flex items-center gap-3">
                <div className="w-7 h-7 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
                  <Settings className="w-4 h-4 stroke-[2.2]" />
                </div>
                <div>
                  <span className="block font-extrabold text-[12px] text-slate-800">Preferencias Generales</span>
                  <span className="text-[9.5px] text-slate-400 block mt-0.5 font-semibold">Configuración de interfaz</span>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-350" />
            </div>

            {/* Added Section: Bóveda CFDI */}
            <div className="flex items-center justify-between p-3.5 hover:bg-slate-50/50 transition cursor-pointer" onClick={() => onTabChange && onTabChange("historial")}>
              <div className="flex items-center gap-3">
                <div className="w-7 h-7 rounded-lg bg-[#0B53F4]/10 text-[#0B53F4] flex items-center justify-center shrink-0">
                  <HardDrive className="w-4 h-4 text-[#0B53F4] stroke-[2.2]" />
                </div>
                <div>
                  <span className="block font-extrabold text-[12px] text-slate-800">Bóveda CFDI</span>
                  <span className="text-[9.5px] text-slate-400 block mt-0.5 font-semibold">Archivos XML, representaciones PDF y timbrados SAT</span>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-[#0B53F4] shrink-0" />
            </div>

            {/* Added Section: Portales SAT */}
            <div className="flex items-center justify-between p-3.5 hover:bg-slate-50/50 transition cursor-pointer" onClick={() => onTabChange && onTabChange("conectores")}>
              <div className="flex items-center gap-3">
                <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                  <Globe className="w-4 h-4 text-emerald-600 stroke-[2.2]" />
                </div>
                <div>
                  <span className="block font-extrabold text-[12px] text-slate-800">Portales SAT</span>
                  <span className="text-[9.5px] text-slate-400 block mt-0.5 font-semibold">Credenciales de portales comerciales para auto-facturación</span>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-[#0B53F4] shrink-0" />
            </div>

            {/* Added Section: Base de Conocimiento */}
            <div className="flex items-center justify-between p-3.5 hover:bg-slate-50/50 transition cursor-pointer" onClick={() => onTabChange && onTabChange("conocimiento")}>
              <div className="flex items-center gap-3">
                <div className="w-7 h-7 rounded-lg bg-indigo-50 text-indigo-700 flex items-center justify-center shrink-0">
                  <BookOpen className="w-4 h-4 text-indigo-600 stroke-[2.2]" />
                </div>
                <div>
                  <span className="block font-extrabold text-[12px] text-slate-800">Base de Conocimiento</span>
                  <span className="text-[9.5px] text-slate-400 block mt-0.5 font-semibold">Reglas del SAT, tutoriales de timbrado y soporte técnico</span>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-[#0B53F4] shrink-0" />
            </div>

            {/* Added Section: Admin Console (strictly for administrator session) */}
            {currentUserEmail === "legionrender@gmail.com" && (
              <div className="flex items-center justify-between p-3.5 hover:bg-amber-500/5 transition bg-amber-50/40 cursor-pointer" onClick={() => onTabChange && onTabChange("admin")}>
                <div className="flex items-center gap-3">
                  <div className="w-7 h-7 rounded-lg bg-amber-500/10 text-amber-600 flex items-center justify-center shrink-0">
                    <ShieldCheck className="w-4 h-4 stroke-[2.2]" />
                  </div>
                  <div>
                    <span className="block font-extrabold text-[12px] text-slate-800 flex items-center gap-1.5">
                      Consola de Administración
                      <span className="bg-amber-500 text-white text-[7px] font-black px-1.5 py-0.5 rounded-full select-none leading-none">ADMIN_ROOT</span>
                    </span>
                    <span className="text-[9.5px] text-amber-700 block mt-0.5 font-semibold">Auditoría global, estado de portales y seed de base de datos</span>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-amber-500 shrink-0" />
              </div>
            )}

            {/* Row 2 */}
            <div className="flex items-center justify-between p-3.5 hover:bg-slate-50/50 transition cursor-pointer" onClick={() => toast.info("Las alertas push y de correo están integradas con el portal SAT de tu RFC.", "Notificaciones")}>
              <div className="flex items-center gap-3">
                <div className="w-7 h-7 rounded-lg bg-[#0B53F4]/10 text-[#0B53F4] flex items-center justify-center shrink-0">
                  <Bell className="w-4 h-4 stroke-[2.2]" />
                </div>
                <div>
                  <span className="block font-extrabold text-[12px] text-slate-800">Notificaciones</span>
                  <span className="text-[9.5px] text-slate-400 block mt-0.5 font-semibold">Gestiona tus alertas</span>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-350" />
            </div>

            {/* Row 3 */}
            <div className="flex items-center justify-between p-3.5 hover:bg-slate-50/50 transition cursor-pointer" onClick={() => toast.info("Gemini AI está activo para catalogar de forma inteligente gastos y representar conceptos difíciles.", "Gemini AI")}>
              <div className="flex items-center gap-3">
                <div className="w-7 h-7 rounded-lg bg-[#0B53F4]/10 text-[#0B53F4] flex items-center justify-center shrink-0">
                  <Sparkles className="w-4 h-4 text-blue-600 fill-blue-50 stroke-[2.2]" />
                </div>
                <div>
                  <span className="block font-extrabold text-[12px] text-slate-800">Optimización IA con Gemini</span>
                  <span className="text-[9.5px] text-slate-400 block mt-0.5 font-semibold">Potencia tu productividad</span>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-350" />
            </div>

            {/* Row 4 */}
            <div className="flex items-center justify-between p-3.5 hover:bg-slate-50/50 transition cursor-pointer" onClick={() => toast.info("Soporte a clientes disponible vía WhatsApp, email y llamada.", "Centro de ayuda")}>
              <div className="flex items-center gap-3">
                <div className="w-7 h-7 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
                  <HelpCircle className="w-4 h-4 stroke-[2.2]" />
                </div>
                <div>
                  <span className="block font-extrabold text-[12px] text-slate-800">Centro de ayuda</span>
                  <span className="text-[9.5px] text-slate-400 block mt-0.5 font-semibold">Soporte y recursos</span>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-350" />
            </div>

            {/* Row 5 */}
            <div className="flex items-center justify-between p-3.5 hover:bg-slate-50/50 transition cursor-pointer" onClick={() => toast.info("Tu sesión se encuentra resguardada con autenticación en dos pasos de Google Firebase.", "Seguridad")}>
              <div className="flex items-center gap-3">
                <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                  <ShieldCheck className="w-4 h-4 stroke-[2.2]" />
                </div>
                <div>
                  <span className="block font-extrabold text-[12px] text-slate-800">Seguridad</span>
                  <span className="text-[9.5px] text-slate-400 block mt-0.5 font-semibold">Protege tu cuenta</span>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-350" />
            </div>
          </div>

          {/* Theme selector */}
          <div className="space-y-2 select-none pt-1">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1 block text-left">Apariencia</span>
            
            <div className="bg-white border border-slate-100 rounded-2xl p-1 flex gap-1 shadow-3xs">
              {[
                { id: "light" as const, label: "Claro", icon: <Sun className="w-3.5 h-3.5" /> },
                { id: "dark" as const, label: "Oscuro", icon: <Moon className="w-3.5 h-3.5" /> },
                { id: "system" as const, label: "Sistema", icon: <Monitor className="w-3.5 h-3.5" /> }
              ].map((choice) => (
                <button
                  key={choice.id}
                  onClick={() => applyAppTheme(choice.id)}
                  className={`flex-1 py-2.5 text-[11px] font-bold rounded-xl flex items-center justify-center gap-1.5 transition cursor-pointer select-none border-0 outline-none ${
                    customTheme === choice.id
                      ? "bg-[#0B53F4] text-white shadow-sm"
                      : "text-slate-500 hover:text-slate-800 hover:bg-slate-50"
                  }`}
                >
                  {choice.icon}
                  <span>{choice.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Notification settings switches */}
          <div className="space-y-2 select-none pt-1 text-left">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1 block">Notificaciones</span>
            
            <div className="bg-white border border-slate-100 rounded-2.5xl overflow-hidden divide-y divide-slate-50 shadow-3xs text-[11.5px] font-extrabold text-slate-800">
              
              <div className="flex items-center justify-between p-3.5">
                <span className="text-slate-650">Ticket procesado</span>
                <button
                  onClick={() => setNotifTicket(!notifTicket)}
                  className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                    notifTicket ? "bg-[#0B53F4]" : "bg-slate-200"
                  } border-0`}
                >
                  <span className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-xs transition duration-200 ease-in-out ${notifTicket ? "translate-x-4" : "translate-x-0"}`} />
                </button>
              </div>

              <div className="flex items-center justify-between p-3.5">
                <span className="text-slate-650">Factura emitida</span>
                <button
                  onClick={() => setNotifFactura(!notifFactura)}
                  className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                    notifFactura ? "bg-[#0B53F4]" : "bg-slate-200"
                  } border-0`}
                >
                  <span className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-xs transition duration-200 ease-in-out ${notifFactura ? "translate-x-4" : "translate-x-0"}`} />
                </button>
              </div>

              <div className="flex items-center justify-between p-3.5">
                <span className="text-slate-650">Renovación</span>
                <button
                  onClick={() => setNotifRenovacion(!notifRenovacion)}
                  className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                    notifRenovacion ? "bg-[#0B53F4]" : "bg-slate-200"
                  } border-0`}
                >
                  <span className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-xs transition duration-200 ease-in-out ${notifRenovacion ? "translate-x-4" : "translate-x-0"}`} />
                </button>
              </div>

              <div className="flex items-center justify-between p-3.5">
                <span className="text-slate-450 font-normal">Push</span>
                <button
                  onClick={() => setNotifPush(!notifPush)}
                  className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                    notifPush ? "bg-[#0B53F4]" : "bg-slate-200"
                  } border-0`}
                >
                  <span className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-xs transition duration-200 ease-in-out ${notifPush ? "translate-x-4" : "translate-x-0"}`} />
                </button>
              </div>
            </div>
          </div>

          {/* Session exit */}
          <div className="pt-2 pb-4 text-center flex flex-col gap-3 font-sans select-none">
            <button 
              onClick={handleSignOut}
              className="text-red-500 hover:text-red-600 font-extrabold text-[12.5px] cursor-pointer text-center bg-transparent border-0 outline-none hover:underline"
            >
              Cerrar sesión
            </button>

            <button 
              onClick={() => toast.error("Para tramitar una baja irreversible del RFC en tu cuenta, por favor ponte en contacto directo con soporte técnico.", "Baja del RFC")}
              className="w-full py-3.5 bg-white hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200 border border-slate-200 text-rose-500 rounded-2xl font-black text-xs flex items-center justify-center gap-2 transition active:scale-95 cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5 stroke-[2.3]" />
              <span>Eliminar cuenta</span>
            </button>
          </div>

        </div>
      </div>
    );
  };

  // BEAUTIFUL FULL-SCREEN RENDER SUBVIEWS (NO MORE MOBILE MOCKUPS OR DUAL SYSTEMS)
  const renderFullPerfilView = () => {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start text-left font-sans">
        {/* Left Column: Personal Card (col-span-12 lg:col-span-5) */}
        <div className="lg:col-span-5 bg-white border border-slate-200/60 rounded-3xl p-6 shadow-sm flex flex-col justify-between select-none relative overflow-hidden min-h-[290px]">
          <div className="absolute right-[-10px] top-[-10px] w-24 h-24 bg-gradient-to-tr from-[#0B53F4]/5 to-transparent rounded-full blur-xl pointer-events-none" />
          
          <div className="flex flex-col sm:flex-row items-center gap-4.5">
            {/* Avatar circle */}
            <div className="relative w-20 h-20 rounded-full border-[3px] border-white ring-4 ring-[#0B53F4]/15 overflow-hidden shadow-xs shrink-0">
              <img 
                src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200" 
                alt="Portrait" 
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </div>

            {/* User display details */}
            <div className="text-center sm:text-left leading-snug">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-0.5">Titular</span>
              <h3 className="text-lg font-black text-slate-850 mt-0.5">{userName}</h3>
              <p className="text-xs text-slate-500 font-semibold mt-1 flex items-center justify-center sm:justify-start gap-1 select-all hover:text-[#0B53F4] transition cursor-pointer" onClick={() => setShowEditProfileModal(true)}>
                <span>{userEmail}</span>
                <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              </p>
              
              {/* Plan Badge */}
              <div className="mt-3 inline-flex bg-[#0B53F4]/8 text-[#0B53F4] text-[10px] font-black uppercase tracking-widest px-4 py-1.5 rounded-full select-none leading-none">
                Plan Pro Activo
              </div>
            </div>
          </div>

          <div className="mt-6 pt-6 border-t border-slate-100 flex flex-col sm:flex-row gap-3">
            <button 
              type="button"
              onClick={() => setShowEditProfileModal(true)}
              className="flex-1 bg-[#0B53F4] hover:bg-[#0747D1] text-white py-3.5 rounded-2xl font-extrabold text-xs flex items-center justify-center gap-2 transition active:scale-[0.98] cursor-pointer shadow-md shadow-[#0B53F4]/10 select-none border-0 hover:scale-[1.01]"
            >
              <Pencil className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>Editar perfil</span>
            </button>
            <button 
              type="button"
              onClick={handleSignOut}
              className="flex-1 bg-rose-50 hover:bg-rose-100 text-rose-600 py-3.5 rounded-2xl font-extrabold text-xs flex items-center justify-center gap-2 transition active:scale-[0.98] cursor-pointer select-none border-0 hover:scale-[1.01]"
            >
              <LogOut className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>Cerrar sesión</span>
            </button>
          </div>
        </div>

        {/* Right Column: Usage Metrics (col-span-12 lg:col-span-7) */}
        <div className="lg:col-span-7 space-y-4">
          <span className="text-[10.5px] font-black text-slate-400 uppercase tracking-widest pl-1 block font-sans">Métricas de Consumo</span>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Box 1 */}
            <div className="bg-white border border-slate-200/60 rounded-3xl p-5 shadow-sm flex items-center gap-4 text-left leading-tight">
              <div className="w-12 h-12 rounded-2xl bg-[#0B53F4]/10 text-[#0B53F4] flex items-center justify-center shrink-0">
                <FileText className="w-5 h-5 stroke-[2.4]" />
              </div>
              <div className="min-w-0">
                <span className="text-xl font-black text-slate-800 block truncate">{ticketsProcessedCount}</span>
                <span className="text-[11px] text-slate-400 font-bold block mt-0.5">Tickets procesados este mes</span>
              </div>
            </div>

            {/* Box 2 */}
            <div className="bg-white border border-slate-200/60 rounded-3xl p-5 shadow-sm flex items-center gap-4 text-left leading-tight">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                <CreditCard className="w-5 h-5 stroke-[2.4]" />
              </div>
              <div className="min-w-0">
                <span className="text-xl font-black text-slate-800 block truncate">{monthlyExpensesAmount}</span>
                <span className="text-[11px] text-slate-400 font-bold block mt-0.5">Gastos validados en total</span>
              </div>
            </div>

            {/* Box 3 */}
            <div className="bg-white border border-slate-200/60 rounded-3xl p-5 shadow-sm flex items-center gap-4 text-left leading-tight">
              <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
                <TrendingUp className="w-5 h-5 stroke-[2.4]" />
              </div>
              <div className="min-w-0">
                <span className="text-xl font-black text-slate-800 block truncate">{planUsagePercentage}</span>
                <span className="text-[11px] text-slate-400 font-bold block mt-0.5">Límite de consumo plan mensual</span>
              </div>
            </div>

            {/* Box 4 */}
            <div className="bg-white border border-slate-200/60 rounded-3xl p-5 shadow-sm flex items-center gap-4 text-left leading-tight">
              <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-500 flex items-center justify-center shrink-0">
                <HardDrive className="w-5 h-5 stroke-[2.4]" />
              </div>
              <div className="min-w-0">
                <span className="text-xl font-black text-slate-800 block truncate">{storageUsedBytes}</span>
                <span className="text-[11px] text-slate-400 font-bold block mt-0.5">Espacio en Bóveda CFDI</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderFullSuscripcionView = () => {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start text-left font-sans">
        {/* Left Column: Pro Subscription Status (Hero card size) - lg:col-span-6 */}
        <div className="lg:col-span-6 bg-gradient-to-r from-[#0C58FF] to-[#0A49D6] text-white rounded-3xl p-6 shadow-md relative overflow-hidden select-none flex flex-col justify-between min-h-[290px]">
          <div className="absolute -top-12 -right-12 w-32 h-32 bg-[#ffffff12] rounded-full blur-xl pointer-events-none" />
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <Crown className="w-5 h-5 text-amber-300 fill-amber-300 stroke-none" />
              <span className="font-black text-xs uppercase tracking-wider block">PRO AUTOMATION PLAN</span>
            </div>
            <span className="bg-[#10B981] text-white text-[10px] uppercase font-black px-3 py-1 rounded-full flex items-center gap-1.5 shadow-sm">
              <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
              Suscripción Activa
            </span>
          </div>

          <div className="pt-6 pb-2">
            <span className="text-[11px] opacity-75 font-semibold uppercase tracking-wider block">Precio Mensual</span>
            <h3 className="text-3xl font-black font-sans mt-1">$580 <span className="text-sm font-medium text-blue-100">MXN / mes más IVA</span></h3>
            <p className="text-xs opacity-80 mt-1.5 font-bold">Próximo cargo de cobro automático: 15 de junio de 2026</p>
          </div>

          {/* Progress bar */}
          <div className="space-y-2 pt-4 border-t border-white/10 mt-4">
            <div className="flex justify-between text-[11px] font-bold opacity-90 leading-tight">
              <span>Consumo mensual de Tickets SAT</span>
              <span className="font-mono">840 / 1,000 (84%)</span>
            </div>
            <div className="w-full bg-white/20 rounded-full h-2 overflow-hidden">
              <div className="bg-white h-full transition-all duration-500" style={{ width: "84%" }} />
            </div>
          </div>
        </div>

        {/* Right Column: Option Details & Stripe portal trigger - lg:col-span-6 */}
        <div className="lg:col-span-6 space-y-4">
          <span className="text-[10.5px] font-black text-slate-400 uppercase tracking-widest pl-1 block">Facturación y Consumo</span>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Box 1 */}
            <div 
              onClick={() => toast.info("Beneficios Pro: Timbrado masivo con el SAT, OCR multihilo optimizado por Gemini, integraciones de correo y descarga mensual XML/PDF corporativo.", "Tus Beneficios Pro")}
              className="bg-white border border-slate-200/60 rounded-3xl p-5 text-left flex items-start gap-4 hover:bg-slate-50 transition cursor-pointer group"
            >
              <div className="w-10 h-10 rounded-xl bg-[#0B53F4]/10 text-[#0B53F4] flex items-center justify-center shrink-0">
                <Shield className="w-5 h-5 stroke-[2.4]" />
              </div>
              <div>
                <span className="text-[13px] font-black text-slate-800 block">Beneficios Especiales</span>
                <span className="text-[10px] text-slate-400 font-semibold block mt-0.5 leading-tight">Timbrado de facturas, OCR ilimitado e IA</span>
              </div>
            </div>

            {/* Box 2 */}
            <div 
              onClick={() => toast.info("Planes corporativos: Contáctanos en support@zenticket.com para cotizar planes de múltiples RFCs con soporte e integraciones de ERP.", "Suscripción Enterprise")}
              className="bg-white border border-slate-200/60 rounded-3xl p-5 text-left flex items-start gap-4 hover:bg-slate-50 transition cursor-pointer group"
            >
              <div className="w-10 h-10 rounded-xl bg-orange-50 text-orange-605 text-amber-600 flex items-center justify-center shrink-0">
                <Crown className="w-5 h-5 stroke-[2.4]" />
              </div>
              <div>
                <span className="text-[13px] font-black text-slate-800 block">Plan Enterprise</span>
                <span className="text-[10px] text-slate-400 font-semibold block mt-0.5 leading-tight">Multi-usuario, ERPs & API</span>
              </div>
            </div>

            {/* Box 3 */}
            <div 
              onClick={() => toast.info("Factura de Suscripción: Tu pago mensual de $580 MXN se auto-factura de forma automática bajo tu RFC registrado y se guarda en tu Bóveda cada mes.", "Facturación de plan")}
              className="bg-white border border-slate-200/60 rounded-3xl p-5 text-left flex items-start gap-4 hover:bg-slate-50 transition cursor-pointer group"
            >
              <div className="w-10 h-10 rounded-xl bg-[#10B981]/15 text-[#10B981] flex items-center justify-center shrink-0">
                <CheckCircle className="w-5 h-5 stroke-[2.4]" />
              </div>
              <div>
                <span className="text-[13px] font-black text-slate-800 block">Comprobante de Pago</span>
                <span className="text-[10px] text-slate-400 font-semibold block mt-0.5 leading-tight">Descarga facturas de ZenTicket</span>
              </div>
            </div>

            {/* Box 4 */}
            <div 
              onClick={() => toast.info("Historial de cobros: Último pago exitoso procesado por Stripe el 15 de mayo de 2026. Método de pago VISA terminación 4242.", "Operación Stripe")}
              className="bg-white border border-slate-200/60 rounded-3xl p-5 text-left flex items-start gap-4 hover:bg-slate-50 transition cursor-pointer group"
            >
              <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
                <FileText className="w-5 h-5 stroke-[2.4]" />
              </div>
              <div>
                <span className="text-[13px] font-black text-slate-800 block">Historial de Cargos</span>
                <span className="text-[10px] text-slate-400 font-semibold block mt-0.5 leading-tight">Consulta transacciones anteriores</span>
              </div>
            </div>
          </div>

          <div className="pt-3 flex flex-col sm:flex-row gap-3">
            <button 
              type="button"
              onClick={() => toast.info("Abriendo portal seguro de cobros de Stripe...", "Stripe Billing")}
              className="flex-1 bg-[#0B53F4] hover:bg-[#0747D1] text-white py-3.5 rounded-2xl font-black text-xs flex items-center justify-center gap-1.5 shadow-md shadow-[#0B53F4]/15 active:scale-95 transition cursor-pointer border-0"
            >
              <Settings className="w-4 h-4 text-white stroke-[2.3]" />
              <span>Gestionar suscripción en Stripe</span>
            </button>
            <button 
              type="button"
              onClick={() => toast.info("Mostrando tabla comparativa de beneficios para planes Gratis, Pro y Enterprise.", "Comparación")}
              className="flex-1 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 py-3.5 rounded-2xl font-black text-xs flex items-center justify-center gap-1.5 active:scale-95 transition cursor-pointer"
            >
              <TrendingUp className="w-4 h-4 text-slate-500 stroke-[2.3]" />
              <span>Ver comparativa de planes</span>
            </button>
          </div>
        </div>
      </div>
    );
  };

  const renderFullPagosView = () => {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start text-left font-sans">
        {/* Left Column: SAT Cédula de Identificación Fiscal (col-span-12 lg:col-span-6) */}
        <div className="lg:col-span-6 bg-white border border-slate-200/60 rounded-3xl p-6 shadow-sm space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-[#0B53F4]" />
              <span className="text-sm font-black text-slate-800 uppercase tracking-widest block">Datos Fiscales SAT</span>
            </div>
            <span className="bg-emerald-50 text-emerald-600 text-[10px] uppercase font-black px-2.5 py-1 rounded-full flex items-center gap-1 select-none">
              <Check className="w-3 h-3 stroke-[2.5]" />
              Validado SAT LCO
            </span>
          </div>

          <div className="space-y-3.5 text-xs">
            <div className="flex justify-between items-start py-1">
              <span className="text-slate-400 font-bold uppercase tracking-wider text-[10px]">Registro Federal (RFC)</span>
              <span className="text-slate-800 font-black font-mono select-all text-[13px] uppercase">{rfc}</span>
            </div>
            
            <div className="flex justify-between items-start border-t border-slate-50 pt-3">
              <span className="text-slate-400 font-bold uppercase tracking-wider text-[10px]">Razón Social / Denominación</span>
              <span className="text-slate-800 font-extrabold max-w-[240px] text-right text-[12.5px]">{razonSocial}</span>
            </div>

            <div className="flex justify-between items-start border-t border-slate-50 pt-3">
              <span className="text-slate-400 font-bold uppercase tracking-wider text-[10px]">Régimen Fiscal</span>
              <span className="text-slate-700 font-semibold max-w-[240px] text-right leading-tight">{regimenFiscal}</span>
            </div>

            <div className="flex justify-between items-start border-t border-slate-50 pt-3">
              <span className="text-slate-400 font-bold uppercase tracking-wider text-[10px]">Código Postal Fiscal</span>
              <span className="text-slate-800 font-black font-mono text-[11.5px]">{codigoPostal}</span>
            </div>

            <div className="flex justify-between items-start border-t border-slate-50 pt-3">
              <span className="text-slate-400 font-bold uppercase tracking-wider text-[10px]">Uso CFDI Habitual</span>
              <span className="text-slate-700 font-semibold">{usoCFDI}</span>
            </div>
          </div>

          {/* Action triggers */}
          <div className="grid grid-cols-3 gap-2.5 pt-3">
            <button 
              type="button"
              onClick={() => setShowEditFiscalModal(true)}
              className="py-3 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl text-[10px] font-extrabold text-slate-700 transition active:scale-95 flex items-center justify-center gap-1.5 shadow-3xs cursor-pointer border-0"
            >
              <Pencil className="w-3.5 h-3.5 text-[#0B53F4] stroke-[2.2]" />
              <span>Editar</span>
            </button>

            <button 
              type="button"
              onClick={() => toast.info("Carga tu constancia de situación fiscal en formato PDF para extraer todos tus datos con IA de precisión.", "Extraer por OCR")}
              className="py-3 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl text-[10px] font-extrabold text-slate-700 transition active:scale-95 flex items-center justify-center gap-1.5 shadow-3xs cursor-pointer border-0"
            >
              <Upload className="w-3.5 h-3.5 text-[#0B53F4] stroke-[2.2]" />
              <span>Subir PDF</span>
            </button>

            <button 
              type="button"
              onClick={() => {
                const toastId = toast.loading("Verificando consistencia fiscal y estatus de RFC en la Lista de Contribuyentes Obligados del SAT...");
                setTimeout(() => {
                  toast.removeToast(toastId);
                  toast.success("¡Comprobado! Datos SAT plenamente vigentes en servidores LCO nacionales.", "SAT Sincronizado");
                }, 1000);
              }}
              className="py-3 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl text-[10px] font-extrabold text-slate-700 transition active:scale-95 flex items-center justify-center gap-1.5 shadow-3xs cursor-pointer border-0"
            >
              <CheckCircle className="w-3.5 h-3.5 text-emerald-600 stroke-[2.2]" />
              <span>Validar</span>
            </button>
          </div>
        </div>

        {/* Right Column: Métodos de Pago / Tarjetas de Crédito Slide (col-span-12 lg:col-span-6) */}
        <div className="lg:col-span-6 bg-white border border-slate-200/60 rounded-3xl p-6 shadow-sm space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-[#0B53F4]" />
              <span className="text-sm font-black text-slate-800 uppercase tracking-widest block">Métodos de Pago</span>
            </div>
            <span className="text-[10px] text-slate-400 font-bold bg-slate-50 px-2 py-0.5 rounded-full select-none">
              Tarjeta {activeCardIndex + 1} de {mockCards.length}
            </span>
          </div>

          {/* Interactive Card Slider */}
          <div className="relative group">
            <div className={`p-5 rounded-3xl bg-gradient-to-r ${mockCards[activeCardIndex].color} text-white relative shadow-md min-h-[165px] flex flex-col justify-between transition-all duration-300 transform scale-100 font-sans`}>
              <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-tr from-white/10 to-transparent rounded-full blur-lg pointer-events-none" />
              
              {/* Card top row */}
              <div className="flex justify-between items-center leading-none">
                <span className="text-xs font-black tracking-wide flex items-center gap-1.5">
                  <span className="w-3.5 h-3.5 bg-white/35 rounded-full block border border-white/20" />
                  ZenTicket Card
                </span>
                <Wifi className="w-4 h-4 stroke-[2.5] rotate-90 text-white/90" />
              </div>

              {/* Gold Microchip */}
              <div className="mt-2.5 w-10 h-7 bg-amber-400 rounded-lg flex items-center justify-center select-none shadow-xs border border-amber-300/40 relative z-10 overflow-hidden">
                <div className="absolute left-0 right-0 top-1 h-0.5 bg-black/15" />
                <div className="absolute left-0 right-0 bottom-1 h-0.5 bg-black/15" />
                <div className="absolute top-0 bottom-0 left-3 w-0.5 bg-black/15" />
                <div className="absolute top-0 bottom-0 right-3 w-0.5 bg-black/15" />
              </div>

              {/* Monospace numbers */}
              <div className="text-[18px] tracking-widest font-black font-mono text-center my-2.5 z-10 select-none">
                ••••  ••••  ••••  {mockCards[activeCardIndex].last4}
              </div>

              {/* principal tag */}
              {mockCards[activeCardIndex].principal && (
                <div className="absolute left-5 bottom-12 z-10">
                  <span className="bg-white text-[#0B53F4] text-[8.5px] uppercase font-black px-2 py-0.5 rounded shadow-2xs tracking-wider select-none leading-none">
                    Método Principal
                  </span>
                </div>
              )}

              {/* Expiry / holder footer */}
              <div className="flex justify-between items-end text-[10px] font-sans z-10 leading-none mt-1">
                <div className="text-left">
                  <span className="text-[7px] text-white/100 block uppercase tracking-wider mb-0.5 font-bold">Titular</span>
                  <span className="font-extrabold font-mono text-[10.5px]">{mockCards[activeCardIndex].holder.toUpperCase()}</span>
                  <span className="text-[7px] text-white/80 block font-mono mt-1 font-semibold">Vence {mockCards[activeCardIndex].expiry}</span>
                </div>
                <span className="text-[15px] font-black italic tracking-tighter text-white font-serif">{mockCards[activeCardIndex].brand}</span>
              </div>
            </div>

            {/* Slider triggers */}
            <button
              type="button"
              onClick={() => setActiveCardIndex((prev) => (prev > 0 ? prev - 1 : mockCards.length - 1))}
              className="absolute left-2 top-[50%] -translate-y-1/2 w-8 h-8 rounded-full bg-white/20 hover:bg-white/40 text-white flex items-center justify-center backdrop-blur-xs shadow-xs focus:outline-none transition active:scale-90 z-20 cursor-pointer border-0"
            >
              <ChevronLeft className="w-5 h-5 stroke-[2.5]" />
            </button>
            <button
              type="button"
              onClick={() => setActiveCardIndex((prev) => (prev < mockCards.length - 1 ? prev + 1 : 0))}
              className="absolute right-2 top-[50%] -translate-y-1/2 w-8 h-8 rounded-full bg-white/20 hover:bg-white/40 text-white flex items-center justify-center backdrop-blur-xs shadow-xs focus:outline-none transition active:scale-90 z-20 cursor-pointer border-0"
            >
              <ChevronRight className="w-5 h-5 stroke-[2.5]" />
            </button>
          </div>

          {/* Dots Indicator */}
          <div className="flex justify-center items-center gap-1.5 py-0.5 select-none">
            {mockCards.map((_, dotIdx) => (
              <button
                key={dotIdx}
                type="button"
                onClick={() => setActiveCardIndex(dotIdx)}
                className={`h-1.5 rounded-full transition-all duration-300 border-0 outline-none ${
                  activeCardIndex === dotIdx ? "w-3 bg-[#0B53F4]" : "w-1.5 bg-slate-200"
                }`}
              />
            ))}
          </div>

          {/* Add card trigger */}
          <button 
            type="button"
            onClick={() => setShowAddCardModal(true)}
            className="w-full py-3.5 px-4 bg-slate-50 hover:bg-slate-100 rounded-2xl flex items-center justify-between text-[#0B53F4] text-xs font-bold transition select-none cursor-pointer border-0 outline-none hover:scale-[1.01]"
          >
            <div className="flex items-center gap-2">
              <Plus className="w-4 h-4 text-[#0B53F4] stroke-[2.5]" />
              <span>Vincular nuevo método de pago</span>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-400" />
          </button>
        </div>
      </div>
    );
  };

  const renderFullConfiguracionView = () => {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start text-left font-sans">
        {/* Left Column: Toggles for Notifications & Appearance (col-span-12 lg:col-span-6) */}
        <div className="lg:col-span-6 space-y-4">
          <div className="bg-white border border-slate-200/60 rounded-3xl p-6 shadow-sm space-y-5">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
              <Bell className="w-5 h-5 text-[#0B53F4]" />
              <span className="text-sm font-black text-slate-800 uppercase tracking-widest block">Notificaciones</span>
            </div>

            <div className="space-y-4 text-xs font-semibold text-slate-800">
              <div className="flex items-center justify-between">
                <div>
                  <span className="block font-bold">Ticket procesado</span>
                  <span className="text-[10px] text-slate-400 block font-semibold mt-0.5">Alertar al finalizar la catalogación con IA</span>
                </div>
                <button
                  type="button"
                  onClick={() => setNotifTicket(!notifTicket)}
                  className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                    notifTicket ? "bg-[#0B53F4]" : "bg-slate-200"
                  } border-0`}
                >
                  <span className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-xs transition duration-200 ease-in-out ${notifTicket ? "translate-x-4" : "translate-x-0"}`} />
                </button>
              </div>

              <div className="flex items-center justify-between border-t border-slate-100 pt-3">
                <div>
                  <span className="block font-bold">Factura emitida por el SAT</span>
                  <span className="text-[10px] text-slate-400 block font-semibold mt-0.5">Sincronización directa en Bóveda</span>
                </div>
                <button
                  type="button"
                  onClick={() => setNotifFactura(!notifFactura)}
                  className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                    notifFactura ? "bg-[#0B53F4]" : "bg-slate-200"
                  } border-0`}
                >
                  <span className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-xs transition duration-200 ease-in-out ${notifFactura ? "translate-x-4" : "translate-x-0"}`} />
                </button>
              </div>

              <div className="flex items-center justify-between border-t border-slate-100 pt-3">
                <div>
                  <span className="block font-bold">Alertas de Renovación</span>
                  <span className="text-[10px] text-slate-400 block font-semibold mt-0.5">Avisar 3 días antes del fin del período</span>
                </div>
                <button
                  type="button"
                  onClick={() => setNotifRenovacion(!notifRenovacion)}
                  className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                    notifRenovacion ? "bg-[#0B53F4]" : "bg-slate-200"
                  } border-0`}
                >
                  <span className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-xs transition duration-200 ease-in-out ${notifRenovacion ? "translate-x-4" : "translate-x-0"}`} />
                </button>
              </div>
            </div>
          </div>

          {/* Theme selector inside card */}
          <div className="bg-white border border-slate-200/60 rounded-3xl p-6 shadow-sm space-y-4">
            <div className="flex items-center gap-2">
              <Monitor className="w-5 h-5 text-[#0B53F4]" />
              <span className="text-sm font-black text-slate-800 uppercase tracking-widest block">Apariencia del Sistema</span>
            </div>
            
            <div className="bg-slate-50 border border-slate-100 rounded-xl p-1 flex gap-1 shadow-3xs">
              {[
                { id: "light" as const, label: "Modo Claro", icon: <Sun className="w-3.5 h-3.5" /> },
                { id: "dark" as const, label: "Modo Oscuro", icon: <Moon className="w-3.5 h-3.5" /> },
                { id: "system" as const, label: "Sistema", icon: <Monitor className="w-3.5 h-3.5" /> }
              ].map((choice) => (
                <button
                  key={choice.id}
                  type="button"
                  onClick={() => applyAppTheme(choice.id)}
                  className={`flex-1 py-2.5 text-[11px] font-bold rounded-xl flex items-center justify-center gap-1.5 transition cursor-pointer select-none border-0 outline-none ${
                    customTheme === choice.id
                      ? "bg-[#0B53F4] text-white shadow-sm"
                      : "text-slate-500 hover:text-slate-800 hover:bg-slate-100/50"
                  }`}
                >
                  {choice.icon}
                  <span>{choice.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: General App Navigation Links (col-span-12 lg:col-span-6) */}
        <div className="lg:col-span-6 space-y-4">
          {/* Account destructive actions (in slate/rose) */}
            <div className="flex items-center gap-2 select-none">
              <Shield className="w-4.5 h-4.5 text-rose-500 stroke-[2.5]" />
              <span className="text-sm font-black text-slate-800 uppercase tracking-widest block">Acciones de Seguridad</span>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <button 
                type="button"
                onClick={() => toast.error("Para solicitar la revocación del RFC activo, contacta directo a support@zenticket.com", "SAT Estatus")}
                className="flex-1 py-3 text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-2xl font-bold text-xs cursor-pointer transition border-0 outline-none"
              >
                Revocar RFC registrado
              </button>

              <button 
                type="button"
                onClick={() => toast.error("Para tramitar una baja irreversible del RFC en tu cuenta, por favor ponte en contacto directo con soporte técnico.", "Baja del RFC")}
                className="flex-1 py-3 text-rose-600 bg-rose-50/50 hover:bg-rose-100/50 rounded-2xl font-black text-xs flex items-center justify-center gap-2 transition cursor-pointer border-0 outline-none"
              >
                <Trash2 className="w-4 h-4 stroke-[2.3]" />
                <span>Eliminar Cuenta</span>
              </button>
            </div>
          </div>
        </div>
    );
  };

  return (
    <div className="w-full min-h-screen text-slate-800 font-sans relative select-none bg-[#F4F7FC]">
      
      {/* ==================== 1. DEEP ROYAL BLUE HEADER STATUS BLOCK ==================== */}
      <div className="bg-gradient-to-b from-[#0B3EE4] via-[#05229C] to-[#01144F] text-white pt-10 pb-24 px-5 rounded-b-[40px] shadow-lg relative overflow-hidden shrink-0">
        <div className="absolute right-[-20%] top-[-20%] w-60 h-60 rounded-full bg-blue-500/20 blur-3xl pointer-events-none" />
        <div className="absolute left-[-20%] bottom-[-20%] w-48 h-48 rounded-full bg-teal-400/10 blur-2xl pointer-events-none" />

        {/* Top Header Navbar: Avatar, Logo & Bell */}
        <div className="flex items-center justify-between mb-6 relative z-10 w-full max-w-7xl mx-auto">
          {/* User Profile Avatar */}
          <div className="w-[38px] h-[38px] rounded-full overflow-hidden border border-white/20 bg-white/10 shrink-0 shadow-inner cursor-pointer" onClick={() => setShowEditProfileModal(true)}>
            <img 
              src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=256" 
              alt="Profile" 
              className="w-full h-full object-cover"
            />
          </div>

          {/* Centered ZenTicket Logo */}
          <div className="flex items-center gap-1.5 justify-center">
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
        <div className="mb-6 relative z-10 text-left w-full max-w-7xl mx-auto px-1">
          <h2 className="text-[25px] font-black tracking-tight text-white leading-none font-sans">
            Mi Cuenta
          </h2>
          <span className="text-[11.5px] text-blue-100 font-bold block mt-1 tracking-tight select-none opacity-85">
            Administra tu perfil, plan de suscripción, facturaciones SAT y preferencias globales
          </span>
        </div>

        {/* Stats Block inside Blue Header */}
        <div className="flex justify-between items-center bg-white/[0.03] backdrop-filter border border-white/5 rounded-2xl p-4.5 mb-1.5 relative z-10 w-full max-w-7xl mx-auto shadow-xs">
          {/* Left item */}
          <div className="flex items-center gap-3.5 w-[50%]">
            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-white shrink-0">
              <User className="w-5 h-5 text-blue-200" />
            </div>
            <div className="text-left min-w-0">
              <span className="text-[16.5px] font-black block leading-none text-white tracking-tight truncate">
                {userName}
              </span>
              <span className="text-[10px] text-blue-100 font-bold block mt-1 tracking-tight">
                Titular de la cuenta
              </span>
            </div>
          </div>

          {/* Horizontal dividing thin line */}
          <div className="w-px h-10 bg-white/10 shrink-0 self-center" />

          {/* Right item */}
          <div className="flex items-center gap-3.5 w-[50%] pl-4.5">
            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-white shrink-0">
              <Crown className="w-5 h-5 text-amber-300" />
            </div>
            <div className="text-left min-w-0">
              <span className="text-[16.5px] font-black block leading-none text-white tracking-tight">
                Plan Pro Siniestros
              </span>
              <span className="text-[10px] text-blue-100 font-bold block mt-1 tracking-tight">
                Suscripción automatizada
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ==================== 2. MAIN ACTIVE CARD SECTION WRAPPER ==================== */}
      <div className="-mt-14 px-4 pb-20 relative z-20 w-full max-w-7xl mx-auto flex flex-col gap-6">
        
        {/* Responsive Navigation Tabs Row */}
        <div className="bg-white border border-slate-200/65 rounded-2xl p-1.5 flex gap-1 items-center justify-between shadow-xs overflow-x-auto scrollbar-none font-sans">
          {[
            { tab: 0, label: "Mi Perfil", icon: <User className="w-3.5 h-3.5" /> },
            { tab: 1, label: "Suscripción", icon: <Crown className="w-3.5 h-3.5" /> },
            { tab: 2, label: "Pagos y SAT", icon: <CreditCard className="w-3.5 h-3.5" /> },
            { tab: 3, label: "Configuración", icon: <Settings className="w-3.5 h-3.5" /> }
          ].map((item) => (
            <button
              key={item.tab}
              type="button"
              onClick={() => {
                setActiveSubTab(item.tab);
                setShowEditProfileModal(false);
                setShowEditFiscalModal(false);
              }}
              className={`flex-1 py-3 px-4 text-xs font-black tracking-wide rounded-xl transition-all duration-200 cursor-pointer select-none border-0 outline-none flex items-center justify-center gap-2 shrink-0 ${
                activeSubTab === item.tab
                  ? "bg-[#0B53F4] text-white shadow-md shadow-[#0B53F4]/15"
                  : "text-slate-500 hover:text-slate-900 hover:bg-slate-50"
              }`}
            >
              {item.icon}
              <span>{item.label}</span>
            </button>
          ))}
        </div>

        {/* Content Body */}
        <div className="grid grid-cols-1 gap-6">
          {activeSubTab === 0 && (
            <div className="animate-fade-in_50 space-y-6">
              {renderFullPerfilView()}
            </div>
          )}
          {activeSubTab === 1 && (
            <div className="animate-fade-in_50 space-y-6">
              {renderFullSuscripcionView()}
            </div>
          )}
          {activeSubTab === 2 && (
            <div className="animate-fade-in_50 space-y-6">
              {renderFullPagosView()}
            </div>
          )}
          {activeSubTab === 3 && (
            <div className="animate-fade-in_50 space-y-6">
              {renderFullConfiguracionView()}
            </div>
          )}
        </div>
      </div>

      {/* ==================== 3. MODALS & SLIDE-UP SHEETS ==================== */}
      
      {/* modal - EDITAR PERFIL */}
      {showEditProfileModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in text-left">
          <div className="bg-white rounded-3xl p-6 w-full max-w-sm shadow-2xl border border-slate-150 relative">
            <button 
              type="button"
              onClick={() => setShowEditProfileModal(false)}
              className="absolute top-4 right-4 w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 transition border-0 outline-none"
            >
              <X className="w-4 h-4" />
            </button>
            
            <h3 className="text-md font-black text-slate-800 uppercase tracking-wide flex items-center gap-1.5 pb-2.5 border-b border-slate-150 mb-4">
              <User className="w-4 h-4 text-[#0B53F4]" />
              Editar Perfil Personal
            </h3>

            {/* Input Form Fields */}
            <div className="space-y-3.5 text-xs font-semibold">
              <div className="space-y-1">
                <label className="text-[9px] font-extrabold text-slate-400 uppercase tracking-widest pl-0.5">Nombre Completo</label>
                <input
                  type="text"
                  defaultValue={userName}
                  id="modal-input-name"
                  className="w-full text-xs font-bold bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 outline-none focus:border-[#0B53F4]"
                  placeholder="Luis Martínez"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[9px] font-extrabold text-slate-400 uppercase tracking-widest pl-0.5">Correo Electrónico</label>
                <input
                  type="email"
                  defaultValue={userEmail}
                  id="modal-input-email"
                  className="w-full text-xs font-bold bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 outline-none focus:border-[#0B53F4]"
                  placeholder="luis.martinez@email.com"
                />
              </div>

              <div className="pt-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowEditProfileModal(false)}
                  className="flex-1 py-3.5 bg-slate-100 text-slate-700 font-extrabold rounded-xl hover:bg-slate-200 transition border-0 outline-none cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const n = (document.getElementById("modal-input-name") as HTMLInputElement)?.value || userName;
                    const em = (document.getElementById("modal-input-email") as HTMLInputElement)?.value || userEmail;
                    handleSaveProfileChanges(n, em);
                  }}
                  className="flex-1 py-3.5 bg-[#0B53F4] text-white font-extrabold rounded-xl hover:bg-[#0747D1] transition shadow-md shadow-[#0B53F4]/10 border-0 outline-none cursor-pointer"
                >
                  Guardar Perfil
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* modal - EDITAR DATOS FISCALES SAT */}
      {showEditFiscalModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in text-left">
          <div className="bg-white rounded-3xl p-6 w-full max-w-sm shadow-2xl border border-slate-150 relative">
            <button 
              type="button"
              onClick={() => setShowEditFiscalModal(false)}
              className="absolute top-4 right-4 w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 transition border-0 outline-none"
            >
              <X className="w-4 h-4" />
            </button>
            
            <h3 className="text-md font-black text-slate-800 uppercase tracking-wide flex items-center gap-1.5 pb-2.5 border-b border-slate-150 mb-4">
              <FileText className="w-4 h-4 text-[#0B53F4]" />
              Editar Datos SAT
            </h3>

            <div className="space-y-3.5 text-xs font-semibold">
              <div className="space-y-1">
                <label className="text-[9px] font-extrabold text-slate-400 uppercase tracking-widest pl-0.5">RFC</label>
                <input
                  type="text"
                  defaultValue={rfc}
                  id="modal-input-rfc"
                  maxLength={13}
                  className="w-full text-xs font-black font-mono bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 outline-none uppercase"
                  placeholder="XAXX010101000"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[9px] font-extrabold text-slate-400 uppercase tracking-widest pl-0.5">Razón Social</label>
                <input
                  type="text"
                  defaultValue={razonSocial}
                  id="modal-input-razon"
                  className="w-full text-xs font-bold bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 outline-none"
                  placeholder="Luis Martínez Studio"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[9px] font-extrabold text-slate-400 uppercase tracking-widest pl-0.5">Régimen Fiscal</label>
                <select
                  id="modal-input-regimen"
                  defaultValue={regimenFiscal}
                  className="w-full text-xs font-bold bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 outline-none focus:border-[#0B53F4]"
                >
                  <option value="622 – Personas Físicas con Actividades Empresariales">622 – Personas Físicas con Actividades Empresariales</option>
                  <option value="601 – General de Ley Personas Morales">601 – General de Ley Personas Morales</option>
                  <option value="605 – Sueldos y Salarios e Ingresos Asimilados">605 – Sueldos y Salarios e Ingresos Asimilados</option>
                  <option value="612 – Actividades Empresariales y Profesionales">612 – Actividades Empresariales y Profesionales</option>
                  <option value="626 – Régimen Simplificado de Confianza (RESICO)">626 – Régimen Simplificado de Confianza (RESICO)</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[9px] font-extrabold text-slate-400 uppercase tracking-widest pl-0.5">Uso de CFDI</label>
                  <select
                    id="modal-input-[#uso-cfdi]"
                    defaultValue={usoCFDI}
                    className="w-full text-xs font-bold bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 outline-none focus:border-blue-500"
                  >
                    <option value="G03 – Gastos en general">G03 – Gastos en general</option>
                    <option value="G01 – Adquisición de mercancías">G01 – Adquisición de mercancías</option>
                    <option value="S01 – Sin efectos fiscales">S01 – Sin efectos fiscales</option>
                    <option value="D01 – Honorarios médicos, dentales y hospitalarios">D01 – Honorarios médicos, dentales y hospitalarios</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] font-extrabold text-slate-400 uppercase tracking-widest pl-0.5">Código Postal</label>
                  <input
                    type="text"
                    defaultValue={codigoPostal}
                    maxLength={5}
                    id="modal-input-[#cp]"
                    className="w-full text-xs font-bold bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 outline-none text-center font-mono"
                    placeholder="01000"
                  />
                </div>
              </div>

              <div className="pt-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowEditFiscalModal(false)}
                  className="flex-1 py-3.5 bg-slate-100 text-slate-700 font-extrabold rounded-xl hover:bg-slate-200 transition border-0 outline-none cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const finalRfc = (document.getElementById("modal-input-rfc") as HTMLInputElement)?.value || rfc;
                    const finalRazon = (document.getElementById("modal-input-razon") as HTMLInputElement)?.value || razonSocial;
                    const finalReg = (document.getElementById("modal-input-regimen") as HTMLSelectElement)?.value || regimenFiscal;
                    const finalUso = (document.getElementById("modal-input-[#uso-cfdi]") as HTMLSelectElement)?.value || usoCFDI;
                    const finalCP = (document.getElementById("modal-input-[#cp]") as HTMLInputElement)?.value || "01000";

                    setRfc(finalRfc.toUpperCase());
                    setRazonSocial(finalRazon);
                    setRegimenFiscal(finalReg);
                    setUsoCFDI(finalUso);
                    setCodigoPostal(finalCP);

                    handleSaveProfileChanges(userName, userEmail, finalRfc, finalRazon, finalReg, finalCP, finalUso);
                  }}
                  className="flex-1 py-3.5 bg-[#0B53F4] text-white font-extrabold rounded-xl hover:bg-[#0747D1] transition border-0 outline-none cursor-pointer"
                >
                  Confirmar SAT
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* modal - AGREGAR TARJETA CREDITO */}
      {showAddCardModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in text-left font-sans">
          <div className="bg-white rounded-3xl p-6 w-full max-w-sm shadow-2xl border border-slate-150 relative">
            <button 
              type="button"
              onClick={() => setShowAddCardModal(false)}
              className="absolute top-4 right-4 w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 border-0 outline-none"
            >
              <X className="w-4 h-4" />
            </button>
            
            <h3 className="text-md font-black text-slate-800 uppercase tracking-wide flex items-center gap-1.5 pb-2.5 border-b border-slate-150 mb-4">
              <CreditCard className="w-4 h-4 text-[#0B53F4]" />
              Agregar Tarjeta
            </h3>

            <div className="space-y-3.5 text-xs font-semibold">
              <div className="space-y-1">
                <label className="text-[9px] font-extrabold text-slate-400 uppercase tracking-widest pl-0.5">Franquicia</label>
                <select
                  value={newCardBrand}
                  onChange={(e) => setNewCardBrand(e.target.value as "VISA" | "MASTERCARD" | "AMEX")}
                  className="w-full text-xs font-bold bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 outline-none"
                >
                  <option value="VISA">VISA</option>
                  <option value="MASTERCARD">MASTERCARD</option>
                  <option value="AMEX">AMEX</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[9px] font-extrabold text-slate-400 uppercase tracking-widest pl-0.5">Últimos 4 dígitos</label>
                <input
                  type="text"
                  maxLength={4}
                  value={newCardNum}
                  onChange={(e) => setNewCardNum(e.target.value.replace(/\D/g, ""))}
                  className="w-full text-xs font-bold bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 outline-none font-mono text-center"
                  placeholder="4242"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[9px] font-extrabold text-slate-400 uppercase tracking-widest pl-0.5">Expiración</label>
                <input
                  type="text"
                  maxLength={5}
                  value={newCardExp}
                  onChange={(e) => setNewCardExp(e.target.value)}
                  className="w-full text-xs font-bold bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 outline-none font-mono text-center"
                  placeholder="08/28"
                />
              </div>

              <button
                type="button"
                onClick={() => {
                  if (newCardNum.length !== 4) {
                    toast.error("Por favor ingresa exactamente los últimos 4 dígitos.");
                    return;
                  }
                  toast.success(`Tarjeta ${newCardBrand} •••• ${newCardNum} agregada con éxito.`, "Método de Pago");
                  setShowAddCardModal(false);
                  
                  // Add card locally
                  mockCards.push({
                    brand: newCardBrand,
                    last4: newCardNum,
                    expiry: newCardExp,
                    holder: userName,
                    color: newCardBrand === "AMEX" ? "from-teal-700 to-indigo-950" : "from-slate-800 to-indigo-900",
                    principal: false
                  });
                  setActiveCardIndex(mockCards.length - 1);
                }}
                className="w-full bg-[#0B53F4] text-white py-3.5 rounded-xl hover:bg-[#0747D1] transition font-bold"
              >
                Confirmar Tarjeta
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
