/**
 * 规则分类器 - 纯规则引擎分类
 */
class RuleClassifier {
    constructor() {
        this.isReady = false;
        this.rules = new Map();
        this.init();
    }

    /**
     * 初始化规则分类器
     */
    init() {
        console.log('🚀 初始化规则分类器...');
        this.initRules();
        this.isReady = true;
        console.log('✅ 规则分类器初始化完成');
    }

    /**
     * 初始化分类规则
     */
    initRules() {
        // 开发技术
        this.addRule('开发技术', [
            // 代码托管
            'github', 'gitlab', 'bitbucket', 'gitee', 'coding', 'sourceforge',
            'gogs', 'gitea', 'phabricator', 'reviewboard', 'gitbucket', 'rhodecode',
            // 问答社区
            'stackoverflow', 'stackexchange', 'segmentfault', 'csdn', 'cnblogs', 'juejin', '掘金',
            'dev.to', 'hashnode', 'freecodecamp',
            'v2ex', 'ruby china', 'eclipse community', 'oracle community', 'microsoft q&a',
            // 开发相关
            'developer', 'programming', 'coding', 'coder', 'development',
            'sdk', 'framework', 'library', 'package', 'module',
            'opensource', 'open source', '源代码', '开源', '仓库', 'repository',
            // 文档
            'readme', 'changelog', 'api doc', 'api reference',
            '技术文档', '开发指南', '参考手册',
            // 包管理
            'npm', 'yarn', 'pnpm', 'maven', 'gradle', 'pip', 'composer', 'nuget', 'cargo',
            'poetry', 'conda', 'brew', 'chocolatey', 'apt', 'yum', 'gem', 'go mod',
            // 编程语言
            'javascript', 'typescript', 'python', 'java', 'golang', 'rust', 'cpp', 'csharp',
            'php', 'swift', 'kotlin', 'scala', 'dart', 'lua', 'perl', 'shell',
            'c++', 'matlab', 'haskell', 'elixir', 'f#', 'objective-c',
            // 前端框架
            'react', 'vue', 'angular', 'svelte', 'solid', 'preact', 'next', 'nuxt', 'remix',
            'webpack', 'vite', 'rollup', 'parcel', 'esbuild', 'babel', 'eslint', 'prettier',
            'tailwind', 'bootstrap', 'bulma', 'material-ui', 'ant design', 'element ui',
            // 后端框架
            'node', 'express', 'koa', 'nest', 'fastify', 'spring', 'springboot',
            'django', 'flask', 'fastapi', 'laravel', 'symfony', 'rails', 'gin', 'echo',
            'fiber', 'beego', 'thinkphp', 'codeigniter', 'cakephp', 'phalcon',
            // 数据库
            'mysql', 'postgresql', 'mongodb', 'redis', 'sqlite', 'oracle', 'mssql',
            'elasticsearch', 'cassandra', 'dynamodb', 'firebase', 'supabase',
            'neo4j', 'influxdb', 'clickhouse', 'cockroachdb', 'tidb', 'oceanbase',
            // DevOps
            'jenkins', 'gitlab-ci', 'travis', 'circleci',
            'ansible', 'terraform', 'vagrant', 'helm',
            'github actions', 'gitlab ci', 'drone', 'teamcity', 'bamboo', 'octopus deploy',
            // 云服务
            'aws', 'azure', 'gcp', 'aliyun', 'tencent cloud', 'heroku', 'vercel', 'netlify',
            'digitalocean', 'linode', 'vultr', 'rackspace', 'ibm cloud', 'oracle cloud',
            'cloudflare', 'fastly', 'akamai', 'cdn', 'serverless', 'faas',
            // IDE/编辑器
            'vscode', 'visual studio', 'intellij', 'pycharm', 'webstorm', 'eclipse',
            'sublime', 'atom', 'vim', 'emacs', 'notepad++',
            'xcode', 'android studio', 'jetbrains', 'rider', 'clion', 'datagrip',
            // 版本控制
            'git', 'svn', 'mercurial', 'cvs', 'perforce',
            'pull request', 'git commit', 'git branch', 'git merge',
            // 其他工具
            'postman', 'insomnia', 'swagger', 'apifox', 'jmeter', 'selenium', 'cypress',
            'jest', 'mocha', 'pytest', 'junit', 'testng',
            'wireshark', 'fiddler', 'charles', 'ngrok', 'pageant', 'putty',
            // 架构设计
            'microservices', 'monolith', 'soa', 'event-driven',
            'restful', 'graphql', 'websocket', 'mqtt', 'kafka', 'rabbitmq',
            // 性能优化
            'load balancing', 'scaling',
            'profiling', 'benchmark', 'performance tuning',
            // 安全相关
            'oauth', 'jwt', 'ssl', 'tls',
            'waf', 'penetration testing', 'vulnerability', '漏洞',
            'ci/cd', 'cicd', 'pipeline',
            'algorithm', 'data structure', '设计模式', '系统设计'
        ]);

        // 效率工具
        this.addRule('效率工具', [
            // 笔记工具
            'notion', 'obsidian', 'roam', 'logseq', 'remnote', 'evernote', '印象笔记',
            'onenote', 'bear', 'simplenote', 'joplin', 'typora', 'marktext',
            'note', 'notes', 'notebook', 'memo', 'journal', '笔记', '记事',
            'standard notes', 'zettelkasten', '卡片盒', '知识管理',
            'youdao note', '有道云笔记', 'wiz', '为知笔记', 'flomo', '浮墨笔记',
            // 任务管理
            'todoist', 'any.do', 'ticktick', '滴答清单', 'things', 'omnifocus',
            'microsoft todo', 'wunderlist', 'habitica', 'forest', '番茄',
            'task', 'todo', 'gtd', 'checklist', '待办', '任务',
            'trello', 'asana', 'monday', 'clickup', 'basecamp',
            'airtable', 'coda', '飞书', 'lark', '钉钉', 'dingtalk',
            'project', 'workflow', 'kanban', 'scrum', 'agile',
            'linear', 'shortcut', 'clubhouse', 'github projects', 'gitlab issues',
            // 通讯工具
            'teams', 'zoom', 'meet', 'skype', 'webex',
            'wechat work', '企业微信',
            'meeting', 'video call', 'conference',
            'signal', 'threema', 'wire', 'element', 'matrix', 'rocket.chat',
            // 日历时间
            'calendar', 'google calendar', 'outlook', 'fantastical', 'calendly',
            'schedule', 'planning', 'appointment', 'booking', '日历', '日程',
            'time blocking', 'pomodoro', '番茄工作法', '时间管理', 'reminder',
            // 密码管理
            'password', 'manager', '1password', 'bitwarden', 'lastpass', 'dashlane',
            'keepass', 'enpass', '密码', 'vault',
            'authy', 'google authenticator', 'microsoft authenticator', '2fa',
            // 网络工具
            'vpn', 'proxy', 'shadowsocks', 'v2ray', 'clash', 'surge',
            'tunnelbear', 'nordvpn', 'expressvpn', '代理', '梯子',
            'wifi analyzer', 'network monitor', 'bandwidth', 'latency', 'ping',
            // 效率相关
            'productivity', 'efficiency', 'automation', 'workflow', 'shortcut',
            'alfred', 'raycast', 'utools', 'wox', 'launchy', '效率', '工具',
            'hazel', 'keyboard maestro', 'autohotkey', 'automator', 'shortcuts',
            'zapier', 'ifttt', 'make', 'n8n', 'integromat', 'workflow automation',
            // 备份同步
            'backup', 'sync', 'synchronize', 'cloud sync', '备份', '同步',
            'resilio sync', 'syncthing', 'acronis', 'carbonite', 'backblaze',
            // 文件管理
            'file manager', 'explorer', 'finder', 'total commander', 'directory opus',
            'double commander', 'fman', 'xyplorer', 'qdir', 'free commander',
            // 截图录屏
            'snipaste', 'snagit', 'greenshot', 'lightshot', 'sharex',
            'obs studio', 'camtasia', 'screenflow', 'bandicam', 'loomo',
            '截图', '录屏', 'screen capture', 'screen recording',
            // 阅读工具
            'readwise', 'instapaper', 'pocket', 'raindrop', 'diigo',
            'marginnote', 'goodnotes', 'notability', 'pdf expert', 'foxit reader',
            '阅读器', 'pdf', 'ebook', 'kindle', 'kobo',
            // 思维导图
            'mindmap', 'mindmeister', 'xmind', 'freemind', 'mindnode',
            'coggle', 'bubbl', 'lucidchart', 'draw.io', 'diagrams.net',
            '思维导图', '脑图', '流程图',
            // 时间追踪
            'toggl', 'rescuetime', 'clockify', 'harvest', 'timely',
            'time tracking', 'timesheet', '工时', '时间记录',
            // 专注工具
            'focus', 'distraction free', 'deep work', 'zen', '冥想',
            'cold turkey', 'freedom', 'selfcontrol', 'offtime', 'forest',
            // 知识库
            'knowledge base', 'bookstack', 'outline',
            'dokuwiki', 'mediawiki', 'xwiki', '知识库', 'wiki系统'
        ]);

        // 学习资源
        this.addRule('学习资源', [
            // 在线课程
            'coursera', 'udemy', 'edx', 'khan', 'codecademy', 'freecodecamp',
            'pluralsight', 'lynda', 'linkedin learning', 'skillshare', 'masterclass',
            'udacity', 'treehouse', 'datacamp', 'laracasts', 'egghead',
            '慕课', 'mooc', '网易云课堂', '腾讯课堂', '学堂在线',
            'course', 'tutorial', 'learn', 'education', 'study', 'training',
            '课程', '教程', '学习', '培训', '教育',
            'futurelearn', 'openlearn', 'canvas', 'blackboard', 'moodle',
            '可汗学院', '中国大学mooc', '爱课程', '超星', '智慧树',
            // 图书资源
            'book', 'ebook', 'pdf', 'library', 'archive', 'zlibrary', 'libgen',
            'goodreads', 'amazon books', 'kindle', 'douban', '豆瓣读书',
            '图书', '书籍', '电子书', '阅读',
            'project gutenberg', 'internet archive', 'arxiv', 'sci-hub',
            'library genesis', 'annas archive', 'pdf drive', 'free ebooks',
            // 百科词典
            'wiki', 'wikipedia', 'baidu baike', '百度百科', 'encyclopedia', 'dictionary',
            'mdn', 'w3schools', 'runoob', '菜鸟教程', 'devdocs',
            '百科', '词典', '字典', '知识',
            'wiktionary', 'wikibooks', 'wikihow', 'britannica',
            'merriam-webster', 'oxford', 'cambridge', 'collins',
            // 语言学习
            'language', 'english', 'chinese', 'japanese', 'spanish', 'french',
            'duolingo', 'babbel', 'rosetta', 'memrise', 'busuu', 'hellotalk',
            '扇贝', 'shanbay', '百词斩', '有道', 'youdao',
            '语言', '英语', '日语', '外语',
            'lingoda', 'italki', 'preply', 'verbling', 'tandem', 'hinative',
            'anki', 'quizlet', 'memrise', 'vocabulary', 'grammar',
            // 学术研究
            'research', 'paper', 'journal', 'academic', 'scholar', 'arxiv',
            'google scholar', 'researchgate', 'sci-hub', 'pubmed', 'ieee',
            'cnki', '知网', '万方', '维普',
            '论文', '学术', '研究', '文献',
            'jstor', 'springer', 'elsevier', 'nature', 'science',
            'ssrn', 'biorxiv', 'medrxiv', 'philpapers', 'citeseerx',
            // 技能学习
            'skill', 'practice', 'exercise', 'quiz', 'test', 'exam',
            'leetcode', 'hackerrank', 'codewars', 'topcoder', 'codeforces',
            '刷题', '练习', '考试',
            'hackerearth', 'coderbyte', 'project euler', 'codility',
            'atcoder', 'codechef', 'kattis', 'spoj', 'uva',
            // 编程学习
            'programming tutorial', 'coding bootcamp', 'web development',
            'full stack', 'frontend', 'backend', 'mobile development',
            'machine learning', 'data science', 'ai', 'deep learning',
            '区块链', 'blockchain', '人工智能', '机器学习',
            // 职业发展
            'career', 'professional', 'certification', 'certificate',
            'linkedin learning', 'coursera certificate', 'udemy certificate',
            '职业', '专业', '认证', '证书',
            // 开放教育资源
            'open educational resources', 'oer', 'mit opencourseware',
            'stanford online', 'harvard online', 'yale courses',
            '开放式课程', '公开课', '网络公开课',
            // 实验室工具
            'jupyter', 'colab', 'kaggle', 'google colab',
            'replit', 'glitch', 'codepen', 'jsfiddle', 'codesandbox',
            '在线编程', '代码编辑器', 'ide',
            // 学习社区
            'study group', 'learning community', 'education forum',
            'study buddy', 'peer learning', 'collaborative learning',
            '学习小组', '学习社区', '教育论坛'
        ]);

        // 社交网络
        this.addRule('社交网络', [
            // 国际平台
            'facebook', 'twitter', 'x.com', 'instagram', 'linkedin', 'tiktok',
            'snapchat', 'pinterest', 'reddit', 'tumblr', 'flickr', 'mastodon',
            'threads', 'bluesky', 'clubhouse', 'discord', 'slack',
            // 国内平台
            'weibo', '微博', 'wechat', '微信', 'qq', 'qzone', '空间',
            'douban', '豆瓣', 'xiaohongshu', '小红书',
            'tieba', '贴吧', 'jianshu', '简书',
            // 社交相关
            'social', 'network', 'community', 'forum', 'bbs',
            'message', 'messenger', 'whatsapp', 'telegram', 'line',
            'friend', 'follow', 'share', 'post', 'comment',
            '社交', '朋友', '分享', '评论', '社区',
            // 交友婚恋
            'dating', 'match', 'tinder', 'bumble', 'okcupid', 'hinge',
            'momo', '陈陈', 'tantan', '探探', 'soul',
            '交友', '婚恋', '相亲'
        ]);

        // 视频娱乐
        this.addRule('视频娱乐', [
            // 国际平台
            'youtube', 'netflix', 'hulu', 'disney', 'disney+', 'amazon prime',
            'hbo', 'hbo max', 'paramount', 'peacock', 'apple tv',
            'twitch', 'vimeo', 'dailymotion', 'rumble',
            // 国内平台
            'bilibili', 'b站', 'iqiyi', '爱奇艺', 'youku', '优酷',
            'tencent video', '腾讯视频', 'mango tv', '芒果', 'douyin', '抖音',
            'kuaishou', '快手', 'xigua', '西瓜', 'huya', '虎牙', 'douyu', '斗鱼',
            // 视频相关
            'video', 'movie', 'film', 'tv', 'series', 'show', 'episode',
            'streaming', 'watch', 'player', 'cinema', 'theater',
            '视频', '电影', '电视剧', '综艺', '播放', '观看',
            // 内容类型
            'entertainment', 'comedy', 'drama', 'action', 'thriller', 'horror',
            'anime', '动漫', '番剧', 'cartoon', '动画',
            'documentary', '纪录片', 'news', '新闻', 'sports', '体育',
            'music video', 'mv', 'concert', '演唱会',
            // 直播相关
            'live', 'broadcast', 'stream', 'channel', 'vlog', 'podcast',
            '直播', '频道', '主播', 'streamer'
        ]);

        // 新闻媒体
        this.addRule('新闻媒体', [
            // 国际主流媒体
            'cnn', 'bbc', 'reuters', 'ap', 'bloomberg', 'wsj',
            'nytimes', 'guardian', 'washington post', 'forbes',
            'techcrunch', 'verge', 'ars technica', 'wired', 'engadget',
            // 新闻媒体平台
            'media', 'press', 'journalism', 'reporter',
            'article', 'story', 'breaking news', 'headline',
            'newspaper', 'magazine', 'journal', 'periodical', 'publication',
            // 新闻分类
            'politics', 'economy', 'business', 'finance', 'market',
            'technology', 'science', 'health', 'world', 'local',
            'sports', 'entertainment', 'culture', 'lifestyle', 'opinion',
            // 中文媒体
            '新华社', '人民日报', '央视新闻', '中新网', '环球时报',
            '澎湃新闻', '界面新闻', '财新网', '第一财经', '21世纪经济报道',
            '新浪新闻', '腾讯新闻', '网易新闻', '搜狐新闻', '凤凰网',
            // 科技媒体
            'tech news', 'venturebeat', 'zdnet', 'cnet', 'gizmodo',
            'the information', 'protocol', 'axios', 'propublica', 'wired',
            '36氪', '虎嗅', '钛媒体', '爱范儿', '极客公园',
            // 财经媒体
            'financial news', 'marketwatch', 'cnbc', 'fox business',
            'wall street journal', 'financial times', 'economist',
            '财经网', '和讯网', '东方财富', '雪球', '同花顺',
            // 体育媒体
            'espn', 'sports illustrated', 'bleacher report', 'fox sports',
            'cbs sports', 'nbc sports', 'sky sports', 'eurosport',
            '腾讯体育', '新浪体育', '网易体育', '虎扑体育',
            // 娱乐媒体
            'entertainment tonight', 'people', 'us weekly', 'tmz',
            'variety', 'hollywood reporter', 'billboard', 'rolling stone',
            '娱乐八卦', '明星绯闻', '影视资讯', '音乐资讯',
            // 新闻聚合
            'news aggregator', 'google news', 'apple news', 'flipboard',
            'feedly', 'inoreader', 'newsblur', 'the old reader',
            '今日头条', '一点资讯', 'zaker', '鲜果', '即刻',
            // 社交新闻
            'social news', 'reddit', 'hacker news', 'product hunt',
            'digg', 'slashdot', 'lobsters', 'hacker news',
            // 视频新闻
            'video news', 'news channel', 'live news', 'news broadcast',
            'cnn live', 'bbc live', 'fox news', 'msnbc', 'c-span',
            '新闻直播', '视频新闻', '新闻频道', '电视新闻',
            // 播客新闻
            'news podcast', 'daily news', 'news briefing', 'current events',
            'the daily', 'up first', 'today explained', 'podcast news',
            // 地方新闻
            'local news', 'city news', 'regional news', 'community news',
            'state news', 'provincial news', 'municipal news',
            '地方新闻', '城市新闻', '本地新闻', '社区新闻',
            // 新闻分析
            'news analysis', 'opinion', 'editorial', 'commentary',
            'column', 'analysis', 'investigation', 'feature',
            '新闻分析', '社论', '评论', '深度报道',
            // 新闻工具
            'news api', 'rss feed', 'news alert', 'notification',
            'newsletter', 'digest', 'summary', 'briefing',
            '新闻推送', '订阅', 'RSS', '新闻摘要'
        ]);

        // 电商购物
        this.addRule('电商购物', [
            // 国际平台
            'amazon', 'ebay', 'alibaba', 'aliexpress', 'shopify', 'etsy',
            'walmart', 'target', 'costco', 'bestbuy', 'newegg',
            'wish', 'shein', 'asos', 'zara', 'h&m', 'uniqlo',
            // 国内平台
            'taobao', '淘宝', 'tmall', '天猫', 'jd', '京东',
            'pinduoduo', '拼多多', 'suning', '苏宁', 'vip', '唯品会',
            'xiaomi', '小米', 'huawei', '华为', 'gome', '国美',
            'dangdang', '当当', 'yihaodian', '一号店',
            // 购物相关
            'shopping', 'shop', 'store', 'mall', 'market', 'buy', 'sell',
            'purchase', 'order', 'cart', 'checkout', 'payment',
            '购物', '商城', '买', '卖', '购买', '下单', '支付',
            // 促销相关
            'price', 'deal', 'discount', 'coupon', 'sale', 'offer',
            'promotion', 'clearance', 'bargain', 'cheap',
            '价格', '优惠', '折扣', '促销', '特价', '秒杀',
            // 商品类型
            'fashion', 'clothing', 'shoes', 'accessories', '服装', '鞋',
            'electronics', 'gadget', '数码', '电子',
            'furniture', 'kitchen', '家居', '家电',
            'beauty', 'cosmetic', 'makeup', '美妆', '化妆品',
            'grocery', 'snack', '食品', '零食'
        ]);

        // 设计创作
        this.addRule('设计创作', [
            'figma', 'sketch', 'adobe', 'photoshop', 'illustrator',
            'canva', 'dribbble', 'behance', 'deviantart', 'artstation',
            'design', 'creative', 'art', 'graphic', 'ui', 'ux',
            'prototype', 'mockup', 'wireframe', 'template',
            'color', 'palette', 'font', 'typography', 'icon',
            'photo', 'image', 'picture', 'gallery', 'portfolio',
            'drawing', 'painting', 'illustration', 'animation',
            // Adobe系列
            'after effects', 'premiere', 'indesign', 'lightroom', 'bridge',
            'xd', 'dimension', 'character animator', 'audition',
            // 设计工具
            'affinity', 'procreate', 'clip studio', 'paint tool sai',
            'blender', 'cinema 4d', 'maya', '3ds max', 'zbrush',
            'sketchbook', 'krita', 'gimp', 'inkscape', 'affinity designer',
            // UI/UX设计
            'user interface', 'user experience', 'interaction design',
            'mobile design', 'web design', 'app design', '设计系统',
            'design system', 'component library', 'design tokens',
            // 插图绘画
            'illustrator', 'drawing', 'sketching', 'digital art',
            'concept art', 'character design', 'concept design',
            '手绘', '插画', '原画', '角色设计',
            // 动效视频
            'motion graphics', 'animation', 'video editing',
            'after effects', 'premiere pro', 'final cut', 'da vinci',
            '动效', '动画', '视频剪辑', '特效',
            // 3D设计
            '3d modeling', '3d design', 'rendering', 'vfx',
            'substance', 'texture', 'material', 'lighting',
            '三维', '建模', '渲染', '特效',
            // 平面设计
            'logo design', 'branding', 'poster', 'flyer', 'brochure',
            'business card', 'banner', 'infographic', 'layout',
            '标志设计', '品牌设计', '海报', '宣传册',
            // 素材资源
            'stock photo', 'vector', 'icon font', 'font awesome',
            'unsplash', 'pexels', 'pixabay', 'freepik',
            '素材', '图库', '矢量图', '图标库',
            // 设计社区
            'dribbble', 'behance', 'artstation', 'deviantart',
            'coroflot', 'carbonmade', 'cargocollective', '设计社区',
            // 设计理论
            'design thinking', 'color theory', 'composition',
            'visual design', 'design principles', '设计思维',
            '色彩理论', '构图', '视觉设计',
            // 创意工具
            'mind mapping', 'brainstorming', 'idea generation',
            'mural', 'miro', 'stormboard', '创意', '头脑风暴'
        ]);

        // 金融理财
        this.addRule('金融理财', [
            'bank', 'banking', 'finance', 'money', 'investment',
            'trading', 'stock', 'crypto', 'bitcoin', 'ethereum',
            'paypal', 'stripe', 'square', 'venmo', 'cashapp',
            'credit', 'debit', 'loan', 'mortgage', 'insurance',
            'budget', 'expense', 'income', 'tax', 'accounting',
            'mint', 'ynab', 'quicken', 'personal capital',
            'robinhood', 'etrade', 'fidelity', 'schwab', 'vanguard',
            // 银行服务
            'checking', 'savings', 'deposit', 'withdrawal', 'transfer',
            'wire transfer', 'ach', 'direct deposit', 'mobile banking',
            '支票', '储蓄', '存款', '取款', '转账', '手机银行',
            // 投资平台
            'brokerage', 'securities', 'mutual fund', 'etf', 'bonds',
            'options', 'futures', 'forex', 'commodities', 'portfolio',
            '券商', '证券', '基金', '债券', '期货', '外汇',
            // 加密货币
            'blockchain', 'defi', 'nft', 'web3', 'metamask',
            'coinbase', 'binance', 'kraken', 'kucoin', 'huobi',
            'wallet', 'mining', 'staking', 'yield farming',
            '区块链', '去中心化', '钱包', '挖矿',
            // 支付服务
            'payment', 'checkout', 'merchant', 'pos', 'gateway',
            'apple pay', 'google pay', 'samsung pay', 'alipay', 'wechat pay',
            '支付', '收款', '商户', '支付宝', '微信支付',
            // 信贷服务
            'credit card', 'personal loan', 'auto loan', 'student loan',
            'credit score', 'fico', 'credit report', 'debt consolidation',
            '信用卡', '个人贷款', '车贷', '学生贷款', '信用评分',
            // 保险服务
            'life insurance', 'health insurance', 'auto insurance',
            'home insurance', 'travel insurance', 'premium', 'deductible',
            '人寿保险', '健康保险', '车险', '房屋保险',
            // 理财规划
            'financial planning', 'retirement', '401k', 'ira', 'pension',
            'wealth management', 'asset allocation', 'risk management',
            '退休规划', '财富管理', '资产配置', '风险管理',
            // 税务服务
            'tax filing', 'tax preparation', 'tax software', 'hr block',
            'turbotax', 'taxact', 'freetaxusa', '报税', '税务',
            // 会计软件
            'quickbooks', 'xero', 'freshbooks', 'wave', 'zoho books',
            'bookkeeping', 'payroll', 'invoicing', '会计', '记账',
            // 金融资讯
            'market news', 'stock analysis', 'financial news', 'bloomberg',
            'yahoo finance', 'marketwatch', 'seeking alpha', '金融新闻',
            // 个人理财
            'saving money', 'frugal', 'budgeting', 'expense tracking',
            'net worth', 'financial independence', 'fire movement',
            '省钱', '节俭', '记账', '净资产', '财务独立'
        ]);

        // 云服务
        this.addRule('云服务', [
            'aws', 'azure', 'gcp', 'google cloud', 'alibaba cloud',
            'dropbox', 'onedrive', 'google drive', 'icloud', 'box',
            'cloud', 'storage', 'backup', 'sync', 'server',
            'hosting', 'domain', 'cdn', 'database', 'api',
            'saas', 'paas', 'iaas', 'serverless', 'container',
            'kubernetes', 'docker', 'microservice', 'devops', 'k8s',
            // 云计算平台
            'ec2', 's3', 'lambda', 'rds', 'cloudfront', 'route 53',
            'azure vm', 'blob storage', 'azure functions', 'cosmos db',
            'compute engine', 'cloud storage', 'cloud functions', 'cloud sql',
            '弹性计算', '对象存储', '无服务器', '云数据库',
            // 云存储服务
            'google photos', 'amazon photos', 'flickr', 'smugmug',
            'mega', 'pcloud', 'sync.com', 'tresorit',
            '云相册', '网盘', '云同步', '加密存储',
            // 云办公套件
            'google workspace', 'microsoft 365', 'zoho workplace',
            '办公套件', '在线办公', '协同办公',
            // 云开发平台
            'vercel', 'netlify', 'heroku', 'digitalocean', 'linode',
            'railway', 'render', 'fly.io', 'supabase', 'firebase',
            'paas平台', 'serverless平台', '全栈平台',
            // 云数据库
            'mongodb atlas', 'redis cloud', 'elastic cloud',
            'cockroachdb', 'planetScale', 'neon', 'turso',
            '云数据库', '托管数据库', '数据库即服务',
            // 云安全
            'cloud security', 'identity management', 'access control',
            'encryption', 'compliance', 'audit', 'monitoring',
            '云安全', '身份管理', '合规性',
            // 云网络
            'vpc', 'load balancer', 'cdn', 'dns', 'vpn',
            'cloudflare', 'fastly', 'akamai', 'imperva',
            '虚拟网络', '负载均衡', '内容分发',
            // 云监控
            'cloudwatch', 'azure monitor', 'stackdriver', 'datadog',
            'new relic', 'splunk',
            '云监控', '性能监控', '日志分析',
            // 云备份
            'backup as a service', 'disaster recovery', 'business continuity',
            'veeam', 'commvault', 'rubrik', 'cohesity',
            '云备份', '灾备', '业务连续性',
            // 云原生
            'cloud native', 'microservices', 'containers', 'orchestration',
            'service mesh', 'observability', 'gitops', 'devsecops',
            '云原生', '微服务', '容器编排',
            // 混合云
            'hybrid cloud', 'multi-cloud', 'edge computing',
            'kubernetes', 'openshift', 'rancher', 'vmware',
            '混合云', '多云', '边缘计算'
        ]);

        // 搜索引擎
        this.addRule('搜索引擎', [
            'google', 'bing', 'yahoo', 'duckduckgo', 'baidu',
            'yandex', 'ask', 'aol', 'startpage', 'searx',
            'search', 'find', 'query', 'index', 'crawler',
            'seo', 'optimization', 'ranking', 'keyword',
            // 国际搜索引擎
            'google.com', 'bing.com', 'yahoo.com', 'duckduckgo.com',
            'yandex.com', 'ask.com', 'ecosia', 'brave search',
            'qwant', 'swisscows', 'gibiru', 'dogpile', 'webcrawler',
            // 中文搜索引擎
            'baidu.com', 'so.com', 'sogou.com', 'haosou.com',
            '360搜索', '搜狗搜索', '神马搜索', '必应',
            // 垂直搜索
            'google scholar', 'google books', 'google images',
            'google news', 'google maps', 'google flights',
            '学术搜索', '图书搜索', '图片搜索', '新闻搜索',
            // 技术搜索
            'github search', 'stackoverflow search', 'npm search',
            'pypi search', 'crates.io', 'maven central',
            '代码搜索', '包搜索', '文档搜索',
            // 搜索优化
            'search engine optimization', 'seo tools', 'keyword research',
            'backlink analysis', 'rank tracking', 'site audit',
            'ahrefs', 'semrush', 'moz', 'majestic', 'screaming frog',
            // 搜索分析
            'google analytics', 'google search console', 'bing webmaster',
            'yandex webmaster', 'baidu ziyuan', '站长工具',
            '网站分析', '搜索控制台', '站长平台',
            // 搜索API
            'search api', 'google custom search', 'bing search api',
            'elasticsearch', 'algolia', 'typesense', 'meilisearch',
            '搜索接口', '自定义搜索', '全文搜索',
            // 隐私搜索
            'private search', 'anonymous search', 'no tracking',
            'startpage', 'searx', 'qwant', 'duckduckgo',
            '隐私搜索', '匿名搜索', '无跟踪',
            // 搜索技巧
            'advanced search', 'search operators', 'boolean search',
            'site search', 'filetype search', 'intitle search',
            '高级搜索', '搜索操作符', '布尔搜索',
            // 搜索引擎技术
            'web crawler', 'spider', 'bot', 'indexing', 'ranking algorithm',
            'pagerank', 'machine learning', 'natural language processing',
            '网络爬虫', '索引', '排序算法',
            // 本地搜索
            'local search', 'business listing', 'google my business',
            'yelp', 'tripadvisor', 'foursquare', 'yellow pages',
            '本地搜索', '商家列表', '黄页',
            // 购物搜索
            'shopping search', 'price comparison', 'product search',
            'google shopping', 'amazon search', 'ebay search',
            '购物搜索', '比价', '商品搜索'
        ]);

        // 文档协作
        this.addRule('文档协作', [
            'google docs', 'microsoft office', 'office 365', 'word',
            'excel', 'powerpoint', 'sheets', 'slides', 'forms',
            'confluence', 'sharepoint', 'onedrive', 'dropbox paper',
            'document', 'doc', 'pdf', 'spreadsheet', 'presentation',
            'collaboration', 'team', 'share', 'edit', 'comment',
            'version', 'track', 'review', 'approve', 'workflow',
            // 在线文档
            'google workspace', 'microsoft 365', 'zoho docs',
            'onlyoffice', 'wps office', '石墨文档', '腾讯文档',
            '金山文档', '飞书文档', '语雀',
            '在线文档', '协作文档', '云文档',
            // 文档编辑
            'word processor', 'text editor', 'rich text', 'markdown',
            'latex', 'typora', 'obsidian', 'notepad++', 'sublime',
            '文字处理', '文本编辑', '富文本', '标记语言',
            // 表格处理
            'spreadsheet', 'worksheet', 'pivot table', 'chart', 'formula',
            'data analysis', 'visualization', 'dashboard', 'report',
            '电子表格', '数据透视表', '图表', '公式',
            // 演示文稿
            'presentation', 'slideshow', 'deck', 'PowerPoint', 'keynote',
            'prezi', 'canva', 'beautiful.ai', 'slidesgo',
            '演示文稿', '幻灯片', 'PPT', '演讲',
            // PDF工具
            'pdf editor', 'pdf reader', 'pdf converter', 'pdf merger',
            'adobe acrobat', 'foxit reader', 'pdf expert', 'pdfescape',
            'PDF编辑', 'PDF阅读', 'PDF转换', 'PDF合并',
            // 文档管理
            'document management', 'dms', 'file sharing', 'version control',
            'document workflow', 'approval process', 'digital signature',
            '文档管理', '文件共享', '版本控制', '电子签名',
            // 知识管理
            'knowledge base', 'wiki', 'documentation', 'help center',
            'faq', 'manual', 'handbook',
            '知识库', '文档中心', '帮助文档', '手册',
            // 协作平台
            'team collaboration', 'real-time editing', 'co-authoring',
            'document sharing', 'online collaboration',
            '团队协作', '实时编辑', '协同写作',
            // 文档模板
            'template', 'document template', 'form template',
            'resume template', 'invoice template', 'contract template',
            '模板', '文档模板', '表单模板', '简历模板',
            // 文档转换
            'file conversion', 'format conversion', 'doc to pdf',
            'pdf to word', 'excel to pdf', 'image to pdf',
            '文件转换', '格式转换', '文档转换',
            // 文档安全
            'document security', 'encryption', 'password protection',
            'access control', 'watermark', 'digital rights',
            '文档安全', '加密', '密码保护', '水印',
            // 文档同步
            'document sync', 'cloud sync', 'offline mode',
            'auto save', 'version history', 'backup',
            '文档同步', '离线模式', '自动保存', '版本历史'
        ]);

        // 音乐音频
        this.addRule('音乐音频', [
            'spotify', 'apple music', 'youtube music', 'soundcloud',
            'pandora', 'tidal', 'deezer', 'amazon music', 'qq music',
            'music', 'audio', 'song', 'album', 'artist', 'band',
            'playlist', 'radio', 'podcast', 'stream', 'listen',
            'sound', 'recording', 'mp3', 'wav', 'flac', 'aac',
            // 音乐平台
            'netease cloud music', '网易云音乐', 'kugou', '酷狗',
            'kuwo', '酷我', 'migu', '咪咕音乐', 'joox',
            'music app', 'streaming service', '在线音乐', '音乐流媒体',
            // 音频格式
            'mp3', 'wav', 'flac', 'aac', 'ogg', 'wma', 'm4a',
            'opus', 'aiff', 'dsd', 'high-res audio', '无损音频',
            // 音乐制作
            'daw', 'digital audio workstation', 'ableton', 'logic pro',
            'fl studio', 'cubase', 'pro tools', 'garageband',
            '音乐制作', '编曲', '混音', '母带',
            // 音频编辑
            'audio editor', 'sound editor', 'audacity', 'adobe audition',
            'waveeditor', 'hokusai', 'ferrite', '音频编辑',
            // 播客平台
            'apple podcasts', 'spotify podcasts', 'google podcasts',
            'overcast', 'pocket casts', 'castro', 'breaker',
            '播客', 'podcast', '有声书', 'audiobook',
            // 音乐发现
            'music discovery', 'recommendation', 'radio station',
            'genre', 'mood', 'playlist', 'curated', '音乐推荐',
            // 音乐下载
            'music download', 'free music', 'legal download',
            'bandcamp', 'soundcloud download', 'jamendo',
            '音乐下载', '免费音乐', '独立音乐',
            // 音乐视频
            'music video', 'mv', 'concert', 'live performance',
            'vevo', 'mtv', 'billboard', '音乐电视', '演唱会',
            // 音频设备
            'headphones', 'earphones', 'speakers', 'audio interface',
            'microphone', 'mixer', 'amplifier', 'dac', 'amp',
            '耳机', '音箱', '麦克风', '声卡',
            // 音乐学习
            'music theory', 'instrument', 'piano', 'guitar', 'violin',
            'music lesson', 'tutorial', 'sheet music', '乐理', '乐器',
            // 音效素材
            'sound effects', 'samples', 'loops', 'presets',
            'freesound', 'splice', 'loopmasters', '音效', '采样',
            // 音乐社区
            'music community', 'last.fm', 'discogs', 'rateyourmusic',
            'music forum', 'fan community', '音乐社区', '乐迷',
            // 直播音乐
            'music streaming', 'live music', 'virtual concert',
            'twitch music', 'youtube live', '直播音乐',
            // 音乐资讯
            'music news', 'album review', 'artist interview',
            'music magazine', 'billboard', 'rolling stone',
            '音乐资讯', '专辑评论', '音乐杂志'
        ]);

        // 游戏娱乐
        this.addRule('游戏娱乐', [
            'steam', 'epic games', 'origin', 'uplay', 'battle.net',
            'xbox', 'playstation', 'nintendo', 'switch', 'mobile',
            'game', 'gaming', 'play', 'player', 'gamer', 'esports',
            'mmorpg', 'fps', 'rpg', 'strategy', 'puzzle', 'casual',
            'indie', 'aaa', 'multiplayer', 'online', 'offline',
            'console', 'pc', 'mobile', 'vr', 'ar',
            // 游戏平台
            'steam', 'epic games store', 'gog', 'humble bundle',
            'itch.io', 'origin', 'uplay', 'battle.net', 'rockstar',
            '游戏平台', '数字发行', '游戏商店',
            // 主机游戏
            'playstation', 'ps5', 'ps4', 'xbox', 'xbox series', 'nintendo',
            'switch', 'wii', '3ds', 'ps vita', '游戏机', '主机',
            // 移动游戏
            'mobile game', 'ios game', 'android game', 'app store',
            'google play', 'tap tap', '手机游戏', '手游',
            // 游戏类型
            'action', 'adventure', 'racing', 'sports', 'simulation',
            'horror', 'survival', 'stealth', 'platformer', 'fighting',
            '动作', '冒险', '竞速', '体育', '模拟', '恐怖',
            // 策略游戏
            'rts', 'real-time strategy', 'turn-based', '4x', 'grand strategy',
            'civilization', 'starcraft', 'age of empires', 'total war',
            '即时战略', '回合制', '大战略',
            // RPG游戏
            'jrpg', 'wrpg', 'mmorpg', 'action rpg', 'tactical rpg',
            'final fantasy', 'dragon quest', 'persona', 'witcher',
            '日式rpg', '美式rpg', '角色扮演',
            // 射击游戏
            'fps', 'tps', 'battle royale', 'arena shooter',
            'call of duty', 'battlefield', 'overwatch', 'valorant',
            '第一人称', '第三人称', '大逃杀',
            // 独立游戏
            'indie game', 'indie developer', 'pixel art', 'retro',
            'minecraft', 'stardew valley', 'hades', 'celeste',
            '独立游戏', '像素艺术', '复古',
            // 电竞游戏
            'esports', 'competitive gaming', 'pro gaming', 'tournament',
            'league of legends', 'dota 2', 'counter-strike', 'overwatch',
            '电竞', '竞技游戏', '职业比赛', '联赛',
            // VR/AR游戏
            'virtual reality', 'augmented reality', 'vr headset',
            'oculus', 'playstation vr', 'htc vive', 'valve index',
            '虚拟现实', '增强现实', 'VR游戏',
            // 游戏开发
            'game development', 'unity', 'unreal engine', 'game engine',
            'game design', 'game programming', 'game art', '游戏开发',
            // 游戏社区
            'gaming community', 'discord', 'twitch', 'youtube gaming',
            'reddit gaming', 'game forums', '游戏社区', '主播',
            // 游戏资讯
            'gaming news', 'game review', 'game guide', 'walkthrough',
            'ign', 'gamespot', 'polygon', 'kotaku', '游戏新闻',
            // 游戏直播
            'game streaming', 'live stream', 'let\'s play', 'gameplay',
            'twitch', 'youtube gaming', 'douyu', 'huya', '斗鱼', '虎牙',
            // 游戏工具
            'game launcher', 'mod', 'cheat', 'trainer', 'save editor',
            'nexus mods', 'steam workshop', '游戏修改', '作弊',
            // 桌面游戏
            'board game', 'card game', 'tabletop', 'dungeons & dragons',
            'magic: the gathering', 'chess', 'boardgame arena',
            '桌游', '卡牌游戏', '桌面游戏', '桌游吧',
            // 游戏硬件
            'gaming pc', 'gaming laptop', 'gaming mouse', 'mechanical keyboard',
            'gaming chair', 'monitor', 'graphics card', 'cpu', '游戏硬件'
        ]);

        // 健康医疗
        this.addRule('健康医疗', [
            'health', 'medical', 'doctor', 'hospital', 'clinic',
            'medicine', 'drug', 'pharmacy', 'treatment', 'therapy',
            'fitness', 'exercise', 'workout', 'gym', 'yoga',
            'diet', 'nutrition', 'food', 'recipe', 'cooking',
            'wellness', 'mental', 'psychology', 'meditation',
            'sleep', 'stress', 'anxiety', 'depression', 'therapy',
            // 医疗机构
            'hospital', 'clinic', 'medical center', 'urgent care',
            'emergency room', 'surgery center', 'rehabilitation',
            '医院', '诊所', '医疗中心', '急诊', '康复中心',
            // 医疗专业
            'cardiology', 'dermatology', 'pediatrics', 'gynecology',
            'orthopedics', 'neurology', 'psychiatry', 'oncology',
            '心脏病', '皮肤科', '儿科', '妇科', '骨科',
            // 健康管理
            'health tracking', 'fitness tracker', 'health app',
            'myfitnesspal', 'fitbit', 'garmin', 'apple health',
            '健康追踪', '健康应用', '运动手环',
            // 运动健身
            'gym', 'fitness center', 'personal training', 'crossfit',
            'bodybuilding', 'weightlifting', 'cardio', 'hiit',
            '健身房', '健身中心', '私教', '力量训练',
            // 瑜伽冥想
            'yoga', 'pilates', 'meditation', 'mindfulness', 'breathing',
            'zen', 'taichi', 'qigong', '瑜伽', '冥想', '正念',
            // 营养饮食
            'nutrition', 'diet', 'meal planning', 'calorie counting',
            'macro tracking', 'recipe', 'cooking', 'meal prep',
            '营养学', '饮食', '卡路里', '食谱', '备餐',
            // 心理健康
            'mental health', 'psychology', 'therapy', 'counseling',
            'anxiety', 'depression', 'stress management', 'self-care',
            '心理健康', '心理治疗', '压力管理', '自我关怀',
            // 睡眠健康
            'sleep', 'insomnia', 'sleep apnea', 'sleep tracking',
            'sleep hygiene', 'dream', 'nap', '睡眠', '失眠',
            // 医疗资讯
            'medical news', 'health news', 'webmd', 'mayo clinic',
            'healthline', 'medical journal', 'research', '医疗新闻',
            // 在线医疗
            'telemedicine', 'online doctor', 'virtual consultation',
            'teladoc', 'amwell', 'doctor on demand', '远程医疗',
            // 药物药店
            'pharmacy', 'drugstore', 'prescription', 'medication',
            'walgreens', 'cvs', 'rite aid', '药店', '处方', '药物',
            // 健康保险
            'health insurance', 'medical insurance', 'coverage',
            'deductible', 'copay', 'premium', '健康保险', '医疗保险',
            // 医疗设备
            'medical device', 'diagnostic', 'monitoring', 'therapeutic',
            'blood pressure', 'glucose meter', 'thermometer', '医疗设备',
            // 专科医疗
            'dental', 'eye care', 'vision', 'hearing', 'chiropractic',
            'physical therapy', 'occupational therapy', '牙科', '眼科',
            // 中医保健
            'traditional chinese medicine', 'acupuncture', 'herbal',
            'massage', 'cupping', '中医', '针灸', '草药', '按摩',
            // 健康产品
            'vitamins', 'supplements', 'protein powder', 'energy drink',
            'health food', 'organic', 'natural', '维生素', '保健品',
            // 疾病信息
            'disease', 'symptom', 'diagnosis', 'condition', 'illness',
            'chronic disease', 'infection', 'virus', 'bacteria',
            '疾病', '症状', '诊断', '慢性病',
            // 健康社区
            'health community', 'support group', 'forum', 'discussion',
            'patientslikeme', 'healthboards', '健康社区', '病友群'
        ]);

        // 旅行出行
        this.addRule('旅行出行', [
            'booking', 'expedia', 'airbnb', 'hotels', 'flight',
            'travel', 'trip', 'vacation', 'holiday', 'tourism',
            'hotel', 'motel', 'resort', 'hostel', 'accommodation',
            'airline', 'airport', 'train', 'bus', 'car rental',
            'uber', 'lyft', 'taxi', 'ride', 'transport',
            'map', 'navigation', 'gps', 'route', 'direction',
            'destination', 'attraction', 'sightseeing', 'guide',
            // 预订平台
            'booking.com', 'expedia.com', 'airbnb.com', 'hotels.com',
            'agoda', 'trip.com', 'priceline', 'orbitz', 'travelocity',
            '携程', '去哪儿', '飞猪', '美团酒店', '同程',
            // 航空旅行
            'flight', 'airline', 'airport', 'airfare', 'booking',
            'delta', 'united', 'american', 'southwest', 'jetblue',
            '国航', '南航', '东航', '海航', '春秋航空',
            // 酒店住宿
            'hotel', 'resort', 'motel', 'hostel', 'boutique hotel',
            'bed and breakfast', 'vacation rental', 'timeshare',
            '度假村', '民宿', '青年旅社', '精品酒店',
            // 交通工具
            'car rental', 'train', 'bus', 'subway', 'metro', 'tram',
            'ferry', 'cruise', 'bike rental', 'scooter',
            '租车', '火车', '巴士', '地铁', '轮船', '游轮',
            // 打车服务
            'uber', 'lyft', 'didi', 'grab', 'gojek', 'bolt',
            'taxi', 'cab', 'rideshare', '滴滴', '神州', '首汽',
            // 地图导航
            'google maps', 'apple maps', 'waze', 'mapquest',
            'here maps', 'tomtom', 'gaode', 'baidu map',
            '高德地图', '百度地图', '腾讯地图', '导航',
            // 旅行攻略
            'travel guide', 'tripadvisor', 'lonely planet', 'fodor\'s',
            'rick steves', 'rough guides', 'frommer\'s',
            '旅行攻略', '旅游指南', '穷游', '马蜂窝',
            // 旅行社区
            'travel blog', 'travel forum', 'travel community',
            'couchsurfing', 'hospitality exchange', 'travel buddy',
            '旅行博客', '旅行社区', '沙发客', '结伴游',
            // 旅行保险
            'travel insurance', 'trip insurance', 'medical coverage',
            'cancellation protection', 'baggage insurance',
            '旅行保险', '旅游保险', '航班延误',
            // 旅行装备
            'luggage', 'backpack', 'suitcase', 'travel gear',
            'travel accessories', 'packing', 'essentials',
            '行李箱', '背包', '旅行装备', '打包',
            // 旅行摄影
            'travel photography', 'camera', 'drone', 'action camera',
            'photo editing', 'travel album', 'memory',
            '旅行摄影', '相机', '无人机', '相册',
            // 旅行美食
            'food tour', 'culinary travel', 'local cuisine',
            'restaurant', 'street food', 'food guide',
            '美食之旅', '当地美食', '餐厅', '小吃',
            // 旅行活动
            'adventure travel', 'ecotourism', 'cultural tourism',
            'wildlife safari', 'hiking', 'diving', 'skiing',
            '探险旅行', '生态旅游', '文化旅游', '野生动物',
            // 商务旅行
            'business travel', 'corporate travel', 'conference',
            'meeting', 'convention', 'business trip',
            '商务旅行', '企业出行', '会议', '展会',
            // 旅行预算
            'travel budget', 'cheap travel', 'budget airline',
            'discount hotel', 'travel deal', 'last minute',
            '旅行预算', '廉价航空', '折扣酒店', '特价',
            // 旅行签证
            'visa', 'passport', 'immigration', 'customs',
            'travel document', 'entry requirement',
            '签证', '护照', '入境', '海关',
            // 旅行健康
            'travel health', 'vaccination', 'travel medicine',
            'health advisory', 'travel clinic', 'medical kit',
            '旅行健康', '疫苗接种', '医疗建议',
            // 旅行语言
            'translation', 'language app', 'phrasebook',
            'google translate', 'duolingo', 'local language',
            '翻译', '语言学习', '当地语言', '常用语'
        ]);
    }

    /**
     * 添加分类规则
     */
    addRule(category, keywords) {
        this.rules.set(category, keywords.map(k => k.toLowerCase()));
    }

    /**
     * 分类收藏夹
     */
    classifyBookmark(bookmark) {
        if (!this.isReady) {
            throw new Error('规则分类器未初始化');
        }

        const { title, url } = bookmark;
        const text = this.buildClassificationText(title, url);
        
        console.log(`🎯 规则分类: ${title}`);
        
        // 计算每个分类的匹配分数
        const scores = new Map();
        
        for (const [category, keywords] of this.rules) {
            let score = 0;
            let matchedKeywords = [];
            
            for (const keyword of keywords) {
                if (text.includes(keyword)) {
                    // 根据匹配位置给不同权重
                    if (title.toLowerCase().includes(keyword)) {
                        score += 3; // 标题匹配权重最高
                    } else if (url.toLowerCase().includes(keyword)) {
                        score += 2; // URL匹配权重中等
                    } else {
                        score += 1; // 其他匹配权重最低
                    }
                    matchedKeywords.push(keyword);
                }
            }
            
            if (score > 0) {
                scores.set(category, { score, keywords: matchedKeywords });
            }
        }
        
        // 找到最高分的分类
        if (scores.size === 0) {
            console.log('⚠️ 未找到匹配的分类，使用默认分类');
            return {
                category: '其他',
                confidence: 0.1,
                method: 'rule-default',
                timestamp: Date.now()
            };
        }
        
        // 按分数排序
        const sortedScores = Array.from(scores.entries())
            .sort((a, b) => b[1].score - a[1].score);
        
        const [bestCategory, bestMatch] = sortedScores[0];
        const confidence = Math.min(bestMatch.score / 10, 1); // 归一化到0-1
        
        console.log(`✅ 规则分类结果: ${bestCategory} (${Math.round(confidence * 100)}%)`);
        console.log(`📝 匹配关键词: ${bestMatch.keywords.join(', ')}`);
        
        return {
            category: bestCategory,
            confidence: confidence,
            method: 'rule-based',
            timestamp: Date.now(),
            details: {
                matchedKeywords: bestMatch.keywords,
                allScores: sortedScores.slice(0, 3).map(([cat, match]) => ({
                    category: cat,
                    score: match.score,
                    keywords: match.keywords
                }))
            }
        };
    }

    /**
     * 构建分类文本
     */
    buildClassificationText(title, url) {
        // 提取域名
        const domain = this.extractDomain(url);
        
        // 提取路径关键词
        let pathKeywords = '';
        try {
            const urlObj = new URL(url);
            pathKeywords = urlObj.pathname
                .split('/')
                .filter(p => p && p.length > 2)
                .join(' ');
        } catch (error) {
            // URL解析失败，忽略路径
        }
        
        // 组合所有文本
        const parts = [title, domain, pathKeywords]
            .filter(p => p && p.length > 0)
            .join(' ');
            
        return parts.toLowerCase();
    }

    /**
     * 提取域名
     */
    extractDomain(url) {
        try {
            const urlObj = new URL(url);
            return urlObj.hostname.replace('www.', '');
        } catch (error) {
            return url;
        }
    }

    /**
     * 获取所有分类
     */
    getCategories() {
        return Array.from(this.rules.keys());
    }

    /**
     * 获取分类器信息
     */
    getInfo() {
        return {
            name: '规则分类器',
            type: 'Rule-based Classification',
            categories: this.getCategories().length,
            rules: this.rules.size,
            ready: this.isReady
        };
    }
}

// 导出规则分类器
window.RuleClassifier = RuleClassifier;
