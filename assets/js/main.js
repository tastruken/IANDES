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
    const categoryBtns = document.querySelectorAll('.faq-category-btn');
    const faqGroupElements = document.querySelectorAll('.faq-group');

    // 1. Acordeón: Manejador de clics para expandir/colapsar
    faqQuestions.forEach(question => {
        question.addEventListener('click', () => {
            const parent = question.parentElement;
            const isActive = parent.classList.contains('active');
            const siblingItems = parent.parentElement.querySelectorAll('.faq-item');

            // Cerrar otros abiertos dentro del mismo grupo
            siblingItems.forEach(item => {
                item.classList.remove('active');
                const ans = item.querySelector('.faq-answer');
                if (ans) ans.style.maxHeight = null;
            });

            if (!isActive) {
                parent.classList.add('active');
                const ans = parent.querySelector('.faq-answer');
                if (ans) ans.style.maxHeight = ans.scrollHeight + 'px';
            }
        });
    });

    // 2. Sidebar: Filtros de categorías
    if (categoryBtns.length > 0) {
        categoryBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                categoryBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                
                const targetCategory = btn.dataset.category;
                
                faqGroupElements.forEach(group => {
                    if (targetCategory === 'todos' || group.id === targetCategory) {
                        group.style.display = 'block';
                    } else {
                        group.style.display = 'none';
                    }
                });
            });
        });
    }
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
                if (src.includes(',')) {
                    const urls = src.split(',').map(url => url.trim());
                    let carouselHtml = `
                        <div class="media-carousel">
                            <div class="media-carousel-slides">
                    `;
                    urls.forEach((url, index) => {
                        carouselHtml += `<img class="media-slide${index === 0 ? ' active' : ''}" src="${url}" alt="${title} - Imagen ${index + 1}">`;
                    });
                    carouselHtml += `
                            </div>
                            <button class="media-carousel-arrow prev" aria-label="Anterior">&lsaquo;</button>
                            <button class="media-carousel-arrow next" aria-label="Siguiente">&rsaquo;</button>
                            <div class="media-carousel-dots">
                    `;
                    urls.forEach((_, index) => {
                        carouselHtml += `<span class="media-carousel-dot${index === 0 ? ' active' : ''}" data-index="${index}"></span>`;
                    });
                    carouselHtml += `
                            </div>
                        </div>
                    `;
                    mediaViewer.innerHTML = carouselHtml;

                    const container = mediaViewer.querySelector('.media-carousel');
                    const slides = container.querySelectorAll('.media-slide');
                    const dots = container.querySelectorAll('.media-carousel-dot');
                    let currentIndex = 0;

                    const showSlide = (index) => {
                        slides.forEach(s => s.classList.remove('active'));
                        dots.forEach(d => d.classList.remove('active'));
                        slides[index].classList.add('active');
                        dots[index].classList.add('active');
                        currentIndex = index;
                    };

                    container.querySelector('.media-carousel-arrow.prev').addEventListener('click', (e) => {
                        e.stopPropagation();
                        let index = currentIndex - 1;
                        if (index < 0) index = slides.length - 1;
                        showSlide(index);
                    });

                    container.querySelector('.media-carousel-arrow.next').addEventListener('click', (e) => {
                        e.stopPropagation();
                        let index = currentIndex + 1;
                        if (index >= slides.length) index = 0;
                        showSlide(index);
                    });

                    dots.forEach(dot => {
                        dot.addEventListener('click', (e) => {
                            e.stopPropagation();
                            const index = parseInt(dot.dataset.index);
                            showSlide(index);
                        });
                    });
                } else {
                    const img = document.createElement('img');
                    img.src = src;
                    img.alt = title;
                    mediaViewer.appendChild(img);
                }
            } else if (type === 'video') {
                const iframe = document.createElement('iframe');
                iframe.src = src;
                iframe.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture';
                iframe.allowFullscreen = true;
                mediaViewer.appendChild(iframe);
            } else if (type === 'tour360') {
                const tabBtnInterior = document.getElementById('tab-btn-interior');
                const bgRaw = tabBtnInterior ? tabBtnInterior.dataset.src : '';
                const bgSrc = bgRaw ? bgRaw.split(',')[0].trim() : 'assets/images/proyectos/proyecto-andes-nunoa/render.png';

                const overlay = document.createElement('div');
                overlay.className = 'tour-360-overlay';
                overlay.innerHTML = `
                    <h4>Recorrido Virtual 360°</h4>
                    <p style="margin-bottom: 1.5rem; max-width: 400px; font-size: 0.85rem; color: rgba(255,255,255,0.8);">
                        Explora los espacios pilotos interactivos de forma inmersiva directamente desde tu dispositivo.
                    </p>
                    <button class="btn btn-secondary" style="border-color: #FFFFFF; color: #FFFFFF; font-size: 0.7rem;">Iniciar Tour Interactivo</button>
                `;
                
                const img = document.createElement('img');
                img.src = bgSrc;
                img.alt = 'Vista 360';
                
                mediaViewer.appendChild(img);
                mediaViewer.appendChild(overlay);

                overlay.querySelector('button').addEventListener('click', (e) => {
                    e.currentTarget.textContent = 'Cargando Entorno Inmersivo...';
                    setTimeout(() => {
                        const iframe = document.createElement('iframe');
                        iframe.src = src;
                        iframe.allow = 'xr-spatial-tracking; vr; gyroscope; accelerometer; autoplay; fullscreen';
                        iframe.allowFullscreen = true;
                        iframe.style.width = '100%';
                        iframe.style.height = '100%';
                        iframe.style.border = 'none';
                        mediaViewer.innerHTML = '';
                        mediaViewer.appendChild(iframe);
                    }, 500);
                });
            }
        });
    });
}

/**
 * 6. Selector de Tipologías en Ficha de Proyecto (Actualiza Cotizador)
 */
function initProjectTypologySelector() {
    const explorer = document.querySelector('.model-explorer');
    const selectTipologia = document.getElementById('select-tipologia');
    const cotizadorPrice = document.getElementById('cotizador-price');

    // Fallback para la versión antigua si existe en alguna página
    const typologyRows = document.querySelectorAll('.typology-row');
    if (typologyRows.length > 0 && !explorer) {
        typologyRows.forEach(row => {
            row.addEventListener('click', () => {
                const tipologiaId = row.dataset.id;
                const price = row.dataset.price;
                if (selectTipologia) selectTipologia.value = tipologiaId;
                if (cotizadorPrice) {
                    cotizadorPrice.textContent = `Desde UF ${price}`;
                    cotizadorPrice.style.opacity = '0.5';
                    setTimeout(() => { cotizadorPrice.style.opacity = '1'; }, 150);
                }
                if (window.innerWidth <= 1024) {
                    const cotizador = document.querySelector('.sidebar-cotizador');
                    if (cotizador) cotizador.scrollIntoView({ behavior: 'smooth' });
                }
            });
        });
        if (selectTipologia) {
            selectTipologia.addEventListener('change', () => {
                const selectedOption = selectTipologia.options[selectTipologia.selectedIndex];
                const price = selectedOption.dataset.price;
                if (price && cotizadorPrice) {
                    cotizadorPrice.textContent = `Desde UF ${price}`;
                }
            });
        }
        return;
    }

    if (!explorer) return;

    // Componentes del explorador
    const track = explorer.querySelector('.model-carousel-track');
    const cards = explorer.querySelectorAll('.model-card');
    const prevBtn = explorer.querySelector('.prev-btn');
    const nextBtn = explorer.querySelector('.next-btn');
    
    const detailImg = explorer.querySelector('#selected-model-img');
    const detailName = explorer.querySelector('#selected-model-name');
    const detailDorm = explorer.querySelector('#selected-model-dorm');
    const detailBano = explorer.querySelector('#selected-model-bano');
    const detailSup = explorer.querySelector('#selected-model-sup');
    const cotizarActionBtn = explorer.querySelector('#model-cotizar-action');
    const zoomBtn = explorer.querySelector('#zoom-model-btn');

    // Crear Lightbox dinámicamente si no existe
    let lightbox = document.getElementById('model-lightbox');
    if (!lightbox) {
        lightbox = document.createElement('div');
        lightbox.id = 'model-lightbox';
        lightbox.className = 'model-lightbox';
        lightbox.innerHTML = `
            <span class="lightbox-close">&times;</span>
            <img class="lightbox-content" id="lightbox-img" src="" alt="Zoom Plano">
        `;
        document.body.appendChild(lightbox);
    }
    const lightboxImg = lightbox.querySelector('#lightbox-img');
    const lightboxClose = lightbox.querySelector('.lightbox-close');

    // Estado del carrusel
    let currentTranslateX = 0;
    const cardWidth = 240; // flex-basis
    const gap = 24; // gap de 1.5rem en px
    const step = cardWidth + gap;

    function updateCarouselNav() {
        if (!track || !prevBtn || !nextBtn) return;
        const wrapper = track.parentElement;
        const maxTranslate = Math.max(0, track.scrollWidth - wrapper.clientWidth);

        if (currentTranslateX >= 0) {
            prevBtn.classList.add('disabled');
        } else {
            prevBtn.classList.remove('disabled');
        }

        if (Math.abs(currentTranslateX) >= maxTranslate) {
            nextBtn.classList.add('disabled');
        } else {
            nextBtn.classList.remove('disabled');
        }
    }

    if (prevBtn && nextBtn && track) {
        prevBtn.addEventListener('click', () => {
            currentTranslateX = Math.min(0, currentTranslateX + step);
            track.style.transform = `translateX(${currentTranslateX}px)`;
            updateCarouselNav();
        });

        nextBtn.addEventListener('click', () => {
            const wrapper = track.parentElement;
            const maxTranslate = Math.max(0, track.scrollWidth - wrapper.clientWidth);
            currentTranslateX = Math.max(-maxTranslate, currentTranslateX - step);
            track.style.transform = `translateX(${currentTranslateX}px)`;
            updateCarouselNav();
        });

        // Inicializar y recalcular en redimensionamiento
        window.addEventListener('resize', () => {
            currentTranslateX = 0;
            track.style.transform = `translateX(0px)`;
            updateCarouselNav();
        });
        setTimeout(updateCarouselNav, 100);
    }

    // Manejar selección de tarjeta
    cards.forEach(card => {
        card.addEventListener('click', () => {
            // Quitar clase activa
            cards.forEach(c => c.classList.remove('active'));
            card.classList.add('active');

            const id = card.dataset.id;
            const price = card.dataset.price;
            const title = card.dataset.title;
            const img = card.dataset.img;
            const dorm = card.dataset.dorm;
            const bano = card.dataset.bano;
            const sup = card.dataset.sup;

            // Actualizar vista de detalle con transición suave
            if (detailImg) {
                detailImg.style.opacity = '0';
                detailImg.style.transform = 'scale(0.95)';
                setTimeout(() => {
                    detailImg.src = img;
                    detailImg.style.opacity = '1';
                    detailImg.style.transform = 'scale(1)';
                }, 200);
            }

            if (detailName) detailName.textContent = title;
            if (detailDorm) detailDorm.textContent = dorm;
            if (detailBano) detailBano.textContent = bano;
            if (detailSup) detailSup.textContent = sup;

            // Actualizar cotizador lateral
            if (selectTipologia) {
                selectTipologia.value = id;
            }

            if (cotizadorPrice) {
                cotizadorPrice.textContent = `Desde UF ${price}`;
                cotizadorPrice.style.opacity = '0.5';
                setTimeout(() => {
                    cotizadorPrice.style.opacity = '1';
                }, 150);
            }

            // Sincronizar Galería Multimedia con el modelo activo
            const renderInt = card.dataset.renderInt;
            const tourUrl = card.dataset.tour;
            
            const mediaBadge = document.getElementById('media-selected-model-badge');
            if (mediaBadge) {
                mediaBadge.textContent = `Modelo Seleccionado: ${title}`;
                mediaBadge.style.opacity = '0.5';
                setTimeout(() => { mediaBadge.style.opacity = '1'; }, 150);
            }
            
            const tabBtnInterior = document.getElementById('tab-btn-interior');
            const tabBtnTour = document.getElementById('tab-btn-tour');
            
            if (tabBtnInterior && renderInt) {
                tabBtnInterior.dataset.src = renderInt;
                tabBtnInterior.dataset.title = `Vista Interior ${title}`;
                const label = tabBtnInterior.querySelector('.media-tab-label');
                if (label) label.textContent = `Vista Interior`;
                if (tabBtnInterior.classList.contains('active')) {
                    tabBtnInterior.click();
                }
            }
            if (tabBtnTour && tourUrl) {
                tabBtnTour.dataset.src = tourUrl;
                tabBtnTour.dataset.title = `Recorrido 360° ${title}`;
                const label = tabBtnTour.querySelector('.media-tab-label');
                if (label) label.textContent = `Recorrido 360°`;
                if (tabBtnTour.classList.contains('active')) {
                    tabBtnTour.click();
                }
            }
        });
    });

    // Acción del botón Cotizar del detalle
    if (cotizarActionBtn) {
        cotizarActionBtn.addEventListener('click', () => {
            const cotizador = document.getElementById('cotizador');
            if (cotizador) {
                cotizador.scrollIntoView({ behavior: 'smooth', block: 'center' });
                // Resaltar el formulario brevemente
                cotizador.style.transition = 'box-shadow 0.3s ease';
                cotizador.style.boxShadow = '0 0 20px rgba(230, 126, 34, 0.4)';
                setTimeout(() => {
                    cotizador.style.boxShadow = 'var(--shadow-premium)';
                }, 1000);
                
                // Enfocar el primer input del formulario
                const firstInput = cotizador.querySelector('input, select');
                if (firstInput) {
                    setTimeout(() => firstInput.focus(), 800);
                }
            }
        });
    }

    // Zoom en plano
    if (zoomBtn && lightbox && lightboxImg) {
        zoomBtn.addEventListener('click', () => {
            const activeCard = explorer.querySelector('.model-card.active');
            if (activeCard) {
                lightboxImg.src = activeCard.dataset.img;
                lightbox.classList.add('active');
                document.body.style.overflow = 'hidden'; // Evitar scroll
            }
        });
    }

    // Cerrar lightbox
    if (lightboxClose && lightbox) {
        lightboxClose.addEventListener('click', () => {
            lightbox.classList.remove('active');
            document.body.style.overflow = '';
        });
        lightbox.addEventListener('click', (e) => {
            if (e.target === lightbox) {
                lightbox.classList.remove('active');
                document.body.style.overflow = '';
            }
        });
    }

    // Sincronizar desde el select de cotizador hacia el explorador
    if (selectTipologia) {
        selectTipologia.addEventListener('change', () => {
            const val = selectTipologia.value;
            const targetCard = Array.from(cards).find(c => c.dataset.id === val);
            if (targetCard) {
                targetCard.click();
                
                // Centrar la tarjeta en el carrusel si no es completamente visible
                const wrapper = track.parentElement;
                const cardLeft = targetCard.offsetLeft;
                const cardRight = cardLeft + cardWidth;
                const visibleLeft = -currentTranslateX;
                const visibleRight = visibleLeft + wrapper.clientWidth;

                if (cardLeft < visibleLeft || cardRight > visibleRight) {
                    currentTranslateX = -Math.min(track.scrollWidth - wrapper.clientWidth, Math.max(0, cardLeft - (wrapper.clientWidth - cardWidth)/2));
                    track.style.transform = `translateX(${currentTranslateX}px)`;
                    updateCarouselNav();
                }
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

