/**
 * Tipos e Interfaces do Sistema Shara-EF
 * Todos os tipos em Português Brasileiro (PT-BR)
 */

export type PapelUsuario = 'aluno' | 'professor';

export interface RespostasAnamnese {
  nome: string;
  idade: string;
  contato: string;
  peso: string;
  altura: string;
  relacaoAtividade: string;
  possuiRestricaoMedica: string;
  descricaoRestricaoMedica?: string;
  possuiLesaoDorCronica: string;
  descricaoLesaoDorCronica?: string;
  possuiDoenca: string[];
  outraDoenca?: string;
  disponibilidadeTreino: string[];
  horarioPreferencial?: string;
  historicoTreino: string;
  nivelConhecimentoTreino: number; // 0 a 10
  objetivoPrincipal: string;
  outroObjetivo?: string;
  localTreino: string;
  outroLocal?: string;
  informacoesRelevantes?: string;
  dataPreenchimento: string;
}

export interface ExercicioTreino {
  id: string;
  nome: string;
  grupamento: string;
  series: number;
  repeticoes: string; // Ex: "10 a 12" ou "Até a falha"
  cargaKg?: string;
  intervaloSegundos: number;
  observacoes?: string;
  demonstracaoUrl?: string;
  seriesConcluidas?: boolean[];
  cargasRegistradas?: string[];
}

export interface DivisaoTreino {
  id: string;
  identificador: string; // Ex: "Treino A", "Treino B", "Treino C"
  titulo: string; // Ex: "Membros Inferiores com foco em Glúteos"
  frequenciaSugerida?: string;
  exercicios: ExercicioTreino[];
}

export interface FichaDeTreino {
  id: string;
  alunoId: string;
  titulo: string;
  observacoesGerais?: string;
  dataCriacao: string;
  divisoes: DivisaoTreino[];
  ativa: boolean;
}

export interface UsuarioAluno {
  id: string;
  papel: 'aluno';
  nome: string;
  email: string;
  anamnese: RespostasAnamnese;
  fichaAtiva?: FichaDeTreino;
  historicoFichas?: FichaDeTreino[];
  dataCadastro: string;
  status: 'ativo' | 'aguardando_ficha' | 'inativo';
}

export interface UsuarioProfessor {
  id: string;
  papel: 'professor';
  nome: string;
  email: string;
  cref?: string;
}

export type UsuarioSessao = UsuarioAluno | UsuarioProfessor;

export interface ExercicioBiblioteca {
  id: string;
  nome: string;
  grupamento: 'Quadríceps' | 'Glúteos' | 'Posteriores' | 'Peitoral' | 'Costas' | 'Ombros' | 'Bíceps' | 'Tríceps' | 'Abdômen' | 'Cárdio';
  instrucoes?: string;
  equipamento?: string;
}
