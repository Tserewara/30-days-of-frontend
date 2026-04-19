// Exemplo

// function sequential(tasks) {
//     return new Promise((resolve, reject) => {
//         const results = [];
//         let index = 0;

//         function next() {
//             if (index >= tasks.length) {
//                 resolve(results);
//                 return;
//             }
//             tasks[index]()
//                 .then(value => {
//                     results.push(value);
//                     index++;
//                     next()
//                 })
//                 .catch(reject);
//         }
//         next();
//     })
// }

// // Exemplo de uso:
// const tasks = [
//   () => Promise.resolve('a'),
//   () => Promise.resolve('b'),
//   () => Promise.resolve('c'),
// ];
// sequential(tasks).then(results => console.log(results)); // ['a', 'b', 'c']

// Crie waterfall(fns) — recebe um array de funções que retornam Promises. Executa cada uma em sequência (não em paralelo).
// O resultado de cada função é passado como argumento para a próxima. Retorna uma Promise com o resultado final.

function waterfall(fns) {
    if (fns.length === 0) return Promise.resolve();

    let promise = Promise.resolve();
    for (const fn of fns) {
        promise = promise.then(result => fn(result));
    }
    return promise;
}

const tasks = [
  () => Promise.resolve(5),          // começa a cadeia
  (x) => Promise.resolve(x * 2),     // recebe 5 → retorna 10
  (x) => Promise.resolve(x + 12)     // recebe 10 → retorna 22
];

waterfall(tasks)
  .then(result => console.log(result)) // 22
  .catch(err => console.error(err));