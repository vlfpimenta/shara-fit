# Shara-EF 🏋️‍♀️

Sistema de gestão de treinos e acompanhamento personalizado para a professora **Sara** e seus alunos.

## Tecnologias

- **Frontend**: React, TypeScript, Vite, PWA (Progressive Web App), CSS Moderno.
- **Backend / DB**: Node.js / PostgreSQL containerizado via Docker na VPS.
- **Hospedagem Frontend**: Vercel (repositório `shara-fit`).

## Funcionalidades Principais

- **Apresentação Inicial**: Barra superior com marca `Shara.ef`, logotipo em SVG de exercícios e acesso rápido à Área da Professora.
- **Auto-cadastro de Aluno (Anamnese Completa)**: Formulário interativo espelhado no questionário de anamnese oficial (13 tópicos) com criação final de e-mail e senha de acesso.
- **Área do Aluno**: Visualização de treinos (Divisões A, B, C...), contagem de repetições e cargas, cronômetro de descanso mFit-like.
- **Painel da Professora**: Cadastro e edição de treinos por aluno, histórico de anamnese, visão global e **Modo Aluno** integrado para simulação da visão do aluno.

## Execução Local

```bash
# Instalar dependências
npm install

# Rodar servidor de desenvolvimento
npm run dev
```

Consulte [informacoes.md](informacoes.md) para detalhes de arquitetura e conformidade.
