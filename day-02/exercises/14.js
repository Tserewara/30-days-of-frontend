// Exemplo
// function getUserCity(id) {
//     return fetch(`https://jsonplaceholder.typicode.com/users/${id}`)
//         .then(response => response.json())
//         .then(user => user.address.city);
// }


// getUserCity(1).then(city => console.log(city));

async function getUserCity(id) {
    const response = await fetch(`https://jsonplaceholder.typicode.com/users/${id}`);
    const user = await response.json();
    return user.address.city
}


// getUserCity(1).then(city => console.log(city));

// Converta essa .then() chain para async/await

function getPostWithCommentCount1(postId) {
    let postTitle;
    return fetch(`https://jsonplaceholder.typicode.com/posts/${postId}`)
        .then(response => response.json())
        .then(post => {
            postTitle = post.title;
            return fetch(`https://jsonplaceholder.typicode.com/posts/${postId}/comments`);
        })
        .then(response => response.json())
        .then(comments => {
            return { title: postTitle, commentCount: comments.length };
        });
}

async function getPostWithCommentCount(postId) {
    const postResponse = await fetch(`https://jsonplaceholder.typicode.com/posts/${postId}`);
    const post = await postResponse.json();
    const commentsResponse = await fetch(`https://jsonplaceholder.typicode.com/posts/${postId}/comments`);
    const comments = await commentsResponse.json();
    return { title: post.title, commentCount: comments.length }


}

// Teste:
getPostWithCommentCount(1).then(result => console.log(result));
// { title: "...", commentCount: 5 }
