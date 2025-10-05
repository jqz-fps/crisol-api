FROM node:20-slim

WORKDIR /crisolapi
COPY package.json .
RUN npm install

EXPOSE 3000

COPY . .
CMD ["npm", "run", "prod"]