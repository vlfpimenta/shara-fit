# Como Subir o Backend e Banco de Dados na sua VPS 🚀

Este diretório contém o ambiente do backend do **Shara-EF** totalmente pronto para ser executado via Docker em qualquer VPS (Ubuntu, Debian, etc.).

## 1. Pré-requisitos na VPS
Ter o **Docker** e o **Docker Compose** instalados na sua VPS.

## 2. Inicialização com 1 Comando

Copie a pasta `backend/` para a sua VPS (via Git, SCP ou rsync) e execute:

```bash
cd backend
docker compose up -d --build
```

O Docker Compose irá:
1. Subir o container `shara_banco_postgres` (PostgreSQL 16 Alpine com volume persistente `dados_postgres`).
2. Executar automaticamente o script de inicialização `db/init.sql` com as tabelas de alunos, anamnese, treinos e a conta inicial da professora Sara.
3. Subir a API Node.js Fastify (`shara_api_servidor`) na porta `3001`.

## 3. Verificando o Status

```bash
docker compose ps
docker compose logs -f shara_api
```

## 4. Endpoints Principais da API:
- `GET /api/saude` - Verificação de status
- `POST /api/auth/login` - Login seguro com JWT
- `POST /api/alunos/cadastrar` - Cadastro do aluno com anamnese
- `GET /api/alunos` - Gestão exclusiva da professora Sara
