// modules/filmManager.js
// ===== FILM MANAGEMENT =====
import { PARTNERS, CONTENT_TYPES, ROW_TYPES } from './constants.js';
import { showAdminMessage } from './utils.js';

export class FilmManager {
    constructor() {
        this.SUPABASE_URL = 'https://qolbgrvlkadqnfnprbgr.supabase.co';
        this.SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFvbGJncnZsa2FkcW5mbnByYmdyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI5NzUwMTAsImV4cCI6MjA3ODU1MTAxMH0.XYg5fhJ7ve_UVhAg_fzk4oJFEpje6zb4To-7DIhDgws';
        this.POISK_KINO_API_KEY = "QHABHFK-P68MM3H-GQFQB7D-1VRGXYQ";
        this.currentMovieId = null;
        this.films = [];
        this.customRows = {};
        
        this.init();
    }
    
    async init() {
        // 1. Сначала загружаем фильмы
        await this.loadFilmsWithCache();
        
        // 2. Затем загружаем кастомные ряды ИЗ БАЗЫ ДАННЫХ
        await this.loadCustomRowsFromSupabase();
        
        // 3. Если в базе нет рядов, пробуем локальные как fallback
        if (Object.keys(this.customRows).length === 0) {
            this.customRows = this.loadCustomRows();
        }
    }
    
    async loadFilmsWithCache() {
        // 1. СНАЧАЛА мгновенно показываем фильмы из кэша
        const cached = localStorage.getItem('vzorkino_films_cache');
        if (cached) {
            this.films = JSON.parse(cached);
            console.log(`⚡ Показано ${this.films.length} фильмов из кэша`);
            
            this.preloadImages();
            
            if (window.contentManager) {
                setTimeout(() => {
                    window.contentManager.refreshAllSections();
                }, 50);
            }
        }
        
        // 2. ПОТОМ в фоне грузим свежие данные из Supabase
        setTimeout(async () => {
            await this.loadFilmsFromSupabase();
        }, 100);
    }
    
    async loadFilmsFromSupabase() {
        try {
            console.log('🔄 Загружаем фильмы из Supabase...');
            
            const response = await fetch(`${this.SUPABASE_URL}/rest/v1/films?select=*&order=created_at.desc`, {
                headers: {
                    'apikey': this.SUPABASE_KEY,
                    'Authorization': `Bearer ${this.SUPABASE_KEY}`
                }
            });
            
            if (response.ok) {
                const films = await response.json();
                this.films = films.map(film => this.normalizeFilmData(film));
                console.log(`✅ Загружено ${films.length} фильмов из Supabase`);
                
                localStorage.setItem('vzorkino_films_cache', JSON.stringify(this.films));
                this.preloadImages();
                
                if (window.contentManager) {
                    setTimeout(() => {
                        window.contentManager.refreshAllSections();
                    }, 100);
                }
                
                return this.films;
            } else {
                throw new Error(`HTTP ${response.status}`);
            }
        } catch (error) {
            console.error('❌ Ошибка загрузки из Supabase:', error);
            
            const cached = localStorage.getItem('vzorkino_films_cache');
            if (cached) {
                this.films = JSON.parse(cached);
                console.log(`✅ Загружено ${this.films.length} фильмов из кэша`);
                return this.films;
            }
            
            this.films = [];
            return [];
        }
    }
    
    // ===== МЕТОДЫ ДЛЯ КАСТОМНЫХ РЯДОВ =====
    
    async loadCustomRowsFromSupabase() {
        try {
            console.log('🔄 Загружаем кастомные ряды из Supabase...');
            
            const response = await fetch(`${this.SUPABASE_URL}/rest/v1/custom_rows?select=*&order=created_at.desc`, {
                headers: {
                    'apikey': this.SUPABASE_KEY,
                    'Authorization': `Bearer ${this.SUPABASE_KEY}`
                }
            });
            
            if (response.ok) {
                const rows = await response.json();
                this.customRows = {};
                
                rows.forEach(row => {
                    this.customRows[row.id] = {
                        id: row.id,
                        name: row.name,
                        pageType: row.page_type || 'all',
                        maxRowItems: row.max_row_items || 20,
                        rowItems: row.row_items || [],
                        modalItems: row.modal_items || [],
                        isGlobal: row.is_global || true,
                        userId: row.user_id,
                        createdAt: row.created_at,
                        updatedAt: row.updated_at
                    };
                });
                
                console.log(`✅ Загружено ${rows.length} кастомных рядов из Supabase`);
                
                // Сохраняем локальную копию для offline работы
                this.saveCustomRowsToLocal();
                
                return this.customRows;
            }
        } catch (error) {
            console.error('❌ Ошибка загрузки кастомных рядов из Supabase:', error);
            // Fallback на локальное хранилище
            return this.loadCustomRows();
        }
    }
    
    loadCustomRows() {
        try {
            const saved = localStorage.getItem('vzorkino_custom_rows');
            return saved ? JSON.parse(saved) : {};
        } catch (error) {
            console.error('Error loading custom rows:', error);
            return {};
        }
    }
    
    saveCustomRowsToLocal() {
        try {
            localStorage.setItem('vzorkino_custom_rows', JSON.stringify(this.customRows));
        } catch (error) {
            console.error('Error saving custom rows:', error);
        }
    }
    
    async saveCustomRowToSupabase(rowData) {
        try {
            console.log('💾 Сохраняем ряд в Supabase:', rowData.name);
            
            const response = await fetch(`${this.SUPABASE_URL}/rest/v1/custom_rows`, {
                method: 'POST',
                headers: {
                    'apikey': this.SUPABASE_KEY,
                    'Authorization': `Bearer ${this.SUPABASE_KEY}`,
                    'Content-Type': 'application/json',
                    'Prefer': 'return=representation'
                },
                body: JSON.stringify({
                    id: rowData.id,
                    name: rowData.name,
                    page_type: rowData.pageType,
                    max_row_items: rowData.maxRowItems,
                    row_items: rowData.rowItems,
                    modal_items: rowData.modalItems,
                    is_global: rowData.isGlobal !== undefined ? rowData.isGlobal : true,
                    user_id: window.userManager?.currentUser?.id || 'admin'
                })
            });
            
            if (response.ok) {
                const result = await response.json();
                console.log('✅ Ряд сохранен в Supabase:', result[0]);
                return true;
            } else {
                const errorText = await response.text();
                console.error('❌ Ошибка Supabase при сохранении ряда:', errorText);
                return false;
            }
        } catch (error) {
            console.error('❌ Ошибка сохранения ряда в Supabase:', error);
            return false;
        }
    }
    
    async updateCustomRowInSupabase(rowId, updates) {
        try {
            const supabaseUpdates = {};
            
            // Конвертируем наши поля в формат Supabase
            if (updates.rowItems !== undefined) supabaseUpdates.row_items = updates.rowItems;
            if (updates.modalItems !== undefined) supabaseUpdates.modal_items = updates.modalItems;
            if (updates.name !== undefined) supabaseUpdates.name = updates.name;
            if (updates.pageType !== undefined) supabaseUpdates.page_type = updates.pageType;
            if (updates.maxRowItems !== undefined) supabaseUpdates.max_row_items = updates.maxRowItems;
            
            supabaseUpdates.updated_at = new Date().toISOString();
            
            const response = await fetch(`${this.SUPABASE_URL}/rest/v1/custom_rows?id=eq.${rowId}`, {
                method: 'PATCH',
                headers: {
                    'apikey': this.SUPABASE_KEY,
                    'Authorization': `Bearer ${this.SUPABASE_KEY}`,
                    'Content-Type': 'application/json',
                    'Prefer': 'return=representation'
                },
                body: JSON.stringify(supabaseUpdates)
            });
            
            if (response.ok) {
                console.log('✅ Ряд обновлен в Supabase');
                return true;
            } else {
                const errorText = await response.text();
                console.error('❌ Ошибка обновления ряда в Supabase:', errorText);
                return false;
            }
        } catch (error) {
            console.error('❌ Ошибка обновления ряда в Supabase:', error);
            return false;
        }
    }
    
    async deleteCustomRowFromSupabase(rowId) {
        try {
            const response = await fetch(`${this.SUPABASE_URL}/rest/v1/custom_rows?id=eq.${rowId}`, {
                method: 'DELETE',
                headers: {
                    'apikey': this.SUPABASE_KEY,
                    'Authorization': `Bearer ${this.SUPABASE_KEY}`
                }
            });
            
            if (response.ok) {
                console.log('✅ Ряд удален из Supabase');
                return true;
            } else {
                throw new Error(`HTTP ${response.status}`);
            }
        } catch (error) {
            console.error('❌ Ошибка удаления ряда из Supabase:', error);
            return false;
        }
    }
    
    createCustomRow(rowId, name, pageType = 'all', maxRowItems = 20) {
        const newRow = {
            id: rowId,
            name: name,
            pageType: pageType,
            maxRowItems: maxRowItems,
            rowItems: [], // Фильмы, которые показываются в ряду (макс 20)
            modalItems: [], // Все фильмы, которые показываются в модальном окне
            isGlobal: true
        };
        
        // Сохраняем локально
        this.customRows[rowId] = newRow;
        this.saveCustomRowsToLocal();
        
        // Сохраняем в базу данных (асинхронно)
        this.saveCustomRowToSupabase(newRow).then(success => {
            if (success) {
                console.log('✅ Ряд успешно сохранен в базу данных');
            } else {
                console.warn('⚠️ Ряд сохранен только локально');
            }
        });
        
        return newRow;
    }
    
    deleteCustomRow(rowId) {
        if (this.customRows[rowId]) {
            // Удаляем из базы данных (асинхронно)
            this.deleteCustomRowFromSupabase(rowId).then(success => {
                if (success) {
                    console.log('✅ Ряд удален из базы данных');
                }
            });
            
            // Удаляем локально
            delete this.customRows[rowId];
            this.saveCustomRowsToLocal();
            
            return true;
        }
        return false;
    }
    
    addToCustomRowModal(rowId, filmId) {
        if (!this.customRows[rowId]) return false;
        
        if (!this.customRows[rowId].modalItems.includes(filmId)) {
            this.customRows[rowId].modalItems.push(filmId);
            
            // Обновляем локально
            this.saveCustomRowsToLocal();
            
            // Синхронизируем с базой (асинхронно)
            this.updateCustomRowInSupabase(rowId, {
                modalItems: this.customRows[rowId].modalItems
            }).then(success => {
                if (success) {
                    console.log('✅ Модальное окно обновлено в базе данных');
                }
            });
            
            return true;
        }
        return false;
    }
    
    removeFromCustomRowModal(rowId, filmId) {
        if (!this.customRows[rowId]) return false;
        
        this.customRows[rowId].modalItems = this.customRows[rowId].modalItems.filter(id => id !== filmId);
        this.customRows[rowId].rowItems = this.customRows[rowId].rowItems.filter(id => id !== filmId);
        
        // Обновляем локально
        this.saveCustomRowsToLocal();
        
        // Синхронизируем с базой (асинхронно)
        this.updateCustomRowInSupabase(rowId, {
            modalItems: this.customRows[rowId].modalItems,
            rowItems: this.customRows[rowId].rowItems
        }).then(success => {
            if (success) {
                console.log('✅ Фильм удален из ряда в базе данных');
            }
        });
        
        return true;
    }
    
    addToCustomRowDisplay(rowId, filmId) {
        if (!this.customRows[rowId]) return false;
        
        // Убедимся, что фильм есть в модальном окне
        if (!this.customRows[rowId].modalItems.includes(filmId)) {
            this.customRows[rowId].modalItems.push(filmId);
        }
        
        // Добавляем в ряд, если есть место
        if (!this.customRows[rowId].rowItems.includes(filmId) && 
            this.customRows[rowId].rowItems.length < this.customRows[rowId].maxRowItems) {
            this.customRows[rowId].rowItems.push(filmId);
            
            // Обновляем локально
            this.saveCustomRowsToLocal();
            
            // Синхронизируем с базой (асинхронно)
            this.updateCustomRowInSupabase(rowId, {
                modalItems: this.customRows[rowId].modalItems,
                rowItems: this.customRows[rowId].rowItems
            }).then(success => {
                if (success) {
                    console.log('✅ Фильм добавлен в ряд в базе данных');
                }
            });
            
            return true;
        }
        return false;
    }
    
    removeFromCustomRowDisplay(rowId, filmId) {
        if (!this.customRows[rowId]) return false;
        
        this.customRows[rowId].rowItems = this.customRows[rowId].rowItems.filter(id => id !== filmId);
        
        // Обновляем локально
        this.saveCustomRowsToLocal();
        
        // Синхронизируем с базой (асинхронно)
        this.updateCustomRowInSupabase(rowId, {
            rowItems: this.customRows[rowId].rowItems
        }).then(success => {
            if (success) {
                console.log('✅ Фильм удален из ряда в базе данных');
            }
        });
        
        return true;
    }
    
    getCustomRow(rowId) {
        return this.customRows[rowId] || null;
    }
    
    getAllCustomRows() {
        return this.customRows;
    }
    
    getCustomRowsForPage(pageType) {
        const rows = {};
        Object.keys(this.customRows).forEach(rowId => {
            if (this.customRows[rowId].pageType === pageType) {
                rows[rowId] = this.customRows[rowId];
            }
        });
        return rows;
    }
    
    getCustomRowFilms(rowId, type = 'row') {
        if (!this.customRows[rowId]) return [];
        
        const filmIds = type === 'row' ? this.customRows[rowId].rowItems : this.customRows[rowId].modalItems;
        
        return filmIds
            .map(filmId => this.films.find(film => film.id == filmId))
            .filter(film => film !== undefined);
    }
    
    // ===== ОСТАЛЬНЫЕ МЕТОДЫ (остаются без изменений) =====
    
    preloadImages() {
        if (!this.films || this.films.length === 0) return;
        
        console.log('🖼️ Предзагружаем обложки...');
        this.films.forEach(film => {
            if (film.img && !film.img.includes('data:image/svg+xml')) {
                const img = new Image();
                img.src = film.img;
                img.onerror = () => {
                    console.log(`❌ Ошибка загрузки изображения для ${film.title}, заменяем на placeholder`);
                    film.img = this.generatePlaceholder(film.title);
                };
            } else if (!film.img) {
                film.img = this.generatePlaceholder(film.title);
            }
        });
    }
    
    async saveFilmToSupabase(film) {
        try {
            console.log('💾 Сохраняем фильм в Supabase:', film.title);
            
            const filmData = {
                title: film.title || '',
                year: film.year || new Date().getFullYear(),
                rating: film.rating || 7.0,
                genre: film.genre || 'Фильм',
                duration: film.duration || '120 мин',
                country: film.country || 'Россия',
                partner: film.partner || 'okko',
                img: film.img || this.generatePlaceholder(film.title),
                description: film.description || `Фильм "${film.title}"`,
                director: film.director || 'Режиссер',
                actors: film.actors || 'Актеры',
                content_type: film.contentType || 'movie',
                seasons: film.seasons || 1,
                kp_id: film.kpId || null,
                featured_data: film.featuredRows || [],
                partner_data: film.partnerLinks || {},
                tags: film.tags || [],
                reviews: film.reviews || [],
                user_ratings: film.userRatings || []
            };
            
            console.log('📤 Отправляем данные:', filmData);
            
            const response = await fetch(`${this.SUPABASE_URL}/rest/v1/films`, {
                method: 'POST',
                headers: {
                    'apikey': this.SUPABASE_KEY,
                    'Authorization': `Bearer ${this.SUPABASE_KEY}`,
                    'Content-Type': 'application/json',
                    'Prefer': 'return=representation'
                },
                body: JSON.stringify(filmData)
            });
            
            if (response.ok) {
                const result = await response.json();
                console.log('✅ Фильм сохранен в Supabase:', result[0]);
                
                const normalizedFilm = this.normalizeFilmData(result[0]);
                this.films.unshift(normalizedFilm);
                localStorage.setItem('vzorkino_films_cache', JSON.stringify(this.films));
                
                if (window.contentManager) {
                    setTimeout(() => {
                        window.contentManager.refreshAllSections();
                    }, 100);
                }
                
                return normalizedFilm;
            } else {
                const errorText = await response.text();
                console.error('❌ Ошибка Supabase:', errorText);
                throw new Error(`HTTP ${response.status}: ${errorText}`);
            }
        } catch (error) {
            console.error('❌ Ошибка сохранения в Supabase:', error);
            throw error;
        }
    }
    
    async deleteFilm(filmId) {
        try {
            const film = this.films.find(f => f.id == filmId);
            
            const response = await fetch(`${this.SUPABASE_URL}/rest/v1/films?id=eq.${filmId}`, {
                method: 'DELETE',
                headers: {
                    'apikey': this.SUPABASE_KEY,
                    'Authorization': `Bearer ${this.SUPABASE_KEY}`
                }
            });
            
            if (response.ok) {
                this.films = this.films.filter(film => film.id != filmId);
                localStorage.setItem('vzorkino_films_cache', JSON.stringify(this.films));
                console.log('✅ Фильм удален из базы');
                
                if (window.contentManager) {
                    setTimeout(() => {
                        window.contentManager.refreshAllSections();
                    }, 100);
                }
                
                return true;
            } else {
                throw new Error(`HTTP ${response.status}`);
            }
        } catch (error) {
            console.error('❌ Ошибка удаления из базы:', error);
            this.films = this.films.filter(film => film.id != filmId);
            localStorage.setItem('vzorkino_films_cache', JSON.stringify(this.films));
            return false;
        }
    }
    
    async updateFilmInSupabase(filmId, updates) {
        try {
            const supabaseUpdates = {};
            Object.keys(updates).forEach(key => {
                if (key === 'contentType') supabaseUpdates.content_type = updates[key];
                else if (key === 'partnerLinks') supabaseUpdates.partner_data = updates[key];
                else if (key === 'userRatings') supabaseUpdates.user_ratings = updates[key];
                else if (key === 'featuredRows') supabaseUpdates.featured_data = updates[key];
                else supabaseUpdates[key] = updates[key];
            });
            
            const response = await fetch(`${this.SUPABASE_URL}/rest/v1/films?id=eq.${filmId}`, {
                method: 'PATCH',
                headers: {
                    'apikey': this.SUPABASE_KEY,
                    'Authorization': `Bearer ${this.SUPABASE_KEY}`,
                    'Content-Type': 'application/json',
                    'Prefer': 'return=representation'
                },
                body: JSON.stringify({
                    ...supabaseUpdates,
                    updated_at: new Date().toISOString()
                })
            });
            
            if (response.ok) {
                const result = await response.json();
                console.log('✅ Фильм обновлен в Supabase:', result[0]);
                return true;
            } else {
                const errorText = await response.text();
                console.error('❌ Ошибка обновления в Supabase:', errorText);
                return false;
            }
        } catch (error) {
            console.error('Ошибка обновления в Supabase:', error);
            return false;
        }
    }
    
    normalizeFilmData(film) {
        const normalizedFilm = {
            id: film.id,
            title: film.title,
            year: film.year,
            rating: film.rating,
            genre: film.genre,
            duration: film.duration,
            country: film.country,
            partner: film.partner,
            img: film.img || this.generatePlaceholder(film.title),
            description: film.description,
            director: film.director,
            actors: film.actors,
            reviews: film.reviews || film.user_ratings || [],
            tags: film.tags || [],
            userRatings: film.user_ratings || [],
            contentType: film.content_type || 'movie',
            seasons: film.seasons || 1,
            episodes: film.episodes || 1,
            partnerLinks: film.partner_data || {},
            kpId: film.kp_id,
            createdAt: film.created_at,
            updatedAt: film.updated_at,
            featuredRows: film.featured_data || []
        };
        
        if (!normalizedFilm.img || normalizedFilm.img.includes('placeholder.com') || normalizedFilm.img.includes('ffffff')) {
            normalizedFilm.img = this.generatePlaceholder(normalizedFilm.title);
        }
        
        return normalizedFilm;
    }
    
    getTemplate() {
        return {
            id: null,
            title: "",
            year: new Date().getFullYear(),
            rating: 7.0,
            genre: "Фильм",
            duration: "120 мин",
            country: "США",
            partner: "okko",
            img: this.generatePlaceholder(""),
            description: "",
            director: "",
            actors: "",
            reviews: [],
            tags: [],
            userRatings: [],
            createdAt: new Date().toISOString(),
            contentType: "movie",
            seasons: 1,
            episodes: 1,
            partnerLinks: {
                okko: "",
                ivi: "",
                wink: "",
                kion: "",
                premier: "",
                kinopoisk: ""
            },
            featuredRows: []
        };
    }
    
    async autoAddFilm(movieTitle, year = null, contentType = "movie") {
        try {
            showAdminMessage('⏳ Ищем фильм и генерируем партнерские ссылки...', 'info');
            
            const filmData = await this.searchPoiskKino(movieTitle, year, contentType);
            
            if (filmData) {
                const partnerLinks = await this.generatePartnerLinks(filmData.title, filmData.year, contentType);
                
                const newFilm = {
                    ...this.getTemplate(),
                    title: filmData.title,
                    year: filmData.year,
                    rating: filmData.rating,
                    genre: filmData.genre,
                    duration: filmData.duration,
                    country: filmData.country,
                    img: filmData.img || this.generatePlaceholder(filmData.title),
                    description: filmData.description,
                    director: filmData.director,
                    actors: filmData.actors,
                    contentType: contentType,
                    seasons: filmData.seasons || 1,
                    partnerLinks: partnerLinks,
                    tags: [filmData.genre],
                    kpId: filmData.kpId
                };
                
                const savedFilm = await this.saveFilmToSupabase(newFilm);
                
                if (savedFilm) {
                    showAdminMessage(`✅ "${filmData.title}" добавлен в базу!`);
                    return savedFilm;
                }
            } else {
                return await this.alternativeSearch(movieTitle, year, contentType);
            }
        } catch (error) {
            console.error("AutoAdd error:", error);
            showAdminMessage('❌ Ошибка при добавлении', 'error');
            return await this.alternativeSearch(movieTitle, year, contentType);
        }
    }
    
    isCurrentYear(year) {
        return year === new Date().getFullYear();
    }
    
    async generatePartnerLinks(title, year, contentType) {
        const encodedTitle = encodeURIComponent(title);
        
        return {
            okko: `https://okko.tv/search/${encodedTitle}`,
            ivi: `https://www.ivi.ru/search/?q=${encodedTitle}`,
            wink: `https://wink.ru/search?query=${encodedTitle}`,
            kion: `https://kion.ru/search?query=${encodedTitle}`,
            premier: `https://premier.one/search?q=${encodedTitle}`,
            kinopoisk: `https://www.kinopoisk.ru/index.php?kp_query=${encodedTitle}`
        };
    }
    
    async searchPoiskKino(title, year = null, contentType = "movie") {
        try {
            console.log(`🔍 Searching PoiskKino for: "${title}"`);
            
            const typeMap = {
                'movie': 'movie',
                'series': 'tv-series',
                'cartoon': 'animated-series'
            };
            
            const apiType = typeMap[contentType] || 'movie';
            
            let url = `https://api.poiskkino.dev/v1.4/movie/search?query=${encodeURIComponent(title)}&limit=5`;
            if (year) url += `&year=${year}`;
            
            const response = await fetch(url, {
                headers: { 'X-API-KEY': this.POISK_KINO_API_KEY }
            });
            
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            
            const data = await response.json();
            
            if (data.docs && data.docs.length > 0) {
                let bestMatch = data.docs[0];
                if (year) {
                    const exactMatch = data.docs.find(movie => movie.year == year);
                    if (exactMatch) bestMatch = exactMatch;
                }
                
                const typeMatch = data.docs.find(movie => movie.type === apiType);
                if (typeMatch) bestMatch = typeMatch;
                
                return this.formatPoiskKinoData(bestMatch, contentType);
            }
            
            return null;
        } catch (error) {
            console.error('PoiskKino API error:', error);
            return null;
        }
    }
    
    formatPoiskKinoData(movieData, contentType) {
        let posterUrl = null;
        if (movieData.poster) {
            posterUrl = movieData.poster.url || movieData.poster.previewUrl;
        }
        
        let rating = 7.0;
        if (movieData.rating) {
            rating = movieData.rating.kp || movieData.rating.imdb || 7.0;
        }
        
        let genre = 'Фильм';
        if (movieData.genres && movieData.genres.length > 0) {
            genre = movieData.genres[0].name;
        } else {
            genre = this.getGenreByContentType(contentType);
        }
        
        let country = 'Россия';
        if (movieData.countries && movieData.countries.length > 0) {
            country = movieData.countries[0].name;
        }
        
        let description = movieData.description || movieData.shortDescription;
        if (!description) {
            description = `"${movieData.name || movieData.alternativeName}" - ${this.getContentTypeDescription(contentType)}`;
        }
        
        let duration = '120 мин';
        if (movieData.movieLength) {
            duration = `${movieData.movieLength} мин`;
        } else if (contentType === 'series') {
            duration = '45 мин серия';
        } else if (contentType === 'cartoon') {
            duration = '90 мин';
        }
        
        return {
            title: movieData.name || movieData.alternativeName,
            originalTitle: movieData.alternativeName || movieData.enName || '',
            year: movieData.year || new Date().getFullYear(),
            rating: parseFloat(rating.toFixed(1)),
            description: description,
            img: posterUrl,
            genre: genre,
            country: country,
            director: this.extractDirector(movieData),
            actors: this.extractActors(movieData),
            kpId: movieData.id,
            contentType: contentType,
            seasons: movieData.seasonsInfo ? movieData.seasonsInfo.length : 1,
            duration: duration
        };
    }
    
    extractDirector(movieData) {
        if (!movieData.persons) return 'Режиссер';
        const director = movieData.persons.find(p => 
            p.enProfession === 'director' || 
            (p.profession && p.profession.toLowerCase().includes('режиссер'))
        );
        return director ? director.name : 'Режиссер';
    }
    
    extractActors(movieData) {
        if (!movieData.persons) return 'Актеры';
        const actors = movieData.persons
            .filter(p => p.enProfession === 'actor' || 
                       (p.profession && p.profession.toLowerCase().includes('актер')))
            .slice(0, 5)
            .map(p => p.name || p.enName || 'Актер');
        return actors.length > 0 ? actors.join(', ') : 'Актеры';
    }
    
    getGenreByContentType(contentType) {
        switch(contentType) {
            case "series": return "Сериал";
            case "cartoon": return "Мультфильм";
            default: return "Фильм";
        }
    }
    
    getContentTypeDescription(contentType) {
        switch(contentType) {
            case "series": return "сериал";
            case "cartoon": return "мультфильм";
            default: return "фильм";
        }
    }
    
    async alternativeSearch(title, year, contentType) {
        const partnerLinks = await this.generatePartnerLinks(title, year, contentType);
        
        const newFilm = {
            ...this.getTemplate(),
            title: title,
            year: year || new Date().getFullYear(),
            rating: 7.5,
            genre: this.getGenreByContentType(contentType),
            duration: contentType === "movie" ? "120 мин" : "45 мин",
            country: "Россия",
            img: this.generatePlaceholder(title),
            description: `${title} - ${this.getContentTypeDescription(contentType)}`,
            director: "Режиссер",
            actors: "Актеры",
            contentType: contentType,
            partnerLinks: partnerLinks,
            tags: [this.getGenreByContentType(contentType)]
        };
        
        try {
            const savedFilm = await this.saveFilmToSupabase(newFilm);
            if (savedFilm) {
                showAdminMessage(`✅ "${title}" добавлен через альтернативный поиск!`);
                return savedFilm;
            }
        } catch (error) {
            console.error('Error saving alternative film:', error);
            showAdminMessage('❌ Ошибка при добавлении', 'error');
            throw error;
        }
    }
    
    generatePlaceholder(title) {
        const colors = ['#1a1a24', '#2a2a3a', '#3a3a4a', '#4a4a5a'];
        const color = colors[Math.floor(Math.random() * colors.length)];
        
        const svg = `
            <svg width="300" height="450" xmlns="http://www.w3.org/2000/svg">
                <rect width="100%" height="100%" fill="${color}"/>
                <rect x="20%" y="40%" width="60%" height="20%" fill="${this.darkenColor(color, 0.2)}" rx="5" ry="5"/>
            </svg>
        `;
        
        return 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svg)));
    }
    
    darkenColor(color, amount) {
        const hex = color.replace('#', '');
        const num = parseInt(hex, 16);
        const amt = Math.round(2.55 * amount * 100);
        const R = (num >> 16) - amt;
        const G = (num >> 8 & 0x00FF) - amt;
        const B = (num & 0x0000FF) - amt;
        return "#" + (
            0x1000000 +
            (R < 255 ? R < 1 ? 0 : R : 255) * 0x10000 +
            (G < 255 ? G < 1 ? 0 : G : 255) * 0x100 +
            (B < 255 ? B < 1 ? 0 : B : 255)
        ).toString(16).slice(1);
    }
    
    async bulkAddFilms(filmList) {
        const results = [];
        for (const film of filmList) {
            const result = await this.autoAddFilm(film.title, film.year, film.contentType);
            results.push(result);
            await new Promise(resolve => setTimeout(resolve, 1000));
        }
        return results;
    }
    
    async addUserRating(filmId, rating, userId = "defaultUser") {
        const filmIndex = this.films.findIndex(film => film.id == filmId);
        if (filmIndex !== -1) {
            if (!this.films[filmIndex].userRatings) {
                this.films[filmIndex].userRatings = [];
            }
            
            this.films[filmIndex].userRatings = this.films[filmIndex].userRatings.filter(
                r => r.userId !== userId
            );
            
            this.films[filmIndex].userRatings.push({
                userId: userId,
                rating: rating,
                date: new Date().toISOString()
            });
            
            await this.updateFilmInSupabase(filmId, {
                user_ratings: this.films[filmIndex].userRatings
            });
            
            localStorage.setItem('vzorkino_films_cache', JSON.stringify(this.films));
            
            return rating;
        }
        return null;
    }
    
    async addReview(filmId, reviewData) {
        const filmIndex = this.films.findIndex(film => film.id == filmId);
        if (filmIndex !== -1) {
            if (!this.films[filmIndex].reviews) {
                this.films[filmIndex].reviews = [];
            }
            
            const newReview = {
                id: Date.now(),
                text: reviewData.text,
                rating: reviewData.rating,
                date: new Date().toISOString(),
                author: reviewData.author || "Аноним",
                userId: reviewData.userId || null
            };
            
            this.films[filmIndex].reviews.unshift(newReview);
            
            await this.updateFilmInSupabase(filmId, {
                reviews: this.films[filmIndex].reviews
            });
            
            localStorage.setItem('vzorkino_films_cache', JSON.stringify(this.films));
            
            if (window.userManager && window.userManager.currentUser && reviewData.userId) {
                window.userManager.addUserReview(filmId, {
                    text: reviewData.text,
                    rating: reviewData.rating,
                    movieTitle: this.films[filmIndex].title,
                    moviePoster: this.films[filmIndex].img
                });
            }
            
            return newReview;
        }
        return null;
    }
    
    getUserRating(filmId, userId = "defaultUser") {
        const film = this.films.find(f => f.id == filmId);
        if (film && film.userRatings) {
            const userRating = film.userRatings.find(r => r.userId === userId);
            return userRating ? userRating.rating : 0;
        }
        return 0;
    }
    
    getAverageUserRating(filmId) {
        const film = this.films.find(f => f.id == filmId);
        if (film && film.userRatings && film.userRatings.length > 0) {
            const sum = film.userRatings.reduce((total, r) => total + r.rating, 0);
            return (sum / film.userRatings.length).toFixed(1);
        }
        return "0.0";
    }
    
    updateFilm(filmId, updatedData) {
        const filmIndex = this.films.findIndex(film => film.id == filmId);
        if (filmIndex !== -1) {
            this.films[filmIndex] = { ...this.films[filmIndex], ...updatedData };
            localStorage.setItem('vzorkino_films_cache', JSON.stringify(this.films));
            
            return true;
        }
        return false;
    }
}