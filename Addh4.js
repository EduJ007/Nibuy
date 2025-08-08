const fs = require('fs');
const cheerio = require('cheerio');

// Carrega o HTML
const html = fs.readFileSync('index.html', 'utf-8');
const $ = cheerio.load(html);

// Informa quantos produtos receberam um <h4>
let adicionados = 0;

// Percorre cada produto
$('.produto').each((_, el) => {
  const produto = $(el);
  const h3 = produto.find('h3');
  const h4 = produto.find('h4');

  if (h3.length && !h4.length) {
    produto.find('h3').after('<h4></h4>');
    adicionados++;
  }
});

// Salva o HTML resultante
fs.writeFileSync('index-com-h4.html', $.html(), 'utf-8');

console.log(`Adicionados <h4> em ${adicionados} produtos que não tinham.`);