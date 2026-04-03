class BookmarkManagerApp {
    constructor() {
        this.bookmarks = [];
        this.filteredBookmarks = [];
        this.selectedBookmarks = new Set();
        this.currentView = 'list';
        this.currentFilter = 'all';
        this.currentFolderId = null; // 初始化当前文件夹ID
        this.currentEditingBookmarkId = null; // 初始化当前编辑的收藏夹ID
        this.currentMovingBookmarkId = null; // 初始化当前移动的收藏夹ID
        this.visitHistory = {};
        this.init();
    }

    async init() {
        await this.loadData();
        await this.initializeLLM();
        this.initTheme(); // 初始化主题
        this.setupEventListeners();
        this.renderFolderTree();
        await this.renderBookmarksView();
        this.updateStats();
        this.debugQuickButtons(); // 调试快速操作按钮样式
    }

    debugQuickButtons() {
        // 调试函数：检查并强制应用快速操作按钮样式
        setTimeout(() => {
            const quickBtns = document.querySelectorAll('.quick-btn');
            console.log('🔍 找到快速操作按钮数量:', quickBtns.length);
            
            quickBtns.forEach((btn, index) => {
                const computedStyle = window.getComputedStyle(btn);
                console.log(`按钮 ${index} (${btn.textContent}):`, {
                    background: computedStyle.backgroundColor,
                    color: computedStyle.color,
                    padding: computedStyle.padding,
                    borderRadius: computedStyle.borderRadius
                });
            });
            
            // 确保按钮状态正确
            this.resetButtonState();
        }, 100);
    }

    async initializeLLM() {
        // 初始化规则分类器
        if (window.RuleClassifier) {
            this.classifier = new window.RuleClassifier();
            console.log('✅ 规则分类器初始化完成');
        } else {
            console.warn('⚠️ 规则分类器未找到');
        }
    }

    async loadData() {
        try {
            console.log('🔄 开始加载收藏夹数据...');
            
            // 加载收藏夹
            const bookmarkTree = await chrome.bookmarks.getTree();
            console.log('📚 收藏夹树结构:', bookmarkTree);
            
            this.bookmarks = this.flattenBookmarks(bookmarkTree[0]);
            console.log(`📋 扁平化后的收藏夹数量: ${this.bookmarks.length}`);
            
            this.filteredBookmarks = [...this.bookmarks];
            console.log(`🔍 过滤后的收藏夹数量: ${this.filteredBookmarks.length}`);

            // 加载访问历史
            const result = await chrome.storage.local.get(['visitHistory']);
            this.visitHistory = result.visitHistory || {};
            console.log('✅ 收藏夹数据加载完成');
        } catch (error) {
            console.error('❌ 加载数据失败:', error);
        }
    }

    flattenBookmarks(node, path = '', level = 0) {
        let bookmarks = [];
        
        if (node.children) {
            const currentPath = path ? `${path}/${node.title}` : node.title;
            
            for (const child of node.children) {
                if (child.url) {
                    // 收藏夹项目
                    bookmarks.push({
                        id: child.id,
                        title: child.title,
                        url: child.url,
                        dateAdded: child.dateAdded,
                        parentId: child.parentId,
                        path: currentPath,
                        level: level,
                        type: 'bookmark'
                    });
                } else {
                    // 统计当前文件夹的子文件夹数量
                    let childFoldersCount = 0;
                    if (child.children) {
                        for (const grandChild of child.children) {
                            if (!grandChild.url) {
                                childFoldersCount++;
                            }
                        }
                    }
                    
                    // 文件夹
                    bookmarks.push({
                        id: child.id,
                        title: child.title,
                        parentId: child.parentId,
                        path: currentPath,
                        level: level,
                        type: 'folder',
                        children: child.children ? child.children.length : 0,
                        childFolders: childFoldersCount
                    });
                    // 递归处理子项目
                    bookmarks = bookmarks.concat(this.flattenBookmarks(child, currentPath, level + 1));
                }
            }
        }
        
        return bookmarks;
    }

    setupEventListeners() {
        // 搜索功能
        document.getElementById('globalSearch').addEventListener('input', (e) => {
            this.handleSearch(e.target.value);
        });

        // 主题切换
        document.getElementById('themeToggleBtn').addEventListener('click', () => {
            this.toggleTheme();
        });

        // 视图切换
        document.getElementById('listViewBtn').addEventListener('click', () => {
            this.switchView('list');
        });
        document.getElementById('gridViewBtn').addEventListener('click', () => {
            this.switchView('grid');
        });

        // 排序
        document.getElementById('sortSelect').addEventListener('change', (e) => {
            this.sortBookmarks(e.target.value);
        });

        // 工具栏按钮
        document.getElementById('toolbarRefreshBtn').addEventListener('click', () => {
            this.refresh();
        });
        document.getElementById('selectAllBtn').addEventListener('click', () => {
            this.toggleSelectAll();
        });
        document.getElementById('deleteSelectedBtn').addEventListener('click', () => {
            this.deleteSelected();
        });

        // 顶部导航栏刷新按钮
        document.getElementById('refreshBtn').addEventListener('click', () => {
            this.refresh();
        });

        // 侧边栏工具
        document.getElementById('importBtn').addEventListener('click', () => {
            document.getElementById('fileInput').click();
        });
        document.getElementById('exportBtn').addEventListener('click', () => {
            this.exportBookmarks();
        });
        document.getElementById('organizeBtn').addEventListener('click', () => {
            this.organizeBookmarks();
        });
        document.getElementById('cleanEmptyFoldersBtn').addEventListener('click', () => {
            this.cleanEmptyFolders();
        });

        // 新增文件夹按钮
        document.getElementById('addFolderBtn').addEventListener('click', () => {
            this.showAddFolderDialog();
        });

        // 一键折叠按钮
        document.getElementById('collapseAllBtn').addEventListener('click', () => {
            this.collapseAllFolders();
        });

        // 右侧工具栏操作按钮
        document.getElementById('refreshDataBtn').addEventListener('click', () => {
            this.refresh();
        });
        document.getElementById('selectAllItemsBtn').addEventListener('click', () => {
            this.toggleSelectAll();
        });
        document.getElementById('deleteSelectedItemsBtn').addEventListener('click', () => {
            this.deleteSelected();
        });

        // 文件导入
        document.getElementById('fileInput').addEventListener('change', (e) => {
            this.importBookmarks(e.target.files[0]);
        });

        // 编辑弹窗按钮
        document.getElementById('cancelEditBookmark').addEventListener('click', () => {
            this.hideEditBookmarkModal();
        });
        document.getElementById('saveEditBookmark').addEventListener('click', () => {
            this.saveEditBookmark();
        });

        // 点击弹窗外部关闭弹窗
        document.getElementById('editBookmarkModal').addEventListener('click', (e) => {
            if (e.target.id === 'editBookmarkModal') {
                this.hideEditBookmarkModal();
            }
        });

        // 移动弹窗按钮
        document.getElementById('cancelMoveBookmark').addEventListener('click', () => {
            this.hideMoveBookmarkModal();
        });
        document.getElementById('confirmMoveBookmark').addEventListener('click', () => {
            this.moveBookmarkToFolder();
        });

        // 点击弹窗外部关闭弹窗
        document.getElementById('moveBookmarkModal').addEventListener('click', (e) => {
            if (e.target.id === 'moveBookmarkModal') {
                this.hideMoveBookmarkModal();
            }
        });

        // 快速访问链接现在由Vue组件处理，不需要在这里绑定事件

        // 右键菜单
        this.setupContextMenu();

        // 侧边栏拖拽调整宽度
        this.setupSidebarResize();
    }

    // 侧边栏拖拽调整宽度
    setupSidebarResize() {
        const resizeHandle = document.getElementById('resizeHandle');
        const sidebar = document.querySelector('.sidebar');
        
        if (!resizeHandle || !sidebar) return;
        
        // 从localStorage恢复保存的宽度
        this.restoreSidebarWidth(sidebar);
        
        let isResizing = false;
        let startX = 0;
        let startWidth = 0;
        
        resizeHandle.addEventListener('mousedown', (e) => {
            isResizing = true;
            startX = e.clientX;
            startWidth = sidebar.offsetWidth;
            resizeHandle.classList.add('active');
            document.body.style.cursor = 'col-resize';
        });
        
        document.addEventListener('mousemove', (e) => {
            if (!isResizing) return;
            
            const deltaX = e.clientX - startX;
            let newWidth = startWidth + deltaX;
            
            // 限制最小和最大宽度
            const minWidth = 200;
            const maxWidth = 600;
            
            newWidth = Math.max(minWidth, Math.min(maxWidth, newWidth));
            
            // 设置新宽度
            sidebar.style.width = `${newWidth}px`;
        });
        
        document.addEventListener('mouseup', () => {
            if (isResizing) {
                isResizing = false;
                resizeHandle.classList.remove('active');
                document.body.style.cursor = '';
                
                // 保存当前宽度到localStorage
                this.saveSidebarWidth(sidebar.offsetWidth);
            }
        });
    }

    // 保存侧边栏宽度到localStorage
    saveSidebarWidth(width) {
        try {
            localStorage.setItem('sidebarWidth', width.toString());
        } catch (error) {
            console.error('保存侧边栏宽度失败:', error);
        }
    }

    // 从localStorage恢复侧边栏宽度
    restoreSidebarWidth(sidebar) {
        try {
            const savedWidth = localStorage.getItem('sidebarWidth');
            if (savedWidth) {
                const width = parseInt(savedWidth);
                const minWidth = 200;
                const maxWidth = 600;
                
                if (width >= minWidth && width <= maxWidth) {
                    sidebar.style.width = `${width}px`;
                }
            }
        } catch (error) {
            console.error('恢复侧边栏宽度失败:', error);
        }
    }

    setupContextMenu() {
        const contextMenu = document.getElementById('contextMenu');
        
        document.addEventListener('contextmenu', (e) => {
            const bookmarkItem = e.target.closest('.bookmark-item');
            if (bookmarkItem) {
                e.preventDefault();
                this.showContextMenu(e.clientX, e.clientY, bookmarkItem);
            }
        });

        document.addEventListener('click', () => {
            contextMenu.style.display = 'none';
        });

        contextMenu.addEventListener('click', (e) => {
            const action = e.target.dataset.action;
            if (action) {
                this.handleContextAction(action);
                contextMenu.style.display = 'none';
            }
        });
    }

    showContextMenu(x, y, bookmarkItem) {
        const contextMenu = document.getElementById('contextMenu');
        contextMenu.style.display = 'block';
        contextMenu.style.left = `${x}px`;
        contextMenu.style.top = `${y}px`;
        contextMenu.dataset.bookmarkId = bookmarkItem.dataset.id;
    }

    handleContextAction(action) {
        const bookmarkId = document.getElementById('contextMenu').dataset.bookmarkId;
        const bookmark = this.bookmarks.find(b => b.id === bookmarkId);
        
        if (!bookmark) return;

        switch (action) {
            case 'open':
                if (bookmark.url) {
                    chrome.tabs.update({ url: bookmark.url });
                }
                break;
            case 'open-new-tab':
                if (bookmark.url) {
                    chrome.tabs.create({ url: bookmark.url });
                }
                break;
            case 'edit':
                this.editBookmark(bookmarkId);
                break;
            case 'copy-url':
                if (bookmark.url) {
                    navigator.clipboard.writeText(bookmark.url);
                }
                break;
            case 'delete':
                this.deleteBookmark(bookmarkId);
                break;
            case 'move':
                this.showMoveBookmarkModal(bookmarkId);
                break;
        }
    }

    renderFolderTree() {
        const container = document.getElementById('folderTree');
        const folders = this.bookmarks.filter(b => b.type === 'folder');
        
        let html = '';
        folders.forEach((folder, index) => {
            const indent = folder.level * 16;
            const isEmpty = folder.children === 0;
            // 检查是否有子文件夹（childFolders > 0 表示有子文件夹）
            const hasChildren = folder.childFolders > 0;
            html += `
                <div class="folder-item ${isEmpty ? 'empty-folder' : ''}" data-id="${this.escapeHtml(folder.id)}" data-index="${index}" style="padding-left: ${indent + 12}px">
                    ${hasChildren ? `
                    <span class="folder-toggle" title="折叠/展开">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <polyline points="6 9 12 15 18 9"></polyline>
                        </svg>
                    </span>
                    ` : '<span class="folder-toggle-placeholder"></span>'}
                    <span class="folder-icon">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M22 19a2 2 0 01-2 2H4a2 2 0 01-2-2V5a2 2 0 012-2h5l2 3h9a2 2 0 012 2z"/>
                        </svg>
                    </span>
                    <span class="folder-name">${this.escapeHtml(folder.title)}</span>
                    <span class="folder-count">(${folder.children})</span>
                    <div class="folder-actions">
                        <button class="folder-action-btn move-up-btn" title="向上移动" ${index === 0 ? 'disabled' : ''}>
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <polyline points="18 15 12 9 6 15"></polyline>
                            </svg>
                        </button>
                        <button class="folder-action-btn move-down-btn" title="向下移动" ${index === folders.length - 1 ? 'disabled' : ''}>
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <polyline points="6 9 12 15 18 9"></polyline>
                            </svg>
                        </button>
                        <button class="folder-action-btn rename-folder-btn" title="重命名文件夹">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                            </svg>
                        </button>
                        ${isEmpty ? `
                        <button class="folder-action-btn delete-folder-btn" title="删除空文件夹">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <polyline points="3 6 5 6 21 6"></polyline>
                                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                            </svg>
                        </button>
                        ` : ''}
                    </div>
                </div>
            `;
        });
        
        container.innerHTML = html;

        // 绑定文件夹点击事件
        container.querySelectorAll('.folder-item').forEach(item => {
            const folderToggle = item.querySelector('.folder-toggle');
            const folderName = item.querySelector('.folder-name');
            const renameBtn = item.querySelector('.rename-folder-btn');
            const moveUpBtn = item.querySelector('.move-up-btn');
            const moveDownBtn = item.querySelector('.move-down-btn');
            const deleteBtn = item.querySelector('.delete-folder-btn');
            
            // 点击文件夹名称进行过滤
            folderName.addEventListener('click', () => {
                this.filterByFolder(item.dataset.id);
            });
            
            // 点击折叠按钮（只对有子文件夹的文件夹绑定）
            if (folderToggle && !folderToggle.classList.contains('folder-toggle-placeholder')) {
                folderToggle.addEventListener('click', (e) => {
                    e.stopPropagation();
                    this.toggleFolder(item);
                });
            }
            
            // 点击重命名按钮
            renameBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.showRenameFolderDialog(item.dataset.id, folderName.textContent);
            });
            
            // 向上移动
            if (moveUpBtn && !moveUpBtn.disabled) {
                moveUpBtn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    this.moveFolderUp(item.dataset.id, parseInt(item.dataset.index));
                });
            }
            
            // 向下移动
            if (moveDownBtn && !moveDownBtn.disabled) {
                moveDownBtn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    this.moveFolderDown(item.dataset.id, parseInt(item.dataset.index));
                });
            }
            
            // 删除空文件夹
            if (deleteBtn) {
                deleteBtn.addEventListener('click', async (e) => {
                    e.stopPropagation();
                    await this.deleteEmptyFolder(item.dataset.id, folderName.textContent);
                });
            }
            
            // 添加拖放支持 - 允许将书签拖到文件夹
            item.addEventListener('dragover', (e) => {
                e.preventDefault();
                e.stopPropagation();
                
                console.log('📁 dragover on folder:', item.dataset.id, 'draggedElement:', this.draggedElement);
                
                if (this.draggedElement) {
                    console.log('📁 draggedElement type:', this.draggedElement.dataset.type);
                    if (this.draggedElement.dataset.type === 'bookmark') {
                        e.dataTransfer.dropEffect = 'move';
                        item.classList.add('folder-drag-over');
                        console.log('✅ 文件夹高亮显示');
                    }
                }
            });
            
            item.addEventListener('dragleave', (e) => {
                e.preventDefault();
                e.stopPropagation();
                item.classList.remove('folder-drag-over');
            });
            
            item.addEventListener('drop', async (e) => {
                e.preventDefault();
                e.stopPropagation();
                item.classList.remove('folder-drag-over');
                
                console.log('📁 drop on folder:', item.dataset.id);
                console.log('📁 draggedElement:', this.draggedElement);
                
                if (this.draggedElement && this.draggedElement.dataset.type === 'bookmark') {
                    const bookmarkId = this.draggedElement.dataset.id;
                    const folderId = item.dataset.id;
                    
                    console.log(`📁 将书签 ${bookmarkId} 移动到文件夹 ${folderId}`);
                    
                    try {
                        // 保存当前过滤状态
                        const savedFolderId = this.currentFolderId;
                        
                        // 使用Chrome API移动书签
                        await chrome.bookmarks.move(bookmarkId, { parentId: folderId });
                        
                        // 刷新数据和视图
                        await this.loadData();
                        this.renderFolderTree();
                        
                        // 如果之前有选中的文件夹，恢复过滤状态
                        if (savedFolderId) {
                            await this.filterByFolder(savedFolderId);
                        } else {
                            await this.renderBookmarksView();
                        }
                        
                        // 清理拖拽状态
                        this.cleanupDragState();
                        
                        console.log('✅ 书签移动成功');
                    } catch (error) {
                        console.error('❌ 移动书签失败:', error);
                        alert('移动失败: ' + error.message);
                    }
                } else {
                    console.log('❌ 没有拖拽元素或类型不是书签');
                }
            });
        });
    }

    // 折叠/展开文件夹
    toggleFolder(folderItem) {
        const folderId = folderItem.dataset.id;
        const folderLevel = parseInt(folderItem.style.paddingLeft) / 16 - 0.75; // 计算文件夹层级
        
        // 切换折叠状态
        folderItem.classList.toggle('collapsed');
        
        // 找到所有子文件夹并切换显示状态
        const allFolders = document.querySelectorAll('.folder-item');
        const folderIndex = Array.from(allFolders).indexOf(folderItem);
        
        for (let i = folderIndex + 1; i < allFolders.length; i++) {
            const childFolder = allFolders[i];
            const childLevel = parseInt(childFolder.style.paddingLeft) / 16 - 0.75;
            
            // 如果是子文件夹
            if (childLevel > folderLevel) {
                if (folderItem.classList.contains('collapsed')) {
                    childFolder.style.display = 'none';
                } else {
                    childFolder.style.display = 'flex';
                }
            } else {
                // 不是子文件夹，停止处理
                break;
            }
        }
        
        // 更新折叠图标
        const toggleIcon = folderItem.querySelector('.folder-toggle svg');
        if (folderItem.classList.contains('collapsed')) {
            toggleIcon.innerHTML = '<polyline points="9 18 15 12 9 6"></polyline>';
        } else {
            toggleIcon.innerHTML = '<polyline points="6 9 12 15 18 9"></polyline>';
        }
    }

    // 一键折叠所有文件夹
    collapseAllFolders() {
        const allFolders = document.querySelectorAll('.folder-item');
        
        // 按层级从高到低排序，确保先折叠子文件夹
        const foldersByLevel = Array.from(allFolders).sort((a, b) => {
            const levelA = parseInt(a.style.paddingLeft) / 16 - 0.75;
            const levelB = parseInt(b.style.paddingLeft) / 16 - 0.75;
            return levelB - levelA;
        });
        
        // 先折叠所有文件夹
        foldersByLevel.forEach(folderItem => {
            if (!folderItem.classList.contains('collapsed')) {
                folderItem.classList.add('collapsed');
                
                // 更新折叠图标
                const toggleIcon = folderItem.querySelector('.folder-toggle svg');
                if (toggleIcon) {
                    toggleIcon.innerHTML = '<polyline points="9 18 15 12 9 6"></polyline>';
                }
            }
        });
        
        // 然后隐藏所有非顶级文件夹
        allFolders.forEach(folderItem => {
            const folderLevel = parseInt(folderItem.style.paddingLeft) / 16 - 0.75;
            if (folderLevel > 0) {
                folderItem.style.display = 'none';
            }
        });
    }

    async renderBookmarksView() {
        console.log('🎨 开始渲染收藏夹视图...');
        console.log(`📊 当前过滤收藏夹数量: ${this.filteredBookmarks.length}`);
        
        // 确保工具栏显示（从快速访问返回时需要恢复）
        const toolbar = document.querySelector('.toolbar');
        if (toolbar) {
            toolbar.style.display = 'flex';
        }
        
        const container = document.getElementById('bookmarksList');
        const loadingIndicator = document.getElementById('loadingIndicator');
        const emptyState = document.getElementById('emptyState');
        
        if (!container) {
            console.error('❌ 未找到bookmarksList容器');
            return;
        }
        
        loadingIndicator.style.display = 'flex';
        
        // 清理拖拽状态
        this.cleanupDragState();
        
        loadingIndicator.style.display = 'none';
        
        if (this.filteredBookmarks.length === 0) {
            console.log('📭 没有收藏夹数据，显示空状态');
            container.innerHTML = '';
            emptyState.style.display = 'flex';
            return;
        }
        
        emptyState.style.display = 'none';
        
        let html = '';
        let bookmarkCount = 0;
        this.filteredBookmarks.forEach(bookmark => {
            if (bookmark.type === 'bookmark') {
                html += this.renderBookmarkItem(bookmark);
                bookmarkCount++;
            }
        });
        
        console.log(`📋 渲染了 ${bookmarkCount} 个收藏夹项目`);
        
        container.innerHTML = html;
        this.attachBookmarkEvents();
        this.updateStats(); // 更新统计信息
        console.log('✅ 收藏夹视图渲染完成');
    }

    renderBookmarkItem(bookmark) {
        const favicon = `https://www.google.com/s2/favicons?domain=${new URL(bookmark.url).hostname}&sz=32`;
        const visitCount = this.visitHistory[bookmark.url] || 0;
        const isSelected = this.selectedBookmarks.has(bookmark.id);
        const addedDate = new Date(bookmark.dateAdded).toLocaleDateString();
        
        // 获取分类信息
        const classificationInfo = this.getClassificationInfo(bookmark);
        
        return `
            <div class="bookmark-item ${isSelected ? 'selected' : ''}" data-id="${this.escapeHtml(bookmark.id)}" data-url="${this.escapeHtml(bookmark.url)}" data-type="bookmark" draggable="true">
                <div class="drag-handle" title="拖拽排序">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M11 18c0 1.1-.9 2-2 2s-2-.9-2-2 .9-2 2-2 2 .9 2 2zm-2-8c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0-6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm6 4c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"/>
                    </svg>
                </div>
                <img class="bookmark-favicon" src="${this.escapeHtml(favicon)}" alt="" onerror="this.src='data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIiIGhlaWdodD0iMzIiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJjdXJyZW50Q29sb3IiIHN0cm9rZS13aWR0aD0iMiI+PHBhdGggZD0iTTEwIDEzYTUgNSAwIDAgMCA3LjU0LjU0bDMtM2E1IDUgMCAwIDAtNy4wNy03LjA3bC0xLjcyIDEuNzEiLz48cGF0aCBkPSJNMTQgMTFhNSA1IDAgMCAwLTcuNTQtLjU0bC0zIDNhNSA1IDAgMCAwIDcuMDcgNy4wN2wxLjcxLTEuNzEiLz48L3N2Zz4='">
                <div class="bookmark-info">
                    <div class="bookmark-title">${this.escapeHtml(bookmark.title)}</div>
                    <div class="bookmark-url">${this.escapeHtml(bookmark.url)}</div>
                    <div class="bookmark-meta">
                        <span>访问 ${visitCount} 次</span>
                        <span>添加于 ${addedDate}</span>
                        <span>路径: ${this.escapeHtml(bookmark.path)}</span>
                        ${classificationInfo.html}
                    </div>
                </div>
                ${classificationInfo.badge}
                <div class="bookmark-actions">
                    <button class="bookmark-action-btn move-top-btn" title="置顶">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                            <polyline points="8,12 12,8 16,12"/>
                            <polyline points="8,16 12,12 16,16"/>
                        </svg>
                    </button>
                    <button class="bookmark-action-btn move-up-btn" title="向上">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M7 14l5-5 5 5"/>
                        </svg>
                    </button>
                    <button class="bookmark-action-btn move-down-btn" title="向下">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M17 10l-5 5-5-5"/>
                        </svg>
                    </button>
                    <button class="bookmark-action-btn move-bottom-btn" title="置底">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                            <polyline points="8,8 12,12 16,8"/>
                            <polyline points="8,12 12,16 16,12"/>
                        </svg>
                    </button>
                    <button class="bookmark-action-btn edit-btn" title="编辑">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/>
                            <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/>
                        </svg>
                    </button>
                    <button class="bookmark-action-btn delete-btn" title="删除">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <polyline points="3,6 5,6 21,6"/>
                            <path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/>
                        </svg>
                    </button>
                </div>
                <input type="checkbox" class="bookmark-checkbox" ${isSelected ? 'checked' : ''}>
            </div>
        `;
    }

    getClassificationInfo(bookmark) {
        // 从本地存储获取分类历史
        const classificationKey = `classification_${bookmark.id}`;
        const storedClassification = localStorage.getItem(classificationKey);
        
        if (storedClassification) {
            try {
                const classification = JSON.parse(storedClassification);
                const method = classification.method;
                const confidence = classification.confidence;
                const timestamp = new Date(classification.timestamp).toLocaleString();
                
                let badge = '';
                let metaInfo = '';
                
                if (method === 'auto') {
                    badge = `<span class="classification-badge auto-badge" title="自动分类 - 置信度: ${Math.round(confidence * 100)}%">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M22 19a2 2 0 01-2 2H4a2 2 0 01-2-2V5a2 2 0 012-2h5l2 3h9a2 2 0 012 2z"/>
                        </svg>
                    </span>`;
                    metaInfo = `<span class="classification-info">自动分类 (${Math.round(confidence * 100)}%) - ${timestamp}</span>`;
                } else if (method === 'llm') {
                    badge = `<span class="classification-badge llm-badge" title="AI智能分类 - 置信度: ${Math.round(confidence * 100)}%">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <rect x="3" y="11" width="18" height="10" rx="2"/>
                            <circle cx="12" cy="5" r="2"/>
                            <path d="M12 7v4M8 16h.01M12 16h.01M16 16h.01"/>
                        </svg>
                    </span>`;
                    metaInfo = `<span class="classification-info">AI分类 (${Math.round(confidence * 100)}%) - ${timestamp}</span>`;
                } else if (method === 'rules') {
                    badge = `<span class="classification-badge rules-badge" title="规则分类 - 置信度: ${Math.round(confidence * 100)}%">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/>
                            <polyline points="14,2 14,8 20,8"/>
                            <line x1="9" y1="15" x2="15" y2="15"/>
                        </svg>
                    </span>`;
                    metaInfo = `<span class="classification-info">规则分类 (${Math.round(confidence * 100)}%) - ${timestamp}</span>`;
                }
                
                return {
                    badge: badge,
                    html: metaInfo
                };
            } catch (error) {
                console.error('解析分类信息失败:', error);
            }
        }
        
        return { badge: '', html: '' };
    }

    attachBookmarkEvents() {
        // 收藏夹项目点击
        document.querySelectorAll('.bookmark-item').forEach(item => {
            item.addEventListener('click', (e) => {
                if (e.target.type === 'checkbox') return;
                if (e.target.closest('.bookmark-actions')) return;
                
                const url = item.dataset.url;
                this.recordVisit(url);
                chrome.tabs.create({ url });
            });

            // 复选框
            const checkbox = item.querySelector('.bookmark-checkbox');
            checkbox.addEventListener('change', (e) => {
                e.stopPropagation();
                this.toggleBookmarkSelection(item.dataset.id, checkbox.checked);
            });
        });

        // 编辑按钮
        document.querySelectorAll('.edit-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const bookmarkId = e.target.closest('.bookmark-item').dataset.id;
                this.editBookmark(bookmarkId);
            });
        });

        // 删除按钮
        document.querySelectorAll('.delete-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const bookmarkId = e.target.closest('.bookmark-item').dataset.id;
                this.deleteBookmark(bookmarkId);
            });
        });
        
        // 置顶按钮
        document.querySelectorAll('.move-top-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const bookmarkId = e.target.closest('.bookmark-item').dataset.id;
                this.moveBookmark(bookmarkId, 'top');
            });
        });
        
        // 向上按钮
        document.querySelectorAll('.move-up-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const bookmarkId = e.target.closest('.bookmark-item').dataset.id;
                this.moveBookmark(bookmarkId, 'up');
            });
        });
        
        // 向下按钮
        document.querySelectorAll('.move-down-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const bookmarkId = e.target.closest('.bookmark-item').dataset.id;
                this.moveBookmark(bookmarkId, 'down');
            });
        });
        
        // 置底按钮
        document.querySelectorAll('.move-bottom-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const bookmarkId = e.target.closest('.bookmark-item').dataset.id;
                this.moveBookmark(bookmarkId, 'bottom');
            });
        });
        
        // 拖拽排序
        try {
            // 延迟初始化拖拽功能，确保DOM完全更新
            setTimeout(() => {
                this.initDragAndDrop();
            }, 100);
        } catch (error) {
            console.error('❌ 初始化拖拽功能失败:', error);
        }
    }

    async switchView(viewType) {
        this.currentView = viewType;
        
        // 清理所有拖拽状态
        this.cleanupDragState();
        
        // 更新按钮状态
        document.querySelectorAll('.view-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.getElementById(`${viewType}ViewBtn`).classList.add('active');
        
        // 更新容器类名
        const container = document.getElementById('bookmarksList');
        container.className = `bookmarks-list ${viewType}-view`;
        
        await this.renderBookmarksView();
    }
    
    // 清理拖拽状态
    cleanupDragState() {
        // 清除所有拖拽相关的CSS类
        document.querySelectorAll('.bookmark-item').forEach(item => {
            item.classList.remove('dragging', 'drag-over');
        });
        
        // 移除所有占位符
        document.querySelectorAll('.drag-placeholder').forEach(placeholder => {
            if (placeholder.parentNode) {
                placeholder.parentNode.removeChild(placeholder);
            }
        });
        
        // 重置拖拽变量
        if (this.draggedElement) {
            this.draggedElement = null;
        }
        if (this.placeholder) {
            this.placeholder = null;
        }
        
        console.log('🧹 已清理拖拽状态');
    }
    
    // 禁用拖拽功能
    disableDragAndDrop() {
        const bookmarksList = document.getElementById('bookmarksList');
        if (!bookmarksList) return;
        
        // 移除拖拽属性
        document.querySelectorAll('.bookmark-item').forEach(item => {
            item.removeAttribute('draggable');
        });
        
        // 移除事件监听器
        const events = ['dragstart', 'dragend', 'dragover', 'dragenter', 'dragleave', 'drop'];
        events.forEach(eventType => {
            bookmarksList.removeEventListener(eventType, this[`handle${eventType.charAt(0).toUpperCase() + eventType.slice(1)}`]);
        });
    }
    
    // 添加批量模式视觉提示
    addBatchModeVisual() {
        const bookmarksList = document.getElementById('bookmarksList');
        if (bookmarksList) {
            bookmarksList.classList.add('batch-sort-mode');
        }
        
        // 创建模式提示
        if (!document.querySelector('.sort-mode-indicator')) {
            const indicator = document.createElement('div');
            indicator.className = 'sort-mode-indicator';
            indicator.innerHTML = '📋 批量排序模式 - 拖拽已禁用';
            document.body.appendChild(indicator);
        }
    }
    
    // 移除批量模式视觉提示
    removeBatchModeVisual() {
        const bookmarksList = document.getElementById('bookmarksList');
        if (bookmarksList) {
            bookmarksList.classList.remove('batch-sort-mode');
        }
        
        const indicator = document.querySelector('.sort-mode-indicator');
        if (indicator) {
            indicator.remove();
        }
    }
    
    // 更新选中项计数
    updateSelectedCount() {
        // 只在控制台输出选中数量，因为UI中已经没有显示元素了
        console.log(`📋 当前选中: ${this.selectedBookmarks.size} 项`);
    }
    
    // 处理选择变化
    handleSelectionChange() {
        this.updateSelectedCount();
        
        // 根据选择状态切换拖拽功能
        if (this.selectedBookmarks.size > 0) {
            this.addBatchModeVisual();
            this.disableDragAndDrop();
        } else {
            this.removeBatchModeVisual();
            // 延迟重新启用拖拽，避免冲突
            setTimeout(() => {
                this.initDragAndDrop();
            }, 100);
        }
    }

    async handleSearch(query) {
        if (!query.trim()) {
            this.filteredBookmarks = [...this.bookmarks];
        } else {
            const lowerQuery = query.toLowerCase();
            this.filteredBookmarks = this.bookmarks.filter(bookmark => 
                bookmark.title.toLowerCase().includes(lowerQuery) ||
                (bookmark.url && bookmark.url.toLowerCase().includes(lowerQuery)) ||
                bookmark.path.toLowerCase().includes(lowerQuery)
            );
        }
        await this.renderBookmarksView();
    }

    async setFilter(filterType) {
        this.currentFilter = filterType;
        
        // 清除文件夹过滤状态
        this.currentFolderId = null;
        
        // 更新侧边栏状态
        document.querySelectorAll('.quick-access a').forEach(link => {
            link.classList.remove('active');
        });
        document.querySelector(`[data-filter="${filterType}"]`).classList.add('active');
        
        // 应用过滤
        switch (filterType) {
            case 'all':
                this.filteredBookmarks = [...this.bookmarks];
                break;
            case 'recent':
                this.filteredBookmarks = this.bookmarks
                    .filter(b => b.type === 'bookmark')
                    .sort((a, b) => (b.dateAdded || 0) - (a.dateAdded || 0))
                    .slice(0, 50);
                break;
            case 'frequent':
                this.filteredBookmarks = this.bookmarks
                    .filter(b => b.type === 'bookmark')
                    .sort((a, b) => {
                        const freqA = this.visitHistory[a.url] || 0;
                        const freqB = this.visitHistory[b.url] || 0;
                        return freqB - freqA;
                    })
                    .slice(0, 50);
                break;
            case 'unorganized':
                this.filteredBookmarks = this.bookmarks.filter(b => 
                    b.type === 'bookmark' && b.path === '收藏夹栏'
                );
                break;
        }
        
        await this.renderBookmarksView();
        this.updateBreadcrumb();
    }

    async filterByFolder(folderId) {
        const folder = this.bookmarks.find(b => b.id === folderId);
        if (!folder) return;
        
        // 保存当前文件夹ID
        this.currentFolderId = folderId;
        
        // 清除快速访问的激活状态
        document.querySelectorAll('.quick-access a').forEach(link => {
            link.classList.remove('active');
        });
        
        this.filteredBookmarks = this.bookmarks.filter(b => 
            b.parentId === folderId || b.path.includes(folder.title)
        );
        
        await this.renderBookmarksView();
        this.updateBreadcrumb(folder.title);
    }

    // 显示新增文件夹对话框
    async showAddFolderDialog() {
        const folderName = prompt('请输入新文件夹名称：');
        if (!folderName || !folderName.trim()) return;
        
        try {
            // 在书签栏根目录创建新文件夹
            const newFolder = await chrome.bookmarks.create({
                parentId: '1', // 书签栏的ID通常是'1'
                title: folderName.trim()
            });
            
            console.log('✅ 文件夹创建成功:', newFolder);
            alert(`文件夹 "${folderName}" 创建成功！`);
            
            // 刷新数据
            await this.loadData();
            this.renderFolderTree();
            await this.renderBookmarksView();
        } catch (error) {
            console.error('❌ 创建文件夹失败:', error);
            alert('创建文件夹失败，请重试');
        }
    }

    // 显示重命名文件夹对话框
    async showRenameFolderDialog(folderId, currentName) {
        const newName = prompt('请输入新的文件夹名称：', currentName);
        if (!newName || !newName.trim() || newName === currentName) return;
        
        try {
            await chrome.bookmarks.update(folderId, {
                title: newName.trim()
            });
            
            console.log('✅ 文件夹重命名成功');
            alert(`文件夹已重命名为 "${newName}"`);
            
            // 刷新数据
            await this.loadData();
            this.renderFolderTree();
            await this.renderBookmarksView();
        } catch (error) {
            console.error('❌ 重命名文件夹失败:', error);
            alert('重命名失败，请重试');
        }
    }

    // 向上移动文件夹
    async moveFolderUp(folderId, currentIndex) {
        try {
            const folders = this.bookmarks.filter(b => b.type === 'folder');
            if (currentIndex === 0) return;
            
            const currentFolder = folders[currentIndex];
            const targetFolder = folders[currentIndex - 1];
            
            // 检查是否在同一个父文件夹下
            if (currentFolder.parentId !== targetFolder.parentId) {
                alert('只能在同一文件夹内移动');
                return;
            }
            
            // 获取当前文件夹的详细信息
            const [folderInfo] = await chrome.bookmarks.get(folderId);
            const currentRealIndex = folderInfo.index;
            
            console.log(`当前文件夹: ${currentFolder.title}, 真实索引: ${currentRealIndex}`);
            
            // 向上移动一位
            if (currentRealIndex > 0) {
                await chrome.bookmarks.move(folderId, {
                    parentId: currentFolder.parentId,
                    index: currentRealIndex - 1
                });
                console.log('✅ 文件夹上移成功');
            }
            
            await this.loadData();
            this.renderFolderTree();
        } catch (error) {
            console.error('❌ 移动文件夹失败:', error);
            alert('移动失败：' + error.message);
        }
    }

    // 向下移动文件夹
    async moveFolderDown(folderId, currentIndex) {
        try {
            const folders = this.bookmarks.filter(b => b.type === 'folder');
            if (currentIndex === folders.length - 1) return;
            
            const currentFolder = folders[currentIndex];
            const nextFolder = folders[currentIndex + 1];
            
            // 检查是否在同一个父文件夹下
            if (currentFolder.parentId !== nextFolder.parentId) {
                alert('只能在同一文件夹内移动');
                return;
            }
            
            // 获取当前文件夹的详细信息
            const [folderInfo] = await chrome.bookmarks.get(folderId);
            const currentRealIndex = folderInfo.index;
            
            console.log(`当前文件夹: ${currentFolder.title}, 真实索引: ${currentRealIndex}`);
            
            // 向下移动一位（需要+2因为要跳过下一个位置）
            await chrome.bookmarks.move(folderId, {
                parentId: currentFolder.parentId,
                index: currentRealIndex + 2
            });
            console.log('✅ 文件夹下移成功');
            
            await this.loadData();
            this.renderFolderTree();
        } catch (error) {
            console.error('❌ 移动文件夹失败:', error);
            alert('移动失败：' + error.message);
        }
    }

    // 删除空文件夹
    async deleteEmptyFolder(folderId, folderName) {
        try {
            // 再次确认文件夹为空
            const children = await chrome.bookmarks.getChildren(folderId);
            if (children.length > 0) {
                alert('该文件夹不为空，无法删除');
                return;
            }
            
            if (confirm(`确定要删除空文件夹"${folderName}"吗？`)) {
                await chrome.bookmarks.remove(folderId);
                console.log('✅ 空文件夹删除成功:', folderName);
                
                // 刷新数据
                await this.loadData();
                this.renderFolderTree();
                await this.renderBookmarksView();
            }
        } catch (error) {
            console.error('❌ 删除文件夹失败:', error);
            alert('删除失败：' + error.message);
        }
    }

    // 批量清理空文件夹
    async cleanEmptyFolders() {
        try {
            // 找出所有空文件夹
            const emptyFolders = this.bookmarks.filter(b => 
                b.type === 'folder' && b.children === 0
            );
            
            if (emptyFolders.length === 0) {
                alert('没有找到空文件夹');
                return;
            }
            
            const folderNames = emptyFolders.map(f => f.title).join('\n');
            if (confirm(`找到 ${emptyFolders.length} 个空文件夹：\n\n${folderNames}\n\n确定要全部删除吗？`)) {
                let successCount = 0;
                let failCount = 0;
                
                for (const folder of emptyFolders) {
                    try {
                        // 再次确认文件夹为空
                        const children = await chrome.bookmarks.getChildren(folder.id);
                        if (children.length === 0) {
                            await chrome.bookmarks.remove(folder.id);
                            successCount++;
                            console.log('✅ 删除空文件夹:', folder.title);
                        }
                    } catch (error) {
                        failCount++;
                        console.error('❌ 删除文件夹失败:', folder.title, error);
                    }
                }
                
                // 刷新数据
                await this.loadData();
                this.renderFolderTree();
                await this.renderBookmarksView();
                
                alert(`清理完成！\n成功删除: ${successCount} 个\n失败: ${failCount} 个`);
            }
        } catch (error) {
            console.error('❌ 清理空文件夹失败:', error);
            alert('清理失败：' + error.message);
        }
    }

    updateBreadcrumb(path = '所有收藏夹') {
        document.getElementById('currentPath').textContent = path;
    }

    async sortBookmarks(sortType) {
        // 如果有选中的项目，只对选中的项目进行排序
        if (this.selectedBookmarks.size > 0) {
            await this.sortSelectedBookmarks(sortType);
        } else {
            // 对当前显示的列表进行排序
            await this.sortCurrentView(sortType);
        }
    }

    async sortCurrentView(sortType) {
        // 保存当前过滤状态
        const savedFolderId = this.currentFolderId;
        const savedFilter = this.currentFilter;
        
        // 先对本地数组排序
        switch (sortType) {
            case 'name':
                this.filteredBookmarks.sort((a, b) => a.title.localeCompare(b.title, 'zh-CN'));
                break;
            case 'date':
                this.filteredBookmarks.sort((a, b) => (b.dateAdded || 0) - (a.dateAdded || 0));
                break;
            case 'frequency':
                this.filteredBookmarks.sort((a, b) => {
                    const freqA = this.visitHistory[a.url] || 0;
                    const freqB = this.visitHistory[b.url] || 0;
                    return freqB - freqA;
                });
                break;
            case 'smart':
                this.smartSort();
                break;
        }

        // 将排序结果同步到Edge收藏夹
        try {
            // 只处理书签类型的项目，跳过文件夹
            const bookmarksOnly = this.filteredBookmarks.filter(b => b.type === 'bookmark');
            
            // 按父文件夹分组
            const bookmarksByParent = {};
            bookmarksOnly.forEach(bookmark => {
                if (!bookmarksByParent[bookmark.parentId]) {
                    bookmarksByParent[bookmark.parentId] = [];
                }
                bookmarksByParent[bookmark.parentId].push(bookmark);
            });
            
            // 对每个父文件夹内的书签进行排序
            for (const parentId in bookmarksByParent) {
                const bookmarks = bookmarksByParent[parentId];
                for (let i = 0; i < bookmarks.length; i++) {
                    const bookmark = bookmarks[i];
                    await chrome.bookmarks.move(bookmark.id, {
                        parentId: bookmark.parentId,
                        index: i
                    });
                }
            }
            
            console.log(`✅ 已对当前视图的 ${bookmarksOnly.length} 个书签进行排序并同步到Edge`);
            
            // 重新从Edge加载数据以确保显示正确的顺序
            await this.loadData();
            
            // 恢复之前的过滤状态
            if (savedFolderId) {
                await this.filterByFolder(savedFolderId);
            } else if (savedFilter && savedFilter !== 'all') {
                await this.filterBookmarks(savedFilter);
            } else {
                await this.renderBookmarksView();
            }
            
        } catch (error) {
            console.error('❌ 排序同步失败:', error);
            // 如果失败，仍然渲染本地排序结果
            await this.renderBookmarksView();
        }
    }
    
    async sortAllBookmarks(sortType) {
        // 先对本地数组排序
        switch (sortType) {
            case 'name':
                this.filteredBookmarks.sort((a, b) => a.title.localeCompare(b.title));
                break;
            case 'date':
                this.filteredBookmarks.sort((a, b) => (b.dateAdded || 0) - (a.dateAdded || 0));
                break;
            case 'frequency':
                this.filteredBookmarks.sort((a, b) => {
                    const freqA = this.visitHistory[a.url] || 0;
                    const freqB = this.visitHistory[b.url] || 0;
                    return freqB - freqA;
                });
                break;
            case 'smart':
                this.smartSort();
                break;
        }

        // 将排序结果应用到浏览器收藏夹
        try {
            // 只处理书签类型的项目，跳过文件夹
            const bookmarksOnly = this.filteredBookmarks.filter(b => b.type === 'bookmark');
            
            for (let i = 0; i < bookmarksOnly.length; i++) {
                const bookmark = bookmarksOnly[i];
                await chrome.bookmarks.move(bookmark.id, {
                    parentId: bookmark.parentId, // 保持在原文件夹
                    index: i
                });
            }
            
            console.log(`✅ 已对 ${bookmarksOnly.length} 个收藏夹进行全局排序`);
            
            // 重新从浏览器加载数据以确保显示正确
            await this.refresh();
            
        } catch (error) {
            console.error('❌ 全局排序失败:', error);
            // 如果排序失败，也要刷新以恢复正确状态
            await this.refresh();
        }
    }

    async sortSelectedBookmarks(sortType) {
        if (this.selectedBookmarks.size === 0) return;
        
        const selected = Array.from(this.selectedBookmarks).map(id => 
            this.filteredBookmarks.find(b => b.id === id)
        ).filter(Boolean);
        
        // 根据排序类型对选中项目排序
        switch (sortType) {
            case 'name':
                selected.sort((a, b) => a.title.localeCompare(b.title, 'zh-CN'));
                break;
            case 'date':
                selected.sort((a, b) => (b.dateAdded || 0) - (a.dateAdded || 0));
                break;
            case 'frequency':
                selected.sort((a, b) => {
                    const freqA = this.visitHistory[a.url] || 0;
                    const freqB = this.visitHistory[b.url] || 0;
                    return freqB - freqA;
                });
                break;
            case 'smart':
                // 智能排序逻辑
                const now = Date.now();
                const dayMs = 24 * 60 * 60 * 1000;
                selected.sort((a, b) => {
                    const freqA = this.visitHistory[a.url] || 0;
                    const freqB = this.visitHistory[b.url] || 0;
                    const ageA = (now - (a.dateAdded || 0)) / dayMs;
                    const ageB = (now - (b.dateAdded || 0)) / dayMs;
                    const scoreA = freqA / Math.max(1, ageA / 30);
                    const scoreB = freqB / Math.max(1, ageB / 30);
                    return scoreB - scoreA;
                });
                break;
        }
        
        await this.reorderSelectedBookmarks(selected);
    }

    async reorderSelectedBookmarks(sortedBookmarks) {
        try {
            // 获取当前父文件夹
            const parentId = sortedBookmarks[0]?.parentId || this.currentFolderId;
            
            // 重新排序Chrome书签
            for (let i = 0; i < sortedBookmarks.length; i++) {
                const bookmark = sortedBookmarks[i];
                await chrome.bookmarks.move(bookmark.id, {
                    parentId: parentId,
                    index: i
                });
            }
            
            // 刷新显示
            await this.refresh();
            console.log(`✅ 已批量排序 ${sortedBookmarks.length} 个收藏夹`);
        } catch (error) {
            console.error('❌ 批量排序失败:', error);
        }
    }

    smartSort() {
        const now = Date.now();
        const dayMs = 24 * 60 * 60 * 1000;
        
        this.filteredBookmarks.sort((a, b) => {
            if (a.type === 'folder' && b.type !== 'folder') return -1;
            if (b.type === 'folder' && a.type !== 'folder') return 1;
            
            if (a.type === 'bookmark' && b.type === 'bookmark') {
                const freqA = this.visitHistory[a.url] || 0;
                const freqB = this.visitHistory[b.url] || 0;
                const ageA = (now - (a.dateAdded || 0)) / dayMs;
                const ageB = (now - (b.dateAdded || 0)) / dayMs;
                
                const scoreA = freqA * 10 + Math.max(0, 30 - ageA);
                const scoreB = freqB * 10 + Math.max(0, 30 - ageB);
                
                return scoreB - scoreA;
            }
            
            return a.title.localeCompare(b.title);
        });
    }

    toggleBookmarkSelection(bookmarkId, selected) {
        if (selected) {
            this.selectedBookmarks.add(bookmarkId);
            // 检查是否需要更新按钮状态
            this.checkAndUpdateButtonState();
        } else {
            this.selectedBookmarks.delete(bookmarkId);
            // 检查是否需要重置按钮状态
            this.checkAndResetButtonState();
        }
        
        this.updateSelectionUI();
        // 触发选择变化，自动切换排序模式
        this.handleSelectionChange();
    }

    async toggleSelectAll() {
        const visibleBookmarks = this.filteredBookmarks.filter(b => b.type === 'bookmark');
        const allSelected = visibleBookmarks.every(b => this.selectedBookmarks.has(b.id));
        
        // 获取工具栏按钮
        const selectAllBtn = document.getElementById('selectAllBtn');
        const selectAllBtnText = selectAllBtn.querySelector('.btn-text');
        const selectAllBtnIcon = selectAllBtn.querySelector('.btn-icon');
        
        // 获取右侧工具栏按钮
        const selectAllItemsBtn = document.getElementById('selectAllItemsBtn');
        const selectAllItemsBtnText = selectAllItemsBtn ? selectAllItemsBtn.querySelector('.text') : null;
        
        if (allSelected) {
            // 取消全选
            visibleBookmarks.forEach(b => this.selectedBookmarks.delete(b.id));
            // 恢复工具栏按钮状态
            selectAllBtnText.textContent = '全选';
            selectAllBtnIcon.innerHTML = '<polyline points="20,6 9,17 4,12"/>';
            // 恢复右侧工具栏按钮状态
            if (selectAllItemsBtnText) {
                selectAllItemsBtnText.textContent = '全选';
            }
        } else {
            // 全选
            visibleBookmarks.forEach(b => this.selectedBookmarks.add(b.id));
            // 切换工具栏按钮状态
            selectAllBtnText.textContent = '取消';
            selectAllBtnIcon.innerHTML = '<rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><line x1="9" y1="9" x2="15" y2="15"/><line x1="15" y1="9" x2="9" y2="15"/>';
            // 切换右侧工具栏按钮状态
            if (selectAllItemsBtnText) {
                selectAllItemsBtnText.textContent = '取消全选';
            }
        }
        
        await this.renderBookmarksView();
        this.updateSelectionUI();
        // 触发选择变化，自动切换排序模式
        this.handleSelectionChange();
    }

    
    resetButtonState() {
        const selectAllBtn = document.getElementById('selectAllBtn');
        const selectAllBtnText = selectAllBtn.querySelector('.btn-text');
        const selectAllBtnIcon = selectAllBtn.querySelector('.btn-icon');
        
        // 恢复工具栏按钮到初始状态
        selectAllBtnText.textContent = '全选';
        selectAllBtnIcon.innerHTML = '<polyline points="20,6 9,17 4,12"/>';
        
        // 恢复右侧工具栏按钮到初始状态
        const selectAllItemsBtn = document.getElementById('selectAllItemsBtn');
        if (selectAllItemsBtn) {
            const selectAllItemsBtnText = selectAllItemsBtn.querySelector('.text');
            if (selectAllItemsBtnText) {
                selectAllItemsBtnText.textContent = '全选';
            }
        }
    }

    checkAndResetButtonState() {
        const visibleBookmarks = this.filteredBookmarks.filter(b => b.type === 'bookmark');
        const allSelected = visibleBookmarks.every(b => this.selectedBookmarks.has(b.id));
        const selectAllBtn = document.getElementById('selectAllBtn');
        const selectAllBtnText = selectAllBtn.querySelector('.btn-text');
        
        // 检查右侧工具栏按钮
        const selectAllItemsBtn = document.getElementById('selectAllItemsBtn');
        const selectAllItemsBtnText = selectAllItemsBtn ? selectAllItemsBtn.querySelector('.text') : null;
        
        // 如果按钮当前显示"取消"但不再是全选状态，则重置
        if (selectAllBtnText.textContent === '取消' && !allSelected) {
            this.resetButtonState();
        }
        if (selectAllItemsBtnText && selectAllItemsBtnText.textContent === '取消全选' && !allSelected) {
            this.resetButtonState();
        }
    }

    checkAndUpdateButtonState() {
        const visibleBookmarks = this.filteredBookmarks.filter(b => b.type === 'bookmark');
        const allSelected = visibleBookmarks.every(b => this.selectedBookmarks.has(b.id));
        const selectAllBtn = document.getElementById('selectAllBtn');
        const selectAllBtnText = selectAllBtn.querySelector('.btn-text');
        
        // 检查右侧工具栏按钮
        const selectAllItemsBtn = document.getElementById('selectAllItemsBtn');
        const selectAllItemsBtnText = selectAllItemsBtn ? selectAllItemsBtn.querySelector('.text') : null;
        
        // 如果所有书签都被选中且按钮当前显示"全选"，则切换到"取消"状态
        if (allSelected && selectAllBtnText.textContent === '全选') {
            selectAllBtnText.textContent = '取消';
            selectAllBtn.querySelector('.btn-icon').textContent = '✗';
        }
        if (selectAllItemsBtnText && allSelected && selectAllItemsBtnText.textContent === '全选') {
            selectAllItemsBtnText.textContent = '取消全选';
        }
    }

    updateSelectionUI() {
        const selectedCount = this.selectedBookmarks.size;
        const deleteBtn = document.getElementById('deleteSelectedBtn');
        const deleteBtnText = deleteBtn.querySelector('.btn-text');
        
        deleteBtn.disabled = selectedCount === 0;
        deleteBtnText.textContent = selectedCount > 0 ? `删除选中 (${selectedCount})` : '删除选中';
        
        // 同时更新右侧工具栏的删除按钮
        const deleteItemsBtn = document.getElementById('deleteSelectedItemsBtn');
        if (deleteItemsBtn) {
            const deleteItemsBtnText = deleteItemsBtn.querySelector('.text');
            deleteItemsBtn.disabled = selectedCount === 0;
            if (deleteItemsBtnText) {
                deleteItemsBtnText.textContent = selectedCount > 0 ? `删除选中 (${selectedCount})` : '删除选中';
            }
        }
        
        document.getElementById('selectionStats').textContent = `已选择: ${selectedCount} 个项目`;
    }

    updateStats() {
        const totalBookmarks = this.bookmarks.filter(b => b.type === 'bookmark').length;
        const totalFolders = this.bookmarks.filter(b => b.type === 'folder').length;
        
        // 更新右侧统计面板
        const totalBookmarksEl = document.getElementById('totalBookmarks');
        const totalFoldersEl = document.getElementById('totalFolders');
        
        if (totalBookmarksEl) {
            totalBookmarksEl.textContent = totalBookmarks;
        }
        
        if (totalFoldersEl) {
            totalFoldersEl.textContent = totalFolders;
        }
        
        // 更新底部总计信息（如果存在）
        const totalStatsEl = document.getElementById('totalStats');
        if (totalStatsEl) {
            totalStatsEl.textContent = 
                `总计: ${totalBookmarks} 个收藏夹, ${totalFolders} 个文件夹`;
        }
    }

    async recordVisit(url) {
        this.visitHistory[url] = (this.visitHistory[url] || 0) + 1;
        try {
            await chrome.storage.local.set({ visitHistory: this.visitHistory });
        } catch (error) {
            console.error('保存访问历史失败:', error);
        }
    }

    async editBookmark(bookmarkId) {
        try {
            const bookmark = await chrome.bookmarks.get(bookmarkId);
            
            // 填充弹窗表单
            document.getElementById('editBookmarkTitle').value = bookmark[0].title;
            document.getElementById('editBookmarkUrl').value = bookmark[0].url;
            
            // 显示弹窗
            const modal = document.getElementById('editBookmarkModal');
            modal.classList.add('modal-visible');
            modal.style.display = 'flex';
            
            // 保存当前编辑的收藏夹ID
            this.currentEditingBookmarkId = bookmarkId;
        } catch (error) {
            console.error('编辑收藏夹失败:', error);
        }
    }

    async saveEditBookmark() {
        try {
            const newTitle = document.getElementById('editBookmarkTitle').value.trim();
            const newUrl = document.getElementById('editBookmarkUrl').value.trim();
            
            if (!newTitle || !newUrl) {
                alert('请填写标题和URL');
                return;
            }
            
            if (this.currentEditingBookmarkId) {
                await chrome.bookmarks.update(this.currentEditingBookmarkId, {
                    title: newTitle,
                    url: newUrl
                });
                this.hideEditBookmarkModal();
                this.refresh();
            }
        } catch (error) {
            console.error('保存收藏夹失败:', error);
        }
    }

    hideEditBookmarkModal() {
        const modal = document.getElementById('editBookmarkModal');
        modal.classList.remove('modal-visible');
        modal.style.display = 'none';
        this.currentEditingBookmarkId = null;
    }

    async showMoveBookmarkModal(bookmarkId) {
        try {
            // 保存当前编辑的收藏夹ID
            this.currentMovingBookmarkId = bookmarkId;
            
            // 获取所有文件夹
            const folders = this.bookmarks.filter(b => b.type === 'folder');
            
            // 填充文件夹下拉列表
            const select = document.getElementById('moveToFolderSelect');
            select.innerHTML = '';
            
            // 添加书签栏根目录
            const rootOption = document.createElement('option');
            rootOption.value = '1'; // 书签栏的ID通常是'1'
            rootOption.textContent = '书签栏';
            select.appendChild(rootOption);
            
            // 添加其他文件夹
            folders.forEach(folder => {
                const option = document.createElement('option');
                option.value = folder.id;
                
                // 添加缩进以显示层级关系
                const indent = folder.level * 2;
                option.textContent = ' '.repeat(indent) + folder.title;
                
                select.appendChild(option);
            });
            
            // 显示弹窗
            const modal = document.getElementById('moveBookmarkModal');
            modal.classList.add('modal-visible');
            modal.style.display = 'flex';
        } catch (error) {
            console.error('显示移动弹窗失败:', error);
        }
    }

    async moveBookmarkToFolder() {
        try {
            const folderId = document.getElementById('moveToFolderSelect').value;
            
            if (this.currentMovingBookmarkId) {
                // 使用Chrome API移动书签
                await chrome.bookmarks.move(this.currentMovingBookmarkId, {
                    parentId: folderId
                });
                
                this.hideMoveBookmarkModal();
                this.refresh();
            }
        } catch (error) {
            console.error('移动收藏夹失败:', error);
        }
    }

    hideMoveBookmarkModal() {
        const modal = document.getElementById('moveBookmarkModal');
        modal.classList.remove('modal-visible');
        modal.style.display = 'none';
        this.currentMovingBookmarkId = null;
    }

    async deleteBookmark(bookmarkId) {
        if (confirm('确定要删除这个收藏夹吗？')) {
            try {
                await chrome.bookmarks.remove(bookmarkId);
                this.refresh();
            } catch (error) {
                console.error('删除收藏夹失败:', error);
            }
        }
    }

    async deleteSelected() {
        if (this.selectedBookmarks.size === 0) return;
        
        if (confirm(`确定要删除选中的 ${this.selectedBookmarks.size} 个收藏夹吗？`)) {
            try {
                for (const bookmarkId of this.selectedBookmarks) {
                    await chrome.bookmarks.remove(bookmarkId);
                }
                this.selectedBookmarks.clear();
                this.resetButtonState();
                this.refresh();
            } catch (error) {
                console.error('批量删除失败:', error);
            }
        }
    }

    exportBookmarks() {
        const exportData = {
            bookmarks: this.bookmarks,
            visitHistory: this.visitHistory,
            exportDate: new Date().toISOString(),
            version: '1.0'
        };
        
        const blob = new Blob([JSON.stringify(exportData, null, 2)], {
            type: 'application/json'
        });
        
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `bookmarks_${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        
        URL.revokeObjectURL(url);
    }

    async importBookmarks(file) {
        if (!file) return;
        
        try {
            const text = await file.text();
            const data = JSON.parse(text);
            
            if (!data.bookmarks || !Array.isArray(data.bookmarks)) {
                alert('文件格式错误：缺少 bookmarks 数组');
                return;
            }
            
            const confirmMsg = `准备导入 ${data.bookmarks.length} 个项目（包括文件夹和书签）\n\n` +
                `导入位置：书签栏\n\n` +
                `是否继续？`;
            
            if (!confirm(confirmMsg)) {
                return;
            }
            
            console.log('📥 开始导入书签...');
            
            // 创建文件夹和书签的映射
            const idMapping = {}; // 旧ID -> 新ID的映射
            
            // 按层级排序，确保父文件夹先创建
            const sortedItems = data.bookmarks.sort((a, b) => a.level - b.level);
            
            let importedCount = 0;
            let folderCount = 0;
            let bookmarkCount = 0;
            
            for (const item of sortedItems) {
                try {
                    // 跳过根节点（收藏夹栏本身）
                    if (item.id === '0' || item.id === '1' || item.parentId === '0') {
                        if (item.id === '1') {
                            idMapping[item.id] = '1'; // 书签栏映射到浏览器的书签栏
                        }
                        continue;
                    }
                    
                    // 确定父文件夹ID
                    let parentId = idMapping[item.parentId] || '1'; // 默认放在书签栏
                    
                    if (item.type === 'folder') {
                        // 创建文件夹
                        const newFolder = await chrome.bookmarks.create({
                            parentId: parentId,
                            title: item.title
                        });
                        idMapping[item.id] = newFolder.id;
                        folderCount++;
                        console.log(`✅ 已创建文件夹: ${item.title}`);
                    } else if (item.type === 'bookmark' && item.url) {
                        // 创建书签
                        const newBookmark = await chrome.bookmarks.create({
                            parentId: parentId,
                            title: item.title,
                            url: item.url
                        });
                        idMapping[item.id] = newBookmark.id;
                        bookmarkCount++;
                    }
                    
                    importedCount++;
                    
                    // 每10个项目延迟一下，避免API限制
                    if (importedCount % 10 === 0) {
                        await new Promise(resolve => setTimeout(resolve, 50));
                    }
                    
                } catch (error) {
                    console.error(`❌ 导入失败: ${item.title}`, error);
                }
            }
            
            // 导入访问历史（如果有）
            if (data.visitHistory) {
                this.visitHistory = { ...this.visitHistory, ...data.visitHistory };
                await chrome.storage.local.set({ visitHistory: this.visitHistory });
                console.log('✅ 访问历史已导入');
            }
            
            alert(`导入完成！\n\n` +
                `文件夹: ${folderCount} 个\n` +
                `书签: ${bookmarkCount} 个\n` +
                `总计: ${importedCount} 个`);
            
            this.refresh();
        } catch (error) {
            console.error('导入失败:', error);
            alert('导入失败：' + error.message);
        }
    }

    async organizeBookmarks() {
        // 使用规则引擎进行自动分类
        await this.startAutoClassification();
    }

    async clearAllCategoryFolders() {
        try {
            // 递归提取所有书签到书签栏根目录
            const extractBookmarksFromFolder = async (folderId) => {
                const children = await chrome.bookmarks.getChildren(folderId);
                
                for (const item of children) {
                    if (item.url) {
                        // 是书签，移动到书签栏根目录
                        await chrome.bookmarks.move(item.id, {
                            parentId: '1'
                        });
                    } else {
                        // 是文件夹，递归处理
                        await extractBookmarksFromFolder(item.id);
                    }
                }
            };
            
            // 获取书签栏下的所有文件夹
            const bookmarkBar = await chrome.bookmarks.getChildren('1');
            const folders = bookmarkBar.filter(item => !item.url);
            
            console.log(`🗑️ 准备清理 ${folders.length} 个文件夹...`);
            
            // 第一步：递归提取所有文件夹中的书签
            for (const folder of folders) {
                try {
                    console.log(`📤 正在提取文件夹 "${folder.title}" 中的书签...`);
                    await extractBookmarksFromFolder(folder.id);
                } catch (error) {
                    console.error(`❌ 提取书签失败: ${folder.title}`, error);
                }
            }
            
            // 第二步：删除所有文件夹（现在都是空的了）
            for (const folder of folders) {
                try {
                    await chrome.bookmarks.removeTree(folder.id);
                    console.log(`✅ 已删除文件夹: ${folder.title}`);
                } catch (error) {
                    console.error(`❌ 删除文件夹失败: ${folder.title}`, error);
                }
            }
            
            console.log('✅ 所有分类文件夹已清空，书签已保留在书签栏根目录');
        } catch (error) {
            console.error('❌ 清空分类文件夹失败:', error);
            throw error;
        }
    }

    async createCategoryFolders() {
        try {
            // 获取所有分类名称
            const categories = this.ruleClassifier.getCategories();
            const categoryFolders = {};
            
            console.log(`📁 准备创建 ${categories.length} 个分类文件夹...`);
            
            // 为每个分类创建文件夹
            for (const category of categories) {
                try {
                    const folder = await chrome.bookmarks.create({
                        parentId: '1', // 书签栏
                        title: category
                    });
                    categoryFolders[category] = folder;
                    console.log(`✅ 已创建文件夹: ${category}`);
                } catch (error) {
                    console.error(`❌ 创建文件夹失败: ${category}`, error);
                }
            }
            
            // 创建"其他"分类文件夹
            const otherFolder = await chrome.bookmarks.create({
                parentId: '1',
                title: '其他'
            });
            categoryFolders['其他'] = otherFolder;
            
            console.log('✅ 所有分类文件夹创建完成');
            return categoryFolders;
        } catch (error) {
            console.error('❌ 创建分类文件夹失败:', error);
            throw error;
        }
    }

    async moveBookmarkToCategory(bookmark, category, method = 'auto', confidence = 0, categoryFolders = null) {
        try {
            let targetFolderId;
            
            // 如果提供了预创建的文件夹映射，直接使用
            if (categoryFolders && categoryFolders[category]) {
                targetFolderId = categoryFolders[category].id;
            } else {
                // 否则查找或创建目标文件夹
                let targetFolder = this.bookmarks.find(b => 
                    b.type === 'folder' && b.title === category
                );
                
                if (!targetFolder) {
                    const newFolder = await chrome.bookmarks.create({
                        parentId: '1', // 书签栏
                        title: category
                    });
                    targetFolder = newFolder;
                    console.log(`✅ 创建新分类文件夹: ${category}`);
                }
                
                targetFolderId = targetFolder.id;
            }
            
            // 移动书签到目标文件夹
            await chrome.bookmarks.move(bookmark.id, {
                parentId: targetFolderId
            });
            
            console.log(`✅ 已将 "${bookmark.title}" 移动到 "${category}" (置信度: ${confidence})`);
            
            // 保存分类历史
            this.saveClassificationHistory(bookmark, category, method, confidence);
            
            return true;
        } catch (error) {
            console.error(`❌ 移动书签失败: ${bookmark.title}`, error);
            return false;
        }
    }

    saveClassificationHistory(bookmark, category, method, confidence) {
        try {
            const history = {
                bookmarkId: bookmark.id,
                bookmarkTitle: bookmark.title,
                bookmarkUrl: bookmark.url,
                category: category,
                method: method,
                confidence: confidence,
                timestamp: Date.now()
            };
            
            // 从 storage 获取历史记录
            chrome.storage.local.get(['classificationHistory'], (result) => {
                const historyList = result.classificationHistory || [];
                historyList.unshift(history);
                
                // 只保留最近 100 条记录
                if (historyList.length > 100) {
                    historyList.splice(100);
                }
                
                chrome.storage.local.set({ classificationHistory: historyList });
            });
        } catch (error) {
            console.error('保存分类历史失败:', error);
        }
    }

    async startAutoClassification() {
        // 获取所有书签（不管在哪个文件夹）
        const bookmarksToClassify = this.bookmarks.filter(b => b.type !== 'folder');
        
        if (bookmarksToClassify.length === 0) {
            alert('没有收藏夹需要分类');
            return;
        }
        
        // 确认对话框 - 警告会重新分类所有书签
        const confirmMsg = `⚠️ 重要提示：\n\n` +
            `1. 将对所有 ${bookmarksToClassify.length} 个书签进行重新分类\n` +
            `2. 会清空现有的所有分类文件夹\n` +
            `3. 按照15+个预定义分类重新创建文件夹\n` +
            `4. 所有书签将被移动到新的分类文件夹中\n\n` +
            `此操作不可撤销，建议先导出备份！\n\n` +
            `是否继续？`;
        
        if (!confirm(confirmMsg)) {
            return;
        }
        
        // 显示进度对话框
        this.showAutoClassificationModal();
        
        const results = [];
        
        try {
            // 初始化规则分类器
            if (!this.ruleClassifier) {
                if (!window.RuleClassifier) {
                    alert('规则分类器未加载，请刷新页面重试');
                    this.hideAutoClassificationModal();
                    return;
                }
                this.ruleClassifier = new window.RuleClassifier();
            }
            
            // 第一步：清空所有现有分类文件夹
            this.updateAutoClassificationProgress(0, bookmarksToClassify.length, '正在清理现有分类文件夹...');
            await this.clearAllCategoryFolders();
            
            // 第二步：创建新的分类文件夹
            this.updateAutoClassificationProgress(0, bookmarksToClassify.length, '正在创建新的分类文件夹...');
            const categoryFolders = await this.createCategoryFolders();
            
            console.log('✅ 已创建分类文件夹:', Object.keys(categoryFolders));
            
            // 逐个分类
            for (let i = 0; i < bookmarksToClassify.length; i++) {
                const bookmark = bookmarksToClassify[i];
                
                // 更新进度
                this.updateAutoClassificationProgress(i + 1, bookmarksToClassify.length, `正在分类: ${bookmark.title}`);
                
                try {
                    const result = await this.ruleClassifier.classifyBookmark(bookmark);
                    results.push({ bookmark, classification: result });
                    
                    // 移动收藏夹到对应分类（使用预创建的文件夹）
                    if (result.category && result.category !== '分类失败') {
                        await this.moveBookmarkToCategory(bookmark, result.category, 'auto', result.confidence, categoryFolders);
                    } else {
                        // 未分类的移动到"其他"文件夹
                        await this.moveBookmarkToCategory(bookmark, '其他', 'auto', 0.1, categoryFolders);
                    }
                } catch (error) {
                    console.error(`分类失败: ${bookmark.title}`, error);
                    results.push({ 
                        bookmark, 
                        classification: { category: '分类失败', confidence: 0 }
                    });
                }
                
                // 模拟延迟，避免界面卡顿
                await new Promise(resolve => setTimeout(resolve, 100));
            }
            
        } catch (error) {
            console.error('自动分类失败:', error);
            alert('自动分类过程中发生错误，请稍后重试');
        } finally {
            // 隐藏进度对话框
            this.hideAutoClassificationModal();
            
            const successCount = results.filter(r => r.classification.category !== '分类失败').length;
            alert(`自动分类完成！\n成功分类: ${successCount}/${results.length} 个收藏夹`);
            
            // 刷新界面
            this.refresh();
        }
    }
    
    async startLLMClassification() {
        const bookmarksToClassify = this.filteredBookmarks.filter(b => b.type === 'bookmark');
        
        if (bookmarksToClassify.length === 0) {
            alert('没有收藏夹需要分类');
            return;
        }

        // 检查AI分类器是否可用
        if (!window.simpleClassifier) {
            alert('AI分类器未初始化，请刷新页面重试');
            return;
        }

        console.log('开始LLM分类，收藏夹数量:', bookmarksToClassify.length);

        // 检查AI分类器状态
        const status = window.simpleClassifier.getStatus();
        
        // 显示进度对话框
        this.showLLMProgressModal();
        
        // 更新状态显示
        const statusIndicator = document.getElementById('llmStatusIndicator');
        const statusText = document.getElementById('llmStatusText');
        
        if (status.isReady) {
            statusIndicator.textContent = '✅';
            statusIndicator.className = 'status-indicator success';
            statusText.textContent = `AI分类器已就绪 (${status.method})`;
        } else {
            statusIndicator.textContent = '⚠️';
            statusIndicator.className = 'status-indicator error';
            statusText.textContent = '使用规则分类 (AI服务不可用)';
        }

        let cancelled = false;
        
        // 取消按钮事件
        const cancelBtn = document.getElementById('cancelClassification');
        const cancelHandler = () => {
            cancelled = true;
            this.hideLLMProgressModal();
        };
        cancelBtn.addEventListener('click', cancelHandler);

        try {
            // 开始批量分类
            const results = [];
            for (let i = 0; i < bookmarksToClassify.length; i++) {
                if (cancelled) break;
                
                const bookmark = bookmarksToClassify[i];
                try {
                    const result = await this.classifier.classifyBookmark(bookmark);
                    results.push({ bookmark, result });
                } catch (error) {
                    console.error(`分类失败: ${bookmark.title}`, error);
                    results.push({ bookmark, error: error.message });
                }
                
                // 更新进度
                const current = i + 1;
                const total = bookmarksToClassify.length;
                const progress = (current / total) * 100;
                document.getElementById('progressFill').style.width = `${progress}%`;
                document.getElementById('progressCount').textContent = `${current}/${total}`;
                document.getElementById('currentItem').textContent = `正在分析: ${bookmark.title}`;
            }

            if (!cancelled) {
                // 处理分类结果
                await this.applyClassificationResults(results);
                this.hideLLMProgressModal();
                
                const successCount = results.filter(r => r.classification.category !== '分类失败').length;
                alert(`智能分类完成！\n成功分类: ${successCount}/${results.length} 个收藏夹`);
                
                // 刷新界面
                this.refresh();
            }
            
        } catch (error) {
            console.error('LLM分类失败:', error);
            this.hideLLMProgressModal();
            alert(`分类失败: ${error.message}`);
        } finally {
            cancelBtn.removeEventListener('click', cancelHandler);
        }
    }

    showLLMProgressModal() {
        document.getElementById('llmProgressModal').style.display = 'flex';
        // 重置进度
        document.getElementById('progressFill').style.width = '0%';
        document.getElementById('progressCount').textContent = '0/0';
        document.getElementById('currentItem').textContent = '正在初始化分类任务...';
    }

    showAutoClassificationModal() {
        const modal = document.getElementById('llmProgressModal');
        if (modal) {
            // 强制设置模态框样式
            modal.style.display = 'flex';
            modal.style.position = 'fixed';
            modal.style.zIndex = '10000';
            modal.style.left = '0';
            modal.style.top = '0';
            modal.style.width = '100%';
            modal.style.height = '100%';
            modal.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
            modal.style.alignItems = 'center';
            modal.style.justifyContent = 'center';
            
            // 更新标题
            const title = modal.querySelector('.modal-header h3');
            if (title) {
                title.innerHTML = `
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="vertical-align: middle; margin-right: 4px;">
                        <path d="M22 19a2 2 0 01-2 2H4a2 2 0 01-2-2V5a2 2 0 012-2h5l2 3h9a2 2 0 012 2z"/>
                    </svg>
                    自动分类进行中
                `;
            }
            
            // 强制设置 modal-content 样式
            const modalContent = modal.querySelector('.modal-content');
            if (modalContent) {
                modalContent.style.position = 'relative';
                modalContent.style.zIndex = '10001';
                modalContent.style.maxWidth = '600px';
                modalContent.style.width = '90%';
                modalContent.style.backgroundColor = 'var(--bg-secondary)';
                modalContent.style.borderRadius = '8px';
                modalContent.style.padding = '0';
            }
            
            console.log('✅ 自动分类进度对话框已显示');
        } else {
            console.error('❌ 未找到进度对话框元素 #llmProgressModal');
        }
    }
    
    hideAutoClassificationModal() {
        const modal = document.getElementById('llmProgressModal');
        if (modal) {
            modal.style.display = 'none';
        }
    }
    
    updateAutoClassificationProgress(current, total, status) {
        const progressFill = document.getElementById('progressFill');
        const progressStatus = document.getElementById('progressStatus');
        const progressCount = document.getElementById('progressCount');
        
        if (progressFill) {
            const percentage = total > 0 ? (current / total) * 100 : 0;
            progressFill.style.width = `${percentage}%`;
            progressFill.style.transition = 'width 0.3s ease';
            
            // 根据进度改变颜色
            if (percentage < 30) {
                progressFill.style.background = 'linear-gradient(90deg, #3b82f6, #2563eb)';
            } else if (percentage < 70) {
                progressFill.style.background = 'linear-gradient(90deg, #f59e0b, #d97706)';
            } else {
                progressFill.style.background = 'linear-gradient(90deg, #10b981, #059669)';
            }
        }
        
        if (progressStatus) {
            progressStatus.textContent = status;
            progressStatus.style.fontSize = '14px';
            progressStatus.style.color = 'var(--text-primary)';
        }
        
        if (progressCount) {
            const percentage = total > 0 ? Math.round((current / total) * 100) : 0;
            progressCount.textContent = `${current}/${total} (${percentage}%)`;
            progressCount.style.fontSize = '14px';
            progressCount.style.fontWeight = '600';
            progressCount.style.color = 'var(--button-primary)';
        }
        
        console.log(`📊 进度更新: ${current}/${total} - ${status}`);
    }

    hideLLMProgressModal() {
        document.getElementById('llmProgressModal').style.display = 'none';
    }

    // 初始化拖拽排序功能
    initDragAndDrop() {
        const bookmarksList = document.getElementById('bookmarksList');
        if (!bookmarksList) {
            console.error('❌ bookmarksList 元素未找到');
            return;
        }
        
        // 清理之前的拖拽状态
        this.cleanupDragState();
        
        console.log('📋 开始初始化拖拽功能');
        console.log('📊 当前收藏夹数量:', this.filteredBookmarks.length);
        
        // 使用事件委托来处理动态添加的元素
        // 将拖拽状态变量设为实例变量，确保清理方法能访问
        this.draggedElement = null;
        this.placeholder = null;
        
        // 清除之前的事件监听器（如果有）
        const events = ['dragstart', 'dragend', 'dragover', 'dragenter', 'dragleave', 'drop'];
        events.forEach(eventType => {
            bookmarksList.removeEventListener(eventType, this[`handle${eventType.charAt(0).toUpperCase() + eventType.slice(1)}`]);
        });
        
        // 使用事件委托的方式绑定事件
        this.handleDragStart = (e) => {
            // 防止事件冒泡导致重复触发
            if (this.draggedElement) {
                console.log('⚠️ 拖拽已在进行中，忽略重复的 dragstart 事件');
                return;
            }
            
            const item = e.target.closest('.bookmark-item');
            if (!item) {
                console.log('❌ 未找到bookmark-item元素');
                return;
            }
            
            // 阻止事件冒泡
            e.stopPropagation();
            
            console.log('✅ 找到拖拽元素:', item.dataset.id);
            this.draggedElement = item;
            
            // 暂停 MutationObserver，防止拖拽过程中的 DOM 变化中断拖拽
            if (this.dragObserver) {
                this.dragObserver.disconnect();
                console.log('⏸️ 暂停 MutationObserver');
            }
            
            // 添加拖拽样式类，让元素隐藏但不从DOM中移除
            // 这样浏览器可以显示跟随鼠标的拖拽图像
            item.classList.add('dragging');
            
            // 创建占位符
            this.placeholder = document.createElement('div');
            this.placeholder.className = 'drag-placeholder';
            
            // 强制设置占位符高度，防止继承拖拽元素的高度
            const isGridView = bookmarksList.classList.contains('grid-view');
            if (isGridView) {
                this.placeholder.style.height = '120px';
                this.placeholder.style.minHeight = '120px';
            } else {
                this.placeholder.style.height = '40px';
                this.placeholder.style.minHeight = '40px';
            }
            
            // 立即将占位符插入到拖拽元素的位置
            item.parentNode.insertBefore(this.placeholder, item.nextSibling);
            
            // 设置拖拽数据
            e.dataTransfer.effectAllowed = 'move';
            e.dataTransfer.setData('text/html', item.outerHTML);
            e.dataTransfer.setData('text/plain', item.dataset.id);
            
            console.log('📋 开始拖拽:', item.dataset.id);
        };
        
        this.handleDragEnd = (e) => {
            console.log('🔍 dragend事件触发，target:', e.target);
            
            // 移除拖拽样式类，让元素重新显示
            if (this.draggedElement) {
                this.draggedElement.classList.remove('dragging');
            }
            
            // 清理占位符
            if (this.placeholder && this.placeholder.parentNode) {
                this.placeholder.parentNode.removeChild(this.placeholder);
            }
            
            // 清理所有拖拽状态
            document.querySelectorAll('.bookmark-item').forEach(el => {
                el.classList.remove('drag-over');
            });
            
            // 重置拖拽状态变量
            this.draggedElement = null;
            this.placeholder = null;
            
            // 恢复 MutationObserver
            if (this.dragObserver) {
                this.dragObserver.observe(bookmarksList, {
                    childList: true,
                    subtree: true
                });
                console.log('▶️ 恢复 MutationObserver');
            }
            
            console.log('🏁 拖拽结束');
        };
        
        this.handleDragOver = (e) => {
            e.preventDefault();
            e.dataTransfer.dropEffect = 'move';
            
            const item = e.target.closest('.bookmark-item');
            if (!item || !this.draggedElement || this.draggedElement === item || item.classList.contains('dragging')) {
                return;
            }
            
            // 清除所有drag-over样式
            document.querySelectorAll('.bookmark-item').forEach(el => {
                el.classList.remove('drag-over');
            });
            
            // 移除之前的占位符
            if (this.placeholder && this.placeholder.parentNode) {
                this.placeholder.parentNode.removeChild(this.placeholder);
            }
            
            // 更精确的位置计算
            const rect = item.getBoundingClientRect();
            const itemHeight = rect.height;
            const relativeY = e.clientY - rect.top;
            const insertPosition = relativeY < itemHeight / 2;
            
            // 添加视觉反馈
            item.classList.add('drag-over');
            
            // 根据位置插入占位符
            if (insertPosition) {
                // 插入到当前元素前面
                item.parentNode.insertBefore(this.placeholder, item);
                console.log('📍 将插入到元素前面:', item.dataset.id);
            } else {
                // 插入到当前元素后面
                item.parentNode.insertBefore(this.placeholder, item.nextSibling);
                console.log('📍 将插入到元素后面:', item.dataset.id);
            }
        };
        
        this.handleDrop = (e) => {
            e.preventDefault();
            console.log('🔍 drop事件触发');
            
            // 清除所有drag-over样式
            document.querySelectorAll('.bookmark-item').forEach(el => {
                el.classList.remove('drag-over');
            });
            
            const item = e.target.closest('.bookmark-item');
            if (!this.draggedElement) {
                console.log('❌ 拖拽失败：没有拖拽元素');
                return;
            }
            
            if (!this.placeholder || !this.placeholder.parentNode) {
                console.log('❌ 拖拽失败：没有占位符');
                return;
            }
            
            const oldIndex = this.filteredBookmarks.findIndex(b => b.id === this.draggedElement.dataset.id);
            console.log(`📊 原始位置: ${oldIndex}`);
            
            // 将拖拽的元素插入到占位符位置
            this.placeholder.parentNode.insertBefore(this.draggedElement, this.placeholder);
            
            // 移除占位符
            this.placeholder.parentNode.removeChild(this.placeholder);
            
            // 移除拖拽样式类，让元素重新显示
            this.draggedElement.classList.remove('dragging');
            
            // 计算新位置
            const allItems = Array.from(bookmarksList.children).filter(child => 
                child.classList.contains('bookmark-item')
            );
            const newIndex = allItems.findIndex(child => child.dataset.id === this.draggedElement.dataset.id);
            console.log(`📍 新位置: ${newIndex}`);
            
            // 保存新的排序
            if (newIndex !== oldIndex) {
                this.saveBookmarkOrder(this.draggedElement.dataset.id, newIndex, oldIndex);
                console.log(`📎 移动收藏夹: ${this.draggedElement.dataset.id} 从 ${oldIndex} 到 ${newIndex}`);
            }
            
            // 重置拖拽状态变量
            this.draggedElement = null;
            this.placeholder = null;
            this.draggedElementParent = null;
            this.draggedElementNextSibling = null;
            
            console.log('✅ 拖拽完成');
        };
        
        this.handleDragEnter = (e) => {
            e.preventDefault();
            const item = e.target.closest('.bookmark-item');
            if (item && this.draggedElement && this.draggedElement !== item) {
                item.classList.add('drag-over');
            }
        };
        
        this.handleDragLeave = (e) => {
            const item = e.target.closest('.bookmark-item');
            if (item) {
                const rect = item.getBoundingClientRect();
                if (e.clientX < rect.left || e.clientX > rect.right || 
                    e.clientY < rect.top || e.clientY > rect.bottom) {
                    item.classList.remove('drag-over');
                }
            }
        };
        
        // 绑定事件到容器
        bookmarksList.addEventListener('dragstart', this.handleDragStart);
        bookmarksList.addEventListener('dragend', this.handleDragEnd);
        bookmarksList.addEventListener('dragover', this.handleDragOver);
        bookmarksList.addEventListener('dragenter', this.handleDragEnter);
        bookmarksList.addEventListener('dragleave', this.handleDragLeave);
        bookmarksList.addEventListener('drop', this.handleDrop);
        
        // 确保所有 bookmark-item 都有 draggable 属性
        const updateDraggableItems = () => {
            // 如果正在拖拽，不要修改 DOM
            if (this.draggedElement) {
                console.log('⚠️ 拖拽进行中，跳过 draggable 属性检查');
                return;
            }
            
            const items = document.querySelectorAll('.bookmark-item');
            let updatedCount = 0;
            
            items.forEach((item) => {
                const draggableValue = item.getAttribute('draggable');
                
                // 只在必要时修改属性，避免不必要的 DOM 操作
                if (draggableValue !== 'true') {
                    item.setAttribute('draggable', 'true');
                    updatedCount++;
                }
            });
            
            if (updatedCount > 0) {
                console.log(`🔍 检查 ${items.length} 个元素，更新了 ${updatedCount} 个 draggable 属性`);
            }
        };
        
        updateDraggableItems();
        
        // 使用 MutationObserver 监听 DOM 变化
        if (this.dragObserver) {
            this.dragObserver.disconnect();
        }
        
        this.dragObserver = new MutationObserver((mutations) => {
            // 只在真正有新节点添加时才检查
            const hasAddedNodes = mutations.some(mutation => mutation.addedNodes.length > 0);
            if (hasAddedNodes && !this.draggedElement) {
                console.log('🔄 DOM发生变化，重新检查draggable属性');
                updateDraggableItems();
            }
        });
        
        this.dragObserver.observe(bookmarksList, {
            childList: true,
            subtree: true
        });
        
        console.log('✅ 拖拽功能初始化完成');
    }
    
    // 创建拖拽占位符
    createDragPlaceholder() {
        const placeholder = document.createElement('div');
        placeholder.className = 'drag-placeholder';
        return placeholder;
    }
    
    // 保存收藏夹排序到浏览器
    async saveBookmarkOrder(bookmarkId, newIndex, oldIndex) {
        try {
            console.log(`🔄 开始移动收藏夹: ${bookmarkId} 从位置 ${oldIndex} 到 ${newIndex}`);
            
            // 找到要移动的书签
            const bookmark = this.filteredBookmarks.find(b => b.id === bookmarkId);
            if (!bookmark) {
                console.error('❌ 未找到要移动的书签');
                return;
            }
            
            // 使用Chrome API移动书签到新位置
            await chrome.bookmarks.move(bookmarkId, {
                parentId: bookmark.parentId, // 保持在同一文件夹
                index: newIndex
            });
            
            // 更新本地数据的排序
            const bookmarkIndex = this.filteredBookmarks.findIndex(b => b.id === bookmarkId);
            if (bookmarkIndex !== -1) {
                const movedBookmark = this.filteredBookmarks.splice(bookmarkIndex, 1)[0];
                this.filteredBookmarks.splice(newIndex, 0, movedBookmark);
            }
            
            console.log(`✅ 收藏夹已移动到浏览器: ${bookmark.title}`);
            
        } catch (error) {
            console.error('❌ 保存收藏夹排序失败:', error);
            // 如果移动失败，刷新页面恢复正确状态
            await this.refresh();
        }
    }
    
    // 移动收藏夹位置
    async moveBookmark(bookmarkId, direction) {
        console.log(`🔄 移动收藏夹: ${bookmarkId}, 方向: ${direction}`);
        
        try {
            // 获取要移动的书签信息
            const bookmark = this.filteredBookmarks.find(b => b.id === bookmarkId);
            if (!bookmark) {
                console.log('❌ 未找到要移动的收藏夹');
                return;
            }
            
            // 获取同一父文件夹下的所有子项（从浏览器API获取最新数据）
            const parentChildren = await chrome.bookmarks.getChildren(bookmark.parentId);
            
            
            // 找到当前书签在父文件夹中的位置（包括文件夹）
            const currentIndex = parentChildren.findIndex(b => b.id === bookmarkId);
            
            // 获取只包含书签的列表用于计算移动范围
            const bookmarksInParent = parentChildren.filter(child => child.url);
            if (currentIndex === -1) {
                console.log('❌ 在父文件夹中未找到该收藏夹');
                return;
            }
            
            let newIndex;
            
            switch (direction) {
                case 'top':
                    // 检查是否已经在顶部
                    if (currentIndex === 0) {
                        alert('已经是该分类文件夹的顶部了，无法再向上！');
                        return;
                    }
                    newIndex = 0;
                    break;
                case 'up':
                    // 检查是否已经在顶部
                    if (currentIndex === 0) {
                        alert('已经是该分类文件夹的顶部了，无法再向上！');
                        return;
                    }
                    newIndex = Math.max(0, currentIndex - 1);
                    break;
                case 'down':
                    // 检查是否已经在底部
                    if (currentIndex === parentChildren.length - 1) {
                        alert('已经是该分类文件夹的底部了，无法再向下！');
                        return;
                    }
                    // 使用跳跃策略：向下移动时跳过一个位置，避免Chrome API的连续移动问题
                    newIndex = Math.min(parentChildren.length - 1, currentIndex + 2);
                    break;
                case 'bottom':
                    // 检查是否已经在底部
                    if (currentIndex === parentChildren.length - 1) {
                        alert('已经是该分类文件夹的底部了，无法再向下！');
                        return;
                    }
                    // 置底：使用总长度，让API自动放到最后
                    newIndex = parentChildren.length;
                    break;
                default:
                    console.log('❌ 无效的移动方向:', direction);
                    return;
            }
            
            console.log(`📊 当前位置: ${currentIndex}, 新位置: ${newIndex}, 父文件夹书签总数: ${bookmarksInParent.length}`);
            
            // 检查位置是否真的改变了
            if (newIndex !== currentIndex) {
                console.log(`🔄 准备移动: bookmarkId=${bookmarkId}, parentId=${bookmark.parentId}, newIndex=${newIndex}`);
                
                // 使用Chrome API移动书签
                const moveResult = await chrome.bookmarks.move(bookmarkId, {
                    parentId: bookmark.parentId,
                    index: newIndex
                });
                
                console.log(`📋 Chrome API返回结果:`, moveResult);
                console.log(`✅ 收藏夹移动完成: ${this.getDirectionText(direction)}`);
                
                // 等待一下再验证
                await new Promise(resolve => setTimeout(resolve, 100));
                
                // 验证移动是否成功
                const updatedChildren = await chrome.bookmarks.getChildren(bookmark.parentId);
                const finalIndex = updatedChildren.findIndex(b => b.id === bookmarkId);
                console.log(`🔍 移动后验证: 书签现在在位置 ${finalIndex}`);
                
                if (finalIndex === newIndex) {
                    console.log(`✅ 移动成功确认！`);
                } else {
                    console.log(`❌ 移动失败！期望位置: ${newIndex}, 实际位置: ${finalIndex}`);
                }
                
                // 保存当前的文件夹过滤状态
                const savedFolderId = this.currentFolderId;
                
                // 刷新数据
                await this.loadData();
                this.renderFolderTree();
                
                // 恢复之前的文件夹过滤状态
                if (savedFolderId) {
                    await this.filterByFolder(savedFolderId);
                } else {
                    await this.renderBookmarksView();
                }
                
                this.updateStats();
            } else {
                console.log('ℹ️ 位置未改变，无需移动');
            }
        } catch (error) {
            console.error('❌ 移动收藏夹失败:', error);
            // 如果移动失败，刷新页面恢复正确状态
            await this.refresh();
        }
    }
    
    // 获取方向文本
    getDirectionText(direction) {
        const directionMap = {
            'top': '置顶',
            'up': '向上移动',
            'down': '向下移动',
            'bottom': '置底'
        };
        return directionMap[direction] || '移动';
    }

    async applyClassificationResults(results) {
        const categoryFolders = new Map();
        
        for (const result of results) {
            const { bookmark, classification } = result;
            
            if (classification.category === '分类失败') {
                continue;
            }
            
            // 保存分类结果
            const classificationData = {
                category: classification.category,
                confidence: classification.confidence,
                method: 'auto',
                timestamp: Date.now()
            };
            
            localStorage.setItem(`classification_${bookmark.id}`, JSON.stringify(classificationData));
        }
        
        console.log('✅ 分类结果已应用');
    }
    
    clearSelection() {
        this.selectedBookmarks.clear();
        document.querySelectorAll('.bookmark-item.selected').forEach(item => {
            item.classList.remove('selected');
        });
        this.resetButtonState();
        this.updateSelectedCount();
        this.handleSelectionChange();
    }
    
    // 主题切换功能
    toggleTheme() {
        const html = document.documentElement;
        const currentTheme = html.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        
        html.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
        
        // 更新按钮标题
        const themeBtn = document.getElementById('themeToggleBtn');
        themeBtn.title = newTheme === 'dark' ? '切换到日间模式' : '切换到夜间模式';
        
        console.log(`🎨 主题已切换到: ${newTheme === 'dark' ? '夜间模式' : '日间模式'}`);
    }
    
    // 初始化主题
    initTheme() {
        const savedTheme = localStorage.getItem('theme') || 'light';
        document.documentElement.setAttribute('data-theme', savedTheme);
        
        const themeBtn = document.getElementById('themeToggleBtn');
        if (themeBtn) {
            themeBtn.title = savedTheme === 'dark' ? '切换到日间模式' : '切换到夜间模式';
        }
    }

    async refresh() {
        // 保存当前选中的文件夹ID
        const savedFolderId = this.currentFolderId;
        
        document.getElementById('loadingIndicator').style.display = 'flex';
        await this.loadData();
        this.renderFolderTree();
        
        // 如果之前有选中的文件夹，恢复选中状态
        if (savedFolderId) {
            await this.filterByFolder(savedFolderId);
        } else {
            await this.renderBookmarksView();
        }
        
        this.updateStats();
        this.selectedBookmarks.clear();
        this.resetButtonState();
        this.updateSelectionUI();
    }

    // 安全的HTML转义函数，防止XSS攻击
    escapeHtml(text) {
        if (!text) return '';
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

}

// 全局函数，用于HTML onclick绑定
let app;

function clearSelection() {
    if (app) app.clearSelection();
}

// 初始化应用
document.addEventListener('DOMContentLoaded', () => {
    app = new BookmarkManagerApp();
    // 暴露到window对象供其他脚本使用
    window.app = app;
});
