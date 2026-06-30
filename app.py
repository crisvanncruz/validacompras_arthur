import streamlit as st
import pandas as pd
import os
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import StrOutputParser

st.set_page_config(page_title="Arthur - Validador", page_icon="🤖", layout="wide")
st.title("🤖 Arthur: Validador de Compras Corporativas")
st.markdown("---")


@st.cache_data
def cargar_catalogo():
    df = pd.read_csv('catalogo_compras.csv')
    return df.to_string()

try:
    catalogo_texto = cargar_catalogo()
except FileNotFoundError:
    st.error("Error: No se encontró el archivo 'catalogo_compras.csv' en la carpeta.")
    st.stop()

api_key = st.sidebar.text_input("Ingresa tu Google API Key", type="password")

if api_key:
    os.environ["GOOGLE_API_KEY"] = api_key
    
    llm = ChatGoogleGenerativeAI(model="gemini-3.5-flash", temperature=0)
    
    system_prompt = (
        "Eres Arthur, el Validador de Compras Corporativas. "
        "Responde basándote ÚNICAMENTE en este catálogo:\n\n"
        f"{catalogo_texto}\n\n"
        "Reglas estrictas:\n"
        "- Si piden algo que no está, indica que no está homologado.\n"
        "- Si está, indica si está Aprobado, Restringido o Rechazado, su precio tope y regla de negocio.\n"
        "- Si te piden comparar, responde estructurando la información en una tabla."
    )
    
    prompt = ChatPromptTemplate.from_messages([
        ("system", system_prompt),
        ("user", "{input}"),
    ])
    

    agente_arthur = prompt | llm | StrOutputParser()


    input_usuario = st.text_input("¿Qué equipo necesitas validar o comparar?", placeholder="Ej. Compara las laptops disponibles...")
    
    if st.button("Consultar a Arthur", type="primary"):
        with st.spinner("Arthur está validando las políticas..."):
            try:
  
                respuesta = agente_arthur.invoke({"input": input_usuario})
                
                st.markdown("### Respuesta de Arthur:")
                st.info(respuesta)
                
            except Exception as e:
                st.error(f"Error de conexión con la API: {e}")
else:
    st.warning("Por favor, ingresa tu API Key en la barra lateral para inicializar a Arthur.")