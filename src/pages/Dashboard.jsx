import React, { useState, useEffect, useRef } from "react";
import { useAuth } from "@/context/AuthContext";
import { db } from "@/firebase";
import {
  collection,
  doc,
  setDoc,
  getDocs,
  query,
  where,
  onSnapshot,
  deleteDoc
} from "firebase/firestore";
import { toast } from "sonner";
import {
  User,
  LogOut,
  Sparkles,
  Layers,
  Building,
  History,
  ShieldCheck,
  Building2,
  RefreshCw,
  HelpCircle,
  Home,
  BarChart3,
  Camera,
  BookOpen,
  Ticket,
  Menu,
  X,
  ChevronRight
} from "lucide-react";

import ScannerAndSimulator from "@/components/ScannerAndSimulator";
import TicketsListScreen from "@/components/TicketsListScreen";
import ConnectorsList from "@/components/ConnectorsList";
import VaultScreen from "@/components/VaultScreen";
import ProfileForm from "@/components/ProfileForm";
import AdminScreen from "@/components/AdminScreen";
import InicioScreen from "@/components/InicioScreen";
import GastosScreen from "@/components/GastosScreen";
import ConocimientoScreen from "@/components/ConocimientoScreen";
import Logo from "@/components/Logo";
import { ZenLogo } from "@/components/brand/Logo";
import fondoCelular from "@/Fondo Celular.png";

const MENU_ITEMS = [
  { tab: "inicio", label: "Inicio", icon: <Home className="w-4 h-4" /> },
  { tab: "capturar", label: "Escanear", icon: <Sparkles className="w-4 h-4" /> },
  { tab: "tickets", label: "Mis Tickets", icon: <Layers className="w-4 h-4" /> },
  { tab: "conectores", label: "Portales SAT", icon: <Building className="w-4 h-4 text-emerald-500" /> },
  { tab: "conocimiento", label: "Conocimiento", icon: <BookOpen className="w-4 h-4" /> },
  { tab: "gastos", label: "Mis Gastos", icon: <BarChart3 className="w-4 h-4" /> },
  { tab: "cuenta", label: "Mi Cuenta", icon: <User className="w-4 h-4" /> },
  { tab: "admin", label: "Auditoría", icon: <ShieldCheck className="w-4 h-4 text-amber-500" /> }
];

export const Dashboard = () => {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab ] = useState("inicio"); // "inicio" | "capturar" | "tickets" | "conectores" | "gastos" | "cuenta" | "admin"
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // 1. Core database states
  const [fiscalProfile, setFiscalProfile] = useState(null);
  const [profileSaving, setProfileSaving] = useState(false);
  const [connectors, setConnectors] = useState([]);
  const [tickets, setTickets] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [allProfiles, setAllProfiles] = useState([]);
  const [allTickets, setAllTickets] = useState([]);
  const [allInvoices, setAllInvoices] = useState([]);

  // 2. Auxiliary navigation states
  const [preselectedTicketId, setPreselectedTicketId] = useState(null);
  const [newlyAddedTicketId, setNewlyAddedTicketId] = useState(null);
  const [autoOpenCamera, setAutoOpenCamera] = useState(false);

  // 3. AI Portal Training Simulator administrative parameters
  const [isLearningLoading, setIsLearningLoading] = useState(false);
  const [learningStatus, setLearningStatus] = useState("");
  const [learningProgress, setLearningProgress] = useState(0);
  const [learningCompany, setLearningCompany] = useState("");
  const [learningBudgetLimit, setLearningBudgetLimit] = useState(() => {
    return parseFloat(localStorage.getItem("learningBudgetLimit") || "15.00");
  });
  const learningTimeoutRef = useRef(null);

  // Real-time synchronization of Fiscal Profile for current active user
  useEffect(() => {
    if (!user) return;
    const docRef = doc(db, "fiscalProfiles", user.uid);
    const unsubscribe = onSnapshot(docRef, (docSnap) => {
      if (docSnap.exists()) {
        setFiscalProfile({ id: docSnap.id, ...docSnap.data() });
      } else {
        // Build beautiful standard customer profile fallback if not created yet
        const initialDef = {
          userId: user.uid,
          rfc: "CABE850101ABC",
          razonSocial: "RICARDO CASTRO BECERRIL",
          regimenFiscal: "626",
          codigoPostal: "02000",
          usoCFDI: "G03",
          plan: "gratuito",
          paymentCards: [
            {
              id: "card_1",
              brand: "VISA",
              last4: "4242",
              expiry: "12/26",
              isDefault: true,
              holderName: "RICARDO CASTRO"
            }
          ]
        };
        setFiscalProfile(initialDef);
      }
    }, (err) => {
      console.error("Error watching user fiscal profile:", err);
    });
    return unsubscribe;
  }, [user]);

  // Real-time user's digital Vault invoices
  useEffect(() => {
    if (!user) return;
    const q = query(
      collection(db, "invoices"),
      where("userId", "==", user.uid)
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const list = [];
      snapshot.forEach((d) => {
        list.push({ id: d.id, ...d.data() });
      });
      list.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      setInvoices(list);
    }, (err) => {
      console.error("Error watching invoices:", err);
    });
    return unsubscribe;
  }, [user]);

  // Real-time user's processed tickets
  useEffect(() => {
    if (!user) return;
    const q = query(
      collection(db, "tickets"),
      where("userId", "==", user.uid)
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const list = [];
      snapshot.forEach((d) => {
        list.push({ id: d.id, ...d.data() });
      });
      list.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      setTickets(list);
    }, (err) => {
      console.error("Error watching tickets:", err);
    });
    return unsubscribe;
  }, [user]);

  // Real-time connectors query (all users have read-level access to system-wide or trained portals)
  useEffect(() => {
    if (!user) return;
    const q = query(collection(db, "connectors"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const list = [];
      snapshot.forEach((d) => {
        list.push({ id: d.id, ...d.data() });
      });
      setConnectors(list);
    }, (err) => {
      console.error("Error watching connectors:", err);
    });
    return unsubscribe;
  }, [user]);

  // Real-time administrative watchers to feed standard cost auditing boards
  useEffect(() => {
    if (!user) return;
    
    // Only run administrative queries if the user email matches the bootstrapped admin
    if (user.email !== "legionrender@gmail.com") return;

    const qProfiles = query(collection(db, "fiscalProfiles"));
    const unsubscribeProfiles = onSnapshot(qProfiles, (snap) => {
      const list = [];
      snap.forEach((d) => list.push({ id: d.id, ...d.data() }));
      setAllProfiles(list);
    }, (err) => {
      console.error("Firestore Admin Profiles onSnapshot Error:", err);
    });

    const qTickets = query(collection(db, "tickets"));
    const unsubscribeTickets = onSnapshot(qTickets, (snap) => {
      const list = [];
      snap.forEach((d) => list.push({ id: d.id, ...d.data() }));
      list.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      setAllTickets(list);
    }, (err) => {
      console.error("Firestore Admin Tickets onSnapshot Error:", err);
    });

    const qInvoices = query(collection(db, "invoices"));
    const unsubscribeInvoices = onSnapshot(qInvoices, (snap) => {
      const list = [];
      snap.forEach((d) => list.push({ id: d.id, ...d.data() }));
      list.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      setAllInvoices(list);
    }, (err) => {
      console.error("Firestore Admin Invoices onSnapshot Error:", err);
    });

    return () => {
      unsubscribeProfiles();
      unsubscribeTickets();
      unsubscribeInvoices();
    };
  }, [user]);

  // --- PERSISTENCE AND OPERATIONAL EVENT HANDLERS ---

  const handleSaveProfile = async (profileData) => {
    if (!user) return;
    setProfileSaving(true);
    try {
      const docRef = doc(db, "fiscalProfiles", user.uid);
      await setDoc(docRef, {
        ...profileData,
        userId: user.uid,
        updatedAt: new Date().toISOString()
      }, { merge: true });
      setFiscalProfile({ ...profileData, userId: user.uid });
      toast.success("Perfil fiscal del receptor guardado correctamente.");
    } catch (err) {
      console.error("Error in profile update:", err);
      toast.error("Fallo al persistir cambios fiscales en la nube.");
      throw err;
    } finally {
      setProfileSaving(false);
    }
  };

  const onSaveTicketToDb = async (ticketData) => {
    if (!user) return "";
    try {
      const docRef = doc(collection(db, "tickets"));
      const tkt = {
        ...ticketData,
        userId: user.uid,
        createdAt: ticketData.createdAt || new Date().toISOString()
      };
      await setDoc(docRef, tkt);
      return docRef.id;
    } catch (e) {
      console.error("Error saving ticket photo:", e);
      throw e;
    }
  };

  const onUpdateTicketInDb = async (ticketId, updates) => {
    try {
      const docRef = doc(db, "tickets", ticketId);
      await setDoc(docRef, updates, { merge: true });
    } catch (e) {
      console.error("Error merging updates to ticket:", e);
      throw e;
    }
  };

  const onSaveInvoiceToDb = async (
    ticketId, xml, pdf, uuid, emisorRfc, emisorName, total, cost = 2.50, connectorType = "existente", rawCost = 0.0016
  ) => {
    if (!user) return;
    try {
      const invoicePayload = {
        userId: user.uid,
        ticketId,
        folioFiscal: uuid,
        rfcEmisor: emisorRfc.toUpperCase(),
        nombreEmisor: emisorName.toUpperCase(),
        rfcReceptor: fiscalProfile?.rfc || "CABE850101ABC",
        nombreReceptor: fiscalProfile?.razonSocial || "RICARDO CASTRO BECERRIL",
        total: parseFloat(total.toString()),
        xmlContent: xml,
        pdfHtml: pdf,
        createdAt: new Date().toISOString(),
        cost,
        rawCost,
        connectorType
      };

      const docRef = doc(collection(db, "invoices"));
      await setDoc(docRef, invoicePayload);
      toast.success("¡Certificado CFDI guardado con éxito en su bóveda digital!");
    } catch (e) {
      console.error("Error saving CFDI:", e);
      toast.error("Error al registrar factura certificada.");
      throw e;
    }
  };

  const onDeleteTicket = async (ticketId) => {
    try {
      const docRef = doc(db, "tickets", ticketId);
      await deleteDoc(docRef);
      toast.success("Ticket eliminado de su biblioteca.");
    } catch (e) {
      console.error("Error deleting ticket:", e);
      toast.error("No se pudo remover el ticket.");
    }
  };

  const onClearPreselectedTicket = () => {
    setPreselectedTicketId(null);
  };

  // Learn a new portal on-the-fly inside the Scanner multi-step loader
  const onLearnConnectorInline = async (nombre, rfc, learnedFrom = "automatizacion_ticket") => {
    // Return a Promise that resolves to the newly created Connector object
    const fields = [
      { key: "rfc", name: "RFC Receptor", selector: "input#receptor_rfc", type: "text", required: true },
      { key: "folio", name: "Código de Facturación", selector: "input#ticket_id_folio", type: "text", required: true },
      { key: "total", name: "Total Facturado", selector: "input#total_amount_charge", type: "number", required: true },
      { key: "fecha", name: "Fecha del Ticket", selector: "input#fecha_day", type: "date", required: true }
    ];
    const flow = [
      "1. Acceder al portal remoto de facturación corporativa",
      "2. Ingresar código de referencia y RFC de receptor",
      "3. Configurar Uso de CFDI 4.0 seleccionado",
      "4. Solicitar timbrado certificado ante PAC",
      "5. Sincronizar comprobantes PDF y XML oficiales"
    ];

    const newConnector = {
      userId: user.uid,
      nombre: nombre.toUpperCase(),
      rfc: rfc.toUpperCase(),
      portalUrl: `https://${nombre.toLowerCase().replace(/\s+/g, "").replace(/[^a-z0-9]/g, "")}.com.mx/facturacion`,
      fieldsJson: JSON.stringify(fields),
      flowJson: JSON.stringify(flow),
      createdAt: new Date().toISOString(),
      cost: 15.00,
      rawCost: 0.12,
      learnedFrom
    };

    const docRef = doc(collection(db, "connectors"));
    await setDoc(docRef, newConnector);

    // Refresh selectors
    const updated = [...connectors, { id: docRef.id, ...newConnector }];
    setConnectors(updated);

    return { id: docRef.id, ...newConnector };
  };

  // Administrative training cancellation
  const onCancelLearning = () => {
    if (learningTimeoutRef.current) {
      clearTimeout(learningTimeoutRef.current);
    }
    setIsLearningLoading(false);
    setLearningStatus("");
    setLearningProgress(0);
    toast.error("Entrenamiento IA abortado de forma administrativa por presupuesto.");
  };

  // Administrative dynamic portal trainer
  const onLearnConnector = async (nombre, rfc, tokenSaver = true) => {
    setIsLearningLoading(true);
    setLearningCompany(nombre);
    setLearningProgress(0);
    setLearningStatus("Iniciando motor cognitivo SAT...");

    const steps = [
      { progress: 10, status: "Evaluando estructura del portal web..." },
      { progress: 28, status: "Estructurando grafo de navegación Playwright..." },
      { progress: 45, status: "Emparejando campos (RFC, Folio, Monto)..." },
      { progress: 62, status: "Verificando CAPTCHAs y protecciones anti-bot..." },
      { progress: 80, status: "Compilando conector robótico en formato JSON..." },
      { progress: 95, status: "Registrando conector de forma global..." },
      { progress: 100, status: "Sincronización completada con éxito." }
    ];

    try {
      for (const step of steps) {
        await new Promise((resolve) => {
          learningTimeoutRef.current = setTimeout(resolve, tokenSaver ? 1200 : 700);
        });
        setLearningProgress(step.progress);
        setLearningStatus(step.status);
      }

      const fields = [
        { key: "rfc", name: "RFC Emisor", selector: "input[name='rfc_receptor']", type: "text", required: true },
        { key: "folio", name: "Folio de Factura", selector: "input#folio_ticket", type: "text", required: true },
        { key: "total", name: "Total Neto", selector: "input.amount_sub", type: "number", required: true },
        { key: "fecha", name: "Fecha del Ticket", selector: "input#fecha_day", type: "date", required: true }
      ];
      const flow = [
        "1. Navegar al dominio de autofactura",
        "2. Identificar el ticket de consumo",
        "3. Llenar los datos de receptor fiscal",
        "4. Generar CFDI timbrado",
        "5. Descargar XML y representaciones visuales"
      ];

      const newConnector = {
        userId: user.uid,
        nombre: nombre.toUpperCase(),
        rfc: rfc.toUpperCase(),
        portalUrl: `https://${nombre.toLowerCase().replace(/\s+/g, "").replace(/[^a-z0-9]/g, "")}.com.mx/facturacion`,
        fieldsJson: JSON.stringify(fields),
        flowJson: JSON.stringify(flow),
        createdAt: new Date().toISOString(),
        cost: tokenSaver ? 12.50 : 25.00,
        rawCost: tokenSaver ? 0.08 : 0.22,
        learnedFrom: "portal_admin"
      };

      const docRef = doc(collection(db, "connectors"));
      await setDoc(docRef, newConnector);
      toast.success(`Mapeador para ${nombre} entrenado y en operación SAT.`);
    } catch (e) {
      console.error(e);
      toast.error("Error durante el flujo cognitivo de entrenamiento de campos.");
    } finally {
      setIsLearningLoading(false);
      setLearningProgress(0);
      setLearningStatus("");
    }
  };

  const onUpdateLearningBudgetLimit = async (newLimit) => {
    setLearningBudgetLimit(newLimit);
    localStorage.setItem("learningBudgetLimit", newLimit.toString());
    toast.success(`Tope de presupuesto de IA actualizado a $${newLimit.toFixed(2)} MXN`);
  };

  const onForceReSeed = async () => {
    try {
      const standardList = [
        {
          userId: "system",
          nombre: "Starbucks / Alsea",
          rfc: "SHE190630TX1",
          portalUrl: "https://alsea.facturacion.com",
          fieldsJson: JSON.stringify([
            { key: "rfc", name: "RFC Receptor", selector: "input#rfc_id", type: "text", required: true },
            { key: "folio", name: "Ticket Folio", selector: "input#folio_ticket", type: "text", required: true },
            { key: "total", name: "Total Importe", selector: "input#total_amount", type: "number", required: true },
            { key: "fecha", name: "Fecha Compra", selector: "input#fecha_day", type: "date", required: true }
          ]),
          flowJson: JSON.stringify([
            "1. Acceder al portal de facturación Alsea",
            "2. Capturar RFC receptor y datos del ticket de compra",
            "3. Indicar Uso de CFDI correspondiente",
            "4. Efectuar timbrado digital federal SAT",
            "5. Guardar documentos PDF y XML generados"
          ]),
          createdAt: new Date().toISOString()
        },
        {
          userId: "system",
          nombre: "OXXO Cadena",
          rfc: "CCO8605231N4",
          portalUrl: "http://factura.oxxo.com:8080",
          fieldsJson: JSON.stringify([
            { key: "rfc", name: "RFC Emisor", selector: "input[name='rfc']", type: "text", required: true },
            { key: "folio", name: "Número de Folio", selector: "input#folio", type: "text", required: true },
            { key: "total", name: "Total Ticket", selector: "input#importe", type: "number", required: true },
            { key: "fecha", name: "Fecha de Compra", selector: "input#fecha", type: "date", required: true }
          ]),
          flowJson: JSON.stringify([
            "1. Cargar el portal oficial de facturas de Tiendas OXXO",
            "2. Capturar los datos de ticket correspondientes",
            "3. Ingresar RFC de receptor fiscal",
            "4. Autorizar emisión de CFDI con sello SAT",
            "5. Consolidar documentos digitales en almacén"
          ]),
          createdAt: new Date().toISOString()
        },
        {
          userId: "system",
          nombre: "Walmart / Aurrera",
          rfc: "NWM9709244W4",
          portalUrl: "https://facturacion.walmartmexico.com",
          fieldsJson: JSON.stringify([
            { key: "rfc", name: "RFC Cliente", selector: "input#rfc", type: "text", required: true },
            { key: "folio", name: "Número de Transacción", selector: "input#ticket", type: "text", required: true },
            { key: "total", name: "Monto Neto Total", selector: "input#monto", type: "number", required: true },
            { key: "fecha", name: "Fecha del Ticket", selector: "input#fecha", type: "date", required: true }
          ]),
          flowJson: JSON.stringify([
            "1. Ingresar al portal de facturas Walmart México",
            "2. Suministrar TR y RFC receptor",
            "3. Suministrar código de sucursal de compra",
            "4. Proceder con el timbrado fiscal",
            "5. Almacenar facturas PDF y XML"
          ]),
          createdAt: new Date().toISOString()
        }
      ];

      for (const item of standardList) {
        const found = connectors.find((x) => x.rfc === item.rfc);
        if (!found) {
          const docRef = doc(collection(db, "connectors"));
          await setDoc(docRef, item);
        }
      }
      toast.success("Se sincronizó satisfactoriamente la base de portales comerciales.");
    } catch (err) {
      console.error(err);
      toast.error("Fallo al restablecer la base estándar de portales.");
    }
  };

  const onUpdateTicket = async (ticketId, updates) => {
    try {
      const docRef = doc(db, "tickets", ticketId);
      await setDoc(docRef, updates, { merge: true });
    } catch (e) {
      console.error("Error updating ticket details:", e);
    }
  };

  const onStartTicketAutomation = async (ticketId) => {
    toast.info("Iniciando secuencia robótica Playwright de timbrado...");
  };

  const onTriggerSimulationInline = (ticket) => {
    setPreselectedTicketId(ticket.id || null);
    setActiveTab("capturar");
  };

  return (
    <div 
      className="min-h-screen text-[#0b1020] font-body selection:bg-blue-600/10 selection:text-blue-600 flex flex-col md:flex-row pb-20 md:pb-0"
      style={{ backgroundColor: '#F4F7FC' }}
    >
      
      {/* 1. DESKTOP SIDEBAR MENU (Left screen alignment) */}
      <aside className="hidden md:flex flex-col w-64 bg-white/80 backdrop-blur-md border-r border-slate-200/40 fixed inset-y-0 left-0 z-40 p-6 shadow-sm">
        <div className="flex flex-col h-full justify-between">
          <div>
            {/* Top Brand Logo */}
            <div className="cursor-pointer mb-8 py-2 border-b border-slate-200/30 pb-5" onClick={() => setActiveTab("capturar")}>
              <ZenLogo size={38} className="h-9 w-auto" />
            </div>

            {/* Navigation Menu Links */}
            <nav className="flex flex-col gap-1.5 px-0.5">
              {MENU_ITEMS.filter((item) => item.tab !== "admin" || user?.email === "legionrender@gmail.com").map((item) => (
                <button
                  key={item.tab}
                  onClick={() => setActiveTab(item.tab)}
                  className={`flex items-center gap-3 w-full px-4.5 py-3.5 rounded-xl text-[11.5px] uppercase font-display font-extrabold tracking-wider transition-all duration-200 cursor-pointer ${
                    activeTab === item.tab
                      ? "zt-btn-primary text-white scale-[1.02] shadow-sm shadow-blue-500/20"
                      : "text-slate-500 hover:text-slate-900 hover:bg-slate-200/30"
                  }`}
                >
                  <span className={`transition-transform duration-150 ${activeTab === item.tab ? "text-white scale-110" : "text-slate-400 group-hover:scale-110"}`}>
                    {item.icon}
                  </span>
                  <span>{item.label}</span>
                </button>
              ))}
            </nav>
          </div>

          <div className="space-y-4 pt-5 border-t border-slate-200/45 px-1">
            {/* Active User Email */}
            <div className="flex flex-col gap-1 bg-white/50 border border-slate-200/40 p-3.5 rounded-2xl shadow-2xs">
              <span className="text-[10px] font-black text-blue-600/70 uppercase tracking-widest font-display">Sesión Activa</span>
              <span className="text-xs font-extrabold text-slate-800 truncate" title={user?.email}>
                {user?.email}
              </span>
            </div>

            {/* Logout Button */}
            <button
              onClick={() => {
                logout();
                toast.success("Has cerrado sesión exitosamente.");
              }}
              className="w-full text-[11px] font-black uppercase tracking-widest text-[#EF4444] bg-rose-500/5 hover:bg-rose-500/10 border border-rose-500/10 py-3 rounded-full transition-all duration-200 cursor-pointer flex items-center justify-center gap-2"
            >
              <LogOut className="w-3.5 h-3.5 stroke-[2.3]" />
              <span>Cerrar Sesión</span>
            </button>

            {/* Bottom Brand Logo stamp */}
            <div className="pt-2 flex justify-center opacity-65 hover:opacity-100 transition-opacity">
              <ZenLogo size={24} className="h-6 w-auto" />
            </div>
          </div>
        </div>
      </aside>

      {/* 2. MOBILE HEADER BAR (Disabled since all screens now use integrated premium brand headers) */}
      {false && (
        <header className="md:hidden bg-white border-b border-slate-200/40 sticky top-0 z-40 shadow-xs w-full">
          <div className="px-4 py-3.5 flex items-center justify-between">
            <div className="cursor-pointer font-bold" onClick={() => setActiveTab("capturar")}>
              <ZenLogo size={28} className="h-7 w-auto" />
            </div>

            <div className="flex items-center gap-3">
              <span className="bg-blue-50/50 text-[#0b53f4] border border-blue-100 text-[10px] font-bold px-2.5 py-1 rounded-md lowercase tracking-wide font-mono">
                {user?.email?.split('@')[0]}
              </span>
              <button
                onClick={() => {
                  logout();
                  toast.success("Has cerrado sesión exitosamente.");
                }}
                className="text-xs font-bold uppercase tracking-wider text-[#EF4444] bg-rose-50 border border-rose-150/50 hover:bg-rose-100 p-2 rounded-lg transition-all cursor-pointer flex items-center gap-1.5"
              >
                <LogOut className="w-3.5 h-3.5 stroke-[2.3]" />
              </button>
            </div>
          </div>
        </header>
      )}

      {/* 3. MAIN WORKSPACE VIEW ROUTER (shifted left on desktop to clear sidebar space) */}
      <div className="flex-1 flex flex-col md:pl-64 min-w-0">
        <main className="max-w-7xl w-full mx-auto flex-1 px-0 md:px-8 py-0 md:py-8">
          <div className="bg-transparent rounded-3xl min-h-[500px]">
          
          {/* TAB 0: HOME INICIO SCREEN */}
          {activeTab === "inicio" && (
            <div className="animate-fade-in_50">
              <InicioScreen 
                tickets={tickets}
                invoices={invoices}
                fiscalProfile={fiscalProfile}
                onTabChange={setActiveTab}
                currentUserEmail={user?.email}
              />
            </div>
          )}
          
          {/* TAB 1: SCANNER & SIMULATOR */}
          {activeTab === "capturar" && (
            <div className="animate-fade-in_50">
              <ScannerAndSimulator
                fiscalProfile={fiscalProfile}
                connectors={connectors}
                onSaveTicketToDb={onSaveTicketToDb}
                onUpdateTicketInDb={onUpdateTicketInDb}
                onSaveInvoiceToDb={onSaveInvoiceToDb}
                onLearnConnectorInline={onLearnConnectorInline}
                tickets={tickets}
                preselectedTicketId={preselectedTicketId}
                onClearPreselectedTicket={onClearPreselectedTicket}
                onStartAutomation={onStartTicketAutomation}
                onTabChange={setActiveTab}
                onSetNewlyAddedTicketId={setNewlyAddedTicketId}
                autoOpenCamera={autoOpenCamera}
                onCloseCamera={() => setAutoOpenCamera(false)}
              />
            </div>
          )}

          {/* TAB 2: TICKETS LIST / TRACKER */}
          {activeTab === "tickets" && (
            <div className="animate-fade-in_50">
              <TicketsListScreen
                tickets={tickets}
                invoices={invoices}
                onTriggerSimulationInline={onTriggerSimulationInline}
                currentUserEmail={user?.email}
                onDeleteTicket={onDeleteTicket}
                onTabChange={setActiveTab}
                newlyAddedTicketId={newlyAddedTicketId}
                onClearNewlyAddedTicketId={() => setNewlyAddedTicketId(null)}
              />
            </div>
          )}

          {/* TAB 3: CONNECTORS / PORTALS */}
          {activeTab === "conectores" && (
            <div className="animate-fade-in_50">
              <ConnectorsList
                connectors={connectors}
                onLearnConnector={onLearnConnector}
                isLoading={isLearningLoading}
              />
            </div>
          )}

          {/* TAB 4: VAULT / INVOICES HISTORIAL */}
          {activeTab === "historial" && (
            <div className="animate-fade-in_50">
              <VaultScreen
                invoices={invoices}
                onTabChange={setActiveTab}
              />
            </div>
          )}

          {/* TAB 5: FISCAL ACCOUNT AND DEBIT PLANS */}
          {activeTab === "cuenta" && (
            <div className="animate-fade-in_50">
              <ProfileForm
                initialProfile={fiscalProfile}
                onSave={handleSaveProfile}
                isSaving={profileSaving}
                currentUserEmail={user?.email}
                onTabChange={setActiveTab}
              />
            </div>
          )}

          {/* TAB 5.5: VISUAL EXPENSES CHARTS & EVOLUTION */}
          {activeTab === "gastos" && (
            <div className="animate-fade-in_50">
              <GastosScreen 
                invoices={invoices}
                tickets={tickets}
                onTabChange={setActiveTab}
              />
            </div>
          )}

          {/* TAB 6: BUSINESS COST AUDITING BOARD */}
          {activeTab === "admin" && (
            <div className="animate-fade-in_50">
              <AdminScreen
                connectors={connectors}
                tickets={allTickets}
                invoices={allInvoices}
                allProfiles={allProfiles}
                onForceReSeed={onForceReSeed}
                onLearnConnector={onLearnConnector}
                isLearningLoading={isLearningLoading}
                learningStatus={learningStatus}
                learningProgress={learningProgress}
                onCancelLearning={onCancelLearning}
                learningCompany={learningCompany}
                learningBudgetLimit={learningBudgetLimit}
                onUpdateLearningBudgetLimit={onUpdateLearningBudgetLimit}
                onUpdateTicket={onUpdateTicket}
                onStartTicketAutomation={onStartTicketAutomation}
              />
            </div>
          )}

          {/* TAB 7: KNOWLEDGE BASE / BASE DE CONOCIMIENTO */}
          {activeTab === "conocimiento" && (
            <div className="animate-fade-in_50">
              <ConocimientoScreen onTabChange={setActiveTab} />
            </div>
          )}

        </div>
      </main>
      </div>

      {/* 3. FIXED BOTTOM MOBILE NAVIGATION BAR */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-lg border-t border-slate-100 rounded-t-[32px] shadow-[0_-12px_40px_rgba(15,23,42,0.08)] h-[84px] pb-safe-bottom flex items-center justify-between select-none">
        
        {/* Floating circular camera button in the absolute horizontal center */}
        <div className="absolute -top-[23px] left-1/2 -translate-x-1/2 z-50">
          <div className="w-[70px] h-[70px] bg-white rounded-full flex items-center justify-center shadow-[0_-5px_15px_rgba(0,0,0,0.03)] border-t border-slate-100/30">
            <button
              onClick={() => { setActiveTab("capturar"); setAutoOpenCamera(true); setIsMobileMenuOpen(false); }}
              className={`w-[56px] h-[56px] rounded-full flex items-center justify-center text-white transition-all duration-300 relative group cursor-pointer ${
                activeTab === "capturar"
                  ? "bg-[#0B53F4] shadow-[0_4px_16px_rgba(11,83,244,0.45)] scale-102"
                  : "bg-[#0B53F4] hover:bg-[#0747D1] shadow-[0_4px_12px_rgba(11,83,244,0.30)] hover:scale-102 active:scale-95"
              }`}
            >
              <Camera className="w-[26px] h-[26px] stroke-[2.2]" />
            </button>
          </div>
        </div>

        {/* Symmetrical Navigation Grid overlay */}
        <div className="flex w-full h-[84px] items-center justify-between px-3 relative z-10 pt-[5px]">
          
          {/* Left partition buttons (Inicio & Tickets) */}
          <div className={`flex justify-around items-center ${user?.email === "legionrender@gmail.com" ? "w-[35%]" : "w-[38%]"}`}>
            {/* 1. Inicio */}
            <button
              onClick={() => { setActiveTab("inicio"); setIsMobileMenuOpen(false); }}
              className={`flex flex-col items-center gap-1 cursor-pointer transition-colors duration-150 py-1.5 w-12 ${
                activeTab === "inicio" ? "text-[#0B53F4]" : "text-slate-400 hover:text-slate-650"
              }`}
            >
              <Home className="w-[22px] h-[22px]" fill={activeTab === "inicio" ? "#0B53F4" : "none"} strokeWidth={activeTab === "inicio" ? 1.5 : 2} />
              <span className={`text-[10px] tracking-tight transition-all ${activeTab === "inicio" ? "font-bold text-[#0B53F4]" : "font-semibold text-slate-400"}`}>
                Inicio
              </span>
            </button>

            {/* 2. Tickets */}
            <button
              onClick={() => { setActiveTab("tickets"); setIsMobileMenuOpen(false); }}
              className={`flex flex-col items-center gap-1 cursor-pointer transition-colors duration-150 py-1.5 w-12 ${
                activeTab === "tickets" ? "text-[#0B53F4]" : "text-slate-400 hover:text-slate-650"
              }`}
            >
              <Ticket className="w-[22px] h-[22px]" fill={activeTab === "tickets" ? "#0B53F4" : "none"} strokeWidth={activeTab === "tickets" ? 1.5 : 2} />
              <span className={`text-[10px] tracking-tight transition-all ${activeTab === "tickets" ? "font-bold text-[#0B53F4]" : "font-semibold text-slate-400"}`}>
                Tickets
              </span>
            </button>
          </div>

          {/* Balanced empty slot space in center for floating button label */}
          <div className={`${user?.email === "legionrender@gmail.com" ? "w-[16%]" : "w-[20%]"} flex flex-col items-center justify-end h-full pb-3.5 pointer-events-none select-none z-10`}>
            <span className={`text-[10px] tracking-tight transition-all ${activeTab === "capturar" ? "font-bold text-[#0B53F4]" : "font-semibold text-slate-400"}`}>
              Escanear
            </span>
          </div>

          {/* Right partition buttons (Gastos, Cuenta, and Admin if matches) */}
          <div className={`flex justify-around items-center ${user?.email === "legionrender@gmail.com" ? "w-[49%]" : "w-[38%]"}`}>
            {/* 3. Gastos */}
            <button
              onClick={() => { setActiveTab("gastos"); setIsMobileMenuOpen(false); }}
              className={`flex flex-col items-center gap-1 cursor-pointer transition-colors duration-150 py-1.5 w-11 ${
                activeTab === "gastos" ? "text-[#0B53F4]" : "text-slate-400 hover:text-slate-650"
              }`}
            >
              <BarChart3 className="w-[22px] h-[22px]" fill={activeTab === "gastos" ? "#0B53F4" : "none"} strokeWidth={activeTab === "gastos" ? 1.5 : 2} />
              <span className={`text-[10px] tracking-tight transition-all ${activeTab === "gastos" ? "font-bold text-[#0B53F4]" : "font-semibold text-slate-400"}`}>
                Gastos
              </span>
            </button>

            {/* 4. Cuenta */}
            <button
              onClick={() => { setActiveTab("cuenta"); setIsMobileMenuOpen(false); }}
              className={`flex flex-col items-center gap-1 cursor-pointer transition-colors duration-150 py-1.5 w-11 ${
                activeTab === "cuenta" ? "text-[#0B53F4]" : "text-slate-400 hover:text-slate-650"
              }`}
            >
              <User className="w-[22px] h-[22px]" fill={activeTab === "cuenta" ? "#0B53F4" : "none"} strokeWidth={activeTab === "cuenta" ? 1.5 : 2} />
              <span className={`text-[10px] tracking-tight transition-all ${activeTab === "cuenta" ? "font-bold text-[#0B53F4]" : "font-semibold text-slate-400"}`}>
                Cuenta
              </span>
            </button>

            {/* 5. Admin */}
            {user?.email === "legionrender@gmail.com" && (
              <button
                onClick={() => { setActiveTab("admin"); setIsMobileMenuOpen(false); }}
                className={`flex flex-col items-center gap-1 cursor-pointer transition-colors duration-150 py-1.5 w-11 ${
                  activeTab === "admin" ? "text-amber-500" : "text-slate-400 hover:text-slate-650"
                }`}
              >
                <ShieldCheck className="w-[22px] h-[22px]" fill={activeTab === "admin" ? "#F59E0B" : "none"} strokeWidth={activeTab === "admin" ? 1.5 : 2} />
                <span className={`text-[10px] tracking-tight transition-all ${activeTab === "admin" ? "font-bold text-amber-500" : "font-semibold text-slate-400"}`}>
                  Admin
                </span>
              </button>
            )}
          </div>

        </div>
      </div>

      {/* 4. MÁS MENU DRAWER SLIDING OVERLAY */}
      {isMobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex flex-col justify-end text-left">
          {/* Glass blur overlay with elegant fade-in */}
          <div 
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-[3px] transition-opacity duration-300"
            onClick={() => setIsMobileMenuOpen(false)}
          />

          {/* Animated Drawer panel sticking at bottom */}
          <div className="relative z-10 bg-white rounded-t-[32px] px-6 pt-5 pb-24 max-h-[82vh] overflow-y-auto shadow-2xl border-t border-slate-200/50 flex flex-col gap-4 font-sans text-left transition-all">
            {/* Grabber accent indicator */}
            <div className="w-12 h-1 bg-slate-200 rounded-full mx-auto mb-1" />

            {/* Header info */}
            <div className="flex items-center justify-between pb-1.5 border-b border-slate-100">
              <div className="text-left">
                <h3 className="text-[17px] font-black tracking-tight text-slate-900 leading-tight">
                  Menú ZenTicket
                </h3>
                <span className="text-slate-450 text-[11px] font-semibold block mt-0.5 select-none text-slate-500">
                  Herramientas y analíticos de facturación
                </span>
              </div>
              <button
                type="button"
                onClick={() => setIsMobileMenuOpen(false)}
                className="w-9 h-9 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-600 transition border-0 outline-none"
              >
                <X className="w-4.5 h-4.5" />
              </button>
            </div>

            {/* Scrollable features list */}
            <div className="flex flex-col gap-2 mt-1">
              
              {/* Item 2: Mis Gastos */}
              <button
                type="button"
                onClick={() => { setActiveTab("gastos"); setIsMobileMenuOpen(false); }}
                className={`flex items-center gap-3.5 p-3 rounded-2xl border transition text-left focus:outline-none ${
                  activeTab === "gastos"
                    ? "bg-[#0B53F4]/5 border-[#0B53F4]/20 text-[#0B53F4]"
                    : "bg-slate-50 hover:bg-slate-100/70 border-slate-150/50 text-slate-800"
                }`}
              >
                <div className={`w-9.5 h-9.5 rounded-xl flex items-center justify-center shrink-0 ${
                  activeTab === "gastos" ? "bg-[#0B53F4] text-white" : "bg-white text-slate-500 border border-slate-200/50 shadow-2xs"
                }`}>
                  <BarChart3 className="w-4.5 h-4.5" />
                </div>
                <div className="flex-1 min-w-0">
                  <span className="text-[13.5px] font-black block tracking-tight leading-tight">Mis Gastos</span>
                  <span className="text-[10.5px] text-slate-400 block mt-0.5 font-semibold leading-tight truncate">Planillas, gráficos y analíticas de consumo</span>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-350 shrink-0" />
              </button>

              {/* Item 2.5: Portales SAT */}
              <button
                type="button"
                onClick={() => { setActiveTab("conectores"); setIsMobileMenuOpen(false); }}
                className={`flex items-center gap-3.5 p-3 rounded-2xl border transition text-left focus:outline-none ${
                  activeTab === "conectores"
                    ? "bg-[#0B53F4]/5 border-[#0B53F4]/20 text-[#0B53F4]"
                    : "bg-slate-50 hover:bg-slate-100/70 border-slate-150/50 text-slate-800"
                }`}
              >
                <div className={`w-9.5 h-9.5 rounded-xl flex items-center justify-center shrink-0 ${
                  activeTab === "conectores" ? "bg-[#0B53F4] text-white" : "bg-white text-slate-500 border border-slate-200/50 shadow-2xs"
                }`}>
                  <Building className="w-4.5 h-4.5" />
                </div>
                <div className="flex-1 min-w-0">
                  <span className="text-[13.5px] font-black block tracking-tight leading-tight">Portales SAT</span>
                  <span className="text-[10.5px] text-slate-400 block mt-0.5 font-semibold leading-tight truncate">Monitoreo y credenciales de portales comerciales</span>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-350 shrink-0" />
              </button>

              {/* Item 3: Mi Cuenta */}
              <button
                type="button"
                onClick={() => { setActiveTab("cuenta"); setIsMobileMenuOpen(false); }}
                className={`flex items-center gap-3.5 p-3 rounded-2xl border transition text-left focus:outline-none ${
                  activeTab === "cuenta"
                    ? "bg-[#0B53F4]/5 border-[#0B53F4]/20 text-[#0B53F4]"
                    : "bg-slate-50 hover:bg-slate-100/70 border-slate-150/50 text-slate-800"
                }`}
              >
                <div className={`w-9.5 h-9.5 rounded-xl flex items-center justify-center shrink-0 ${
                  activeTab === "cuenta" ? "bg-[#0B53F4] text-white" : "bg-white text-slate-500 border border-slate-200/50 shadow-2xs"
                }`}>
                  <User className="w-4.5 h-4.5" />
                </div>
                <div className="flex-1 min-w-0">
                  <span className="text-[13.5px] font-black block tracking-tight leading-tight">Mi Cuenta</span>
                  <span className="text-[10.5px] text-slate-400 block mt-0.5 font-semibold leading-tight truncate">RFC, razón social, régimen y suscripción</span>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-350 shrink-0" />
              </button>

              {/* Item 4: Conocimiento */}
              <button
                type="button"
                onClick={() => { setActiveTab("conocimiento"); setIsMobileMenuOpen(false); }}
                className={`flex items-center gap-3.5 p-3 rounded-2xl border transition text-left focus:outline-none ${
                  activeTab === "conocimiento"
                    ? "bg-[#0B53F4]/5 border-[#0B53F4]/20 text-[#0B53F4]"
                    : "bg-slate-50 hover:bg-slate-100/70 border-slate-150/50 text-slate-800"
                }`}
              >
                <div className={`w-9.5 h-9.5 rounded-xl flex items-center justify-center shrink-0 ${
                  activeTab === "conocimiento" ? "bg-[#0B53F4] text-white" : "bg-white text-slate-500 border border-slate-200/50 shadow-2xs"
                }`}>
                  <BookOpen className="w-4.5 h-4.5" />
                </div>
                <div className="flex-1 min-w-0">
                  <span className="text-[13.5px] font-black block tracking-tight leading-tight">Base de Conocimiento</span>
                  <span className="text-[10.5px] text-slate-400 block mt-0.5 font-semibold leading-tight truncate">Ayuda sobre reglamentos SAT y timbrados</span>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-350 shrink-0" />
              </button>

              {/* Item 5: Auditoría Console */}
              {user?.email === "legionrender@gmail.com" && (
                <button
                  type="button"
                  onClick={() => { setActiveTab("admin"); setIsMobileMenuOpen(false); }}
                  className={`flex items-center gap-3.5 p-3 rounded-2xl border transition text-left focus:outline-none ${
                    activeTab === "admin"
                      ? "bg-[#0B53F4]/5 border-[#0B53F4]/20 text-[#0B53F4]"
                      : "bg-slate-50 hover:bg-slate-100/70 border-slate-150/50 text-slate-800"
                  }`}
                >
                  <div className={`w-9.5 h-9.5 rounded-xl flex items-center justify-center shrink-0 ${
                    activeTab === "admin" ? "bg-[#0B53F4] text-white" : "bg-white text-slate-500 border border-slate-200/50 shadow-2xs"
                  }`}>
                    <ShieldCheck className="w-4.5 h-4.5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className="text-[13.5px] font-black block tracking-tight leading-tight flex items-center gap-1.5">
                      Consola Admin
                      <span className="bg-amber-100 text-amber-800 text-[8.5px] font-black px-1.5 py-0.5 rounded-full border border-amber-250/20">ADMIN_ROOT</span>
                    </span>
                    <span className="text-[10.5px] text-slate-400 block mt-0.5 font-semibold leading-tight truncate">Monitoreo de bases de datos y portales comerciales</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-350 shrink-0" />
                </button>
              )}

            </div>

            {/* Session info + Log Out button */}
            <div className="border-t border-slate-100 pt-3 mt-1 flex flex-col gap-2.5">
              <div className="bg-slate-50 border border-slate-200/30 px-3.5 py-2.5 rounded-xl flex flex-col text-left leading-tight shrink-0">
                <span className="text-[9px] font-extrabold text-blue-600 tracking-wider">CUENTA ACTIVA</span>
                <span className="text-xs font-black text-slate-800 truncate mt-0.5">{user?.email}</span>
              </div>
              <button
                type="button"
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  logout();
                  toast.success("Has cerrado sesión exitosamente.");
                }}
                className="w-full text-[11px] font-black uppercase tracking-widest text-[#EF4444] bg-rose-500/5 hover:bg-rose-500/10 border border-rose-500/10 py-3 rounded-xl transition cursor-pointer flex items-center justify-center gap-2 outline-none"
              >
                <LogOut className="w-4 h-4 stroke-[2.3]" />
                <span>Cerrar Sesión</span>
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;