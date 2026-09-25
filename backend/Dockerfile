FROM node:20-alpine AS construtor

WORKDIR /app

COPY package*.json ./
RUN npm install --omit=dev

COPY src/ ./src/

FROM node:20-alpine AS executor

WORKDIR /app
ENV NODE_ENV=production

COPY --from=construtor /app ./

EXPOSE 3001

CMD ["node", "src/servidor.js"]
