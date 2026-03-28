// ============================================
// 04 - memoize
// Closure + Map como cache privado
// ============================================

// Problema: temos uma função cara e queremos cachear resultados
// por argumentos para evitar recomputação.

const memoize = (fn) => {
  const cache = new Map();

  return (...args) => {
    const key = JSON.stringify(args);

    if (cache.has(key)) {
      return cache.get(key);
    }

    const result = fn(...args);
    cache.set(key, result);
    return result;
  };
};

// --- Uso ---

const expensiveSquare = memoize((n) => {
  console.log("calculando...");
  return n * n;
});

console.log(expensiveSquare(4)); // "calculando..." → 16
console.log(expensiveSquare(4)); // 16 (sem log — veio do cache)
console.log(expensiveSquare(5)); // "calculando..." → 25
console.log(expensiveSquare(4)); // 16 (ainda no cache)

// --- O que acontece por dentro ---
//
// memoize(fn) cria um environment record com:
//   { fn: slowSquare, cache: Map {} }
//
// A função retornada fecha sobre esse environment record.
// Cada chamada consulta e atualiza o mesmo cache via closure.
//
// cache vive no environment record — ninguém de fora acessa ou limpa.

// --- Notas de design ---
//
// 1. JSON.stringify(args) como chave funciona pra primitivos,
//    mas falha com objetos (dois objetos iguais em conteúdo
//    geram a mesma string, mas talvez não deveriam ser iguais).
//
// 2. Esse cache cresce pra sempre. Sem limite de tamanho, sem TTL.
//    Em produção, adicionaria um LRU (least recently used).
//    Conexão com closures e GC: o cache é um environment record
//    que nunca é coletado enquanto a closure existir.