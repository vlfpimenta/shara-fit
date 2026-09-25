import React, { useState } from 'react';
import { BIBLIOTECA_EXERCICIOS } from '../../dados/iniciais';
import {
  IconeBloquear,
  IconeCheck,
  IconeDesbloquear,
  IconeEditar,
  IconeFechar,
  IconeInformacao,
  IconeLixeira,
  IconeMais,
  IconeOlho
} from '../../componentes/icones';
import { ServicoArmazenamento } from '../../servicos/armazenamento';
import { BotaoInstalarApp } from '../../componentes/pwa/BotaoInstalarApp';
import { DivisaoTreino, ExercicioBiblioteca, ExercicioTreino, UsuarioAluno } from '../../tipos';

interface PropriedadesPainelProfessor {
  aoAtivarModoAluno: (alunoId: string) => void;
}

export const PainelProfessor: React.FC<PropriedadesPainelProfessor> = ({ aoAtivarModoAluno }) => {
  const [alunos, setAlunos] = useState<UsuarioAluno[]>(() => ServicoArmazenamento.obterAlunos());
  const [buscaAluno, setBuscaAluno] = useState<string>('');
  const [alunoSelecionadoAnamnese, setAlunoSelecionadoAnamnese] = useState<UsuarioAluno | null>(null);
  const [alunoParaPrescrever, setAlunoParaPrescrever] = useState<UsuarioAluno | null>(null);

  // Estados de Gestão de Aluno (Editar, Desativar e Excluir)
  const [alunoParaEditar, setAlunoParaEditar] = useState<UsuarioAluno | null>(null);
  const [nomeEdicao, setNomeEdicao] = useState<string>('');
  const [emailEdicao, setEmailEdicao] = useState<string>('');
  const [contatoEdicao, setContatoEdicao] = useState<string>('');
  const [idadeEdicao, setIdadeEdicao] = useState<string>('');
  const [pesoEdicao, setPesoEdicao] = useState<string>('');
  const [alturaEdicao, setAlturaEdicao] = useState<string>('');
  const [objetivoEdicao, setObjetivoEdicao] = useState<string>('');
  const [statusEdicao, setStatusEdicao] = useState<'ativo' | 'inativo' | 'aguardando_ficha'>('ativo');
  const [salvandoEdicao, setSalvandoEdicao] = useState<boolean>(false);

  const [alunoParaExcluir, setAlunoParaExcluir] = useState<UsuarioAluno | null>(null);
  const [excluindoAluno, setExcluindoAluno] = useState<boolean>(false);

  // Estados do Construtor de Ficha
  const [tituloFicha, setTituloFicha] = useState<string>('');
  const [observacoesFicha, setObservacoesFicha] = useState<string>('');
  const [divisoesEmEdicao, setDivisoesEmEdicao] = useState<DivisaoTreino[]>([]);
  const [divisaoAbertaIndex, setDivisaoAbertaIndex] = useState<number>(0);
  const [modalBibliotecaAberta, setModalBibliotecaAberta] = useState<boolean>(false);
  const [filtroGrupamento, setFiltroGrupamento] = useState<string>('Todos');
  const [buscaExercicio, setBuscaExercicio] = useState<string>('');

  // Configuração do Domínio da VPS
  const [modalConfigApiAberta, setModalConfigApiAberta] = useState<boolean>(false);
  const [urlApiInput, setUrlApiInput] = useState<string>(() => ServicoArmazenamento.obterUrlApi());
  const [resultadoTesteApi, setResultadoTesteApi] = useState<{ sucesso: boolean; mensagem: string; detalhe?: string } | null>(null);
  const [testandoApi, setTestandoApi] = useState<boolean>(false);

  const testarConexao = async () => {
    setTestandoApi(true);
    setResultadoTesteApi(null);
    const res = await ServicoArmazenamento.testarConexaoApi(urlApiInput);
    setResultadoTesteApi(res);
    setTestandoApi(false);
  };

  const salvarNovoDominio = () => {
    ServicoArmazenamento.definirUrlApi(urlApiInput);
    alert('Domínio da API salvo com sucesso!');
    setModalConfigApiAberta(false);
  };

  // Funções de Gestão de Alunos (Editar, Desativar e Excluir)
  const abrirEdicaoAluno = (aluno: UsuarioAluno) => {
    setAlunoParaEditar(aluno);
    setNomeEdicao(aluno.nome);
    setEmailEdicao(aluno.email);
    setContatoEdicao(aluno.anamnese.contato || '');
    setIdadeEdicao(aluno.anamnese.idade || '');
    setPesoEdicao(aluno.anamnese.peso || '');
    setAlturaEdicao(aluno.anamnese.altura || '');
    setObjetivoEdicao(aluno.anamnese.objetivoPrincipal || '');
    setStatusEdicao(aluno.status);
  };

  const salvarAlteracoesAluno = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!alunoParaEditar) return;
    setSalvandoEdicao(true);
    await ServicoArmazenamento.atualizarDadosAluno(alunoParaEditar.id, {
      nome: nomeEdicao,
      email: emailEdicao,
      contato: contatoEdicao,
      idade: idadeEdicao,
      peso: pesoEdicao,
      altura: alturaEdicao,
      objetivoPrincipal: objetivoEdicao,
      status: statusEdicao
    });
    setAlunos(ServicoArmazenamento.obterAlunos());
    setSalvandoEdicao(false);
    setAlunoParaEditar(null);
  };

  const alternarStatusAluno = async (aluno: UsuarioAluno) => {
    const novoStatus: 'ativo' | 'inativo' = aluno.status === 'inativo' ? 'ativo' : 'inativo';
    await ServicoArmazenamento.alternarStatusAluno(aluno.id, novoStatus);
    setAlunos(ServicoArmazenamento.obterAlunos());
  };

  const confirmarExclusaoAluno = async () => {
    if (!alunoParaExcluir) return;
    setExcluindoAluno(true);
    await ServicoArmazenamento.excluirAluno(alunoParaExcluir.id);
    setAlunos(ServicoArmazenamento.obterAlunos());
    setExcluindoAluno(false);
    setAlunoParaExcluir(null);
  };

  // Filtragem de alunos
  const alunosFiltrados = alunos.filter(
    (a) =>
      a.nome.toLowerCase().includes(buscaAluno.toLowerCase()) ||
      a.email.toLowerCase().includes(buscaAluno.toLowerCase()) ||
      a.anamnese.objetivoPrincipal.toLowerCase().includes(buscaAluno.toLowerCase())
  );

  // Abrir tela/modal para prescrever ficha
  const iniciarPrescricao = (aluno: UsuarioAluno) => {
    setAlunoParaPrescrever(aluno);
    if (aluno.fichaAtiva) {
      setTituloFicha(aluno.fichaAtiva.titulo);
      setObservacoesFicha(aluno.fichaAtiva.observacoesGerais || '');
      setDivisoesEmEdicao(JSON.parse(JSON.stringify(aluno.fichaAtiva.divisoes)));
    } else {
      setTituloFicha(`Fase 1 - ${aluno.anamnese.objetivoPrincipal.split(' ')[0]}`);
      setObservacoesFicha('Executar com cadência controlada e respeitar os intervalos.');
      setDivisoesEmEdicao([
        {
          id: 'div-' + Date.now() + '-a',
          identificador: 'Treino A',
          titulo: 'Membros Inferiores',
          frequenciaSugerida: 'Segunda e Quinta',
          exercicios: []
        },
        {
          id: 'div-' + Date.now() + '-b',
          identificador: 'Treino B',
          titulo: 'Membros Superiores & Core',
          frequenciaSugerida: 'Terça e Sexta',
          exercicios: []
        }
      ]);
    }
    setDivisaoAbertaIndex(0);
  };

  // Salvar ficha no banco
  const salvarFicha = () => {
    if (!alunoParaPrescrever) return;
    if (!tituloFicha.trim()) {
      alert('Por favor, informe o título da ficha.');
      return;
    }

    ServicoArmazenamento.salvarFichaAluno(alunoParaPrescrever.id, divisoesEmEdicao, tituloFicha, observacoesFicha);
    setAlunos(ServicoArmazenamento.obterAlunos());
    setAlunoParaPrescrever(null);
  };

  // Adicionar exercício selecionado da biblioteca para a divisão atual
  const adicionarExercicioParaDivisao = (exBib: ExercicioBiblioteca) => {
    const novasDivisoes = [...divisoesEmEdicao];
    const divAtual = novasDivisoes[divisaoAbertaIndex];
    if (!divAtual) return;

    const novoItem: ExercicioTreino = {
      id: 'ex-item-' + Date.now() + Math.random().toString(36).substr(2, 4),
      nome: exBib.nome,
      grupamento: exBib.grupamento,
      series: 3,
      repeticoes: '10 a 12',
      cargaKg: '',
      intervaloSegundos: 60,
      observacoes: exBib.instrucoes || ''
    };

    divAtual.exercicios.push(novoItem);
    setDivisoesEmEdicao(novasDivisoes);
    setModalBibliotecaAberta(false);
  };

  // Remover exercício da divisão
  const removerExercicio = (divIndex: number, exIndex: number) => {
    const novas = [...divisoesEmEdicao];
    novas[divIndex].exercicios.splice(exIndex, 1);
    setDivisoesEmEdicao(novas);
  };

  // Adicionar nova divisão (Treino C, D...)
  const adicionarNovaDivisao = () => {
    const letras = ['A', 'B', 'C', 'D', 'E', 'F'];
    const proximaLetra = letras[divisoesEmEdicao.length] || 'X';
    const nova: DivisaoTreino = {
      id: 'div-' + Date.now(),
      identificador: `Treino ${proximaLetra}`,
      titulo: 'Novo Grupamento',
      exercicios: []
    };
    setDivisoesEmEdicao([...divisoesEmEdicao, nova]);
    setDivisaoAbertaIndex(divisoesEmEdicao.length);
  };

  // Exercícios da biblioteca filtrados
  const exerciciosBibliotecaFiltrados = BIBLIOTECA_EXERCICIOS.filter((ex) => {
    const bateFiltro = filtroGrupamento === 'Todos' || ex.grupamento === filtroGrupamento;
    const bateBusca = ex.nome.toLowerCase().includes(buscaExercicio.toLowerCase()) || ex.grupamento.toLowerCase().includes(buscaExercicio.toLowerCase());
    return bateFiltro && bateBusca;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', paddingBottom: '5rem' }}>
      {/* Cabeçalho do Painel da Sara */}
      <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '1rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.2rem' }}>
            <span className="badge badge-primaria">Área Administrativa</span>
            <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Professora Sara</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', marginTop: '0.3rem', flexWrap: 'wrap' }}>
            <h1 style={{ fontSize: '1.8rem', color: '#ffffff' }}>Painel de Gestão dos Alunos</h1>
            <button
              className="botao-secundario"
              onClick={() => {
                setUrlApiInput(ServicoArmazenamento.obterUrlApi());
                setResultadoTesteApi(null);
                setModalConfigApiAberta(true);
              }}
              style={{ padding: '0.35rem 0.75rem', fontSize: '0.8rem', borderRadius: '8px' }}
              title="Configurar domínio da VPS / API"
            >
              ⚙️ Configurar VPS / Domínio
            </button>
            <BotaoInstalarApp
              variante="secundario"
              texto="📱 Instalar App no Telefone"
              estilo={{ padding: '0.35rem 0.75rem', fontSize: '0.8rem', borderRadius: '8px' }}
            />
          </div>
        </div>

        {/* Resumo Rápido */}
        <div style={{ display: 'flex', gap: '0.8rem', flexWrap: 'wrap' }}>
          <div className="cartao" style={{ padding: '0.7rem 1.1rem', textAlign: 'center' }}>
            <div style={{ fontSize: '1.3rem', fontWeight: 800, color: '#ff2e7e' }}>{alunos.length}</div>
            <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Total de Alunos</div>
          </div>
          <div className="cartao" style={{ padding: '0.7rem 1.1rem', textAlign: 'center' }}>
            <div style={{ fontSize: '1.3rem', fontWeight: 800, color: '#10b981' }}>
              {alunos.filter((a) => a.status === 'ativo').length}
            </div>
            <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Treinos Ativos</div>
          </div>
          <div className="cartao" style={{ padding: '0.7rem 1.1rem', textAlign: 'center' }}>
            <div style={{ fontSize: '1.3rem', fontWeight: 800, color: '#f59e0b' }}>
              {alunos.filter((a) => a.status === 'aguardando_ficha').length}
            </div>
            <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Aguardando Ficha</div>
          </div>
          <div className="cartao" style={{ padding: '0.7rem 1.1rem', textAlign: 'center' }}>
            <div style={{ fontSize: '1.3rem', fontWeight: 800, color: '#ef4444' }}>
              {alunos.filter((a) => a.status === 'inativo').length}
            </div>
            <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Acesso Desativado</div>
          </div>
        </div>
      </div>

      {/* Barra de Busca de Aluno */}
      <div style={{ display: 'flex', gap: '1rem' }}>
        <input
          type="text"
          className="campo-texto"
          placeholder="Buscar aluno por nome, e-mail ou objetivo..."
          value={buscaAluno}
          onChange={(e) => setBuscaAluno(e.target.value)}
        />
      </div>

      {/* Tabela / Lista de Alunos Responsiva */}
      <div className="cartao" style={{ padding: '0', overflow: 'hidden' }}>
        <div style={{ padding: '1.2rem 1.5rem', borderBottom: '1px solid #28325c', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ fontSize: '1.15rem', color: '#ffffff' }}>Lista de Alunos ({alunosFiltrados.length})</h3>
          <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Gestão completa de acessos e fichas</span>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
            <thead>
              <tr style={{ background: '#0e1224', color: '#64748b', borderBottom: '1px solid #28325c' }}>
                <th style={{ padding: '0.9rem 1.2rem' }}>Aluno</th>
                <th style={{ padding: '0.9rem 1rem' }}>Objetivo & Contato</th>
                <th style={{ padding: '0.9rem 1rem' }}>Status</th>
                <th style={{ padding: '0.9rem 1.2rem', textAlign: 'right' }}>Ações de Gestão</th>
              </tr>
            </thead>
            <tbody>
              {alunosFiltrados.length === 0 ? (
                <tr>
                  <td colSpan={4} style={{ padding: '2rem', textAlign: 'center', color: '#94a3b8' }}>
                    Nenhum aluno encontrado com o filtro atual.
                  </td>
                </tr>
              ) : (
                alunosFiltrados.map((aluno) => (
                  <tr
                    key={aluno.id}
                    style={{
                      borderBottom: '1px solid #1c2344',
                      opacity: aluno.status === 'inativo' ? 0.75 : 1,
                      transition: 'background 0.2s ease'
                    }}
                  >
                    <td style={{ padding: '1rem 1.2rem' }}>
                      <div style={{ fontWeight: 700, color: '#ffffff', fontSize: '1rem' }}>{aluno.nome}</div>
                      <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>{aluno.email}</div>
                      <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Cadastrado em {aluno.dataCadastro}</div>
                    </td>

                    <td style={{ padding: '1rem 1rem' }}>
                      <span className="badge badge-primaria" style={{ marginBottom: '0.3rem' }}>
                        {aluno.anamnese.objetivoPrincipal}
                      </span>
                      <div style={{ fontSize: '0.82rem', color: '#cbd5e1' }}>{aluno.anamnese.contato}</div>
                      <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                        {aluno.anamnese.peso}kg • {aluno.anamnese.altura}cm
                      </div>
                    </td>

                    <td style={{ padding: '1rem 1rem' }}>
                      {aluno.status === 'ativo' ? (
                        <span className="badge badge-sucesso">Treino Ativo</span>
                      ) : aluno.status === 'inativo' ? (
                        <span
                          className="badge"
                          style={{
                            background: 'rgba(239, 68, 68, 0.15)',
                            border: '1px solid #ef4444',
                            color: '#fca5a5'
                          }}
                        >
                          Acesso Desativado
                        </span>
                      ) : (
                        <span className="badge badge-aviso">Aguardando Prescrição</span>
                      )}
                    </td>

                    <td style={{ padding: '1rem 1.2rem', textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', gap: '0.4rem', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                        {/* Prescrever / Editar Treino */}
                        <button
                          className="botao-primario"
                          onClick={() => iniciarPrescricao(aluno)}
                          style={{ padding: '0.4rem 0.75rem', fontSize: '0.8rem' }}
                          title="Montar ou alterar ficha de treinos"
                        >
                          <IconeEditar tamanho={15} />
                          <span>{aluno.fichaAtiva ? 'Treino' : 'Prescrever'}</span>
                        </button>

                        {/* Editar Aluno */}
                        <button
                          className="botao-secundario"
                          onClick={() => abrirEdicaoAluno(aluno)}
                          style={{ padding: '0.4rem 0.7rem', fontSize: '0.8rem' }}
                          title="Editar dados cadastrais do aluno"
                        >
                          <IconeEditar tamanho={15} />
                          <span>Editar</span>
                        </button>

                        {/* Desativar / Reativar Acesso */}
                        <button
                          onClick={() => alternarStatusAluno(aluno)}
                          style={{
                            background: aluno.status === 'inativo' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(245, 158, 11, 0.15)',
                            border: aluno.status === 'inativo' ? '1px solid rgba(16, 185, 129, 0.4)' : '1px solid rgba(245, 158, 11, 0.4)',
                            color: aluno.status === 'inativo' ? '#6ee7b7' : '#fcd34d',
                            padding: '0.4rem 0.7rem',
                            borderRadius: '8px',
                            fontSize: '0.8rem',
                            fontWeight: 600,
                            cursor: 'pointer',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.3rem'
                          }}
                          title={aluno.status === 'inativo' ? 'Reativar acesso do aluno' : 'Desativar acesso do aluno temporariamente'}
                        >
                          {aluno.status === 'inativo' ? (
                            <>
                              <IconeDesbloquear tamanho={15} />
                              <span>Reativar</span>
                            </>
                          ) : (
                            <>
                              <IconeBloquear tamanho={15} />
                              <span>Desativar</span>
                            </>
                          )}
                        </button>

                        {/* Excluir Aluno */}
                        <button
                          onClick={() => setAlunoParaExcluir(aluno)}
                          style={{
                            background: 'rgba(239, 68, 68, 0.12)',
                            border: '1px solid rgba(239, 68, 68, 0.35)',
                            color: '#fca5a5',
                            padding: '0.4rem 0.65rem',
                            borderRadius: '8px',
                            fontSize: '0.8rem',
                            fontWeight: 600,
                            cursor: 'pointer',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.25rem'
                          }}
                          title="Excluir aluno definitivamente"
                        >
                          <IconeLixeira tamanho={15} />
                          <span>Excluir</span>
                        </button>

                        {/* Modo Aluno */}
                        <button
                          onClick={() => aoAtivarModoAluno(aluno.id)}
                          style={{
                            background: 'rgba(139, 0, 255, 0.15)',
                            border: '1px solid rgba(139, 0, 255, 0.4)',
                            color: '#c084fc',
                            padding: '0.4rem 0.75rem',
                            borderRadius: '8px',
                            fontSize: '0.8rem',
                            fontWeight: 700,
                            cursor: 'pointer',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.3rem'
                          }}
                          title="Simular visualização idêntica à que o aluno vê no celular"
                        >
                          <IconeOlho tamanho={15} />
                          <span>Modo Aluno</span>
                        </button>

                        {/* Anamnese */}
                        <button
                          className="botao-secundario"
                          onClick={() => setAlunoSelecionadoAnamnese(aluno)}
                          style={{ padding: '0.4rem 0.7rem', fontSize: '0.8rem' }}
                          title="Ver respostas completas da anamnese"
                        >
                          <IconeInformacao tamanho={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal de Leitura Detalhada da Anamnese do Aluno */}
      {alunoSelecionadoAnamnese && (
        <div className="overlay-modal" onClick={() => setAlunoSelecionadoAnamnese(null)}>
          <div className="conteudo-modal" style={{ maxWidth: '680px' }} onClick={(e) => e.stopPropagation()}>
            <div className="cabecalho-modal">
              <div>
                <span className="badge badge-primaria">Anamnese Preenchida</span>
                <h3 className="titulo-modal" style={{ marginTop: '0.3rem' }}>
                  {alunoSelecionadoAnamnese.nome}
                </h3>
              </div>
              <button
                onClick={() => setAlunoSelecionadoAnamnese(null)}
                style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}
              >
                <IconeFechar tamanho={20} />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem', fontSize: '0.9rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', background: '#0e1224', padding: '1rem', borderRadius: '12px' }}>
                <div>
                  <span style={{ color: '#64748b', fontSize: '0.75rem' }}>E-mail:</span>
                  <p style={{ fontWeight: 600 }}>{alunoSelecionadoAnamnese.email}</p>
                </div>
                <div>
                  <span style={{ color: '#64748b', fontSize: '0.75rem' }}>WhatsApp / Contato:</span>
                  <p style={{ fontWeight: 600, color: '#38bdf8' }}>{alunoSelecionadoAnamnese.anamnese.contato}</p>
                </div>
                <div>
                  <span style={{ color: '#64748b', fontSize: '0.75rem' }}>Idade:</span>
                  <p style={{ fontWeight: 600 }}>{alunoSelecionadoAnamnese.anamnese.idade} anos</p>
                </div>
                <div>
                  <span style={{ color: '#64748b', fontSize: '0.75rem' }}>Peso e Altura:</span>
                  <p style={{ fontWeight: 600 }}>
                    {alunoSelecionadoAnamnese.anamnese.peso} kg • {alunoSelecionadoAnamnese.anamnese.altura} cm
                  </p>
                </div>
              </div>

              <div>
                <strong style={{ color: '#ff2e7e' }}>Relação com atividade física:</strong>
                <p style={{ color: '#cbd5e1', marginTop: '0.2rem' }}>
                  {alunoSelecionadoAnamnese.anamnese.relacaoAtividade}
                </p>
              </div>

              <div>
                <strong style={{ color: '#ff2e7e' }}>Objetivo Principal:</strong>
                <p style={{ color: '#ffffff', fontWeight: 600, marginTop: '0.2rem' }}>
                  {alunoSelecionadoAnamnese.anamnese.objetivoPrincipal}
                  {alunoSelecionadoAnamnese.anamnese.outroObjetivo && ` - ${alunoSelecionadoAnamnese.anamnese.outroObjetivo}`}
                </p>
              </div>

              <div>
                <strong style={{ color: '#ff2e7e' }}>Nível de conhecimento sobre treinamento (0 a 10):</strong>
                <p style={{ color: '#cbd5e1', marginTop: '0.2rem' }}>
                  Nota: <strong>{alunoSelecionadoAnamnese.anamnese.nivelConhecimentoTreino} / 10</strong>
                  {alunoSelecionadoAnamnese.anamnese.historicoTreino && ` — "${alunoSelecionadoAnamnese.anamnese.historicoTreino}"`}
                </p>
              </div>

              <div>
                <strong style={{ color: '#ff2e7e' }}>Local de treino:</strong>
                <p style={{ color: '#cbd5e1', marginTop: '0.2rem' }}>{alunoSelecionadoAnamnese.anamnese.localTreino}</p>
              </div>

              <div style={{ background: 'rgba(239, 68, 68, 0.08)', border: '1px solid rgba(239, 68, 68, 0.25)', padding: '1rem', borderRadius: '10px' }}>
                <strong style={{ color: '#f87171' }}>Atenção Médica e Lesões:</strong>
                <ul style={{ marginTop: '0.5rem', paddingLeft: '1.2rem', color: '#fca5a5' }}>
                  <li>
                    Restrição médica: <strong>{alunoSelecionadoAnamnese.anamnese.possuiRestricaoMedica}</strong>
                    {alunoSelecionadoAnamnese.anamnese.descricaoRestricaoMedica && ` - ${alunoSelecionadoAnamnese.anamnese.descricaoRestricaoMedica}`}
                  </li>
                  <li>
                    Lesão / Dor Crônica: <strong>{alunoSelecionadoAnamnese.anamnese.possuiLesaoDorCronica}</strong>
                    {alunoSelecionadoAnamnese.anamnese.descricaoLesaoDorCronica && ` - ${alunoSelecionadoAnamnese.anamnese.descricaoLesaoDorCronica}`}
                  </li>
                  <li>
                    Doenças relatadas: {alunoSelecionadoAnamnese.anamnese.possuiDoenca.join(', ') || 'Nenhuma'}
                    {alunoSelecionadoAnamnese.anamnese.outraDoenca && ` (${alunoSelecionadoAnamnese.anamnese.outraDoenca})`}
                  </li>
                </ul>
              </div>

              <div>
                <strong style={{ color: '#38bdf8' }}>Disponibilidade semanal:</strong>
                <p style={{ color: '#cbd5e1', marginTop: '0.2rem' }}>
                  {alunoSelecionadoAnamnese.anamnese.disponibilidadeTreino.join(', ')}
                  {alunoSelecionadoAnamnese.anamnese.horarioPreferencial && ` • Horário: ${alunoSelecionadoAnamnese.anamnese.horarioPreferencial}`}
                </p>
              </div>

              {alunoSelecionadoAnamnese.anamnese.informacoesRelevantes && (
                <div>
                  <strong style={{ color: '#64748b' }}>Informações adicionais do aluno:</strong>
                  <p style={{ color: '#cbd5e1', fontStyle: 'italic', marginTop: '0.2rem' }}>
                    "{alunoSelecionadoAnamnese.anamnese.informacoesRelevantes}"
                  </p>
                </div>
              )}
            </div>

            <div style={{ marginTop: '1.8rem', display: 'flex', justifyContent: 'flex-end', gap: '0.8rem' }}>
              <button className="botao-secundario" onClick={() => setAlunoSelecionadoAnamnese(null)}>
                Fechar
              </button>
              <button
                className="botao-primario"
                onClick={() => {
                  const a = alunoSelecionadoAnamnese;
                  setAlunoSelecionadoAnamnese(null);
                  iniciarPrescricao(a);
                }}
              >
                <IconeEditar tamanho={16} />
                <span>Prescrever Ficha para {alunoSelecionadoAnamnese.nome.split(' ')[0]}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Construtor de Fichas de Treino da Professora Sara */}
      {alunoParaPrescrever && (
        <div className="overlay-modal" onClick={() => setAlunoParaPrescrever(null)}>
          <div className="conteudo-modal" style={{ maxWidth: '820px' }} onClick={(e) => e.stopPropagation()}>
            <div className="cabecalho-modal">
              <div>
                <span className="badge badge-primaria">Prescrição de Treino</span>
                <h3 className="titulo-modal" style={{ marginTop: '0.3rem' }}>
                  Montar Treino: {alunoParaPrescrever.nome}
                </h3>
              </div>
              <button
                onClick={() => setAlunoParaPrescrever(null)}
                style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}
              >
                <IconeFechar tamanho={20} />
              </button>
            </div>

            {/* Cabeçalho da Ficha */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.2rem' }}>
              <div className="grupo-campo">
                <label className="rotulo-campo">Título da Ficha / Fase</label>
                <input
                  type="text"
                  className="campo-texto"
                  value={tituloFicha}
                  placeholder="Ex: Fase 1 - Adaptação & Glúteos"
                  onChange={(e) => setTituloFicha(e.target.value)}
                />
              </div>

              <div className="grupo-campo">
                <label className="rotulo-campo">Orientações Gerais da Sara</label>
                <input
                  type="text"
                  className="campo-texto"
                  value={observacoesFicha}
                  placeholder="Ex: Respeitar 60s de intervalo e beber 2L de água."
                  onChange={(e) => setObservacoesFicha(e.target.value)}
                />
              </div>
            </div>

            {/* Abas das Divisões de Treino (Treino A, Treino B...) */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', overflowX: 'auto' }}>
              {divisoesEmEdicao.map((div, idx) => (
                <button
                  key={div.id}
                  onClick={() => setDivisaoAbertaIndex(idx)}
                  style={{
                    padding: '0.6rem 1rem',
                    borderRadius: '10px',
                    border: divisaoAbertaIndex === idx ? '1px solid #ff2e7e' : '1px solid #28325c',
                    background: divisaoAbertaIndex === idx ? 'rgba(255, 46, 126, 0.15)' : '#0e1224',
                    color: divisaoAbertaIndex === idx ? '#ffffff' : '#94a3b8',
                    cursor: 'pointer',
                    fontWeight: 700,
                    fontSize: '0.85rem'
                  }}
                >
                  {div.identificador} ({div.exercicios.length})
                </button>
              ))}

              <button
                onClick={adicionarNovaDivisao}
                style={{
                  padding: '0.55rem 0.8rem',
                  borderRadius: '10px',
                  border: '1px dashed #38bdf8',
                  background: 'rgba(56, 189, 248, 0.1)',
                  color: '#38bdf8',
                  cursor: 'pointer',
                  fontWeight: 600,
                  fontSize: '0.82rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.3rem'
                }}
              >
                <IconeMais tamanho={16} />
                <span>Nova Divisão</span>
              </button>
            </div>

            {/* Configuração da Divisão Selecionada */}
            {divisoesEmEdicao[divisaoAbertaIndex] && (
              <div style={{ background: '#0e1224', padding: '1.2rem', borderRadius: '14px', border: '1px solid #28325c' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.2rem' }}>
                  <div className="grupo-campo">
                    <label className="rotulo-campo">Nome da Divisão</label>
                    <input
                      type="text"
                      className="campo-texto"
                      value={divisoesEmEdicao[divisaoAbertaIndex].titulo}
                      onChange={(e) => {
                        const novas = [...divisoesEmEdicao];
                        novas[divisaoAbertaIndex].titulo = e.target.value;
                        setDivisoesEmEdicao(novas);
                      }}
                    />
                  </div>

                  <div className="grupo-campo">
                    <label className="rotulo-campo">Frequência Sugerida</label>
                    <input
                      type="text"
                      className="campo-texto"
                      placeholder="Ex: Segunda e Sexta"
                      value={divisoesEmEdicao[divisaoAbertaIndex].frequenciaSugerida || ''}
                      onChange={(e) => {
                        const novas = [...divisoesEmEdicao];
                        novas[divisaoAbertaIndex].frequenciaSugerida = e.target.value;
                        setDivisoesEmEdicao(novas);
                      }}
                    />
                  </div>
                </div>

                {/* Lista de Exercícios na Divisão */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.8rem' }}>
                  <h4 style={{ color: '#ffffff', fontSize: '0.95rem' }}>
                    Exercícios do {divisoesEmEdicao[divisaoAbertaIndex].identificador}
                  </h4>
                  <button
                    className="botao-primario"
                    onClick={() => setModalBibliotecaAberta(true)}
                    style={{ padding: '0.4rem 0.8rem', fontSize: '0.82rem' }}
                  >
                    <IconeMais tamanho={16} />
                    <span>Adicionar Exercício da Biblioteca</span>
                  </button>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                  {divisoesEmEdicao[divisaoAbertaIndex].exercicios.length === 0 ? (
                    <div style={{ padding: '1.5rem', textAlign: 'center', color: '#64748b', border: '1px dashed #28325c', borderRadius: '10px' }}>
                      Nenhum exercício adicionado a esta divisão ainda. Clique no botão acima para escolher da biblioteca.
                    </div>
                  ) : (
                    divisoesEmEdicao[divisaoAbertaIndex].exercicios.map((itemEx, idxEx) => (
                      <div
                        key={itemEx.id}
                        style={{
                          background: '#141930',
                          border: '1px solid #28325c',
                          borderRadius: '10px',
                          padding: '0.8rem 1rem',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '0.6rem'
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <span style={{ fontWeight: 800, color: '#ff2e7e' }}>#{idxEx + 1}</span>
                            <span style={{ fontWeight: 700, color: '#ffffff' }}>{itemEx.nome}</span>
                            <span className="badge badge-ciano">{itemEx.grupamento}</span>
                          </div>
                          <button
                            onClick={() => removerExercicio(divisaoAbertaIndex, idxEx)}
                            style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '4px' }}
                            title="Remover este exercício"
                          >
                            <IconeLixeira tamanho={18} />
                          </button>
                        </div>

                        {/* Parâmetros do Exercício: Séries, Reps, Carga, Intervalo */}
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '0.6rem' }}>
                          <div>
                            <label style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Séries</label>
                            <input
                              type="number"
                              min="1"
                              max="10"
                              className="campo-texto"
                              style={{ padding: '0.4rem 0.6rem', fontSize: '0.85rem' }}
                              value={itemEx.series}
                              onChange={(e) => {
                                const novas = [...divisoesEmEdicao];
                                novas[divisaoAbertaIndex].exercicios[idxEx].series = parseInt(e.target.value) || 1;
                                setDivisoesEmEdicao(novas);
                              }}
                            />
                          </div>

                          <div>
                            <label style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Repetições</label>
                            <input
                              type="text"
                              className="campo-texto"
                              style={{ padding: '0.4rem 0.6rem', fontSize: '0.85rem' }}
                              value={itemEx.repeticoes}
                              placeholder="Ex: 10 a 12"
                              onChange={(e) => {
                                const novas = [...divisoesEmEdicao];
                                novas[divisaoAbertaIndex].exercicios[idxEx].repeticoes = e.target.value;
                                setDivisoesEmEdicao(novas);
                              }}
                            />
                          </div>

                          <div>
                            <label style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Carga Sugerida (kg)</label>
                            <input
                              type="text"
                              className="campo-texto"
                              style={{ padding: '0.4rem 0.6rem', fontSize: '0.85rem' }}
                              value={itemEx.cargaKg || ''}
                              placeholder="Ex: 25"
                              onChange={(e) => {
                                const novas = [...divisoesEmEdicao];
                                novas[divisaoAbertaIndex].exercicios[idxEx].cargaKg = e.target.value;
                                setDivisoesEmEdicao(novas);
                              }}
                            />
                          </div>

                          <div>
                            <label style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Descanso (segundos)</label>
                            <input
                              type="number"
                              step="5"
                              className="campo-texto"
                              style={{ padding: '0.4rem 0.6rem', fontSize: '0.85rem' }}
                              value={itemEx.intervaloSegundos}
                              onChange={(e) => {
                                const novas = [...divisoesEmEdicao];
                                novas[divisaoAbertaIndex].exercicios[idxEx].intervaloSegundos = parseInt(e.target.value) || 60;
                                setDivisoesEmEdicao(novas);
                              }}
                            />
                          </div>
                        </div>

                        <div>
                          <input
                            type="text"
                            className="campo-texto"
                            style={{ padding: '0.4rem 0.6rem', fontSize: '0.82rem' }}
                            placeholder="Observação da Sara (Ex: Cadência 3010, pausa no pico...)"
                            value={itemEx.observacoes || ''}
                            onChange={(e) => {
                              const novas = [...divisoesEmEdicao];
                              novas[divisaoAbertaIndex].exercicios[idxEx].observacoes = e.target.value;
                              setDivisoesEmEdicao(novas);
                            }}
                          />
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            {/* Ações Finais da Prescrição */}
            <div style={{ marginTop: '1.8rem', display: 'flex', justifyContent: 'flex-end', gap: '0.8rem' }}>
              <button className="botao-secundario" onClick={() => setAlunoParaPrescrever(null)}>
                Cancelar
              </button>
              <button className="botao-primario" onClick={salvarFicha}>
                <IconeCheck tamanho={18} />
                <span>Salvar e Disponibilizar Ficha ao Aluno</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Selecionador da Biblioteca de Exercícios */}
      {modalBibliotecaAberta && (
        <div className="overlay-modal" onClick={() => setModalBibliotecaAberta(false)}>
          <div className="conteudo-modal" style={{ maxWidth: '640px' }} onClick={(e) => e.stopPropagation()}>
            <div className="cabecalho-modal">
              <div>
                <span className="badge badge-ciano">Biblioteca Shara-EF</span>
                <h3 className="titulo-modal" style={{ marginTop: '0.2rem' }}>
                  Selecionar Exercício
                </h3>
              </div>
              <button
                onClick={() => setModalBibliotecaAberta(false)}
                style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}
              >
                <IconeFechar tamanho={20} />
              </button>
            </div>

            {/* Filtros por Grupamento Muscular */}
            <div style={{ display: 'flex', gap: '0.4rem', overflowX: 'auto', paddingBottom: '0.6rem', marginBottom: '0.8rem' }}>
              {['Todos', 'Quadríceps', 'Glúteos', 'Posteriores', 'Costas', 'Peitoral', 'Ombros', 'Bíceps', 'Tríceps', 'Abdômen', 'Cárdio'].map((grp) => (
                <button
                  key={grp}
                  onClick={() => setFiltroGrupamento(grp)}
                  style={{
                    padding: '0.4rem 0.8rem',
                    borderRadius: '8px',
                    border: filtroGrupamento === grp ? '1px solid #ff2e7e' : '1px solid #28325c',
                    background: filtroGrupamento === grp ? 'rgba(255, 46, 126, 0.2)' : '#0c0f1d',
                    color: filtroGrupamento === grp ? '#ff2e7e' : '#94a3b8',
                    fontSize: '0.78rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    whiteSpace: 'nowrap'
                  }}
                >
                  {grp}
                </button>
              ))}
            </div>

            <input
              type="text"
              className="campo-texto"
              placeholder="Pesquisar por nome do exercício..."
              value={buscaExercicio}
              onChange={(e) => setBuscaExercicio(e.target.value)}
              style={{ marginBottom: '1rem' }}
            />

            <div style={{ maxHeight: '380px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
              {exerciciosBibliotecaFiltrados.map((ex) => (
                <div
                  key={ex.id}
                  onClick={() => adicionarExercicioParaDivisao(ex)}
                  style={{
                    background: '#0e1224',
                    border: '1px solid #28325c',
                    padding: '0.8rem 1rem',
                    borderRadius: '10px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.borderColor = '#ff2e7e')}
                  onMouseLeave={(e) => (e.currentTarget.style.borderColor = '#28325c')}
                >
                  <div>
                    <div style={{ fontWeight: 700, color: '#ffffff', fontSize: '0.95rem' }}>{ex.nome}</div>
                    <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
                      {ex.equipamento} • {ex.instrucoes}
                    </div>
                  </div>
                  <span className="badge badge-primaria">
                    <IconeMais tamanho={14} /> Adicionar
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
      {/* Modal de Configuração do Domínio da API / VPS */}
      {modalConfigApiAberta && (
        <div className="overlay-modal" onClick={() => setModalConfigApiAberta(false)}>
          <div className="conteudo-modal" style={{ maxWidth: '560px' }} onClick={(e) => e.stopPropagation()}>
            <div className="cabecalho-modal">
              <div>
                <span className="badge badge-ciano">Infraestrutura VPS</span>
                <h3 className="titulo-modal" style={{ marginTop: '0.2rem' }}>
                  Configuração de Conexão da API
                </h3>
              </div>
              <button
                onClick={() => setModalConfigApiAberta(false)}
                style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}
              >
                <IconeFechar tamanho={20} />
              </button>
            </div>

            <p style={{ color: '#94a3b8', fontSize: '0.88rem', marginBottom: '1.2rem', lineHeight: 1.6 }}>
              O banco de dados e a API estão hospedados na sua VPS em container Docker. Você pode alterar o domínio a qualquer momento abaixo:
            </p>

            <div className="grupo-campo">
              <label className="rotulo-campo">Endereço da API (Domínio / Host)</label>
              <input
                type="text"
                className="campo-texto"
                value={urlApiInput}
                placeholder="https://matrix.vlfp.com.br"
                onChange={(e) => {
                  setUrlApiInput(e.target.value);
                  setResultadoTesteApi(null);
                }}
              />
              <span style={{ fontSize: '0.78rem', color: '#64748b', marginTop: '0.3rem' }}>
                Domínio atual configurado: <code>{ServicoArmazenamento.obterUrlApi()}</code>
              </span>
            </div>

            {resultadoTesteApi && (
              <div
                style={{
                  background: resultadoTesteApi.sucesso ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                  border: resultadoTesteApi.sucesso ? '1px solid #10b981' : '1px solid #ef4444',
                  color: resultadoTesteApi.sucesso ? '#6ee7b7' : '#fca5a5',
                  padding: '0.8rem 1rem',
                  borderRadius: '10px',
                  fontSize: '0.88rem',
                  marginBottom: '1rem'
                }}
              >
                <strong>{resultadoTesteApi.sucesso ? '✅ Sucesso:' : '❌ Erro:'}</strong> {resultadoTesteApi.mensagem}
                {resultadoTesteApi.detalhe && (
                  <div style={{ fontSize: '0.8rem', opacity: 0.85, marginTop: '0.3rem' }}>
                    Detalhe: {resultadoTesteApi.detalhe}
                  </div>
                )}
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1.5rem', gap: '0.8rem', flexWrap: 'wrap' }}>
              <button
                type="button"
                className="botao-secundario"
                disabled={testandoApi}
                onClick={testarConexao}
                style={{ fontSize: '0.85rem' }}
              >
                {testandoApi ? 'Testando Conexão...' : '🔍 Testar Conexão Agora'}
              </button>

              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button
                  type="button"
                  className="botao-secundario"
                  onClick={() => setModalConfigApiAberta(false)}
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  className="botao-primario"
                  onClick={salvarNovoDominio}
                >
                  Salvar Domínio
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Edição de Aluno */}
      {alunoParaEditar && (
        <div className="overlay-modal" onClick={() => setAlunoParaEditar(null)}>
          <div className="conteudo-modal" style={{ maxWidth: '580px' }} onClick={(e) => e.stopPropagation()}>
            <div className="cabecalho-modal">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <div
                  style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '8px',
                    background: '#ff2e7e',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <IconeEditar tamanho={18} cor="#fff" />
                </div>
                <h3 className="titulo-modal">Editar Aluno</h3>
              </div>
              <button
                onClick={() => setAlunoParaEditar(null)}
                style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: '4px' }}
              >
                <IconeFechar tamanho={20} />
              </button>
            </div>

            <form onSubmit={salvarAlteracoesAluno} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div className="grupo-campo">
                <label className="rotulo-campo">Nome Completo</label>
                <input
                  type="text"
                  className="campo-texto"
                  required
                  value={nomeEdicao}
                  onChange={(e) => setNomeEdicao(e.target.value)}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
                <div className="grupo-campo">
                  <label className="rotulo-campo">E-mail de Acesso</label>
                  <input
                    type="email"
                    className="campo-texto"
                    required
                    value={emailEdicao}
                    onChange={(e) => setEmailEdicao(e.target.value)}
                  />
                </div>

                <div className="grupo-campo">
                  <label className="rotulo-campo">Contato / WhatsApp</label>
                  <input
                    type="text"
                    className="campo-texto"
                    value={contatoEdicao}
                    onChange={(e) => setContatoEdicao(e.target.value)}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.8rem' }}>
                <div className="grupo-campo">
                  <label className="rotulo-campo">Idade (anos)</label>
                  <input
                    type="text"
                    className="campo-texto"
                    value={idadeEdicao}
                    onChange={(e) => setIdadeEdicao(e.target.value)}
                  />
                </div>

                <div className="grupo-campo">
                  <label className="rotulo-campo">Peso (kg)</label>
                  <input
                    type="text"
                    className="campo-texto"
                    value={pesoEdicao}
                    onChange={(e) => setPesoEdicao(e.target.value)}
                  />
                </div>

                <div className="grupo-campo">
                  <label className="rotulo-campo">Altura (cm)</label>
                  <input
                    type="text"
                    className="campo-texto"
                    value={alturaEdicao}
                    onChange={(e) => setAlturaEdicao(e.target.value)}
                  />
                </div>
              </div>

              <div className="grupo-campo">
                <label className="rotulo-campo">Objetivo Principal</label>
                <input
                  type="text"
                  className="campo-texto"
                  value={objetivoEdicao}
                  onChange={(e) => setObjetivoEdicao(e.target.value)}
                />
              </div>

              <div className="grupo-campo">
                <label className="rotulo-campo">Status do Acesso</label>
                <select
                  className="campo-texto"
                  value={statusEdicao}
                  onChange={(e) => setStatusEdicao(e.target.value as 'ativo' | 'inativo' | 'aguardando_ficha')}
                  style={{ cursor: 'pointer' }}
                >
                  <option value="ativo">Treino Ativo (Acesso Liberado)</option>
                  <option value="aguardando_ficha">Aguardando Prescrição</option>
                  <option value="inativo">Acesso Desativado (Bloquear Login)</option>
                </select>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.8rem', marginTop: '0.5rem' }}>
                <button
                  type="button"
                  className="botao-secundario"
                  onClick={() => setAlunoParaEditar(null)}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="botao-primario"
                  disabled={salvandoEdicao}
                >
                  {salvandoEdicao ? 'Salvando...' : 'Salvar Alterações'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal de Confirmação de Exclusão de Aluno */}
      {alunoParaExcluir && (
        <div className="overlay-modal" onClick={() => setAlunoParaExcluir(null)}>
          <div className="conteudo-modal" style={{ maxWidth: '480px' }} onClick={(e) => e.stopPropagation()}>
            <div className="cabecalho-modal">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <div
                  style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '8px',
                    background: 'rgba(239, 68, 68, 0.2)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <IconeLixeira tamanho={18} cor="#ef4444" />
                </div>
                <h3 className="titulo-modal" style={{ color: '#fca5a5' }}>Confirmar Exclusão</h3>
              </div>
              <button
                onClick={() => setAlunoParaExcluir(null)}
                style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: '4px' }}
              >
                <IconeFechar tamanho={20} />
              </button>
            </div>

            <div style={{ marginBottom: '1.5rem', color: '#cbd5e1', fontSize: '0.9rem', lineHeight: 1.6 }}>
              <p style={{ marginBottom: '0.8rem' }}>
                Tem certeza que deseja excluir o(a) aluno(a) <strong>{alunoParaExcluir.nome}</strong> (<code>{alunoParaExcluir.email}</code>)?
              </p>
              <div
                style={{
                  background: 'rgba(239, 68, 68, 0.1)',
                  border: '1px solid rgba(239, 68, 68, 0.3)',
                  padding: '0.8rem',
                  borderRadius: '8px',
                  fontSize: '0.82rem',
                  color: '#fca5a5'
                }}
              >
                ⚠️ Todos os dados cadastrais, respostas de anamnese e histórico de treinos prescritos serão removidos permanentemente.
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.8rem' }}>
              <button
                type="button"
                className="botao-secundario"
                disabled={excluindoAluno}
                onClick={() => setAlunoParaExcluir(null)}
              >
                Cancelar
              </button>
              <button
                type="button"
                disabled={excluindoAluno}
                onClick={confirmarExclusaoAluno}
                style={{
                  background: '#ef4444',
                  border: 'none',
                  color: '#ffffff',
                  padding: '0.6rem 1.2rem',
                  borderRadius: '10px',
                  fontWeight: 700,
                  fontSize: '0.9rem',
                  cursor: 'pointer'
                }}
              >
                {excluindoAluno ? 'Excluindo...' : 'Sim, Excluir Aluno'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
