import React, { useState, useRef, useEffect } from "react";
import { FiscalProfile, Ticket, Connector, ExtractedTicketData } from "../types";
import { SAMPLE_TICKETS, drawMockTicketToDataUrl } from "../utils/ticket-drawer";
import Logo from "./Logo";
import { 
  Upload, Loader2, Play, Terminal, AlertTriangle, CheckCircle, 
  RefreshCw, Sparkles, Cpu, Eye, Building2, Calendar, FileText, Clock,
  Camera, ShoppingBag, Fuel, Utensils
} from "lucide-react";

interface ScannerAndSimulatorProps {
  fiscalProfile: FiscalProfile | null;
  connectors: Connector[]; // Pass active database connectors
  onSaveTicketToDb: (ticket: Ticket) => Promise<string>; // saves to firebase
  onUpdateTicketInDb: (ticketId: string, updates: Partial<Ticket>) => Promise<void>;
  onSaveInvoiceToDb: (ticketId: string, xml: string, pdf: string, uuid: string, emisorRfc: string, emisorName: string, total: number, cost?: number, connectorType?: "existente" | "nuevo", rawCost?: number) => Promise<void>;
  onLearnConnectorInline: (nombre: string, rfc: string, learnedFrom?: "automatizacion_ticket" | "portal_admin") => Promise<Connector>;
  tickets: Ticket[];
  preselectedTicketId: string | null;
  onClearPreselectedTicket: () => void;
  onStartAutomation?: (ticketId: string) => Promise<void>;
}

export default function ScannerAndSimulator({
  fiscalProfile,
  connectors,
  onSaveTicketToDb,
  onUpdateTicketInDb,
  onSaveInvoiceToDb,
  onLearnConnectorInline,
  tickets,
  preselectedTicketId,
  onClearPreselectedTicket,
  onStartAutomation,
}: ScannerAndSimulatorProps) {
  // Navigation & Loading States
  const [ticketImage, setTicketImage] = useState<string | null>(null);
  const [activeStep, setActiveStep] = useState<"upload" | "extracted" | "automating" | "success">("upload");
  const [isOcrLoading, setIsOcrLoading] = useState(false);
  const [isLearningLoading, setIsLearningLoading] = useState(false);

  // Extracted Data & Active entities
  const [extractedData, setExtractedData] = useState<ExtractedTicketData | null>(null);
  const [matchingConnector, setMatchingConnector] = useState<Connector | null>(null);
  const [isConnectorNewlyLearned, setIsConnectorNewlyLearned] = useState(false);
  const [ticketId, setTicketId] = useState<string | null>(null);

  // Manual Editing/Correction Form states
  const [isEditing, setIsEditing] = useState(false);
  const [editNombre, setEditNombre] = useState("");
  const [editRfc, setEditRfc] = useState("");
  const [editFecha, setEditFecha] = useState("");
  const [editFolio, setEditFolio] = useState("");
  const [editSucursal, setEditSucursal] = useState("");
  const [editTotal, setEditTotal] = useState(0);
  const [validationError, setValidationError] = useState<string | null>(null);

  // Helper validation function to check missing or bad critical fields
  const checkIsDataIncomplete = (data: ExtractedTicketData): boolean => {
    return !data.rfcEmisor?.trim() || !data.nombreEmisor?.trim() || !data.total || data.total <= 0 || !data.folio?.trim() || !data.fechaCompra?.trim();
  };

  const isNombreInvalid = !editNombre.trim();
  const isRfcInvalid = (() => {
    const clean = editRfc.toUpperCase().replace(/\s+/g, "");
    return !clean || clean.length < 12 || clean.length > 13;
  })();
  const isFolioInvalid = !editFolio.trim();
  const isFechaInvalid = !editFecha.trim();
  const isTotalInvalid = !editTotal || parseFloat(editTotal.toString()) <= 0 || isNaN(parseFloat(editTotal.toString()));

  // Simulation Logs
  const [simulationLogs, setSimulationLogs] = useState<string[]>([]);
  const [simulationProgress, setSimulationProgress] = useState(0);
  const [isAutomatingLoading, setIsAutomatingLoading] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const logsEndRef = useRef<HTMLDivElement>(null);

  // Preload a ticket if triggered from tickets screen
  useEffect(() => {
    if (!preselectedTicketId) return;

    const ticket = tickets.find((t) => t.id === preselectedTicketId);
    if (ticket) {
      setTicketId(ticket.id || null);
      setTicketImage(ticket.imageUrl || null);

      const parsedItems = ticket.itemsJson ? JSON.parse(ticket.itemsJson) : [];
      const data: ExtractedTicketData = {
        rfcEmisor: ticket.rfcEmisor,
        nombreEmisor: ticket.nombreEmisor,
        fechaCompra: ticket.fechaCompra,
        folio: ticket.folio,
        total: ticket.total,
        sucursal: ticket.sucursal,
        items: parsedItems,
      };
      setExtractedData(data);
      setEditNombre(data.nombreEmisor || "");
      setEditRfc(data.rfcEmisor || "");
      setEditFecha(data.fechaCompra || "");
      setEditFolio(data.folio || "");
      setEditSucursal(data.sucursal || "");
      setEditTotal(data.total || 0);
      setIsEditing(checkIsDataIncomplete(data));

      const found = connectors.find(
        (c) =>
          c.rfc.toLowerCase().trim() === ticket.rfcEmisor.toLowerCase().trim() ||
          ticket.nombreEmisor.toLowerCase().includes(c.nombre.toLowerCase()) ||
          c.nombre.toLowerCase().includes(ticket.nombreEmisor.toLowerCase())
      );
      setMatchingConnector(found || null);
      setActiveStep("extracted");
    }

    onClearPreselectedTicket();
  }, [preselectedTicketId, tickets, connectors, onClearPreselectedTicket]);

  useEffect(() => {
    if (logsEndRef.current) {
      logsEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [simulationLogs]);

  // Load a sample ticket spec and render to canvas
  const handleSelectSample = async (key: keyof typeof SAMPLE_TICKETS) => {
    setIsOcrLoading(true);
    setMessage(null);
    try {
      const dataUrl = drawMockTicketToDataUrl(SAMPLE_TICKETS[key]);
      setTicketImage(dataUrl);

      // Trigger server OCR
      const headers: Record<string, string> = { "Content-Type": "application/json" };
      if (fiscalProfile?.personalGeminiKey) {
        headers["x-gemini-api-key"] = fiscalProfile.personalGeminiKey;
      }
      const response = await fetch("/api/tickets/analyze", {
        method: "POST",
        headers,
        body: JSON.stringify({
          image: dataUrl.split(",")[1],
          mimeType: "image/png",
        }),
      });

      if (!response.ok) {
        let errorMsg = "No se pudo ejecutar el OCR en el ticket seleccionado.";
        try {
          const errJson = await response.json();
          if (errJson.error) {
            errorMsg = errJson.error;
          }
        } catch (e) {
          // Fallback if not valid JSON
        }
        throw new Error(errorMsg);
      }

      const ocrResult: any = await response.json();
      setExtractedData(ocrResult);
      setEditNombre(ocrResult.nombreEmisor || "");
      setEditRfc(ocrResult.rfcEmisor || "");
      setEditFecha(ocrResult.fechaCompra || "");
      setEditFolio(ocrResult.folio || "");
      setEditSucursal(ocrResult.sucursal || "");
      setEditTotal(ocrResult.total || 0);
      setIsEditing(checkIsDataIncomplete(ocrResult));

      // Auto-save this ticket in Firebase with status "extracted"
      const tId = await onSaveTicketToDb({
        userId: "guest",
        imageUrl: dataUrl,
        status: "extracted",
        rfcEmisor: ocrResult.rfcEmisor,
        nombreEmisor: ocrResult.nombreEmisor,
        fechaCompra: ocrResult.fechaCompra,
        folio: ocrResult.folio,
        total: ocrResult.total,
        sucursal: ocrResult.sucursal || "",
        itemsJson: JSON.stringify(ocrResult.items),
        createdAt: new Date().toISOString(),
        cost: ocrResult.cost !== undefined ? ocrResult.cost : 0.50,
        rawCost: ocrResult.rawCost !== undefined ? ocrResult.rawCost : 0,
      });
      setTicketId(tId);

      // Seek matching connector
      findMatchingConnector(ocrResult);
      setActiveStep("extracted");
    } catch (err: any) {
      console.error(err);
      setMessage(err.message || "Error al procesar ticket con IA OCR.");
    } finally {
      setIsOcrLoading(false);
    }
  };

  const [message, setMessage] = useState<string | null>(null);

  // Seek matching connector in rules DB
  const findMatchingConnector = (data: ExtractedTicketData) => {
    // Attempt standard exact-match of RFC, or fuzzy match name
    const found = connectors.find(
      (c) =>
        c.rfc.toLowerCase().trim() === data.rfcEmisor.toLowerCase().trim() ||
        data.nombreEmisor.toLowerCase().includes(c.nombre.toLowerCase()) ||
        c.nombre.toLowerCase().includes(data.nombreEmisor.toLowerCase())
    );
    setMatchingConnector(found || null);
    setIsConnectorNewlyLearned(false);
  };

  // Convert files loaded manually to base64 and parse
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async () => {
      const base64Str = reader.result as string;
      setTicketImage(base64Str);
      setIsOcrLoading(true);
      setMessage(null);

      try {
        const mime = file.type;
        const rawBase64 = base64Str.split(",")[1];

        const headers: Record<string, string> = { "Content-Type": "application/json" };
        if (fiscalProfile?.personalGeminiKey) {
          headers["x-gemini-api-key"] = fiscalProfile.personalGeminiKey;
        }
        const response = await fetch("/api/tickets/analyze", {
          method: "POST",
          headers,
          body: JSON.stringify({
            image: rawBase64,
            mimeType: mime,
          }),
        });

        if (!response.ok) {
          let errorMsg = "El motor OCR reportó un problema al digitalizar el archivo.";
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

        const ocrResult: any = await response.json();
        setExtractedData(ocrResult);
        setEditNombre(ocrResult.nombreEmisor || "");
        setEditRfc(ocrResult.rfcEmisor || "");
        setEditFecha(ocrResult.fechaCompra || "");
        setEditFolio(ocrResult.folio || "");
        setEditSucursal(ocrResult.sucursal || "");
        setEditTotal(ocrResult.total || 0);
        setIsEditing(checkIsDataIncomplete(ocrResult));

        // Save ticket in DB
        const tId = await onSaveTicketToDb({
          userId: "guest",
          imageUrl: base64Str,
          status: "extracted",
          rfcEmisor: ocrResult.rfcEmisor,
          nombreEmisor: ocrResult.nombreEmisor,
          fechaCompra: ocrResult.fechaCompra,
          folio: ocrResult.folio,
          total: ocrResult.total,
          sucursal: ocrResult.sucursal || "",
          itemsJson: JSON.stringify(ocrResult.items),
          createdAt: new Date().toISOString(),
          cost: ocrResult.cost !== undefined ? ocrResult.cost : 0.50,
          rawCost: ocrResult.rawCost !== undefined ? ocrResult.rawCost : 0,
        });
        setTicketId(tId);

        // Find match
        findMatchingConnector(ocrResult);
        setActiveStep("extracted");
      } catch (err: any) {
        console.error(err);
        setMessage(err.message || "No se pudo interpretar el ticket ingresado.");
      } finally {
        setIsOcrLoading(false);
      }
    };
    reader.readAsDataURL(file);
  };

  // Request Search Grounding mapping to learn connector on-the-fly
  const handleLearnOnFly = async () => {
    if (!extractedData) return;
    setIsLearningLoading(true);
    setMessage(null);

    try {
      const learned = await onLearnConnectorInline(extractedData.nombreEmisor, extractedData.rfcEmisor);
      setMatchingConnector(learned);
      setIsConnectorNewlyLearned(true);

      // update ticket with new connector matched
      if (ticketId) {
        await onUpdateTicketInDb(ticketId, { connectorId: learned.id });
      }
    } catch (err: any) {
      console.error(err);
      setMessage(err.message || "Error al aprender el portal remoto de autofactura.");
    } finally {
      setIsLearningLoading(false);
    }
  };

  // Trigger high fidelity automation logs and final document generation
  const handleTriggerAutomation = async () => {
    if (!extractedData || !fiscalProfile || !matchingConnector || !ticketId) return;

    setActiveStep("automating");
    setIsAutomatingLoading(true);
    setSimulationLogs([]);
    setSimulationProgress(0);

    const fieldsSchema = JSON.parse(matchingConnector.fieldsJson);

    // Full-fidelity step sequencer
    const addLog = (text: string, delay: number) => {
      return new Promise<void>((resolve) => {
        setTimeout(() => {
          setSimulationLogs((prev) => [...prev, `[${new Date().toLocaleTimeString()}] ${text}`]);
          resolve();
        }, delay);
      });
    };

    try {
      await addLog("🤖 [Playwright CLI] Inicializando robot de navegación web", 100);
      setSimulationProgress(10);
      await addLog("🌐 Abriendo puerto seguro proxy para saltar bloqueos", 800);
      await addLog(`🌍 Navegando directamente a: ${matchingConnector.portalUrl}`, 1200);
      setSimulationProgress(25);
      await addLog("⌛ Esperando a que el portal web cargue los selectores", 1000);

      // Simulate entering fields
      for (const field of fieldsSchema) {
        let val = "";
        if (field.key === "rfc") val = fiscalProfile.rfc;
        else if (field.key === "folio") val = extractedData.folio;
        else if (field.key === "total") val = extractedData.total.toString();
        else if (field.key === "fecha") val = extractedData.fechaCompra;
        else val = "VAL_AUTO__";

        await addLog(
          `✏️ Llenando campo '${field.name}' (Selector: ${field.selector}) con valor '${val}'`,
          1400
        );
      }
      setSimulationProgress(50);

      await addLog(`🚀 Presionando botón de consulta en el portal...`, 1200);
      await addLog(`✅ Registro de Ticket validado en el portal corporativo exitosamente.`, 900);
      setSimulationProgress(60);

      await addLog(`🔄 Redirigiendo a pantalla de Datos Fiscales del Receptor...`, 1200);
      await addLog(`✏️ Llenando RFC del cliente: '${fiscalProfile.rfc}' (Régimen: ${fiscalProfile.regimenFiscal})`, 1005);
      await addLog(`✏️ Inyectando Razón Social: '${fiscalProfile.razonSocial}' (Código Postal: ${fiscalProfile.codigoPostal})`, 1001);
      setSimulationProgress(75);

      await addLog(`🔔 Procesando datos fiscales y validando Uso CFDI: '${fiscalProfile.usoCFDI}'`, 1200);
      await addLog(`🖨️ Presionando botón 'Generar Factura / CFDI 4.0' en el portal emisor...`, 1500);
      setSimulationProgress(90);

      await addLog(`🔗 Conectando con PAC certificado emisor SAT para timbrar XML...`, 1200);

      // Fire actual backend composition to build real XML & visually responsive PDF HTML layouts
      const response = await fetch("/api/automation/run", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ticket: extractedData,
          profile: fiscalProfile,
          connector: matchingConnector,
        }),
      });

      if (!response.ok) {
        throw new Error("El motor del SAT reportó un error al certificar el CFDI.");
      }

      const invoiceData = await response.json();

      // Save Invoice data to Firestore
      await onSaveInvoiceToDb(
        ticketId,
        invoiceData.xmlContent,
        invoiceData.pdfHtml,
        invoiceData.folioFiscal,
        extractedData.rfcEmisor,
        extractedData.nombreEmisor,
        extractedData.total,
        invoiceData.cost !== undefined ? invoiceData.cost : (isConnectorNewlyLearned ? 15.00 : 2.50),
        isConnectorNewlyLearned ? "nuevo" : "existente",
        invoiceData.rawCost !== undefined ? invoiceData.rawCost : 0
      );

      // update ticket state
      await onUpdateTicketInDb(ticketId, {
        status: "completed",
        invoiceId: invoiceData.folioFiscal,
      });

      await addLog(`💾 Factura certificada exitosamente. Folio Fiscal UID: ${invoiceData.folioFiscal}`, 800);
      await addLog(`📥 Archivos PDF & XML descargados en almacén virtual de ZenTicket.`, 500);
      await addLog(`🎉 ¡Procesamiento completado con éxito!`, 200);

      setSimulationProgress(100);
      setTimeout(() => {
        setActiveStep("success");
      }, 1000);
    } catch (err: any) {
      console.error(err);
      await addLog(`❌ ERROR DE AUTOMATIZACIÓN: ${err.message || "Portal falló al procesar"}`, 200);
      if (ticketId) {
        await onUpdateTicketInDb(ticketId, {
          status: "failed",
          errorMsg: err.message || "Failed simulation process",
        });
      }
      setIsAutomatingLoading(false);
    }
  };

  const handleSaveEditedData = async () => {
    // Basic validation
    if (!editRfc.trim()) {
      setValidationError("El RFC del emisor es obligatorio.");
      return;
    }
    const cleanRfc = editRfc.toUpperCase().replace(/\s+/g, "");
    if (cleanRfc.length < 12 || cleanRfc.length > 13) {
      setValidationError("El RFC del emisor debe tener 12 o 13 caracteres (alfanumérico).");
      return;
    }
    if (!editNombre.trim()) {
      setValidationError("El Nombre/Razón Social del emisor es obligatorio.");
      return;
    }
    const totalNum = parseFloat(editTotal.toString());
    if (isNaN(totalNum) || totalNum <= 0) {
      setValidationError("El importe total de compra debe ser un número mayor a cero.");
      return;
    }
    if (!editFolio.trim()) {
      setValidationError("El folio o número de referencia del ticket es obligatorio.");
      return;
    }
    if (!editFecha.trim()) {
      setValidationError("La fecha de compra de ticket es obligatoria.");
      return;
    }

    setValidationError(null);

    const updatedData: ExtractedTicketData = {
      ...extractedData!,
      rfcEmisor: cleanRfc,
      nombreEmisor: editNombre.trim(),
      fechaCompra: editFecha.trim(),
      folio: editFolio.trim(),
      total: totalNum,
      sucursal: editSucursal.trim(),
    };

    setExtractedData(updatedData);
    setIsEditing(false);

    // Save/update in DB
    if (ticketId) {
      try {
        await onUpdateTicketInDb(ticketId, {
          rfcEmisor: updatedData.rfcEmisor,
          nombreEmisor: updatedData.nombreEmisor,
          fechaCompra: updatedData.fechaCompra,
          folio: updatedData.folio,
          total: updatedData.total,
          sucursal: updatedData.sucursal,
        });
      } catch (err) {
        console.error("Error saving corrected ticket inside Firestore", err);
      }
    }

    // Refresh matching connector logic
    const found = connectors.find(
      (c) =>
        c.rfc.toLowerCase().trim() === updatedData.rfcEmisor.toLowerCase().trim() ||
        updatedData.nombreEmisor.toLowerCase().includes(c.nombre.toLowerCase()) ||
        c.nombre.toLowerCase().includes(updatedData.nombreEmisor.toLowerCase())
    );
    setMatchingConnector(found || null);
  };

  const resetAll = () => {
    setTicketImage(null);
    setExtractedData(null);
    setMatchingConnector(null);
    setIsEditing(false);
    setEditNombre("");
    setEditRfc("");
    setEditFecha("");
    setEditFolio("");
    setEditSucursal("");
    setEditTotal(0);
    setValidationError(null);
    setMessage(null);
    setActiveStep("upload");
  };

  return (
    <div className="bg-transparent min-h-[500px] flex flex-col relative overflow-hidden select-none gap-6">
      
      {/* 1. Progresivas líneas indicadores en la parte superior */}
      {activeStep === "upload" && (
        <div className="w-full flex gap-1.5 mb-2 relative z-10">
          <div className="h-1.5 bg-[#0B53F4] rounded-full flex-[2.5]" />
          <div className="h-1.5 bg-[#FFB200] rounded-full flex-[1]" />
        </div>
      )}

      {/* 2. ZenTicket Brand Header with Logo Box and Notification Bell */}
      {activeStep === "upload" && (
        <div className="flex items-center justify-between relative z-10 bg-white border border-slate-200/60 py-2.5 px-4.5 rounded-2xl shadow-sm">
          <Logo size="sm" />

          {/* Golden active bell icon */}
          <div className="relative p-2 rounded-full border border-slate-200 bg-slate-50 cursor-pointer text-slate-550 hover:text-slate-800 transition shadow-sm">
            <svg className="w-5 h-5 text-slate-600" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
            <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-[#FFB200] rounded-full border-2 border-white" />
          </div>
        </div>
      )}

      {/* Standard Step header for active editing actions */}
      {activeStep !== "upload" && (
        <div className="bg-white border border-slate-200/60 p-5 rounded-2xl shadow-sm flex flex-col sm:flex-row justify-between sm:items-center gap-4 relative z-10">
          <div>
            <h2 className="text-base font-black text-slate-900 flex items-center gap-2 select-none uppercase tracking-wide">
              <Sparkles className="w-5.5 h-5.5 text-[#FFB200]" />
              Procesamiento de Ticket con IA
            </h2>
          </div>

          <button
            onClick={resetAll}
            className="text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 text-[#0B53F4] hover:text-[#0B53F4]/90 bg-[#0B53F4]/10 border border-[#0B53F4]/20 px-5 py-2.5 rounded-xl transition cursor-pointer font-sans"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Capturar Siguiente
          </button>
        </div>
      )}

      {message && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-150 text-rose-700 text-xs flex items-start gap-2.5 max-w-4xl relative z-10 shadow-sm">
          <AlertTriangle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
          <span className="font-semibold leading-relaxed">{message}</span>
        </div>
      )}

      {/* STEP 1: Upload / Redesigned Dashboard exactly matching user screenshot */}
      {activeStep === "upload" && (
        <div className="flex-1 flex flex-col gap-6 relative z-10 animate-fade-in_50 font-sans">
          
          {isOcrLoading ? (
            <div className="bg-white border border-slate-200/80 shadow-sm rounded-3xl p-12 text-center my-auto flex flex-col items-center justify-center min-h-[350px]">
              <Loader2 className="w-12 h-12 animate-spin text-[#0B53F4] mb-4" />
              <p className="text-sm font-black text-slate-800 animate-pulse uppercase tracking-wider">Vision IA Digitalizando Ticket...</p>
              <p className="text-xs text-slate-500 max-w-sm mx-auto leading-relaxed mt-2 text-center">
                Extrayendo montos, folios de facturación, fecha y RFC de emisor mediante Inteligencia Artificial.
              </p>
            </div>
          ) : (
            <>
              {/* 1. General Status / Activity Summary Blue Card (Exact screenshot style) */}
              <div id="general-status-card" className="bg-gradient-to-tr from-[#0546F0] to-[#1268FF] text-white rounded-3xl p-6 shadow-lg relative overflow-hidden select-none">
                {/* Sparkle top right decorator */}
                <div className="absolute top-5 right-5 opacity-90">
                  <Sparkles className="w-9 h-9 text-white animate-pulse" />
                </div>

                <span className="text-xs font-semibold text-white/70 block uppercase tracking-wide text-left">
                  Estado general
                </span>
                <h3 className="text-2xl font-black text-white leading-tight mt-1 mb-6 text-left">
                  Resumen de actividad
                </h3>

                <div className="grid grid-cols-2 gap-4">
                  {/* Procesado Card with live calculated values */}
                  <div className="bg-white/10 backdrop-blur-xs border border-white/10 rounded-2xl p-4 text-left">
                    <span className="text-[11px] text-white/70 font-medium block">
                      Procesados
                    </span>
                    <span className="text-xl font-extrabold text-white mt-1 block">
                      {(() => {
                        const comp = tickets.filter(t => t.status === "completed").length;
                        return `${comp} ${comp === 1 ? 'ticket' : 'tickets'}`;
                      })()}
                    </span>
                    <span className="text-[10px] text-blue-200 block mt-1 font-semibold leading-normal">
                      {(() => {
                        const comp = tickets.filter(t => t.status === "completed").length;
                        const plan = fiscalProfile?.plan || "gratuito";
                        const limit = plan === "personal" ? 100 : plan === "empresa" ? 5000 : 5;
                        const label = plan === "empresa" ? "Ilimitado" : `${limit}`;
                        const rem = plan === "empresa" ? "Ilimitados" : `${Math.max(limit - comp, 0)}`;
                        return `Quedan: ${rem} (Límite: ${label})`;
                      })()}
                    </span>
                  </div>

                  {/* Pendiente Card with live count */}
                  <div className="bg-white/10 backdrop-blur-xs border border-white/10 rounded-2xl p-4 text-left">
                    <span className="text-[11px] text-white/70 font-medium block">
                      En Seguimiento
                    </span>
                    <span className="text-xl font-extrabold text-white mt-1 block">
                      {tickets.filter(t => t.status !== "completed").length} {tickets.filter(t => t.status !== "completed").length === 1 ? "ticket" : "tickets"}
                    </span>
                    <span className="text-[10px] text-blue-200 block mt-1 font-semibold leading-normal">
                      Tickets pendientes
                    </span>
                  </div>
                </div>
              </div>

              {/* 2. Quick Actions Header & Grid */}
              <div className="space-y-3">
                <h4 className="text-sm font-bold uppercase tracking-wider text-slate-500 text-left">
                  Acciones rápidas
                </h4>

                <div className="grid grid-cols-2 gap-4">
                  {/* Quick Action #1: "Capturar Ticket" (Deep Blue Card) */}
                  <div
                    onClick={() => {
                      if (fileInputRef.current) {
                        fileInputRef.current.setAttribute("capture", "environment");
                        fileInputRef.current.click();
                      }
                    }}
                    className="bg-[#0b53f4] text-white rounded-3xl p-5 aspect-[4/3] flex flex-col justify-between cursor-pointer hover:bg-[#0947D1] transition shadow-md shadow-[#0b53f4]/15 relative select-none group active:scale-[0.98]"
                  >
                    <div className="p-2.5 bg-white/10 rounded-xl w-fit">
                      <Camera className="w-6 h-6 text-white stroke-[2.5]" />
                    </div>
                    <span className="text-sm font-black text-left leading-tight group-hover:translate-x-1 transition duration-150">
                      Capturar Ticket
                    </span>
                  </div>

                  {/* Quick Action #2: "Subir Imagen" (Light lavender Card) */}
                  <div
                    onClick={() => {
                      if (fileInputRef.current) {
                        fileInputRef.current.removeAttribute("capture");
                        fileInputRef.current.click();
                      }
                    }}
                    className="bg-[#ebf1ff] text-[#0b53f4] rounded-3xl p-5 aspect-[4/3] flex flex-col justify-between cursor-pointer hover:bg-[#dee8ff] transition border border-[#0b53f4]/5 relative select-none group active:scale-[0.98]"
                  >
                    <div className="p-2.5 bg-[#0b53f4]/10 rounded-xl w-fit">
                      <Upload className="w-6 h-6 text-[#0b53f4] stroke-[2.5]" />
                    </div>
                    <span className="text-sm font-black text-[#0b53f4] text-left leading-tight group-hover:translate-x-1 transition duration-150">
                      Subir Imagen
                    </span>
                  </div>
                </div>
              </div>

              {/* Hidden Native input */}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
              />

              {/* 3. Recent Activity list with high-fidelity styled items */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-bold uppercase tracking-wider text-slate-500">
                    Actividad reciente
                  </h4>
                  {/* Let "Ver todo" redirect user to the Tickets tab */}
                  <button
                    onClick={() => {
                      const tabBtn = document.getElementById("tab-history") || document.querySelector("button[onClick*='tickets']");
                      if (tabBtn) {
                        (tabBtn as HTMLElement).click();
                      }
                    }}
                    className="text-xs font-bold text-[#0b53f4] hover:underline bg-transparent border-none outline-none cursor-pointer"
                  >
                    Ver todo
                  </button>
                </div>

                <div className="bg-white border border-slate-200/60 rounded-3xl shadow-xs overflow-hidden">
                  {tickets.length > 0 ? (
                    /* Render actual tickets if available, formatted exactly like list */
                    <div className="divide-y divide-slate-100">
                      {tickets.slice(0, 4).map((t, idx) => {
                        // Dynamically determine icon based on ticket name
                        let itemIcon = <FileText className="w-5 h-5 text-[#0b53f4]" />;
                        const nameLower = t.nombreEmisor?.toLowerCase() || "";
                        if (nameLower.includes("starbucks") || nameLower.includes("coffee") || nameLower.includes("cafe") || nameLower.includes("roll")) {
                          itemIcon = <Utensils className="w-5 h-5 text-[#0b53f4]" />;
                        } else if (nameLower.includes("oxxo") || nameLower.includes("walmart") || nameLower.includes("soriana") || nameLower.includes("merca")) {
                          itemIcon = <ShoppingBag className="w-5 h-5 text-[#0b53f4]" />;
                        } else if (nameLower.includes("repsol") || nameLower.includes("gas") || nameLower.includes("combust")) {
                          itemIcon = <Fuel className="w-5 h-5 text-[#0b53f4]" />;
                        }

                        const dateFormatted = t.fechaCompra 
                          ? `${t.fechaCompra}` 
                          : "Reciente";

                        return (
                          <div 
                            key={t.id || idx} 
                            className="flex items-center justify-between p-4 bg-transparent"
                          >
                            <div className="flex items-center gap-3.5">
                              <div className="w-11 h-11 rounded-full bg-[#ebf1ff] flex items-center justify-center shrink-0">
                                {itemIcon}
                              </div>
                              <div className="text-left leading-tight">
                                <span className="text-sm font-bold text-slate-800 block">
                                  {t.nombreEmisor || "Emisor"}
                                </span>
                                <span className="text-xs text-slate-400 mt-1 block">
                                  {dateFormatted}
                                </span>
                              </div>
                            </div>

                            <div className="text-right">
                              <span className="text-sm font-extrabold text-slate-800 block">
                                {new Intl.NumberFormat("es-MX", { style: "currency", currency: "MXN" }).format(t.total)}
                              </span>
                              <span className={`text-[10px] font-bold tracking-wider mt-1 block leading-none ${
                                t.status === "completed" 
                                  ? "text-emerald-600 uppercase" 
                                  : t.status === "failed" 
                                  ? "text-rose-500 uppercase" 
                                  : "text-amber-600 uppercase"
                              }`}>
                                {t.status === "completed" ? "✓ PROCESADO" : t.status === "failed" ? "⚠ RECHAZADO" : "⊙ PENDIENTE"}
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="p-8 text-center bg-white">
                      <FileText className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                      <p className="text-xs text-slate-500 font-bold">No hay actividad reciente en tu cuenta.</p>
                      <p className="text-[10px] text-slate-400 mt-1">Sube el ticket de tu compra comercial para ver su estado aquí en tiempo real.</p>
                    </div>
                  )}
                </div>
              </div>

              {/* 4. Bottom Beautiful Banner Card (Insight card from screenshot) */}
              <div className="rounded-3xl overflow-hidden relative shadow-md aspect-[16/8] md:aspect-auto md:h-44 flex flex-col justify-end p-5 select-none text-left">
                {/* Background image of workspace chart display */}
                <img
                  src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&q=80&w=800"
                  alt="Insight Chart Banner"
                  className="absolute inset-0 w-full h-full object-cover pointer-events-none"
                  referrerPolicy="no-referrer"
                />
                
                {/* Visual rich gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-900/40 to-transparent pointer-events-none" />

                <div className="relative z-10 space-y-1">
                  <span className="text-[10px] text-white/70 uppercase tracking-widest font-extrabold font-sans">
                    Insight Mensual
                  </span>
                  <h4 className="text-lg lg:text-xl font-black text-white leading-tight">
                    Tus gastos han bajado un 12%
                  </h4>
                  <p className="text-[11px] text-white/80 leading-snug font-medium leading-none">
                    Sigue así para optimizar tus deducciones fiscales de forma legal.
                  </p>
                </div>
              </div>
            </>
          )}
        </div>
      )}

      {/* STEP 2: Extracted metadata results & Action Selection */}
      {activeStep === "extracted" && extractedData && (
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6 relative z-10 animate-fade-in_50 font-sans">
          {/* Visual of ticket canvas */}
          <div className="lg:col-span-4 flex flex-col items-center">
            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 self-start">Lectura de Ticket Termal</h4>
            {ticketImage && (
              <div className="border border-slate-200/80 rounded-2xl overflow-hidden shadow-sm bg-white p-2.5 max-w-xs flex justify-center">
                <img
                  src={ticketImage}
                  alt="Ticket OCR scan"
                  className="max-h-[380px] object-contain rounded-xl"
                  referrerPolicy="no-referrer"
                />
              </div>
            )}
          </div>

          {/* Values parsed & connector seek panel */}
          <div className="lg:col-span-8 flex flex-col justify-between text-left">
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
                <div>
                  <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Datos Extraídos Vision OCR</h4>
                  
                  {/* OCR Score and Resolution indicators */}
                  <div className="flex flex-wrap gap-2 mt-2">
                    <span className="bg-[#0B53F4]/10 border border-[#0B53F4]/20 text-[#0B53F4] font-mono text-[9px] font-black px-2.5 py-1 rounded-md flex items-center gap-1">
                      <Sparkles className="w-3 h-3 text-[#FFB200] animate-pulse" />
                      OCR SCORE: {(extractedData.nombreEmisor ? 25 : 0) + (extractedData.total > 0 ? 30 : 0) + (extractedData.folio ? 20 : 0) + (extractedData.rfcEmisor ? 15 : 0) + 10}/100 PTS
                    </span>
                    <span className={`font-mono text-[9px] font-black px-2.5 py-1 rounded-md border flex items-center gap-1 ${
                      extractedData.total > 0 && extractedData.rfcEmisor && extractedData.nombreEmisor
                        ? "bg-emerald-50 text-emerald-700 border-emerald-250"
                        : "bg-rose-50 text-rose-700 border-rose-250 animate-pulse"
                    }`}>
                      <CheckCircle className="w-3 h-3" />
                      {extractedData.total > 0 && extractedData.rfcEmisor && extractedData.nombreEmisor ? "RESOLUCIÓN: OK" : "RESOLUCIÓN: INCOMPLETO"}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {!isEditing && (
                    <button
                      onClick={() => setIsEditing(true)}
                      className="text-[9px] font-extrabold uppercase tracking-widest border border-slate-200 hover:border-slate-350 bg-white text-slate-600 hover:text-slate-800 px-3 py-1.5 rounded-lg transition duration-150 flex items-center gap-1.5 cursor-pointer shadow-sm"
                    >
                      <RefreshCw className="w-3 h-3 text-slate-500" />
                      Corregir Datos
                    </button>
                  )}
                  <span className="text-[9px] font-extrabold uppercase tracking-widest bg-[#0B53F4]/10 text-[#0B53F4] px-3 py-1.5 rounded-md border border-[#0B53F4]/20 flex items-center gap-1 shrink-0">
                    <CheckCircle className="w-3.5 h-3.5 text-[#0B53F4]" /> IA Sincronizada
                  </span>
                </div>
              </div>

              {/* Incomplete Critical Data Alert */}
              {checkIsDataIncomplete(extractedData) && !isEditing && (
                <div className="p-4 bg-rose-50 border border-rose-200 text-rose-850 rounded-2xl flex items-start gap-3 text-xs leading-relaxed transition-all shadow-sm">
                  <AlertTriangle className="w-5 h-5 text-rose-500 shrink-0 mt-0.5 animate-pulse" />
                  <div>
                    <span className="font-extrabold block text-rose-800 uppercase mb-0.5 tracking-wide">🚨 Datos Críticos Faltantes</span>
                    <p className="opacity-95 text-rose-700 leading-normal font-medium">
                      Para timbrar una factura de forma legal, se requiere que la digitalización reconozca con exactitud el <strong>RFC Emisor</strong>, el <strong>Folio</strong>, la <strong>Fecha</strong> y el <strong>Total</strong> ($ MXN). Por favor, presiona el botón <span className="font-bold underline cursor-pointer hover:text-slate-900" onClick={() => setIsEditing(true)}>Corregir Datos</span> para complementarlos manualmente.
                    </p>
                  </div>
                </div>
              )}

              {isEditing ? (
                /* Manual edit form for data correction in premium light styles */
                <div className="space-y-4 bg-slate-50 p-5 rounded-2xl border border-slate-200 relative">
                  <div className="flex items-center justify-between border-b border-slate-200 pb-2.5 mb-2">
                    <h5 className="text-[11px] font-extrabold text-[#0B53F4] flex items-center gap-1.5 uppercase tracking-wider font-mono">
                      <AlertTriangle className="w-4 h-4 shrink-0 text-[#0B53F4] animate-pulse" />
                      Corrección Manual de Campos Críticos
                    </h5>
                    {!checkIsDataIncomplete(extractedData) && (
                      <button
                        onClick={() => {
                          setEditNombre(extractedData.nombreEmisor || "");
                          setEditRfc(extractedData.rfcEmisor || "");
                          setEditFecha(extractedData.fechaCompra || "");
                          setEditFolio(extractedData.folio || "");
                          setEditSucursal(extractedData.sucursal || "");
                          setEditTotal(extractedData.total || 0);
                          setValidationError(null);
                          setIsEditing(false);
                        }}
                        className="text-[10px] text-slate-500 hover:text-slate-800 font-extrabold uppercase transition cursor-pointer"
                      >
                        Cancelar
                      </button>
                    )}
                  </div>

                  {validationError && (
                    <div className="p-3 bg-rose-50 border border-rose-250 rounded-xl text-[11px] text-rose-700 font-bold flex items-center gap-2 animate-pulse">
                      <AlertTriangle className="w-4 h-4 text-rose-500 shrink-0" />
                      <span>{validationError}</span>
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Nombre Emisor */}
                    <div>
                      <div className="flex justify-between items-center mb-1.5">
                        <label className="text-[9px] text-slate-500 font-bold uppercase tracking-wider block">Razón Social Emisor *</label>
                        {isNombreInvalid && (
                          <span className="text-[9px] text-rose-500 font-extrabold uppercase tracking-wider flex items-center gap-1 animate-pulse">
                            ⚠️ Faltante
                          </span>
                        )}
                      </div>
                      <input
                        type="text"
                        value={editNombre}
                        onChange={(e) => setEditNombre(e.target.value)}
                        placeholder="Ej. NUEVA WAL MART DE MEXICO"
                        className={`w-full bg-white border rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 focus:outline-none transition uppercase ${
                          isNombreInvalid 
                            ? "border-rose-400 bg-rose-50 focus:border-rose-500" 
                            : "border-slate-200 focus:border-[#0B53F4] hover:border-slate-350"
                        }`}
                      />
                    </div>

                    {/* RFC Emisor */}
                    <div>
                      <div className="flex justify-between items-center mb-1.5">
                        <label className="text-[9px] text-slate-500 font-bold uppercase tracking-wider block">RFC del Emisor comercial *</label>
                        {isRfcInvalid && (
                          <span className="text-[9px] text-rose-500 font-extrabold uppercase tracking-wider flex items-center gap-1 animate-pulse">
                            ⚠️ Inválido (12-13 Caracteres)
                          </span>
                        )}
                      </div>
                      <input
                        type="text"
                        value={editRfc}
                        onChange={(e) => setEditRfc(e.target.value)}
                        placeholder="Ej. NWM9709244W4"
                        maxLength={13}
                        className={`w-full bg-white border rounded-xl px-3 py-2 text-xs font-mono font-semibold text-slate-800 focus:outline-none transition uppercase ${
                          isRfcInvalid
                            ? "border-rose-450 bg-rose-50 focus:border-rose-500"
                            : "border-slate-200 focus:border-[#0B53F4] hover:border-slate-350"
                        }`}
                      />
                    </div>

                    {/* Referencia Folio */}
                    <div>
                      <div className="flex justify-between items-center mb-1.5">
                        <label className="text-[9px] text-slate-500 font-bold uppercase tracking-wider block">Folio o Referencia del ticket *</label>
                        {isFolioInvalid && (
                          <span className="text-[9px] text-[#0B53F4] font-extrabold uppercase tracking-wider flex items-center gap-1">
                            ⚠️ Requerido
                          </span>
                        )}
                      </div>
                      <input
                        type="text"
                        value={editFolio}
                        onChange={(e) => setEditFolio(e.target.value)}
                        placeholder="Ej. TR-495038"
                        className={`w-full bg-white border rounded-xl px-3 py-2 text-xs font-mono font-semibold text-slate-800 focus:outline-none transition-all ${
                          isFolioInvalid
                            ? "border-rose-455 bg-rose-50 focus:border-rose-500"
                            : "border-slate-200 focus:border-[#0B53F4] hover:border-slate-350"
                        }`}
                      />
                    </div>

                    {/* Fecha Compra */}
                    <div>
                      <div className="flex justify-between items-center mb-1.5">
                        <label className="text-[9px] text-slate-500 font-bold uppercase tracking-wider block">Fecha Compra (AAAA-MM-DD) *</label>
                        {isFechaInvalid && (
                          <span className="text-[9px] text-rose-500 font-extrabold uppercase tracking-wider flex items-center gap-1 animate-pulse">
                            ⚠️ Requerido
                          </span>
                        )}
                      </div>
                      <input
                        type="text"
                        value={editFecha}
                        onChange={(e) => setEditFecha(e.target.value)}
                        placeholder="Ej. 2026-06-08"
                        className={`w-full bg-white border rounded-xl px-3 py-2 text-xs font-mono font-semibold text-slate-800 focus:outline-none transition-all ${
                          isFechaInvalid
                            ? "border-rose-455 bg-rose-50 focus:border-rose-500"
                            : "border-slate-200 focus:border-[#0B53F4] hover:border-slate-350"
                        }`}
                      />
                    </div>

                    {/* Sucursal */}
                    <div>
                      <label className="text-[9px] text-slate-500 font-bold block mb-1.5 uppercase tracking-wider">Sucursal (Opcional)</label>
                      <input
                        type="text"
                        value={editSucursal}
                        onChange={(e) => setEditSucursal(e.target.value)}
                        placeholder="Ej. Sucursal Santa Fe"
                        className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 focus:outline-none focus:border-[#0B53F4] hover:border-slate-350 transition-all font-sans"
                      />
                    </div>

                    {/* Total Pagado */}
                    <div>
                      <div className="flex justify-between items-center mb-1.5">
                        <label className="text-[9px] text-slate-500 font-bold uppercase tracking-wider block">Total de la Compra ($ MXN) *</label>
                        {isTotalInvalid && (
                          <span className="text-[9px] text-rose-500 font-extrabold uppercase tracking-wider flex items-center gap-1 animate-pulse">
                            ⚠️ Total Inválido
                          </span>
                        )}
                      </div>
                      <input
                        type="number"
                        step="0.01"
                        value={editTotal || ""}
                        onChange={(e) => setEditTotal(parseFloat(e.target.value) || 0)}
                        placeholder="0.00"
                        className={`w-full bg-white border rounded-xl px-3 py-2 text-xs font-mono font-semibold text-slate-850 focus:outline-none transition-all ${
                          isTotalInvalid
                            ? "border-rose-455 bg-rose-50 focus:border-rose-500"
                            : "border-slate-200 focus:border-[#0B53F4] hover:border-slate-350"
                        }`}
                      />
                    </div>
                  </div>

                  <div className="flex gap-2.5 pt-3.5 justify-end">
                    <button
                      onClick={handleSaveEditedData}
                      className="text-[10px] font-black uppercase tracking-widest text-white bg-[#0B53F4] hover:bg-blue-600 px-6 py-3.5 rounded-xl transition duration-150 shadow-md shadow-[#0B53F4]/10 cursor-pointer active:scale-[0.98] select-none"
                    >
                      Confirmar y Guardar Cambios
                    </button>
                    {!checkIsDataIncomplete(extractedData) && (
                      <button
                        onClick={() => {
                          setEditNombre(extractedData.nombreEmisor || "");
                          setEditRfc(extractedData.rfcEmisor || "");
                          setEditFecha(extractedData.fechaCompra || "");
                          setEditFolio(extractedData.folio || "");
                          setEditSucursal(extractedData.sucursal || "");
                          setEditTotal(extractedData.total || 0);
                          setValidationError(null);
                          setIsEditing(false);
                        }}
                        className="text-[10px] font-bold uppercase tracking-widest text-[#0B53F4] bg-[#0B53F4]/5 border border-[#0B53F4]/10 px-5 py-3.5 rounded-xl transition cursor-pointer select-none"
                      >
                        Cancelar
                      </button>
                    )}
                  </div>
                </div>
              ) : (
                /* Static view for high-contrast data presentation */
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-50 p-5 rounded-2xl border border-slate-200/65 shadow-sm">
                  <div className="flex items-start gap-2.5">
                    <Building2 className="w-4 h-4 text-[#0B53F4] mt-1 shrink-0" />
                    <div>
                      <span className="text-[9px] text-slate-400 font-extrabold block uppercase tracking-wide font-sans">Emisor Comercial</span>
                      <span className="text-xs font-bold text-slate-850 uppercase">{extractedData.nombreEmisor}</span>
                    </div>
                  </div>

                  <div className="flex items-start gap-2.5">
                    <Cpu className="w-4 h-4 text-[#0B53F4] mt-1 shrink-0" />
                    <div>
                      <span className="text-[9px] text-slate-400 font-extrabold block uppercase tracking-wide font-sans">RFC Emisor</span>
                      <span className="text-xs font-mono font-bold text-slate-850 select-all">{extractedData.rfcEmisor}</span>
                    </div>
                  </div>

                  <div className="flex items-start gap-2.5">
                    <Calendar className="w-4 h-4 text-[#0B53F4] mt-1 shrink-0" />
                    <div>
                      <span className="text-[9px] text-slate-400 font-extrabold block uppercase tracking-wide font-sans">Fecha Compra</span>
                      <span className="text-xs font-bold text-slate-800 font-mono">{extractedData.fechaCompra}</span>
                    </div>
                  </div>

                  <div className="flex items-start gap-2.5">
                    <FileText className="w-4 h-4 text-[#0B53F4] mt-1 shrink-0" />
                    <div>
                      <span className="text-[9px] text-slate-400 font-extrabold block uppercase tracking-wide font-sans">Referencia Folio</span>
                      <span className="text-xs font-bold text-slate-850 font-mono select-all">{extractedData.folio}</span>
                    </div>
                  </div>

                  <div className="flex items-start gap-2.5">
                    <Sparkles className="w-4 h-4 text-[#FFB200] mt-1 shrink-0" />
                    <div>
                      <span className="text-[9px] text-slate-400 font-extrabold block uppercase tracking-wide font-sans">Sucursal</span>
                      <span className="text-xs font-bold text-slate-800 uppercase">{extractedData.sucursal || "General"}</span>
                    </div>
                  </div>

                  <div className="flex items-start gap-2.5">
                    <FileText className="w-4 h-4 text-[#0B53F4] mt-1 shrink-0" />
                    <div>
                      <span className="text-[9px] text-slate-400 font-extrabold block uppercase tracking-wide font-sans">Total Pagado</span>
                      <span className="text-sm font-black text-[#0B53F4] tracking-tight font-mono">${extractedData.total.toFixed(2)} MXN</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Items Desglose Preview */}
              <div>
                <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-widest block mb-2 font-sans">Desglose de Conceptos ({extractedData.items.length})</span>
                <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden max-h-32 overflow-y-auto scrollbar-none shadow-sm">
                  <table className="w-full text-xs text-left border-collapse font-sans">
                    <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold">
                      <tr>
                        <th className="px-4 py-2 uppercase tracking-wider text-[9px]">Concepto</th>
                        <th className="px-4 py-2 text-right w-24 uppercase tracking-wider text-[9px]">Importe</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {extractedData.items.map((item, index) => (
                        <tr key={index} className="hover:bg-slate-50/50">
                          <td className="px-4 py-2 text-slate-750 font-mono text-[10.5px] uppercase">{item.description}</td>
                          <td className="px-4 py-2 text-right text-slate-900 font-bold font-mono text-[10.5px]">${item.amount.toFixed(2)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Connector Validation Banner */}
              <div className="p-5 rounded-2xl border flex flex-col sm:flex-row sm:items-center justify-between gap-5 mt-4 bg-white border-slate-200 shadow-sm relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-[#0B53F4]/5 rounded-full blur-2xl pointer-events-none" />
                
                {matchingConnector ? (
                  <div className="flex items-center gap-3 relative z-10 font-sans">
                    <div className="w-10 h-10 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center shrink-0 border border-emerald-150">
                      <CheckCircle className="w-5 h-5" />
                    </div>
                    <div>
                      <h5 className="text-xs font-bold text-slate-900 uppercase tracking-wide">Conector de Facturación Encontrado</h5>
                      <p className="text-[10px] text-slate-400 mt-1 font-semibold">Navegación Playwright mapeada: <span className="font-mono underline text-[#0B53F4] font-bold">{matchingConnector.nombre}</span></p>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-start gap-3 relative z-10 font-sans">
                    <div className="w-10 h-10 bg-amber-50 text-[#FFB200] rounded-full flex items-center justify-center shrink-0 border border-amber-150 mt-0.5">
                      <AlertTriangle className="w-5 h-5 animate-pulse" />
                    </div>
                    <div className="flex-1">
                      <h5 className="text-xs font-bold text-slate-900 uppercase tracking-wide">No existe conector activo</h5>
                      <p className="text-[10px] text-slate-400 mt-1 max-w-sm leading-relaxed font-semibold">
                        Procederemos a ejecutar una auditoría por Google Search, interpretando el cargador del SAT para proponer nuevos selectores en segundos.
                      </p>
                    </div>
                  </div>
                )}

                <button
                  onClick={() => {
                    if (ticketId && onStartAutomation) {
                      onStartAutomation(ticketId);
                    }
                  }}
                  disabled={!fiscalProfile || !extractedData || checkIsDataIncomplete(extractedData)}
                  className="sm:shrink-0 text-[10px] font-bold uppercase tracking-widest flex items-center gap-1.5 text-white bg-[#0B53F4] hover:bg-blue-600 px-5.5 py-3.5 rounded-xl transition shadow-md shadow-[#0B53F4]/10 active:scale-[0.98] disabled:opacity-50 select-none relative z-10 cursor-pointer text-center"
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                  Iniciar Automatización
                </button>
              </div>

              {!fiscalProfile && (
                <div className="text-[10px] text-rose-600 flex items-center gap-2 font-bold bg-rose-50 border border-rose-150 rounded-xl p-3 mt-2 font-sans text-left">
                  <AlertTriangle className="w-4 h-4 shrink-0 text-rose-500" />
                  <span>Primero debes rellenar tus datos oficiales en la pestaña ⚙️ Perfil Fiscal antes de timbrar.</span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* STEP 3: PLAYWRIGHT ROBOT SIMULATOR RUNNING (TERMINAL STYLE) */}
      {activeStep === "automating" && (
        <div id="automating-panel" className="flex-1 flex flex-col justify-between relative z-10 animate-fade-in_50 font-sans text-left bg-white border border-slate-200 rounded-3xl p-6.5 shadow-sm">
          <div className="mb-4">
            <h3 className="text-sm font-black text-slate-950 flex items-center gap-1.5 mb-1 select-none uppercase">
              <Terminal className="w-4 h-4 text-[#0B53F4]" />
              Consola del Agente Playwright (Navegador Integrado)
            </h3>
            <p className="text-xs text-slate-400 font-medium">
              Analizando campos DOM y cargando valores en los selectores HTML del SAT emisor en tiempo real.
            </p>
          </div>

          {/* Interactive terminal output box with premium look */}
          <div className="flex-1 bg-slate-950 font-mono text-[11px] text-emerald-400 px-5 py-4 rounded-2xl border border-slate-900 min-h-[290px] max-h-[350px] overflow-y-auto space-y-2 select-text shadow-inner scrollbar-none">
            {/* Corner terminal icons */}
            <div className="sticky top-0 right-0 flex justify-end gap-1.5 pb-2 border-b border-slate-900 mb-2 bg-slate-950">
              <span className="w-2 h-2 rounded-full bg-red-500/50" />
              <span className="w-2 h-2 rounded-full bg-amber-500/50" />
              <span className="w-2 h-2 rounded-full bg-emerald-500/50" />
            </div>

            {simulationLogs.map((log, index) => (
              <div key={index} className="leading-relaxed border-l-2 border-emerald-950 hover:border-emerald-700 pl-3 py-0.5 whitespace-pre-wrap select-all">
                {log}
              </div>
            ))}
            
            {isAutomatingLoading && (
              <div className="flex items-center gap-2 text-sky-400 font-bold blink py-2 hover:text-sky-350 select-none">
                <Loader2 className="w-3.5 h-3.5 animate-spin shrink-0" />
                <span>[Playwright Active] Timbrando y certificando factura SAT en el PAC...</span>
              </div>
            )}
            <div ref={logsEndRef} />
          </div>

          {/* Progress bar visual */}
          <div className="mt-6 space-y-2">
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-450 font-bold font-sans">Progreso de simulación Playwright SAT</span>
              <span className="font-extrabold text-slate-900 font-mono">{simulationProgress}%</span>
            </div>
            <div className="w-full bg-slate-100 border border-slate-200 rounded-full h-2.5 overflow-hidden">
              <div
                className="bg-[#0B53F4] h-full rounded-full transition-all duration-300 shadow-md shadow-[#0B53F4]/10"
                style={{ width: `${simulationProgress}%` }}
              />
            </div>
          </div>
        </div>
      )}

      {/* STEP 4: SUCCESS GENERATED CONFIRMATION */}
      {activeStep === "success" && (
        <div className="flex-1 flex flex-col justify-center items-center text-center p-8 space-y-5 relative z-10 animate-fade-in_50 bg-white border border-slate-200/50 rounded-3xl shadow-sm">
          <div className="w-16 h-16 bg-emerald-50 border border-emerald-150 rounded-2xl flex items-center justify-center text-emerald-600 mx-auto scale-110 shadow-sm animate-bounce">
            <CheckCircle className="w-9 h-9" />
          </div>

          <div className="space-y-2">
            <h3 className="text-lg font-black text-slate-950 tracking-tight uppercase">¡Factura Automatizada con Éxito!</h3>
            <p className="text-xs text-slate-450 max-w-sm mx-auto leading-relaxed">
              El ticket comercial ha sido procesado, timbrado e incorporado de forma segura en tu historial de CFDIs v4.0 listos para consultar.
            </p>
          </div>

          <div className="flex justify-center gap-3 pt-3">
            <button
              onClick={() => {
                resetAll();
              }}
              className="text-xs font-bold uppercase tracking-wider bg-white hover:bg-slate-50 border border-slate-200 text-slate-650 px-5 py-3.5 rounded-xl transition cursor-pointer select-none shadow-sm"
            >
              Extraer Otro Ticket
            </button>

            <button
              onClick={() => {
                const btn = document.getElementById("tab-history");
                if (btn) btn.click();
              }}
              className="text-xs font-bold uppercase tracking-wider bg-[#0B53F4] hover:bg-blue-600 text-white px-5 py-3.5 rounded-xl transition cursor-pointer select-none flex items-center gap-1.5 shadow-md shadow-[#0B53F4]/10"
            >
              <Eye className="w-4 h-4" />
              Ver Factura Emitida
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
