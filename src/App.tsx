import React, { useEffect, useState } from 'react';
import { Cabecalho } from './componentes/cabecalho/Cabecalho';
import { ModalPrivacidade } from './componentes/modal_privacidade/ModalPrivacidade';
import { ServicoArmazenamento } from './servicos/armazenamento';
import { TelaApresentacao } from './telas/apresentacao/TelaApresentacao';
import { ModalLogin } from './telas/login/ModalLogin';
import { ModalLoginProfessor } from './telas/login/ModalLoginProfessor';
import { TelaNovoAluno } from './telas/novo_aluno/TelaNovoAluno';
import { PainelAluno } from './telas/painel_aluno/PainelAluno';
import { PainelProfessor } from './telas/painel_professor/PainelProfessor';
import { UsuarioAluno, UsuarioSessao } from './tipos';

export const App: React.FC = () => {
  const [usuario, setUsuario] = useState<UsuarioSessao | null>(null);
  const [alunoSimulado, setAlunoSimulado] = useState<UsuarioAluno | null>(null);
  const [telaAtual, setTelaAtual] = useState<'apresentacao' | 'novo_aluno' | 'painel'>('apresentacao');
  const [modalLoginAlunoAberto, setModalLoginAlunoAberto] = useState<boolean>(false);
  const [modalLoginProfessorAberto, setModalLoginProfessorAberto] = useState<boolean>(false);
  const [modalPrivacidadeAberto, setModalPrivacidadeAberto] = useState<boolean>(false);

  // Inicializar estado a partir do armazenamento local
  useEffect(() => {
    ServicoArmazenamento.inicializar();
    const sessaoSalva = ServicoArmazenamento.obterSessao();
    if (sessaoSalva) {
      setUsuario(sessaoSalva);
      setTelaAtual('painel');

      if (sessaoSalva.papel === 'professor') {
        const simulado = ServicoArmazenamento.obterAlunoSimulado();
        if (simulado) setAlunoSimulado(simulado);
      }
    }

    // Configurar estado raiz no histórico se ainda não existir
    if (!window.history.state) {
      window.history.replaceState({ tela: sessaoSalva ? 'painel' : 'apresentacao' }, '');
    }
  }, []);

  // Interceptador global do botão "Voltar" (Hardware Android / Navegador)
  useEffect(() => {
    const tratarPopState = (evento: PopStateEvent) => {
      const estado = evento.state;

      // 1. Fechar modais abertos antes de navegar
      if (modalPrivacidadeAberto) {
        setModalPrivacidadeAberto(false);
        return;
      }

      if (modalLoginProfessorAberto) {
        setModalLoginProfessorAberto(false);
        return;
      }

      if (modalLoginAlunoAberto) {
        setModalLoginAlunoAberto(false);
        return;
      }

      // 2. Desativar modo simulado se estiver ativo
      if (alunoSimulado) {
        ServicoArmazenamento.desativarModoSimulacao();
        setAlunoSimulado(null);
        return;
      }

      // 3. Gerenciamento de tela novo_aluno (etapas são geridas pelo próprio componente)
      if (telaAtual === 'novo_aluno') {
        if (!estado || estado.tela !== 'novo_aluno') {
          setTelaAtual('apresentacao');
        }
        return;
      }

      // 4. Se houver tela especificada no estado do histórico
      if (estado && estado.tela) {
        setTelaAtual(estado.tela);
      }
    };

    window.addEventListener('popstate', tratarPopState);
    return () => {
      window.removeEventListener('popstate', tratarPopState);
    };
  }, [
    modalPrivacidadeAberto,
    modalLoginProfessorAberto,
    modalLoginAlunoAberto,
    alunoSimulado,
    telaAtual
  ]);

  // Handlers com integração ao histórico de navegação
  const abrirLoginProfessora = () => {
    window.history.pushState({ modal: 'login_professor' }, '');
    setModalLoginProfessorAberto(true);
  };

  const fecharLoginProfessora = () => {
    setModalLoginProfessorAberto(false);
    if (window.history.state?.modal === 'login_professor') {
      window.history.back();
    }
  };

  const abrirLoginAluno = () => {
    window.history.pushState({ modal: 'login_aluno' }, '');
    setModalLoginAlunoAberto(true);
  };

  const fecharLoginAluno = () => {
    setModalLoginAlunoAberto(false);
    if (window.history.state?.modal === 'login_aluno') {
      window.history.back();
    }
  };

  const abrirModalPrivacidade = () => {
    window.history.pushState({ modal: 'privacidade' }, '');
    setModalPrivacidadeAberto(true);
  };

  const fecharModalPrivacidade = () => {
    setModalPrivacidadeAberto(false);
    if (window.history.state?.modal === 'privacidade') {
      window.history.back();
    }
  };

  const iniciarNovoAluno = () => {
    window.history.pushState({ tela: 'novo_aluno', etapa: 1 }, '');
    setTelaAtual('novo_aluno');
  };

  const cancelarNovoAluno = () => {
    setTelaAtual('apresentacao');
    if (window.history.state?.tela === 'novo_aluno') {
      window.history.back();
    }
  };

  const encerrarSessao = () => {
    ServicoArmazenamento.encerrarSessao();
    setUsuario(null);
    setAlunoSimulado(null);
    setTelaAtual('apresentacao');
    window.history.replaceState({ tela: 'apresentacao' }, '');
  };

  const tratarSucessoLogin = (usuarioAutenticado: UsuarioSessao) => {
    setUsuario(usuarioAutenticado);
    setAlunoSimulado(null);
    setTelaAtual('painel');
    window.history.replaceState({ tela: 'painel' }, '');
  };

  const tratarConclusaoNovoAluno = (novoAluno: UsuarioAluno) => {
    // Aluno criado com sucesso, inicia autenticado
    ServicoArmazenamento.definirSessao(novoAluno);
    setUsuario(novoAluno);
    setAlunoSimulado(null);
    setTelaAtual('painel');
    window.history.replaceState({ tela: 'painel' }, '');
  };

  // Modo Aluno Ativado pela Professora Sara
  const ativarModoAluno = (alunoId: string) => {
    const aluno = ServicoArmazenamento.obterAlunoPorId(alunoId);
    if (aluno) {
      ServicoArmazenamento.ativarModoSimulacao(alunoId);
      window.history.pushState({ modo: 'aluno_simulado' }, '');
      setAlunoSimulado(aluno);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const desativarModoAluno = () => {
    ServicoArmazenamento.desativarModoSimulacao();
    setAlunoSimulado(null);
    if (window.history.state?.modo === 'aluno_simulado') {
      window.history.back();
    }
  };

  const irParaInicio = () => {
    if (usuario) {
      setTelaAtual('painel');
    } else {
      setTelaAtual('apresentacao');
    }
  };

  return (
    <>
      {/* Cabeçalho Fixo */}
      <Cabecalho
        usuario={usuario}
        alunoSimulado={alunoSimulado}
        aoAbrirLoginAluno={abrirLoginAluno}
        aoEncerrarSessao={encerrarSessao}
        aoSairModoSimulacao={desativarModoAluno}
        aoNavegarInicio={irParaInicio}
      />

      {/* Conteúdo Central */}
      <main className="conteudo-principal">
        {usuario ? (
          <>
            {usuario.papel === 'professor' ? (
              alunoSimulado ? (
                <PainelAluno
                  aluno={alunoSimulado}
                  aoAtualizarAluno={(alunoAtualizado) => setAlunoSimulado(alunoAtualizado)}
                />
              ) : (
                <PainelProfessor aoAtivarModoAluno={ativarModoAluno} />
              )
            ) : (
              <PainelAluno
                aluno={usuario as UsuarioAluno}
                aoAtualizarAluno={(alunoAtualizado) => setUsuario(alunoAtualizado)}
              />
            )}
          </>
        ) : (
          <>
            {telaAtual === 'novo_aluno' ? (
              <TelaNovoAluno
                aoConcluirCadastro={tratarConclusaoNovoAluno}
                aoCancelar={cancelarNovoAluno}
              />
            ) : (
              <TelaApresentacao
                aoIniciarNovoAluno={iniciarNovoAluno}
                aoAbrirLoginAluno={abrirLoginAluno}
              />
            )}
          </>
        )}
      </main>

      {/* Modal de Login de Aluno */}
      {modalLoginAlunoAberto && (
        <ModalLogin
          aoFechar={fecharLoginAluno}
          aoSucessoLogin={tratarSucessoLogin}
          aoAbrirNovoAluno={() => {
            fecharLoginAluno();
            iniciarNovoAluno();
          }}
        />
      )}

      {/* Modal de Login da Professora Sara (acionado pelo Logo VLFP Info) */}
      {modalLoginProfessorAberto && (
        <ModalLoginProfessor
          aoFechar={fecharLoginProfessora}
          aoSucessoLogin={tratarSucessoLogin}
        />
      )}

      {/* Modal de Privacidade e LGPD */}
      {modalPrivacidadeAberto && (
        <ModalPrivacidade aoFechar={fecharModalPrivacidade} />
      )}

      {/* Rodapé LGPD e Marca com Logo VLFP Info (50px de altura) */}
      {usuario?.papel !== 'aluno' && !alunoSimulado && (
        <footer className="rodape-aplicativo">
          <div
            className="rodape-links"
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '0.65rem'
            }}
          >
            <button
              type="button"
              onClick={abrirModalPrivacidade}
              style={{
                background: 'none',
                border: 'none',
                color: '#38bdf8',
                cursor: 'pointer',
                fontSize: '0.82rem',
                textDecoration: 'underline'
              }}
            >
              Política de Privacidade & LGPD
            </button>

            {/* Logo VLFP Info com 50px de altura e gatilho de login para a professora */}
            <div
              onClick={abrirLoginProfessora}
              role="button"
              tabIndex={0}
              title="Acesso da Professora Sara"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.65rem',
                cursor: 'pointer',
                padding: '0.35rem 0.85rem',
                borderRadius: '10px',
                background: 'rgba(255, 255, 255, 0.03)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                transition: 'all 0.2s ease',
                userSelect: 'none'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)';
                e.currentTarget.style.borderColor = 'rgba(255, 46, 126, 0.4)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.03)';
                e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.08)';
              }}
            >
              <img
                src="/logo-vlfp.png"
                alt="Logo VLFP Info"
                style={{ height: '50px', width: 'auto', display: 'block', objectFit: 'contain' }}
              />
              <span style={{ color: '#cbd5e1', fontSize: '0.85rem', fontWeight: 600 }}>
                Desenvolvido por VLFP Info
              </span>
            </div>
          </div>
          <p style={{ marginTop: '0.55rem' }}>© {new Date().getFullYear()} Shara-EF. Todos os direitos reservados.</p>
        </footer>
      )}
    </>
  );
};
