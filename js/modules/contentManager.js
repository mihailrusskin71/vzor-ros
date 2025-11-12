// modules/contentManager.js
// ===== CONTENT MANAGEMENT =====
import { PARTNERS, CONTENT_TYPES } from './constants.js';
import { showAuthModal, showMovieInfo, showSaveNotification } from './modals.js';

export class ContentManager {
    constructor() {
        this.currentPage = 'all';
        this.init();
    }
    
    init() {
        this.setupNavigation();
        this.setupScrollControls();
        this.setupHomePageScrollControls();
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
        
        const contentTopTitle = document.getElementById('content-top-title');
        if (contentTopTitle) {
            const topTitles = {
                'movie': 'Лучшие фильмы',
                'series': 'Лучшие сериалы', 
                'cartoon': 'Лучшие мультфильмы'
            };
            contentTopTitle.textContent = topTitles[contentType] || 'Лучший контент';
            contentTopTitle.setAttribute('data-section-type', contentType);
        }
        
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
    
    setupHomePageScrollControls() {
        this.setupScrollSection('top-movies-scroll');
        this.setupScrollSection('top-cartoons-scroll');
        this.setupScrollSection('top-series-scroll');
        this.setupScrollSection('content-top-content-scroll');
    }
    
    setupScrollSection(sectionId) {
        const leftBtn = document.querySelector(`.scroll-btn.left[data-section="${sectionId}"]`);
        const rightBtn = document.querySelector(`.scroll-btn.right[data-section="${sectionId}"]`);
        const section = document.getElementById(sectionId);
        
        if (leftBtn && section) {
            leftBtn.addEventListener('click', () => {
                section.scrollLeft -= 300;
            });
        }
        
        if (rightBtn && section) {
            rightBtn.addEventListener('click', () => {
                section.scrollLeft += 300;
            });
        }
    }
    
    scrollSection(sectionId, direction) {
        const section = document.getElementById(sectionId);
        if (!section) return;
        
        const scrollAmount = 300;
        section.scrollLeft += direction * scrollAmount;
    }
    
    getNewReleases(contentType = 'all', limit = 15) {
        let films = [...window.filmManager.films];
        
        if (contentType !== 'all') {
            films = films.filter(film => film.contentType === contentType);
        }
        
        // Сортируем по дате создания (новые сначала)
        films.sort((a, b) => {
            const dateA = new Date(a.createdAt || 0);
            const dateB = new Date(b.createdAt || 0);
            return dateB - dateA;
        });
        
        return films.slice(0, limit);
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
        this.renderNewReleases();
        this.renderTopMovies();
        this.renderTopCartoons();
        this.renderTopSeries();
    }
    
    renderNewReleases() {
        const container = document.getElementById('new-releases');
        if (!container) return;
        
        const newReleases = this.getNewReleases('all', 15);
        container.innerHTML = '';
        
        if (newReleases.length === 0) {
            container.innerHTML = '<p class="no-content">Новинки скоро появятся</p>';
            return;
        }
        
        newReleases.forEach(movie => {
            const card = this.createMovieCard(movie);
            container.appendChild(card);
        });
    }
    
    renderTopMovies() {
        const container = document.getElementById('top-movies-scroll');
        if (!container) return;
        
        const topMovies = this.getPopularContent('movie', 20);
        container.innerHTML = '';
        
        if (topMovies.length === 0) {
            container.innerHTML = '<p class="no-content">Популярные фильмы скоро появятся</p>';
            return;
        }
        
        topMovies.forEach(movie => {
            const card = this.createHorizontalMovieCard(movie);
            container.appendChild(card);
        });
        
        const viewAllCard = this.createViewAllCard('movie', 'Лучшие фильмы');
        container.appendChild(viewAllCard);
    }
    
    renderTopCartoons() {
        const container = document.getElementById('top-cartoons-scroll');
        if (!container) return;
        
        const topCartoons = this.getPopularContent('cartoon', 20);
        container.innerHTML = '';
        
        if (topCartoons.length === 0) {
            container.innerHTML = '<p class="no-content">Популярные мультфильмы скоро появятся</p>';
            return;
        }
        
        topCartoons.forEach(movie => {
            const card = this.createHorizontalMovieCard(movie);
            container.appendChild(card);
        });
        
        const viewAllCard = this.createViewAllCard('cartoon', 'Лучшие мультфильмы');
        container.appendChild(viewAllCard);
    }
    
    renderTopSeries() {
        const container = document.getElementById('top-series-scroll');
        if (!container) return;
        
        const topSeries = this.getPopularContent('series', 20);
        container.innerHTML = '';
        
        if (topSeries.length === 0) {
            container.innerHTML = '<p class="no-content">Популярные сериалы скоро появятся</p>';
            return;
        }
        
        topSeries.forEach(movie => {
            const card = this.createHorizontalMovieCard(movie);
            container.appendChild(card);
        });
        
        const viewAllCard = this.createViewAllCard('series', 'Лучшие сериалы');
        container.appendChild(viewAllCard);
    }
    
    renderContentPage(contentType) {
        this.renderContentNewReleases(contentType);
        this.renderContentTopContent(contentType);
    }
    
    renderContentNewReleases(contentType) {
        const container = document.getElementById('content-new-releases');
        if (!container) return;
        
        const newReleases = this.getNewReleases(contentType, 10);
        container.innerHTML = '';
        
        if (newReleases.length === 0) {
            container.innerHTML = '<p class="no-content">Новинки скоро появятся</p>';
            return;
        }
        
        newReleases.forEach(movie => {
            const card = this.createMovieCard(movie);
            container.appendChild(card);
        });
    }
    
    renderContentTopContent(contentType) {
        const container = document.getElementById('content-top-content-scroll');
        if (!container) return;
        
        const topContent = this.getTopContent(contentType, 35);
        container.innerHTML = '';
        
        if (topContent.length === 0) {
            container.innerHTML = '<p class="no-content">Лучший контент скоро появится</p>';
            return;
        }
        
        topContent.forEach(movie => {
            const card = this.createHorizontalMovieCard(movie);
            container.appendChild(card);
        });
        
        const viewAllCard = this.createViewAllCard(contentType, `Лучшие ${this.getContentTypeName(contentType)}`);
        container.appendChild(viewAllCard);
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
        card.className = 'movie-card';
        
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
        const contentType = CONTENT_TYPES[movie.contentType] || CONTENT_TYPES.movie;
        const isSaved = window.userManager.isMovieSaved(movie.id);
        
        card.innerHTML = `
            <div class="movie-card-inner">
                <div class="partner-badge" style="background: ${partnerInfo.badgeColor}">
                    ${partnerInfo.name}
                </div>
                
                <div class="bookmark-btn ${isSaved ? 'saved' : ''}" data-id="${movie.id}" 
                     style="position: absolute; top: 10px; right: 10px; width: 32px; height: 32px; border-radius: 50%; background: rgba(0,0,0,0.6); display: flex; align-items: center; justify-content: center; cursor: pointer; transition: all 0.3s ease; z-index: 2; opacity: 0.7;">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="${isSaved ? '#FFD700' : 'white'}" stroke="${isSaved ? '#FFD700' : 'white'}" stroke-width="2">
                        <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/>
                    </svg>
                </div>
                
                <img class="movie-poster" 
                     src="${movie.img}" 
                     alt="${movie.title}"
                     loading="lazy"
                     onerror="this.onerror=null; this.src='${window.filmManager.generatePlaceholder(movie.title)}'">
                
                <div class="movie-overlay">
                    <div class="movie-actions">
                        <button class="action-btn watch-btn" data-id="${movie.id}">
                            ▶ Смотреть
                        </button>
                    </div>
                </div>
            </div>
            <div class="movie-info">
                <h3 class="movie-title" title="${movie.title}">${movie.title}</h3>
                <div class="movie-meta">
                    <span>${movie.year}</span>
                    <span class="movie-rating">⭐ ${movie.rating}</span>
                </div>
                
                <div class="movie-details-row">
                    <span class="movie-genre">${movie.genre}</span>
                    <button class="info-btn-small" data-id="${movie.id}" title="Информация">
                        Подробнее
                    </button>
                </div>
            </div>
        `;
        
        this.setupCardInteractions(card, movie);
        return card;
    }
    
    createHorizontalMovieCard(movie) {
        const card = document.createElement('div');
        card.className = 'horizontal-movie-card';
        
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
            <div class="horizontal-card-inner">
                <div class="partner-badge-small" style="background: ${partnerInfo.badgeColor}">
                    ${partnerInfo.name}
                </div>
                
                <div class="bookmark-btn-small ${isSaved ? 'saved' : ''}" data-id="${movie.id}">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="${isSaved ? '#FFD700' : 'white'}" stroke="${isSaved ? '#FFD700' : 'white'}" stroke-width="2">
                        <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/>
                    </svg>
                </div>
                
                <img class="horizontal-poster" 
                     src="${movie.img}" 
                     alt="${movie.title}"
                     loading="lazy"
                     onerror="this.onerror=null; this.src='${window.filmManager.generatePlaceholder(movie.title)}'">
                
                <div class="horizontal-overlay">
                    <button class="horizontal-watch-btn" data-id="${movie.id}">
                        ▶
                    </button>
                </div>
            </div>
            <div class="horizontal-info">
                <h4 class="horizontal-title" title="${movie.title}">${movie.title}</h4>
                <div class="horizontal-meta">
                    <span>${movie.year}</span>
                    <span>⭐ ${movie.rating}</span>
                </div>
            </div>
        `;
        
        this.setupHorizontalCardInteractions(card, movie);
        return card;
    }
    
    createViewAllCard(contentType, sectionTitle) {
        const card = document.createElement('div');
        card.className = 'horizontal-movie-card view-all-card';
        
        card.innerHTML = `
            <div class="horizontal-card-inner">
                <div class="view-all-content">
                    <div class="view-all-icon">››</div>
                    <div class="view-all-text">Посмотреть все</div>
                </div>
            </div>
        `;
        
        card.addEventListener('click', () => {
            this.showFullSection(contentType, sectionTitle);
        });
        
        return card;
    }
    
    showFullSection(contentType, sectionTitle) {
        const navLinks = document.querySelectorAll('.nav-link');
        navLinks.forEach(link => link.classList.remove('active'));
        
        const targetLink = document.querySelector(`.nav-link[data-type="${contentType}"]`);
        if (targetLink) {
            targetLink.classList.add('active');
            this.currentPage = contentType;
            this.switchPage(contentType);
        }
    }
    
    setupCardInteractions(card, movie) {
        const bookmarkBtn = card.querySelector('.bookmark-btn');
        const watchBtn = card.querySelector('.watch-btn');
        const infoBtn = card.querySelector('.info-btn-small');
        
        if (bookmarkBtn) {
            bookmarkBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.toggleBookmark(movie.id, bookmarkBtn, movie.title);
            });
        }
        
        if (watchBtn) {
            watchBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.watchMovie(movie);
            });
        }
        
        if (infoBtn) {
            infoBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                showMovieInfo(movie);
            });
        }
        
        // Клик по карточке открывает информацию о фильме
        card.addEventListener('click', (e) => {
            if (!e.target.closest('button')) {
                showMovieInfo(movie);
            }
        });
    }
    
    setupHorizontalCardInteractions(card, movie) {
        const bookmarkBtn = card.querySelector('.bookmark-btn-small');
        const watchBtn = card.querySelector('.horizontal-watch-btn');
        
        if (bookmarkBtn) {
            bookmarkBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.toggleBookmark(movie.id, bookmarkBtn, movie.title);
            });
        }
        
        if (watchBtn) {
            watchBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.watchMovie(movie);
            });
        }
        
        // Клик по карточке открывает информацию о фильме
        card.addEventListener('click', (e) => {
            if (!e.target.closest('button')) {
                showMovieInfo(movie);
            }
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
                svg.setAttribute('fill', 'white');
                svg.setAttribute('stroke', 'white');
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