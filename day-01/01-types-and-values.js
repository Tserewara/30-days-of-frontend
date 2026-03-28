// ============================================
// 01 - Tipos e Valores
// Primitivos vs Objetos de Referência
// ============================================

// --- PRIMITIVOS: copiados por valor ---

let a = 10;
let b = a; // copia o valor 10
b = 20;
console.log(a); // 10 — a não foi afetado
console.log(b); // 20

// Cada variável tem sua própria cópia independente.
// Não existe conexão entre a e b após o assignment.

// --- OBJETOS: copiados por referência ---

let user = { name: "João" };
let newUser = user; // copia a referência (endereço de memória)
newUser.name = "Pedro";
console.log(user.name); // "Pedro" — mesmo objeto na heap

// user e newUser apontam pro mesmo objeto.
// Modificar via uma variável afeta a outra.

// --- const protege o binding, não o conteúdo ---

const config = { debug: true };
config.debug = false; // funciona!
console.log(config.debug); // false

// config = {}; // TypeError: Assignment to constant variable.
// const trava a seta (binding), não o alvo (objeto).

// --- Strings são primitivos (imutáveis) ---

let name = "João";
name[0] = "j";
console.log(name); // "João" — não mudou

// Qualquer operação em string cria uma nova string.
// .toUpperCase(), .slice(), concatenação — todas retornam novas strings.

// --- Passagem de argumentos segue a mesma regra ---

function changeStuff(num, obj) {
  num = num + 1;     // reatribui cópia local do primitivo
  obj.name = "changed"; // modifica o objeto compartilhado
}

let myNum = 10;
let myObj = { name: "original" };

changeStuff(myNum, myObj);
console.log(myNum);     // 10 — primitivo: cópia independente
console.log(myObj.name); // "changed" — objeto: mesma referência

// Importante: se dentro da função fizéssemos obj = { name: "new" },
// myObj NÃO mudaria. Reatribuir a variável local não afeta o original.
// Mutar o objeto (via propriedade) é diferente de reatribuir a variável.