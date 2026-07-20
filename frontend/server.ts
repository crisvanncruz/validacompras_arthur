import express from "express";
import path from "path";
import dotenv from "dotenv";
import { spawn } from "child_process";
import { createServer as createViteServer } from "vite";
import os from "os";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: "15mb" }));

app.post("/api/validate", async (req, res) => {
  try {
    const response = await fetch("http://127.0.0.1:8000/api/validate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(req.body)
    });

    if (!response.ok) {
      const errText = await response.text();
      return res.status(response.status).send(errText);
    }

    const data = await response.json();
    return res.json(data);
  } catch (error: any) {
    console.error("Proxy error to Python FastAPI:", error);
    return res.status(502).json({
      mensaje: "Error: No se pudo conectar con el motor de validación en Python.",
      producto_detectado: "Error",
      estado: "RECHAZADO",
      precio_tope: "N/A",
      regla_negocio: "El servidor de Python no está respondiendo o se está iniciando. Por favor, espera un momento y vuelve a intentarlo."
    });
  }
});

const isWindows = os.platform() === "win32";

const pythonCommand = isWindows
  ? path.join(process.cwd(), "../.venv/Scripts/python.exe")
  : path.join(process.cwd(), "../.venv/bin/python3");

const backendDir = path.join(process.cwd(), "../backend");

const uvicornArgs = ["-m", "uvicorn", "main:app", "--host", "127.0.0.1", "--port", "8000"];

console.log(`Iniciando motor Python...`);
console.log(`Ejecutable: ${pythonCommand}`);
console.log(`Directorio: ${backendDir}`);

const pythonProcess = spawn(pythonCommand, uvicornArgs, {
  cwd: backendDir,
  stdio: "inherit"
});

pythonProcess.on("error", (err) => {
  console.error("Error al iniciar el proceso de Python:", err);
});

pythonProcess.on("close", (code) => {
  console.log(`Proceso de Python finalizado con código: ${code}`);
});

process.on("exit", () => {
  pythonProcess.kill();
});

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();