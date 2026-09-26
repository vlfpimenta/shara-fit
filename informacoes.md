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
│   ├── logo-vlfp.png                # Logo oficial da VLFP Info (50px de altura no rodapé)
│   ├── manifest.webmanifest         # Manifesto PWA instalável
│   └── privacidade.html             # Política de privacidade LGPD
├── src/
│   ├── componentes/
│   │   ├── cabecalho/Cabecalho.tsx  # Barra superior Shara.ef com SVG de halter e atalhos
│   │   ├── cronometro/CronometroDescanso.tsx # Cronômetro estilo mFit com Web Audio API
│   │   ├── icones/index.tsx         # Conjunto de ícones inline SVG em PT-BR
│   │   ├── modal_privacidade/ModalPrivacidade.tsx # Modal de privacidade LGPD com botão fechar claro
│   │   └── pwa/BotaoInstalarApp.tsx # Botão inteligente de instalação PWA
│   ├── dados/
│   │   └── iniciais.ts              # Biblioteca de exercícios e alunos de demonstração
│   ├── servicos/
│   │   └── armazenamento.ts         # Sincronização com a API na VPS + fallback offline
│   ├── telas/
│   │   ├── apresentacao/TelaApresentacao.tsx # Hero de boas-vindas com CTAs
│   │   ├── login/
│   │   │   ├── ModalLogin.tsx       # Modal de login exclusivo do Aluno
│   │   │   └── ModalLoginProfessor.tsx # Modal de login exclusivo da Professora Sara (via Logo VLFP Info)
│   │   ├── novo_aluno/TelaNovoAluno.tsx # Wizard da Anamnese (13 questões + senha + popstate)
│   │   ├── painel_aluno/PainelAluno.tsx # Interface do treino (mFit style)
│   │   └── painel_professor/PainelProfessor.tsx # Gestão, construtor, Modo Aluno e Config VPS
│   ├── tipos/
│   │   └── index.ts                 # Tipos e modelos de dados em PT-BR
│   ├── App.tsx                      # Componente raiz, controle de popstate e navegação de histórico
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
- Política de Privacidade em `/privacidade.html` e no componente interno `ModalPrivacidade.tsx` (LGPD).

## 4. Status de Implementação
- [x] Repositório criado e enviado para o GitHub: `https://github.com/vlfpimenta/shara-fit`
- [x] Backend Fastify e PostgreSQL 16 implantados na VPS em container Docker
- [x] Domínio `matrix.vlfp.com.br` roteado via Nginx Proxy Manager com certificado SSL ativo
- [x] Rota de autenticação da professora Sara testada com sucesso via HTTPS
- [x] Conexão dinâmica e interface no painel da professora para troca de domínio a qualquer momento
- [x] Verificação dinâmica no banco de dados (`/api/auth/professor/status`): caso não haja professor registrado, o app abre diretamente no formulário de primeiro cadastro.
- [x] Remoção definitiva de qualquer exibição de credencial padrão ou texto inseguro na interface e no código.
- [x] Estilização de todas as barras de rolagem para o tema escuro (`::-webkit-scrollbar` e `scrollbar-color`).
- [x] Redução e enxugamento de textos longos e prolixos na apresentação e anamnese.
- [x] Gerenciamento completo de alunos na área da professora: editar cadastro, desativar/reativar acesso e excluir aluno com confirmação segura.
- [x] Barra de status de tempo fixa no rodapé para mobile, com espaçamento adequado garantindo rolagem livre do rodapé e textos acima da barra.
- [x] Integração natural das imagens da professora Sara na landing page: retrato vertical (`shara-vert.png`) no Hero principal com badge de status e banner panorâmico (`shara-hor.png`) destacando a metodologia em qualquer ambiente de treino.
- [x] Botão de instalação PWA ("Instalar App no Telefone") adicionado ao final da anamnese (etapa 4 e tela de sucesso) e no painel da professora com suporte nativo e guia ilustrado para iOS/Android.
- [x] Ocultação dos textos e links de rodapé na área do aluno, oferecendo visual limpo e imersivo de aplicativo nativo.
- [x] Otimização da interface mobile no painel da professora: substituição da tabela espremida por cartões individuais (`.card-aluno-mobile`), redução e proporcionalidade dos badges (`.badge`) e introdução da classe `.tag-objetivo` com texto formatado naturalmente sem caixa alta forçada.
- [x] Sincronização remota automática com a VPS: implementação do endpoint `GET /api/alunos` no Fastify com normalização de campos da anamnese, integração de `sincronizarAlunosRemoto()` no frontend ao inicializar o painel, botão "🔄 Sincronizar" no cabeçalho e persistência de token JWT.
- [x] Ajuste completo de escala dos elementos visuais no mobile inspirado no padrão MiniBOM: normalização da meta tag `viewport` sem restrições (`width=device-width, initial-scale=1.0`), definição de escala tipográfica base compacta (`html { font-size: 14px }` no mobile), redução proporcional de alturas de botões (36px/38px), cabeçalho compacto (50px), cards com padding reduzido (0.85rem), inputs e modais alinhados à ergonomia de smartphones.
- [x] Rodapé da página inicial atualizado com logo oficial da VLFP Info (`public/logo-vlfp.png`) com altura de 50px e crédito "Desenvolvido por VLFP Info".
- [x] Remoção do botão de cadeado do cabeçalho e da aba "Área da Professora" no modal de login de aluno. Criação do modal dedicado `ModalLoginProfessor.tsx`, acessado diretamente ao clicar no logo da VLFP Info no rodapé.
- [x] Correção do link de privacidade na anamnese com o novo componente `ModalPrivacidade.tsx`, contendo botão de fechar acessível e visual integrado para evitar travamento em PWA standalone.
- [x] Implementação de suporte nativo ao botão "Voltar" (Hardware Android / Navegador) via History API (`pushState` e `popstate`), permitindo retroceder entre etapas da anamnese, fechar modais e sair do modo simulado sem fechar o aplicativo.

## 5. Diretriz Obrigatória de Versionamento e Deploy Contínuo (CI/CD)

- **Commit e Push Imediato no Frontend**:
  - Qualquer alteração realizada nos arquivos do frontend (`src/`, `public/`, `index.html`, estilos, componentes, documentação, etc.) deve ser **imediatamente commitada e enviada via `git push origin main` para o repositório no GitHub** ([https://github.com/vlfpimenta/shara-fit](https://github.com/vlfpimenta/shara-fit)).
  - Essa diretriz assegura o disparo automático do pipeline de deploy contínuo na Vercel a cada intervenção.

