import React, { useEffect, useState } from 'react';
import { IconeCelular, IconeDownload, IconeFechar } from '../icones';

interface PropriedadesBotaoInstalar {
  texto?: string;
  estilo?: React.CSSProperties;
  classe?: string;
  variante?: 'primario' | 'secundario' | 'destaque';
}

interface EventoBeforeInstallPrompt extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export const BotaoInstalarApp: React.FC<PropriedadesBotaoInstalar> = ({
  texto = 'Instalar App no Telefone',
  estilo,
  classe = '',
  variante = 'destaque'
}) => {
  const [eventoPrompt, setEventoPrompt] = useState<EventoBeforeInstallPrompt | null>(null);
  const [modalInstrucaoAberto, setModalInstrucaoAberto] = useState<boolean>(false);
  const [ehIos, setEhIos] = useState<boolean>(false);
  const [jaInstalado, setJaInstalado] = useState<boolean>(false);

  useEffect(() => {
    // Detectar se já está em modo PWA standalone
    const modoStandalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as unknown as { standalone?: boolean }).standalone === true;

    setJaInstalado(modoStandalone);

    // Detectar iOS
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIosDevice = /iphone|ipad|ipod/.test(userAgent);
    setEhIos(isIosDevice);

    // Capturar evento PWA nativo
    const tratarPrompt = (e: Event) => {
      e.preventDefault();
      setEventoPrompt(e as EventoBeforeInstallPrompt);
    };

    window.addEventListener('beforeinstallprompt', tratarPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', tratarPrompt);
    };
  }, []);

  const acionarInstalacao = async () => {
    if (eventoPrompt) {
      await eventoPrompt.prompt();
      const resultado = await eventoPrompt.userChoice;
      if (resultado.outcome === 'accepted') {
        setJaInstalado(true);
      }
      setEventoPrompt(null);
    } else {
      // Abre modal com passo a passo ilustrado para iOS ou navegadores sem prompt automático
      setModalInstrucaoAberto(true);
    }
  };

  if (jaInstalado) {
    return null;
  }

  const obterEstiloBotao = (): React.CSSProperties => {
    if (variante === 'primario') {
      return {
        background: 'var(--gradiente-primario)',
        color: '#ffffff',
        border: 'none',
        borderRadius: '12px',
        padding: '0.8rem 1.4rem',
        fontWeight: 700,
        fontSize: '0.92rem',
        cursor: 'pointer',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '0.5rem',
        boxShadow: 'var(--sombra-neon)',
        transition: 'all 0.2s ease',
        ...estilo
      };
    }

    if (variante === 'secundario') {
      return {
        background: 'rgba(56, 189, 248, 0.12)',
        color: '#38bdf8',
        border: '1px solid rgba(56, 189, 248, 0.35)',
        borderRadius: '10px',
        padding: '0.5rem 1rem',
        fontWeight: 700,
        fontSize: '0.85rem',
        cursor: 'pointer',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '0.4rem',
        transition: 'all 0.2s ease',
        ...estilo
      };
    }

    // Variante destaque (com gradiente e borda viva)
    return {
      background: 'linear-gradient(135deg, rgba(255, 46, 126, 0.2) 0%, rgba(56, 189, 248, 0.15) 100%)',
      border: '1px solid rgba(255, 46, 126, 0.5)',
      color: '#ffffff',
      borderRadius: '14px',
      padding: '0.85rem 1.4rem',
      fontWeight: 700,
      fontSize: '0.92rem',
      cursor: 'pointer',
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '0.6rem',
      boxShadow: '0 8px 20px rgba(0, 0, 0, 0.4)',
      transition: 'all 0.2s ease',
      ...estilo
    };
  };

  return (
    <>
      <button
        type="button"
        onClick={acionarInstalacao}
        className={classe}
        style={obterEstiloBotao()}
        title="Instalar o Shara-EF na tela de início do seu celular"
      >
        <IconeCelular tamanho={18} cor="#ff2e7e" />
        <span>{texto}</span>
      </button>

      {/* Modal de Instruções de Instalação (para iOS / outros) */}
      {modalInstrucaoAberto && (
        <div className="overlay-modal" onClick={() => setModalInstrucaoAberto(false)}>
          <div className="conteudo-modal" style={{ maxWidth: '440px' }} onClick={(e) => e.stopPropagation()}>
            <div className="cabecalho-modal">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <div
                  style={{
                    width: '34px',
                    height: '34px',
                    borderRadius: '10px',
                    background: 'var(--gradiente-primario)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <IconeDownload tamanho={18} cor="#fff" />
                </div>
                <h3 className="titulo-modal">Como Instalar no Celular</h3>
              </div>
              <button
                type="button"
                onClick={() => setModalInstrucaoAberto(false)}
                style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: '4px' }}
              >
                <IconeFechar tamanho={20} />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem', color: '#cbd5e1', fontSize: '0.9rem' }}>
              {ehIos ? (
                /* Instrução iOS Safari */
                <div>
                  <div style={{ fontWeight: 700, color: '#ffffff', marginBottom: '0.6rem', fontSize: '1rem' }}>
                    No iPhone / iPad (Safari):
                  </div>
                  <ol style={{ paddingLeft: '1.2rem', display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                    <li>
                      Toque no ícone de <strong>Compartilhar</strong> (quadrado com a seta para cima na barra do navegador).
                    </li>
                    <li>
                      Role para baixo e selecione <strong>"Adicionar à Tela de Início"</strong>.
                    </li>
                    <li>
                      Toque em <strong>"Adicionar"</strong> no canto superior direito.
                    </li>
                  </ol>
                </div>
              ) : (
                /* Instrução Android / Chrome / Geral */
                <div>
                  <div style={{ fontWeight: 700, color: '#ffffff', marginBottom: '0.6rem', fontSize: '1rem' }}>
                    No Android (Chrome ou Edge):
                  </div>
                  <ol style={{ paddingLeft: '1.2rem', display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                    <li>
                      Toque nos <strong>três pontinhos (⋮)</strong> no canto superior direito do navegador.
                    </li>
                    <li>
                      Selecione <strong>"Instalar aplicativo"</strong> ou <strong>"Adicionar à tela inicial"</strong>.
                    </li>
                    <li>
                      Confirme em <strong>"Instalar"</strong> para ter o app com acesso direto.
                    </li>
                  </ol>
                </div>
              )}

              <div
                style={{
                  background: 'rgba(56, 189, 248, 0.08)',
                  border: '1px solid rgba(56, 189, 248, 0.25)',
                  padding: '0.8rem',
                  borderRadius: '10px',
                  fontSize: '0.82rem',
                  color: '#94a3b8'
                }}
              >
                ✨ O Shara-EF funciona como um aplicativo nativo no celular, sem precisar baixar na loja de apps e com carregamento instantâneo.
              </div>

              <button
                type="button"
                className="botao-primario"
                onClick={() => setModalInstrucaoAberto(false)}
                style={{ width: '100%', marginTop: '0.4rem' }}
              >
                Entendi
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
