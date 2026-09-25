import { ALUNOS_EXEMPLO, PROFESSORA_PADRAO } from '../dados/iniciais';
import { DivisaoTreino, FichaDeTreino, RespostasAnamnese, UsuarioAluno, UsuarioSessao } from '../tipos';

const CHAVE_ALUNOS = 'shara_ef_alunos_v1';
const CHAVE_SESSAO = 'shara_ef_sessao_v1';
const CHAVE_SENHAS = 'shara_ef_credenciais_v1';
const CHAVE_MODO_SIMULACAO = 'shara_ef_simulacao_aluno_id';
const CHAVE_URL_API = 'shara_ef_url_api_v1';

export class ServicoArmazenamento {
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
        'sara@sharaef.com.br': 'sara123',
        'mariana@exemplo.com': '123456'
      };
      localStorage.setItem(CHAVE_SENHAS, JSON.stringify(senhasIniciais));
    }
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
  static salvarFichaAluno(alunoId: string, divisoes: DivisaoTreino[], titulo: string, observacoes?: string): boolean {
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

    return true;
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
        if (dados.usuario) {
          const usuarioServidor: UsuarioSessao = dados.usuario.papel === 'professor' 
            ? PROFESSORA_PADRAO 
            : (this.obterAlunoPorEmail(emailLimpo) || {
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
              });

          this.definirSessao(usuarioServidor);
          this.desativarModoSimulacao();
          return { sucesso: true, mensagem: dados.mensagem, usuario: usuarioServidor };
        }
      }
    } catch {
      // Fallback para autenticação local
    }

    // 2. Fallback de autenticação local (para suporte PWA offline)
    const senhasRaw = localStorage.getItem(CHAVE_SENHAS);
    const senhas: Record<string, string> = senhasRaw ? JSON.parse(senhasRaw) : {};

    if (emailLimpo === PROFESSORA_PADRAO.email.toLowerCase()) {
      const senhaCorreta = senhas[emailLimpo] || 'sara123';
      if (senha === senhaCorreta) {
        this.definirSessao(PROFESSORA_PADRAO);
        this.desativarModoSimulacao();
        return { sucesso: true, mensagem: 'Bem-vinda, Professora Sara!', usuario: PROFESSORA_PADRAO };
      }
      return { sucesso: false, mensagem: 'Senha incorreta para a conta da Professora.' };
    }

    const aluno = this.obterAlunoPorEmail(emailLimpo);
    if (!aluno) {
      return { sucesso: false, mensagem: 'E-mail não encontrado. Caso seja seu primeiro acesso, cadastre-se em Novo Aluno.' };
    }

    const senhaArmazenada = senhas[emailLimpo];
    if (!senhaArmazenada || senhaArmazenada !== senha) {
      return { sucesso: false, mensagem: 'Senha de aluno incorreta.' };
    }

    this.definirSessao(aluno);
    this.desativarModoSimulacao();
    return { sucesso: true, mensagem: `Olá, ${aluno.nome}! Bom treino.`, usuario: aluno };
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
