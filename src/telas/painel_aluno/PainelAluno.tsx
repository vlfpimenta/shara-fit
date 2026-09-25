import React, { useState } from 'react';
import { CronometroDescanso } from '../../componentes/cronometro/CronometroDescanso';
import { IconeCheck, IconeCronometro, IconeHaltere, IconeInformacao } from '../../componentes/icones';
import { ServicoArmazenamento } from '../../servicos/armazenamento';
import { UsuarioAluno } from '../../tipos';

interface PropriedadesPainelAluno {
  aluno: UsuarioAluno;
  aoAtualizarAluno: (alunoAtualizado: UsuarioAluno) => void;
}

export const PainelAluno: React.FC<PropriedadesPainelAluno> = ({ aluno, aoAtualizarAluno }) => {
  const [abaInterna, setAbaInterna] = useState<'treino' | 'anamnese'>('treino');
  const ficha = aluno.fichaAtiva;
  const [divisaoAtivaId, setDivisaoAtivaId] = useState<string>(ficha?.divisoes[0]?.id || '');
  const [tempoDescansoAtivo, setTempoDescansoAtivo] = useState<number>(60);
  const [mostrarCronometro, setMostrarCronometro] = useState<boolean>(true);

  // Divisão selecionada
  const divisaoAtual = ficha?.divisoes.find((d) => d.id === divisaoAtivaId) || ficha?.divisoes[0];

  // Alternar conclusão de série de exercício
  const alternarSerie = (exercicioId: string, indiceSerie: number, estadoAtual: boolean, tempoSugerido: number) => {
    if (!divisaoAtual) return;
    const novoEstado = !estadoAtual;

    ServicoArmazenamento.atualizarProgressoExercicio(aluno.id, divisaoAtual.id, exercicioId, indiceSerie, novoEstado);

    // Atualizar estado local
    const alunoRecarregado = ServicoArmazenamento.obterAlunoPorId(aluno.id);
    if (alunoRecarregado) {
      aoAtualizarAluno(alunoRecarregado);
    }

    // Se concluiu a série, ativa o cronômetro com o tempo de descanso
    if (novoEstado) {
      setTempoDescansoAtivo(tempoSugerido);
      setMostrarCronometro(true);
    }
  };

  // Alterar carga anotada
  const atualizarCarga = (exercicioId: string, indiceSerie: number, novaCarga: string) => {
    if (!divisaoAtual) return;
    ServicoArmazenamento.atualizarProgressoExercicio(
      aluno.id,
      divisaoAtual.id,
      exercicioId,
      indiceSerie,
      false,
      novaCarga
    );
    const alunoRecarregado = ServicoArmazenamento.obterAlunoPorId(aluno.id);
    if (alunoRecarregado) {
      aoAtualizarAluno(alunoRecarregado);
    }
  };

  // Calcular estatísticas da divisão atual
  const calcularProgressoDivisao = () => {
    if (!divisaoAtual || !divisaoAtual.exercicios.length) return { total: 0, concluidas: 0, porcentagem: 0 };
    let totalSeries = 0;
    let seriesConcluidas = 0;

    divisaoAtual.exercicios.forEach((ex) => {
      totalSeries += ex.series;
      if (ex.seriesConcluidas) {
        seriesConcluidas += ex.seriesConcluidas.filter(Boolean).length;
      }
    });

    const porcentagem = totalSeries > 0 ? Math.round((seriesConcluidas / totalSeries) * 100) : 0;
    return { total: totalSeries, concluidas: seriesConcluidas, porcentagem };
  };

  const progresso = calcularProgressoDivisao();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', paddingBottom: '4rem' }}>
      {/* Barra de Boas-vindas e Abas */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: '1rem',
          borderBottom: '1px solid #28325c',
          paddingBottom: '1rem'
        }}
      >
        <div>
          <span style={{ fontSize: '0.8rem', color: '#ff2e7e', fontWeight: 700, textTransform: 'uppercase' }}>
            Área do Aluno
          </span>
          <h2 style={{ fontSize: '1.6rem', color: '#ffffff' }}>Olá, {aluno.nome.split(' ')[0]}! 👋</h2>
          <p style={{ color: '#94a3b8', fontSize: '0.85rem' }}>
            Objetivo: <strong>{aluno.anamnese.objetivoPrincipal}</strong>
          </p>
        </div>

        {/* Alternador de visualização Treino / Anamnese */}
        <div style={{ display: 'flex', background: '#141930', borderRadius: '10px', padding: '4px', border: '1px solid #28325c' }}>
          <button
            onClick={() => setAbaInterna('treino')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              padding: '0.55rem 1rem',
              borderRadius: '8px',
              border: 'none',
              background: abaInterna === 'treino' ? 'var(--gradiente-primario)' : 'transparent',
              color: '#ffffff',
              fontWeight: 600,
              fontSize: '0.85rem',
              cursor: 'pointer'
            }}
          >
            <IconeHaltere tamanho={16} />
            <span>Ficha de Treino</span>
          </button>
          <button
            onClick={() => setAbaInterna('anamnese')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              padding: '0.55rem 1rem',
              borderRadius: '8px',
              border: 'none',
              background: abaInterna === 'anamnese' ? 'rgba(56, 189, 248, 0.2)' : 'transparent',
              color: abaInterna === 'anamnese' ? '#38bdf8' : '#94a3b8',
              fontWeight: 600,
              fontSize: '0.85rem',
              cursor: 'pointer'
            }}
          >
            <IconeInformacao tamanho={16} />
            <span>Minha Anamnese</span>
          </button>
        </div>
      </div>

      {abaInterna === 'treino' ? (
        <>
          {ficha && ficha.divisoes.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              {/* Barra de Seleção de Divisão (Treino A, Treino B, Treino C) */}
              <div style={{ display: 'flex', gap: '0.6rem', overflowX: 'auto', paddingBottom: '0.4rem' }}>
                {ficha.divisoes.map((div) => {
                  const ativa = div.id === (divisaoAtual?.id || '');
                  return (
                    <button
                      key={div.id}
                      onClick={() => setDivisaoAtivaId(div.id)}
                      style={{
                        padding: '0.65rem 1.2rem',
                        borderRadius: '12px',
                        border: ativa ? '1px solid #ff2e7e' : '1px solid #28325c',
                        background: ativa ? 'rgba(255, 46, 126, 0.15)' : '#141930',
                        color: ativa ? '#ffffff' : '#94a3b8',
                        cursor: 'pointer',
                        whiteSpace: 'nowrap',
                        fontWeight: 700,
                        fontSize: '0.9rem',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'flex-start',
                        gap: '2px',
                        transition: 'all 0.2s ease'
                      }}
                    >
                      <span style={{ color: ativa ? '#ff2e7e' : '#64748b', fontSize: '0.75rem', textTransform: 'uppercase' }}>
                        {div.identificador}
                      </span>
                      <span>{div.titulo}</span>
                    </button>
                  );
                })}
              </div>

              {/* Informações da Divisão Atual e Barra de Progresso */}
              {divisaoAtual && (
                <div className="cartao" style={{ padding: '1.2rem 1.5rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.8rem' }}>
                    <div>
                      <h3 style={{ fontSize: '1.3rem', color: '#ffffff' }}>{divisaoAtual.titulo}</h3>
                      {divisaoAtual.frequenciaSugerida && (
                        <p style={{ color: '#94a3b8', fontSize: '0.85rem' }}>
                          Frequência sugerida: {divisaoAtual.frequenciaSugerida}
                        </p>
                      )}
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <span style={{ fontSize: '1.4rem', fontWeight: 800, color: '#ff2e7e' }}>
                        {progresso.porcentagem}%
                      </span>
                      <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                        {progresso.concluidas}/{progresso.total} séries
                      </div>
                    </div>
                  </div>

                  {/* Barra visual de progresso */}
                  <div style={{ width: '100%', height: '8px', background: '#0c0f1d', borderRadius: '9999px', overflow: 'hidden' }}>
                    <div
                      style={{
                        width: `${progresso.porcentagem}%`,
                        height: '100%',
                        background: 'linear-gradient(90deg, #ff2e7e, #38bdf8)',
                        transition: 'width 0.3s ease'
                      }}
                    />
                  </div>
                </div>
              )}

              {/* Lista de Exercícios (Estilo mFit) */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {divisaoAtual?.exercicios.map((ex, indexEx) => (
                  <div
                    key={ex.id}
                    className="cartao"
                    style={{
                      padding: '1.2rem',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '0.9rem',
                      borderLeft: '4px solid #ff2e7e'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.2rem' }}>
                          <span
                            style={{
                              background: '#28325c',
                              color: '#ffffff',
                              fontSize: '0.75rem',
                              fontWeight: 800,
                              width: '22px',
                              height: '22px',
                              borderRadius: '50%',
                              display: 'inline-flex',
                              alignItems: 'center',
                              justifyContent: 'center'
                            }}
                          >
                            {indexEx + 1}
                          </span>
                          <span className="badge badge-ciano">{ex.grupamento}</span>
                        </div>
                        <h4 style={{ fontSize: '1.15rem', color: '#ffffff' }}>{ex.nome}</h4>
                      </div>

                      <div style={{ textAlign: 'right' }}>
                        <span className="badge badge-primaria" style={{ fontSize: '0.8rem' }}>
                          <IconeCronometro tamanho={14} /> {ex.intervaloSegundos}s descanso
                        </span>
                      </div>
                    </div>

                    {ex.observacoes && (
                      <p
                        style={{
                          fontSize: '0.85rem',
                          color: '#cbd5e1',
                          background: 'rgba(255,255,255,0.04)',
                          padding: '0.5rem 0.8rem',
                          borderRadius: '8px',
                          border: '1px dashed #28325c'
                        }}
                      >
                        💡 <strong>Orientação da Sara:</strong> {ex.observacoes}
                      </p>
                    )}

                    {/* Tabela de Séries e Checkboxes (mFit Style) */}
                    <div style={{ overflowX: 'auto' }}>
                      <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.88rem' }}>
                        <thead>
                          <tr style={{ color: '#64748b', borderBottom: '1px solid #28325c' }}>
                            <th style={{ padding: '0.4rem 0.5rem' }}>Série</th>
                            <th style={{ padding: '0.4rem 0.5rem' }}>Repetições</th>
                            <th style={{ padding: '0.4rem 0.5rem' }}>Carga (kg)</th>
                            <th style={{ padding: '0.4rem 0.5rem', textAlign: 'center' }}>Concluir</th>
                          </tr>
                        </thead>
                        <tbody>
                          {Array.from({ length: ex.series }).map((_, iSerie) => {
                            const serieFeita = !!ex.seriesConcluidas?.[iSerie];
                            const cargaGravada = ex.cargasRegistradas?.[iSerie] ?? ex.cargaKg ?? '';

                            return (
                              <tr
                                key={iSerie}
                                style={{
                                  borderBottom: '1px solid rgba(40, 50, 92, 0.5)',
                                  background: serieFeita ? 'rgba(16, 185, 129, 0.08)' : 'transparent',
                                  transition: 'background 0.2s ease'
                                }}
                              >
                                <td style={{ padding: '0.6rem 0.5rem', fontWeight: 700, color: '#ffffff' }}>
                                  #{iSerie + 1}
                                </td>
                                <td style={{ padding: '0.6rem 0.5rem', color: '#94a3b8' }}>{ex.repeticoes}</td>
                                <td style={{ padding: '0.6rem 0.5rem' }}>
                                  <input
                                    type="text"
                                    value={cargaGravada}
                                    placeholder="Ex: 20"
                                    onChange={(e) => atualizarCarga(ex.id, iSerie, e.target.value)}
                                    style={{
                                      width: '65px',
                                      background: '#0c0f1d',
                                      border: '1px solid #28325c',
                                      color: '#ffffff',
                                      padding: '0.3rem 0.5rem',
                                      borderRadius: '6px',
                                      fontSize: '0.85rem'
                                    }}
                                  />
                                </td>
                                <td style={{ padding: '0.6rem 0.5rem', textAlign: 'center' }}>
                                  <button
                                    onClick={() => alternarSerie(ex.id, iSerie, serieFeita, ex.intervaloSegundos)}
                                    style={{
                                      width: '34px',
                                      height: '34px',
                                      borderRadius: '8px',
                                      border: serieFeita ? 'none' : '2px solid #38bdf8',
                                      background: serieFeita ? '#10b981' : 'transparent',
                                      color: '#ffffff',
                                      cursor: 'pointer',
                                      display: 'inline-flex',
                                      alignItems: 'center',
                                      justifyContent: 'center',
                                      transition: 'all 0.2s ease'
                                    }}
                                    title={serieFeita ? 'Desmarcar' : 'Concluir série e iniciar descanso'}
                                  >
                                    {serieFeita ? <IconeCheck tamanho={20} /> : <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#38bdf8' }} />}
                                  </button>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            /* Aluno cadastrado, mas sem treino prescrito ainda */
            <div className="cartao" style={{ textAlign: 'center', padding: '3rem 1.5rem' }}>
              <div
                style={{
                  width: '60px',
                  height: '60px',
                  borderRadius: '50%',
                  background: 'rgba(245, 158, 11, 0.15)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 1rem auto'
                }}
              >
                <IconeCronometro tamanho={30} cor="#f59e0b" />
              </div>
              <h3 style={{ fontSize: '1.35rem', color: '#ffffff', marginBottom: '0.5rem' }}>
                Ficha em Fase de Prescrição!
              </h3>
              <p style={{ color: '#94a3b8', maxWidth: '480px', margin: '0 auto 1.5rem auto', lineHeight: 1.6 }}>
                A professora <strong>Sara</strong> recebeu suas respostas de anamnese e está preparando sua ficha de treinos personalizada.
                Em breve suas divisões e exercícios aparecerão aqui!
              </p>
              <div style={{ display: 'inline-flex', gap: '0.8rem' }}>
                <button
                  className="botao-secundario"
                  onClick={() => setAbaInterna('anamnese')}
                  style={{ fontSize: '0.9rem' }}
                >
                  Revisar Minha Anamnese
                </button>
              </div>
            </div>
          )}
        </>
      ) : (
        /* Visualização da Anamnese Preenchida */
        <div className="cartao" style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
          <div style={{ borderBottom: '1px solid #28325c', paddingBottom: '0.8rem' }}>
            <h3 style={{ fontSize: '1.25rem', color: '#ffffff' }}>Histórico da sua Anamnese</h3>
            <p style={{ color: '#94a3b8', fontSize: '0.85rem' }}>
              Dados preenchidos em: {aluno.anamnese.dataPreenchimento || aluno.dataCadastro}
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
            <div>
              <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Contato:</span>
              <p style={{ fontWeight: 600 }}>{aluno.anamnese.contato}</p>
            </div>
            <div>
              <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Idade / Peso / Altura:</span>
              <p style={{ fontWeight: 600 }}>
                {aluno.anamnese.idade} anos • {aluno.anamnese.peso} kg • {aluno.anamnese.altura} cm
              </p>
            </div>
            <div>
              <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Objetivo:</span>
              <p style={{ fontWeight: 600, color: '#ff2e7e' }}>{aluno.anamnese.objetivoPrincipal}</p>
            </div>
            <div>
              <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Local de Treino:</span>
              <p style={{ fontWeight: 600 }}>{aluno.anamnese.localTreino}</p>
            </div>
          </div>

          <div style={{ borderTop: '1px solid #1c2344', paddingTop: '1rem', display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
            <div>
              <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Restrições Médicas / Lesões:</span>
              <p style={{ fontSize: '0.9rem', color: '#e2e8f0' }}>
                Restrição médica: <strong>{aluno.anamnese.possuiRestricaoMedica}</strong>{' '}
                {aluno.anamnese.descricaoRestricaoMedica && `(${aluno.anamnese.descricaoRestricaoMedica})`}
                <br />
                Lesão ou dor crônica: <strong>{aluno.anamnese.possuiLesaoDorCronica}</strong>{' '}
                {aluno.anamnese.descricaoLesaoDorCronica && `(${aluno.anamnese.descricaoLesaoDorCronica})`}
              </p>
            </div>

            <div>
              <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Disponibilidade de Dias:</span>
              <p style={{ fontSize: '0.9rem', color: '#38bdf8' }}>
                {aluno.anamnese.disponibilidadeTreino?.join(', ') || 'Não especificado'}
              </p>
            </div>

            {aluno.anamnese.informacoesRelevantes && (
              <div>
                <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Observações adicionais informadas:</span>
                <p style={{ fontSize: '0.9rem', color: '#cbd5e1', fontStyle: 'italic' }}>
                  "{aluno.anamnese.informacoesRelevantes}"
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Cronômetro Flutuante mFit */}
      {mostrarCronometro && <CronometroDescanso tempoSugeridoInicial={tempoDescansoAtivo} />}
    </div>
  );
};
