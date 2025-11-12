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
        const newReleasesContainer = document.getElementById('new-releases');
        if (newReleasesContainer) {
            newReleasesContainer.innerHTML = '';
            
            if (results.length === 0) {
                newReleasesContainer.innerHTML = '<p class="no-content">По вашему запросу ничего не найдено</p>';
            } else {
                results.forEach(movie => {
                    const card = window.contentManager.createMovieCard(movie);
                    newReleasesContainer.appendChild(card);
                });
            }
        }
        
        // Скрываем другие секции при поиске
        document.querySelectorAll('.top-section, .partners-section, .info-section').forEach(section => {
            section.style.display = 'none';
        });
        
        // Показываем заголовок результатов поиска
        const searchTitle = document.createElement('h2');
        searchTitle.textContent = `Результаты поиска: "${query}"`;
        searchTitle.style.marginBottom = '20px';
        searchTitle.style.color = 'var(--text-primary)';
        
        const newReleasesSection = document.querySelector('.new-releases-section');
        if (newReleasesSection) {
            const existingTitle = newReleasesSection.querySelector('h2');
            if (existingTitle) {
                existingTitle.textContent = `Результаты поиска: "${query}" (${results.length})`;
            }
        }
    } else {
        const contentNewReleases = document.getElementById('content-new-releases');
        if (contentNewReleases) {
            const filteredResults = results.filter(movie => movie.contentType === window.contentManager.currentPage);
            contentNewReleases.innerHTML = '';
            
            if (filteredResults.length === 0) {
                contentNewReleases.innerHTML = '<p class="no-content">По вашему запросу ничего не найдено</p>';
            } else {
                filteredResults.forEach(movie => {
                    const card = window.contentManager.createMovieCard(movie);
                    contentNewReleases.appendChild(card);
                });
            }
            
            // Обновляем заголовок
            const contentTitle = document.querySelector('.content-new-releases h3');
            if (contentTitle) {
                contentTitle.textContent = `Результаты поиска: "${query}" (${filteredResults.length})`;
            }
        }
        
        // Скрываем топ контент при поиске
        const topContentSection = document.querySelector('.top-section');
        if (topContentSection) {
            topContentSection.style.display = 'none';
        }
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