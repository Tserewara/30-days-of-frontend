async function foo() {
  console.log('foo início');
  await Promise.resolve();
  console.log('foo depois do await');
}

// console.log('1');
// foo();
// console.log('2');
// Saída: 1, "foo início", 2, "foo depois do await"
// O await suspende foo(), controle volta pro escopo global

// Sua vez: Preveja a ordem de saída ANTES de rodar:

async function alpha() {
  console.log('alpha 1');
  await Promise.resolve();
  console.log('alpha 2');
  await Promise.resolve();
  console.log('alpha 3');
}

async function beta() {
  console.log('beta 1');
  await Promise.resolve();
  console.log('beta 2');
}

console.log('start');
alpha();
beta();
console.log('end');

// start
// alpha 1
// beta 1
// end
// alpha 2
// beta 2
// alpha 3