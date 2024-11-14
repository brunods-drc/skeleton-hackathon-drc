Aqui está uma versão aprimorada em Markdown:

# Skeleton Hackathon

Este projeto foi desenvolvido para um Hackathon focado em Inteligência Artificial organizado pela Dr.Consulta. O objetivo é utilizar dados fornecidos para criar soluções inovadoras na área de saúde.

## Estrutura do Projeto

```
index.js
  ├── /embed
  └── /query
```

## Passos para Reproduzir

### 1. Clone o Projeto

```bash
git clone https://github.com/brunods-drc/skeleton-hackathon-drc.git
```

### 2. Configuração do Supabase

#### Supabase Local

Para rodar o Supabase localmente:

```bash 
# Clone o repositório do Supabase
git clone --depth 1 https://github.com/supabase/supabase

# Navegue até a pasta docker
cd supabase/docker

# Copie as variáveis de ambiente
cp .env.example .env

# Baixe as imagens mais recentes
docker compose pull

# Inicie os serviços em modo detached
docker compose up -d
```

**Dúvidas:** Para mais informações, consulte a [documentação do Supabase](https://supabase.com/docs/guides/self-hosting/docker).

> **Nota:** Se houver problemas com a instalação local, você pode criar uma conta gratuita e executar o projeto diretamente pelo site: [supabase.com](https://supabase.com/).

#### Configuração do Banco Vetorial e Criação de Tabelas

1. Acesse o painel em [http://localhost:8000](http://localhost:8000).
   - **Usuário:** supabase
   - **Senha:** this_password_is_insecure_and_should_be_updated *(ou a senha definida no arquivo `.env` em `supabase/docker/.env`)*.

2. No menu superior esquerdo, selecione "SQL Query" e execute o script em `setup.sql`.
   - **Retorno esperado:** "Success. No rows returned".

### 3. Criação de uma Chave de API no Google AI Studio

1. Acesse [Google AI Studio](https://aistudio.google.com/prompts/new_chat).
2. Clique em **GET API KEY** para gerar uma nova chave e adicione-a no arquivo `.env` deste projeto.

### 4. Instale as Dependências

```bash
yarn
```
ou 
```bash
npm install
```

### 5. Execute o Projeto

```bash
yarn start
```
ou
```bash
npm run start
```

### 6. Testando o Projeto

**Inserindo uma URL para Embedding:**

```bash
curl --request POST \
  --url http://localhost:3035/embed \
  --header 'Content-Type: application/json' \
  --header 'User-Agent: insomnia/10.0.0' \
  --data '{
        "url": "https://drconsulta.com/ajuda"
}'
```

**Consultando Informações:**

```bash
curl --request POST \
  --url http://localhost:3035/query \
  --header 'Content-Type: application/json' \
  --header 'User-Agent: insomnia/10.0.0' \
  --data '{"query": "em quais cidades a dr.consulta atende ?", "context_origin": "https://drconsulta.com/ajuda" }'
```

**Retorno esperado:**  
`"O dr.consulta atende presencialmente em São Paulo, Rio de Janeiro e Belo Horizonte e em todo o Brasil através de telemedicina."`

## Referências

- [Documentação de Embeddings da API Google Gemini](https://ai.google.dev/gemini-api/docs/embeddings?hl=pt-br)