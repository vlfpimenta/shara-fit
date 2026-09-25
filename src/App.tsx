import React, { useEffect, useState } from 'react';
import { Cabecalho } from './componentes/cabecalho/Cabecalho';
import { ServicoArmazenamento } from './servicos/armazenamento';
import { TelaApresentacao } from './telas/apresentacao/TelaApresentacao';
import { ModalLogin } from './telas/login/ModalLogin';
import { TelaNovoAluno } from './telas/novo_aluno/TelaNovoAluno';
import { PainelAluno } from './telas/painel_aluno/PainelAluno';
import { PainelProfessor } from './telas/painel_professor/PainelProfessor';
import { UsuarioAluno, UsuarioSessao } from './tipos';

export const App: React.FC = () => {
  const [usuario, setUsuario] = useState<UsuarioSessao | null>(null);
  const [alunoSimulado, setAlunoSimulado] = useState<UsuarioAluno | null>(null);
  const [telaAtual, setTelaAtual] = useState<'apresentacao' | 'novo_aluno' | 'painel'>('apresentacao');
  const [modalLoginAberto, setModalLoginAberto] = useState<boolean>(false);
  const [abaLogin, setAbaLogin] = useState<'aluno' | 'professor'>('aluno');

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
  }, []);

  // Handlers de Autenticação e Navegação
  const abrirLoginProfessora = () => {
    setAbaLogin('professor');
    setModalLoginAberto(true);
  };

  const abrirLoginAluno = () => {
    setAbaLogin('aluno');
    setModalLoginAberto(true);
  };

  const encerrarSessao = () => {
    ServicoArmazenamento.encerrarSessao();
    setUsuario(null);
    setAlunoSimulado(null);
    setTelaAtual('apresentacao');
  };

  const tratarSucessoLogin = (usuarioAutenticado: UsuarioSessao) => {
    setUsuario(usuarioAutenticado);
    setAlunoSimulado(null);
    setTelaAtual('painel');
  };

  const tratarConclusaoNovoAluno = (novoAluno: UsuarioAluno) => {
    // Aluno criado com sucesso, já inicia autenticado
    ServicoArmazenamento.definirSessao(novoAluno);
    setUsuario(novoAluno);
    setAlunoSimulado(null);
    setTelaAtual('painel');
  };

  // Modo Aluno Ativado pela Professora Sara
  const ativarModoAluno = (alunoId: string) => {
    const aluno = ServicoArmazenamento.obterAlunoPorId(alunoId);
    if (aluno) {
      ServicoArmazenamento.ativarModoSimulacao(alunoId);
      setAlunoSimulado(aluno);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const desativarModoAluno = () => {
    ServicoArmazenamento.desativarModoSimulacao();
    setAlunoSimulado(null);
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
      {/* Cabeçalho Fixo com SVG Haltere e Login da Professora */}
      <Cabecalho
        usuario={usuario}
        alunoSimulado={alunoSimulado}
        aoAbrirLoginProfessora={abrirLoginProfessora}
        aoAbrirLoginAluno={abrirLoginAluno}
        aoEncerrarSessao={encerrarSessao}
        aoSairModoSimulacao={desativarModoAluno}
        aoNavegarInicio={irParaInicio}
      />

      {/* Conteúdo Central */}
      <main className="conteudo-principal">
        {/* Caso 1: Usuário autenticado */}
        {usuario ? (
          <>
            {/* Se for a professora Sara */}
            {usuario.papel === 'professor' ? (
              alunoSimulado ? (
                /* Professora visualizando o Modo Aluno */
                <PainelAluno
                  aluno={alunoSimulado}
                  aoAtualizarAluno={(alunoAtualizado) => setAlunoSimulado(alunoAtualizado)}
                />
              ) : (
                /* Painel normal da Sara */
                <PainelProfessor aoAtivarModoAluno={ativarModoAluno} />
              )
            ) : (
              /* Se for um Aluno real autenticado */
              <PainelAluno
                aluno={usuario as UsuarioAluno}
                aoAtualizarAluno={(alunoAtualizado) => setUsuario(alunoAtualizado)}
              />
            )}
          </>
        ) : (
          /* Caso 2: Usuário não autenticado */
          <>
            {telaAtual === 'novo_aluno' ? (
              <TelaNovoAluno
                aoConcluirCadastro={tratarConclusaoNovoAluno}
                aoCancelar={() => setTelaAtual('apresentacao')}
              />
            ) : (
              <TelaApresentacao
                aoIniciarNovoAluno={() => setTelaAtual('novo_aluno')}
                aoAbrirLoginAluno={abrirLoginAluno}
              />
            )}
          </>
        )}
      </main>

      {/* Modal de Login (Aluno ou Professora) */}
      {modalLoginAberto && (
        <ModalLogin
          abaInicial={abaLogin}
          aoFechar={() => setModalLoginAberto(false)}
          aoSucessoLogin={tratarSucessoLogin}
          aoAbrirNovoAluno={() => {
            setModalLoginAberto(false);
            setTelaAtual('novo_aluno');
          }}
        />
      )}

      {/* Rodapé LGPD e Direitos (ocultado na área do aluno conforme solicitado) */}
      {usuario?.papel !== 'aluno' && !alunoSimulado && (
        <footer className="rodape-aplicativo">
          <div className="rodape-links">
            <a href="/privacidade.html" target="_blank" rel="noreferrer">
              Política de Privacidade & LGPD
            </a>
            <span>•</span>
            <span style={{ color: '#94a3b8' }}>Shara-EF por Professora Sara</span>
          </div>
          <p>© {new Date().getFullYear()} Shara-EF. Todos os direitos reservados.</p>
        </footer>
      )}
    </>
  );
};
