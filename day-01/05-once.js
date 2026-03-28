// ============================================
// 05 - once
// Closure como guard — execução única
// ============================================

// Problema: garantir que uma função execute apenas uma vez.
// Chamadas subsequentes retornam o resultado da primeira execução.

const once = (fn) => {
  let hasBeenCalled = false;
  let result;

  return () => {
    if (hasBeenCalled) return result;
    result = fn();
    hasBeenCalled = true;
    return result;
  };
};

// --- Uso ---

const initialize = once(() => {
  console.log("inicializando...");
  return { ready: true };
});

console.log(initialize()); // "inicializando..." → { ready: true }
console.log(initialize()); // { ready: true } (sem log — não executou)
console.log(initialize()); // { ready: true } (idem)

// --- O que acontece por dentro ---
//
// once(fn) cria um environment record com:
//   { fn, hasBeenCalled: false, result: undefined }
//
// Primeira chamada:
//   hasBeenCalled é false → executa fn(), guarda em result,
//   vira flag pra true, retorna result.
//
// Chamadas seguintes:
//   hasBeenCalled é true → retorna result direto. fn nunca mais executa.

// --- Padrão semelhante: limiter ---
// once é um caso específico de limiter(fn, 1).

const limiter = (fn, maxCalls) => {
  let calls = 0;

  return (...args) => {
    if (calls >= maxCalls) return;
    calls++;
    return fn(...args);
  };
};

const greet = limiter((name) => console.log(`Olá, ${name}!`), 2);

greet("João"); // "Olá, João!"
greet("Pedro"); // "Olá, Pedro!"
greet("Tião");  // nada — já usou as 2 chamadas