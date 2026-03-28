// ============================================
// 06 - pipe
// Closure + reduce para composição de funções
// ============================================

// Problema: aplicar várias funções em sequência a um valor,
// onde o resultado de uma vira o input da próxima.

const pipe = (...fns) => {
  return (value) => fns.reduce((acc, fn) => fn(acc), value);
};

// --- Uso ---

const double  = (x) => x * 2;
const addOne  = (x) => x + 1;
const square  = (x) => x * x;

const transform = pipe(double, addOne, square);

console.log(transform(3)); // double(3)=6 → addOne(6)=7 → square(7)=49
console.log(transform(5)); // double(5)=10 → addOne(10)=11 → square(11)=121

// --- Versão com for loop (mesmo efeito) ---

const pipeWithFor = (...fns) => {
  return (value) => {
    let result = value;
    for (const fn of fns) {
      result = fn(result);
    }
    return result;
  };
};

const transformFor = pipeWithFor(double, addOne, square);
console.log(transformFor(3)); // 49

// --- O que é closure e o que não é ---
//
// fns  → closure (capturado no environment record de pipe)
// value → parâmetro direto (recebido quando transform é chamado)
//
// Regra: se o nome aparece na lista de parâmetros da função,
// é argumento direto. Se não aparece mas é usado no corpo, é closure.

// --- Como reduce funciona aqui ---
//
// reduce percorre o array de funções acumulando um resultado.
// O acumulador começa com value e a cada passo é transformado:
//
// Passo 1: acc=3  (value), fn=double  → double(3)  = 6
// Passo 2: acc=6,          fn=addOne  → addOne(6)  = 7
// Passo 3: acc=7,          fn=square  → square(7)  = 49
//
// É um for com acumulador empacotado numa API.

// --- Exemplo prático: pipeline de processamento ---

const trim       = (s) => s.trim();
const lowercase  = (s) => s.toLowerCase();
const slugify    = (s) => s.replace(/\s+/g, "-");

const toSlug = pipe(trim, lowercase, slugify);

console.log(toSlug("  Hello World  ")); // "hello-world"
console.log(toSlug(" Dia 1 do Intensivo ")); // "dia-1-do-intensivo"