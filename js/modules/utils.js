// modules/utils.js
// ===== UTILITY FUNCTIONS =====
export function showAdminMessage(message, type = 'success') {
    const messageEl = document.getElementById('adminMessage');
    if (!messageEl) return;
    
    messageEl.textContent = message;
    messageEl.style.display = 'block';
    messageEl.style.background = type === 'success' ? 'rgba(34, 197, 94, 0.1)' : 'rgba(239, 68, 68, 0.1)';
    messageEl.style.color = type === 'success' ? '#22c55e' : '#ef4444';
    messageEl.style.border = type === 'success' ? '1px solid rgba(34, 197, 94, 0.2)' : '1px solid rgba(239, 68, 68, 0.2)';
    
    setTimeout(() => {
        messageEl.style.display = 'none';
    }, 4000);
}

export function showRatingNotification(rating, isAlreadyRated = false) {
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: var(--bg-modal);
        color: var(--text-primary);
        padding: 15px 20px;
        border-radius: 10px;
        border-left: 4px solid #FFD700;
        box-shadow: 0 5px 15px rgba(0,0,0,0.3);
        z-index: 10002;
        animation: slideInRight 0.3s ease, slideOutRight 0.3s ease 2.7s;
        display: flex;
        align-items: center;
        gap: 10px;
    `;
    
    if (isAlreadyRated) {
        notification.innerHTML = `
            <span style="color: #FFD700; font-size: 20px;">⭐</span>
            <div>
                <div style="font-weight: 600;">Вы уже оценили этот контент!</div>
                <div style="font-size: 12px; color: var(--text-secondary);">Ваша оценка: ${rating}/10</div>
            </div>
        `;
    } else {
        notification.innerHTML = `
            <span style="color: #FFD700; font-size: 20px;">⭐</span>
            <div>
                <div style="font-weight: 600;">Спасибо за оценку!</div>
                <div style="font-size: 12px; color: var(--text-secondary);">Вы оценили контент на ${rating}/10</div>
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

export function showReviewNotification() {
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: var(--bg-modal);
        color: var(--text-primary);
        padding: 15px 20px;
        border-radius: 10px;
        border-left: 4px solid var(--accent);
        box-shadow: 0 5px 15px rgba(0,0,0,0.3);
        z-index: 10002;
        animation: slideInRight 0.3s ease, slideOutRight 0.3s ease 2.7s;
        display: flex;
        align-items: center;
        gap: 10px;
    `;
    
    notification.innerHTML = `
        <span style="color: var(--accent); font-size: 20px;">💬</span>
        <div>
            <div style="font-weight: 600;">Отзыв опубликован!</div>
            <div style="font-size: 12px; color: var(--text-secondary);">Спасибо за ваш отзыв</div>
        </div>
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        if (notification.parentNode) {
            notification.parentNode.removeChild(notification);
        }
    }, 3000);
}

export function setupSecretAdmin() {
    let secretCode = '';
    const correctCode = '1337';
    
    document.addEventListener('keydown', (e) => {
        if (e.key.length > 1) return;
        
        secretCode += e.key;
        
        if (secretCode.length > 10) {
            secretCode = secretCode.slice(-10);
        }
        
        if (secretCode.includes(correctCode)) {
            if (window.showAdminPanel) {
                window.showAdminPanel();
            }
            secretCode = '';
        }
    });
}

export function debounce(func, wait) {
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

export function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('ru-RU', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
}

export function generateUniqueId() {
    return Date.now() + Math.random().toString(36).substr(2, 9);
}