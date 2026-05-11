// console.log('C');

// setTimeout(() => {
//   console.log('A');
// }, 0);

// Promise.resolve().then(() => {
//   console.log('B');
// });

// console.log('D');

const base_url = 'https://jsonplaceholder.typicode.com'
//fetch('https://jsonplaceholder.typicode.com/users/1')
//     .then(response => response.json())
// .then(user => {
//     console.log(user.name);
//     console.log(user.email)
// })
// .catch(error => {
//     console.error('Falhou:', error);
// });

// fetch(`${base_url}/posts/5`)
//     .then(response => response.json())
//     .then(post => {
//         console.log(`Title: ${post.title}`)
//         console.log(`Body: ${post.body}`)
//     })
//     .catch(error => {
//         console.error('Falhou:', error)
//     })

// async function getUser() {
//   try {
//     const response = await fetch(`${base_url}/users/1`);
//     const user = await response.json();
//     console.log(user.name);
//     console.log(user.email);
//   } catch (error) {
//     console.error('Falhou:', error);
//   }
// }

// getUser();

// async function getUser() {
//   console.log('1 - antes do fetch');
//   const response = await fetch('https://jsonplaceholder.typicode.com/users/1');
//   console.log('2 - depois do fetch');
//   const user = await response.json();
//   console.log('3 - tenho o user:', user.name);
// }

// console.log('A - antes de chamar');
// getUser();
// console.log('B - depois de chamar');

// async function getPost() {
//     try {
//         const response = await fetch(`${base_url}/posts/5`)
//         const post = await response.json()
//         console.log(`Title: ${post.title}`)
//         console.log(`Body: ${post.body}`)
//     }
//     catch (error) {
//         console.error('Falhou:', error)
//     }
// }

// getPost()


// async function getPostComments(){
//     try {
//         const postResponse = await fetch(`${base_url}/posts/1`);
//         const post = await postResponse.json();
//         const commentsResponse = await fetch(`${base_url}/posts/${post.id}/comments`);
//         const comments = await commentsResponse.json();
//         console.log(`O post ${post.id} tem ${comments.length} comentários`)
//     }
//     catch (error) {
//         console.error('Falhou', error)
//     }
// }

// getPostComments()

// async function getPosts() {
//     try {
//         const promise1 = fetch(`${base_url}/posts/1`);
//         const promise2 = fetch(`${base_url}/posts/2`);

//         const response1 = await promise1;
//         const response2 = await promise2;

//         const post1 = await response1.json();
//         const post2 = await response2.json();

//         console.log(`Post 1: ${post1.title}`);
//         console.log(`Post 2: ${post2.title}`);
//     }
//     catch (error) {
//         console.error('Falhou:', error);

//     }
// }

// getPosts();

async function getPosts() {
    try {
        const [response1, response2] = await Promise.all([
            fetch(`${base_url}/posts/1`),
            fetch(`${base_url}/posts/2`),
        ]);

        const [post1, post2] = await Promise.all([
            response1.json(),
            response2.json(),
        ]);

        console.log(`Post 1: ${post1.title}`);
        console.log(`Post 2: ${post2.title}`);
    }
    catch (error) {
        console.error('Falhou:', error);
    }
}

// getPosts()

function myPromiseAll(promises) {
    return new Promise((resolve, reject) => {
        const results = [];
        let resolved = 0;
        const total = promises.length;

        if (total === 0) {
            resolve([]);
            return;
        }


        promises.forEach((promise, index) => {
            promise.then(value => {
                results[index] = value;
                resolved++;

                if (resolved === total) {
                    resolve(results);
                }
            })
                .catch(error => {
                    reject(error);
                })
        })
    })
}

// Teste 1: todas resolvem
// myPromiseAll([
//     fetch('https://jsonplaceholder.typicode.com/posts/1').then(r => r.json()),
//     fetch('https://jsonplaceholder.typicode.com/posts/2').then(r => r.json()),
//     fetch('https://jsonplaceholder.typicode.com/posts/3').then(r => r.json()),
// ]).then(posts => {
//     console.log(posts.map(p => p.title));
// });

// // Teste 2: uma rejeita
// myPromiseAll([
//     fetch('https://jsonplaceholder.typicode.com/posts/1').then(r => r.json()),
//     Promise.reject('ERRO PROPOSITAL'),
//     fetch('https://jsonplaceholder.typicode.com/posts/3').then(r => r.json()),
// ])
//     .then(results => {
//         console.log('Resolveu:', results);
//     })
//     .catch(error => {
//         console.log('Rejeitou:', error);
//     });


async function fetchWithTimeout(url, ms) {
  const controller = new AbortController();

  const timerId = setTimeout(() => {
    controller.abort();
  }, ms);

  try {
    const response = await fetch(url, { signal: controller.signal });
    clearTimeout(timerId);
    return response;
  } catch (error) {
    clearTimeout(timerId);
    throw error;
  }
}

// Cenário 1: responde a tempo (delay de 1s, timeout de 5s)
// fetchWithTimeout('https://httpbin.org/delay/1', 5000)
//   .then(r => console.log('Sucesso:', r.status))
//   .catch(e => console.log('Erro:', e.message));

// Cenário 2: não responde a tempo (delay de 10s, timeout de 2s)
// fetchWithTimeout('https://httpbin.org/delay/10', 2000)
//   .then(r => console.log('Sucesso:', r.status))
//   .catch(e => console.log('Erro:', e.message));


async function retry (fn, attempts, delay) {
    for (let i = 0; i < attempts; i++) {
        try {
            const result = await fn();
            return result;
        } catch (error) {
            if (i === attempts - 1) {
                throw error; 
            }
            await new Promise(resolve => setTimeout(resolve, delay))
        }
    }
}

let attempt = 0;

const unreliableFetch = () => {
  attempt++;
  console.log(`Tentativa ${attempt}...`);
  if (attempt < 3) {
    return Promise.reject('Servidor indisponível');
  }
  return Promise.resolve('Dados recebidos!');
};

retry(unreliableFetch, 5, 1000)
  .then(result => console.log('Sucesso:', result))
  .catch(error => console.log('Falhou de vez:', error));