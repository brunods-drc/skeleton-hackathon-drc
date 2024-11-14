# Usar uma imagem Node.js
FROM node:18

# Definir o diretório de trabalho
WORKDIR /usr/src/app

# Copiar arquivos package.json e package-lock.json
COPY package*.json ./

# Instalar as dependências
RUN npm install

# Copiar o restante dos arquivos do projeto
COPY . .

# Expor a porta do servidor
EXPOSE 3035

# Comando para iniciar o servidor
CMD ["node", "index.js"]
