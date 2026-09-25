# Shara-EF - Sistema de Gestão de Treinos e Exercícios

Aplicativo PWA sob medida para a professora **Sara** e seus alunos, com funcionalidades inspiradas no mFit.

## 1. Arquitetura e Deploy em Produção

- **Frontend (PWA)**:
  - Repositório GitHub: [`https://github.com/vlfpimenta/shara-fit`](https://github.com/vlfpimenta/shara-fit)
  - Hospedagem: Vercel (importação direta do repositório `vlfpimenta/shara-fit`)
  - Framework: React 18 + Vite 6 + TypeScript
- **Backend & Banco de Dados (VPS)**:
  - Domínio da API: `https://matrix.vlfp.com.br` (SSL Let's Encrypt com renovação automática e proxy via Nginx Proxy Manager)
  - Container Banco: PostgreSQL 16 Alpine (`shara_postgres_banco`) em volume persistente `shara_postgres_dados`
  - Container API: Fastify Node.js (`shara_api_servidor`) conectado à rede `nginx-proxy_default`
  - Autenticação: JWT com expiração de 30 dias e hash de senhas via bcrypt
- **Configuração e Troca de Domínio Posterior**:
  - Pelo Painel da Professora Sara: Botão **"⚙️ Configurar VPS / Domínio"** permite alterar o endereço da API e testar a conexão em tempo real sem precisar recompilar o aplicativo.
  - No código / Vercel: Variável de ambiente `VITE_API_URL` configurável em `.env` e nas variáveis de projeto da Vercel.

## 2. Estrutura de Arquivos

```text
shara-fit/
├── .env.example                     # Exemplo de variável de ambiente (VITE_API_URL)
├── backend/
│   ├── db/
│   │   └── init.sql                 # Esquema relacional PostgreSQL e credencial da Sara
│   ├── src/
│   │   └── servidor.js              # API REST Fastify com JWT e bcrypt
│   ├── docker-compose.yml           # Orquestração isolada com rede nginx-proxy_default
│   ├── Dockerfile                   # Build de produção Alpine
│   ├── package.json                 # Dependências do servidor (licença MIT)
│   └── README_VPS.md                # Guia de deploy na VPS
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
│   │   └── armazenamento.ts         # Sincronização com a API na VPS + fallback offline
│   ├── telas/
│   │   ├── apresentacao/TelaApresentacao.tsx # Hero de boas-vindas com CTAs
│   │   ├── login/ModalLogin.tsx     # Modal de login (Aluno e Professora)
│   │   ├── novo_aluno/TelaNovoAluno.tsx # Wizard da Anamnese (13 questões + senha)
│   │   ├── painel_aluno/PainelAluno.tsx # Interface do treino (mFit style)
│   │   └── painel_professor/PainelProfessor.tsx # Gestão, construtor, Modo Aluno e Config VPS
│   ├── tipos/
│   │   └── index.ts                 # Tipos e modelos de dados em PT-BR
│   ├── App.tsx                      # Componente raiz e controle de navegação
│   ├── index.css                    # Design system escuro moderno e responsivo
│   └── main.tsx                     # Ponto de entrada React
├── dist/                            # Build de produção verificado
├── LICENSE                          # Licença MIT
├── LICENSES.txt                     # Declaração de licenças permissivas
├── THIRD-PARTY-NOTICES.txt          # Avisos de direitos autorais de terceiros
├── informacoes.md                   # Documentação mestre atualizada
└── README.md                        # Instruções do projeto
```

## 3. Conformidade LGPD & Licenças
- Licença MIT permissiva sem dependências restritivas.
- Código, nomes de arquivos e variáveis estritamente em Português Brasileiro (PT-BR).
- Política de Privacidade em `/privacidade.html` (LGPD).

## 4. Status de Implementação
- [x] Repositório criado e enviado para o GitHub: `https://github.com/vlfpimenta/shara-fit`
- [x] Backend Fastify e PostgreSQL 16 implantados na VPS em container Docker
- [x] Domínio `matrix.vlfp.com.br` roteado via Nginx Proxy Manager com certificado SSL ativo
- [x] Rota de autenticação da professora Sara testada com sucesso via HTTPS
- [x] Conexão dinâmica e interface no painel da professora para troca de domínio a qualquer momento
- [x] Fluxo de Primeiro Acesso da Professora implementado (cadastro direto de e-mail e senha pessoais com sincronização no PostgreSQL)

## 5. Diretriz Obrigatória de Versionamento e Deploy Contínuo (CI/CD)

- **Commit e Push Imediato no Frontend**:
  - Qualquer alteração realizada nos arquivos do frontend (`src/`, `public/`, `index.html`, estilos, componentes, documentação, etc.) deve ser **imediatamente commitada e enviada via `git push origin main` para o repositório no GitHub** ([https://github.com/vlfpimenta/shara-fit](https://github.com/vlfpimenta/shara-fit)).
  - Essa diretriz assegura o disparo automático do pipeline de deploy contínuo na Vercel a cada intervenção.

