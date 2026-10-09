'use strict';
window.WG_Runtime = {
  staticHosting: /(^|\.)github\.io$/.test(location.hostname) || window.WG_STATIC_HOSTING === true,
  asset: function(value) { return new URL(value.replace(/^\//,''),new URL('.',document.baseURI)).href; }
};
