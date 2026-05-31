export class ShinobiActorSheet extends ActorSheet {
  static get defaultOptions() {
    return foundry.utils.mergeObject(super.defaultOptions, {
      classes: ["shinobi", "sheet", "actor"], 
      template: "systems/trex-no-sho/templates/actor-sheet.hbs",
      width: 950, height: 750,
      tabs: [
        { navSelector: ".sheet-tabs[data-group='primary']", contentSelector: ".sheet-body", initial: "principal" },
        { navSelector: ".sheet-tabs[data-group='secundario']", contentSelector: ".principal-body", initial: "status" }
      ]
    });
  }

  async getData(options) {
    const context = await super.getData(options);
    context.system = context.actor.system;
    const conf = context.system.configuracoes || {};

    const nomesPericias = {
      acrobacia: { nome: "Acrobacia", sigla: "AGI" }, arte: { nome: "Arte", sigla: "INT" }, atletismo: { nome: "Atletismo", sigla: "FOR" },
      ciencias: { nome: "Ciências Naturais", sigla: "INT" }, concentracao: { nome: "Concentração", sigla: "INT" }, cultura: { nome: "Cultura", sigla: "INT" },
      disfarce: { nome: "Disfarce", sigla: "PER" }, escapar: { nome: "Escapar", sigla: "DES" }, furtividade: { nome: "Furtividade", sigla: "AGI" },
      lidarAnimais: { nome: "*Lidar Animais", sigla: "PER" }, mecanismo: { nome: "*Mecanismo", sigla: "INT" }, medicina: { nome: "*Medicina", sigla: "INT" },
      ocultismo: { nome: "*Ocultismo", sigla: "INT" }, prestidigitacao: { nome: "Prestidigitação", sigla: "DES" }, procurar: { nome: "Procurar", sigla: "PER" },
      prontidao: { nome: "Prontidão", sigla: "PER" }, rastrear: { nome: "Rastrear", sigla: "PER" }, veneficio: { nome: "**Venefício", sigla: "INT" }
    };

    context.listaPericias = [];
    for (let key in nomesPericias) {
      if (context.system.pericias && context.system.pericias[key]) {
        let isLocked = (key === "veneficio" && !conf.quimico);
        context.listaPericias.push({ chave: key, nomeAmigavel: nomesPericias[key].nome, siglaAttr: nomesPericias[key].sigla, dados: context.system.pericias[key], isLocked: isLocked });
      }
    }

    const nomesCombate = { corporal: { nome: "Combate Corporal (CC)", sigla: "FOR" }, distancia: { nome: "Combate à Distância (CD)", sigla: "DES" }, esquiva: { nome: "Esquiva", sigla: "AGI" }, lerMovimentos: { nome: "Ler Movimento (LM)", sigla: "PER" } };
    context.listaCombate = [];
    for (let key in nomesCombate) {
      if (context.system.combate && context.system.combate[key]) {
        context.listaCombate.push({ chave: key, nomeAmigavel: nomesCombate[key].nome, siglaAttr: nomesCombate[key].sigla, dados: context.system.combate[key] });
      }
    }

    const nomesSociais = { acalmar: { nome: "Acalmar", sigla: "Yin+½INT" }, compostura: { nome: "Compostura", sigla: "Yin+½INT" }, convencer: { nome: "Convencer", sigla: "Yang+½INT" }, empatia: { nome: "Empatia", sigla: "Yin+½PER" }, encorajar: { nome: "Encorajar", sigla: "Yang+½ESP" }, enganar: { nome: "Enganar", sigla: "Yin+½PER" }, etiqueta: { nome: "Etiqueta", sigla: "Yin+½PER" }, intimidar: { nome: "Intimidar", sigla: "Yang+½INT" }, ouvirBoatos: { nome: "Ouvir Boatos", sigla: "Yin+½PER" }, espalharBoatos: { nome: "Esp. Boatos", sigla: "Yang+½PER" }, presenca: { nome: "Presença", sigla: "Yang+½INT" }, provocar: { nome: "Provocar", sigla: "Yang+½INT" } };
    context.listaSociais = [];
    for (let key in nomesSociais) {
      if (context.system.periciasSociais && context.system.periciasSociais[key]) {
        context.listaSociais.push({ chave: key, nomeAmigavel: nomesSociais[key].nome, siglaAttr: nomesSociais[key].sigla, dados: context.system.periciasSociais[key] });
      }
    }

    context.opcoesAtributos = { for: "Força", des: "Destreza", agi: "Agilidade", per: "Percepção", vig: "Vigor", int: "Inteligência", esp: "Espírito" };
    context.opcoesPericias = {}; for (let key in nomesPericias) { context.opcoesPericias[key] = nomesPericias[key].nome; }
    context.opcoesCombate = {}; for (let key in nomesCombate) { context.opcoesCombate[key] = nomesCombate[key].nome; }
    
    context.opcoesRecurso = { nenhum: "Nenhum", jashin: "Boneco de Jashin", kikaichuu: "Kikaichuu (Aburame)", kamiArte: "Pontos Kami (Arte)", kamiEsp: "Pontos Kami (Espírito)", mangekyou: "Pontos de Visão Mangekyou", kujaku: "Pontos de Saúde Kujaku", suika: "Pontos Suika (Hozuki)" };
    
    if (!context.system.recursoExtra) {
      context.system.recursoExtra = { ativo: "nenhum", cor: "#800080", atual: 0, max: 0 };
    }
    
    const recAtivo = context.system.recursoExtra.ativo || "nenhum";
    context.mostrarRecursoExtra = (recAtivo !== "nenhum");
    context.nomeRecursoExtra = context.opcoesRecurso[recAtivo] || "";

    context.recIsNenhum = (recAtivo === "nenhum");
    context.recIsJashin = (recAtivo === "jashin");
    context.recIsKikaichuu = (recAtivo === "kikaichuu");
    context.recIsKamiArte = (recAtivo === "kamiArte");
    context.recIsKamiEsp = (recAtivo === "kamiEsp");
    context.recIsMangekyou = (recAtivo === "mangekyou");
    context.recIsKujaku = (recAtivo === "kujaku");
    context.recIsSuika = (recAtivo === "suika");

    let forFinal = context.system.atributos?.for?.valor || 0;
    let baseCompartimentos = 3;
    if (conf.burroCarga) {
      if (forFinal < 8) baseCompartimentos = 4;
      else if (forFinal < 12) baseCompartimentos = 5;
      else baseCompartimentos = 6;
    }

    let compartimentosUsados = 0;
    let compartimentosMaximos = baseCompartimentos;
    context.equipamentos = []; context.poderes = []; context.aptidoes = []; context.aptidoesGratuitas = []; context.elementos = [];

    for (let item of context.actor.items) {
      if (item.type === "equipamento") {
        let qtd = item.system.quantidade || 0; let custoComp = item.system.peso || 0; let modExtra = item.system.modificadorCompartimento || 0;
        compartimentosUsados += (qtd * custoComp); compartimentosMaximos += modExtra;
        context.equipamentos.push(item);
      } else if (item.type === "poder") { context.poderes.push(item);
      } else if (item.type === "elemento") { context.elementos.push(item);
      } else if (item.type === "aptidao") {
        if (item.system.gratuita) { context.aptidoesGratuitas.push(item); } else { context.aptidoes.push(item); }
      }
    }
    context.compartimentosUsados = compartimentosUsados; context.compartimentosMaximos = compartimentosMaximos; context.compartimentosExcedidos = compartimentosUsados > compartimentosMaximos;

    if (context.system.databook) {
      context.biografiaHTML = await TextEditor.enrichHTML(context.system.databook.biografia || "", { async: true });
      context.curiosidadesHTML = await TextEditor.enrichHTML(context.system.databook.curiosidades || "", { async: true });
      context.relacoesHTML = await TextEditor.enrichHTML(context.system.databook.relacoesTexto || "", { async: true });
    }

    const nc = context.system.cabecalho?.nc || 4;
    let niveisExtras = Math.max(0, nc - 4);
    
    let ptsAtributosTotais = 12 + (niveisExtras * 6);
    let ptsPericiasTotais = 8 + (niveisExtras * 4);
    let ptsPoderesTotais;
    
    if (conf.regraQuatroPontos) { ptsPoderesTotais = 8 + (niveisExtras * 4); if (nc >= 20) ptsPoderesTotais += 4; }
    else if (conf.regraTresPontos) { ptsPoderesTotais = 6 + (niveisExtras * 3); if (nc >= 20) ptsPoderesTotais += 3; } 
    else { ptsPoderesTotais = 4 + (niveisExtras * 2); }
    
    let ptsSociaisTotais = 2; if (nc >= 7) ptsSociaisTotais += Math.floor((nc - 5) / 2) * 2;

    let gastosAtributos = Object.values(context.system.atributos || {}).reduce((acc, a) => acc + (a.valor || 0), 0);
    let gastosSociais = Object.values(context.system.sociais || {}).reduce((acc, s) => acc + (s.valor || 0), 0);
    let gastosPericias = 0;
    Object.values(context.system.pericias || {}).forEach(p => gastosPericias += (p.pontos || 0));
    Object.values(context.system.combate || {}).forEach(c => { let valorBase = c.base !== undefined ? c.base : 3; gastosPericias += (valorBase - 3); });
    Object.values(context.system.periciasSociais || {}).forEach(ps => gastosPericias += (ps.pontos || 0));
    
    let gastosPoderesEAptidoes = context.poderes.length + (context.aptidoes.length * 2);

    context.evolucao = {
      ncAtual: nc, atributos: ptsAtributosTotais - gastosAtributos, pericias: ptsPericiasTotais - gastosPericias,
      poderes: ptsPoderesTotais - gastosPoderesEAptidoes, sociais: ptsSociaisTotais - gastosSociais,
      limiteAtributo: nc, limitePericiaPoder: Math.floor(nc / 2)
    };
    context.evolucao.atributosNegativo = context.evolucao.atributos < 0; context.evolucao.periciasNegativo = context.evolucao.pericias < 0; context.evolucao.poderesNegativo = context.evolucao.poderes < 0; context.evolucao.sociaisNegativo = context.evolucao.sociais < 0;

    context.erros = { atributos: {}, sociais: {} };
    for (let key in context.system.atributos) { if (context.system.atributos[key].valor > context.evolucao.limiteAtributo) context.erros.atributos[key] = true; }
    for (let key in context.system.sociais) { if (context.system.sociais[key].valor > context.evolucao.limiteAtributo) context.erros.sociais[key] = true; }
    context.listaPericias.forEach(p => { p.erroLimite = p.dados.pontos > context.evolucao.limitePericiaPoder; });
    context.listaCombate.forEach(c => { c.erroLimite = c.dados.base > context.evolucao.limitePericiaPoder; });
    context.listaSociais.forEach(s => { s.erroLimite = s.dados.pontos > context.evolucao.limitePericiaPoder; });

    return context;
  }

  activateListeners(html) {
    super.activateListeners(html);
    
    html.find('.roll-iniciativa').click(async ev => {
      ev.preventDefault();
      try {
        await this.actor.rollInitiative({ createCombatants: true });
      } catch (err) {
        const iniTotal = this.actor.system.energias.iniciativa.total || 0;
        const roll = new Roll(`1d8 + ${iniTotal}`);
        await roll.evaluate();
        roll.toMessage({ speaker: ChatMessage.getSpeaker({ actor: this.actor }), flavor: "<h3 style='margin: 0; color: darkred;'>Rolagem de Iniciativa</h3>" });
      }
    });

    html.find('.rollable').click(this._onRoll.bind(this));

    html.find('.item-create').click(async ev => {
      ev.preventDefault();
      const tipoItem = ev.currentTarget.dataset.type;
      const isGratuita = ev.currentTarget.dataset.gratuita === "true";
      let nomeItem = "Novo Item";
      if (tipoItem === "equipamento") nomeItem = "Novo Equipamento";
      if (tipoItem === "poder") nomeItem = "Novo Poder";
      if (tipoItem === "elemento") nomeItem = "Novo Elemento";
      if (tipoItem === "aptidao") nomeItem = isGratuita ? "Nova Aptidão Gratuita" : "Nova Aptidão";
      const itemData = { name: nomeItem, type: tipoItem };
      if (tipoItem === "aptidao" && isGratuita) { itemData.system = { gratuita: true }; }
      return await Item.create(itemData, { parent: this.actor });
    });

    html.find('.item-edit').click(ev => { const li = $(ev.currentTarget).parents(".item-row"); const item = this.actor.items.get(li.data("itemId")); item.sheet.render(true); });
    html.find('.item-delete').click(ev => { const li = $(ev.currentTarget).parents(".item-row"); const item = this.actor.items.get(li.data("itemId")); item.delete(); });
    
    html.find('.item-to-chat').click(ev => {
      const li = $(ev.currentTarget).parents(".item-row"); const item = this.actor.items.get(li.data("itemId"));
      let cor = "#333"; if (item.type === "poder") cor = "darkblue"; if (item.type === "aptidao") cor = "darkgreen"; if (item.type === "equipamento") cor = "darkred"; if (item.type === "elemento") cor = "darkorange";
      
      let caracTexto = item.system.caracteristicas ? `<div style="margin-top: 8px; padding-top: 8px; border-top: 1px dashed #b8b0a1;">${item.system.caracteristicas.replace(/\n/g, '<br>')}</div>` : "";
      let descTexto = item.system.descricao ? item.system.descricao.replace(/\n/g, '<br>') : "Nenhuma descrição.";
      
      let caracteristicas = ""; let detalhes = "";
      if (item.type === "poder") { 
        caracteristicas = `<strong>Tipo:</strong> ${item.system.tipo || "-"}<br><strong>Elemento:</strong> ${item.system.elemento || "-"}<br><strong style="color: darkred;">Custo:</strong> ${item.system.custo || "-"}${caracTexto}`; 
        detalhes = `<em>Nenhum detalhe adicional.</em>`;
      } else if (item.type === "aptidao") { 
        caracteristicas = `<strong style="color: darkred;">Custo:</strong> ${item.system.custo || "-"}${caracTexto}`; 
        detalhes = `<strong>Tipo:</strong> ${item.system.tipo || "-"}<br><strong>Nível:</strong> ${item.system.nivel || "-"}<br><strong>Pré-Requisito:</strong> ${item.system.preRequisito || "-"}`;
      } else if (item.type === "elemento") { 
        caracteristicas = `<strong>Nível:</strong> ${item.system.nivel || "-"}<br><strong style="color: darkred;">Custo:</strong> ${item.system.custo || "-"}${caracTexto}`; 
        let efeitosTexto = item.system.efeitos ? item.system.efeitos.replace(/\n/g, '<br>') : "-";
        detalhes = `<strong>Efeitos Comprados:</strong><br>${efeitosTexto}`;
      } else if (item.type === "equipamento") { 
        caracteristicas = `<strong>Quantidade:</strong> ${item.system.quantidade || 0}<br><strong>Compartimentos:</strong> ${item.system.peso || 0}${caracTexto}`; 
        detalhes = `<em>Nenhum detalhe adicional.</em>`;
      }

      let content = `
      <div style="padding: 10px; border: 2px solid ${cor}; background: #e6dfcf; border-radius: 5px; font-family: 'Marcellus', serif; color: #332b22; box-shadow: inset 0 0 10px rgba(0,0,0,0.1);">
        <h3 style="margin: 0 0 10px 0; font-family: 'Kaushan Script', cursive; font-size: 24px; color: ${cor}; text-align: center; border-bottom: 2px solid ${cor}; padding-bottom: 5px; text-shadow: 1px 1px 2px rgba(255,255,255,0.5);">${item.name}</h3>
        <div style="text-align: center; margin-bottom: 15px;">
          <img src="${item.img}" style="width: 100%; max-width: 250px; height: auto; border-radius: 5px; border: 2px solid #332b22; box-shadow: 2px 2px 6px rgba(0,0,0,0.3); background: rgba(0,0,0,0.05);">
        </div>
        <details style="margin-bottom: 8px; border: 1px solid #b8b0a1; border-radius: 3px; background: rgba(245, 240, 230, 0.8);">
          <summary style="font-weight: bold; cursor: pointer; color: ${cor}; padding: 6px; background: rgba(0,0,0,0.05); outline: none;">📜 Características</summary>
          <div style="padding: 8px; font-size: 13px; line-height: 1.4; border-top: 1px dashed #b8b0a1;">${caracteristicas}</div>
        </details>
        ${(item.type === "aptidao" || item.type === "elemento") ? `
        <details style="margin-bottom: 8px; border: 1px solid #b8b0a1; border-radius: 3px; background: rgba(245, 240, 230, 0.8);">
          <summary style="font-weight: bold; cursor: pointer; color: ${cor}; padding: 6px; background: rgba(0,0,0,0.05); outline: none;">🔍 Detalhes</summary>
          <div style="padding: 8px; font-size: 13px; line-height: 1.4; border-top: 1px dashed #b8b0a1;">${detalhes}</div>
        </details>` : ""}
        <details style="border: 1px solid #b8b0a1; border-radius: 3px; background: rgba(245, 240, 230, 0.8);">
          <summary style="font-weight: bold; cursor: pointer; color: ${cor}; padding: 6px; background: rgba(0,0,0,0.05); outline: none;">📖 Descrição</summary>
          <div style="padding: 8px; font-size: 13px; line-height: 1.4; border-top: 1px dashed #b8b0a1;">${descTexto}</div>
        </details>
      </div>`;
      ChatMessage.create({ speaker: ChatMessage.getSpeaker({ actor: this.actor }), content: content });
    });
  }

  async _onRoll(event) {
    event.preventDefault(); const elemento = event.currentTarget; const nomeTeste = elemento.dataset.nome; const precisao = parseInt(elemento.dataset.precisao) || 0;
    const template = `<form><div class="form-group" style="margin-bottom: 10px;"><label>Modificador Extra (+ ou -):</label><input type="number" id="modificador" name="modificador" value="0" autofocus /></div><div class="form-group" style="margin-bottom: 10px;"><label>Condição Atual:</label><select id="condicao" name="condicao"><option value="0">Nenhuma</option><option value="2">Vantagem (+2)</option><option value="-2">Desvantagem (-2)</option><option value="-4">Condição Severa (-4)</option></select></div></form>`;
    new Dialog({
      title: `Teste de ${nomeTeste}`, content: template,
      buttons: {
        rolar: {
          label: "Lançar 2d8",
          callback: async (html) => {
            const modTotal = (parseInt(html.find("#modificador").val()) || 0) + (parseInt(html.find("#condicao").val()) || 0);
            const roll = new Roll(`2d8 + ${precisao} + ${modTotal}`); await roll.evaluate();
            const somaDados = roll.dice[0].total; let textoGrau = "", corCaixa = "rgba(0,0,0,0.05)", corBorda = "#333";
            if (somaDados <= 3) { textoGrau = "FALHA CRÍTICA (2-3)"; corCaixa = "rgba(255, 0, 0, 0.15)"; corBorda = "darkred"; } else if (somaDados <= 8) { textoGrau = "GRAU 1 (4-8)"; } else if (somaDados <= 11) { textoGrau = "GRAU 2 (9-11)"; } else if (somaDados <= 14) { textoGrau = "GRAU 3 (12-14)"; } else { textoGrau = "ACERTO CRÍTICO! GRAU 4 (15-16)"; corCaixa = "rgba(0, 255, 0, 0.15)"; corBorda = "darkgreen"; }
            const chatHtml = `<div style="padding: 8px; border: 2px solid ${corBorda}; border-radius: 5px; background: ${corCaixa};"><h3 style="margin-top: 0; border-bottom: 1px solid ${corBorda}; text-align: center;">${nomeTeste}</h3><p style="margin: 5px 0; font-size: 12px; text-align: center;"><strong>Precisão:</strong> ${precisao} | <strong>Mods:</strong> ${modTotal}</p><h4 style="margin: 5px 0; text-align: center;">Dados (2d8): 🎲 ${somaDados}</h4><h2 style="margin: 5px 0; text-align: center; font-size: 28px; color: #000;">Total: ${roll.total}</h2><h3 style="margin: 0; text-align: center; font-weight: bold; color: ${corBorda};">${textoGrau}</h3></div>`;
            ChatMessage.create({ speaker: ChatMessage.getSpeaker({ actor: this.actor }), content: chatHtml, rolls: [roll] });
          }
        }
      }, default: "rolar"
    }).render(true);
  }
}