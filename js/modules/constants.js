// modules/constants.js
// ===== CONSTANTS AND CONFIGURATION =====
export const PARTNERS = {
    okko: {
        name: "OKKO",
        color: "linear-gradient(135deg, #8B5CF6, #7C3AED)",
        icon: "🎬",
        badgeColor: "#8B5CF6"
    },
    ivi: {
        name: "IVI",
        color: "linear-gradient(135deg, #EC4899, #DB2777)",
        icon: "🎭",
        badgeColor: "#EC4899"
    },
    wink: {
        name: "Wink",
        color: "linear-gradient(135deg, #F97316, #EA580C)",
        icon: "📺",
        badgeColor: "#F97316"
    },
    kion: {
        name: "KION",
        color: "linear-gradient(135deg, #DC2626, #B91C1C)",
        icon: "🌟",
        badgeColor: "#DC2626"
    },
    premier: {
        name: "Премьер",
        color: "linear-gradient(135deg, #FBBF24, #F59E0B)",
        icon: "⭐",
        badgeColor: "#FBBF24"
    },
    kinopoisk: {
        name: "КиноПоиск",
        color: "linear-gradient(135deg, #EA580C, #C2410C)",
        icon: "🎞️",
        badgeColor: "#EA580C"
    }
};

export const CONTENT_TYPES = {
    movie: {
        name: "Фильмы",
        icon: "🎬",
        color: "#8B5CF6"
    },
    series: {
        name: "Сериалы", 
        icon: "📺",
        color: "#EC4899"
    },
    cartoon: {
        name: "Мультфильмы",
        icon: "🐭",
        color: "#10B981"
    }
};

export const GENRES = [
    "Боевик", "Драма", "Комедия", "Фантастика", "Триллер", 
    "Ужасы", "Мультфильм", "Сериал", "Приключения", "Детектив"
];

export const COUNTRIES = [
    "США", "Россия", "Великобритания", "Франция", "Германия",
    "Япония", "Южная Корея", "Китай", "Индия", "Канада"
];

// Конфигурация рядов новинок
export const NEW_RELEASES_CONFIG = {
    home: {
        maxRows: 3,
        itemsPerRow: 5,
        maxItems: 15
    },
    content: {
        maxRows: 2,
        itemsPerRow: 5,
        maxItems: 10
    }
};

// Типы рядов для админ-панели
export const ROW_TYPES = {
    featured: {
        name: "Рекомендуемые",
        icon: "⭐",
        color: "#FFD700"
    },
    trending: {
        name: "Популярные",
        icon: "📈",
        color: "#FF6A2B"
    },
    new: {
        name: "Новинки",
        icon: "🆕",
        color: "#10B981"
    },
    action: {
        name: "Боевики",
        icon: "💥",
        color: "#DC2626"
    },
    comedy: {
        name: "Комедии",
        icon: "😂",
        color: "#F59E0B"
    },
    drama: {
        name: "Драмы",
        icon: "🎭",
        color: "#8B5CF6"
    }
};