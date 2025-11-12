// modules/admin.js
// ===== ADMIN PANEL =====
import { showAdminMessage } from './utils.js';

export function initAdmin() {
    createAdminPanel();
    setupAdminFunctions();
}

function createAdminPanel() {
    const panel = document.createElement('div');
    panel.id = 'adminPanel';
    panel.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: var(--bg-modal);
        padding: 30px;
        border-radius: 15px;
        z-index: 10000;
        box-shadow: 0 20px 60px rgba(0,0,0,0.8);
        width: 900px;
        height: 600px;
        display: none;
        border: 2px solid var(--accent);
        overflow: hidden;
        resize: both;
        cursor: default;
        min-width: 500px;
        min-height: 400px;
        max-width: 95vw;
        max-height: 90vh;
    `;
    
    panel.innerHTML = `
        <div class="admin-header" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; padding: 10px; background: var(--bg-secondary); border-radius: 10px; cursor: move;">
            <h3 style="margin: 0; color: var(--text-primary);">🎬 Панель управления</h3>
            <div style="display: flex; gap: 8px;">
                <button id="maximizeAdmin" style="background: none; border: none; color: var(--text-secondary); font-size: 16px; cursor: pointer; padding: 4px 8px; border-radius: 4px; transition: all 0.3s;" title="Развернуть">□</button>
                <button id="closeAdmin" style="background: none; border: none; color: var(--text-secondary); font-size: 18px; cursor: pointer; padding: 4px 8px; border-radius: 4px; transition: all 0.3s;" title="Закрыть">×</button>
            </div>
        </div>
        
        <div id="passwordSection" style="margin-bottom: 20px;">
            <h4 style="margin: 0 0 15px 0; color: var(--text-primary);">🔒 Введите пароль</h4>
            <input type="password" id="adminPassword" placeholder="Пароль доступа" style="width: 100%; padding: 12px; margin-bottom: 15px; background: var(--bg-secondary); border: 1px solid var(--border); border-radius: 8px; color: white; font-size: 14px;">
            <button id="loginAdmin" style="width: 100%; padding: 12px; background: var(--accent); color: white; border: none; border-radius: 8px; cursor: pointer; font-weight: 600;">Войти</button>
        </div>
        
        <div id="adminContent" style="display: none; height: calc(100% - 120px); overflow-y: auto; padding-right: 5px;">
            <div style="margin-bottom: 25px; padding: 15px; background: var(--bg-secondary); border-radius: 10px;">
                <h4 style="margin: 0 0 10px 0; color: var(--text-primary);">📊 Статистика</h4>
                <div id="statsInfo" style="color: var(--text-secondary); font-size: 14px;">Загрузка...</div>
            </div>
            
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 25px; margin-bottom: 25px;">
                <div>
                    <h4 style="margin: 0 0 15px 0; color: var(--text-primary);">🤖 Автоматическое добавление</h4>
                    <input type="text" id="autoFilmTitle" placeholder="Название фильма/сериала (рус/англ)" style="width: 100%; padding: 12px; margin-bottom: 10px; background: var(--bg-secondary); border: 1px solid var(--border); border-radius: 8px; color: white; font-size: 14px;">
                    <input type="number" id="autoFilmYear" placeholder="Год (необязательно)" style="width: 100%; padding: 12px; margin-bottom: 10px; background: var(--bg-secondary); border: 1px solid var(--border); border-radius: 8px; color: white; font-size: 14px;">
                    <select id="autoContentType" style="width: 100%; padding: 12px; margin-bottom: 15px; background: var(--bg-secondary); border: 1px solid var(--border); border-radius: 8px; color: white; font-size: 14px;">
                        <option value="movie">Фильм</option>
                        <option value="series">Сериал</option>
                        <option value="cartoon">Мультфильм</option>
                    </select>
                    <button id="autoAddBtn" style="width: 100%; padding: 12px; background: var(--accent); color: white; border: none; border-radius: 8px; cursor: pointer; font-weight: 600;">🎯 Добавить контент</button>
                </div>
                
                <div>
                    <h4 style="margin: 0 0 15px 0; color: var(--text-primary);">📝 Массовое добавление</h4>
                    <textarea id="bulkFilms" placeholder="Формат:
    Интерстеллар (2014) [movie]
    Игра престолов (2011) [series]
    Король Лев (1994) [cartoon]" style="width: 100%; height: 120px; padding: 12px; margin-bottom: 15px; background: var(--bg-secondary); border: 1px solid var(--border); border-radius: 8px; color: white; resize: vertical; font-size: 14px;"></textarea>
                    <button id="bulkAddBtn" style="width: 100%; padding: 12px; background: #8B5CF6; color: white; border: none; border-radius: 8px; cursor: pointer; font-weight: 600;">🚀 Добавить список</button>
                </div>
            </div>
            
            <div style="margin-bottom: 25px;">
                <h4 style="margin: 0 0 15px 0; color: var(--text-primary);">✍️ Ручное управление</h4>
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 15px;">
                    <button id="manualAddBtn" style="padding: 12px; background: #666; color: white; border: none; border-radius: 8px; cursor: pointer; font-weight: 600;">📝 Ручной ввод</button>
                    <button id="exportBtn" style="padding: 12px; background: #10B981; color: white; border: none; border-radius: 8px; cursor: pointer; font-weight: 600;">💾 Экспорт базы</button>
                </div>
                <input type="file" id="importFile" accept=".json" style="display: none;">
            </div>
            
            <div style="margin-bottom: 25px;">
                <h4 style="margin: 0 0 15px 0; color: var(--text-primary);">🗑️ Управление контентом (${window.filmManager.films.length})</h4>
                <div id="filmsList" style="max-height: 300px; overflow-y: auto; background: var(--bg-secondary); border-radius: 8px; padding: 15px;">
                    <!-- Список фильмов будет здесь -->
                </div>
            </div>
        </div>
        
        <div id="adminMessage" style="margin-top: 20px; padding: 12px; border-radius: 8px; display: none; font-size: 14px; text-align: center;"></div>
        
        <!-- Элемент для изменения размера -->
        <div class="resize-handle" style="position: absolute; bottom: 2px; right: 2px; width: 15px; height: 15px; cursor: se-resize; background: linear-gradient(135deg, transparent 50%, rgba(255, 106, 43, 0.3) 50%); border-radius: 2px;"></div>
    `;
    
    document.body.appendChild(panel);
    makeElementDraggable(panel);
    makeElementResizable(panel);
    setupWindowControls(panel);
}

function setupAdminFunctions() {
    const ADMIN_PASSWORD = "dfd123";
    
    document.getElementById('loginAdmin').addEventListener('click', () => {
        const password = document.getElementById('adminPassword').value;
        
        if (password === ADMIN_PASSWORD) {
            document.getElementById('passwordSection').style.display = 'none';
            document.getElementById('adminContent').style.display = 'block';
            updateStats();
            renderFilmsList();
            showAdminMessage('✅ Успешный вход в админку');
        } else {
            showAdminMessage('❌ Неверный пароль', 'error');
            document.getElementById('adminPassword').value = '';
        }
    });
    
    document.getElementById('adminPassword').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            document.getElementById('loginAdmin').click();
        }
    });
    
    document.getElementById('autoAddBtn').addEventListener('click', async () => {
        const title = document.getElementById('autoFilmTitle').value.trim();
        const year = document.getElementById('autoFilmYear').value || null;
        const contentType = document.getElementById('autoContentType').value;
        
        if (!title) {
            showAdminMessage('Введите название', 'error');
            return;
        }
        
        const result = await window.filmManager.autoAddFilm(title, year, contentType);
        if (result) {
            window.contentManager.refreshAllSections();
            updateStats();
            renderFilmsList();
            document.getElementById('autoFilmTitle').value = '';
            document.getElementById('autoFilmYear').value = '';
        }
    });
    
    document.getElementById('bulkAddBtn').addEventListener('click', async () => {
        const text = document.getElementById('bulkFilms').value.trim();
        if (!text) {
            showAdminMessage('Введите список', 'error');
            return;
        }
        
        const films = text.split('\n')
            .filter(line => line.trim())
            .map(line => {
                const match = line.match(/(.+?)\s*\((\d{4})\)\s*\[(\w+)\]/);
                if (match) {
                    return { 
                        title: match[1].trim(), 
                        year: match[2],
                        contentType: match[3] 
                    };
                } else {
                    const oldMatch = line.match(/(.+?)\s*\((\d{4})\)/);
                    return oldMatch ? { 
                        title: oldMatch[1].trim(), 
                        year: oldMatch[2],
                        contentType: "movie" 
                    } : { title: line.trim(), contentType: "movie" };
                }
            });
        
        if (films.length === 0) {
            showAdminMessage('Нет контента для добавления', 'error');
            return;
        }
        
        showAdminMessage(`⏳ Добавляю ${films.length} позиций...`, 'info');
        
        const results = await window.filmManager.bulkAddFilms(films);
        const successCount = results.filter(r => r !== null).length;
        
        showAdminMessage(`✅ Добавлено ${successCount} из ${films.length} позиций`);
        window.contentManager.refreshAllSections();
        updateStats();
        renderFilmsList();
        document.getElementById('bulkFilms').value = '';
    });
    
    document.getElementById('manualAddBtn').addEventListener('click', () => {
        const title = prompt('Название:');
        if (!title) return;
        
        const contentType = prompt('Тип контента (movie, series, cartoon):', 'movie') || 'movie';
        const genre = prompt('Жанр:', 'Драма');
        const rating = parseFloat(prompt('Рейтинг:', '7.5')) || 7.5;
        const partner = prompt('Партнер (okko, ivi, wink, kion, premier, kinopoisk):', 'okko') || 'okko';
        const tags = prompt('Теги (через запятую):', '') || '';
        const seasons = contentType === 'series' ? parseInt(prompt('Количество сезонов:', '1')) || 1 : 1;
        
        const film = {
            ...window.filmManager.getTemplate(),
            id: Date.now(),
            title: title,
            year: parseInt(prompt('Год:') || new Date().getFullYear()),
            rating: rating,
            genre: genre,
            partner: partner,
            contentType: contentType,
            seasons: seasons,
            duration: prompt('Длительность:') || '120 мин',
            country: prompt('Страна:') || 'США',
            img: prompt('Ссылка на постер:') || window.filmManager.generatePlaceholder(title),
            description: prompt('Описание:') || `"${title}"`,
            director: prompt('Режиссер:') || 'Режиссер',
            actors: prompt('Актеры:') || 'Актеры',
            tags: tags.split(',').map(tag => tag.trim()).filter(tag => tag),
            partnerLinks: {
                okko: `https://okko.tv/search/${encodeURIComponent(title)}`,
                ivi: `https://www.ivi.ru/search/?q=${encodeURIComponent(title)}`,
                wink: `https://wink.ru/search?query=${encodeURIComponent(title)}`,
                kion: `https://kion.ru/search?query=${encodeURIComponent(title)}`,
                premier: `https://premier.one/search?q=${encodeURIComponent(title)}`,
                kinopoisk: `https://www.kinopoisk.ru/index.php?kp_query=${encodeURIComponent(title)}`
            }
        };
        
        window.filmManager.films.unshift(film);
        window.filmManager.saveFilms();
        window.contentManager.refreshAllSections();
        updateStats();
        renderFilmsList();
        showAdminMessage(`✅ "${title}" добавлен вручную`);
    });
    
    document.getElementById('exportBtn').addEventListener('click', () => {
        const dataStr = JSON.stringify(window.filmManager.films, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        
        const link = document.createElement('a');
        link.href = URL.createObjectURL(dataBlob);
        link.download = `vzorkino_content_${new Date().toISOString().split('T')[0]}.json`;
        link.click();
        
        showAdminMessage('💾 База контента экспортирована');
    });
}

function updateStats() {
    const statsEl = document.getElementById('statsInfo');
    if (statsEl) {
        const totalFilms = window.filmManager.films.length;
        const withPosters = window.filmManager.films.filter(f => !f.img.includes('placeholder')).length;
        const totalReviews = window.filmManager.films.reduce((sum, film) => sum + (film.reviews ? film.reviews.length : 0), 0);
        const totalRatings = window.filmManager.films.reduce((sum, film) => sum + (film.userRatings ? film.userRatings.length : 0), 0);
        
        const partnerStats = {};
        const contentStats = {};
        window.filmManager.films.forEach(film => {
            partnerStats[film.partner] = (partnerStats[film.partner] || 0) + 1;
            contentStats[film.contentType] = (contentStats[film.contentType] || 0) + 1;
        });
        
        const partnerStatsText = Object.entries(partnerStats)
            .map(([partner, count]) => `${window.PARTNERS[partner]?.name || partner}: ${count}`)
            .join('<br>');
        
        const contentStatsText = Object.entries(contentStats)
            .map(([type, count]) => `${window.CONTENT_TYPES[type]?.name || type}: ${count}`)
            .join('<br>');
        
        statsEl.innerHTML = `
            Всего: <strong>${totalFilms}</strong><br>
            С постерами: <strong>${withPosters}</strong><br>
            Всего отзывов: <strong>${totalReviews}</strong><br>
            Всего оценок: <strong>${totalRatings}</strong><br>
            <br>По типам:<br>${contentStatsText}
            <br>По партнерам:<br>${partnerStatsText}
        `;
    }
}

function renderFilmsList() {
    const filmsList = document.getElementById('filmsList');
    if (!filmsList) return;
    
    filmsList.innerHTML = '';
    
    window.filmManager.films.forEach(film => {
        const filmItem = document.createElement('div');
        filmItem.style.cssText = `
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 10px;
            margin-bottom: 8px;
            background: var(--bg-card);
            border-radius: 6px;
            border: 1px solid var(--border);
        `;
        
        const reviewCount = film.reviews ? film.reviews.length : 0;
        const ratingCount = film.userRatings ? film.userRatings.length : 0;
        const partnerInfo = window.PARTNERS[film.partner] || window.PARTNERS.okko;
        const contentType = window.CONTENT_TYPES[film.contentType] || window.CONTENT_TYPES.movie;
        
        filmItem.innerHTML = `
            <div style="display: flex; align-items: center; gap: 10px; flex: 1;">
                <img src="${film.img}" alt="${film.title}" style="width: 40px; height: 60px; object-fit: cover; border-radius: 4px;">
                <div style="flex: 1;">
                    <div style="font-weight: 600; color: var(--text-primary); white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${film.title}</div>
                    <div style="font-size: 12px; color: var(--text-secondary);">
                        ${film.year} • ${film.genre} • ⭐ ${film.rating}
                        ${reviewCount > 0 ? ` • 💬 ${reviewCount}` : ''}
                        ${ratingCount > 0 ? ` • ⭐ ${ratingCount}` : ''}
                    </div>
                    <div style="display: flex; gap: 8px; margin-top: 2px;">
                        <span style="font-size: 11px; color: ${contentType.color}; background: rgba(139, 92, 246, 0.1); padding: 2px 6px; border-radius: 4px;">
                            ${contentType.name}
                        </span>
                        <span style="font-size: 11px; color: ${partnerInfo.color.split(' ')[1] || '#8B5CF6'};">
                            ${partnerInfo.name}
                        </span>
                    </div>
                </div>
            </div>
            <div style="display: flex; gap: 8px;">
                <button class="edit-film-btn" data-id="${film.id}" style="background: #3B82F6; color: white; border: none; padding: 6px 12px; border-radius: 4px; cursor: pointer; font-size: 12px; font-weight: 600;">✏️</button>
                <button class="delete-film-btn" data-id="${film.id}" style="background: #EF4444; color: white; border: none; padding: 6px 12px; border-radius: 4px; cursor: pointer; font-size: 12px; font-weight: 600;">🗑️</button>
            </div>
        `;
        
        filmsList.appendChild(filmItem);
    });
    
    document.querySelectorAll('.edit-film-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const filmId = btn.dataset.id;
            const film = window.filmManager.films.find(f => f.id == filmId);
            if (film) {
                if (window.showEditMovieModal) {
                    window.showEditMovieModal(film);
                }
            }
        });
    });
    
    document.querySelectorAll('.delete-film-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const filmId = btn.dataset.id;
            if (confirm(`Удалить "${window.filmManager.films.find(f => f.id == filmId)?.title}"?`)) {
                window.filmManager.deleteFilm(filmId);
                renderFilmsList();
                window.contentManager.refreshAllSections();
                updateStats();
                showAdminMessage('✅ Контент удален');
            }
        });
    });
}

function makeElementDraggable(element) {
    let isDragging = false;
    let currentX, currentY, initialX, initialY;
    
    const header = element.querySelector('.admin-header');
    
    header.addEventListener('mousedown', dragMouseDown);
    
    function dragMouseDown(e) {
        if (e.target.tagName === 'BUTTON') return;
        
        e.preventDefault();
        isDragging = true;
        
        initialX = e.clientX - element.getBoundingClientRect().left;
        initialY = e.clientY - element.getBoundingClientRect().top;
        
        document.addEventListener('mousemove', elementDrag);
        document.addEventListener('mouseup', closeDragElement);
        
        element.style.cursor = 'grabbing';
        header.style.cursor = 'grabbing';
    }
    
    function elementDrag(e) {
        if (!isDragging) return;
        e.preventDefault();
        
        currentX = e.clientX - initialX;
        currentY = e.clientY - initialY;
        
        const maxX = window.innerWidth - element.offsetWidth;
        const maxY = window.innerHeight - element.offsetHeight;
        
        currentX = Math.max(0, Math.min(currentX, maxX));
        currentY = Math.max(0, Math.min(currentY, maxY));
        
        element.style.left = currentX + 'px';
        element.style.top = currentY + 'px';
        element.style.transform = 'none';
    }
    
    function closeDragElement() {
        isDragging = false;
        document.removeEventListener('mousemove', elementDrag);
        document.removeEventListener('mouseup', closeDragElement);
        
        element.style.cursor = 'default';
        header.style.cursor = 'move';
    }
}

function makeElementResizable(element) {
    const resizeHandle = element.querySelector('.resize-handle');
    let isResizing = false;
    
    resizeHandle.addEventListener('mousedown', initResize);
    
    function initResize(e) {
        e.preventDefault();
        e.stopPropagation();
        isResizing = true;
        
        const startX = e.clientX;
        const startY = e.clientY;
        const startWidth = parseInt(document.defaultView.getComputedStyle(element).width, 10);
        const startHeight = parseInt(document.defaultView.getComputedStyle(element).height, 10);
        
        function doResize(e) {
            if (!isResizing) return;
            
            const newWidth = startWidth + (e.clientX - startX);
            const newHeight = startHeight + (e.clientY - startY);
            
            const minWidth = 500;
            const minHeight = 400;
            const maxWidth = window.innerWidth - 20;
            const maxHeight = window.innerHeight - 20;
            
            element.style.width = Math.max(minWidth, Math.min(newWidth, maxWidth)) + 'px';
            element.style.height = Math.max(minHeight, Math.min(newHeight, maxHeight)) + 'px';
        }
        
        function stopResize(e) {
            isResizing = false;
            document.removeEventListener('mousemove', doResize);
            document.removeEventListener('mouseup', stopResize);
            e.stopPropagation();
        }
        
        document.addEventListener('mousemove', doResize);
        document.addEventListener('mouseup', stopResize);
    }
}

function setupWindowControls(panel) {
    let isMaximized = false;
    let originalStyle = {};
    
    const maximizeBtn = document.getElementById('maximizeAdmin');
    const closeBtn = document.getElementById('closeAdmin');
    
    maximizeBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        
        if (!isMaximized) {
            originalStyle = {
                width: panel.style.width,
                height: panel.style.height,
                left: panel.style.left,
                top: panel.style.top,
                transform: panel.style.transform
            };
            
            panel.style.width = '95vw';
            panel.style.height = '90vh';
            panel.style.left = '50%';
            panel.style.top = '50%';
            panel.style.transform = 'translate(-50%, -50%)';
            
            maximizeBtn.innerHTML = '❐';
            maximizeBtn.title = 'Восстановить';
            isMaximized = true;
        } else {
            panel.style.width = originalStyle.width || '900px';
            panel.style.height = originalStyle.height || '600px';
            panel.style.left = originalStyle.left || '50%';
            panel.style.top = originalStyle.top || '50%';
            panel.style.transform = originalStyle.transform || 'translate(-50%, -50%)';
            
            maximizeBtn.innerHTML = '□';
            maximizeBtn.title = 'Развернуть';
            isMaximized = false;
        }
    });
    
    closeBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        panel.style.display = 'none';
    });
    
    [maximizeBtn, closeBtn].forEach(btn => {
        btn.addEventListener('mouseenter', () => {
            btn.style.background = 'rgba(255,255,255,0.1)';
        });
        btn.addEventListener('mouseleave', () => {
            btn.style.background = 'none';
        });
    });
}

export function showAdminPanel() {
    let adminPanel = document.getElementById('adminPanel');
    if (!adminPanel) {
        createAdminPanel();
    }
    
    document.getElementById('adminContent').style.display = 'none';
    document.getElementById('passwordSection').style.display = 'block';
    document.getElementById('adminPassword').value = '';
    
    adminPanel.style.display = 'block';
}