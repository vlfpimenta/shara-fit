import React, { useEffect, useState } from 'react';
import { IconeChave, IconeFechar, IconeUsuario } from '../../componentes/icones';
import { ServicoArmazenamento } from '../../servicos/armazenamento';
import { UsuarioSessao } from '../../tipos';

interface PropriedadesModalLogin {
  abaInicial?: 'aluno' | 'professor';
  aoFechar: () => void;
  aoSucessoLogin: (usuario: UsuarioSessao) => void;
  aoAbrirNovoAluno: () => void;
}

export const ModalLogin: React.FC<PropriedadesModalLogin> = ({
  abaInicial = 'aluno',
  aoFechar,
  aoSucessoLogin,
  aoAbrirNovoAluno
}) => {
  const [abaAtiva, setAbaAtiva] = useState<'aluno' | 'professor'>(abaInicial);
  const [email, setEmail] = useState<string>('');
  const [senha, setSenha] = useState<string>('');
  const [erro, setErro] = useState<string>('');
  const [carregando, setCarregando] = useState<boolean>(false);

  // Estados da Professora
  const [verificandoStatus, setVerificandoStatus] = useState<boolean>(false);
  const [professorConfigurado, setProfessorConfigurado] = useState<boolean | null>(null);
  const [modoPrimeiroAcessoProfessora, setModoPrimeiroAcessoProfessora] = useState<boolean>(false);
  const [nomeProf, setNomeProf] = useState<string>('Sara');
  const [emailProf, setEmailProf] = useState<string>('');
  const [senhaProf, setSenhaProf] = useState<string>('');
  const [confirmarSenhaProf, setConfirmarSenhaProf] = useState<string>('');

  const checarStatusProfessora = async () => {
    setVerificandoStatus(true);
    setErro('');
    try {
      const status = await ServicoArmazenamento.verificarStatusProfessora();
      setProfessorConfigurado(status.configurado);
      if (!status.configurado) {
        setModoPrimeiroAcessoProfessora(true);
        setNomeProf('Sara');
        setEmailProf('');
      } else {
        setModoPrimeiroAcessoProfessora(false);
        if (status.email) {
          setEmail(status.email);
        }
      }
    } catch {
      setProfessorConfigurado(false);
      setModoPrimeiroAcessoProfessora(true);
    } finally {
      setVerificandoStatus(false);
    }
  };

  useEffect(() => {
    if (abaAtiva === 'professor') {
      checarStatusProfessora();
    } else {
      setErro('');
    }
  }, [abaAtiva]);

  const trocarAba = (aba: 'aluno' | 'professor') => {
    setAbaAtiva(aba);
    setErro('');
    setSenha('');
    if (aba === 'aluno') {
      setEmail('');
    }
  };

  const executarLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErro('');
    setCarregando(true);

    try {
      const resultado = await ServicoArmazenamento.autenticar(email, senha);
      setCarregando(false);

      if (!resultado.sucesso || !resultado.usuario) {
        return setErro(resultado.mensagem);
      }

      aoSucessoLogin(resultado.usuario);
      aoFechar();
    } catch {
      setCarregando(false);
      setErro('Erro ao realizar login.');
    }
  };

  const executarCadastroProfessora = async (e: React.FormEvent) => {
    e.preventDefault();
    setErro('');

    if (!emailProf.trim() || !emailProf.includes('@')) {
      return setErro('Informe um e-mail válido.');
    }
    if (!senhaProf || senhaProf.length < 6) {
      return setErro('A senha deve ter no mínimo 6 caracteres.');
    }
    if (senhaProf !== confirmarSenhaProf) {
      return setErro('As senhas não conferem.');
    }

    setCarregando(true);
    try {
      const resultado = await ServicoArmazenamento.configurarCredenciaisProfessora(
        nomeProf,
        emailProf,
        senhaProf
      );
      setCarregando(false);

      if (resultado.sucesso && resultado.usuario) {
        aoSucessoLogin(resultado.usuario);
        aoFechar();
      } else {
        setErro(resultado.mensagem);
      }
    } catch {
      setCarregando(false);
      setErro('Erro ao registrar credenciais da professora.');
    }
  };

  return (
    <div className="overlay-modal" onClick={aoFechar}>
      <div className="conteudo-modal" onClick={(e) => e.stopPropagation()}>
        <div className="cabecalho-modal">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
            <div
              style={{
                width: '28px',
                height: '28px',
                borderRadius: '7px',
                background: abaAtiva === 'professor' ? '#ff2e7e' : '#38bdf8',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              {abaAtiva === 'professor' ? <IconeChave tamanho={15} cor="#fff" /> : <IconeUsuario tamanho={15} cor="#fff" />}
            </div>
            <h3 className="titulo-modal">
              {abaAtiva === 'professor'
                ? modoPrimeiroAcessoProfessora
                  ? 'Cadastro da Professora'
                  : 'Acesso Professora'
                : 'Acesso de Aluno'}
            </h3>
          </div>
          <button
            onClick={aoFechar}
            style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: '3px' }}
          >
            <IconeFechar tamanho={16} />
          </button>
        </div>

        {/* Abas Alternadoras Aluno / Professor */}
        <div
          style={{
            display: 'flex',
            background: '#0c0f1d',
            borderRadius: '9px',
            padding: '3px',
            marginBottom: '1rem',
            border: '1px solid #28325c'
          }}
        >
          <button
            type="button"
            onClick={() => trocarAba('aluno')}
            style={{
              flex: 1,
              padding: '0.45rem',
              borderRadius: '7px',
              border: 'none',
              background: abaAtiva === 'aluno' ? 'rgba(56, 189, 248, 0.2)' : 'transparent',
              color: abaAtiva === 'aluno' ? '#38bdf8' : '#94a3b8',
              fontWeight: 700,
              cursor: 'pointer',
              fontSize: '0.78rem',
              transition: 'all 0.2s ease'
            }}
          >
            Área do Aluno
          </button>
          <button
            type="button"
            onClick={() => trocarAba('professor')}
            style={{
              flex: 1,
              padding: '0.45rem',
              borderRadius: '7px',
              border: 'none',
              background: abaAtiva === 'professor' ? 'rgba(255, 46, 126, 0.2)' : 'transparent',
              color: abaAtiva === 'professor' ? '#ff2e7e' : '#94a3b8',
              fontWeight: 700,
              cursor: 'pointer',
              fontSize: '0.78rem',
              transition: 'all 0.2s ease'
            }}
          >
            Área da Professora
          </button>
        </div>

        {erro && (
          <div
            style={{
              background: 'rgba(239, 68, 68, 0.15)',
              border: '1px solid #ef4444',
              color: '#fca5a5',
              padding: '0.55rem 0.75rem',
              borderRadius: '8px',
              fontSize: '0.8rem',
              marginBottom: '1rem'
            }}
          >
            ⚠️ {erro}
          </div>
        )}

        {/* Verificação inicial do status do professor */}
        {abaAtiva === 'professor' && verificandoStatus ? (
          <div style={{ textAlign: 'center', padding: '2rem 1rem', color: '#94a3b8', fontSize: '0.9rem' }}>
            <div style={{ marginBottom: '0.5rem' }}>⏳ Verificando cadastro...</div>
          </div>
        ) : abaAtiva === 'professor' && modoPrimeiroAcessoProfessora ? (
          /* Formulário de Cadastro da Professora (quando não existe credencial ou clicou em alterar) */
          <form onSubmit={executarCadastroProfessora} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div
              style={{
                background: 'rgba(255, 46, 126, 0.08)',
                border: '1px solid rgba(255, 46, 126, 0.25)',
                padding: '0.75rem',
                borderRadius: '8px',
                fontSize: '0.85rem',
                color: '#cbd5e1'
              }}
            >
              Defina seu e-mail e senha para acesso exclusivo à administração.
            </div>

            <div className="grupo-campo">
              <label className="rotulo-campo">Nome</label>
              <input
                type="text"
                className="campo-texto"
                required
                value={nomeProf}
                onChange={(e) => setNomeProf(e.target.value)}
              />
            </div>

            <div className="grupo-campo">
              <label className="rotulo-campo">E-mail</label>
              <input
                type="email"
                className="campo-texto"
                required
                placeholder="seuemail@exemplo.com"
                value={emailProf}
                onChange={(e) => setEmailProf(e.target.value)}
              />
            </div>

            <div className="grupo-campo">
              <label className="rotulo-campo">Senha</label>
              <input
                type="password"
                className="campo-texto"
                required
                placeholder="Mínimo 6 caracteres"
                value={senhaProf}
                onChange={(e) => setSenhaProf(e.target.value)}
              />
            </div>

            <div className="grupo-campo">
              <label className="rotulo-campo">Confirmar Senha</label>
              <input
                type="password"
                className="campo-texto"
                required
                placeholder="Repita a senha"
                value={confirmarSenhaProf}
                onChange={(e) => setConfirmarSenhaProf(e.target.value)}
              />
            </div>

            <button
              type="submit"
              className="botao-primario"
              disabled={carregando}
              style={{ width: '100%', marginTop: '0.4rem', background: 'var(--gradiente-primario)' }}
            >
              {carregando ? 'Cadastrando...' : 'Cadastrar e Acessar'}
            </button>

            {professorConfigurado && (
              <button
                type="button"
                className="botao-secundario"
                onClick={() => {
                  setModoPrimeiroAcessoProfessora(false);
                  setErro('');
                }}
                style={{ width: '100%', fontSize: '0.85rem' }}
              >
                Voltar ao Login
              </button>
            )}
          </form>
        ) : (
          /* Formulário de Login Padrão (Aluno ou Professora já cadastrada) */
          <form onSubmit={executarLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div className="grupo-campo">
              <label className="rotulo-campo">E-mail</label>
              <input
                type="email"
                className="campo-texto"
                required
                placeholder="seuemail@exemplo.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div className="grupo-campo">
              <label className="rotulo-campo">Senha</label>
              <input
                type="password"
                className="campo-texto"
                required
                placeholder="Sua senha"
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
              />
            </div>

            <button
              type="submit"
              className="botao-primario"
              disabled={carregando}
              style={{
                width: '100%',
                marginTop: '0.4rem',
                background: abaAtiva === 'professor' ? 'var(--gradiente-primario)' : 'var(--gradiente-ciano)'
              }}
            >
              {carregando ? 'Entrando...' : abaAtiva === 'professor' ? 'Acessar Painel' : 'Entrar'}
            </button>
          </form>
        )}

        {/* Rodapé da Modal */}
        {abaAtiva === 'aluno' && (
          <div style={{ marginTop: '0.85rem', textAlign: 'center', borderTop: '1px solid #28325c', paddingTop: '0.6rem' }}>
            <span style={{ fontSize: '0.78rem', color: '#94a3b8' }}>Novo aluno? </span>
            <button
              onClick={() => {
                aoFechar();
                aoAbrirNovoAluno();
              }}
              style={{
                background: 'none',
                border: 'none',
                color: '#ff2e7e',
                fontWeight: 700,
                fontSize: '0.78rem',
                cursor: 'pointer',
                textDecoration: 'underline'
              }}
            >
              Cadastre-se aqui
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
