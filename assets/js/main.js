/* ER Odontologia Avancada
   Sem biblioteca e sem listener de scroll: IntersectionObserver, eventos de
   ponteiro e CSS. */
(function () {
  "use strict";

  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- 1. Revelacoes de entrada ---------- */
  var pending = Array.prototype.slice.call(
    document.querySelectorAll(".reveal, .reveal-l, .reveal-r")
  );
  var io = null;

  function show(el) {
    el.classList.add("in");
    if (io) io.unobserve(el);
  }

  /* Varredura de seguranca: numa rolagem rapida o observer pode nao reportar
     um elemento que atravessou a tela entre dois quadros. */
  function sweep() {
    var limite = window.innerHeight * 0.92;
    pending = pending.filter(function (el) {
      if (el.classList.contains("in")) return false;
      if (el.getBoundingClientRect().top < limite) { show(el); return false; }
      return true;
    });
  }

  if (reduce || !("IntersectionObserver" in window)) {
    pending.forEach(function (el) { el.classList.add("in"); });
    pending = [];
  } else {
    io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) { if (entry.isIntersecting) show(entry.target); });
      sweep();
    }, { threshold: 0, rootMargin: "0px 0px -8% 0px" });

    pending.forEach(function (el) { io.observe(el); });
    window.addEventListener("load", sweep, { once: true });
    window.addEventListener("hashchange", function () { setTimeout(sweep, 700); });
    setTimeout(sweep, 400);
  }

  /* ---------- 2. Cabecalho ganha fundo depois do topo ---------- */
  var nav = document.getElementById("nav");
  var sentinel = document.getElementById("sentinel");
  if (nav && sentinel && "IntersectionObserver" in window) {
    new IntersectionObserver(function (entries) {
      nav.classList.toggle("is-stuck", !entries[0].isIntersecting);
    }, { rootMargin: "40px 0px 0px 0px" }).observe(sentinel);
  }

  /* ---------- 3. Botao flutuante ---------- */
  var floatBtn = document.getElementById("waFloat");
  if (floatBtn) {
    if (reduce || !("IntersectionObserver" in window) || !sentinel) {
      floatBtn.classList.add("in");
    } else {
      new IntersectionObserver(function (entries) {
        floatBtn.classList.toggle("in", !entries[0].isIntersecting);
      }, { rootMargin: "420px 0px 0px 0px" }).observe(sentinel);
    }
  }

  /* ---------- 4. Link ativo no menu ---------- */
  var links = Array.prototype.slice.call(document.querySelectorAll(".nav-links a"));
  var sections = links
    .map(function (a) { return document.querySelector(a.getAttribute("href")); })
    .filter(Boolean);

  if (sections.length && "IntersectionObserver" in window) {
    var visiveis = [];
    var spy = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        var i = visiveis.indexOf(entry.target);
        if (entry.isIntersecting && i === -1) visiveis.push(entry.target);
        if (!entry.isIntersecting && i > -1) visiveis.splice(i, 1);
      });
      var atual = visiveis.length
        ? visiveis.slice().sort(function (a, b) {
            return a.getBoundingClientRect().top - b.getBoundingClientRect().top;
          })[0].id
        : null;
      links.forEach(function (a) {
        a.classList.toggle("is-active", atual !== null && a.getAttribute("href") === "#" + atual);
      });
    }, { rootMargin: "-45% 0px -50% 0px" });
    sections.forEach(function (s) { spy.observe(s); });
  }

  /* ---------- 5. Menu no celular ---------- */
  var toggle = document.getElementById("navToggle");
  var menu = document.getElementById("navLinks");
  if (toggle && menu) {
    toggle.addEventListener("click", function () {
      var aberto = menu.classList.toggle("open");
      toggle.setAttribute("aria-expanded", String(aberto));
      toggle.textContent = aberto ? "Fechar" : "Menu";
    });
    menu.addEventListener("click", function (e) {
      if (e.target.tagName === "A") {
        menu.classList.remove("open");
        toggle.setAttribute("aria-expanded", "false");
        toggle.textContent = "Menu";
      }
    });
  }

  /* ---------- 6. Contagem dos numeros ----------
     Troca so o texto do elemento, sem criar marcacao interna. */
  if (!reduce && "IntersectionObserver" in window) {
    document.querySelectorAll("[data-count]").forEach(function (el) {
      var bruto = el.getAttribute("data-count");
      var decimal = bruto.indexOf(",") > -1;
      var alvo = parseFloat(bruto.replace(",", "."));
      if (isNaN(alvo)) return;

      var obs = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          obs.unobserve(entry.target);

          var inicio = null;
          var duracao = 1100;
          el.textContent = decimal ? "0,0" : "0";

          function quadro(ts) {
            if (inicio === null) inicio = ts;
            var p = Math.min((ts - inicio) / duracao, 1);
            var suave = 1 - Math.pow(1 - p, 3);
            var v = alvo * suave;
            el.textContent = decimal ? v.toFixed(1).replace(".", ",") : String(Math.round(v));
            if (p < 1) requestAnimationFrame(quadro);
            else el.textContent = bruto;
          }
          requestAnimationFrame(quadro);
        });
      }, { threshold: 0.6 });
      obs.observe(el);
    });
  }

  /* ---------- 7. Comparador antes e depois ----------
     O divisor persegue o cursor com amortecimento, arrasta no celular e tem
     um input range invisivel por cima para navegacao por teclado. */
  document.querySelectorAll("[data-cmp]").forEach(function (cmp) {
    var range = cmp.querySelector("input[type='range']");
    var inicial = range ? Number(range.value) : 52;
    var alvo = inicial;
    var atual = inicial;
    var rodando = false;

    function aplicar(v) { cmp.style.setProperty("--p", v.toFixed(2) + "%"); }
    aplicar(atual);

    function quadro() {
      atual += (alvo - atual) * 0.14;
      aplicar(atual);
      if (Math.abs(alvo - atual) > 0.15) requestAnimationFrame(quadro);
      else { aplicar(alvo); rodando = false; }
    }

    function anima() {
      if (reduce) { atual = alvo; aplicar(alvo); return; }
      if (!rodando) { rodando = true; requestAnimationFrame(quadro); }
    }

    function definir(pct, sincronizar) {
      alvo = Math.max(4, Math.min(96, pct));
      if (sincronizar && range) range.value = String(Math.round(alvo));
      anima();
    }

    function mover(e) {
      var r = cmp.getBoundingClientRect();
      definir(((e.clientX - r.left) / r.width) * 100, true);
    }

    cmp.addEventListener("pointermove", mover);
    cmp.addEventListener("pointerdown", function (e) { cmp.setPointerCapture(e.pointerId); mover(e); });
    cmp.addEventListener("pointerup", function (e) { cmp.releasePointerCapture(e.pointerId); });
    cmp.addEventListener("pointerleave", function () { definir(inicial, true); });
    if (range) range.addEventListener("input", function () { definir(Number(range.value), false); });
  });

  /* ---------- 8. Filtro dos tratamentos ---------- */
  var filtros = document.querySelectorAll(".filters button");
  var cards = document.querySelectorAll(".tcard");
  if (filtros.length && cards.length) {
    filtros.forEach(function (btn) {
      btn.addEventListener("click", function () {
        var cat = btn.getAttribute("data-filter");
        filtros.forEach(function (b) { b.setAttribute("aria-selected", String(b === btn)); });
        cards.forEach(function (card) {
          var mostra = cat === "Todos" || card.getAttribute("data-cat") === cat;
          card.hidden = !mostra;
          if (mostra) card.classList.add("in");
        });
      });
    });
  }

  /* ---------- 9. Perguntas frequentes ---------- */
  var faqs = document.querySelectorAll(".faq-item");
  faqs.forEach(function (item) {
    var botao = item.querySelector("button");
    if (!botao) return;
    botao.addEventListener("click", function () {
      var aberto = item.classList.contains("is-open");
      faqs.forEach(function (outro) {
        outro.classList.remove("is-open");
        var b = outro.querySelector("button");
        if (b) b.setAttribute("aria-expanded", "false");
      });
      if (!aberto) {
        item.classList.add("is-open");
        botao.setAttribute("aria-expanded", "true");
      }
    });
  });

  /* ---------- 10. Formulario que abre o WhatsApp ---------- */
  var form = document.getElementById("waForm");
  if (form) {
    var nota = document.getElementById("formNote");
    var nome = document.getElementById("nome");

    form.addEventListener("submit", function (e) {
      e.preventDefault();

      if (!nome.value.trim()) {
        nome.focus();
        nome.style.borderColor = "#B4553A";
        if (nota) { nota.textContent = "Escreva seu nome para continuar."; nota.style.color = "#B4553A"; }
        return;
      }

      nome.style.borderColor = "";
      if (nota) { nota.textContent = "Abrindo o WhatsApp com sua mensagem."; nota.style.color = ""; }

      var assunto = document.getElementById("assunto").value;
      var msg = document.getElementById("msg").value.trim();
      var texto = "Olá! Meu nome é " + nome.value.trim() +
        ". Tenho interesse em " + assunto.toLowerCase() + "." + (msg ? " " + msg : "");

      window.open("https://wa.me/5511992249393?text=" + encodeURIComponent(texto), "_blank", "noopener");
    });
  }
})();
