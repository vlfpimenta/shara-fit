import React, { useState } from 'react';
import { IconeAvancar, IconeCheck, IconeVoltar } from '../../componentes/icones';
import { ServicoArmazenamento } from '../../servicos/armazenamento';
import { RespostasAnamnese, UsuarioAluno } from '../../tipos';

interface PropriedadesTelaNovoAluno {
  aoConcluirCadastro: (aluno: UsuarioAluno) => void;
  aoCancelar: () => void;
}

export const TelaNovoAluno: React.FC<PropriedadesTelaNovoAluno> = ({ aoConcluirCadastro, aoCancelar }) => {
  const [etapaAtual, setEtapaAtual] = useState<number>(1);
  const totalEtapas = 4;

  // Estado das 13 perguntas da Anamnese do Forms
  const [formulario, setFormulario] = useState<RespostasAnamnese>({
    nome: '',
    idade: '',
    contato: '',
    peso: '',
    altura: '',
    relacaoAtividade: '',
    possuiRestricaoMedica: 'Não',
    descricaoRestricaoMedica: '',
    possuiLesaoDorCronica: 'Não',
    descricaoLesaoDorCronica: '',
    possuiDoenca: [],
    outraDoenca: '',
    disponibilidadeTreino: [],
    horarioPreferencial: '',
    historicoTreino: '',
    nivelConhecimentoTreino: 5,
    objetivoPrincipal: '',
    outroObjetivo: '',
    localTreino: '',
    outroLocal: '',
    informacoesRelevantes: '',
    dataPreenchimento: new Date().toISOString().split('T')[0]
  });

  // Credenciais para o acesso final
  const [email, setEmail] = useState<string>('');
  const [senha, setSenha] = useState<string>('');
  const [confirmarSenha, setConfirmarSenha] = useState<string>('');
  const [erroValidacao, setErroValidacao] = useState<string>('');
  const [sucessoCriacao, setSucessoCriacao] = useState<boolean>(false);

  // Cálculo dinâmico de IMC para apoio visual
  const calcularImc = (): { imc: string; classificacao: string } | null => {
    const p = parseFloat(formulario.peso.replace(',', '.'));
    const a = parseFloat(formulario.altura.replace(',', '.'));
    if (!p || !a) return null;
    const alturaEmMetros = a > 3 ? a / 100 : a;
    if (alturaEmMetros <= 0) return null;
    const valor = p / (alturaEmMetros * alturaEmMetros);
    let classificacao = 'Normal';
    if (valor < 18.5) classificacao = 'Abaixo do peso';
    else if (valor < 25) classificacao = 'Peso adequado';
    else if (valor < 30) classificacao = 'Sobrepeso';
    else classificacao = 'Obesidade';
    return { imc: valor.toFixed(1), classificacao };
  };

  const imcCalculado = calcularImc();

  // Alternar opções de caixas de seleção
  const alternarOpcaoLista = (campo: 'possuiDoenca' | 'disponibilidadeTreino', opcao: string) => {
    const listaAtual = [...formulario[campo]];
    const index = listaAtual.indexOf(opcao);
    if (index > -1) {
      listaAtual.splice(index, 1);
    } else {
      listaAtual.push(opcao);
    }
    setFormulario({ ...formulario, [campo]: listaAtual });
  };

  // Validação por etapa
  const avancarEtapa = () => {
    setErroValidacao('');
    if (etapaAtual === 1) {
      if (!formulario.nome.trim()) return setErroValidacao('Por favor, informe seu nome completo.');
      if (!formulario.idade.trim()) return setErroValidacao('Por favor, informe sua idade.');
      if (!formulario.contato.trim()) return setErroValidacao('Por favor, informe seu contato (WhatsApp).');
      if (!formulario.peso.trim() || !formulario.altura.trim()) {
        return setErroValidacao('Informe seu peso e altura para cálculo de parâmetros físicos.');
      }
    } else if (etapaAtual === 2) {
      if (!formulario.relacaoAtividade.trim()) {
        return setErroValidacao('Por favor, informe sua relação com a atividade física.');
      }
      if (!formulario.objetivoPrincipal.trim()) {
        return setErroValidacao('Selecione seu objetivo principal.');
      }
      if (!formulario.localTreino.trim()) {
        return setErroValidacao('Informe onde você vai realizar os treinos.');
      }
    } else if (etapaAtual === 3) {
      if (formulario.disponibilidadeTreino.length === 0) {
        return setErroValidacao('Selecione pelo menos um dia disponível para treinar.');
      }
    }
    setEtapaAtual(etapaAtual + 1);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const voltarEtapa = () => {
    setErroValidacao('');
    if (etapaAtual > 1) {
      setEtapaAtual(etapaAtual - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      aoCancelar();
    }
  };

  // Finalização do cadastro
  const finalizarCadastro = async (e: React.FormEvent) => {
    e.preventDefault();
    setErroValidacao('');

    if (!email.trim() || !email.includes('@')) {
      return setErroValidacao('Informe um e-mail válido para acessar o sistema.');
    }
    if (!senha || senha.length < 6) {
      return setErroValidacao('A senha deve ter no mínimo 6 caracteres.');
    }
    if (senha !== confirmarSenha) {
      return setErroValidacao('As senhas digitadas não coincidem.');
    }

    const resultado = await ServicoArmazenamento.cadastrarNovoAluno(formulario, email, senha);

    if (!resultado.sucesso || !resultado.aluno) {
      return setErroValidacao(resultado.mensagem);
    }

    setSucessoCriacao(true);
    setTimeout(() => {
      aoConcluirCadastro(resultado.aluno!);
    }, 1200);
  };

  return (
    <div style={{ maxWidth: '720px', margin: '0 auto', padding: '1rem 0' }}>
      {/* Barra de Progresso do Wizard */}
      <div style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.6rem' }}>
          <span style={{ fontSize: '0.85rem', color: '#ff2e7e', fontWeight: 700, textTransform: 'uppercase' }}>
            Etapa {etapaAtual} de {totalEtapas}
          </span>
          <span style={{ fontSize: '0.85rem', color: '#94a3b8' }}>
            {etapaAtual === 1 && 'Identificação & Biometria'}
            {etapaAtual === 2 && 'Objetivos & Nível de Treino'}
            {etapaAtual === 3 && 'Saúde & Disponibilidade'}
            {etapaAtual === 4 && 'Criar E-mail e Senha'}
          </span>
        </div>
        <div style={{ width: '100%', height: '6px', background: '#1c2344', borderRadius: '9999px', overflow: 'hidden' }}>
          <div
            style={{
              width: `${(etapaAtual / totalEtapas) * 100}%`,
              height: '100%',
              background: 'linear-gradient(90deg, #ff2e7e, #ff0055, #38bdf8)',
              transition: 'width 0.3s ease'
            }}
          />
        </div>
      </div>

      <div className="cartao" style={{ position: 'relative' }}>
        {/* Cabeçalho do Formulário */}
        <div style={{ marginBottom: '1.8rem', borderBottom: '1px solid #28325c', paddingBottom: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.3rem' }}>
            <span className="badge badge-primaria">Anamnese Oficial</span>
          </div>
          <h2 style={{ fontSize: '1.4rem', color: '#ffffff' }}>Questionário de Anamnese & Cadastro</h2>
          <p style={{ color: '#94a3b8', fontSize: '0.88rem' }}>
            Responda as perguntas a seguir com o máximo de sinceridade para que a professora Sara monte seu treino individualizado.
          </p>
        </div>

        {erroValidacao && (
          <div
            style={{
              background: 'rgba(239, 68, 68, 0.15)',
              border: '1px solid #ef4444',
              color: '#fca5a5',
              padding: '0.8rem 1rem',
              borderRadius: '10px',
              fontSize: '0.9rem',
              marginBottom: '1.2rem'
            }}
          >
            ⚠️ {erroValidacao}
          </div>
        )}

        {sucessoCriacao ? (
          <div style={{ textAlign: 'center', padding: '3rem 1rem' }}>
            <div
              style={{
                width: '64px',
                height: '64px',
                borderRadius: '50%',
                background: 'rgba(16, 185, 129, 0.2)',
                border: '2px solid #10b981',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 1.5rem auto'
              }}
            >
              <IconeCheck tamanho={36} cor="#10b981" />
            </div>
            <h3 style={{ fontSize: '1.5rem', color: '#ffffff', marginBottom: '0.5rem' }}>Cadastro Realizado com Sucesso!</h3>
            <p style={{ color: '#94a3b8' }}>
              Seus dados foram salvos. Redirecionando para a sua área de aluno no Shara-EF...
            </p>
          </div>
        ) : (
          <div>
            {/* ETAPA 1: Identificação, Contato e Biometria (Perguntas 1, 2, 3, 4) */}
            {etapaAtual === 1 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
                <div className="grupo-campo">
                  <label className="rotulo-campo">
                    1. Nome Completo <span className="obrigatorio">*</span>
                  </label>
                  <input
                    type="text"
                    className="campo-texto"
                    placeholder="Ex: Amanda Silva"
                    value={formulario.nome}
                    onChange={(e) => setFormulario({ ...formulario, nome: e.target.value })}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div className="grupo-campo">
                    <label className="rotulo-campo">
                      2. Idade <span className="obrigatorio">*</span>
                    </label>
                    <input
                      type="number"
                      className="campo-texto"
                      placeholder="Ex: 27"
                      value={formulario.idade}
                      onChange={(e) => setFormulario({ ...formulario, idade: e.target.value })}
                    />
                  </div>

                  <div className="grupo-campo">
                    <label className="rotulo-campo">
                      3. Contato (WhatsApp) <span className="obrigatorio">*</span>
                    </label>
                    <input
                      type="tel"
                      className="campo-texto"
                      placeholder="(DD) 99999-9999"
                      value={formulario.contato}
                      onChange={(e) => setFormulario({ ...formulario, contato: e.target.value })}
                    />
                  </div>
                </div>

                <div className="grupo-campo">
                  <label className="rotulo-campo">
                    4. Qual o seu peso e altura? <span className="obrigatorio">*</span>
                  </label>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <input
                      type="text"
                      className="campo-texto"
                      placeholder="Peso (kg) - Ex: 65.5"
                      value={formulario.peso}
                      onChange={(e) => setFormulario({ ...formulario, peso: e.target.value })}
                    />
                    <input
                      type="text"
                      className="campo-texto"
                      placeholder="Altura (cm) - Ex: 168"
                      value={formulario.altura}
                      onChange={(e) => setFormulario({ ...formulario, altura: e.target.value })}
                    />
                  </div>
                  {imcCalculado && (
                    <div
                      style={{
                        marginTop: '0.6rem',
                        padding: '0.6rem 0.9rem',
                        background: 'rgba(56, 189, 248, 0.1)',
                        border: '1px solid rgba(56, 189, 248, 0.25)',
                        borderRadius: '8px',
                        fontSize: '0.85rem',
                        color: '#bae6fd',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                      }}
                    >
                      <span>
                        IMC Estimado: <strong>{imcCalculado.imc} kg/m²</strong>
                      </span>
                      <span className="badge badge-ciano">{imcCalculado.classificacao}</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* ETAPA 2: Experiência, Objetivos e Local (Perguntas 5, 10, 11, 12) */}
            {etapaAtual === 2 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
                <div className="grupo-campo">
                  <label className="rotulo-campo">
                    5. Qual sua relação com a atividade física? <span className="obrigatorio">*</span>
                  </label>
                  <select
                    className="campo-select"
                    value={formulario.relacaoAtividade}
                    onChange={(e) => setFormulario({ ...formulario, relacaoAtividade: e.target.value })}
                  >
                    <option value="">Selecione...</option>
                    <option value="Sedentário(a), nunca treinei regularmente">Sedentário(a), nunca treinei regularmente</option>
                    <option value="Já treinei no passado, mas estou parado(a)">Já treinei no passado, mas estou parado(a)</option>
                    <option value="Treino esporadicamente (1 a 2x por semana)">Treino esporadicamente (1 a 2x por semana)</option>
                    <option value="Pratico musculação atualmente de forma contínua">Pratico musculação atualmente de forma contínua</option>
                    <option value="Pratico outros esportes (corrida, crossfit, natação...)">Pratico outros esportes</option>
                  </select>
                </div>

                <div className="grupo-campo">
                  <label className="rotulo-campo">
                    10. Atualmente treina ou já treinou? De 0 a 10 qual o seu nível de conhecimento sobre treinamento?
                  </label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginTop: '0.4rem' }}>
                    <input
                      type="range"
                      min="0"
                      max="10"
                      step="1"
                      value={formulario.nivelConhecimentoTreino}
                      onChange={(e) => setFormulario({ ...formulario, nivelConhecimentoTreino: parseInt(e.target.value) })}
                      style={{ flex: 1, accentColor: '#ff2e7e' }}
                    />
                    <span
                      style={{
                        fontSize: '1.1rem',
                        fontWeight: 800,
                        color: '#ff2e7e',
                        minWidth: '40px',
                        textAlign: 'center',
                        background: 'rgba(255, 46, 126, 0.15)',
                        padding: '0.2rem 0.5rem',
                        borderRadius: '6px'
                      }}
                    >
                      {formulario.nivelConhecimentoTreino} / 10
                    </span>
                  </div>
                  <input
                    type="text"
                    className="campo-texto"
                    style={{ marginTop: '0.6rem' }}
                    placeholder="Detalhe brevemente seu histórico de treino..."
                    value={formulario.historicoTreino}
                    onChange={(e) => setFormulario({ ...formulario, historicoTreino: e.target.value })}
                  />
                </div>

                <div className="grupo-campo">
                  <label className="rotulo-campo">
                    11. Qual o seu objetivo principal? <span className="obrigatorio">*</span>
                  </label>
                  <select
                    className="campo-select"
                    value={formulario.objetivoPrincipal}
                    onChange={(e) => setFormulario({ ...formulario, objetivoPrincipal: e.target.value })}
                  >
                    <option value="">Selecione o objetivo principal...</option>
                    <option value="Hipertrofia e Ganho de Massa Muscular">Hipertrofia e Ganho de Massa Muscular</option>
                    <option value="Emagrecimento e Definição Muscular">Emagrecimento e Definição Muscular</option>
                    <option value="Tonificação e Fortalecimento Geral">Tonificação e Fortalecimento Geral</option>
                    <option value="Condicionamento Físico, Saúde e Disposição">Condicionamento Físico, Saúde e Disposição</option>
                    <option value="Melhora de Postura e Alívio de Dores">Melhora de Postura e Alívio de Dores</option>
                    <option value="Outro">Outro objetivo específico</option>
                  </select>
                  {formulario.objetivoPrincipal === 'Outro' && (
                    <input
                      type="text"
                      className="campo-texto"
                      style={{ marginTop: '0.5rem' }}
                      placeholder="Descreva seu objetivo..."
                      value={formulario.outroObjetivo || ''}
                      onChange={(e) => setFormulario({ ...formulario, outroObjetivo: e.target.value })}
                    />
                  )}
                </div>

                <div className="grupo-campo">
                  <label className="rotulo-campo">
                    12. Onde vai treinar? (academia, em casa, ao ar livre...) <span className="obrigatorio">*</span>
                  </label>
                  <select
                    className="campo-select"
                    value={formulario.localTreino}
                    onChange={(e) => setFormulario({ ...formulario, localTreino: e.target.value })}
                  >
                    <option value="">Selecione o local...</option>
                    <option value="Academia de musculação tradicional">Academia de musculação tradicional</option>
                    <option value="Academia de condomínio">Academia de condomínio</option>
                    <option value="Em casa com equipamentos (halteres, elásticos)">Em casa com equipamentos</option>
                    <option value="Em casa apenas com peso corporal">Em casa apenas com peso corporal</option>
                    <option value="Ao ar livre / Parque">Ao ar livre / Parque</option>
                    <option value="Outro">Outro local</option>
                  </select>
                  {formulario.localTreino === 'Outro' && (
                    <input
                      type="text"
                      className="campo-texto"
                      style={{ marginTop: '0.5rem' }}
                      placeholder="Descreva os equipamentos ou local..."
                      value={formulario.outroLocal || ''}
                      onChange={(e) => setFormulario({ ...formulario, outroLocal: e.target.value })}
                    />
                  )}
                </div>
              </div>
            )}

            {/* ETAPA 3: Saúde, Doenças, Lesões e Rotina (Perguntas 6, 7, 8, 9, 13) */}
            {etapaAtual === 3 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.3rem' }}>
                <div className="grupo-campo">
                  <label className="rotulo-campo">6. Você possui alguma restrição médica?</label>
                  <div style={{ display: 'flex', gap: '1rem', marginTop: '0.3rem' }}>
                    {['Não', 'Sim'].map((opcao) => (
                      <label key={opcao} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', cursor: 'pointer' }}>
                        <input
                          type="radio"
                          name="restricaoMedica"
                          checked={formulario.possuiRestricaoMedica === opcao}
                          onChange={() => setFormulario({ ...formulario, possuiRestricaoMedica: opcao })}
                          style={{ accentColor: '#ff2e7e' }}
                        />
                        <span>{opcao}</span>
                      </label>
                    ))}
                  </div>
                  {formulario.possuiRestricaoMedica === 'Sim' && (
                    <textarea
                      className="campo-textarea"
                      placeholder="Descreva qual restrição médica..."
                      value={formulario.descricaoRestricaoMedica || ''}
                      onChange={(e) => setFormulario({ ...formulario, descricaoRestricaoMedica: e.target.value })}
                    />
                  )}
                </div>

                <div className="grupo-campo">
                  <label className="rotulo-campo">7. Você possui alguma lesão ou dor crônica?</label>
                  <div style={{ display: 'flex', gap: '1rem', marginTop: '0.3rem' }}>
                    {['Não', 'Sim'].map((opcao) => (
                      <label key={opcao} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', cursor: 'pointer' }}>
                        <input
                          type="radio"
                          name="lesaoDor"
                          checked={formulario.possuiLesaoDorCronica === opcao}
                          onChange={() => setFormulario({ ...formulario, possuiLesaoDorCronica: opcao })}
                          style={{ accentColor: '#ff2e7e' }}
                        />
                        <span>{opcao}</span>
                      </label>
                    ))}
                  </div>
                  {formulario.possuiLesaoDorCronica === 'Sim' && (
                    <textarea
                      className="campo-textarea"
                      placeholder="Descreva onde é a dor ou qual foi a lesão (ombro, joelho, lombar...)"
                      value={formulario.descricaoLesaoDorCronica || ''}
                      onChange={(e) => setFormulario({ ...formulario, descricaoLesaoDorCronica: e.target.value })}
                    />
                  )}
                </div>

                <div className="grupo-campo">
                  <label className="rotulo-campo">8. Você possui alguma doença? (hipertensão, diabetes...)</label>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '0.5rem', marginTop: '0.4rem' }}>
                    {['Nenhuma', 'Hipertensão', 'Diabetes', 'Cardiopatia', 'Labirintite', 'Asma/Bronquite'].map((d) => (
                      <label
                        key={d}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.4rem',
                          background: '#0f1325',
                          padding: '0.5rem 0.8rem',
                          borderRadius: '8px',
                          border: formulario.possuiDoenca.includes(d) ? '1px solid #ff2e7e' : '1px solid #28325c',
                          cursor: 'pointer',
                          fontSize: '0.85rem'
                        }}
                      >
                        <input
                          type="checkbox"
                          checked={formulario.possuiDoenca.includes(d)}
                          onChange={() => alternarOpcaoLista('possuiDoenca', d)}
                          style={{ accentColor: '#ff2e7e' }}
                        />
                        <span>{d}</span>
                      </label>
                    ))}
                  </div>
                  <input
                    type="text"
                    className="campo-texto"
                    style={{ marginTop: '0.5rem' }}
                    placeholder="Outra doença ou medicamento contínuo..."
                    value={formulario.outraDoenca || ''}
                    onChange={(e) => setFormulario({ ...formulario, outraDoenca: e.target.value })}
                  />
                </div>

                <div className="grupo-campo">
                  <label className="rotulo-campo">
                    9. Qual sua disponibilidade para treinar atualmente? (dias e horários) <span className="obrigatorio">*</span>
                  </label>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(90px, 1fr))', gap: '0.4rem', marginTop: '0.4rem' }}>
                    {['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado', 'Domingo'].map((dia) => (
                      <label
                        key={dia}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.4rem',
                          background: '#0f1325',
                          padding: '0.45rem 0.6rem',
                          borderRadius: '8px',
                          border: formulario.disponibilidadeTreino.includes(dia) ? '1px solid #38bdf8' : '1px solid #28325c',
                          cursor: 'pointer',
                          fontSize: '0.82rem'
                        }}
                      >
                        <input
                          type="checkbox"
                          checked={formulario.disponibilidadeTreino.includes(dia)}
                          onChange={() => alternarOpcaoLista('disponibilidadeTreino', dia)}
                          style={{ accentColor: '#38bdf8' }}
                        />
                        <span>{dia}</span>
                      </label>
                    ))}
                  </div>
                  <input
                    type="text"
                    className="campo-texto"
                    style={{ marginTop: '0.6rem' }}
                    placeholder="Horários preferidos (Ex: Manhã às 07h, Noite após às 19h...)"
                    value={formulario.horarioPreferencial || ''}
                    onChange={(e) => setFormulario({ ...formulario, horarioPreferencial: e.target.value })}
                  />
                </div>

                <div className="grupo-campo">
                  <label className="rotulo-campo">13. Mais alguma informação que ache relevante?</label>
                  <textarea
                    className="campo-textarea"
                    placeholder="Alguma preferência, dificuldade ou detalhe que queira compartilhar com a Sara..."
                    value={formulario.informacoesRelevantes || ''}
                    onChange={(e) => setFormulario({ ...formulario, informacoesRelevantes: e.target.value })}
                  />
                </div>
              </div>
            )}

            {/* ETAPA 4: Finalização com E-mail e Senha */}
            {etapaAtual === 4 && (
              <form onSubmit={finalizarCadastro} style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
                <div
                  style={{
                    background: 'rgba(56, 189, 248, 0.08)',
                    border: '1px solid rgba(56, 189, 248, 0.25)',
                    padding: '1rem',
                    borderRadius: '12px',
                    marginBottom: '0.5rem'
                  }}
                >
                  <h4 style={{ color: '#38bdf8', marginBottom: '0.3rem', fontSize: '0.95rem' }}>Quase pronto, {formulario.nome}!</h4>
                  <p style={{ color: '#94a3b8', fontSize: '0.85rem' }}>
                    Agora crie seus dados de login. Com este e-mail e senha você acessará sua ficha de treinos no aplicativo.
                  </p>
                </div>

                <div className="grupo-campo">
                  <label className="rotulo-campo">
                    Seu E-mail de Acesso <span className="obrigatorio">*</span>
                  </label>
                  <input
                    type="email"
                    className="campo-texto"
                    placeholder="seuemail@exemplo.com"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>

                <div className="grupo-campo">
                  <label className="rotulo-campo">
                    Crie uma Senha <span className="obrigatorio">*</span>
                  </label>
                  <input
                    type="password"
                    className="campo-texto"
                    placeholder="Mínimo 6 caracteres"
                    required
                    value={senha}
                    onChange={(e) => setSenha(e.target.value)}
                  />
                </div>

                <div className="grupo-campo">
                  <label className="rotulo-campo">
                    Confirme sua Senha <span className="obrigatorio">*</span>
                  </label>
                  <input
                    type="password"
                    className="campo-texto"
                    placeholder="Repita a senha criada"
                    required
                    value={confirmarSenha}
                    onChange={(e) => setConfirmarSenha(e.target.value)}
                  />
                </div>

                <div style={{ fontSize: '0.8rem', color: '#64748b' }}>
                  Ao clicar em concluir, você concorda com a nossa{' '}
                  <a href="/privacidade.html" target="_blank" rel="noreferrer" style={{ color: '#38bdf8' }}>
                    Política de Privacidade (LGPD)
                  </a>{' '}
                  para armazenamento exclusivo do seu histórico físico.
                </div>

                <button type="submit" className="botao-primario" style={{ width: '100%', marginTop: '0.5rem', padding: '1rem' }}>
                  <IconeCheck tamanho={20} />
                  <span>Concluir Anamnese e Entrar no Shara-EF</span>
                </button>
              </form>
            )}

            {/* Barra de Navegação Inferior das Etapas */}
            {etapaAtual < 4 && (
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  marginTop: '2rem',
                  paddingTop: '1.2rem',
                  borderTop: '1px solid #28325c'
                }}
              >
                <button type="button" className="botao-secundario" onClick={voltarEtapa}>
                  <IconeVoltar tamanho={18} />
                  <span>{etapaAtual === 1 ? 'Cancelar' : 'Voltar'}</span>
                </button>

                <button type="button" className="botao-primario" onClick={avancarEtapa}>
                  <span>Próximo Passo</span>
                  <IconeAvancar tamanho={18} />
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
