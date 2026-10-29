/* ============================================================
   CONFIGURAÇÃO — edite aqui
   Cada item: code, nome, preco, imagem (caminho/URL), categoria (opcional)
   Fotos na pasta imagens/ ao lado deste arquivo.
   ============================================================ */
const MOEDA = "R$";
const TITULO_PDF = "Catálogo";
const MEUS_ITENS = [
  
];
/* ============================================================ */

/* CATEGORIAS: [nome da categoria, lista de itens do arquivo .js]
   Para criar uma nova: crie o arquivo produtos-xxx.js, carregue no index.html
   e acrescente uma linha aqui. */
const CATALOGOS = [
  ["Roland",  typeof ITENS_ROLAND  !== "undefined" ? ITENS_ROLAND  : []],
  ["Epson",   typeof ITENS_EPSON   !== "undefined" ? ITENS_EPSON   : []],
  ["Chinesa", typeof ITENS_CHINESA !== "undefined" ? ITENS_CHINESA : []],
];

/* Junta tudo: MEUS_ITENS + cada catálogo com a sua categoria.
   Se o item tiver o próprio campo "categoria", ele vale mais que o do catálogo. */
const ITENS = MEUS_ITENS
  .concat(...CATALOGOS.map(([cat, lista]) => lista.map(i => Object.assign({ categoria: cat }, i))))
  .map((i, n) => Object.assign({ code: "", compat: "", categoria: "Outros" }, i, { id: String(n) }));
const CATS = [...new Set(CATALOGOS.map(c => c[0]).concat(ITENS.map(i => i.categoria)))]
  .filter(c => ITENS.some(i => i.categoria === c));
let catAtiva = "Todas";

const $ = id => document.getElementById(id);
const grid = $("grid"), input = $("codigo");
const norm = s => String(s).trim().toLowerCase().replace(/\s+/g,"");
const fmt = n => Number(n).toLocaleString("pt-BR",{minimumFractionDigits:2,maximumFractionDigits:2});
const esc = s => String(s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const PH = "data:image/svg+xml;utf8," + encodeURIComponent(
 `<svg xmlns='http://www.w3.org/2000/svg' width='400' height='400'><rect width='400' height='400' fill='#0d2d5e'/><text x='200' y='205' font-family='sans-serif' font-size='20' fill='rgba(255,255,255,.5)' text-anchor='middle'>Sem imagem</text></svg>`);
const IMG_ERR = `onerror="this.onerror=null;this.src='${PH}'"`;

/* selecionados: Map id -> quantidade (item só entra no Map quando qtd >= 1) */
const selecionados = new Map();
let exibidos = ITENS.slice();

const qtdDe = id => selecionados.get(id) || 0;

function atualizaBarra(){
  let un = 0;
  selecionados.forEach(q => un += q);
  $("qtd").textContent = selecionados.size;
  $("qtdTotal").textContent = un;
  $("pdf").disabled = selecionados.size === 0;
}

function render(){
  if(!exibidos.length){
    grid.innerHTML = `<div class="empty"><div class="display">Nenhum código <b>encontrado</b></div><p>Confira o código digitado ou clique em "Ver todos".</p></div>`;
    return;
  }
  grid.innerHTML = exibidos.map(i => {
    const q = qtdDe(i.id);
    const sel = q > 0;
    return `
    <article class="item ${sel?'sel':''}" data-code="${i.id}">
      <label class="chk" title="Selecionar item">
        <input type="checkbox" ${sel?'checked':''} aria-label="Selecionar ${esc(i.nome)}">
        <span></span>
      </label>
      <div class="pic"><img src="${esc(i.imagem)}" alt="${esc(i.nome)}" loading="lazy" ${IMG_ERR}></div>
      <div class="body">
        <div class="tag">${i.code ? esc(i.code) : "Sob consulta"}</div>
        ${CATS.length > 1 ? `<div class="cat">${esc(i.categoria)}</div>` : ""}
        <h3 class="display">${esc(i.nome)}</h3>
        ${i.compat ? `<p class="compat" title="${esc(i.compat)}"><b>Compatível:</b> ${esc(i.compat)}</p>` : ""}
        <div class="price"><small>${MOEDA}</small>${fmt(i.preco)}</div>
        <div class="qty">
          <button type="button" data-act="menos" aria-label="Diminuir quantidade" ${q<=0?'disabled':''}>−</button>
          <input type="number" min="0" max="999" step="1" value="${q}" inputmode="numeric" aria-label="Quantidade de ${esc(i.nome)}">
          <button type="button" data-act="mais" aria-label="Aumentar quantidade">+</button>
          ${q>0 ? `<span class="sub">${MOEDA} ${fmt(Number(i.preco)*q)}</span>` : ``}
        </div>
      </div>
    </article>`;
  }).join("");
}

/* aplica quantidade e sincroniza card + barra */
function setQtd(id, q){
  q = Math.max(0, Math.min(999, Math.floor(Number(q) || 0)));
  q > 0 ? selecionados.set(id, q) : selecionados.delete(id);
  const el = grid.querySelector(`[data-code="${CSS.escape(id)}"]`);
  if(el){
    const on = q > 0;
    el.classList.toggle("sel", on);
    el.querySelector(".chk input").checked = on;
    el.querySelector(".qty input").value = q;
    el.querySelector('[data-act="menos"]').disabled = !on;
    const item = ITENS.find(i => i.id === id);
    let sub = el.querySelector(".qty .sub");
    if(on && item){
      if(!sub){ sub = document.createElement("span"); sub.className = "sub"; el.querySelector(".qty").appendChild(sub); }
      sub.textContent = `${MOEDA} ${fmt(Number(item.preco)*q)}`;
    } else if(sub){ sub.remove(); }
  }
  atualizaBarra();
}

/* clique no card / checkbox / botões de quantidade */
grid.addEventListener("click", e => {
  const card = e.target.closest(".item"); if(!card) return;
  const id = card.dataset.code;

  const qbtn = e.target.closest("[data-act]");
  if(qbtn){
    e.stopPropagation();
    const cur = qtdDe(id);
    setQtd(id, qbtn.dataset.act === "mais" ? cur + 1 : cur - 1);
    return;
  }

  const box = card.querySelector(".chk input");
  if(e.target === box){
    box.checked ? selecionados.set(id, qtdDe(id) || 1) : selecionados.delete(id);
    setQtd(id, box.checked ? (qtdDe(id) || 1) : 0);
    return;
  }
  if(e.target.closest(".chk")) return;          // label do checkbox cuida sozinho
  if(e.target.closest(".qty")) return;          // digitar no input não alterna

  setQtd(id, qtdDe(id) > 0 ? 0 : 1);            // clique no card alterna
});

/* digitar quantidade direto no input */
grid.addEventListener("input", e => {
  const qi = e.target.closest(".qty input"); if(!qi) return;
  const card = qi.closest(".item");
  const v = qi.value.replace(/\D/g, "");
  qi.value = v;
  const id = card.dataset.code;
  v === "" ? selecionados.delete(id) : setQtd(id, Number(v));
  atualizaBarra();
});
grid.addEventListener("change", e => {
  const qi = e.target.closest(".qty input"); if(!qi) return;
  if(qi.value === "" || Number(qi.value) === 0) setQtd(qi.closest(".item").dataset.code, 0);
});

/* filtro = categoria ativa + texto da busca (código, nome, compatibilidade ou categoria) */
function filtrar(){
  const q = norm(input.value);
  exibidos = ITENS.filter(i =>
    (catAtiva === "Todas" || i.categoria === catAtiva) &&
    (!q || [i.code, i.nome, i.compat, i.categoria].some(t => norm(t || "").includes(q))));
  render();
}
const buscar = filtrar;
function verTodos(){ input.value = ""; catAtiva = "Todas"; renderCats(); filtrar(); }

/* botões de categoria (só aparecem quando há 2 ou mais categorias com itens) */
function renderCats(){
  const box = $("cats");
  if(CATS.length < 2){ box.hidden = true; return; }
  box.hidden = false;
  const chip = (nome, n) => `<button type="button" data-cat="${esc(nome)}" class="${nome === catAtiva ? "on" : ""}" aria-pressed="${nome === catAtiva}">${esc(nome)}<b>${n}</b></button>`;
  box.innerHTML = chip("Todas", ITENS.length) + CATS.map(c => chip(c, ITENS.filter(i => i.categoria === c).length)).join("");
}
$("cats").addEventListener("click", e => {
  const b = e.target.closest("[data-cat]"); if(!b) return;
  catAtiva = b.dataset.cat; renderCats(); filtrar();
});

$("buscar").addEventListener("click", buscar);
$("limpar").addEventListener("click", verTodos);
input.addEventListener("keydown", e => { if(e.key==="Enter") buscar(); });
$("todos").addEventListener("click", () => { exibidos.forEach(i => { if(!selecionados.has(i.id)) selecionados.set(i.id, 1); }); render(); atualizaBarra(); });
$("nenhum").addEventListener("click", () => { selecionados.clear(); render(); atualizaBarra(); });

/* PDF: monta a folha só com os itens marcados e abre "Salvar como PDF" */
$("pdf").addEventListener("click", () => {
  const lista = ITENS.filter(i => selecionados.has(i.id))
    .map(i => ({ item: i, qtd: selecionados.get(i.id), sub: Number(i.preco) * selecionados.get(i.id) }));
  if(!lista.length) return;
  const total = lista.reduce((s, x) => s + x.sub, 0);
  const unidades = lista.reduce((s, x) => s + x.qtd, 0);
  const data = new Date().toLocaleDateString("pt-BR");
  $("print").innerHTML = `
    <div class="ph"><div class="t">${esc(TITULO_PDF)}</div><div class="d">${data} · ${lista.length} item(ns) · ${unidades} unidade(s)</div></div>
    ${lista.map(({item:i, qtd, sub}) => `
      <div class="row">
        <img src="${esc(i.imagem)}" alt="" ${IMG_ERR}>
        <div class="n">
          <div class="c">Código: ${i.code ? esc(i.code) : "Sob consulta"}${CATS.length > 1 ? " · " + esc(i.categoria) : ""}</div>
          <div class="nm">${esc(i.nome)}</div>
          ${i.compat ? `<div class="cp">Compatível: ${esc(i.compat)}</div>` : ""}
          <div class="cp">Unitário: ${MOEDA} ${fmt(i.preco)}</div>
        </div>
        <div class="qt"><small>Qtd.</small>${qtd}</div>
        <div class="p">${MOEDA}${fmt(sub)}</div>
      </div>`).join("")}
    <div class="tot"><span>Total (${unidades} un.)</span><b>${MOEDA} ${fmt(total)}</b></div>`;
  const imgs = [...$("print").querySelectorAll("img")];
  Promise.all(imgs.map(im => im.complete ? 0 : new Promise(r => { im.onload = im.onerror = r; })))
    .then(() => window.print());
});

renderCats(); render(); atualizaBarra();
