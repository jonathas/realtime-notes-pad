FROM node:24.3.0-alpine3.22

WORKDIR /app

COPY package*.json ./

RUN npm i

COPY . .

# Expose Vite dev server port
EXPOSE 5173

CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]