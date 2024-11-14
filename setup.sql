-- Ativa a extensão pgvector para permitir o uso do tipo 'vector'
CREATE EXTENSION IF NOT EXISTS vector;

-- Cria a tabela documents_gemini
CREATE TABLE IF NOT EXISTS documents_gemini (
    id BIGSERIAL PRIMARY KEY,
    context_version BIGINT,
    context_origin VARCHAR(255),
    content TEXT,
    embedding VECTOR(768)
);

-- Cria a função match_documents_gemini
CREATE OR REPLACE FUNCTION match_documents_gemini (
    query_embedding VECTOR(768),
    match_threshold FLOAT,
    match_count INT
)
RETURNS TABLE (
    id BIGINT,
    content TEXT,
    similarity FLOAT
)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT
        documents_gemini.id,  -- Qualificando o nome da coluna
        documents_gemini.content,  -- Qualificando o nome da coluna
        1 - (documents_gemini.embedding <=> query_embedding) AS similarity  -- Qualificando o nome da coluna
    FROM documents_gemini
    WHERE 1 - (documents_gemini.embedding <=> query_embedding) > match_threshold
    ORDER BY similarity DESC
    LIMIT match_count;
END;
$$;


--  para testar !!!

-- Ativa a extensão pgvector para permitir o uso do tipo 'vector'
CREATE EXTENSION IF NOT EXISTS vector;

-- Cria a tabela documents_gemini
CREATE TABLE IF NOT EXISTS documents_gemini (
    id BIGSERIAL PRIMARY KEY,
    context_version BIGINT,
    context_origin VARCHAR(255),
    content TEXT,
    embedding VECTOR(768)
);

-- Cria a função match_documents_gemini
CREATE OR REPLACE FUNCTION match_documents_gemini (
    query_embedding VECTOR(768),
    match_threshold FLOAT,
    match_count INT,
    context_origin_param VARCHAR(255)
)
RETURNS TABLE (
    id BIGINT,
    content TEXT,
    similarity FLOAT
)
LANGUAGE plpgsql
AS $$
BEGIN
    -- Condicional para quando context_origin_param estiver vazio
    IF context_origin_param = '' THEN
        RETURN QUERY
        WITH latest_version AS (
            -- Subconsulta para obter a versão mais recente de todas as origens
            SELECT MAX(context_version) AS latest_version
            FROM documents_gemini
        )
        SELECT
            documents_gemini.id,
            documents_gemini.content,
            1 - (documents_gemini.embedding <=> query_embedding) AS similarity
        FROM documents_gemini
        CROSS JOIN latest_version
        WHERE documents_gemini.context_version = latest_version.latest_version
          AND 1 - (documents_gemini.embedding <=> query_embedding) > match_threshold
        ORDER BY similarity DESC
        LIMIT match_count;
    ELSE
        -- Caso contrário, busca pela última versão de context_origin_param específico
        RETURN QUERY
        WITH latest_version AS (
            -- Subconsulta para obter a versão mais recente do context_origin_param específico
            SELECT MAX(context_version) AS latest_version
            FROM documents_gemini
            WHERE documents_gemini.context_origin = context_origin_param
        )
        SELECT
            documents_gemini.id,
            documents_gemini.content,
            1 - (documents_gemini.embedding <=> query_embedding) AS similarity
        FROM documents_gemini
        CROSS JOIN latest_version
        WHERE documents_gemini.context_origin = context_origin_param
          AND documents_gemini.context_version = latest_version.latest_version
          AND 1 - (documents_gemini.embedding <=> query_embedding) > match_threshold
        ORDER BY similarity DESC
        LIMIT match_count;
    END IF;
END;
$$;
