import React, { useState, useEffect, useRef } from "react";
import { 
  CheckCircle2, 
  AlertTriangle, 
  XCircle, 
  Paperclip, 
  Send, 
  FileText, 
  Image as ImageIcon, 
  Trash2, 
  ArrowRight, 
  UploadCloud, 
  X, 
  HelpCircle, 
  History, 
  Check, 
  Sparkles,
  RefreshCw,
  Clock,
  Menu,
  ChevronRight
} from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { motion, AnimatePresence } from "motion/react";
import { FileAttachment, Message, ValidationResult, HistoryItem } from "./types";

const SUGGESTED_SCENARIOS = [
  {
    title: "Lenovo T14 Admin",
    description: "Laptop para área operativa",
    query: "Quiero comprar una laptop Lenovo ThinkPad T14 para administración."
  },
  {
    title: "Dell Latitude 7420",
    description: "Laptop gerencia",
    query: "Solicito cotización de una laptop Dell Latitude 7420 para un gerente de finanzas."
  },
  {
    title: "iPad Pro Comercial",
    description: "Tablet para campo",
    query: "Comprar un Apple iPad Pro para el equipo comercial en campo."
  },
  {
    title: "Licencia de Zoom",
    description: "Suscripción mensual",
    query: "Licencia de Zoom Pro para reuniones semanales de ventas."
  }
];

export default function App() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "initial-msg",
      sender: "ai",
      text: "Hola. Soy **Arthur**, tu asistente de validación y homologación de compras.\n\nPor favor, describe los equipos que deseas comprar o adjunta una proforma usando el icono del clip o arrastrando el archivo aquí. Validaré cada artículo contra el catálogo homologado vigente.",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [inputText, setInputText] = useState("");
  const [attachedFile, setAttachedFile] = useState<FileAttachment | null>(null);
  const [loading, setLoading] = useState(false);
  const [validationResult, setValidationResult] = useState<ValidationResult | null>(null);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [processedStatus, setProcessedStatus] = useState<"idle" | "sending" | "sent">("idle");
  const [dragActive, setDragActive] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const chatContainerRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const saved = localStorage.getItem("arthur_queries_history");
    if (saved) {
      try {
        setHistory(JSON.parse(saved));
      } catch (e) {
        console.error("Error reading history:", e);
      }
    } else {

      const defaultHistory: HistoryItem[] = [
        {
          id: "hist-1",
          query: "Lenovo ThinkPad T14 para administración",
          producto_detectado: "Lenovo ThinkPad T14",
          estado: "APROBADO",
          precio_tope: "1200",
          regla_negocio: "Permitido para perfiles administrativos y operativos.",
          mensaje: "Análisis previo cargado desde el historial.\n\nEl equipo Lenovo ThinkPad T14 está homologado y aprobado para uso de personal administrativo y operativo. Se encuentra dentro del precio tope corporativo de **$1200 USD**.",
          timestamp: "Hace 10 min"
        },
        {
          id: "hist-2",
          query: "MacBook Pro M3 Max para desarrollo",
          producto_detectado: "MacBook Pro M3 Max",
          estado: "RECHAZADO",
          precio_tope: "N/A",
          regla_negocio: "Equipo no homologado corporativamente.",
          mensaje: "Análisis previo cargado desde el historial.\n\nEl equipo solicitado (MacBook Pro) no figura en el catálogo homologado vigente. Las laptops homologadas actuales son Lenovo ThinkPad T14 o Dell Latitude 7420.",
          timestamp: "Hace 1 hora"
        }
      ];
      setHistory(defaultHistory);
      localStorage.setItem("arthur_queries_history", JSON.stringify(defaultHistory));
    }
  }, []);

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages, loading]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    processFile(file);
  };

  const processFile = (file: File) => {
    if (file.size > 2 * 1024 * 1024) {
      alert("El archivo excede el tamaño máximo permitido de 2MB.");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const base64 = (reader.result as string).split(",")[1];
      setAttachedFile({
        name: file.name,
        type: file.type,
        base64: base64
      });
    };
    reader.readAsDataURL(file);
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const query = inputText.trim();
    if (!query && !attachedFile) return;


    setProcessedStatus("idle");

    let displayQuery = query;
    if (attachedFile) {
      displayQuery = query 
        ? `${query}\n\n📎 *Adjunto:* ${attachedFile.name}` 
        : `Análisis de proforma adjunta: **${attachedFile.name}**`;
    }

    const userMessage: Message = {
      id: "user-" + Date.now(),
      sender: "user",
      text: displayQuery,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      file: attachedFile ? { name: attachedFile.name, type: attachedFile.type } : undefined
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputText("");
    setLoading(true);

    const payload = {
      input_text: query || "Validación de proforma adjunta.",
      file_name: attachedFile ? attachedFile.name : null,
      file_base64: attachedFile ? attachedFile.base64 : null
    };

    setAttachedFile(null);

    try {
      const response = await fetch("/api/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        throw new Error("Respuesta de validación errónea del servidor.");
      }

      const data: ValidationResult = await response.json();

      const aiMessage: Message = {
        id: "ai-" + Date.now(),
        sender: "ai",
        text: data.mensaje,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setMessages((prev) => [...prev, aiMessage]);
      setValidationResult(data);


      const newHistoryItem: HistoryItem = {
        id: "hist-" + Date.now(),
        query: query ? (query.length > 50 ? query.substring(0, 47) + "..." : query) : `Archivo: ${payload.file_name}`,
        producto_detectado: data.producto_detectado,
        estado: data.estado,
        precio_tope: data.precio_tope,
        regla_negocio: data.regla_negocio,
        mensaje: data.mensaje,
        timestamp: "Hace un momento"
      };

      setHistory((prev) => {
        const updated = [newHistoryItem, ...prev.filter(item => item.query !== newHistoryItem.query)].slice(0, 8);
        localStorage.setItem("arthur_queries_history", JSON.stringify(updated));
        return updated;
      });

    } catch (error: any) {
      console.error(error);
      const errorMessage: Message = {
        id: "err-" + Date.now(),
        sender: "ai",
        text: `**Lo siento, ocurrió un error al realizar el análisis:**\n\n*${error.message || error}*\n\nPor favor, intenta de nuevo.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };


  const handleScenarioClick = (query: string) => {
    setInputText(query);
  };


  const handleHistoryItemClick = (item: HistoryItem) => {
    setProcessedStatus("idle");
    

    const userMessage: Message = {
      id: "user-" + Date.now(),
      sender: "user",
      text: `Re-evaluando del historial: "${item.query}"`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages((prev) => [...prev, userMessage]);
    setLoading(true);

    setTimeout(() => {
      const aiMessage: Message = {
        id: "ai-" + Date.now(),
        sender: "ai",
        text: `**Cargando análisis previo para ${item.producto_detectado}.**\n\n${item.mensaje}`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages((prev) => [...prev, aiMessage]);
      setValidationResult({
        mensaje: item.mensaje,
        producto_detectado: item.producto_detectado,
        estado: item.estado,
        precio_tope: item.precio_tope,
        regla_negocio: item.regla_negocio
      });
      setLoading(false);
    }, 450);

    setSidebarOpen(false);
  };

  const handleClearHistory = () => {
    setHistory([]);
    localStorage.removeItem("arthur_queries_history");
  };

  const handleProcessOrder = () => {
    setModalOpen(true);
  };

  const confirmProcessOrder = () => {
    setProcessedStatus("sending");
    setTimeout(() => {
      setProcessedStatus("sent");
      setModalOpen(false);
    }, 1200);
  };

  return (
    <div 
      className="bg-slate-50 font-sans h-screen flex flex-col overflow-hidden text-slate-800"
      onDragEnter={handleDrag}
      onDragOver={handleDrag}
      onDragLeave={handleDrag}
      onDrop={handleDrop}
    >
      {/* Header */}
      <header className="bg-white border-b border-slate-200/80 px-6 py-4 flex justify-between items-center shrink-0 shadow-sm relative z-10">
        <div className="flex items-center space-x-3">
          <button 
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="md:hidden p-1.5 hover:bg-slate-100 rounded-lg text-slate-500 transition-colors"
          >
            <Menu className="w-5 h-5" />
          </button>
            <div className="h-14 sm:h-16 flex items-center justify-center shrink-0 mr-3 drop-shadow-md transition-all duration-300 hover:scale-105 cursor-pointer">
              <img src="/logo.svg" alt="Logo Arthur" className="h-full w-auto object-contain" />
            </div>
          <div>
            <h1 className="text-base font-bold text-slate-900 leading-tight tracking-tight flex items-center gap-1.5">
              ARTHUR
              <span className="hidden sm:inline bg-indigo-50 text-indigo-700 text-[10px] font-semibold px-2 py-0.5 rounded-full border border-indigo-100">
                Agente IA
              </span>
            </h1>
            <p className="text-[11px] text-slate-500 font-medium">Asistente De Compras</p>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <div className="hidden sm:flex flex-col items-end text-xs">
            <span className="text-[10px] text-slate-400 font-semibold tracking-wider uppercase">Catálogo Activo</span>
            <span className="font-bold text-indigo-600">V2026.1 (Homologado)</span>
          </div>
          <div className="w-8 h-8 rounded-full bg-slate-100 border border-slate-200 text-slate-700 flex items-center justify-center text-xs font-bold shadow-sm">
            US
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <div className="flex flex-1 overflow-hidden relative">
        
        {/* Drag and drop overlay */}
        <AnimatePresence>
          {dragActive && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-indigo-600/10 backdrop-blur-[2px] z-50 flex items-center justify-center p-8 pointer-events-none"
            >
              <div className="bg-white border-2 border-dashed border-indigo-500 rounded-2xl p-8 max-w-md w-full text-center shadow-xl flex flex-col items-center gap-3">
                <UploadCloud className="w-12 h-12 text-indigo-500 animate-bounce" />
                <h3 className="font-bold text-slate-900 text-lg">Arrastra tu proforma aquí</h3>
                <p className="text-slate-500 text-sm">Soporta archivos PDF e imágenes (PNG, JPG) de hasta 2MB para análisis automático de Arthur.</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <aside className={`
          absolute inset-y-0 left-0 w-64 bg-slate-100 border-r border-slate-200/80 p-4 flex flex-col justify-between shrink-0 z-30 transition-transform duration-300 md:relative md:translate-x-0
          ${sidebarOpen ? 'translate-x-0 shadow-xl' : '-translate-x-full'}
        `}>
          <div className="flex flex-col h-full overflow-hidden">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <History className="w-3.5 h-3.5" />
                Consultas Recientes
              </h3>
              <span className="text-[10px] bg-slate-200 text-slate-600 px-1.5 py-0.5 rounded-md font-semibold">
                {history.length}
              </span>
            </div>

            <div className="space-y-2 flex-1 overflow-y-auto pr-1">
              {history.length === 0 ? (
                <div className="text-center py-8 text-slate-400 italic text-[11px] flex flex-col items-center gap-2">
                  <Clock className="w-5 h-5 text-slate-300" />
                  Sin historial reciente
                </div>
              ) : (
                history.map((item) => {
                  const est = (item.estado || "").toUpperCase().trim();
                  let badgeClass = "bg-rose-100/80 text-rose-800 border-rose-200";
                  if (est === "APROBADO") badgeClass = "bg-emerald-100/80 text-emerald-800 border-emerald-200";
                  else if (est === "RESTRINGIDO") badgeClass = "bg-amber-100/80 text-amber-800 border-amber-200";

                  return (
                    <button
                      key={item.id}
                      onClick={() => handleHistoryItemClick(item)}
                      className="w-full text-left p-3 rounded-xl bg-white hover:bg-indigo-50/50 hover:border-indigo-200 transition-all border border-slate-200/60 shadow-sm block relative group"
                    >
                      <div className="font-semibold text-slate-700 text-xs truncate pr-4 group-hover:text-indigo-600">
                        {item.query}
                      </div>
                      <div className="flex justify-between items-center mt-2.5">
                        <span className="text-[9px] text-slate-400 flex items-center gap-1">
                          <Clock className="w-2.5 h-2.5" />
                          {item.timestamp}
                        </span>
                        <span className={`px-1.5 py-0.5 text-[8px] font-bold rounded-md border ${badgeClass}`}>
                          {est}
                        </span>
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </div>

          <div className="border-t border-slate-200 pt-3 mt-3 flex justify-between items-center text-[10px] text-slate-400 shrink-0">
            <span className="font-medium">Arthur Engine v1.5</span>
            {history.length > 0 && (
              <button 
                onClick={handleClearHistory}
                className="text-rose-500 hover:text-rose-700 font-semibold hover:underline flex items-center gap-1 transition"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Limpiar
              </button>
            )}
          </div>
        </aside>

        {/* Backdrop for mobile sidebar */}
        {sidebarOpen && (
          <div 
            onClick={() => setSidebarOpen(false)}
            className="md:hidden fixed inset-0 bg-slate-950/40 backdrop-blur-[1px] z-20"
          />
        )}

        {/* Area of Central Chat */}
        <main className="flex-1 flex flex-col bg-white overflow-hidden border-r border-slate-100">

          <div 
            ref={chatContainerRef} 
            className="flex-1 p-6 overflow-y-auto space-y-5 bg-gradient-to-b from-slate-50/50 to-white"
          >
            {messages.map((msg) => (
              <div 
                key={msg.id} 
                className={`flex gap-3 max-w-4xl ${msg.sender === "user" ? "ml-auto flex-row-reverse" : "mr-auto"}`}
              >
                {/* Avatar */}
                <div className={`w-8 h-8 rounded-full shrink-0 flex items-center justify-center text-[10px] font-bold shadow-sm ${
                  msg.sender === "user" 
                    ? "bg-slate-800 text-white" 
                    : "bg-indigo-50 text-indigo-600 border border-indigo-100"
                }`}>
                  {msg.sender === "user" ? "US" : "IA"}
                </div>

                {/* Bubble content */}
                <div className={`flex flex-col ${msg.sender === "user" ? "items-end" : "items-start"}`}>
                  <div className={`rounded-2xl p-4 shadow-sm text-xs leading-relaxed max-w-full overflow-x-auto ${
                    msg.sender === "user"
                      ? "bg-indigo-600 text-white rounded-tr-none"
                      : "bg-slate-50 text-slate-800 border border-slate-100 rounded-tl-none prose prose-slate max-w-none"
                  }`}>
                    {msg.sender === "user" ? (
                      <p className="whitespace-pre-wrap">{msg.text}</p>
                    ) : (
                      <ReactMarkdown 
                        remarkPlugins={[remarkGfm]}
                        components={{
                          table: ({ ...props }) => (
                            <div className="overflow-x-auto my-3 rounded-lg border border-slate-200/80 shadow-inner">
                              <table className="min-w-full divide-y divide-slate-200 text-[10px] text-left" {...props} />
                            </div>
                          ),
                          thead: ({ ...props }) => <thead className="bg-slate-100/80 font-bold" {...props} />,
                          tbody: ({ ...props }) => <tbody className="bg-white divide-y divide-slate-100" {...props} />,
                          tr: ({ ...props }) => <tr className="hover:bg-slate-50/50 transition-colors" {...props} />,
                          th: ({ ...props }) => <th className="px-2.5 py-1.5 text-slate-700 uppercase tracking-wider border-b border-slate-200 font-semibold" {...props} />,
                          td: ({ ...props }) => <td className="px-2.5 py-1.5 text-slate-600 whitespace-nowrap" {...props} />,
                          p: ({ ...props }) => <p className="mb-2 last:mb-0 text-slate-700 font-normal" {...props} />,
                          strong: ({ ...props }) => <strong className="font-bold text-slate-900" {...props} />,
                          ul: ({ ...props }) => <ul className="list-disc pl-5 mb-2 space-y-0.5 text-slate-600" {...props} />,
                          ol: ({ ...props }) => <ol className="list-decimal pl-5 mb-2 space-y-0.5 text-slate-600" {...props} />,
                        }}
                      >
                        {msg.text}
                      </ReactMarkdown>
                    )}
                  </div>
                  <span className="text-[9px] text-slate-400 mt-1 px-1">
                    {msg.timestamp}
                  </span>
                </div>
              </div>
            ))}

            {loading && (
              <div className="flex gap-3 max-w-xs mr-auto items-center">
                <div className="w-8 h-8 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-600 shrink-0 flex items-center justify-center text-[10px] font-bold">
                  IA
                </div>
                <div className="bg-slate-50 rounded-2xl px-4 py-3 border border-slate-100 flex items-center space-x-1 shadow-sm">
                  <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                  <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                  <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                </div>
              </div>
            )}
          </div>

          {messages.length === 1 && !loading && (
            <div className="px-6 py-3 bg-slate-50/60 border-t border-slate-100 shrink-0">
              <span className="text-[10px] font-bold text-slate-400 tracking-wider uppercase block mb-2 flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-indigo-500" /> Escenarios de Prueba Rápida
              </span>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
                {SUGGESTED_SCENARIOS.map((sc, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleScenarioClick(sc.query)}
                    className="text-left p-2 bg-white hover:bg-indigo-50/50 hover:border-indigo-200 border border-slate-200/60 rounded-xl transition-all cursor-pointer group"
                  >
                    <div className="text-[11px] font-bold text-slate-800 group-hover:text-indigo-600 truncate">{sc.title}</div>
                    <div className="text-[9px] text-slate-400 mt-0.5 truncate">{sc.description}</div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Bottom control zone / File upload & input bar */}
          <div className="bg-white border-t border-slate-200/80 shrink-0 relative z-10 shadow-lg">
            
            {/* Attached file capsule preview */}
            <AnimatePresence>
              {attachedFile && (
                <motion.div 
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="px-6 py-2.5 bg-indigo-50 border-b border-indigo-100/80 text-xs text-indigo-700 flex justify-between items-center transition-all"
                >
                  <div className="flex items-center space-x-2">
                    {attachedFile.type.includes("pdf") ? (
                      <FileText className="w-4 h-4 text-indigo-500" />
                    ) : (
                      <ImageIcon className="w-4 h-4 text-indigo-500" />
                    )}
                    <span className="font-semibold truncate max-w-[250px]">{attachedFile.name}</span>
                    <span className="text-[10px] text-indigo-400 font-medium">(Adjuntado listo para validar)</span>
                  </div>
                  <button 
                    onClick={() => setAttachedFile(null)}
                    className="text-indigo-400 hover:text-rose-500 transition-colors p-1 hover:bg-indigo-100 rounded"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Input form */}
            <div className="p-4">
              <form onSubmit={handleSubmit} className="flex items-center space-x-2">
                <input 
                  type="file" 
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  className="hidden" 
                  accept=".pdf,.jpg,.jpeg,.png,.webp"
                />

                <button 
                  type="button" 
                  onClick={() => fileInputRef.current?.click()}
                  className={`p-2.5 rounded-xl transition shrink-0 ${
                    attachedFile 
                      ? "text-indigo-600 bg-indigo-100 hover:bg-indigo-200" 
                      : "text-slate-400 hover:text-indigo-600 hover:bg-indigo-50"
                  }`}
                  title="Adjuntar proforma PDF o imagen"
                >
                  <Paperclip className="w-5 h-5" />
                </button>

                <input 
                  type="text" 
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder="Escribe tu consulta de compra o adjunta/arrastra una proforma..." 
                  className="flex-1 bg-slate-100 text-slate-800 text-xs rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition border border-transparent placeholder-slate-400 font-medium"
                />

                <button 
                  type="submit" 
                  disabled={loading || (!inputText.trim() && !attachedFile)}
                  className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-100 disabled:text-slate-400 text-white px-4 py-2.5 rounded-xl text-xs font-semibold shadow-sm transition flex items-center gap-1 shrink-0"
                >
                  <span>Validar</span>
                  <Send className="w-3.5 h-3.5" />
                </button>
              </form>
            </div>
          </div>
        </main>

        {/* Panel of Rules and Decisions (Right Column) */}
        <aside className="w-80 bg-slate-50 border-l border-slate-200/80 p-5 flex flex-col justify-between overflow-y-auto shrink-0 hidden lg:flex">
          
          <AnimatePresence mode="wait">
            {!validationResult ? (
              <motion.div 
                key="placeholder"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="text-center py-20 flex flex-col items-center justify-center h-full gap-4"
              >
                <div className="w-14 h-14 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center shadow-inner border border-slate-200/40">
                  <HelpCircle className="w-7 h-7 text-slate-300" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wide">Faltan Datos</h3>
                  <p className="text-slate-400 text-[11px] mt-1.5 max-w-[200px] mx-auto leading-relaxed font-medium">
                    Consulta a Arthur o adjunta una proforma para visualizar el análisis de homologación en tiempo real.
                  </p>
                </div>
              </motion.div>
            ) : (
              <motion.div 
                key="result"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-5"
              >
                {/* Result header */}
                <div>
                  <h2 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2.5">
                    Resultado de Validación
                  </h2>
                  
                  {/* Status card widget */}
                  {(() => {
                    const status = (validationResult.estado || "").toUpperCase().trim();
                    let colorTheme = {
                      bg: "bg-rose-50 border-rose-100",
                      badge: "bg-rose-500 text-white",
                      title: "text-rose-800",
                      desc: "text-rose-600",
                      icon: <XCircle className="w-5 h-5 text-rose-500" />
                    };

                    if (status === "APROBADO") {
                      colorTheme = {
                        bg: "bg-emerald-50 border-emerald-100",
                        badge: "bg-emerald-500 text-white",
                        title: "text-emerald-800",
                        desc: "text-emerald-600",
                        icon: <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                      };
                    } else if (status === "RESTRINGIDO") {
                      colorTheme = {
                        bg: "bg-amber-50 border-amber-100",
                        badge: "bg-amber-500 text-white",
                        title: "text-amber-800",
                        desc: "text-amber-600",
                        icon: <AlertTriangle className="w-5 h-5 text-amber-500" />
                      };
                    }

                    return (
                      <div className={`p-4 rounded-2xl border ${colorTheme.bg} flex items-start gap-3 shadow-sm`}>
                        <div className="shrink-0 mt-0.5">{colorTheme.icon}</div>
                        <div>
                          <div className={`text-xs font-black tracking-widest uppercase ${colorTheme.title}`}>
                            {status}
                          </div>
                          <p className={`text-[10px] mt-1 leading-normal font-semibold ${colorTheme.desc}`}>
                            {status === "APROBADO" 
                              ? "Equipo homologado y conforme a la directiva vigente." 
                              : status === "RESTRINGIDO"
                              ? "Equipo homologado pero sujeto a directriz de excepción."
                              : "Artículo rechazado o no se encuentra en el catálogo homologado."}
                          </p>
                        </div>
                      </div>
                    );
                  })()}
                </div>

                {/* Match Details */}
                <div className="space-y-2">
                  <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    Coincidencia de Catálogo
                  </h3>
                  <div className="bg-white p-4 rounded-2xl border border-slate-200/80 space-y-3 shadow-sm">
                    <div>
                      <span className="text-[9px] uppercase font-bold text-slate-400 block tracking-wider">
                        Producto Detectado
                      </span>
                      <span className="font-bold text-slate-800 text-xs block mt-1 bg-slate-50 px-2 py-1.5 rounded-lg border border-slate-100">
                        {validationResult.producto_detectado}
                      </span>
                    </div>
                    <div>
                      <span className="text-[9px] uppercase font-bold text-slate-400 block tracking-wider">
                        Precio Límite Corporativo
                      </span>
                      <span className="text-indigo-600 font-bold text-xs block mt-1 bg-slate-50 px-2 py-1.5 rounded-lg border border-slate-100">
                        {validationResult.precio_tope && validationResult.precio_tope !== "N/A" 
                          ? `$${validationResult.precio_tope} USD` 
                          : "N/A"}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Applied Business Rule */}
                <div className="space-y-2">
                  <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    Regla Aplicada
                  </h3>
                  <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm">
                    <div className="flex items-center space-x-1.5 text-[11px] font-bold text-slate-700 mb-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-indigo-500"></span>
                      <span>Directriz de Negocio</span>
                    </div>
                    <p className="text-[10px] text-slate-500 leading-relaxed bg-slate-50 p-2.5 rounded-xl border border-slate-100 font-medium">
                      {validationResult.regla_negocio || "Sin reglas aplicables registradas."}
                    </p>
                  </div>
                </div>

                {/* Action button */}
                <div className="pt-2">
                  {(() => {
                    const status = (validationResult.estado || "").toUpperCase().trim();
                    const isAllowed = status === "APROBADO" || status === "RESTRINGIDO";

                    if (!isAllowed) {
                      return (
                        <div className="bg-slate-100/80 border border-slate-200 text-slate-400 text-[10px] font-bold py-3.5 px-4 rounded-xl text-center flex items-center justify-center gap-1.5">
                          <XCircle className="w-4 h-4 text-slate-400" />
                          Solicitud No Procesable
                        </div>
                      );
                    }

                    if (processedStatus === "sent") {
                      return (
                        <div className="bg-emerald-50 border border-emerald-100 text-emerald-700 text-[10px] font-bold py-3.5 px-4 rounded-xl text-center flex items-center justify-center gap-1.5 shadow-sm">
                          <Check className="w-4 h-4 text-emerald-500" />
                          Solicitud Enviada a Compras
                        </div>
                      );
                    }

                    return (
                      <button
                        onClick={handleProcessOrder}
                        className="w-full bg-slate-900 hover:bg-slate-800 text-white text-[10px] font-black tracking-wider uppercase py-3.5 px-4 rounded-xl transition duration-200 shadow hover:shadow-md text-center active:scale-95 flex items-center justify-center gap-1"
                      >
                        Procesar Solicitud
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    );
                  })()}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="border-t border-slate-100 pt-3 text-[9px] text-slate-400 leading-relaxed font-semibold">
            Arthur AI evalúa automáticamente su cotización garantizando un canal corporativo transparente.
          </div>
        </aside>
      </div>

      {/* Confirmation Modal */}
      <AnimatePresence>
        {modalOpen && (
          <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-2xl shadow-xl max-w-sm w-full p-6 border border-slate-100"
            >
              <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mb-4 mx-auto border border-emerald-100">
                <Check className="w-6 h-6" />
              </div>
              <h3 className="text-sm font-extrabold text-slate-950 text-center mb-1">Registrar Solicitud</h3>
              <p className="text-[11px] text-slate-500 text-center leading-relaxed max-w-xs mx-auto mb-6">
                ¿Deseas enviar el artículo homologado analizado al sistema de ERP de Compras de la corporación para su procesamiento de orden?
              </p>
              
              <div className="flex space-x-2">
                <button 
                  onClick={() => setModalOpen(false)}
                  className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold py-2.5 rounded-xl transition"
                >
                  Cancelar
                </button>
                <button 
                  onClick={confirmProcessOrder}
                  className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold py-2.5 rounded-xl transition shadow-sm"
                >
                  Confirmar Envío
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
