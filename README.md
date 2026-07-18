# Validador de Compras Corporativas (Arthur)

## Descripción General
Este proyecto implementa a **Arthur**, un agente de inteligencia artificial diseñado para automatizar y agilizar la validación de solicitudes de compra corporativa.
El sistema cruza las peticiones de los usuarios (ya sea en texto, imágenes o PDFs escaneados) con un catálogo oficial de productos homologados,
determinando de manera autónoma si un equipo está "Aprobado", "Restringido" o "Rechazado", y proporcionando la regla de negocio correspondiente.

## Arquitectura de la Solución
El sistema utiliza una arquitectura web desacoplada con capacidades de visión (multimodal):
* **Backend (FastAPI):** Expone un endpoint RESTful que orquesta la validación y seguridad.
* **Procesamiento Documental:** PyMuPDF se encarga de extraer páginas completas de archivos PDF y convertirlas en imágenes de alta resolución.
* **Motor IA (LLM):** LangChain y Google Gemini 3.5 Flash procesan tanto el texto como la carga visual (OCR nativo) para extraer la información de las proformas o carritos de compra.
* **Base de Datos:** Un archivo CSV (`catalogo_compras.csv`) actúa como la única fuente de verdad para evitar alucinaciones.
* **Frontend:** Interfaz pura interactiva construida con HTML5, JavaScript (Vanilla) y Tailwind CSS.

## Tecnologías y Herramientas
* **Backend:** Python 3.x, FastAPI, Pydantic, Uvicorn
* **IA y Visión:** LangChain, Google Generative AI, PyMuPDF (fitz), Pandas
* **Frontend:** HTML, JavaScript, CSS, Tailwind
* **Infraestructura Cloud:** Preparado para Amazon Web Services (AWS EC2) gestionado con Nginx y Systemd.

## Enlace de Producción
* **Acceso a la app:** `http://18.216.243.7/`

## Instrucciones para Ejecución Local
Para levantar el entorno de desarrollo, es necesario inicializar el backend y el frontend por separado:

1. Clona este repositorio:
   `git clone https://github.com/tu-usuario/tu-repo.git`
2. Crea un archivo `.env.development` en la raíz del proyecto y agrega tu llave de acceso:
   `GOOGLE_API_KEY=tu_api_key_aqui`
3. Instala las dependencias del backend e inicia el servidor de FastAPI:
   `cd backend`
   `pip install -r requirements.txt`
   `python main.py`
4. En una nueva terminal, inicia un servidor estático para la interfaz:
   `cd frontend`
   `python -m http.server 3000`
5. Visita `http://localhost:3000` en tu navegador.

## Ejemplos de Interacción

* **Validación por Texto:** 
  * **Usuario:** "Necesito comprar una MacBook Pro M3 Max para mi equipo."
  * **Arthur:** Analizará el catálogo y rechazará la solicitud por ser un modelo "No Homologado", generando la tabla Markdown comparativa.
* **Validación Multimodal (Visión AI):** 
  * **Usuario:** Sube una captura de pantalla (.JPG) o un .PDF del carrito de compras de una tienda online.
  * **Arthur:** Procesará visualmente la imagen, descartará la publicidad o botones irrelevantes, extraerá la marca, modelo y precio, y cruzará esos datos contra el precio tope establecido en el archivo de reglas corporativas.