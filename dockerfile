#build the frontend
#copy the content from dist folder 
FROM node:20-alpine AS frontend-builder
COPY ./frontend /app

WORKDIR /app

RUN npm install

RUN npm run build

#build backend 

FROM node:20-alpine AS backend-builder

COPY ./backend /app

WORKDIR /app

RUN npm install

COPY --from=frontend-builder /app/dist /app/public

CMD ["node", "index.js"]