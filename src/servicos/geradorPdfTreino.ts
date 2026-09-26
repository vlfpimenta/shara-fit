import { UsuarioAluno } from '../tipos';

/**
 * Utilitário para geração e impressão em PDF da Ficha de Treinos do Aluno
 * Não utiliza dependências externas, garantindo funcionamento 100% offline e compatibilidade nativa.
 */
export class GeradorPdfTreino {
  static gerarPdfFicha(aluno: UsuarioAluno): void {
    const ficha = aluno.fichaAtiva;
    if (!ficha || !ficha.divisoes || ficha.divisoes.length === 0) {
      alert('Este aluno ainda não possui uma ficha de treino prescrita para gerar o PDF.');
      return;
    }

    const dataAtual = new Date().toLocaleDateString('pt-BR');
    const horaAtual = new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

    const htmlDivisoes = ficha.divisoes
      .map((div) => {
        const linhasExercicios = div.exercicios
          .map((ex, idx) => {
            const cargas = ex.cargasRegistradas?.filter(Boolean).join(', ') || (ex.cargaKg ? `${ex.cargaKg} kg` : '-');
            return `
              <tr>
                <td style="text-align: center; font-weight: bold; width: 30px;">${idx + 1}</td>
                <td>
                  <strong style="color: #0f172a; font-size: 13px;">${ex.nome}</strong>
                </td>
                <td style="text-align: center; font-size: 12px; color: #334155;">${ex.grupamento}</td>
                <td style="text-align: center; font-weight: bold; color: #d91b63; font-size: 13px;">
                  ${ex.series} × ${ex.repeticoes}
                </td>
                <td style="text-align: center; font-size: 12px; font-weight: 600; color: #0284c7;">
                  ${cargas}
                </td>
                <td style="font-size: 11px; color: #475569; line-height: 1.35;">
                  ${ex.observacoes ? `💡 ${ex.observacoes}` : '-'}
                </td>
              </tr>
            `;
          })
          .join('');

        return `
          <div class="divisao-treino">
            <div class="divisao-cabecalho">
              <div class="divisao-identificador">${div.identificador}</div>
              <div>
                <h2 class="divisao-titulo">${div.titulo}</h2>
                ${div.frequenciaSugerida ? `<div class="divisao-subtitulo">Frequência recomendada: <strong>${div.frequenciaSugerida}</strong></div>` : ''}
              </div>
            </div>

            <table class="tabela-treino">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Exercício</th>
                  <th style="text-align: center;">Grupamento</th>
                  <th style="text-align: center;">Séries × Reps</th>
                  <th style="text-align: center;">Carga</th>
                  <th>Orientações da Professora Sara</th>
                </tr>
              </thead>
              <tbody>
                ${linhasExercicios}
              </tbody>
            </table>
          </div>
        `;
      })
      .join('');

    const conteudoCompleto = `
      <!DOCTYPE html>
      <html lang="pt-BR">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Ficha de Treino - ${aluno.nome} - Shara-EF</title>
        <style>
          @page {
            size: A4;
            margin: 12mm 10mm;
          }
          * {
            box-sizing: border-box;
            margin: 0;
            padding: 0;
          }
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
            background: #ffffff;
            color: #0f172a;
            font-size: 12px;
            line-height: 1.4;
            padding: 10px;
          }
          .barra-acoes-topo {
            display: flex;
            justify-content: space-between;
            align-items: center;
            background: #0f172a;
            color: #ffffff;
            padding: 10px 16px;
            border-radius: 8px;
            margin-bottom: 16px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
          }
          .botao-imprimir {
            background: #e11d48;
            color: #ffffff;
            border: none;
            padding: 8px 16px;
            border-radius: 6px;
            font-weight: bold;
            font-size: 13px;
            cursor: pointer;
            display: inline-flex;
            align-items: center;
            gap: 6px;
          }
          .botao-fechar {
            background: #334155;
            color: #ffffff;
            border: none;
            padding: 8px 12px;
            border-radius: 6px;
            font-size: 12px;
            cursor: pointer;
          }
          .cabecalho-relatorio {
            display: flex;
            justify-content: space-between;
            align-items: center;
            border-bottom: 2px solid #e11d48;
            padding-bottom: 10px;
            margin-bottom: 12px;
          }
          .marca-shara {
            font-size: 22px;
            font-weight: 800;
            color: #0f172a;
            letter-spacing: -0.5px;
          }
          .marca-shara span {
            color: #e11d48;
          }
          .subtitulo-prof {
            font-size: 11px;
            color: #64748b;
            text-transform: uppercase;
            font-weight: 600;
            letter-spacing: 0.5px;
          }
          .badge-oficial {
            text-align: right;
            font-size: 11px;
            color: #475569;
          }
          .card-aluno {
            background: #f8fafc;
            border: 1px solid #e2e8f0;
            border-radius: 8px;
            padding: 10px 14px;
            margin-bottom: 14px;
            display: grid;
            grid-template-columns: 2fr 1fr 1fr;
            gap: 10px;
          }
          .rotulo {
            font-size: 10px;
            text-transform: uppercase;
            color: #64748b;
            font-weight: 700;
            margin-bottom: 2px;
          }
          .valor {
            font-size: 13px;
            font-weight: 700;
            color: #0f172a;
          }
          .caixa-orientacoes {
            background: #fff1f2;
            border: 1px solid #fecdd3;
            border-left: 4px solid #e11d48;
            padding: 8px 12px;
            border-radius: 6px;
            margin-bottom: 14px;
            font-size: 11px;
            color: #881337;
          }
          .divisao-treino {
            margin-bottom: 18px;
            page-break-inside: avoid;
          }
          .divisao-cabecalho {
            display: flex;
            align-items: center;
            gap: 10px;
            background: #f1f5f9;
            padding: 6px 12px;
            border-radius: 6px;
            margin-bottom: 6px;
            border-left: 4px solid #0284c7;
          }
          .divisao-identificador {
            background: #0284c7;
            color: #ffffff;
            font-weight: 800;
            padding: 3px 8px;
            border-radius: 4px;
            font-size: 11px;
          }
          .divisao-titulo {
            font-size: 14px;
            font-weight: 800;
            color: #0f172a;
          }
          .divisao-subtitulo {
            font-size: 11px;
            color: #64748b;
          }
          .tabela-treino {
            width: 100%;
            border-collapse: collapse;
            font-size: 11px;
          }
          .tabela-treino th {
            background: #f8fafc;
            color: #475569;
            text-align: left;
            padding: 6px 8px;
            border-bottom: 2px solid #cbd5e1;
            font-weight: 700;
            font-size: 10px;
            text-transform: uppercase;
          }
          .tabela-treino td {
            padding: 6px 8px;
            border-bottom: 1px solid #e2e8f0;
            vertical-align: middle;
          }
          .tabela-treino tr:nth-child(even) {
            background: #fafafa;
          }
          .rodape-documento {
            margin-top: 18px;
            border-top: 1px solid #e2e8f0;
            padding-top: 8px;
            display: flex;
            justify-content: space-between;
            font-size: 10px;
            color: #94a3b8;
          }
          @media print {
            .barra-acoes-topo {
              display: none !important;
            }
            body {
              padding: 0;
            }
          }
        </style>
      </head>
      <body>
        <div class="barra-acoes-topo">
          <div>
            <strong>Pré-visualização da Ficha de Treino</strong> — Shara-EF
          </div>
          <div style="display: flex; gap: 8px;">
            <button class="botao-imprimir" onclick="window.print()">
              🖨️ Salvar como PDF / Imprimir
            </button>
            <button class="botao-fechar" onclick="window.close()">
              Fechar
            </button>
          </div>
        </div>

        <div class="cabecalho-relatorio">
          <div>
            <div class="marca-shara">Shara<span>.</span>ef</div>
            <div class="subtitulo-prof">Treinamento Personalizado • Prof. Sara</div>
          </div>
          <div class="badge-oficial">
            <div><strong>Prescrição Oficial Personalizada</strong></div>
            <div>CREF: 012345-G/SP • Emissão: ${dataAtual} às ${horaAtual}</div>
          </div>
        </div>

        <div class="card-aluno">
          <div>
            <div class="rotulo">Aluno(a)</div>
            <div class="valor">${aluno.nome}</div>
            <div style="font-size: 11px; color: #64748b;">${aluno.email}</div>
          </div>
          <div>
            <div class="rotulo">Objetivo Principal</div>
            <div class="valor" style="color: #e11d48;">${aluno.anamnese.objetivoPrincipal || 'Personalizado'}</div>
            <div style="font-size: 11px; color: #64748b;">${aluno.anamnese.localTreino || 'Geral'}</div>
          </div>
          <div>
            <div class="rotulo">Métricas</div>
            <div class="valor">${aluno.anamnese.peso} kg • ${aluno.anamnese.altura} cm</div>
            <div style="font-size: 11px; color: #64748b;">${aluno.anamnese.idade ? `${aluno.anamnese.idade} anos` : 'Ativo'}</div>
          </div>
        </div>

        ${ficha.observacoesGerais ? `
          <div class="caixa-orientacoes">
            <strong>Orientações Gerais da Professora Sara:</strong> ${ficha.observacoesGerais}
          </div>
        ` : ''}

        ${htmlDivisoes}

        <div class="rodape-documento">
          <div>Shara-EF Treinamento Personalizado • Metodologia Professora Sara</div>
          <div>Desenvolvido por VLFP Info • Documento gerado em ${dataAtual}</div>
        </div>

        <script>
          // Aciona o diálogo de impressão/salvar como PDF automaticamente
          window.addEventListener('load', function() {
            setTimeout(function() {
              window.print();
            }, 350);
          });
        </script>
      </body>
      </html>
    `;

    const janela = window.open('', '_blank');
    if (janela) {
      janela.document.open();
      janela.document.write(conteudoCompleto);
      janela.document.close();
    } else {
      // Fallback caso pop-up seja bloqueado: cria um iframe temporário e imprime
      const iframe = document.createElement('iframe');
      iframe.style.position = 'fixed';
      iframe.style.right = '0';
      iframe.style.bottom = '0';
      iframe.style.width = '0';
      iframe.style.height = '0';
      iframe.style.border = '0';
      document.body.appendChild(iframe);

      const docIframe = iframe.contentWindow?.document;
      if (docIframe) {
        docIframe.open();
        docIframe.write(conteudoCompleto);
        docIframe.close();
        setTimeout(() => {
          iframe.contentWindow?.focus();
          iframe.contentWindow?.print();
          setTimeout(() => document.body.removeChild(iframe), 1500);
        }, 400);
      }
    }
  }
}
