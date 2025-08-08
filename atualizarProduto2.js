const fs = require("fs");
const puppeteer = require("puppeteer-extra");
const StealthPlugin = require("puppeteer-extra-plugin-stealth");
const { JSDOM } = require("jsdom");

puppeteer.use(StealthPlugin());

const COOKIES = [
  { name: 'SPC_EC', value: 'y2xOcWNxMvG25E5CaTdy', domain: '.shopee.com.br', path: '/', httpOnly: true, secure: true },
  { name: 'SPC_F', value: '...', domain: '.shopee.com.br', path: '/', httpOnly: true, secure: true },
  { name: 'SPC_R_T_ID', value: '...', domain: '.shopee.com.br', path: '/', httpOnly: true, secure: true },
  { name: 'SPC_R_T_IV', value: '...', domain: '.shopee.com.br', path: '/', httpOnly: true, secure: true },
  { name: 'SPC_SI', value: '...', domain: '.shopee.com.br', path: '/', httpOnly: true, secure: true },
  { name: 'SPC_ST', value: '...', domain: '.shopee.com.br', path: '/', httpOnly: true, secure: true },
  { name: 'SPC_T_ID', value: '...', domain: '.shopee.com.br', path: '/', httpOnly: true, secure: true },
  { name: 'SPC_T_IV', value: '...', domain: '.shopee.com.br', path: '/', httpOnly: true, secure: true },
  { name: 'SPC_U', value: '1440357695', domain: '.shopee.com.br', path: '/', httpOnly: false, secure: true },
];

const USER_AGENT = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36';

async function buscarDados(page, url) {
  try {
    await page.goto(url, { waitUntil: 'networkidle2', timeout: 60000 });

    const resultado = await page.evaluate(() => {
      const buscarNumero = (seletor) => {
        const el = document.querySelector(seletor);
        if (!el) return null;
        const match = el.innerText.match(/[\d.,]+/);
        return match ? match[0].replace(',', '.') : null;
      };

      const buscarTextoPorClasse = (classe) => {
        const el = document.querySelector(`.${classe}`);
        return el ? el.innerText : null;
      };

      const buscarTodosNumerosEmDivs = (classesAlvo) => {
        const divs = document.querySelectorAll(classesAlvo);
        for (const div of divs) {
          const texto = div.innerText;
          const match = texto.match(/[\d,.]+/g);
          if (match && match.length > 0) {
            return match.map(t => t.replace(',', '.'));
          }
        }
        return [];
      };

      const numeros = buscarTodosNumerosEmDivs(".flex, .asFzUa, .flex-column");

      let nota = numeros.find(n => parseFloat(n) >= 1 && parseFloat(n) <= 5);
      let preco = numeros.find(n => parseFloat(n) >= 1 && parseFloat(n) <= 10000 && n.includes('.'));
      let vendidos = numeros.find(n => parseInt(n) >= 1);

      return {
        nota: nota || null,
        preco: preco ? `R$${parseFloat(preco).toFixed(2).replace('.', ',')}` : null,
        vendidos: vendidos ? parseInt(vendidos) : 0
      };
    });

    return resultado;
  } catch (err) {
    console.error(`Erro ao acessar ${url}: ${err.message}`);
    return { nota: null, preco: null, vendidos: 0 };
  }
}

(async () => {
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.setUserAgent(USER_AGENT);
  await page.setCookie(...COOKIES);

  const inputHTML = fs.readFileSync('index.html', 'utf-8');
  const dom = new JSDOM(inputHTML);
  const document = dom.window.document;

  const produtos = [...document.querySelectorAll('.produto')];

  for (const produto of produtos) {
    const link = produto.querySelector("a")?.href;
    const nome = produto.querySelector("h3")?.textContent.trim();
    if (!link) {
      produto.remove();
      continue;
    }

    console.log(`🔍 Verificando: ${nome}`);
    const { nota, preco, vendidos } = await buscarDados(page, link);

    if (!nota || !preco || vendidos < 50) {
      console.log(`⛔ Removido: ${nome} | Vendidos: ${vendidos}`);
      produto.remove();
      continue;
    }

    let h4 = produto.querySelector("h4");
    if (!h4) {
      h4 = document.createElement("h4");
      produto.querySelector("h3").after(h4);
    }
    h4.textContent = nota;

    const p = produto.querySelector("p");
    if (p) p.textContent = preco;

    await page.waitForTimeout(Math.random() * 3000 + 1000); // pausa entre os acessos
  }

  fs.writeFileSync("index-atualizado.html", dom.serialize(), "utf-8");
  console.log("✅ Arquivo atualizado salvo como index-atualizado.html");

  await browser.close();
})();
