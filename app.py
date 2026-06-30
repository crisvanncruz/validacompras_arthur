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
    h1 { color: #ffffff; text-align: center; margin-bottom: 0px; }
    .subtitle { text-align: center; color: #808495; margin-bottom: 2rem; }
    </style>
    """, unsafe_allow_html=True)

st.image("logo.jpg", width=150)
st.title("Hola, soy Arthur.")
st.markdown("<div class='subtitle'>¿En qué equipo necesitas ayuda hoy?</div>", unsafe_allow_html=True)


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
    st.error("Configuración pendiente: Agrega GOOGLE_API_KEY en los Secrets de Streamlit.")
    st.stop()

# 6. Lógica del Agente
llm = ChatGoogleGenerativeAI(model="gemini-1.5-flash", temperature=0)

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


if prompt := st.chat_input("Mensaje a Arthur..."):
    # Mostrar mensaje del usuario
    with st.chat_message("user"):
        st.write(prompt)
    

    with st.chat_message("assistant"):
        with st.spinner("Arthur está analizando..."):
            try:
                respuesta = agente_arthur.invoke({"input": prompt})
                st.write(respuesta)
            except Exception as e:
                st.error(f"Error: {e}")
