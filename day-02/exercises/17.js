function throttle(fn, ms) {
    let isThrottled = false;
    return function (...args) {
        if (isThrottled) return;
        fn(...args);
        isThrottled = true;
        setTimeout(() => {
            isThrottled = false
        }, ms)
    }
}

const throttledLog = throttle(console.log, 1000);
throttledLog('a'); // executa imediatamente
throttledLog('b'); // ignorado
setTimeout(() => throttledLog('c'), 1500); // executa (passou 1s)