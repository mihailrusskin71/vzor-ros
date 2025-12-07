// modules/contentManager.js
// ===== CONTENT MANAGEMENT =====
import { PARTNERS, CONTENT_TYPES, NEW_RELEASES_CONFIG, ROW_TYPES } from './constants.js';
import { showAuthModal, showMovieInfo, showSaveNotification } from './modals.js';

export class ContentManager {
    constructor() {
        this.currentPage = 'all';
        this.init();
    }
    
    init() {
        this.setupNavigation();
        this.setupScrollControls();
        this.setupSectionHeaderClicks();
        this.renderAllSections();
    }
    
    setupNavigation() {
        const navLinks = document.querySelectorAll('.nav-link');
        
        navLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                
                navLinks.forEach(l => l.classList.remove('active'));
                link.classList.add('active');
                
                const contentType = link.getAttribute('data-type') || 'all';
                this.currentPage = contentType;
                
                window.scrollTo({ top: 0, behavior: 'smooth' });
                this.switchPage(contentType);
            });
        });
    }
    
    switchPage(contentType) {
        const homePage = document.getElementById('home-page');
        const contentPages = document.getElementById('content-pages');
        const contentTitle = document.getElementById('content-page-title');
        
        if (contentType === 'all') {
            homePage.classList.add('active');
            contentPages.classList.remove('active');
            this.renderAllSections();
        } else {
            homePage.classList.remove('active');
            contentPages.classList.add('active');
            
            const pageTitles = {
                'movie': 'Фильмы',
                'series': 'Сериалы', 
                'cartoon': 'Мультфильмы'
            };
            contentTitle.textContent = pageTitles[contentType] || 'Контент';
            this.renderContentPage(contentType);
        }
    }
    
    setupScrollControls() {
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('scroll-btn')) {
                const direction = e.target.classList.contains('left') ? -1 : 1;
                const sectionId = e.target.getAttribute('data-section');
                this.scrollSection(sectionId, direction);
            }
        });
    }
    
    setupSectionHeaderClicks() {
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('section-header-title')) {
                const sectionType = e.target.dataset.sectionType;
                const sectionTitle = e.target.textContent;
                this.showFullSection(sectionType, sectionTitle);
            }
            
            const sectionHeader = e.target.closest('.section-header');
            if (sectionHeader) {
                const titleElement = sectionHeader.querySelector('h2, h3');
                if (titleElement && titleElement.classList.contains('section-header-title')) {
                    const sectionType = titleElement.dataset.sectionType;
                    const sectionTitle = titleElement.textContent;
                    this.showFullSection(sectionType, sectionTitle);
                }
            }
        });
    }
    
    scrollSection(sectionId, direction) {
        const section = document.getElementById(sectionId);
        if (!section) return;
        
        const scrollAmount = 1075; // Прокрутка на 5 карточек (215 * 5 = 1075)
        section.scrollLeft += direction * scrollAmount;
    }
    
    getPopularContent(contentType, limit = 20) {
        let films = window.filmManager.films.filter(film => film.contentType === contentType);
        
        films.sort((a, b) => {
            const aScore = (a.rating || 0) + (a.reviews ? a.reviews.length * 0.1 : 0);
            const bScore = (b.rating || 0) + (b.reviews ? b.reviews.length * 0.1 : 0);
            return bScore - aScore;
        });
        
        return films.slice(0, limit);
    }
    
    getTopContent(contentType, limit = 35) {
        let films = window.filmManager.films.filter(film => film.contentType === contentType);
        
        films.sort((a, b) => {
            const aScore = (a.rating || 0) + (a.reviews ? a.reviews.length * 0.1 : 0);
            const bScore = (b.rating || 0) + (b.reviews ? b.reviews.length * 0.1 : 0);
            return bScore - aScore;
        });
        
        return films.slice(0, limit);
    }
    
    renderAllSections() {
        this.renderCustomRows('all');
    }
    
    renderCustomRows(pageType = 'all') {
        const customRows = window.filmManager.getCustomRowsForPage(pageType);
        
        // Удаляем старые кастомные ряды для этой страницы
        document.querySelectorAll('.custom-row-section').forEach(section => {
            if (section.dataset.pageType === pageType) {
                section.remove();
            }
        });
        
        Object.keys(customRows).forEach(rowId => {
            const row = customRows[rowId];
            const films = window.filmManager.getCustomRowFilms(rowId, 'row');
            
            if (films.length > 0) {
                this.createCustomRow(row, films, pageType);
            }
        });
    }
    
    createCustomRow(row, films, pageType = 'all') {
        // Проверяем, существует ли уже такой ряд
        let existingSection = document.getElementById(`custom-${row.id}`);
        
        if (!existingSection) {
            // Создаем новый ряд
            const section = document.createElement('section');
            section.className = 'top-section custom-row-section';
            section.id = `custom-${row.id}`;
            section.dataset.pageType = pageType;
            
            section.innerHTML = `
                <div class="section-header" style="margin-bottom: 25px;">
                    <h2 class="section-header-title custom-row-title" data-row-id="${row.id}" style="color: white; cursor: pointer;">
                        ${row.name} <span class="arrow-icon">›</span>
                    </h2>
                </div>
                <div class="horizontal-scroll-container">
                    <button class="scroll-btn custom-scroll-btn left" data-section="custom-${row.id}-scroll">‹</button>
                    <div class="horizontal-scroll" id="custom-${row.id}-scroll"></div>
                    <button class="scroll-btn custom-scroll-btn right" data-section="custom-${row.id}-scroll">›</button>
                </div>
            `;
            
            // Вставляем после партнеров на главной
            if (pageType === 'all') {
                const partnersSection = document.querySelector('.partners-section');
                if (partnersSection) {
                    partnersSection.parentNode.insertBefore(section, partnersSection.nextSibling);
                } else {
                    // Если секции партнеров нет, вставляем после hero
                    const heroSection = document.querySelector('.hero-section');
                    if (heroSection) {
                        heroSection.parentNode.insertBefore(section, heroSection.nextSibling);
                    }
                }
            } else {
                // Для страниц контента вставляем в начало контентной страницы
                const contentPages = document.getElementById('content-pages');
                if (contentPages) {
                    // Находим заголовок страницы
                    const contentHeader = contentPages.querySelector('.content-header');
                    if (contentHeader) {
                        contentHeader.parentNode.insertBefore(section, contentHeader.nextSibling);
                    } else {
                        contentPages.insertBefore(section, contentPages.firstChild);
                    }
                }
            }
            
            // Добавляем обработчик клика на заголовок
            const titleElement = section.querySelector('.custom-row-title');
            if (titleElement) {
                titleElement.addEventListener('click', () => {
                    this.showCustomRowModal(row.id);
                });
            }
            
            // НАСТРАИВАЕМ ПРОКРУТКУ ДЛЯ ЭТОГО РЯДА
            this.setupCustomRowScrollSection(row.id);
        }
        
        // Заполняем ряд фильмами
        const scrollContainer = document.getElementById(`custom-${row.id}-scroll`);
        if (scrollContainer) {
            scrollContainer.innerHTML = '';
            
            films.forEach(movie => {
                const card = this.createCustomRowMovieCard(movie);
                scrollContainer.appendChild(card);
            });
            
            // Добавляем кнопку "Посмотреть все" (как обложку)
            const viewAllCard = this.createCustomViewAllCard(row.id, row.name);
            scrollContainer.appendChild(viewAllCard);
        }
    }
    
    setupCustomRowScrollSection(rowId) {
        const leftBtn = document.querySelector(`.custom-scroll-btn.left[data-section="custom-${rowId}-scroll"]`);
        const rightBtn = document.querySelector(`.custom-scroll-btn.right[data-section="custom-${rowId}-scroll"]`);
        const section = document.getElementById(`custom-${rowId}-scroll`);
        
        if (!section || !leftBtn || !rightBtn) return;
        
        leftBtn.addEventListener('click', () => {
            // Ширина карточки + отступ (200px - как в CSS)
            const cardWidth = 200; // ширина карточки из CSS
            const gap = 15; // отступ между карточками
            
            // Прокрутка на 5 карточек
            const scrollAmount = (cardWidth + gap) * 5;
            section.scrollLeft -= scrollAmount;
        });
        
        rightBtn.addEventListener('click', () => {
            // Ширина карточки + отступ (200px - как в CSS)
            const cardWidth = 200; // ширина карточки из CSS
            const gap = 15; // отступ между карточками
            
            // Прокрутка на 5 карточек
            const scrollAmount = (cardWidth + gap) * 5;
            section.scrollLeft += scrollAmount;
        });
    }
    
    renderContentPage(contentType) {
        this.renderContentCustomRows(contentType);
    }
    
    renderContentCustomRows(contentType) {
        const customRows = window.filmManager.getCustomRowsForPage(contentType);
        
        // Удаляем ВСЕ кастомные ряды на странице контента перед рендерингом
        document.querySelectorAll('.custom-row-section').forEach(section => {
            // Удаляем только те ряды, которые относятся к страницам контента (не главной)
            if (section.dataset.pageType !== 'all') {
                section.remove();
            }
        });
        
        // Рендерим только ряды для текущего типа контента
        Object.keys(customRows).forEach(rowId => {
            const row = customRows[rowId];
            // Дополнительная проверка: убедимся, что ряд действительно для этой страницы
            if (row.pageType === contentType) {
                const films = window.filmManager.getCustomRowFilms(rowId, 'row');
                
                if (films.length > 0) {
                    this.createCustomRow(row, films, contentType);
                }
            }
        });
    }
    
    getContentTypeName(contentType) {
        const names = {
            'movie': 'фильмы',
            'series': 'сериалы',
            'cartoon': 'мультфильмы'
        };
        return names[contentType] || contentType;
    }
    
    createMovieCard(movie) {
        const card = document.createElement('div');
        card.className = 'movie-card custom-row-movie-card';
        
        let displayPartner = movie.partner;
        if (this.currentPage === 'all') {
            if (typeof window.currentPartnerFilter !== 'undefined' && window.currentPartnerFilter !== 'all' && this.hasPartnerLink(movie, window.currentPartnerFilter)) {
                displayPartner = window.currentPartnerFilter;
            }
        } else {
            if (typeof window.currentContentPartnerFilter !== 'undefined' && window.currentContentPartnerFilter !== 'all' && this.hasPartnerLink(movie, window.currentContentPartnerFilter)) {
                displayPartner = window.currentContentPartnerFilter;
            }
        }
        
        const partnerInfo = PARTNERS[displayPartner] || PARTNERS.okko;
        const isSaved = window.userManager.isMovieSaved(movie.id);
        
        card.innerHTML = `
            <div class="movie-card-inner">
                <div class="partner-badge" style="background: ${partnerInfo.badgeColor}">
                    ${partnerInfo.name}
                </div>
                
                <img class="movie-poster" 
                     src="${movie.img}" 
                     alt="${movie.title}"
                     loading="lazy"
                     onerror="this.onerror=null; this.src='${window.filmManager.generatePlaceholder(movie.title)}'">
                
                <div class="movie-buttons-overlay">
                    <button class="info-btn-compact" data-id="${movie.id}" title="Информация">
                        Подробнее
                    </button>
                    <button class="bookmark-btn-compact ${isSaved ? 'saved' : ''}" data-id="${movie.id}" title="${isSaved ? 'Удалить из сохраненных' : 'Сохранить'}">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="${isSaved ? '#FFD700' : 'none'}" stroke="${isSaved ? '#FFD700' : 'white'}" stroke-width="2">
                            <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/>
                        </svg>
                    </button>
                </div>
            </div>
        `;
        
        this.setupCardInteractions(card, movie);
        return card;
    }

    createCustomRowMovieCard(movie) {
        const card = document.createElement('div');
        card.className = 'movie-card custom-row-movie-card';
        
        let displayPartner = movie.partner;
        if (this.currentPage === 'all') {
            if (typeof window.currentPartnerFilter !== 'undefined' && window.currentPartnerFilter !== 'all' && this.hasPartnerLink(movie, window.currentPartnerFilter)) {
                displayPartner = window.currentPartnerFilter;
            }
        } else {
            if (typeof window.currentContentPartnerFilter !== 'undefined' && window.currentContentPartnerFilter !== 'all' && this.hasPartnerLink(movie, window.currentContentPartnerFilter)) {
                displayPartner = window.currentContentPartnerFilter;
            }
        }
        
        const partnerInfo = PARTNERS[displayPartner] || PARTNERS.okko;
        const isSaved = window.userManager.isMovieSaved(movie.id);
        
        card.innerHTML = `
            <div class="movie-card-inner">
                <div class="partner-badge" style="background: ${partnerInfo.badgeColor}">
                    ${partnerInfo.name}
                </div>
                
                <img class="movie-poster" 
                     src="${movie.img}" 
                     alt="${movie.title}"
                     loading="lazy"
                     onerror="this.onerror=null; this.src='${window.filmManager.generatePlaceholder(movie.title)}'">
                
                <div class="movie-buttons-overlay">
                    <button class="info-btn-compact" data-id="${movie.id}" title="Информация">
                        Подробнее
                    </button>
                    <button class="bookmark-btn-compact ${isSaved ? 'saved' : ''}" data-id="${movie.id}" title="${isSaved ? 'Удалить из сохраненных' : 'Сохранить'}">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="${isSaved ? '#FFD700' : 'none'}" stroke="${isSaved ? '#FFD700' : 'white'}" stroke-width="2">
                            <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/>
                        </svg>
                    </button>
                </div>
            </div>
        `;
        
        this.setupCustomRowCardInteractions(card, movie);
        return card;
    }
    
    createCustomViewAllCard(rowId, rowName) {
        const card = document.createElement('div');
        card.className = 'movie-card custom-row-view-all-card';
        
        card.innerHTML = `
            <div class="movie-card-inner">
                <div class="partner-badge" style="background: linear-gradient(135deg, #666, #444)">
                    Все
                </div>
                
                <div class="custom-view-all-placeholder">
                    <div class="custom-view-all-icon">››</div>
                    <div class="custom-view-all-text">Посмотреть все</div>
                </div>
                
                <div class="custom-view-all-gradient-overlay"></div>
            </div>
        `;
        
        card.addEventListener('click', () => {
            this.showCustomRowModal(rowId);
        });
        
        return card;
    }
    
    showFullSection(contentType, sectionTitle, rowType = null) {
        const navLinks = document.querySelectorAll('.nav-link');
        navLinks.forEach(link => link.classList.remove('active'));
        
        const targetLink = document.querySelector(`.nav-link[data-type="${contentType}"]`);
        if (targetLink) {
            targetLink.classList.add('active');
            this.currentPage = contentType;
            this.switchPage(contentType);
        }
    }
    
    showCustomRowModal(rowId) {
        const row = window.filmManager.getCustomRow(rowId);
        if (!row) return;
        
        const films = window.filmManager.getCustomRowFilms(rowId, 'modal');
        
        let modal = document.getElementById(`custom-row-modal-${rowId}`);
        if (!modal) {
            modal = document.createElement('div');
            modal.id = `custom-row-modal-${rowId}`;
            modal.className = 'custom-row-modal';
            modal.style.cssText = `
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0,0,0,0.97);
                display: none;
                justify-content: center;
                align-items: center;
                z-index: 10008;
                padding: 20px;
            `;
            
            modal.innerHTML = `
                <div style="background: rgba(20, 20, 25, 0.98); border-radius: 20px; padding: 40px; max-width: 1200px; width: 95%; max-height: 95vh; overflow-y: auto; position: relative; box-shadow: 0 25px 80px rgba(0,0,0,0.9); border: 1px solid rgba(255,255,255,0.1); backdrop-filter: blur(20px);">
                    <button class="close-custom-modal" style="position: absolute; top: 25px; right: 25px; background: rgba(255,255,255,0.1); border: 1px solid rgba(255,255,255,0.2); color: var(--text-secondary); font-size: 28px; cursor: pointer; width: 45px; height: 45px; display: flex; align-items: center; justify-content: center; border-radius: 50%; transition: all 0.3s ease;">×</button>
                    <h2 style="margin: 0 0 30px 0; color: var(--text-primary); text-align: center; font-size: 32px; font-weight: 700;">${row.name}</h2>
                    <div class="custom-modal-content" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 25px; padding: 15px;"></div>
                    ${films.length === 0 ? '<p style="text-align: center; color: var(--text-secondary); padding: 60px; font-size: 18px;">В этой коллекции пока нет контента</p>' : ''}
                </div>
            `;
            
            document.body.appendChild(modal);
            
            const closeBtn = modal.querySelector('.close-custom-modal');
            closeBtn.addEventListener('click', () => {
                modal.style.display = 'none';
            });
            
            closeBtn.addEventListener('mouseenter', function() {
                this.style.background = 'rgba(255,255,255,0.2)';
                this.style.color = 'white';
                this.style.transform = 'rotate(90deg)';
            });
            
            closeBtn.addEventListener('mouseleave', function() {
                this.style.background = 'rgba(255,255,255,0.1)';
                this.style.color = 'var(--text-secondary)';
                this.style.transform = 'rotate(0deg)';
            });
            
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    modal.style.display = 'none';
                }
            });
        }
        
        const content = modal.querySelector('.custom-modal-content');
        content.innerHTML = '';
        
        films.forEach(movie => {
            // Используем ту же функцию создания карточки, что и в ряду
            const card = this.createCustomRowMovieCard(movie);
            
            // Добавляем обработчик для кнопки "Подробнее" в модальном окне
            const infoBtn = card.querySelector('.info-btn-compact');
            if (infoBtn) {
                infoBtn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    // НЕ закрываем модальное окно ряда!
                    // Просто открываем модальное окно информации о фильме
                    showMovieInfo(movie);
                });
            }
            
            // Обработчик для кнопки закладки
            const bookmarkBtn = card.querySelector('.bookmark-btn-compact');
            if (bookmarkBtn) {
                bookmarkBtn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    this.toggleBookmark(movie.id, bookmarkBtn, movie.title);
                });
            }
            
            content.appendChild(card);
        });
        
        modal.style.display = 'flex';
    }
    
    setupCardInteractions(card, movie) {
        const bookmarkBtn = card.querySelector('.bookmark-btn-compact');
        const infoBtn = card.querySelector('.info-btn-compact');
        
        if (bookmarkBtn) {
            bookmarkBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.toggleBookmark(movie.id, bookmarkBtn, movie.title);
            });
        }
        
        if (infoBtn) {
            infoBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                showMovieInfo(movie);
            });
        }
        
        // Клик по карточке (плакату) открывает просмотр у партнера
        card.addEventListener('click', (e) => {
            if (!e.target.closest('button')) {
                this.watchMovie(movie);
            }
        });
        
        // Анимация при наведении
        card.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-8px)';
        });
        
        card.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0)';
        });
    }
    
    setupCustomRowCardInteractions(card, movie) {
        const bookmarkBtn = card.querySelector('.bookmark-btn-compact');
        const infoBtn = card.querySelector('.info-btn-compact');
        
        if (bookmarkBtn) {
            bookmarkBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.toggleBookmark(movie.id, bookmarkBtn, movie.title);
            });
        }
        
        if (infoBtn) {
            infoBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                showMovieInfo(movie);
            });
        }
        
        // Клик по карточке (плакату) открывает просмотр у партнера
        card.addEventListener('click', (e) => {
            if (!e.target.closest('button')) {
                this.watchMovie(movie);
            }
        });
        
        // Анимация при наведении
        card.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-8px)';
        });
        
        card.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0)';
        });
    }
    
    toggleBookmark(movieId, button, movieTitle) {
        if (!window.userManager.currentUser) {
            showAuthModal();
            return;
        }
        
        const isCurrentlySaved = window.userManager.isMovieSaved(movieId);
        
        if (isCurrentlySaved) {
            window.userManager.unsaveMovie(movieId);
            button.classList.remove('saved');
            const svg = button.querySelector('svg');
            if (svg) {
                svg.setAttribute('fill', 'none');
                svg.setAttribute('stroke', 'currentColor');
            }
            showSaveNotification(false, movieTitle);
        } else {
            window.userManager.saveMovie(movieId);
            button.classList.add('saved');
            const svg = button.querySelector('svg');
            if (svg) {
                svg.setAttribute('fill', '#FFD700');
                svg.setAttribute('stroke', '#FFD700');
            }
            showSaveNotification(true, movieTitle);
        }
    }
    
    watchMovie(movie) {
        let targetPartner = movie.partner;
        
        if (this.currentPage === 'all') {
            if (typeof window.currentPartnerFilter !== 'undefined' && window.currentPartnerFilter !== 'all' && this.hasPartnerLink(movie, window.currentPartnerFilter)) {
                targetPartner = window.currentPartnerFilter;
            }
        } else {
            if (typeof window.currentContentPartnerFilter !== 'undefined' && window.currentContentPartnerFilter !== 'all' && this.hasPartnerLink(movie, window.currentContentPartnerFilter)) {
                targetPartner = window.currentContentPartnerFilter;
            }
        }
        
        if (movie.partnerLinks && movie.partnerLinks[targetPartner]) {
            window.open(movie.partnerLinks[targetPartner], '_blank');
        } else {
            // Fallback - открываем поиск по названию
            const searchUrl = `https://www.google.com/search?q=${encodeURIComponent(movie.title + ' смотреть онлайн')}`;
            window.open(searchUrl, '_blank');
        }
    }
    
    hasPartnerLink(movie, partner) {
        return movie.partnerLinks && movie.partnerLinks[partner] && movie.partnerLinks[partner].trim() !== '';
    }
    
    refreshAllSections() {
        this.renderAllSections();
        
        if (this.currentPage !== 'all') {
            this.renderContentPage(this.currentPage);
        }
    }
}