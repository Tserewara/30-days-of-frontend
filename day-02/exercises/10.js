async function waitForCondition(checkFn, intervalMs, maxAttempts) {
    for (let i = 0; i < maxAttempts; i++) {
        if (checkFn()) return true;
        await new Promise(resolve => setTimeout(resolve, intervalMs));
    }
    return false;
}

// Exemplo de uso:
let ready = false;
// setTimeout(() => { ready = true; }, 3000); // simula algo ficando pronto em 3s

// waitForCondition(() => ready, 300, 10)
//     .then(result => console.log('Ficou pronto?', result)); // true (após ~3s)

// Crie pollApi(url, intervalMs, maxAttempts) que faz fetch na url a cada intervalMs milissegundos. Se a resposta for 200,
// retorna os dados (JSON parseado). Se após maxAttempts ainda não retornou 200, rejeita com new Error('Polling expirou').
// Use sleep entre tentativas.

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function pollApi(url, intervalMs, maxAttempts) {
    for (let i = 0; i < maxAttempts; i++) {
        try {
            const response = await fetch(url);
            if (response.status === 200) return await response.json()
            await sleep(intervalMs);
        } catch (error) {
            await sleep(intervalMs);
        }
    }
    throw new Error('Polling expirou')
}

// Deve retornar os dados na primeira tentativa (API sempre retorna 200)
// pollApi('https://jsonplaceholder.typicode.com/posts/1', 1000, 5)
//   .then(data => console.log(data.title))
//   .catch(err => console.log(err.message));

// httpbin retorna 404 garantido
pollApi('https://httpbin.org/status/404', 500, 3)
    .then(data => console.log(data))
    .catch(err => console.log(err.message)); // "Polling expirou"