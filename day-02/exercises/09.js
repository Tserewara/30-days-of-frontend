// exemplo

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms))
}

async function demo() {
    console.log('Início');
    await sleep(1000);
    console.log('1 segundo depois')
}
// demo()

// Crie uma função `countdown(n)` que faz contagem regressiva de `n` até 1, logando cada número com 1 segundo de intervalo.
// Use `sleep` e um loop. Ao final, logue `'Go!'`.

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms))
}
async function countdown(n) {
    for (n; n > 0; n--) {
        console.log(n);
        await sleep(1000)

    }
    console.log('Go!')
}


countdown(4)