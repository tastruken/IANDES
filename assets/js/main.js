/**
 * JavaScript para Inmobiliaria Iandes
 * Funcionalidad interactiva y animaciones premium
 */

document.addEventListener('DOMContentLoaded', async () => {
    await loadHeaderFooter();
    initHeaderScroll();
    initScrollReveal();
    initFAQAccordion();
    initProjectMediaTabs();
    initProjectTypologySelector();
    initInvestorCalculator();
    initProjectFilters();
});

/**
 * 0. Cargar Header y Footer Dinámicos
 */
async function loadHeaderFooter() {
    const header = document.querySelector('header');
    const footer = document.querySelector('footer');
    const promises = [];

    if (header) {
        promises.push(
            fetch('header.html')
                .then(response => {
                    if (!response.ok) throw new Error('Network response was not ok');
                    return response.text();
                })
                .then(html => {
                    header.innerHTML = html;

                    // Destacar enlace de página activa
                    const currentPath = window.location.pathname;
                    const pageName = currentPath.split('/').pop() || 'index.html';
                    
                    let activeId = 'nav-index';
                    if (pageName.includes('proyecto-')) {
                        activeId = 'nav-proyectos';
                    } else if (pageName.includes('nosotros')) {
                        activeId = 'nav-nosotros';
                    } else if (pageName.includes('inversionistas')) {
                        activeId = 'nav-inversionistas';
                    } else if (pageName.includes('postventa')) {
                        activeId = 'nav-postventa';
                    } else if (pageName.includes('blog') || pageName.includes('articulo-')) {
                        activeId = 'nav-blog';
                    } else if (pageName.includes('contacto')) {
                        activeId = 'nav-contacto';
                    } else if (pageName.includes('index')) {
                        activeId = 'nav-index';
                    }

                    const activeLink = document.getElementById(activeId);
                    if (activeLink) {
                        activeLink.classList.add('active');
                    }

                    // Inicializar menú móvil ahora que los nodos existen
                    initMobileMenu();
                })
                .catch(err => {
                    console.warn('Error cargando header.html:', err);
                    // Fallback: si se abre localmente por file://, mostrar advertencia amigable
                    if (window.location.protocol === 'file:') {
                        header.innerHTML = `<div class="container" style="padding:1rem; text-align:center; color:red; font-size:0.8rem;">
                            <strong>Aviso de CORS:</strong> Para visualizar el menú y pie de página modulares, 
                            por favor abre el sitio a través del servidor local ejecutando <code>serve.ps1</code> en la dirección 
                            <a href="http://localhost:8000/" target="_blank">http://localhost:8000/</a>.
                        </div>`;
                    }
                })
        );
    }

    if (footer) {
        promises.push(
            fetch('footer.html')
                .then(response => {
                    if (!response.ok) throw new Error('Network response was not ok');
                    return response.text();
                })
                .then(html => {
                    footer.innerHTML = html;
                })
                .catch(err => {
                    console.warn('Error cargando footer.html:', err);
                })
        );
    }

    await Promise.all(promises);
}


/**
 * 1. Efecto Scroll en Navbar
 */
function initHeaderScroll() {
    const header = document.querySelector('header');
    if (!header) return;

    const handleScroll = () => {
        if (window.scrollY > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll(); // Ejecutar al inicio por si ya hay scroll
}

/**
 * 2. Menú Móvil Hamburger
 */
function initMobileMenu() {
    const hamburger = document.querySelector('.hamburger');
    const nav = document.querySelector('nav');

    if (!hamburger || !nav) return;

    hamburger.addEventListener('click', () => {
        hamburger.classList.toggle('active');
        nav.classList.toggle('active');
    });

    // Control del dropdown en móviles
    const dropdown = nav.querySelector('.dropdown');
    const dropdownTrigger = nav.querySelector('.dropdown-trigger');
    
    if (dropdown && dropdownTrigger) {
        dropdownTrigger.addEventListener('click', (e) => {
            if (window.innerWidth <= 768) {
                e.preventDefault(); // Evitar navegación directa en móviles para permitir desplegar
                dropdown.classList.toggle('active');
            }
        });
    }

    // Cerrar menú al hacer clic en enlaces (excluyendo el disparador del dropdown)
    const navLinks = nav.querySelectorAll('a');
    navLinks.forEach(link => {
        if (!link.classList.contains('dropdown-trigger')) {
            link.addEventListener('click', () => {
                hamburger.classList.remove('active');
                nav.classList.remove('active');
                if (dropdown) {
                    dropdown.classList.remove('active');
                }
            });
        }
    });
}


/**
 * 3. Animación Scroll Reveal (Intersection Observer)
 */
function initScrollReveal() {
    const reveals = document.querySelectorAll('.reveal');
    if (reveals.length === 0) return;

    if ('IntersectionObserver' in window) {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('active');
                    observer.unobserve(entry.target); // Dejar de observar una vez animado
                }
            });
        }, {
            threshold: 0.15,
            rootMargin: '0px 0px -50px 0px'
        });

        reveals.forEach(reveal => observer.observe(reveal));
    } else {
        // Fallback si no está soportado
        reveals.forEach(reveal => reveal.classList.add('active'));
    }
}

/**
 * 4. Acordeón FAQs (Postventa)
 */
function initFAQAccordion() {
    const faqQuestions = document.querySelectorAll('.faq-question');
    if (faqQuestions.length === 0) return;

    faqQuestions.forEach(question => {
        question.addEventListener('click', () => {
            const parent = question.parentElement;
            const isActive = parent.classList.contains('active');

            // Cerrar otros abiertos (opcional, estilo limpio)
            document.querySelectorAll('.faq-item').forEach(item => {
                item.classList.remove('active');
            });

            if (!isActive) {
                parent.classList.add('active');
            }
        });
    });
}

/**
 * 5. Pestañas de Galería Multimedia (Ficha Proyecto)
 */
function initProjectMediaTabs() {
    const tabButtons = document.querySelectorAll('.media-tab-btn');
    const mediaViewer = document.querySelector('.media-viewer');

    if (tabButtons.length === 0 || !mediaViewer) return;

    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            // Quitar clase activa de botones
            tabButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');

            const type = button.dataset.type;
            const src = button.dataset.src;
            const title = button.dataset.title || '';

            // Limpiar visor
            mediaViewer.innerHTML = '';

            if (type === 'image') {
                const img = document.createElement('img');
                img.src = src;
                img.alt = title;
                mediaViewer.appendChild(img);
            } else if (type === 'video') {
                const iframe = document.createElement('iframe');
                iframe.src = src;
                iframe.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture';
                iframe.allowFullscreen = true;
                mediaViewer.appendChild(iframe);
            } else if (type === 'tour360') {
                // Mock interactivo de un Tour 360° con una overlay elegante
                const overlay = document.createElement('div');
                overlay.className = 'tour-360-overlay';
                overlay.innerHTML = `
                    <h4>Recorrido Virtual 360°</h4>
                    <p style="margin-bottom: 1.5rem; max-width: 400px; font-size: 0.85rem; color: rgba(255,255,255,0.8);">
                        Explora los espacios pilotos interactivos de forma inmersiva directamente desde tu dispositivo.
                    </p>
                    <button class="btn btn-secondary" style="border-color: #FFFFFF; color: #FFFFFF; font-size:0.7rem;">Iniciar Tour Interactivo</button>
                `;
                
                const img = document.createElement('img');
                img.src = src;
                img.alt = 'Vista 360';
                
                mediaViewer.appendChild(img);
                mediaViewer.appendChild(overlay);

                // Agregar evento para simular carga
                overlay.querySelector('button').addEventListener('click', (e) => {
                    e.currentTarget.textContent = 'Cargando Entorno Inmersivo...';
                    setTimeout(() => {
                        overlay.innerHTML = `
                            <h4 style="color: #E0C9A6;">Entorno Piloto Activo</h4>
                            <p style="font-size:0.8rem; color: rgba(255,255,255,0.9); margin-bottom: 0.5rem;">Haz arrastre en la pantalla para girar la cámara</p>
                            <span style="font-size: 0.65rem; letter-spacing: 0.2em; text-transform: uppercase; opacity: 0.7;">[ Modo Demostración Interactivo ]</span>
                        `;
                    }, 1200);
                });
            }
        });
    });
}

/**
 * 6. Selector de Tipologías en Ficha de Proyecto (Actualiza Cotizador)
 */
function initProjectTypologySelector() {
    const typologyRows = document.querySelectorAll('.typology-row');
    const selectTipologia = document.getElementById('select-tipologia');
    const cotizadorPrice = document.getElementById('cotizador-price');

    if (typologyRows.length === 0) return;

    typologyRows.forEach(row => {
        row.addEventListener('click', () => {
            const tipologiaId = row.dataset.id;
            const price = row.dataset.price;
            const title = row.dataset.title;

            // Actualizar selector en el formulario
            if (selectTipologia) {
                selectTipologia.value = tipologiaId;
            }

            // Actualizar precio en la sidebar
            if (cotizadorPrice) {
                cotizadorPrice.textContent = `Desde UF ${price}`;
                // Pequeña animación de parpadeo suave para indicar cambio
                cotizadorPrice.style.opacity = '0.5';
                setTimeout(() => {
                    cotizadorPrice.style.opacity = '1';
                }, 150);
            }

            // Hacer scroll suave al cotizador si es mobile
            if (window.innerWidth <= 1024) {
                const cotizador = document.querySelector('.sidebar-cotizador');
                if (cotizador) {
                    cotizador.scrollIntoView({ behavior: 'smooth' });
                }
            }
        });
    });

    // Cambiar precio cuando se cambia manualmente el select del cotizador
    if (selectTipologia) {
        selectTipologia.addEventListener('change', () => {
            const selectedOption = selectTipologia.options[selectTipologia.selectedIndex];
            const price = selectedOption.dataset.price;
            if (price && cotizadorPrice) {
                cotizadorPrice.textContent = `Desde UF ${price}`;
            }
        });
    }
}

/**
 * 7. Calculadora de Retorno de Inversión (Inversionistas B2B)
 */
function initInvestorCalculator() {
    const valorPropiedadInput = document.getElementById('calc-valor-propiedad');
    const piePorcentajeInput = document.getElementById('calc-pie-porcentaje');
    const plazoAnosInput = document.getElementById('calc-plazo-anos');
    const tasaInteresInput = document.getElementById('calc-tasa-interes');

    const resultDividendo = document.getElementById('result-dividendo');
    const resultArriendo = document.getElementById('result-arriendo');
    const resultCapRate = document.getElementById('result-cap-rate');
    const resultRoi = document.getElementById('result-roi');

    if (!valorPropiedadInput || !piePorcentajeInput || !plazoAnosInput || !tasaInteresInput) return;

    const calculateROI = () => {
        const valorProp = parseFloat(valorPropiedadInput.value) || 0;
        const piePct = parseFloat(piePorcentajeInput.value) || 0;
        const plazo = parseFloat(plazoAnosInput.value) || 0;
        const tasa = parseFloat(tasaInteresInput.value) || 0;

        if (valorProp <= 0) {
            if (resultDividendo) resultDividendo.textContent = 'UF -';
            if (resultArriendo) resultArriendo.textContent = 'UF -';
            if (resultCapRate) resultCapRate.textContent = '-';
            if (resultRoi) resultRoi.textContent = '-';
            return;
        }

        // Cálculos base
        const montoPie = valorProp * (piePct / 100);
        const montoCredito = valorProp - montoPie;

        // Dividendo mensual aproximado (Fórmula francesa simple)
        // Convertir tasa anual nominal a tasa mensual efectiva
        const tasaMensual = (tasa / 100) / 12;
        const numPagos = plazo * 12;
        
        let dividendoUF = 0;
        if (tasaMensual > 0 && numPagos > 0) {
            dividendoUF = montoCredito * ( (tasaMensual * Math.pow(1 + tasaMensual, numPagos)) / (Math.pow(1 + tasaMensual, numPagos) - 1) );
        } else if (numPagos > 0) {
            dividendoUF = montoCredito / numPagos;
        }

        // Estimación de arriendo mensual (tasa de arriendo tradicional: ~0.4% a 0.5% del valor de la propiedad)
        const arriendoUF = valorProp * 0.0045;

        // Ingreso Neto Anual Estimado (considerando 1 mes de vacancia al año)
        const ingresosAnuales = arriendoUF * 11;
        const gastosAnuales = (dividendoUF * 12) + (valorProp * 0.003); // Contribuciones y mantenciones aprox
        
        // Cap Rate (Capitalization Rate) = Ingreso Operativo Neto Anual / Valor Propiedad
        const netOperatingIncome = arriendoUF * 12 - (valorProp * 0.005); // Menos gastos de mantención sutiles
        const capRate = (netOperatingIncome / valorProp) * 100;

        // ROI Anual sobre el Capital Propio (Pie)
        // ROI = (Flujo de Caja Anual + Amortización de Deuda) / Pie Invertido
        // Si no hay pie, el ROI tiende a infinito matemáticamente, así que capamos a montoPie > 0
        let roi = 0;
        if (montoPie > 0) {
            const cashFlowAnual = (arriendoUF - dividendoUF) * 12;
            const plusvaliaAnualEstimada = valorProp * 0.04; // Plusvalía supuesta de 4% anual
            roi = ((cashFlowAnual + plusvaliaAnualEstimada) / montoPie) * 100;
        } else {
            roi = capRate * 1.5; // Estimación simple sin pie
        }

        // Actualizar UI
        if (resultDividendo) resultDividendo.textContent = `UF ${dividendoUF.toFixed(1)}`;
        if (resultArriendo) resultArriendo.textContent = `UF ${arriendoUF.toFixed(1)}`;
        if (resultCapRate) resultCapRate.textContent = `${capRate.toFixed(2)}%`;
        if (resultRoi) resultRoi.textContent = `${roi.toFixed(1)}%`;
    };

    // Agregar listeners
    const inputs = [valorPropiedadInput, piePorcentajeInput, plazoAnosInput, tasaInteresInput];
    inputs.forEach(input => {
        input.addEventListener('input', calculateROI);
    });

    // Calcular por primera vez
    calculateROI();
}

/**
 * 8. Filtros Comerciales (Buscador y Pestañas en Home)
 */
function initProjectFilters() {
    const btnBuscar = document.getElementById('btn-buscar');
    const searchComuna = document.getElementById('search-comuna');
    const searchTipo = document.getElementById('search-tipo');
    const searchPrecio = document.getElementById('search-precio');
    
    const tabBtns = document.querySelectorAll('.tab-filter-btn');
    const projectCards = document.querySelectorAll('.project-card');
    const projectsGrid = document.querySelector('.projects-grid');
    
    if (projectCards.length === 0) return;

    // Crear mensaje de "sin resultados" si no existe
    let noResultsMsg = document.getElementById('no-results-msg');
    if (!noResultsMsg && projectsGrid) {
        noResultsMsg = document.createElement('div');
        noResultsMsg.id = 'no-results-msg';
        noResultsMsg.style.display = 'none';
        noResultsMsg.style.textAlign = 'center';
        noResultsMsg.style.padding = '5rem 2rem';
        noResultsMsg.style.gridColumn = '1 / -1';
        noResultsMsg.style.fontFamily = 'var(--font-serif)';
        noResultsMsg.style.fontSize = '1.4rem';
        noResultsMsg.style.color = 'var(--color-text-muted)';
        noResultsMsg.innerHTML = `
            <p>No encontramos proyectos que coincidan con tu búsqueda.</p>
            <button class="btn btn-secondary" style="margin-top:1.5rem; font-size:0.75rem; padding:0.6rem 1.2rem;" id="btn-reset-filters">Ver todos los proyectos</button>
        `;
        projectsGrid.appendChild(noResultsMsg);
        
        document.getElementById('btn-reset-filters').addEventListener('click', () => {
            if (searchComuna) searchComuna.value = 'todos';
            if (searchTipo) searchTipo.value = 'todos';
            if (searchPrecio) searchPrecio.value = 'todos';
            
            // Reset tabs
            tabBtns.forEach(btn => {
                if (btn.dataset.filter === 'todos') {
                    btn.classList.add('active');
                } else {
                    btn.classList.remove('active');
                }
            });
            
            filterProjects('todos', 'todos', 'todos', 'todos');
        });
    }

    // Estado activo de filtros
    let activeState = 'todos';
    let activeComuna = 'todos';
    let activeTipo = 'todos';
    let activePrecio = 'todos';

    // Función principal de filtrado
    const filterProjects = (state, comuna, tipo, precio) => {
        let visibleCount = 0;
        
        projectCards.forEach(card => {
            const cardState = card.dataset.estado;
            const cardComuna = card.dataset.comuna;
            const cardTipo = card.dataset.tipo;
            const cardPrecio = card.dataset.precio;

            const stateMatch = (state === 'todos' || cardState === state);
            const comunaMatch = (comuna === 'todos' || cardComuna === comuna);
            const tipoMatch = (tipo === 'todos' || cardTipo === tipo);
            const precioMatch = (precio === 'todos' || cardPrecio === precio);

            if (stateMatch && comunaMatch && tipoMatch && precioMatch) {
                card.style.display = 'block';
                // Añadir clase active para gatillar transiciones CSS
                setTimeout(() => {
                    card.classList.add('active');
                }, 50);
                visibleCount++;
            } else {
                card.style.display = 'none';
                card.classList.remove('active');
            }
        });

        if (noResultsMsg) {
            noResultsMsg.style.display = (visibleCount === 0) ? 'block' : 'none';
        }
    };

    // Handler del botón Buscar
    if (btnBuscar) {
        btnBuscar.addEventListener('click', () => {
            activeComuna = searchComuna ? searchComuna.value : 'todos';
            activeTipo = searchTipo ? searchTipo.value : 'todos';
            activePrecio = searchPrecio ? searchPrecio.value : 'todos';
            
            // Al buscar, resetear las tabs a "Todos" para evitar choques confusos
            tabBtns.forEach(btn => {
                if (btn.dataset.filter === 'todos') {
                    btn.classList.add('active');
                } else {
                    btn.classList.remove('active');
                }
            });
            activeState = 'todos';

            filterProjects(activeState, activeComuna, activeTipo, activePrecio);
            
            // Desplazar un poco la vista si es móvil para ver resultados
            if (window.innerWidth <= 768 && projectsGrid) {
                projectsGrid.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        });
    }

    // Handlers de las pestañas (Tabs)
    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            tabBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            activeState = btn.dataset.filter;
            
            // Al presionar una pestaña comercial, reseteamos el buscador para evitar confusión
            if (searchComuna) searchComuna.value = 'todos';
            if (searchTipo) searchTipo.value = 'todos';
            if (searchPrecio) searchPrecio.value = 'todos';
            activeComuna = 'todos';
            activeTipo = 'todos';
            activePrecio = 'todos';

            filterProjects(activeState, activeComuna, activeTipo, activePrecio);
        });
    });
}
