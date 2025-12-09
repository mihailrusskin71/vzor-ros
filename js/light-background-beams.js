// js/light-background-beams.js
// Легкий фон с 10 яркими оранжевыми лучами

class LightBackgroundBeams {
    constructor() {
        this.canvas = null;
        this.ctx = null;
        this.beams = [];
        this.animationId = null;
        this.isAnimating = false;
        this.screenWidth = window.innerWidth;
        this.screenHeight = window.innerHeight;
        this.init();
    }
    
    init() {
        this.createCanvas();
        this.createBeams();
        this.startAnimation();
        this.bindEvents();
    }
    
    createCanvas() {
        // Создаем canvas элемент
        this.canvas = document.createElement('canvas');
        this.canvas.id = 'light-beams-canvas';
        this.canvas.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            z-index: -2;
            pointer-events: none;
            opacity: 0.25;
        `;
        
        document.body.appendChild(this.canvas);
        this.ctx = this.canvas.getContext('2d');
        this.resizeCanvas();
    }
    
    resizeCanvas() {
        const dpr = window.devicePixelRatio || 1;
        this.screenWidth = window.innerWidth;
        this.screenHeight = window.innerHeight;
        
        this.canvas.width = this.screenWidth * dpr;
        this.canvas.height = this.screenHeight * dpr;
        this.canvas.style.width = `${this.screenWidth}px`;
        this.canvas.style.height = `${this.screenHeight}px`;
        
        this.ctx.scale(dpr, dpr);
    }
    
    createBeams() {
        const width = this.screenWidth;
        const height = this.screenHeight;
        
        // Создаем 10 ярких оранжевых лучей
        this.beams = [
            {
                // Левый верхний
                id: 1,
                x: -30,
                y: height * 0.2,
                length: width * 0.9,
                angle: -20,
                speed: 0.12,
                width: 40,
                opacity: 0.25,
                color1: '#FF6A2B',
                color2: '#FF8A5C',
                direction: 'left-to-right',
                side: 'left'
            },
            {
                // Правый средний
                id: 2,
                x: width + 30,
                y: height * 0.5,
                length: width * 0.8,
                angle: 15,
                speed: -0.12,
                width: 35,
                opacity: 0.22,
                color1: '#FF5500',
                color2: '#FF7043',
                direction: 'right-to-left',
                side: 'right'
            },
            {
                // Центральный снизу
                id: 3,
                x: width / 2,
                y: height + 30,
                length: height * 0.8,
                angle: 190,
                speed: 0.08,
                width: 45,
                opacity: 0.20,
                color1: '#FF3D00',
                color2: '#FF5722',
                direction: 'bottom-to-top',
                side: 'center'
            },
            {
                // Диагональный
                id: 4,
                x: width * 0.3,
                y: -30,
                length: height * 1.2,
                angle: 10,
                speed: 0.1,
                width: 30,
                opacity: 0.18,
                color1: '#FF9100',
                color2: '#FFAB40',
                direction: 'top-to-bottom',
                side: 'left'
            },
            {
                // Верхний горизонтальный
                id: 5,
                x: width / 3,
                y: -40,
                length: width * 0.7,
                angle: 25,
                speed: 0.09,
                width: 25,
                opacity: 0.16,
                color1: '#FF6A00',
                color2: '#FF9E40',
                direction: 'top-to-bottom',
                side: 'center'
            },
            {
                // Правый вертикальный
                id: 6,
                x: width + 40,
                y: height * 0.7,
                length: height * 0.6,
                angle: 100,
                speed: -0.07,
                width: 28,
                opacity: 0.14,
                color1: '#FF4500',
                color2: '#FF6B35',
                direction: 'right-to-left',
                side: 'right'
            },
            {
                // Левый диагональный
                id: 7,
                x: -50,
                y: height * 0.8,
                length: width * 1.1,
                angle: -30,
                speed: 0.11,
                width: 32,
                opacity: 0.12,
                color1: '#FF7B00',
                color2: '#FFB347',
                direction: 'left-to-right',
                side: 'left'
            },
            {
                // НОВЫЙ: Диагональный левый-правый
                id: 8,
                x: -60,
                y: height * 0.4,
                length: width * 1.3,
                angle: 25,
                speed: 0.13,
                width: 38,
                opacity: 0.21,
                color1: '#FF4700',
                color2: '#FF7A47',
                direction: 'left-to-right',
                side: 'left'
            },
            {
                // НОВЫЙ: Диагональный правый-левый
                id: 9,
                x: width + 60,
                y: height * 0.3,
                length: width * 1.2,
                angle: -25,
                speed: -0.14,
                width: 36,
                opacity: 0.19,
                color1: '#FF3300',
                color2: '#FF6652',
                direction: 'right-to-left',
                side: 'right'
            },
            {
                // НОВЫЙ: Диагональный центр
                id: 10,
                x: width * 0.4,
                y: -50,
                length: height * 1.4,
                angle: 40,
                speed: 0.12,
                width: 34,
                opacity: 0.17,
                color1: '#FFA500',
                color2: '#FFD166',
                direction: 'top-to-bottom',
                side: 'right'
            }
        ];
    }
    
    drawBeam(beam, time) {
        this.ctx.save();
        this.ctx.translate(beam.x, beam.y);
        this.ctx.rotate((beam.angle * Math.PI) / 180);
        
        // Создаем яркий оранжевый градиент
        const gradient = this.ctx.createLinearGradient(0, 0, 0, beam.length);
        gradient.addColorStop(0, `${beam.color1}00`);
        gradient.addColorStop(0.1, `${beam.color1}${Math.floor(beam.opacity * 255).toString(16).padStart(2, '0')}`);
        gradient.addColorStop(0.5, `${beam.color2}${Math.floor(beam.opacity * 0.9 * 255).toString(16).padStart(2, '0')}`);
        gradient.addColorStop(0.9, `${beam.color1}${Math.floor(beam.opacity * 0.4 * 255).toString(16).padStart(2, '0')}`);
        gradient.addColorStop(1, `${beam.color1}00`);
        
        // Добавить эффект свечения вокруг луча
        this.ctx.shadowColor = beam.color1;
        this.ctx.shadowBlur = 15;
        this.ctx.shadowOffsetX = 0;
        this.ctx.shadowOffsetY = 0;
        
        // Рисуем луч
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(-beam.width / 2, 0, beam.width, beam.length);
        
        this.ctx.restore();
    }
    
    drawStaticBackground() {
        const width = this.screenWidth;
        const height = this.screenHeight;
        
        // Яркий статичный оранжевый градиентный фон
        const radialGradient = this.ctx.createRadialGradient(
            width * 0.2, height * 0.3, 0,
            width * 0.2, height * 0.3, Math.max(width, height) * 0.8
        );
        radialGradient.addColorStop(0, 'rgba(255, 106, 43, 0.12)'); // Ярче
        radialGradient.addColorStop(0.5, 'rgba(255, 107, 1, 0.06)'); // Ярче
        radialGradient.addColorStop(1, 'rgba(255, 87, 34, 0.02)'); // Ярче
        
        // Второй радиальный градиент для правой стороны
        const radialGradient2 = this.ctx.createRadialGradient(
            width * 0.8, height * 0.7, 0,
            width * 0.8, height * 0.7, Math.max(width, height) * 0.6
        );
        radialGradient2.addColorStop(0, 'rgba(255, 69, 0, 0.08)');
        radialGradient2.addColorStop(0.5, 'rgba(255, 140, 0, 0.03)');
        radialGradient2.addColorStop(1, 'rgba(255, 100, 0, 0)');
        
        this.ctx.fillStyle = radialGradient;
        this.ctx.fillRect(0, 0, width, height);
        
        this.ctx.fillStyle = radialGradient2;
        this.ctx.fillRect(0, 0, width, height);
        
        // Добавляем больше ярких статичных точек
        for (let i = 0; i < 35; i++) {
            const x = Math.random() * width;
            const y = Math.random() * height;
            const size = 2 + Math.random() * 4; // Крупнее
            const opacity = 0.08 + Math.random() * 0.08; // Ярче
            
            this.ctx.fillStyle = `rgba(255, ${106 + Math.random() * 50}, ${43 + Math.random() * 30}, ${opacity})`;
            this.ctx.beginPath();
            this.ctx.arc(x, y, size, 0, Math.PI * 2);
            this.ctx.fill();
        }
    }
    
    animate(time) {
        if (!this.isAnimating) return;
        
        // Очищаем canvas
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Рисуем статичный фон
        this.drawStaticBackground();
        
        // Обновляем и рисуем лучи
        this.beams.forEach((beam, index) => {
            // Медленное волнообразное движение
            const waveOffset = index * Math.PI * 0.3;
            const wave = Math.sin(time * 0.001 + waveOffset) * 0.2;
            
            // Двигаем луч
            beam.x += beam.speed + wave * 0.05;
            beam.y += Math.cos(time * 0.0008 + index) * 0.03;
            
            // Яркое мерцание
            const pulse = Math.sin(time * 0.0015 + index) * 0.5 + 0.8; // Меньше амплитуда, больше база
            const currentOpacity = beam.opacity * pulse;
            
            // Создаем копию луча с текущей прозрачностью
            const animatedBeam = {
                ...beam,
                opacity: currentOpacity
            };
            
            this.drawBeam(animatedBeam, time);
            
            // ВОЗВРАЩАЕМ ЛУЧ ЕСЛИ ОН СЛИШКОМ ДАЛЕКО
            this.recycleBeam(beam, index);
        });
        
        this.animationId = requestAnimationFrame((t) => this.animate(t));
    }
    
    recycleBeam(beam, index) {
        const width = this.screenWidth;
        const height = this.screenHeight;
        const margin = 100; // Меньше маржин, чтобы лучи быстрее возвращались
        
        // Проверяем по какой стороне луч
        let needsReset = false;
        
        // Для левых лучей: если ушли слишком далеко вправо
        if (beam.side === 'left' && beam.x > width + margin * 2) {
            needsReset = true;
            // Возвращаем на левую сторону
            beam.x = -margin;
            beam.y = Math.random() * height;
        }
        // Для правых лучей: если ушли слишком далеко влево
        else if (beam.side === 'right' && beam.x < -margin * 2) {
            needsReset = true;
            // Возвращаем на правую сторону
            beam.x = width + margin;
            beam.y = Math.random() * height;
        }
        // Для центральных/вертикальных лучей
        else if (beam.side === 'center') {
            if (beam.direction === 'top-to-bottom' && beam.y > height + margin * 2) {
                needsReset = true;
                beam.y = -margin;
                beam.x = Math.random() * width;
            } else if (beam.direction === 'bottom-to-top' && beam.y < -margin * 2) {
                needsReset = true;
                beam.y = height + margin;
                beam.x = Math.random() * width;
            }
        }
        
        // Также проверяем общие границы
        if (!needsReset && (beam.x < -margin * 3 || beam.x > width + margin * 3 || 
            beam.y < -margin * 3 || beam.y > height + margin * 3)) {
            needsReset = true;
        }
        
        if (needsReset) {
            // Более частое появление в видимой зоне
            const inViewportX = Math.random() * width;
            const inViewportY = Math.random() * height;
            
            // Для левых лучей - появляются слева
            if (beam.side === 'left') {
                beam.x = -50 - Math.random() * 100;
                beam.y = inViewportY;
            }
            // Для правых лучей - появляются справа
            else if (beam.side === 'right') {
                beam.x = width + 50 + Math.random() * 100;
                beam.y = inViewportY;
            }
            // Для центральных
            else {
                beam.x = inViewportX;
                if (beam.direction === 'top-to-bottom') {
                    beam.y = -50 - Math.random() * 100;
                } else {
                    beam.y = height + 50 + Math.random() * 100;
                }
            }
            
            // Немного меняем скорость для разнообразия
            const speedVariation = 0.5 + Math.random() * 0.5;
            if (beam.speed > 0) {
                beam.speed = 0.08 + Math.random() * 0.1;
            } else {
                beam.speed = -0.08 - Math.random() * 0.1;
            }
        }
    }
    
    startAnimation() {
        this.isAnimating = true;
        this.animate(0);
    }
    
    stopAnimation() {
        this.isAnimating = false;
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
        }
    }
    
    bindEvents() {
        let resizeTimeout;
        window.addEventListener('resize', () => {
            clearTimeout(resizeTimeout);
            resizeTimeout = setTimeout(() => {
                this.resizeCanvas();
                this.createBeams();
            }, 250);
        });
        
        // Оптимизация для неактивных вкладок
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                this.stopAnimation();
            } else {
                this.startAnimation();
            }
        });
        
        // Плавное появление
        setTimeout(() => {
            this.canvas.style.transition = 'opacity 1.5s ease';
            this.canvas.style.opacity = '0.25';
        }, 100);
    }
    
    destroy() {
        this.stopAnimation();
        if (this.canvas && this.canvas.parentNode) {
            this.canvas.parentNode.removeChild(this.canvas);
        }
    }
}

// Экспортируем класс
export { LightBackgroundBeams };