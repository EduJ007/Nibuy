const fs = require("fs");
const { JSDOM } = require("jsdom");

// Carrega o HTML
const htmlFile = "index.html";
const html = fs.readFileSync(htmlFile, "utf8");
const dom = new JSDOM(html);
const document = dom.window.document;

// Para cada produto, adiciona span se não existir
document.querySelectorAll(".produto").forEach(prod => {
  const preco = prod.querySelector("p");
  if (preco && !prod.querySelector(".qtd-avaliacoes")) {
    const span = document.createElement("span");
    span.className = "qtd-avaliacoes";
    span.textContent = "(avalie este produto)"; // você pode trocar manualmente depois
    preco.insertAdjacentElement("afterend", span);
  }
});

// Salva de volta o HTML atualizado
fs.writeFileSync(htmlFile, dom.serialize(), "utf8");
console.log("✅ Avaliações adicionadas (você pode editar manualmente depois).");