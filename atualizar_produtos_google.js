const fs = require('fs');
const puppeteer = require('puppeteer');
const { JSDOM } = require('jsdom');

function gerarVariações(nome) {
  const palavras = nome.split(' ').filter(p => p.length > 2);
  const variações = [];

  // Nome completo
  variações.push(nome);
  
  // Substituições e simplificações comuns
  if (palavras.length >= 2) variações.push(`${palavras[0]} ${palavras[1]}`);
  if (palavras.length >= 3) variações.push(`${palavras[0]} ${palavras[1]} ${palavras[2]}`);
  variações.push(palavras.slice(0, 4).join(' '));
  variações.push(palavras.filter(p => p.match(/[A-Za-z0-9]/)).slice(-2).join(' '));

  // Sempre adiciona "Shopee" ao final
  return variações.map(v => v + " Shopee");
}

(async () => {
  const html = fs.readFileSync('index.html', 'utf-8');
  const dom = new JSDOM(html);
  const document = dom.window.document;
  const produtos = Array.from(document.querySelectorAll('.produto'));

  const browser = await puppeteer.launch({ headless: 'new', defaultViewport: null });
  const page = await browser.newPage();

  for (const produto of produtos) {
    const nome = produto.querySelector('h3')?.textContent.trim();
    const imagem = produto.querySelector('img')?.src;
    const link = produto.querySelector('a')?.href;

    const variações = gerarVariações(nome);
    let encontrado = false;

    for (const termo of variações) {
      console.log(`🔍 Pesquisando: ${termo}`);
      const url = `https://www.google.com/search?q=${encodeURIComponent(termo)}`;
      await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 0 });

      const resultados = await page.evaluate(() => {
        const itens = [];
        const blocos = document.querySelectorAll('div[jscontroller][data-hveid]');
        blocos.forEach(el => {
          const titulo = el.querySelector('h3')?.innerText || '';
          const preco = el.innerText.match(/R\$\s?\d+([.,]\d+)?/)?.[0] || '';
          const nota = el.innerText.match(/[\d.]+(?=\s*[★☆])/g)?.[0] || '';
          const avaliacoes = el.innerText.match(/(\d+\.?\d*)\s*(avaliações|reviews)/i)?.[1] || '';
          itens.push({ titulo, preco, nota, avaliacoes });
        });
        return itens;
      });

      for (const r of resultados) {
        if (
          r.titulo.toLowerCase().includes(nome.toLowerCase().slice(0, 10)) &&
          (!r.avaliacoes || parseInt(r.avaliacoes) >= 10)
        ) {
          console.log(`✅ Encontrado: ${r.titulo}`);
          if (r.nota) produto.querySelector('h4').textContent = r.nota;
          if (r.preco) produto.querySelector('p').textContent = r.preco;
          encontrado = true;
          break;
        }
      }

      if (encontrado) break;
    }

    if (!encontrado) {
      console.log(`⚠️ Nenhum resultado relevante para: ${nome}`);
    }
  }

  fs.writeFileSync('produtos_atualizados.html', dom.serialize(), 'utf-8');
  console.log('✅ HTML atualizado salvo como produtos_atualizados.html');

  await browser.close();
})();