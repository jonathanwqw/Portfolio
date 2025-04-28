// Esperar que o DOM seja carregado completamente
document.addEventListener('DOMContentLoaded', function() {
    // Remover o loader após o carregamento da página
    setTimeout(function() {
        const loader = document.querySelector('.loader-container');
        loader.style.opacity = '0';
        setTimeout(function() {
            loader.style.display = 'none';
        }, 500);
    }, 1500);

    // Inicializar partículas
    if (typeof particlesJS !== 'undefined') {
        particlesJS('particles-js', {
            particles: {
                number: {
                    value: 80,
                    density: {
                        enable: true,
                        value_area: 800
                    }
                },
                color: {
                    value: ['#6c5ce7', '#00cec9', '#fd79a8']
                },
                shape: {
                    type: 'circle',
                    stroke: {
                        width: 0,
                        color: '#000000'
                    },
                    polygon: {
                        nb_sides: 5
                    }
                },
                opacity: {
                    value: 0.5,
                    random: true,
                    anim: {
                        enable: true,
                        speed: 1,
                        opacity_min: 0.1,
                        sync: false
                    }
                },
                size: {
                    value: 3,
                    random: true,
                    anim: {
                        enable: true,
                        speed: 2,
                        size_min: 0.1,
                        sync: false
                    }
                },
                line_linked: {
                    enable: true,
                    distance: 150,
                    color: '#6c5ce7',
                    opacity: 0.2,
                    width: 1
                },
                move: {
                    enable: true,
                    speed: 1,
                    direction: 'none',
                    random: true,
                    straight: false,
                    out_mode: 'out',
                    bounce: false,
                    attract: {
                        enable: false,
                        rotateX: 600,
                        rotateY: 1200
                    }
                }
            },
            interactivity: {
                detect_on: 'canvas',
                events: {
                    onhover: {
                        enable: true,
                        mode: 'grab'
                    },
                    onclick: {
                        enable: true,
                        mode: 'push'
                    },
                    resize: true
                },
                modes: {
                    grab: {
                        distance: 140,
                        line_linked: {
                            opacity: 0.5
                        }
                    },
                    bubble: {
                        distance: 400,
                        size: 40,
                        duration: 2,
                        opacity: 8,
                        speed: 3
                    },
                    repulse: {
                        distance: 200,
                        duration: 0.4
                    },
                    push: {
                        particles_nb: 4
                    },
                    remove: {
                        particles_nb: 2
                    }
                }
            },
            retina_detect: true
        });
    }

    // Cursor personalizado
    const cursor = document.querySelector('.cursor');
    const cursorFollower = document.querySelector('.cursor-follower');

    document.addEventListener('mousemove', function(e) {
        cursor.style.left = e.clientX + 'px';
        cursor.style.top = e.clientY + 'px';
        
        setTimeout(function() {
            cursorFollower.style.left = e.clientX + 'px';
            cursorFollower.style.top = e.clientY + 'px';
        }, 100);
    });

    document.addEventListener('mousedown', function() {
        cursor.style.width = '15px';
        cursor.style.height = '15px';
        cursorFollower.style.width = '30px';
        cursorFollower.style.height = '30px';
    });

    document.addEventListener('mouseup', function() {
        cursor.style.width = '10px';
        cursor.style.height = '10px';
        cursorFollower.style.width = '40px';
        cursorFollower.style.height = '40px';
    });

    // Efeito hover nos links
    const links = document.querySelectorAll('a, button, .btn');
    links.forEach(link => {
        link.addEventListener('mouseenter', function() {
            cursor.style.width = '0px';
            cursor.style.height = '0px';
            cursorFollower.style.width = '50px';
            cursorFollower.style.height = '50px';
            cursorFollower.style.borderColor = '#6c5ce7';
        });
        
        link.addEventListener('mouseleave', function() {
            cursor.style.width = '10px';
            cursor.style.height = '10px';
            cursorFollower.style.width = '40px';
            cursorFollower.style.height = '40px';
            cursorFollower.style.borderColor = '#6c5ce7';
        });
    });

    // Menu mobile toggle
    const menuToggle = document.querySelector('.menu-toggle');
    const nav = document.querySelector('nav');
    
    menuToggle.addEventListener('click', function() {
        menuToggle.classList.toggle('active');
        nav.classList.toggle('active');
    });

    // Fechar menu ao clicar em um link
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
        link.addEventListener('click', function() {
            menuToggle.classList.remove('active');
            nav.classList.remove('active');
        });
    });

    // Adicionar classe active ao link de navegação quando a seção estiver visível
    window.addEventListener('scroll', function() {
        const sections = document.querySelectorAll('section');
        const scrollPosition = window.scrollY;

        sections.forEach(section => {
            const sectionTop = section.offsetTop - 100;
            const sectionHeight = section.offsetHeight;
            const sectionId = section.getAttribute('id');
            
            if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
                document.querySelector('nav ul li a[href*=' + sectionId + ']').classList.add('active');
            } else {
                document.querySelector('nav ul li a[href*=' + sectionId + ']').classList.remove('active');
            }
        });

        // Header scroll effect
        const header = document.querySelector('header');
        if (scrollPosition > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }

        // Back to top button
        const backToTop = document.querySelector('.back-to-top');
        if (scrollPosition > 300) {
            backToTop.classList.add('active');
        } else {
            backToTop.classList.remove('active');
        }
    });

    // Animação das barras de progresso de habilidades
    const skillsSection = document.querySelector('#skills');
    const progressBars = document.querySelectorAll('.skill-progress');
    
    function animateSkills() {
        const skillsTop = skillsSection.offsetTop;
        const skillsHeight = skillsSection.offsetHeight;
        const scrollPosition = window.scrollY + window.innerHeight;
        
        if (scrollPosition > skillsTop + 300) {
            progressBars.forEach(bar => {
                const level = bar.getAttribute('data-level');
                bar.style.width = level;
            });
        }
    }
    
    window.addEventListener('scroll', animateSkills);
    
    // Inicializar animação de habilidades se a página já estiver carregada na seção
    animateSkills();

    // Formulário de contato
        const submitBtn = contactForm.querySelector("button[type='submit']");
        const originalText = submitBtn.textContent;

        submitBtn.textContent = "Enviando...";
        submitBtn.disabled = true;

        // Obtenha os IDs do seu serviço e template no EmailJS
        const serviceID = "service_nbrn39s";
        const templateID = "template_mm3mga5";

        // Envia o formulário usando EmailJS
        emailjs.sendForm(serviceID, templateID, this)
            .then(() => {
                submitBtn.textContent = "Mensagem Enviada!";
                contactForm.reset();
                setTimeout(() => {
                    submitBtn.textContent = originalText;
                    submitBtn.disabled = false;
                }, 3000);
            }, (err) => {
                submitBtn.textContent = "Erro ao Enviar";
                submitBtn.style.backgroundColor = "red"; // Indica erro visualmente
                console.error("Erro ao enviar e-mail:", JSON.stringify(err));
                alert("Ocorreu um erro ao enviar a mensagem. Tente novamente mais tarde.");
                setTimeout(() => {
                    submitBtn.textContent = originalText;
                    submitBtn.disabled = false;
                    submitBtn.style.backgroundColor = ""; // Restaura a cor do botão
                }, 5000);
            });
    });
}

// --- Fim da substituição ---
            
    // Animação de digitação para o título
    const nameElement = document.querySelector('.name');
    if (nameElement) {
        const name = nameElement.textContent;
        nameElement.textContent = '';
        
        let i = 0;
        const typeWriter = setInterval(function() {
            if (i < name.length) {
                nameElement.textContent += name.charAt(i);
                i++;
            } else {
                clearInterval(typeWriter);
            }
        }, 100);
    }

    // Animação de fade-in para elementos ao rolar a página
    const fadeElements = document.querySelectorAll('.about-content, .skills-content, .projects-grid, .contact-content');
    
    function fadeIn() {
        fadeElements.forEach(element => {
            const elementTop = element.getBoundingClientRect().top;
            const windowHeight = window.innerHeight;
            
            if (elementTop < windowHeight - 100) {
                element.style.opacity = '1';
                element.style.transform = 'translateY(0)';
            }
        });
    }
    
    // Aplicar estilo inicial
    fadeElements.forEach(element => {
        element.style.opacity = '0';
        element.style.transform = 'translateY(50px)';
        element.style.transition = 'opacity 1s ease, transform 1s ease';
    });
    
    window.addEventListener('scroll', fadeIn);
    window.addEventListener('load', fadeIn);
    
    // Smooth scroll para links de âncora
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            
            const targetId = this.getAttribute('href');
            const targetElement = document.querySelector(targetId);
            
            if (targetElement) {
                window.scrollTo({
                    top: targetElement.offsetTop - 70,
                    behavior: 'smooth'
                });
            }
        });
    });
});

// Pré-carregar imagens de projetos
window.addEventListener('load', function() {
    // Criar imagens de exemplo para os projetos
    const projectImages = document.querySelectorAll('.project-image img');
    
    // Cores para os projetos de exemplo
    const colors = [
        'linear-gradient(45deg, #6c5ce7, #00cec9)',
        'linear-gradient(45deg, #fd79a8, #e84393)',
        'linear-gradient(45deg, #00cec9, #0984e3)'
    ];
    
    projectImages.forEach((img, index) => {
        // Verificar se a imagem existe
        img.onerror = function() {
            // Criar um canvas para gerar uma imagem de exemplo
            const canvas = document.createElement('canvas');
            canvas.width = 800;
            canvas.height = 600;
            const ctx = canvas.getContext('2d');
            
            // Criar um gradiente para o fundo
            const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
            const colorIndex = index % colors.length;
            const color = colors[colorIndex];
            
            // Extrair cores do gradiente linear
            const colorMatch = color.match(/linear-gradient\(45deg, (.*?), (.*?)\)/);
            if (colorMatch && colorMatch.length >= 3) {
                gradient.addColorStop(0, colorMatch[1]);
                gradient.addColorStop(1, colorMatch[2]);
            } else {
                gradient.addColorStop(0, '#6c5ce7');
                gradient.addColorStop(1, '#00cec9');
            }
            
            ctx.fillStyle = gradient;
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            
            // Adicionar alguns elementos decorativos
            ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
            for (let i = 0; i < 10; i++) {
                const size = Math.random() * 100 + 50;
                const x = Math.random() * canvas.width;
                const y = Math.random() * canvas.height;
                ctx.beginPath();
                ctx.arc(x, y, size, 0, Math.PI * 2);
                ctx.fill();
            }
            
            // Adicionar texto do projeto
            ctx.fillStyle = 'white';
            ctx.font = 'bold 40px Poppins, sans-serif';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            
            let projectName = 'Projeto ' + (index + 1);
            switch (index) {
                case 0:
                    projectName = 'Sistema de Gestão';
                    break;
                case 1:
                    projectName = 'E-commerce';
                    break;
                case 2:
                    projectName = 'Aplicativo Mobile';
                    break;
            }
            
            ctx.fillText(projectName, canvas.width / 2, canvas.height / 2);
            
            // Converter o canvas para uma URL de dados e definir como src da imagem
            const dataURL = canvas.toDataURL('image/png');
            img.src = dataURL;
        };
        
        // Tentar carregar a imagem
        if (!img.complete) {
            img.src = img.src;
        }
    });
});
