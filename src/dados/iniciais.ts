import { ExercicioBiblioteca, UsuarioAluno, UsuarioProfessor } from '../tipos';

export const PROFESSORA_PADRAO: UsuarioProfessor = {
  id: 'prof-sara-1',
  papel: 'professor',
  nome: 'Sara',
  email: 'sara@sharaef.com.br',
  cref: '012345-G/SP'
};

export const BIBLIOTECA_EXERCICIOS: ExercicioBiblioteca[] = [
  // Membros Inferiores - Quadríceps
  { id: 'ex-1', nome: 'Agachamento Livre com Barra', grupamento: 'Quadríceps', equipamento: 'Barra Olímpica', instrucoes: 'Pés na largura dos ombros, desça até 90 graus mantendo a coluna ereta.' },
  { id: 'ex-2', nome: 'Leg Press 45°', grupamento: 'Quadríceps', equipamento: 'Máquina', instrucoes: 'Não hiperestenda os joelhos no ponto final, mantenha a lombar apoiada.' },
  { id: 'ex-3', nome: 'Cadeira Extensora', grupamento: 'Quadríceps', equipamento: 'Máquina', instrucoes: 'Segure 1 segundo no pico de contração.' },
  { id: 'ex-4', nome: 'Passada / Afundo com Halteres', grupamento: 'Quadríceps', equipamento: 'Halteres', instrucoes: 'Passo largo, joelho traseiro quase encosta no chão.' },

  // Glúteos e Posteriores
  { id: 'ex-5', nome: 'Elevação Pélvica com Barra', grupamento: 'Glúteos', equipamento: 'Barra / Banco', instrucoes: 'Apoie as escápulas, contraia o glúteo por 2 segundos no topo.' },
  { id: 'ex-6', nome: 'Glúteo na Polia (Cabo)', grupamento: 'Glúteos', equipamento: 'Polia Baixa', instrucoes: 'Extensão de quadril com perna estendida.' },
  { id: 'ex-7', nome: 'Cadeira Abdutora', grupamento: 'Glúteos', equipamento: 'Máquina', instrucoes: 'Incline o tronco levemente para frente para maior ativação do glúteo médio.' },
  { id: 'ex-8', nome: 'Mesa Flexora', grupamento: 'Posteriores', equipamento: 'Máquina', instrucoes: 'Mantenha o quadril fixo no banco.' },
  { id: 'ex-9', nome: 'Stiff com Halteres', grupamento: 'Posteriores', equipamento: 'Halteres', instrucoes: 'Mantenha os joelhos semiflexionados e projete o quadril para trás.' },

  // Superiores - Costas
  { id: 'ex-10', nome: 'Puxada Frontal na Polia', grupamento: 'Costas', equipamento: 'Polia Alta', instrucoes: 'Puxe a barra até a altura do queixo, ativando as dorsais.' },
  { id: 'ex-11', nome: 'Remada Curvada com Halteres', grupamento: 'Costas', equipamento: 'Halteres', instrucoes: 'Cotovelos rentes ao tronco.' },
  { id: 'ex-12', nome: 'Remada Baixa Triângulo', grupamento: 'Costas', equipamento: 'Polia Baixa', instrucoes: 'Alongue na ida e feche as escápulas na volta.' },

  // Superiores - Peitoral e Ombros
  { id: 'ex-13', nome: 'Supino Reto com Halteres', grupamento: 'Peitoral', equipamento: 'Halteres / Banco Reto', instrucoes: 'Mantenha escápulas retraídas.' },
  { id: 'ex-14', nome: 'Elevação Lateral com Halteres', grupamento: 'Ombros', equipamento: 'Halteres', instrucoes: 'Eleve até a linha dos ombros com cotovelos levemente flexionados.' },
  { id: 'ex-15', nome: 'Desenvolvimento Militar com Halteres', grupamento: 'Ombros', equipamento: 'Halteres / Banco', instrucoes: 'Empurre verticalmente sem bater os halteres no topo.' },

  // Braços
  { id: 'ex-16', nome: 'Rosca Direta com Halteres', grupamento: 'Bíceps', equipamento: 'Halteres', instrucoes: 'Movimento controlado sem balançar o tronco.' },
  { id: 'ex-17', nome: 'Tríceps Corda na Polia', grupamento: 'Tríceps', equipamento: 'Polia Alta', instrucoes: 'Abra a corda no final da extensão.' },

  // Abdômen e Cárdio
  { id: 'ex-18', nome: 'Prancha Isométrica', grupamento: 'Abdômen', equipamento: 'Solo / Colchonete', instrucoes: 'Abdômen e glúteos contraídos, linha reta da cabeça aos calcanhares.' },
  { id: 'ex-19', nome: 'Abdominal Supra no Solo', grupamento: 'Abdômen', equipamento: 'Colchonete', instrucoes: 'Expiração forçada na subida, contraindo a musculatura.' },
  { id: 'ex-20', nome: 'HIIT na Esteira ou Bicicleta', grupamento: 'Cárdio', equipamento: 'Ergométrico', instrucoes: '30 segundos de alta intensidade intercalados com 30s de descanso ativo.' }
];

export const ALUNOS_EXEMPLO: UsuarioAluno[] = [
  {
    id: 'aluno-demo-1',
    papel: 'aluno',
    nome: 'Mariana Silva',
    email: 'mariana@exemplo.com',
    dataCadastro: '2026-03-20',
    status: 'ativo',
    anamnese: {
      nome: 'Mariana Silva',
      idade: '28',
      contato: '(11) 98765-4321',
      peso: '64',
      altura: '165',
      relacaoAtividade: 'Já treinei no passado, estou recomeçando agora.',
      possuiRestricaoMedica: 'Não',
      possuiLesaoDorCronica: 'Sim',
      descricaoLesaoDorCronica: 'Leve desconforto lombar se fico muito tempo sentada.',
      possuiDoenca: ['Nenhuma'],
      disponibilidadeTreino: ['Segunda', 'Quarta', 'Sexta'],
      horarioPreferencial: 'Noite (após às 18h)',
      historicoTreino: 'Treinei musculação por 2 anos, parei no último ano.',
      nivelConhecimentoTreino: 6,
      objetivoPrincipal: 'Hipertrofia e Tonificação (com foco em glúteos e pernas)',
      localTreino: 'Academia completa',
      informacoesRelevantes: 'Quero focar na execução correta para não sobrecarregar a coluna.',
      dataPreenchimento: '2026-03-20'
    },
    fichaAtiva: {
      id: 'ficha-mariana-1',
      alunoId: 'aluno-demo-1',
      titulo: 'Fase 1 - Adaptação e Ênfase em Glúteos',
      observacoesGerais: 'Manter descanso de 60s entre séries. Hidratar-se bem.',
      dataCriacao: '2026-03-21',
      ativa: true,
      divisoes: [
        {
          id: 'div-a',
          identificador: 'Treino A',
          titulo: 'Membros Inferiores & Glúteos',
          frequenciaSugerida: 'Segunda e Sexta',
          exercicios: [
            {
              id: 'ex-item-1',
              nome: 'Agachamento Livre com Barra',
              grupamento: 'Quadríceps',
              series: 4,
              repeticoes: '10 a 12',
              cargaKg: '20',
              intervaloSegundos: 60,
              observacoes: 'Aquecer 1 série antes com barra vazia.',
              seriesConcluidas: [true, true, false, false],
              cargasRegistradas: ['20', '20', '25', '25']
            },
            {
              id: 'ex-item-2',
              nome: 'Elevação Pélvica com Barra',
              grupamento: 'Glúteos',
              series: 4,
              repeticoes: '12',
              cargaKg: '30',
              intervaloSegundos: 60,
              observacoes: 'Pausa de 2 segundos no ponto mais alto.',
              seriesConcluidas: [false, false, false, false]
            },
            {
              id: 'ex-item-3',
              nome: 'Leg Press 45°',
              grupamento: 'Quadríceps',
              series: 3,
              repeticoes: '12 a 15',
              cargaKg: '80',
              intervaloSegundos: 60,
              observacoes: 'Pés no meio da plataforma.',
              seriesConcluidas: [false, false, false]
            },
            {
              id: 'ex-item-4',
              nome: 'Cadeira Abdutora',
              grupamento: 'Glúteos',
              series: 3,
              repeticoes: '15',
              cargaKg: '35',
              intervaloSegundos: 45,
              observacoes: 'Tronco ligeiramente inclinado à frente.',
              seriesConcluidas: [false, false, false]
            }
          ]
        },
        {
          id: 'div-b',
          identificador: 'Treino B',
          titulo: 'Superiores & Core',
          frequenciaSugerida: 'Quarta-feira',
          exercicios: [
            {
              id: 'ex-item-5',
              nome: 'Puxada Frontal na Polia',
              grupamento: 'Costas',
              series: 3,
              repeticoes: '12',
              cargaKg: '30',
              intervaloSegundos: 60,
              observacoes: 'Concentrar nas escápulas.',
              seriesConcluidas: [false, false, false]
            },
            {
              id: 'ex-item-6',
              nome: 'Desenvolvimento Militar com Halteres',
              grupamento: 'Ombros',
              series: 3,
              repeticoes: '10',
              cargaKg: '6',
              intervaloSegundos: 60,
              seriesConcluidas: [false, false, false]
            },
            {
              id: 'ex-item-7',
              nome: 'Prancha Isométrica',
              grupamento: 'Abdômen',
              series: 3,
              repeticoes: '45 segundos',
              intervaloSegundos: 45,
              seriesConcluidas: [false, false, false]
            }
          ]
        }
      ]
    }
  }
];
