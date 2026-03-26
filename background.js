// 后台服务脚本 - 简化版本

console.log('🚀 Background script 开始加载...');

// 监听扩展图标点击 - 直接绑定，不使用类
chrome.action.onClicked.addListener(async (tab) => {
    console.log('🖱️ 扩展图标被点击');
    
    try {
        // 直接打开管理器
        const managerUrl = chrome.runtime.getURL('manager.html');
        console.log('📄 管理器URL:', managerUrl);
        
        const newTab = await chrome.tabs.create({
            url: managerUrl,
            active: true
        });
        
        console.log('✅ 管理器标签页已创建:', newTab.id);
    } catch (error) {
        console.error('❌ 打开管理器失败:', error);
    }
});

// 监听扩展安装
chrome.runtime.onInstalled.addListener((details) => {
    console.log('📦 扩展安装事件:', details.reason);
    
    if (details.reason === 'install') {
        console.log('🎉 首次安装扩展');
        initializeExtension();
    } else if (details.reason === 'update') {
        console.log('🔄 扩展已更新到版本:', chrome.runtime.getManifest().version);
    }
});

// 初始化扩展
async function initializeExtension() {
    try {
        console.log('⚙️ 初始化扩展设置...');
        
        // 设置默认配置
        await chrome.storage.local.set({
            settings: {
                autoCategories: true,
                smartSort: true,
                showNotifications: true,
                theme: 'light'
            },
            smartClassifyEnabled: true,
            categories: {
                '开发技术': { color: '#007bff', keywords: ['github', 'code', 'programming', 'dev', 'api'] },
                '效率工具': { color: '#28a745', keywords: ['notion', 'productivity', 'tool', 'app'] },
                '学习资源': { color: '#ffc107', keywords: ['course', 'tutorial', 'education', 'learn'] },
                '社交网络': { color: '#17a2b8', keywords: ['social', 'network', 'community', 'chat'] },
                '视频娱乐': { color: '#dc3545', keywords: ['video', 'movie', 'entertainment', 'youtube'] },
                '新闻媒体': { color: '#6f42c1', keywords: ['news', 'media', 'article', 'blog'] },
                '电商购物': { color: '#fd7e14', keywords: ['shop', 'buy', 'store', 'amazon'] },
                '设计创作': { color: '#e83e8c', keywords: ['design', 'creative', 'art', 'figma'] },
                '金融理财': { color: '#20c997', keywords: ['finance', 'money', 'investment', 'bank'] },
                '云服务': { color: '#6c757d', keywords: ['cloud', 'server', 'hosting', 'aws'] },
                '搜索引擎': { color: '#343a40', keywords: ['search', 'google', 'find', 'bing'] },
                '文档协作': { color: '#007bff', keywords: ['document', 'office', 'collaboration', 'docs'] },
                '音乐音频': { color: '#28a745', keywords: ['music', 'audio', 'sound', 'spotify'] },
                '游戏娱乐': { color: '#ffc107', keywords: ['game', 'gaming', 'play', 'steam'] },
                '健康医疗': { color: '#17a2b8', keywords: ['health', 'medical', 'fitness', 'doctor'] },
                '旅行出行': { color: '#dc3545', keywords: ['travel', 'trip', 'hotel', 'booking'] }
            }
        });
        
        console.log('✅ 扩展初始化完成');
        

        
    } catch (error) {
        console.error('❌ 初始化失败:', error);
    }
}

// 监听收藏夹变化
chrome.bookmarks.onCreated.addListener((id, bookmark) => {
    console.log('📚 收藏夹已创建:', bookmark.title);
    
    // 自动分类新收藏夹
    if (bookmark.url) {
        autoClassifyBookmark(bookmark);
    }
});

chrome.bookmarks.onRemoved.addListener((id, removeInfo) => {
    console.log('🗑️ 收藏夹已删除:', id);
});

chrome.bookmarks.onChanged.addListener((id, changeInfo) => {
    console.log('✏️ 收藏夹已更改:', changeInfo);
});

// 自动分类收藏夹
async function autoClassifyBookmark(bookmark) {
    try {
        const result = await chrome.storage.local.get(['smartClassifyEnabled', 'categories']);
        
        if (!result.smartClassifyEnabled) {
            console.log('⚠️ 自动分类已禁用');
            return;
        }
        
        const categories = result.categories || {};
        const category = detectCategory(bookmark.url, bookmark.title, categories);
        
        if (category) {
            console.log(`🎯 自动分类: ${bookmark.title} -> ${category}`);
            
            // 这里可以添加自动移动到分类文件夹的逻辑
            // 暂时只记录日志
        }
        
    } catch (error) {
        console.error('❌ 自动分类失败:', error);
    }
}

// 检测分类
function detectCategory(url, title, categories) {
    const text = (url + ' ' + title).toLowerCase();
    
    for (const [categoryName, categoryData] of Object.entries(categories)) {
        if (categoryData.keywords && categoryData.keywords.some(keyword => text.includes(keyword))) {
            return categoryName;
        }
    }
    
    return null;
}

// 创建右键菜单
chrome.runtime.onInstalled.addListener(() => {
    // 创建右键菜单项
    chrome.contextMenus.create({
        id: 'openManager',
        title: '收藏夹管理',
        contexts: ['page', 'action']
    });
    
    chrome.contextMenus.create({
        id: 'addToBookmarks',
        title: '添加到智能收藏夹',
        contexts: ['page']
    });
});

// 监听右键菜单点击
chrome.contextMenus.onClicked.addListener(async (info, tab) => {
    console.log('🖱️ 右键菜单点击:', info.menuItemId);
    
    switch (info.menuItemId) {
        case 'openManager':
            // 打开管理器
            try {
                const managerUrl = chrome.runtime.getURL('manager.html');
                await chrome.tabs.create({ url: managerUrl });
                console.log('✅ 通过右键菜单打开管理器');
            } catch (error) {
                console.error('❌ 右键菜单打开管理器失败:', error);
            }
            break;
            
        case 'addToBookmarks':
            // 智能添加收藏夹
            try {
                if (tab && tab.url && tab.title) {
                    const bookmark = await chrome.bookmarks.create({
                        title: tab.title,
                        url: tab.url,
                        parentId: '1' // 收藏夹栏
                    });
                    
                    console.log('✅ 智能添加收藏夹:', bookmark.title);
                    
                }
            } catch (error) {
                console.error('❌ 添加收藏夹失败:', error);
            }
            break;
    }
});

console.log('✅ Background script 加载完成');
