
FROM nikolaik/python-nodejs:python3.10-nodejs18

WORKDIR /app

RUN python3 -m venv /app/.venv

COPY backend/requirements.txt ./backend/
RUN /app/.venv/bin/pip install --no-cache-dir -r backend/requirements.txt

COPY . .

WORKDIR /app/frontend

RUN npm install
RUN npm run build

EXPOSE 3000
ENV NODE_ENV=production

CMD ["npx", "ts-node", "server.ts"]