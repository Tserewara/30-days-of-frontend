// ============================================
// 03 - createCounter
// Closure como estado privado (encapsulamento sem classe)
// ============================================

// Problema: queremos um contador com estado privado.
// Ninguém de fora deve conseguir acessar ou modificar count diretamente.

const createCounter = () => {
  let count = 0;

  const increment = () => count++;
  const decrement = () => count--;
  const getCount = () => count;

  return { increment, decrement, getCount };
};

// --- Uso ---

const counter = createCounter();
counter.increment();
counter.increment();
counter.increment();
counter.decrement();

console.log(counter.getCount()); // 2
console.log(counter.count);      // undefined — não exposto

// --- O que acontece por dentro ---
//
// 1. createCounter() cria um execution context com environment record:
//    { count: 0, increment: fn, decrement: fn, getCount: fn }
//
// 2. Retorna um objeto com as três funções.
//    Essas funções mantêm referência ao environment record (closure).
//
// 3. O execution context é destruído, mas o environment record sobrevive
//    porque as três closures apontam pra ele.
//
// 4. count não está no objeto retornado — só é acessível via closures.
//    Isso é encapsulamento sem class, sem private, sem #.

// --- Cada chamada cria um environment record independente ---

const counterA = createCounter();
const counterB = createCounter();

counterA.increment();
counterA.increment();
counterB.increment();

console.log(counterA.getCount()); // 2
console.log(counterB.getCount()); // 1
// Cada contador tem seu próprio count isolado.

// --- As três funções compartilham o MESMO environment record ---
// Quando increment faz count++, getCount vê a mudança
// porque leem do mesmo "caderno".