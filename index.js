const express = require("express"); 
const app = express();
const http = require("http");

const { createClient } = require("@supabase/supabase-js");
const { GoogleGenerativeAI,  } = require("@google/generative-ai");
const { RecursiveCharacterTextSplitter } = require("langchain/text_splitter"); 
const { CheerioWebBaseLoader } = require("langchain/document_loaders/web/cheerio");

require("dotenv").config(); 

const embeddingModelUsed = 'text-embedding-004'; 
const geminiModelUsed = 'gemini-1.5-pro';

const promptContext = {
  model: {
    role: 'model',
    parts: [
      {
        text: 'Por favor, responda apenas com informações disponíveis no contexto. Não inclua informações externas ou de outros sites. Responda sempre em português.',
      }
    ]
  },
  user:{
    role: 'user',
    parts: [
      {
        text: `Seções de contexto: "{contextText}" Pergunta: "{query}" Responda em texto simples:`,
      }
    ],
  }
}

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

const server = http.createServer(app);
server.timeout = 300000;

app.use(express.json());



// Rota POST para gerar embeddings e armazenar no banco de dados
app.post("/embed", async (req, res) => {
  try {
    const url = req.body.url;
    if(url){
      console.log("Generating and storing embeddings...", url);
      await generateAndStoreEmbeddings(url);
      res.status(200).json({ message: "Embedded com sucesso" });  
    }
    
  } catch (error) {
    res.status(500).json({ message: "Ocorreu um erro", error });
  }
});

async function generateAndStoreEmbeddings(url) {

  const context_version =  Date.now();
  const context_origin = url;

  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  const model = genAI.getGenerativeModel({ model: embeddingModelUsed});
  
  const loader = new CheerioWebBaseLoader(context_origin);
  const docs = await loader.load();

  // Divide os documentos em partes menores para processamento
  const textSplitter = new RecursiveCharacterTextSplitter({
    chunkSize: 1000, // Tamanho de cada parte (em caracteres)
    chunkOverlap: 200, // Quantidade de sobreposição entre as partes
  });

  // Gera as partes dos documentos
  const chunks = await textSplitter.splitDocuments(docs);

  for(const chunk of chunks) {
    const cleanChunk = chunk.pageContent.replace(/\n/g, " "); // Limpa o conteúdo removendo quebras de linha

    const result = await model.embedContent(cleanChunk);
    const embedding = result.embedding;
  
    const { error } = await supabase.from("documents_gemini").insert({
      context_origin,
      context_version,
      content: cleanChunk,
      embedding: embedding.values,
    });

    if (error) {
      throw error; 
    }
    
  }

}

// Rota POST para fazer consultas com embeddings
app.post("/query", async (req, res) => {
  try {
    const { query, context_origin } = req.body; 
    const result = await handleQuery(query, context_origin); 
    res.status(200).json(result); 
  } catch (error) {
    res.status(500).json({ message: "Ocorreu um erro", error });
  }
});

// Função para lidar com consultas baseadas em embeddings
async function handleQuery(query, context_origin) {
  const input = query.replace(/\n/g, " "); // Limpa a consulta removendo quebras de linha

  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  const model = genAI.getGenerativeModel({ model: embeddingModelUsed});

  // Gera embedding para a consulta do usuário
  const result = await model.embedContent(input);
  const embedding = result.embedding;

  // Chama a função RPC no Supabase para encontrar documentos correspondentes no banco
  const { data: documents, error } = await supabase.rpc("match_documents_gemini", {
    // context_origin_param: context_origin,
    query_embedding: embedding.values,
    match_threshold: 0.5, // Limite de similaridade
    match_count: 10, // Número máximo de documentos a retornar
  });

  if (error) throw error; 

  // Concatena o conteúdo dos documentos correspondentes
  let contextText = "";
  contextText += documents
    .map((document) => `${document.content.trim()}---\n`)
    .join("");

  const gemini = genAI.getGenerativeModel({ model: geminiModelUsed });

  // console.log(promptContext.user.parts[0].text.replace("{contextText}", contextText).replace("{query}", query))
  const res = await gemini.generateContent({
    contents: [
      {
        role: 'model',
        parts: [
          {
            text: 'Por favor, responda apenas com informações disponíveis no contexto. Não inclua informações externas ou de outros sites. Responda sempre em português.',
          }
        ]
      },
      {
        role: 'user',
        parts: [
          {
            text: `Seções de contexto: ${contextText} Pergunta: ${query} Responda em texto simples:`,
          }
        ],
      }],
    generationConfig: {
      maxOutputTokens: 1000,
      temperature: 0.8,
    },
  });

  return res.response.text() 
}


server.listen("3035", () => {
  console.log("App running: 3035");
});
