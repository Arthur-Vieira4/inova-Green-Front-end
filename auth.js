const API_URL = 'https://inova-green-backend.onrender.com';

// ---------- Utilidades de sessão ----------
function salvarSessao(dados) {
    localStorage.setItem('inovagreen_token', dados.token);
    localStorage.setItem('inovagreen_tipo', dados.tipo);
    localStorage.setItem('inovagreen_nome', dados.nome || '');
    localStorage.setItem('inovagreen_kit', dados.kit || '');
}

function pegarToken() {
    return localStorage.getItem('inovagreen_token');
}

function pegarTipo() {
    return localStorage.getItem('inovagreen_tipo');
}

function sair() {
    localStorage.removeItem('inovagreen_token');
    localStorage.removeItem('inovagreen_tipo');
    localStorage.removeItem('inovagreen_nome');
    localStorage.removeItem('inovagreen_kit');
    window.location.href = 'Login.html';
}

document.addEventListener('DOMContentLoaded', () => {

    // ---------- Botão de sair (Painel e Admin) ----------
    const botaoLogout = document.getElementById('botao-logout');
    if (botaoLogout) {
        botaoLogout.addEventListener('click', sair);
    }

    // ---------- Página de Login ----------
    const formLogin = document.getElementById('form-login');
    if (formLogin) {
        formLogin.addEventListener('submit', async (evento) => {
            evento.preventDefault();
            const mensagem = document.getElementById('mensagem-login');
            const email = document.getElementById('login-email').value.trim();
            const senha = document.getElementById('login-senha').value;

            mensagem.textContent = 'Entrando...';
            mensagem.style.color = 'gray';

            try {
                const resposta = await fetch(`${API_URL}/api/login`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email, senha })
                });

                const resultado = await resposta.json();

                if (!resposta.ok) {
                    mensagem.textContent = resultado.erro || 'Não foi possível entrar.';
                    mensagem.style.color = 'red';
                    return;
                }

                salvarSessao(resultado);
                mensagem.textContent = 'Login realizado! Redirecionando...';
                mensagem.style.color = 'green';

                setTimeout(() => {
                    window.location.href = resultado.tipo === 'admin' ? 'Admin.html' : 'Painel.html';
                }, 600);
            } catch (erro) {
                console.error('Erro ao entrar:', erro);
                mensagem.textContent = 'Não foi possível conectar ao servidor.';
                mensagem.style.color = 'red';
            }
        });
    }

    // ---------- Painel do cliente ----------
    const painelNome = document.getElementById('painel-nome');
    if (painelNome) {
        if (pegarTipo() !== 'cliente' || !pegarToken()) {
            window.location.href = 'Login.html';
            return;
        }

        (async () => {
            try {
                const resposta = await fetch(`${API_URL}/api/cadastro/me`, {
                    headers: { Authorization: `Bearer ${pegarToken()}` }
                });

                if (resposta.status === 401) {
                    sair();
                    return;
                }

                const dados = await resposta.json();

                document.getElementById('painel-saudacao').textContent = `Olá, ${dados.nome}!`;
                painelNome.textContent = dados.nome;
                document.getElementById('painel-email').textContent = dados.email;
                document.getElementById('painel-telefone').textContent = dados.telefone;
                document.getElementById('painel-kit').textContent = dados.kit;
                document.getElementById('painel-data').textContent = new Date(dados.criado_em).toLocaleDateString('pt-BR');
            } catch (erro) {
                console.error('Erro ao carregar painel:', erro);
            }
        })();
    }

    // ---------- Página de Compra ----------
    const formCompra = document.getElementById('form-compra');
    if (formCompra) {
        if (pegarTipo() !== 'cliente' || !pegarToken()) {
            window.location.href = 'Login.html';
            return;
        }

        const campoCpf = document.getElementById('compra-cpf');
        const statusCpf = document.getElementById('cpf-status');
        const campoCep = document.getElementById('compra-cep');
        const statusCep = document.getElementById('cep-status');

        function cpfValidoClient(cpf) {
            cpf = cpf.replace(/\D/g, '');
            if (cpf.length !== 11 || /^(\d)\1{10}$/.test(cpf)) return false;
            let soma = 0;
            for (let i = 0; i < 9; i++) soma += parseInt(cpf[i]) * (10 - i);
            let resto = (soma * 10) % 11;
            if (resto === 10) resto = 0;
            if (resto !== parseInt(cpf[9])) return false;
            soma = 0;
            for (let i = 0; i < 10; i++) soma += parseInt(cpf[i]) * (11 - i);
            resto = (soma * 10) % 11;
            if (resto === 10) resto = 0;
            return resto === parseInt(cpf[10]);
        }

        campoCpf.addEventListener('blur', () => {
            if (!campoCpf.value) {
                statusCpf.textContent = '';
                return;
            }
            if (cpfValidoClient(campoCpf.value)) {
                statusCpf.textContent = '✓ CPF válido';
                statusCpf.style.color = 'green';
            } else {
                statusCpf.textContent = '✗ CPF inválido - confira os números';
                statusCpf.style.color = 'red';
            }
        });

        campoCep.addEventListener('blur', async () => {
            const cepLimpo = campoCep.value.replace(/\D/g, '');

            if (cepLimpo.length !== 8) {
                statusCep.textContent = '✗ CEP precisa ter 8 números';
                statusCep.style.color = 'red';
                return;
            }

            statusCep.textContent = 'Buscando endereço...';
            statusCep.style.color = 'gray';

            try {
                const resposta = await fetch(`https://viacep.com.br/ws/${cepLimpo}/json/`);
                const dados = await resposta.json();

                if (dados.erro) {
                    statusCep.textContent = '✗ CEP não encontrado - confira o número';
                    statusCep.style.color = 'red';
                    document.getElementById('compra-rua').value = '';
                    document.getElementById('compra-bairro').value = '';
                    document.getElementById('compra-cidade').value = '';
                    return;
                }

                document.getElementById('compra-rua').value = dados.logradouro || '';
                document.getElementById('compra-bairro').value = dados.bairro || '';
                document.getElementById('compra-cidade').value = `${dados.localidade} / ${dados.uf}`;

                statusCep.textContent = '✓ Endereço confirmado';
                statusCep.style.color = 'green';
            } catch (erro) {
                console.error('Erro ao buscar CEP:', erro);
                statusCep.textContent = '✗ Não foi possível confirmar o CEP agora';
                statusCep.style.color = 'red';
            }
        });

        formCompra.addEventListener('submit', async (evento) => {
            evento.preventDefault();
            const mensagem = document.getElementById('mensagem-compra');

            if (!cpfValidoClient(campoCpf.value)) {
                mensagem.textContent = 'Digite um CPF válido antes de continuar.';
                mensagem.style.color = 'red';
                return;
            }

            const cepLimpo = campoCep.value.replace(/\D/g, '');
            if (cepLimpo.length !== 8 || !document.getElementById('compra-rua').value) {
                mensagem.textContent = 'Confirme um CEP válido antes de continuar.';
                mensagem.style.color = 'red';
                return;
            }

            const [cidade, estado] = document.getElementById('compra-cidade').value.split(' / ');

            const dadosPedido = {
                kit: document.getElementById('compra-kit').value,
                quantidade: parseInt(document.getElementById('compra-quantidade').value, 10),
                cpf: campoCpf.value,
                cep: campoCep.value,
                rua: document.getElementById('compra-rua').value,
                numero: document.getElementById('compra-numero').value,
                complemento: document.getElementById('compra-complemento').value,
                bairro: document.getElementById('compra-bairro').value,
                cidade,
                estado
            };

            mensagem.textContent = 'Enviando pedido... (pode levar até 1 minuto na primeira vez do dia)';
            mensagem.style.color = 'gray';

            try {
                const resposta = await fetch(`${API_URL}/api/pedidos`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${pegarToken()}`
                    },
                    body: JSON.stringify(dadosPedido)
                });

                const resultado = await resposta.json();

                if (resposta.ok) {
                    mensagem.textContent = 'Pedido registrado com sucesso! Redirecionando...';
                    mensagem.style.color = 'green';
                    setTimeout(() => {
                        window.location.href = 'Painel.html';
                    }, 1200);
                } else if (resposta.status === 401) {
                    sair();
                } else {
                    mensagem.textContent = resultado.erro || 'Erro ao registrar o pedido.';
                    mensagem.style.color = 'red';
                }
            } catch (erro) {
                console.error('Erro ao enviar pedido:', erro);
                mensagem.textContent = 'Não foi possível conectar ao servidor.';
                mensagem.style.color = 'red';
            }
        });
    }

    // ---------- Painel do admin ----------
    const adminTabela = document.getElementById('admin-tabela');
    if (adminTabela) {
        if (pegarTipo() !== 'admin' || !pegarToken()) {
            window.location.href = 'Login.html';
            return;
        }

        (async () => {
            const status = document.getElementById('admin-status');
            const corpo = document.getElementById('admin-tabela-corpo');

            try {
                const resposta = await fetch(`${API_URL}/api/cadastro`, {
                    headers: { Authorization: `Bearer ${pegarToken()}` }
                });

                if (resposta.status === 401 || resposta.status === 403) {
                    sair();
                    return;
                }

                const leads = await resposta.json();

                if (leads.length === 0) {
                    status.textContent = 'Nenhum cadastro recebido ainda.';
                    return;
                }

                leads.forEach((lead) => {
                    const linha = document.createElement('tr');
                    linha.innerHTML = `
                        <td>${lead.nome}</td>
                        <td>${lead.email}</td>
                        <td>${lead.telefone}</td>
                        <td>${lead.kit}</td>
                        <td>${new Date(lead.criado_em).toLocaleDateString('pt-BR')}</td>
                    `;
                    corpo.appendChild(linha);
                });

                status.style.display = 'none';
                adminTabela.style.display = 'table';
            } catch (erro) {
                console.error('Erro ao carregar admin:', erro);
                status.textContent = 'Erro ao carregar os cadastros.';
            }
        })();
    }

});