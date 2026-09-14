# Deploy — Popular da Construção na Brasil Cloud

Guia completo: do repositório no GitHub até o domínio saindo do Wix.

**Stack:** Node.js 22.21 · Express 4 · site estático servido pelo Node
**Plano recomendado:** Start (R$ 35/mês) — 1 GB RAM e 2 GB SSD sobram para esta aplicação.
O site inteiro pesa cerca de 300 KB e não usa banco de dados.

---

## Dados da aplicação (já provisionada)

| | |
|---|---|
| Aplicação | `popular` (`hgtbnjfsgu`) · ambiente `producao` |
| Node.js | **22.21** |
| Recursos | 1 vCPU · 1024 MB RAM · 2 GB SSD |
| Endereço temporário | `app-producao-popular-wezm.hospedagemelastica.com.br` |
| Domínio vinculado | `populardaconstrucao.com.br` (ainda apontando para o Wix) |
| **IPv4 — é este que vai para o DNS** | **`177.131.142.111`** |
| IPv6 | `2804:7190:0:97:3:5ff:fe69:11` |

> O IPv4 acima é o que substitui os três registros `185.230.63.x` do Wix.
> Se o painel do Wix aceitar registro `AAAA`, vale publicar o IPv6 junto.

> ⚠️ **Verificação obrigatória antes da etapa A2.** Ao aceitar o domínio, o painel
> criou uma zona DNS para `populardaconstrucao.com.br` na infraestrutura da Brasil
> Cloud. Essa zona passa a valer no instante em que os servidores de nomes forem
> trocados no Registro.br. Abra o botão **Domínios** e confira se ela contém o MX e
> os oito CNAMEs de e-mail da tabela 3.2. **Se tiver só os registros do site, o
> e-mail cai no momento da troca de NS.** Nesse caso, acrescente os registros de
> e-mail à zona — ou peça ao suporte que faça — e só então mexa no Registro.br.

---

## Etapa 1 — Subir o código para o GitHub

No seu computador, dentro da pasta do projeto:

```bash
git init
git add .
git commit -m "Site institucional da Popular da Construção"
git branch -M main
```

Crie o repositório em <https://github.com/new>:

- **Nome:** `popular-da-construcao`
- **Visibilidade:** `Private` (recomendado)
- **Não** marque "Add a README" — o projeto já tem os arquivos

Depois conecte e envie:

```bash
git remote add origin https://github.com/SEU-USUARIO/popular-da-construcao.git
git push -u origin main
```

> `node_modules/` não vai para o repositório — está no `.gitignore`. A Brasil Cloud
> roda `npm install` no servidor durante o deploy.

---

## Etapa 2 — Criar a hospedagem no painel da Brasil Cloud

1. Entre no **Painel do Cliente** → **Hospedagem Node.js** → **Criar aplicação**
2. Preencha:

| Campo | Valor |
|---|---|
| Versão do Node.js | **22** (o `.nvmrc` pede 22.21.0) |
| Comando de start | `npm start` |
| Arquivo principal | `server.js` |
| Porta | deixe a que o painel definir — o `server.js` lê `process.env.PORT` |
| Banco de dados | nenhum |

3. Em **Deploy com GitHub**, autorize a conta e selecione o repositório
   `popular-da-construcao`, branch `main`.
4. Dispare o primeiro deploy.

### Se aparecer "Domínio já existe no servidor de NS"

Esse erro aparece ao criar a aplicação com o campo **Domínio** preenchido. O painel
tenta provisionar uma zona DNS para `populardaconstrucao.com.br` na infraestrutura
deles e encontra o domínio já cadastrado.

**Por que isso acontece:** o e-mail corporativo de vocês (ProEmail) já roda dentro da
própria Brasil Cloud. Dá para confirmar pelos IPs:

```
ns1.brasilwork.com.br          → 177.131.140.114
mail-ag-br1-15.proemail.cloud  → 177.131.141.15  (PTR: mail-ag-br1-15.proemail.com.br)
IPs no SPF do domínio          → 177.131.140.165 e 177.131.140.115
```

Mesma faixa de rede. O domínio já existe no sistema deles por causa do serviço de
e-mail — não é conflito com outro cliente.

> ⚠️ **Não peça para "excluir o domínio existente" para destravar o cadastro.**
> Esse registro provavelmente sustenta o e-mail da empresa. Apagar para liberar a
> criação da aplicação é o caminho mais rápido para derrubar o e-mail sem perceber.

**Como destravar agora:** crie a aplicação deixando o campo **Domínio em branco** —
ele é opcional. A aplicação sobe, você testa tudo no endereço temporário, e o domínio
é vinculado depois.

**Como resolver de vez:** abra um chamado no suporte. Texto sugerido:

> Olá. Tenho o domínio populardaconstrucao.com.br com e-mail ativo na ProEmail,
> na infraestrutura de vocês. Estou criando uma aplicação de Hospedagem Node.js
> para o site institucional desse mesmo domínio e recebo o erro "Domínio já existe
> no servidor de NS" ao preencher o campo Domínio.
>
> Preciso vincular esse domínio à nova aplicação Node.js **sem alterar nada dos
> registros de e-mail** (MX, SPF e os CNAMEs activesync, autodiscover, dav, imap,
> pop3, smtp e webmail apontando para mail-ag-br1-15.proemail.cloud).
>
> Hoje a zona DNS ainda está no Wix (ns4/ns5.wixdns.net) e pretendo migrá-la para
> vocês depois que o site estiver validado. Podem me orientar sobre a ordem correta?

### Variáveis de ambiente

Só há uma, e ela deve ficar **desligada até o domínio estar apontado**:

| Variável | Quando definir | Valor |
|---|---|---|
| `CANONICAL_HOST` | só depois do DNS migrado e do SSL emitido | `www.populardaconstrucao.com.br` |

Ela força HTTPS e a versão com `www`. Se você ligar antes do domínio responder,
o site entra em loop de redirecionamento no endereço temporário.

### Conferir se subiu

Acesse o endereço temporário que o painel gera e teste:

- `/` → a página deve abrir completa
- `/healthz` → deve responder `{"ok":true, ... "node":"v22.x.x"}`
- `/unidades` → deve redirecionar para `/#unidades`
- uma URL inventada → deve mostrar a página 404 amarela da marca

Confirme no `/healthz` que a versão do Node é **v22**. Se vier outra, ajuste no painel.

---

## Etapa 3 — Tirar o domínio do Wix

Esta é a parte que exige atenção. **Leia inteira antes de clicar em qualquer coisa no Wix** —
o e-mail da empresa depende dela.

### 3.1 — Como está hoje (levantamento feito na zona real)

**A zona DNS do domínio está hospedada no Wix.** Os servidores de nomes autoritativos são:

```
ns4.wixdns.net
ns5.wixdns.net
```

Isso significa que **todos** os registros do domínio — inclusive os de e-mail — vivem
dentro do painel do Wix. Se o domínio for removido de lá antes da zona ser recriada em
outro lugar, o site **e o e-mail da empresa** saem do ar juntos.

O Registro.br guarda só o registro do domínio e a delegação para esses servidores.

### 3.2 — Inventário da zona atual (conferido no painel do Wix)

Esta é a zona completa. **Tudo marcado com ✅ precisa existir no destino novo antes
de a troca acontecer.** Copie os valores completos direto do painel do Wix — as
colunas aparecem truncadas na tela.

#### Registros do site — descartar

| Nome | Tipo | Valor |
|---|---|---|
| `@` | A | `185.230.63.107` |
| `@` | A | `185.230.63.171` |
| `@` | A | `185.230.63.186` |
| `www` | CNAME | `cdn3.wixdns.net` |

Substituídos pelo IP da Brasil Cloud.

#### E-mail (ProEmail) — recriar sem alterar nada ✅

| Nome | Tipo | Valor |
|---|---|---|
| `@` | MX | `50 mail-ag-br1-15.proemail.cloud` |
| `activesync` | CNAME | `mail-ag-br1-15.proemail.cloud` |
| `autodiscover` | CNAME | `mail-ag-br1-15.proemail.cloud` |
| `dav` | CNAME | `mail-ag-br1-15.proemail.cloud` |
| `imap` | CNAME | `mail-ag-br1-15.proemail.cloud` |
| `pop3` | CNAME | `mail-ag-br1-15.proemail.cloud` |
| `smtp` | CNAME | `mail-ag-br1-15.proemail.cloud` |
| `webmail` | CNAME | `mail-ag-br1-15.proemail.cloud` |

São oito registros. Se faltar um, o sintoma costuma ser específico: sem `smtp`
ninguém envia, sem `imap`/`pop3` ninguém recebe no aplicativo, sem `autodiscover`
o Outlook não configura conta sozinho, sem `webmail` o acesso pelo navegador cai.

#### Marketing — recriar ✅

| Nome | Tipo | Valor |
|---|---|---|
| `lp` | CNAME | `2f919ab7-06d4-4d6a-8a5c-8c0bd09ab4bc.unbouncepages.com` |
| `@` | TXT | `GOOGLE-SITE-VERIFICATION=AXRISZZIR2KDYXBRG-2WXZFN0CQQSPK52CECZ4AZJNC` |

> **O `lp` são as landing pages da Unbounce.** Se existir campanha paga apontando
> para `lp.populardaconstrucao.com.br`, cada clique vira erro no dia em que esse
> registro sumir — e a verba continua sendo gasta. Confirme com o marketing se a
> conta Unbounce ainda está ativa **antes** de migrar: se estiver, recrie o CNAME;
> se não estiver, aproveite e cancele a assinatura.

#### SPF — recriar corrigido ⚠️

| Nome | Tipo | Valor |
|---|---|---|
| `@` | TXT | `v=spf1 a mx include:spf.proemail.com.br include:spf.antispamcloud.com -all` |
| `@` | TXT | `v=spf1 ip4:177.131.140.165 ip4:177.131.140.115 ip4:189.112.7.207 +a +mx ~all` |

Os dois viram **um só** — ver 3.3.

#### O que não existe hoje

Confirmado no painel: **não há DKIM, DMARC nem CAA.**

Não há nada a preservar, mas vale corrigir depois que o domínio estiver no lugar
definitivo. Sem DKIM e sem DMARC, qualquer pessoa consegue enviar e-mail se passando
por `@populardaconstrucao.com.br`, e os e-mails legítimos de vocês têm mais chance de
cair em spam. Peça a chave DKIM à ProEmail e publique, junto com um DMARC começando
em modo de observação:

```
_dmarc   TXT   v=DMARC1; p=none; rua=mailto:analisedados@populardaconstrucao.com.br
```

Depois de algumas semanas lendo os relatórios, suba para `p=quarantine`.
Isso é melhoria, não pré-requisito da migração — faça depois, com calma.

### 3.3 — Um problema para corrigir na passagem

O domínio tem **dois registros SPF**. Isso viola a RFC 7208: quando um servidor de
destino encontra mais de um SPF, o resultado é `permerror` e a validação simplesmente
falha — na prática é como não ter SPF nenhum, o que prejudica a entrega dos e-mails.

Aproveite a migração e publique **um único** SPF, unindo os dois:

```
v=spf1 a mx ip4:177.131.140.165 ip4:177.131.140.115 ip4:189.112.7.207 include:spf.proemail.com.br include:spf.antispamcloud.com -all
```

> Confirme com a ProEmail se aqueles três IPs ainda são usados por vocês. Se não forem
> mais, tire-os — SPF com IP velho é porta aberta para falsificação.

### 3.4 — Dois caminhos: escolha o de duas etapas

O painel do Wix permite **editar os registros A** do domínio. Isso abre um caminho
bem menos arriscado do que trocar tudo de uma vez.

#### Caminho A — Duas etapas (recomendado)

Separa a migração do site da migração do DNS. Cada etapa é pequena e reversível.

**Etapa A1 — vira só o site, dentro do próprio Wix.**
Em **Gerenciar registros DNS**, edite os três registros A trocando
`185.230.63.107/171/186` pelo IP da Brasil Cloud (deixe **um só** registro A), e o
CNAME de `www` para o endereço da Brasil Cloud.

- O site novo entra no ar
- **O e-mail não é tocado** — MX, SPF e os oito CNAMEs da ProEmail ficam parados
- **As landing pages da Unbounce (`lp`) também não são tocadas**
- Se algo der errado, você devolve os três IPs do Wix e volta em minutos

**Etapa A2 — sai do Wix de vez (uma ou duas semanas depois).**
Com o site validado, monte a zona completa no destino definitivo, troque os
servidores de nomes no Registro.br e só então remova o domínio do Wix.

> **Condição:** a etapa A1 exige manter o plano Premium do Wix ativo, porque é ele que
> mantém a zona DNS no ar. É um mês a mais de assinatura em troca de separar os riscos —
> vale a pena.
>
> **Atenção:** o Wix vai passar a marcar o domínio como "não conectado corretamente",
> já que os registros A não apontam mais para os servidores dele. Isso é esperado.
> Não aceite nenhuma oferta do painel para "corrigir" ou "reconectar" o domínio — ela
> devolveria os IPs do Wix e derrubaria o site novo.

#### Caminho B — Uma etapa só

Monta a zona inteira no destino novo e troca os servidores de nomes de uma vez.
Menos passos, porém o e-mail da empresa entra no risco junto com o site. Só escolha
este se a etapa A1 não for possível.

### 3.5 — Onde hospedar a zona definitiva

O Wix deixa de ser uma opção assim que o site sair de lá. Escolha um destino:

| Opção | Servidores de nomes | Comentário |
|---|---|---|
| **Brasil Cloud** (recomendado) | `ns1.brasilwork.com.br`<br>`ns2.brasilwork.com.br`<br>`ns3.brasilwork.net` | Tudo no mesmo fornecedor do site; o suporte deles consegue ajudar |
| **Registro.br** | usar a zona própria do Registro.br | Grátis e neutro; se um dia trocar de hospedagem, o DNS não se move |
| **Cloudflare** | os que o Cloudflare gerar | Grátis, painel melhor, mas é mais um serviço para administrar |

### 3.6 — A sequência correta (caminho B, ou etapa A2)

A ordem aqui não é sugestão. Trocar os servidores de nomes antes de a zona nova estar
pronta derruba o e-mail da empresa.

**1. Fotografe a zona atual no Wix.**
No menu do domínio: **Gerenciar registros DNS** e **Manage MX records**. Tire print de
tudo. É a única forma de ver registros que a consulta externa não mostra.

**2. Monte a zona completa no destino escolhido — sem trocar nada ainda.**
Crie todos os registros da tabela 3.2 marcados com ✅, mais:

```
@      A       <IP-DA-BRASIL-CLOUD>
www    A       <IP-DA-BRASIL-CLOUD>
```

Use TTL 300 em tudo, por enquanto.

**3. Confira a zona nova antes de publicar.**
Consulte os servidores novos diretamente, sem esperar propagação:

```bash
dig MX populardaconstrucao.com.br @ns1.brasilwork.com.br
dig A  populardaconstrucao.com.br @ns1.brasilwork.com.br
dig TXT populardaconstrucao.com.br @ns1.brasilwork.com.br
```

O MX tem que responder `mail-ag-br1-15.proemail.cloud`. Se não responder, **pare** e
corrija antes de seguir.

**4. Suba o site na Brasil Cloud e teste no endereço temporário.**

**5. Troque os servidores de nomes no Registro.br.**
<https://registro.br> → **populardaconstrucao.com.br** → **DNS** → substitua
`ns4.wixdns.net` e `ns5.wixdns.net` pelos do destino escolhido.

A propagação leva de 30 minutos a 24 horas. Durante esse período parte do mundo ainda
enxerga a zona do Wix — por isso o site antigo precisa continuar no ar.

**6. Emita o SSL** no painel da Brasil Cloud, para `populardaconstrucao.com.br` **e**
`www.populardaconstrucao.com.br`. Só funciona depois que o DNS já aponta para lá.

**7. Ligue a variável `CANONICAL_HOST`** e reinicie a aplicação.

**8. Espere uma semana.** Só então volte ao Wix e use **Remover do Wix**.

### 3.7 — O que NÃO fazer agora no painel do Wix

Enquanto os passos 1 a 7 não terminarem, no menu do domínio:

- ❌ **Remover do Wix** — apaga a zona DNS inteira. Site e e-mail caem na hora.
- ❌ **Desatribuir deste site** — desconecta o domínio do site publicado.
- ❌ **Transferir para Wix** — traria o registro do domínio para dentro do Wix, o
  oposto do que vocês querem.
- ✅ **Gerenciar registros DNS** e **Manage MX records** — pode abrir à vontade,
  desde que seja só para olhar e printar.

Nada do que existe nesse menu move o domínio para a Brasil Cloud. A troca acontece
no **Registro.br**, e só depois que a zona nova estiver pronta e conferida.

### 3.8 — Rollback

Se algo quebrar, volte os servidores de nomes no Registro.br para `ns4.wixdns.net` e
`ns5.wixdns.net`. Enquanto o domínio não tiver sido removido do Wix, a zona antiga
continua lá intacta e tudo volta ao ar.

É exatamente por isso que o Wix só é cancelado no passo 8.

---

## Etapa 4 — Checklist depois da migração

- [ ] `https://populardaconstrucao.com.br` abre e redireciona para `www`
- [ ] `https://www.populardaconstrucao.com.br` abre com cadeado válido
- [ ] `http://` redireciona para `https://`
- [ ] O site abre no celular (é onde está a maior parte do tráfego)
- [ ] "Aberto até 18h" no topo mostra o horário correto
- [ ] Os botões de WhatsApp abrem a conversa com a loja certa
- [ ] "Como chegar" abre o Google Maps na unidade certa
- [ ] Os botões do app abrem a Google Play e a App Store
- [ ] **E-mail `@populardaconstrucao.com.br` continua entrando e saindo** (teste os dois sentidos, com uma conta de fora)
- [ ] `webmail.populardaconstrucao.com.br` continua abrindo
- [ ] Outlook/celular continuam sincronizando (testa `imap`, `smtp` e `autodiscover` de uma vez)
- [ ] `lp.populardaconstrucao.com.br` continua servindo as landing pages da Unbounce
- [ ] SPF agora responde um único registro (`dig TXT populardaconstrucao.com.br`)
- [ ] Google Search Console: reenviar `https://www.populardaconstrucao.com.br/sitemap.xml`

### Rollback

Volte os servidores de nomes no Registro.br para `ns4.wixdns.net` e `ns5.wixdns.net`.
Enquanto o domínio não for removido do Wix, a zona antiga continua intacta lá.

---

## Atualizar o site depois

Qualquer alteração vira um commit:

```bash
git add .
git commit -m "Descrição da alteração"
git push
```

A Brasil Cloud detecta o push no `main` e refaz o deploy sozinho.

---

## Rodar na sua máquina

```bash
npm install
npm run dev     # http://localhost:3000, recarrega ao salvar
```

---

## Observações técnicas

- **Node 22.21.0** está fixado no `.nvmrc`. O painel da Brasil Cloud lista versões
  até a 22 — a 24 não é oferecida. O `package.json` aceita qualquer `22.x`, então
  vale atualizar para o patch mais recente da série 22 (hoje a 22.23.2) quando
  possível, por causa das correções de segurança.
- **`trust proxy`** está ligado no `server.js` porque a aplicação roda atrás do NGINX
  da Brasil Cloud. Sem isso o redirecionamento de HTTPS entraria em loop.
- **CSP** está configurada para permitir apenas os próprios arquivos e o Google Fonts.
  Se um dia entrar Google Analytics, Meta Pixel ou chat, os domínios precisam ser
  liberados em `scriptSrc` / `connectSrc` no `server.js`.
- **Sem banco de dados.** O horário de funcionamento é calculado no navegador a
  partir do fuso `America/Sao_Paulo`.
