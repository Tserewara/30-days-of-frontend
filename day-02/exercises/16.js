function throttle(fn, ms) {
    let isThrottled = false;
    return function (...args) {
        if (isThrottled) return;
        fn(...args)
        isThrottled = true;
        setTimeout(() => {
            isThrottled = false;
        }, ms)
    }
}

// Exemplo de uso:
// const throttledLog = throttle(console.log, 1000);
// throttledLog('a'); // executa
// throttledLog('b'); // ignorado (dentro de 1s)
// setTimeout(() => throttledLog('c'), 1500); // executa (passou 1s)

// Sua vez: Reimplemente debounce(fn, ms) do zero, sem olhar a solução.
// Lembre: debounce espera a atividade parar por ms milissegundos antes de executar. Cada nova chamada reseta o timer.


function debounce(fn, ms) {
    let timerId = null;
    return function (...args) {
        clearTimeout(timerId);
        timerId = setTimeout(() => {
            fn(...args);
        }, ms)
    }
}

const debouncedLog = debounce(console.log, 500);
debouncedLog('a'); // timer inicia
debouncedLog('b'); // timer reseta — após 500ms de silêncio, loga 'b'