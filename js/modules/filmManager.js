// modules/filmManager.js
// ===== FILM MANAGEMENT =====
import { PARTNERS, CONTENT_TYPES } from './constants.js';
import { showAdminMessage } from './utils.js';

export class FilmManager {
    constructor() {
        this.films = this.loadFilms();
        this.OMDB_API_KEY = "3ad23de4";
        this.currentMovieId = null;
        this.migrateOldFilms();
    }
    
    loadFilms() {
        try {
            const saved = localStorage.getItem('vzorkino_films');
            return saved ? JSON.parse(saved) : [];
        } catch (error) {
            console.error('Error loading films:', error);
            return [];
        }
    }
    
    saveFilms() {
        try {
            localStorage.setItem('vzorkino_films', JSON.stringify(this.films));
        } catch (error) {
            console.error('Error saving films:', error);
        }
    }
    
    migrateOldFilms() {
        let needsUpdate = false;
        
        this.films = this.films.map(film => {
            const updatedFilm = this.updateOldFilm(film);
            
            if (!film.reviews || !film.tags || !film.createdAt || !film.userRatings || !film.contentType) {
                needsUpdate = true;
            }
            
            return updatedFilm;
        });
        
        if (needsUpdate) {
            this.saveFilms();
        }
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
            img: "",
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
            }
        };
    }
    
    updateOldFilm(oldFilm) {
        const template = this.getTemplate();
        return { ...template, ...oldFilm };
    }
    
    deleteFilm(filmId) {
        this.films = this.films.filter(film => film.id != filmId);
        this.saveFilms();
    }
    
    updateFilm(filmId, updatedData) {
        const filmIndex = this.films.findIndex(film => film.id == filmId);
        if (filmIndex !== -1) {
            this.films[filmIndex] = { ...this.films[filmIndex], ...updatedData };
            this.saveFilms();
            return true;
        }
        return false;
    }
    
    addReview(filmId, reviewData) {
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
            this.saveFilms();
            
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
    
    addUserRating(filmId, rating, userId = "defaultUser") {
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
            
            this.saveFilms();
            return rating;
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

    async translateToEnglish(title) {
        if (/^[a-zA-Z0-9\s\-\':,.!?]+$/.test(title)) {
            return title;
        }
        
        try {
            const response = await fetch(
                `https://api.mymemory.translated.net/get?q=${encodeURIComponent(title)}&langpair=ru|en`
            );
            const data = await response.json();
            
            if (data && data.responseData && data.responseData.translatedText) {
                return data.responseData.translatedText;
            }
        } catch (error) {
            console.log('MyMemory Translate не сработал, используем транслитерацию');
        }
        
        return this.simpleTransliteration(title);
    }
    
    simpleTransliteration(title) {
        const map = {
            'а': 'a', 'б': 'b', 'в': 'v', 'г': 'g', 'д': 'd', 'е': 'e', 'ё': 'yo', 
            'ж': 'zh', 'з': 'z', 'и': 'i', 'й': 'y', 'к': 'k', 'л': 'l', 'м': 'm', 
            'н': 'n', 'о': 'o', 'п': 'p', 'р': 'r', 'с': 's', 'т': 't', 'у': 'u', 
            'ф': 'f', 'х': 'kh', 'ц': 'ts', 'ч': 'ch', 'ш': 'sh', 'щ': 'shch', 
            'ъ': '', 'ы': 'y', 'ь': '', 'э': 'e', 'ю': 'yu', 'я': 'ya'
        };
        
        return title.toLowerCase().split('').map(char => map[char] || char).join('');
    }
    
    async autoAddFilm(movieTitle, year = null, contentType = "movie") {
        try {
            showAdminMessage('⏳ Ищу фильм и перевожу на русский...', 'info');
            
            let searchTitle = movieTitle;
            
            if (/[а-яА-Я]/.test(movieTitle)) {
                searchTitle = await this.translateToEnglish(movieTitle);
            }
            
            let searchQueries = [
                searchTitle,
                movieTitle,
                searchTitle.replace(/[^a-zA-Z0-9\s]/g, ''),
                movieTitle.replace(/[^a-zA-Z0-9\s]/g, '')
            ];
            
            let data = null;
            
            for (let query of searchQueries) {
                if (!query.trim()) continue;
                
                try {
                    let response = await fetch(
                        `https://www.omdbapi.com/?t=${encodeURIComponent(query)}&y=${year}&apikey=${this.OMDB_API_KEY}`
                    );
                    let result = await response.json();
                    
                    if (result.Response === "True") {
                        data = result;
                        break;
                    }
                    
                    await new Promise(resolve => setTimeout(resolve, 300));
                } catch (error) {
                    console.log('Ошибка запроса к OMDB:', error);
                    continue;
                }
            }
            
            if (!data) {
                try {
                    const searchResponse = await fetch(
                        `https://www.omdbapi.com/?s=${encodeURIComponent(searchTitle)}&y=${year}&apikey=${this.OMDB_API_KEY}`
                    );
                    const searchData = await searchResponse.json();
                    
                    if (searchData.Response === "True" && searchData.Search && searchData.Search.length > 0) {
                        const firstResult = searchData.Search[0];
                        const detailResponse = await fetch(
                            `https://www.omdbapi.com/?i=${firstResult.imdbID}&apikey=${this.OMDB_API_KEY}`
                        );
                        data = await detailResponse.json();
                    }
                } catch (error) {
                    console.log('Ошибка поиска в OMDB:', error);
                }
            }
            
            if (data && data.Response === "True") {
                const translatedData = await this.translateMovieData(data);
                
                let detectedContentType = "movie";
                if (data.Type === "series") {
                    detectedContentType = "series";
                } else if (data.Genre && (
                    data.Genre.toLowerCase().includes("animation") || 
                    data.Genre.toLowerCase().includes("family") ||
                    contentType === "cartoon"
                )) {
                    detectedContentType = "cartoon";
                }
                
                const finalContentType = contentType !== "movie" ? contentType : detectedContentType;
                
                const uniqueTags = this.getUniqueTags(translatedData.genre, finalContentType);
                
                const newFilm = {
                    ...this.getTemplate(),
                    id: Date.now(),
                    title: translatedData.title,
                    year: parseInt(data.Year) || year || new Date().getFullYear(),
                    rating: parseFloat(data.imdbRating) || 7.0,
                    genre: translatedData.genre,
                    duration: data.Runtime !== "N/A" ? this.translateRuntime(data.Runtime) : "120 мин",
                    country: translatedData.country,
                    img: data.Poster !== "N/A" ? data.Poster : this.generatePlaceholder(translatedData.title),
                    description: translatedData.description,
                    director: translatedData.director,
                    actors: translatedData.actors,
                    contentType: finalContentType,
                    seasons: data.totalSeasons ? parseInt(data.totalSeasons) : 1,
                    episodes: 1,
                    partnerLinks: {
                        okko: `https://okko.tv/search/${encodeURIComponent(translatedData.title)}`,
                        ivi: `https://www.ivi.ru/search/?q=${encodeURIComponent(translatedData.title)}`,
                        wink: `https://wink.ru/search?query=${encodeURIComponent(translatedData.title)}`,
                        kion: `https://kion.ru/search?query=${encodeURIComponent(translatedData.title)}`,
                        premier: `https://premier.one/search?q=${encodeURIComponent(translatedData.title)}`,
                        kinopoisk: `https://www.kinopoisk.ru/index.php?kp_query=${encodeURIComponent(translatedData.title)}`
                    },
                    reviews: [],
                    userRatings: [],
                    tags: uniqueTags
                };
                
                this.films.unshift(newFilm);
                this.saveFilms();
                showAdminMessage(`✅ "${translatedData.title}" добавлен!`);
                return newFilm;
            } else {
                return await this.alternativeSearch(movieTitle, year, contentType);
            }
        } catch (error) {
            console.error("Ошибка:", error);
            showAdminMessage('❌ Ошибка сети', 'error');
            return await this.alternativeSearch(movieTitle, year, contentType);
        }
    }
    
    async alternativeSearch(title, year, contentType) {
        const newFilm = {
            ...this.getTemplate(),
            id: Date.now(),
            title: title,
            year: year || new Date().getFullYear(),
            rating: 7.5,
            genre: this.getGenreByContentType(contentType),
            duration: contentType === "movie" ? "120 мин" : "24 мин",
            country: "Россия",
            img: this.generatePlaceholder(title),
            description: `${title} - ${contentType === "movie" ? "фильм" : contentType === "series" ? "сериал" : "мультфильм"}`,
            director: "Режиссер",
            actors: "Актеры",
            contentType: contentType,
            partnerLinks: {
                okko: `https://okko.tv/search/${encodeURIComponent(title)}`,
                ivi: `https://www.ivi.ru/search/?q=${encodeURIComponent(title)}`,
                wink: `https://wink.ru/search?query=${encodeURIComponent(title)}`,
                kion: `https://kion.ru/search?query=${encodeURIComponent(title)}`,
                premier: `https://premier.one/search?q=${encodeURIComponent(title)}`,
                kinopoisk: `https://www.kinopoisk.ru/index.php?kp_query=${encodeURIComponent(title)}`
            },
            reviews: [],
            userRatings: [],
            tags: [this.getGenreByContentType(contentType)]
        };
        
        this.films.unshift(newFilm);
        this.saveFilms();
        showAdminMessage(`✅ "${title}" добавлен через альтернативный поиск!`);
        return newFilm;
    }
    
    getGenreByContentType(contentType) {
        switch(contentType) {
            case "series": return "Сериал";
            case "cartoon": return "Мультфильм";
            default: return "Фильм";
        }
    }
    
    getUniqueTags(genre, contentType) {
        const baseTags = [];
        
        if (genre && genre !== "Фильм") {
            baseTags.push(genre);
        }
        
        return [...new Set(baseTags)];
    }
    
    async translateMovieData(englishData) {
        try {
            const [title, description, director, actors] = await Promise.all([
                this.translateToRussian(englishData.Title),
                this.translateToRussian(englishData.Plot !== "N/A" ? englishData.Plot : `Фильм "${englishData.Title}"`),
                this.translateToRussian(englishData.Director !== "N/A" ? englishData.Director : "Режиссер"),
                this.translateToRussian(englishData.Actors !== "N/A" ? englishData.Actors : "Актеры")
            ]);
            
            return {
                title: title || englishData.Title,
                genre: this.translateGenre(englishData.Genre),
                country: this.translateCountry(englishData.Country),
                description: description || englishData.Plot,
                director: director || englishData.Director,
                actors: actors || englishData.Actors
            };
        } catch (error) {
            return {
                title: englishData.Title,
                genre: this.translateGenre(englishData.Genre),
                country: this.translateCountry(englishData.Country),
                description: englishData.Plot,
                director: englishData.Director,
                actors: englishData.Actors
            };
        }
    }
    
    async translateToRussian(text) {
        if (!text || text === "N/A") return text;
        
        try {
            const response = await fetch(
                `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=en|ru`
            );
            const data = await response.json();
            
            if (data && data.responseData && data.responseData.translatedText) {
                return data.responseData.translatedText;
            }
        } catch (error) {
            console.log('Ошибка перевода на русский:', text);
        }
        
        return text;
    }
    
    translateGenre(genres) {
        if (!genres || genres === "N/A") return "Фильм";
        
        const genreMap = {
            'Action': 'Боевик', 
            'Adventure': 'Приключения', 
            'Animation': 'Мультфильм',
            'Comedy': 'Комедия', 
            'Crime': 'Криминал', 
            'Documentary': 'Документальный',
            'Drama': 'Драма', 
            'Family': 'Семейный', 
            'Fantasy': 'Фэнтези',
            'History': 'Исторический', 
            'Horror': 'Ужасы', 
            'Music': 'Музыка',
            'Mystery': 'Детектив', 
            'Romance': 'Мелодрама', 
            'Science Fiction': 'Фантастика',
            'TV Movie': 'Телефильм', 
            'Thriller': 'Триллер', 
            'War': 'Военный',
            'Western': 'Вестерн'
        };
        
        const englishGenres = genres.split(',').map(g => g.trim());
        const russianGenres = englishGenres.map(genre => genreMap[genre] || genre);
        
        return russianGenres[0];
    }
    
    translateCountry(countries) {
        if (!countries || countries === "N/A") return "США";
        
        const countryMap = {
            'United States': 'США', 'USA': 'США', 'UK': 'Великобритания',
            'United Kingdom': 'Великобритания', 'Canada': 'Канада', 'Australia': 'Австралия',
            'Germany': 'Германия', 'France': 'Франция', 'Japan': 'Япония',
            'South Korea': 'Южная Корея', 'China': 'Китай', 'Russia': 'Россия'
        };
        
        const englishCountries = countries.split(',').map(c => c.trim());
        const russianCountries = englishCountries.map(country => countryMap[country] || country);
        
        return russianCountries[0];
    }
    
    translateRuntime(runtime) {
        if (!runtime || runtime === "N/A") return "120 мин";
        return runtime.replace('min', 'мин');
    }
    
    generatePlaceholder(title) {
        const cleanTitle = title.substring(0, 15).replace(/[^a-zA-Z0-9]/g, '');
        return `https://via.placeholder.com/300x450/1a1a24/ffffff?text=${encodeURIComponent(cleanTitle || 'Poster')}`;
    }
    
    async bulkAddFilms(filmList) {
        const results = [];
        for (const film of filmList) {
            const result = await this.autoAddFilm(film.title, film.year, film.contentType);
            results.push(result);
            await new Promise(resolve => setTimeout(resolve, 1500));
        }
        return results;
    }
}