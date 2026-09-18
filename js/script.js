// URL do back-end hospedado no Render.
const API_URL = 'https://inova-green-backend.onrender.com';

document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('form-cadastro');
    const mensagem = document.getElementById('mensagem-cadastro');

    if (!form) return;

    form.addEventListener('submit', async (evento) => {
        evento.preventDefault();

        const dados = {
            nome: document.getElementById('input-nome').value.trim(),
            email: document.getElementById('input-email').value.trim(),
            telefone: document.getElementById('input-telefone').value.trim(),
            kit: document.getElementById('input-kit').value
        };

        mensagem.textContent = 'Enviando...';
        mensagem.style.color = 'gray';

        try {
            const resposta = await fetch(`${API_URL}/api/cadastro`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(dados)
            });

            const resultado = await resposta.json();

            if (resposta.ok) {
                mensagem.textContent = 'Cadastro realizado com sucesso! Em breve entraremos em contato.';
                mensagem.style.color = 'green';
                form.reset();
            } else {
                mensagem.textContent = resultado.erro || 'Erro ao cadastrar. Tente novamente.';
                mensagem.style.color = 'red';
            }
        } catch (erro) {
            console.error('Erro ao enviar cadastro:', erro);
            mensagem.textContent = 'Não foi possível conectar ao servidor. Verifique se o back-end está rodando.';
            mensagem.style.color = 'red';
        }
    });
});