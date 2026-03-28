// ============================================
// 02 - Funções como Valores
// First-class functions e higher-order functions
// ============================================

// Funções em JS são valores como qualquer outro.
// Podem ser armazenadas, passadas como argumento, e retornadas.

// --- Fábrica de funções (function factories) ---

// minValue retorna uma função que filtra por valor mínimo.
// É uma higher-order function: recebe ou retorna uma função.
const minValue = (min) => (t) => t > min;

const filterAbove100 = minValue(100);
const filterAbove200 = minValue(200);

// filterAbove100 é agora (t) => t > 100
// filterAbove200 é agora (t) => t > 200
// Cada uma "lembra" do seu min via closure.

const transactions = [100, 250, 50, 400, 75];

console.log(transactions.filter(filterAbove100));
// [250, 400]

console.log(transactions.filter(filterAbove200));
// [400]

// --- Composição: funções que transformam dados ---

const applyTax = (rate) => (t) => t * (1 - rate);

// As regras de negócio viram combinações de funções:
console.log(transactions.filter(minValue(100)).map(applyTax(0.1)));
// [225, 360]

// Se a regra muda, troca a função — não edita um if/else:
console.log(transactions.filter(minValue(200)).map(applyTax(0.15)));
// [340]

// --- Por que isso importa ---
// Esse padrão é a base de:
// - Closures (próximo snippet)
// - Callbacks e event handlers
// - Hooks do React (useEffect, useCallback, etc.)
// - Middleware em Express/Koa