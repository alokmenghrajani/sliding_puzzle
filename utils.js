/**
 * Like modulo, but always returns a positive value.
 */
function positiveMod(n, d) {
  const r = n % d;
  return (r < 0) ? r + Math.abs(d) : r;
}

/**
 * Returns an integer in [0,n-1].
 */
function randInt(n) {
  let i = Math.floor(Math.random() * n);
  return i;
}

module.exports = { positiveMod, randInt }
