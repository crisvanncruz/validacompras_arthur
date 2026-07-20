
FROM nikolaik/python-nodejs:python3.10-nodejs18

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY backend/requirements.txt ./backend/

RUN pip install --no-cache-dir -r backend/requirements.txt


COPY . .


RUN npm run build


EXPOSE 3000

# Establece la variable de entorno para producción
ENV NODE_ENV=production

# Comando para iniciar tu servidor orquestador
CMD ["npx", "ts-node", "server.ts"]