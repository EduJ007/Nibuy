from bs4 import BeautifulSoup

# Mapeamento das categorias para palavras-chave
categorias = {
    "tecnologia": [
    "celular", "fone", "fone de ouvido", "caixa de som", "carregador",
    "usb", "tablet", "notebook", "monitor", "teclado", "mouse", "câmera",
    "smartphone", "caixa de som bluetooth", "fone bluetooth", "carregador rápido",
    "hd externo", "pendrive", "webcam", "headphone", "caixa de som portátil", "máquina"
  ],
  "infantil": [
    "bebê", "criança", "brinquedo", "chupeta", "fralda", "carrinho",
    "mamadeira", "berço", "mochila escolar", "pelúcia", "boneca",
    "carrinho de bebê", "brinquedo educativo", "cadeirinha"
  ],
  "casaecozinha": [
    "garrafa", "copo", "caneca", "vassoura", "rodo", "cama",
    "panela", "utensílio", "prato", "talher", "fogão", "micro-ondas",
    "batedeira", "liquidificador", "forno", "faqueiro", "pano de prato",
    "esponja", "escorredor", "tábua de corte", "geladeira", "fruteira"
  ],
  "modaebeleza": [
    "camisa", "calça", "vestido", "blusa", "roupa", "casaco",
    "saia", "camiseta", "jaqueta", "moletom", "short", "bolsa",
    "carteira", "cinto", "chapéu", "lenço", "cachecol", "luva",
    "boné", "bolsa de mão", "bolsa transversal", "bolsa de couro",
    "vestuário", "t-shirt", "cardigan"
  ],
  "calcados": [
    "sapato", "tênis", "chinelo", "bota", "sandália", "meia",
    "coturno", "sapatilha", "chuteira", "sapatênis", "alpargata",
    "sapato social", "sapato feminino", "sapato masculino", "pantufa",
    "sandália rasteira", "sandália plataforma"
  ],
  "acessorios": [
    "colar", "pulseira", "relógio", "óculos", "brinco", "anel",
    "cinto", "boné", "chapéu", "mochila", "carteira", "chaveiro",
    "lenço", "broche", "óculos de sol", "pulseira de couro",
    "tiara", "presilha", "bolsa", "bolsas"
  ],
  "belezaemaquiagem": [
    "maquiagem", "batom", "base", "sombra", "rimel", "pó compacto",
    "blush", "iluminador", "delineador", "primer", "corretivo",
    "pincel de maquiagem", "esponja de maquiagem", "máscara facial",
    "tônico facial", "hidratante", "remover maquiagem", "água micelar"
  ],
  "autocuidadoesaúde": [
    "protetor", "remédio", "creme", "escova", "higiene",
    "loção", "sabonete", "antisséptico", "máscara", "álcool em gel",
    "shampoo", "condicionador", "hidratante corporal", "cotonete",
    "curativo", "termômetro", "compressa", "bandagem", "anti-inflamatório", "cabelo"
  ],
  "academiaefitness": [
    "halter", "colchonete", "faixa", "roupa esportiva", "bermuda",
    "shorts", "top", "tênis esportivo", "faixa elástica", "bola fitness",
    "corda de pular", "suplemento", "garrafa de água", "calça legging",
    "camiseta dry fit", "luva de academia", "bandagem esportiva"
  ],
  "esporteselazer": [
    "bola", "raquete", "bicicleta", "tênis esportivo", "meias",
    "futebol", "antiderrapante", "capacete", "patins", "skate",
    "bola de basquete", "bola de vôlei", "tênis de mesa", "redes",
    "luva de goleiro", "bola de futebol", "bola de golfe", "equipamento esportivo"
  ],
  "viagemeaventura": [
    "mochila", "lanterna", "barraca", "bota de caminhada", "mapa",
    "bússola", "cantil", "botas", "saco de dormir", "binóculo", "bolsa",
    "maleta", "guarda-chuva", "protetor solar", "repelente", "canivete",
    "gorro", "óculos de sol", "capa de chuva", "cadeado"
  ],
  "pets": [
    "ração", "coleira", "brinquedo pet", "comedouro", "cama pet",
    "shampoo pet", "areia", "gaiola", "aquário", "bolinha pet",
    "ração para cachorro", "ração para gato", "tapete higiênico",
    "petisco", "casinha pet"
  ],
  "ferramentas": [
    "martelo", "chave de fenda", "parafuso", "furadeira", "serra",
    "alicate", "tinta", "lixa", "trena", "nivelador", "broca",
    "serra elétrica", "chave inglesa", "parafusadeira", "furadeira elétrica",
    "grampeador", "escova de aço", "espatula"
  ],
  "educaçaoeentretenimento": [
    "livro", "jogo", "tabuleiro", "quebra-cabeça", "material escolar",
    "caderno", "caneta", "dicionário", "xadrez", "cartas",
    "livro infantil", "livro didático", "jogo educativo",
    "cartas de baralho", "jogo de tabuleiro", "dvd educativo"
  ]
}


def categorizar(nome_produto):
    nome_produto = nome_produto.lower()
    for categoria, palavras in categorias.items():
        for palavra in palavras:
            if palavra in nome_produto:
                return categoria
    return "outros"  # Caso não encontre nenhuma palavra chave

# Abre o arquivo HTML original
with open("nibuy.html", "r", encoding="utf-8") as f:
    soup = BeautifulSoup(f, "html.parser")

# Para cada produto, vamos categorizar e substituir a classe
produtos = soup.find_all("div", class_="produto")

for produto in produtos:
    # Pega o nome do produto dentro da tag <h3>
    nome = produto.find("h3").get_text(strip=True)

    # Define a categoria pelo nome
    nova_categoria = categorizar(nome)

    # Remove todas as classes do div produto e adiciona a nova categoria
    # mantendo a classe "produto"
    produto['class'] = ["produto", nova_categoria]

# Salva num arquivo novo
with open("index.html", "w", encoding="utf-8") as f:
    f.write(str(soup))

print("Arquivo corrigido salvo como nibuy.html")
