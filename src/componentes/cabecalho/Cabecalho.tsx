import React from 'react';
import { IconeHaltere, IconeOlho, IconeSair, IconeUsuario } from '../icones';
import { UsuarioAluno, UsuarioSessao } from '../../tipos';

interface PropriedadesCabecalho {
  usuario: UsuarioSessao | null;
  alunoSimulado: UsuarioAluno | null;
  aoAbrirLoginAluno: () => void;
  aoEncerrarSessao: () => void;
  aoSairModoSimulacao: () => void;
  aoNavegarInicio: () => void;
  aoAbrirConfigVps?: () => void;
  aoSincronizar?: () => void;
  sincronizando?: boolean;
}

export const Cabecalho: React.FC<PropriedadesCabecalho> = ({
  usuario,
  alunoSimulado,
  aoAbrirLoginAluno,
  aoEncerrarSessao,
  aoSairModoSimulacao,
  aoNavegarInicio,
  aoAbrirConfigVps,
  aoSincronizar,
  sincronizando = false
}) => {
  const [menuProfAberto, setMenuProfAberto] = React.useState<boolean>(false);

  return (
    <>
      {/* Alerta de Modo Aluno Ativo (Quando a Professora está visualizando como aluno) */}
      {alunoSimulado && (
        <div className="barra-modo-aluno-alerta">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <IconeOlho tamanho={18} cor="#ffffff" />
            <span>
              <strong>Modo Aluno Ativo:</strong> Visualizando como <u>{alunoSimulado.nome}</u>
            </span>
          </div>
          <button className="botao-sair-modo-aluno" onClick={aoSairModoSimulacao}>
            Voltar ao Painel da Sara
          </button>
        </div>
      )}

      <header className="cabecalho-principal">
        {/* Logotipo e Nome Shara.ef */}
        <div className="marca-container" onClick={aoNavegarInicio} title="Ir para o Início">
          <div className="marca-icone-svg">
            <IconeHaltere tamanho={17} cor="#ffffff" />
          </div>
          <div>
            <div className="marca-texto">
              Shara<span className="marca-ponto">.</span>ef
            </div>
            <div className="marca-subtitulo">Treinamento Personalizado</div>
          </div>
        </div>

        {/* Ações à Direita */}
        <div className="acoes-cabecalho">
          {usuario ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
              {usuario.papel === 'professor' ? (
                /* Chip clicável da Professora com Menu Suspenso */
                <div style={{ position: 'relative' }}>
                  <div
                    onClick={() => setMenuProfAberto(!menuProfAberto)}
                    role="button"
                    tabIndex={0}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.35rem',
                      background: menuProfAberto ? 'rgba(255, 46, 126, 0.2)' : 'rgba(28, 35, 68, 0.6)',
                      padding: '0.25rem 0.55rem',
                      borderRadius: '9999px',
                      border: menuProfAberto ? '1px solid #ff2e7e' : '1px solid #28325c',
                      fontSize: '0.78rem',
                      cursor: 'pointer',
                      userSelect: 'none',
                      transition: 'all 0.2s ease'
                    }}
                    title="Menu de Opções da Professora"
                  >
                    <IconeUsuario tamanho={14} cor="#ff2e7e" />
                    <span style={{ fontWeight: 600 }}>{usuario.nome.split(' ')[0]}</span>
                    <span style={{ fontSize: '0.6rem', color: '#ff80aa', marginLeft: '0.1rem' }}>
                      {menuProfAberto ? '▲' : '▼'}
                    </span>
                  </div>

                  {/* Menu Dropdown */}
                  {menuProfAberto && (
                    <>
                      <div
                        style={{ position: 'fixed', inset: 0, zIndex: 998 }}
                        onClick={() => setMenuProfAberto(false)}
                      />
                      <div
                        style={{
                          position: 'absolute',
                          top: 'calc(100% + 8px)',
                          right: 0,
                          background: '#141930',
                          border: '1px solid #28325c',
                          borderRadius: '12px',
                          boxShadow: '0 10px 30px rgba(0, 0, 0, 0.6)',
                          padding: '0.4rem',
                          minWidth: '220px',
                          zIndex: 999,
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '0.25rem'
                        }}
                      >
                        <button
                          type="button"
                          onClick={() => {
                            setMenuProfAberto(false);
                            if (aoSincronizar) aoSincronizar();
                          }}
                          disabled={sincronizando}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.6rem',
                            padding: '0.55rem 0.75rem',
                            background: 'none',
                            border: 'none',
                            borderRadius: '8px',
                            color: '#f8fafc',
                            fontSize: '0.8rem',
                            fontWeight: 600,
                            cursor: 'pointer',
                            textAlign: 'left',
                            transition: 'background 0.15s ease'
                          }}
                          onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(255, 46, 126, 0.15)')}
                          onMouseLeave={(e) => (e.currentTarget.style.background = 'none')}
                        >
                          <span style={{ display: 'inline-block', animation: sincronizando ? 'spin 1s infinite linear' : 'none' }}>
                            🔄
                          </span>
                          <span>{sincronizando ? 'Sincronizando...' : 'Sincronizar Alunos'}</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            setMenuProfAberto(false);
                            if (aoAbrirConfigVps) aoAbrirConfigVps();
                          }}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.6rem',
                            padding: '0.55rem 0.75rem',
                            background: 'none',
                            border: 'none',
                            borderRadius: '8px',
                            color: '#f8fafc',
                            fontSize: '0.8rem',
                            fontWeight: 600,
                            cursor: 'pointer',
                            textAlign: 'left',
                            transition: 'background 0.15s ease'
                          }}
                          onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(56, 189, 248, 0.15)')}
                          onMouseLeave={(e) => (e.currentTarget.style.background = 'none')}
                        >
                          <span>⚙️</span>
                          <span>Configurar VPS / Domínio</span>
                        </button>

                        <div style={{ height: '1px', background: '#28325c', margin: '0.2rem 0' }} />

                        <button
                          type="button"
                          onClick={() => {
                            setMenuProfAberto(false);
                            aoEncerrarSessao();
                          }}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.6rem',
                            padding: '0.55rem 0.75rem',
                            background: 'none',
                            border: 'none',
                            borderRadius: '8px',
                            color: '#fca5a5',
                            fontSize: '0.8rem',
                            fontWeight: 600,
                            cursor: 'pointer',
                            textAlign: 'left',
                            transition: 'background 0.15s ease'
                          }}
                          onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(239, 68, 68, 0.15)')}
                          onMouseLeave={(e) => (e.currentTarget.style.background = 'none')}
                        >
                          <IconeSair tamanho={14} cor="#ef4444" />
                          <span>Sair da Conta</span>
                        </button>
                      </div>
                    </>
                  )}
                </div>
              ) : (
                /* Chip estático para aluno */
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.35rem',
                    background: 'rgba(28, 35, 68, 0.6)',
                    padding: '0.25rem 0.55rem',
                    borderRadius: '9999px',
                    border: '1px solid #28325c',
                    fontSize: '0.78rem'
                  }}
                >
                  <IconeUsuario tamanho={14} cor="#38bdf8" />
                  <span style={{ fontWeight: 600 }}>{usuario.nome.split(' ')[0]}</span>
                </div>
              )}

              {usuario.papel !== 'professor' && (
                <button className="botao-sair" onClick={aoEncerrarSessao} title="Sair da Conta">
                  <IconeSair tamanho={14} />
                  <span>Sair</span>
                </button>
              )}
            </div>
          ) : (
            <div style={{ display: 'flex', gap: '0.4rem' }}>
              <button
                className="botao-secundario"
                onClick={aoAbrirLoginAluno}
                style={{ padding: '0.32rem 0.65rem', fontSize: '0.78rem', borderRadius: '9999px' }}
              >
                <IconeUsuario tamanho={14} />
                <span>Acesso Aluno</span>
              </button>
            </div>
          )}
        </div>
      </header>
    </>
  );
};
