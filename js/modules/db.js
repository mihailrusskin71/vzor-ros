// modules/db.js
const SUPABASE_URL = 'https://qolbgrvlkadqnfnprbgr.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFvbGJncnZsa2FkcW5mbnByYmdyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI5NzUwMTAsImV4cCI6MjA3ODU1MTAxMH0.XYg5fhJ7ve_UVhAg_fzk4oJFEpje6zb4To-7DIhDgws';

export class Database {
    constructor() {
        this.supabaseUrl = SUPABASE_URL;
        this.supabaseKey = SUPABASE_KEY;
    }

    async getFilms() {
        try {
            const response = await fetch(`${this.supabaseUrl}/rest/v1/films?select=*`, {
                headers: {
                    'apikey': this.supabaseKey,
                    'Authorization': `Bearer ${this.supabaseKey}`
                }
            });
            return await response.json();
        } catch (error) {
            console.error('DB Error:', error);
            // Если база недоступна - пробуем localStorage
            const saved = localStorage.getItem('vzorkino_films');
            return saved ? JSON.parse(saved) : [];
        }
    }

    async addFilm(film) {
        try {
            const response = await fetch(`${this.supabaseUrl}/rest/v1/films`, {
                method: 'POST',
                headers: {
                    'apikey': this.supabaseKey,
                    'Authorization': `Bearer ${this.supabaseKey}`,
                    'Content-Type': 'application/json',
                    'Prefer': 'return=representation'
                },
                body: JSON.stringify(film)
            });
            const result = await response.json();
            
            // Дублируем в localStorage для надежности
            if (result && result[0]) {
                this.saveToLocalStorage(result[0]);
            }
            
            return result;
        } catch (error) {
            console.error('DB Error:', error);
            // Если база недоступна - сохраняем в localStorage
            film.id = Date.now();
            this.saveToLocalStorage(film);
            return [film];
        }
    }

    async updateFilm(id, updates) {
        try {
            const response = await fetch(`${this.supabaseUrl}/rest/v1/films?id=eq.${id}`, {
                method: 'PATCH',
                headers: {
                    'apikey': this.supabaseKey,
                    'Authorization': `Bearer ${this.supabaseKey}`,
                    'Content-Type': 'application/json',
                    'Prefer': 'return=representation'
                },
                body: JSON.stringify(updates)
            });
            return await response.json();
        } catch (error) {
            console.error('DB Error:', error);
            return null;
        }
    }

    async deleteFilm(id) {
        try {
            await fetch(`${this.supabaseUrl}/rest/v1/films?id=eq.${id}`, {
                method: 'DELETE',
                headers: {
                    'apikey': this.supabaseKey,
                    'Authorization': `Bearer ${this.supabaseKey}`
                }
            });
            return true;
        } catch (error) {
            console.error('DB Error:', error);
            return false;
        }
    }

    saveToLocalStorage(film) {
        const saved = JSON.parse(localStorage.getItem('vzorkino_films') || '[]');
        const existingIndex = saved.findIndex(f => f.id === film.id);
        
        if (existingIndex >= 0) {
            saved[existingIndex] = film;
        } else {
            saved.push(film);
        }
        
        localStorage.setItem('vzorkino_films', JSON.stringify(saved));
    }
}