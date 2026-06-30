# Validador de Compras (Arthur)

## Descripción General
Proyecto diseñado para automatizar la validación de solicitudes de compra corporativa basándose en un catálogo de productos homologados. El agente utiliza IA Generativa para determinar si un equipo está "Aprobado", "Restringido" o "Rechazado".

## Arquitectura
El sistema procesa un archivo CSV como fuente de verdad. El agente (Arthur) utiliza el modelo Gemini de Google para analizar la solicitud del usuario en relación con el contexto del catálogo.

## Tecnologías
* Python 3.x
* Streamlit (Interfaz)
* LangChain & Google Generative AI
* Pandas (Procesamiento de datos)

## Instrucciones
1. `pip install -r requirements.txt`
2. `streamlit run app.py`
3. Ingresa tu Google API Key en la interfaz.

## Ejemplos
* **Pregunta:** "¿Qué laptops Dell tienes?"
* **Respuesta:** "En nuestro catálogo contamos con la Dell Latitude 7420 (ID: EQ-002), estado Aprobado..."
