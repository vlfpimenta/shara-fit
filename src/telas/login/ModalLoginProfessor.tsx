import React, { useEffect, useState } from 'react';
import { IconeChave, IconeFechar } from '../../componentes/icones';
import { ServicoArmazenamento } from '../../servicos/armazenamento';
import { UsuarioSessao } from '../../tipos';

interface PropriedadesModalLoginProfessor {
  aoFechar: () => void;
  aoSucessoLogin: (usuario: UsuarioSessao) => void;
}

export const ModalLoginProfessor: React.FC<PropriedadesModalLoginProfessor> = ({
  aoFechar,
  aoSucessoLogin
}) => {
  const [email, setEmail] = useState<string>('');
  const [senha, setSenha] = useState<string>('');
  const [erro, setErro] = useState<string>('');
  const [carregando, setCarregando] = useState<boolean>(false);

  // Estados de primeiro acesso / configuração
  const [verificandoStatus, setVerificandoStatus] = useState<boolean>(false);
  const [professorConfigurado, setProfessorConfigurado] = useState<boolean | null>(null);
  const [modoPrimeiroAcesso, setModoPrimeiroAcesso] = useState<boolean>(false);
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
        setModoPrimeiroAcesso(true);
        setNomeProf('Sara');
        setEmailProf('');
      } else {
        setModoPrimeiroAcesso(false);
        if (status.email) {
          setEmail(status.email);
        }
      }
    } catch {
      setProfessorConfigurado(false);
      setModoPrimeiroAcesso(true);
    } finally {
      setVerificandoStatus(false);
    }
  };

  useEffect(() => {
    checarStatusProfessora();
  }, []);

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

      if (resultado.usuario.papel !== 'professor') {
        return setErro('Esta conta não possui permissão de professora.');
      }

      aoSucessoLogin(resultado.usuario);
      aoFechar();
    } catch {
      setCarregando(false);
      setErro('Erro ao realizar login da professora.');
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
    <div className="overlay-modal" onClick={aoFechar} style={{ zIndex: 1100 }}>
      <div className="conteudo-modal" onClick={(e) => e.stopPropagation()}>
        <div className="cabecalho-modal">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
            <div
              style={{
                width: '28px',
                height: '28px',
                borderRadius: '7px',
                background: '#ff2e7e',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <IconeChave tamanho={15} cor="#fff" />
            </div>
            <div>
              <span className="badge badge-primaria" style={{ fontSize: '0.62rem', marginBottom: '0.1rem' }}>
                Acesso Administrativo
              </span>
              <h3 className="titulo-modal">
                {modoPrimeiroAcesso ? 'Cadastro da Professora' : 'Painel da Sara'}
              </h3>
            </div>
          </div>
          <button
            onClick={aoFechar}
            style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: '3px' }}
            title="Fechar login"
          >
            <IconeFechar tamanho={16} />
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
        {verificandoStatus ? (
          <div style={{ textAlign: 'center', padding: '2rem 1rem', color: '#94a3b8', fontSize: '0.85rem' }}>
            <div style={{ marginBottom: '0.4rem' }}>⏳ Verificando credenciais...</div>
          </div>
        ) : modoPrimeiroAcesso ? (
          /* Formulário de Primeiro Cadastro da Professora */
          <form onSubmit={executarCadastroProfessora} style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            <div
              style={{
                background: 'rgba(255, 46, 126, 0.08)',
                border: '1px solid rgba(255, 46, 126, 0.25)',
                padding: '0.65rem',
                borderRadius: '8px',
                fontSize: '0.8rem',
                color: '#cbd5e1'
              }}
            >
              Defina seu e-mail e senha para acesso exclusivo à administração do Shara-EF.
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
              style={{ width: '100%', marginTop: '0.35rem', background: 'var(--gradiente-primario)' }}
            >
              {carregando ? 'Cadastrando...' : 'Cadastrar e Acessar'}
            </button>

            {professorConfigurado && (
              <button
                type="button"
                className="botao-secundario"
                onClick={() => {
                  setModoPrimeiroAcesso(false);
                  setErro('');
                }}
                style={{ width: '100%', fontSize: '0.82rem' }}
              >
                Voltar ao Login
              </button>
            )}
          </form>
        ) : (
          /* Formulário de Login Padrão da Professora */
          <form onSubmit={executarLogin} style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            <div className="grupo-campo">
              <label className="rotulo-campo">E-mail da Sara</label>
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
                placeholder="Sua senha de professora"
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
                marginTop: '0.35rem',
                background: 'var(--gradiente-primario)'
              }}
            >
              {carregando ? 'Entrando...' : 'Acessar Painel da Professora'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
