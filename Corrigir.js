const fs = require("fs");
const cheerio = require("cheerio");

// Carregar HTML
const inputFile = "index.html";
const outputFile = "index_classificado.html";
const html = fs.readFileSync(inputFile, "utf8");
const $ = cheerio.load(html);

// Listas de palavras-chave
const masculino = [
  "masculino", "homem", "homens", "garoto", "menino", "boy",
  "camisa polo", "camisa social", "camisa masculina", "camiseta masculina", "regata masculina",
  "bermuda", "shorts masculino", "cueca", "sunga", "terno", "gravata",
  "sapato social", "bota masculina", "chinelo masculino", "sandália masculina",
  "tenis masculino", "tênis masculino", "moletom masculino", "jaqueta masculina",
  "blusa masculina", "calça jeans masculina", "calça masculina"
];

const feminino = [
  "feminino", "mulher", "mulheres", "menina", "garota", "lady", "girl",
  "vestido", "saia", "cropped", "blusa feminina", "camiseta feminina", "camisa feminina",
  "salto", "sapato feminino", "sandália feminina", "chinelo feminino", "rasterinha", "rasteira",
  "bolsa", "top", "sutiã", "calcinha", "legging", "short feminino", "shorts feminino",
  "jaqueta feminina", "moletom feminino", "calça feminina", "saída de praia", "biquíni", "maiô"
];

const unisex = [
  "unisex", "unissex", "adulto", "casal", "família", "infantil", "criança",
  "bebê", "kids", "juvenil", "escolar", "universitário", "academia", "esporte",
  "corrida", "fitness", "ginástica", "neutro", "gamer", "nerd", "otaku",
  "anime", "cosplay", "fantasia", "camiseta estampada", "moletom", "jaqueta",
  "boné", "chapéu", "óculos", "pulseira", "relógio", "acessório"
];

// Função para checar palavras-chave
function temPalavra(titulo, lista) {
  return lista.some(palavra => {
    const regex = new RegExp(`\\b${palavra}\\b`, "i"); // busca exata (case-insensitive)
    return regex.test(titulo);
  });
}

// Processar cada produto
$(".produto").each((i, el) => {
  const titulo = $(el).find("h3").text().toLowerCase();

  if (temPalavra(titulo, masculino)) {
    $(el).addClass("masculino");
  } else if (temPalavra(titulo, feminino)) {
    $(el).addClass("feminino");
  } else if (temPalavra(titulo, unisex)) {
    $(el).addClass("unisex");
  } else {
    $(el).addClass("unisex"); // fallback
  }
});

// Salvar HTML atualizado
fs.writeFileSync(outputFile, $.html(), "utf8");
console.log(`Classificação concluída! Arquivo salvo em: ${outputFile}`);