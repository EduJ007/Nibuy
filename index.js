document.addEventListener('DOMContentLoaded', () => {
  // Função para gerar estrelas SVG com sombra
  function gerarEstrelaSVG(tipo) {
    const cores = {
      cheia: '#FFD700', // dourado
      meia: '#FFD700',
      vazia: 'white'     // cinza claro
    };

    const sombra = 'stroke:black; stroke-width:1px;';

    if (tipo === 'cheia') {
      return `<svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" style="${sombra}" fill="${cores.cheia}" viewBox="0 0 16 16"><path d="M3.612 15.443 4.8 10.71l-4.192-3.356 5.271-.455L8 2.223l2.121 4.676 5.27.455-4.19 3.356 1.188 4.733L8 12.347l-4.388 3.096z"/></svg>`;
    } 
    if (tipo === 'meia') {
      return `<svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" style="${sombra}" viewBox="0 0 16 16">
        <defs>
          <linearGradient id="meia">
            <stop offset="50%" stop-color="${cores.meia}"/>
            <stop offset="50%" stop-color="${cores.vazia}"/>
          </linearGradient>
        </defs>
        <path fill="url(#meia)" d="M3.612 15.443 4.8 10.71l-4.192-3.356 5.271-.455L8 2.223l2.121 4.676 5.27.455-4.19 3.356 1.188 4.733L8 12.347l-4.388 3.096z"/>
      </svg>`;
    }
    return `<svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" style="${sombra}" fill="${cores.vazia}" viewBox="0 0 16 16"><path d="M3.612 15.443 4.8 10.71l-4.192-3.356 5.271-.455L8 2.223l2.121 4.676 5.27.455-4.19 3.356 1.188 4.733L8 12.347l-4.388 3.096z"/></svg>`;
  }
  // Elementos do DOM
  const categoriaFiltro = document.getElementById("categoriaFiltro");
  const searchInput = document.getElementById("searchProduto");
  const searchInputTop = document.getElementById("searchproduto2");
  const valorFiltro = document.getElementById("valor");
  const btnBuscar = document.getElementById("btnBuscar");
  const produtos = Array.from(document.querySelectorAll(".produto"));
  const paginationContainer = document.querySelector(".pagination");
  const produtosPorPagina = 24;
  let paginaAtual = 1;

  // pega a "categoria" real do produto (primeira classe além de 'produto')
  const getCategoria = produto => {
    return Array.from(produto.classList).find(c => c !== 'produto') || '';
  };

  // parse de preço: retorna número ou Infinity se não achei preço válido
  const parsePreco = text => {
    if (!text) return Infinity;
    const match = text.replace(/\s/g,'').match(/(\d[\d.,]*)/);
    if (!match) return Infinity;
    // remove pontos de milhar e troca vírgula por ponto
    return parseFloat(match[1].replace(/\./g,'').replace(',', '.'));
  };

  // Substitui notas por estrelas SVG
  document.querySelectorAll('.produto h4').forEach(h4 => {
    const match = h4.textContent.match(/[\d]+(?:[.,]\d+)?/);
    if (!match) return;
    const nota = parseFloat(match[0].replace(',', '.'));
    const estrelas = [];
    
    for (let i = 1; i <= 5; i++) {
      if (nota >= i) {
        estrelas.push(gerarEstrelaSVG('cheia'));
      } else if (nota >= i - 0.5) {
        estrelas.push(gerarEstrelaSVG('meia'));
      } else {
        estrelas.push(gerarEstrelaSVG('vazia'));
      }
    }

    h4.innerHTML = `${estrelas.join('')} <span style="margin-left:4px;">${nota.toFixed(1)}</span>`;
  });

  function aplicarFiltros() {
    const categoria = (categoriaFiltro?.value || 'todos').toLowerCase();
    const pesquisa = (searchInput?.value || '').toLowerCase();
    const valorMax = (valorFiltro && valorFiltro.value.trim() !== '') ?
      parseFloat(valorFiltro.value.replace(',', '.')) : Infinity;

    return produtos.filter(prod => {
      const cat = getCategoria(prod).toLowerCase();
      const titulo = (prod.querySelector('h3')?.textContent || '').toLowerCase();
      const precoTxt = prod.querySelector('p')?.textContent || '';
      const preco = parsePreco(precoTxt);

      const catOk = categoria === 'todos' || cat === categoria;
      const pesquisaOk = titulo.includes(pesquisa);
      const precoOk = preco <= valorMax;

      return catOk && pesquisaOk && precoOk;
    });
  }

  function renderizarProdutos() {
    const filtrados = aplicarFiltros();
    const totalPaginas = Math.max(1, Math.ceil(filtrados.length / produtosPorPagina));
    if (paginaAtual > totalPaginas) paginaAtual = 1;

    produtos.forEach(p => p.style.display = 'none');

    const inicio = (paginaAtual - 1) * produtosPorPagina;
    filtrados.slice(inicio, inicio + produtosPorPagina).forEach(p => p.style.display = 'block');

    // Paginação
    if (paginationContainer) {
      paginationContainer.innerHTML = '';
      if (totalPaginas > 1) {
        if (paginaAtual > 1) {
          const prev = document.createElement('a');
          prev.href = '#';
          prev.textContent = '◄';
          prev.addEventListener('click', e => { e.preventDefault(); paginaAtual--; renderizarProdutos(); });
          paginationContainer.appendChild(prev);
        }

        let inicioPag = Math.max(1, paginaAtual - 2);
        let fimPag = Math.min(totalPaginas, paginaAtual + 2);
        for (let i = inicioPag; i <= fimPag; i++) {
          const link = document.createElement('a');
          link.href = '#';
          link.textContent = i;
          if (i === paginaAtual) link.classList.add('ativo');
          link.addEventListener('click', e => { e.preventDefault(); paginaAtual = i; renderizarProdutos(); });
          paginationContainer.appendChild(link);
        }

        if (paginaAtual < totalPaginas) {
          const next = document.createElement('a');
          next.href = '#';
          next.textContent = '►';
          next.addEventListener('click', e => { e.preventDefault(); paginaAtual++; renderizarProdutos(); });
          paginationContainer.appendChild(next);
        }
      }
    }
  }

  // eventos dos filtros
  categoriaFiltro?.addEventListener('change', () => { paginaAtual = 1; renderizarProdutos(); });
  searchInput?.addEventListener('input', () => { paginaAtual = 1; renderizarProdutos(); });
  valorFiltro?.addEventListener('input', () => { paginaAtual = 1; renderizarProdutos(); });

  // conecta a pesquisa do header com a interna
  if (searchInputTop) {
    searchInputTop.addEventListener('input', () => {
      if (searchInput) { searchInput.value = searchInputTop.value; searchInput.dispatchEvent(new Event('input')); }
    });
    searchInputTop.addEventListener('keypress', e => {
      if (e.key === 'Enter') {
        e.preventDefault();
        if (searchInput) { searchInput.value = searchInputTop.value; searchInput.dispatchEvent(new Event('input')); }
      }
    });
  }
  btnBuscar?.addEventListener('click', e => {
    e.preventDefault();
    if (searchInputTop && searchInput) { searchInput.value = searchInputTop.value; searchInput.dispatchEvent(new Event('input')); }
  });
// teste ///
const generoFiltro = document.getElementById("generoFiltro");

function aplicarFiltros() {
  const categoria = (categoriaFiltro?.value || 'todos').toLowerCase();
  const genero = (generoFiltro?.value || 'todos').toLowerCase();
  const pesquisa = (searchInput?.value || '').toLowerCase();
  const valorMax = (valorFiltro && valorFiltro.value.trim() !== '') ?
    parseFloat(valorFiltro.value.replace(',', '.')) : Infinity;

  return produtos.filter(prod => {
    const cat = getCategoria(prod).toLowerCase();
    const titulo = (prod.querySelector('h3')?.textContent || '').toLowerCase();
    const precoTxt = prod.querySelector('p')?.textContent || '';
    const preco = parsePreco(precoTxt);

    const generoOk = genero === 'todos' || prod.classList.contains(genero);
    const catOk = categoria === 'todos' || cat === categoria;
    const pesquisaOk = titulo.includes(pesquisa);
    const precoOk = preco <= valorMax;

    return generoOk && catOk && pesquisaOk && precoOk;
  });
}

// evento
generoFiltro?.addEventListener('change', () => { paginaAtual = 1; renderizarProdutos(); });
//fim do teste//
  // carrossel dos mais avaliados (top 30)
  const carrossel = document.getElementById('carrosselProdutos');
  if (carrossel) {
    const produtosOrdenados = produtos.map(prod => {
      const notaMatch = prod.querySelector('h4')?.textContent.match(/[\d]+(?:[.,]\d+)?/);
      return { elemento: prod, nota: notaMatch ? parseFloat(notaMatch[0].replace(',', '.')) : 0 };
    }).sort((a, b) => b.nota - a.nota).slice(0, 30);

    produtosOrdenados.forEach(p => {
      const img = p.elemento.querySelector('img')?.src || '';
      const nome = p.elemento.querySelector('h3')?.textContent || '';
      const preco = p.elemento.querySelector('p')?.textContent || '';
      const nota = p.elemento.querySelector('h4')?.innerHTML || ''; // Usa innerHTML para manter as estrelas SVG
      const link = p.elemento.querySelector('a')?.href || '#';

      const card = document.createElement('div');
      card.className = 'card-produto';
      card.innerHTML = `<img src="${img}" alt="${nome}"><h3>${nome}</h3><p>${preco}</p><h4>${nota}</h4><a href="${link}" target="_blank">Visualizar</a>`;
      carrossel.appendChild(card);
    });

    document.getElementById('anterior')?.addEventListener('click', () => {
      carrossel.scrollBy({ left: -300, behavior: 'smooth' });
    });
    document.getElementById('proximo')?.addEventListener('click', () => {
      carrossel.scrollBy({ left: 300, behavior: 'smooth' });
    });
  }

  // compatibilidade com inline oninput="filtrarProdutos()"
  window.filtrarProdutos = renderizarProdutos;

  // render inicial
  renderizarProdutos();
});

// Código para a busca superior
const inputBusca2 = document.getElementById('searchproduto2');
const btnBusca2 = document.getElementById('btnBuscar');

// Cria container de resultados
let containerResultados = document.createElement('div');
containerResultados.classList.add('resultados-busca');
document.body.appendChild(containerResultados);

// Posiciona o container abaixo do input
function posicionarResultados() {
    const rectInput = inputBusca2.getBoundingClientRect();
    const rectBtn = btnBusca2.getBoundingClientRect();

    // da borda esquerda do input até a direita da lupa
    const larguraTotal = rectBtn.right - rectInput.left;

    containerResultados.style.position = 'absolute';
    containerResultados.style.top = `${rectInput.bottom + window.scrollY}px`;
    containerResultados.style.left = `${rectInput.left + window.scrollX}px`;
    containerResultados.style.width = `${larguraTotal}px`; // ocupa até a lupa
    containerResultados.style.background = '#fff';
    containerResultados.style.border = '1px solid #ccc';
    containerResultados.style.zIndex = '9999';
    containerResultados.style.maxHeight = '300px';
    containerResultados.style.overflowY = 'auto';
}
// Função para exibir resultados
function mostrarResultados(termo) {
    containerResultados.innerHTML = '';

    if (termo.length < 1) {
        containerResultados.style.display = 'none';
        return;
    }

    termo = termo.toLowerCase();

    const produtos = document.querySelectorAll('.produto');
    let encontrados = 0;
    function posicionarResultados() {
    const rectInput = inputBusca2.getBoundingClientRect();
    const rectBtn = btnBusca2.getBoundingClientRect();

    const larguraTotal = (rectBtn.right - rectInput.left); 
    // da borda esquerda do input até a direita da lupa

    containerResultados.style.position = 'absolute';
    containerResultados.style.top = `${rectInput.bottom + window.scrollY}px`;
    containerResultados.style.left = `${rectInput.left + window.scrollX}px`;
    containerResultados.style.width = `${larguraTotal}px`; // agora acompanha até a lupa
    containerResultados.style.background = '#fff';
    containerResultados.style.border = '1px solid #ccc';
    containerResultados.style.zIndex = '9999';
    containerResultados.style.maxHeight = '800px';
    containerResultados.style.overflowY = 'auto';
}
    produtos.forEach(produto => {
        const nome = produto.querySelector('h3')?.textContent.toLowerCase() || '';
        if (nome.includes(termo)) {
            encontrados++;

            const imgSrc = produto.querySelector('img')?.src || '';
            const nomeProd = produto.querySelector('h3')?.textContent || '';
            const nota = produto.querySelector('h4')?.innerHTML || ''; // Usa innerHTML para manter as estrelas SVG
            const preco = produto.querySelector('p')?.textContent || '';
            const link = produto.querySelector('a')?.href || '#';

            let item = document.createElement('div');
            item.classList.add('item-resultado');
            item.style.display = 'flex';
            item.style.alignItems = 'center';
            item.style.padding = '8px';
            item.style.cursor = 'pointer';
            item.style.borderBottom = '1px solid #eee';
            // Trecho restaurado (antigo)
            item.innerHTML =  `
    <img src="${imgSrc}" 
         style="width:50px;height:50px;object-fit:cover;margin-right:8px; border-radius:5px;">
    <div style="flex:1; display:flex; flex-direction:column;">
        <strong style="
            display: -webkit-box;
            -webkit-line-clamp: 2; /* aqui você escolhe: 1, 2, 3 linhas */
            -webkit-box-orient: vertical;
            overflow: hidden;
            text-overflow: ellipsis;
            font-size: 14px;
        ">${nomeProd}</strong>
        <small style="color:#333; font-size:15px;">${nota} | ${preco}</small>
    </div>
`;
            item.addEventListener('click', () => {
                window.location.href = link;
            });

            containerResultados.appendChild(item);
        }
    });

    containerResultados.style.display = encontrados > 0 ? 'block' : 'none';
}
// Evento de digitação
inputBusca2.addEventListener('input', () => {
    posicionarResultados();
    mostrarResultados(inputBusca2.value);
});

// Evento Enter para filtrar no main
// Evento Enter para filtrar no main
inputBusca2.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
        e.preventDefault();
        containerResultados.style.display = 'none';
        const termo = inputBusca2.value.toLowerCase();

        let primeiroVisivel = null;

        document.querySelectorAll('.produto').forEach(produto => {
            const nome = produto.querySelector('h3')?.textContent.toLowerCase() || '';
            const visivel = nome.includes(termo);
            produto.style.display = visivel ? '' : 'none';

            if (visivel && !primeiroVisivel) {
                primeiroVisivel = produto;
            }
        });

        // Desce até o primeiro produto visível
        if (primeiroVisivel) {
            primeiroVisivel.scrollIntoView({ behavior: "smooth", block: "start" });
        }
    }
});

// Botão buscar
btnBusca2.addEventListener('click', () => {
    const termo = inputBusca2.value.toLowerCase();
    containerResultados.style.display = 'none';

    let primeiroVisivel = null;

    document.querySelectorAll('.produto').forEach(produto => {
        const nome = produto.querySelector('h3')?.textContent.toLowerCase() || '';
        const visivel = nome.includes(termo);
        produto.style.display = visivel ? '' : 'none';

        if (visivel && !primeiroVisivel) {
            primeiroVisivel = produto;
        }
    });

    // Desce até o primeiro produto visível
    if (primeiroVisivel) {
        primeiroVisivel.scrollIntoView({ behavior: "smooth", block: "start" });
    }

    // render inicial
  renderizarProdutos();

  // === MENU DOS 3 PONTINHOS ===
  const settingsIcon = document.getElementById("settings-icon");
  const settingsMenu = document.getElementById("settings-menu");

  if (settingsIcon && settingsMenu) {
    settingsIcon.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      settingsMenu.classList.toggle("show");
    });

    // Fecha se clicar fora
    document.addEventListener("click", (e) => {
      if (!settingsMenu.contains(e.target) && e.target !== settingsIcon) {
        settingsMenu.classList.remove("show");
      }
    });
  }
});
