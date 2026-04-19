function myPromiseAll(promises) {
    return new Promise((resolve, reject) => {
        const results = [];
        let resolved = 0;
        const total = promises.length;
        if (total === 0) { resolve([]); return; }
        promises.forEach((promise, index) => {
            promise.then(value => {
                results[index] = value;
                resolved++;
                if (resolved === total) resolve(results);
            }).catch(error => reject(error));
        });
    });
}

// // Exemplo de uso:
// myPromiseAll([
//     Promise.resolve('a'),
//     Promise.resolve('b'),
//     Promise.resolve('c'),
// ]).then(results => console.log(results)); // ['a', 'b', 'c']

// // Caso de rejeição:
// myPromiseAll([
//     Promise.resolve('a'),
//     Promise.reject(new Error('falhou')),
//     Promise.resolve('c'),
// ]).catch(err => console.log(err.message)); // 'falhou'

// Crie myPromiseAllSettled(promises) — similar ao myPromiseAll, mas nunca rejeita. Retorna uma Promise que resolve com um
// array de objetos. Cada objeto é { status: 'fulfilled', value } ou { status: 'rejected', reason }. Espera todas as Promises
// terminarem, independente de sucesso ou falha.

function myPromiseAllSettled(promises) {
    return new Promise((resolve, reject) => {
        const results = [];
        let count = 0;
        const total = promises.length;
        if (total === 0) { resolve([]); return; }
        promises.forEach((promise, index) => {
            promise.then(value => {
                results[index] = {
                    status: 'fulfilled',
                    value
                };
                count++;
                if (count === total) resolve(results);
            }).catch(error => {
                results[index] = {
                    status: 'rejected',
                    reason: error
                };
                count++;
                if (count === total) resolve(results);

            });
        });
    })
}

myPromiseAllSettled([
    Promise.resolve('ok'),
    Promise.reject(new Error('falhou')),
    Promise.resolve(42),
]).then(results => console.log(results));
// [
//   { status: 'fulfilled', value: 'ok' },
//   { status: 'rejected', reason: Error('falhou') },
//   { status: 'fulfilled', value: 42 }
// ]