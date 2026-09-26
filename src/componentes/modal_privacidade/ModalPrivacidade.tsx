import React from 'react';
import { IconeFechar } from '../icones';

interface PropriedadesModalPrivacidade {
  aoFechar: () => void;
}

export const ModalPrivacidade: React.FC<PropriedadesModalPrivacidade> = ({ aoFechar }) => {
  return (
    <div className="overlay-modal" onClick={aoFechar} style={{ zIndex: 1200 }}>
      <div className="conteudo-modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '560px' }}>
        <div className="cabecalho-modal">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ fontSize: '1.2rem' }}>🔒</span>
            <h3 className="titulo-modal">Política de Privacidade & LGPD</h3>
          </div>
          <button
            onClick={aoFechar}
            style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: '4px' }}
            title="Fechar política de privacidade"
          >
            <IconeFechar tamanho={18} />
          </button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', fontSize: '0.82rem', color: '#cbd5e1', lineHeight: 1.5, maxHeight: '65vh', overflowY: 'auto', paddingRight: '0.25rem' }}>
          <div>
            <span style={{ color: '#ff2e7e', fontWeight: 700, fontSize: '0.72rem', textTransform: 'uppercase' }}>
              Aplicação Shara-EF
            </span>
            <p style={{ marginTop: '0.2rem', color: '#94a3b8' }}>
              Responsável Técnica: <strong>Sara (Professora de Educação Física)</strong>
            </p>
          </div>

          <div style={{ background: 'rgba(255, 46, 126, 0.06)', border: '1px solid rgba(255, 46, 126, 0.2)', padding: '0.65rem 0.8rem', borderRadius: '10px' }}>
            <strong style={{ color: '#ff80aa', display: 'block', marginBottom: '0.25rem' }}>1. Finalidade da Coleta de Dados</strong>
            <p style={{ margin: 0 }}>
              Os dados coletados através da anamnese (nome, idade, contato, histórico de saúde, restrições e biometria) destinam-se exclusivamente à prescrição e acompanhamento individualizado de treinos físicos.
            </p>
          </div>

          <div style={{ background: 'rgba(56, 189, 248, 0.06)', border: '1px solid rgba(56, 189, 248, 0.2)', padding: '0.65rem 0.8rem', borderRadius: '10px' }}>
            <strong style={{ color: '#38bdf8', display: 'block', marginBottom: '0.25rem' }}>2. Tratamento e Segurança</strong>
            <p style={{ margin: 0 }}>
              Nenhum dado pessoal ou de saúde é compartilhado com terceiros ou plataformas de publicidade. O acesso é estritamente restrito à professora Sara e ao respectivo aluno autenticado.
            </p>
          </div>

          <div style={{ background: 'rgba(16, 185, 129, 0.06)', border: '1px solid rgba(16, 185, 129, 0.2)', padding: '0.65rem 0.8rem', borderRadius: '10px' }}>
            <strong style={{ color: '#6ee7b7', display: 'block', marginBottom: '0.25rem' }}>3. Direitos do Titular (Art. 18 LGPD)</strong>
            <p style={{ margin: 0 }}>
              Você poderá a qualquer momento solicitar a visualização, atualização, correção ou exclusão definitiva de seus dados cadastrais e histórico de treinos.
            </p>
          </div>

          <div>
            <strong style={{ color: '#ffffff', display: 'block', marginBottom: '0.25rem' }}>4. Contato e Esclarecimentos</strong>
            <p style={{ margin: 0, color: '#94a3b8' }}>
              Para esclarecer dúvidas sobre seus dados, entre em contato direto com a professora responsável no Shara-EF.
            </p>
          </div>
        </div>

        <div style={{ marginTop: '1rem', borderTop: '1px solid #28325c', paddingTop: '0.75rem', display: 'flex', justifyContent: 'flex-end' }}>
          <button
            type="button"
            className="botao-primario"
            onClick={aoFechar}
            style={{ width: '100%', minHeight: '36px', fontSize: '0.82rem' }}
          >
            Entendido / Fechar Declaração
          </button>
        </div>
      </div>
    </div>
  );
};
