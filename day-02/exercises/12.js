// Exemplo

// console.log('1');
// setTimeout(()=> console.log('2'), 0);
// Promise.resolve().then(() => console.log('3'));
// console.log('4');

//Escreva a ordem e a justificativa de cada passo. Depois rode para confirmar.
console.log('A');

setTimeout(() => console.log('B'), 0);

Promise.resolve()
  .then(() => {
    console.log('C');
    return Promise.resolve();
  })
  .then(() => console.log('D'));

Promise.resolve().then(() => console.log('E'));

console.log('F');