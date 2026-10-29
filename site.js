/* Lógica compartida: encabezado, pie y páginas de inicio, abogacía y turismo.
   No necesitas editar este archivo: el contenido está en contenido.js */
(function () {
  var NM = window.NM || {};
  var page = document.body.getAttribute("data-page") || "inicio";
  var $ = function (id) { return document.getElementById(id); };
  var esc = function (s) { return String(s == null ? "" : s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); };
  var cop = function (n) { return "$" + Math.round(n).toString().replace(/\B(?=(\d{3})+(?!\d))/g, "."); };
  var C = NM.contacto || {};
  var wa = function (text) { return "https://wa.me/" + C.whatsapp + (text ? "?text=" + encodeURIComponent(text) : ""); };
  window.NM_wa = wa;

  /* ---------- Encabezado ---------- */
  var links = [["inicio", "index.html", "Inicio"], ["abogacia", "abogacia.html", "Abogacía"], ["turismo", "turismo.html", "Turismo"], ["cafe", "cafe.html", "Café"]];
  var nav = links.map(function (l) { return '<a href="' + l[1] + '"' + (l[0] === page ? ' aria-current="page"' : "") + ">" + l[2] + "</a>"; }).join("");
  var action = page === "cafe"
    ? '<a class="btn btn-gold" href="#carrito" id="hdr-cart" aria-label="Ver carrito">Carrito <span id="hdr-count">0</span></a>'
    : '<a class="btn btn-gold" href="' + wa("Hola, quisiera más información.") + '" target="_blank" rel="noopener">WhatsApp</a>';
  var h = $("site-header");
  if (h) h.innerHTML = '<header class="top"><div class="wrap">' +
    '<a class="brand" href="index.html" aria-label="' + esc(NM.marca.nombre) + ', inicio"><img src="img/nm-simbolo-claro.png" alt="" width="93" height="40">' +
    '<span class="brand-name">' + esc(NM.marca.nombre) + "<small>" + esc(NM.marca.lema) + "</small></span></a>" +
    '<nav class="nav" aria-label="Secciones del sitio">' + nav + "</nav>" + action + "</div></header>";

  /* ---------- Pie ---------- */
  var f = $("site-footer");
  if (f) {
    var soc = [];
    if (C.instagram) soc.push('<a href="' + esc(C.instagram) + '" target="_blank" rel="noopener">Instagram</a>');
    if (C.facebook) soc.push('<a href="' + esc(C.facebook) + '" target="_blank" rel="noopener">Facebook</a>');
    f.innerHTML = '<footer class="band foot"><div class="wrap">' +
      '<div><img src="img/nm-logo-claro.png" alt="Logo de ' + esc(NM.marca.nombre) + '" width="190" height="128"><p style="margin-top:12px">' + esc(NM.marca.ciudad) + "</p></div>" +
      '<div><p class="head">Contacto</p><p class="nums">' + (C.telefonos || []).map(esc).join("<br>") + "</p>" +
      (C.email ? '<p><a href="mailto:' + esc(C.email) + '">' + esc(C.email) + "</a></p>" : "") + (soc.length ? "<p>" + soc.join(" · ") + "</p>" : "") + "</div>" +
      '<div><p class="head">Áreas</p><p><a href="abogacia.html">Asesoría jurídica</a><br><a href="turismo.html">Planes de viaje</a><br><a href="cafe.html">Café de especialidad</a></p></div>' +
      '</div><div class="wrap"><p class="copy">© ' + new Date().getFullYear() + " " + esc(NM.marca.nombre) + ". Todos los derechos reservados.</p></div></footer>";
  }
  Array.prototype.forEach.call(document.querySelectorAll("[data-tels]"), function (e) { e.textContent = (C.telefonos || []).join(" o "); });

  /* ---------- Utilidades ---------- */
  function composer(cfg) {
    var link = $(cfg.link), copyBtn = $(cfg.copy), status = $(cfg.status), box = $(cfg.preview), form = $(cfg.form);
    function render() {
      var text = cfg.build();
      box.textContent = text; link.href = wa(text); return text;
    }
    form.addEventListener("input", function () { status.textContent = ""; render(); });
    form.addEventListener("change", function () { status.textContent = ""; render(); });
    form.addEventListener("submit", function (e) { e.preventDefault(); });
    copyBtn.addEventListener("click", function () {
      var text = render();
      var fail = function () {
        var r = document.createRange(); r.selectNodeContents(box);
        var s = window.getSelection(); s.removeAllRanges(); s.addRange(r);
        status.textContent = "No se pudo copiar solo. El mensaje quedó seleccionado: cópialo manualmente.";
      };
      try { navigator.clipboard.writeText(text).then(function () { status.textContent = "Mensaje copiado. Pégalo en WhatsApp."; }, fail); } catch (e) { fail(); }
    });
    render();
  }
  var val = function (id) { return ($(id) && $(id).value || "").trim(); };

  /* ---------- Portada ---------- */
  if (page === "inicio") {
    var P = NM.portada, icons = {
      abogacia: '<path d="M12 3v18M6 21h12M5 7h14M5 7l-3 7a3 3 0 0 0 6 0L5 7zM19 7l-3 7a3 3 0 0 0 6 0l-3-7z"/>',
      turismo: '<circle cx="12" cy="12" r="9"/><path d="M15.5 8.5l-2 5-5 2 2-5z"/>',
      cafe: '<path d="M4 9h13v5a5 5 0 0 1-5 5H9a5 5 0 0 1-5-5V9zM17 10h2a2 2 0 0 1 0 4h-2M8 3c0 1.5 1 1.5 1 3M12 3c0 1.5 1 1.5 1 3"/>'
    };
    $("hero-title").textContent = P.titulo; $("hero-text").textContent = P.texto;
    $("doors").innerHTML = P.opciones.map(function (o) {
      return '<a class="door" href="' + esc(o.enlace) + '"><span class="ic"><svg viewBox="0 0 24 24" aria-hidden="true">' + (icons[o.clave] || "") + "</svg></span>" +
        "<h2>" + esc(o.titulo) + "</h2><p>" + esc(o.texto) + "</p><ul>" + o.puntos.map(function (p) { return "<li>" + esc(p) + "</li>"; }).join("") + "</ul>" +
        '<span class="btn btn-solid arrow">' + esc(o.boton) + "</span></a>";
    }).join("");
    $("about-title").textContent = P.sobre.titulo;
    $("about-text").innerHTML = P.sobre.texto.map(function (t) { return "<p>" + esc(t) + "</p>"; }).join("");
    $("proofs").innerHTML = P.confianza.map(function (c) { return "<div><b>" + esc(c.titulo) + "</b><span>" + esc(c.texto) + "</span></div>"; }).join("");
    $("contact-wa").href = wa("Hola, quisiera más información.");
    var cm = $("contact-extra"), ex = [];
    (C.telefonos || []).forEach(function (t) { ex.push('<span class="link">' + esc(t) + "</span>"); });
    if (C.email) ex.push('<a class="link" href="mailto:' + esc(C.email) + '">' + esc(C.email) + "</a>");
    cm.innerHTML = ex.join("");
  }

  /* ---------- Abogacía ---------- */
  if (page === "abogacia") {
    var A = NM.abogacia;
    $("hero-title").textContent = A.titulo; $("hero-text").textContent = A.texto;
    var cred = [];
    if (A.tarjetaProfesional) cred.push(A.tarjetaProfesional);
    if (A.universidad) cred.push(A.universidad);
    $("cred").innerHTML = cred.map(function (c) { return '<span class="chip">' + esc(c) + "</span>"; }).join("");
    $("areas-list").innerHTML = A.servicios.map(function (s) { return '<article class="area"><h3>' + esc(s.titulo) + "</h3><p>" + esc(s.texto) + "</p></article>"; }).join("");
    $("faq").innerHTML = A.preguntas.map(function (q) { return "<details><summary>" + esc(q.p) + "</summary><p>" + esc(q.r) + "</p></details>"; }).join("");
    $("aviso").textContent = A.aviso;
    var tema = $("a-tema");
    A.servicios.forEach(function (s) { var o = document.createElement("option"); o.textContent = s.titulo; tema.appendChild(o); });
    var oo = document.createElement("option"); oo.textContent = "Otro / no estoy seguro"; tema.appendChild(oo);

    var API = A.casosUrl || "";
    var post = function (body) {
      return fetch(API, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) })
        .then(function (r) { return r.json().then(function (d) { if (!r.ok) throw new Error(d.error || "Error"); return d; }); });
    };
    var fail = function (e) { return e && e.message && e.message !== "Failed to fetch" ? e.message : "No pudimos conectar. Intenta de nuevo o escríbenos por WhatsApp."; };
    var store = function (k, v) { try { if (v == null) return localStorage.getItem(k) || ""; localStorage.setItem(k, v); } catch (e) { return ""; } };

    /* --- Paso 1: contar el caso --- */
    var aForm = $("consulta-form"), aSend = $("a-enviar"), aWa = $("a-wa"), aStatus = $("a-estado");
    function casoText() {
      var l = ["Hola, quisiera una asesoría jurídica.", "", "Tema: " + tema.value];
      if (val("a-nombre")) l.push("Nombre: " + val("a-nombre"));
      if (val("a-tel")) l.push("Celular: " + val("a-tel"));
      if (val("a-ciudad")) l.push("Ciudad: " + val("a-ciudad"));
      if (val("a-caso")) l.push("", "Mi situación: " + val("a-caso"));
      l.push("", "Quedo atento a su respuesta.");
      return l.join("\n");
    }
    var refreshWa = function () { aWa.href = wa(casoText()); };
    aForm.addEventListener("input", refreshWa); aForm.addEventListener("change", refreshWa); refreshWa();
    if (!API) { aSend.hidden = true; aWa.className = "btn btn-solid btn-wide"; aWa.textContent = "Enviar mi caso por WhatsApp"; }
    aForm.addEventListener("submit", function (e) {
      e.preventDefault();
      if (!API || aSend.disabled) return;
      if (!val("a-nombre") || val("a-tel").replace(/\D/g, "").length < 7 || val("a-caso").length < 10) {
        aStatus.textContent = "Completa tu nombre, tu celular y una breve reseña de tu caso."; return;
      }
      aSend.disabled = true; aSend.textContent = "Enviando…"; aStatus.textContent = "";
      post({ accion: "nuevo", nombre: val("a-nombre"), tel: val("a-tel"), ciudad: val("a-ciudad"), tema: tema.value, resumen: val("a-caso") })
        .then(function (d) {
          $("a-codigo").textContent = d.codigo; $("a-ok").hidden = false;
          $("s-codigo").value = d.codigo; $("s-tel").value = val("a-tel"); store("nm-caso", d.codigo);
          aSend.textContent = "Caso enviado"; $("a-ok").scrollIntoView({ block: "nearest" });
        })
        .catch(function (er) { aSend.disabled = false; aSend.textContent = "Enviar mi caso"; aStatus.textContent = fail(er); });
    });
    $("a-copiar").addEventListener("click", function () {
      var c = $("a-codigo").textContent;
      try { navigator.clipboard.writeText(c).then(function () { aStatus.textContent = "Código copiado."; }, function () { aStatus.textContent = "Copia el código a mano: " + c; }); }
      catch (e) { aStatus.textContent = "Copia el código a mano: " + c; }
    });

    /* --- Paso 2: seguimiento --- */
    var sForm = $("seguir-form"), sStatus = $("s-estado"), sRes = $("s-res");
    if (!API) {
      $("s-intro").textContent = "La consulta en línea estará disponible muy pronto. Mientras tanto, pregúntanos por WhatsApp cómo va tu proceso.";
      sForm.innerHTML = '<a class="btn btn-solid btn-wide" target="_blank" rel="noopener" href="' + wa("Hola, quisiera saber cómo va mi proceso. Mi nombre es ___ y mi celular es ___.") + '">Preguntar cómo va mi proceso</a>';
    } else {
      $("s-codigo").value = store("nm-caso");
      var fecha = function (iso) { return new Date(iso).toLocaleDateString("es-CO", { day: "numeric", month: "long", year: "numeric" }); };
      sForm.addEventListener("submit", function (e) {
        e.preventDefault();
        var btn = $("s-ver");
        if (btn.disabled) return;
        if (!val("s-codigo") || !val("s-tel")) { sStatus.textContent = "Escribe el código y tu celular."; return; }
        btn.disabled = true; btn.textContent = "Consultando…"; sStatus.textContent = ""; sRes.hidden = true;
        post({ accion: "consultar", codigo: val("s-codigo"), tel: val("s-tel") })
          .then(function (d) {
            var ups = (d.actualizaciones || []).slice().reverse().map(function (u) {
              return "<li><time>" + esc(fecha(u.fecha)) + "</time><span>" + esc(u.mensaje) + "</span></li>";
            }).join("");
            sRes.innerHTML = '<p class="r-tag">' + esc(d.tema) + " · registrado el " + esc(fecha(d.creado)) + "</p>" +
              '<p class="r-estado" data-e="' + esc(d.estado) + '">' + esc(d.estado) + "</p>" +
              "<p>" + esc((A.estados || {})[d.estado] || "") + "</p>" +
              (ups ? '<p class="r-tag" style="margin-top:18px">Novedades</p><ul class="r-news">' + ups + "</ul>" : "");
            sRes.hidden = false; store("nm-caso", val("s-codigo").toUpperCase());
          })
          .catch(function (er) { sStatus.textContent = fail(er); })
          .then(function () { btn.disabled = false; btn.textContent = "Ver mi proceso"; });
      });
    }
  }

  /* ---------- Turismo ---------- */
  if (page === "turismo") {
    var T = NM.turismo;
    $("hero-title").textContent = T.titulo; $("hero-text").textContent = T.texto;
    $("cta-title").textContent = T.cuentanos.titulo; $("cta-text").textContent = T.cuentanos.texto;
    $("aviso").textContent = T.aviso;
    var PAL = {
      cafe: ["#cfe3c2", "#f2e4b8", "#4a7a43", "#33603a", "#1f4429"],
      cultura: ["#e8d9bd", "#f5ead5", "#9a8a70", "#6f604c", "#0d3b4a"],
      aventura: ["#f2c38a", "#f8e4c4", "#c0643a", "#964526", "#5e2a18"],
      naturaleza: ["#bcd9e0", "#eef2e6", "#4a868d", "#2d6a72", "#0d3b4a"]
    };
    var art = function (tipo, i) {
      var p = PAL[tipo] || PAL.naturaleza, id = "g" + i;
      return '<svg class="plan-img" viewBox="0 0 400 250" preserveAspectRatio="xMidYMid slice" role="img" aria-label="Ilustración del plan">' +
        '<defs><linearGradient id="' + id + '" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="' + p[0] + '"/><stop offset="1" stop-color="' + p[1] + '"/></linearGradient></defs>' +
        '<rect width="400" height="250" fill="url(#' + id + ')"/><circle cx="' + (290 + (i % 3) * 20) + '" cy="70" r="26" fill="#fff" opacity=".55"/>' +
        '<path d="M0 170 L60 120 L110 150 L180 90 L250 150 L320 110 L400 160 L400 250 L0 250Z" fill="' + p[2] + '"/>' +
        '<path d="M0 200 L80 150 L150 190 L230 135 L310 190 L400 150 L400 250 L0 250Z" fill="' + p[3] + '"/>' +
        '<path d="M0 235 L90 205 L180 230 L270 200 L400 232 L400 250 L0 250Z" fill="' + p[4] + '"/></svg>';
    };
    var tipos = [];
    T.planes.forEach(function (p) { if (p.tipo && tipos.indexOf(p.tipo) < 0) tipos.push(p.tipo); });
    var cur = "todos";
    var filtros = $("filtros");
    function drawFiltros() {
      filtros.innerHTML = ["todos"].concat(tipos).map(function (t) { return '<button type="button" class="fbtn" data-t="' + esc(t) + '" aria-pressed="' + (t === cur) + '">' + esc(t === "cafe" ? "café" : t) + "</button>"; }).join("");
      filtros.hidden = tipos.length < 2;
    }
    function drawPlanes() {
      $("planes").innerHTML = T.planes.map(function (p, i) {
        if (cur !== "todos" && p.tipo !== cur) return "";
        var img = p.foto ? '<img class="plan-img" src="' + esc(p.foto) + '" alt="' + esc(p.nombre) + '" loading="lazy">' : art(p.tipo, i);
        var precio = p.desde ? "Desde " + cop(p.desde) + "<small> por persona</small>" : "Cotiza por WhatsApp";
        var msg = "Hola, quisiera cotizar el plan \"" + p.nombre + "\" (" + p.destino + "). Somos ___ personas y viajaríamos en ___.";
        return '<article class="plan">' + img + '<div class="plan-body"><span class="dest">' + esc(p.destino) + "</span><h3>" + esc(p.nombre) + "</h3><p>" + esc(p.texto) + "</p>" +
          "<ul>" + (p.incluye || []).map(function (x) { return "<li>" + esc(x) + "</li>"; }).join("") + "</ul>" +
          '<div class="plan-foot"><div class="plan-meta">' + esc(p.duracion) + "<b>" + precio + '</b></div><a class="btn btn-solid btn-sm" href="' + wa(msg) + '" target="_blank" rel="noopener">Cotizar</a></div></div></article>';
      }).join("");
    }
    filtros.addEventListener("click", function (e) { var b = e.target.closest("button[data-t]"); if (!b) return; cur = b.getAttribute("data-t"); drawFiltros(); drawPlanes(); });
    drawFiltros(); drawPlanes();
    composer({
      form: "viaje-form", link: "v-enviar", copy: "v-copiar", status: "v-estado", preview: "v-preview",
      build: function () {
        var l = ["Hola, quisiera que me armen un viaje.", ""];
        if (val("v-destino")) l.push("Destino o idea: " + val("v-destino"));
        if (val("v-personas")) l.push("Personas: " + val("v-personas"));
        if (val("v-fechas")) l.push("Fechas aproximadas: " + val("v-fechas"));
        if (val("v-origen")) l.push("Salimos desde: " + val("v-origen"));
        if (val("v-presupuesto")) l.push("Presupuesto aproximado: " + val("v-presupuesto"));
        if (val("v-nombre")) l.push("Nombre: " + val("v-nombre"));
        if (val("v-notas")) l.push("", "Notas: " + val("v-notas"));
        l.push("", "Quedo atento a su propuesta.");
        return l.join("\n");
      }
    });
  }
})();
