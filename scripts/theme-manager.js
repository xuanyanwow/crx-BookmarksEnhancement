/**
 * 主题管理器 - 处理日间/夜间主题切换
 */
class ThemeManager {
    constructor() {
        this.currentTheme = 'light';
        this.themeToggleBtn = null;
        this.themeIcon = null;
        this.isInitialized = false;
        this.storageKey = 'edgeFavorites_theme';
        this.init();
    }

    /**
     * 初始化主题管理器
     */
    async init() {
        try {
            // 首先同步加载保存的主题，避免闪烁
            await this.loadSavedTheme();
            
            // 立即应用主题
            this.applyTheme(this.currentTheme);
            
            // 设置主题切换按钮
            this.setupThemeToggle();
            
            this.isInitialized = true;
            console.log(`🎨 主题管理器初始化完成，当前主题: ${this.currentTheme}`);
        } catch (error) {
            console.error('❌ 主题管理器初始化失败:', error);
            // 降级到默认主题
            this.currentTheme = 'light';
            this.applyTheme(this.currentTheme);
            this.setupThemeToggle();
        }
    }

    /**
     * 设置主题切换按钮
     */
    setupThemeToggle() {
        this.themeToggleBtn = document.getElementById('themeToggleBtn');
        this.sunIcon = document.querySelector('.sun-icon');
        this.moonIcon = document.querySelector('.moon-icon');
        
        if (this.themeToggleBtn) {
            this.themeToggleBtn.addEventListener('click', () => {
                this.toggleTheme();
            });
            
            // 更新按钮图标显示
            this.updateThemeIcon();
            console.log('✅ 主题切换按钮已设置');
        } else {
            console.warn('⚠️ 主题切换按钮未找到');
        }
    }

    /**
     * 切换主题
     */
    toggleTheme() {
        const newTheme = this.currentTheme === 'light' ? 'dark' : 'light';
        this.setTheme(newTheme);
        
        // 添加切换动画效果
        this.addSwitchAnimation();
        
        console.log(`🌓 主题已切换到: ${newTheme}`);
    }

    /**
     * 设置主题
     */
    setTheme(theme) {
        this.currentTheme = theme;
        this.applyTheme(theme);
        this.saveTheme(theme);
        this.updateThemeIcon();
    }

    /**
     * 应用主题
     */
    applyTheme(theme) {
        const html = document.documentElement;
        
        if (theme === 'dark') {
            html.setAttribute('data-theme', 'dark');
        } else {
            html.removeAttribute('data-theme');
        }
        
        // 触发主题变更事件
        this.dispatchThemeChangeEvent(theme);
    }

    /**
     * 更新主题图标
     */
    updateThemeIcon() {
        if (this.themeToggleBtn) {
            if (this.currentTheme === 'dark') {
                this.themeToggleBtn.title = '切换到日间模式';
            } else {
                this.themeToggleBtn.title = '切换到夜间模式';
            }
            // SVG图标的显示/隐藏通过CSS控制，这里不需要手动切换
        }
    }

    /**
     * 添加切换动画效果
     */
    addSwitchAnimation() {
        if (this.themeToggleBtn) {
            this.themeToggleBtn.style.transform = 'scale(0.9) rotate(180deg)';
            
            setTimeout(() => {
                this.themeToggleBtn.style.transform = '';
            }, 300);
        }
    }

    /**
     * 保存主题设置（只使用chrome.storage.local）
     */
    async saveTheme(theme) {
        try {
            if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
                await chrome.storage.local.set({ [this.storageKey]: theme });
                console.log(`💾 主题已保存: ${theme}`);
            } else {
                console.error('❌ Chrome存储API不可用');
            }
        } catch (error) {
            console.error('❌ 保存主题失败:', error);
        }
    }

    /**
     * 加载保存的主题（只使用chrome.storage.local）
     */
    async loadSavedTheme() {
        try {
            let savedTheme = null;
            
            if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
                const result = await chrome.storage.local.get([this.storageKey]);
                savedTheme = result[this.storageKey];
            }
            
            if (savedTheme && (savedTheme === 'light' || savedTheme === 'dark')) {
                this.currentTheme = savedTheme;
                console.log(`✅ 加载主题: ${this.currentTheme}`);
            } else {
                // 没有保存的主题，使用系统偏好
                this.detectSystemTheme();
                console.log(`🔍 使用系统偏好: ${this.currentTheme}`);
            }
        } catch (error) {
            console.error('❌ 加载主题失败:', error);
            this.detectSystemTheme();
        }
    }

    /**
     * 检测系统主题偏好
     */
    detectSystemTheme() {
        if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
            this.currentTheme = 'dark';
            console.log('🌙 检测到系统深色模式偏好');
        } else {
            this.currentTheme = 'light';
            console.log('☀️ 检测到系统浅色模式偏好');
        }
        
        // 监听系统主题变化
        if (window.matchMedia) {
            window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
                if (!this.hasUserPreference()) {
                    const systemTheme = e.matches ? 'dark' : 'light';
                    this.setTheme(systemTheme);
                    console.log(`🔄 系统主题已变更为: ${systemTheme}`);
                }
            });
        }
    }

    /**
     * 检查用户是否有主题偏好设置
     */
    async hasUserPreference() {
        try {
            if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
                const result = await chrome.storage.local.get([this.storageKey]);
                return !!result[this.storageKey];
            }
            return false;
        } catch (error) {
            console.warn('⚠️ 检查用户偏好失败:', error);
            return false;
        }
    }

    /**
     * 触发主题变更事件
     */
    dispatchThemeChangeEvent(theme) {
        const event = new CustomEvent('themechange', {
            detail: { theme: theme }
        });
        document.dispatchEvent(event);
    }

    /**
     * 获取当前主题
     */
    getCurrentTheme() {
        return this.currentTheme;
    }

    /**
     * 重置主题为系统默认
     */
    async resetTheme() {
        try {
            if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
                await chrome.storage.local.remove([this.storageKey]);
            }
            
            // 重新检测系统主题
            this.detectSystemTheme();
            this.applyTheme(this.currentTheme);
            this.updateThemeIcon();
            
            console.log(`🔄 主题已重置: ${this.currentTheme}`);
        } catch (error) {
            console.error('❌ 重置主题失败:', error);
        }
    }

    /**
     * 获取主题统计信息
     */
    getThemeStats() {
        return {
            current: this.currentTheme,
            systemPreference: window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light',
            hasUserPreference: this.hasUserPreference(),
            isInitialized: this.isInitialized,
            storageKey: this.storageKey
        };
    }
    
    /**
     * 强制刷新主题
     */
    forceRefresh() {
        this.applyTheme(this.currentTheme);
        this.updateThemeIcon();
        console.log(`🔄 强制刷新主题: ${this.currentTheme}`);
    }

}

// 全局主题管理器实例
let themeManager = null;

// 预加载主题（异步从chrome.storage读取）
(async function preloadTheme() {
    try {
        const storageKey = 'edgeFavorites_theme';
        let savedTheme = null;
        
        // 从 chrome.storage 加载
        if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
            try {
                const result = await chrome.storage.local.get([storageKey]);
                savedTheme = result[storageKey];
            } catch (error) {
                console.warn('⚠️ 预加载失败:', error);
            }
        }
        
        // 如果没有保存的主题，使用系统偏好
        if (!savedTheme || (savedTheme !== 'light' && savedTheme !== 'dark')) {
            if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
                savedTheme = 'dark';
            } else {
                savedTheme = 'light';
            }
        }
        
        // 应用主题
        if (savedTheme === 'dark') {
            document.documentElement.setAttribute('data-theme', 'dark');
        } else {
            document.documentElement.removeAttribute('data-theme');
        }
        
        console.log(`🚀 预加载完成: ${savedTheme}`);
    } catch (error) {
        console.error('❌ 预加载失败:', error);
    }
})();

// 页面加载完成后初始化完整的主题管理器
document.addEventListener('DOMContentLoaded', () => {
    themeManager = new ThemeManager();
    window.themeManager = themeManager;
});

// 导出主题管理器类
window.ThemeManager = ThemeManager;

// 添加全局访问方法
window.getThemeManager = function() {
    return themeManager;
};

