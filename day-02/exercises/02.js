// Exemplo resolvido

function delayedError() {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            reject(new Error('Timeout expirou'))
        }, 2000);
    });
}

// delayedError().catch(err => { console.log(err.message) })

// Exercício
// Crie riskyOperation(shouldFail) que retorna uma Promise.
// Se shouldFail for true, rejeita depois de 300ms com new Error('Operação falhou').
// Se for false, resolve depois de 300ms com 'Sucesso!'.

function riskyOperation(shouldFail) {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            if (shouldFail) reject(new Error('Operação falhou'));
            resolve('Sucesso!')
        })
    })
}

riskyOperation(true).then(result => console.log(result)).catch(err => console.log(err.message))