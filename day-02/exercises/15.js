// Exemplo 

// const promise = fetch('https://jsonplaceholder.typicode.com/users/1')
//   .then(r => r.json());

// // Dois .then() registrados na MESMA promise
// // Os dois executam quando a promise resolver
// promise.then(user => console.log('Nome:', user.name));
// promise.then(user => console.log('Email:', user.email));

// Crie uma Promise que busca o post 1. Registre três .then() separados na mesma Promise: um que loga o title,
// outro que loga o body, e outro que loga o userId. Os três devem executar independentemente quando a Promise resolver.
// Isso é diferente de .then().then().then() (chain) — aqui são três branches a partir da mesma Promise.



const postPromise = fetch('https://jsonplaceholder.typicode.com/posts/1').then(r => r.json());

postPromise.then(post => console.log('Title: ', post.title))
postPromise.then(post => console.log('Body: ', post.body))
postPromise.then(post => console.log('User Id: ', post.userId))