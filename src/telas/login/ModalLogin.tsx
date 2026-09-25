import React, { useState } from 'react';
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
  const [email, setEmail] = useState<string>(() =>
    abaInicial === 'professor' ? ServicoArmazenamento.obterDadosProfessora().email : ''
  );
  const [senha, setSenha] = useState<string>('');
  const [erro, setErro] = useState<string>('');
  const [carregando, setCarregando] = useState<boolean>(false);

  // Estados para Primeiro Acesso da Professora
  const [modoPrimeiroAcessoProfessora, setModoPrimeiroAcessoProfessora] = useState<boolean>(false);
  const [nomeProf, setNomeProf] = useState<string>('Sara');
  const [emailProf, setEmailProf] = useState<string>('');
  const [senhaProf, setSenhaProf] = useState<string>('');
  const [confirmarSenhaProf, setConfirmarSenhaProf] = useState<string>('');

  const trocarAba = (aba: 'aluno' | 'professor') => {
    setAbaAtiva(aba);
    setErro('');
    setModoPrimeiroAcessoProfessora(false);
    if (aba === 'professor') {
      setEmail(ServicoArmazenamento.obterDadosProfessora().email);
    } else {
      setEmail('');
    }
    setSenha('');
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
      setErro('Erro inesperado ao realizar login.');
    }
  };

  const executarCadastroProfessora = async (e: React.FormEvent) => {
    e.preventDefault();
    setErro('');

    if (!emailProf.trim() || !emailProf.includes('@')) {
      return setErro('Por favor, informe um e-mail válido.');
    }
    if (!senhaProf || senhaProf.length < 6) {
      return setErro('A senha deve possuir no mínimo 6 caracteres.');
    }
    if (senhaProf !== confirmarSenhaProf) {
      return setErro('As senhas digitadas não conferem.');
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
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <div
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '8px',
                background: abaAtiva === 'professor' ? '#ff2e7e' : '#38bdf8',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              {abaAtiva === 'professor' ? <IconeChave tamanho={18} cor="#fff" /> : <IconeUsuario tamanho={18} cor="#fff" />}
            </div>
            <h3 className="titulo-modal">
              {abaAtiva === 'professor'
                ? modoPrimeiroAcessoProfessora
                  ? 'Primeiro Acesso: Cadastro da Professora'
                  : 'Acesso Professora Sara'
                : 'Acesso de Aluno'}
            </h3>
          </div>
          <button
            onClick={aoFechar}
            style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: '4px' }}
          >
            <IconeFechar tamanho={20} />
          </button>
        </div>

        {/* Abas Alternadoras Aluno / Professor */}
        <div
          style={{
            display: 'flex',
            background: '#0c0f1d',
            borderRadius: '10px',
            padding: '4px',
            marginBottom: '1.5rem',
            border: '1px solid #28325c'
          }}
        >
          <button
            type="button"
            onClick={() => trocarAba('aluno')}
            style={{
              flex: 1,
              padding: '0.6rem',
              borderRadius: '8px',
              border: 'none',
              background: abaAtiva === 'aluno' ? 'rgba(56, 189, 248, 0.2)' : 'transparent',
              color: abaAtiva === 'aluno' ? '#38bdf8' : '#94a3b8',
              fontWeight: 700,
              cursor: 'pointer',
              fontSize: '0.85rem',
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
              padding: '0.6rem',
              borderRadius: '8px',
              border: 'none',
              background: abaAtiva === 'professor' ? 'rgba(255, 46, 126, 0.2)' : 'transparent',
              color: abaAtiva === 'professor' ? '#ff2e7e' : '#94a3b8',
              fontWeight: 700,
              cursor: 'pointer',
              fontSize: '0.85rem',
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
              padding: '0.75rem',
              borderRadius: '8px',
              fontSize: '0.88rem',
              marginBottom: '1.2rem'
            }}
          >
            ⚠️ {erro}
          </div>
        )}

        {/* Área da Professora: Primeiro Acesso vs Login Padrão */}
        {abaAtiva === 'professor' && modoPrimeiroAcessoProfessora ? (
          /* Formulário de Primeiro Acesso da Professora */
          <form onSubmit={executarCadastroProfessora} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div
              style={{
                background: 'rgba(255, 46, 126, 0.08)',
                border: '1px solid rgba(255, 46, 126, 0.25)',
                padding: '0.8rem',
                borderRadius: '8px',
                fontSize: '0.82rem',
                color: '#cbd5e1'
              }}
            >
              Cadastre seu e-mail pessoal e defina sua senha para administrar o sistema com total segurança.
            </div>

            <div className="grupo-campo">
              <label className="rotulo-campo">Nome da Professora</label>
              <input
                type="text"
                className="campo-texto"
                required
                value={nomeProf}
                onChange={(e) => setNomeProf(e.target.value)}
              />
            </div>

            <div className="grupo-campo">
              <label className="rotulo-campo">Seu E-mail Pessoal</label>
              <input
                type="email"
                className="campo-texto"
                required
                placeholder="exemplo@gmail.com"
                value={emailProf}
                onChange={(e) => setEmailProf(e.target.value)}
              />
            </div>

            <div className="grupo-campo">
              <label className="rotulo-campo">Criar Nova Senha</label>
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
              <label className="rotulo-campo">Confirmar Nova Senha</label>
              <input
                type="password"
                className="campo-texto"
                required
                placeholder="Repita a nova senha"
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
              {carregando ? 'Salvando...' : 'Salvar Credenciais e Acessar Painel'}
            </button>

            <button
              type="button"
              className="botao-secundario"
              onClick={() => {
                setModoPrimeiroAcessoProfessora(false);
                setErro('');
              }}
              style={{ width: '100%', fontSize: '0.85rem' }}
            >
              Voltar ao Login com Senha Atual
            </button>
          </form>
        ) : (
          /* Formulário de Login Padrão (Aluno ou Professora) */
          <>
            {/* Aviso de Primeiro Acesso quando estiver na aba da Professora */}
            {abaAtiva === 'professor' && (
              <div
                style={{
                  background: 'rgba(255, 46, 126, 0.08)',
                  border: '1px solid rgba(255, 46, 126, 0.25)',
                  borderRadius: '10px',
                  padding: '0.8rem 1rem',
                  marginBottom: '1rem',
                  fontSize: '0.83rem',
                  color: '#cbd5e1'
                }}
              >
                <div style={{ fontWeight: 700, color: '#ff80aa', marginBottom: '0.3rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  🔑 Primeiro Acesso da Professora?
                </div>
                Você pode entrar com a credencial inicial (<code>sara@sharaef.com.br</code> / <code>sara123</code>) ou{' '}
                <button
                  type="button"
                  onClick={() => {
                    setModoPrimeiroAcessoProfessora(true);
                    setErro('');
                  }}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#38bdf8',
                    fontWeight: 700,
                    cursor: 'pointer',
                    textDecoration: 'underline',
                    padding: 0
                  }}
                >
                  cadastrar seu próprio e-mail e senha aqui
                </button>.
              </div>
            )}

            <form onSubmit={executarLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div className="grupo-campo">
                <label className="rotulo-campo">E-mail Cadastrado</label>
                <div style={{ position: 'relative' }}>
                  <input
                    type="email"
                    className="campo-texto"
                    required
                    placeholder={abaAtiva === 'professor' ? 'sara@sharaef.com.br' : 'seuemail@exemplo.com'}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              </div>

              <div className="grupo-campo">
                <label className="rotulo-campo">Senha</label>
                <input
                  type="password"
                  className="campo-texto"
                  required
                  placeholder="Digite sua senha"
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
                  marginTop: '0.5rem',
                  background: abaAtiva === 'professor' ? 'var(--gradiente-primario)' : 'var(--gradiente-ciano)'
                }}
              >
                {carregando ? 'Entrando...' : abaAtiva === 'professor' ? 'Acessar Painel de Controle' : 'Entrar e Ver Meus Treinos'}
              </button>
            </form>
          </>
        )}

        {/* Rodapé do Modal */}
        {abaAtiva === 'aluno' && (
          <div style={{ marginTop: '1.5rem', textAlign: 'center', borderTop: '1px solid #28325c', paddingTop: '1rem' }}>
            <span style={{ fontSize: '0.85rem', color: '#94a3b8' }}>Ainda não tem cadastro? </span>
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
                fontSize: '0.85rem',
                cursor: 'pointer',
                textDecoration: 'underline'
              }}
            >
              Preencher Anamnese
            </button>
          </div>
        )}

        {abaAtiva === 'professor' && !modoPrimeiroAcessoProfessora && (
          <div style={{ marginTop: '1.2rem', textAlign: 'center', fontSize: '0.78rem', color: '#64748b' }}>
            Acesso exclusivo para a professora Sara. Credenciais seguras e isolamento total de dados.
          </div>
        )}
      </div>
    </div>
  );
};
