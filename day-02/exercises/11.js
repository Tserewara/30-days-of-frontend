// exemplo

async function processWithDelay(items, fn, delayMs) {
    const results = [];
    for (const item of items) {
        const result = await fn(item);
        results.push(result);
        await new Promise(resolve => setTimeout(resolve, delayMs))
    }
    return results;
}

// Exemplo de uso:

// processWithDelay([1, 2, 3], async (n) => {
//     console.log(`Processando ${n}`);
//     return n * 10;
// }, 500).then(results => console.log(results));

// Crie fetchPostsSequentially(ids, delayMs) que recebe um array de IDs de posts e busca cada um sequencialmente em
// /posts/${id},com um delay de delayMs entre cada fetch. Retorna um array com os títulos. Logue cada título conforme buscar.

async function fetchPostsSequentially(ids, delayMs) {
    const posts = [];
    for (const id of ids) {
        const response = await fetch(`https://jsonplaceholder.typicode.com/posts/${id}`)
        if (response.status === 200) {
            const post = await response.json()
            const title = post.title;
            console.log(title);
            posts.push(title);
        }
        await new Promise(resolve => setTimeout(resolve, delayMs))
    }
    return posts;
}

fetchPostsSequentially([1, 2, 3, 4, 5], 500).then(posts => console.log(posts))