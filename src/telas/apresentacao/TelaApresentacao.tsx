import React from 'react';
import { IconeAvancar, IconeCoracao, IconeCronometro, IconeHaltere, IconeUsuario } from '../../componentes/icones';

interface PropriedadesTelaApresentacao {
  aoIniciarNovoAluno: () => void;
  aoAbrirLoginAluno: () => void;
}

export const TelaApresentacao: React.FC<PropriedadesTelaApresentacao> = ({
  aoIniciarNovoAluno,
  aoAbrirLoginAluno
}) => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', padding: '0.4rem 0' }}>
      {/* Seção Hero: Apresentação com Retrato Vertical da Professora Sara */}
      <section
        style={{
          background: 'linear-gradient(180deg, rgba(255, 46, 126, 0.08) 0%, rgba(20, 25, 48, 0.4) 100%)',
          borderRadius: '18px',
          border: '1px solid rgba(255, 46, 126, 0.2)',
          padding: '1.25rem 1rem',
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
            gap: '1.25rem',
            alignItems: 'center'
          }}
        >
          {/* Coluna de Texto e Ações */}
          <div>
            <div style={{ display: 'inline-flex', marginBottom: '0.75rem' }}>
              <span className="badge badge-primaria">
                <IconeCoracao tamanho={12} cor="#ff2e7e" /> Prescrição Sara EF
              </span>
            </div>

            <h1
              style={{
                fontSize: 'clamp(1.35rem, 3.8vw, 2.2rem)',
                fontWeight: 800,
                lineHeight: 1.2,
                letterSpacing: '-0.5px',
                marginBottom: '0.6rem',
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
                fontSize: '0.85rem',
                lineHeight: 1.5,
                marginBottom: '1.25rem',
                maxWidth: '480px'
              }}
            >
              Treinos prescritos sob medida pela professora Sara, com cronômetro de descanso e controle de cargas no celular.
            </p>

            {/* Botões de Ação */}
            <div
              style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: '0.6rem',
                alignItems: 'center'
              }}
            >
              <button
                className="botao-primario"
                onClick={aoIniciarNovoAluno}
              >
                <span>Novo Aluno (Anamnese)</span>
                <IconeAvancar tamanho={15} />
              </button>

              <button
                className="botao-secundario"
                onClick={aoAbrirLoginAluno}
              >
                <IconeUsuario tamanho={15} cor="#38bdf8" />
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
                maxWidth: '290px',
                borderRadius: '16px',
                overflow: 'hidden',
                border: '1px solid rgba(255, 46, 126, 0.3)',
                boxShadow: '0 15px 30px rgba(0, 0, 0, 0.6), 0 0 20px rgba(255, 46, 126, 0.12)',
                background: '#141930'
              }}
            >
              <img
                src="/shara-vert.png"
                alt="Professora Sara"
                style={{
                  width: '100%',
                  height: 'clamp(240px, 40vh, 340px)',
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
                  bottom: '10px',
                  left: '10px',
                  right: '10px',
                  background: 'rgba(12, 15, 29, 0.88)',
                  backdropFilter: 'blur(12px)',
                  border: '1px solid rgba(255, 46, 126, 0.3)',
                  borderRadius: '10px',
                  padding: '0.45rem 0.75rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between'
                }}
              >
                <div>
                  <div style={{ color: '#ffffff', fontWeight: 700, fontSize: '0.85rem' }}>Sara</div>
                  <div style={{ color: '#ff80aa', fontSize: '0.68rem', fontWeight: 600 }}>Professora & Treinadora</div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <span
                    style={{
                      width: '7px',
                      height: '7px',
                      borderRadius: '50%',
                      background: '#10b981',
                      boxShadow: '0 0 6px #10b981'
                    }}
                  />
                  <span style={{ fontSize: '0.7rem', color: '#6ee7b7', fontWeight: 600 }}>Ativa</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Destaques Rápidos */}
      <section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '0.85rem' }}>
        <div className="cartao">
          <div
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '8px',
              background: 'rgba(255, 46, 126, 0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '0.6rem'
            }}
          >
            <IconeHaltere tamanho={18} cor="#ff2e7e" />
          </div>
          <h3 style={{ fontSize: '0.98rem', marginBottom: '0.25rem', color: '#ffffff', fontWeight: 700 }}>Fichas por Foco</h3>
          <p style={{ color: '#94a3b8', fontSize: '0.8rem', lineHeight: 1.45 }}>
            Divisões A, B, C com repetições alvo, ordem de execução e orientações posturais.
          </p>
        </div>

        <div className="cartao">
          <div
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '8px',
              background: 'rgba(56, 189, 248, 0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '0.6rem'
            }}
          >
            <IconeCronometro tamanho={18} cor="#38bdf8" />
          </div>
          <h3 style={{ fontSize: '0.98rem', marginBottom: '0.25rem', color: '#ffffff', fontWeight: 700 }}>Descanso & Cargas</h3>
          <p style={{ color: '#94a3b8', fontSize: '0.8rem', lineHeight: 1.45 }}>
            Cronômetro de descanso temporizado e anotação prática de carga por série.
          </p>
        </div>
      </section>

      {/* Banner Panorâmico Horizontal da Academia */}
      <section
        style={{
          position: 'relative',
          borderRadius: '16px',
          overflow: 'hidden',
          border: '1px solid #28325c',
          boxShadow: '0 10px 25px rgba(0, 0, 0, 0.4)'
        }}
      >
        <img
          src="/shara-hor.png"
          alt="Treinamento com Professora Sara"
          style={{
            width: '100%',
            height: '180px',
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
            padding: '1rem 1.25rem'
          }}
        >
          <div style={{ maxWidth: '480px' }}>
            <span
              style={{
                fontSize: '0.7rem',
                color: '#38bdf8',
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.5px'
              }}
            >
              Espaço & Metodologia
            </span>
            <h3 style={{ fontSize: '1.1rem', color: '#ffffff', margin: '0.25rem 0 0.4rem 0', fontWeight: 700 }}>
              Treino sob medida para o seu ambiente
            </h3>
            <p style={{ color: '#cbd5e1', fontSize: '0.8rem', lineHeight: 1.45 }}>
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
          borderLeft: '3px solid #ff2e7e',
          padding: '1rem 1.15rem'
        }}
      >
        <h3 style={{ fontSize: '1rem', marginBottom: '0.75rem', color: '#ffffff', fontWeight: 700 }}>Como começar no Shara-EF</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.85rem' }}>
          <div>
            <span style={{ color: '#ff2e7e', fontWeight: 700, fontSize: '0.82rem' }}>1. Anamnese</span>
            <p style={{ color: '#94a3b8', fontSize: '0.78rem', marginTop: '0.15rem' }}>
              Preencha seu histórico, restrições e objetivos.
            </p>
          </div>
          <div>
            <span style={{ color: '#38bdf8', fontWeight: 700, fontSize: '0.82rem' }}>2. Acesso</span>
            <p style={{ color: '#94a3b8', fontSize: '0.78rem', marginTop: '0.15rem' }}>
              Crie seu e-mail e senha ao final do cadastro.
            </p>
          </div>
          <div>
            <span style={{ color: '#10b981', fontWeight: 700, fontSize: '0.82rem' }}>3. Treino</span>
            <p style={{ color: '#94a3b8', fontSize: '0.78rem', marginTop: '0.15rem' }}>
              Acesse suas fichas prescritas pela Sara.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};
