document.addEventListener('DOMContentLoaded', () => {

    // ===== Efeito "reveal": elementos aparecem suavemente ao entrar na tela =====
    const elementosReveal = document.querySelectorAll('.reveal');

    const observador = new IntersectionObserver((entradas) => {
        entradas.forEach((entrada) => {
            if (entrada.isIntersecting) {
                entrada.target.classList.add('visivel');
                observador.unobserve(entrada.target); // anima só uma vez
            }
        });
    }, {
        threshold: 0.15 // ativa quando 15% do elemento aparece na tela
    });

    elementosReveal.forEach((elemento) => observador.observe(elemento));

    // ===== Contador animado das estatísticas =====
    const numerosEstatisticas = document.querySelectorAll('.estatistica-numero');

    if (numerosEstatisticas.length > 0) {
        const observadorNumeros = new IntersectionObserver((entradas) => {
            entradas.forEach((entrada) => {
                if (entrada.isIntersecting) {
                    animarContador(entrada.target);
                    observadorNumeros.unobserve(entrada.target);
                }
            });
        }, {
            threshold: 0.5
        });

        numerosEstatisticas.forEach((numero) => observadorNumeros.observe(numero));
    }

    function animarContador(elemento) {
        const alvo = parseInt(elemento.dataset.target, 10);
        const sufixo = elemento.dataset.sufixo || '';
        const duracao = 1500; // milissegundos
        const inicio = performance.now();

        function passo(agora) {
            const progresso = Math.min((agora - inicio) / duracao, 1);
            const valorAtual = Math.floor(progresso * alvo);
            elemento.textContent = valorAtual + sufixo;

            if (progresso < 1) {
                requestAnimationFrame(passo);
            } else {
                elemento.textContent = alvo + sufixo;
            }
        }

        requestAnimationFrame(passo);
    }

    // ===== Cabeçalho encolhe suavemente ao rolar a página =====
    const cabecalho = document.querySelector('.cabeça');

    if (cabecalho) {
        window.addEventListener('scroll', () => {
            if (window.scrollY > 50) {
                cabecalho.classList.add('rolou');
            } else {
                cabecalho.classList.remove('rolou');
            }
        });
    }

    // ===== Menu hambúrguer (mobile) =====
    const botaoMenu = document.getElementById('menu-toggle');
    const menuNav = document.getElementById('menu-nav');

    if (botaoMenu && menuNav) {
        botaoMenu.addEventListener('click', () => {
            botaoMenu.classList.toggle('aberto');
            menuNav.classList.toggle('aberto');
        });

        // Fecha o menu ao clicar em qualquer link dele
        menuNav.querySelectorAll('a').forEach((link) => {
            link.addEventListener('click', () => {
                botaoMenu.classList.remove('aberto');
                menuNav.classList.remove('aberto');
            });
        });
    }

    // ===== Transição suave entre páginas =====
    requestAnimationFrame(() => {
        document.body.classList.add('pagina-carregada');
    });

    document.querySelectorAll('a[href]').forEach((link) => {
        const destino = link.getAttribute('href');

        // Ignora âncoras (#secao), links externos, e-mail, telefone ou abertos em nova aba
        const ehAncora = destino.startsWith('#');
        const ehExterno = /^(https?:)?\/\//i.test(destino) || destino.startsWith('mailto:') || destino.startsWith('tel:');
        const novaAba = link.target === '_blank';

        if (ehAncora || ehExterno || novaAba) return;

        link.addEventListener('click', (evento) => {
            evento.preventDefault();
            document.body.classList.remove('pagina-carregada');
            document.body.classList.add('saindo');
            setTimeout(() => {
                window.location.href = destino;
            }, 300);
        });
    });

    // ===== Linha de progresso do diagrama "Como Funciona" =====
    const fluxo = document.querySelector('.fluxo');
    const fluxoProgresso = document.querySelector('.fluxo-progresso');

    if (fluxo && fluxoProgresso) {
        window.addEventListener('scroll', () => {
            const retangulo = fluxo.getBoundingClientRect();
            const alturaJanela = window.innerHeight;

            // Quanto do diagrama já passou pelo meio da tela (0 a 1)
            const progresso = Math.min(
                Math.max((alturaJanela / 2 - retangulo.top) / retangulo.height, 0),
                1
            );

            fluxoProgresso.style.height = (progresso * 100) + '%';
        });
    }

});