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
fastify.get('/api/alunos', { preHandler: [fastify.autenticar, fastify.exigirProfessor] }, async () => {
  const cliente = await pool.connect();
  try {
    const resultado = await cliente.query(`
      SELECT 
        u.id, u.papel, u.nome, u.email, u.data_cadastro, u.status,
        row_to_json(a.*) as anamnese
      FROM usuarios u
      LEFT JOIN anamneses a ON a.usuario_id = u.id
      WHERE u.papel = 'aluno'
      ORDER BY u.data_cadastro DESC
    `);
    return { sucesso: true, alunos: resultado.rows };
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
