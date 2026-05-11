//  Reimplemente retry(fn, attempts, delay) do zero. Lembre: executa fn(), se falhar espera delay ms e tenta de novo,
//  até esgotar attempts. Se todas falharem, rejeita com o último erro.

async function retry(fn, attempts, delay) {
    for (let i = 0; i < attempts; i++) {
        try {
            return await fn();
        } catch (error) {
            if (i === attempts - 1) throw error;
            await new Promise(resolve => setTimeout(resolve, delay));

        }
    }
}

let attempt = 0;
retry(() => {
  attempt++;
  console.log(`Tentativa ${attempt}`);
  if (attempt < 3) throw new Error(`Falhou na tentativa ${attempt}`);
  return 'Sucesso!';
}, 5, 500).then(result => console.log(result));
