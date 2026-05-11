// Exemplo

// API original — baseada em callback
// setTimeout(() => console.log('pronto'), 1000);

// Embrulhada numa Promise — agora posso usar .then() ou await
function setTimeoutPromise(ms) {
    return new Promise((resolve) => {
        setTimeout(resolve, ms); // resolve É o callback — quando o timer dispara, chama resolve
    });
}

// setTimeoutPromise(1000).then(() => console.log('pronto'));

// EXERCÍCIO
// getPositionPromise() — um wrapper que transforma navigator.geolocation.getCurrentPosition em uma Promise.
// Essa API recebe dois callbacks: um de sucesso (recebe position) e um de erro (recebe error).
// Sua Promise deve resolver com position.coords em caso de sucesso, e rejeitar com o erro em caso de falha.
// Teste com: getPositionPromise().then(coords => console.log(coords.latitude)).catch(err => console.log(err.message)).

function getPositionPromise() {
    return new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                resolve(position.coords)
            },
            (error) => {
                reject(error)
            }
        )
    })
}

getPositionPromise().then(coords => console.log(coords.latitude)).catch(err => console.log(err.message))