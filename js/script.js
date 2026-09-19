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
            kit: document.getElementById('input-kit').value,
            senha: document.getElementById('input-senha').value
        };

        // Validação de e-mail
        const regexEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!regexEmail.test(dados.email)) {
            mensagem.textContent = 'Digite um e-mail válido.';
            mensagem.style.color = 'red';
            return;
        }

        // Validação de telefone (aceita com ou sem DDD, com ou sem formatação - 10 ou 11 dígitos)
        const apenasNumeros = dados.telefone.replace(/\D/g, '');
        if (apenasNumeros.length < 10 || apenasNumeros.length > 11) {
            mensagem.textContent = 'Digite um telefone válido, com DDD (ex: 31988887777).';
            mensagem.style.color = 'red';
            return;
        }

        // Validação da senha
        if (dados.senha.length < 6) {
            mensagem.textContent = 'A senha precisa ter pelo menos 6 caracteres.';
            mensagem.style.color = 'red';
            return;
        }

        // Validação do consentimento (LGPD)
        const consentimento = document.getElementById('input-consentimento');
        if (consentimento && !consentimento.checked) {
            mensagem.textContent = 'É preciso concordar com o uso dos seus dados para continuar.';
            mensagem.style.color = 'red';
            return;
        }

        mensagem.textContent = 'Enviando... (pode levar até 1 minuto na primeira vez do dia)';
        mensagem.style.color = 'gray';

        try {
            const resposta = await fetch(`${API_URL}/api/cadastro`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(dados)
            });

            const resultado = await resposta.json();

            if (resposta.ok) {
                mensagem.textContent = 'Cadastro realizado com sucesso! Redirecionando...';
                mensagem.style.color = 'green';
                form.reset();
                setTimeout(() => {
                    window.location.href = 'Obrigado.html';
                }, 900);
            } else if (resposta.status === 409) {
                mensagem.textContent = resultado.erro || 'Este e-mail já está cadastrado.';
                mensagem.style.color = 'red';
            } else if (resposta.status === 429) {
                mensagem.textContent = 'Muitas tentativas. Aguarde alguns minutos e tente de novo.';
                mensagem.style.color = 'red';
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