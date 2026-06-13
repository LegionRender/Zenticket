import React, { useState, useEffect } from "react";
import { Ticket, Invoice } from "../types";
import {
  ChevronLeft,
  Share2,
  FileText,
  Check,
  Camera,
  Download,
  ArrowLeft,
  Coffee,
  ShoppingBag,
  Car,
  Plus,
  Printer,
  Mail,
  Trash2,
  Clock,
  Sparkles,
  Eye,
  ShieldCheck,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  X,
  ExternalLink,
  RefreshCw,
  Search,
  SlidersHorizontal,
  ChevronRight,
  AlertCircle,
  XCircle,
  MessageSquare,
  HelpCircle,
  Bell,
} from "lucide-react";
import { useToast } from "./Toast";

interface TicketsListScreenProps {
  tickets: Ticket[];
  invoices: Invoice[];
  onTriggerSimulationInline: (ticket: Ticket) => void;
  currentUserEmail?: string | null;
  onDeleteTicket?: (ticketId: string) => void;
  onTabChange?: (
    tab:
      | "capturar"
      | "tickets"
      | "conectores"
      | "historial"
      | "resumen"
      | "cuenta"
      | "admin",
  ) => void;
  newlyAddedTicketId?: string | null;
  onClearNewlyAddedTicketId?: () => void;
}

// ----------------------------------------------------
// HIGH FIDELITY MOCK DATA SEEDING
// ----------------------------------------------------

const MOCK_ACTIVE_TICKETS = [
  {
    id: "mock-active-1",
    nombreEmisor: "Starbucks Santa Fe",
    folio: "88219",
    fechaCompra: "12 Oct",
    total: 245.0,
    status: "processing" as const,
  },
  {
    id: "mock-active-2",
    nombreEmisor: "Gasolinera Pemex",
    folio: "11029",
    fechaCompra: "11 Oct",
    total: 1200.5,
    status: "processing" as const,
  },
];

const MOCK_EMITTED_INVOICES = [
  {
    id: "mock-inv-costco",
    ticketId: "mock-active-costco",
    nombreEmisor: "Costco México",
    rfcEmisor: "CCO120304AA1",
    nombreReceptor: "RICARDO CASTRO BECERRIL",
    rfcReceptor: "CABE850101ABC",
    folioFiscal: "9BD8FECA-FC12-4235-BDF4-8E4EF69BA81E",
    total: 1245.5,
    createdAt: "14/05/2024",
    items: [
      {
        description: "1x Membresía Anual Titular Ejecutiva",
        amount: 500.0,
        code: "93151500",
      },
      {
        description: "1x Café de Grano Orgánico Kirkland 1.13kg",
        amount: 455.5,
        code: "50201706",
      },
      {
        description: "1x Pastel de Tres Leches Helado Repostería",
        amount: 290.0,
        code: "50192109",
      },
    ],
    xmlContent: `<?xml version="1.0" encoding="UTF-8"?><cfdi:Comprobante Version="4.0" Total="1245.50" SubTotal="1073.71"><cfdi:Emisor Rfc="CCO120304AA1" Nombre="COSTCO DE MEXICO S.A. DE C.V."/><cfdi:Receptor Rfc="CABE850101ABC" Nombre="RICARDO CASTRO BECERRIL" UsoCFDI="G03"/></cfdi:Comprobante>`,
  },
  {
    id: "mock-inv-oxxo",
    ticketId: "mock-active-oxxo",
    nombreEmisor: "Oxxo",
    rfcEmisor: "OXXO8605231N4",
    nombreReceptor: "LEONARDO GOMEZ RENDER",
    rfcReceptor: "GORL940812S1A",
    folioFiscal: "F4A9D231-15BB-47AD-A12B-DF9E2184B1E5",
    total: 145.0,
    createdAt: "15/10/2023",
    items: [
      {
        description: "1x Coca-Cola Sin Azúcar 600ml",
        amount: 18.5,
        code: "50202306",
      },
      {
        description: "1x Sándwich de Jamón y Queso",
        amount: 48.0,
        code: "50192500",
      },
      {
        description: "1x Papas Sabritas Adobadas 42g",
        amount: 22.5,
        code: "50192100",
      },
      {
        description: "1x Café Americano Andatti Med",
        amount: 56.0,
        code: "50201708",
      },
    ],
    xmlContent: `<?xml version="1.0" encoding="UTF-8"?><cfdi:Comprobante Version="4.0" Total="145.00" SubTotal="125.00"><cfdi:Emisor Rfc="OXXO8605231N4" Nombre="OXXO S.A. DE C.V."/><cfdi:Receptor Rfc="GORL940812S1A" Nombre="LEONARDO GOMEZ RENDER" UsoCFDI="G03"/></cfdi:Comprobante>`,
  },
  {
    id: "mock-inv-walmart",
    ticketId: "mock-active-walmart",
    nombreEmisor: "Walmart",
    rfcEmisor: "WALM9203251A9",
    nombreReceptor: "LEONARDO GOMEZ RENDER",
    rfcReceptor: "GORL940812S1A",
    folioFiscal: "A3B5F691-89CD-4A5D-B27D-5A8FCE46C89A",
    total: 1112.3,
    createdAt: "14/10/2023",
    items: [
      {
        description: "1x Detergente Líquido Ariel 4L",
        amount: 249.0,
        code: "47131801",
      },
      {
        description: "1x Pañal Huggies All Around G",
        amount: 389.0,
        code: "53102305",
      },
      {
        description: "1x Aceite Vegetal Capullo 840ml",
        amount: 54.5,
        code: "50151513",
      },
      {
        description: "2x Arroz Súper Extra Morelos 1kg",
        amount: 68.0,
        code: "50221101",
      },
      {
        description: "1x Pechuga de Pollo Premium 1.2kg",
        amount: 168.0,
        code: "50111515",
      },
      {
        description: "1x Desodorante Rexona Clinical Men",
        amount: 95.0,
        code: "53131609",
      },
      {
        description: "1x Sector Frutas y Verduras Frescas",
        amount: 88.8,
        code: "50401500",
      },
    ],
    xmlContent: `<?xml version="1.0" encoding="UTF-8"?><cfdi:Comprobante Version="4.0" Total="1112.30" SubTotal="958.88"><cfdi:Emisor Rfc="WALM9203251A9" Nombre="WAL COMPREHENSIVE S. DE R.L."/><cfdi:Receptor Rfc="GORL940812S1A" Nombre="LEONARDO GOMEZ RENDER" UsoCFDI="G03"/></cfdi:Comprobante>`,
  },
  {
    id: "mock-inv-farmacia",
    ticketId: "mock-active-farmacia",
    nombreEmisor: "Farmacia San Pablo",
    rfcEmisor: "FSAP9203112A4",
    nombreReceptor: "LEONARDO GOMEZ RENDER",
    rfcReceptor: "GORL940812S1A",
    folioFiscal: "D4E8F1A2-D6FE-437E-9CE1-6A2F1B8A4D2E",
    total: 450.0,
    createdAt: "12/10/2023",
    items: [
      {
        description: "1x Tempra Forte 650mg 24 Tabs",
        amount: 145.0,
        code: "51101500",
      },
      {
        description: "1x Histiacil Jarabe Adulto 150ml",
        amount: 185.0,
        code: "51181503",
      },
      {
        description: "1x Gasa Estéril Caja 10 pzas",
        amount: 120.0,
        code: "42141503",
      },
    ],
    xmlContent: `<?xml version="1.0" encoding="UTF-8"?><cfdi:Comprobante Version="4.0" Total="450.00" SubTotal="387.93"><cfdi:Emisor Rfc="FSAP9203112A4" Nombre="FARMACIA SAN PABLO S.A."/><cfdi:Receptor Rfc="GORL940812S1A" Nombre="LEONARDO GOMEZ RENDER" UsoCFDI="G03"/></cfdi:Comprobante>`,
  },
  {
    id: "mock-inv-pemex",
    ticketId: "mock-active-pemex",
    nombreEmisor: "Gasolinera Pemex",
    rfcEmisor: "PEME8201249A2",
    nombreReceptor: "LEONARDO GOMEZ RENDER",
    rfcReceptor: "GORL940812S1A",
    folioFiscal: "BE82C10E-5C13-4D90-A8EA-61E627B1390E",
    total: 1200.5,
    createdAt: "11/10/2023",
    items: [
      {
        description: "51.30L Gasolina Magna (Pemex Regular)",
        amount: 1200.5,
        code: "15101514",
      },
    ],
    xmlContent: `<?xml version="1.0" encoding="UTF-8"?><cfdi:Comprobante Version="4.0" Total="1200.50" SubTotal="1034.91"><cfdi:Emisor Rfc="PEME8201249A2" Nombre="COMBUSTIBLES PEMEX S.A."/><cfdi:Receptor Rfc="GORL940812S1A" Nombre="LEONARDO GOMEZ RENDER" UsoCFDI="G03"/></cfdi:Comprobante>`,
  },
  {
    id: "mock-inv-starbucks",
    ticketId: "mock-active-starbucks",
    nombreEmisor: "Starbucks",
    rfcEmisor: "CSI020226MV4",
    nombreReceptor: "LEONARDO GOMEZ RENDER",
    rfcReceptor: "GORL940812S1A",
    folioFiscal: "E5B9...4D22",
    total: 225.0,
    createdAt: "24/10/2023 14:22:10",
    items: [
      {
        description: "1x Latte Venti Caliente",
        amount: 105.0,
        code: "90101700",
      },
      { description: "1x Panini Pavo", amount: 120.0, code: "90101700" },
    ],
    xmlContent: `<?xml version="1.0" encoding="UTF-8"?><cfdi:Comprobante Version="4.0" Total="225.00" SubTotal="193.97"><cfdi:Emisor Rfc="CSI020226MV4" Nombre="CAFÉ SIRENA S. DE R.L. DE C.V."/><cfdi:Receptor Rfc="GORL940812S1A" Nombre="LEONARDO GOMEZ RENDER" UsoCFDI="G03"/></cfdi:Comprobante>`,
  },
];

// Helper to resolve icon style for brands matching the design aesthetics
const getBrandBrandIcon = (nombre: string) => {
  const name = nombre.toLowerCase();
  if (
    name.includes("starbucks") ||
    name.includes("coffee") ||
    name.includes("café")
  ) {
    return {
      IconComponent: Coffee,
      color: "bg-[#0B53F4]/10 text-[#0B53F4]",
    };
  }
  if (
    name.includes("pemex") ||
    name.includes("gas") ||
    name.includes("gasolina")
  ) {
    return {
      IconComponent: Car,
      color: "bg-[#0B53F4]/10 text-[#0B53F4]",
    };
  }
  if (
    name.includes("walmart") ||
    name.includes("super") ||
    name.includes("mercado") ||
    name.includes("oxxo")
  ) {
    return {
      IconComponent: ShoppingBag,
      color: "bg-[#0B53F4]/10 text-[#0B53F4]",
    };
  }
  if (
    name.includes("farmacia") ||
    name.includes("pablo") ||
    name.includes("salud")
  ) {
    return {
      IconComponent: ShieldCheck,
      color: "bg-[#0B53F4]/10 text-[#0B53F4]",
    };
  }
  return {
    IconComponent: FileText,
    color: "bg-[#0B53F4]/10 text-[#0B53F4]",
  };
};

export default function TicketsListScreen({
  tickets,
  invoices,
  onTriggerSimulationInline,
  currentUserEmail,
  onDeleteTicket,
  onTabChange,
  newlyAddedTicketId,
  onClearNewlyAddedTicketId,
}: TicketsListScreenProps) {
  const toast = useToast();

  // Smoothly clear the newly added ID after 5 seconds to stop pulsing
  useEffect(() => {
    if (newlyAddedTicketId && onClearNewlyAddedTicketId) {
      const timer = setTimeout(() => {
        onClearNewlyAddedTicketId();
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [newlyAddedTicketId, onClearNewlyAddedTicketId]);

  // Outer routing tabs: list or ver-pdf
  const [selectedInvoiceId, setSelectedInvoiceId] = useState<string | null>(
    null,
  );
  const [showXmlCode, setShowXmlCode] = useState(false);

  // Filter inside list
  const [activeSubTab, setActiveSubTab] = useState<
    "en-seguimiento" | "facturas-emitidas"
  >("en-seguimiento");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCapsule, setSelectedCapsule] = useState<
    "Todos" | "Completados" | "Pendientes" | "Fallidos"
  >("Todos");

  // Interactive inputs
  const [emailTo, setEmailTo] = useState(
    currentUserEmail || "legionrender@gmail.com",
  );
  const [isSendingEmail, setIsSendingEmail] = useState(false);
  const [ticketIdToDelete, setTicketIdToDelete] = useState<string | null>(null);
  const [smtpStatus, setSmtpStatus] = useState<{
    smtpConfigured: boolean;
    smtpUser: string | null;
  } | null>(null);

  // Retrieve SMTP setup status on load
  useEffect(() => {
    let active = true;
    fetch("/api/config/status")
      .then((res) => {
        if (!res.ok) throw new Error("Status failed");
        return res.json();
      })
      .then((data) => {
        if (active) {
          setSmtpStatus(data);
        }
      })
      .catch((err) => console.warn("SMTP check inactive:", err));
    return () => {
      active = false;
    };
  }, []);

  // Download logic for raw files
  const downloadFile = (
    content: string,
    fileName: string,
    contentType: string,
  ) => {
    const blob = new Blob([content], { type: contentType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = fileName;
    a.click();
    URL.revokeObjectURL(url);
    toast.success(
      `Archivo descargado con éxito: ${fileName}`,
      "Descarga Completa",
    );
  };

  // Email simulation matching original endpoint
  const handleSendEmail = async (invoiceObj: any) => {
    setIsSendingEmail(true);
    const emailToastId = toast.loading(
      `Enviando copia de factura a ${emailTo}...`,
      "Enviando Correo",
    );
    try {
      const response = await fetch("/api/email/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          to: emailTo,
          invoice: {
            ...invoiceObj,
            folioFiscal:
              invoiceObj.folioFiscal || "E5B9C231-18FA-427D-B27D-1F3D573B4D22",
            pdfHtml:
              invoiceObj.pdfHtml ||
              `<p>Factura de ${invoiceObj.nombreEmisor} por un total de $${invoiceObj.total}</p>`,
          },
        }),
      });
      const data = await response.json();
      toast.removeToast(emailToastId);
      if (response.ok) {
        toast.success(
          data.message || `¡Factura enviada con éxito a ${emailTo}!`,
          "Correo Enviado",
        );
      } else {
        throw new Error(data.error || "No se pudo enviar el correo");
      }
    } catch (err: any) {
      console.error(err);
      toast.removeToast(emailToastId);
      toast.error(err.message || "Error al enviar el correo", "Error de envío");
    } finally {
      setIsSendingEmail(false);
    }
  };

  // Use strictly real user data here, with absolutely no simulation/mock data.
  const inProgressList = tickets.filter((t) => t.status !== "completed");
  const emittedInvoicesList = invoices;

  // Handle opening the details view (both database and mock datasets)
  const activeInvoiceData =
    emittedInvoicesList.find((inv) => inv.id === selectedInvoiceId) ||
    MOCK_EMITTED_INVOICES.find((inv) => inv.id === selectedInvoiceId);

  // ----------------------------------------------------
  // THIRD VIEW SCREEN: VER PDF - DETALLE DE FACTURA
  // ----------------------------------------------------
  if (activeInvoiceData) {
    const isMock = activeInvoiceData.id?.startsWith("mock-");

    // Resolve dynamic currency and details
    const totalVal = activeInvoiceData.total || 0;
    const subtotalVal = totalVal / 1.16;
    const ivaVal = totalVal - subtotalVal;

    const emisorNameRaw = activeInvoiceData.nombreEmisor || "Emisor SAT";
    const emisorCorp = isMock
      ? (activeInvoiceData as any).nombreEmisor === "Starbucks"
        ? "Café Sirena S. de R.L. de C.V."
        : `${emisorNameRaw} S.A. de C.V.`
      : `${emisorNameRaw} S.A. de C.V.`;

    const rfcEmisorVal = activeInvoiceData.rfcEmisor || "CSI020226MV4";
    const uuidVal =
      activeInvoiceData.folioFiscal || "E5B9C231-18FA-427D-B27D-1F3D573B4D22";

    // Format dates nicely
    let formattedDate = "24/10/2023 14:22:10";
    if (!isMock && activeInvoiceData.createdAt) {
      try {
        formattedDate = new Date(activeInvoiceData.createdAt).toLocaleString(
          "es-MX",
        );
      } catch {
        formattedDate = activeInvoiceData.createdAt;
      }
    } else if (activeInvoiceData.createdAt) {
      formattedDate = activeInvoiceData.createdAt;
    }

    // Capture items list
    const itemsList = (activeInvoiceData as any).items || [
      {
        description: "1x Consumo General de Mercancías",
        amount: totalVal,
        code: "90101700",
      },
    ];

    const brandStyle = getBrandBrandIcon(emisorNameRaw);

    return (
      <div className="max-w-6xl mx-auto space-y-8 font-sans text-left mt-2 relative select-none pb-24 animate-fade-in_50">
        {/* Nav header matching Screen 3 */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => {
                setSelectedInvoiceId(null);
                setShowXmlCode(false);
              }}
              className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-full cursor-pointer transition"
              title="Volver"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h1 className="text-xl font-black text-slate-900 tracking-tight">
              Ver PDF - Detalle de Factura
            </h1>
          </div>

          <button
            type="button"
            onClick={() => {
              if (navigator.clipboard) {
                navigator.clipboard.writeText(
                  `https://sat.gob.mx/cfdi/${uuidVal}`,
                );
                toast.success(
                  "Enlace oficial CFDI SAT copiado con éxito.",
                  "Compartir Factura",
                );
              } else {
                toast.info(`UUID: ${uuidVal}`, "Detalle de Emisión");
              }
            }}
            className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-full cursor-pointer transition"
            title="Compartir"
          >
            <Share2 className="w-5 h-5 text-slate-650" />
          </button>
        </div>
        {/* Widescreen 2-column Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* LEFT COLUMN: THE WHITE PAPER INVOICE PREVIEW (lg:col-span-7) */}
          <div className="lg:col-span-7 space-y-6">
            {/* ELEGANT WHITE PAPER CONTAINER */}
            <div className="bg-white border border-slate-200/90 rounded-[28px] p-6 shadow-[0_4px_24px_rgba(15,23,42,0.04)] relative">
              {/* Top band row */}
              <div className="flex items-start justify-between">
                <span className="bg-[#0B53F4] text-white text-[10px] font-black tracking-widest px-3 py-1 rounded-md uppercase font-sans">
                  FACTURA ELECTRÓNICA
                </span>
                <div
                  className={`w-10 h-10 ${brandStyle.color} rounded-full flex items-center justify-center shrink-0`}
                >
                  <brandStyle.IconComponent className="w-5 h-5 stroke-[2.2]" />
                </div>
              </div>

              {/* Business identity */}
              <div className="mt-4 text-left">
                <h2 className="text-2xl font-black text-slate-800 tracking-tight leading-none mb-1">
                  {emisorNameRaw}
                </h2>
                <p className="text-xs text-slate-450 font-bold leading-normal">
                  {emisorCorp}
                </p>
              </div>

              {/* Dotted section divider */}
              <div className="border-t border-dashed border-slate-200 my-5" />

              {/* Two-column SAT tax metadata grid */}
              <div className="grid grid-cols-2 gap-y-4 gap-x-6 text-[10px] sm:text-[11px]">
                <div className="space-y-0.5 text-left">
                  <span className="text-slate-400 font-extrabold uppercase tracking-wide block">
                    RFC Emisor
                  </span>
                  <span className="text-slate-800 font-black tracking-tight block select-all">
                    {rfcEmisorVal}
                  </span>
                </div>

                <div className="space-y-0.5 text-left">
                  <span className="text-slate-400 font-extrabold uppercase tracking-wide block">
                    Folio Fiscal (UUID)
                  </span>
                  <span
                    className="text-slate-800 font-black tracking-tight block select-all truncate max-w-[140px]"
                    title={uuidVal}
                  >
                    {uuidVal.length > 15
                      ? `${uuidVal.substring(0, 8)}...${uuidVal.substring(uuidVal.length - 4)}`
                      : uuidVal}
                  </span>
                </div>

                <div className="space-y-0.5 text-left">
                  <span className="text-slate-400 font-extrabold uppercase tracking-wide block">
                    Fecha Emisión
                  </span>
                  <span className="text-slate-800 font-black block">
                    {formattedDate}
                  </span>
                </div>

                <div className="space-y-0.5 text-left">
                  <span className="text-slate-400 font-extrabold uppercase tracking-wide block">
                    Método Pago
                  </span>
                  <span className="text-slate-800 font-black block">
                    PUE - Pago en una sola exhibición
                  </span>
                </div>
              </div>

              {/* Dotted separation line */}
              <div className="border-t border-dashed border-slate-200 my-5" />

              {/* CONCEPTOS TABLE */}
              <div className="space-y-4">
                <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-widest text-left">
                  Conceptos
                </h3>

                <div className="space-y-3">
                  {itemsList.map((item: any, idx: number) => (
                    <div
                      key={idx}
                      className="flex justify-between items-start text-xs sm:text-sm"
                    >
                      <div className="text-left leading-normal max-w-[280px]">
                        <p className="font-extrabold text-slate-800 font-sans">
                          {item.description || item.descripcion}
                        </p>
                        <p className="text-[10px] text-slate-400 font-medium block mt-0.5">
                          Clave Prod/Serv: {item.code || "90101700"}
                        </p>
                      </div>
                      <span className="font-mono text-slate-900 font-black text-right shrink-0">
                        $
                        {(item.amount || item.importe || 0).toLocaleString(
                          "es-MX",
                          { minimumFractionDigits: 2 },
                        )}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* BLUE HIGHLIGHTED TOTAL BOX PILL */}
              <div className="bg-[#F1F3FE]/65 border border-blue-50 p-4.5 rounded-[22px] mt-6 space-y-2 text-left">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-500 font-bold">Subtotal</span>
                  <span className="font-mono text-slate-700 font-black">
                    $
                    {subtotalVal.toLocaleString("es-MX", {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </span>
                </div>

                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-500 font-bold">IVA (16%)</span>
                  <span className="font-mono text-slate-700 font-black">
                    $
                    {ivaVal.toLocaleString("es-MX", {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </span>
                </div>

                <div className="border-t border-slate-200/50 my-1 pt-1.5 flex justify-between items-center">
                  <span className="text-slate-800 font-black text-xs uppercase tracking-wider">
                    TOTAL MXN
                  </span>
                  <span className="font-mono text-[#0B53F4] text-lg font-black tracking-tight">
                    $
                    {totalVal.toLocaleString("es-MX", {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </span>
                </div>
              </div>

              {/* QR & SECURITY MATRIX FOOTER */}
              <div className="flex flex-col gap-4 mt-6 pt-5 border-t border-slate-100 text-left">
                <div className="flex items-center gap-4">
                  {/* Custom vector SVG QR code representation */}
                  <div className="w-14 h-14 bg-slate-100 flex-shrink-0 flex items-center justify-center rounded-lg p-1.5 border border-slate-200">
                    <svg
                      className="w-full h-full text-slate-700"
                      viewBox="0 0 100 100"
                      fill="currentColor"
                    >
                      <path d="M0,0 h30 v30 h-30 z M10,10 h10 v10 h-10 z" />
                      <path d="M70,0 h30 v30 h-30 z M80,10 h10 v10 h-10 z" />
                      <path d="M0,70 h30 v30 h-30 z M10,80 h10 v10 h-10 z" />
                      <path d="M40,10 h10 v10 h-10 z M55,0 h10 v15 h-10 z" />
                      <path d="M40,40 h15 v5 h-15 z M45,55 h20 v10 h-20 z" />
                      <path d="M75,40 h15 v20 h-15 z M85,75 h10 v15 h-10 z" />
                      <path d="M40,80 h10 v10 h-10 z M55,75 h20 v5 h-20 z" />
                    </svg>
                  </div>

                  <div className="leading-tight min-w-0 flex-1">
                    <p className="text-[7.5px] text-slate-400 font-mono select-all overflow-hidden text-ellipsis line-clamp-2 uppercase break-all">
                      Sello Digital del SAT:
                      JX9A23KSF841HLWND82HJKLSW0K295LW0192LSLW0KND82910NSDLUQ9W892019ADJLW2
                    </p>
                    <span className="text-[8px] uppercase font-black text-emerald-600 block mt-1 tracking-wider">
                      ✓ Formato de Factura Timbrada compatible v4.0
                    </span>
                  </div>
                </div>

                {/* SAT Live Verification Action Button */}
                <a
                  href={`https://verificacfdi.facturaelectronica.sat.gob.mx/default.aspx?id=${uuidVal}&re=${rfcEmisorVal}&rr=XAXX010101000&tt=${totalVal.toFixed(2)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-1.5 bg-slate-900 hover:bg-slate-850 text-white font-sans text-[10px] font-black uppercase tracking-wider py-2.5 px-3 rounded-xl transition cursor-pointer select-none border border-slate-800"
                >
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  Verificar Estado de Factura directamente en el SAT
                  <ExternalLink className="w-3 h-3 text-slate-400" />
                </a>
              </div>
            </div>

            {/* REAL WORKSPACE PICTURE BANNER */}
            <div className="w-full h-32 rounded-3xl overflow-hidden relative border border-slate-200 bg-slate-200">
              <img
                src="https://images.unsplash.com/photo-1542744094-3a31f103e35f?auto=format&fit=crop&q=80&w=800"
                alt="Workspace tablet banner"
                className="w-full h-full object-cover select-none pointer-events-none"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/40 via-transparent to-transparent" />
            </div>
          </div>{" "}
          {/* Close Left Column (lg:col-span-7) */}
          {/* RIGHT COLUMN: ACTIONS, CODE PREVIEWS & ACCORDIONS (lg:col-span-5) */}
          <div className="lg:col-span-5 space-y-6">
            {/* PRIMARY ACTIVE BIG ACTIONS */}
            <div className="space-y-3.5">
              <button
                type="button"
                onClick={() => {
                  toast.info(
                    "Generando reporte PDF tamaño carta oficial...",
                    "PDF",
                  );
                  setTimeout(() => {
                    const printWindow = window.open("", "_blank");
                    if (printWindow) {
                      printWindow.document.write(`
                    <!DOCTYPE html>
                    <html>
                      <head>
                        <title>Factura_${emisorNameRaw}_${uuidVal.substring(0, 8)}</title>
                        <style>
                          @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;700&family=Playfair+Display:ital,wght@1,600&display=swap');
                          
                          * {
                            box-sizing: border-box;
                          }
                          body {
                            font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
                            color: #1e293b;
                            background-color: #f1f5f9;
                            margin: 0;
                            padding: 40px 10px;
                            -webkit-print-color-adjust: exact;
                            print-color-adjust: exact;
                          }
                          .page-wrapper {
                            max-width: 820px;
                            margin: 0 auto;
                            background-color: #ffffff;
                            border: 1px solid #e2e8f0;
                            border-radius: 40px;
                            padding: 56px;
                            box-shadow: 0 20px 40px -15px rgba(15,23,42,0.06);
                            position: relative;
                            overflow: hidden;
                          }
                          
                          /* Top-right custom curved graphic elements inspired by modern designer templates */
                          .top-right-decor {
                            position: absolute;
                            top: -60px;
                            right: -60px;
                            width: 280px;
                            height: 280px;
                            background: linear-gradient(135deg, #0B53F4 0%, #38bdf8 100%);
                            border-radius: 50% 50% 0% 100%;
                            z-index: 1;
                            opacity: 0.95;
                          }
                          .top-right-decor-sub {
                            position: absolute;
                            top: -100px;
                            right: 140px;
                            width: 150px;
                            height: 150px;
                            background: rgba(11, 83, 244, 0.08);
                            border-radius: 50%;
                            z-index: 2;
                          }

                          /* Bottom-left custom curved graphic elements */
                          .bottom-left-decor {
                            position: absolute;
                            bottom: -90px;
                            left: -90px;
                            width: 250px;
                            height: 250px;
                            background: linear-gradient(315deg, #0B53F4 0%, #1e1b4b 100%);
                            border-radius: 0% 100% 50% 50%;
                            z-index: 1;
                            opacity: 0.9;
                          }

                          .header-container {
                            display: flex;
                            justify-content: space-between;
                            align-items: flex-start;
                            position: relative;
                            z-index: 10;
                            margin-bottom: 50px;
                          }

                          /* Styled Logo matching modern look */
                          .logo-badge-row {
                            display: flex;
                            align-items: center;
                            gap: 16px;
                          }
                          .logo-circle {
                            width: 64px;
                            height: 64px;
                            border-radius: 20px;
                            background-color: #0b53f4;
                            color: #ffffff;
                            display: flex;
                            align-items: center;
                            justify-content: center;
                            font-weight: 800;
                            font-size: 28px;
                            box-shadow: 0 8px 16px rgba(11,83,244,0.18);
                          }
                          .logo-text-title {
                            font-size: 26px;
                            font-weight: 800;
                            color: #0d1527;
                            letter-spacing: -0.025em;
                            margin: 0;
                            line-height: 1;
                          }
                          .logo-text-subtitle {
                            font-size: 11px;
                            font-weight: 700;
                            color: #0B53F4;
                            text-transform: uppercase;
                            letter-spacing: 0.15em;
                            margin: 4px 0 0 0;
                          }

                          /* Heading right of Invoice */
                          .invoice-title-box {
                            text-align: right;
                            padding-right: 0px; /* Aligned cleanly without top-right decor */
                          }
                          .invoice-title-box h1 {
                            font-size: 40px;
                            font-weight: 900;
                            color: #0b53f4;
                            margin: 0 0 10px 0;
                            letter-spacing: 0.05em;
                            text-transform: uppercase;
                          }
                          .invoice-meta-item {
                            font-size: 12px;
                            font-weight: 500;
                            color: #475569;
                            margin: 4px 0;
                          }
                          .invoice-meta-item strong {
                            color: #0f172a;
                            font-weight: 700;
                          }

                          /* Columns section: BILL TO & metadata */
                          .billing-info-section {
                            display: grid;
                            grid-template-cols: 1.2fr 0.8fr;
                            gap: 40px;
                            margin-bottom: 45px;
                            position: relative;
                            z-index: 10;
                          }
                          .bill-to-box {
                            border-top: 3px solid #0b53f4;
                            padding-top: 15px;
                          }
                          .bill-title {
                            font-size: 12px;
                            font-weight: 800;
                            color: #0b53f4;
                            text-transform: uppercase;
                            letter-spacing: 0.12em;
                            margin-bottom: 12px;
                          }
                          .bill-client-name {
                            font-size: 18px;
                            font-weight: 800;
                            color: #0f172a;
                            margin: 0 0 8px 0;
                          }
                          .bill-details {
                            font-size: 12px;
                            line-height: 1.6;
                            color: #475569;
                          }
                          .bill-details p {
                            margin: 4px 0;
                          }

                          /* Styled Table layout following modern design precisely */
                          .table-container {
                            margin-bottom: 40px;
                            position: relative;
                            z-index: 10;
                          }
                          .invoice-table {
                            width: 100%;
                            border-collapse: collapse;
                            text-align: left;
                          }
                          .invoice-table th {
                            background-color: #0b53f4;
                            color: #ffffff;
                            font-size: 11px;
                            font-weight: 800;
                            text-transform: uppercase;
                            padding: 16px 20px;
                            letter-spacing: 0.1em;
                            border: none;
                          }
                          .invoice-table th:first-child {
                            border-top-left-radius: 12px;
                            border-bottom-left-radius: 12px;
                            width: 60px;
                            text-align: center;
                          }
                          .invoice-table th:last-child {
                            border-top-right-radius: 12px;
                            border-bottom-right-radius: 12px;
                            text-align: right;
                          }
                          
                          .invoice-table td {
                            padding: 16px 20px;
                            font-size: 13px;
                            color: #334155;
                            border-bottom: 1px solid #e2e8f0;
                          }
                          .invoice-table tr:hover td {
                            background-color: #f8fafc;
                          }
                          .cell-st {
                            text-align: center;
                            font-weight: 700;
                            color: #94a3b8;
                            background-color: #fafbfc;
                            border-right: 1px solid #f1f5f9;
                          }
                          .cell-desc {
                            font-weight: 700;
                            color: #0f172a;
                          }
                          .cell-desc .subtext {
                            font-size: 11px;
                            color: #64748b;
                            font-weight: 400;
                            margin-top: 4px;
                            display: block;
                          }
                          .cell-rate, .cell-qty {
                            color: #475569;
                            font-weight: 600;
                          }
                          .cell-total {
                            font-family: 'JetBrains Mono', monospace;
                            font-weight: 700;
                            color: #0f172a;
                            text-align: right;
                          }

                          /* Bottom totals combined with signatures & notes */
                          .bottom-invoice-row {
                            display: grid;
                            grid-template-cols: 1.12fr 0.88fr;
                            gap: 30px;
                            margin-top: 10px;
                            position: relative;
                            z-index: 10;
                          }
                          
                          .payment-and-signs {
                            display: flex;
                            flex-direction: column;
                            justify-content: space-between;
                          }
                          .notes-block {
                            background-color: #f8fafc;
                            border-radius: 16px;
                            padding: 20px;
                            font-size: 11px;
                            color: #64748b;
                            line-height: 1.5;
                            margin-bottom: 24px;
                          }
                          .notes-block h4 {
                            font-size: 11px;
                            font-weight: 800;
                            text-transform: uppercase;
                            color: #1e293b;
                            margin: 0 0 6px 0;
                            letter-spacing: 0.05em;
                          }

                          /* Signature section as requested from template */
                          .signature-container {
                            margin-top: 10px;
                            text-align: left;
                          }
                          .signature-author {
                            font-family: 'Playfair Display', Georgia, serif;
                            font-size: 26px;
                            color: #0b53f4;
                            font-style: italic;
                            margin: 0 0 4px 0;
                            user-select: none;
                          }
                          .signature-line {
                            width: 200px;
                            height: 1.5px;
                            background-color: #cbd5e1;
                            margin-bottom: 6px;
                          }
                          .signature-title {
                            font-size: 11px;
                            font-weight: 750;
                            color: #64748b;
                            text-transform: uppercase;
                            letter-spacing: 0.05em;
                          }

                          /* Grand total panel precisely like template */
                          .grand-totals-panel {
                            display: flex;
                            flex-direction: column;
                            gap: 12px;
                            background-color: #ffffff;
                            border: 1.5px solid #f1f5f9;
                            border-radius: 24px;
                            padding: 24px;
                            align-self: flex-start;
                          }
                          .subtotal-metric-row {
                            display: flex;
                            justify-content: space-between;
                            align-items: center;
                            font-size: 13px;
                            font-weight: 600;
                            color: #475569;
                          }
                          .subtotal-metric-row span:last-child {
                            font-family: 'JetBrains Mono', monospace;
                            color: #1e293b;
                            font-weight: 700;
                          }
                          
                          /* Blue total box with slanted layout simulation (or professional rounded badge) */
                          .grand-total-blue-badge {
                            background: linear-gradient(90deg, #0b53f4 0%, #0942c4 100%);
                            border-radius: 12px;
                            padding: 16px 20px;
                            display: flex;
                            justify-content: space-between;
                            align-items: center;
                            color: #ffffff;
                            margin-top: 10px;
                            box-shadow: 0 6px 16px rgba(11,83,244,0.15);
                          }
                          .grand-total-blue-badge .label {
                            font-size: 12px;
                            font-weight: 800;
                            letter-spacing: 0.08em;
                            text-transform: uppercase;
                          }
                          .grand-total-blue-badge .val {
                            font-family: 'JetBrains Mono', monospace;
                            font-size: 20px;
                            font-weight: 800;
                          }

                          /* Sat Security Verification Row */
                          .sat-verification-section {
                            margin-top: 40px;
                            border-top: 1px solid #f1f5f9;
                            padding-top: 28px;
                            display: flex;
                            align-items: center;
                            gap: 24px;
                            position: relative;
                            z-index: 10;
                          }
                          .qr-code-holder {
                            width: 80px;
                            height: 80px;
                            background-color: #ffffff;
                            border: 1px dashed #cbd5e1;
                            border-radius: 16px;
                            padding: 8px;
                            flex-shrink: 0;
                            display: flex;
                            align-items: center;
                            justify-content: center;
                          }
                          .stamp-details-box {
                            flex-grow: 1;
                            min-width: 0;
                          }
                          .stamp-headline {
                            font-size: 9px;
                            font-weight: 800;
                            color: #94a3b8;
                            text-transform: uppercase;
                            letter-spacing: 0.08em;
                            margin: 0 0 6px 0;
                          }
                          .stamp-content {
                            font-family: 'JetBrains Mono', monospace;
                            font-size: 8px;
                            color: #64748b;
                            line-height: 1.4;
                            word-break: break-all;
                            margin: 0 0 8px 0;
                            background-color: #f8fafc;
                            padding: 8px 12px;
                            border-radius: 8px;
                            border: 1px solid #f1f5f9;
                          }
                          .certified-pill {
                            font-size: 11px;
                            font-weight: 800;
                            color: #10b981;
                            display: flex;
                            align-items: center;
                            gap: 6px;
                            text-transform: uppercase;
                          }
                          .certified-pill svg {
                            width: 14px;
                            height: 14px;
                            stroke: #10b981;
                          }

                          /* Interactive Contact Banner precisely styled like presentation mockup */
                          .custom-decor-footer-banner {
                            margin-top: 50px;
                            background-color: #0b53f4;
                            border-radius: 20px;
                            padding: 16px 24px;
                            display: flex;
                            justify-content: space-between;
                            align-items: center;
                            color: #ffffff;
                            font-size: 11px;
                            font-weight: 600;
                            position: relative;
                            z-index: 10;
                            box-shadow: 0 4px 15px rgba(11,83,244,0.1);
                          }
                          .footer-banner-item {
                            display: flex;
                            align-items: center;
                            gap: 8px;
                          }
                          .footer-banner-icon {
                            width: 24px;
                            height: 24px;
                            background-color: rgba(255,255,255,0.15);
                            border-radius: 50%;
                            display: flex;
                            align-items: center;
                            justify-content: center;
                            font-size: 10px;
                          }

                          @media print {
                            body {
                              background-color: #ffffff;
                              padding: 0;
                              margin: 0;
                            }
                            .page-wrapper {
                              border: none;
                              box-shadow: none;
                              padding: 20px;
                            }
                            .grand-totals-panel {
                              border: 1px solid #e2e8f0 !important;
                            }
                            .custom-decor-footer-banner {
                              background-color: #0b53f4 !important;
                              -webkit-print-color-adjust: exact;
                              print-color-adjust: exact;
                            }
                          }
                        </style>
                      </head>
                      <body>
                        <div class="page-wrapper">
                          <!-- Designer elements -->
                          <div class="bottom-left-decor"></div>
                          
                          <!-- Top Header info -->
                          <div class="header-container">
                            <div class="logo-badge-row">
                              <div class="logo-circle">
                                ${emisorNameRaw.substring(0, 2).toUpperCase()}
                              </div>
                              <div>
                                <h2 class="logo-text-title">${emisorNameRaw}</h2>
                                <p class="logo-text-subtitle">${emisorCorp || "Servicios Comerciales de Integración"}</p>
                              </div>
                            </div>
                            
                            <div class="invoice-title-box">
                              <h1>Factura</h1>
                              <div class="invoice-meta-item">Fecha: <strong>${formattedDate}</strong></div>
                              <div class="invoice-meta-item">UUID: <strong>${uuidVal.substring(0, 18)}...</strong></div>
                              <div class="invoice-meta-item">RFC Emisor: <strong>${rfcEmisorVal}</strong></div>
                            </div>
                          </div>
                          
                          <!-- Columns detailed box -->
                          <div class="billing-info-section">
                            <div class="bill-to-box">
                              <div class="bill-title">Facturado a (Cfdi Receptor)</div>
                              <h3 class="bill-client-name">Público General / Cliente Registrado</h3>
                              <div class="bill-details">
                                <p><strong>RFC:</strong> XAXX010101000</p>
                                <p><strong>Uso CFDI:</strong> G03 - Gastos en general</p>
                                <p><strong>Email:</strong> receptor.sat@zenticket.mx</p>
                                <p><strong>Régimen Fiscal:</strong> 616 - Sin obligaciones fiscales</p>
                              </div>
                            </div>
                            
                            <div class="bill-to-box">
                              <div class="bill-title">Datos Fiscales de Certificación</div>
                              <div class="bill-details" style="margin-top: 4px;">
                                <p><strong>Lugar de Expedición:</strong> CDMX, México</p>
                                <p><strong>Certificado SAT:</strong> 00001000000504465028</p>
                                <p><strong>Certificado Emisor:</strong> 00001000000503932847</p>
                                <p><strong>No. de Aprobación:</strong> PUE - Pago en una sola exhibición</p>
                              </div>
                            </div>
                          </div>
                          
                          <!-- Dynamic Concepts table structured with design -->
                          <div class="table-container">
                            <table class="invoice-table">
                              <thead>
                                <tr>
                                  <th>ST</th>
                                  <th>Descripción del Concepto</th>
                                  <th style="text-align: right;">Precio Unitario</th>
                                  <th style="text-align: center; width: 80px;">Cant.</th>
                                  <th style="text-align: right; width: 140px;">Importe</th>
                                </tr>
                              </thead>
                              <tbody>
                                ${itemsList
                                  .map((item: any, idx: number) => {
                                    const stNum = String(idx + 1).padStart(
                                      2,
                                      "0",
                                    );
                                    const itemDesc =
                                      item.description ||
                                      item.descripcion ||
                                      "Consumo General de Mercancías";
                                    const unitVal =
                                      item.amount || item.importe || 0;
                                    return `
                                    <tr>
                                      <td class="cell-st">${stNum}</td>
                                      <td class="cell-desc">
                                        <span>${itemDesc}</span>
                                        <span class="subtext">Clave SAT: 90101501 | Unidad: E48 - Servicio</span>
                                      </td>
                                      <td class="cell-rate" style="text-align: right;">$${unitVal.toLocaleString("es-MX", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                                      <td class="cell-qty" style="text-align: center;">1</td>
                                      <td class="cell-total">$${unitVal.toLocaleString("es-MX", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                                    </tr>
                                  `;
                                  })
                                  .join("")}
                              </tbody>
                            </table>
                          </div>
                          
                          <!-- Signatures & Notes row & Totals summary -->
                          <div class="bottom-invoice-row">
                            
                            <div class="payment-and-signs">
                              <div class="notes-block">
                                <h4>Términos y Condiciones de Certificación</h4>
                                <p>Este documento es una representación impresa de un CFDI versión 4.0. El pago se efectúa mediante una sola exhibición (PUE). Cualquier aclaración referente a la facturación de su ticket favor de realizarla dentro de los 30 días posteriores a la fecha de emisión.</p>
                              </div>
                              
                              <div class="signature-container">
                                <h4 class="signature-author">ZenTicket Digital</h4>
                                <div class="signature-line"></div>
                                <span class="signature-title">Firma del Emisor Certificado</span>
                              </div>
                            </div>
                            
                            <div class="grand-totals-panel">
                              <div class="subtotal-metric-row">
                                <span>Subtotal</span>
                                <span>$${subtotalVal.toLocaleString("es-MX", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                              </div>
                              <div class="subtotal-metric-row" style="border-bottom: 1.5px solid #f1f5f9; padding-bottom: 12px;">
                                <span>IVA Trasladado (16.00%)</span>
                                <span>$${ivaVal.toLocaleString("es-MX", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                              </div>
                              
                              <div class="grand-total-blue-badge">
                                <span class="label">Total Recibido</span>
                                <span class="val">$${totalVal.toLocaleString("es-MX", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                              </div>
                            </div>
                            
                          </div>
                          
                          <!-- SAT Security Block -->
                          <div class="sat-verification-section">
                            <div class="qr-code-holder">
                              <svg style="width: 100%; height: 100%; color: #1e293b;" viewBox="0 0 100 100" fill="currentColor">
                                <path d="M0,0 h30 v30 h-30 z M10,10 h10 v10 h-10 z" />
                                <path d="M70,0 h30 v30 h-30 z M80,10 h10 v10 h-10 z" />
                                <path d="M0,70 h30 v30 h-30 z M10,80 h10 v10 h-10 z" />
                                <path d="M40,10 h10 v10 h-10 z M55,0 h10 v15 h-10 z" />
                                <path d="M40,40 h15 v5 h-15 z M45,55 h20 v10 h-20 z" />
                                <path d="M75,40 h15 v20 h-15 z M85,75 h10 v15 h-10 z" />
                                <path d="M40,80 h10 v10 h-10 z M55,75 h20 v5 h-20 z" />
                              </svg>
                            </div>
                            <div class="stamp-details-box">
                              <h5 class="stamp-headline">Sello Digital del SAT</h5>
                              <p class="stamp-content">JX9A23KSF841HLWND82HJKLSW0K295LW0192LSLW0KND82910NSDLUQ9W892019ADJLW2</p>
                              <span class="certified-pill">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
                                  <polyline points="20 6 9 17 4 12"></polyline>
                                </svg>
                                Timbrado verificado en bases SAT en tiempo real
                              </span>
                            </div>
                          </div>
                          
                          <!-- Designer decorative contact footer bar -->
                          <div class="custom-decor-footer-banner">
                            <div class="footer-banner-item">
                              <span class="footer-banner-icon">📞</span>
                              <span>01-800-ZENTICKET</span>
                            </div>
                            <div class="footer-banner-item">
                              <span class="footer-banner-icon">🌐</span>
                              <span>www.zenticket.mx</span>
                            </div>
                            <div class="footer-banner-item">
                              <span class="footer-banner-icon">📍</span>
                              <span>Paseo de la Reforma 222, CDMX</span>
                            </div>
                          </div>

                        </div>
                      </body>
                    </html>
                  `);
                      printWindow.document.close();
                      printWindow.print();
                    }
                  }, 400);
                }}
                className="w-full bg-[#0B53F4] text-white hover:bg-[#0747D1] transition duration-150 flex items-center justify-center gap-2 py-4 rounded-2xl font-black uppercase text-xs shadow-md shadow-[#0B53F4]/20 cursor-pointer"
              >
                <FileText className="w-4 h-4 text-white" />
                Descargar PDF
              </button>

              <button
                type="button"
                onClick={() =>
                  downloadFile(
                    activeInvoiceData.xmlContent,
                    `Factura_${emisorNameRaw}_${uuidVal.substring(0, 10)}.xml`,
                    "text/xml",
                  )
                }
                className="w-full bg-[#F1F3FE] text-[#0B53F4] hover:bg-[#E2E6FD] border border-[#0B53F4]/10 transition duration-150 flex items-center justify-center gap-2 py-4 rounded-2xl font-black uppercase text-xs cursor-pointer"
              >
                <span>{"</>"}</span>
                Descargar XML
              </button>

              {/* INTERACTIVE XML PREVIEW COLLAPSE */}
              <button
                type="button"
                onClick={() => setShowXmlCode(!showXmlCode)}
                className={`w-full transition duration-150 flex items-center justify-center gap-2 py-4 rounded-2xl font-black uppercase text-xs cursor-pointer select-none ${
                  showXmlCode
                    ? "bg-slate-900 text-emerald-400 border border-slate-950"
                    : "bg-slate-50 text-slate-700 hover:bg-slate-100 border border-slate-200"
                }`}
              >
                <Eye className="w-4 h-4 shrink-0" />
                {showXmlCode
                  ? "Ocultar previsualizador XML"
                  : "Previsualizar XML CFDI original"}
              </button>
            </div>

            {showXmlCode && (
              <div className="bg-slate-950 text-emerald-400 rounded-3xl p-5 border border-slate-900 text-left relative overflow-hidden shadow-2xl select-all">
                <div className="absolute top-4 right-4 flex gap-1.5 z-10">
                  <span className="w-2.5 h-2.5 rounded-full bg-red-500 block"></span>
                  <span className="w-2.5 h-2.5 rounded-full bg-yellow-500 block"></span>
                  <span className="w-2.5 h-2.5 rounded-full bg-green-500 block"></span>
                </div>

                <div className="flex items-center gap-2 mb-3 pb-3 border-b border-zinc-900 select-none">
                  <span className="text-[10px] text-slate-500 font-sans font-black tracking-widest uppercase">
                    Código XML CFDI v4.0 Original Emitido
                  </span>
                </div>

                <pre className="font-mono text-[9px] sm:text-[10px] leading-relaxed overflow-x-auto max-h-[380px] text-slate-300">
                  {(() => {
                    const subT = totalVal / 1.16;
                    const ivT = totalVal - subT;
                    const recName =
                      (activeInvoiceData as any).nombreReceptor ||
                      "LEONARDO GOMEZ RENDER";
                    const recRfc =
                      (activeInvoiceData as any).rfcReceptor || "GORL940812S1A";
                    const detailedXml = `<?xml version="1.0" encoding="UTF-8"?>
<cfdi:Comprobante 
  Version="4.0" 
  Serie="F" 
  Folio="${(activeInvoiceData as any).folio || "88219"}" 
  Fecha="${formattedDate.replace(" ", "T")}" 
  SubTotal="${subT.toFixed(2)}" 
  Total="${totalVal.toFixed(2)}" 
  MetodoPago="PUE" 
  TipoDeComprobante="I" 
  LugarExpedicion="06600"
  xmlns:cfdi="http://www.sat.gob.mx/cfd/4" 
  xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" 
  xsi:schemaLocation="http://www.sat.gob.mx/cfd/4 http://www.sat.gob.mx/sitio_internet/cfd/4/cfdv40.xsd">
  
  <cfdi:Emisor 
    Rfc="${rfcEmisorVal}" 
    Nombre="${emisorCorp.toUpperCase()}" 
    RegimenFiscal="601" />
    
  <cfdi:Receptor 
    Rfc="${recRfc}" 
    Nombre="${recName.toUpperCase()}" 
    DomicilioFiscalReceptor="03100" 
    RegimenFiscalReceptor="605" 
    UsoCFDI="G03" />
    
  <cfdi:Conceptos>
    <cfdi:Concepto 
      ClaveProdServ="90101700" 
      Cantidad="1.00" 
      ClaveUnidad="E48" 
      Unidad="Servicio" 
      Descripcion="CONSuMO GENERAL - TICKET #${(activeInvoiceData as any).folio || "88219"}" 
      ValorUnitario="${subT.toFixed(2)}" 
      Importe="${subT.toFixed(2)}">
      <cfdi:Impuestos>
        <cfdi:Traslados>
          <cfdi:Traslado 
            Base="${subT.toFixed(2)}" 
            Impuesto="002" 
            TipoFactor="Tasa" 
            TasaOCuota="0.160000" 
            Importe="${ivT.toFixed(2)}" />
        </cfdi:Traslados>
      </cfdi:Impuestos>
    </cfdi:Concepto>
  </cfdi:Conceptos>
  
  <cfdi:Impuestos TotalImpuestosTrasladados="${ivT.toFixed(2)}">
    <cfdi:Traslados>
      <cfdi:Traslado 
        Impuesto="002" 
        TipoFactor="Tasa" 
        TasaOCuota="0.160000" 
        Importe="${ivT.toFixed(2)}" />
    </cfdi:Traslados>
  </cfdi:Impuestos>
  
  <cfdi:Complemento>
    <tfd:TimbreFiscalDigital 
      xmlns:tfd="http://www.sat.gob.mx/TimbreFiscalDigital" 
      xsi:schemaLocation="http://www.sat.gob.mx/TimbreFiscalDigital http://www.sat.gob.mx/sitio_internet/cfd/TimbreFiscalDigital/TimbreFiscalDigitalv11.xsd"
      Version="1.1" 
      UUID="${uuidVal}" 
      FechaTimbrado="${formattedDate.replace(" ", "T")}" 
      RfcProvCertif="SAT970701NN3" 
      SelloCFD="JX9A23KSF841HLWND82HJKLSW0K295LW0192LSLW0KND82910NSDLUQ9W892019ADJLW2" 
      SelloSAT="SAT0192LSLW0KND82910NSDLUQ9W892019ADJLW2JX9A23KSF841HLWND82HJKLSW0K295LW" 
      NoCertificadoSAT="00001000000504465028" />
  </cfdi:Complemento>
</cfdi:Comprobante>`;

                    return detailedXml.split("\n").map((line, lineIdx) => {
                      return (
                        <div key={lineIdx} className="whitespace-pre">
                          <span className="text-[9px] text-zinc-700 select-none mr-3 inline-block w-4 text-right">
                            {lineIdx + 1}
                          </span>
                          {line.split(/(<[^>]+>)/g).map((chunk, chunkIdx) => {
                            if (!chunk) return null;
                            if (chunk.startsWith("<") && chunk.endsWith(">")) {
                              const isClosing = chunk.startsWith("</");
                              const isDeclaration = chunk.startsWith("<?");
                              let tagColor = "text-sky-400 font-bold";
                              if (isDeclaration) tagColor = "text-emerald-400";
                              else if (isClosing)
                                tagColor = "text-sky-400 font-bold";

                              // Tokenize attributes
                              const parts = chunk.split(
                                /(\s+[a-zA-Z0-9:]+="[^"]*")/g,
                              );
                              return (
                                <span key={chunkIdx}>
                                  {parts.map((p, pIdx) => {
                                    if (p.trim().includes("=")) {
                                      const [attrName, attrVal] = p.split("=");
                                      return (
                                        <span key={pIdx}>
                                          <span className="text-cyan-400 font-medium">
                                            {attrName}
                                          </span>
                                          <span className="text-slate-400">
                                            =
                                          </span>
                                          <span className="text-amber-300 font-semibold">
                                            {attrVal}
                                          </span>
                                        </span>
                                      );
                                    }
                                    return (
                                      <span key={pIdx} className={tagColor}>
                                        {p}
                                      </span>
                                    );
                                  })}
                                </span>
                              );
                            }
                            return (
                              <span key={chunkIdx} className="text-slate-200">
                                {chunk}
                              </span>
                            );
                          })}
                        </div>
                      );
                    });
                  })()}
                </pre>

                <div className="mt-4 pt-3 border-t border-zinc-900 select-none flex flex-wrap gap-2 justify-between items-center text-[10px]">
                  <span className="text-emerald-500 font-sans font-extrabold flex items-center gap-1">
                    <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    Estructura XML Certificada (CFDI 4.0 Localizable en SAT)
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      const subT = totalVal / 1.16;
                      const ivT = totalVal - subT;
                      const recName =
                        (activeInvoiceData as any).nombreReceptor ||
                        "LEONARDO GOMEZ RENDER";
                      const recRfc =
                        (activeInvoiceData as any).rfcReceptor ||
                        "GORL940812S1A";
                      const detailedXmlText = `<?xml version="1.0" encoding="UTF-8"?>
<cfdi:Comprobante 
  Version="4.0" 
  Serie="F" 
  Folio="${(activeInvoiceData as any).folio || "88219"}" 
  Fecha="${formattedDate.replace(" ", "T")}" 
  SubTotal="${subT.toFixed(2)}" 
  Total="${totalVal.toFixed(2)}" 
  MetodoPago="PUE" 
  TipoDeComprobante="I" 
  LugarExpedicion="06600"
  xmlns:cfdi="http://www.sat.gob.mx/cfd/4" 
  xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" 
  xsi:schemaLocation="http://www.sat.gob.mx/cfd/4 http://www.sat.gob.mx/sitio_internet/cfd/4/cfdv40.xsd">
  
  <cfdi:Emisor 
    Rfc="${rfcEmisorVal}" 
    Nombre="${emisorCorp.toUpperCase()}" 
    RegimenFiscal="601" />
    
  <cfdi:Receptor 
    Rfc="${recRfc}" 
    Nombre="${recName.toUpperCase()}" 
    DomicilioFiscalReceptor="03100" 
    RegimenFiscalReceptor="605" 
    UsoCFDI="G03" />
    
  <cfdi:Conceptos>
    <cfdi:Concepto 
      ClaveProdServ="90101700" 
      Cantidad="1.00" 
      ClaveUnidad="E48" 
      Unidad="Servicio" 
      Descripcion="CONSuMO GENERAL - TICKET #${(activeInvoiceData as any).folio || "88219"}" 
      ValorUnitario="${subT.toFixed(2)}" 
      Importe="${subT.toFixed(2)}">
      <cfdi:Impuestos>
        <cfdi:Traslados>
          <cfdi:Traslado 
            Base="${subT.toFixed(2)}" 
            Impuesto="002" 
            TipoFactor="Tasa" 
            TasaOCuota="0.160000" 
            Importe="${ivT.toFixed(2)}" />
        </cfdi:Traslados>
      </cfdi:Impuestos>
    </cfdi:Concepto>
  </cfdi:Conceptos>
  
  <cfdi:Impuestos TotalImpuestosTrasladados="${ivT.toFixed(2)}">
    <cfdi:Traslados>
      <cfdi:Traslado 
        Impuesto="002" 
        TipoFactor="Tasa" 
        TasaOCuota="0.160000" 
        Importe="${ivT.toFixed(2)}" />
    </cfdi:Traslados>
  </cfdi:Impuestos>
  
  <cfdi:Complemento>
    <tfd:TimbreFiscalDigital 
      xmlns:tfd="http://www.sat.gob.mx/TimbreFiscalDigital" 
      xsi:schemaLocation="http://www.sat.gob.mx/TimbreFiscalDigital http://www.sat.gob.mx/sitio_internet/cfd/TimbreFiscalDigital/TimbreFiscalDigitalv11.xsd"
      Version="1.1" 
      UUID="${uuidVal}" 
      FechaTimbrado="${formattedDate.replace(" ", "T")}" 
      RfcProvCertif="SAT970701NN3" 
      SelloCFD="JX9A23KSF841HLWND82HJKLSW0K295LW0192LSLW0KND82910NSDLUQ9W892019ADJLW2" 
      SelloSAT="SAT0192LSLW0KND82910NSDLUQ9W892019ADJLW2JX9A23KSF841HLWND82HJKLSW0K295LW" 
      NoCertificadoSAT="00001000000504465028" />
  </cfdi:Complemento>
</cfdi:Comprobante>`;
                      navigator.clipboard.writeText(detailedXmlText);
                      toast.success(
                        "Código XML CFDI copiado al portapapeles.",
                        "Copiar XML",
                      );
                    }}
                    className="bg-slate-900 hover:bg-slate-850 text-slate-100 font-extrabold px-3 py-1.5 rounded-xl border border-slate-800 cursor-pointer active:scale-95 transition"
                  >
                    Copiar Código XML
                  </button>
                </div>
              </div>
            )}

            {/* CONECTOR REAL EN PRODUCCIÓN EXPLANATORY ACCORDION */}
            <div className="bg-slate-50 border border-slate-200 p-5 rounded-3xl space-y-3">
              <div className="flex items-center gap-2.5 text-left select-none">
                <Sparkles className="w-5 h-5 text-[#0B53F4] shrink-0" />
                <div className="leading-tight">
                  <span className="font-extrabold text-slate-800 text-xs block">
                    Conector Real en Producción
                  </span>
                  <span className="text-[10px] text-slate-400 block mt-0.5">
                    Cómo se procesa y verifica la extracción del portal
                  </span>
                </div>
              </div>

              <div className="text-slate-640 text-[11.5px] sm:text-xs text-left space-y-2 leading-relaxed">
                <p>
                  En esta demostración de ZenTicket,{" "}
                  <strong>
                    simulamos la interacción robotizada con el SAT y portales
                    comerciales
                  </strong>{" "}
                  para enseñarte las capacidades de extracción de la IA mediante
                  esquemas estructurados de selectores CSS (como Alsea, Oxxo o
                  Walmart).
                </p>
                <p>
                  <strong>
                    ¿Cómo hacerlo 100% real en tu propio producto de producción?
                  </strong>
                </p>
                <ul className="list-decimal pl-4.5 space-y-2 text-[11px] sm:text-[11.5px] font-semibold text-slate-700">
                  <li>
                    <strong className="text-slate-800">
                      Scraping Automático (Playwright/Puppeteer):
                    </strong>{" "}
                    Configura un robot en el servidor que cargue la URL del
                    portal del emisor, rellene los campos mapeados (RFC, folio,
                    total) usando selectores CSS, resuelva captchas usando
                    decodificadores (como <i>2Captcha</i>), proceda a emitir y
                    devuelva los archivos XML y PDF.
                  </li>
                  <li>
                    <strong className="text-slate-800">
                      Conexión directa vía PAC / SAT Web Service:
                    </strong>{" "}
                    Solicita facturas directamente al SAT o a proveedores
                    autorizados de certificación (PACs) asociando las
                    credenciales de tu FIEL / CSD, permitiendo la descargas
                    automáticas inmediatas desde las bases del SAT de forma
                    masiva sin captchas.
                  </li>
                </ul>
              </div>
            </div>

            {/* PRESERVE USEFUL UTILITIES OR EMAIL DISPATCH ROW */}
            <div className="bg-white border border-slate-200 p-4.5 rounded-3xl space-y-3.5">
              <div className="text-left text-xs leading-tight">
                <span className="font-extrabold text-slate-800 block">
                  Enviar copia de respaldo
                </span>
                <span className="text-slate-400 block mt-0.5">
                  Envía el archivo PDF y XML directo al buzón de tu contador
                </span>
              </div>

              <div className="flex gap-2">
                <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 flex-1 shadow-inner">
                  <Mail className="w-4 h-4 text-[#0B53F4]" />
                  <input
                    type="email"
                    value={emailTo}
                    onChange={(e) => setEmailTo(e.target.value)}
                    placeholder="buzon.fiscal@contador.com"
                    className="bg-transparent border-none text-xs text-slate-800 focus:outline-none w-full font-bold"
                  />
                </div>

                <button
                  type="button"
                  onClick={() => handleSendEmail(activeInvoiceData)}
                  disabled={isSendingEmail}
                  className="bg-[#0B53F4] hover:bg-[#0747D1] text-white px-5 rounded-xl text-xs font-black uppercase tracking-wider transition disabled:opacity-45 shrink-0 flex items-center justify-center cursor-pointer"
                >
                  Enviar
                </button>
              </div>

              {/* DYNAMIC SMTP CONFIGURATION NOTIFICATION */}
              <div className="pt-1.5 border-t border-slate-100 select-none text-left">
                {smtpStatus?.smtpConfigured ? (
                  <div className="flex items-start gap-2 bg-emerald-50/70 border border-emerald-200/60 rounded-xl p-3 text-left">
                    <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <div className="leading-tight">
                      <span className="text-[10.5px] text-emerald-800 font-extrabold block">
                        Servidor de Correo SMTP Activo
                      </span>
                      <p className="text-[9.5px] text-emerald-650 font-semibold block mt-0.5 leading-normal">
                        Credenciales configuradas para{" "}
                        <strong>{smtpStatus.smtpUser}</strong>. La factura XML y
                        PDF se enviará de forma <strong>REAL</strong> a{" "}
                        {emailTo}.
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col gap-1.5 bg-amber-50/70 border border-amber-200/50 rounded-xl p-3 text-left">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse shrink-0" />
                      <span className="text-[10.5px] text-amber-800 font-black">
                        Modo Sandbox: Correo Simulado
                      </span>
                    </div>
                    <p className="text-[9.5px] text-amber-700 leading-normal font-semibold">
                      Se ha simulado el envío con éxito. Si quieres que le
                      llegue un <strong>correo real</strong> a tu buzón personal
                      o al de tu contador, configura las claves{" "}
                      <code className="bg-amber-100/80 px-1 py-0.2 rounded font-mono text-[9px] font-black font-semibold text-amber-900">
                        SMTP_HOST
                      </code>
                      ,{" "}
                      <code className="bg-amber-100/80 px-1 py-0.2 rounded font-mono text-[9px] font-black font-semibold text-amber-900">
                        SMTP_USER
                      </code>{" "}
                      y{" "}
                      <code className="bg-amber-100/80 px-1 py-0.2 rounded font-mono text-[9px] font-black font-semibold text-amber-900">
                        SMTP_PASS
                      </code>{" "}
                      en la pestaña <strong>Settings &gt; Secrets</strong> de AI
                      Studio.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>{" "}
          {/* Close Right Column (lg:col-span-5) */}
        </div>{" "}
        {/* Close Grid layout container */}
      </div>
    );
  }

    // Count active tickets in follow up
  const activeCount = inProgressList.length;

  // Summing up real tickets and invoices
  const totalTicketsRecorded = tickets.length + invoices.length;
  const ticketsThisMonthCount = totalTicketsRecorded;

  const realPendingToInvoice = tickets.filter(t => t.status !== "completed").length;
  const pendingToInvoiceCount = realPendingToInvoice;

  // In real system: "review" means needing correction/failed, "processing" & "extracted" mean pending auto-routing
  const totalCompletedCount = invoices.length;
  const totalPendingCount = tickets.filter((t) => t.status === "processing" || t.status === "extracted").length;
  const totalFailedCount = tickets.filter((t) => t.status === "review" || t.status === "failed").length;

  interface MergedTicketItem {
    id: string;
    nombreEmisor: string;
    fechaCompra: string;
    total: number;
    status: "Completado" | "Pendiente" | "Fallido";
    logoType: string;
    mockInvoiceId?: string;
    rawObject?: Ticket;
  }

  // 1. High fidelity mockup list from the screenshots - cleared to strictly show real data
  const MOCK_TICKETS_IMAGE_LIST: MergedTicketItem[] = [];

  // 2. Map database registers and merge with mockups dynamically
  const mergedItems = React.useMemo<MergedTicketItem[]>(() => {
    let list = [...MOCK_TICKETS_IMAGE_LIST];

    // Append database invoices as Completed
    invoices.forEach((inv) => {
      // Avoid duplicate mockups if we already have them
      if (!inv.id.startsWith("mock-")) {
        list.push({
          id: inv.id,
          nombreEmisor: inv.nombreEmisor,
          fechaCompra: inv.createdAt
            ? new Date(inv.createdAt).toLocaleDateString("es-MX", {
                day: "numeric",
                month: "short",
                year: "numeric",
              })
            : "Reciente",
          total: inv.total || 0,
          status: "Completado",
          logoType: inv.nombreEmisor.toLowerCase(),
          mockInvoiceId: inv.id,
        });
      }
    });

    // Append database pending/failed tickets
    tickets.forEach((tick) => {
      if (tick.status !== "completed" && !tick.id.startsWith("mock-")) {
        const isFailed = tick.status === "review";
        list.push({
          id: tick.id,
          nombreEmisor: tick.nombreEmisor || "Ticket",
          fechaCompra:
            tick.fechaCompra ||
            (tick.createdAt
              ? new Date(tick.createdAt).toLocaleDateString("es-MX", {
                  day: "numeric",
                  month: "short",
                })
              : "Reciente"),
          total: tick.total || 0,
          status: isFailed ? "Fallido" : "Pendiente",
          logoType: (tick.nombreEmisor || "").toLowerCase(),
          rawObject: tick,
        });
      }
    });

    // Apply Search filter & Capsule filter
    return list.filter((item) => {
      // Search Box filter
      const matchesSearch =
        searchQuery.trim() === "" ||
        item.nombreEmisor.toLowerCase().includes(searchQuery.toLowerCase()) ||
        String(item.total).includes(searchQuery);

      // Capsule filter
      const matchesCapsule =
        selectedCapsule === "Todos" ||
        (selectedCapsule === "Completados" && item.status === "Completado") ||
        (selectedCapsule === "Pendientes" && item.status === "Pendiente") ||
        (selectedCapsule === "Fallidos" && item.status === "Fallido");

      return matchesSearch && matchesCapsule;
    });
  }, [tickets, invoices, searchQuery, selectedCapsule]);

  // ----------------------------------------------------
  // STANDARD INTERACTIVE MAIN SCREEN LIST VIEW
  // ----------------------------------------------------
  return (
    <div className="w-full flex flex-col font-sans select-none text-left bg-[#F4F7FC] dark:bg-transparent animate-fade-in_50">
      {/* 1. DEEP IMPERIAL BLUE GRADIENT HEADER CARD */}
      <div className="bg-gradient-to-b from-[#0B3EE4] via-[#05229C] to-[#01144F] text-white px-5 pt-10 pb-32 rounded-b-[40px] shadow-lg relative overflow-hidden shrink-0">
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
            onClick={() => toast.info("No tienes alertas del SAT sin revisar.", "Estado sincronizado")}
            className="w-[38px] h-[38px] rounded-full bg-white/10 hover:bg-white/15 flex items-center justify-center border border-white/10 transition cursor-pointer relative border-0"
          >
            <Bell className="w-4 h-4 text-white" />
            <span className="absolute top-[10px] right-[10px] w-2 h-2 bg-[#0B53F4] rounded-full ring-2 ring-[#031D79]" />
          </button>
        </div>

        {/* Personalized Title */}
        <div className="mb-2 relative z-10 text-left">
          <h2 className="text-[25px] font-black tracking-tight text-white leading-none">
            Mis tickets
          </h2>
          <span className="text-[11.5px] text-blue-100 font-bold block mt-1 tracking-tight select-none opacity-85">
            Consulta el estado de tus facturas
          </span>
        </div>

        {/* Dynamic Multi-column Stat boxes overlay */}
        <div className="grid grid-cols-2 gap-4 mt-6">
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/10 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600/30 flex items-center justify-center shrink-0">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 text-blue-300"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path d="M2 6a2 2 0 012-2h12a2 2 0 012 2v2a2 2 0 110 4v2a2 2 0 01-2 2H4a2 2 0 01-2-2v-2a2 2 0 110-4V6z" />
              </svg>
            </div>
            <div>
              <p className="text-2xl font-black font-mono text-white leading-none mb-1">
                {ticketsThisMonthCount}
              </p>
              <p className="text-[11px] text-blue-200 font-bold leading-none">
                tickets este mes
              </p>
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/10 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600/30 flex items-center justify-center shrink-0">
              <Clock className="w-5 h-5 text-blue-300" />
            </div>
            <div>
              <p className="text-2xl font-black font-mono text-white leading-none mb-1">
                {pendingToInvoiceCount}
              </p>
              <p className="text-[11px] text-blue-200 font-bold leading-none">
                pendientes de facturar
              </p>
            </div>
          </div>
        </div>

        <div className="flex justify-end mt-4">
          <button
            type="button"
            onClick={() => {
              setSelectedCapsule("Todos");
              setSearchQuery("");
              toast.info("Mostrando todos los registros.");
            }}
            className="text-xs font-bold text-blue-200 hover:text-white flex items-center gap-1 cursor-pointer transition-all border-0 bg-transparent"
          >
            Ver todos &rarr;
          </button>
        </div>
      </div>

      {/* 2. CURVY WHITE CONTENT WRAPPER */}
      <div className="px-5 -mt-24 pb-28 relative z-10 w-full max-w-lg mx-auto sm:max-w-2xl md:max-w-4xl lg:max-w-6xl">
        <div className="bg-white dark:bg-[#0b0d19]/85 dark:backdrop-blur-md rounded-[32px] p-5 md:p-8 shadow-[0_20px_50px_rgba(15,23,42,0.06)] dark:shadow-[0_20px_50px_rgba(0,0,0,0.3)] border border-slate-100 dark:border-white/5">
          {/* A. SEARCH BAR INPUT AND SLIDERS */}
          <div className="flex gap-2 items-center mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Buscar comercio o folio..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200/60 rounded-2xl pl-11 pr-4 py-3.5 text-[13.5px] focus:outline-none focus:ring-2 focus:ring-[#0B53F4]/15 focus:bg-white transition-all placeholder:text-slate-400 font-semibold text-left"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1 border-0 bg-transparent cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
            <button
              type="button"
              onClick={() => {
                setSelectedCapsule("Todos");
                setSearchQuery("");
                toast.success("Filtros restablecidos");
              }}
              className="w-[48px] h-[48px] rounded-2xl border border-slate-200/80 hover:bg-slate-50 flex items-center justify-center transition-all cursor-pointer text-slate-500 bg-transparent shrink-0"
              title="Restablecer filtros"
            >
              <SlidersHorizontal className="w-4 h-4 text-slate-500" />
            </button>
          </div>

          {/* B. HORIZONTAL CAPSULES SELECTOR */}
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none mb-6">
            {(["Todos", "Completados", "Pendientes", "Fallidos"] as const).map(
              (capsule) => {
                const isActive = selectedCapsule === capsule;
                return (
                  <button
                    key={capsule}
                    type="button"
                    onClick={() => {
                      setSelectedCapsule(capsule);
                      toast.info("Filtrando por: " + capsule);
                    }}
                    className={"px-5 py-2.5 rounded-full text-[12px] font-black whitespace-nowrap transition-all border shrink-0 cursor-pointer " + (
                      isActive
                        ? "bg-[#0B53F4] text-white border-[#0B53F4] shadow-md shadow-blue-500/10"
                        : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
                    )}
                  >
                    {capsule}
                  </button>
                );
              },
            )}
          </div>

          {/* C. RESUMEN DE ACTIVIDAD */}
          <div className="mb-6">
            <h3 className="text-slate-900 text-sm font-extrabold tracking-tight mb-3">
              Resumen de actividad
            </h3>
            <div className="grid grid-cols-3 gap-3">
              {/* Completados */}
              <div
                onClick={() => {
                  setSelectedCapsule("Completados");
                  toast.info("Mostrando facturas autorizadas.");
                }}
                className="bg-slate-50/50 hover:bg-slate-50 cursor-pointer p-4 rounded-3xl border border-slate-100 flex flex-col items-center justify-center text-center transition-all"
              >
                <div className="w-8 h-8 rounded-full bg-[#E6F4EA] flex items-center justify-center text-emerald-600 mb-2">
                  <Check className="w-4 h-4 stroke-[3]" />
                </div>
                <span className="text-[10.5px] font-bold text-slate-500">
                  Completados
                </span>
                <span className="text-xl font-black font-mono text-slate-900 mt-1">
                  {totalCompletedCount}
                </span>
              </div>

              {/* Pendientes */}
              <div
                onClick={() => {
                  setSelectedCapsule("Pendientes");
                  toast.info(
                    "Mostrando tickets listos para timbrado automático.",
                  );
                }}
                className="bg-slate-50/50 hover:bg-slate-50 cursor-pointer p-4 rounded-3xl border border-slate-100 flex flex-col items-center justify-center text-center transition-all"
              >
                <div className="w-8 h-8 rounded-full bg-[#FEF7E0] flex items-center justify-center text-amber-500 mb-2">
                  <Clock className="w-4 h-4" />
                </div>
                <span className="text-[10.5px] font-bold text-slate-500">
                  Pendientes
                </span>
                <span className="text-xl font-black font-mono text-slate-900 mt-1">
                  {totalPendingCount}
                </span>
              </div>

              {/* Fallidos */}
              <div
                onClick={() => {
                  setSelectedCapsule("Fallidos");
                  toast.info(
                    "Mostrando tickets bloqueados por datos incorrectos.",
                  );
                }}
                className="bg-slate-50/50 hover:bg-slate-50 cursor-pointer p-4 rounded-3xl border border-slate-100 flex flex-col items-center justify-center text-center transition-all"
              >
                <div className="w-8 h-8 rounded-full bg-[#FCE8E6] flex items-center justify-center text-red-500 mb-2">
                  <X className="w-3.5 h-3.5 stroke-[3]" />
                </div>
                <span className="text-[10.5px] font-bold text-slate-500">
                  Fallidos
                </span>
                <span className="text-xl font-black font-mono text-slate-900 mt-1">
                  {totalFailedCount}
                </span>
              </div>
            </div>
          </div>

          {/* D. PENDIENTES DE ATENCIÓN BANNER ROWS */}
          <div className="space-y-2 mb-6 text-left">
            <h3 className="text-slate-900 text-sm font-extrabold tracking-tight mb-2">
              Pendientes de atención
            </h3>

            {/* Row 1: Orange Box */}
            <div
              onClick={() => {
                setSelectedCapsule("Pendientes");
                toast.info(
                  "Mostrando tickets que requieren revisión en portales SAT",
                );
              }}
              className="bg-amber-50/70 hover:bg-amber-50 rounded-2xl p-4 border border-amber-100/60 cursor-pointer transition-all flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center font-black text-sm shrink-0">
                  !
                </div>
                <div>
                  <p className="text-[12.5px] font-extrabold text-amber-900">
                    2 tickets requieren revisión
                  </p>
                  <p className="text-[10px] text-amber-700 font-bold">
                    Verifica RFC y fecha de emisión
                  </p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-amber-600/60 shrink-0" />
            </div>

            {/* Row 2: Blue Box */}
            <div
              onClick={() => {
                if (onTabChange) onTabChange("cuenta");
                toast.info("Accediendo a tu perfil fiscal para verificar CP");
              }}
              className="bg-blue-50/50 hover:bg-blue-50 rounded-2xl p-4 border border-blue-100/50 cursor-pointer transition-all flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-black text-sm shrink-0">
                  i
                </div>
                <div>
                  <p className="text-[12.5px] font-extrabold text-blue-900">
                    1 ticket necesita datos fiscales
                  </p>
                  <p className="text-[10px] text-blue-700 font-bold">
                    Suministra tu código postal de facturación
                  </p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-blue-600/60 shrink-0" />
            </div>
          </div>

          {/* E. LISTA DE TICKETS */}
          <div className="mb-8">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-slate-900 text-sm font-extrabold tracking-tight">
                Lista de tickets
              </h3>
              <button
                type="button"
                onClick={() => {
                  setSelectedCapsule("Todos");
                  setSearchQuery("");
                  toast.success("Mostrando todos los registros");
                }}
                className="text-xs font-semibold text-blue-600 hover:text-blue-700 hover:underline flex items-center border-0 bg-transparent cursor-pointer"
              >
                Ver todo &rarr;
              </button>
            </div>

            {/* TICKET ITEMS GRID */}
            <div className="space-y-3">
              {mergedItems.length === 0 ? (
                <div className="text-center py-10 bg-slate-50/50 rounded-2xl border border-slate-100 animate-fade-in_50">
                  <p className="text-sm text-slate-500 font-medium">
                    No se encontraron tickets con los filtros actuales.
                  </p>
                </div>
              ) : (
                mergedItems.map((item) => {
                  const isCompleted = item.status === "Completado";
                  const isPending = item.status === "Pendiente";
                  const isFailed = item.status === "Fallido";

                  let statusBadgeBg = "";
                  let statusBadgeText = "";
                  if (isCompleted) {
                    statusBadgeBg = "bg-[#E6F4EA] text-emerald-700";
                    statusBadgeText = "Completado";
                  } else if (isPending) {
                    statusBadgeBg = "bg-[#FEF7E0] text-amber-700";
                    statusBadgeText = "Pendiente";
                  } else {
                    statusBadgeBg = "bg-[#FCE8E6] text-red-700";
                    statusBadgeText = "Fallido";
                  }

                  // Establish highly recognizable corporate color containers for key brands
                  let logoElem = null;
                  const logoLower = item.logoType.toLowerCase();

                  if (logoLower.includes("costco")) {
                    logoElem = (
                      <div className="w-11 h-11 rounded-full bg-[#1e3a8a] text-white flex flex-col items-center justify-center overflow-hidden shrink-0 border border-slate-100 shadow-2xs font-sans">
                        <span className="text-[10px] font-black leading-none text-red-500">
                          COS
                        </span>
                        <span className="text-[8px] font-bold tracking-wider leading-none text-[#FFF] mt-0.5">
                          TCO
                        </span>
                      </div>
                    );
                  } else if (logoLower.includes("oxxo")) {
                    logoElem = (
                      <div className="w-11 h-11 rounded-2xl bg-[#E1001A] text-[#FFF200] flex flex-col items-center justify-center overflow-hidden shrink-0 border border-red-200/50 shadow-2xs">
                        <span className="text-[11px] font-black tracking-tighter leading-none">
                          OXXO
                        </span>
                      </div>
                    );
                  } else if (
                    logoLower.includes("guadalajara") ||
                    logoLower.includes("farmacia")
                  ) {
                    logoElem = (
                      <div className="w-11 h-11 rounded-full bg-blue-600 text-white flex items-center justify-center overflow-hidden shrink-0 border border-blue-100 shadow-2xs font-extrabold text-base">
                        G
                      </div>
                    );
                  } else if (logoLower.includes("arcos")) {
                    logoElem = (
                      <div className="w-11 h-11 rounded-full bg-amber-500 text-white flex items-center justify-center overflow-hidden shrink-0 border border-amber-100 shadow-2xs">
                        <span className="text-[13px] font-extrabold leading-none">
                          LA
                        </span>
                      </div>
                    );
                  } else if (logoLower.includes("liverpool")) {
                    logoElem = (
                      <div className="w-11 h-11 rounded-full bg-[#E6007E] text-white flex items-center justify-center overflow-hidden shrink-0 border border-pink-100 shadow-2xs font-black text-lg">
                        L
                      </div>
                    );
                  } else if (logoLower.includes("starbucks")) {
                    logoElem = (
                      <div className="w-11 h-11 rounded-full bg-[#00704A] text-white flex items-center justify-center overflow-hidden shrink-0 border border-emerald-100 shadow-2xs">
                        <Coffee className="w-5 h-5 text-white" />
                      </div>
                    );
                  } else {
                    logoElem = (
                      <div className="w-11 h-11 rounded-full bg-indigo-50 text-[#0B53F4] flex items-center justify-center overflow-hidden shrink-0 border border-indigo-150 shadow-2xs">
                        <FileText className="w-5 h-5 text-[#0B53F4]/80" />
                      </div>
                    );
                  }

                  return (
                    <div
                      key={item.id}
                      onClick={() => {
                        if (isCompleted) {
                          setSelectedInvoiceId(item.mockInvoiceId || item.id);
                          toast.success(
                            "Abriendo visor fiscal para " + item.nombreEmisor
                          );
                        } else {
                          const associatedTick = item.rawObject;
                          if (associatedTick) {
                            onTriggerSimulationInline(associatedTick);
                          } else {
                            toast.info(
                              "Iniciando simulación de timbrado interactivo para " + item.nombreEmisor + "..."
                            );
                            if (onTabChange) onTabChange("capturar");
                          }
                        }
                      }}
                      className="flex items-center justify-between p-4 bg-slate-50/50 hover:bg-blue-50/40 rounded-2xl border border-slate-100 cursor-pointer transition-all duration-150 hover:shadow-xs hover:border-[#0B53F4]/15 group"
                    >
                      <div className="flex items-center gap-3 min-w-0 text-left">
                        {logoElem}
                        <div className="min-w-0">
                          <p className="text-[13.5px] font-black text-slate-800 tracking-tight truncate group-hover:text-[#0B53F4] transition-colors">
                            {item.nombreEmisor}
                          </p>
                          <p className="text-[10px] text-slate-400 font-bold mt-0.5">
                            {item.fechaCompra}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 shrink-0">
                        <div className="text-right">
                          <p className="text-[13.5px] font-black text-slate-900">
                            $
                            {item.total.toLocaleString("es-MX", {
                              minimumFractionDigits: 2,
                            })}
                          </p>
                          <span
                            className={"inline-block px-2 py-0.5 rounded-full text-[9px] font-black uppercase mt-1 tracking-wider " + statusBadgeBg}
                          >
                            {statusBadgeText}
                          </span>
                        </div>
                        <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-[#0B53F4] group-hover:translate-x-0.5 transition-all shrink-0" />
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* F. QUICK ACTION CARDS BUTTONS GRID 1X4 */}
          <div>
            <h3 className="text-slate-900 text-sm font-extrabold tracking-tight mb-4">
              Acciones rápidas
            </h3>
            <div className="grid grid-cols-4 gap-2.5">
              {/* Card 1: Escanear otro */}
              <button
                type="button"
                onClick={() => {
                  if (onTabChange) onTabChange("capturar");
                }}
                className="bg-white hover:bg-blue-50/40 border border-slate-200 hover:border-[#0B53F4]/15 rounded-2xl p-3 flex flex-col items-center justify-center text-center transition-all shadow-2xs group cursor-pointer"
              >
                <div className="w-10 h-10 rounded-full bg-blue-50 text-[#0B53F4] flex items-center justify-center mb-2 shadow-2xs group-hover:scale-105 transition-transform duration-120 border border-blue-100/50">
                  <Camera className="w-4.5 h-4.5 text-[#0B53F4]" />
                </div>
                <span className="text-[10.5px] font-black text-slate-700 tracking-tight leading-tight">
                  Escanear otro
                </span>
              </button>

              {/* Card 2: Historial */}
              <button
                type="button"
                onClick={() => {
                  if (onTabChange) onTabChange("historial");
                }}
                className="bg-white hover:bg-blue-50/40 border border-slate-200 hover:border-[#0B53F4]/15 rounded-2xl p-3 flex flex-col items-center justify-center text-center transition-all shadow-2xs group cursor-pointer"
              >
                <div className="w-10 h-10 rounded-full bg-blue-50 text-[#0B53F4] flex items-center justify-center mb-2 shadow-2xs group-hover:scale-105 transition-transform duration-120 border border-blue-100/50">
                  <Clock className="w-4.5 h-4.5 text-[#0B53F4]" />
                </div>
                <span className="text-[10.5px] font-black text-slate-700 tracking-tight leading-tight">
                  Historial
                </span>
              </button>

              {/* Card 3: Ayuda */}
              <button
                type="button"
                onClick={() => {
                  toast.success(
                    "¿Alguna duda? Consulta nuestra Base de Conocimientos o contacta a soporte corporativo en soporte@zenticket.com.mx."
                  );
                }}
                className="bg-white hover:bg-blue-50/40 border border-[#dee3f2] hover:border-[#0B53F4]/15 rounded-2xl p-3 flex flex-col items-center justify-center text-center transition-all shadow-2xs group cursor-pointer"
              >
                <div className="w-10 h-10 rounded-full bg-blue-50 text-[#0B53F4] flex items-center justify-center mb-2 shadow-2xs group-hover:scale-105 transition-transform duration-120 border border-blue-100/50">
                  <HelpCircle className="w-4.5 h-4.5 text-[#0B53F4]" />
                </div>
                <span className="text-[10.5px] font-black text-slate-700 tracking-tight leading-tight">
                  Ayuda
                </span>
              </button>

              {/* Card 4: Soporte */}
              <button
                type="button"
                onClick={() => {
                  toast.success(
                    "Conectando con un asesor de chat ZenTicket... Por favor, mantente en línea."
                  );
                }}
                className="bg-white hover:bg-blue-50/40 border border-slate-200 hover:border-[#0B53F4]/15 rounded-2xl p-3 flex flex-col items-center justify-center text-center transition-all shadow-2xs group cursor-pointer"
              >
                <div className="w-10 h-10 rounded-full bg-blue-50 text-[#0B53F4] flex items-center justify-center mb-2 shadow-2xs group-hover:scale-105 transition-transform duration-120 border border-blue-100/50">
                  <MessageSquare className="w-4.5 h-4.5 text-[#0B53F4]" />
                </div>
                <span className="text-[10.5px] font-black text-slate-700 tracking-tight leading-tight">
                  Soporte
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
