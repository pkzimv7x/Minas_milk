/* ==========================================================
   Minas Milk - tamanhos das bebidas lácteas
   Um card por sabor; os botões de tamanho trocam a foto, o
   rótulo e o item que vai para o orçamento.

   Tamanhos confirmados pelo responsável pelo site: todos os sabores
   vêm em 120 g (mamuchinha), 180 g, 500 g, 900 g e 1 kg.
   Onde falta a foto do tamanho (null), o card mostra a foto de 900 g
   sem aviso. Ao salvar a foto em assets/img/produtos/,
   troque o null pelo nome do arquivo.
   Atenção: as fotos "pequena" e "grande" do site oficial foram
   associadas a 180 g e 500 g por dedução. Confirme com a empresa.
   Para incluir um tamanho novo, adicione uma linha em TAMANHOS
   e salve a foto em assets/img/produtos/.
   ========================================================== */
(function () {
  'use strict';
  var P = 'assets/img/produtos/';
  // [tamanho, foto do tamanho ou null quando ainda não há foto dele]
  var TAMANHOS = {
    morango: [
      ['120 g', 'bebida-lactea-morango-garrafa.jpg'],
      ['180 g', 'bebida-lactea-morango-pequeno.jpg'],
      ['500 g', 'bebida-lactea-morango-grande.jpg'],
      ['900 g', 'bebida-lactea-morango-900g.jpg'],
      ['1 kg', 'bebida-lactea-morango-1kg.jpg']
    ],
    coco: [
      ['120 g', 'bebida-lactea-coco-garrafa.jpg'],
      ['180 g', 'bebida-lactea-coco-pequeno.jpg'],
      ['500 g', 'bebida-lactea-coco-grande.jpg'],
      ['900 g', 'bebida-lactea-coco-900g.jpg'],
      ['1 kg', null]
    ],
    'pêssego': [
      ['120 g', 'bebida-lactea-pessego-garrafa.jpg'],
      ['180 g', null],
      ['500 g', 'bebida-lactea-pessego-grande.jpg'],
      ['900 g', 'bebida-lactea-pessego-900g.jpg'],
      ['1 kg', null]
    ],
    'açaí com guaraná': [
      ['120 g', null],
      ['180 g', null],
      ['500 g', null],
      ['900 g', 'bebida-lactea-fermentada-com-polpa-de-fruta-acai-com-guarana.jpg'],
      ['1 kg', null]
    ]
  };
  var PADRAO = '900 g';

  function slug(s) { return s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''); }

  Array.prototype.forEach.call(document.querySelectorAll('.card[data-flavor]'), function (card) {
    var flavor = card.getAttribute('data-flavor');
    var lista = TAMANHOS[flavor]; if (!lista) { return; }
    var base = 'bebida-lactea-' + slug(flavor);
    var img = card.querySelector('.card-media img');
    var tab = card.querySelector('.tab');
    var body = card.querySelector('.card-body');
    var box = document.createElement('div');
    box.className = 'sizes'; box.setAttribute('role', 'group'); box.setAttribute('aria-label', 'Tamanho');
    var botoes = [];

    function escolher(i) {
      var t = lista[i];
      card.dataset.id = base + '-' + slug(t[0]);
      card.dataset.name = 'Bebida láctea de ' + flavor + ' ' + t[0];
      if (tab) { tab.textContent = t[0]; }
      if (img) {
        img.src = P + (t[1] || lista.filter(function (x) { return x[0] === PADRAO; })[0][1]);
        img.alt = card.dataset.name + ', produto Minas Milk';
      }
      botoes.forEach(function (b, k) { b.setAttribute('aria-pressed', String(k === i)); });
      document.dispatchEvent(new CustomEvent('mm:card-change'));
    }

    lista.forEach(function (t, i) {
      var b = document.createElement('button');
      b.type = 'button'; b.className = 'size-btn'; b.textContent = t[0];
      b.addEventListener('click', function () { escolher(i); });
      botoes.push(b); box.appendChild(b);
    });

    var ref = body.querySelector('p');
    if (ref && ref.nextSibling) { body.insertBefore(box, ref.nextSibling); } else { body.appendChild(box); }
    var ini = 0; lista.forEach(function (t, i) { if (t[0] === PADRAO) { ini = i; } });
    escolher(ini);
  });
}());
