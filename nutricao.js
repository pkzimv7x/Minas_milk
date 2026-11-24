/* ==========================================================
   Minas Milk - informação nutricional por produto
   Cada chave é o data-id do card (veja index.html).
   Produto sem entrada aqui mostra "Tabela em atualização".

   Para preencher um produto, copie a tabela da embalagem:
   'queijo-minas-padrao': {
     porcao: 'Porção 30 g (1 fatia)',
     linhas: [
       ['Valor Energético', '90 Kcal = 380 kj', '5%'],
       ['Carboidratos', '1,0 g', '0%'],
       ...
     ],
     notas: '(*) Valores diários de referência ...',
     ingredientes: '...',
     alergenicos: '...'
   }

   ORIGEM: tabelas do site oficial (minasmilk.com.br/produto/...),
   conferidas em 23/11/2026.

   ATENÇÃO: no site oficial, TODAS as páginas de produto (queijos,
   requeijões, bebidas e doces) trazem esta mesma tabela, com porção
   de "1 colher de sopa" e ingredientes "leite padronizado, açúcar,
   bicarbonato de sódio e sorbato de potássio". Ela é coerente só
   para o doce de leite, por isso só os doces a usam aqui. Para os
   outros produtos, use a tabela impressa na embalagem.
   ========================================================== */
(function () {
  'use strict';

  var TABELA_DOCE_DE_LEITE = {
    porcao: 'Porção 20 g (1 colher sopa)',
    linhas: [
      ['Valor Energético', '62 Kcal = 260 kj', '3%'],
      ['Carboidratos', '10 g', '3%'],
      ['Proteínas', '1,0 g', '1%'],
      ['Gorduras totais', '2,0 g', '4%'],
      ['Gorduras Saturadas', '1,0 g', '5%'],
      ['Gorduras Trans', '0', '**'],
      ['Fibra Alimentar', '0', '0'],
      ['Sódio', '20 mg', '1%']
    ],
    notas: '(*) Valores diários de referência com base em uma dieta de 2000 kcal ou 8400 KJ. Seus valores diários podem ser maiores ou menores dependendo de suas necessidades energéticas. (**) VD não estabelecido.',
    ingredientes: 'leite padronizado, açúcar, bicarbonato de sódio e conservador sorbato de potássio.',
    alergenicos: 'CONTÉM LEITE. CONTÉM LACTOSE. NÃO CONTÉM GLÚTEN.'
  };

  // Como no site oficial: a mesma tabela em todos os produtos.
  // Para trocar a de um produto, coloque a entrada dele aqui, por exemplo:
  // 'queijo-minas-padrao': { porcao: ..., linhas: [...], notas: ..., ingredientes: ..., alergenicos: ... }
  var NUTRICAO = {};

  function el(tag, cls, text) {
    var e = document.createElement(tag);
    if (cls) { e.className = cls; }
    if (text != null) { e.textContent = text; }
    return e;
  }

  var dlg = el('dialog', 'nutri-dialog');
  dlg.setAttribute('aria-labelledby', 'nutri-title');
  document.body.appendChild(dlg);
  dlg.addEventListener('click', function (ev) { if (ev.target === dlg) { dlg.close(); } });

  function open(name, data) {
    dlg.textContent = '';
    var head = el('div', 'nutri-head');
    var title = el('h3', 'nutri-title', name); title.id = 'nutri-title';
    var close = el('button', 'nutri-close', 'Fechar'); close.type = 'button';
    close.addEventListener('click', function () { dlg.close(); });
    head.appendChild(title); head.appendChild(close); dlg.appendChild(head);

    if (!data) {
      dlg.appendChild(el('p', 'nutri-empty', 'A tabela nutricional deste produto está em atualização. Enquanto isso, consulte a embalagem do produto.'));
    } else {
      var t = el('table', 'nutri-table');
      var cap = el('caption', null, 'Informação Nutricional'); t.appendChild(cap);
      var thead = el('thead'); var hr = el('tr');
      [data.porcao, 'Quantidade por porção', '%VD(*)'].forEach(function (h) { var th = el('th', null, h); th.scope = 'col'; hr.appendChild(th); });
      thead.appendChild(hr); t.appendChild(thead);
      var tb = el('tbody');
      data.linhas.forEach(function (l) {
        var tr = el('tr'); var th = el('th', null, l[0]); th.scope = 'row'; tr.appendChild(th);
        tr.appendChild(el('td', null, l[1])); tr.appendChild(el('td', null, l[2])); tb.appendChild(tr);
      });
      t.appendChild(tb);
      var wrap = el('div', 'nutri-scroll'); wrap.appendChild(t); dlg.appendChild(wrap);
      dlg.appendChild(el('p', 'nutri-note', data.notas));
      var p1 = el('p', 'nutri-note'); var b1 = el('strong', null, 'Ingredientes: '); p1.appendChild(b1); p1.appendChild(document.createTextNode(data.ingredientes)); dlg.appendChild(p1);
      var p2 = el('p', 'nutri-note'); var b2 = el('strong', null, 'Alergênicos: '); p2.appendChild(b2); p2.appendChild(document.createTextNode(data.alergenicos)); dlg.appendChild(p2);
    }
    if (typeof dlg.showModal === 'function') { dlg.showModal(); } else { dlg.setAttribute('open', ''); }
  }

  Array.prototype.forEach.call(document.querySelectorAll('.card[data-id]'), function (card) {
    var body = card.querySelector('.card-body'); if (!body) { return; }
    
    var btn = el('button', 'nutri-btn', 'Informação nutricional'); btn.type = 'button';
    btn.addEventListener('click', function () { var id = card.getAttribute('data-id'), name = card.getAttribute('data-name') || 'Produto'; open(name, NUTRICAO[id] || TABELA_DOCE_DE_LEITE); });
    body.appendChild(btn);
  });
}());
