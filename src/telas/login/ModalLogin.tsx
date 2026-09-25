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
  const [email, setEmail] = useState<string>(abaInicial === 'professor' ? 'sara@sharaef.com.br' : '');
  const [senha, setSenha] = useState<string>('');
  const [erro, setErro] = useState<string>('');
  const [carregando, setCarregando] = useState<boolean>(false);

  const trocarAba = (aba: 'aluno' | 'professor') => {
    setAbaAtiva(aba);
    setErro('');
    if (aba === 'professor') {
      setEmail('sara@sharaef.com.br');
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
              {abaAtiva === 'professor' ? 'Acesso Professora Sara' : 'Acesso de Aluno'}
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

        {abaAtiva === 'professor' && (
          <div style={{ marginTop: '1.2rem', textAlign: 'center', fontSize: '0.78rem', color: '#64748b' }}>
            Acesso exclusivo para a professora Sara. Credenciais seguras e isolamento total de dados.
          </div>
        )}
      </div>
    </div>
  );
};
