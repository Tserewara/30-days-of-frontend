// MODELO
// resolver promise com delay

function delayedValue() {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            resolve(42);
        }, 1000);
    });
}

delayedValue()//.then(value => console.log(value)); // 42 (depois de 1s)

// EXERCÍCIO 

// Crie delayedGreeting(name) que retorna uma Promise. A Promise deve resolver depois de 500ms com a string 'Olá, ${name}!'

function delayedGreeting(name) {
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve(`Olá, ${name}!`)
        }, 500);
    });
}

// delayedGreeting('João').then(value => console.log(value));
// const p = new Promise((resolve) => {   // ← executor: roda AGORA, síncrono
//     console.log('executor rodou');
//     resolve(42);
// });

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms))
}
async function main() {
    sleep(500).then(() => console.log("oi"))
    
}

main()