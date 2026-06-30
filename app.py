import streamlit as st
import pandas as pd
import os
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import StrOutputParser


st.set_page_config(page_title="Arthur | Validador Corporativo", page_icon="logo.jpg", layout="wide")

st.markdown("""
    <style>
    .main { background-color: #f8f9fa; }
    .stButton>button { width: 100%; border-radius: 5px; height: 3em; background-color: #004a99; color: white; font-weight: bold; }
    h1 { color: #004a99; text-align: center; }
    </style>
    """, unsafe_allow_html=True)

st.image("logo.jpg", width=200)
st.title("Arthur: Validador de Compras")
st.subheader("Asistente IA para homologación de equipos", divider='blue')

# 4. Carga de datos
@st.cache_data
def cargar_catalogo():
    df = pd.read_csv('catalogo_compras.csv')
    return df.to_string()

catalogo_texto = cargar_catalogo()

try:
    os.environ["GOOGLE_API_KEY"] = st.secrets["GOOGLE_API_KEY"]
except KeyError:
    st.error("Configuración pendiente: Agrega GOOGLE_API_KEY en los Secrets de Streamlit.")
    st.stop()

# 6. Lógica del Agente
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

with st.expander("¿Cómo validar una compra?"):
    st.write("1. Escribe el producto que deseas solicitar en la caja de texto.")
    st.write("2. Arthur contrastará la solicitud con nuestro catálogo oficial.")
    st.write("3. Recibirás el veredicto: Aprobado, Restringido o Rechazado.")

col1, col2 = st.columns([3, 1])

with col1:
    input_usuario = st.text_input("Solicitud de compra:", placeholder="Ej: ¿Puedo comprar una laptop Dell Latitude 7420?")

with col2:
    st.write("###") 
    boton = st.button("Validar compra")

if boton and input_usuario:
    with st.spinner("Arthur está analizando las políticas..."):
        try:
            respuesta = agente_arthur.invoke({"input": input_usuario})
            st.markdown("### Respuesta de Arthur:")
            st.info(respuesta)
        except Exception as e:
            st.error(f"Error técnico: {e}")
