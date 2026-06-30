import streamlit as st
import pandas as pd
import os
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import StrOutputParser

st.set_page_config(page_title="Arthur | Validador", page_icon="logo.jpg", layout="centered")

st.markdown("""
    <style>
    .stApp { background-color: #0e1117; }
    h1 { color: #ffffff; text-align: center; margin-bottom: 0px; font-weight: 700; }
    .subtitle { text-align: center; color: #808495; margin-bottom: 2rem; }
    .streamlit-expanderHeader { justify-content: center; border: 1px solid #262730; border-radius: 10px; }

    [data-testid="stChatMessage"] { border-radius: 15px; padding: 15px; }
    </style>
    """, unsafe_allow_html=True)

# 3. Encabezado con más aire
st.image("logo.jpg", width=140)
st.title("Hola, soy Arthur.")
st.markdown("<div class='subtitle'>Tu asistente inteligente para validación corporativa</div>", unsafe_allow_html=True)

with st.expander("¿Cómo funciona Arthur?"):
    st.write("Escribe el nombre del equipo y verificaré su estado según el catálogo oficial. Arthur te indicará si está **Aprobado**, **Restringido** o **Rechazado**.")

@st.cache_data
def cargar_catalogo():
    df = pd.read_csv('catalogo_compras.csv')
    return df.to_string()

try:
    catalogo_texto = cargar_catalogo()
except Exception as e:
    st.error("Error al cargar el catálogo.")
    st.stop()

try:
    os.environ["GOOGLE_API_KEY"] = st.secrets["GOOGLE_API_KEY"]
except KeyError:
    st.error("Configuración pendiente: Agrega GOOGLE_API_KEY en los Secrets.")
    st.stop()

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

if prompt_usuario := st.chat_input("Escribe tu consulta aquí..."):
    with st.chat_message("user"):
        st.write(prompt_usuario)
    
    with st.chat_message("assistant", avatar="logo.jpg"): 
        with st.spinner("Arthur está consultando el catálogo..."):
            try:
                respuesta = agente_arthur.invoke({"input": prompt_usuario})
                st.write(respuesta)
            except Exception as e:
                st.error(f"Error técnico: {e}")
