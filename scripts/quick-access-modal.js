// 快速访问 - 直接在主列表中显示
class QuickAccessModal {
    constructor() {
        this.currentFilter = 'all';
        this.init();
    }

    init() {
        // 预加载样式，确保首次访问就有样式
        this.ensureStyles();
        this.bindEvents();
    }

    bindEvents() {
        // 绑定快速访问链接点击事件
        const quickAccessLinks = document.querySelectorAll('.quick-access a');
        console.log('🔍 找到快速访问链接数量:', quickAccessLinks.length);
        
        quickAccessLinks.forEach((link, index) => {
            const filterType = link.dataset.filter;
            console.log(`🔍 绑定链接 ${index}:`, link.textContent, filterType);
            
            link.addEventListener('click', (e) => {
                e.preventDefault();
                console.log('🔍 点击快速访问链接:', filterType);
                
                // 直接在主列表中显示快速访问内容
                this.showQuickAccessInMainList(filterType);
            });
        });

        console.log('✅ 快速访问事件绑定成功');
    }

    showQuickAccessInMainList(filterType) {
        console.log('🔍 在主列表中显示快速访问:', filterType);
        
        // 获取书签数据
        let bookmarks = [];
        if (window.app && window.app.bookmarks) {
            bookmarks = window.app.bookmarks;
            console.log('🔍 获取书签数量:', bookmarks.length);
        } else {
            console.warn('⚠️ 无法获取书签数据');
            return;
        }

        // 过滤书签
        let filteredBookmarks = [];
        switch (filterType) {
            case 'all':
                filteredBookmarks = bookmarks.filter(b => b.type !== 'folder');
                break;
            case 'recent':
                filteredBookmarks = bookmarks
                    .filter(b => b.type !== 'folder')
                    .sort((a, b) => (b.dateAdded || 0) - (a.dateAdded || 0))
                    .slice(0, 50);
                break;
            case 'frequent':
                filteredBookmarks = bookmarks
                    .filter(b => b.type !== 'folder' && b.visitCount > 0)
                    .sort((a, b) => (b.visitCount || 0) - (a.visitCount || 0))
                    .slice(0, 50);
                break;
            case 'unorganized':
                filteredBookmarks = bookmarks.filter(b => 
                    b.type !== 'folder' && (!b.parentId || b.parentId === '1')
                );
                break;
        }

        console.log('🔍 过滤后书签数量:', filteredBookmarks.length);

        // 设置标题
        const titles = {
            'all': '所有收藏夹',
            'recent': '最近添加',
            'frequent': '常用收藏夹',
            'unorganized': '未分类'
        };

        // 更新当前路径显示
        if (window.app) {
            window.app.updateBreadcrumb(titles[filterType] || '快速访问');
        }

        // 直接在主列表中渲染
        this.renderInMainList(filteredBookmarks, titles[filterType] || '快速访问');
    }

    renderInMainList(bookmarks, title) {
        // 先添加样式，确保样式在渲染前就存在
        this.ensureStyles();
        
        // 获取主列表容器
        const listContainer = document.getElementById('bookmarksList');
        if (!listContainer) {
            console.error('❌ 找不到主列表容器');
            return;
        }

        // 清空现有内容
        listContainer.innerHTML = '';

        if (bookmarks.length === 0) {
            listContainer.innerHTML = `<div class="quick-access">
                <div class="quick-access-header">
                    <h3>${title} (0)</h3>
                    <button class="btn btn-secondary go-back-btn">返回收藏夹</button>
                </div>
                <div class="empty-state">
                    <p>暂无${title}</p>
                </div>
            </div>`;
            
            // 绑定返回按钮事件
            listContainer.querySelector('.go-back-btn').addEventListener('click', () => this.goBack());
            
            // 隐藏排序控件
            this.hideSortControls();
            return;
        }

        // 创建快速访问头部
        const headerHTML = `
            <div class="quick-access-header">
                <h3>${title} (${bookmarks.length})</h3>
                <button class="btn btn-secondary go-back-btn">返回收藏夹</button>
            </div>
        `;

        // 创建书签列表
        const bookmarksHTML = bookmarks.map(bookmark => {
            const faviconUrl = this.getFaviconUrl(bookmark.url);
            const escapedTitle = this.escapeHtml(bookmark.title || '无标题');
            const escapedUrl = this.escapeHtml(bookmark.url || '');

            return `
                <div class="bookmark-item" data-id="${bookmark.id}" data-url="${this.escapeHtml(bookmark.url || '')}">
                    <img src="${faviconUrl}" 
                         class="bookmark-favicon" 
                         alt="icon"
                         onerror="this.src='data:image/svg+xml,%3Csvg xmlns=\\'http://www.w3.org/2000/svg\\' width=\\'24\\' height=\\'24\\' viewBox=\\'0 0 24 24\\' fill=\\'none\\' stroke=\\'%236b7280\\' stroke-width=\\'2\\'%3E%3Cpath d=\\'M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z\\'%3E%3C/path%3E%3C/svg%3E'">
                    <div class="bookmark-info">
                        <div class="bookmark-title">${escapedTitle}</div>
                        <div class="bookmark-url">${escapedUrl}</div>
                    </div>
                    <div class="bookmark-actions">
                        <button class="bookmark-action-btn open-btn" title="打开" style="padding: 4px !important; border: none !important; background: none !important; color: var(--text-secondary) !important; cursor: pointer !important; border-radius: 4px !important; transition: all 0.2s ease !important;">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
                                <polyline points="15,3 21,3 21,9"></polyline>
                                <line x1="10" y1="14" x2="21" y2="3"></line>
                            </svg>
                        </button>
                        <button class="bookmark-action-btn edit-btn" title="编辑" style="padding: 4px !important; border: none !important; background: none !important; color: var(--text-secondary) !important; cursor: pointer !important; border-radius: 4px !important; transition: all 0.2s ease !important;">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                            </svg>
                        </button>
                        <button class="bookmark-action-btn delete-btn" title="删除" style="padding: 4px !important; border: none !important; background: none !important; color: var(--text-secondary) !important; cursor: pointer !important; border-radius: 4px !important; transition: all 0.2s ease !important;">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <polyline points="3 6 5 6 21 6"></polyline>
                                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                            </svg>
                        </button>
                    </div>
                </div>
            `;
        }).join('');

        // 组合HTML并插入
        listContainer.innerHTML = `<div class="quick-access">${headerHTML + bookmarksHTML}</div>`;

        // 绑定返回按钮事件
        const goBackBtn = listContainer.querySelector('.go-back-btn');
        if (goBackBtn) {
            goBackBtn.addEventListener('click', () => this.goBack());
        }

        // 绑定按钮事件
        this.bindButtonEvents();

        // 隐藏排序控件
        this.hideSortControls();
    }

    ensureStyles() {
        // 样式已添加到manager.css中，无需重复添加
    }

    async editBookmark(bookmarkId) {
        if (!window.app) return;
        
        const bookmark = window.app.bookmarks.find(b => b.id === bookmarkId);
        if (!bookmark) return;
        
        const newTitle = prompt('请输入新标题：', bookmark.title);
        if (!newTitle || newTitle === bookmark.title) return;
        
        try {
            await chrome.bookmarks.update(bookmarkId, { title: newTitle });
            await window.app.loadData();
            await window.app.renderBookmarksView();
        } catch (error) {
            console.error('❌ 编辑失败:', error);
            alert('编辑失败: ' + error.message);
        }
    }

    async deleteBookmark(bookmarkId) {
        if (!window.app) return;
        
        const bookmark = window.app.bookmarks.find(b => b.id === bookmarkId);
        if (!bookmark) return;
        
        if (!confirm(`确定要删除"${bookmark.title}"吗？`)) return;
        
        try {
            await chrome.bookmarks.remove(bookmarkId);
            await window.app.loadData();
            await window.app.renderBookmarksView();
        } catch (error) {
            console.error('❌ 删除失败:', error);
            alert('删除失败: ' + error.message);
        }
    }

    goBack() {
        console.log('🔍 返回收藏夹视图');
        if (window.app && typeof window.app.renderBookmarksView === 'function') {
            // 显示排序控件
            this.showSortControls();
            // 重新渲染收藏夹视图
            window.app.renderBookmarksView();
        }
    }

    hideSortControls() {
        // 隐藏整个工具栏
        const toolbar = document.querySelector('.toolbar');
        if (toolbar) {
            toolbar.style.display = 'none';
        }
    }

    showSortControls() {
        // 显示整个工具栏
        const toolbar = document.querySelector('.toolbar');
        if (toolbar) {
            toolbar.style.display = 'flex';
        }
    }

    getFaviconUrl(url) {
        if (!url) {
            return 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="%236b7280" stroke-width="2"%3E%3Cpath d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"%3E%3C/path%3E%3C/svg%3E';
        }
        
        try {
            const domain = new URL(url).hostname;
            return `https://www.google.com/s2/favicons?domain=${domain}&sz=32`;
        } catch (e) {
            return 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="%236b7280" stroke-width="2"%3E%3Cpath d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"%3E%3C/path%3E%3C/svg%3E';
        }
    }

    bindButtonEvents() {
        // 绑定打开按钮
        document.querySelectorAll('.open-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const url = btn.closest('.bookmark-item').dataset.url;
                if (url) {
                    window.open(url, '_blank');
                }
            });
        });

        // 绑定编辑按钮
        document.querySelectorAll('.edit-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const bookmarkId = btn.closest('.bookmark-item').dataset.id;
                this.editBookmark(bookmarkId);
            });
        });

        // 绑定删除按钮
        document.querySelectorAll('.delete-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const bookmarkId = btn.closest('.bookmark-item').dataset.id;
                this.deleteBookmark(bookmarkId);
            });
        });
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

// 简单初始化
document.addEventListener('DOMContentLoaded', () => {
    console.log('🔍 初始化快速访问（主列表模式）');
    window.quickAccessModal = new QuickAccessModal();
});

if (document.readyState !== 'loading') {
    console.log('🔍 立即初始化快速访问（主列表模式）');
    window.quickAccessModal = new QuickAccessModal();
}
