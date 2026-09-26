import React, { useState } from 'react';
import { IconeFechar } from '../icones';
import { ServicoArmazenamento } from '../../servicos/armazenamento';

interface PropriedadesModalConfigVps {
  aberto: boolean;
  aoFechar: () => void;
  aoSalvar?: () => void;
}

export const ModalConfigVps: React.FC<PropriedadesModalConfigVps> = ({ aberto, aoFechar, aoSalvar }) => {
  const [urlApiInput, setUrlApiInput] = useState<string>(() => ServicoArmazenamento.obterUrlApi());
  const [resultadoTesteApi, setResultadoTesteApi] = useState<{ sucesso: boolean; mensagem: string; detalhe?: string } | null>(null);
  const [testandoApi, setTestandoApi] = useState<boolean>(false);

  if (!aberto) return null;

  const testarConexao = async () => {
    setTestandoApi(true);
    setResultadoTesteApi(null);
    const res = await ServicoArmazenamento.testarConexaoApi(urlApiInput);
    setResultadoTesteApi(res);
    setTestandoApi(false);
  };

  const salvarNovoDominio = () => {
    ServicoArmazenamento.definirUrlApi(urlApiInput);
    if (aoSalvar) aoSalvar();
    window.dispatchEvent(new CustomEvent('shara:atualizar_alunos'));
    aoFechar();
  };

  return (
    <div className="overlay-modal" onClick={aoFechar} style={{ zIndex: 1200 }}>
      <div className="conteudo-modal" style={{ maxWidth: '560px' }} onClick={(e) => e.stopPropagation()}>
        <div className="cabecalho-modal">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <span style={{ fontSize: '1.2rem' }}>⚙️</span>
            <div>
              <h3 className="titulo-modal">Configuração da VPS / API</h3>
              <p style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                Conexão com o banco de dados e servidor Fastify
              </p>
            </div>
          </div>
          <button
            onClick={aoFechar}
            style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: '4px' }}
          >
            <IconeFechar tamanho={18} />
          </button>
        </div>

        <div style={{ marginBottom: '1.2rem' }}>
          <div className="grupo-campo">
            <label className="rotulo-campo">Endereço da API REST (HTTPS)</label>
            <input
              type="text"
              className="campo-texto"
              value={urlApiInput}
              onChange={(e) => {
                setUrlApiInput(e.target.value);
                setResultadoTesteApi(null);
              }}
              placeholder="https://matrix.vlfp.com.br"
            />
            <span style={{ fontSize: '0.74rem', color: '#64748b', marginTop: '0.3rem' }}>
              Domínio atual em uso: <code>{ServicoArmazenamento.obterUrlApi()}</code>
            </span>
          </div>

          {resultadoTesteApi && (
            <div
              style={{
                background: resultadoTesteApi.sucesso ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                border: resultadoTesteApi.sucesso ? '1px solid #10b981' : '1px solid #ef4444',
                color: resultadoTesteApi.sucesso ? '#6ee7b7' : '#fca5a5',
                padding: '0.65rem 0.85rem',
                borderRadius: '8px',
                fontSize: '0.82rem',
                marginTop: '0.75rem'
              }}
            >
              <strong>{resultadoTesteApi.sucesso ? '✅ Sucesso:' : '❌ Erro:'}</strong> {resultadoTesteApi.mensagem}
              {resultadoTesteApi.detalhe && (
                <div style={{ fontSize: '0.75rem', opacity: 0.85, marginTop: '0.2rem' }}>
                  Detalhe: {resultadoTesteApi.detalhe}
                </div>
              )}
            </div>
          )}
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap', borderTop: '1px solid #28325c', paddingTop: '0.85rem' }}>
          <button
            type="button"
            className="botao-secundario"
            disabled={testandoApi}
            onClick={testarConexao}
            style={{ fontSize: '0.8rem', padding: '0.45rem 0.8rem' }}
          >
            {testandoApi ? 'Testando...' : '🔍 Testar Conexão'}
          </button>

          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button
              type="button"
              className="botao-secundario"
              onClick={aoFechar}
              style={{ fontSize: '0.8rem', padding: '0.45rem 0.8rem' }}
            >
              Cancelar
            </button>
            <button
              type="button"
              className="botao-primario"
              onClick={salvarNovoDominio}
              style={{ fontSize: '0.8rem', padding: '0.45rem 0.85rem' }}
            >
              Salvar Domínio
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
