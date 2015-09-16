export function setCompanies(symbols, {pathname, key}) {
  symbols = symbols.map(s => s.symbol || s);
  var stuff = pathname.split('/');
  stuff[1] = symbols.map(s => s.toUpperCase()).join(',');
  stuff[0] = stuff[0] || '#';
  if (!stuff[stuff.length-1]) {
    stuff.length -= 1;
  }
  window.location = stuff.join('/') + '/?_k=' + key;
}