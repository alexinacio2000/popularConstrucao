(function(){
  "use strict";

  var LOJAS = [
    {
      nome:"Planaltina-GO", tag:"Matriz · desde 2016",
      endereco:"Setor de Mansões Leste, Lote 32 — Setor Leste, Planaltina de Goiás",
      cep:"73.752-400", telefone:"(61) 3639-2097", zap:"556136392097",
      mapa:"https://www.google.com/maps/search/?api=1&query=Popular+da+Constru%C3%A7%C3%A3o+Setor+de+Mans%C3%B5es+Leste+Planaltina+de+Goi%C3%A1s",
      horarios:[
        {rot:"Segunda a sexta", txt:"07h30 – 18h00", dias:[1,2,3,4,5], ini:450, fim:1080},
        {rot:"Sábado", txt:"07h30 – 15h30", dias:[6], ini:450, fim:930},
        {rot:"Domingo", txt:"Fechado", dias:[0], ini:null, fim:null}
      ]
    },
    {
      nome:"Formosa-GO", tag:"Filial · desde 2023",
      endereco:"Avenida Senador Coimbra Bueno, Quadra 131, Lote 01 — Parque da Colina I, Formosa-GO",
      cep:"73.808-044", telefone:"(61) 3838-0041", zap:"556138380041",
      mapa:"https://www.google.com/maps/search/?api=1&query=Popular+da+Constru%C3%A7%C3%A3o+Avenida+Senador+Coimbra+Bueno+Parque+da+Colina+I+Formosa+GO",
      horarios:[
        {rot:"Segunda a sexta", txt:"07h30 – 18h00", dias:[1,2,3,4,5], ini:450, fim:1080},
        {rot:"Sábado", txt:"08h00 – 12h00", dias:[6], ini:480, fim:720},
        {rot:"Domingo", txt:"Fechado", dias:[0], ini:null, fim:null}
      ]
    }
  ];

  function agora(){
    var f = new Intl.DateTimeFormat("pt-BR",{timeZone:"America/Sao_Paulo",hour:"2-digit",minute:"2-digit",weekday:"short",hour12:false});
    var p={}; f.formatToParts(new Date()).forEach(function(x){p[x.type]=x.value;});
    var mapa={dom:0,seg:1,ter:2,qua:3,qui:4,sex:5,"sáb":6,sab:6};
    var k=(p.weekday||"").toLowerCase().replace(/\./g,"").slice(0,3);
    return {dia:mapa[k], min:parseInt(p.hour,10)*60+parseInt(p.minute,10)};
  }
  function hm(m){var h=Math.floor(m/60),mm=m%60;return (h<10?"0":"")+h+"h"+(mm?(mm<10?"0":"")+mm:"");}
  function estado(l){
    var t=agora(), faixa=null;
    l.horarios.forEach(function(h){ if(h.dias.indexOf(t.dia)>-1) faixa=h; });
    if(!faixa||faixa.ini===null) return {aberto:false,texto:"Fechado agora"};
    if(t.min<faixa.ini) return {aberto:false,texto:"Abre às "+hm(faixa.ini)};
    if(t.min>=faixa.fim) return {aberto:false,texto:"Fechado agora"};
    return {aberto:true,texto:"Aberto até "+hm(faixa.fim)};
  }

  var iZap='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 11.5a8.4 8.4 0 0 1-12.1 7.5L3 21l2-5.8A8.4 8.4 0 1 1 21 11.5z"/></svg>';
  var iMapa='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0z"/><circle cx="12" cy="10" r="2.8"/></svg>';

  document.getElementById("unidades-grid").innerHTML = LOJAS.map(function(l){
    var e = estado(l);
    return '<article class="unidade">'
      + '<div class="uni-cab"><div><h3>'+l.nome+'</h3><p>'+l.tag+'</p></div>'
      + '<span class="pill" data-estado="'+(e.aberto?"aberto":"fechado")+'"><i></i>'+e.texto+'</span></div>'
      + '<p class="uni-end">'+l.endereco+'<br>CEP '+l.cep+'<br><a href="tel:+'+l.zap+'">'+l.telefone+'</a></p>'
      + '<div class="uni-hor">'+l.horarios.map(function(h){return '<div><span>'+h.rot+'</span><span>'+h.txt+'</span></div>';}).join("")+'</div>'
      + '<div class="uni-acoes">'
      + '<a class="btn btn-cheio" href="https://wa.me/'+l.zap+'" target="_blank" rel="noopener">'+iZap+'Falar com a loja</a>'
      + '<a class="btn btn-linha" href="'+l.mapa+'" target="_blank" rel="noopener">'+iMapa+'Como chegar</a>'
      + '</div></article>';
  }).join("");

  var e0 = estado(LOJAS[0]);
  var pill = document.getElementById("pill");
  pill.setAttribute("data-estado", e0.aberto ? "aberto" : "fechado");
  document.getElementById("pillTxt").textContent = e0.texto;

  /* ============================================================
     Eventos para o Google Tag Manager (dataLayer)
     Cada clique que importa vira um evento nomeado. No GTM, crie
     um acionador "Evento personalizado" com o nome exato e ligue
     na sua conversão do Google Ads.

       clique_whatsapp      { loja, origem }
       clique_rede_social   { rede, origem }
       clique_como_chegar   { loja }
       clique_telefone      { loja }
       clique_baixar_app    { plataforma }

     ============================================================ */

  var PORZAP = {};
  LOJAS.forEach(function (l) { PORZAP[l.zap] = l.nome; });

  function rastrear(evento, dados) {
    window.dataLayer = window.dataLayer || [];
    var carga = { event: evento };
    for (var k in dados) { if (dados[k]) carga[k] = dados[k]; }
    window.dataLayer.push(carga);
  }

  function ondeEsta(el) {
    if (el.closest(".barra")) return "barra_fixa";
    if (el.closest("footer")) return "rodape";
    if (el.closest(".unidade")) return "card_da_unidade";
    if (el.closest(".club")) return "secao_app";
    if (el.closest("header")) return "topo";
    return "pagina";
  }

  function lojaDoCard(el) {
    var card = el.closest(".unidade");
    var h = card && card.querySelector("h3");
    return h ? h.textContent.trim() : "";
  }

  document.addEventListener("click", function (ev) {
    var a = ev.target.closest && ev.target.closest("a[href]");
    if (!a) return;

    var href = a.getAttribute("href") || "";
    var origem = ondeEsta(a);

    if (href.indexOf("wa.me/") > -1) {
      var num = (href.match(/wa\.me\/(\d+)/) || [])[1];
      rastrear("clique_whatsapp", { loja: PORZAP[num] || lojaDoCard(a) || "nao_identificada", origem: origem });

    } else if (href.indexOf("instagram.com") > -1) {
      rastrear("clique_rede_social", { rede: "instagram", origem: origem });

    } else if (href.indexOf("facebook.com") > -1) {
      rastrear("clique_rede_social", { rede: "facebook", origem: origem });

    } else if (href.indexOf("google.com/maps") > -1) {
      rastrear("clique_como_chegar", { loja: lojaDoCard(a) || "nao_identificada" });

    } else if (href.indexOf("tel:") === 0) {
      var tel = href.replace("tel:+", "");
      rastrear("clique_telefone", { loja: PORZAP[tel] || lojaDoCard(a) || "nao_identificada", origem: origem });

    } else if (href.indexOf("play.google.com") > -1) {
      rastrear("clique_baixar_app", { plataforma: "google_play" });

    } else if (href.indexOf("apps.apple.com") > -1) {
      rastrear("clique_baixar_app", { plataforma: "app_store" });
    }
  });
})();
