/**
 * Shara-EF - Servidor Backend API (Fastify + PostgreSQL)
 * Desenvolvido para execução em container Docker na VPS da Sara
 */

import Fastify from 'fastify';
import cors from '@fastify/cors';
import jwt from '@fastify/jwt';
import bcrypt from 'bcryptjs';
import pg from 'pg';

const { Pool } = pg;

const porta = parseInt(process.env.PORT || '3001', 10);
const host = '0.0.0.0';
const urlBanco = process.env.DATABASE_URL || 'postgresql://sara_admin:senha_segura_vps_2026@localhost:5432/shara_ef_db';
const segredoJwt = process.env.JWT_SECRET || 'chave_secreta_shara_ef_jwt_2026';

const fastify = Fastify({ logger: true });
const pool = new Pool({ connectionString: urlBanco });

// Plugins Globais
await fastify.register(cors, {
  origin: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS']
});

await fastify.register(jwt, {
  secret: segredoJwt
});

// Middleware de verificação de autenticação
fastify.decorate('autenticar', async function (requisicao, resposta) {
  try {
    await requisicao.jwtVerify();
  } catch (erro) {
    resposta.status(401).send({ sucesso: false, mensagem: 'Token inválido ou expirado.' });
  }
});

// Verificação de papel de professor
fastify.decorate('exigirProfessor', async function (requisicao, resposta) {
  if (requisicao.user?.papel !== 'professor') {
    resposta.status(403).send({ sucesso: false, mensagem: 'Acesso restrito à Professora Sara.' });
  }
});

// ============================================================================
// ROTAS
// ============================================================================

// 1. Rota de Saúde
fastify.get('/api/saude', async () => {
  return { status: 'operacional', sistema: 'Shara-EF API', timestamp: new Date().toISOString() };
});

// 2. Login (Aluno e Professora)
fastify.post('/api/auth/login', async (requisicao, resposta) => {
  const { email, senha } = requisicao.body || {};
  if (!email || !senha) {
    return resposta.status(400).send({ sucesso: false, mensagem: 'E-mail e senha são obrigatórios.' });
  }

  const emailLimpo = email.trim().toLowerCase();
  const cliente = await pool.connect();

  try {
    const resUsuario = await cliente.query(
      'SELECT id, papel, nome, email, senha_hash, cref, status FROM usuarios WHERE LOWER(email) = $1',
      [emailLimpo]
    );

    if (resUsuario.rows.length === 0) {
      return resposta.status(401).send({ sucesso: false, mensagem: 'Credenciais incorretas.' });
    }

    const usuario = resUsuario.rows[0];
    const senhaValida = await bcrypt.compare(senha, usuario.senha_hash);

    if (!senhaValida) {
      return resposta.status(401).send({ sucesso: false, mensagem: 'Senha incorreta.' });
    }

    if (usuario.papel === 'aluno' && usuario.status === 'inativo') {
      return resposta.status(403).send({ sucesso: false, mensagem: 'Seu acesso foi desativado pela professora. Entre em contato para reativação.' });
    }

    const token = fastify.jwt.sign({
      id: usuario.id,
      papel: usuario.papel,
      nome: usuario.nome,
      email: usuario.email
    }, { expiresIn: '30d' });

    delete usuario.senha_hash;

    return {
      sucesso: true,
      mensagem: `Bem-vindo(a), ${usuario.nome}!`,
      token,
      usuario
    };
  } finally {
    cliente.release();
  }
});

// 2.0 Verificar se a Professora já está cadastrada
fastify.get('/api/auth/professor/status', async () => {
  const cliente = await pool.connect();
  try {
    const res = await cliente.query(
      "SELECT id, nome, email FROM usuarios WHERE papel = 'professor' LIMIT 1"
    );
    if (res.rows.length === 0) {
      return { existe: false, configurado: false };
    }
    return {
      existe: true,
      configurado: true,
      nome: res.rows[0].nome,
      email: res.rows[0].email
    };
  } finally {
    cliente.release();
  }
});

// 2.1 Configuração de Credenciais da Professora (Primeiro Acesso ou Alteração)
fastify.post('/api/auth/professor/configurar-credenciais', async (requisicao, resposta) => {
  const { nome, email, senha } = requisicao.body || {};
  if (!email || !senha) {
    return resposta.status(400).send({ sucesso: false, mensagem: 'E-mail e senha são obrigatórios.' });
  }

  const emailLimpo = email.trim().toLowerCase();
  const nomeFinal = (nome && nome.trim()) || 'Sara';
  const cliente = await pool.connect();

  try {
    const hashSenha = await bcrypt.hash(senha, 10);

    const buscaProf = await cliente.query("SELECT id FROM usuarios WHERE papel = 'professor' LIMIT 1");

    let usuarioId;
    if (buscaProf.rows.length > 0) {
      usuarioId = buscaProf.rows[0].id;
      await cliente.query(
        "UPDATE usuarios SET nome = $1, email = $2, senha_hash = $3 WHERE id = $4",
        [nomeFinal, emailLimpo, hashSenha, usuarioId]
      );
    } else {
      usuarioId = 'prof-sara-1';
      await cliente.query(
        "INSERT INTO usuarios (id, papel, nome, email, senha_hash, cref, status) VALUES ($1, 'professor', $2, $3, $4, '012345-G/SP', 'ativo')",
        [usuarioId, nomeFinal, emailLimpo, hashSenha]
      );
    }

    const token = fastify.jwt.sign({
      id: usuarioId,
      papel: 'professor',
      nome: nomeFinal,
      email: emailLimpo
    }, { expiresIn: '30d' });

    return {
      sucesso: true,
      mensagem: `Credenciais da professora ${nomeFinal} configuradas com sucesso!`,
      token,
      usuario: {
        id: usuarioId,
        papel: 'professor',
        nome: nomeFinal,
        email: emailLimpo
      }
    };
  } finally {
    cliente.release();
  }
});

// 3. Cadastro de Novo Aluno com Anamnese (Público)
fastify.post('/api/alunos/cadastrar', async (requisicao, resposta) => {
  const { anamnese, email, senha } = requisicao.body || {};

  if (!email || !senha || !anamnese || !anamnese.nome) {
    return resposta.status(400).send({ sucesso: false, mensagem: 'Dados cadastrais e respostas de anamnese incompletos.' });
  }

  const emailLimpo = email.trim().toLowerCase();
  const cliente = await pool.connect();

  try {
    await cliente.query('BEGIN');

    // Verificar se e-mail já existe
    const verif = await cliente.query('SELECT id FROM usuarios WHERE LOWER(email) = $1', [emailLimpo]);
    if (verif.rows.length > 0) {
      await cliente.query('ROLLBACK');
      return resposta.status(409).send({ sucesso: false, mensagem: 'Este e-mail já está cadastrado.' });
    }

    const alunoId = 'aluno-' + Date.now();
    const anamneseId = 'anam-' + Date.now();
    const hashSenha = await bcrypt.hash(senha, 10);

    // Inserir Usuário Aluno
    await cliente.query(
      `INSERT INTO usuarios (id, papel, nome, email, senha_hash, status)
       VALUES ($1, 'aluno', $2, $3, $4, 'aguardando_ficha')`,
      [alunoId, anamnese.nome.trim(), emailLimpo, hashSenha]
    );

    // Inserir Anamnese
    await cliente.query(
      `INSERT INTO anamneses (
        id, usuario_id, nome, idade, contato, peso, altura,
        relacao_atividade, possui_restricao_medica, descricao_restricao_medica,
        possui_lesao_dor_cronica, descricao_lesao_dor_cronica,
        possui_doenca, outra_doenca, disponibilidade_treino,
        horario_preferencial, historico_treino, nivel_conhecimento_treino,
        objetivo_principal, outro_objetivo, local_treino, outro_local,
        informacoes_relevantes
       ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23)`,
      [
        anamneseId,
        alunoId,
        anamnese.nome,
        anamnese.idade,
        anamnese.contato,
        anamnese.peso,
        anamnese.altura,
        anamnese.relacaoAtividade,
        anamnese.possuiRestricaoMedica,
        anamnese.descricaoRestricaoMedica || null,
        anamnese.possuiLesaoDorCronica,
        anamnese.descricaoLesaoDorCronica || null,
        JSON.stringify(anamnese.possuiDoenca || []),
        anamnese.outraDoenca || null,
        JSON.stringify(anamnese.disponibilidadeTreino || []),
        anamnese.horarioPreferencial || null,
        anamnese.historicoTreino || null,
        anamnese.nivelConhecimentoTreino || 5,
        anamnese.objetivoPrincipal,
        anamnese.outroObjetivo || null,
        anamnese.localTreino,
        anamnese.outroLocal || null,
        anamnese.informacoesRelevantes || null
      ]
    );

    await cliente.query('COMMIT');

    const token = fastify.jwt.sign({
      id: alunoId,
      papel: 'aluno',
      nome: anamnese.nome,
      email: emailLimpo
    }, { expiresIn: '30d' });

    return {
      sucesso: true,
      mensagem: 'Cadastro e anamnese recebidos com sucesso!',
      token,
      usuario: {
        id: alunoId,
        papel: 'aluno',
        nome: anamnese.nome,
        email: emailLimpo,
        status: 'aguardando_ficha'
      }
    };
  } catch (erro) {
    await cliente.query('ROLLBACK');
    fastify.log.error(erro);
    return resposta.status(500).send({ sucesso: false, mensagem: 'Erro ao processar o cadastro do aluno.' });
  } finally {
    cliente.release();
  }
});

// 4. Listar Alunos (Área da Professora Sara)
// 4. Listar Alunos (Área da Professora e Consulta de Aluno)
fastify.get('/api/alunos', async (requisicao, resposta) => {
  let autorizado = false;
  let usuarioIdFiltro = null;

  try {
    await requisicao.jwtVerify();
    if (requisicao.user) {
      autorizado = true;
      if (requisicao.user.papel === 'aluno') {
        usuarioIdFiltro = requisicao.user.id;
      }
    }
  } catch {
    const emailHeader = requisicao.headers['x-professor-email'];
    if (emailHeader) {
      const clienteVerif = await pool.connect();
      try {
        const verif = await clienteVerif.query(
          "SELECT id FROM usuarios WHERE papel = 'professor' AND LOWER(email) = $1 LIMIT 1",
          [emailHeader.trim().toLowerCase()]
        );
        if (verif.rows.length > 0) autorizado = true;
      } finally {
        clienteVerif.release();
      }
    }
  }

  if (!autorizado) {
    return resposta.status(401).send({ sucesso: false, mensagem: 'Acesso restrito à Professora Sara e alunos cadastrados.' });
  }

  const cliente = await pool.connect();
  try {
    const filtroQuery = usuarioIdFiltro ? 'AND u.id = $1' : '';
    const parametros = usuarioIdFiltro ? [usuarioIdFiltro] : [];

    const resultado = await cliente.query(`
      SELECT 
        u.id, u.papel, u.nome, u.email, u.data_cadastro, u.status,
        row_to_json(a.*) as anamnese,
        (
          SELECT json_build_object(
            'id', f.id,
            'alunoId', f.aluno_id,
            'titulo', f.titulo,
            'observacoesGerais', f.observacoes_gerais,
            'dataCriacao', f.data_criacao,
            'ativa', f.ativa,
            'divisoes', COALESCE((
              SELECT json_agg(json_build_object(
                'id', d.id,
                'fichaId', d.ficha_id,
                'identificador', d.identificador,
                'titulo', d.titulo,
                'frequenciaSugerida', d.frequencia_sugerida,
                'ordem', d.ordem,
                'exercicios', COALESCE((
                  SELECT json_agg(json_build_object(
                    'id', e.id,
                    'nome', e.nome,
                    'grupamento', e.grupamento,
                    'series', e.series,
                    'repeticoes', e.repeticoes,
                    'cargaKg', e.carga_kg,
                    'intervaloSegundos', e.intervalo_segundos,
                    'observacoes', e.observacoes,
                    'ordem', e.ordem,
                    'seriesConcluidas', e.series_concluidas,
                    'cargasRegistradas', e.cargas_registradas
                  ) ORDER BY e.ordem ASC)
                  FROM exercicios_divisao e
                  WHERE e.divisao_id = d.id
                ), '[]'::jsonb)
              ) ORDER BY d.ordem ASC)
              FROM divisoes_treino d
              WHERE d.ficha_id = f.id
            ), '[]'::jsonb)
          )
          FROM fichas_treino f
          WHERE f.aluno_id = u.id AND f.ativa = true
          LIMIT 1
        ) as ficha_ativa
      FROM usuarios u
      LEFT JOIN anamneses a ON a.usuario_id = u.id
      WHERE u.papel = 'aluno' ${filtroQuery}
      ORDER BY u.data_cadastro DESC
    `, parametros);

    const formatarData = (d) => {
      if (!d) return new Date().toISOString().split('T')[0];
      if (typeof d === 'string') return d.split('T')[0];
      return new Date(d).toISOString().split('T')[0];
    };

    const alunos = resultado.rows.map((row) => {
      const a = row.anamnese || {};
      return {
        id: row.id,
        papel: 'aluno',
        nome: row.nome,
        email: row.email,
        dataCadastro: formatarData(row.data_cadastro),
        status: row.status,
        anamnese: {
          nome: a.nome || row.nome,
          idade: String(a.idade || ''),
          contato: a.contato || '',
          peso: String(a.peso || ''),
          altura: String(a.altura || ''),
          relacaoAtividade: a.relacao_atividade || a.relacaoAtividade || '',
          possuiRestricaoMedica: a.possui_restricao_medica || a.possuiRestricaoMedica || 'Não',
          descricaoRestricaoMedica: a.descricao_restricao_medica || a.descricaoRestricaoMedica || '',
          possuiLesaoDorCronica: a.possui_lesao_dor_cronica || a.possuiLesaoDorCronica || 'Não',
          descricaoLesaoDorCronica: a.descricao_lesao_dor_cronica || a.descricaoLesaoDorCronica || '',
          possuiDoenca: Array.isArray(a.possui_doenca) ? a.possui_doenca : [],
          outraDoenca: a.outra_doenca || '',
          disponibilidadeTreino: Array.isArray(a.disponibilidade_treino) ? a.disponibilidade_treino : [],
          horarioPreferencial: a.horario_preferencial || '',
          historicoTreino: a.historico_treino || '',
          nivelConhecimentoTreino: a.nivel_conhecimento_treino || 5,
          objetivoPrincipal: a.objetivo_principal || a.objetivoPrincipal || 'Condicionamento',
          outroObjetivo: a.outro_objetivo || '',
          localTreino: a.local_treino || a.localTreino || 'Academia',
          outroLocal: a.outro_local || '',
          informacoesRelevantes: a.informacoes_relevantes || '',
          dataPreenchimento: formatarData(a.data_preenchimento)
        },
        fichaAtiva: row.ficha_ativa || undefined
      };
    });

    return { sucesso: true, alunos };
  } finally {
    cliente.release();
  }
});

// 4.1 Salvar / Prescrever Ficha de Treino do Aluno
fastify.post('/api/alunos/:id/ficha', async (requisicao, resposta) => {
  const { id: alunoId } = requisicao.params;
  const { titulo, observacoesGerais, divisoes } = requisicao.body || {};

  if (!titulo || !Array.isArray(divisoes)) {
    return resposta.status(400).send({ sucesso: false, mensagem: 'Dados da ficha incompletos.' });
  }

  const cliente = await pool.connect();
  try {
    await cliente.query('BEGIN');

    // Desativar fichas anteriores
    await cliente.query('UPDATE fichas_treino SET ativa = false WHERE aluno_id = $1', [alunoId]);

    // Criar nova ficha
    const fichaId = 'ficha-' + Date.now();
    await cliente.query(`
      INSERT INTO fichas_treino (id, aluno_id, titulo, observacoes_gerais, data_criacao, ativa)
      VALUES ($1, $2, $3, $4, CURRENT_DATE, true)
    `, [fichaId, alunoId, titulo.trim(), observacoesGerais || null]);

    // Inserir divisões e exercícios
    for (let i = 0; i < divisoes.length; i++) {
      const div = divisoes[i];
      const divId = div.id || ('div-' + Date.now() + '-' + i);

      await cliente.query(`
        INSERT INTO divisoes_treino (id, ficha_id, identificador, titulo, frequencia_sugerida, ordem)
        VALUES ($1, $2, $3, $4, $5, $6)
      `, [divId, fichaId, div.identificador || `Treino ${String.fromCharCode(65 + i)}`, div.titulo || '', div.frequenciaSugerida || null, i]);

      if (Array.isArray(div.exercicios)) {
        for (let j = 0; j < div.exercicios.length; j++) {
          const ex = div.exercicios[j];
          const exId = ex.id || ('ex-' + Date.now() + '-' + j);

          await cliente.query(`
            INSERT INTO exercicios_divisao (
              id, divisao_id, nome, grupamento, series, repeticoes, carga_kg, intervalo_segundos, observacoes, ordem, series_concluidas, cargas_registradas
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
          `, [
            exId,
            divId,
            ex.nome || '',
            ex.grupamento || 'Geral',
            ex.series || 3,
            ex.repeticoes || '10 a 12',
            ex.cargaKg || '',
            ex.intervaloSegundos || 60,
            ex.observacoes || null,
            j,
            JSON.stringify(ex.seriesConcluidas || []),
            JSON.stringify(ex.cargasRegistradas || [])
          ]);
        }
      }
    }

    // Atualizar status do aluno para ativo
    await cliente.query("UPDATE usuarios SET status = 'ativo' WHERE id = $1 AND papel = 'aluno'", [alunoId]);

    await cliente.query('COMMIT');
    return { sucesso: true, mensagem: 'Ficha de treino persistida com sucesso!', fichaId };
  } catch (erro) {
    await cliente.query('ROLLBACK');
    fastify.log.error(erro);
    return resposta.status(500).send({ sucesso: false, mensagem: 'Erro ao persistir ficha de treino.' });
  } finally {
    cliente.release();
  }
});

// 5. Atualizar Dados do Aluno (Editar)
fastify.put('/api/alunos/:id', async (requisicao, resposta) => {
  const { id } = requisicao.params;
  const { nome, email, contato, idade, peso, altura, objetivoPrincipal, status } = requisicao.body || {};

  const cliente = await pool.connect();
  try {
    await cliente.query('BEGIN');

    if (nome || email || status) {
      const campos = [];
      const valores = [];
      let idx = 1;
      if (nome) { campos.push(`nome = $${idx++}`); valores.push(nome.trim()); }
      if (email) { campos.push(`email = $${idx++}`); valores.push(email.trim().toLowerCase()); }
      if (status) { campos.push(`status = $${idx++}`); valores.push(status); }
      valores.push(id);
      await cliente.query(`UPDATE usuarios SET ${campos.join(', ')} WHERE id = $${idx}`, valores);
    }

    if (contato || idade || peso || altura || objetivoPrincipal) {
      const camposAnam = [];
      const valoresAnam = [];
      let idxAnam = 1;
      if (nome) { camposAnam.push(`nome = $${idxAnam++}`); valoresAnam.push(nome.trim()); }
      if (contato) { camposAnam.push(`contato = $${idxAnam++}`); valoresAnam.push(contato.trim()); }
      if (idade) { camposAnam.push(`idade = $${idxAnam++}`); valoresAnam.push(idade.trim()); }
      if (peso) { camposAnam.push(`peso = $${idxAnam++}`); valoresAnam.push(peso.trim()); }
      if (altura) { camposAnam.push(`altura = $${idxAnam++}`); valoresAnam.push(altura.trim()); }
      if (objetivoPrincipal) { camposAnam.push(`objetivo_principal = $${idxAnam++}`); valoresAnam.push(objetivoPrincipal.trim()); }
      valoresAnam.push(id);
      await cliente.query(`UPDATE anamneses SET ${camposAnam.join(', ')} WHERE usuario_id = $${idxAnam}`, valoresAnam);
    }

    await cliente.query('COMMIT');
    return { sucesso: true, mensagem: 'Dados do aluno atualizados com sucesso!' };
  } catch (erro) {
    await cliente.query('ROLLBACK');
    fastify.log.error(erro);
    return resposta.status(500).send({ sucesso: false, mensagem: 'Erro ao atualizar aluno.' });
  } finally {
    cliente.release();
  }
});

// 6. Alternar Status do Aluno (Ativar / Desativar Acesso)
fastify.patch('/api/alunos/:id/status', async (requisicao, resposta) => {
  const { id } = requisicao.params;
  const { status } = requisicao.body || {};

  if (!['ativo', 'inativo', 'aguardando_ficha'].includes(status)) {
    return resposta.status(400).send({ sucesso: false, mensagem: 'Status inválido.' });
  }

  const cliente = await pool.connect();
  try {
    const res = await cliente.query(
      "UPDATE usuarios SET status = $1 WHERE id = $2 AND papel = 'aluno' RETURNING id, status",
      [status, id]
    );
    if (res.rowCount === 0) {
      return resposta.status(404).send({ sucesso: false, mensagem: 'Aluno não encontrado.' });
    }
    return { sucesso: true, mensagem: `Status alterado para '${status}'.`, status };
  } finally {
    cliente.release();
  }
});

// 7. Excluir Aluno
fastify.delete('/api/alunos/:id', async (requisicao, resposta) => {
  const { id } = requisicao.params;
  const cliente = await pool.connect();
  try {
    const res = await cliente.query("DELETE FROM usuarios WHERE id = $1 AND papel = 'aluno'", [id]);
    if (res.rowCount === 0) {
      return resposta.status(404).send({ sucesso: false, mensagem: 'Aluno não encontrado.' });
    }
    return { sucesso: true, mensagem: 'Aluno excluído com sucesso.' };
  } finally {
    cliente.release();
  }
});

// Inicialização do Servidor Fastify
try {
  await fastify.listen({ port: porta, host });
  fastify.log.info(`Servidor Shara-EF rodando em http://${host}:${porta}`);
} catch (erro) {
  fastify.log.error(erro);
  process.exit(1);
}
