# Shara-EF - Sistema de Gestão de Treinos e Exercícios

Aplicativo PWA sob medida para a professora **Sara** e seus alunos, com funcionalidades inspiradas no mFit.

## 1. Arquitetura Geral

- **Frontend**: PWA desenvolvido em React 18 + Vite + TypeScript + CSS Nativo Moderno (sem Tailwind), com responsividade mobile-first para os alunos e layout desktop/web para a professora Sara.
  - Hospedagem: GitHub (`shara-fit`) -> Deploy na Vercel.
- **Backend & Banco de Dados**: Docker Compose para VPS com PostgreSQL 16 Alpine + API Fastify/Node.js com autenticação JWT e criptografia de senhas bcrypt.
- **Segurança e Papéis de Usuário**:
  - `aluno`: Acesso restrito às suas próprias divisões de treino, checklist de séries concluídas, anotações de carga e cronômetro de descanso mFit.
  - `professor` (Sara): Dashboard completo de gestão, listagem e busca de alunos, visualização detalhada da anamnese oficial (13 perguntas), construtor de treinos com biblioteca de exercícios e botão de **Modo Aluno** integrado.

## 2. Estrutura de Arquivos

```text
shara-fit/
├── backend/
│   ├── db/
│   │   └── init.sql                 # Esquema relacional PostgreSQL e conta inicial
│   ├── src/
│   │   └── servidor.js              # API REST Fastify com JWT e bcrypt
│   ├── docker-compose.yml           # Orquestração do banco e API na VPS
│   ├── Dockerfile                   # Build de produção Alpine
│   ├── package.json                 # Dependências do servidor (licença MIT)
│   └── README_VPS.md                # Guia de deploy na VPS com 1 comando
├── public/
│   ├── icone.svg                    # Logotipo SVG de exercícios para Shara.ef
│   ├── manifest.webmanifest         # Manifesto PWA instalável
│   └── privacidade.html             # Política de privacidade LGPD
├── src/
│   ├── componentes/
│   │   ├── cabecalho/Cabecalho.tsx  # Barra superior Shara.ef com SVG e login
│   │   ├── cronometro/CronometroDescanso.tsx # Cronômetro estilo mFit com Web Audio API
│   │   └── icones/index.tsx         # Conjunto de ícones inline SVG em PT-BR
│   ├── dados/
│   │   └── iniciais.ts              # Biblioteca de exercícios e alunos de demonstração
│   ├── servicos/
│   │   └── armazenamento.ts         # Persistência e autenticação com simulação
│   ├── telas/
│   │   ├── apresentacao/TelaApresentacao.tsx # Hero de boas-vindas com CTAs
│   │   ├── login/ModalLogin.tsx     # Modal de login (Aluno e Professora)
│   │   ├── novo_aluno/TelaNovoAluno.tsx # Wizard da Anamnese (13 questões + senha)
│   │   ├── painel_aluno/PainelAluno.tsx # Interface do treino (mFit style)
│   │   └── painel_professor/PainelProfessor.tsx # Gestão, construtor e Modo Aluno
│   ├── tipos/
│   │   └── index.ts                 # Tipos e modelos de dados em PT-BR
│   ├── App.tsx                      # Componente raiz e controle de navegação
│   ├── index.css                    # Design system escuro moderno e responsivo
│   └── main.tsx                     # Ponto de entrada React
├── dist/                            # Build de produção testado e verificado
├── LICENSE                          # Licença MIT
├── LICENSES.txt                     # Declaração de licenças permissivas
├── THIRD-PARTY-NOTICES.txt          # Avisos de direitos autorais de terceiros
├── informacoes.md                   # Documentação mestre atualizada
└── README.md                        # Instruções do projeto
```

## 3. Conformidade LGPD & Licenças
- Licença MIT permissiva sem dependências restritivas (GPL/AGPL).
- Todos os arquivos e códigos escritos estritamente em Português Brasileiro (PT-BR).
- Política de Privacidade disponível em `/privacidade.html` conforme as diretrizes da LGPD (Lei 13.709/2018).

## 4. Status de Implementação
- [x] Extração e análise completa do formulário do Google Forms (13 questões)
- [x] Criação do Frontend PWA completo (React + TypeScript + Vite)
- [x] Logotipo em SVG dinâmico e barra superior com acesso à área da professora
- [x] Tela de apresentação com CTAs para "Acesso de Aluno" e "Novo Aluno"
- [x] Formulário de anamnese interativo multi-etapas com cálculo de IMC e criação de credenciais
- [x] Interface do aluno estilo mFit (séries, repetições, cargas, cronômetro de descanso com bip)
- [x] Interface administrativa da professora Sara com construtor de treinos e biblioteca de exercícios
- [x] Recurso de **Modo Aluno** para que a Sara simule e visualize exatamente o que o aluno vê
- [x] Container Docker Compose + PostgreSQL 16 pronto para deploy na VPS
- [x] Teste de build de produção executado com sucesso (`npm run build`)
