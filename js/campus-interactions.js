/* Cosmetic enhancement only: never intercept or submit a business action. */
(function () {
  'use strict';
  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  function feedback(target, x, y) {
    if (reduced.matches || !target || target.disabled || target.getAttribute('aria-disabled') === 'true' || target.getAttribute('aria-busy') === 'true') return;
    var r = target.getBoundingClientRect();
    if (!r.width || !r.height || !Element.prototype.animate) return;
    // Keep a short-lived global effect so rerendered controls do not retain nodes.
    var glow = document.createElement('span');
    glow.className = 'campus-click-aura';glow.setAttribute('aria-hidden', 'true');
    glow.style.left = (typeof x === 'number' ? x : r.left + r.width / 2) - 22 + 'px';
    glow.style.top = (typeof y === 'number' ? y : r.top + r.height / 2) - 22 + 'px';
    document.body.appendChild(glow);
    var animation = glow.animate([{opacity: .8, transform: 'scale(.35)'}, {opacity: 0, transform: 'scale(1.5)'}], {duration: 420, easing: 'ease-out'});
    animation.finished.then(function () {glow.remove();}, function () {glow.remove();});
  }
  var selector = '.btn, .wt-btn, .atlas-map-node, .atlas-zoom-tools button, .atlas-course-tabs button, .community-tabs button, .sr-ctrl-btn, .sr-btn-tool, .sec-more';
  document.addEventListener('pointerdown', function (e) {
    if (e.button !== 0) return;
    feedback(e.target.closest && e.target.closest(selector), e.clientX, e.clientY);
  }, {passive: true});
  document.addEventListener('keydown', function (e) {
    if (e.repeat || (e.key !== 'Enter' && e.key !== ' ')) return;
    feedback(e.target.closest && e.target.closest(selector));
  });
})();
