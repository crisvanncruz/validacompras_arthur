let API_URL = (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1")
    ? "http://localhost:8000/api/validate"
    : "/api/validate";

//let API_URL = (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1")
 //  ? "http://localhost:8000/api/validate"
  // : `${window.location.protocol}//${window.location.hostname}:8000/api/validate`;

const chatForm = document.getElementById("chat-form");
const userInput = document.getElementById("user-input");
const chatContainer = document.getElementById("chat-container");
const btnSubmit = document.getElementById("btn-submit");

const fileUpload = document.getElementById("file-upload");
const fileIndicator = document.getElementById("file-indicator");
const fileNameDisplay = document.getElementById("file-name-display");
const removeFileBtn = document.getElementById("remove-file-btn");
const clipBtn = document.getElementById("clip-btn");

const statusPlaceholder = document.getElementById("status-placeholder");
const statusCard = document.getElementById("status-card");
const statusBox = document.getElementById("status-box");
const statusIcon = document.getElementById("status-icon");
const statusTitle = document.getElementById("status-title");
const statusDesc = document.getElementById("status-desc");
const detailProduct = document.getElementById("detail-product");
const detailPrice = document.getElementById("detail-price");
const detailRule = document.getElementById("detail-rule");

let currentFile = null;
let currentFileBase64 = null;

fileUpload.addEventListener("change", (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > (2 * 1024 * 1024)) {
        alert("El archivo excede el tamaño máximo permitido de 2MB.");
        clearFile();
        return;
    }

    currentFile = file;
    fileNameDisplay.innerText = file.name;
    fileIndicator.classList.remove("hidden");
    clipBtn.classList.add("text-indigo-600", "bg-indigo-50");

    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
        currentFileBase64 = reader.result.split(',')[1];
    };
});

removeFileBtn.addEventListener("click", clearFile);

function clearFile() {
    currentFile = null;
    currentFileBase64 = null;
    fileUpload.value = "";
    fileIndicator.classList.add("hidden");
    clipBtn.classList.remove("text-indigo-600", "bg-indigo-50");
}

chatForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const query = userInput.value.trim();

    if (!query && !currentFile) return;

    let userMsgDisplay = query || "Por favor, analiza la proforma adjunta.";
    if (currentFile) userMsgDisplay += `\n📎 Adjunto: ${currentFile.name}`;

    appendMessage(userMsgDisplay, "user");
    userInput.value = "";

    const payload = {
        input_text: query || "Analiza esta proforma.",
        file_name: currentFile ? currentFile.name : null,
        file_base64: currentFileBase64 || null
    };

    clearFile();
    const loadingId = appendLoadingIndicator();
    btnSubmit.disabled = true;

    try {
        const response = await fetch(API_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            const errData = await response.json();
            // SOLUCIÓN: Desempaquetar el error para evitar [object Object]
            let errMsg = errData.detail || "Error del servidor";
            if (Array.isArray(errMsg)) {
                errMsg = errMsg.map(err => `${err.loc.join('.')}: ${err.msg}`).join(' | ');
            } else if (typeof errMsg === 'object') {
                errMsg = JSON.stringify(errMsg);
            }
            throw new Error(errMsg);
        }

        const data = await response.json();
        removeElement(loadingId);

        appendMessage(data.mensaje, "ai");
        updateDecisionPanel(data);

    } catch (error) {
        removeElement(loadingId);
        appendMessage(`Lo siento, ocurrió un error: ${error.message}`, "ai");
        console.error(error);
    } finally {
        btnSubmit.disabled = false;
    }
});


function appendMessage(text, sender) {
    const div = document.createElement("div");

    if (sender === "user") {
        div.className = "flex space-x-3 max-w-2xl ml-auto flex-row-reverse space-x-reverse";
        div.innerHTML = `
          <div class="w-8 h-8 rounded-full bg-slate-600 text-white flex items-center justify-center shrink-0">US</div>
          <div class="bg-indigo-600 text-white rounded-lg p-4 text-sm shadow-sm whitespace-pre-line">${text}</div>
        `;
    } else {
        div.className = "flex space-x-3 max-w-4xl";
        const parsedHTML = marked.parse(text);

        div.innerHTML = `
          <div class="w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center shrink-0">IA</div>
          <div class="bg-slate-50 rounded-lg p-5 text-sm text-slate-700 border border-slate-200 w-full overflow-x-auto shadow-sm">
            <div class="prose prose-sm max-w-none prose-table:w-full prose-th:bg-slate-200 prose-th:p-2 prose-td:p-2 prose-td:border prose-td:border-slate-300">
                ${parsedHTML}
            </div>
          </div>
        `;
    }
    chatContainer.appendChild(div);
    chatContainer.scrollTop = chatContainer.scrollHeight;
}

function appendLoadingIndicator() {
    const id = "loading-" + Date.now();
    const div = document.createElement("div");
    div.id = id;
    div.className = "flex space-x-3 max-w-2xl";
    div.innerHTML = `
      <div class="w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center shrink-0">IA</div>
      <div class="bg-slate-50 rounded-lg p-4 border border-slate-100 flex items-center"><div class="dot-flashing"></div></div>
    `;
    chatContainer.appendChild(div);
    chatContainer.scrollTop = chatContainer.scrollHeight;
    return id;
}

function removeElement(id) {
    const el = document.getElementById(id);
    if (el) el.remove();
}


function updateDecisionPanel(data) {
    statusPlaceholder.classList.add("hidden");
    statusCard.classList.remove("hidden");

    detailProduct.innerText = data.producto_detectado || "No identificado";
    detailPrice.innerText = data.precio_tope || "N/A";
    detailRule.innerText = data.regla_negocio || "-";

    const estado = String(data.estado).toUpperCase().trim();
    statusTitle.innerText = estado;
    statusBox.className = "p-4 rounded-xl border flex items-start space-x-3";

    const svgIcon = `<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>`;
    statusIcon.innerHTML = svgIcon;

    if (estado === "APROBADO") {
        statusBox.classList.add("bg-emerald-50", "border-emerald-200");
        statusIcon.className = "p-1 bg-emerald-500 text-white rounded-full mt-0.5";
        statusTitle.className = "font-bold text-sm text-emerald-800";
        statusDesc.className = "text-xs mt-1 text-emerald-700";
        statusDesc.innerText = "Equipo validado por catálogo vigente.";
    } else if (estado === "RESTRINGIDO") {
        statusBox.classList.add("bg-amber-50", "border-amber-200");
        statusIcon.className = "p-1 bg-amber-500 text-white rounded-full mt-0.5";
        statusTitle.className = "font-bold text-sm text-amber-800";
        statusDesc.className = "text-xs mt-1 text-amber-700";
        statusDesc.innerText = "Requiere autorización directa del CISO/Director.";
    } else {
        statusBox.classList.add("bg-rose-50", "border-rose-200");
        statusIcon.className = "p-1 bg-rose-500 text-white rounded-full mt-0.5";
        statusTitle.className = "font-bold text-sm text-rose-800";
        statusDesc.className = "text-xs mt-1 text-rose-700";
        statusDesc.innerText = "Rechazado o no homologado corporativamente.";
    }
}