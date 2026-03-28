# JavaScript por Dentro: Tipos, Funções e Closures

*Dia 1 do intensivo de 30 dias de frontend — reconstruindo fundamentos com profundidade.*

---

Esse é o primeiro dia do meu intensivo de 30 dias de frontend. O objetivo é revisitar os fundamentos de JavaScript, entendendo o que acontece "por baixo do capô". Hoje vamos falar sobre tipos de valores, funções como cidadãos de primeira classe, e o mecanismo de closures.

## Dois universos de valores

JavaScript tem dois tipos fundamentais de valores. É importante entender essa diferença pois ela afeta como as variáveis se comportam, como o garbage collector funciona, e como o React decide quando re-renderizar.

**Primitivos** — `string`, `number`, `boolean`, `null`, `undefined`, `symbol`, `bigint`. São imutáveis e copiados por valor:

```javascript
let a = 10;
let b = a;  // copia o valor 10
b = 20;
console.log(a); // 10 — a não foi afetado
```

Cada variável tem sua própria cópia independente. Não existe conexão entre `a` e `b` após o assignment. Ou seja, sempre que atribuímos um primitivo, estamos criando uma nova cópia do valor. No Python, isso é similar a tipos imutáveis como `int` e `str`.

**Objetos** — `object`, `array`, `function`, `Map`, `Set`, `Date`... São mutáveis e copiados por referência:

```javascript
let user = { name: "João" };
let newUser = user;  // copia a referência (endereço de memória)
newUser.name = "Pedro";
console.log(user.name); // "Pedro" — mesmo objeto
```

`user` e `newUser` apontam pro mesmo objeto na heap (pense na heap como uma grande área de memória onde objetos são armazenados). Modificar via uma variável afeta a outra. Em Python, isso é similar a tipos mutáveis como `list` e `dict`, onde múltiplas variáveis podem referenciar o mesmo objeto.

### A pegadinha do `const`

Veja o que acontece quando usamos `const` com objetos:
```javascript
const user = { name: "João" };
user.name = "Pedro"; // funciona!
console.log(user.name); // "Pedro"
```

Mas const não força o objeto a ser imutável? Não. `const` não significa imutável. Ele protege o **binding** — você não pode fazer `user = outroObjeto`. Mas o objeto pra onde `user` aponta continua mutável. `const` trava a seta, não o alvo.

### Strings são primitivos

Vamos fazer um pequeno experimento com strings, que são primitivos. Considere o seguinte código:

```javascript
let name = "João";
name[0] = "j";
console.log(name); // O que será impresso?
```

À primeira vista, alguém poderia esperar que `name` se tornasse "joão". No entanto, isso não acontece. A saída será "João". Isso ocorre porque strings em JavaScript são imutáveis. Quando tentamos modificar um caractere específico, estamos tentando alterar a string original, o que não é permitido. Qualquer operação que pareça modificar uma string (`.toUpperCase()`, `.slice()`, concatenação) na verdade cria uma nova string. Mesmo com `let`, o resultado seria o mesmo.

### Por que isso importa no React

Quando o React compara props pra decidir se re-renderiza, ele usa `===`. Para primitivos, `===` compara valor. Para objetos, compara referência — e `{ a: 1 } === { a: 1 }` é `false`, porque são dois objetos diferentes na heap. Essa é a raiz de muitos bugs de re-render desnecessário. Por enquanto, não vamos nos aprofundar nisso, mas é importante ter essa distinção em mente.

---

## Funções como valores

Em JavaScript, funções também são valores. Elas podem ser atribuídas a variáveis, passadas como argumentos, e retornadas de outras funções. Isso é o que chamamos de "first-class functions" — elas são cidadãos de primeira classe na linguagem.

```javascript
const minValue = (min) => (t) => t > min;
// criamos uma função que retorna uma função anônima. Essa função anônima recebe um argumento `t` e compara com `min`.

const filterAbove100 = minValue(100);
// `filterAbove100` é agora uma função que recebe `t` e retorna `t > 100`. Ela "lembra" que `min` era `100` porque fechou sobre o escopo onde `min` foi definido. Mais sobre isso em breve.

const filterAbove200 = minValue(200);

[100, 250, 50, 400].filter(filterAbove100);
// [250, 400]
```

`minValue(100)` não filtra nada — ela **retorna uma função** que filtra. É uma fábrica de funções. E aqui surge a pergunta: quando `minValue(100)` termina de executar e retorna `(t) => t > min`, como a função retornada ainda "sabe" que `min` é `100`?

A resposta é closure.

---

## Closures: o mecanismo

### O modelo mental

Sempre que uma função é chamada, o motor de JavaScript cria um novo **execution context**. Pense nisso como uma bancada de trabalho. Nessa bancada, o motor coloca um **environment record** — um registro onde ele anota as variáveis locais e seus valores. Pense nisso como um caderno de anotações. Quando a função termina de executar, a bancada é desmontada e o caderno é descartado. Mas imagine que essa função retorne outra função que faz referência a uma variável do caderno. Quando a função retornada é chamada, ela precisa acessar aquela variável. Nesse caso, o caderno não é destruído — ele é mantido vivo enquanto a função retornada mantiver uma referência a ele. Essa combinação de função + "caderno" é o que chamamos de closure.

Quando `minValue(100)` executa:

1. O motor cria uma bancada com o environment record: `min → 100`
2. O corpo da função cria `(t) => t > min` — uma função que **referencia `min`**, variável do escopo pai
3. `minValue(100)` retorna essa função e termina de executar
4. A bancada (execution context) é destruída, mas o **caderno** (environment record) sobrevive — porque a função retornada mantém uma referência pra ele

Esse par — função + referência ao environment record do escopo onde nasceu — é a **closure**.

### Definição

Uma closure é uma função que mantém uma referência ao environment record do escopo onde foi criada, permitindo que ela acesse variáveis desse escopo mesmo depois que ele terminou de executar.

### E o garbage collector?

O environment record é um objeto na heap como qualquer outro. O GC usa um algoritmo de **mark-and-sweep**: parte das raízes (variáveis globais, call stack ativa), segue todos os ponteiros de objeto em objeto, e marca tudo que alcança como vivo. Tudo que não foi alcançado é liberado.

A closure se encaixa nesse mecanismo de forma simples: a função retornada contém internamente um ponteiro pro environment record do pai. Enquanto a função for alcançável a partir de alguma raiz, o GC segue essa cadeia de ponteiros e encontra o environment record no caminho — então ele sobrevive. Se a função for descartada (sair de escopo, ser sobrescrita), o ponteiro morre, o GC não chega mais no environment record, e ele é coletado.

Não existe decisão inteligente. É um algoritmo mecânico: alcançável = vivo, inalcançável = lixo.

---

## Closures na prática

### Estado privado sem classes

Imagine que queremos criar um contador, mas não queremos manter uma variável global que possa ser modificada por qualquer parte do código. Podemos usar uma closure para encapsular o estado:

```javascript
const createCounter = () => {
  let count = 0;
  
  const increment = () => count++;
  const decrement = () => count--;
  const getCount = () => count;
  
  return { increment, decrement, getCount };
};

const counter = createCounter();
counter.increment();
counter.increment();
console.log(counter.getCount()); // 2
console.log(counter.count);      // undefined
```

`count` não está no objeto retornado. A única forma de acessá-lo é pelas três funções que fecham sobre o environment record. Isso é encapsulamento via closure — antes de `class` e `#private` existirem em JS.

As três funções compartilham o **mesmo** environment record. Quando `increment` faz `count++`, `getCount` vê a mudança porque leem do mesmo caderno. E cada chamada a `createCounter()` cria um novo environment record com seu próprio `count`, então cada contador tem estado privado independente.

### Cache com `memoize`

Agora imagine que temos uma função para calcular algo que demora e queremos cachear os resultados para evitar recomputação. Podemos usar uma closure para manter um cache privado:

```javascript
const memoize = (fn) => {
  const cache = new Map();
  
  return (...args) => {
    const key = JSON.stringify(args);
    if (cache.has(key)) return cache.get(key);
    
    const result = fn(...args);
    cache.set(key, result);
    return result;
  };
};

const expensiveSquare = memoize((n) => {
  console.log("calculando...");
  return n * n;
});

expensiveSquare(4); // "calculando..." → 16
expensiveSquare(4); // 16 (sem log — veio do cache)
expensiveSquare(5); // "calculando..." → 25
```

Note que `cache` vive no environment record da closure. Ninguém de fora acessa ou limpa o cache. O cache é privado e persistente enquanto a função memoizada for alcançável.

### Execução única com `once`

Agora imagine que por algum motivo queremos garantir que uma função só seja executada uma vez — por exemplo, uma inicialização que não pode ser repetida. Podemos usar uma closure para criar um guard:

```javascript
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
```

Mesmo padrão: variável no environment record do pai (`hasBeenCalled`) atua como guard. Na primeira chamada, executa `fn` e guarda o resultado. Nas seguintes, retorna do cache.

### Composição com `pipe`

Por fim, imagine que temos várias funções e queremos aplicá-las em sequência a um valor. Podemos usar uma closure para criar uma função de composição:

```javascript
const pipe = (...fns) => {
  return (value) => fns.reduce((acc, fn) => fn(acc), value);
};

const transform = pipe(
  (x) => x * 2,
  (x) => x + 1,
  (x) => x * x
);

transform(3); // 2*3=6 → 6+1=7 → 7*7=49
```

`fns` é capturado no environment record. `value` é parâmetro direto — não é closure. A regra pra distinguir: se o nome aparece na lista de parâmetros da função, é argumento direto. Se não aparece mas é usado no corpo, é closure.

O `reduce` aqui funciona como um `for` com acumulador: começa com `value`, passa pela primeira função, o resultado vira input da segunda, e assim por diante. Cada função transforma o acumulador.

---

## Resumo do dia

Três conceitos que se encadeiam:

1. **Tipos**: dois universos (primitivos por valor, objetos por referência). `const` protege binding, não conteúdo.
2. **Funções como valores**: first-class, podem ser passadas e retornadas. Habilitam higher-order functions.
3. **Closures**: função + referência ao environment record do escopo pai. Criam estado privado, caches, guards. O environment record sobrevive na heap enquanto a closure for alcançável.

---

*Este artigo faz parte do meu [intensivo de 30 dias de frontend](https://github.com/Tserewara/30-days-of-frontend).*