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
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem', padding: '1rem 0' }}>
      {/* Seção Hero: Apresentação com Retrato Vertical da Professora Sara */}
      <section
        style={{
          background: 'linear-gradient(180deg, rgba(255, 46, 126, 0.08) 0%, rgba(20, 25, 48, 0.4) 100%)',
          borderRadius: '24px',
          border: '1px solid rgba(255, 46, 126, 0.2)',
          padding: '2rem 1.5rem',
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '2rem',
            alignItems: 'center'
          }}
        >
          {/* Coluna de Texto e Ações */}
          <div>
            <div style={{ display: 'inline-flex', marginBottom: '1rem' }}>
              <span className="badge badge-primaria">
                <IconeCoracao tamanho={14} cor="#ff2e7e" /> Prescrição Sara EF
              </span>
            </div>

            <h1
              style={{
                fontSize: 'clamp(2rem, 4.5vw, 3rem)',
                fontWeight: 800,
                lineHeight: 1.15,
                letterSpacing: '-1px',
                marginBottom: '0.9rem',
                background: 'linear-gradient(135deg, #ffffff 40%, #ff80aa 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent'
              }}
            >
              Evolução física com treino individualizado.
            </h1>

            <p
              style={{
                color: '#94a3b8',
                fontSize: 'clamp(0.95rem, 1.8vw, 1.05rem)',
                lineHeight: 1.6,
                marginBottom: '1.8rem',
                maxWidth: '520px'
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
          </div>

          {/* Coluna da Imagem Vertical (Retrato da Sara) */}
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <div
              style={{
                position: 'relative',
                width: '100%',
                maxWidth: '340px',
                borderRadius: '22px',
                overflow: 'hidden',
                border: '1px solid rgba(255, 46, 126, 0.3)',
                boxShadow: '0 20px 40px rgba(0, 0, 0, 0.6), 0 0 25px rgba(255, 46, 126, 0.15)',
                background: '#141930'
              }}
            >
              <img
                src="/shara-vert.png"
                alt="Professora Sara"
                style={{
                  width: '100%',
                  height: '420px',
                  objectFit: 'cover',
                  objectPosition: 'center 15%',
                  display: 'block'
                }}
              />

              {/* Degradê na base da foto para contraste */}
              <div
                style={{
                  position: 'absolute',
                  inset: 0,
                  background: 'linear-gradient(180deg, transparent 60%, rgba(12, 15, 29, 0.95) 100%)',
                  pointerEvents: 'none'
                }}
              />

              {/* Badge Flutuante de Identificação da Professora */}
              <div
                style={{
                  position: 'absolute',
                  bottom: '14px',
                  left: '14px',
                  right: '14px',
                  background: 'rgba(12, 15, 29, 0.85)',
                  backdropFilter: 'blur(12px)',
                  border: '1px solid rgba(255, 46, 126, 0.3)',
                  borderRadius: '14px',
                  padding: '0.65rem 0.9rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between'
                }}
              >
                <div>
                  <div style={{ color: '#ffffff', fontWeight: 700, fontSize: '0.92rem' }}>Sara</div>
                  <div style={{ color: '#ff80aa', fontSize: '0.75rem', fontWeight: 600 }}>Professora & Treinadora</div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <span
                    style={{
                      width: '8px',
                      height: '8px',
                      borderRadius: '50%',
                      background: '#10b981',
                      boxShadow: '0 0 8px #10b981'
                    }}
                  />
                  <span style={{ fontSize: '0.75rem', color: '#6ee7b7', fontWeight: 600 }}>Ativa</span>
                </div>
              </div>
            </div>
          </div>
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

      {/* Banner Panorâmico Horizontal da Academia */}
      <section
        style={{
          position: 'relative',
          borderRadius: '24px',
          overflow: 'hidden',
          border: '1px solid #28325c',
          boxShadow: '0 15px 35px rgba(0, 0, 0, 0.4)'
        }}
      >
        <img
          src="/shara-hor.png"
          alt="Treinamento com Professora Sara"
          style={{
            width: '100%',
            height: '240px',
            objectFit: 'cover',
            objectPosition: 'center 35%',
            display: 'block'
          }}
        />

        {/* Overlay com gradiente escuro e informações */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(90deg, rgba(12, 15, 29, 0.92) 0%, rgba(12, 15, 29, 0.6) 50%, rgba(12, 15, 29, 0.85) 100%)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            padding: '1.5rem 2rem'
          }}
        >
          <div style={{ maxWidth: '520px' }}>
            <span
              style={{
                fontSize: '0.78rem',
                color: '#38bdf8',
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.5px'
              }}
            >
              Espaço & Metodologia
            </span>
            <h3 style={{ fontSize: '1.35rem', color: '#ffffff', margin: '0.3rem 0 0.5rem 0' }}>
              Treino sob medida para o seu ambiente
            </h3>
            <p style={{ color: '#cbd5e1', fontSize: '0.88rem', lineHeight: 1.5 }}>
              Adaptação completa à sua academia, condomínio ou treino em casa, com foco em segurança articular e evolução consistente.
            </p>
          </div>
        </div>
      </section>

      {/* Como Funciona em 3 Passos */}
      <section
        className="cartao"
        style={{
          background: 'linear-gradient(135deg, rgba(20, 25, 48, 0.9) 0%, rgba(28, 35, 68, 0.7) 100%)',
          borderLeft: '4px solid #ff2e7e',
          padding: '1.4rem 1.6rem'
        }}
      >
        <h3 style={{ fontSize: '1.15rem', marginBottom: '1rem', color: '#ffffff' }}>Como começar no Shara-EF</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.2rem' }}>
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
