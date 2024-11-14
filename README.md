# Hacktoon Project

Este projeto foi desenvolvido para um Hackathon sobre Inteligência Artificial organizado pela empresa DrConsulta. O objetivo do projeto é utilizar dados fornecidos para criar soluções inovadoras no campo da saúde.

## Estrutura do Projeto


## Passos para reproduzir

### Clone o Projeto

```bash
git clone https://github.com/brunods-drc/skeleton-hackathon-drc.git
```

### Configuração do supabase 

#### Supabase Local

```bash 
# Get the code
git clone --depth 1 https://github.com/supabase/supabase

# Go to the docker folder
cd supabase/docker

# Copy the fake env vars
cp .env.example .env

# Pull the latest images
docker compose pull

# Start the services (in detached mode)
docker compose up -d
```

troubleshoting: https://supabase.com/docs/guides/self-hosting/docker

ps: Caso encontre problemas com a instalação do supabase local, é possivel criar uma conta gratuita e rodar um projeto em: https://supabase.com/

#### Configuração do banco vetorial e criação de tabela 

1. acesse http://localhost:8000

user: supabase
pass: this_password_is_insecure_and_should_be_updated

( ou o que foi definido em: supabase/docker/.env )

2. Vá em SQL Query ( canto esquerdo superior )

rode o script presente em: setup.sql
-> retorno esperado: "Success. No rows returned"

#### Crie uma chave de API Google AI Studio

acesse: https://aistudio.google.com/prompts/new_chat
clique em GET API KEY.
Gere uma nova chave e adicione no .env deste projeto.

#### Instlando deps
```bash
yarn
````
ou 
```bash
npm i
```

#### Excute o projeto

```bash
yarn start
````
ou
```bash
npm run start
```

## Objetivo

O objetivo principal deste projeto é explorar e analisar os dados fornecidos pela DrConsulta para desenvolver soluções baseadas em IA que possam melhorar os serviços de saúde oferecidos pela empresa.
# skeleton-hackathon-drc


## Refs
https://ai.google.dev/gemini-api/docs/embeddings?hl=pt-br