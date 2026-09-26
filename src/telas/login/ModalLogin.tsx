import React, { useState } from 'react';
import { IconeFechar, IconeUsuario } from '../../componentes/icones';
import { ServicoArmazenamento } from '../../servicos/armazenamento';
import { UsuarioSessao } from '../../tipos';

interface PropriedadesModalLogin {
  aoFechar: () => void;
  aoSucessoLogin: (usuario: UsuarioSessao) => void;
  aoAbrirNovoAluno: () => void;
}

export const ModalLogin: React.FC<PropriedadesModalLogin> = ({
  aoFechar,
  aoSucessoLogin,
  aoAbrirNovoAluno
}) => {
  const [email, setEmail] = useState<string>('');
  const [senha, setSenha] = useState<string>('');
  const [erro, setErro] = useState<string>('');
  const [carregando, setCarregando] = useState<boolean>(false);

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
                background: '#38bdf8',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <IconeUsuario tamanho={15} cor="#fff" />
            </div>
            <h3 className="titulo-modal">Acesso de Aluno</h3>
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

        <form onSubmit={executarLogin} style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
          <div className="grupo-campo">
            <label className="rotulo-campo">E-mail do Aluno</label>
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
              placeholder="Sua senha de aluno"
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
              background: 'var(--gradiente-ciano)'
            }}
          >
            {carregando ? 'Entrando...' : 'Entrar no Treino'}
          </button>
        </form>

        {/* Rodapé da Modal com link para novo cadastro */}
        <div style={{ marginTop: '0.85rem', textAlign: 'center', borderTop: '1px solid #28325c', paddingTop: '0.6rem' }}>
          <span style={{ fontSize: '0.78rem', color: '#94a3b8' }}>Ainda não tem ficha? </span>
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
      </div>
    </div>
  );
};
