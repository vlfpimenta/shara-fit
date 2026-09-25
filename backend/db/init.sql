-- ============================================================================
-- Banco de Dados Shara-EF (PostgreSQL 16)
-- Estrutura relacional com integridade referencial e conformidade LGPD
-- ============================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Tabela de Usuários (Alunos e Professora)
CREATE TABLE IF NOT EXISTS usuarios (
    id VARCHAR(64) PRIMARY KEY,
    papel VARCHAR(16) NOT NULL CHECK (papel IN ('aluno', 'professor')),
    nome VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    senha_hash VARCHAR(255) NOT NULL,
    cref VARCHAR(32),
    data_cadastro DATE NOT NULL DEFAULT CURRENT_DATE,
    status VARCHAR(32) NOT NULL DEFAULT 'ativo'
);

-- Tabela de Anamneses (Espelho fiel das 13 questões do Google Forms)
CREATE TABLE IF NOT EXISTS anamneses (
    id VARCHAR(64) PRIMARY KEY,
    usuario_id VARCHAR(64) UNIQUE REFERENCES usuarios(id) ON DELETE CASCADE,
    nome VARCHAR(255) NOT NULL,
    idade VARCHAR(16) NOT NULL,
    contato VARCHAR(64) NOT NULL,
    peso VARCHAR(16) NOT NULL,
    altura VARCHAR(16) NOT NULL,
    relacao_atividade TEXT NOT NULL,
    possui_restricao_medica VARCHAR(8) NOT NULL,
    descricao_restricao_medica TEXT,
    possui_lesao_dor_cronica VARCHAR(8) NOT NULL,
    descricao_lesao_dor_cronica TEXT,
    possui_doenca JSONB DEFAULT '[]'::jsonb,
    outra_doenca TEXT,
    disponibilidade_treino JSONB DEFAULT '[]'::jsonb,
    horario_preferencial TEXT,
    historico_treino TEXT,
    nivel_conhecimento_treino INT NOT NULL DEFAULT 5,
    objetivo_principal TEXT NOT NULL,
    outro_objetivo TEXT,
    local_treino TEXT NOT NULL,
    outro_local TEXT,
    informacoes_relevantes TEXT,
    data_preenchimento DATE NOT NULL DEFAULT CURRENT_DATE
);

-- Tabela de Fichas de Treino
CREATE TABLE IF NOT EXISTS fichas_treino (
    id VARCHAR(64) PRIMARY KEY,
    aluno_id VARCHAR(64) REFERENCES usuarios(id) ON DELETE CASCADE,
    titulo VARCHAR(255) NOT NULL,
    observacoes_gerais TEXT,
    data_criacao DATE NOT NULL DEFAULT CURRENT_DATE,
    ativa BOOLEAN NOT NULL DEFAULT true
);

-- Tabela de Divisões do Treino (Treino A, Treino B...)
CREATE TABLE IF NOT EXISTS divisoes_treino (
    id VARCHAR(64) PRIMARY KEY,
    ficha_id VARCHAR(64) REFERENCES fichas_treino(id) ON DELETE CASCADE,
    identificador VARCHAR(32) NOT NULL, -- "Treino A", "Treino B"
    titulo VARCHAR(255) NOT NULL,
    frequencia_sugerida VARCHAR(255),
    ordem INT NOT NULL DEFAULT 0
);

-- Tabela de Exercícios da Divisão
CREATE TABLE IF NOT EXISTS exercicios_divisao (
    id VARCHAR(64) PRIMARY KEY,
    divisao_id VARCHAR(64) REFERENCES divisoes_treino(id) ON DELETE CASCADE,
    nome VARCHAR(255) NOT NULL,
    grupamento VARCHAR(64) NOT NULL,
    series INT NOT NULL DEFAULT 3,
    repeticoes VARCHAR(64) NOT NULL,
    carga_kg VARCHAR(32),
    intervalo_segundos INT NOT NULL DEFAULT 60,
    observacoes TEXT,
    ordem INT NOT NULL DEFAULT 0,
    series_concluidas JSONB DEFAULT '[]'::jsonb,
    cargas_registradas JSONB DEFAULT '[]'::jsonb
);

-- Contas de professor são criadas no primeiro acesso diretamente pelo app Shara-EF

