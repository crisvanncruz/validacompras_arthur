export interface FileAttachment {
  name: string;
  type: string; // e.g. "application/pdf" or "image/png"
  base64: string;
}

export interface Message {
  id: string;
  sender: "user" | "ai";
  text: string;
  timestamp: string;
  file?: {
    name: string;
    type: string;
  };
}

export interface ValidationResult {
  mensaje: string;
  producto_detectado: string;
  estado: "APROBADO" | "RESTRINGIDO" | "RECHAZADO" | "NO_HOMOLOGADO" | string;
  precio_tope: string;
  regla_negocio: string;
}

export interface HistoryItem {
  id: string;
  query: string;
  producto_detectado: string;
  estado: string;
  precio_tope: string;
  regla_negocio: string;
  mensaje: string;
  timestamp: string;
}
