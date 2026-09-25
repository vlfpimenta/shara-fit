import React from 'react';
import { IconeAvancar, IconeCheck, IconeCoracao, IconeCronometro, IconeHaltere, IconeUsuario } from '../../componentes/icones';

interface PropriedadesTelaApresentacao {
  aoIniciarNovoAluno: () => void;
  aoAbrirLoginAluno: () => void;
  aoAbrirLoginProfessora: () => void;
}

export const TelaApresentacao: React.FC<PropriedadesTelaApresentacao> = ({
  aoIniciarNovoAluno,
  aoAbrirLoginAluno,
  aoAbrirLoginProfessora
}) => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', padding: '1rem 0' }}>
      {/* Seção Hero */}
      <section
        style={{
          textAlign: 'center',
          padding: '2.5rem 1rem',
          background: 'linear-gradient(180deg, rgba(255, 46, 126, 0.08) 0%, rgba(20, 25, 48, 0) 100%)',
          borderRadius: '24px',
          border: '1px solid rgba(255, 46, 126, 0.15)',
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        <div style={{ display: 'inline-flex', marginBottom: '1rem' }}>
          <span className="badge badge-primaria">
            <IconeCoracao tamanho={14} cor="#ff2e7e" /> Prescrição Sara EF
          </span>
        </div>

        <h1
          style={{
            fontSize: 'clamp(2rem, 5vw, 3rem)',
            fontWeight: 800,
            lineHeight: 1.15,
            letterSpacing: '-1px',
            marginBottom: '0.8rem',
            background: 'linear-gradient(135deg, #ffffff 30%, #ff80aa 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          }}
        >
          Evolução física com treino individualizado.
        </h1>

        <p
          style={{
            color: '#94a3b8',
            fontSize: 'clamp(0.95rem, 2vw, 1.1rem)',
            maxWidth: '560px',
            margin: '0 auto 1.8rem auto',
            lineHeight: 1.5
          }}
        >
          Treinos prescritos sob medida pela professora Sara, com cronômetro de descanso e controle de cargas no celular.
        </p>

        {/* Botões de Ação */}
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '0.8rem',
            justifyContent: 'center',
            alignItems: 'center'
          }}
        >
          <button
            className="botao-primario"
            onClick={aoIniciarNovoAluno}
            style={{ fontSize: '1rem', padding: '0.9rem 1.8rem' }}
          >
            <span>Novo Aluno (Anamnese)</span>
            <IconeAvancar tamanho={18} />
          </button>

          <button
            className="botao-secundario"
            onClick={aoAbrirLoginAluno}
            style={{ fontSize: '1rem', padding: '0.9rem 1.8rem' }}
          >
            <IconeUsuario tamanho={18} cor="#38bdf8" />
            <span>Entrar como Aluno</span>
          </button>
        </div>
      </section>

      {/* Destaques Rápidos */}
      <section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.2rem' }}>
        <div className="cartao">
          <div
            style={{
              width: '42px',
              height: '42px',
              borderRadius: '10px',
              background: 'rgba(255, 46, 126, 0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '0.8rem'
            }}
          >
            <IconeHaltere tamanho={22} cor="#ff2e7e" />
          </div>
          <h3 style={{ fontSize: '1.1rem', marginBottom: '0.3rem', color: '#ffffff' }}>Fichas por Foco</h3>
          <p style={{ color: '#94a3b8', fontSize: '0.88rem', lineHeight: 1.5 }}>
            Divisões A, B, C com repetições alvo, ordem de execução e orientações posturais.
          </p>
        </div>

        <div className="cartao">
          <div
            style={{
              width: '42px',
              height: '42px',
              borderRadius: '10px',
              background: 'rgba(56, 189, 248, 0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '0.8rem'
            }}
          >
            <IconeCronometro tamanho={22} cor="#38bdf8" />
          </div>
          <h3 style={{ fontSize: '1.1rem', marginBottom: '0.3rem', color: '#ffffff' }}>Descanso & Cargas</h3>
          <p style={{ color: '#94a3b8', fontSize: '0.88rem', lineHeight: 1.5 }}>
            Cronômetro de descanso temporizado e anotação prática de carga por série.
          </p>
        </div>

        <div className="cartao">
          <div
            style={{
              width: '42px',
              height: '42px',
              borderRadius: '10px',
              background: 'rgba(16, 185, 129, 0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '0.8rem'
            }}
          >
            <IconeCheck tamanho={22} cor="#10b981" />
          </div>
          <h3 style={{ fontSize: '1.1rem', marginBottom: '0.3rem', color: '#ffffff' }}>App PWA Direto</h3>
          <p style={{ color: '#94a3b8', fontSize: '0.88rem', lineHeight: 1.5 }}>
            Instalável na tela inicial com funcionamento rápido e suporte offline.
          </p>
        </div>
      </section>

      {/* Como Funciona em 3 Passos */}
      <section
        className="cartao"
        style={{
          background: 'linear-gradient(135deg, rgba(20, 25, 48, 0.9) 0%, rgba(28, 35, 68, 0.7) 100%)',
          borderLeft: '4px solid #ff2e7e',
          padding: '1.2rem 1.5rem'
        }}
      >
        <h3 style={{ fontSize: '1.15rem', marginBottom: '0.8rem', color: '#ffffff' }}>Como funciona</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
          <div>
            <span style={{ color: '#ff2e7e', fontWeight: 700, fontSize: '0.9rem' }}>1. Anamnese</span>
            <p style={{ color: '#94a3b8', fontSize: '0.84rem', marginTop: '0.2rem' }}>
              Preencha seu histórico, restrições e objetivos.
            </p>
          </div>
          <div>
            <span style={{ color: '#38bdf8', fontWeight: 700, fontSize: '0.9rem' }}>2. Acesso</span>
            <p style={{ color: '#94a3b8', fontSize: '0.84rem', marginTop: '0.2rem' }}>
              Crie seu e-mail e senha ao final do cadastro.
            </p>
          </div>
          <div>
            <span style={{ color: '#10b981', fontWeight: 700, fontSize: '0.9rem' }}>3. Treino</span>
            <p style={{ color: '#94a3b8', fontSize: '0.84rem', marginTop: '0.2rem' }}>
              Acesse suas fichas prescritas pela Sara.
            </p>
          </div>
        </div>
      </section>

      {/* Acesso Professora */}
      <div style={{ textAlign: 'center', padding: '0.5rem' }}>
        <button
          onClick={aoAbrirLoginProfessora}
          style={{
            background: 'none',
            border: 'none',
            color: '#64748b',
            fontSize: '0.82rem',
            cursor: 'pointer',
            textDecoration: 'underline'
          }}
        >
          Área da Professora Sara
        </button>
      </div>
    </div>
  );
};
