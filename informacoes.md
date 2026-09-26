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

### ⚠️ REGRA ARQUITETURAL INVIOLÁVEL: OPERAÇÃO 100% EXCLUSIVA NA VPS (SEM DADOS EM LOCALSTORAGE)

> **ATENÇÃO: ESTA REGRA NUNCA DEVE SER SOBREPOSTA OU MODIFICADA EM NENHUMA ATUALIZAÇÃO OU REFATORAÇÃO FUTURA.**
> 
> 1. **Fonte Única da Verdade**: O banco de dados PostgreSQL na VPS (`matrix.vlfp.com.br`) é a **ÚNICA** fonte de dados do sistema.
> 2. **Proibição Absoluta de Dados no localStorage**: É terminantemente proibido persistir, consultar, mesclar ou manter em `localStorage` qualquer dado operacional:
>    - ❌ NENHUM dado de aluno ou cadastro;
>    - ❌ NENHUM treino, divisão, exercício ou repetição;
>    - ❌ NENHUMA ficha de treino prescrita ou histórico;
>    - ❌ NENHUMA anamnese ou resposta de saúde;
>    - ❌ NENHUMA senha ou credencial em texto/hash local;
>    - ❌ NENHUM array de demonstração ou mock offline (`ALUNOS_EXEMPLO`).
> 3. **Uso Permitido do Navegador**: O `localStorage` é reservado **exclusivamente e estritamente** para:
>    - `shara_ef_jwt_token_v1`: Token JWT emitido pela VPS para autorização de requisições HTTP;
>    - `shara_ef_sessao_v1`: Identidade básica da sessão ativa do usuário conectado para manter o estado da interface após recarregamento (F5);
>    - `shara_ef_url_api_v1`: Endereço da API backend configurado para comunicação com a VPS.
> 4. **Operações em Tempo Real**: Todas as ações de listagem, consulta, cadastro de alunos, prescrição de treinos, marcação de séries concluídas, anotação de cargas, alteração de status e exclusão são processadas e persistidas **direta e imediatamente via chamadas HTTP (REST) contra a API da VPS**.
> 5. **Limpeza Ativa**: A rotina de inicialização do aplicativo executa a remoção forçada e permanente de quaisquer chaves legadas de armazenamento local (`shara_ef_alunos_v1`, `shara_ef_credenciais_v1`, etc.).

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
│   │   ├── modal_vps/ModalConfigVps.tsx # Modal de configuração e teste de conexão VPS / Domínio
│   │   └── pwa/BotaoInstalarApp.tsx # Botão inteligente de instalação PWA
│   ├── dados/
│   │   └── iniciais.ts              # Biblioteca de exercícios e alunos de demonstração
│   ├── servicos/
│   │   ├── armazenamento.ts         # Sincronização com a API na VPS + fallback offline
│   │   └── geradorPdfTreino.ts      # Geração de PDF e impressão nativa da ficha de treino (100% offline)
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
- [x] Restauração da escala ampla e imponente exclusiva da homepage (`.homepage-apresentacao` com base de 16px, botões hero de 46-48px, tipografia fluida e fotos originais), mantendo a escala compacta ergonômica (MiniBOM) nas telas internas de treino, cadastro e painel.
- [x] Centralização de textos e botões no card Hero da homepage, remoção da badge "Prescrição Sara EF", link de Política de Privacidade reposicionado abaixo do copyright em cor cinza e ativação do login da professora por toque quintuplo (5 cliques) no logo VLFP Info.
- [x] Remoção da dica visual textual ("Toque mais Xx para acessar"), tornando o acesso administrativo silencioso via 5 toques no logo.
- [x] Ocultação do rodapé (logo VLFP, política de privacidade e copyright) em todas as áreas logadas (aluno e professora), exibindo-o estritamente na landing page inicial quando deslogado.
- [x] Modal de login administrativo simplificado para título direto "Acesso Administrativo", sem o texto "Painel da Sara".
- [x] Simplificação da lista de alunos no painel da professora: apenas "Editar Treino" e "Anamnese" mantêm texto legível; os botões de ação secundária ("Modo Aluno", "Editar", "Desativar/Reativar" e "Excluir") foram convertidos para botões de ícone com tooltips ergonômicos.
- [x] Criação de menu dropdown suspenso acionado ao clicar no nome de usuário no topo do cabeçalho, agrupando "Sincronizar Alunos", "Configurar VPS / Domínio" e "Sair da Conta".
- [x] Modularização do `ModalConfigVps.tsx` em componente reutilizável conectado ao cabeçalho.
- [x] Construtor de treinos atualizado: suporte à exclusão de divisões/treinos adicionados com confirmação prévia e renomeação do botão final para apenas "Salvar".
- [x] Remoção do botão redundante "Sair" do cabeçalho da professora, centralizando o logout e as configurações exclusivamente no menu dropdown suspenso.
- [x] Substituição do texto/badge de status por um indicador luminoso colorido ao lado do nome do aluno (verde para treino ativo/liberado, amarelo para aguardando prescrição e vermelho para acesso desativado).
- [x] Alocação dos 4 botões de ícone com tooltip ("Modo Aluno", "Editar", "Desativar/Reativar" e "Excluir") no local onde antes ficava o texto "Treino Ativo", com dimensões perfeitamente padronizadas (32x32px) tanto na tabela desktop quanto nos cards mobile.
- [x] Correção de carregamento e sincronização com a VPS no Desktop: persistência automática dos dados reais da professora retornados pelo backend (`saramilk1234@gmail.com`), envio correto de headers de autorização sem fallback genérico incorreto, expurgo de mocks estáticos de teste caso a VPS possua alunos reais e disparo automático de sincronização remota na inicialização do aplicativo (`App.tsx`) e na montagem do painel (`PainelProfessor.tsx`).
- [x] Opção para o aluno gerar e salvar PDF da ficha completa de treinos (`GeradorPdfTreino.ts`), formatado em layout profissional A4 com cabeçalho oficial, dados do aluno, métricas, divisões organizadas e orientações da professora Sara, 100% offline e sem dependências externas.
- [x] Ocultação automática de badges de tempo de descanso nos exercícios (`.badge-tempo-descanso`) e do cronômetro flutuante no modo desktop (`@media (min-width: 769px)`), mantendo-os ativos exclusivamente no mobile.
- [x] Sincronização exaustiva e bidirecional de fichas de treino entre mobile e desktop:
  - Identificação e correção da causa raiz: `salvarFichaAluno` gravava a ficha apenas no `localStorage` do computador da professora sem persistir na VPS, e o endpoint `/api/alunos` rejeitava tokens com papel `aluno` via `jwtVerify()`, impedindo o celular de receber treinos novos.
  - Implementação de persistência em tempo real via `PUT /api/alunos/:id` com ficha serializada em Base64 UTF-8 seguro (`[SHARA_FICHA_BASE64:...]`) no campo `objetivo_principal`, com decodificação transparente e sem poluição textual.
  - Implementação de persistência relacional com o novo endpoint `POST /api/alunos/:id/ficha` e subquery PostgreSQL com `json_agg` e `json_build_object` em `GET /api/alunos` para divisões e exercícios.
  - Sincronização automática na montagem do `PainelAluno` via `useEffect`, ouvinte do evento global `shara:atualizar_alunos` no `App.tsx` e no `PainelAluno`, e botão discreto de atualização manual ("Atualizar") com animação de giro para o aluno recarregar a qualquer instante.
  - Persistência contínua de anotações de carga e séries concluídas na nuvem com debounce (`agendarSincroniaProgresso`).
- [x] Seleção ergonômica de frequência sugerida no modal de prescrição/edição de treino:
  - Substituição do campo de texto livre por checkboxes dinâmicos correspondentes aos dias que o aluno informou como disponíveis na anamnese (`aluno.anamnese.disponibilidadeTreino`).
  - Ordenação cronológica dos dias (`Segunda` a `Domingo`), formatação automática de texto legível (ex: "Terça e Quinta", "Segunda, Quarta e Sexta") e fallback para todos os dias caso a anamnese não especifique dias.
- [x] Erradicação total de dados operacionais no `localStorage` e operação 100% exclusiva na VPS:
  - Eliminação de `CHAVE_ALUNOS` e `CHAVE_SENHAS`;
  - Remoção de qualquer fallback com mocks estáticos offline (`ALUNOS_EXEMPLO`);
  - Limpeza ativa de resíduos legados de dados locais ao inicializar a aplicação;
  - Todas as leituras e gravações de alunos, treinos, divisões, exercícios, cargas e anamneses passam a operar direta e exclusivamente contra os endpoints da VPS em `matrix.vlfp.com.br`;
  - O navegador retém exclusivamente a credencial JWT ativa, a sessão do usuário conectado e o endpoint configurado.
- [x] Correção do travamento em sincronização infinita e re-login involuntário no botão "Sair":
  - **Deduplicação de sincronizações concorrentes na VPS**: `ServicoArmazenamento.sincronizarAlunosRemoto()` agora implementa trava atômica de Promise compartilhada em voo (`promessaSincronizacaoEmAndamento`), evitando que dezenas de requisições HTTP paralelas sobrecarreguem a rede.
  - **Interrupção do ciclo de renderização perpétuo**: O `PainelAluno.tsx` teve seu `useEffect` estabilizado para carregar a ficha remota estritamente uma única vez na primeira montagem (`carregamentoInicialRef`), e o ouvinte redundante de eventos globais foi removido para seguir o fluxo unidirecional de props originado no container raiz.
  - **Estabilização de callbacks no React**: Em `App.tsx`, as funções `tratarAtualizacaoAluno` e `tratarAtualizacaoAlunoSimulado` foram encapsuladas em `useCallback`, mantendo referências estáveis entre ciclos de renderização e impedindo a recriação desnecessária de efeitos colaterais.
  - **Trava contra retorno involuntário ao clicar em "Sair"**: Adicionada verificação rigorosa pós-fetch em `sincronizarAlunosRemoto()` (`obterSessao()`). Caso o usuário tenha clicado em "Sair" enquanto uma requisição à VPS viajava pela rede, o retorno da resposta descarta a restauração da sessão no armazenamento e bloqueia o disparo de eventos globais de atualização. Da mesma forma, o ouvinte global em `App.tsx` agora assegura o encerramento do estado visual caso nenhuma sessão ativa exista.

## 5. Diretriz Obrigatória de Versionamento e Deploy Contínuo (CI/CD)

- **Commit e Push Imediato no Frontend**:
  - Qualquer alteração realizada nos arquivos do frontend (`src/`, `public/`, `index.html`, estilos, componentes, documentação, etc.) deve ser **imediatamente commitada e enviada via `git push origin main` para o repositório no GitHub** ([https://github.com/vlfpimenta/shara-fit](https://github.com/vlfpimenta/shara-fit)).
  - Essa diretriz assegura o disparo automático do pipeline de deploy contínuo na Vercel a cada intervenção.


