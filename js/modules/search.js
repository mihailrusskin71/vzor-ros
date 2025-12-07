// modules/search.js
// ===== SEARCH FUNCTIONALITY =====
export function initSearch() {
    setupSearchHandlers();
    setupContentFilters();
}

function setupSearchHandlers() {
    const searchBtn = document.getElementById('searchBtn');
    const searchInput = document.getElementById('search');
    
    if (searchBtn) {
        searchBtn.addEventListener('click', performSearch);
    }
    
    if (searchInput) {
        searchInput.addEventListener('keypress', e => {
            if (e.key === 'Enter') performSearch();
        });
        
        // Добавляем обработчик input для live search
        searchInput.addEventListener('input', debounce(() => {
            if (searchInput.value.trim().length >= 2) {
                performSearch();
            } else if (searchInput.value.trim() === '') {
                // Если поле поиска очищено, показываем обычный контент
                if (window.contentManager.currentPage === 'all') {
                    window.contentManager.renderAllSections();
                } else {
                    window.contentManager.renderContentPage(window.contentManager.currentPage);
                }
            }
        }, 300));
    }
}

function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

export function performSearch() {
    const searchInput = document.getElementById('search');
    const query = searchInput.value.toLowerCase().trim();
    
    if (!query) {
        if (window.contentManager.currentPage === 'all') {
            window.contentManager.renderAllSections();
        } else {
            window.contentManager.renderContentPage(window.contentManager.currentPage);
        }
        return;
    }
    
    const results = window.filmManager.films.filter(m => 
        m.title.toLowerCase().includes(query) ||
        m.genre.toLowerCase().includes(query) ||
        m.director.toLowerCase().includes(query) ||
        m.actors.toLowerCase().includes(query) ||
        (m.tags && m.tags.some(tag => tag.toLowerCase().includes(query)))
    );
    
    if (window.contentManager.currentPage === 'all') {
        // Создаем контейнер для результатов поиска
        let resultsContainer = document.getElementById('search-results-container');
        
        if (!resultsContainer) {
            resultsContainer = document.createElement('div');
            resultsContainer.id = 'search-results-container';
            resultsContainer.className = 'search-results-section';
            
            const homePage = document.getElementById('home-page');
            if (homePage) {
                homePage.insertBefore(resultsContainer, homePage.firstChild);
            }
        }
        
        resultsContainer.innerHTML = '';
        
        if (results.length === 0) {
            resultsContainer.innerHTML = `
                <h2 style="color: var(--text-primary); margin-bottom: 20px;">Результаты поиска: "${query}" (0)</h2>
                <p class="no-content">По вашему запросу ничего не найдено</p>
            `;
        } else {
            resultsContainer.innerHTML = `
                <h2 style="color: var(--text-primary); margin-bottom: 20px;">Результаты поиска: "${query}" (${results.length})</h2>
                <div class="catalog-grid" id="search-results-grid"></div>
            `;
            
            const grid = document.getElementById('search-results-grid');
            results.forEach(movie => {
                const card = window.contentManager.createMovieCard(movie);
                grid.appendChild(card);
            });
        }
        
        // Скрываем другие секции при поиске
        document.querySelectorAll('.custom-row-section, .partners-section, .info-section').forEach(section => {
            section.style.display = 'none';
        });
        
        // Показываем контейнер результатов
        resultsContainer.style.display = 'block';
        
    } else {
        // Создаем контейнер для результатов поиска на странице контента
        let resultsContainer = document.getElementById('search-results-container');
        
        if (!resultsContainer) {
            resultsContainer = document.createElement('div');
            resultsContainer.id = 'search-results-container';
            resultsContainer.className = 'search-results-section';
            
            const contentPages = document.getElementById('content-pages');
            if (contentPages) {
                const contentHeader = contentPages.querySelector('.content-header');
                if (contentHeader) {
                    contentHeader.parentNode.insertBefore(resultsContainer, contentHeader.nextSibling);
                } else {
                    contentPages.insertBefore(resultsContainer, contentPages.firstChild);
                }
            }
        }
        
        const filteredResults = results.filter(movie => movie.contentType === window.contentManager.currentPage);
        resultsContainer.innerHTML = '';
        
        if (filteredResults.length === 0) {
            resultsContainer.innerHTML = `
                <h3 style="color: var(--text-primary); margin-bottom: 20px;">Результаты поиска: "${query}" (0)</h3>
                <p class="no-content">По вашему запросу ничего не найдено</p>
            `;
        } else {
            resultsContainer.innerHTML = `
                <h3 style="color: var(--text-primary); margin-bottom: 20px;">Результаты поиска: "${query}" (${filteredResults.length})</h3>
                <div class="catalog-grid" id="search-results-grid"></div>
            `;
            
            const grid = document.getElementById('search-results-grid');
            filteredResults.forEach(movie => {
                const card = window.contentManager.createMovieCard(movie);
                grid.appendChild(card);
            });
        }
        
        // Скрываем кастомные ряды при поиске
        document.querySelectorAll('.custom-row-section').forEach(section => {
            section.style.display = 'none';
        });
        
        // Показываем контейнер результатов
        resultsContainer.style.display = 'block';
    }
}

// Функция очистки результатов поиска
export function clearSearchResults() {
    const resultsContainer = document.getElementById('search-results-container');
    if (resultsContainer) {
        resultsContainer.style.display = 'none';
    }
    
    // Показываем все секции
    document.querySelectorAll('.custom-row-section, .partners-section, .info-section').forEach(section => {
        section.style.display = 'block';
    });
    
    // Очищаем поле поиска
    const searchInput = document.getElementById('search');
    if (searchInput) {
        searchInput.value = '';
    }
}

function setupContentFilters() {
    const contentFiltersBtn = document.getElementById('content-filters-btn');
    if (contentFiltersBtn) {
        contentFiltersBtn.addEventListener('click', () => {
            if (window.showContentFiltersModal) {
                window.showContentFiltersModal();
            }
        });
    }
}