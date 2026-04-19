// Exemplo

function validateAge(age) {
    return new Promise((resolve, reject) => {
        if (age >= 18) {
            resolve('Maior de idade');
        } else {
            reject(new Error('Menor de idade'));
        }
    });
}

// validateAge(20).then(msg => console.log(msg));
// validateAge(15).catch(err => console.log(err.message));

// Crie validateEmail(email) que retorna uma Promise. Se o email contém @, resolve com 'Email válido'.
// Senão, rejeita com new Error('Email inválido'). Resolve/rejeita sincronamente (sem setTimeout).

function validateEmail(email) {
    return new Promise((resolve, reject) => {
        if (email.includes('@')) resolve('Email válido')
        else { reject(new Error('Email inválido')) }
    })
}

validateEmail('john@doe.com').then(result => console.log(result));
validateEmail('johndoe.com').catch(err => console.log(err.message));