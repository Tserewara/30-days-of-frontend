// Exemplo
// function resolveOrTimeout(promise, ms) {
//     return new Promise((resolve, reject) => {
//         const timer = setTimeout(() => {
//             reject(new Error('Timeout'));
//         }, ms);

//         promise.then(value => {
//             clearTimeout(timer);
//             resolve(value);
//         }).catch(error => {
//             clearTimeout(timer);
//             reject(error);
//         });
//     })
// }

// const result = resolveOrTimeout(fetch('https://jsonplaceholder.typicode.com/todos/1'), 1000)
//     .then(response => response.json())
//     .then( data => console.log(data))
//     .catch(err => console.log(err.message));

// firstToResolve(promise1, promise2) que retorna uma Promise. A Promise deve resolver com o valor da primeira Promise
// que resolver entre as duas. A outra é ignorada. (Dica: registre .then() nas duas, o primeiro resolve() ganha — o segundo
// é ignorado pela regra de transição única).

function firstToResolve(promiseOne, promiseTwo) {
    return new Promise((resolve, reject) => {
        promiseOne.then(resolve).catch(reject);
        promiseTwo.then(resolve).catch(reject);
    })
}

const p1 = new Promise(res => setTimeout(() => res("A"), 200));
const p2 = new Promise(res => setTimeout(() => res("B"), 1000));

firstToResolve(p1, p2).then(console.log); 