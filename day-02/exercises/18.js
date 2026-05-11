async function fetchWithRetry(url, attempts) {
    for (let i = 0; i < attempts; i++) {
        try {
            const response = await fetch(url);
            return response;
        } catch (error) {
            if (i === attempts - 1) throw error;
        }
    }
}

// Exemplo de uso:
// Para erro, use uma url que não existe. Ex: https://url-que-nao-existe-xyz.com/api
// fetchWithRetry('https://jsonplaceholder.typicode.com/posts/1', 3)
//   .then(response => response.json())
//   .then(data => console.log(data.title))
//   .catch(err => console.log('Falhou após 3 tentativas'));

// Sua vez: Reimplemente fetchWithTimeout(url, ms) do zero. Usa AbortController para cancelar o fetch se demorar mais que ms
// milissegundos. Se o fetch completar a tempo, cancela o timer.

async function fetchWithTimeout(url, ms) {
    const controller = new AbortController()
    const { signal } = controller;

    const timeoutId = setTimeout(() => {
        controller.abort();
    }, ms);

    try {
        const response = await fetch(url, { signal });
        return response;
    } catch (error) {
        if (error.name === 'AbortError') {
            throw new Error(ms);
        }
        throw error;
    } finally {
        clearTimeout(timeoutId);
    }
}

// Deve funcionar (delay 1s, timeout 5s)
// fetchWithTimeout('https://httpbin.org/delay/1', 5000)
//     .then(r => console.log('OK:', r.status));

// // Deve dar timeout (delay 10s, timeout 2s)
fetchWithTimeout('https://httpbin.org/delay/10', 2000)
    .catch(err => console.log('Timeout:', err.message));