/* Clickable citations.
   Usage in slides:  <span class="cite" data-c="Key1,Key2"></span>
   On load: every .cite is numbered by order of first appearance (per key),
   its text becomes [n] (or [n,m]), and hover/click shows a floating box with
   the full reference(s) from window.REFS. */
(function () {
  "use strict";
  function init() {
    const REFS = window.REFS || {};
    const order = new Map();          // key -> number
    let next = 1;
    const cites = [...document.querySelectorAll(".cite")];
    cites.forEach(el => {
      const keys = (el.dataset.c || "").split(",").map(s => s.trim()).filter(Boolean);
      const nums = keys.map(k => {
        if (!order.has(k)) order.set(k, next++);
        return order.get(k);
      });
      el.textContent = "[" + nums.join(",") + "]";
      el._keys = keys;
    });

    // floating popup
    let pop = document.getElementById("cite-pop");
    if (!pop) { pop = document.createElement("div"); pop.id = "cite-pop"; document.body.appendChild(pop); }
    let pinned = false;

    function show(el) {
      const items = el._keys.map(k => {
        const n = order.get(k), txt = REFS[k] || ("<i>missing reference: " + k + "</i>");
        return '<div style="margin:2px 0"><span class="k">[' + n + ']</span> ' + txt + "</div>";
      }).join("");
      pop.innerHTML = items;
      pop.classList.add("show");
      const r = el.getBoundingClientRect();
      // position below the number, clamped to viewport
      const pw = Math.min(460, window.innerWidth - 24);
      pop.style.maxWidth = pw + "px";
      let left = r.left, top = r.bottom + 8;
      requestAnimationFrame(() => {
        const ph = pop.offsetHeight;
        if (left + pw > window.innerWidth - 12) left = window.innerWidth - 12 - pw;
        if (left < 12) left = 12;
        if (top + ph > window.innerHeight - 12) top = r.top - ph - 8; // flip above
        pop.style.left = left + "px";
        pop.style.top = Math.max(12, top) + "px";
      });
    }
    function hide() { if (!pinned) pop.classList.remove("show"); }

    cites.forEach(el => {
      el.addEventListener("mouseenter", () => { if (!pinned) show(el); });
      el.addEventListener("mouseleave", hide);
      el.addEventListener("click", e => {
        e.stopPropagation();
        if (pinned && pop._owner === el) { pinned = false; pop.classList.remove("show"); }
        else { pinned = true; pop._owner = el; show(el); }
      });
    });
    document.addEventListener("click", () => { pinned = false; pop.classList.remove("show"); });
    // hide on slide change (reveal)
    if (window.Reveal && Reveal.on) Reveal.on("slidechanged", () => { pinned = false; pop.classList.remove("show"); });
  }
  if (document.readyState !== "loading") setTimeout(init, 0);
  else document.addEventListener("DOMContentLoaded", init);
})();
