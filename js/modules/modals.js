// modules/modals.js
// ===== MODALS MANAGEMENT =====
import { CONTENT_TYPES } from './constants.js';
import { showAdminMessage, showRatingNotification, showReviewNotification } from './utils.js';

export function initModals() {
    createMovieInfoModal();
    createAuthModal();
    createUserProfile();
    createEditMovieModal();
    createReviewsModal();
    createFiltersModal();
    createContentFiltersModal();
}

// Movie Info Modal
function createMovieInfoModal() {
    const modal = document.createElement('div');
    modal.id = 'movieInfoModal';
    modal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0,0,0,0.9);
        display: none;
        justify-content: center;
        align-items: center;
        z-index: 10011;
        padding: 20px;
    `;
    
    modal.innerHTML = `
        <div style="background: var(--bg-modal); border-radius: 20px; padding: 40px; max-width: 1000px; width: 100%; max-height: 95vh; overflow-y: auto; position: relative; box-shadow: 0 25px 80px rgba(0,0,0,0.9);">
            <button id="closeMovieInfo" style="position: absolute; top: 20px; right: 20px; background: none; border: none; color: var(--text-secondary); font-size: 28px; cursor: pointer; width: 40px; height: 40px; display: flex; align-items: center; justify-content: center; border-radius: 50%; transition: all 0.3s ease;">×</button>
            <div id="movieInfoContent"></div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    document.getElementById('closeMovieInfo').addEventListener('mouseenter', function() {
        this.style.background = 'rgba(255,255,255,0.1)';
        this.style.color = 'white';
    });
    
    document.getElementById('closeMovieInfo').addEventListener('mouseleave', function() {
        this.style.background = 'none';
        this.style.color = 'var(--text-secondary)';
    });
    
    document.getElementById('closeMovieInfo').addEventListener('click', function() {
        modal.style.display = 'none';
    });
    
    modal.addEventListener('click', function(e) {
        if (e.target === modal) {
            modal.style.display = 'none';
        }
    });
}

export function showMovieInfo(movie) {
    const modal = document.getElementById('movieInfoModal');
    const content = document.getElementById('movieInfoContent');
    
    // Закрываем все другие модальные окна кастомных рядов
    document.querySelectorAll('.custom-row-modal').forEach(customModal => {
        if (customModal.style.display === 'flex') {
            customModal.style.display = 'none';
        }
    });
    
    window.filmManager.currentMovieId = movie.id;
    
    const reviewCount = movie.reviews ? movie.reviews.length : 0;
    const userRating = window.filmManager.getUserRating(movie.id);
    const averageUserRating = window.filmManager.getAverageUserRating(movie.id);
    const totalRatings = movie.userRatings ? movie.userRatings.length : 0;
    
    let displayPartner = movie.partner;
    if (window.contentManager.currentPage === 'all') {
        if (typeof window.currentPartnerFilter !== 'undefined' && window.currentPartnerFilter !== 'all' && hasPartnerLink(movie, window.currentPartnerFilter)) {
            displayPartner = window.currentPartnerFilter;
        }
    } else {
        if (typeof window.currentContentPartnerFilter !== 'undefined' && window.currentContentPartnerFilter !== 'all' && hasPartnerLink(movie, window.currentContentPartnerFilter)) {
            displayPartner = window.currentContentPartnerFilter;
        }
    }
    
    const partnerInfo = window.PARTNERS[displayPartner] || window.PARTNERS.okko;
    const contentType = CONTENT_TYPES[movie.contentType] || CONTENT_TYPES.movie;
    const seasonInfo = movie.contentType === 'series' && movie.seasons ? ` • ${movie.seasons} сезон${movie.seasons > 1 ? 'а' : ''}` : '';
    
    content.innerHTML = `
        <div style="display: grid; grid-template-columns: 280px 1fr; gap: 35px; margin-bottom: 35px;">
            <div>
                <img src="${movie.img}" alt="${movie.title}" 
                     style="width: 100%; border-radius: 15px; box-shadow: 0 12px 35px rgba(0,0,0,0.4); transition: transform 0.3s ease;"
                     id="moviePoster">
                
                <div style="margin-top: 20px; background: var(--bg-secondary); padding: 15px; border-radius: 12px;">
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; text-align: center;">
                        <div>
                            <div style="font-size: 24px; font-weight: 700; color: var(--accent);">${movie.rating}</div>
                            <div style="font-size: 12px; color: var(--text-secondary);">IMDb рейтинг</div>
                        </div>
                        <div>
                            <div style="font-size: 24px; font-weight: 700; color: #FFD700;">${averageUserRating}</div>
                            <div style="font-size: 12px; color: var(--text-secondary);">${totalRatings} оценок</div>
                        </div>
                    </div>
                </div>
            </div>
            
            <div>
                <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 10px;">
                    <span style="background: ${contentType.color}; color: white; padding: 4px 8px; border-radius: 6px; font-size: 12px; font-weight: 600;">
                        ${contentType.name}
                    </span>
                </div>
                
                <h2 style="margin: 0 0 12px 0; color: var(--text-primary); font-size: 32px; line-height: 1.2;">${movie.title}</h2>
                
                <div style="display: flex; gap: 20px; margin-bottom: 20px; color: var(--text-secondary); font-size: 16px; flex-wrap: wrap;">
                    <span>${movie.year}${seasonInfo}</span>
                    <span style="display: flex; align-items: center; gap: 4px;">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26"/>
                        </svg>
                        ${movie.rating}/10
                    </span>
                    <span>${movie.genre}</span>
                    <span style="display: flex; align-items: center; gap: 4px;">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <circle cx="12" cy="12" r="10"></circle>
                            <polyline points="12 6 12 12 16 14"></polyline>
                        </svg>
                        ${movie.duration}
                    </span>
                </div>
                
                <p style="color: var(--text-secondary); line-height: 1.6; margin-bottom: 25px; font-size: 15px;">${movie.description}</p>
                
                <button onclick="window.open('${movie.partnerLinks[displayPartner]}', '_blank')" 
                        style="background: ${partnerInfo.color}; color: white; border: none; padding: 14px 28px; border-radius: 10px; cursor: pointer; font-weight: 600; font-size: 16px; transition: all 0.3s ease; display: flex; align-items: center; gap: 8px;"
                        id="watchBtn">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <polygon points="5,3 19,12 5,21"></polygon>
                    </svg>
                    Смотреть на ${partnerInfo.name}
                </button>
            </div>
        </div>
        
        <div style="display: grid; grid-template-columns: 1fr; gap: 30px; margin-bottom: 35px;">
            <div>
                <h4 style="margin: 0 0 15px 0; color: var(--text-primary); font-size: 18px; display: flex; align-items: center; gap: 8px;">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                        <polyline points="14,2 14,8 20,8"></polyline>
                        <line x1="16" y1="13" x2="8" y2="13"></line>
                        <line x1="16" y1="17" x2="8" y2="17"></line>
                        <polyline points="10,9 9,9 8,9"></polyline>
                    </svg>
                    Информация
                </h4>
                <div style="color: var(--text-secondary); font-size: 14px; line-height: 1.8;">
                    <p><strong>Тип:</strong> ${contentType.name}</p>
                    <p><strong>Режиссер:</strong> ${movie.director}</p>
                    <p><strong>В ролях:</strong> ${movie.actors}</p>
                    <p><strong>Страна:</strong> ${movie.country}</p>
                    <p><strong>Длительность:</strong> ${movie.duration}</p>
                    ${movie.contentType === 'series' && movie.seasons ? `<p><strong>Сезонов:</strong> ${movie.seasons}</p>` : ''}
                    <p><strong>Платформа:</strong> ${partnerInfo.name}</p>
                    ${movie.tags && movie.tags.length > 0 ? `<p><strong>Теги:</strong> ${movie.tags.join(', ')}</p>` : ''}
                </div>
            </div>
        </div>
        
        <div style="background: var(--bg-secondary); padding: 30px; border-radius: 15px; margin-top: 20px;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 25px;">
                <h4 style="margin: 0; color: var(--text-primary); font-size: 20px; display: flex; align-items: center; gap: 8px;">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26"/>
                    </svg>
                    Ваша оценка
                </h4>
                <button onclick="showReviewsModalForCurrentMovie()" 
                        style="background: rgba(255,255,255,0.1); color: var(--text-primary); border: 1px solid var(--border); padding: 10px 20px; border-radius: 8px; cursor: pointer; font-weight: 600; font-size: 14px; transition: all 0.3s ease; display: flex; align-items: center; gap: 8px;">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                    </svg>
                    Отзывы (${reviewCount})
                </button>
            </div>
            
            <div style="margin-bottom: 25px;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px;">
                    <span style="color: var(--text-secondary); font-weight: 600;">Оцените ${contentType.name.toLowerCase()}:</span>
                    <span id="currentRatingDisplay" style="color: #FFD700; font-weight: 700; font-size: 16px;">
                        ${userRating > 0 ? `Ваша оценка: ${userRating}/10` : 'Выберите оценку'}
                    </span>
                </div>
                
                <div class="star-rating" style="display: flex; gap: 4px; justify-content: center; margin-bottom: 10px;">
                    ${Array.from({length: 10}, (_, i) => `
                        <div class="star" data-rating="${i + 1}" 
                             style="font-size: 32px; cursor: pointer; transition: all 0.3s ease; color: ${i < userRating ? '#FFD700' : '#666'};">
                            ${i < userRating ? '★' : '☆'}
                        </div>
                    `).join('')}
                </div>
                
                <div style="display: flex; justify-content: space-between; color: var(--text-secondary); font-size: 12px; margin-top: 5px;">
                    <span>1</span>
                    <span>10</span>
                </div>
                
                ${userRating > 0 ? `
                    <div style="text-align: center; margin-top: 10px;">
                        <small style="color: var(--text-secondary);">Вы уже оценили этот ${contentType.name.toLowerCase()}</small>
                    </div>
                ` : ''}
            </div>
            
            <div>
                <h5 style="margin: 0 0 15px 0; color: var(--text-primary); font-size: 16px; display: flex; align-items: center; gap: 8px;">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M17 8h2a2 2 0 0 1 2 2v6a2 2 0 0 1-2 2h-2v4l-4-4H9a1.994 1.994 0 0 1-1.414-.586m0 0L11 14h4a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2v4l.586-.586z"/>
                    </svg>
                    Написать отзыв
                </h5>
                <textarea id="reviewText" 
                          placeholder="Поделитесь вашими впечатлениями..." 
                          style="width: 100%; padding: 15px; background: var(--bg-card); border: 1px solid var(--border); border-radius: 10px; color: white; resize: vertical; min-height: 100px; font-size: 14px; line-height: 1.5; transition: all 0.3s ease;"></textarea>
                
                <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 15px; gap: 15px;">
                    <select id="reviewRating" 
                            style="padding: 10px 15px; background: var(--bg-card); border: 1px solid var(--border); border-radius: 8px; color: white; font-size: 14px; flex: 1; transition: all 0.3s ease;">
                        <option value="5">Отлично</option>
                        <option value="4">Хорошо</option>
                        <option value="3">Средне</option>
                        <option value="2">Плохо</option>
                        <option value="1">Ужасно</option>
                    </select>
                    
                    <button onclick="submitReview()" 
                            style="padding: 12px 24px; background: var(--accent); color: white; border: none; border-radius: 8px; cursor: pointer; font-weight: 600; font-size: 14px; transition: all 0.3s ease; white-space: nowrap; display: flex; align-items: center; gap: 8px;"
                            id="submitReviewBtn">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <line x1="22" y1="2" x2="11" y2="13"></line>
                            <polygon points="22,2 15,22 11,13 2,9"></polygon>
                        </svg>
                        Опубликовать отзыв
                    </button>
                </div>
            </div>
        </div>
    `;
    
    setupMovieInfoInteractions();
    modal.style.display = 'flex';
}

function setupMovieInfoInteractions() {
    const poster = document.getElementById('moviePoster');
    const watchBtn = document.getElementById('watchBtn');
    const reviewText = document.getElementById('reviewText');
    const reviewRating = document.getElementById('reviewRating');
    const submitReviewBtn = document.getElementById('submitReviewBtn');
    
    if (poster) {
        poster.addEventListener('mouseenter', function() {
            this.style.transform = 'scale(1.02)';
        });
        
        poster.addEventListener('mouseleave', function() {
            this.style.transform = 'scale(1)';
        });
    }
    
    if (watchBtn) {
        watchBtn.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-2px)';
            this.style.boxShadow = '0 6px 20px rgba(0, 0, 0, 0.4)';
        });
        
        watchBtn.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0)';
            this.style.boxShadow = 'none';
        });
    }
    
    if (reviewText) {
        reviewText.addEventListener('focus', function() {
            this.style.borderColor = 'var(--accent)';
            this.style.boxShadow = '0 0 0 2px rgba(255, 106, 43, 0.1)';
        });
        
        reviewText.addEventListener('blur', function() {
            this.style.borderColor = 'var(--border)';
            this.style.boxShadow = 'none';
        });
    }
    
    if (reviewRating) {
        reviewRating.addEventListener('focus', function() {
            this.style.borderColor = 'var(--accent)';
        });
        
        reviewRating.addEventListener('blur', function() {
            this.style.borderColor = 'var(--border)';
        });
    }
    
    if (submitReviewBtn) {
        submitReviewBtn.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-1px)';
            this.style.boxShadow = '0 4px 12px rgba(255, 106, 43, 0.4)';
        });
        
        submitReviewBtn.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0)';
            this.style.boxShadow = 'none';
        });
    }
    
    const stars = document.querySelectorAll('.star');
    stars.forEach(star => {
        star.addEventListener('mouseenter', function() {
            const rating = parseInt(this.dataset.rating);
            hoverStar(rating);
        });
        
        star.addEventListener('mouseleave', resetStars);
        
        star.addEventListener('click', function() {
            const rating = parseInt(this.dataset.rating);
            rateMovie(rating);
        });
    });
}

function hoverStar(rating) {
    const stars = document.querySelectorAll('.star');
    const userRating = window.filmManager.getUserRating(window.filmManager.currentMovieId);
    
    if (userRating > 0) return;
    
    stars.forEach((star, index) => {
        const starRating = parseInt(star.dataset.rating);
        if (starRating <= rating) {
            star.style.color = '#FFD700';
            star.style.transform = 'scale(1.1)';
            star.textContent = '★';
        } else {
            star.style.color = '#666';
            star.style.transform = 'scale(1)';
            star.textContent = '☆';
        }
    });
}

function resetStars() {
    const currentRating = window.filmManager.getUserRating(window.filmManager.currentMovieId);
    const stars = document.querySelectorAll('.star');
    
    stars.forEach((star, index) => {
        const starRating = parseInt(star.dataset.rating);
        if (starRating <= currentRating) {
            star.style.color = '#FFD700';
            star.style.transform = 'scale(1)';
            star.textContent = '★';
        } else {
            star.style.color = '#666';
            star.style.transform = 'scale(1)';
            star.textContent = '☆';
        }
    });
}

function rateMovie(rating) {
    if (!window.filmManager.currentMovieId) return;
    
    const userRating = window.filmManager.getUserRating(window.filmManager.currentMovieId);
    
    if (userRating > 0) {
        showRatingNotification(userRating, true);
        return;
    }
    
    window.filmManager.addUserRating(window.filmManager.currentMovieId, rating);
    
    const display = document.getElementById('currentRatingDisplay');
    if (display) {
        display.textContent = `Ваша оценка: ${rating}/10`;
        display.style.animation = 'pulse 0.5s ease';
    }
    
    const stars = document.querySelectorAll('.star');
    stars.forEach((star, index) => {
        const starRating = parseInt(star.dataset.rating);
        if (starRating === rating) {
            star.style.animation = 'bounce 0.5s ease';
            setTimeout(() => {
                star.style.animation = '';
            }, 500);
        }
    });
    
    showRatingNotification(rating, false);
    
    const movie = window.filmManager.films.find(m => m.id == window.filmManager.currentMovieId);
    if (movie) {
        setTimeout(() => showMovieInfo(movie), 1000);
    }
}

function submitReview() {
    if (!window.filmManager.currentMovieId) return;
    
    if (!window.userManager.currentUser) {
        showAuthModal();
        return;
    }
    
    const reviewText = document.getElementById('reviewText').value.trim();
    const rating = parseInt(document.getElementById('reviewRating').value);
    
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
        
        const movie = window.filmManager.films.find(m => m.id == window.filmManager.currentMovieId);
        if (movie) {
            setTimeout(() => showMovieInfo(movie), 500);
        }
    }
}

// Auth Modal
function createAuthModal() {
    const modal = document.createElement('div');
    modal.id = 'authModal';
    modal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0,0,0,0.8);
        display: none;
        justify-content: center;
        align-items: center;
        z-index: 10013; /* Выше окна фильма и отзывов */
        padding: 20px;
    `;
    
    modal.innerHTML = `
        <div style="background: var(--bg-modal); border-radius: 15px; padding: 30px; max-width: 400px; width: 100%; position: relative;">
            <button id="closeAuthModal" style="position: absolute; top: 15px; right: 15px; background: none; border: none; color: var(--text-secondary); font-size: 24px; cursor: pointer;">×</button>
            
            <div id="loginSection">
                <h3 style="margin: 0 0 20px 0; color: var(--text-primary); text-align: center;">🔐 Вход</h3>
                <form id="loginForm" style="display: grid; gap: 15px;">
                    <div>
                        <label style="display: block; margin-bottom: 5px; color: var(--text-primary); font-weight: 600;">Email</label>
                        <input type="email" id="loginEmail" required style="width: 100%; padding: 12px; background: var(--bg-secondary); border: 1px solid var(--border); border-radius: 8px; color: white;">
                    </div>
                    <div>
                        <label style="display: block; margin-bottom: 5px; color: var(--text-primary); font-weight: 600;">Пароль</label>
                        <input type="password" id="loginPassword" required style="width: 100%; padding: 12px; background: var(--bg-secondary); border: 1px solid var(--border); border-radius: 8px; color: white;">
                    </div>
                    <button type="submit" style="padding: 12px; background: var(--accent); color: white; border: none; border-radius: 8px; cursor: pointer; font-weight: 600; margin-top: 10px;">Войти</button>
                </form>
                <div style="text-align: center; margin-top: 15px;">
                    <span style="color: var(--text-secondary);">Нет аккаунта? </span>
                    <button id="switchToRegister" style="background: none; border: none; color: var(--accent); cursor: pointer; font-weight: 600;">Зарегистрироваться</button>
                </div>
            </div>
            
            <div id="registerSection" style="display: none;">
                <h3 style="margin: 0 0 20px 0; color: var(--text-primary); text-align: center;">📝 Регистрация</h3>
                <form id="registerForm" style="display: grid; gap: 15px;">
                    <div>
                        <label style="display: block; margin-bottom: 5px; color: var(--text-primary); font-weight: 600;">Имя пользователя</label>
                        <input type="text" id="registerUsername" required style="width: 100%; padding: 12px; background: var(--bg-secondary); border: 1px solid var(--border); border-radius: 8px; color: white;">
                    </div>
                    <div>
                        <label style="display: block; margin-bottom: 5px; color: var(--text-primary); font-weight: 600;">Email</label>
                        <input type="email" id="registerEmail" required style="width: 100%; padding: 12px; background: var(--bg-secondary); border: 1px solid var(--border); border-radius: 8px; color: white;">
                    </div>
                    <div>
                        <label style="display: block; margin-bottom: 5px; color: var(--text-primary); font-weight: 600;">Пароль</label>
                        <input type="password" id="registerPassword" required style="width: 100%; padding: 12px; background: var(--bg-secondary); border: 1px solid var(--border); border-radius: 8px; color: white;">
                    </div>
                    <button type="submit" style="padding: 12px; background: var(--accent); color: white; border: none; border-radius: 8px; cursor: pointer; font-weight: 600; margin-top: 10px;">Зарегистрироваться</button>
                </form>
                <div style="text-align: center; margin-top: 15px;">
                    <span style="color: var(--text-secondary);">Уже есть аккаунт? </span>
                    <button id="switchToLogin" style="background: none; border: none; color: var(--accent); cursor: pointer; font-weight: 600;">Войти</button>
                </div>
            </div>
            
            <div id="authMessage" style="margin-top: 15px; padding: 10px; border-radius: 6px; display: none; text-align: center; font-size: 14px;"></div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    document.getElementById('closeAuthModal').addEventListener('click', () => {
        modal.style.display = 'none';
    });
    
    document.getElementById('switchToRegister').addEventListener('click', () => {
        document.getElementById('loginSection').style.display = 'none';
        document.getElementById('registerSection').style.display = 'block';
    });
    
    document.getElementById('switchToLogin').addEventListener('click', () => {
        document.getElementById('registerSection').style.display = 'none';
        document.getElementById('loginSection').style.display = 'block';
    });
    
    document.getElementById('loginForm').addEventListener('submit', (e) => {
        e.preventDefault();
        const email = document.getElementById('loginEmail').value;
        const password = document.getElementById('loginPassword').value;
        handleLogin(email, password);
    });
    
    document.getElementById('registerForm').addEventListener('submit', (e) => {
        e.preventDefault();
        const username = document.getElementById('registerUsername').value;
        const email = document.getElementById('registerEmail').value;
        const password = document.getElementById('registerPassword').value;
        handleRegister(username, email, password);
    });
    
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.style.display = 'none';
        }
    });
}

export function showAuthModal() {
    const modal = document.getElementById('authModal');
    if (!modal) {
        createAuthModal();
    } else {
        modal.style.display = 'flex';
        document.getElementById('loginSection').style.display = 'block';
        document.getElementById('registerSection').style.display = 'none';
        document.getElementById('authMessage').style.display = 'none';
    }
}

function handleLogin(email, password) {
    const result = window.userManager.login(email, password);
    const messageEl = document.getElementById('authMessage');
    
    if (result.success) {
        messageEl.textContent = '✅ Успешный вход!';
        messageEl.style.background = 'rgba(34, 197, 94, 0.1)';
        messageEl.style.color = '#22c55e';
        messageEl.style.display = 'block';
        
        setTimeout(() => {
            document.getElementById('authModal').style.display = 'none';
            if (window.updateUserProfile) {
                window.updateUserProfile();
            }
            if (window.contentManager) {
                window.contentManager.refreshAllSections();
            }
        }, 1000);
    } else {
        messageEl.textContent = result.message;
        messageEl.style.background = 'rgba(239, 68, 68, 0.1)';
        messageEl.style.color = '#ef4444';
        messageEl.style.display = 'block';
    }
}

function handleRegister(username, email, password) {
    const result = window.userManager.register(username, email, password);
    const messageEl = document.getElementById('authMessage');
    
    if (result.success) {
        messageEl.textContent = '✅ Регистрация успешна!';
        messageEl.style.background = 'rgba(34, 197, 94, 0.1)';
        messageEl.style.color = '#22c55e';
        messageEl.style.display = 'block';
        
        setTimeout(() => {
            document.getElementById('authModal').style.display = 'none';
            if (window.updateUserProfile) {
                window.updateUserProfile();
            }
            if (window.contentManager) {
                window.contentManager.refreshAllSections();
            }
        }, 1000);
    } else {
        messageEl.textContent = result.message;
        messageEl.style.background = 'rgba(239, 68, 68, 0.1)';
        messageEl.style.color = '#ef4444';
        messageEl.style.display = 'block';
    }
}

// User Profile
function createUserProfile() {
    const profile = document.createElement('div');
    profile.id = 'userProfile';
    profile.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        z-index: 9999;
        cursor: pointer;
    `;
    
    profile.innerHTML = `
        <div id="profileButton" style="
            display: flex;
            align-items: center;
            gap: 10px;
            background: rgba(255, 255, 255, 0.1);
            border: 1px solid rgba(255, 255, 255, 0.2);
            border-radius: 12px;
            padding: 8px 12px;
            color: var(--text-primary);
            font-weight: 500;
            font-size: 14px;
            transition: all 0.3s ease;
            backdrop-filter: blur(10px);
        ">
            <div style="
                width: 24px;
                height: 24px;
                border-radius: 6px;
                background: rgba(255, 255, 255, 0.1);
                display: flex;
                align-items: center;
                justify-content: center;
                border: 1.5px solid rgba(255, 255, 255, 0.3);
            ">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                    <circle cx="12" cy="7" r="4"></circle>
                </svg>
            </div>
            <span>Войти</span>
        </div>
        <div id="profileDropdown" style="position: absolute; top: 100%; right: 0; margin-top: 10px; background: var(--bg-modal); border-radius: 10px; padding: 15px; min-width: 250px; box-shadow: 0 10px 30px rgba(0,0,0,0.5); display: none; border: 1px solid var(--border); z-index: 10006;">
            <div id="profileInfo" style="text-align: center; margin-bottom: 15px; padding-bottom: 15px; border-bottom: 1px solid var(--border);">
                <div id="profileUsername" style="font-weight: 600; color: var(--text-primary); margin-bottom: 5px; font-size: 16px;"></div>
                <div id="profileEmail" style="font-size: 12px; color: var(--text-secondary);"></div>
            </div>
            <button id="savedMoviesBtn" style="width: 100%; padding: 12px; background: var(--bg-secondary); color: var(--text-primary); border: none; border-radius: 6px; cursor: pointer; margin-bottom: 8px; text-align: left; display: flex; align-items: center; gap: 10px; font-size: 14px; transition: all 0.3s ease;">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/>
                </svg>
                Сохраненные фильмы
            </button>
            <button id="myReviewsBtn" style="width: 100%; padding: 12px; background: var(--bg-secondary); color: var(--text-primary); border: none; border-radius: 6px; cursor: pointer; margin-bottom: 8px; text-align: left; display: flex; align-items: center; gap: 10px; font-size: 14px; transition: all 0.3s ease;">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                </svg>
                Мои отзывы
            </button>
            <button id="logoutBtn" style="width: 100%; padding: 12px; background: var(--bg-secondary); color: var(--text-primary); border: none; border-radius: 6px; cursor: pointer; text-align: left; display: flex; align-items: center; gap: 10px; font-size: 14px; transition: all 0.3s ease;">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                    <polyline points="16,17 21,12 16,7"/>
                    <line x1="21" y1="12" x2="9" y2="12"/>
                </svg>
                Выйти
            </button>
        </div>
    `;
    
    document.body.appendChild(profile);
    
    document.getElementById('profileButton').addEventListener('click', (e) => {
        e.stopPropagation();
        if (!window.userManager.currentUser) {
            showAuthModal();
        } else {
            const dropdown = document.getElementById('profileDropdown');
            dropdown.style.display = dropdown.style.display === 'block' ? 'none' : 'block';
        }
    });
    
    document.getElementById('savedMoviesBtn').addEventListener('click', () => {
        showSavedMovies();
        document.getElementById('profileDropdown').style.display = 'none';
    });
    
    document.getElementById('myReviewsBtn').addEventListener('click', () => {
        showMyReviews();
        document.getElementById('profileDropdown').style.display = 'none';
    });
    
    document.getElementById('logoutBtn').addEventListener('click', () => {
        window.userManager.logout();
        if (window.updateUserProfile) {
            window.updateUserProfile();
        }
        document.getElementById('profileDropdown').style.display = 'none';
        if (window.contentManager) {
            window.contentManager.refreshAllSections();
        }
    });
    
    const buttons = ['savedMoviesBtn', 'myReviewsBtn', 'logoutBtn'];
    buttons.forEach(btnId => {
        const btn = document.getElementById(btnId);
        btn.addEventListener('mouseenter', function() {
            this.style.background = 'var(--accent)';
            this.style.color = 'white';
            this.style.transform = 'translateX(5px)';
        });
        btn.addEventListener('mouseleave', function() {
            this.style.background = 'var(--bg-secondary)';
            this.style.color = 'var(--text-primary)';
            this.style.transform = 'translateX(0)';
        });
    });
    
    document.addEventListener('click', () => {
        document.getElementById('profileDropdown').style.display = 'none';
    });
}

export function updateUserProfile() {
    const profileButton = document.getElementById('profileButton');
    const profileUsername = document.getElementById('profileUsername');
    const profileEmail = document.getElementById('profileEmail');
    const savedMoviesBtn = document.getElementById('savedMoviesBtn');
    const myReviewsBtn = document.getElementById('myReviewsBtn');
    const logoutBtn = document.getElementById('logoutBtn');
    
    if (window.userManager.currentUser) {
        profileButton.innerHTML = `
            <div style="
                width: 32px;
                height: 32px;
                border-radius: 50%;
                overflow: hidden;
                border: 2px solid var(--accent);
            ">
                <img src="${window.userManager.currentUser.avatar}" alt="Avatar" style="width: 100%; height: 100%; object-fit: cover;">
            </div>
            <span>${window.userManager.currentUser.username}</span>
        `;
        profileUsername.textContent = window.userManager.currentUser.username;
        profileEmail.textContent = window.userManager.currentUser.email;
        
        savedMoviesBtn.style.display = 'flex';
        myReviewsBtn.style.display = 'flex';
        logoutBtn.style.display = 'flex';
    } else {
        profileButton.innerHTML = `
            <div style="
                width: 24px;
                height: 24px;
                border-radius: 6px;
                background: rgba(255, 255, 255, 0.1);
                display: flex;
                align-items: center;
                justify-content: center;
                border: 1.5px solid rgba(255, 255, 255, 0.3);
            ">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                    <circle cx="12" cy="7" r="4"></circle>
                </svg>
            </div>
            <span>Войти</span>
        `;
        profileUsername.textContent = 'Гость';
        profileEmail.textContent = 'Войдите в аккаунт';
        
        savedMoviesBtn.style.display = 'none';
        myReviewsBtn.style.display = 'none';
        logoutBtn.style.display = 'none';
    }
}

export function showSaveNotification(isSaved, movieTitle) {
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: var(--bg-modal);
        color: var(--text-primary);
        padding: 15px 20px;
        border-radius: 10px;
        border-left: 4px solid ${isSaved ? '#FFD700' : '#666'};
        box-shadow: 0 5px 15px rgba(0,0,0,0.3);
        z-index: 10002;
        animation: slideInRight 0.3s ease, slideOutRight 0.3s ease 2.7s;
        display: flex;
        align-items: center;
        gap: 10px;
        max-width: 300px;
    `;
    
    if (isSaved) {
        notification.innerHTML = `
            <svg width="20" height="20" viewBox="0 0 24 24" fill="#FFD700" stroke="#FFD700" stroke-width="2">
                <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/>
            </svg>
            <div>
                <div style="font-weight: 600;">Фильм сохранен!</div>
                <div style="font-size: 12px; color: var(--text-secondary);">"${movieTitle}" добавлен в избранное</div>
            </div>
        `;
    } else {
        notification.innerHTML = `
            <svg width="20" height="20" viewBox="0 0 24 24" fill="#666" stroke="#666" stroke-width="2">
                <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/>
            </svg>
            <div>
                <div style="font-weight: 600;">Фильм удален</div>
                <div style="font-size: 12px; color: var(--text-secondary);">"${movieTitle}" убран из избранного</div>
            </div>
        `;
    }
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        if (notification.parentNode) {
            notification.parentNode.removeChild(notification);
        }
    }, 3000);
}

export function showSavedMovies() {
    if (!window.userManager.currentUser) {
        showAuthModal();
        return;
    }
    
    const savedMovieIds = window.userManager.currentUser.savedMovies;
    const savedMovies = window.filmManager.films.filter(movie => savedMovieIds.includes(movie.id));
    
    let savedModal = document.getElementById('savedMoviesModal');
    if (!savedModal) {
        savedModal = document.createElement('div');
        savedModal.id = 'savedMoviesModal';
        savedModal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0,0,0,0.9);
            display: none;
            justify-content: center;
            align-items: center;
            z-index: 10007;
            padding: 20px;
        `;
        
        savedModal.innerHTML = `
            <div style="background: var(--bg-modal); border-radius: 15px; padding: 30px; max-width: 900px; width: 100%; max-height: 80vh; overflow-y: auto; position: relative;">
                <button id="closeSavedModal" style="position: absolute; top: 15px; right: 15px; background: none; border: none; color: var(--text-secondary); font-size: 24px; cursor: pointer;">×</button>
                <h3 style="margin: 0 0 20px 0; color: var(--text-primary); display: flex; align-items: center; gap: 10px;">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/>
                    </svg>
                    Сохраненные фильмы
                </h3>
                <div id="savedMoviesContent" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 20px;"></div>
                ${savedMovies.length === 0 ? '<p style="text-align: center; color: var(--text-secondary); padding: 40px;">Нет сохраненных фильмов</p>' : ''}
            </div>
        `;
        
        document.body.appendChild(savedModal);
        
        document.getElementById('closeSavedModal').addEventListener('click', () => {
            savedModal.style.display = 'none';
        });
        
        savedModal.addEventListener('click', (e) => {
            if (e.target === savedModal) {
                savedModal.style.display = 'none';
            }
        });
    }
    
    const content = document.getElementById('savedMoviesContent');
    content.innerHTML = '';
    
    savedMovies.forEach(movie => {
        const movieCard = document.createElement('div');
        movieCard.className = 'saved-movie-card';
        movieCard.style.cssText = `
            background: var(--bg-secondary);
            border-radius: 10px;
            overflow: hidden;
            transition: transform 0.3s ease;
            cursor: pointer;
            position: relative;
        `;
        
        movieCard.innerHTML = `
            <button class="remove-saved-btn" data-id="${movie.id}" style="
                position: absolute;
                top: 10px;
                right: 10px;
                width: 30px;
                height: 30px;
                border-radius: 50%;
                background: rgba(239, 68, 68, 0.9);
                border: none;
                color: white;
                cursor: pointer;
                z-index: 2;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 16px;
                transition: all 0.3s ease;
            ">×</button>
            <img src="${movie.img}" alt="${movie.title}" style="width: 100%; height: 250px; object-fit: cover;">
            <div style="padding: 15px;">
                <h4 style="margin: 0 0 8px 0; color: var(--text-primary); font-size: 14px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${movie.title}</h4>
                <div style="display: flex; justify-content: space-between; align-items: center;">
                    <span style="color: var(--text-secondary); font-size: 12px;">${movie.year}</span>
                    <span style="color: gold; font-size: 12px;">⭐ ${movie.rating}</span>
                </div>
            </div>
        `;
        
        const removeBtn = movieCard.querySelector('.remove-saved-btn');
        removeBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            window.userManager.unsaveMovie(movie.id);
            showSaveNotification(false, movie.title);
            showSavedMovies();
        });
        
        movieCard.addEventListener('click', () => {
            showMovieInfo(movie);
            savedModal.style.display = 'none';
        });
        
        movieCard.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-5px)';
        });
        
        movieCard.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0)';
        });
        
        content.appendChild(movieCard);
    });
    
    savedModal.style.display = 'flex';
}

export function showMyReviews() {
    if (!window.userManager.currentUser) {
        showAuthModal();
        return;
    }
    
    const userReviews = window.userManager.getUserReviews();
    
    let reviewsModal = document.getElementById('myReviewsModal');
    if (!reviewsModal) {
        reviewsModal = document.createElement('div');
        reviewsModal.id = 'myReviewsModal';
        reviewsModal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0,0,0,0.9);
            display: none;
            justify-content: center;
            align-items: center;
            z-index: 10007;
            padding: 20px;
        `;
        
        reviewsModal.innerHTML = `
            <div style="background: var(--bg-modal); border-radius: 15px; padding: 30px; max-width: 700px; width: 100%; max-height: 80vh; overflow-y: auto; position: relative;">
                <button id="closeMyReviewsModal" style="position: absolute; top: 15px; right: 15px; background: none; border: none; color: var(--text-secondary); font-size: 24px; cursor: pointer;">×</button>
                <h3 style="margin: 0 0 20px 0; color: var(--text-primary); display: flex; align-items: center; gap: 10px;">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                    </svg>
                    Мои отзывы
                </h3>
                <div id="myReviewsContent"></div>
                ${userReviews.length === 0 ? '<p style="text-align: center; color: var(--text-secondary); padding: 40px;">Вы еще не оставляли отзывы</p>' : ''}
            </div>
        `;
        
        document.body.appendChild(reviewsModal);
        
        document.getElementById('closeMyReviewsModal').addEventListener('click', () => {
            reviewsModal.style.display = 'none';
        });
        
        reviewsModal.addEventListener('click', (e) => {
            if (e.target === reviewsModal) {
                reviewsModal.style.display = 'none';
            }
        });
    }
    
    const content = document.getElementById('myReviewsContent');
    content.innerHTML = '';
    
    userReviews.forEach(review => {
        const movie = window.filmManager.films.find(m => m.id === review.movieId);
        if (!movie) return;
        
        const reviewCard = document.createElement('div');
        reviewCard.style.cssText = `
            background: var(--bg-secondary);
            border-radius: 10px;
            padding: 20px;
            margin-bottom: 15px;
            border-left: 4px solid var(--accent);
        `;
        
        reviewCard.innerHTML = `
            <div style="display: flex; gap: 15px; margin-bottom: 15px;">
                <img src="${movie.img}" alt="${movie.title}" style="width: 80px; height: 120px; object-fit: cover; border-radius: 8px;">
                <div style="flex: 1;">
                    <h4 style="margin: 0 0 8px 0; color: var(--text-primary);">${movie.title}</h4>
                    <div style="color: var(--text-secondary); font-size: 14px;">
                        <div>${movie.year} • ${movie.genre}</div>
                        <div style="color: gold; margin-top: 5px;">${'⭐'.repeat(review.rating)}${'☆'.repeat(5-review.rating)}</div>
                    </div>
                </div>
            </div>
            <div style="color: var(--text-primary); line-height: 1.5; font-size: 14px;">${review.text}</div>
            <div style="color: var(--text-secondary); font-size: 12px; margin-top: 10px; text-align: right;">
                ${new Date(review.date).toLocaleDateString('ru-RU')}
            </div>
        `;
        
        reviewCard.addEventListener('click', () => {
            showMovieInfo(movie);
            reviewsModal.style.display = 'none';
        });
        
        reviewCard.style.cursor = 'pointer';
        reviewCard.addEventListener('mouseenter', function() {
            this.style.transform = 'translateX(5px)';
            this.style.transition = 'transform 0.3s ease';
        });
        
        reviewCard.addEventListener('mouseleave', function() {
            this.style.transform = 'translateX(0)';
        });
        
        content.appendChild(reviewCard);
    });
    
    reviewsModal.style.display = 'flex';
}

// Edit Movie Modal
function createEditMovieModal() {
    const modal = document.createElement('div');
    modal.id = 'editMovieModal';
    modal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0,0,0,0.8);
        display: none;
        justify-content: center;
        align-items: center;
        z-index: 10014;
        padding: 20px;
    `;
    
    modal.innerHTML = `
        <div style="background: var(--bg-modal); border-radius: 15px; padding: 30px; max-width: 700px; width: 100%; max-height: 90vh; overflow-y: auto; position: relative;">
            <button id="closeEditModal" style="position: absolute; top: 15px; right: 15px; background: none; border: none; color: var(--text-secondary); font-size: 24px; cursor: pointer;">×</button>
            <h3 style="margin: 0 0 20px 0; color: var(--text-primary);">✏️ Редактировать контент</h3>
            <form id="editMovieForm" style="display: grid; gap: 15px;">
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px;">
                    <div>
                        <label style="display: block; margin-bottom: 5px; color: var(--text-primary); font-weight: 600;">Название</label>
                        <input type="text" id="editTitle" required style="width: 100%; padding: 10px; background: var(--bg-secondary); border: 1px solid var(--border); border-radius: 6px; color: white;">
                    </div>
                    <div>
                        <label style="display: block; margin-bottom: 5px; color: var(--text-primary); font-weight: 600;">Год</label>
                        <input type="number" id="editYear" required style="width: 100%; padding: 10px; background: var(--bg-secondary); border: 1px solid var(--border); border-radius: 6px; color: white;">
                    </div>
                </div>
                
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px;">
                    <div>
                        <label style="display: block; margin-bottom: 5px; color: var(--text-primary); font-weight: 600;">Рейтинг</label>
                        <input type="number" id="editRating" step="0.1" min="0" max="10" required style="width: 100%; padding: 10px; background: var(--bg-secondary); border: 1px solid var(--border); border-radius: 6px; color: white;">
                    </div>
                    <div>
                        <label style="display: block; margin-bottom: 5px; color: var(--text-primary); font-weight: 600;">Жанр</label>
                        <input type="text" id="editGenre" required style="width: 100%; padding: 10px; background: var(--bg-secondary); border: 1px solid var(--border); border-radius: 6px; color: white;">
                    </div>
                </div>
                
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px;">
                    <div>
                        <label style="display: block; margin-bottom: 5px; color: var(--text-primary); font-weight: 600;">Тип контента</label>
                        <select id="editContentType" style="width: 100%; padding: 10px; background: var(--bg-secondary); border: 1px solid var(--border); border-radius: 6px; color: white;">
                            <option value="movie">Фильм</option>
                            <option value="series">Сериал</option>
                            <option value="cartoon">Мультфильм</option>
                        </select>
                    </div>
                    <div>
                        <label style="display: block; margin-bottom: 5px; color: var(--text-primary); font-weight: 600;">Длительность</label>
                        <input type="text" id="editDuration" required style="width: 100%; padding: 10px; background: var(--bg-secondary); border: 1px solid var(--border); border-radius: 6px; color: white;">
                    </div>
                </div>
                
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px;">
                    <div>
                        <label style="display: block; margin-bottom: 5px; color: var(--text-primary); font-weight: 600;">Сезоны (для сериалов)</label>
                        <input type="number" id="editSeasons" min="1" value="1" style="width: 100%; padding: 10px; background: var(--bg-secondary); border: 1px solid var(--border); border-radius: 6px; color: white;">
                    </div>
                    <div>
                        <label style="display: block; margin-bottom: 5px; color: var(--text-primary); font-weight: 600;">Страна</label>
                        <input type="text" id="editCountry" required style="width: 100%; padding: 10px; background: var(--bg-secondary); border: 1px solid var(--border); border-radius: 6px; color: white;">
                    </div>
                </div>
                
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px;">
                    <div>
                        <label style="display: block; margin-bottom: 5px; color: var(--text-primary); font-weight: 600;">Партнер</label>
                        <select id="editPartner" style="width: 100%; padding: 10px; background: var(--bg-secondary); border: 1px solid var(--border); border-radius: 6px; color: white;">
                            <option value="okko">OKKO</option>
                            <option value="ivi">IVI</option>
                            <option value="wink">Wink</option>
                            <option value="kion">KION</option>
                            <option value="premier">Премьер</option>
                            <option value="kinopoisk">КиноПоиск</option>
                        </select>
                    </div>
                    <div>
                        <label style="display: block; margin-bottom: 5px; color: var(--text-primary); font-weight: 600;">Теги (через запятую)</label>
                        <input type="text" id="editTags" placeholder="боевик, приключения" style="width: 100%; padding: 10px; background: var(--bg-secondary); border: 1px solid var(--border); border-radius: 6px; color: white;">
                    </div>
                </div>
                
                <div>
                    <label style="display: block; margin-bottom: 5px; color: var(--text-primary); font-weight: 600;">Ссылка на постер</label>
                    <input type="url" id="editPoster" required style="width: 100%; padding: 10px; background: var(--bg-secondary); border: 1px solid var(--border); border-radius: 6px; color: white;">
                </div>
                
                <div>
                    <label style="display: block; margin-bottom: 5px; color: var(--text-primary); font-weight: 600;">Описание</label>
                    <textarea id="editDescription" rows="3" required style="width: 100%; padding: 10px; background: var(--bg-secondary); border: 1px solid var(--border); border-radius: 6px; color: white; resize: vertical;"></textarea>
                </div>
                
                <div>
                    <label style="display: block; margin-bottom: 5px; color: var(--text-primary); font-weight: 600;">Режиссер</label>
                    <input type="text" id="editDirector" required style="width: 100%; padding: 10px; background: var(--bg-secondary); border: 1px solid var(--border); border-radius: 6px; color: white;">
                </div>
                
                <div>
                    <label style="display: block; margin-bottom: 5px; color: var(--text-primary); font-weight: 600;">Актеры</label>
                    <textarea id="editActors" rows="2" required style="width: 100%; padding: 10px; background: var(--bg-secondary); border: 1px solid var(--border); border-radius: 6px; color: white; resize: vertical;"></textarea>
                </div>
                
                <div style="background: var(--bg-secondary); padding: 20px; border-radius: 10px;">
                    <h4 style="margin: 0 0 15px 0; color: var(--text-primary);">🔗 Партнерские ссылки</h4>
                    <div style="display: grid; gap: 10px;">
                        <div>
                            <label style="display: block; margin-bottom: 5px; color: var(--text-secondary); font-weight: 600;">OKKO</label>
                            <input type="url" id="editOkkoLink" style="width: 100%; padding: 8px; background: var(--bg-card); border: 1px solid var(--border); border-radius: 6px; color: white;">
                        </div>
                        <div>
                            <label style="display: block; margin-bottom: 5px; color: var(--text-secondary); font-weight: 600;">IVI</label>
                            <input type="url" id="editIviLink" style="width: 100%; padding: 8px; background: var(--bg-card); border: 1px solid var(--border); border-radius: 6px; color: white;">
                        </div>
                        <div>
                            <label style="display: block; margin-bottom: 5px; color: var(--text-secondary); font-weight: 600;">Wink</label>
                            <input type="url" id="editWinkLink" style="width: 100%; padding: 8px; background: var(--bg-card); border: 1px solid var(--border); border-radius: 6px; color: white;">
                        </div>
                        <div>
                            <label style="display: block; margin-bottom: 5px; color: var(--text-secondary); font-weight: 600;">KION</label>
                            <input type="url" id="editKionLink" style="width: 100%; padding: 8px; background: var(--bg-card); border: 1px solid var(--border); border-radius: 6px; color: white;">
                        </div>
                        <div>
                            <label style="display: block; margin-bottom: 5px; color: var(--text-secondary); font-weight: 600;">Премьер</label>
                            <input type="url" id="editPremierLink" style="width: 100%; padding: 8px; background: var(--bg-card); border: 1px solid var(--border); border-radius: 6px; color: white;">
                        </div>
                        <div>
                            <label style="display: block; margin-bottom: 5px; color: var(--text-secondary); font-weight: 600;">КиноПоиск</label>
                            <input type="url" id="editKinopoiskLink" style="width: 100%; padding: 8px; background: var(--bg-card); border: 1px solid var(--border); border-radius: 6px; color: white;">
                        </div>
                    </div>
                </div>
                
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-top: 20px;">
                    <button type="button" id="cancelEdit" style="padding: 12px; background: #666; color: white; border: none; border-radius: 8px; cursor: pointer; font-weight: 600;">Отмена</button>
                    <button type="submit" style="padding: 12px; background: var(--accent); color: white; border: none; border-radius: 8px; cursor: pointer; font-weight: 600;">Сохранить изменения</button>
                </div>
            </form>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    document.getElementById('closeEditModal').addEventListener('click', function() {
        modal.style.display = 'none';
    });
    
    document.getElementById('cancelEdit').addEventListener('click', function() {
        modal.style.display = 'none';
    });
    
    modal.addEventListener('click', function(e) {
        if (e.target === modal) {
            modal.style.display = 'none';
        }
    });
    
    document.getElementById('editMovieForm').addEventListener('submit', function(e) {
        e.preventDefault();
        saveFilmChanges();
    });
}

export function showEditMovieModal(film) {
    const modal = document.getElementById('editMovieModal');
    const form = document.getElementById('editMovieForm');
    
    document.getElementById('editTitle').value = film.title;
    document.getElementById('editYear').value = film.year;
    document.getElementById('editRating').value = film.rating;
    document.getElementById('editGenre').value = film.genre;
    document.getElementById('editContentType').value = film.contentType || "movie";
    document.getElementById('editDuration').value = film.duration;
    document.getElementById('editCountry').value = film.country;
    document.getElementById('editPartner').value = film.partner;
    document.getElementById('editPoster').value = film.img;
    document.getElementById('editDescription').value = film.description;
    document.getElementById('editDirector').value = film.director;
    document.getElementById('editActors').value = film.actors;
    document.getElementById('editTags').value = film.tags ? film.tags.join(', ') : '';
    document.getElementById('editSeasons').value = film.seasons || 1;
    
    document.getElementById('editOkkoLink').value = film.partnerLinks.okko || '';
    document.getElementById('editIviLink').value = film.partnerLinks.ivi || '';
    document.getElementById('editWinkLink').value = film.partnerLinks.wink || '';
    document.getElementById('editKionLink').value = film.partnerLinks.kion || '';
    document.getElementById('editPremierLink').value = film.partnerLinks.premier || '';
    document.getElementById('editKinopoiskLink').value = film.partnerLinks.kinopoisk || '';
    
    form.dataset.filmId = film.id;
    modal.style.display = 'flex';
}

function saveFilmChanges() {
    const form = document.getElementById('editMovieForm');
    const filmId = parseInt(form.dataset.filmId);
    
    const updatedData = {
        title: document.getElementById('editTitle').value,
        year: parseInt(document.getElementById('editYear').value),
        rating: parseFloat(document.getElementById('editRating').value),
        genre: document.getElementById('editGenre').value,
        contentType: document.getElementById('editContentType').value,
        duration: document.getElementById('editDuration').value,
        country: document.getElementById('editCountry').value,
        partner: document.getElementById('editPartner').value,
        img: document.getElementById('editPoster').value,
        description: document.getElementById('editDescription').value,
        director: document.getElementById('editDirector').value,
        actors: document.getElementById('editActors').value,
        seasons: parseInt(document.getElementById('editSeasons').value) || 1,
        tags: document.getElementById('editTags').value.split(',').map(tag => tag.trim()).filter(tag => tag),
        partnerLinks: {
            okko: document.getElementById('editOkkoLink').value,
            ivi: document.getElementById('editIviLink').value,
            wink: document.getElementById('editWinkLink').value,
            kion: document.getElementById('editKionLink').value,
            premier: document.getElementById('editPremierLink').value,
            kinopoisk: document.getElementById('editKinopoiskLink').value
        }
    };
    
    // Обновляем локально
    const filmIndex = window.filmManager.films.findIndex(film => film.id == filmId);
    if (filmIndex !== -1) {
        window.filmManager.films[filmIndex] = { ...window.filmManager.films[filmIndex], ...updatedData };
        localStorage.setItem('vzorkino_films_cache', JSON.stringify(window.filmManager.films));
        
        // Обновляем в Supabase
        window.filmManager.updateFilmInSupabase(filmId, updatedData).then(success => {
            if (success) {
                showAdminMessage('✅ Контент успешно обновлен в базе данных!');
            } else {
                showAdminMessage('⚠️ Контент обновлен локально, но произошла ошибка при синхронизации с базой', 'error');
            }
        });
        
        if (window.contentManager) {
            window.contentManager.refreshAllSections();
        }
        if (window.renderFilmsList) {
            window.renderFilmsList();
        }
        document.getElementById('editMovieModal').style.display = 'none';
    } else {
        showAdminMessage('❌ Ошибка при обновлении: фильм не найден', 'error');
    }
}

// Reviews Modal
function createReviewsModal() {
    const modal = document.createElement('div');
    modal.id = 'reviewsModal';
    modal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0,0,0,0.8);
        display: none;
        justify-content: center;
        align-items: center;
        z-index: 10012; /* Выше окна фильма (10001) */
        padding: 20px;
    `;
    
    modal.innerHTML = `
        <div style="background: var(--bg-modal); border-radius: 15px; padding: 30px; max-width: 600px; width: 100%; max-height: 80vh; overflow-y: auto; position: relative;">
            <button id="closeReviewsModal" style="position: absolute; top: 15px; right: 15px; background: none; border: none; color: var(--text-secondary); font-size: 24px; cursor: pointer;">×</button>
            <h3 style="margin: 0 0 20px 0; color: var(--text-primary); display: flex; align-items: center; gap: 10px;">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                </svg>
                Отзывы
            </h3>
            <div id="reviewsContent"></div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    document.getElementById('closeReviewsModal').addEventListener('click', function() {
        modal.style.display = 'none';
    });
    
    modal.addEventListener('click', function(e) {
        if (e.target === modal) {
            modal.style.display = 'none';
        }
    });
}

export function showReviewsModal(movie) {
    const modal = document.getElementById('reviewsModal');
    const content = document.getElementById('reviewsContent');
    
    const reviews = movie.reviews || [];
    
    content.innerHTML = `
        <h4 style="margin: 0 0 15px 0; color: var(--text-primary);">"${movie.title}"</h4>
        ${reviews.length === 0 ? `
            <p style="color: var(--text-secondary); text-align: center; padding: 40px;">Пока нет отзывов. Будьте первым!</p>
        ` : `
            <div style="max-height: 400px; overflow-y: auto; padding-right: 10px;">
                ${reviews.map((review, index) => `
                    <div style="padding: 15px; margin-bottom: 15px; background: var(--bg-secondary); border-radius: 12px; border-left: 4px solid var(--accent);">
                        <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 10px;">
                            <div style="display: flex; align-items: center; gap: 10px;">
                                <div style="color: gold; font-size: 16px;">${'⭐'.repeat(review.rating)}${'☆'.repeat(5-review.rating)}</div>
                                <strong style="color: var(--text-primary);">${review.author}</strong>
                            </div>
                            <small style="color: var(--text-secondary);">${new Date(review.date).toLocaleDateString('ru-RU')}</small>
                        </div>
                        <p style="margin: 0; color: var(--text-primary); line-height: 1.5; font-size: 14px;">${review.text}</p>
                    </div>
                `).join('')}
            </div>
        `}
    `;
    
    modal.style.display = 'flex';
}

export function showReviewsModalForCurrentMovie() {
    if (!window.filmManager.currentMovieId) return;
    
    const movie = window.filmManager.films.find(m => m.id == window.filmManager.currentMovieId);
    if (movie) {
        showReviewsModal(movie);
    }
}

// Filters Modal
function createFiltersModal() {
    const modal = document.createElement('div');
    modal.id = 'filtersModal';
    modal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0,0,0,0.8);
        display: none;
        justify-content: center;
        align-items: center;
        z-index: 10004;
        padding: 20px;
    `;
    
    const currentYear = new Date().getFullYear();
    const years = Array.from({length: currentYear - 1899}, (_, i) => currentYear - i);
    
    modal.innerHTML = `
        <div style="background: var(--bg-modal); border-radius: 15px; padding: 30px; max-width: 500px; width: 100%; position: relative;">
            <button id="closeFiltersModal" style="position: absolute; top: 15px; right: 15px; background: none; border: none; color: var(--text-secondary); font-size: 24px; cursor: pointer;">×</button>
            <h3 style="margin: 0 0 20px 0; color: var(--text-primary);">🎛️ Фильтры</h3>
            
            <div style="margin-bottom: 20px;">
                <label style="display: block; margin-bottom: 10px; color: var(--text-primary); font-weight: 600;">Тип контента</label>
                <select id="filtersContentType" style="width: 100%; padding: 12px; background: var(--bg-secondary); border: 1px solid var(--border); border-radius: 8px; color: white; font-size: 14px;">
                    <option value="all">Все типы</option>
                    <option value="movie">Фильмы</option>
                    <option value="series">Сериалы</option>
                    <option value="cartoon">Мультфильмы</option>
                </select>
            </div>
            
            <div style="margin-bottom: 20px;">
                <label style="display: block; margin-bottom: 10px; color: var(--text-primary); font-weight: 600;">Платформа</label>
                <select id="filtersPartner" style="width: 100%; padding: 12px; background: var(--bg-secondary); border: 1px solid var(--border); border-radius: 8px; color: white; font-size: 14px;">
                    <option value="all">Все платформы</option>
                    <option value="okko">OKKO</option>
                    <option value="ivi">IVI</option>
                    <option value="wink">Wink</option>
                    <option value="kion">KION</option>
                    <option value="premier">Премьер</option>
                    <option value="kinopoisk">КиноПоиск</option>
                </select>
            </div>
            
            <div style="margin-bottom: 20px;">
                <label style="display: block; margin-bottom: 10px; color: var(--text-primary); font-weight: 600;">Жанр</label>
                <select id="filtersGenre" style="width: 100%; padding: 12px; background: var(--bg-secondary); border: 1px solid var(--border); border-radius: 8px; color: white; font-size: 14px;">
                    <option value="all">Все жанры</option>
                    <option value="Боевик">Боевик</option>
                    <option value="Драма">Драма</option>
                    <option value="Комедия">Комедия</option>
                    <option value="Фантастика">Фантастика</option>
                    <option value="Триллер">Триллер</option>
                    <option value="Ужасы">Ужасы</option>
                    <option value="Мультфильм">Мультфильм</option>
                </select>
            </div>
            
            <div style="margin-bottom: 25px;">
                <label style="display: block; margin-bottom: 10px; color: var(--text-primary); font-weight: 600;">Год выпуска</label>
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
                    <div>
                        <label style="display: block; margin-bottom: 5px; color: var(--text-secondary); font-size: 12px;">От</label>
                        <input type="number" id="filtersYearFrom" placeholder="1900" min="1900" max="${currentYear}" style="padding: 12px; background: var(--bg-secondary); border: 1px solid var(--border); border-radius: 8px; color: white; width: 100%; box-sizing: border-box;">
                        <select id="filtersYearFromSelect" style="width: 100%; padding: 8px; margin-top: 5px; background: var(--bg-secondary); border: 1px solid var(--border); border-radius: 6px; color: white; font-size: 12px;">
                            <option value="">Выберите год</option>
                            ${years.map(year => `<option value="${year}">${year}</option>`).join('')}
                        </select>
                    </div>
                    <div>
                        <label style="display: block; margin-bottom: 5px; color: var(--text-secondary); font-size: 12px;">До</label>
                        <input type="number" id="filtersYearTo" placeholder="${currentYear}" min="1900" max="${currentYear}" style="padding: 12px; background: var(--bg-secondary); border: 1px solid var(--border); border-radius: 8px; color: white; width: 100%; box-sizing: border-box;">
                        <select id="filtersYearToSelect" style="width: 100%; padding: 8px; margin-top: 5px; background: var(--bg-secondary); border: 1px solid var(--border); border-radius: 6px; color: white; font-size: 12px;">
                            <option value="">Выберите год</option>
                            ${years.map(year => `<option value="${year}">${year}</option>`).join('')}
                        </select>
                    </div>
                </div>
            </div>
            
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
                <button id="resetFilters" style="padding: 12px; background: #666; color: white; border: none; border-radius: 8px; cursor: pointer; font-weight: 600;">Сбросить</button>
                <button id="applyFilters" style="padding: 12px; background: var(--accent); color: white; border: none; border-radius: 8px; cursor: pointer; font-weight: 600;">Применить</button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    document.getElementById('closeFiltersModal').addEventListener('click', function() {
        modal.style.display = 'none';
    });
    
    document.getElementById('resetFilters').addEventListener('click', function() {
        document.getElementById('filtersContentType').value = 'all';
        document.getElementById('filtersPartner').value = 'all';
        document.getElementById('filtersGenre').value = 'all';
        document.getElementById('filtersYearFrom').value = '';
        document.getElementById('filtersYearTo').value = '';
        document.getElementById('filtersYearFromSelect').value = '';
        document.getElementById('filtersYearToSelect').value = '';
    });
    
    document.getElementById('filtersYearFromSelect').addEventListener('change', function() {
        document.getElementById('filtersYearFrom').value = this.value;
    });
    
    document.getElementById('filtersYearToSelect').addEventListener('change', function() {
        document.getElementById('filtersYearTo').value = this.value;
    });
    
    document.getElementById('filtersYearFrom').addEventListener('input', function() {
        document.getElementById('filtersYearFromSelect').value = this.value;
    });
    
    document.getElementById('filtersYearTo').addEventListener('input', function() {
        document.getElementById('filtersYearToSelect').value = this.value;
    });
    
    document.getElementById('applyFilters').addEventListener('click', function() {
        window.currentContentType = document.getElementById('filtersContentType').value;
        window.currentPartnerFilter = document.getElementById('filtersPartner').value;
        window.currentGenreFilter = document.getElementById('filtersGenre').value;
        window.currentYearFrom = document.getElementById('filtersYearFrom').value;
        window.currentYearTo = document.getElementById('filtersYearTo').value;
        
        if (window.contentManager) {
            window.contentManager.refreshAllSections();
        }
        modal.style.display = 'none';
        updateActiveFiltersDisplay();
    });
    
    modal.addEventListener('click', function(e) {
        if (e.target === modal) {
            modal.style.display = 'none';
        }
    });
}

export function showFiltersModal() {
    const modal = document.getElementById('filtersModal');
    
    document.getElementById('filtersContentType').value = window.currentContentType;
    document.getElementById('filtersPartner').value = window.currentPartnerFilter;
    document.getElementById('filtersGenre').value = window.currentGenreFilter;
    document.getElementById('filtersYearFrom').value = window.currentYearFrom;
    document.getElementById('filtersYearTo').value = window.currentYearTo;
    document.getElementById('filtersYearFromSelect').value = window.currentYearFrom;
    document.getElementById('filtersYearToSelect').value = window.currentYearTo;
    
    if (!modal) {
        createFiltersModal();
    } else {
        modal.style.display = 'flex';
    }
}

function updateActiveFiltersDisplay() {
    const activeFiltersContainer = document.getElementById('activeFilters');
    if (!activeFiltersContainer) return;
    
    activeFiltersContainer.innerHTML = '';
    
    const activeFilters = [];
    
    if (window.currentContentType !== 'all') {
        const contentType = CONTENT_TYPES[window.currentContentType] || {name: window.currentContentType, color: '#8B5CF6'};
        activeFilters.push(`
            <div class="active-filter-tag" style="background: ${contentType.color}; color: white; padding: 6px 12px; border-radius: 20px; font-size: 12px; font-weight: 600; display: flex; align-items: center; gap: 6px;">
                ${contentType.name}
                <button onclick="removeFilter('contentType')" style="background: none; border: none; color: white; cursor: pointer; font-size: 14px; padding: 0; margin-left: 4px;">×</button>
            </div>
        `);
    }
    
    if (window.currentPartnerFilter !== 'all') {
        const partnerName = window.PARTNERS[window.currentPartnerFilter]?.name || window.currentPartnerFilter;
        const partnerColor = window.PARTNERS[window.currentPartnerFilter]?.badgeColor || '#8B5CF6';
        activeFilters.push(`
            <div class="active-filter-tag" style="background: ${partnerColor}; color: white; padding: 6px 12px; border-radius: 20px; font-size: 12px; font-weight: 600; display: flex; align-items: center; gap: 6px;">
                ${partnerName}
                <button onclick="removeFilter('partner')" style="background: none; border: none; color: white; cursor: pointer; font-size: 14px; padding: 0; margin-left: 4px;">×</button>
            </div>
        `);
    }
    
    if (window.currentGenreFilter !== 'all') {
        activeFilters.push(`
            <div class="active-filter-tag" style="background: #8B5CF6; color: white; padding: 6px 12px; border-radius: 20px; font-size: 12px; font-weight: 600; display: flex; align-items: center; gap: 6px;">
                ${window.currentGenreFilter}
                <button onclick="removeFilter('genre')" style="background: none; border: none; color: white; cursor: pointer; font-size: 14px; padding: 0; margin-left: 4px;">×</button>
            </div>
        `);
    }
    
    if (window.currentYearFrom || window.currentYearTo) {
        let yearText = '';
        if (window.currentYearFrom && window.currentYearTo) {
            yearText = `${window.currentYearFrom}-${window.currentYearTo}`;
        } else if (window.currentYearFrom) {
            yearText = `от ${window.currentYearFrom}`;
        } else if (window.currentYearTo) {
            yearText = `до ${window.currentYearTo}`;
        }
        
        activeFilters.push(`
            <div class="active-filter-tag" style="background: #10B981; color: white; padding: 6px 12px; border-radius: 20px; font-size: 12px; font-weight: 600; display: flex; align-items: center; gap: 6px;">
                ${yearText}
                <button onclick="removeFilter('year')" style="background: none; border: none; color: white; cursor: pointer; font-size: 14px; padding: 0; margin-left: 4px;">×</button>
            </div>
        `);
    }
    
    activeFiltersContainer.innerHTML = activeFilters.join('');
}

export function removeFilter(filterType) {
    switch (filterType) {
        case 'contentType':
            window.currentContentType = 'all';
            break;
        case 'partner':
            window.currentPartnerFilter = 'all';
            break;
        case 'genre':
            window.currentGenreFilter = 'all';
            break;
        case 'year':
            window.currentYearFrom = '';
            window.currentYearTo = '';
            break;
    }
    
    if (window.contentManager) {
        window.contentManager.refreshAllSections();
    }
    updateActiveFiltersDisplay();
}

// Content Filters Modal
function createContentFiltersModal() {
    const modal = document.createElement('div');
    modal.id = 'contentFiltersModal';
    modal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0,0,0,0.8);
        display: none;
        justify-content: center;
        align-items: center;
        z-index: 10004;
        padding: 20px;
    `;
    
    const currentYear = new Date().getFullYear();
    const years = Array.from({length: currentYear - 1899}, (_, i) => currentYear - i);
    
    modal.innerHTML = `
        <div style="background: var(--bg-modal); border-radius: 15px; padding: 30px; max-width: 500px; width: 100%; position: relative;">
            <button id="closeContentFiltersModal" style="position: absolute; top: 15px; right: 15px; background: none; border: none; color: var(--text-secondary); font-size: 24px; cursor: pointer;">×</button>
            <h3 style="margin: 0 0 20px 0; color: var(--text-primary);">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="display: inline-block; vertical-align: middle; margin-right: 8px;">
                    <path d="M22 3H2l8 9.46V19l4 2v-8.54L22 3z"/>
                </svg>
                Фильтры
            </h3>
            
            <div style="margin-bottom: 20px;">
                <label style="display: block; margin-bottom: 10px; color: var(--text-primary); font-weight: 600;">Платформа</label>
                <select id="contentFiltersPartner" style="width: 100%; padding: 12px; background: var(--bg-secondary); border: 1px solid var(--border); border-radius: 8px; color: white; font-size: 14px;">
                    <option value="all">Все платформы</option>
                    <option value="okko">OKKO</option>
                    <option value="ivi">IVI</option>
                    <option value="wink">Wink</option>
                    <option value="kion">KION</option>
                    <option value="premier">Премьер</option>
                    <option value="kinopoisk">КиноПоиск</option>
                </select>
            </div>
            
            <div style="margin-bottom: 20px;">
                <label style="display: block; margin-bottom: 10px; color: var(--text-primary); font-weight: 600;">Жанр</label>
                <select id="contentFiltersGenre" style="width: 100%; padding: 12px; background: var(--bg-secondary); border: 1px solid var(--border); border-radius: 8px; color: white; font-size: 14px;">
                    <option value="all">Все жанры</option>
                    <option value="Боевик">Боевик</option>
                    <option value="Драма">Драма</option>
                    <option value="Комедия">Комедия</option>
                    <option value="Фантастика">Фантастика</option>
                    <option value="Триллер">Триллер</option>
                    <option value="Ужасы">Ужасы</option>
                    <option value="Мультфильм">Мультфильм</option>
                    <option value="Сериал">Сериал</option>
                </select>
            </div>
            
            <div style="margin-bottom: 25px;">
                <label style="display: block; margin-bottom: 10px; color: var(--text-primary); font-weight: 600;">Год выпуска</label>
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
                    <div>
                        <label style="display: block; margin-bottom: 5px; color: var(--text-secondary); font-size: 12px;">От</label>
                        <input type="number" id="contentFiltersYearFrom" placeholder="1900" min="1900" max="${currentYear}" style="padding: 12px; background: var(--bg-secondary); border: 1px solid var(--border); border-radius: 8px; color: white; width: 100%; box-sizing: border-box;">
                        <select id="contentFiltersYearFromSelect" style="width: 100%; padding: 8px; margin-top: 5px; background: var(--bg-secondary); border: 1px solid var(--border); border-radius: 6px; color: white; font-size: 12px;">
                            <option value="">Выберите год</option>
                            ${years.map(year => `<option value="${year}">${year}</option>`).join('')}
                        </select>
                    </div>
                    <div>
                        <label style="display: block; margin-bottom: 5px; color: var(--text-secondary); font-size: 12px;">До</label>
                        <input type="number" id="contentFiltersYearTo" placeholder="${currentYear}" min="1900" max="${currentYear}" style="padding: 12px; background: var(--bg-secondary); border: 1px solid var(--border); border-radius: 8px; color: white; width: 100%; box-sizing: border-box;">
                        <select id="contentFiltersYearToSelect" style="width: 100%; padding: 8px; margin-top: 5px; background: var(--bg-secondary); border: 1px solid var(--border); border-radius: 6px; color: white; font-size: 12px;">
                            <option value="">Выберите год</option>
                            ${years.map(year => `<option value="${year}">${year}</option>`).join('')}
                        </select>
                    </div>
                </div>
            </div>
            
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
                <button id="resetContentFilters" style="padding: 12px; background: #666; color: white; border: none; border-radius: 8px; cursor: pointer; font-weight: 600;">Сбросить</button>
                <button id="applyContentFilters" style="padding: 12px; background: var(--accent); color: white; border: none; border-radius: 8px; cursor: pointer; font-weight: 600;">Применить</button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    document.getElementById('closeContentFiltersModal').addEventListener('click', function() {
        modal.style.display = 'none';
    });
    
    document.getElementById('resetContentFilters').addEventListener('click', function() {
        document.getElementById('contentFiltersPartner').value = 'all';
        document.getElementById('contentFiltersGenre').value = 'all';
        document.getElementById('contentFiltersYearFrom').value = '';
        document.getElementById('contentFiltersYearTo').value = '';
        document.getElementById('contentFiltersYearFromSelect').value = '';
        document.getElementById('contentFiltersYearToSelect').value = '';
    });
    
    document.getElementById('contentFiltersYearFromSelect').addEventListener('change', function() {
        document.getElementById('contentFiltersYearFrom').value = this.value;
    });
    
    document.getElementById('contentFiltersYearToSelect').addEventListener('change', function() {
        document.getElementById('contentFiltersYearTo').value = this.value;
    });
    
    document.getElementById('contentFiltersYearFrom').addEventListener('input', function() {
        document.getElementById('contentFiltersYearFromSelect').value = this.value;
    });
    
    document.getElementById('contentFiltersYearTo').addEventListener('input', function() {
        document.getElementById('contentFiltersYearToSelect').value = this.value;
    });
    
    document.getElementById('applyContentFilters').addEventListener('click', function() {
        window.currentContentPartnerFilter = document.getElementById('contentFiltersPartner').value;
        window.currentContentGenreFilter = document.getElementById('contentFiltersGenre').value;
        window.currentContentYearFrom = document.getElementById('contentFiltersYearFrom').value;
        window.currentContentYearTo = document.getElementById('contentFiltersYearTo').value;
        
        if (window.contentManager && window.contentManager.currentPage !== 'all') {
            window.contentManager.renderContentPage(window.contentManager.currentPage);
        }
        
        modal.style.display = 'none';
        updateContentActiveFilters();
    });
    
    modal.addEventListener('click', function(e) {
        if (e.target === modal) {
            modal.style.display = 'none';
        }
    });
}

export function showContentFiltersModal() {
    const modal = document.getElementById('contentFiltersModal');
    
    document.getElementById('contentFiltersPartner').value = window.currentContentPartnerFilter;
    document.getElementById('contentFiltersGenre').value = window.currentContentGenreFilter;
    document.getElementById('contentFiltersYearFrom').value = window.currentContentYearFrom;
    document.getElementById('contentFiltersYearTo').value = window.currentContentYearTo;
    document.getElementById('contentFiltersYearFromSelect').value = window.currentContentYearFrom;
    document.getElementById('contentFiltersYearToSelect').value = window.currentContentYearTo;
    
    if (!modal) {
        createContentFiltersModal();
    } else {
        modal.style.display = 'flex';
    }
}

function updateContentActiveFilters() {
    const container = document.getElementById('content-active-filters');
    if (!container) return;
    
    container.innerHTML = '';
    
    const activeFilters = [];
    
    if (window.currentContentPartnerFilter !== 'all') {
        const partnerName = window.PARTNERS[window.currentContentPartnerFilter]?.name || window.currentContentPartnerFilter;
        const partnerColor = window.PARTNERS[window.currentContentPartnerFilter]?.badgeColor || '#8B5CF6';
        activeFilters.push(`
            <div class="active-filter-tag" style="background: ${partnerColor}; color: white; padding: 6px 12px; border-radius: 20px; font-size: 12px; font-weight: 600; display: flex; align-items: center; gap: 6px;">
                ${partnerName}
                <button onclick="removeContentFilter('partner')" style="background: none; border: none; color: white; cursor: pointer; font-size: 14px; padding: 0; margin-left: 4px;">×</button>
            </div>
        `);
    }
    
    if (window.currentContentGenreFilter !== 'all') {
        activeFilters.push(`
            <div class="active-filter-tag" style="background: #8B5CF6; color: white; padding: 6px 12px; border-radius: 20px; font-size: 12px; font-weight: 600; display: flex; align-items: center; gap: 6px;">
                ${window.currentContentGenreFilter}
                <button onclick="removeContentFilter('genre')" style="background: none; border: none; color: white; cursor: pointer; font-size: 14px; padding: 0; margin-left: 4px;">×</button>
            </div>
        `);
    }
    
    if (window.currentContentYearFrom || window.currentContentYearTo) {
        let yearText = '';
        if (window.currentContentYearFrom && window.currentContentYearTo) {
            yearText = `${window.currentContentYearFrom}-${window.currentContentYearTo}`;
        } else if (window.currentContentYearFrom) {
            yearText = `от ${window.currentContentYearFrom}`;
        } else if (window.currentContentYearTo) {
            yearText = `до ${window.currentContentYearTo}`;
        }
        
        activeFilters.push(`
            <div class="active-filter-tag" style="background: #10B981; color: white; padding: 6px 12px; border-radius: 20px; font-size: 12px; font-weight: 600; display: flex; align-items: center; gap: 6px;">
                ${yearText}
                <button onclick="removeContentFilter('year')" style="background: none; border: none; color: white; cursor: pointer; font-size: 14px; padding: 0; margin-left: 4px;">×</button>
            </div>
        `);
    }
    
    container.innerHTML = activeFilters.join('');
}

export function removeContentFilter(filterType) {
    switch (filterType) {
        case 'partner':
            window.currentContentPartnerFilter = 'all';
            break;
        case 'genre':
            window.currentContentGenreFilter = 'all';
            break;
        case 'year':
            window.currentContentYearFrom = '';
            window.currentContentYearTo = '';
            break;
    }
    
    if (window.contentManager && window.contentManager.currentPage !== 'all') {
        window.contentManager.renderContentPage(window.contentManager.currentPage);
    }
    
    updateContentActiveFilters();
}

// Helper function
function hasPartnerLink(movie, partner) {
    return movie.partnerLinks && movie.partnerLinks[partner] && movie.partnerLinks[partner].trim() !== '';
}

// Добавьте эту функцию в конец файла modals.js
export function showCustomRowModal(rowId, rowName) {
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
            background: rgba(0,0,0,0.95);
            display: none;
            justify-content: center;
            align-items: center;
            z-index: 10009; /* Выше обычных модальных окон */
            padding: 20px;
        `;
        
        modal.innerHTML = `
            <div style="background: var(--bg-modal); border-radius: 20px; padding: 40px; max-width: 1400px; width: 100%; max-height: 95vh; overflow-y: auto; position: relative; box-shadow: 0 25px 80px rgba(0,0,0,0.9); border: 1px solid rgba(255,255,255,0.1); backdrop-filter: blur(20px);">
                <button class="close-custom-modal" style="position: absolute; top: 25px; right: 25px; background: rgba(255,255,255,0.1); border: 1px solid rgba(255,255,255,0.2); color: var(--text-secondary); font-size: 28px; cursor: pointer; width: 45px; height: 45px; display: flex; align-items: center; justify-content: center; border-radius: 50%; transition: all 0.3s ease;">×</button>
                <h2 style="margin: 0 0 30px 0; color: var(--text-primary); text-align: center; font-size: 32px; font-weight: 700;">${rowName || row.name}</h2>
                <div class="custom-modal-content" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(215px, 1fr)); gap: 25px; padding: 15px;"></div>
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
        const card = window.contentManager.createCustomRowMovieCard(movie);
        content.appendChild(card);
    });
    
    modal.style.display = 'flex';
}