const fs = require('fs');
const cheerio = require('cheerio');
const puppeteer = require('puppeteer');

(async () => {
    const html = fs.readFileSync('index.html', 'utf8');
    const $ = cheerio.load(html);

    const produtos = [];
    $('.produto').each((_, el) => {
        produtos.push({
            categoria: $(el).attr('class').replace('produto', '').trim(),
            imagem: $(el).find('img').attr('src'),
            alt: $(el).find('img').attr('alt'),
            nome: $(el).find('h3').text().trim(),
            nota: $(el).find('h4').text().trim() || null,
            preco: $(el).find('p').text().trim(),
            link: $(el).find('a').attr('href')
        });
    });

    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();

    let blocosAtualizados = '';

    for (let produto of produtos) {
        console.log(`🔍 Buscando: ${produto.nome}`);

        let novaNota = produto.nota;
        let novoPreco = produto.preco;

        try {
            await page.goto(`https://www.google.com/search?q=${encodeURIComponent(produto.nome + ' Shopee')}`, {
                waitUntil: 'domcontentloaded'
            });

            await page.waitForSelector('body');

            const dados = await page.evaluate(() => {
                const textoPagina = document.body.innerText;

                // Procurar preço
                const precoMatch = textoPagina.match(/R\$\s?\d{1,3}(\.\d{3})*,\d{2}/);
                const preco = precoMatch ? precoMatch[0] : null;

                // Procurar nota (4.8, 4.9, etc)
                const notaMatch = textoPagina.match(/\b[0-5]\.\d\b/);
                const nota = notaMatch ? notaMatch[0] : null;

                return { preco, nota };
            });

            if (dados.preco) novoPreco = dados.preco;

            if (!novaNota) { // Se não tinha nota antes
                novaNota = dados.nota ? dados.nota : 'N/D';
            }

        } catch (err) {
            console.log(`❌ Erro ao buscar: ${produto.nome}`);
            if (!novaNota) novaNota = 'N/D';
        }

        // Montar bloco HTML atualizado
        blocosAtualizados += `
<div class="produto ${produto.categoria}">
    <a href="${produto.link}" target="_blank" rel="noopener">
        <img alt="${produto.alt}" src="${produto.imagem}"/>
        <h3>${produto.nome}</h3>
        <h4>${novaNota}</h4>
        <p>${novoPreco}</p>
    </a>
</div>\n`;
    }

    await browser.close();

    fs.writeFileSync('produtos_atualizados.txt', blocosAtualizados, 'utf8');
    console.log('✅ Arquivo produtos_atualizados.txt gerado com sucesso!');
})();