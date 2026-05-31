export class ShinobiItemSheet extends ItemSheet {
  static get defaultOptions() {
    return foundry.utils.mergeObject(super.defaultOptions, {
      classes: ["shinobi", "sheet", "item"], width: 520, height: 480,
      // Ligação correta às abas
      tabs: [{ navSelector: ".tabs", contentSelector: ".sheet-body", initial: "caracteristicas" }]
    });
  }

  get template() { return `systems/trex-no-sho/templates/item-sheet.hbs`; }

  async getData(options) {
    const context = await super.getData(options);
    context.system = context.item.system;
    
    context.isPoder = context.item.type === "poder";
    context.isAptidao = context.item.type === "aptidao";
    context.isEquipamento = context.item.type === "equipamento";
    context.isElemento = context.item.type === "elemento";
    
    return context;
  }
}