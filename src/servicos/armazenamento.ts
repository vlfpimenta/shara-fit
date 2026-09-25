import { ALUNOS_EXEMPLO, PROFESSORA_PADRAO } from '../dados/iniciais';
import { DivisaoTreino, FichaDeTreino, RespostasAnamnese, UsuarioAluno, UsuarioSessao } from '../tipos';

const CHAVE_ALUNOS = 'shara_ef_alunos_v1';
const CHAVE_SESSAO = 'shara_ef_sessao_v1';
const CHAVE_SENHAS = 'shara_ef_credenciais_v1';
const CHAVE_MODO_SIMULACAO = 'shara_ef_simulacao_aluno_id';

export class ServicoArmazenamento {
  // Inicialização com dados padrão caso o storage esteja vazio
  static inicializar(): void {
    if (!localStorage.getItem(CHAVE_ALUNOS)) {
      localStorage.setItem(CHAVE_ALUNOS, JSON.stringify(ALUNOS_EXEMPLO));
    }
    if (!localStorage.getItem(CHAVE_SENHAS)) {
      // Senhas padrão para os testes iniciais
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

  // Cadastrar novo aluno com anamnese e senha
  static cadastrarNovoAluno(
    anamnese: RespostasAnamnese,
    email: string,
    senhaPlana: string
  ): { sucesso: boolean; mensagem: string; aluno?: UsuarioAluno } {
    this.inicializar();
    const alunos = this.obterAlunos();
    const emailLimpo = email.trim().toLowerCase();

    // Validar se e-mail já existe
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

    alunos.push(novoAluno);
    this.salvarAlunos(alunos);

    // Salvar credencial
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

    // Se o usuário logado atualmente for esse aluno, atualizar sessão
    const sessaoAtual = this.obterSessao();
    if (sessaoAtual && sessaoAtual.id === alunoId) {
      this.definirSessao(alunos[index]);
    }

    return true;
  }

  // Atualizar progresso do treino (série marcada como concluída / carga anotada)
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

  // Autenticação de usuário
  static autenticar(email: string, senha: string): { sucesso: boolean; mensagem: string; usuario?: UsuarioSessao } {
    this.inicializar();
    const emailLimpo = email.trim().toLowerCase();

    // Verificação de credenciais
    const senhasRaw = localStorage.getItem(CHAVE_SENHAS);
    const senhas: Record<string, string> = senhasRaw ? JSON.parse(senhasRaw) : {};

    // 1. Professora Sara
    if (emailLimpo === PROFESSORA_PADRAO.email.toLowerCase()) {
      const senhaCorreta = senhas[emailLimpo] || 'sara123';
      if (senha === senhaCorreta) {
        this.definirSessao(PROFESSORA_PADRAO);
        this.desativarModoSimulacao();
        return { sucesso: true, mensagem: 'Bem-vinda, Professora Sara!', usuario: PROFESSORA_PADRAO };
      }
      return { sucesso: false, mensagem: 'Senha incorreta para a conta da Professora.' };
    }

    // 2. Aluno
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
