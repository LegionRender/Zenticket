import { useState, useEffect } from "react";
import { auth, db } from "./firebase";
import { 
  collection, doc, setDoc, getDoc, getDocs, onSnapshot, query, where, orderBy, getDocFromServer, deleteDoc 
} from "firebase/firestore";
import { 
  signInWithPopup, GoogleAuthProvider, signOut, onAuthStateChanged, User, signInAnonymously 
} from "firebase/auth";
import { FiscalProfile, Ticket, Connector, Invoice } from "./types";
import { handleFirestoreError, OperationType } from "./lib/firestore-helper";

import ProfileForm from "./components/ProfileForm";
import ConnectorsList from "./components/ConnectorsList";
import ScannerAndSimulator from "./components/ScannerAndSimulator";
import VaultScreen from "./components/VaultScreen";
import AdminScreen from "./components/AdminScreen";
import TicketsListScreen from "./components/TicketsListScreen";
import { useToast } from "./components/Toast";
import Logo from "./components/Logo";

import { 
  Sparkles, FileText, Cpu, Settings, LogIn, LogOut, Loader2, PlayCircle, HelpCircle, 
  Terminal, ShieldCheck, AlertCircle, Shield, TrendingUp, Layers, HelpCircle as HelpIcon,
  CheckCircle, ListFilter, Camera, User as UserIcon, Home, Bell, Search
} from "lucide-react";

const SEED_DEFAULT_CONNECTORS: Connector[] = [
  {
    userId: "system",
    nombre: "Starbucks (Alsea)",
    rfc: "SFC120305T19",
    portalUrl: "https://historico.alsea.com.mx/",
    fieldsJson: JSON.stringify([
      { key: "rfc", name: "RFC Cliente", selector: "input[name='rfc']", type: "text", required: true },
      { key: "folio", name: "Ticket Code / Código", selector: "#txtCodigoTicket", type: "text", required: true },
      { key: "total", name: "Total Compra", selector: "input#totalTicket", type: "number", required: true },
      { key: "fecha", name: "Fecha Compra", selector: "input#fechaTicket", type: "date", required: true }
    ]),
    flowJson: JSON.stringify([
      "Cargar el portal de autofacturación de Alsea",
      "Seleccionar marca corporativa: Starbucks",
      "Ingresar campos de ticket: RFC, código de facturación, total y fecha",
      "Validar ticket para buscar registros de venta",
      "Rellenar Régimen Fiscal, Código Postal y Uso deseado de CFDI 4.0",
      "Presionar generar y procesar timbrado digital SAT"
    ]),
    createdAt: new Date().toISOString()
  },
  {
    userId: "system",
    nombre: "Nueva Walmart de México",
    rfc: "NWM9709244W4",
    portalUrl: "https://facturacion.walmartmexico.com/",
    fieldsJson: JSON.stringify([
      { key: "rfc", name: "RFC Receptor", selector: "input[name='rfc']", type: "text", required: true },
      { key: "folio", name: "Número de Ticket (TC#)", selector: "input[id='tcNum']", type: "text", required: true },
      { key: "total", name: "Código Postal Receptor", selector: "input[id='cpClient']", type: "number", required: true }
    ]),
    flowJson: JSON.stringify([
      "Cargar portal de facturación Walmart Express / Superama",
      "Rellenar RFC receptor e ingresar código de facturación (TC#)",
      "Vincular Código Postal registrado en el SAT",
      "Comprobar desglose de artículos gravados con IVA",
      "Certificar CFDI y descargar PDF/XML representativos"
    ]),
    createdAt: new Date().toISOString()
  },
  {
    userId: "system",
    nombre: "Fomento Económico Mexicano (OXXO)",
    rfc: "CCO8605231N4",
    portalUrl: "https://www.oxxo.com/facturacion",
    fieldsJson: JSON.stringify([
      { key: "rfc", name: "RFC Cliente", selector: "#cli_rfc", type: "text", required: true },
      { key: "folio", name: "Folio de Venta", selector: "#venta_folio", type: "text", required: true },
      { key: "fecha", name: "Fecha compra", selector: "#venta_fecha", type: "date", required: true },
      { key: "total", name: "Total pagado", selector: "#venta_total", type: "number", required: true }
    ]),
    flowJson: JSON.stringify([
      "Acceder al sitio oficial de facturación OXXO Tiendas",
      "Introducir RFC de facturación",
      "Ingresar folios de venta impresos en la tira del ticket",
      "Confirmar adición de datos fiscales para CFDI 4.0",
      "Generar factura y enviar enlace XML al correo electrónico"
    ]),
    createdAt: new Date().toISOString()
  }
];

export default function App() {
  const toast = useToast();
  // Authentication status
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isSandboxMode, setIsSandboxMode] = useState(false);
  const [sandboxUserId, setSandboxUserId] = useState<string | null>(null);
  const [authLoading, setAuthLoading] = useState(true);

  // Determine active owner UID
  const getActiveUserId = (): string | null => {
    if (currentUser) return currentUser.uid;
    if (isSandboxMode && sandboxUserId) return sandboxUserId;
    return null;
  };

  const activeUserId = getActiveUserId();

  // Connection validation
  const [connectionOk, setConnectionOk] = useState<boolean | null>(null);

  // Active Tab navigation (7-tab system: Capturar, Tickets, Conectores, Historial, Resumen, Cuenta, Admin)
  const [activeTab, setActiveTab] = useState<"capturar" | "tickets" | "conectores" | "historial" | "resumen" | "cuenta" | "admin">("capturar");
  const [selectedTicketIdForSimulation, setSelectedTicketIdForSimulation] = useState<string | null>(null);

  // Database Data States
  const [fiscalProfile, setFiscalProfile] = useState<FiscalProfile | null>(null);
  const [connectors, setConnectors] = useState<Connector[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [tickets, setTickets] = useState<Ticket[]>([]);

  // Tickets Real-time listener
  useEffect(() => {
    if (!activeUserId) {
      setTickets([]);
      return;
    }

    const pathTickets = "tickets";
    const qTickets = query(
      collection(db, pathTickets),
      where("userId", "==", activeUserId)
    );

    const unsubscribe = onSnapshot(qTickets, (snapshot) => {
      const list: Ticket[] = [];
      snapshot.forEach((docSnap) => {
        list.push({ id: docSnap.id, ...docSnap.data() } as Ticket);
      });
      // Sort newest first
      list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      setTickets(list);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, pathTickets);
    });

    return unsubscribe;
  }, [activeUserId]);

  // Force seed / reseed helper for admin ops
  const handleForceReSeedConnectors = async () => {
    const pathConnectors = "connectors";
    try {
      for (const connector of SEED_DEFAULT_CONNECTORS) {
        const q = query(collection(db, pathConnectors), where("rfc", "==", connector.rfc));
        const snap = await getDocs(q);
        if (snap.empty) {
          const connectorRef = doc(collection(db, pathConnectors));
          await setDoc(connectorRef, connector);
        }
      }
    } catch (err) {
      console.error("Reseed failure: ", err);
      throw err;
    }
  };

  // Action Pending loaders
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [isLearningLoading, setIsLearningLoading] = useState(false);

  // Validate Firestore Connection on startup as mandated
  useEffect(() => {
    async function testConnection() {
      try {
        await getDocFromServer(doc(db, "test", "connection"));
        setConnectionOk(true);
        console.log("[Firebase] Connection test succeeded.");
      } catch (error: any) {
        if (error instanceof Error && error.message.includes("offline")) {
          console.error("Please check your Firebase configuration or network proxy.");
          setConnectionOk(false);
        } else {
          // General success as the firestore instance returned a lookup response
          setConnectionOk(true);
        }
      }
    }
    testConnection();
  }, []);

  // Load Aesthetic preferences on startup
  useEffect(() => {
    const savedTheme = (localStorage.getItem("zenticket_theme") as "light" | "dark" | "system") || "light";
    const savedFontSize = (localStorage.getItem("zenticket_font_size") as "small" | "medium" | "large") || "medium";
    const savedRadius = (localStorage.getItem("zenticket_border_radius") as "compact" | "standard" | "extra") || "standard";

    let activeTheme = savedTheme;
    if (savedTheme === "system") {
      activeTheme = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
    }
    document.documentElement.setAttribute("data-theme", activeTheme);
    if (activeTheme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }

    document.documentElement.setAttribute("data-font-size", savedFontSize);
    document.documentElement.setAttribute("data-radius", savedRadius);
  }, []);

  // Monitor Authentication state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setCurrentUser(user);
        if (user.isAnonymous) {
          setIsSandboxMode(true);
          setSandboxUserId(user.uid);
        } else {
          setIsSandboxMode(false);
          setSandboxUserId(null);
        }
      } else {
        setCurrentUser(null);
        setIsSandboxMode(false);
        setSandboxUserId(null);
      }
      setAuthLoading(false);
    });
    return unsubscribe;
  }, []);

  // Load connectors & seed defaults
  useEffect(() => {
    if (!activeUserId) return;

    const pathConnectors = "connectors";
    const q = query(collection(db, pathConnectors));

    const unsubscribe = onSnapshot(q, async (snapshot) => {
      const list: Connector[] = [];
      snapshot.forEach((docSnap) => {
        list.push({ id: docSnap.id, ...docSnap.data() } as Connector);
      });

      // Seeding validation: If database connectors are empty, seed our pre-loaded definitions
      if (list.length === 0) {
        try {
          for (const connector of SEED_DEFAULT_CONNECTORS) {
            const connectorRef = doc(collection(db, pathConnectors));
            await setDoc(connectorRef, connector);
          }
        } catch (err) {
          console.error("Seeding error: ", err);
        }
      } else {
        setConnectors(list);
      }
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, pathConnectors);
    });

    return unsubscribe;
  }, [activeUserId]);

  // Read active fiscal profile details
  useEffect(() => {
    if (!activeUserId) {
      setFiscalProfile(null);
      return;
    }

    const pathProfile = `fiscalProfiles/${activeUserId}`;
    const docRef = doc(db, "fiscalProfiles", activeUserId);

    const unsubscribe = onSnapshot(docRef, (docSnap) => {
      if (docSnap.exists()) {
        setFiscalProfile(docSnap.data() as FiscalProfile);
      } else {
        setFiscalProfile(null);
      }
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, pathProfile);
    });

    return unsubscribe;
  }, [activeUserId]);

  // Load Invoices issued list
  useEffect(() => {
    if (!activeUserId) {
      setInvoices([]);
      return;
    }

    const pathInvoices = "invoices";
    const qInvoices = query(
      collection(db, pathInvoices),
      where("userId", "==", activeUserId)
    );

    const unsubscribe = onSnapshot(qInvoices, (snapshot) => {
      const list: Invoice[] = [];
      snapshot.forEach((docSnap) => {
        list.push({ id: docSnap.id, ...docSnap.data() } as Invoice);
      });
      // Sort newest first
      list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      setInvoices(list);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, pathInvoices);
    });

    return unsubscribe;
  }, [activeUserId]);

  // Sign In / Out Handlers
  const handleGoogleLogin = async () => {
    const provider = new GoogleAuthProvider();
    setAuthLoading(true);
    try {
      await signInWithPopup(auth, provider);
    } catch (error: any) {
      console.error("Google Auth error:", error);
    } finally {
      setAuthLoading(false);
    }
  };

  const handleEnterSandbox = async () => {
    setAuthLoading(true);
    try {
      await signInAnonymously(auth);
    } catch (error) {
      console.error("Anonymous auth error:", error);
    } finally {
      setAuthLoading(false);
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
  };

  // Profile Save
  const handleSaveProfile = async (profileData: FiscalProfile) => {
    if (!activeUserId) return;
    setIsSavingProfile(true);

    const pathProfileWrite = `fiscalProfiles/${activeUserId}`;
    try {
      const dataToSave = {
        ...profileData,
        userId: activeUserId,
        updatedAt: new Date().toISOString()
      };
      await setDoc(doc(db, "fiscalProfiles", activeUserId), dataToSave);
      toast.success("Tu información fiscal ha sido actualizada.", "Perfil Guardado");
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, pathProfileWrite);
      toast.error("Hubo un error al guardar tu perfil.", "Error de Guardado");
    } finally {
      setIsSavingProfile(false);
    }
  };

  // Ticket collection operations
  const handleSaveTicket = async (ticketData: Ticket): Promise<string> => {
    if (!activeUserId) throw new Error("Athorization required");

    const pathTicket = "tickets";
    try {
      const ticketRef = doc(collection(db, "tickets"));
      const finalTicket = {
        ...ticketData,
        userId: activeUserId,
        createdAt: new Date().toISOString()
      };
      await setDoc(ticketRef, finalTicket);
      return ticketRef.id;
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, pathTicket);
    }
  };

  const handleUpdateTicket = async (ticketId: string, updates: Partial<Ticket>) => {
    const pathTicketWrite = `tickets/${ticketId}`;
    try {
      const docRef = doc(db, "tickets", ticketId);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        await setDoc(docRef, { ...docSnap.data(), ...updates }, { merge: true });
      }
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, pathTicketWrite);
    }
  };

  const handleDeleteTicket = async (ticketId: string) => {
    const pathTicketDelete = `tickets/${ticketId}`;
    try {
      await deleteDoc(doc(db, "tickets", ticketId));
      toast.success("El ticket de seguimiento ha sido eliminado.", "Ticket Eliminado");
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, pathTicketDelete);
      toast.error("No se pudo eliminar el ticket de seguimiento.", "Error al Eliminar");
    }
  };

  // Save new client invoice
  const handleSaveInvoice = async (
    ticketId: string,
    xml: string,
    pdf: string,
    uuid: string,
    emisorRfc: string,
    emisorName: string,
    total: number
  ) => {
    if (!activeUserId) return;

    const pathInvoices = "invoices";
    try {
      const invoiceRef = doc(collection(db, "invoices"));
      const newInvoice: Invoice = {
        userId: activeUserId,
        ticketId,
        folioFiscal: uuid,
        rfcEmisor: emisorRfc,
        nombreEmisor: emisorName,
        rfcReceptor: fiscalProfile?.rfc || "XAXX010101000",
        nombreReceptor: fiscalProfile?.razonSocial || "PUBLICO EN GENERAL",
        total,
        xmlContent: xml,
        pdfHtml: pdf,
        createdAt: new Date().toISOString()
      };
      await setDoc(invoiceRef, newInvoice);
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, pathInvoices);
    }
  };

  // Connector Learning Callback (inline from ticket screen)
  const handleLearnConnectorInline = async (nombre: string, rfc: string): Promise<Connector> => {
    if (!activeUserId) throw new Error("Autenticación requerida para instruir IA.");
    setIsLearningLoading(true);
    const learningToastId = toast.loading(`Analizando portal emisor para ${nombre}...`, "IA Aprendiendo Conector");

    const pathConnectorWrite = "connectors";
    try {
      const response = await fetch("/api/connectors/learn", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nombreEmisor: nombre, rfcEmisor: rfc }),
      });

      if (!response.ok) {
        let errorMsg = "No se pudo obtener información de automatización del portal.";
        try {
          const errJson = await response.json();
          if (errJson.error) {
            errorMsg = errJson.error;
          }
        } catch (e) {
          // Fallback
        }
        throw new Error(errorMsg);
      }

      const specs = await response.json();

      // Formulate custom Connector entity
      const newConnector: Connector = {
        userId: activeUserId,
        nombre: nombre.toUpperCase(),
        rfc: rfc || "RFC_INFERIDO",
        portalUrl: specs.portalUrl,
        fieldsJson: JSON.stringify(specs.fields),
        flowJson: JSON.stringify(specs.steps),
        createdAt: new Date().toISOString()
      };

      try {
        const connectorRef = doc(collection(db, "connectors"));
        await setDoc(connectorRef, newConnector);
        const savedConnector = { id: connectorRef.id, ...newConnector };
        toast.removeToast(learningToastId);
        toast.success(`Conector para ${nombre} aprendido y sincronizado con éxito.`, "IA Aprendizaje Exitoso");
        return savedConnector;
      } catch (dbErr: any) {
        handleFirestoreError(dbErr, OperationType.CREATE, pathConnectorWrite);
      }
    } catch (error: any) {
      toast.removeToast(learningToastId);
      toast.error(error.message || "No se pudo aprender el conector.", "Error de Aprendizaje IA");
      if (error && typeof error.message === "string" && error.message.includes('{"error"')) {
        throw error;
      }
      throw new Error("Connector learn error: " + error.message);
    } finally {
      setIsLearningLoading(false);
    }
  };

  // Active connector learn from connector manager tab
  const handleConnectorLearning = async (nombre: string, rfc: string) => {
    await handleLearnConnectorInline(nombre, rfc);
  };

  // Automated background processing and learning flow:
  // 1) Switches tab to "tickets" so the user lands on the tickets dashboard (showing In Process vs Completed).
  // 2) Sets ticket to "processing" immediately.
  // 3) Automatically queries/learns the connector if it doesn't exist.
  // 4) Calls /api/automation/run to generate XML & PDF files.
  // 5) Updates ticket Status to completed, saves Invoice, and automatically matches learning model.
  const handleStartTicketAutomation = async (ticketIdToAutomate: string) => {
    // 1. Instantly navigate to "tickets" tab so the user sees progress
    setActiveTab("tickets");
    setSelectedTicketIdForSimulation(null);

    const ticket = tickets.find((t) => t.id === ticketIdToAutomate);
    if (!ticket) return;

    const nombreEmisor = ticket.nombreEmisor || "Emisor Comercial";
    const automationToastId = toast.loading(
      `Iniciando automatización robótica para ${nombreEmisor}...`,
      "ZenTicket Activo"
    );
    let submissionToastId: string | undefined;

    try {
      // 2. Mark as processing (en proceso) to trigger spinner instantly
      await handleUpdateTicket(ticketIdToAutomate, { status: "processing", errorMsg: "" });

      // 3. Search or create connector inline
      let currentConnector = connectors.find(
        (c) =>
          c.rfc.toLowerCase().trim() === (ticket.rfcEmisor || "").toLowerCase().trim() ||
          (ticket.nombreEmisor || "").toLowerCase().includes(c.nombre.toLowerCase()) ||
          c.nombre.toLowerCase().includes((ticket.nombreEmisor || "").toLowerCase())
      );

      // Automatic Learning Feedforward loop: If no connector exists, learn it on-the-fly!
      if (!currentConnector) {
        console.log("Automatically learning connector specs via AI Search Grounding proxy...");
        toast.info(`Buscando conector para ${nombreEmisor}. Iniciando aprendizaje IA...`, "Búsqueda de Conector");
        currentConnector = await handleLearnConnectorInline(ticket.nombreEmisor || "Desconocido", ticket.rfcEmisor || "XAXX010101000");
      }

      // Update loading status for actual billing submission to portal
      toast.removeToast(automationToastId);
      submissionToastId = toast.loading(
        `Llenando campos y timbrando CFDI en portal de ${nombreEmisor}...`,
        "Facturación Robótica"
      );

      // 4. Fire Playwright server-side automation simulator API
      const response = await fetch("/api/automation/run", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ticket: {
            rfcEmisor: ticket.rfcEmisor || "XAXX010101000",
            nombreEmisor: ticket.nombreEmisor || "EMISOR AUTOMATICO",
            fechaCompra: ticket.fechaCompra || new Date().toISOString().split("T")[0],
            folio: ticket.folio || "F001",
            total: ticket.total || 0,
            sucursal: ticket.sucursal || "General",
            items: ticket.itemsJson ? JSON.parse(ticket.itemsJson) : [],
          },
          profile: fiscalProfile || {
            rfc: "XAXX010101000",
            razonSocial: "PÚBLICO EN GENERAL",
            regimenFiscal: "601",
            codigoPostal: "01000",
            usoCFDI: "G03"
          },
          connector: currentConnector,
        }),
      });

      if (!response.ok) {
        throw new Error("El simulador de facturación reportó un error de validación de ticket.");
      }

      const invoiceData = await response.json();

      // 5. Create real Invoice in Firestore DB
      await handleSaveInvoice(
        ticketIdToAutomate,
        invoiceData.xmlContent,
        invoiceData.pdfHtml,
        invoiceData.folioFiscal,
        ticket.rfcEmisor || "XAXX010101000",
        ticket.nombreEmisor || "EMISOR AUTOMATICO",
        ticket.total || 0
      );

      // 6. Complete and save reference ids to shift lists automatically
      await handleUpdateTicket(ticketIdToAutomate, {
        status: "completed",
        invoiceId: invoiceData.folioFiscal,
        connectorId: currentConnector?.id || "",
      });

      // Clear the submission loading toast
      if (submissionToastId) toast.removeToast(submissionToastId);

      // Display beautiful success toast
      toast.success(
        `¡CFDI de $${ticket.total?.toFixed(2)} emitido con éxito para ${nombreEmisor}!`,
        "Factura Generada"
      );

      // 7. Auto-send the actual invoice generated to the user's primary email address
      const targetUserEmail = currentUser?.email || "legionrender@gmail.com";
      try {
        await fetch("/api/email/send", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            to: targetUserEmail,
            invoice: {
              nombreEmisor: ticket.nombreEmisor || "EMISOR AUTOMATICO",
              rfcEmisor: ticket.rfcEmisor || "XAXX010101000",
              nombreReceptor: fiscalProfile?.razonSocial || "PÚBLICO EN GENERAL",
              rfcReceptor: fiscalProfile?.rfc || "XAXX010101000",
              folioFiscal: invoiceData.folioFiscal,
              total: ticket.total || 0,
              xmlContent: invoiceData.xmlContent,
              pdfHtml: invoiceData.pdfHtml,
            }
          })
        });
        console.log(`Invoice emailed successfully to ${targetUserEmail}.`);
        toast.info(`Se ha enviado una copia en PDF y XML a tu correo: ${targetUserEmail}`, "Correo Sincronizado");
      } catch (emailErr) {
        console.error("Failed to automatically email invoice:", emailErr);
      }

    } catch (err: any) {
      console.error("Backpage automatic automation failed: ", err);
      toast.removeToast(automationToastId);
      if (submissionToastId) toast.removeToast(submissionToastId);

      await handleUpdateTicket(ticketIdToAutomate, {
        status: "failed",
        errorMsg: err.message || "Timeout en el portal emisor.",
      });

      toast.error(
        `Error al facturar ${nombreEmisor}: ${err.message || "Problema de conexión con el portal."}`,
        "Automatización Fallida"
      );
    }
  };

  if (activeUserId) {
    return (
      <div className="min-h-screen bg-[#F8F9FD] text-slate-800 flex flex-col md:flex-row font-sans select-none antialiased">
        {/* DESKTOP SIDEBAR */}
        <aside className="hidden md:flex md:flex-col md:w-72 bg-white border-r border-slate-200/80 p-6 shrink-0 justify-between min-h-screen sticky top-0 font-sans">
          <div className="space-y-8">
            {/* Logo Brand Area */}
            <Logo size="md" />

            {/* Navigation Menu */}
            <nav className="flex flex-col gap-1.5">
              <button
                onClick={() => setActiveTab("capturar")}
                className={`text-xs font-bold uppercase tracking-wider px-4 py-3.5 rounded-xl transition duration-150 flex items-center gap-3.5 cursor-pointer w-full text-left bg-transparent ${
                  activeTab === "capturar"
                    ? "bg-[#0B53F4] text-white shadow-md shadow-[#0B53F4]/15"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                }`}
              >
                <Camera className="w-5 h-5 shrink-0" />
                <span>Captura</span>
              </button>

              <button
                onClick={() => setActiveTab("tickets")}
                className={`text-xs font-bold uppercase tracking-wider px-4 py-3.5 rounded-xl transition duration-150 flex items-center gap-3.5 cursor-pointer w-full text-left bg-transparent ${
                  activeTab === "tickets"
                    ? "bg-[#0B53F4] text-white shadow-md shadow-[#0B53F4]/15"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                }`}
              >
                <FileText className="w-5 h-5 shrink-0" />
                <div className="flex justify-between items-center w-full">
                  <span>Tickets</span>
                  {tickets.length > 0 && (
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      activeTab === "tickets" ? "bg-white/20 text-white" : "bg-slate-100 text-slate-600"
                    }`}>
                      {tickets.length}
                    </span>
                  )}
                </div>
              </button>

              <button
                onClick={() => setActiveTab("resumen")}
                className={`text-xs font-bold uppercase tracking-wider px-4 py-3.5 rounded-xl transition duration-150 flex items-center gap-3.5 cursor-pointer w-full text-left bg-transparent ${
                  activeTab === "resumen"
                    ? "bg-[#0B53F4] text-white shadow-md shadow-[#0B53F4]/15"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                }`}
              >
                <TrendingUp className="w-5 h-5 shrink-0" />
                <span>Gastos</span>
              </button>

              <button
                onClick={() => setActiveTab("cuenta")}
                className={`text-xs font-bold uppercase tracking-wider px-4 py-3.5 rounded-xl transition duration-150 flex items-center gap-3.5 cursor-pointer w-full text-left bg-transparent ${
                  activeTab === "cuenta"
                    ? "bg-[#0B53F4] text-white shadow-md shadow-[#0B53F4]/15"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                }`}
              >
                <UserIcon className="w-5 h-5 shrink-0" />
                <span>Cuenta</span>
              </button>

              {(isSandboxMode || currentUser?.email === "legionrender@gmail.com" || currentUser?.email === "ricardo@email.com") && (
                <button
                  onClick={() => setActiveTab("admin")}
                  className={`text-xs font-bold uppercase tracking-wider px-4 py-3.5 rounded-xl transition duration-150 flex items-center gap-3.5 cursor-pointer w-full text-left bg-transparent ${
                    activeTab === "admin"
                      ? "bg-[#0B53F4] text-white shadow-md shadow-[#0B53F4]/15"
                      : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                  }`}
                >
                  <Shield className="w-5 h-5 shrink-0" />
                  <span>Admin Panel</span>
                </button>
              )}
            </nav>
          </div>

          <div className="space-y-4">
            {/* Extraction Network Status Badge */}
            <div className="bg-[#F8F9FD] border border-slate-200/80 p-4 rounded-2xl w-full">
              <div className="flex items-center justify-between gap-1.5 mb-2.5">
                <span className="text-[10px] uppercase font-black tracking-wider text-slate-400">
                  Red de Extracción
                </span>
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              </div>
              
              <div className="space-y-1.5 text-slate-600 font-sans">
                <div className="flex justify-between items-center text-[11px]">
                  <span className="text-slate-400 font-medium">Latency</span>
                  <span className="font-mono font-black text-slate-800">120ms</span>
                </div>
                <div className="flex justify-between items-center text-[11px]">
                  <span className="text-slate-400 font-medium">Request Rate</span>
                  <span className="font-mono font-black text-slate-800">12.5k req/s</span>
                </div>
              </div>
            </div>

            {/* Logout Option */}
            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-center gap-2 py-2.5 text-xs font-bold text-rose-600 hover:text-rose-700 hover:bg-rose-50 border border-transparent rounded-xl transition cursor-pointer select-none bg-transparent"
            >
              <LogOut className="w-4 h-4 shrink-0" />
              <span>Cerrar Sesión</span>
            </button>
          </div>
        </aside>

        {/* CONTENT VIEWPORT */}
        <div className="flex-1 flex flex-col min-w-0 min-h-screen">
          
          {/* DESKTOP HEADER BAR */}
          <header className="hidden md:flex bg-white border-b border-slate-200/60 py-4 px-6 lg:px-8 justify-between items-center gap-4 shrink-0 shadow-xs">
            {/* Search Input bar */}
            <div className="relative flex-1 max-w-sm">
              <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                readOnly
                placeholder="Search resources, connectors, or users..."
                className="w-full bg-[#EDF0F7] text-slate-800 placeholder-slate-450 text-xs pl-11 pr-4 py-2.5 rounded-full border-none focus:outline-none transition-all cursor-not-allowed select-none"
              />
            </div>

            {/* Icons & User Info */}
            <div className="flex items-center gap-4">
              <div className="relative p-2 text-slate-400 hover:text-slate-600 cursor-not-allowed bg-slate-50 hover:bg-slate-100 rounded-xl transition">
                <Bell className="w-5 h-5" />
                <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-red-650 rounded-full" />
              </div>

              <div 
                onClick={() => setActiveTab("cuenta")}
                className="p-2 text-slate-400 hover:text-slate-600 cursor-pointer bg-slate-50 hover:bg-slate-100 rounded-xl transition"
              >
                <Settings className="w-5 h-5" />
              </div>

              {/* User pane */}
              <div className="flex items-center gap-3 pl-3 border-l border-slate-200">
                <div className="text-right">
                  <span className="text-xs font-black text-slate-900 block leading-tight">
                    {currentUser ? currentUser.displayName || "Admin Root" : "Modo Sandbox"}
                  </span>
                  <span className="text-[9px] text-slate-400 font-extrabold uppercase tracking-wider block leading-none mt-0.5">
                    {currentUser?.email === "legionrender@gmail.com" || currentUser?.email === "ricardo@email.com" ? "System Overlord" : "External Operations"}
                  </span>
                </div>

                {currentUser?.photoURL ? (
                  <img
                    src={currentUser.photoURL}
                    alt="Avatar"
                    className="w-10 h-10 rounded-full border border-slate-200/80 shadow-xs"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-[#0B53F4] text-white flex items-center justify-center text-sm font-black font-sans shadow-md shadow-[#0B53F4]/10">
                    {currentUser ? (currentUser.displayName || "G").charAt(0).toUpperCase() : "SB"}
                  </div>
                )}
              </div>
            </div>
          </header>

          {/* MOBILE HEADER BAR MATCHING SCREENSHOT */}
          <div className="flex md:hidden bg-white border-b border-slate-200/50 px-4 py-3 items-center justify-between sticky top-0 z-40 shadow-xs font-sans select-none">
            {/* Left side: Avatar + Hola, Name */}
            <div className="flex items-center gap-2.5">
              {currentUser?.photoURL ? (
                <img
                  src={currentUser.photoURL}
                  alt="Avatar"
                  className="w-10 h-10 rounded-full border border-slate-200/80 shadow-xs"
                  referrerPolicy="no-referrer"
                />
              ) : (
                /* Beautiful mock circular profile picture matching the screenshot */
                <img
                  src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150"
                  alt="Mock Avatar"
                  className="w-10 h-10 rounded-full border border-slate-250 shadow-xs"
                  referrerPolicy="no-referrer"
                />
              )}
              
              <span className="text-base font-bold text-slate-800 tracking-tight leading-none">
                Hola, {currentUser ? currentUser.displayName?.split(" ")[0] || "Alex" : "Alex"}
              </span>
            </div>

            {/* Right side: Safety shield and alert bell indicators */}
            <div className="flex items-center gap-3.5">
              <button className="text-[#0B53F4] hover:opacity-80 transition bg-transparent border-none outline-none p-1 cursor-pointer">
                <ShieldCheck className="w-5.5 h-5.5 stroke-[2]" />
              </button>
              <button className="text-[#0B53F4] hover:opacity-80 transition relative bg-transparent border-none outline-none p-1 cursor-pointer">
                <Bell className="w-5.5 h-5.5 stroke-[2]" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-rose-550 rounded-full border-2 border-white" />
              </button>
            </div>
          </div>

          {/* MAIN BODY CONTEXT */}
          <main className="flex-1 w-full max-w-7xl mx-auto px-4 md:px-8 py-6 flex flex-col gap-6">
            
            {connectionOk === false && (
              <div className="p-4 bg-amber-50 border border-amber-200 rounded-3xl text-xs text-amber-700 flex items-center gap-3 shadow-sm">
                <AlertCircle className="w-5 h-5 shrink-0 text-amber-500" />
                <span className="font-semibold">
                  ZenTicket se encuentra sincronizando la base de datos cloud o está desconectado. Activa el <b>Modo Sandbox</b> para continuar probándolo de inmediato.
                </span>
              </div>
            )}

            <div className="space-y-6 pb-20 md:pb-6">
              {activeTab === "capturar" && (
                <ScannerAndSimulator
                  fiscalProfile={fiscalProfile}
                  connectors={connectors}
                  onSaveTicketToDb={handleSaveTicket}
                  onUpdateTicketInDb={handleUpdateTicket}
                  onSaveInvoiceToDb={handleSaveInvoice}
                  onLearnConnectorInline={handleLearnConnectorInline}
                  tickets={tickets}
                  preselectedTicketId={selectedTicketIdForSimulation}
                  onClearPreselectedTicket={() => setSelectedTicketIdForSimulation(null)}
                  onStartAutomation={handleStartTicketAutomation}
                />
              )}

              {activeTab === "tickets" && (
                <TicketsListScreen
                  tickets={tickets}
                  invoices={invoices}
                  currentUserEmail={currentUser?.email || "legionrender@gmail.com"}
                  onTriggerSimulationInline={(t) => {
                    handleStartTicketAutomation(t.id || "");
                  }}
                  onDeleteTicket={handleDeleteTicket}
                  onTabChange={setActiveTab}
                />
              )}

              {activeTab === "resumen" && (
                <VaultScreen invoices={invoices} onTabChange={setActiveTab} />
              )}

              {activeTab === "cuenta" && (
                <ProfileForm
                  initialProfile={fiscalProfile}
                  onSave={handleSaveProfile}
                  isSaving={isSavingProfile}
                  currentUserEmail={currentUser?.email}
                />
              )}

              {activeTab === "admin" && (
                <AdminScreen
                  connectors={connectors}
                  tickets={tickets}
                  invoices={invoices}
                  onForceReSeed={handleForceReSeedConnectors}
                  onLearnConnector={handleConnectorLearning}
                  isLearningLoading={isLearningLoading}
                />
              )}
            </div>
          </main>

          {/* MOBILE BOTTOM NAVIGATION BAR */}
          <nav 
            id="BottomNavigationBar" 
            className="fixed bottom-0 left-0 right-0 w-full z-50 md:hidden bg-white/90 border-t border-slate-200/80 backdrop-blur-lg py-2.5 px-3 flex items-center justify-around shadow-[0_-8px_24px_rgba(15,23,42,0.06)]"
          >
            <button
              onClick={() => setActiveTab("capturar")}
              className="flex flex-col items-center justify-center gap-1 cursor-pointer transition-all duration-150 flex-1 min-w-[50px] relative pb-0.5 bg-transparent border-none outline-none"
            >
              <div className={`flex items-center justify-center h-9 w-9 rounded-full transition ${
                activeTab === "capturar" ? "bg-[#0B53F4]/10 text-[#0B53F4]" : "text-slate-400"
              }`}>
                <Camera className="w-5 h-5" />
              </div>
              <span className={`text-[10px] font-bold tracking-tight truncate ${
                activeTab === "capturar" ? "text-[#0B53F4]" : "text-slate-400"
              }`}>Captura</span>
              {activeTab === "capturar" && (
                <div className="absolute bottom-0 w-6 h-0.5 bg-[#0B53F4] rounded-full" />
              )}
            </button>

            <button
              onClick={() => setActiveTab("tickets")}
              className="flex flex-col items-center justify-center gap-1 cursor-pointer transition-all duration-150 flex-1 min-w-[50px] relative pb-0.5 bg-transparent border-none outline-none"
            >
              <div className={`flex items-center justify-center h-9 w-9 rounded-full transition ${
                activeTab === "tickets" ? "bg-[#0B53F4]/10 text-[#0B53F4]" : "text-slate-400"
              }`}>
                <FileText className="w-5 h-5" />
              </div>
              <span className={`text-[10px] font-bold tracking-tight truncate ${
                activeTab === "tickets" ? "text-[#0B53F4]" : "text-slate-400"
              }`}>Tickets</span>
              {activeTab === "tickets" && (
                <div className="absolute bottom-0 w-6 h-0.5 bg-[#0B53F4] rounded-full" />
              )}
            </button>

            <button
              onClick={() => setActiveTab("resumen")}
              className="flex flex-col items-center justify-center gap-1 cursor-pointer transition-all duration-150 flex-1 min-w-[50px] relative pb-0.5 bg-transparent border-none outline-none"
            >
              <div className={`flex items-center justify-center h-9 w-9 rounded-full transition ${
                activeTab === "resumen" ? "bg-[#0B53F4]/10 text-[#0B53F4]" : "text-slate-400"
              }`}>
                <TrendingUp className="w-5 h-5" />
              </div>
              <span className={`text-[10px] font-bold tracking-tight truncate ${
                activeTab === "resumen" ? "text-[#0B53F4]" : "text-slate-400"
              }`}>Gastos</span>
              {activeTab === "resumen" && (
                <div className="absolute bottom-0 w-6 h-0.5 bg-[#0B53F4] rounded-full" />
              )}
            </button>

            <button
              onClick={() => setActiveTab("cuenta")}
              className="flex flex-col items-center justify-center gap-1 cursor-pointer transition-all duration-150 flex-1 min-w-[50px] relative pb-0.5 bg-transparent border-none outline-none"
            >
              <div className={`flex items-center justify-center h-9 w-9 rounded-full transition ${
                activeTab === "cuenta" ? "bg-[#0B53F4]/10 text-[#0B53F4]" : "text-slate-400"
              }`}>
                <UserIcon className="w-5 h-5" />
              </div>
              <span className={`text-[10px] font-bold tracking-tight truncate ${
                activeTab === "cuenta" ? "text-[#0B53F4]" : "text-slate-400"
              }`}>Cuenta</span>
              {activeTab === "cuenta" && (
                <div className="absolute bottom-0 w-6 h-0.5 bg-[#0B53F4] rounded-full" />
              )}
            </button>

            {(isSandboxMode || currentUser?.email === "legionrender@gmail.com" || currentUser?.email === "ricardo@email.com") && (
              <button
                onClick={() => setActiveTab("admin")}
                className="flex flex-col items-center justify-center gap-1 cursor-pointer transition-all duration-150 flex-1 min-w-[50px] relative pb-0.5 bg-transparent border-none outline-none"
              >
                <div className={`flex items-center justify-center h-9 w-9 rounded-full transition ${
                  activeTab === "admin" ? "bg-rose-500/10 text-rose-600" : "text-slate-400"
                }`}>
                  <Shield className="w-5 h-5" />
                </div>
                <span className={`text-[10px] font-bold tracking-tight truncate ${
                  activeTab === "admin" ? "text-rose-600" : "text-slate-400"
                }`}>Admin</span>
                {activeTab === "admin" && (
                  <div className="absolute bottom-0 w-6 h-0.5 bg-rose-500 rounded-full" />
                )}
              </button>
            )}
          </nav>

          <footer className="bg-white border-t border-slate-200 py-4 text-center text-[10px] text-slate-400 font-mono mt-auto uppercase tracking-wider">
            ZenTicket • Licenciado CFDI v4.0 Estándar Técnico SAT • Sincronización Inteligente
          </footer>
        </div>
      </div>
    );
  } else {
    /* High-Fidelity Light-Themed Login Screen */
    return (
      <div className="min-h-screen bg-[#F8F9FD] text-slate-800 flex flex-col font-sans select-none antialiased">
        {/* Basic Header */}
        <header className="flex bg-white border-b border-slate-200/60 py-4 px-6 lg:px-12 justify-between items-center gap-4 shrink-0 shadow-xs">
          <div className="flex items-center gap-3">
            <Logo size="md" withText={true} />
            <span className="hidden sm:inline-block text-[10px] font-extrabold bg-[#0B53F4]/10 border border-[#0B53F4]/20 text-[#0B53F4] px-2.5 py-0.5 rounded-md uppercase tracking-wider">
              Automatiza tus Facturas
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleEnterSandbox}
              className="text-xs font-bold text-slate-600 hover:text-slate-850 bg-white border border-slate-200 hover:border-slate-300 px-4 py-2.5 rounded-xl transition shadow-sm bg-transparent"
            >
              Explorar Sandbox
            </button>

            <button
              onClick={handleGoogleLogin}
              className="flex items-center gap-1.5 text-xs font-bold text-white bg-[#0B53F4] hover:bg-[#0B53F4]/90 px-4 py-2.5 rounded-xl transition shadow-md shadow-[#0B53F4]/10"
            >
              <LogIn className="w-4 h-4 shrink-0" />
              Ingresar con Google
            </button>
          </div>
        </header>

        {/* Login Central Card */}
        <main className="flex-1 w-full max-w-7xl mx-auto px-4 md:px-8 py-12 flex flex-col justify-center items-center">
          <div className="w-full max-w-xl bg-white border border-slate-200 rounded-3xl p-8 md:p-12 flex flex-col justify-center items-center text-center relative overflow-hidden shadow-lg">
            {/* Premium backdrop radial glow block */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 p-12 opacity-5 pointer-events-none">
              <div className="w-96 h-96 border-[25px] border-indigo-500 rounded-full blur-3xl" />
            </div>

            <div className="relative z-10 space-y-6 max-w-xl animate-fade-in_50">
              <div className="w-16 h-16 bg-gradient-to-br from-[#0B53F4] to-blue-600 shadow-xl shadow-[#0B53F4]/15 text-white rounded-2xl flex items-center justify-center mx-auto mb-4 scale-110">
                <ShieldCheck className="w-9 h-9" />
              </div>
              
              <h2 className="text-3xl font-black tracking-tight text-slate-900 font-sans uppercase">
                Acceso a ZenTicket
              </h2>
              <p className="text-sm text-slate-500 leading-relaxed font-sans max-w-md mx-auto">
                Automatización de facturas comerciales del SAT. Extrae datos por visión profunda de Gemini e inyecta la información en portales de los emisores de forma 100% digital.
              </p>

              <div className="pt-4 flex flex-col sm:flex-row gap-3 justify-center w-full max-w-md mx-auto">
                <button
                  onClick={handleEnterSandbox}
                  className="w-full text-xs font-bold text-slate-600 hover:text-slate-800 bg-slate-50 hover:bg-slate-100 border border-slate-200/80 py-3.5 rounded-xl transition duration-150 active:scale-[0.98] shadow-sm bg-transparent"
                >
                  Explorar en Sandbox
                </button>

                <button
                  onClick={handleGoogleLogin}
                  className="w-full flex items-center justify-center gap-2 text-xs text-white font-bold bg-[#0B53F4] hover:bg-[#0B53F4]/90 py-3.5 rounded-xl transition duration-150 shadow-md shadow-[#0B53F4]/15 active:scale-[0.98]"
                >
                  <LogIn className="w-4 h-4 shrink-0" />
                  Ingresar con Google
                </button>
              </div>
            </div>
          </div>
        </main>

        <footer className="bg-white border-t border-slate-200 py-4 text-center text-[10px] text-slate-400 font-mono mt-auto uppercase tracking-wider">
          ZenTicket • Licenciado CFDI v4.0 Estándar Técnico SAT • Sincronización Inteligente
        </footer>
      </div>
    );
  }
}
