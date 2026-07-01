/* ==========================================================================
   AGUSTIN POLLAN - PORTFOLIO LOGIC (VANILLA JS)
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {

    // Inicializar Lucide Icons
    if (window.lucide) {
        window.lucide.createIcons();
    }

    // ==========================================================================
    // MENÚ MÓVIL
    // ==========================================================================
    const mobileNavToggle = document.querySelector('.mobile-nav-toggle');
    const mobileMenu = document.querySelector('.mobile-menu');

    if (mobileNavToggle && mobileMenu) {
        mobileNavToggle.addEventListener('click', () => {
            mobileMenu.classList.toggle('open');
            const icon = mobileNavToggle.querySelector('i');
            if (mobileMenu.classList.contains('open')) {
                icon.setAttribute('data-lucide', 'x');
            } else {
                icon.setAttribute('data-lucide', 'menu');
            }
            window.lucide.createIcons();
        });

        // Cerrar menú al hacer clic en un enlace
        mobileMenu.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                mobileMenu.classList.remove('open');
                mobileNavToggle.querySelector('i').setAttribute('data-lucide', 'menu');
                window.lucide.createIcons();
            });
        });
    }

    // ==========================================================================
    // INTERACTIVIDAD DEL DASHBOARD DE PROYECTOS (TABS Y SIDEBAR)
    // ==========================================================================
    const showcaseTabs = document.querySelectorAll('.showcase-tab');
    const projectPanes = document.querySelectorAll('.project-pane');

    showcaseTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const projectKey = tab.getAttribute('data-project');
            
            // Cambiar pestaña activa de la barra lateral
            showcaseTabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');

            // Cambiar panel de detalles activo
            projectPanes.forEach(pane => {
                pane.classList.remove('active');
                if (pane.id === `pane-${projectKey}`) {
                    pane.classList.add('active');
                    
                    // Si el proyecto es MODKEY, redimensionar o actualizar el Canvas
                    if (projectKey === 'modkey') {
                        setTimeout(() => {
                            canvas = document.getElementById('osciloscope');
                            if (canvas) canvasCtx = canvas.getContext('2d');
                            if (canvasCtx && !audioCtx) {
                                canvasCtx.fillStyle = '#040508';
                                canvasCtx.fillRect(0, 0, canvas.width, canvas.height);
                                canvasCtx.lineWidth = 2;
                                canvasCtx.strokeStyle = '#00f2fe';
                                canvasCtx.beginPath();
                                canvasCtx.moveTo(0, canvas.height / 2);
                                canvasCtx.lineTo(canvas.width, canvas.height / 2);
                                canvasCtx.stroke();
                            }
                        }, 50);
                    }
                }
            });
        });
    });

    // Control de navegación interna de cada proyecto (Detalles vs Demo)
    const paneNavBtns = document.querySelectorAll('.pane-nav-btn');
    paneNavBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const viewType = btn.getAttribute('data-view');
            const pane = btn.closest('.project-pane');
            
            // Desactivar botones de navegación en este panel
            pane.querySelectorAll('.pane-nav-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            // Cambiar contenido de tab activo
            pane.querySelectorAll('.pane-tab-content').forEach(content => {
                content.classList.remove('active');
                if (content.getAttribute('data-tab-content') === viewType) {
                    content.classList.add('active');
                }
            });

            // Si se activa la demo de MODKEY y el canvas no se ha enlazado
            if (viewType === 'demo' && pane.id === 'pane-modkey') {
                setTimeout(() => {
                    canvas = document.getElementById('osciloscope');
                    if (canvas) canvasCtx = canvas.getContext('2d');
                }, 50);
            }
        });
    });

    // ==========================================================================
    // DEMO INTERACTIVA 1: MODKEY (SÍNTESIS DE AUDIO Y CANVAS)
    // ==========================================================================
    let audioCtx = null;
    let analyser = null;
    let dataArray = null;
    let canvas = document.getElementById('osciloscope');
    let canvasCtx = canvas ? canvas.getContext('2d') : null;
    let animationId = null;

    // Inicializar Audio Context en la primera interacción
    function initAudio() {
        if (!audioCtx) {
            audioCtx = new (window.AudioContext || window.webkitAudioContext)();
            analyser = audioCtx.createAnalyser();
            analyser.fftSize = 256;
            const bufferLength = analyser.frequencyBinCount;
            dataArray = new Uint8Array(bufferLength);
            
            // Conectar analizador al destino final
            analyser.connect(audioCtx.destination);
            
            // Iniciar dibujo del osciloscopio
            drawOscilloscope();
        }
        if (audioCtx.state === 'suspended') {
            audioCtx.resume();
        }
    }

    // Dibujar Osciloscopio en el Canvas
    function drawOscilloscope() {
        if (!canvas || !canvasCtx) return;

        const width = canvas.width;
        const height = canvas.height;

        animationId = requestAnimationFrame(drawOscilloscope);

        analyser.getByteTimeDomainData(dataArray);

        canvasCtx.fillStyle = '#040508';
        canvasCtx.fillRect(0, 0, width, height);

        canvasCtx.lineWidth = 2;
        canvasCtx.strokeStyle = '#00f2fe';
        canvasCtx.shadowBlur = 4;
        canvasCtx.shadowColor = '#00f2fe';

        canvasCtx.beginPath();

        const sliceWidth = width * 1.0 / dataArray.length;
        let x = 0;

        for (let i = 0; i < dataArray.length; i++) {
            const v = dataArray[i] / 128.0;
            const y = v * height / 2;

            if (i === 0) {
                canvasCtx.moveTo(x, y);
            } else {
                canvasCtx.lineTo(x, y);
            }

            x += sliceWidth;
        }

        canvasCtx.lineTo(width, height / 2);
        canvasCtx.stroke();
        canvasCtx.shadowBlur = 0; // reset
    }

    // Sintetizar sonido del switch de teclado
    function playSwitchSound(type) {
        initAudio();
        
        const osc = audioCtx.createOscillator();
        const gainNode = audioCtx.createGain();
        
        osc.connect(gainNode);
        gainNode.connect(analyser); // enviar al analizador para ver la onda

        const now = audioCtx.currentTime;

        if (type === 'linear') {
            // Sonido "Thock" grave
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(120, now);
            osc.frequency.exponentialRampToValueAtTime(40, now + 0.08);
            
            gainNode.gain.setValueAtTime(0.8, now);
            gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.1);
            
            osc.start(now);
            osc.stop(now + 0.1);

        } else if (type === 'tactile') {
            // Sonido intermedio amortiguado
            osc.type = 'sine';
            osc.frequency.setValueAtTime(180, now);
            osc.frequency.exponentialRampToValueAtTime(60, now + 0.06);
            
            gainNode.gain.setValueAtTime(0.6, now);
            gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.08);
            
            osc.start(now);
            osc.stop(now + 0.08);

        } else if (type === 'clicky') {
            // Sonido agudo metálico
            osc.type = 'square';
            osc.frequency.setValueAtTime(900, now);
            osc.frequency.exponentialRampToValueAtTime(300, now + 0.03);
            
            gainNode.gain.setValueAtTime(0.3, now);
            gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.04);
            
            osc.start(now);
            osc.stop(now + 0.04);
            
            // Simular el click metálico con un oscilador secundario super agudo
            const oscClick = audioCtx.createOscillator();
            const gainClick = audioCtx.createGain();
            oscClick.type = 'sine';
            oscClick.frequency.setValueAtTime(3000, now);
            oscClick.connect(gainClick);
            gainClick.connect(analyser);
            
            gainClick.gain.setValueAtTime(0.4, now);
            gainClick.gain.exponentialRampToValueAtTime(0.001, now + 0.015);
            
            oscClick.start(now);
            oscClick.stop(now + 0.02);
        }
    }

    // Configurar Teclas del Teclado
    const keyButtons = document.querySelectorAll('.key-btn');
    keyButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const switchType = btn.getAttribute('data-switch');
            
            // Efecto visual activo temporal en el botón
            btn.classList.add('active');
            setTimeout(() => btn.classList.remove('active'), 80);
            
            playSwitchSound(switchType);
        });
    });

    // Dibujar línea plana inicial en el Canvas antes de que empiece el audio real
    if (canvas && canvasCtx) {
        canvasCtx.fillStyle = '#040508';
        canvasCtx.fillRect(0, 0, canvas.width, canvas.height);
        canvasCtx.lineWidth = 2;
        canvasCtx.strokeStyle = '#00f2fe';
        canvasCtx.beginPath();
        canvasCtx.moveTo(0, canvas.height / 2);
        canvasCtx.lineTo(canvas.width, canvas.height / 2);
        canvasCtx.stroke();
    }


    // ==========================================================================
    // DEMO INTERACTIVA 2: MERCADO LIBRE PRO (TARJETA 3D)
    // ==========================================================================
    const cardWrapper = document.querySelector('.card-3d-wrapper');
    const cardElement = document.querySelector('.card-3d');
    const flipBtn = document.getElementById('flipCardBtn');
    const brandSelect = document.getElementById('cardBrandSelect');
    const brandText = document.getElementById('cardBrand');

    if (cardWrapper && cardElement) {
        // Giro 3D con movimiento del cursor
        cardWrapper.addEventListener('mousemove', (e) => {
            const rect = cardWrapper.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            const px = (x / rect.width) * 100;
            const py = (y / rect.height) * 100;
            
            // Calcular rotación basada en coordenadas del mouse
            const rotateX = (50 - py) * 0.4; // inclinación máx 20deg
            const rotateY = (px - 50) * 0.4;
            
            // Si la tarjeta está girada boca abajo, ajustar rotación en Y
            if (cardElement.classList.contains('flipped')) {
                cardElement.style.transform = `rotateY(${180 + rotateY}deg) rotateX(${-rotateX}deg)`;
            } else {
                cardElement.style.transform = `rotateY(${rotateY}deg) rotateX(${rotateX}deg)`;
            }
        });

        // Resetear inclinación al salir
        cardWrapper.addEventListener('mouseleave', () => {
            if (cardElement.classList.contains('flipped')) {
                cardElement.style.transform = 'rotateY(180deg)';
            } else {
                cardElement.style.transform = 'rotateY(0deg)';
            }
        });

        // Giro manual al hacer click en el botón
        if (flipBtn) {
            flipBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                cardElement.classList.toggle('flipped');
                if (cardElement.classList.contains('flipped')) {
                    cardElement.style.transform = 'rotateY(180deg)';
                } else {
                    cardElement.style.transform = 'rotateY(0deg)';
                }
            });
        }

        // Selección de marca de tarjeta
        if (brandSelect && brandText) {
            brandSelect.addEventListener('change', () => {
                const val = brandSelect.value;
                brandText.textContent = val.toUpperCase();
                
                // Actualizar gradiente de tarjeta frontal según marca
                const front = document.querySelector('.card-front');
                if (val === 'visa') {
                    front.style.background = 'linear-gradient(135deg, #1e1e2f 0%, #0d0e15 100%)';
                } else if (val === 'mastercard') {
                    front.style.background = 'linear-gradient(135deg, #a855f7 0%, #1e1e2f 100%)';
                }
            });
        }
    }


    // ==========================================================================
    // DEMO INTERACTIVA 3: TURNERO LOS PORTEÑOS (DIAGNÓSTICO AUTOMOTRIZ)
    // ==========================================================================
    const carZones = document.querySelectorAll('.car-zone');
    const diagPanel = document.getElementById('diagnosticPanel');
    const diagTitle = document.getElementById('diagZoneTitle');
    const diagDesc = document.getElementById('diagZoneDesc');
    const diagPrice = document.getElementById('diagZonePrice');

    // Base de datos de servicios por zona
    const diagnosticsDB = {
        ecu: {
            title: "Unidad de Control (ECU)",
            desc: "Escaneo computarizado OBD2, borrado de fallas de inyección, mapeo de parámetros electrónicos y reparación física de placas dañadas.",
            price: "$35.000 ARS"
        },
        carga: {
            title: "Sistema de Carga y Batería",
            desc: "Prueba de rendimiento de alternador, cambio de carbones/regulador de voltaje y testeo de conductancia de batería con informe.",
            price: "$22.000 ARS"
        },
        luces: {
            title: "Faros y Luces LED",
            desc: "Instalación de lámparas LED de alta luminosidad, reparación de cableados quemados de ópticas y calibración de altura de faros.",
            price: "$15.000 ARS"
        },
        confort: {
            title: "Módulo Confort y Accesorios",
            desc: "Reparación de levantavidrios eléctricos, destrabe de cierre centralizado de puertas, alarmas volumétricas y sensores de marcha atrás.",
            price: "$28.000 ARS"
        }
    };

    if (carZones.length > 0 && diagPanel && diagTitle && diagDesc && diagPrice) {
        carZones.forEach(zone => {
            zone.addEventListener('click', () => {
                // Quitar activo de todos
                carZones.forEach(z => z.classList.remove('active'));
                
                // Activar actual
                zone.classList.add('active');
                
                const key = zone.getAttribute('data-zone');
                const data = diagnosticsDB[key];
                
                if (data) {
                    // Animación suave de texto
                    diagPanel.style.opacity = 0;
                    setTimeout(() => {
                        diagTitle.textContent = data.title;
                        diagDesc.textContent = data.desc;
                        diagPrice.textContent = `Precio Estimado: ${data.price}`;
                        diagPanel.style.opacity = 1;
                    }, 150);
                }
            });
        });
    }


    // ==========================================================================
    // DEMO INTERACTIVA 4: APR NEUMÁTICOS (QUIZ PASO A PASO)
    // ==========================================================================
    const quizSteps = document.querySelectorAll('.quiz-step');
    const quizOptButtons = document.querySelectorAll('.quiz-opt-btn');
    const resetQuizBtn = document.getElementById('resetQuizBtn');
    
    const resultTireName = document.getElementById('resultTireName');
    const resultTireDesc = document.getElementById('resultTireDesc');
    const resultTireSpecs = document.getElementById('resultTireSpecs');

    let quizData = {
        vehiculo: '',
        uso: ''
    };

    if (quizSteps.length > 0) {
        quizOptButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                const parentStep = btn.closest('.quiz-step');
                const currentStepNum = parseInt(parentStep.getAttribute('data-step'));
                const nextStepNum = currentStepNum + 1;
                
                // Guardar valor seleccionado
                if (currentStepNum === 1) {
                    quizData.vehiculo = btn.getAttribute('data-val');
                } else if (currentStepNum === 2) {
                    quizData.uso = btn.getAttribute('data-val');
                }
                
                // Transición al siguiente paso
                const currentStep = document.querySelector(`.quiz-step[data-step="${currentStepNum}"]`);
                const nextStep = document.querySelector(`.quiz-step[data-step="${nextStepNum}"]`);
                
                if (currentStep && nextStep) {
                    currentStep.classList.remove('active');
                    nextStep.classList.add('active');
                    
                    // Si llegamos al resultado (Paso 3), calcular la recomendación
                    if (nextStepNum === 3) {
                        calculateRecommendation();
                    }
                }
            });
        });

        if (resetQuizBtn) {
            resetQuizBtn.addEventListener('click', () => {
                // Resetear datos
                quizData.vehiculo = '';
                quizData.uso = '';
                
                // Volver a paso 1
                document.querySelector('.quiz-step[data-step="3"]').classList.remove('active');
                document.querySelector('.quiz-step[data-step="1"]').classList.add('active');
            });
        }
    }

    function calculateRecommendation() {
        if (!resultTireName || !resultTireDesc || !resultTireSpecs) return;

        let name = '';
        let desc = '';
        let specs = '';

        if (quizData.vehiculo === 'auto') {
            if (quizData.uso === 'ciudad') {
                name = "Pirelli Cinturato P7";
                desc = "Diseño optimizado para asfalto que reduce el consumo de combustible y la emisión de ruidos. Excelente control de frenado en superficies secas y mojadas.";
                specs = "Medida: 205/55R16 | Carga: 91V | Tipo: Asfalto (H/T)";
            } else {
                name = "Bridgestone Dueler A/T D697";
                desc = "Neumático All-Terrain de alta durabilidad para vehículos urbanos que viajan por caminos mixtos (asfalto y ripio). Flancos reforzados contra perforaciones.";
                specs = "Medida: 205/65R15 | Carga: 94T | Tipo: Todo Terreno (A/T)";
            }
        } else { // SUV / Camioneta
            if (quizData.uso === 'ciudad') {
                name = "Michelin Primacy SUV";
                desc = "Diseñado para SUVs de alto rendimiento. Ofrece el máximo confort de marcha, bajo nivel de ruido acústico y frenado superior en calzadas mojadas.";
                specs = "Medida: 225/65R17 | Carga: 102H | Tipo: Asfalto Premium";
            } else {
                name = "Goodyear Wrangler Duratrac";
                desc = "Neumático todo terreno agresivo de tracción superior en terrenos difíciles como barro, arena y rocas. La elección ideal para el trabajo rural off-road.";
                specs = "Medida: 265/70R16 | Carga: 112S | Tipo: Off-Road Extremo (M/T)";
            }
        }

        resultTireName.textContent = name;
        resultTireDesc.textContent = desc;
        resultTireSpecs.textContent = specs;
    }


    // ==========================================================================
    // FORMULARIO DE CONTACTO (INTEGRACIÓN FORMSPREE)
    // ==========================================================================
    const contactForm = document.getElementById('contactForm');
    const formStatus = document.getElementById('formStatus');

    // ID de Formspree (Agustín puede cambiar este ID por el suyo propio)
    // Para obtenerlo: Regístrate gratis en https://formspree.io, crea un formulario
    // asociado a tu correo agustinpollanceo@gmail.com y copia el ID provisto.
    const FORMSPREE_ID = "mlgypren"; // ID de Formspree de Agustín

    if (contactForm && formStatus) {
        contactForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            const submitBtn = contactForm.querySelector('button[type="submit"]');
            const originalBtnText = submitBtn.innerHTML;
            
            submitBtn.disabled = true;
            submitBtn.innerHTML = 'Enviando...';
            formStatus.className = 'form-status';
            formStatus.textContent = '';
            
            const formData = new FormData(contactForm);

            // Si es la clave de simulación por defecto, emular comportamiento local
            if (FORMSPREE_ID === "xvgopkzw" || FORMSPREE_ID === "") {
                setTimeout(() => {
                    submitBtn.disabled = false;
                    submitBtn.innerHTML = originalBtnText;
                    formStatus.className = 'form-status success';
                    formStatus.textContent = '¡Simulación de Envío con Éxito! (Nota: Recuerda cambiar el FORMSPREE_ID en app.js para recibir correos reales).';
                    contactForm.reset();
                    
                    setTimeout(() => {
                        formStatus.textContent = '';
                        formStatus.className = 'form-status';
                    }, 6000);
                }, 1200);
                return;
            }

            // Envío real mediante Fetch POST a Formspree
            fetch(`https://formspree.io/f/${FORMSPREE_ID}`, {
                method: 'POST',
                body: formData,
                headers: {
                    'Accept': 'application/json'
                }
            })
            .then(response => {
                if (response.ok) {
                    formStatus.className = 'form-status success';
                    formStatus.textContent = '¡Mensaje enviado con éxito! Te responderé lo antes posible a tu correo.';
                    contactForm.reset();
                } else {
                    response.json().then(data => {
                        if (Object.hasOwn(data, 'errors')) {
                            formStatus.textContent = data["errors"].map(error => error["message"]).join(", ");
                        } else {
                            formStatus.textContent = 'Ocurrió un error al intentar enviar el formulario.';
                        }
                        formStatus.className = 'form-status error';
                    });
                }
            })
            .catch(error => {
                formStatus.className = 'form-status error';
                formStatus.textContent = 'Error de conexión. Verifica tu conexión de red e intenta nuevamente.';
            })
            .finally(() => {
                submitBtn.disabled = false;
                submitBtn.innerHTML = originalBtnText;
                
                setTimeout(() => {
                    formStatus.textContent = '';
                    formStatus.className = 'form-status';
                }, 5000);
            });
        });
    }

    // ==========================================================================
    // FILTRADO INTERACTIVO DE STACK TECNOLÓGICO
    // ==========================================================================
    const filterBtns = document.querySelectorAll('.skills-filter-bar .filter-btn');
    const skillPills = document.querySelectorAll('.skills-grid .skill-pill');
    const categoryCards = document.querySelectorAll('.skills-grid .skills-category-card');

    if (filterBtns.length > 0) {
        filterBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const category = btn.getAttribute('data-filter');

                // Cambiar botón activo
                filterBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');

                // Si se selecciona 'Todos', resetear estados
                if (category === 'all') {
                    skillPills.forEach(pill => {
                        pill.classList.remove('active-pill', 'dimmed-pill');
                    });
                    categoryCards.forEach(card => {
                        card.classList.remove('dimmed-card');
                    });
                } else {
                    // Filtrar pills individualmente
                    skillPills.forEach(pill => {
                        const pillCategory = pill.getAttribute('data-category');
                        if (pillCategory === category) {
                            pill.classList.add('active-pill');
                            pill.classList.remove('dimmed-pill');
                        } else {
                            pill.classList.remove('active-pill');
                            pill.classList.add('dimmed-pill');
                        }
                    });

                    // Atenuar tarjetas de categoría si no contienen ninguna píldora activa
                    categoryCards.forEach(card => {
                        const cardCategory = card.getAttribute('data-card-category');
                        const hasMatchingPills = card.querySelector(`.skill-pill[data-category="${category}"]`) !== null;

                        if (hasMatchingPills || cardCategory === category) {
                            card.classList.remove('dimmed-card');
                        } else {
                            card.classList.add('dimmed-card');
                        }
                    });
                }
            });
        });
    }

});
