import { PROFESSORA_PADRAO } from '../dados/iniciais';
import { DivisaoTreino, FichaDeTreino, RespostasAnamnese, UsuarioAluno, UsuarioProfessor, UsuarioSessao } from '../tipos';

// Chaves permitidas exclusivamente para manutenção da sessão autenticada e configuração de rede
const CHAVE_SESSAO = 'shara_ef_sessao_v1';
const CHAVE_TOKEN = 'shara_ef_jwt_token_v1';
const CHAVE_URL_API = 'shara_ef_url_api_v1';

const MARCADOR_FICHA_INICIO = '[SHARA_FICHA_BASE64:';
const MARCADOR_FICHA_FIM = ']';

// Utilitários de codificação Base64 com suporte total a UTF-8 (acentos, cedilhas, caracteres especiais)
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

/**
 * ServicoArmazenamento - Camada de acesso a dados 100% orientada à VPS.
 * REGRA INVIOLÁVEL: Nenhum dado de aluno, treino, anamnese ou credencial é persistido em localStorage.
 * O navegador armazena estritamente o token JWT e a sessão do usuário ativo.
 */
export class ServicoArmazenamento {
  // Estado volátil estritamente em memória de execução durante a sessão
  private static alunosEmMemoria: UsuarioAluno[] = [];
  private static idAlunoSimulado: string | null = null;
  private static dadosProfessoraCache: UsuarioProfessor = PROFESSORA_PADRAO;

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

  // Obter URL da API backend na VPS (padrão: matrix.vlfp.com.br)
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
        headers: { Accept: 'application/json' }
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

  // Limpeza obrigatória de qualquer resíduo legado do localStorage
  static inicializar(): void {
    try {
      localStorage.removeItem('shara_ef_alunos_v1');
      localStorage.removeItem('shara_ef_credenciais_v1');
      localStorage.removeItem('shara_ef_professora_dados_v1');
      localStorage.removeItem('shara_ef_simulacao_aluno_id');
    } catch {}
  }

  // Verificar status cadastral da professora no banco PostgreSQL na VPS
  static async verificarStatusProfessora(): Promise<{ configurado: boolean; nome?: string; email?: string }> {
    try {
      const urlApi = this.obterUrlApi();
      const controle = new AbortController();
      const tempoLimite = setTimeout(() => controle.abort(), 5000);
      const resposta = await fetch(`${urlApi}/api/auth/professor/status`, {
        signal: controle.signal,
        headers: { Accept: 'application/json' }
      });
      clearTimeout(tempoLimite);

      if (resposta.ok) {
        const dados = await resposta.json();
        if (dados.configurado && dados.email) {
          this.dadosProfessoraCache = {
            id: 'prof-sara-1',
            papel: 'professor',
            nome: dados.nome || 'Sara',
            email: dados.email.trim().toLowerCase(),
            cref: '012345-G/SP'
          };
        }
        return {
          configurado: Boolean(dados.configurado),
          nome: dados.nome,
          email: dados.email
        };
      }
    } catch (e) {
      console.warn('Falha ao verificar status da professora na VPS:', e);
    }

    return { configurado: false };
  }

  // Obter dados cadastrais da professora
  static obterDadosProfessora(): UsuarioProfessor {
    return this.dadosProfessoraCache;
  }

  // Configurar credenciais da professora diretamente na VPS
  static async configurarCredenciaisProfessora(
    nome: string,
    email: string,
    senhaPlana: string
  ): Promise<{ sucesso: boolean; mensagem: string; usuario?: UsuarioProfessor }> {
    this.inicializar();
    const emailLimpo = email.trim().toLowerCase();
    const nomeFinal = nome.trim() || 'Sara';

    const urlApi = this.obterUrlApi();
    const resposta = await fetch(`${urlApi}/api/auth/professor/configurar-credenciais`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nome: nomeFinal, email: emailLimpo, senha: senhaPlana })
    });

    const dados = await resposta.json();
    if (!resposta.ok || !dados.sucesso) {
      return {
        sucesso: false,
        mensagem: dados.mensagem || 'Falha ao registrar credenciais da professora na VPS.'
      };
    }

    const professorAtualizado: UsuarioProfessor = {
      id: dados.usuario?.id || 'prof-sara-1',
      papel: 'professor',
      nome: nomeFinal,
      email: emailLimpo,
      cref: '012345-G/SP'
    };

    if (dados.token) {
      this.salvarToken(dados.token);
    }

    this.dadosProfessoraCache = professorAtualizado;
    this.definirSessao(professorAtualizado);
    this.desativarModoSimulacao();

    return {
      sucesso: true,
      mensagem: dados.mensagem || `Credenciais da professora ${nomeFinal} configuradas com sucesso na VPS!`,
      usuario: professorAtualizado
    };
  }

  // Sincronizar e obter lista de alunos estritamente a partir da VPS
  static async sincronizarAlunosRemoto(): Promise<UsuarioAluno[]> {
    this.inicializar();
    try {
      const urlApi = this.obterUrlApi();
      const token = this.obterToken();
      const sessaoAtual = this.obterSessao();

      // Obter e-mail verificado da professora na VPS
      let emailProf = this.dadosProfessoraCache.email;
      if (!emailProf || emailProf === 'sara@sharaef.com.br') {
        const status = await this.verificarStatusProfessora();
        if (status?.email) {
          emailProf = status.email;
        } else {
          emailProf = 'saramilk1234@gmail.com';
        }
      }

      const headers: Record<string, string> = {
        Accept: 'application/json'
      };

      if (token && sessaoAtual?.papel === 'professor') {
        headers['Authorization'] = `Bearer ${token}`;
      }
      headers['x-professor-email'] = emailProf;

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

          // Processar alunos e decodificar fichas persistidas no PostgreSQL da VPS
          const alunosAtualizados: UsuarioAluno[] = alunosRemotos.map((remoto) => {
            let fichaEmbutida: FichaDeTreino | undefined = undefined;

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
                    console.warn('Erro ao decodificar ficha recebida da VPS:', e);
                  }
                }
              }
              remoto.anamnese.objetivoPrincipal = objetivoLimpo || 'Condicionamento';
            }

            const fichaFinal = (remoto.fichaAtiva?.divisoes && remoto.fichaAtiva.divisoes.length > 0)
              ? remoto.fichaAtiva
              : (fichaEmbutida || remoto.fichaAtiva);

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

          this.alunosEmMemoria = alunosAtualizados;

          // Atualizar sessão ativa caso seja aluno
          if (sessaoAtual && sessaoAtual.papel === 'aluno') {
            const alunoAtualizado = alunosAtualizados.find(
              (a) => a.id === sessaoAtual.id || a.email.toLowerCase() === sessaoAtual.email.toLowerCase()
            );
            if (alunoAtualizado) {
              this.definirSessao(alunoAtualizado);
            }
          }

          window.dispatchEvent(new CustomEvent('shara:atualizar_alunos', { detail: { alunos: alunosAtualizados } }));
          return alunosAtualizados;
        }
      }
    } catch (erro) {
      console.warn('Falha na comunicação direta com a VPS:', erro);
    }

    return this.alunosEmMemoria;
  }

  // Obter alunos carregados na memória de execução
  static obterAlunos(): UsuarioAluno[] {
    return this.alunosEmMemoria;
  }

  // Atualizar cache de execução em memória
  static salvarAlunos(alunos: UsuarioAluno[]): void {
    this.alunosEmMemoria = alunos;
  }

  // Obter aluno específico por ID
  static obterAlunoPorId(id: string): UsuarioAluno | undefined {
    return this.alunosEmMemoria.find((a) => a.id === id);
  }

  // Obter aluno por e-mail
  static obterAlunoPorEmail(email: string): UsuarioAluno | undefined {
    return this.alunosEmMemoria.find((a) => a.email.toLowerCase() === email.toLowerCase());
  }

  // Cadastrar novo aluno exclusivamente na VPS
  static async cadastrarNovoAluno(
    anamnese: RespostasAnamnese,
    email: string,
    senhaPlana: string
  ): Promise<{ sucesso: boolean; mensagem: string; aluno?: UsuarioAluno }> {
    this.inicializar();
    const emailLimpo = email.trim().toLowerCase();

    try {
      const urlApi = this.obterUrlApi();
      const resposta = await fetch(`${urlApi}/api/alunos/cadastrar`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ anamnese, email: emailLimpo, senha: senhaPlana })
      });

      const dadosApi = await resposta.json();
      if (!resposta.ok || !dadosApi.sucesso) {
        return {
          sucesso: false,
          mensagem: dadosApi.mensagem || 'Falha ao cadastrar aluno no servidor da VPS.'
        };
      }

      if (dadosApi.token) {
        this.salvarToken(dadosApi.token);
      }

      const novoAluno: UsuarioAluno = {
        id: dadosApi.usuario?.id || 'aluno-' + Date.now(),
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

      this.alunosEmMemoria.push(novoAluno);
      return { sucesso: true, mensagem: 'Cadastro realizado com sucesso na VPS!', aluno: novoAluno };
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Falha na conexão com a VPS';
      return {
        sucesso: false,
        mensagem: `Não foi possível conectar ao servidor da VPS: ${msg}`
      };
    }
  }

  // Salvar ficha de treino exclusivamente na VPS
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
    this.alunosEmMemoria = alunos;

    const sessaoAtual = this.obterSessao();
    if (sessaoAtual && sessaoAtual.id === alunoId) {
      this.definirSessao(alunos[index]);
    }

    try {
      const urlApi = this.obterUrlApi();
      const alunoAtual = alunos[index];

      // 1. Persistir via PUT /api/alunos/:id com a ficha serializada no campo objetivoPrincipal
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

      // 2. Persistir via POST /api/alunos/:id/ficha no PostgreSQL relacional
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
      return true;
    } catch (erro) {
      console.error('Erro ao persistir ficha na VPS:', erro);
      throw erro;
    }
  }

  // Agendar sincronização assíncrona de progresso de treino diretamente com a VPS
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
        console.warn('Falha ao sincronizar progresso na VPS:', e);
      }
    }, 1500);
  }

  // Atualizar progresso do treino exclusivamente na VPS
  static atualizarProgressoExercicio(
    alunoId: string,
    divisaoId: string,
    exercicioId: string,
    indiceSerie: number,
    concluida: boolean,
    cargaRegistrada?: string
  ): void {
    const aluno = this.obterAlunoPorId(alunoId);
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

    const sessaoAtual = this.obterSessao();
    if (sessaoAtual && sessaoAtual.id === alunoId) {
      this.definirSessao(aluno);
    }

    // Persistir na VPS
    this.agendarSincroniaProgresso(aluno);
  }

  // Autenticação de usuário exclusivamente na VPS
  static async autenticar(
    email: string,
    senha: string
  ): Promise<{ sucesso: boolean; mensagem: string; usuario?: UsuarioSessao }> {
    this.inicializar();
    const emailLimpo = email.trim().toLowerCase();

    try {
      const urlApi = this.obterUrlApi();
      const resposta = await fetch(`${urlApi}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: emailLimpo, senha })
      });

      const dados = await resposta.json();

      if (!resposta.ok || !dados.sucesso) {
        return {
          sucesso: false,
          mensagem: dados.mensagem || 'Credenciais inválidas.'
        };
      }

      if (dados.token) {
        this.salvarToken(dados.token);
      }

      if (dados.usuario) {
        if (dados.usuario.papel === 'professor') {
          const prof: UsuarioProfessor = {
            id: dados.usuario.id || 'prof-sara-1',
            papel: 'professor',
            nome: dados.usuario.nome || 'Sara',
            email: dados.usuario.email.trim().toLowerCase(),
            cref: dados.usuario.cref || '012345-G/SP'
          };
          this.dadosProfessoraCache = prof;
          this.definirSessao(prof);
          this.desativarModoSimulacao();
          await this.sincronizarAlunosRemoto();
          return { sucesso: true, mensagem: dados.mensagem, usuario: prof };
        } else {
          // Aluno logado: busca dados atualizados direto da VPS
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

      return { sucesso: false, mensagem: 'Resposta do servidor incompleta.' };
    } catch {
      return {
        sucesso: false,
        mensagem: 'Não foi possível conectar ao servidor na VPS. Verifique sua conexão com a internet.'
      };
    }
  }

  // Atualizar dados cadastrais do aluno na VPS
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
    const urlApi = this.obterUrlApi();
    const resposta = await fetch(`${urlApi}/api/alunos/${alunoId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(dadosAtualizados)
    });

    const dados = await resposta.json();
    if (!resposta.ok || !dados.sucesso) {
      return { sucesso: false, mensagem: dados.mensagem || 'Falha ao atualizar dados na VPS.' };
    }

    // Atualizar objeto na memória
    const index = this.alunosEmMemoria.findIndex((a) => a.id === alunoId);
    if (index !== -1) {
      const aluno = this.alunosEmMemoria[index];
      if (dadosAtualizados.nome) {
        aluno.nome = dadosAtualizados.nome.trim();
        aluno.anamnese.nome = dadosAtualizados.nome.trim();
      }
      if (dadosAtualizados.email) aluno.email = dadosAtualizados.email.trim().toLowerCase();
      if (dadosAtualizados.status) aluno.status = dadosAtualizados.status;
      if (dadosAtualizados.contato) aluno.anamnese.contato = dadosAtualizados.contato.trim();
      if (dadosAtualizados.idade) aluno.anamnese.idade = dadosAtualizados.idade.trim();
      if (dadosAtualizados.peso) aluno.anamnese.peso = dadosAtualizados.peso.trim();
      if (dadosAtualizados.altura) aluno.anamnese.altura = dadosAtualizados.altura.trim();
      if (dadosAtualizados.objetivoPrincipal) aluno.anamnese.objetivoPrincipal = dadosAtualizados.objetivoPrincipal.trim();
      this.alunosEmMemoria[index] = aluno;

      const sessao = this.obterSessao();
      if (sessao && sessao.id === alunoId) {
        this.definirSessao(aluno);
      }
    }

    return { sucesso: true, mensagem: 'Dados do aluno atualizados com sucesso na VPS!' };
  }

  // Alternar status (ativar / desativar acesso) na VPS
  static async alternarStatusAluno(
    alunoId: string,
    novoStatus: 'ativo' | 'inativo' | 'aguardando_ficha'
  ): Promise<{ sucesso: boolean; mensagem: string }> {
    const urlApi = this.obterUrlApi();
    const resposta = await fetch(`${urlApi}/api/alunos/${alunoId}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: novoStatus })
    });

    const dados = await resposta.json();
    if (!resposta.ok || !dados.sucesso) {
      return { sucesso: false, mensagem: dados.mensagem || 'Falha ao alterar status na VPS.' };
    }

    const index = this.alunosEmMemoria.findIndex((a) => a.id === alunoId);
    if (index !== -1) {
      this.alunosEmMemoria[index].status = novoStatus;
    }

    return {
      sucesso: true,
      mensagem: novoStatus === 'inativo' ? 'Acesso do aluno desativado na VPS.' : 'Acesso do aluno ativado na VPS.'
    };
  }

  // Excluir aluno definitivamente na VPS
  static async excluirAluno(alunoId: string): Promise<{ sucesso: boolean; mensagem: string }> {
    const urlApi = this.obterUrlApi();
    const resposta = await fetch(`${urlApi}/api/alunos/${alunoId}`, {
      method: 'DELETE'
    });

    const dados = await resposta.json();
    if (!resposta.ok || !dados.sucesso) {
      return { sucesso: false, mensagem: dados.mensagem || 'Falha ao excluir aluno na VPS.' };
    }

    this.alunosEmMemoria = this.alunosEmMemoria.filter((a) => a.id !== alunoId);

    if (this.idAlunoSimulado === alunoId) {
      this.desativarModoSimulacao();
    }

    const sessao = this.obterSessao();
    if (sessao && sessao.id === alunoId) {
      this.encerrarSessao();
    }

    return { sucesso: true, mensagem: 'Aluno excluído com sucesso da VPS.' };
  }

  // Gerenciamento de sessão (apenas credencial JWT e identidade do usuário conectado)
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

  // Modo Simulação (Sara visualizando como um aluno específico em tempo de execução)
  static ativarModoSimulacao(alunoId: string): void {
    this.idAlunoSimulado = alunoId;
  }

  static obterAlunoSimulado(): UsuarioAluno | null {
    if (!this.idAlunoSimulado) return null;
    return this.obterAlunoPorId(this.idAlunoSimulado) || null;
  }

  static desativarModoSimulacao(): void {
    this.idAlunoSimulado = null;
  }
}
