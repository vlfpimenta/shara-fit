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
      {/* Seção Hero de Apresentação */}
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
        <div style={{ display: 'inline-flex', marginBottom: '1.2rem' }}>
          <span className="badge badge-primaria">
            <IconeCoracao tamanho={14} cor="#ff2e7e" /> Treinamento Exclusivo com a Professora Sara
          </span>
        </div>

        <h1
          style={{
            fontSize: 'clamp(2rem, 5vw, 3.2rem)',
            fontWeight: 800,
            lineHeight: 1.15,
            letterSpacing: '-1px',
            marginBottom: '1rem',
            background: 'linear-gradient(135deg, #ffffff 30%, #ff80aa 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          }}
        >
          Sua evolução física <br /> com prescrição individualizada.
        </h1>

        <p
          style={{
            color: '#94a3b8',
            fontSize: 'clamp(1rem, 2.5vw, 1.2rem)',
            maxWidth: '680px',
            margin: '0 auto 2.2rem auto',
            lineHeight: 1.6
          }}
        >
          Bem-vindo(a) ao <strong>Shara-EF</strong>! Aqui você encontra seus treinos prescritos sob medida pela professora Sara,
          com cronômetro de descanso, controle de cargas e acompanhamento completo direto no seu celular.
        </p>

        {/* Botões de Ação Principais: Acesso de Aluno e Novo Aluno */}
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '1rem',
            justifyContent: 'center',
            alignItems: 'center'
          }}
        >
          <button
            className="botao-primario"
            onClick={aoIniciarNovoAluno}
            style={{ fontSize: '1.05rem', padding: '1rem 2rem' }}
          >
            <span>Novo Aluno (Preencher Anamnese)</span>
            <IconeAvancar tamanho={18} />
          </button>

          <button
            className="botao-secundario"
            onClick={aoAbrirLoginAluno}
            style={{ fontSize: '1.05rem', padding: '1rem 2rem' }}
          >
            <IconeUsuario tamanho={20} cor="#38bdf8" />
            <span>Acesso de Aluno Já Cadastrado</span>
          </button>
        </div>
      </section>

      {/* Destaques e Funcionalidades do App (Estilo mFit) */}
      <section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
        <div className="cartao">
          <div
            style={{
              width: '46px',
              height: '46px',
              borderRadius: '12px',
              background: 'rgba(255, 46, 126, 0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '1rem'
            }}
          >
            <IconeHaltere tamanho={24} cor="#ff2e7e" />
          </div>
          <h3 style={{ fontSize: '1.2rem', marginBottom: '0.5rem', color: '#ffffff' }}>Treinos Divididos por Foco</h3>
          <p style={{ color: '#94a3b8', fontSize: '0.92rem', lineHeight: 1.6 }}>
            Divisões claras (Treino A, B, C...) com repetições alvo, ordem de execução e orientações posturais prescritas pela Sara.
          </p>
        </div>

        <div className="cartao">
          <div
            style={{
              width: '46px',
              height: '46px',
              borderRadius: '12px',
              background: 'rgba(56, 189, 248, 0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '1rem'
            }}
          >
            <IconeCronometro tamanho={24} cor="#38bdf8" />
          </div>
          <h3 style={{ fontSize: '1.2rem', marginBottom: '0.5rem', color: '#ffffff' }}>Descanso & Cargas em Tempo Real</h3>
          <p style={{ color: '#94a3b8', fontSize: '0.92rem', lineHeight: 1.6 }}>
            Cronômetro de descanso mFit integrado com alertas sonoros e registro prático das cargas utilizadas em cada série.
          </p>
        </div>

        <div className="cartao">
          <div
            style={{
              width: '46px',
              height: '46px',
              borderRadius: '12px',
              background: 'rgba(16, 185, 129, 0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '1rem'
            }}
          >
            <IconeCheck tamanho={24} cor="#10b981" />
          </div>
          <h3 style={{ fontSize: '1.2rem', marginBottom: '0.5rem', color: '#ffffff' }}>100% Instalável (PWA)</h3>
          <p style={{ color: '#94a3b8', fontSize: '0.92rem', lineHeight: 1.6 }}>
            Sem necessidade de baixar nas lojas. Funciona direto no navegador ou adicione à tela inicial com visual e fluidez de aplicativo nativo.
          </p>
        </div>
      </section>

      {/* Como Funciona o Acesso Inicial */}
      <section
        className="cartao"
        style={{
          background: 'linear-gradient(135deg, rgba(20, 25, 48, 0.9) 0%, rgba(28, 35, 68, 0.7) 100%)',
          borderLeft: '4px solid #ff2e7e'
        }}
      >
        <h3 style={{ fontSize: '1.25rem', marginBottom: '1rem', color: '#ffffff' }}>Como começar no Shara-EF?</h3>
        <ol style={{ paddingLeft: '1.2rem', color: '#cbd5e1', display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
          <li>
            <strong>Preencha o formulário de anamnese:</strong> Clique em "Novo Aluno" para responder às perguntas sobre seu histórico de treino, objetivos, saúde e rotina.
          </li>
          <li>
            <strong>Crie seu e-mail e senha:</strong> Ao final do questionário, cadastre seus dados de acesso ao sistema.
          </li>
          <li>
            <strong>Aguarde a prescrição da Sara:</strong> A professora analisará sua anamnese e montará sua ficha sob medida diretamente no sistema.
          </li>
          <li>
            <strong>Treine com o app na academia:</strong> Acesse seu painel, acompanhe as séries e evolua a cada treino.
          </li>
        </ol>
      </section>

      {/* Banner discreto para a Professora */}
      <div style={{ textAlign: 'center', padding: '1rem' }}>
        <button
          onClick={aoAbrirLoginProfessora}
          style={{
            background: 'none',
            border: 'none',
            color: '#64748b',
            fontSize: '0.85rem',
            cursor: 'pointer',
            textDecoration: 'underline'
          }}
        >
          É a professora Sara? Acesse o painel de controle aqui
        </button>
      </div>
    </div>
  );
};
