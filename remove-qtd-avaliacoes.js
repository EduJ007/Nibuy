// remove-qtd-avaliacoes.js
const fs = require("fs");
const cheerio = require("cheerio");

// lê o arquivo index.html
const html = fs.readFileSync("index.html", "utf-8");

// carrega o conteúdo com cheerio
const $ = cheerio.load(html);

// remove todos os spans com class="qtd-avaliacoes"
$("span.qtd-avaliacoes").remove();

// salva o HTML atualizado
fs.writeFileSync("index.html", $.html());

console.log("✔ Todos os <span class='qtd-avaliacoes'> foram removidos!");
