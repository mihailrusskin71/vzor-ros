// js/main.js
import { FilmManager } from './modules/filmManager.js';
import { UserManager } from './modules/userManager.js';
import { ContentManager } from './modules/contentManager.js';
import { LightBackgroundBeams } from './light-background-beams.js';
import { initModals, showMovieInfo, showAuthModal, updateUserProfile, showSaveNotification, showSavedMovies, showMyReviews, showEditMovieModal, showReviewsModal, showReviewsModalForCurrentMovie, showFiltersModal, removeFilter, showContentFiltersModal, removeContentFilter } from './modules/modals.js';
import { initSearch } from './modules/search.js';
import { initAdmin, showAdminPanel } from './modules/admin.js';
import { showAdminMessage, showRatingNotification, showReviewNotification, setupSecretAdmin } from './modules/utils.js';
import { PARTNERS, CONTENT_TYPES, NEW_RELEASES_CONFIG, ROW_TYPES } from './modules/constants.js';

// Сделать константы глобальными для обратной совместимости
window.PARTNERS = PARTNERS;
window.CONTENT_TYPES = CONTENT_TYPES;
window.NEW_RELEASES_CONFIG = NEW_RELEASES_CONFIG;
window.ROW_TYPES = ROW_TYPES;

// Глобальные переменные
window.filmManager = null;
window.userManager = null;
window.contentManager = null;
window.backgroundBeams = null;

// Filter variables
window.currentPartnerFilter = 'all';
window.currentGenreFilter = 'all';
window.currentYearFrom = '';
window.currentYearTo = '';
window.currentContentType = 'all';
window.currentContentPartnerFilter = 'all';
window.currentContentGenreFilter = 'all';
window.currentContentYearFrom = '';
window.currentContentYearTo = '';

// Глобальные функции для обратной совместимости
window.showMovieInfo = showMovieInfo;
window.showAuthModal = showAuthModal;
window.updateUserProfile = updateUserProfile;
window.showSaveNotification = showSaveNotification;
window.showSavedMovies = showSavedMovies;
window.showMyReviews = showMyReviews;
window.showEditMovieModal = showEditMovieModal;
window.showReviewsModal = showReviewsModal;
window.showReviewsModalForCurrentMovie = showReviewsModalForCurrentMovie;
window.showFiltersModal = showFiltersModal;
window.removeFilter = removeFilter;
window.showContentFiltersModal = showContentFiltersModal;
window.removeContentFilter = removeContentFilter;
window.showAdminPanel = showAdminPanel;
window.showAdminMessage = showAdminMessage;
window.showRatingNotification = showRatingNotification;
window.showReviewNotification = showReviewNotification;

// Функции для модальных окон
window.rateMovie = function(rating) {
    if (!window.filmManager.currentMovieId) return;
    
    const userRating = window.filmManager.getUserRating(window.filmManager.currentMovieId);
    
    if (userRating > 0) {
        showRatingNotification(userRating, true);
        return;
    }
    
    window.filmManager.addUserRating(window.filmManager.currentMovieId, rating);
    showRatingNotification(rating, false);
};

window.submitReview = function() {
    if (!window.filmManager.currentMovieId) return;
    
    if (!window.userManager.currentUser) {
        showAuthModal();
        return;
    }
    
    const reviewText = document.getElementById('reviewText')?.value.trim();
    const rating = parseInt(document.getElementById('reviewRating')?.value);
    
    if (!reviewText) {
        alert('Пожалуйста, напишите текст отзыва');
        return;
    }
    
    const reviewData = {
        text: reviewText,
        rating: rating,
        author: window.userManager.currentUser.username,
        userId: window.userManager.currentUser.id
    };
    
    const newReview = window.filmManager.addReview(window.filmManager.currentMovieId, reviewData);
    
    if (newReview) {
        document.getElementById('reviewText').value = '';
        document.getElementById('reviewRating').value = '5';
        showReviewNotification();
    }
};

window.showReviewsModalForCurrentMovie = function() {
    if (!window.filmManager.currentMovieId) return;
    
    const movie = window.filmManager.films.find(m => m.id == window.filmManager.currentMovieId);
    if (movie) {
        showReviewsModal(movie);
    }
};

// Функции для фильтров
window.removeFilter = removeFilter;
window.removeContentFilter = removeContentFilter;

// Главная функция инициализации
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 Инициализация VzorRos...');
    
    try {
        // Инициализируем оранжевый фон СРАЗУ
        window.backgroundBeams = new LightBackgroundBeams();
        console.log('✅ Оранжевый фон инициализирован');
        
        // Быстрая инициализация менеджеров
        window.filmManager = new FilmManager();
        window.userManager = new UserManager();
        
        // СРАЗУ запускаем мгновенную инициализацию
        window.filmManager.init().then(() => {
            // Создаем ContentManager после загрузки данных
            window.contentManager = new ContentManager();
            
            // Инициализируем остальные модули
            initModals();
            initSearch();
            initAdmin();
            setupSecretAdmin();
            
            // Обновляем UI
            updateUserProfile();
            
            console.log('✅ VzorRos инициализирован мгновенно!');
        }).catch(error => {
            console.error('❌ Ошибка инициализации FilmManager:', error);
        });
        
    } catch (error) {
        console.error('❌ Ошибка инициализации VzorRos:', error);
    }
});

// Функция для открытия модального окна кастомного ряда
window.showCustomRowModal = function(rowId) {
    if (!window.filmManager) return;
    
    const row = window.filmManager.getCustomRow(rowId);
    if (!row) return;
    
    // Проверяем, существует ли функция showCustomRowModal в modals.js
    if (typeof showCustomRowModal === 'function') {
        showCustomRowModal(rowId, row.name);
    } else {
        // Fallback: открываем встроенную функцию
        if (window.contentManager && typeof window.contentManager.showCustomRowModal === 'function') {
            window.contentManager.showCustomRowModal(rowId);
        }
    }
};