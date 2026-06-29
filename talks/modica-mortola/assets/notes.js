/* Hover/click "ⓘ" notes — expandable mathematical details, same UX as citations.
   Usage in slides:  <span class="note" data-n="key"></span>
   Content lives in window.NOTES below (HTML + LaTeX in \( \) / \[ \]); the popup is
   MathJax-typeset on first show. Edit the text freely. */
window.NOTES = {

  // Slide: First ingredient — entropy
  entropy:
    "<b>The entropy is exact combinatorics.</b> The number of microstates with \\(N_A\\) molecules " +
    "of \\(A\\) and \\(N_B=N-N_A\\) of \\(B\\) on \\(N\\) singly-occupied sites is " +
    "\\(\\Omega_{AB}=\\binom{N}{N_A}\\) — incompressibility is built in and <i>no</i> independence is assumed. " +
    "With the pure phases as reference (\\(\\Omega_0=1,\\ S_0=0\\)) and Boltzmann \\(S=k_B\\ln\\Omega\\), Stirling " +
    "\\(\\ln N!=N\\ln N-N+O(\\ln N)\\) gives " +
    "\\[\\Delta S=k_B\\ln\\binom{N}{N_A}=-k_B N\\,[\\varphi_A\\ln\\varphi_A+\\varphi_B\\ln\\varphi_B]+O(\\ln N),\\] " +
    "so per site \\(\\Delta S/N=-k_B[\\varphi_A\\ln\\varphi_A+\\varphi_B\\ln\\varphi_B]>0\\) on \\((0,1)\\). The " +
    "per-particle shortcut \\(\\Delta S_A=k_B\\ln(N/N_A)=-k_B\\ln\\varphi_A\\) reproduces the leading term; the " +
    "\\(O(\\ln N)\\) correction is subextensive. Independence (mean field) enters only in the <i>energy</i>, never here.",

  // Slide: How to obtain isotropy — the K_{2k} harmonics
  err:
    "<b>Bonds and the \\(K_{2k}\\).</b> A bond \\(b\\in B\\) is a lattice displacement with coupling \\(J_b\\): " +
    "nearest \\(B_{\\rm nn}=\\{(1,0),(0,1)\\}\\) (\\(J_b=C_1\\)), next-nearest \\(\\{(1,1),(1,-1)\\}\\) (\\(C_2\\)), " +
    "next-next-nearest \\(\\{(2,0),(0,2)\\}\\) (\\(C_3\\)).<br>" +
    "For a planar interface \\(\\varphi(x)=\\psi(x\\cdot\\nu)\\) and \\(q=b\\cdot\\nu\\): " +
    "\\((\\Delta_b\\varphi)^2=q^2\\psi'^2+q^3\\psi'\\psi''+q^4(\\tfrac14\\psi''^2+\\tfrac13\\psi'\\psi''')+\\cdots\\) " +
    "Odd powers integrate to \\(0\\) (\\(\\int\\psi'\\psi'''=-\\int\\psi''^2\\)), and the \\(q^{2k}\\) terms give " +
    "\\[K_{2k}(\\nu):=\\sum_{b\\in B} J_b\\,(b\\cdot\\nu)^{2k}.\\] " +
    "\\(K_2\\) is the (isotropic) gradient stiffness; \\(K_4,K_6,\\dots\\) carry the anisotropy. Cubic symmetry " +
    "\\(\\Rightarrow\\) each \\(K_{2k}\\) is a finite sum of \\(\\cos 4k'\\theta\\). " +
    "Using \\(\\cos^4\\!\\theta+\\sin^4\\!\\theta=\\tfrac34+\\tfrac14\\cos4\\theta\\) and " +
    "\\(\\cos^6\\!\\theta+\\sin^6\\!\\theta=\\tfrac58+\\tfrac38\\cos4\\theta\\) (with " +
    "\\((c{\\pm}s)^4,(c{\\pm}s)^6\\) for the diagonals, \\((2c)^{2k},(2s)^{2k}\\) for NNNN) gives the closed forms " +
    "on the slide. Each new shell removes one harmonic by fine-tuning, but a higher one always survives " +
    "(first \\(\\cos8\\theta\\) at order 8: \\(\\cos^8+\\sin^8=\\tfrac{35+28\\cos4\\theta+\\cos8\\theta}{64}\\)) — " +
    "hence finite range is never exactly isotropic.",

  // Slide: Is the surface tension isotropic — Wulff numerics
  wulff:
    "<b>How the Wulff shapes are computed.</b> \\(\\gamma(\\lambda)\\): minimize the 1D chain " +
    "\\(\\sum_k[\\lambda W(\\varphi_k)+\\tfrac12(\\varphi_{k+1}-\\varphi_k)^2]\\) on \\(\\{-N,\\dots,N\\}\\), BC " +
    "\\(\\varphi_{-N}=\\alpha,\\varphi_N=\\beta\\), by L-BFGS-B from several initial guesses (hard jump, " +
    "sigmoid, ramps) plus a polish; convergence is fast (exponential tails). Then " +
    "\\(\\sigma(\\theta)=\\sup_{\\lambda_1+\\lambda_2=1}[\\gamma(\\lambda_1)|\\cos\\theta|+\\gamma(\\lambda_2)|\\sin\\theta|]\\), " +
    "sampled on \\([0,\\pi/4]\\) and extended by octahedral symmetry; the Wulff boundary is the support " +
    "function \\(r(\\psi)=\\min_\\theta\\sigma(\\theta)/\\cos(\\theta-\\psi)\\). Checks: \\(\\sigma(0^\\circ)=\\gamma(1)\\) " +
    "to machine precision; \\(\\gamma\\|\\nu\\|_\\infty\\le\\sigma\\le\\gamma\\|\\nu\\|_1\\) at every angle; " +
    "cross-checked against the 2D cell problem with periodic BC.",

  // Slide: Non-local interactions / Isotropy at last — rotational invariance of J
  rotJ:
    "<b>Radial \\(J\\Rightarrow\\) isotropic \\(\\sigma_0\\): a continuum statement.</b> On \\(\\mathbb Z^d\\) at " +
    "fixed \\(\\delta\\), a radial \\(J\\) is invariant only under the cubic point group, so \\(\\sigma_0\\) would still be " +
    "anisotropic. After \\(\\delta\\to0\\) the sum becomes the rotation-invariant integral " +
    "\\(\\tfrac14\\iint J_\\varepsilon(x-y)(\\varphi(x)-\\varphi(y))^2\\). The Alberti–Bellettini cell formula then gives " +
    "\\(\\sigma_0(\\nu)\\) through the <b>normal marginal</b> of the kernel, " +
    "\\[\\widehat J_\\nu(r)=\\int_{\\nu^\\perp}J(r\\nu+z')\\,dz';\\] " +
    "for radial \\(J\\), \\(\\widehat J_\\nu(r)=\\int_{\\nu^\\perp}\\tilde J(\\sqrt{r^2+|z'|^2})\\,dz'\\) is " +
    "independent of \\(\\nu\\), hence \\(\\sigma_0\\) is constant. By Euler–Maclaurin the residual lattice " +
    "anisotropy is \\(O((\\delta\\varepsilon)^2)\\) and vanishes precisely as \\(\\delta\\to0\\) (range \\(\\gg\\) spacing).",

  // Slide: The anisotropic surface tension — the real cell formula and why d=2
  cell:
    "<b>The real cell formula, and why the simplex form is \\(d=2\\).</b> The genuine surface tension is " +
    "\\[\\sigma(\\nu)=\\lim_{T\\to\\infty}\\frac{1}{T^{d-1}}\\inf\\Big\\{F(\\varphi,Q_T^\\nu):\\varphi=u_\\nu\\text{ near }\\partial Q_T^\\nu\\Big\\},\\] " +
    "the energy per unit area of an optimal transition layer of normal \\(\\nu\\) in a large cube " +
    "\\(Q_T^\\nu\\) — valid in all \\(d\\). In general one only has " +
    "\\(\\sigma_{\\mathrm{slice}}(\\nu)=\\sup_{\\lambda\\in\\Delta}\\sum_i\\gamma(\\lambda_i)|\\nu_i|\\le\\sigma_{\\mathrm{cell}}(\\nu)\\). " +
    "<b>Equality holds in \\(d=2\\)</b>: there the optimal interface is a 1D staircase that decouples into " +
    "independent transitions along the two axes, with \\(\\lambda\\) splitting the bulk-potential budget — " +
    "exactly the simplex sup. In \\(d\\ge3\\) the optimal interface is genuinely \\((d{-}1)\\)-dimensional and " +
    "need not decouple, so the simplex formula is generally only a bound."
};

(function () {
  "use strict";
  function init() {
    const N = window.NOTES || {};
    const notes = [...document.querySelectorAll(".note")];
    notes.forEach(el => { el.textContent = "ⓘ"; });   // ⓘ glyph

    let pop = document.getElementById("note-pop");
    if (!pop) { pop = document.createElement("div"); pop.id = "note-pop"; document.body.appendChild(pop); }
    let pinned = false;

    function typeset() { if (window.MathJax && MathJax.typesetPromise) MathJax.typesetPromise([pop]).catch(()=>{}); }
    function show(el) {
      pop.innerHTML = N[el.dataset.n] || ("<i>missing note: " + el.dataset.n + "</i>");
      pop.classList.add("show"); typeset();
      const r = el.getBoundingClientRect();
      const pw = Math.min(620, window.innerWidth - 24);
      pop.style.maxWidth = pw + "px";
      requestAnimationFrame(() => {
        const ph = pop.offsetHeight; let left = r.left - 20, top = r.bottom + 10;
        if (left + pw > window.innerWidth - 12) left = window.innerWidth - 12 - pw;
        if (left < 12) left = 12;
        if (top + ph > window.innerHeight - 12) top = Math.max(12, r.top - ph - 10);
        pop.style.left = left + "px"; pop.style.top = top + "px";
      });
    }
    function hide() { if (!pinned) pop.classList.remove("show"); }

    notes.forEach(el => {
      el.addEventListener("mouseenter", () => { if (!pinned) show(el); });
      el.addEventListener("mouseleave", hide);
      el.addEventListener("click", e => {
        e.stopPropagation();
        if (pinned && pop._owner === el) { pinned = false; pop.classList.remove("show"); }
        else { pinned = true; pop._owner = el; show(el); }
      });
    });
    document.addEventListener("click", () => { pinned = false; pop.classList.remove("show"); });
    if (window.Reveal && Reveal.on) Reveal.on("slidechanged", () => { pinned = false; pop.classList.remove("show"); });
  }
  if (document.readyState !== "loading") setTimeout(init, 0);
  else document.addEventListener("DOMContentLoaded", init);
})();
