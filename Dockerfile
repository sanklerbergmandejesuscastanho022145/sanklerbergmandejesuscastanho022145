# Etapa 1: Build da aplicação
FROM node:20-alpine AS build

WORKDIR /app

# Copiar arquivos de dependências
COPY package*.json ./

# Instalar dependências
RUN npm ci

# Copiar código fonte
COPY . .

# Build da aplicação
RUN npm run build -- --configuration production

# Stage 2: Nginx para servir a aplicação
FROM nginx:alpine

# Remover configuração padrão do nginx
RUN rm -rf /usr/share/nginx/html/*

# Copiar os arquivos buildados do Angular
COPY --from=build /app/dist/pet-maisperto-mt/browser /usr/share/nginx/html

# Copiar configuração customizada do nginx
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expor porta 80
EXPOSE 80

# Comando para iniciar o nginx
CMD ["nginx", "-g", "daemon off;"]