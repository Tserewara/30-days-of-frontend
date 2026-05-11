# JavaScript por Dentro: Event Loop, Promises e Async/Await

*Dia 2 do intensivo de 30 dias de frontend — entendendo o modelo non-blocking do JavaScript.*

---


Esse é o segundo dia do meu intensivo de 30 dias de frontend. Hoje o assunto é o paradigma assíncrono do JavaScript — como o browser executa código non-blocking, o que são Promises por dentro, e por que `async/await` é só uma forma mais bonita de escrever a mesma coisa.

Para quem vem de linguagens síncronas como Python, esse paradigma costuma ser confuso. Em Python síncrono, o código lê de cima pra baixo e executa de cima pra baixo. Em JavaScript, isso não acontece. Entender o porquê dessa diferença é o que vamos fazer hoje.

---


## O paradigma que confunde quem vem de linguagens síncronas

Vamos começar com um experimento. Considere esses dois trechos de código, um em Python e outro em JavaScript, fazendo a mesma coisa: buscar dados de uma API.

Em Python síncrono:

```python
import requests

response = requests.get("https://api.example.com/users/1")
user = response.json()
print(user["name"])
```

Em JavaScript:

```javascript
const response = fetch("https://api.example.com/users/1");
const user = response.json();
console.log(user.name);
```

À primeira vista, parece que os dois deveriam funcionar. Mas o código JS quebra. `response.json()` lança um erro: `response.json is not a function`. Por quê?

Porque `fetch` **não retorna o dado**. Ele retorna uma Promise — um objeto que **representa** o dado que vai chegar. O `requests.get()` em Python trava a thread e espera o servidor responder. O `fetch` em JavaScript faz o despacho e segue em frente, antes da resposta existir.

Essa é a diferença fundamental. E ela existe por um motivo específico.

---


## Por que o JS é não-bloqueante

O JavaScript no browser não é apenas um interpretador como o Python. Ele divide a mesma thread com a renderização da tela, com o processamento de cliques, e com as animações. Se um `fetch` pudesse bloquear como um `requests.get()`, a tela inteira congelaria enquanto a requisição estivesse em andamento — botões parariam de responder, animações travariam, o cursor não mexeria. Imagine seu banco online travando 3 segundos toda vez que carrega o extrato.

Por isso, **a linguagem nem te dá a opção de bloquear**. Toda operação de I/O em JS retorna imediatamente, antes do resultado estar pronto. Não existe um `fetchSync()`. Não existe um `sleep()` que trava. É uma restrição estrutural do ambiente, não uma escolha filosófica.

E uma curiosidade que confirma isso: o Node.js. Quando o JavaScript saiu do browser e foi pro servidor, manteve o modelo non-blocking — mas lá não era obrigatório. No servidor não tem tela pra renderizar. Manteve por performance (event loop leve vs thread-per-request), não por necessidade visual. Tanto que o Node tem `fs.readFileSync()` — uma operação bloqueante. No browser, algo assim seria impensável.

---


## V8 vs Runtime: o que é o quê

Antes de avançar, é importante separar dois conceitos que muita gente confunde: o engine JavaScript e o runtime.

O **V8** é o engine — equivalente ao interpretador do Python (o binário `python`). Ele sabe avaliar expressões, manipular variáveis, executar funções, gerenciar memória. Mas o V8 puro, isolado, não tem ideia do que é `setTimeout`, `fetch`, ou `document.querySelector`. Essas funções **não fazem parte da especificação do JavaScript**.

O **runtime** é o V8 mais tudo que o ambiente ao redor fornece. No browser, isso inclui:

- **V8** — executa JS, gerencia call stack e memória
- **Web APIs** — timers (`setTimeout`), rede (`fetch`), DOM (`addEventListener`), geolocalização, câmera, storage. Tudo implementado em C++ pelo próprio browser
- **Filas** — onde callbacks ficam esperando depois que o trabalho assíncrono termina
- **Event loop** — o orquestrador que conecta tudo

Em Python a estrutura é parecida: o interpretador puro não sabe abrir um socket — quem sabe é o OS, e o Python fala com ele via `socket`, `os`, `sys`. No JavaScript, o V8 puro não sabe fazer HTTP — quem sabe é o browser, e o V8 fala com ele via APIs como `fetch`.

No Node, o engine V8 é o mesmo, mas o runtime é diferente: em vez de Web APIs, tem `libuv` mais APIs do Node (`fs`, `http`, `process`). O engine é só uma peça. O ambiente ao redor define as capacidades.

---


## Como uma operação non-blocking funciona

Agora vamos ver o que de fato acontece quando você chama `setTimeout(fn, 1000)`. Esse é o caso mais simples e ele revela toda a mecânica.

1. O V8 encontra `setTimeout(fn, 1000)` na call stack
2. O V8 não sabe lidar com timers — chama a **Web API de timer** do browser via interface C++
3. A Web API registra um timer de 1000ms e começa a contar. Esse trabalho acontece **fora do V8**, em paralelo
4. `setTimeout` retorna imediatamente (com um ID numérico do timer). O V8 segue pra próxima linha
5. ... 1000ms passam ...
6. O timer expira. A Web API coloca o callback `fn` na **macrotask queue**
7. O **event loop** vê que a call stack está vazia e que tem algo na fila. Puxa o callback pra call stack
8. `fn` executa

A peça-chave aqui é entender que o V8 nunca espera. Ele despacha o trabalho pra Web API e segue executando a próxima linha. A Web API faz o trabalho real em paralelo. E quando termina, **não avisa ninguém** — só coloca o callback na fila e volta pra próxima tarefa.

O event loop, por sua vez, é um observador passivo. Ele roda em loop infinito fazendo basicamente isso:

```text
enquanto (verdadeiro):
    se (call stack vazia e tem callback na fila):
        puxa o callback da fila
        empurra na call stack
```

Não tem notificação, não tem sinal, não tem mensagem entre as partes. O sistema é baseado em **polling**, não em push. É como uma esteira de sushi: o chef (Web API) coloca pratos na esteira quando ficam prontos, e você (event loop) fica olhando a esteira, pegando o próximo prato quando suas mãos estão livres.

---


## setTimeout vs addEventListener: trabalho ativo vs registro passivo

Tanto `setTimeout` quanto `addEventListener` são non-blocking, e os dois usam o mesmo mecanismo de entrega: a Web API enfileira o callback quando chega a hora, e o event loop puxa pra call stack. Mas eles diferem fundamentalmente no que acontece **depois do dispatch**.

Quando você chama `setTimeout(fn, 1000)`, o browser inicia um timer que está **ativamente contando**. Depois de 1000ms, o timer **vai** expirar (com certeza), e o callback **vai** ser enfileirado. É trabalho ativo, com início e fim previsíveis.

Quando você chama `addEventListener('click', fn)`, o browser não inicia trabalho nenhum. Ele só **registra um ouvinte** e segue em frente. É um post-it na geladeira: "se alguém clicar, me chama". O callback pode nunca rodar (se o usuário não clicar), rodar uma vez, ou rodar mil vezes — depende de eventos externos imprevisíveis.

Essa distinção importa porque ajuda a explicar como APIs diferentes do browser usam a mesma infraestrutura de filas, mas com propósitos diferentes. Timers e requisições HTTP são trabalho ativo. Listeners de eventos do DOM são registros passivos. As duas categorias acabam na mesma macrotask queue, mas o que está acontecendo "lá fora" entre o dispatch e o enqueue é diferente.

---


## As duas filas: macrotask e microtask

O runtime do JS não tem **uma** fila — tem **duas**, e isso muda como o código se comporta.

A **macrotask queue** recebe callbacks de `setTimeout`, `setInterval`, `addEventListener`, e operações de I/O em geral.

A **microtask queue** recebe callbacks de Promises — especificamente os `.then()`, `.catch()`, `.finally()` e a retomada de uma função depois de um `await`.

A diferença crítica está na regra de drenagem do event loop: **ele esvazia toda a microtask queue antes de puxar uma única macrotask**. Não intercala. Isso garante que reações a Promises rodem em "lote", antes do próximo timer ou evento.

É por isso que esse código:

```javascript
console.log('1');
setTimeout(() => console.log('2'), 0);
Promise.resolve().then(() => console.log('3'));
console.log('4');
```

Imprime: `1`, `4`, `3`, `2`.

Os síncronos rodam primeiro (`1` e `4`). Quando a call stack esvazia, o event loop drena toda a microtask queue (`3`). Só depois puxa uma macrotask (`2`). Mesmo com delay zero no `setTimeout`, a Promise vence — porque microtasks têm prioridade.

A receita pra prever qualquer ordem de execução é essa:

1. Roda todo o código síncrono na call stack
2. Quando esvaziar, drena toda a microtask queue (incluindo novas microtasks que aparecem durante a drenagem)
3. Pega **uma** macrotask, executa
4. Drena toda a microtask queue de novo
5. Pega a próxima macrotask, e por aí vai

Essa regra tem uma consequência perigosa: se você enfileira microtasks recursivamente, pode **engasgar** o event loop e fazer com que `setTimeout` callbacks nunca rodem. É a famosa "microtask starvation". Algo como:

```javascript
function loop() {
  Promise.resolve().then(loop);
}
loop();

setTimeout(() => console.log('nunca vai rodar'), 0);
```

O `loop` cria uma microtask que cria outra microtask infinitamente. O event loop nunca esvazia a microtask queue, então nunca chega na macrotask onde está o `setTimeout`.

---


## O problema que as Promises resolvem

Chegamos no ponto mais importante desse artigo. Existe uma afirmação comum sobre Promises que está **errada**: a de que elas têm a ver com programação assíncrona.

Promise não cria comportamento assíncrono. Quem cria é o runtime — `setTimeout`, `fetch`, I/O em geral. Promise é uma **abstração síncrona para coordenar resultados assíncronos**. Ela não despacha trabalho, não conta tempo, não faz I/O. Quem faz isso é o runtime. A Promise é só o "número de rastreio" do resultado futuro: um objeto que guarda estado e permite registrar reações.

Pra entender por que esse objeto existe, precisamos olhar como o JS resolvia o problema **antes** das Promises.

### Antes: callbacks diretos

No JavaScript pré-2015, toda operação non-blocking usava callbacks passados na hora da chamada. Algo assim:

```javascript
function getUser(id, callback) {
    // simula busca no banco
    setTimeout(() => {
        const user = { id, name: 'João' };
        callback(null, user);
    }, 1000);
}

getUser(1, function(err, user) {
    if (err) return console.error(err);
    console.log(user.name);
});
```

Isso é assíncrono. O `setTimeout` agenda o trabalho, `getUser` retorna imediatamente, e o callback dispara quando o "banco" responde. Funciona pra uma operação isolada. Mas a coisa desanda quando você precisa encadear.

### Problema 1: callback hell

Quando uma operação depende da anterior, você é forçado a aninhar:

```javascript
getUser(1, function(err, user) {
    if (err) return console.error(err);
    getCompany(user.companyId, function(err, company) {
        if (err) return console.error(err);
        getCountryInfo(company.country, function(err, info) {
            if (err) return console.error(err);
            console.log(info.currency);
        });
    });
});
```

Pirâmide. Cada nível de aninhamento é uma **dependência temporal** — "só posso buscar B quando A terminar". E como A é non-blocking e retorna antes do resultado, a única forma de acessar o resultado é dentro do callback. Que por sua vez é non-blocking, então o próximo resultado também só existe dentro do callback seguinte. O aninhamento é estruturalmente obrigatório.

Mas espera — por que não fazer assim?

```javascript
const user = getUser(1);
const company = getCompany(user.companyId);
const info = getCountryInfo(company.country);
console.log(info.currency);
```

Não funciona. `getUser` retorna **antes** do `user` existir, porque ela despacha o trabalho e segue. `user` é `undefined` na segunda linha.

E uma variável global tampouco resolve. Você até consegue setar a variável dentro do callback, mas **não tem como saber quando** ela vai estar pronta:

```javascript
let user = null;

getUser(1, function(err, result) {
    user = result;
});

console.log(user); // null — o callback ainda não rodou
```

A única forma de garantir que `user` existe é executar o próximo passo **dentro** do callback. E aí você está de volta ao aninhamento. Não é escolha do dev — é consequência direta do JS ser non-blocking.

### Problema 2: cada API com sua própria convenção

Cada Web API antiga inventava seu jeito de entregar o resultado:

`setTimeout` recebia o callback como argumento:

```javascript
setTimeout(callback, ms);
```

`XMLHttpRequest` (o avô do `fetch`) usava propriedades:

```javascript
const xhr = new XMLHttpRequest();
xhr.onload = function() { /* sucesso */ };
xhr.onerror = function() { /* erro */ };
xhr.send();
```

`addEventListener` recebia callback no segundo parâmetro:

```javascript
element.addEventListener('click', callback);
```

Geolocalização recebia dois callbacks posicionais:

```javascript
navigator.geolocation.getCurrentPosition(
    function(position) { /* sucesso */ },
    function(error) { /* erro */ }
);
```

Cada uma com uma convenção diferente. Você precisava memorizar a API de cada caso, e não tinha como escrever código genérico que tratasse "qualquer operação assíncrona" de forma uniforme.

### Problema 3: o resultado se perdia se não fosse processado na hora

No modelo de callback, você era obrigado a definir a reação ao resultado **no momento do dispatch**. Não havia armazenamento — o callback era a única forma de consumir o valor, e quando ele executava, o valor era usado e ia embora.

Não dava pra fazer "guarda esse resultado, depois eu decido o que fazer". Não dava pra registrar dois consumidores no mesmo resultado. Não dava pra acessar o valor 50 linhas depois, em outro módulo. O callback **era** o consumo.

---


## Promises: a abstração de coordenação

Promises resolvem os três problemas de uma vez, e resolvem **estruturalmente**, não com mais código.

### A mecânica

Uma Promise é um objeto com três estados possíveis: `pending`, `fulfilled`, `rejected`. Ela começa em `pending` e pode transitar para `fulfilled` ou `rejected` **uma única vez**. Depois disso, o estado é imutável.

A construção:

```javascript
const promise = new Promise((resolve, reject) => {
    // este código (o "executor") roda IMEDIATAMENTE, síncrono
    // resolve(valor) → muda estado pra fulfilled
    // reject(erro)   → muda estado pra rejected
});
```

O `new Promise()` aceita uma função — o **executor**. Essa função recebe dois parâmetros (`resolve` e `reject`) criados internamente pelo engine. O executor roda **síncronamente e imediatamente** no momento do `new Promise()`. Não vai pra fila nenhuma. Ele executa ali, na call stack.

Observação importante: o executor não é assíncrono. O que ele tipicamente faz é **configurar** uma operação assíncrona (chamar `setTimeout`, fazer um `fetch`) e retornar. Quando essa operação eventualmente termina, alguém chama `resolve(valor)` — e aí o estado da Promise muda.

### O resultado fica guardado no objeto

Quando `resolve(42)` é chamado, o valor 42 fica **armazenado dentro da Promise**. A Promise é só um objeto em memória — ela tem campos internos pra estado e valor. Sem mistério.

E é aí que mora a primeira grande mudança em relação a callbacks. Com a Promise como container do resultado, você não precisa mais decidir o que fazer com ele no momento do despacho. Você registra a reação **quando quiser**, em qualquer ponto do código, usando `.then()`:

```javascript
const promise = fetch('/api/users/1');

// posso registrar a reação aqui
promise.then(response => console.log(response.status));

// ou 20 linhas depois, em outro lugar
promise.then(response => sendAnalytics(response));

// ou três vezes em pontos diferentes do programa
promise.then(response => updateUI(response));
```

Três consumidores diferentes, registrados em momentos diferentes, todos recebem o mesmo resultado. Com callback direto, isso era impossível.

### `.then()` registra, não executa

Aqui tem um detalhe sutil mas importante. Quando você chama `.then(callback)`, o `callback` não roda imediatamente — nem mesmo se a Promise já está `fulfilled`. Ele é **enfileirado na microtask queue** e roda quando a call stack esvaziar.

```javascript
const p = new Promise(resolve => resolve(42));

p.then(value => console.log('then:', value));
console.log('fim');

// Saída: "fim", "then: 42"
```

Mesmo a Promise estando resolvida no momento do `.then()`, o callback vai pra microtask queue e só executa depois do código síncrono. A especificação garante isso pra manter consistência: o `.then()` se comporta igual independente de a Promise ter resolvido antes ou depois do registro.

Isso significa que Promise **não cria** comportamento assíncrono — mas a entrega via `.then()` é **diferida** por design. O callback do `.then()` é uma microtask, sempre.

### A metáfora do número de rastreio

Pensa numa loja online. No Python síncrono, fazer um pedido seria como ir ao balcão, pagar, e ficar parado lá esperando até o produto sair da fábrica. A thread (você) trava completamente.

No JavaScript non-blocking, fazer um pedido é como receber um **número de rastreio**. Você pode usar esse número pra acompanhar o status, registrar notificações ("me avise quando chegar"), ou simplesmente esquecer dele. A loja segue trabalhando, você segue sua vida. Quando o produto chega, a notificação dispara.

A Promise é esse número de rastreio. O `fetch` te entrega o número, não o pacote. Com `.then()` você registra a notificação. Com `await`, você decide ficar na portaria esperando o entregador (mas sem travar a thread inteira — só essa função específica).

---


## async/await: o melhor dos dois mundos

`async/await` foi adicionado à linguagem em 2017 com um único propósito: fazer código non-blocking **parecer** bloqueante, sem perder o comportamento non-blocking.

Comparação direta — mesmo programa, sintaxes diferentes:

Com `.then()`:

```javascript
function getUser(id) {
    return fetch(`/users/${id}`)
        .then(response => response.json())
        .then(user => user.name);
}
```

Com `async/await`:

```javascript
async function getUser(id) {
    const response = await fetch(`/users/${id}`);
    const user = await response.json();
    return user.name;
}
```

Os dois fazem exatamente a mesma coisa, com a mesma mecânica por baixo. A diferença é puramente sintática. O `async/await` não é uma feature de runtime nova — é **açúcar sintático** sobre `.then()`. Por baixo, o engine transforma uma função `async` numa máquina de estados que usa Promises e callbacks de microtask. O resultado é código que lê como Python síncrono, mas roda non-blocking.

### O que o `await` faz mecanicamente

Quando o JS encontra `await promise`, três coisas acontecem em sequência:

1. **Suspende a função:** pausa a execução naquele ponto, guarda o estado local (variáveis, posição no código)
2. **Devolve controle a quem chamou:** a função `async` retorna uma Promise pra quem a invocou, e o código que chamou segue rodando. A thread fica livre pro event loop processar outras coisas
3. **Registra a retomada como microtask:** quando a Promise aguardada resolver, a continuação da função é enfileirada na microtask queue. Quando a call stack esvazia, a função retoma do ponto onde parou

É o mesmo mecanismo de um `.then()` — registra um callback que roda quando a Promise resolve, via microtask queue. Só com sintaxe diferente. Em vez de você escrever `.then(callback)`, o engine cria o callback automaticamente a partir do código que vem **depois** do `await`.

Um detalhe importante: o `await` em si **não despacha trabalho** pro runtime. Quem despacha é a função que está sendo aguardada (`fetch`, `sleep`, etc.). O `await` é só o mecanismo de coordenação. Em `await fetch(url)`, é o `fetch(url)` quem manda a requisição pra Web API de rede e retorna uma Promise. O `await` só **pega essa Promise** e fala "pausa aqui até ela resolver". É um receptor de Promises.

### Como prever a ordem com `async/await`

Esse exemplo ajuda a consolidar:

```javascript
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
```

A saída é: `start`, `alpha 1`, `beta 1`, `end`, `alpha 2`, `beta 2`, `alpha 3`.

`alpha()` e `beta()` não rodam uma depois da outra — elas se **alternam** a cada `await`. Cada `await` suspende a função, devolve controle, e a retomada vai pra microtask queue. Como `alpha` foi chamada antes de `beta`, a retomada de `alpha` entra na microtask queue primeiro em cada rodada.

---


## Padrões práticos

Com o modelo mental no lugar, alguns padrões que aparecem em código real ficam mais fáceis de entender.

### Sleep não-bloqueante

JS não tem `sleep()` nativo porque não pode bloquear. Mas com Promise e `setTimeout` você consegue um sleep que pausa a função sem travar a thread:

```javascript
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function demo() {
    console.log('Início');
    await sleep(1000);
    console.log('1 segundo depois');
}
```

O `setTimeout` agenda o `resolve` pra ser chamado depois de `ms` milissegundos. Quando isso acontece, a Promise resolve, e o `await` retoma a função. Durante esse tempo, a thread fica livre — o browser continua renderizando, respondendo a eventos, processando outras Promises. Diferente de um `time.sleep(1)` do Python, que trava a thread.

### Promisification

Padrão pra embrulhar APIs antigas de callback em Promises. Útil pra usar `await` com APIs do navegador que ainda usam callbacks:

```javascript
function getPositionPromise() {
    return new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(
            (position) => resolve(position.coords),
            (error) => reject(error)
        );
    });
}

const coords = await getPositionPromise();
```

A estrutura é sempre a mesma: cria uma Promise, chama a API antiga dentro do executor, e usa os callbacks da API pra disparar `resolve` ou `reject`. Você está literalmente "encanando" o callback model dentro do Promise model.

### AbortController e cancelamento

Forma moderna de **cancelar** operações non-blocking em andamento. Resolve um problema antigo: Promise não pode ser cancelada — uma vez disparada, ela vai resolver ou rejeitar.

```javascript
async function fetchWithTimeout(url, ms) {
    const controller = new AbortController();
    const timerId = setTimeout(() => controller.abort(), ms);
    try {
        return await fetch(url, { signal: controller.signal });
    } finally {
        clearTimeout(timerId);
    }
}
```

O `AbortController` cria um canal de comunicação (`signal`) entre seu código e a operação em andamento. Quando você chama `controller.abort()`, o browser **cancela a operação HTTP de verdade** — não só ignora o resultado, fecha a conexão — e a Promise rejeita com um erro do tipo `AbortError`.

### Composição

O grande poder das Promises é que cada padrão é uma função que retorna Promise, e você compõe livremente:

```javascript
// retry recebe uma função que retorna Promise
// fetchWithTimeout retorna Promise
// logo, podemos compor:
retry(() => fetchWithTimeout(url, 5000), 3, 1000);
// fetch com timeout E retry
```

Mesma lógica pra outros padrões:

- **`Promise.all`** — espera N Promises terminarem (todas), fail-fast no primeiro erro
- **`Promise.allSettled`** — espera N Promises terminarem (todas), nunca rejeita, retorna estado de cada uma
- **`debounce`** — agrupa chamadas rápidas e executa só a última depois de período de silêncio (input do usuário)
- **`throttle`** — limita taxa de execução (scroll, resize)

A beleza é que esses padrões **não nasceram do JS**. São formas de resolver problemas universais (timeout, retry, cancelamento, paralelismo controlado) usando a abstração de Promise como peça LEGO. Uma vez que você entende o modelo, criar novos padrões é só uma questão de compor as peças.

---


## Resumo do dia

Cinco conceitos que se encadeiam:

1. **JavaScript no browser é forçadamente non-blocking** porque a thread que executa JS é a mesma que renderiza a tela. Bloquear travaria tudo.

2. **V8 é o engine que executa JS. Runtime é V8 + Web APIs + filas + event loop.** Funções como `setTimeout` e `fetch` não fazem parte do JS — vêm do browser.

3. **O event loop é um observador passivo.** Web APIs colocam callbacks nas filas; o event loop puxa pra call stack quando ela esvazia. Microtasks (Promises) têm prioridade sobre macrotasks (timers, eventos).

4. **Promises não criam comportamento assíncrono.** Elas são uma abstração síncrona para coordenar resultados assíncronos. Resolvem três problemas estruturais: callback hell (aninhamento), falta de padronização de APIs, e perda do resultado se não consumido na hora.

5. **async/await é açúcar sintático sobre `.then()`.** Mesma mecânica, sintaxe diferente. O ganho é cognitivo: código non-blocking que lê de cima pra baixo, como Python síncrono — mas com a thread nunca travada.

A ideia central pra levar adiante é que o paradigma non-blocking do JS é **uma restrição do ambiente**, não uma escolha de design. Tudo que vem depois — Promises, async/await, AbortController, padrões como debounce e throttle — existe pra dar estrutura legível e componível ao código que precisa lidar com essa restrição.

---


*Este artigo faz parte do meu [intensivo de 30 dias de frontend](https://github.com/Tserewara/30-days-of-frontend).*