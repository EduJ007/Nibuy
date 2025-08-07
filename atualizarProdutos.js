const fs = require('fs');
const axios = require('axios');
const cheerio = require('cheerio');

// Cookies do usuário
const COOKIES = `_QPWSDCXHZQA=d5687cec-613c-4448-cfd7; _sapid=6e48f993b3ca76fb6b1535; csrfToken=QFUcCFaHehhd5fjT0sRcP; ds=ae30c4fb9e6d946c6695a; REC_T_ID=27ac8144-7080-11f0-b81b; REC7TPL4Q=2cb2dad9-13ff-4509-a6e6; shopee_webUnique_cc=n1XAcqX9z6FhMbzsabi%2B%3D; SPC_CDS_CHAT=7b82591c-c57d-4374-bccc; SPC_CLIENTID=Z1BNrmhTcUJVNU1v0Zbnz; SPC_EC=MUqneUZVYFZmVtxde1T; SPC_F=gPMhfSqEl5Eu5o80Pf6el; SPC_R_T_ID=blpsi9t1X9V6Jxd3J5Rf2G; SPC_R_T_IV=MUdTeWZGleB5dEo3QUpn; SPC_SEC_SI=v1-S3Ft504S5kN4bmNllb1N; SPC_SI=DT5a3AAAAABN71V2cIRk; SPC_ST=.MEihRmE1WjhnRRUt1VNHm; SPC_T_ID=blpsi9t1X9V6Jxd3J5Rf2G; SPC_T_IV=MUdTeWZGleB5dEo3QUpn; SPC_U=1602566868`;

async function fetchInfo(url) {
  try {
    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0',
        'Cookie': COOKIES
      }
    });

    const $ = cheerio.load(response.data);

    const preco = $('._44qnta, ._25_r8I').first().text().trim();
    const nota = $('div[class*="product-rating-overview__score"] span').first().text().trim();

    return {
      preco: preco || 'R$ --',
      nota: nota || '0.0'
    };

  } catch (err) {
    console.error(`Erro ao acessar ${url}: ${err.message}`);
    return {
      preco: 'R$ --',
      nota: '0.0'
    };
  }
}

async function atualizarProdutos() {
  const html = fs.readFileSync('index.html', 'utf8');
  const $ = cheerio.load(html);
  const produtos = $('.produto');

  for (let i = 0; i < produtos.length; i++) {
    const produto = produtos.eq(i);
    const link = produto.find('a').attr('href');

    console.log(`Atualizando produto ${i + 1}/${produtos.length}...`);

    const { preco, nota } = await fetchInfo(link);

    produto.find('h4').text(nota);
    produto.find('p').text(preco);
  }

  fs.writeFileSync('index-atualizado.html', $.html(), 'utf8');
  console.log('✅ Arquivo "index-atualizado.html" gerado com sucesso!');
}

atualizarProdutos();
