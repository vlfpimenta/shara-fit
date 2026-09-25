import React, { useEffect, useRef, useState } from 'react';
import { IconeCronometro, IconeFechar, IconePausa, IconePlay, IconeReiniciar } from '../icones';

interface PropriedadesCronometro {
  tempoSugeridoInicial?: number;
}

export const CronometroDescanso: React.FC<PropriedadesCronometro> = ({ tempoSugeridoInicial = 60 }) => {
  const [segundosRestantes, setSegundosRestantes] = useState<number>(tempoSugeridoInicial);
  const [tempoDefinido, setTempoDefinido] = useState<number>(tempoSugeridoInicial);
  const [estaRodando, setEstaRodando] = useState<boolean>(false);
  const [minimizado, setMinimizado] = useState<boolean>(false);
  const [alertaFinal, setAlertaFinal] = useState<boolean>(false);

  const intervaloRef = useRef<number | null>(null);

  // Tocar bip sonoro suave usando Web Audio API nativo (100% offline)
  const tocarSomConclusao = () => {
    try {
      const contextoAudio = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
      const oscilador = contextoAudio.createOscillator();
      const ganho = contextoAudio.createGain();

      oscilador.type = 'sine';
      oscilador.frequency.setValueAtTime(880, contextoAudio.currentTime); // Nota Lá (A5)
      ganho.gain.setValueAtTime(0.15, contextoAudio.currentTime);
      ganho.gain.exponentialRampToValueAtTime(0.01, contextoAudio.currentTime + 0.4);

      oscilador.connect(ganho);
      ganho.connect(contextoAudio.destination);

      oscilador.start();
      oscilador.stop(contextoAudio.currentTime + 0.4);
    } catch {
      // Navegadores com restrição de autoplay
    }
  };

  useEffect(() => {
    if (estaRodando) {
      intervaloRef.current = window.setInterval(() => {
        setSegundosRestantes((prev) => {
          if (prev <= 1) {
            setEstaRodando(false);
            setAlertaFinal(true);
            tocarSomConclusao();
            setTimeout(() => setAlertaFinal(false), 4000);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (intervaloRef.current) clearInterval(intervaloRef.current);
    }

    return () => {
      if (intervaloRef.current) clearInterval(intervaloRef.current);
    };
  }, [estaRodando]);

  // Formatar tempo em mm:ss
  const formatarTempo = (segundos: number): string => {
    const m = Math.floor(segundos / 60);
    const s = segundos % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const selecionarPreset = (novoTempo: number) => {
    setTempoDefinido(novoTempo);
    setSegundosRestantes(novoTempo);
    setEstaRodando(true);
    setAlertaFinal(false);
  };

  const alternarInicio = () => {
    if (segundosRestantes === 0) {
      setSegundosRestantes(tempoDefinido);
    }
    setEstaRodando(!estaRodando);
    setAlertaFinal(false);
  };

  const reiniciar = () => {
    setEstaRodando(false);
    setSegundosRestantes(tempoDefinido);
    setAlertaFinal(false);
  };

  if (minimizado) {
    return (
      <button
        onClick={() => setMinimizado(false)}
        className="cronometro-flutuante"
        style={{ cursor: 'pointer', padding: '0.6rem 0.9rem' }}
        title="Abrir Cronômetro de Descanso"
      >
        <IconeCronometro tamanho={20} cor="#ff2e7e" />
        <span className={`cronometro-tempo ${alertaFinal ? 'alerta' : ''}`}>{formatarTempo(segundosRestantes)}</span>
      </button>
    );
  }

  return (
    <div className="cronometro-flutuante">
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
        <IconeCronometro tamanho={22} cor={estaRodando ? '#38bdf8' : '#ff2e7e'} />
        <div>
          <div style={{ fontSize: '0.7rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            Descanso
          </div>
          <div className={`cronometro-tempo ${alertaFinal ? 'alerta' : ''}`}>{formatarTempo(segundosRestantes)}</div>
        </div>
      </div>

      {/* Controles de Play / Pause / Reset */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
        <button
          onClick={alternarInicio}
          style={{
            background: estaRodando ? '#f59e0b' : '#ff2e7e',
            border: 'none',
            color: '#ffffff',
            width: '34px',
            height: '34px',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer'
          }}
          title={estaRodando ? 'Pausar' : 'Iniciar'}
        >
          {estaRodando ? <IconePausa tamanho={16} /> : <IconePlay tamanho={16} />}
        </button>

        <button
          onClick={reiniciar}
          style={{
            background: 'rgba(255,255,255,0.1)',
            border: 'none',
            color: '#ffffff',
            width: '30px',
            height: '30px',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer'
          }}
          title="Reiniciar tempo"
        >
          <IconeReiniciar tamanho={14} />
        </button>
      </div>

      {/* Botões rápidos de preset */}
      <div style={{ display: 'flex', gap: '0.3rem' }}>
        {[30, 45, 60, 90].map((tempo) => (
          <button
            key={tempo}
            onClick={() => selecionarPreset(tempo)}
            style={{
              background: tempoDefinido === tempo ? 'rgba(255,46,126,0.3)' : 'rgba(255,255,255,0.06)',
              border: tempoDefinido === tempo ? '1px solid #ff2e7e' : '1px solid #28325c',
              color: tempoDefinido === tempo ? '#ff80aa' : '#cbd5e1',
              padding: '0.2rem 0.45rem',
              borderRadius: '6px',
              fontSize: '0.75rem',
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            {tempo}s
          </button>
        ))}
      </div>

      {/* Botão Minimizar */}
      <button
        onClick={() => setMinimizado(true)}
        style={{
          background: 'transparent',
          border: 'none',
          color: '#64748b',
          cursor: 'pointer',
          padding: '2px',
          marginLeft: '4px'
        }}
        title="Minimizar cronômetro"
      >
        <IconeFechar tamanho={16} />
      </button>
    </div>
  );
};
