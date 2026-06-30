# Validador de Compras Corporativas (Arthur)

## Descripción General
Este proyecto implementa a **Arthur**, un agente de inteligencia artificial diseñado para automatizar y agilizar la validación de solicitudes de compra corporativa. El sistema cruza las peticiones de los usuarios con un catálogo oficial de productos homologados, determinando de manera autónoma si un equipo está "Aprobado", "Restringido" o "Rechazado", y proporcionando la regla de negocio correspondiente.

## Arquitectura de la Solución
El sistema utiliza una arquitectura basada en un flujo de **Generación Aumentada por Recuperación (RAG) ligero**:
1. **Ingesta de Datos:** Un archivo CSV actúa como base de datos y fuente de verdad.
2. **Procesamiento:** El framework LangChain orquesta la comunicación.
3. **Generación:** El modelo LLM (Google Gemini) analiza el contexto del catálogo y la intención del usuario para emitir un veredicto estructurado.
4. **Interfaz:** Streamlit proporciona una UI web interactiva y accesible.

## Tecnologías y Herramientas
* **Lenguaje:** Python 3.x
* **Interfaz de Usuario:** Streamlit
* **Orquestación IA:** LangChain
* **Modelo de Lenguaje:** Google Gemini 3.5 Flash (vía Google Generative AI)
* **Procesamiento de Datos:** Pandas

## Despliegue en la Nube (Evidencia)
La aplicación ha sido desplegada exitosamente para garantizar su disponibilidad. 
* **Enlace público de la app:** [HAZ CLIC AQUÍ PARA PROBAR A ARTHUR](https://validarcompras.streamlit.app/)

## Instrucciones para Ejecución Local
1. Clona este repositorio:
   `git clone https://github.com/tu-usuario/tu-repo.git`
2. Instala las dependencias necesarias:
   `pip install -r requirements.txt`
3. Ejecuta la aplicación:
   `streamlit run app.py`
4. Ingresa tu **Google API Key** directamente en el panel lateral de la interfaz web de manera segura.

## Ejemplos de Interacción

**Ejemplo 1: Equipo Aprobado**
* **Usuario:** "¿Qué laptops Dell tienes?"
* **Arthur:** "En nuestro catálogo contamos únicamente con la Dell Latitude 7420 (ID: EQ-002). Su estado es Aprobado, con un precio tope de 1400 USD. Regla de negocio: Uso exclusivo para gerencias medias y directivos."

**Ejemplo 2: Equipo No Homologado**
* **Usuario:** "Necesito comprar una MacBook Pro para mi equipo."
* **Arthur:** "Ese equipo no se encuentra en el catálogo oficial, por lo tanto, no está homologado para su compra."

**Ejemplo 3: Cuadro Comparativo**
* **Usuario:** "Hazme una comparación de las laptops disponibles."
* **Arthur:** *(Generará una tabla comparativa automática estructurada con los IDs, marcas, precios y estados extraídos del CSV).*
