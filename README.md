# Popular da Construção — site institucional

Site de página única da Popular da Construção, varejo de materiais de construção e
reforma em Planaltina-GO e Formosa-GO.

Servido por uma aplicação Node.js/Express, preparada para a Hospedagem Node.js da
Brasil Cloud.

## Rodar localmente

```bash
npm install
npm run dev
```

Abre em <http://localhost:3000>.

## Estrutura

```
server.js                 servidor Express (segurança, cache, redirects, 404)
package.json              dependências e scripts
.nvmrc                    Node 22.21.0
public/
  index.html              a página
  css/styles.css          estilos (tema claro e escuro)
  js/app.js               horário de funcionamento ao vivo e cards das unidades
  assets/                 logo, tijolo da marca, imagens do app, ícones
  robots.txt
  sitemap.xml
  site.webmanifest
DEPLOY.md                 passo a passo do deploy e da migração do domínio
```

## Scripts

| Comando | O que faz |
|---|---|
| `npm start` | sobe o servidor (é o que a Brasil Cloud executa) |
| `npm run dev` | sobe com recarga automática ao salvar |

## Variáveis de ambiente

| Variável | Padrão | Descrição |
|---|---|---|
| `PORT` | `3000` | Porta do servidor. O painel da Brasil Cloud define automaticamente. |
| `HOST` | `0.0.0.0` | Interface de escuta. |
| `CANONICAL_HOST` | *(vazio)* | Quando definido, força HTTPS e redireciona para esse host. Só ligue depois do domínio apontado e do SSL emitido. |

## Rotas

| Rota | Resposta |
|---|---|
| `/` | a página |
| `/healthz` | JSON com status, uptime e versão do Node |
| `/empresa`, `/na-loja`, `/historia`, `/app`, `/unidades`, `/contato`, `/lojas` | redirecionam para a âncora correspondente |
| qualquer outra | página 404 da marca |

## Google Tag Manager

O contêiner **GTM-WVQHHC4H** está instalado: o snippet principal no `<head>` do
`public/index.html` (o mais alto possível, como o Google pede) e o `noscript`
logo após a abertura do `<body>`.

Além disso, o `public/js/app.js` empurra eventos para o `dataLayer` nos cliques que
importam. No GTM, crie um acionador do tipo **Evento personalizado** com o nome exato
e ligue na conversão do Google Ads.

| Evento | Variáveis | Quando dispara |
|---|---|---|
| `clique_whatsapp` | `loja`, `origem` | Qualquer link de WhatsApp |
| `clique_rede_social` | `rede`, `origem` | Ícones de Instagram e Facebook |
| `clique_como_chegar` | `loja` | Botão "Como chegar" (Google Maps) |
| `clique_telefone` | `loja`, `origem` | Clique no telefone da unidade |
| `clique_baixar_app` | `plataforma` | Botões da Google Play e da App Store |

Valores possíveis:

- `loja` — `Planaltina-GO`, `Formosa-GO` ou `nao_identificada`
- `origem` — `topo`, `pagina`, `card_da_unidade`, `secao_app`, `rodape`, `barra_fixa`
- `rede` — `instagram`, `facebook`
- `plataforma` — `google_play`, `app_store`

Para ler `loja`, `origem`, `rede` ou `plataforma` no GTM, crie uma **Variável da
camada de dados** com esse nome exato.

> **Atenção à CSP.** O `server.js` tem uma política de segurança de conteúdo que
> só libera os domínios do Google (Tag Manager, Analytics e Ads). Se o marketing
> adicionar Meta Pixel, RD Station, um chat ou qualquer outra ferramenta pelo GTM,
> **a tag é bloqueada em silêncio** até o domínio dela ser incluído nas listas
> `GOOGLE_SCRIPTS`, `GOOGLE_CONNECT`, `GOOGLE_IMGS` e `GOOGLE_FRAMES` no `server.js`.
> O sintoma é a tag não disparar sem erro visível — o motivo aparece no console do
> navegador como "Refused to load...".

## Conteúdo que precisa de manutenção

Estes dados estão no código e mudam com o tempo:

- **Horários e endereços das lojas** — no início de `public/js/app.js`, no objeto `LOJAS`
- **Link da App Store** — em `public/index.html`, hoje aponta para a busca da App Store;
  troque pelo link direto do aplicativo quando ele estiver disponível
- **Anos de operação** — "10 anos" em `public/index.html`, atualizar a cada aniversário

## Deploy

Veja [DEPLOY.md](./DEPLOY.md).
