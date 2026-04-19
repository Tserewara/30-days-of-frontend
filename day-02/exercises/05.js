function getUser(id) {
    return new Promise((resolve, reject) => {
        fetch(`https://jsonplaceholder.typicode.com/users/${id}`)
            .then(response => response.json())
            .then(user => resolve(user.name))
            .catch(error => reject(error));
    });
}

// getUser(1).then(name => console.log(name));

// Crie getPostTitle(id) que retorna uma Promise. A Promise deve buscar o post em /posts/${id} e resolver
// apenas com o título (string), não com o objeto inteiro. Se o fetch falhar, rejeita com o erro.

function getPostTitle(id) {
    return new Promise((resolve, reject) => {
        fetch(`https://jsonplaceholder.typicode.com/posts/${id}`)
            .then(response => response.json())
            .then(post => resolve(post.title))
            .catch(error => reject(error))
    })
}

getPostTitle(1).then(response => console.log(response)).catch(error => console.log(error))