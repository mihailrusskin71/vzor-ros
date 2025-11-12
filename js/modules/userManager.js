// modules/userManager.js
// ===== USER MANAGEMENT =====
import { showAdminMessage } from './utils.js';

export class UserManager {
    constructor() {
        this.currentUser = null;
        this.users = this.loadUsers();
    }
    
    loadUsers() {
        try {
            const saved = localStorage.getItem('vzorkino_users');
            return saved ? JSON.parse(saved) : [];
        } catch (error) {
            console.error('Error loading users:', error);
            return [];
        }
    }
    
    saveUsers() {
        try {
            localStorage.setItem('vzorkino_users', JSON.stringify(this.users));
        } catch (error) {
            console.error('Error saving users:', error);
        }
    }
    
    register(username, email, password) {
        if (this.users.find(u => u.email === email)) {
            return { success: false, message: 'Пользователь с таким email уже существует' };
        }
        
        const simpleHash = (str) => {
            let hash = 0;
            for (let i = 0; i < str.length; i++) {
                const char = str.charCodeAt(i);
                hash = ((hash << 5) - hash) + char;
                hash = hash & hash;
            }
            return hash.toString();
        };
        
        const newUser = {
            id: Date.now(),
            username,
            email,
            password: simpleHash(password),
            savedMovies: [],
            reviews: [],
            createdAt: new Date().toISOString(),
            avatar: this.generateAvatar(username)
        };
        
        this.users.push(newUser);
        this.saveUsers();
        this.currentUser = newUser;
        
        return { success: true, user: newUser };
    }
    
    login(email, password) {
        const simpleHash = (str) => {
            let hash = 0;
            for (let i = 0; i < str.length; i++) {
                const char = str.charCodeAt(i);
                hash = ((hash << 5) - hash) + char;
                hash = hash & hash;
            }
            return hash.toString();
        };
        
        const user = this.users.find(u => u.email === email && u.password === simpleHash(password));
        if (user) {
            this.currentUser = user;
            return { success: true, user };
        }
        return { success: false, message: 'Неверный email или пароль' };
    }
    
    logout() {
        this.currentUser = null;
    }
    
    saveMovie(movieId) {
        if (!this.currentUser) return false;
        
        const userIndex = this.users.findIndex(u => u.id === this.currentUser.id);
        if (userIndex !== -1) {
            if (!this.users[userIndex].savedMovies.includes(movieId)) {
                this.users[userIndex].savedMovies.push(movieId);
                this.saveUsers();
                this.currentUser = this.users[userIndex];
                return true;
            }
        }
        return false;
    }
    
    unsaveMovie(movieId) {
        if (!this.currentUser) return false;
        
        const userIndex = this.users.findIndex(u => u.id === this.currentUser.id);
        if (userIndex !== -1) {
            this.users[userIndex].savedMovies = this.users[userIndex].savedMovies.filter(id => id !== movieId);
            this.saveUsers();
            this.currentUser = this.users[userIndex];
            return true;
        }
        return false;
    }
    
    isMovieSaved(movieId) {
        return this.currentUser ? this.currentUser.savedMovies.includes(movieId) : false;
    }
    
    addUserReview(movieId, review) {
        if (!this.currentUser) return false;
        
        const userIndex = this.users.findIndex(u => u.id === this.currentUser.id);
        if (userIndex !== -1) {
            if (!this.users[userIndex].reviews) {
                this.users[userIndex].reviews = [];
            }
            
            this.users[userIndex].reviews = this.users[userIndex].reviews.filter(r => r.movieId !== movieId);
            
            this.users[userIndex].reviews.push({
                movieId,
                ...review,
                id: Date.now(),
                date: new Date().toISOString()
            });
            
            this.saveUsers();
            this.currentUser = this.users[userIndex];
            return true;
        }
        return false;
    }
    
    getUserReviews() {
        return this.currentUser ? this.currentUser.reviews || [] : [];
    }
    
    generateAvatar(username) {
        const colors = ['#FF6A2B', '#8B5CF6', '#EC4899', '#10B981', '#3B82F6', '#F59E0B'];
        const color = colors[username.length % colors.length];
        return `https://ui-avatars.com/api/?name=${encodeURIComponent(username)}&background=${color.replace('#', '')}&color=fff&bold=true&size=40`;
    }
}