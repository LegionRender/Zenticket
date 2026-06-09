export interface FiscalProfile {
  userId: string;
  rfc: string;
  razonSocial: string;
  regimenFiscal: string; // e.g. "601", "605", "625", "612"
  codigoPostal: string; // 5 digits
  usoCFDI: string; // e.g. "G03", "D01", "D02", "CP01"
  createdAt: string;
  updatedAt?: string;
}

export interface TicketItem {
  description: string;
  amount: number;
}

export interface ExtractedTicketData {
  rfcEmisor: string;
  nombreEmisor: string;
  fechaCompra: string;
  folio: string;
  total: number;
  sucursal?: string;
  items: TicketItem[];
}

export interface Ticket {
  id?: string;
  userId: string;
  imageUrl: string;
  status: "extracted" | "processing" | "completed" | "failed";
  rfcEmisor?: string;
  nombreEmisor?: string;
  fechaCompra?: string;
  folio?: string;
  total?: number;
  sucursal?: string;
  itemsJson?: string; // Stringified TicketItem[]
  connectorId?: string;
  invoiceId?: string;
  errorMsg?: string;
  createdAt: string;
}

export interface ConnectorField {
  key: string; // e.g. "rfc", "folio", "fecha", "total"
  name: string; // e.g. "RFC Emisor", "Folio del Ticket"
  selector: string; // CSS selector
  type: "text" | "number" | "date" | "select";
  required: boolean;
  value?: string;
}

export interface Connector {
  id?: string;
  userId: string; // 'system' or authenticated uid
  nombre: string;
  rfc: string;
  portalUrl: string;
  fieldsJson: string; // Serialized ConnectorField[]
  flowJson: string; // Serialized string[] (steps description)
  createdAt: string;
}

export interface Invoice {
  id?: string;
  userId: string;
  ticketId: string;
  folioFiscal: string; // UUID
  rfcEmisor: string;
  nombreEmisor: string;
  rfcReceptor: string;
  nombreReceptor: string;
  total: number;
  xmlContent: string;
  pdfHtml?: string; // HTML invoice layout
  createdAt: string;
}
