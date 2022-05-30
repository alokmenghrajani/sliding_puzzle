/**
 * Like modulo, but always returns a positive value.
 */
function positiveMod(n, d) {
  const r = n % d;
  return (r < 0) ? r + d : r;
}

module.exports = positiveMod
