import { ALUNOS_EXEMPLO, PROFESSORA_PADRAO } from '../dados/iniciais';
import { DivisaoTreino, FichaDeTreino, RespostasAnamnese, UsuarioAluno, UsuarioProfessor, UsuarioSessao } from '../tipos';

const CHAVE_ALUNOS = 'shara_ef_alunos_v1';
const CHAVE_SESSAO = 'shara_ef_sessao_v1';
const CHAVE_SENHAS = 'shara_ef_credenciais_v1';
const CHAVE_MODO_SIMULACAO = 'shara_ef_simulacao_aluno_id';
const CHAVE_URL_API = 'shara_ef_url_api_v1';
const CHAVE_PROFESSORA = 'shara_ef_professora_dados_v1';
const CHAVE_TOKEN = 'shara_ef_jwt_token_v1';

const MARCADOR_FICHA_INICIO = '[SHARA_FICHA_BASE64:';
const MARCADOR_FICHA_FIM = ']';

// Utilitários de codificação Base64 com suporte a UTF-8 (acentos, cedilhas, caracteres especiais)
export function codificarBase64Utf8(texto: string): string {
  try {
    return btoa(unescape(encodeURIComponent(texto)));
  } catch {
    return '';
  }
}

export function decodificarBase64Utf8(base64: string): string {
  try {
    return decodeURIComponent(escape(atob(base64)));
  } catch {
    return '';
  }
}

let temporizadorProgresso: ReturnType<typeof setTimeout> | null = null;

export class ServicoArmazenamento {
  // Gerenciamento de Token JWT
  static obterToken(): string | null {
    return localStorage.getItem(CHAVE_TOKEN);
  }

  static salvarToken(token: string): void {
    localStorage.setItem(CHAVE_TOKEN, token);
  }

  static removerToken(): void {
    localStorage.removeItem(CHAVE_TOKEN);
  }

  // Obter URL configurada para a API backend (padrão: matrix.vlfp.com.br)
  static obterUrlApi(): string {
    const configurada = localStorage.getItem(CHAVE_URL_API);
    if (configurada && configurada.trim()) {
      return configurada.trim().replace(/\/+$/, '');
    }
    const envUrl = (import.meta as unknown as { env: { VITE_API_URL?: string } }).env?.VITE_API_URL;
    if (envUrl && envUrl.trim()) {
      return envUrl.trim().replace(/\/+$/, '');
    }
    return 'https://matrix.vlfp.com.br';
  }

  // Definir novo domínio para a API backend
  static definirUrlApi(novaUrl: string): void {
    const urlLimpa = novaUrl.trim().replace(/\/+$/, '');
    localStorage.setItem(CHAVE_URL_API, urlLimpa);
  }

  // Testar conexão com o servidor VPS
  static async testarConexaoApi(urlAlvo?: string): Promise<{ sucesso: boolean; mensagem: string; detalhe?: string }> {
    const base = (urlAlvo || this.obterUrlApi()).replace(/\/+$/, '');
    try {
      const controle = new AbortController();
      const tempoLimite = setTimeout(() => controle.abort(), 6000);

      const resposta = await fetch(`${base}/api/saude`, {
        signal: controle.signal,
        headers: { 'Accept': 'application/json' }
      });
      clearTimeout(tempoLimite);

      if (resposta.ok) {
        const dados = await resposta.json();
        return {
          sucesso: true,
          mensagem: 'Conexão com a VPS estabelecida com sucesso!',
          detalhe: dados.sistema || 'Servidor Shara-EF Online'
        };
      }
      return {
        sucesso: false,
        mensagem: `O servidor respondeu com status ${resposta.status}. Verifique o domínio.`
      };
    } catch (e: unknown) {
      const msgErro = e instanceof Error ? e.message : 'Falha na requisição';
      return {
        sucesso: false,
        mensagem: 'Não foi possível conectar ao servidor na VPS.',
        detalhe: msgErro
      };
    }
  }

  // Inicialização com dados padrão caso o storage esteja vazio
  static inicializar(): void {
    if (!localStorage.getItem(CHAVE_ALUNOS)) {
      localStorage.setItem(CHAVE_ALUNOS, JSON.stringify(ALUNOS_EXEMPLO));
    }
    if (!localStorage.getItem(CHAVE_SENHAS)) {
      const senhasIniciais: Record<string, string> = {
        'mariana@exemplo.com': '123456'
      };
      localStorage.setItem(CHAVE_SENHAS, JSON.stringify(senhasIniciais));
    } else {
      // Limpeza de segurança: remover credenciais padrão prévias
      try {
        const senhasRaw = localStorage.getItem(CHAVE_SENHAS);
        if (senhasRaw) {
          const senhas = JSON.parse(senhasRaw);
          if (senhas['sara@sharaef.com.br'] === 'sara123') {
            delete senhas['sara@sharaef.com.br'];
            localStorage.setItem(CHAVE_SENHAS, JSON.stringify(senhas));
          }
        }
      } catch {}
    }
  }

  // Verificar no banco (VPS) e localmente se há professor(a) cadastrado(a)
  static async verificarStatusProfessora(): Promise<{ configurado: boolean; nome?: string; email?: string }> {
    try {
      const urlApi = this.obterUrlApi();
      const controle = new AbortController();
      const tempoLimite = setTimeout(() => controle.abort(), 4000);
      const resposta = await fetch(`${urlApi}/api/auth/professor/status`, {
        signal: controle.signal,
        headers: { 'Accept': 'application/json' }
      });
      clearTimeout(tempoLimite);

      if (resposta.ok) {
        const dados = await resposta.json();
        if (dados.configurado && dados.email) {
          const profConfigurada: UsuarioProfessor = {
            id: 'prof-sara-1',
            papel: 'professor',
            nome: dados.nome || 'Sara',
            email: dados.email.trim().toLowerCase(),
            cref: '012345-G/SP'
          };
          localStorage.setItem(CHAVE_PROFESSORA, JSON.stringify(profConfigurada));
        }
        return {
          configurado: Boolean(dados.configurado),
          nome: dados.nome,
          email: dados.email
        };
      }
    } catch {
      // Em caso de falha de conexão à VPS, consulta se há credencial local válida
    }

    const profSalva = localStorage.getItem(CHAVE_PROFESSORA);
    const senhasRaw = localStorage.getItem(CHAVE_SENHAS);
    const senhas: Record<string, string> = senhasRaw ? JSON.parse(senhasRaw) : {};

    if (profSalva) {
      try {
        const p = JSON.parse(profSalva);
        if (p.email && senhas[p.email.toLowerCase()]) {
          return { configurado: true, nome: p.nome, email: p.email };
        }
      } catch {}
    }

    return { configurado: false };
  }

  // Obter dados cadastrais da professora (personalizado ou padrão)
  static obterDadosProfessora(): UsuarioProfessor {
    try {
      const dados = localStorage.getItem(CHAVE_PROFESSORA);
      return dados ? JSON.parse(dados) : PROFESSORA_PADRAO;
    } catch {
      return PROFESSORA_PADRAO;
    }
  }

  // Configurar credenciais personalizadas da professora (Primeiro acesso ou alteração)
  static async configurarCredenciaisProfessora(
    nome: string,
    email: string,
    senhaPlana: string
  ): Promise<{ sucesso: boolean; mensagem: string; usuario?: UsuarioProfessor }> {
    this.inicializar();
    const emailLimpo = email.trim().toLowerCase();
    const nomeFinal = nome.trim() || 'Sara';

    const professorAtualizado: UsuarioProfessor = {
      id: 'prof-sara-1',
      papel: 'professor',
      nome: nomeFinal,
      email: emailLimpo,
      cref: '012345-G/SP'
    };

    // 1. Sincronizar na VPS
    try {
      const urlApi = this.obterUrlApi();
      await fetch(`${urlApi}/api/auth/professor/configurar-credenciais`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nome: nomeFinal, email: emailLimpo, senha: senhaPlana })
      });
    } catch {
      // Fallback offline
    }

    // 2. Salvar credencial e perfil local
    const senhasRaw = localStorage.getItem(CHAVE_SENHAS);
    const senhas: Record<string, string> = senhasRaw ? JSON.parse(senhasRaw) : {};
    senhas[emailLimpo] = senhaPlana;
    localStorage.setItem(CHAVE_SENHAS, JSON.stringify(senhas));
    localStorage.setItem(CHAVE_PROFESSORA, JSON.stringify(professorAtualizado));

    this.definirSessao(professorAtualizado);
    this.desativarModoSimulacao();

    return {
      sucesso: true,
      mensagem: `Credenciais da professora ${nomeFinal} configuradas com sucesso!`,
      usuario: professorAtualizado
    };
  }

  // Sincronizar lista de alunos da VPS com o armazenamento local
  static async sincronizarAlunosRemoto(): Promise<UsuarioAluno[]> {
    this.inicializar();
    try {
      const urlApi = this.obterUrlApi();
      const token = this.obterToken();
      const sessaoAtual = this.obterSessao();
      let profAtual = this.obterDadosProfessora();

      // Garantir e-mail válido da professora na VPS
      let emailProf = profAtual?.email;
      if (!emailProf || emailProf === 'sara@sharaef.com.br') {
        const status = await this.verificarStatusProfessora();
        if (status?.email) {
          emailProf = status.email;
          profAtual = this.obterDadosProfessora();
        } else {
          emailProf = 'saramilk1234@gmail.com';
        }
      }

      const headers: Record<string, string> = {
        'Accept': 'application/json'
      };
      // Apenas envia o token no header Authorization se for professor(a),
      // pois o endpoint /api/alunos da VPS aceita requisições com x-professor-email para leitura
      if (token && sessaoAtual?.papel === 'professor') {
        headers['Authorization'] = `Bearer ${token}`;
      }
      if (emailProf) {
        headers['x-professor-email'] = emailProf;
      }

      const controle = new AbortController();
      const tempoLimite = setTimeout(() => controle.abort(), 8000);
      const resposta = await fetch(`${urlApi}/api/alunos`, {
        headers,
        signal: controle.signal
      });
      clearTimeout(tempoLimite);

      if (resposta.ok) {
        const dados = await resposta.json();
        if (dados.sucesso && Array.isArray(dados.alunos)) {
          const alunosRemotos: UsuarioAluno[] = dados.alunos;
          const alunosLocais = this.obterAlunos();
          const mapaLocais = new Map(alunosLocais.map((a) => [a.id, a]));
          const mapaEmails = new Map(alunosLocais.map((a) => [a.email.toLowerCase(), a]));

          // Mesclar decodificando fichas persistidas remotamente e preservando integridade
          const alunosSincronizados: UsuarioAluno[] = alunosRemotos.map((remoto) => {
            const local = mapaLocais.get(remoto.id) || mapaEmails.get(remoto.email.toLowerCase());

            let fichaEmbutida: FichaDeTreino | undefined = undefined;

            // 1. Extrair ficha embutida no objetivoPrincipal caso presente
            if (remoto.anamnese?.objetivoPrincipal && remoto.anamnese.objetivoPrincipal.includes(MARCADOR_FICHA_INICIO)) {
              const partes = remoto.anamnese.objetivoPrincipal.split(MARCADOR_FICHA_INICIO);
              const objetivoLimpo = partes[0].trim();
              const resto = partes[1];
              const indiceFim = resto.indexOf(MARCADOR_FICHA_FIM);
              if (indiceFim !== -1) {
                const b64 = resto.substring(0, indiceFim).trim();
                const jsonFicha = decodificarBase64Utf8(b64);
                if (jsonFicha) {
                  try {
                    fichaEmbutida = JSON.parse(jsonFicha);
                  } catch (e) {
                    console.warn('Erro ao interpretar ficha serializada:', e);
                  }
                }
              }
              remoto.anamnese.objetivoPrincipal = objetivoLimpo || 'Condicionamento';
            }

            // Ficha remota relacional > ficha remota embutida > ficha local
            const fichaFinal = (remoto.fichaAtiva?.divisoes && remoto.fichaAtiva.divisoes.length > 0)
              ? remoto.fichaAtiva
              : (fichaEmbutida || remoto.fichaAtiva || local?.fichaAtiva);

            const statusFinal =
              fichaFinal && fichaFinal.divisoes && fichaFinal.divisoes.length > 0 && remoto.status === 'aguardando_ficha'
                ? 'ativo'
                : remoto.status;

            return {
              ...remoto,
              status: statusFinal,
              fichaAtiva: fichaFinal
            };
          });

          // Preservar alunos locais criados offline (excluindo os mocks padrão se a VPS já tiver dados reais)
          const idsMocksPadrao = new Set(['aluno-demo-1', 'aluno-demo-2', 'aluno-demo-3']);
          for (const local of alunosLocais) {
            // Se já existem alunos reais na VPS, não reinserir os mocks padrão de teste
            if (alunosRemotos.length > 0 && idsMocksPadrao.has(local.id)) {
              continue;
            }
            const jaExiste = alunosSincronizados.some(
              (s) => s.id === local.id || s.email.toLowerCase() === local.email.toLowerCase()
            );
            if (!jaExiste) {
              alunosSincronizados.push(local);
            }
          }

          this.salvarAlunos(alunosSincronizados);

          // Atualizar sessão ativa do aluno com os dados mais recentes da ficha
          if (sessaoAtual && sessaoAtual.papel === 'aluno') {
            const alunoSessaoAtualizado = alunosSincronizados.find(
              (a) => a.id === sessaoAtual.id || a.email.toLowerCase() === sessaoAtual.email.toLowerCase()
            );
            if (alunoSessaoAtualizado) {
              this.definirSessao(alunoSessaoAtualizado);
            }
          }

          // Notificar ouvintes do React
          window.dispatchEvent(new CustomEvent('shara:atualizar_alunos', { detail: { alunos: alunosSincronizados } }));
          return alunosSincronizados;
        }
      }
    } catch (erro) {
      console.warn('Falha na sincronização remota com a VPS:', erro);
    }

    return this.obterAlunos();
  }

  // Obter todos os alunos cadastrados
  static obterAlunos(): UsuarioAluno[] {
    this.inicializar();
    try {
      const dados = localStorage.getItem(CHAVE_ALUNOS);
      return dados ? JSON.parse(dados) : ALUNOS_EXEMPLO;
    } catch {
      return ALUNOS_EXEMPLO;
    }
  }

  // Salvar lista de alunos
  static salvarAlunos(alunos: UsuarioAluno[]): void {
    localStorage.setItem(CHAVE_ALUNOS, JSON.stringify(alunos));
  }

  // Obter um aluno específico por ID
  static obterAlunoPorId(id: string): UsuarioAluno | undefined {
    const alunos = this.obterAlunos();
    return alunos.find((a) => a.id === id);
  }

  // Obter aluno por e-mail
  static obterAlunoPorEmail(email: string): UsuarioAluno | undefined {
    const alunos = this.obterAlunos();
    return alunos.find((a) => a.email.toLowerCase() === email.toLowerCase());
  }

  // Cadastrar novo aluno com anamnese e senha (sincroniza com VPS e salva localmente)
  static async cadastrarNovoAluno(
    anamnese: RespostasAnamnese,
    email: string,
    senhaPlana: string
  ): Promise<{ sucesso: boolean; mensagem: string; aluno?: UsuarioAluno }> {
    this.inicializar();
    const alunos = this.obterAlunos();
    const emailLimpo = email.trim().toLowerCase();

    // Validar se e-mail pertence à professora
    if (emailLimpo === PROFESSORA_PADRAO.email.toLowerCase()) {
      return { sucesso: false, mensagem: 'Este e-mail pertence à administração da professora Sara.' };
    }

    if (alunos.some((a) => a.email.toLowerCase() === emailLimpo)) {
      return { sucesso: false, mensagem: 'Já existe um aluno cadastrado com este e-mail. Utilize a opção de login.' };
    }

    const novoAluno: UsuarioAluno = {
      id: 'aluno-' + Date.now(),
      papel: 'aluno',
      nome: anamnese.nome.trim() || 'Novo Aluno',
      email: emailLimpo,
      dataCadastro: new Date().toISOString().split('T')[0],
      status: 'aguardando_ficha',
      anamnese: {
        ...anamnese,
        dataPreenchimento: new Date().toISOString().split('T')[0]
      }
    };

    // Tentar sincronizar com o backend na VPS
    try {
      const urlApi = this.obterUrlApi();
      const resposta = await fetch(`${urlApi}/api/alunos/cadastrar`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ anamnese, email: emailLimpo, senha: senhaPlana })
      });

      if (resposta.ok) {
        const dadosApi = await resposta.json();
        if (dadosApi.token) {
          this.salvarToken(dadosApi.token);
        }
        if (dadosApi.usuario?.id) {
          novoAluno.id = dadosApi.usuario.id;
        }
      }
    } catch {
      // Se a VPS estiver inacessível no momento, o cadastro continua funcional no modo local offline
    }

    alunos.push(novoAluno);
    this.salvarAlunos(alunos);

    // Salvar credencial local
    const senhasRaw = localStorage.getItem(CHAVE_SENHAS);
    const senhas: Record<string, string> = senhasRaw ? JSON.parse(senhasRaw) : {};
    senhas[emailLimpo] = senhaPlana;
    localStorage.setItem(CHAVE_SENHAS, JSON.stringify(senhas));

    return { sucesso: true, mensagem: 'Cadastro realizado com sucesso!', aluno: novoAluno };
  }

  // Atualizar ou prescrever ficha de treino de um aluno
  static async salvarFichaAluno(
    alunoId: string,
    divisoes: DivisaoTreino[],
    titulo: string,
    observacoes?: string
  ): Promise<boolean> {
    const alunos = this.obterAlunos();
    const index = alunos.findIndex((a) => a.id === alunoId);
    if (index === -1) return false;

    const novaFicha: FichaDeTreino = {
      id: 'ficha-' + Date.now(),
      alunoId,
      titulo,
      observacoesGerais: observacoes,
      dataCriacao: new Date().toISOString().split('T')[0],
      divisoes,
      ativa: true
    };

    alunos[index].fichaAtiva = novaFicha;
    alunos[index].status = 'ativo';
    this.salvarAlunos(alunos);

    const sessaoAtual = this.obterSessao();
    if (sessaoAtual && sessaoAtual.id === alunoId) {
      this.definirSessao(alunos[index]);
    }

    // Persistência em nuvem (VPS)
    try {
      const urlApi = this.obterUrlApi();
      const alunoAtual = alunos[index];

      // 1. Persistir via PUT /api/alunos/:id com a ficha serializada em Base64 no objetivoPrincipal
      const objetivoBase = (alunoAtual.anamnese?.objetivoPrincipal || 'Condicionamento')
        .split(MARCADOR_FICHA_INICIO)[0]
        .trim();
      const fichaBase64 = codificarBase64Utf8(JSON.stringify(novaFicha));
      const objetivoSerializado = `${objetivoBase}\n${MARCADOR_FICHA_INICIO}${fichaBase64}${MARCADOR_FICHA_FIM}`;

      await fetch(`${urlApi}/api/alunos/${alunoId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: 'ativo',
          objetivoPrincipal: objetivoSerializado
        })
      });

      // 2. Persistir via POST /api/alunos/:id/ficha (para backend relacional)
      await fetch(`${urlApi}/api/alunos/${alunoId}/ficha`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          titulo,
          observacoesGerais: observacoes,
          divisoes
        })
      }).catch(() => {});

      window.dispatchEvent(new CustomEvent('shara:atualizar_alunos'));
    } catch (erro) {
      console.warn('Falha na persistência remota da ficha (salvo no cache local):', erro);
    }

    return true;
  }

  // Agendar sincronização assíncrona de progresso de treino com a nuvem (debounce)
  private static agendarSincroniaProgresso(aluno: UsuarioAluno): void {
    if (temporizadorProgresso) {
      clearTimeout(temporizadorProgresso);
    }

    temporizadorProgresso = setTimeout(async () => {
      try {
        if (!aluno.fichaAtiva) return;
        const urlApi = this.obterUrlApi();
        const objetivoBase = (aluno.anamnese?.objetivoPrincipal || 'Condicionamento')
          .split(MARCADOR_FICHA_INICIO)[0]
          .trim();
        const fichaBase64 = codificarBase64Utf8(JSON.stringify(aluno.fichaAtiva));
        const objetivoSerializado = `${objetivoBase}\n${MARCADOR_FICHA_INICIO}${fichaBase64}${MARCADOR_FICHA_FIM}`;

        await fetch(`${urlApi}/api/alunos/${aluno.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            objetivoPrincipal: objetivoSerializado
          })
        });
      } catch (e) {
        console.warn('Falha ao sincronizar progresso na nuvem:', e);
      }
    }, 1500);
  }

  // Atualizar progresso do treino
  static atualizarProgressoExercicio(
    alunoId: string,
    divisaoId: string,
    exercicioId: string,
    indiceSerie: number,
    concluida: boolean,
    cargaRegistrada?: string
  ): void {
    const alunos = this.obterAlunos();
    const aluno = alunos.find((a) => a.id === alunoId);
    if (!aluno || !aluno.fichaAtiva) return;

    const divisao = aluno.fichaAtiva.divisoes.find((d) => d.id === divisaoId);
    if (!divisao) return;

    const exercicio = divisao.exercicios.find((e) => e.id === exercicioId);
    if (!exercicio) return;

    if (!exercicio.seriesConcluidas) {
      exercicio.seriesConcluidas = new Array(exercicio.series).fill(false);
    }
    exercicio.seriesConcluidas[indiceSerie] = concluida;

    if (cargaRegistrada !== undefined) {
      if (!exercicio.cargasRegistradas) {
        exercicio.cargasRegistradas = new Array(exercicio.series).fill('');
      }
      exercicio.cargasRegistradas[indiceSerie] = cargaRegistrada;
    }

    this.salvarAlunos(alunos);

    const sessaoAtual = this.obterSessao();
    if (sessaoAtual && sessaoAtual.id === alunoId) {
      this.definirSessao(aluno);
    }

    // Persistir progresso na nuvem assincronamente
    this.agendarSincroniaProgresso(aluno);
  }

  // Autenticação de usuário (tenta API da VPS e possui fallback local)
  static async autenticar(email: string, senha: string): Promise<{ sucesso: boolean; mensagem: string; usuario?: UsuarioSessao }> {
    this.inicializar();
    const emailLimpo = email.trim().toLowerCase();

    // 1. Tentar autenticação remota na VPS
    try {
      const urlApi = this.obterUrlApi();
      const resposta = await fetch(`${urlApi}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: emailLimpo, senha })
      });

      if (resposta.ok) {
        const dados = await resposta.json();
        if (dados.token) {
          this.salvarToken(dados.token);
        }
        if (dados.usuario) {
          if (dados.usuario.papel === 'professor') {
            const profAtualizada: UsuarioProfessor = {
              id: dados.usuario.id || 'prof-sara-1',
              papel: 'professor',
              nome: dados.usuario.nome || 'Sara',
              email: dados.usuario.email.trim().toLowerCase(),
              cref: dados.usuario.cref || '012345-G/SP'
            };
            localStorage.setItem(CHAVE_PROFESSORA, JSON.stringify(profAtualizada));
            this.definirSessao(profAtualizada);
            this.desativarModoSimulacao();
            await this.sincronizarAlunosRemoto();
            return { sucesso: true, mensagem: dados.mensagem, usuario: profAtualizada };
          } else {
            // Login de Aluno: sincroniza com a VPS para obter anamnese e ficha completas
            await this.sincronizarAlunosRemoto();
            const alunoCompleto = this.obterAlunoPorEmail(emailLimpo) || {
              id: dados.usuario.id,
              papel: 'aluno',
              nome: dados.usuario.nome,
              email: dados.usuario.email,
              dataCadastro: dados.usuario.data_cadastro || new Date().toISOString().split('T')[0],
              status: dados.usuario.status || 'aguardando_ficha',
              anamnese: dados.usuario.anamnese || {
                nome: dados.usuario.nome,
                idade: '30',
                contato: '',
                peso: '70',
                altura: '170',
                relacaoAtividade: '',
                possuiRestricaoMedica: 'Não',
                possuiLesaoDorCronica: 'Não',
                possuiDoenca: [],
                disponibilidadeTreino: [],
                historicoTreino: '',
                nivelConhecimentoTreino: 5,
                objetivoPrincipal: 'Condicionamento',
                localTreino: 'Academia',
                dataPreenchimento: new Date().toISOString().split('T')[0]
              }
            };
            this.definirSessao(alunoCompleto);
            this.desativarModoSimulacao();
            return { sucesso: true, mensagem: dados.mensagem, usuario: alunoCompleto };
          }
        }
      }
    } catch {
      // Fallback para autenticação local
    }

    // 2. Fallback de autenticação local (para suporte PWA offline)
    const senhasRaw = localStorage.getItem(CHAVE_SENHAS);
    const senhas: Record<string, string> = senhasRaw ? JSON.parse(senhasRaw) : {};
    const profAtual = this.obterDadosProfessora();

    if (emailLimpo === profAtual.email.toLowerCase()) {
      const senhaCorreta = senhas[emailLimpo] || senhas[profAtual.email.toLowerCase()];
      if (!senhaCorreta) {
        return { sucesso: false, mensagem: 'Nenhuma credencial de professora configurada. Realize o cadastro inicial.' };
      }
      if (senha === senhaCorreta) {
        this.definirSessao(profAtual);
        this.desativarModoSimulacao();
        return { sucesso: true, mensagem: `Bem-vinda, Professora ${profAtual.nome}!`, usuario: profAtual };
      }
      return { sucesso: false, mensagem: 'Senha incorreta para a conta da Professora.' };
    }

    const aluno = this.obterAlunoPorEmail(emailLimpo);
    if (!aluno) {
      return { sucesso: false, mensagem: 'E-mail não encontrado. Caso seja seu primeiro acesso, cadastre-se em Novo Aluno.' };
    }

    if (aluno.status === 'inativo') {
      return { sucesso: false, mensagem: 'Seu acesso foi desativado pela professora. Entre em contato para reativação.' };
    }

    const senhaArmazenada = senhas[emailLimpo];
    if (!senhaArmazenada || senhaArmazenada !== senha) {
      return { sucesso: false, mensagem: 'Senha de aluno incorreta.' };
    }

    this.definirSessao(aluno);
    this.desativarModoSimulacao();
    return { sucesso: true, mensagem: `Olá, ${aluno.nome}! Bom treino.`, usuario: aluno };
  }

  // --------------------------------------------------------------------------
  // Gestão de Alunos (Editar, Desativar / Reativar Acesso e Excluir)
  // --------------------------------------------------------------------------

  // Atualizar dados cadastrais do aluno
  static async atualizarDadosAluno(
    alunoId: string,
    dadosAtualizados: {
      nome?: string;
      email?: string;
      status?: 'ativo' | 'inativo' | 'aguardando_ficha';
      contato?: string;
      idade?: string;
      peso?: string;
      altura?: string;
      objetivoPrincipal?: string;
    }
  ): Promise<{ sucesso: boolean; mensagem: string }> {
    const alunos = this.obterAlunos();
    const index = alunos.findIndex((a) => a.id === alunoId);
    if (index === -1) {
      return { sucesso: false, mensagem: 'Aluno não encontrado.' };
    }

    const aluno = alunos[index];
    if (dadosAtualizados.nome) {
      aluno.nome = dadosAtualizados.nome.trim();
      aluno.anamnese.nome = dadosAtualizados.nome.trim();
    }
    if (dadosAtualizados.email) {
      const emailAntigo = aluno.email.toLowerCase();
      const emailNovo = dadosAtualizados.email.trim().toLowerCase();
      const senhasRaw = localStorage.getItem(CHAVE_SENHAS);
      if (senhasRaw) {
        const senhas = JSON.parse(senhasRaw);
        if (senhas[emailAntigo]) {
          senhas[emailNovo] = senhas[emailAntigo];
          delete senhas[emailAntigo];
          localStorage.setItem(CHAVE_SENHAS, JSON.stringify(senhas));
        }
      }
      aluno.email = emailNovo;
    }
    if (dadosAtualizados.status) {
      aluno.status = dadosAtualizados.status;
    }
    if (dadosAtualizados.contato) aluno.anamnese.contato = dadosAtualizados.contato.trim();
    if (dadosAtualizados.idade) aluno.anamnese.idade = dadosAtualizados.idade.trim();
    if (dadosAtualizados.peso) aluno.anamnese.peso = dadosAtualizados.peso.trim();
    if (dadosAtualizados.altura) aluno.anamnese.altura = dadosAtualizados.altura.trim();
    if (dadosAtualizados.objetivoPrincipal) aluno.anamnese.objetivoPrincipal = dadosAtualizados.objetivoPrincipal.trim();

    alunos[index] = aluno;
    this.salvarAlunos(alunos);

    const sessao = this.obterSessao();
    if (sessao && sessao.id === alunoId) {
      this.definirSessao(aluno);
    }

    try {
      const urlApi = this.obterUrlApi();
      await fetch(`${urlApi}/api/alunos/${alunoId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dadosAtualizados)
      });
    } catch {}

    return { sucesso: true, mensagem: 'Dados do aluno atualizados com sucesso!' };
  }

  // Alternar status (ativar / desativar acesso)
  static async alternarStatusAluno(
    alunoId: string,
    novoStatus: 'ativo' | 'inativo' | 'aguardando_ficha'
  ): Promise<{ sucesso: boolean; mensagem: string }> {
    const alunos = this.obterAlunos();
    const index = alunos.findIndex((a) => a.id === alunoId);
    if (index === -1) {
      return { sucesso: false, mensagem: 'Aluno não encontrado.' };
    }

    alunos[index].status = novoStatus;
    this.salvarAlunos(alunos);

    try {
      const urlApi = this.obterUrlApi();
      await fetch(`${urlApi}/api/alunos/${alunoId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: novoStatus })
      });
    } catch {}

    return {
      sucesso: true,
      mensagem: novoStatus === 'inativo' ? 'Acesso do aluno desativado.' : 'Acesso do aluno ativado.'
    };
  }

  // Excluir aluno definitivamente
  static async excluirAluno(alunoId: string): Promise<{ sucesso: boolean; mensagem: string }> {
    const alunos = this.obterAlunos();
    const aluno = alunos.find((a) => a.id === alunoId);
    if (!aluno) {
      return { sucesso: false, mensagem: 'Aluno não encontrado.' };
    }

    const novosAlunos = alunos.filter((a) => a.id !== alunoId);
    this.salvarAlunos(novosAlunos);

    try {
      const senhasRaw = localStorage.getItem(CHAVE_SENHAS);
      if (senhasRaw) {
        const senhas = JSON.parse(senhasRaw);
        delete senhas[aluno.email.toLowerCase()];
        localStorage.setItem(CHAVE_SENHAS, JSON.stringify(senhas));
      }
    } catch {}

    if (localStorage.getItem(CHAVE_MODO_SIMULACAO) === alunoId) {
      this.desativarModoSimulacao();
    }

    const sessao = this.obterSessao();
    if (sessao && sessao.id === alunoId) {
      this.encerrarSessao();
    }

    try {
      const urlApi = this.obterUrlApi();
      await fetch(`${urlApi}/api/alunos/${alunoId}`, {
        method: 'DELETE'
      });
    } catch {}

    return { sucesso: true, mensagem: 'Aluno excluído com sucesso.' };
  }

  // Gerenciamento de sessão
  static obterSessao(): UsuarioSessao | null {
    try {
      const dados = localStorage.getItem(CHAVE_SESSAO);
      return dados ? JSON.parse(dados) : null;
    } catch {
      return null;
    }
  }

  static definirSessao(usuario: UsuarioSessao): void {
    localStorage.setItem(CHAVE_SESSAO, JSON.stringify(usuario));
  }

  static encerrarSessao(): void {
    localStorage.removeItem(CHAVE_SESSAO);
    this.removerToken();
    this.desativarModoSimulacao();
  }

  // Modo Simulação (Sara visualizando como um aluno específico)
  static ativarModoSimulacao(alunoId: string): void {
    localStorage.setItem(CHAVE_MODO_SIMULACAO, alunoId);
  }

  static obterAlunoSimulado(): UsuarioAluno | null {
    const id = localStorage.getItem(CHAVE_MODO_SIMULACAO);
    if (!id) return null;
    return this.obterAlunoPorId(id) || null;
  }

  static desativarModoSimulacao(): void {
    localStorage.removeItem(CHAVE_MODO_SIMULACAO);
  }
}
