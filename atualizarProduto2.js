// indexUpdater.js
const fs = require('fs');
const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
const { JSDOM } = require('jsdom');
puppeteer.use(StealthPlugin());

// Cookies Shopee (válidos por 1 dia)
const COOKIES = [
  {
    name: 'SPC_EC', value: 'S1BrMWg25U0VZvNBZu1...', domain: '.shopee.com.br', path: '/', expires: 1754656380, httpOnly: true, secure: true
  },
  {
    name: 'SPC_F', value: 'gPMhfSqEl5Eu5o80PfE6...', domain: '.shopee.com.br', path: '/', expires: 1754656380, httpOnly: true, secure: true
  },
  {
    name: 'SPC_R_T_ID', value: 'blps9it1X9V61xdJ35fR2G...', domain: '.shopee.com.br', path: '/', expires: 1754656380, httpOnly: true, secure: true
  },
  {
    name: 'SPC_R_T_IV', value: 'MUdTeWZGeIB5dEo3QUp...', domain: '.shopee.com.br', path: '/', expires: 1754656380, httpOnly: true, secure: true
  },
  {
    name: 'SPC_SEC_SI', value: 'v1-SWZuaHAxSG5CdCkTO...', domain: '.shopee.com.br', path: '/', expires: 1754656380, httpOnly: true, secure: true
  },
  {
    name: 'SPC_SI', value: '8z93aAAAAABhS3ILMXhR...', domain: '.shopee.com.br', path: '/', expires: 1754656380, httpOnly: true, secure: true
  },
  {
    name: 'SPC_ST', value: '.MEihRmEtWjNhRRUt1VH...', domain: '.shopee.com.br', path: '/', expires: 1754656380, httpOnly: true, secure: true
  },
  {
    name: 'SPC_T_ID', value: 'blps9it1X9V61xdJ35fR2G...', domain: '.shopee.com.br', path: '/', expires: 1754656380, httpOnly: true, secure: true
  },
  {
    name: 'SPC_T_IV', value: 'MUdTeWZGeIB5dEo3QUp...', domain: '.shopee.com.br', path: '/', expires: 1754656380, httpOnly: true, secure: true
  },
  {
    name: 'SPC_U', value: '1602566868', domain: '.shopee.com.br', path: '/', expires: 1754656380, httpOnly: true, secure: true
  }
];

async function fetchProductInfo(page, url) {
  try {
    await page.goto(url, { waitUntil: 'networkidle2', timeout: 60000 });

    const data = await page.evaluate(() => {
      const parseNumbers = (text) => {
        if (!text) return null;
        text = text.replace(',', '.');
        if (text.includes('mil') || text.includes('k')) {
          return parseFloat(text) * 1000;
        }
        return parseFloat(text.replace(/[^\d\.]/g, ''));
      };

      const allDivs = Array.from(document.querySelectorAll('div'));
      let nota = null, preco = null, vendidos = null;

      for (const div of allDivs) {
        const text = div.innerText.trim();
        if (/\d+(\.\d+)?/.test(text)) {
          if (!nota && /\d(\.\d)?$/.test(text)) nota = text;
          if (!preco && text.includes('R$')) preco = text;
          if (!vendidos && /(vendido|mil|k)/i.test(text)) vendidos = parseNumbers(text);
        }
      }

      return {
        nota: nota || '0.0',
        preco: preco || 'R$ --',
        vendidos: vendidos || 0
      };
    });

    return data;

  } catch (err) {
    console.error(`Erro ao acessar ${url}: ${err.message}`);
    return { nota: '0.0', preco: 'R$ --', vendidos: 0 };
  }
}

async function main() {
  const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox'] });
  const page = await browser.newPage();

  await page.setUserAgent('Mozilla/5.0');
  await page.setViewport({ width: 1366, height: 768 });
  await page.setCookie(...COOKIES);

  const html = fs.readFileSync('index.html', 'utf-8');
  const dom = new JSDOM(html);
  const { document } = dom.window;

  const produtos = [...document.querySelectorAll('.produto')];

  for (let i = 0; i < produtos.length; i++) {
    const el = produtos[i];
    const link = el.querySelector('a')?.href;
    if (!link) {
      el.remove();
      continue;
    }

    console.log(`Verificando produto ${i+1}...`);

    const { nota, preco, vendidos } = await fetchProductInfo(page, link);

    if (vendidos < 50) {
      el.remove();
      continue;
    }

    let h4 = el.querySelector('h4');
    if (!h4) {
      h4 = document.createElement('h4');
      el.querySelector('h3')?.after(h4);
    }
    h4.textContent = nota;

    const p = el.querySelector('p');
    if (p) p.textContent = preco;

    await page.waitForTimeout(2000 + Math.random() * 2000);
  }

  fs.writeFileSync('index-atualizado.html', dom.serialize());
  console.log('✅ index-atualizado.html gerado com sucesso');

  await browser.close();
}

main();
