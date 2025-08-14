const fs = require("fs");
const { JSDOM } = require("jsdom");

// Lê o arquivo HTML
const html = fs.readFileSync("index.html", "utf8");

// Cria DOM virtual
const dom = new JSDOM(html);
const document = dom.window.document;

// Para cada produto, move o h4 depois do p
document.querySelectorAll(".produto").forEach(produto => {
    const p = produto.querySelector("p");
    const h4 = produto.querySelector("h4");

    if (p && h4) {
        p.insertAdjacentElement("afterend", h4);
    }
});

// Salva de volta o HTML modificado
fs.writeFileSync("index.html", dom.serialize(), "utf8");

console.log("✅ Todos os <h4> foram movidos para baixo do <p>!");
