import React from 'react';
import { IconeChave, IconeHaltere, IconeOlho, IconeSair, IconeUsuario } from '../icones';
import { UsuarioAluno, UsuarioSessao } from '../../tipos';

interface PropriedadesCabecalho {
  usuario: UsuarioSessao | null;
  alunoSimulado: UsuarioAluno | null;
  aoAbrirLoginProfessora: () => void;
  aoAbrirLoginAluno: () => void;
  aoEncerrarSessao: () => void;
  aoSairModoSimulacao: () => void;
  aoNavegarInicio: () => void;
}

export const Cabecalho: React.FC<PropriedadesCabecalho> = ({
  usuario,
  alunoSimulado,
  aoAbrirLoginProfessora,
  aoAbrirLoginAluno,
  aoEncerrarSessao,
  aoSairModoSimulacao,
  aoNavegarInicio
}) => {
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
            <IconeHaltere tamanho={22} cor="#ffffff" />
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
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  background: 'rgba(28, 35, 68, 0.6)',
                  padding: '0.4rem 0.8rem',
                  borderRadius: '9999px',
                  border: '1px solid #28325c',
                  fontSize: '0.85rem'
                }}
              >
                <IconeUsuario tamanho={16} cor={usuario.papel === 'professor' ? '#ff2e7e' : '#38bdf8'} />
                <span style={{ fontWeight: 600 }}>{usuario.nome.split(' ')[0]}</span>
                <span
                  style={{
                    fontSize: '0.7rem',
                    background: usuario.papel === 'professor' ? 'rgba(255, 46, 126, 0.2)' : 'rgba(56, 189, 248, 0.2)',
                    color: usuario.papel === 'professor' ? '#ff2e7e' : '#38bdf8',
                    padding: '0.1rem 0.4rem',
                    borderRadius: '4px',
                    textTransform: 'uppercase'
                  }}
                >
                  {usuario.papel === 'professor' ? 'Sara' : 'Aluno'}
                </span>
              </div>

              <button className="botao-sair" onClick={aoEncerrarSessao} title="Sair da Conta">
                <IconeSair tamanho={16} />
                <span>Sair</span>
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button
                className="botao-secundario"
                onClick={aoAbrirLoginAluno}
                style={{ padding: '0.45rem 0.85rem', fontSize: '0.85rem', borderRadius: '9999px' }}
              >
                <IconeUsuario tamanho={16} />
                <span>Acesso Aluno</span>
              </button>

              {/* Botão de Login com ícone à direita para Sara logar no dashboard de controle */}
              <button
                className="botao-professora-login"
                onClick={aoAbrirLoginProfessora}
                title="Área restrita da Professora Sara"
              >
                <span>Professora</span>
                <IconeChave tamanho={16} />
              </button>
            </div>
          )}
        </div>
      </header>
    </>
  );
};
