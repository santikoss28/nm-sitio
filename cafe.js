/* Tienda de café: catálogo, carrito, pago y negociación. El contenido (precios, variedades) está en contenido.js */
(function () {
  var NM = window.NM, CF = NM.cafe;
  var PRECIOS_BASE = CF.precios;
  var PHONE = NM.contacto.whatsapp;
  var CUENTAS = CF.cuentas || [];
  var CHECKOUT_URL = CF.checkoutUrl || "";
  var VARIETIES = CF.variedades;
  var SIZES = [125, 250, 500];
  var GRINDS = [
    { id: "grano", label: "En grano (entero)", short: "En grano", tip: "Lo muelo yo en casa, justo antes de preparar." },
    { id: "gruesa", label: "Molienda gruesa", short: "Molienda gruesa", tip: "Prensa francesa y cold brew." },
    { id: "media", label: "Molienda media", short: "Molienda media", tip: "Filtrado: V60, Chemex y cafetera de goteo." },
    { id: "media-fina", label: "Molienda media-fina", short: "Molienda media-fina", tip: "Moka o cafetera italiana." },
    { id: "fina", label: "Molienda fina", short: "Molienda fina", tip: "Espresso." },
    { id: "extrafina", label: "Molienda extrafina", short: "Molienda extrafina", tip: "Café turco." },
    { id: "recomendar", label: "No sé, recomiéndenme", short: "Que me recomienden la molienda", tip: "Cuéntanos cómo lo preparas y te orientamos." }
  ];

  var $ = function (id) { return document.getElementById(id); };
  var cop = function (n) { return "$" + Math.round(n).toString().replace(/\B(?=(\d{3})+(?!\d))/g, "."); };
  var esc = function (s) { return String(s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); };
  var el = function (tag, attrs, html) {
    var e = document.createElement(tag);
    Object.keys(attrs || {}).forEach(function (k) { e.setAttribute(k, attrs[k]); });
    if (html != null) e.innerHTML = html;
    return e;
  };
  var varBy = function (id) { return VARIETIES.filter(function (v) { return v.id === id; })[0]; };
  var grindBy = function (id) { return GRINDS.filter(function (g) { return g.id === id; })[0]; };
  var priceOf = function (v, size) { return (v.precios || PRECIOS_BASE)[size]; };
  var waLink = function (text) { return "https://wa.me/" + PHONE + "?text=" + encodeURIComponent(text); };
  var cap = function (s) { s = s.trim(); return s.charAt(0).toUpperCase() + s.slice(1); };

  // ---- Estado ----
  var cur = { v: VARIETIES[0].id, size: 500, grind: "grano", qty: 1 };
  var cart = [];
  try {
    var saved = JSON.parse(localStorage.getItem("ml-cart") || "[]");
    saved.forEach(function (it) {
      if (varBy(it.v) && SIZES.indexOf(it.size) > -1 && grindBy(it.g) && it.q >= 1) cart.push({ v: it.v, size: it.size, g: it.g, q: Math.min(it.q | 0, 99) });
    });
  } catch (e) { cart = []; }
  function persist() {
    try { localStorage.setItem("ml-cart", JSON.stringify(cart)); } catch (e) {}
  }

  // ---- Selector de variedades ----
  var vpick = $("vpick");
  function renderPick() {
    vpick.innerHTML = "";
    VARIETIES.forEach(function (v) {
      var b = el("button", { type: "button", "class": "vbtn", "aria-pressed": String(v.id === cur.v), "data-v": v.id },
        esc(v.nombre) + (v.puntaje ? ' <span class="vs">' + v.puntaje + "</span>" : ""));
      b.addEventListener("click", function () { cur.v = v.id; renderAll(); });
      vpick.appendChild(b);
    });
  }

  // ---- Ficha de cata ----
  function renderFicha() {
    var v = varBy(cur.v), box = $("ficha");
    if (!v.puntaje) {
      var msg = "Hola, quiero conocer la ficha de cata de la variedad " + v.nombre + " de Montaña Luminosa.";
      box.innerHTML = '<div><p class="tag">Ficha de cata</p><h3>' + esc(v.nombre) + "</h3></div>" +
        '<div class="ficha-wait"><p>Estamos preparando la ficha de cata de esta variedad. Pídela por WhatsApp y te la enviamos junto con la disponibilidad del lote.</p>' +
        '<a class="btn btn-solid btn-sm" target="_blank" rel="noopener" href="' + waLink(msg) + '">Pedir la ficha por WhatsApp</a></div>';
      return;
    }
    var pct = Math.max(0, Math.min(100, (v.puntaje - 80) / 20 * 100));
    var notes = v.sabor.split(",").map(function (s) { return '<span class="note">' + esc(cap(s)) + "</span>"; }).join("");
    var rows = [["Proceso", v.proceso], ["Aroma", v.aroma], ["Sabor", v.sabor], ["Acidez", v.acidez], ["Cuerpo", v.cuerpo], ["Altura", v.altura], ["Origen", v.origen]]
      .filter(function (r) { return r[1]; })
      .map(function (r) { return "<div><dt>" + r[0] + "</dt><dd>" + esc(r[1]) + "</dd></div>"; }).join("");
    var html = '<div class="ficha-top"><div><p class="tag">Ficha de cata</p><h3>' + esc(v.nombre) + "</h3></div>" +
      '<div class="ficha-score"><b>' + v.puntaje + "</b><span>puntos en taza sobre 100</span></div></div>" +
      '<div class="notes" aria-label="Notas de sabor">' + notes + "</div>" +
      '<div class="scale" role="img" aria-label="Escala de 80 a 100 puntos. Este café está en ' + v.puntaje + '."><div class="scale-spec"></div>' +
      '<div class="scale-mark" style="left:' + pct + '%"><span>' + v.puntaje + "</span></div>" +
      '<span class="tick" style="left:0%">80</span><span class="tick" style="left:25%">85</span><span class="tick" style="left:50%">90</span>' +
      '<span class="tick" style="left:75%">95</span><span class="tick" style="left:100%">100</span>' +
      '<span class="scale-note">Desde 80 puntos es café de especialidad</span></div>' +
      '<dl class="attrs">' + rows + "</dl>";
    if (v.foto) html += $("foto-tpl").innerHTML;
    box.innerHTML = html;
  }

  // ---- Compra ----
  var sizesBox = $("sizes"), molSel = $("molienda-sel"), qtyIn = $("qty");
  GRINDS.forEach(function (g) { molSel.appendChild(el("option", { value: g.id }, esc(g.label))); });
  function renderBuy() {
    var v = varBy(cur.v);
    $("buy-title").textContent = v.nombre;
    sizesBox.innerHTML = "";
    SIZES.forEach(function (s) {
      var lab = el("label", { "class": "sz" },
        '<input type="radio" name="size" value="' + s + '"' + (s === cur.size ? " checked" : "") + "><b>" + s + " g</b><span>" + cop(priceOf(v, s)) + "</span>");
      lab.querySelector("input").addEventListener("change", function () { cur.size = s; renderBuy(); });
      sizesBox.appendChild(lab);
    });
    $("size-note").textContent = cur.size === 500 ? "La bolsa de 500 g es biodegradable, a base de caña de azúcar." : "";
    molSel.value = cur.grind;
    $("molienda-tip").textContent = grindBy(cur.grind).tip;
    qtyIn.value = cur.qty;
    $("add").textContent = "Agregar al carrito · " + cop(priceOf(v, cur.size) * cur.qty);
  }
  molSel.addEventListener("change", function () { cur.grind = molSel.value; renderBuy(); });
  function setQty(n) { cur.qty = Math.max(1, Math.min(99, n | 0 || 1)); renderBuy(); }
  qtyIn.addEventListener("change", function () { setQty(parseInt(qtyIn.value, 10)); });
  $("qty-minus").addEventListener("click", function () { setQty(cur.qty - 1); });
  $("qty-plus").addEventListener("click", function () { setQty(cur.qty + 1); });

  $("add").addEventListener("click", function () {
    var found = cart.filter(function (it) { return it.v === cur.v && it.size === cur.size && it.g === cur.grind; })[0];
    if (found) found.q = Math.min(99, found.q + cur.qty);
    else cart.push({ v: cur.v, size: cur.size, g: cur.grind, q: cur.qty });
    persist(); renderCart();
    $("add-status").textContent = "Agregado: " + varBy(cur.v).nombre + ", " + cur.size + " g × " + cur.qty + ". Puedes seguir eligiendo o ir a tu carrito.";
    cur.qty = 1; renderBuy();
  });

  // ---- Carrito ----
  function lineTotal(it) { return priceOf(varBy(it.v), it.size) * it.q; }
  function cartTotal() { return cart.reduce(function (a, it) { return a + lineTotal(it); }, 0); }
  function cartCount() { return cart.reduce(function (a, it) { return a + it.q; }, 0); }

  var list = $("cart-list");
  function renderCart() {
    list.innerHTML = "";
    cart.forEach(function (it, idx) {
      var v = varBy(it.v), g = grindBy(it.g);
      var li = el("li", { "class": "cart-line" },
        "<div><div class=\"t\">" + esc(v.nombre) + " · " + it.size + " g</div><div class=\"s\">" + esc(g.short) + " · " + cop(priceOf(v, it.size)) + " c/u</div></div>" +
        '<div class="lt">' + cop(lineTotal(it)) + "</div>" +
        '<div class="ctl"><div class="qty qty-sm"><button type="button" data-a="minus" data-i="' + idx + '" aria-label="Menos">−</button>' +
        '<input type="number" min="1" max="99" value="' + it.q + '" data-a="set" data-i="' + idx + '" aria-label="Cantidad">' +
        '<button type="button" data-a="plus" data-i="' + idx + '" aria-label="Más">+</button></div>' +
        '<button type="button" class="link-btn" data-a="del" data-i="' + idx + '">Quitar</button></div>');
      list.appendChild(li);
    });
    var n = cartCount(), empty = cart.length === 0;
    $("cart-empty").hidden = !empty;
    $("cart-total-box").hidden = empty;
    $("cart-total").textContent = cop(cartTotal());
    $("hdr-count").textContent = n;
    var fab = $("fab");
    fab.hidden = empty;
    fab.textContent = "Ver carrito · " + n + (n === 1 ? " bolsa" : " bolsas") + " · " + cop(cartTotal());
    renderMsg();
  }
  list.addEventListener("click", function (e) {
    var b = e.target.closest("button[data-a]"); if (!b) return;
    var i = parseInt(b.getAttribute("data-i"), 10), a = b.getAttribute("data-a");
    if (a === "plus") cart[i].q = Math.min(99, cart[i].q + 1);
    if (a === "minus") cart[i].q = Math.max(1, cart[i].q - 1);
    if (a === "del") cart.splice(i, 1);
    persist(); renderCart();
  });
  list.addEventListener("change", function (e) {
    var inp = e.target.closest("input[data-a='set']"); if (!inp) return;
    var i = parseInt(inp.getAttribute("data-i"), 10), q = parseInt(inp.value, 10);
    cart[i].q = isNaN(q) ? 1 : Math.max(1, Math.min(99, q));
    persist(); renderCart();
  });

  // ---- Mensaje de pedido ----
  function cartText() {
    if (!cart.length) return "Tu carrito está vacío. Agrega productos en la tienda para armar el mensaje.";
    var lines = ["Hola, quiero hacer este pedido de café de Montaña Luminosa (NM):", ""];
    cart.forEach(function (it, i) {
      var v = varBy(it.v), g = grindBy(it.g);
      lines.push((i + 1) + ". " + v.nombre + " · " + it.size + " g · " + g.short + " × " + it.q + " = " + cop(lineTotal(it)));
    });
    lines.push("", "Subtotal: " + cop(cartTotal()) + " COP, sin envío", "Forma de pago: transferencia bancaria");
    var f = function (id) { return $(id).value.trim(); };
    if (f("c-nombre")) lines.push("Nombre: " + f("c-nombre"));
    if (f("c-tel")) lines.push("Celular: " + f("c-tel"));
    if (f("c-ciudad")) lines.push("Ciudad: " + f("c-ciudad"));
    if (f("c-dir")) lines.push("Dirección: " + f("c-dir"));
    lines.push("", "Quedo atento a la confirmación, al valor del envío y a los datos para la transferencia.");
    return lines.join("\n");
  }

  function composer(cfg) {
    var link = $(cfg.link), copyBtn = $(cfg.copy), status = $(cfg.status), box = $(cfg.preview);
    function render() {
      var text = cfg.build(), dis = cfg.disabled ? cfg.disabled() : false;
      box.textContent = text;
      link.classList.toggle("is-disabled", dis);
      link.setAttribute("aria-disabled", String(dis));
      link.href = dis ? "#tienda" : waLink(text);
      return text;
    }
    $(cfg.form).addEventListener("input", function () { status.textContent = ""; render(); });
    $(cfg.form).addEventListener("change", function () { status.textContent = ""; render(); });
    $(cfg.form).addEventListener("submit", function (e) { e.preventDefault(); });
    link.addEventListener("click", function (e) { if (cfg.disabled && cfg.disabled()) e.preventDefault(); });
    copyBtn.addEventListener("click", function () {
      var text = render();
      var fail = function () {
        var r = document.createRange(); r.selectNodeContents(box);
        var s = window.getSelection(); s.removeAllRanges(); s.addRange(r);
        status.textContent = "No se pudo copiar solo. El mensaje quedó seleccionado: cópialo con tu teclado o manteniendo presionado.";
      };
      try { navigator.clipboard.writeText(text).then(function () { status.textContent = "Mensaje copiado. Pégalo en WhatsApp."; }, fail); }
      catch (e) { fail(); }
    });
    return render;
  }
  var renderMsg = composer({ form: "carrito-form", build: cartText, disabled: function () { return cart.length === 0; }, preview: "c-preview", link: "c-enviar", copy: "c-copiar", status: "c-estado" });

  // ---- Pago en línea (Mercado Pago) ----
  var payBtn = $("c-pagar"), estado = $("c-estado");
  if (CHECKOUT_URL) {
    $("cart-h2").textContent = "Revisa tu pedido y paga en línea";
    $("cart-intro").textContent = "Agrega todas las variedades que quieras y paga aquí mismo con tarjeta, PSE, Nequi u otros medios de Mercado Pago.";
    payBtn.hidden = false;
    $("f-email").hidden = false;
    $("c-prev-label").hidden = true; $("c-preview").hidden = true; $("c-copiar").hidden = true;
    $("c-enviar").className = "btn btn-ghost btn-wide";
    $("c-enviar").textContent = "¿Dudas? Escríbenos por WhatsApp";
    var payBox = document.querySelector(".pay-box");
    payBox.querySelector("h3").textContent = "Pago seguro con Mercado Pago";
    payBox.querySelector(".steps").innerHTML = "<li>Completas tus datos y pulsas \"Pagar con Mercado Pago\".</li><li>Pagas en la página segura de Mercado Pago, con el medio que prefieras.</li><li>Recibes la confirmación en tu correo.</li><li>Te escribimos por WhatsApp para coordinar el envío.</li>";
    $("accts").hidden = true;
    $("pay-note").textContent = "Tus datos de pago nunca pasan por esta página: los maneja Mercado Pago.";
    var busy = false;
    payBtn.addEventListener("click", function () {
      if (busy) return;
      var f = function (id) { return $(id).value.trim(); };
      if (!cart.length) { estado.textContent = "Tu carrito está vacío."; return; }
      if (!f("c-nombre") || !f("c-tel") || !f("c-ciudad") || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(f("c-email"))) {
        estado.textContent = "Completa nombre, celular, correo válido y ciudad para continuar."; return;
      }
      busy = true; payBtn.disabled = true; payBtn.textContent = "Conectando con Mercado Pago…"; estado.textContent = "";
      fetch(CHECKOUT_URL, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nombre: f("c-nombre"), tel: f("c-tel"), email: f("c-email"), ciudad: f("c-ciudad"), direccion: f("c-dir"),
          items: cart.map(function (it) { return { v: it.v, size: it.size, g: it.g, q: it.q }; })
        })
      }).then(function (r) { return r.json().then(function (d) { return { ok: r.ok, d: d }; }); })
        .then(function (x) {
          if (!x.ok || !x.d.url) throw new Error(x.d && x.d.error || "Error");
          window.location.href = x.d.url;
        })
        .catch(function (e) {
          busy = false; payBtn.disabled = false; payBtn.textContent = "Pagar con Mercado Pago";
          estado.textContent = (e && e.message && e.message !== "Failed to fetch" ? e.message : "No pudimos conectar con el pago. Intenta de nuevo o escríbenos por WhatsApp.");
        });
    });
  }
  // Regreso desde Mercado Pago
  (function () {
    var m = /[?&]pago=(ok|pendiente|fallido)/.exec(location.search); if (!m) return;
    var b = $("pay-banner"), k = m[1];
    var msg = {
      ok: ["ok", "¡Gracias por tu compra!", "Recibimos tu pago. Te enviamos la confirmación a tu correo y te escribiremos por WhatsApp para coordinar el envío."],
      pendiente: ["", "Tu pago está pendiente", "Mercado Pago aún está procesando el pago. Cuando se apruebe te llegará la confirmación a tu correo."],
      fallido: ["bad", "No se completó el pago", "No se hizo ningún cobro. Puedes intentarlo de nuevo con tu carrito o escribirnos por WhatsApp."]
    }[k];
    b.className = "pay-banner " + msg[0]; b.innerHTML = "<b>" + msg[1] + "</b>" + msg[2]; b.hidden = false;
    if (k === "ok") { cart.length = 0; persist(); renderCart(); }
    var sec = $("carrito"); if (sec && sec.scrollIntoView) setTimeout(function () { sec.scrollIntoView(); }, 50);
  })();

  if ($("faq-pago")) $("faq-pago").textContent = CHECKOUT_URL
    ? "Puedes pagar en línea con Mercado Pago (tarjeta, PSE, Nequi y otros medios) desde el carrito. El pago se hace en la página segura de Mercado Pago, y recibes la confirmación en tu correo."
    : "Por transferencia bancaria. Armas tu carrito, envías el pedido por WhatsApp, te confirmamos disponibilidad, envío y total, haces la transferencia y nos mandas el comprobante por el mismo chat.";

  // ---- Cuentas de transferencia ----
  var accts = $("accts");
  if (CUENTAS.length) {
    CUENTAS.forEach(function (c, i) {
      var d = el("div", { "class": "acct" }, "<small>" + esc(c.medio) + "</small><span class=\"n\" id=\"acct-n-" + i + "\">" + esc(c.numero) + "</span>" +
        (c.titular ? "<span>Titular: " + esc(c.titular) + "</span>" : "") +
        '<button type="button" class="btn btn-ghost btn-sm" data-copy="' + i + '">Copiar número</button>');
      accts.appendChild(d);
    });
    $("pay-note").textContent = "Envía el comprobante por WhatsApp indicando tu nombre.";
    accts.addEventListener("click", function (e) {
      var b = e.target.closest("button[data-copy]"); if (!b) return;
      var i = parseInt(b.getAttribute("data-copy"), 10);
      var fail = function () {
        var n = $("acct-n-" + i), r = document.createRange(); r.selectNodeContents(n);
        var s = window.getSelection(); s.removeAllRanges(); s.addRange(r); b.textContent = "Selecciona y copia";
      };
      try { navigator.clipboard.writeText(CUENTAS[i].numero).then(function () { b.textContent = "Copiado"; }, fail); } catch (er) { fail(); }
    });
  } else {
    $("pay-note").textContent = "Los datos de la cuenta te los enviamos por WhatsApp cuando confirmemos tu pedido.";
  }

  // ---- Guía de molienda y negociación ----
  var brew = $("brew");
  GRINDS.filter(function (g) { return g.id !== "recomendar"; }).forEach(function (g) {
    brew.appendChild(el("li", {}, "<b>" + esc(g.label) + ".</b> " + esc(g.tip)));
  });
  var nMol = $("n-molienda"), nVars = $("n-vars");
  GRINDS.forEach(function (g) { nMol.appendChild(el("option", { value: g.id }, esc(g.label))); });
  VARIETIES.forEach(function (v) {
    nVars.appendChild(el("label", {}, '<input type="checkbox" value="' + esc(v.nombre) + '"> ' + esc(v.nombre)));
  });
  function dealText() {
    var checked = Array.prototype.map.call(nVars.querySelectorAll("input:checked"), function (i) { return i.value; });
    var g = grindBy(nMol.value), f = function (id) { return $(id).value.trim(); };
    var lines = ["Hola, me interesa negociar un pedido de café de Montaña Luminosa (NM).", ""];
    if (f("n-nombre")) lines.push("Nombre o negocio: " + f("n-nombre"));
    lines.push("Tipo de cliente: " + $("n-tipo").value);
    lines.push("Variedades: " + (checked.length ? checked.join(", ") : "por definir"));
    if (f("n-cantidad")) lines.push("Cantidad aproximada: " + f("n-cantidad") + " kg");
    lines.push("Frecuencia: " + $("n-frecuencia").value);
    lines.push("Molienda: " + g.short);
    if (f("n-ciudad")) lines.push("Ciudad: " + f("n-ciudad"));
    if (f("n-propuesta")) lines.push("Mi propuesta de precio: " + f("n-propuesta"));
    if (f("n-mensaje")) lines.push("", f("n-mensaje"));
    lines.push("", "¿Me pueden enviar una propuesta?");
    return lines.join("\n");
  }
  composer({ form: "negocio", build: dealText, preview: "n-preview", link: "n-enviar", copy: "n-copiar", status: "n-estado" })();

  function renderAll() { renderPick(); renderFicha(); renderBuy(); }
  renderAll();
  renderCart();
})();
