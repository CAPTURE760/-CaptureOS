FROM node:20-alpine
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm install
COPY . .
RUN mkdir -p /app/data

EXPOSE 8000
CMD ["node", "--experimental-sqlite", "src/index.ts"]
