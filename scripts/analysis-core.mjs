import { copyFile, mkdir, readFile, readdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { renderDashboardHtml } from "./dashboard/render-dashboard.mjs";

const USER_AGENT =
  "Mozilla/5.0 (compatible; GitHubTrendingAIAnalyst/3.0; +https://github.com)";

const TOOLKIT_ROOT = path.resolve(fileURLToPath(new URL("..", import.meta.url)));
const PERIOD_ORDER = ["daily", "weekly", "monthly"];

const PERIOD_CONFIG = {
  daily: {
    deltaLabel: "今日新增",
    titleLabel: "GitHub Trending 日报",
    listLabel: "日榜",
  },
  weekly: {
    deltaLabel: "本周新增",
    titleLabel: "GitHub Trending 周报",
    listLabel: "周榜",
  },
  monthly: {
    deltaLabel: "本月新增",
    titleLabel: "GitHub Trending 月报",
    listLabel: "月榜",
  },
};

const FOCUS_RULES = [
  {
    id: "ai-dev-automation",
    label: "AI 软件开发/代码自动化",
    keywords: [
      "coding agent",
      "coding agents",
      "code generation",
      "code review",
      "code search",
      "code intelligence",
      "codebase memory",
      "software engineering",
      "developer tool",
      "developer workflow",
      "coding assistant",
      "test generation",
      "repo automation",
      "agent-native",
      "coding workflow",
      "design spec for coding agents",
      "ai coding",
      "ade",
      "ide",
    ],
  },
  {
    id: "ai-agents",
    label: "AI 智能体及其辅助工作",
    keywords: [
      "agent",
      "multi-agent",
      "tool calling",
      "workflow automation",
      "workflow",
      "browser use",
      "orchestrator",
      "planner",
      "memory",
      "evaluation",
      "guardrail",
      "copilot",
      "mcp",
      "autonomous",
      "agent toolkit",
      "gui agent",
      "agentic",
    ],
  },
  {
    id: "ai-open-source",
    label: "AI 开源项目",
    keywords: [
      "llm",
      "language model",
      "ai model",
      "machine learning",
      "inference",
      "fine-tuning",
      "finetuning",
      "embedding",
      "rag",
      "diffusion",
      "vision",
      "speech",
      "audio",
      "video generation",
      "multimodal",
      "dataset",
      "transformer",
      "genai",
      "artificial intelligence",
      "openai-compatible",
      "foundation model",
      "ai",
    ],
  },
];

const FOCUS_ORDER = Object.fromEntries(FOCUS_RULES.map((rule, index) => [rule.label, index]));

const THEME_RULES = [
  {
    id: "coding",
    label: "AI 编程与开发自动化",
    narrative: "热点项目正在把 AI 能力接入真实的软件研发流程。",
    keywords: [
      "coding agent",
      "code review",
      "software engineering",
      "developer tool",
      "developer workflow",
      "code intelligence",
      "repo automation",
      "agent-native",
      "mcp",
      "ade",
      "cli",
      "ide",
    ],
  },
  {
    id: "agents",
    label: "智能体与自动化工作流",
    narrative: "社区继续把智能体拆成更可编排、可复用、可落地的工作流组件。",
    keywords: [
      "agent",
      "agentic",
      "workflow",
      "orchestrator",
      "planner",
      "memory",
      "browser use",
      "tool calling",
      "mcp",
      "copilot",
    ],
  },
  {
    id: "models",
    label: "模型能力与推理基础设施",
    narrative: "模型能力、推理效率和模型接入层仍然是持续升温的基础赛道。",
    keywords: [
      "llm",
      "model",
      "inference",
      "fine-tuning",
      "embedding",
      "rag",
      "token",
      "prompt",
      "openai-compatible",
    ],
  },
  {
    id: "multimodal",
    label: "多模态内容生成",
    narrative: "视频、图像、语音等多模态工具仍然是容易冲榜的热门形态。",
    keywords: [
      "image",
      "video",
      "audio",
      "speech",
      "voice",
      "vision",
      "multimodal",
      "diffusion",
      "avatar",
    ],
  },
  {
    id: "infra",
    label: "平台基础设施与工程化",
    narrative: "高热项目也在补齐平台层、部署层和工程整合层的能力。",
    keywords: [
      "platform",
      "infrastructure",
      "deploy",
      "cloud",
      "runtime",
      "api",
      "sdk",
      "database",
      "self-host",
      "server",
      "observability",
    ],
  },
];

const TECH_TAG_RULES = [
  {
    id: "agent",
    label: "Agent",
    keywords: ["agent", "agentic", "multi-agent", "autonomous", "copilot"],
  },
  {
    id: "ai-coding",
    label: "AI Coding",
    keywords: [
      "coding agent",
      "code review",
      "code generation",
      "code search",
      "code intelligence",
      "software engineering",
      "developer workflow",
      "repo automation",
      "coding assistant",
      "ade",
      "ide",
      "cli",
    ],
  },
  {
    id: "workflow",
    label: "Workflow",
    keywords: ["workflow", "orchestrator", "planner", "tool calling", "browser use", "automation"],
  },
  {
    id: "mcp",
    label: "MCP",
    keywords: ["mcp", "model context protocol"],
  },
  {
    id: "rag",
    label: "RAG",
    keywords: ["rag", "retrieval", "embedding", "vector", "knowledge graph", "knowledge base"],
  },
  {
    id: "model-infra",
    label: "Model Infra",
    keywords: [
      "llm",
      "language model",
      "model serving",
      "model router",
      "provider",
      "inference",
      "fine-tuning",
      "finetuning",
      "openai-compatible",
    ],
  },
  {
    id: "multimodal",
    label: "Multimodal",
    keywords: ["multimodal", "vision", "video", "image", "audio", "speech", "voice", "avatar"],
  },
  {
    id: "video",
    label: "Video",
    keywords: ["video", "short video", "movie", "montage", "video production"],
  },
  {
    id: "audio",
    label: "Audio",
    keywords: ["audio", "speech", "voice", "tts", "voice studio"],
  },
  {
    id: "security",
    label: "安全",
    keywords: ["security", "cybersecurity", "pentest", "pentesting", "vulnerability", "guardrail"],
  },
  {
    id: "frontend",
    label: "前端框架",
    keywords: ["frontend", "react", "next.js", "nextjs", "vue", "svelte", "tailwind", "design system"],
  },
  {
    id: "rust",
    label: "Rust",
    keywords: ["rust"],
  },
  {
    id: "infra",
    label: "Infra",
    keywords: [
      "infrastructure",
      "platform",
      "deploy",
      "cloud",
      "runtime",
      "server",
      "container",
      "docker",
      "kubernetes",
      "observability",
    ],
  },
  {
    id: "self-hosted",
    label: "Self-Hosted",
    keywords: ["self-hosted", "self hosted", "local processing", "local-first", "on-prem", "offline"],
  },
  {
    id: "privacy",
    label: "隐私",
    keywords: ["privacy", "private", "end-to-end", "e2ee"],
  },
  {
    id: "data",
    label: "数据采集",
    keywords: ["crawler", "scraper", "data collection", "extractor", "etl"],
  },
  {
    id: "evaluation",
    label: "Evaluation",
    keywords: ["evaluation", "benchmark", "judge", "grader", "eval"],
  },
  {
    id: "research",
    label: "Research",
    keywords: ["research framework", "analysis system", "quant", "investment", "resume"],
  },
];

const TREND_RULES = [
  {
    id: "ai-coding-engineering",
    name: "AI 编程从单点辅助走向工程化工作流",
    keywords: [
      "coding agent",
      "code review",
      "software engineering",
      "developer workflow",
      "repo automation",
      "code intelligence",
      "ade",
      "ide",
      "mcp",
      "workflow",
    ],
    tagLabels: ["AI Coding", "Workflow", "MCP", "Agent", "Infra", "Rust"],
    themeLabels: ["AI 编程与开发自动化", "智能体与自动化工作流"],
    focusLabels: ["AI 软件开发/代码自动化", "AI 智能体及其辅助工作"],
    overview:
      "本期高增项目的最大公约数不是单个插件或脚本，而是让 AI 真正接入真实仓库、真实上下文和真实研发流程的工程化能力。",
    what:
      "高 Star 增量项目正在从“补一个能力点”演进为“补一整条研发链路”，共同指向 AI 编程增强与工程化工作流这一集群化方向。",
    why:
      "社区集体发力的根因，是大模型在大型代码库中存在上下文窗口受限、仓库级记忆缺失和任务交接脆弱等瓶颈，迫使 AI 编程从单文件补全转向全库架构级理解与执行。",
    how:
      "支撑这一趋势落地的底层支撑，正在收敛为 MCP 接口、仓库级索引/RAG、代码知识图谱、终端工作流接入以及可编排的 Agent 链路。",
    risk:
      "潜在风险在于，很多项目仍停留在工作流包装层，若缺少稳定的上下文管理、索引质量和可验证执行闭环，工程化承诺容易沦为演示效果。",
    routeLabels: ["AI 编程增强与深度洞察", "AI 编程从单点辅助走向工程化工作流"],
  },
  {
    id: "agent-execution-loop",
    name: "智能体开始补齐执行闭环、记忆与工具编排",
    keywords: [
      "agent",
      "agentic",
      "workflow",
      "orchestrator",
      "planner",
      "memory",
      "browser use",
      "tool calling",
      "mcp",
      "copilot",
    ],
    tagLabels: ["Agent", "Workflow", "MCP", "Evaluation", "AI Coding"],
    themeLabels: ["智能体与自动化工作流"],
    focusLabels: ["AI 智能体及其辅助工作"],
    overview:
      "社区正在把智能体从聊天式能力模块，推向具备执行闭环、工具调用、记忆和多阶段编排的工业化系统。",
    what:
      "多个高增项目的共同演进方向，是让 Agent 从单轮交互接口升级为可持续运行、可调度、可接入外部工具链的全链路系统。",
    why:
      "其背后的范式转移是，单轮问答式 Agent 已无法覆盖真实业务中的长链路任务，行业开始追求具备稳定执行、自主性和可复用流水线的智能体基础能力。",
    how:
      "支撑这一趋势的通用方法论包括多 Agent 协同架构、工具调用协议、任务编排器、长期记忆层以及浏览器/终端等执行接口的标准化接入。",
    risk:
      "潜在风险在于，Agent 工业化很容易堆叠复杂度；如果缺少评测、权限控制和故障回滚机制，系统会在真实环境中暴露稳定性与安全性问题。",
    routeLabels: ["AI 智能体的工业化与具身化", "智能体开始补齐执行闭环、记忆与工具编排"],
  },
  {
    id: "model-platform",
    name: "模型接入与推理基础设施继续平台化",
    keywords: [
      "llm",
      "model",
      "inference",
      "fine-tuning",
      "finetuning",
      "embedding",
      "rag",
      "openai-compatible",
      "provider",
      "router",
      "serving",
      "runtime",
    ],
    tagLabels: ["Model Infra", "RAG", "Infra", "Self-Hosted", "Rust"],
    themeLabels: ["模型能力与推理基础设施", "平台基础设施与工程化"],
    focusLabels: ["AI 开源项目"],
    overview:
      "高热项目正在把模型层竞争，转化为接入层、推理层和运维层的系统化竞争。",
    what:
      "孤立的模型调用工具正在聚合成统一的模型平台化方向，重点从“接哪个模型”转向“如何稳定、低成本、可控地接入和运行模型”。",
    why:
      "社区共同发力的根因，是多模型时代带来的接口碎片化、推理成本攀升和部署复杂度失控，推动行业从模型试用走向平台整合与成本优化。",
    how:
      "支撑该趋势的基础设施包括 OpenAI-compatible 协议、模型路由层、推理网关、自托管部署栈、缓存与检索增强，以及围绕吞吐与成本的运维工程体系。",
    risk:
      "潜在风险在于，平台化项目容易陷入协议兼容与功能堆叠，但若缺乏足够的性能、观测性和成本控制优势，很难形成真正护城河。",
    routeLabels: ["模型接入与推理基础设施继续平台化"],
  },
  {
    id: "multimodal-production",
    name: "多模态内容生成正在产品化和流水线化",
    keywords: [
      "video",
      "image",
      "audio",
      "speech",
      "voice",
      "multimodal",
      "avatar",
      "diffusion",
      "editing",
    ],
    tagLabels: ["Multimodal", "Video", "Audio", "Workflow", "Self-Hosted"],
    themeLabels: ["多模态内容生成"],
    focusLabels: ["AI 开源项目"],
    overview:
      "榜单中的多模态项目，正在从单点生成器演变为围绕内容生产链路的系统化流水线。",
    what:
      "高增项目的集群化方向，是把视频、语音、图像等离散能力重新组装为可批量生产、可自动化交付的多模态内容流水线。",
    why:
      "社区转向这一方向的核心驱动力，是单点生成工具已无法解决真实生产中的链路断裂、素材组织和人机协作效率问题，AI 内容生成因此进入工业化阶段。",
    how:
      "底层支撑正在沉淀为多 Agent 协同编排、素材采集与处理链、统一的内容生产工作流、自托管运行环境以及围绕渲染/审核/发布的自动化方法论。",
    risk:
      "风险在于，多模态流水线项目容易因外部模型依赖、渲染成本和内容质量波动而失真，若没有稳定产能与评估机制，增长可能先于交付能力。",
    routeLabels: ["AI 智能体的工业化与具身化", "多模态内容生成正在产品化和流水线化"],
  },
  {
    id: "security-automation",
    name: "安全自动化与研究辅助工具持续获得关注",
    keywords: [
      "security",
      "cybersecurity",
      "vulnerability",
      "pentest",
      "pentesting",
      "guardrail",
      "analysis system",
      "research framework",
    ],
    tagLabels: ["安全", "Evaluation", "Research", "Infra", "数据采集"],
    themeLabels: ["平台基础设施与工程化"],
    focusLabels: [],
    overview:
      "安全与研究类项目的热度上升，说明社区正在把高度依赖专家经验的流程，重新编码为可复用的 AI 工作流和技能体系。",
    what:
      "高增项目并非孤立的安全工具，而是在共同推动 AI 安全与研究自动化这一演进方向，把攻防、验证和分析流程系统化。",
    why:
      "其本质驱动力，是安全检测与研究分析长期存在流程重复、专家稀缺和验证成本高的问题，推动社区将经验型框架转化为 AI 可执行的方法论。",
    how:
      "支撑该趋势的底层支撑包括结构化技能集、MITRE/ATT&CK 等框架映射、AI 驱动的评测与红队链路、自动化数据采集以及标准流程模板化。",
    risk:
      "风险在于，安全自动化若只做知识搬运而没有高质量验证与权限边界，会放大误报、误用甚至攻击滥用的风险。",
    routeLabels: ["AI 安全与红队测试", "安全自动化与研究辅助工具持续获得关注"],
  },
];

const INTENT_RULES = [
  {
    keywords: ["andrewyng/aisuite", "unified interface to multiple generative ai providers"],
    what: "统一调用多家生成式 AI 服务的 Python 接口",
    oneLine: "用一套 Python API 调用 OpenAI、Anthropic、Google 等模型，减少多供应商适配代码",
    how: "通过统一客户端和一致的消息格式封装不同模型提供商，并保留切换模型所需的最小配置",
    why: "降低多模型试验、切换与应用集成成本",
    problem: "不同模型供应商 API 形态不一、切换和对比成本高的问题",
    highlights: ["用统一 Python 接口调用多家模型", "保持一致的消息与响应结构", "便于快速切换并比较不同模型提供商"],
  },
  {
    keywords: ["claude-cookbooks"],
    what: "Claude 应用示例与最佳实践 Notebook 集合",
    oneLine: "用可运行 Notebook 展示 Claude 的提示、工具调用和多模态用法，方便开发者照着改",
    how: "按场景提供代码配方、示例数据和完整调用流程，覆盖从入门到复杂应用的实践路径",
    why: "把 Claude API 的抽象能力变成可复用实现",
    problem: "开发者理解模型能力后仍缺少可运行应用范例的问题",
    highlights: ["提供可直接运行的 Notebook 与代码配方", "覆盖提示设计、工具调用和多模态场景", "用端到端示例展示 Claude 应用模式"],
  },
  {
    keywords: ["1jehuang/jcode", "ram effiecent harness"],
    what: "低内存、高启动速度的 AI 编程 Agent 终端框架",
    oneLine: "用极低内存运行多个 AI 编程会话，并通过语义记忆持续召回相关上下文",
    how: "以轻量 TUI 承载多会话 Agent，并用向量与记忆图自动存取长期上下文",
    why: "降低并行运行多个编码 Agent 的资源成本",
    problem: "编码 Agent 多会话占用内存高、启动慢且上下文容易遗失的问题",
    highlights: ["显著降低单会话与多会话内存占用", "以毫秒级速度启动终端界面", "内置语义记忆与会话上下文召回"],
  },
  {
    keywords: ["codebase-memory-mcp"],
    what: "面向 AI 编程 Agent 的本地代码知识图谱与 MCP 服务",
    oneLine: "为 AI 编程 Agent 构建本地代码知识图谱，省 Token 看懂大仓库",
    how: "把代码库索引为持久知识图谱，再通过 MCP 暴露搜索、架构、调用链和影响分析能力",
    why: "减少大仓库理解与代码审查的上下文成本",
    problem: "AI 编程工具读取大仓库时上下文不足、Token 消耗高的问题",
    highlights: [
      "将代码库索引为可持续更新的本地知识图谱",
      "支持 158 种语言的代码解析与索引",
      "通过 MCP 提供架构、搜索、调用链与影响分析",
    ],
  },
  {
    keywords: ["code-review-graph"],
    what: "面向 AI 编程工具的本地代码关系图与 MCP 服务",
    oneLine: "为 AI 编程工具建立本地代码关系图，只读取审查和大仓库任务真正需要的上下文",
    how: "把代码库构建成持久关系图，再通过 MCP 与 CLI 提供检索、审查和影响分析能力",
    why: "减少代码审查与大仓库分析的上下文开销",
    problem: "AI 编程工具在代码审查时读取内容过多、上下文利用率低的问题",
    highlights: ["在本地构建持久代码关系图", "按任务检索真正相关的代码上下文", "通过 MCP 与 CLI 接入代码审查工作流"],
  },
  {
    keywords: ["penetration testing", "pentesting tool"],
    what: "自动执行真实攻击验证的开源 AI 渗透测试 Agent",
    oneLine: "开源 AI 渗透测试 Agent，自动发现、验证并辅助修复漏洞",
    how: "让多 Agent 在隔离环境中运行侦察、利用和 PoC 验证，并把结果接入开发流程",
    why: "把漏洞发现、验证和修复建议串成自动化闭环",
    problem: "传统渗透测试依赖人工经验、验证耗时且难接入研发流程的问题",
    highlights: ["自动执行侦察、利用与漏洞验证", "生成可复现 PoC、修复建议与补丁", "支持 CI/CD 安全扫描与报告输出"],
  },
  {
    keywords: ["hive mind communication", "humans and agents build together"],
    what: "人类与 AI Agent 共用的自托管协作空间",
    oneLine: "让人类和 AI Agent 在同一工作区聊天、协作、审查并交付代码",
    how: "用自托管事件中继统一记录消息、工作流、审批与 Git 事件，形成可审计协作链路",
    why: "把人机沟通与开发执行放进同一上下文",
    problem: "人类与多个 Agent 分散在不同工具中，协作上下文和审计记录容易断裂的问题",
    highlights: ["人类与 Agent 共享房间和项目上下文", "用签名事件日志记录消息、审批与 Git 操作", "支持自托管中继与可控的数据边界"],
  },
  {
    keywords: ["web gui for coding agents"],
    what: "统一管理多种编码 Agent 的轻量 Web 图形界面",
    oneLine: "给 Codex、Claude、Cursor 等编码 Agent 套上统一 Web 界面，集中管理会话与远程访问",
    how: "复用已安装并完成认证的 Agent CLI，通过网页或桌面入口统一启动、切换和同步会话",
    why: "降低多编码 Agent 并行使用与会话管理成本",
    problem: "不同编码 Agent 入口分散、会话难统一管理的问题",
    highlights: ["同时接入 Codex、Claude、Cursor 与 OpenCode", "提供 Web 与桌面端统一操作入口", "支持远程访问和会话同步"],
  },
  {
    keywords: ["visual cms", "alternative to webflow"],
    what: "可自托管的可视化建站 CMS",
    oneLine: "开源替代 Webflow、Framer 和 WordPress，用一个自托管服务可视化生成干净静态页面",
    how: "把画布编辑器、内容、用户、插件、数据库和发布器整合进单一服务，再输出语义化 HTML 与精简 CSS",
    why: "减少建站工具拼装与供应商锁定",
    problem: "现代网站需要拼接 CMS、框架、托管和插件，维护成本高的问题",
    highlights: ["可视化编辑器与内容发布一体化", "支持自托管、用户角色、插件和数据库", "输出无运行时负担的语义化静态页面"],
  },
  {
    keywords: ["terminal file manager"],
    what: "现代化终端文件管理器",
    oneLine: "在终端里提供美观、快捷的文件管理体验，用键盘完成浏览、预览与批量操作",
    how: "以 TUI 把目录导航、文件预览、搜索和常用文件操作集中到一个终端界面",
    why: "让命令行用户减少 cd、ls、cp 等零散操作",
    problem: "终端文件浏览和批量操作缺少直观反馈的问题",
    highlights: ["提供现代 TUI 文件浏览与预览", "支持键盘驱动的高效文件操作", "跨平台分发并便于集成终端工作流"],
  },
  {
    keywords: ["javascript runtime"],
    what: "跨平台 JavaScript 运行时",
    oneLine: "让 JavaScript 在服务器、命令行和桌面环境运行，是大量 Web 后端与工具链的基础",
    how: "基于事件循环和非阻塞 I/O 执行 JavaScript，并通过模块与包生态连接系统能力",
    why: "支撑高并发网络服务与全栈 JavaScript 开发",
    problem: "JavaScript 需要脱离浏览器运行并访问操作系统与网络能力的问题",
    highlights: ["提供跨平台 JavaScript 运行环境", "以非阻塞 I/O 支撑高并发服务", "连接成熟的 npm 模块与工具生态"],
  },
  {
    keywords: ["database tool and sql client", "ai-driven database"],
    what: "AI 驱动的数据库管理与 SQL 客户端",
    oneLine: "用 AI 辅助连接、查询和管理多种数据库，让写 SQL 与理解数据结构更省力",
    how: "在统一 GUI 中连接主流数据库，并用自然语言生成 SQL、解释结果和辅助数据库运维",
    why: "降低跨数据库查询与 SQL 使用门槛",
    problem: "数据库类型多、SQL 编写和结构理解成本高的问题",
    highlights: ["支持 MySQL、PostgreSQL、Oracle 等多种数据库", "用 AI 生成、优化并解释 SQL", "提供可视化数据管理与查询工作台"],
  },
  {
    keywords: ["design language", "anti-ai-slop design skill"],
    what: "面向编码 Agent 的设计规范与审美技能",
    oneLine: "把设计语言和反模板化审美交给编码 Agent，减少千篇一律的 AI 生成界面",
    how: "通过可复用的设计规则、检查清单和提示约束，引导 Agent 生成更一致、更有辨识度的前端",
    why: "提高 AI 生成界面的视觉质量与设计一致性",
    problem: "AI 编码容易生成模板化、缺少品牌感的界面问题",
    highlights: ["把设计语言转成 Agent 可执行规则", "强调反模板化与真实产品审美", "可接入 Claude Code、Cursor 与 Codex"],
  },
  {
    keywords: ["foundation model for the language of financial markets"],
    what: "面向金融市场时序数据的基础模型",
    oneLine: "把金融市场序列当作一种语言来建模，为预测、表征与量化研究提供基础模型",
    how: "通过大规模金融时序预训练学习市场模式，再将统一表征迁移到预测和研究任务",
    why: "减少为每个金融任务从头训练模型的成本",
    problem: "金融时间序列噪声高、任务分散且通用表征不足的问题",
    highlights: ["面向金融时间序列进行基础模型预训练", "提供可迁移的市场表征与预测能力", "支持量化研究和多类下游金融任务"],
  },
  {
    keywords: ["minecraft servers"],
    what: "高性能 Minecraft 服务端实现",
    oneLine: "用 Rust 重写 Minecraft 服务端，降低资源占用并提升多人游戏承载能力",
    how: "以高性能网络与并发架构实现兼容的游戏服务器核心，面向自托管和扩展场景",
    why: "让个人和社区更轻量地托管 Minecraft 服务器",
    problem: "传统游戏服务端资源消耗高、扩展和维护成本大的问题",
    highlights: ["以 Rust 强化性能与内存安全", "面向多人服务器优化并发处理", "提供开源、自托管的服务端基础"],
  },
  {
    keywords: ["jenkins automation server"],
    what: "可扩展的持续集成与自动化服务器",
    oneLine: "用流水线和插件自动完成构建、测试与发布，是经典的自托管 CI/CD 平台",
    how: "通过 Pipeline 配置和插件生态连接代码仓库、构建节点与部署环境",
    why: "把重复的软件交付步骤变成可追踪的自动化流程",
    problem: "构建、测试和发布依赖人工执行且难以统一管理的问题",
    highlights: ["用 Pipeline 编排构建、测试与部署", "拥有成熟的插件与集成生态", "支持分布式构建和自托管部署"],
  },
  {
    keywords: ["vpn client"],
    what: "跨平台自托管 VPN 客户端",
    oneLine: "把多种 VPN 协议整合进桌面和移动端，方便搭建并管理自己的加密网络",
    how: "通过统一客户端配置和连接多类 VPN 协议，并支持自建服务器与跨平台使用",
    why: "降低个人搭建和维护私有 VPN 的门槛",
    problem: "VPN 协议与客户端分散、配置复杂的问题",
    highlights: ["覆盖桌面与移动平台", "统一管理多种 VPN 协议", "支持自建服务与可控网络配置"],
  },
  {
    keywords: ["深入理解 ai agent", "ai-agent-book"],
    what: "AI Agent 原理与工程实践开源教材",
    oneLine: "从设计原理到工程落地系统讲解 AI Agent，并提供正文、PDF 与配套代码",
    how: "按章节组织 Agent 架构、工具调用、记忆和工程案例，并开放可编译内容与示例代码",
    why: "帮助开发者建立从概念到实现的完整 Agent 知识体系",
    problem: "Agent 学习资料碎片化、理论与工程实践脱节的问题",
    highlights: ["覆盖 Agent 设计原理与工程实践", "提供开源正文、编译版 PDF 和章节代码", "用体系化章节串联核心能力与落地案例"],
  },
  {
    keywords: ["global intelligence dashboard"],
    what: "实时全球态势与情报监测 Dashboard",
    oneLine: "聚合新闻、地缘政治、基础设施和金融信号，用一张地图持续追踪全球风险",
    how: "汇总多类实时数据源，用 AI 生成简报并在 2D/3D 地图中关联军事、经济与灾害信号",
    why: "把分散的全球事件转成统一的态势感知界面",
    problem: "全球新闻与风险信号分散，难以实时交叉验证的问题",
    highlights: ["聚合数百个新闻源并生成 AI 简报", "提供 2D/3D 地图和多类态势图层", "关联军事、经济、灾害与市场信号"],
  },
  {
    keywords: ["ram efficient harness"],
    what: "低内存、高启动速度的 AI 编程 Agent 终端框架",
    oneLine: "用极低内存运行多个 AI 编程会话，并通过语义记忆持续召回相关上下文",
    how: "以轻量 TUI 承载多会话 Agent，并用向量与记忆图自动存取长期上下文",
    why: "降低并行运行多个编码 Agent 的资源成本",
    problem: "编码 Agent 多会话占用内存高、启动慢且上下文容易遗失的问题",
    highlights: ["显著降低单会话与多会话内存占用", "以毫秒级速度启动终端界面", "内置语义记忆与会话上下文召回"],
  },
  {
    keywords: ["web ui for the pi coding agent"],
    what: "Pi 编码 Agent 的 Web 操作界面",
    oneLine: "把 Pi 编码 Agent 搬到浏览器中，方便远程使用和管理编程会话",
    how: "通过 Web UI 连接 Pi Agent 的会话与工具能力，让用户在网页端发起和查看任务",
    why: "降低终端 Agent 的使用与远程访问门槛",
    problem: "编码 Agent 依赖本地终端、跨设备访问不便的问题",
    highlights: ["为 Pi 编码 Agent 提供 Web 界面", "支持浏览器中的会话与任务操作", "便于远程访问和跨设备使用"],
  },
  {
    keywords: ["ai agent toolkit: unified llm api"],
    what: "包含统一模型接口、Agent 循环和编码 CLI 的工具包",
    oneLine: "把统一 LLM API、Agent 循环、TUI 和编码 CLI 打包，快速搭建可执行 AI Agent",
    how: "以模块化工具包组合模型调用、任务循环、终端交互和代码操作入口",
    why: "减少从零搭建 Agent 运行框架的工程成本",
    problem: "模型接口、Agent 循环和终端工具需要重复集成的问题",
    highlights: ["统一多模型 API 调用方式", "提供可扩展的 Agent 执行循环", "内置 TUI 与编码 Agent CLI"],
  },
  {
    keywords: ["skills for real engineers"],
    what: "面向真实工程任务的 Agent Skills 集合",
    oneLine: "把资深工程实践封装成可复用 Skills，让编码 Agent 按成熟方法完成真实任务",
    how: "以独立 Skill 文档沉淀任务流程、判断标准和执行步骤，可直接放入 Agent 技能目录",
    why: "减少团队反复编写提示词和工程操作规范",
    problem: "Agent 缺少稳定、可复用的工程任务方法论问题",
    highlights: ["以 Skills 形式封装真实工程经验", "可直接接入通用 Agent 技能目录", "覆盖可复用的任务流程与质量标准"],
  },
  {
    keywords: ["wifi signals", "spatial intelligence"],
    what: "基于 WiFi 信号的无摄像头空间感知系统",
    oneLine: "用普通 WiFi 信号感知人体存在、动作和生命体征，不需要摄像头",
    how: "分析无线信号在空间中的变化，实时推断位置、活动与呼吸等人体状态",
    why: "在保护隐私的同时获得低成本环境感知能力",
    problem: "摄像头感知存在隐私、遮挡和部署成本问题",
    highlights: ["无需摄像头即可感知人体与空间状态", "支持存在检测、动作与生命体征监测", "利用普通 WiFi 硬件降低部署成本"],
  },
  {
    keywords: ["ai-engineering-from-scratch", "learn it. build it. ship it"],
    what: "从数学基础到多 Agent 系统的 AI 工程开源课程",
    oneLine: "用 20 个阶段从零实现 AI 核心算法，再一路构建到 LLM、Agent 与生产系统",
    how: "每课按问题、原理、手写实现、框架实践和交付物推进，形成可运行的学习路径",
    why: "把碎片化 AI 知识串成可验证的工程能力",
    problem: "AI 学习资料分散、只会调用框架却不理解底层的问题",
    highlights: ["覆盖数学、深度学习、LLM、Agent 与生产部署", "每个算法先手写再使用主流框架", "提供分阶段课程、代码、测试和项目产物"],
  },
  {
    keywords: ["lifelong personalized tutoring"],
    what: "可长期适应学习者的个性化 AI 导师",
    oneLine: "让 AI 导师持续理解学习进度和知识缺口，为每个人动态生成辅导路径",
    how: "结合学习者画像、长期记忆和推理式教学流程，持续调整讲解、练习与反馈",
    why: "把一次性问答升级为长期、个性化学习陪伴",
    problem: "通用 AI 辅导缺少长期记忆和因材施教能力的问题",
    highlights: ["围绕学习者建立长期知识与进度画像", "动态生成个性化讲解和练习", "支持持续反馈与终身学习路径"],
  },
  {
    keywords: ["kimi code cli"],
    what: "面向终端开发流程的 AI 编码 Agent",
    oneLine: "在终端中让 Kimi Agent 读取代码、调用工具并连续完成开发任务",
    how: "通过 CLI 接入仓库上下文、命令执行和文件修改能力，形成完整编码任务闭环",
    why: "把模型能力直接接入开发者日常终端工作流",
    problem: "AI 编程停留在问答界面、难以连续操作真实仓库的问题",
    highlights: ["通过 CLI 直接操作真实代码仓库", "支持工具调用与多步骤任务执行", "覆盖代码理解、修改与验证流程"],
  },
  {
    keywords: ["securely send things from one computer"],
    what: "跨设备安全文件传输工具",
    oneLine: "用一次性代码在两台电脑间安全传文件，不用搭服务器或配置端口",
    how: "通过中继发现与端到端加密建立点对点传输，并用简单代码完成设备配对",
    why: "让临时跨设备传输既简单又安全",
    problem: "临时文件传输依赖网盘、账号或复杂网络配置的问题",
    highlights: ["用短代码快速配对发送与接收端", "提供端到端加密和安全中继", "支持文件、文件夹与断点续传"],
  },
  {
    keywords: ["semrush and ahrefs"],
    what: "开源 SEO 分析与增长工具",
    oneLine: "开源替代 Semrush 和 Ahrefs，集中完成关键词、站点与搜索表现分析",
    how: "整合关键词研究、站点审计和竞争分析数据，形成可自托管的 SEO 工作台",
    why: "降低专业 SEO 数据工具的订阅与使用门槛",
    problem: "SEO 数据分散且商业工具成本高的问题",
    highlights: ["覆盖关键词研究与排名跟踪", "提供站点审计和竞争分析", "以开源方式降低 SEO 工具成本"],
  },
  {
    keywords: ["fleet of parallel agents"],
    what: "并行管理多个编码 Agent 的开发环境",
    oneLine: "在桌面、手机或 VPS 上同时调度一组编码 Agent，加速并行开发任务",
    how: "把不同编码 Agent 的会话、工作区和执行状态集中到统一 ADE 中并行编排",
    why: "提升复杂开发任务的并行度和 Agent 利用率",
    problem: "多个编码 Agent 难统一调度、监控和跨设备使用的问题",
    highlights: ["并行运行和管理多个编码 Agent", "支持桌面、移动端与 VPS", "复用用户自己的 Agent 订阅与工作区"],
  },
  {
    keywords: ["cad, robotics and hardware design"],
    what: "面向 CAD、机器人和硬件设计的 Agent Skills 集合",
    oneLine: "把 CAD、机器人和硬件设计流程封装成 Agent Skills，让 AI 参与实体产品设计",
    how: "用技能文件定义建模、参数、工具调用和验证步骤，连接 Agent 与工程设计软件",
    why: "把编码 Agent 的能力扩展到硬件与三维设计",
    problem: "通用 Agent 不理解 CAD 与硬件工程工作流的问题",
    highlights: ["覆盖 CAD、机器人与硬件设计任务", "以 Skills 形式封装专业工程流程", "连接自然语言需求与参数化设计工具"],
  },
  {
    keywords: ["curated list of awesome claude skills"],
    what: "Claude Skills、资源与工具精选目录",
    oneLine: "集中整理可复用 Claude Skills 和工具，帮助用户快速扩展 Agent 工作流",
    how: "按用途维护社区技能、资源和工具链接，作为发现与选型入口",
    why: "降低寻找和组合 Agent Skills 的时间成本",
    problem: "Claude 技能分散、质量和用途难快速判断的问题",
    highlights: ["集中收录 Claude Skills 与配套资源", "按场景提供可浏览的技能目录", "帮助快速定制 Claude 工作流"],
  },
  {
    keywords: ["test framework for unit-tests", "c++-native, test framework"],
    what: "现代 C++ 单元测试框架",
    oneLine: "为 C++ 提供原生、易读的单元测试、TDD 和 BDD 框架",
    how: "通过头文件/库和简洁断言语法组织测试用例，并集成主流构建与测试工具",
    why: "让 C++ 测试更易编写、维护和自动执行",
    problem: "C++ 单元测试配置复杂、表达不直观的问题",
    highlights: ["支持单元测试、TDD 与 BDD", "提供自然、可读的断言与测试语法", "兼容现代 C++ 标准和常见构建系统"],
  },
  {
    keywords: ["agent multiplexer"],
    what: "运行在终端中的多 Agent 会话复用器",
    oneLine: "在一个终端里并行启动、切换和管理多个 AI Agent 会话",
    how: "用终端复用界面组织 Agent 进程、工作区和状态，减少窗口切换",
    why: "提高多 Agent 并行工作的可见性与操作效率",
    problem: "多个 Agent 会话分散在不同终端、难以统一管理的问题",
    highlights: ["在单个终端集中管理多 Agent 会话", "支持并行运行与快速切换", "减少窗口和工作区管理开销"],
  },
  {
    keywords: ["ai meeting assistant", "live transcription"],
    what: "本地优先的 AI 会议记录助手",
    oneLine: "在本地完成会议实时转写、说话人区分和摘要，不把录音交给云端",
    how: "用 Parakeet/Whisper 转写、说话人分离和 Ollama 摘要构成本地会议处理链",
    why: "兼顾会议纪要效率与敏感数据隐私",
    problem: "云端会议助手存在隐私顾虑且实时转写成本高的问题",
    highlights: ["支持实时语音转写与说话人区分", "使用本地模型生成会议摘要", "全流程本地运行，无需上传云端"],
  },
  {
    keywords: ["value investing research framework", "ai 时代的伯克希尔"],
    what: "面向 Claude Code 与 Codex 的价值投资研究框架",
    oneLine: "让多个 AI Agent 按巴菲特等投资方法并行研究公司，形成可追溯的价值投资结论",
    how: "把大师方法论拆成结构化研究步骤，再由多 Agent 分工收集证据、辩论和汇总结论",
    why: "提升复杂投资研究的覆盖度与方法一致性",
    problem: "价值投资研究资料多、周期长且容易受单一视角影响的问题",
    highlights: ["内置多位价值投资大师的方法论", "支持多 Agent 并行与对抗式研究", "输出结构化、可复查的研究过程"],
  },
  {
    keywords: ["extracted system prompts"],
    what: "主流 AI 产品系统提示词归档库",
    oneLine: "收集并归档 Claude、ChatGPT、Gemini、Grok 等产品的系统提示词，便于研究其行为规则",
    how: "按厂商和产品整理已公开或提取的系统提示内容，提供版本对比与研究素材",
    why: "帮助开发者理解不同 AI 产品的隐藏指令与交互边界",
    problem: "商业 AI 产品的系统行为规则不透明、难以比较的问题",
    highlights: ["覆盖多家主流模型与开发工具", "按产品归档系统提示和版本变化", "为提示工程与模型行为研究提供样本"],
  },
  {
    keywords: ["3d foundation model", "reconstructing scenes from streaming data"],
    what: "面向流式数据的前馈式 3D 场景重建基础模型",
    oneLine: "从连续输入中实时重建三维场景，用一次前馈推理替代反复优化",
    how: "利用几何上下文 Transformer 持续融合流式观测，直接预测可更新的三维场景表示",
    why: "提高动态与长序列 3D 重建的速度和可扩展性",
    problem: "传统 3D 重建需要反复优化、难以实时处理流式数据的问题",
    highlights: ["面向流式输入持续重建 3D 场景", "采用前馈模型减少迭代优化开销", "通过几何上下文建模保持跨帧一致性"],
  },
  {
    keywords: ["office suite purpose-built for ai agents"],
    what: "专为 AI Agent 设计的 Office 文档 CLI",
    oneLine: "让 AI Agent 无需安装 Office 就能读写和渲染 Word、Excel、PowerPoint",
    how: "用单一跨平台二进制提供文档编辑、格式转换与 HTML/PNG 渲染接口，闭合查看再修正流程",
    why: "让 Agent 真正自动化办公文档而不依赖桌面 Office",
    problem: "Agent 难以稳定操作和视觉验证 Office 文档的问题",
    highlights: ["统一读写 Word、Excel 与 PowerPoint", "无需安装 Office，单二进制跨平台运行", "支持 HTML/PNG 渲染以完成视觉校验闭环"],
  },
  {
    keywords: ["personal trading agent"],
    what: "面向个人投资研究的交易 Agent",
    oneLine: "让 AI Agent 持续分析市场信息、生成交易观点并辅助个人投资决策",
    how: "通过数据获取、研究分析和 Agent 工作流组织市场观察与策略输出",
    why: "把分散的市场研究步骤自动化并个性化",
    problem: "个人投资者信息处理量大、研究流程不连续的问题",
    highlights: ["围绕个人投资场景组织 Agent 工作流", "自动收集并分析市场信息", "生成可持续更新的研究与交易观点"],
  },
  {
    keywords: ["graphical user interface for c++", "dear imgui"],
    what: "轻量即时模式 C++ 图形界面库",
    oneLine: "用极少依赖快速给 C++ 工具加上调试面板和桌面 GUI",
    how: "采用即时模式 API 在每帧直接声明界面，减少复杂状态同步和框架负担",
    why: "适合游戏、引擎和工程工具快速构建内部界面",
    problem: "C++ 调试与工具界面开发成本高、传统 GUI 框架偏重的问题",
    highlights: ["采用即时模式 API 简化界面状态管理", "依赖少、易嵌入现有 C++ 工程", "适合调试工具、编辑器和实时应用"],
  },
  {
    keywords: ["javascript in-page gui agent"],
    what: "可在网页内部执行操作的 GUI Agent",
    oneLine: "把自然语言指令直接变成网页内点击、输入和流程操作，无需额外浏览器控制层",
    how: "将 Agent 运行时嵌入页面，理解界面元素并调用 JavaScript 完成交互任务",
    why: "降低 Web 产品接入自然语言自动化的复杂度",
    problem: "外部浏览器 Agent 控制链长、页面集成和稳定性成本高的问题",
    highlights: ["在页面内部运行 GUI Agent", "用自然语言控制点击、输入与流程", "可直接集成到现有 Web 应用"],
  },
  {
    keywords: ["ability to watch any video"],
    what: "让 Claude 理解任意视频的自动化工具",
    oneLine: "自动下载视频、抽帧和转写，再把完整上下文交给 Claude 分析",
    how: "通过一个命令串联视频下载、关键帧提取、音频转写和多模态提示生成",
    why: "让文本型编码 Agent 快速获得视频理解能力",
    problem: "Agent 无法直接读取长视频内容、人工整理上下文耗时的问题",
    highlights: ["自动下载并解析在线视频", "提取关键帧并完成语音转写", "把视觉与文本上下文统一交给 Claude"],
  },
  {
    keywords: ["open-source capcut alternative"],
    what: "跨 Web、桌面和移动端的开源视频编辑器",
    oneLine: "开源替代 CapCut，在网页、桌面和手机上完成视频剪辑与自动化渲染",
    how: "以统一代码库和 Rust 核心构建编辑器，并通过插件、Editor API、无头模式与 MCP 扩展",
    why: "提供可控、可扩展的视频编辑基础设施",
    problem: "商业剪辑工具封闭、跨平台与自动化能力受限的问题",
    highlights: ["覆盖 Web、桌面与移动端", "采用插件优先架构和 Editor API", "支持无头批量渲染与 MCP 自动化"],
  },
  {
    keywords: ["logging library"],
    what: "高性能 C++ 日志库",
    oneLine: "为 C++ 应用提供快速、易集成的同步与异步日志能力",
    how: "通过格式化、日志级别、多个输出端和异步队列组织高吞吐日志记录",
    why: "减少高性能应用接入可靠日志系统的成本",
    problem: "C++ 日志方案性能、格式化和多输出配置难兼顾的问题",
    highlights: ["支持高性能同步与异步日志", "提供格式化、级别和多种输出端", "易于嵌入并支持跨平台 C++ 工程"],
  },
  {
    keywords: ["video", "short video", "video production", "montage", "movie"],
    what: "AI 视频生成与自动化制作",
    why: "把脚本、素材、剪辑和成片流程尽量自动化",
    problem: "视频生产链路长、工具切换频繁、协作成本高的问题",
  },
  {
    keywords: ["voice", "audio", "speech", "tts", "voice studio"],
    what: "语音与音频生成能力",
    why: "更快搭建语音创作、配音或音频交互场景",
    problem: "语音生成、克隆和音频处理门槛高的问题",
  },
  {
    keywords: ["design system", "visual identity", "design.md", "design spec"],
    what: "设计系统与 AI 协作规范",
    why: "让编码代理更稳定地理解设计语言和视觉约束",
    problem: "设计意图难传递、前端实现容易跑偏的问题",
  },
  {
    keywords: ["code intelligence", "codebase", "coding agent", "ade", "repo automation", "developer workflow"],
    what: "AI 编码、代码理解与开发工作流",
    why: "让 AI 真正接入真实仓库、代码上下文和研发流程",
    problem: "代码上下文难获取、自动化流程不顺、工程接入成本高的问题",
  },
  {
    keywords: ["agent", "agentic", "orchestrator", "memory", "browser use", "gui agent", "mcp"],
    what: "智能体编排、记忆或执行能力",
    why: "提升 Agent 的可用性、可控性和执行闭环能力",
    problem: "Agent 缺少工具接入、记忆能力或稳定执行链路的问题",
  },
  {
    keywords: ["stock", "investment", "research framework", "resume", "evaluate", "analysis system"],
    what: "AI 分析与决策辅助工具",
    why: "把复杂分析流程标准化，并提升决策效率",
    problem: "研究信息分散、分析效率低、结果难复用的问题",
  },
  {
    keywords: ["messaging", "chat", "private", "privacy"],
    what: "通信与隐私保护工具",
    why: "构建更安全、去标识化的沟通体验",
    problem: "传统通信依赖身份标识、隐私边界不清的问题",
  },
  {
    keywords: ["container", "virtual machine", "linux containers", "docker"],
    what: "容器与本地开发基础设施",
    why: "更轻量地搭建隔离环境和本地运行能力",
    problem: "开发环境搭建重、隔离运行不便的问题",
  },
  {
    keywords: ["crawler", "scraper", "media crawler", "platform crawler"],
    what: "内容采集与平台数据抓取工具",
    why: "快速构建多平台的数据收集和监测流程",
    problem: "多平台抓取分散、维护成本高的问题",
  },
  {
    keywords: ["openai-compatible", "provider", "model catalog", "router", "models"],
    what: "模型接入与统一代理层",
    why: "用统一接口管理多个模型和推理服务",
    problem: "多模型接入分散、切换和容灾复杂的问题",
  },
  {
    keywords: ["security", "cybersecurity", "pentesting", "vulnerabilities"],
    what: "安全能力与漏洞验证工具",
    why: "更快搭建安全测试、验证或防护流程",
    problem: "安全检测流程重、知识和工具分散的问题",
  },
];

const MICRO_ANALYSIS_RULES = [
  {
    id: "agent-industrialization",
    labels: ["智能体开始补齐执行闭环、记忆与工具编排", "AI 智能体的工业化与具身化"],
    prioritySignals: ["自主性", "工具调用", "多阶段编排", "执行闭环", "长周期记忆"],
    validation:
      "若项目具备 Agent、Workflow、MCP、Browser Use、Memory 等信号，必须明确指出它如何印证智能体工业化趋势。",
  },
  {
    id: "ai-coding",
    labels: ["AI 编程从单点辅助走向工程化工作流", "AI 编程增强与深度洞察"],
    prioritySignals: ["上下文管理", "RAG 检索增强", "代码架构理解", "仓库级索引", "工程接入"],
    validation:
      "若项目具备 AI Coding、Code Intelligence、RAG、MCP、Repo Automation 等信号，必须说明它如何支撑 AI 编程增强趋势。",
  },
  {
    id: "model-platform",
    labels: ["模型接入与推理基础设施继续平台化"],
    prioritySignals: ["模型接入层", "推理网关", "成本控制", "部署运维", "统一协议"],
    validation:
      "若项目具备 Model Infra、Provider Router、Inference、Self-Hosted 等信号，必须说明它如何支撑模型平台化趋势。",
  },
  {
    id: "multimodal-pipeline",
    labels: ["多模态内容生成正在产品化和流水线化"],
    prioritySignals: ["内容流水线", "多模态编排", "自动化生产", "渲染链路", "数据采集"],
    validation:
      "若项目具备 Multimodal、Video、Audio、Workflow 等信号，必须说明它如何印证内容生产流水线趋势。",
  },
  {
    id: "security-automation",
    labels: ["安全自动化与研究辅助工具持续获得关注"],
    prioritySignals: ["攻防自动化", "结构化技能", "评测验证", "标准框架映射", "研究效率"],
    validation:
      "若项目具备 安全、Evaluation、Research、Skills 等信号，必须说明它如何支撑 AI 安全或研究自动化趋势。",
  },
];

const TREND_RULE_MAP = new Map(TREND_RULES.map((rule) => [rule.id, rule]));

const PRIORITY_SIGNAL_HINTS = {
  自主性: ["autonomous", "agentic", "copilot", "planner"],
  工具调用: ["tool calling", "tool use", "browser use", "mcp", "gui agent"],
  多阶段编排: ["workflow", "orchestrator", "pipeline", "multi-agent"],
  执行闭环: ["execution", "automation", "runtime", "terminal"],
  长周期记忆: ["memory", "persistent", "knowledge base", "knowledge graph"],
  上下文管理: ["context", "codebase", "memory", "repo automation"],
  "RAG 检索增强": ["rag", "retrieval", "embedding", "vector", "knowledge graph"],
  代码架构理解: ["code intelligence", "software engineering", "architecture", "code search"],
  仓库级索引: ["repo automation", "codebase", "index", "workspace"],
  工程接入: ["cli", "ide", "terminal", "developer workflow", "mcp"],
  模型接入层: ["openai-compatible", "provider", "sdk", "api"],
  推理网关: ["router", "gateway", "serving", "inference"],
  成本控制: ["cost", "latency", "throughput", "cache"],
  部署运维: ["deploy", "self-hosted", "runtime", "observability"],
  统一协议: ["openai-compatible", "protocol", "provider", "router"],
  内容流水线: ["video production", "montage", "workflow", "pipeline"],
  多模态编排: ["multimodal", "video", "audio", "image", "avatar"],
  自动化生产: ["automation", "generation", "render", "publish"],
  渲染链路: ["render", "editing", "video", "audio"],
  数据采集: ["crawler", "scraper", "data collection", "extractor"],
  攻防自动化: ["security", "cybersecurity", "pentest", "vulnerability"],
  结构化技能: ["skills", "skill", "framework", "att&ck"],
  评测验证: ["evaluation", "benchmark", "judge", "grader"],
  标准框架映射: ["mitre", "att&ck", "framework", "taxonomy"],
  研究效率: ["research framework", "analysis system", "resume", "investment"],
};

const CORE_HIGHLIGHT_RULES = [
  {
    id: "persistent-code-graph",
    all: ["codebase", "knowledge graph"],
    text: "将代码库索引为可持续更新的本地知识图谱",
  },
  {
    id: "language-coverage",
    allGroups: [["codebase", "code intelligence", "parser", "tree-sitter", "code analysis"]],
    regex: /(\d{2,3})\s+(?:programming\s+)?languages?/i,
    text: (match) => `支持 ${match[1]} 种语言的代码解析与索引`,
  },
  {
    id: "mcp-analysis-tools",
    all: ["mcp"],
    any: ["architecture", "impact analysis", "call graph", "code search", "trace"],
    text: "通过 MCP 提供架构、搜索、调用链与影响分析",
  },
  {
    id: "token-efficiency",
    all: ["token"],
    any: ["fewer tokens", "token reduction", "save tokens", "token-efficient"],
    text: "用结构化查询显著降低大仓库分析的 Token 消耗",
  },
  {
    id: "security-recon-validation",
    any: ["reconnaissance", "pentest", "pentesting"],
    allGroups: [["exploit", "exploitation"], ["validation", "validate"]],
    text: "自动执行侦察、利用与漏洞验证",
  },
  {
    id: "security-poc-remediation",
    any: ["proof-of-concept", "working poc", "poc", "remediation", "auto-fix", "autofix"],
    requireSecurity: true,
    text: "生成可复现 PoC、修复建议与补丁",
  },
  {
    id: "security-cicd",
    any: ["github actions", "ci/cd", "pipeline"],
    requireSecurity: true,
    text: "支持 CI/CD 安全扫描与报告输出",
  },
  {
    id: "browser-automation",
    any: ["browser automation", "web automation", "browser use", "browser-use"],
    text: "为 Agent 提供浏览器自动化与网页操作能力",
  },
  {
    id: "multi-agent",
    any: ["multi-agent", "multi agent", "agent orchestration", "orchestrator"],
    text: "支持多 Agent 协作、任务拆解与流程编排",
  },
  {
    id: "tool-calling",
    any: ["tool calling", "tool use", "mcp server", "mcp tools"],
    text: "通过标准工具接口连接外部系统与执行环境",
  },
  {
    id: "persistent-memory",
    any: ["long-term memory", "persistent memory", "knowledge base", "memory layer"],
    text: "沉淀可复用的长期记忆与上下文",
  },
  {
    id: "repo-index",
    all: ["codebase"],
    any: ["index", "retrieval", "rag", "code search"],
    text: "建立仓库级索引与检索能力",
  },
  {
    id: "code-review",
    any: ["code review", "pull request review", "review code"],
    text: "自动审查代码变更并给出可执行反馈",
  },
  {
    id: "model-routing",
    any: ["model router", "llm router", "provider routing", "route models"],
    text: "统一路由多个模型与推理服务",
  },
  {
    id: "openai-compatible",
    any: ["openai-compatible", "openai compatible"],
    text: "兼容 OpenAI 接口以降低模型迁移成本",
  },
  {
    id: "inference-operations",
    any: ["inference", "serving", "gateway"],
    text: "覆盖推理服务、网关与部署运维链路",
  },
  {
    id: "self-hosted",
    any: ["self-hosted", "self hosted", "local-first", "on-prem", "offline"],
    text: "支持本地或自托管部署，保留数据控制权",
  },
  {
    id: "privacy",
    any: ["privacy", "private", "end-to-end", "e2ee"],
    text: "强化隐私保护与本地数据边界",
  },
  {
    id: "video-pipeline",
    any: ["video production", "video workflow", "montage", "editing pipeline"],
    text: "串联素材、剪辑、渲染与发布流程",
  },
  {
    id: "multimodal",
    any: ["multimodal", "multi-modal"],
    text: "统一编排图像、视频与音频等多模态能力",
  },
  {
    id: "speech",
    any: ["speech-to-text", "text-to-speech", "transcription", "whisper", "tts"],
    text: "提供语音识别、转写或生成能力",
  },
  {
    id: "data-collection",
    any: ["crawler", "scraper", "data collection", "extractor"],
    text: "自动采集、整理并结构化多平台数据",
  },
  {
    id: "workflow-automation",
    any: ["workflow", "automation", "pipeline"],
    text: "把多步骤任务编排为可重复执行的工作流",
  },
  {
    id: "cli-integration",
    any: ["command-line", "command line", "cli", "terminal"],
    text: "提供 CLI 或终端入口，便于接入现有工程流程",
  },
  {
    id: "performance",
    any: ["high-performance", "high performance", "fastest", "low latency", "rust"],
    text: "强调性能、资源效率与稳定执行",
  },
  {
    id: "evaluation",
    any: ["evaluation", "benchmark", "grader", "judge"],
    text: "提供评测、验证与结果对比机制",
  },
];

const SIGNAL_HIGHLIGHT_TEXT = {
  自主性: "支持 Agent 自主规划并连续执行任务",
  工具调用: "通过工具调用连接外部系统与执行环境",
  多阶段编排: "支持多阶段任务拆解与工作流编排",
  执行闭环: "覆盖执行、反馈与结果验证闭环",
  长周期记忆: "沉淀可复用的长期记忆与上下文",
  上下文管理: "持续管理仓库与任务上下文",
  "RAG 检索增强": "通过 RAG 提升知识检索与上下文召回",
  代码架构理解: "提供代码架构、依赖与调用关系理解",
  仓库级索引: "建立仓库级索引与快速搜索能力",
  工程接入: "通过 MCP、CLI 或 IDE 接入开发流程",
  模型接入层: "统一接入不同模型与服务提供方",
  推理网关: "提供模型路由、网关与推理服务能力",
  成本控制: "优化延迟、吞吐与推理成本",
  部署运维: "支持自托管部署与运行状态管理",
  统一协议: "用统一协议降低多模型集成复杂度",
  内容流水线: "串联内容生成、处理与发布链路",
  多模态编排: "统一编排图像、视频与音频能力",
  自动化生产: "把内容生产步骤自动化并可重复执行",
  渲染链路: "覆盖素材处理、剪辑与渲染流程",
  数据采集: "自动采集并结构化多平台数据",
  攻防自动化: "自动执行安全检测与攻击验证",
  结构化技能: "把专家经验沉淀为可复用技能",
  评测验证: "提供评测、验证与结果对比机制",
  标准框架映射: "映射标准框架以统一分析口径",
  研究效率: "把研究流程结构化并提升决策效率",
};

const STOP_SENTENCES = [
  "license",
  "contributing",
  "installation",
  "quickstart",
  "getting started",
  "table of contents",
  "roadmap",
  "acknowledgement",
  "faq",
  "requirements",
  "usage",
];

const CJK_PATTERN = /[\u3400-\u9fff]/u;

function localDateString(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function normalizePeriodSelection(value) {
  const values = Array.isArray(value) ? value : [value];
  const tokens = values
    .flatMap((item) => String(item ?? "").split(/[\s,+/]+/u))
    .map((item) => item.trim().toLowerCase())
    .filter(Boolean);

  if (tokens.length === 0) {
    throw new Error("--period requires at least one period");
  }

  const invalid = tokens.filter(
    (period) => !PERIOD_ORDER.includes(period) && period !== "all" && period !== "both",
  );
  if (invalid.length > 0) {
    throw new Error(
      `--period contains unsupported value(s): ${[...new Set(invalid)].join(", ")}. Use daily, weekly, monthly, all, or a comma-separated combination.`,
    );
  }

  if (tokens.some((token) => token === "all" || token === "both")) {
    return [...PERIOD_ORDER];
  }
  return PERIOD_ORDER.filter((period) => tokens.includes(period));
}

function parseArgs(argv) {
  const options = {
    period: "all",
    periods: [...PERIOD_ORDER],
    outputDir: "./reports/github-trending",
    date: localDateString(),
  };
  const periodValues = [];

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === "--period" || arg === "--periods") {
      let cursor = index + 1;
      const values = [];
      while (cursor < argv.length && !String(argv[cursor]).startsWith("-")) {
        values.push(argv[cursor]);
        cursor += 1;
      }
      periodValues.push(...(values.length > 0 ? values : [""]));
      index = cursor - 1;
      continue;
    }
    if (arg === "--output-dir") {
      options.outputDir = argv[index + 1] ?? "";
      index += 1;
      continue;
    }
    if (arg === "--date") {
      options.date = argv[index + 1] ?? "";
      index += 1;
      continue;
    }
    if (arg === "--help" || arg === "-h") {
      options.help = true;
      continue;
    }
    throw new Error(`Unknown argument: ${arg}`);
  }

  const periods = periodValues.length > 0
    ? normalizePeriodSelection(periodValues)
    : [...PERIOD_ORDER];
  options.periods = periods;
  options.period = periods.length === PERIOD_ORDER.length ? "all" : periods.join(",");

  if (!/^\d{4}-\d{2}-\d{2}$/.test(options.date)) {
    throw new Error("--date must use YYYY-MM-DD");
  }

  return options;
}

function usage() {
  return [
    "Usage:",
    "  node ./scripts/run-analysis.mjs --period <selection> [--output-dir <dir>] [--date YYYY-MM-DD]",
    "",
    "Period selection:",
    "  daily | weekly | monthly | all",
    "  daily,weekly | weekly,monthly | daily,monthly",
    "  daily,weekly,monthly",
    "  Combine with commas, spaces, or repeated flags, for example: --period daily weekly",
    "",
    "Outputs:",
    "  <output-dir>/<date>-<period>.md  (selected canonical reports only)",
    "  <output-dir>/cache/<date>/*.json",
    "  <output-dir>/dashboard/index.html  (synced companion view)",
  ].join("\n");
}

async function fetchText(url, attempt = 1) {
  const response = await fetch(url, {
    headers: {
      "user-agent": USER_AGENT,
      accept: "text/html,application/xhtml+xml",
    },
  });

  if (!response.ok) {
    const retryable = response.status === 429 || response.status >= 500;
    if (attempt < 4 && retryable) {
      const delayMs =
        response.status === 429
          ? Math.min(1000 * 2 ** attempt, 16000)
          : 500 * attempt;
      await new Promise((resolve) => setTimeout(resolve, delayMs));
      return fetchText(url, attempt + 1);
    }
    throw new Error(`Request failed for ${url}: ${response.status} ${response.statusText}`);
  }

  return response.text();
}

async function writeUtf8File(filePath, text, withBom = false) {
  const content = withBom ? `\ufeff${text}` : text;
  await writeFile(filePath, content, "utf8");
}

function decodeHtmlEntities(text) {
  return text
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&#x([0-9a-f]+);/gi, (_, hex) => String.fromCodePoint(Number.parseInt(hex, 16)))
    .replace(/&#(\d+);/g, (_, decimal) => String.fromCodePoint(Number.parseInt(decimal, 10)));
}

function normalizeWhitespace(text) {
  return String(text ?? "")
    .replace(/\r/g, "")
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .replace(/[ \t]{2,}/g, " ")
    .trim();
}

function stripHtml(html) {
  const withBreaks = String(html ?? "")
    .replace(/<\s*br\s*\/?>/gi, "\n")
    .replace(/<\/(p|div|section|article|li|h1|h2|h3|h4|h5|h6|pre|blockquote)>/gi, "\n")
    .replace(/<li[^>]*>/gi, "- ")
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/<style[\s\S]*?<\/style>/gi, "");

  return normalizeWhitespace(decodeHtmlEntities(withBreaks.replace(/<[^>]+>/g, " ")));
}

function trimToLength(text, maxLength) {
  if (!text || text.length <= maxLength) {
    return text;
  }
  return `${text.slice(0, maxLength - 3).trim()}...`;
}

function parseCount(text) {
  if (!text) {
    return 0;
  }
  return Number.parseInt(String(text).replace(/,/g, ""), 10) || 0;
}

function formatCount(value) {
  return new Intl.NumberFormat("en-US").format(value ?? 0);
}

function escapeRegex(text) {
  return String(text).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function keywordToRegex(keyword) {
  const escaped = escapeRegex(keyword.trim()).replace(/\\ /g, "\\s+");
  if (!escaped) {
    return null;
  }
  if (CJK_PATTERN.test(keyword)) {
    return new RegExp(escaped, "iu");
  }
  return new RegExp(`(?<![a-z0-9])${escaped}(?![a-z0-9])`, "iu");
}

function splitArticles(html) {
  return String(html)
    .split('<article class="Box-row">')
    .slice(1)
    .map((article) => article.split("</article>")[0])
    .filter(Boolean);
}

function parseTrendingHtml(html, period) {
  const config = PERIOD_CONFIG[period];
  if (!config) {
    throw new Error(`Unsupported period: ${period}`);
  }

  const articles = splitArticles(html);
  return articles.map((article, index) => {
    const repoMatch = article.match(/<h2[^>]*>[\s\S]*?<a[^>]*href="\/([^"/]+\/[^"/]+)"/i);
    if (!repoMatch) {
      throw new Error(`Could not parse repository path for ${period} article #${index + 1}`);
    }

    const repoPath = repoMatch[1].trim();
    const [owner, name] = repoPath.split("/");
    const descriptionMatch = article.match(
      /<p[^>]*class="[^"]*col-9[^"]*color-fg-muted[^"]*"[^>]*>([\s\S]*?)<\/p>/i,
    );
    const languageMatch = article.match(
      /<span[^>]*itemprop="programmingLanguage"[^>]*>([\s\S]*?)<\/span>/i,
    );
    const starsMatch = article.match(
      new RegExp(
        `href="/${escapeRegex(repoPath).replace("/", "\\/")}/stargazers"[\\s\\S]*?>\\s*([\\d,]+)\\s*<\\/a>`,
        "i",
      ),
    );
    const forksMatch = article.match(
      new RegExp(
        `href="/${escapeRegex(repoPath).replace("/", "\\/")}/forks"[\\s\\S]*?>\\s*([\\d,]+)\\s*<\\/a>`,
        "i",
      ),
    );
    const deltaMatch = stripHtml(article).match(/([\d,]+)\s+stars\s+(?:this\s+)?(week|month|today)/i);
    const contributorMatches = [
      ...article.matchAll(/href="\/([^"/?#]+)"[^>]*>\s*<img[^>]*class="[^"]*avatar-user[^"]*"[^>]*alt="@([^"]+)"/gi),
    ];
    const contributors = contributorMatches.map((match) => ({
      login: match[2]?.trim() || match[1]?.trim() || "",
      profile: `https://github.com/${match[1]?.trim() || match[2]?.trim() || ""}`,
    }));

    return {
      period,
      rank: index + 1,
      owner,
      name,
      fullName: repoPath,
      projectLink: `https://github.com/${repoPath}`,
      description: descriptionMatch ? trimToLength(stripHtml(descriptionMatch[1]), 220) : "",
      language: languageMatch ? stripHtml(languageMatch[1]) : "",
      stars: parseCount(starsMatch?.[1]),
      forks: parseCount(forksMatch?.[1]),
      deltaStars: parseCount(deltaMatch?.[1]),
      deltaLabel: config.deltaLabel,
      contributors,
      trendingSnippet: trimToLength(stripHtml(article), 1000),
    };
  });
}

function extractJsonArrayAfterKey(html, key) {
  const marker = `"${key}":`;
  const start = html.indexOf(marker);
  if (start === -1) {
    return null;
  }

  let cursor = start + marker.length;
  while (cursor < html.length && /\s/.test(html[cursor])) {
    cursor += 1;
  }
  if (html[cursor] !== "[") {
    return null;
  }

  let depth = 0;
  let inString = false;
  let escaping = false;

  for (let index = cursor; index < html.length; index += 1) {
    const char = html[index];
    if (escaping) {
      escaping = false;
      continue;
    }
    if (char === "\\") {
      escaping = true;
      continue;
    }
    if (char === '"') {
      inString = !inString;
      continue;
    }
    if (inString) {
      continue;
    }
    if (char === "[") {
      depth += 1;
      continue;
    }
    if (char === "]") {
      depth -= 1;
      if (depth === 0) {
        return html.slice(cursor, index + 1);
      }
    }
  }

  return null;
}

function splitIntoSentences(text) {
  return normalizeWhitespace(text)
    .split(/\n+|(?<=[。！？?!.])\s+/u)
    .map((line) => line.trim())
    .filter(Boolean);
}

function looksUsefulSentence(sentence) {
  if (!sentence || sentence.length < 18 || sentence.length > 220) {
    return false;
  }
  const lowered = sentence.toLowerCase();
  if (STOP_SENTENCES.some((stop) => lowered.includes(stop))) {
    return false;
  }
  if ((sentence.match(/\|/g) || []).length >= 2) {
    return false;
  }
  if (/^(npm|pnpm|yarn|pip|cargo|go)\s/i.test(lowered)) {
    return false;
  }
  if (/^(english|中文|español|français|deutsch|日本語)/iu.test(sentence)) {
    return false;
  }
  if (/[{}<>]{2,}/.test(sentence)) {
    return false;
  }
  return true;
}

function extractUsefulSentences(text, limit = 3) {
  const sentences = [];
  for (const sentence of splitIntoSentences(text || "")) {
    if (!looksUsefulSentence(sentence)) {
      continue;
    }
    sentences.push(sentence);
    if (sentences.length >= limit) {
      break;
    }
  }
  return sentences;
}

function pickReadmeHighlight(readmeText, description) {
  const normalizedDescription = normalizeWhitespace(description || "").toLowerCase();
  for (const sentence of extractUsefulSentences(readmeText, 5)) {
    if (normalizedDescription && sentence.toLowerCase() === normalizedDescription) {
      continue;
    }
    return trimToLength(sentence, 160);
  }
  return "";
}

function extractReadmeTextFromHtml(html) {
  const overviewFilesRaw = extractJsonArrayAfterKey(html, "overviewFiles");
  if (!overviewFilesRaw) {
    return {
      readmeText: "",
      readmeName: "",
      readmeHighlight: "",
      readmeSource: "missing-overview-files",
    };
  }

  let overviewFiles;
  try {
    overviewFiles = JSON.parse(overviewFilesRaw);
  } catch {
    return {
      readmeText: "",
      readmeName: "",
      readmeHighlight: "",
      readmeSource: "invalid-overview-files-json",
    };
  }

  const readmeFile = overviewFiles.find(
    (file) =>
      file?.preferredFileType === "readme" ||
      (typeof file?.displayName === "string" && /^readme/i.test(file.displayName)),
  );

  if (!readmeFile?.richText) {
    return {
      readmeText: "",
      readmeName: readmeFile?.displayName ?? "",
      readmeHighlight: "",
      readmeSource: "missing-richtext",
    };
  }

  const readmeText = trimToLength(stripHtml(readmeFile.richText), 12000);
  return {
    readmeText,
    readmeName: readmeFile.displayName ?? "",
    readmeHighlight: pickReadmeHighlight(readmeText, ""),
    readmeSource: "overview-files",
  };
}

function containsKeyword(text, keyword) {
  const regex = keywordToRegex(keyword);
  return regex ? regex.test(text) : false;
}

function keywordScore(text, keywords) {
  const lowered = text.toLowerCase();
  let score = 0;
  const matched = [];
  for (const keyword of keywords) {
    if (containsKeyword(lowered, keyword)) {
      matched.push(keyword);
      score += keyword.includes(" ") || keyword.length > 10 ? 2 : 1;
    }
  }
  return { score, matched };
}

function buildRepositorySignalText(repo) {
  return [
    repo.fullName,
    repo.description,
    repo.readmeHighlight,
    ...extractUsefulSentences(repo.readmeText, 3),
    repo.trendingSnippet,
    repo.language,
    ...(repo.contributors || []).map((contributor) => contributor.login).filter(Boolean),
  ]
    .filter(Boolean)
    .join("\n")
    .toLowerCase();
}

function techTagMinScore(rule) {
  return [
    "agent",
    "mcp",
    "rust",
    "video",
    "audio",
    "security",
    "frontend",
    "privacy",
    "research",
    "evaluation",
  ].includes(rule.id)
    ? 1
    : 2;
}

function classifyRepository(repo) {
  const sourceText = buildRepositorySignalText(repo);

  const focusMatches = FOCUS_RULES.map((rule) => {
    const result = keywordScore(sourceText, rule.keywords);
    return { ...rule, ...result };
  })
    .filter((rule) => rule.score >= 2)
    .sort(
      (left, right) =>
        (FOCUS_ORDER[left.label] ?? 99) - (FOCUS_ORDER[right.label] ?? 99) || right.score - left.score,
    );

  const themeMatches = THEME_RULES.map((rule) => {
    const result = keywordScore(sourceText, rule.keywords);
    return { ...rule, ...result };
  })
    .filter((rule) => rule.score >= 2)
    .sort((left, right) => right.score - left.score);

  const techTagMatches = TECH_TAG_RULES.map((rule) => {
    const result = keywordScore(sourceText, rule.keywords);
    return { ...rule, ...result };
  })
    .filter((rule) => rule.score >= techTagMinScore(rule))
    .sort((left, right) => right.score - left.score || left.label.localeCompare(right.label));

  return {
    ...repo,
    isFocus: focusMatches.length > 0,
    focusLabels: focusMatches.map((match) => match.label),
    focusReasonKeywords: [...new Set(focusMatches.flatMap((match) => match.matched))].slice(0, 8),
    themes: themeMatches.map((match) => match.label),
    themeNarratives: themeMatches.map((match) => match.narrative),
    techTags: [...new Set(techTagMatches.map((match) => match.label))],
    techTagKeywords: [...new Set(techTagMatches.flatMap((match) => match.matched))].slice(0, 12),
    signalText: sourceText,
  };
}

function topicLabel(repo) {
  return repo.focusLabels?.[0] || repo.themes?.[0] || "热门开源项目";
}

function extractProjectClue(repo) {
  const candidates = [
    repo.description,
    repo.readmeHighlight,
    ...extractUsefulSentences(repo.readmeText, 2),
  ].filter(Boolean);

  for (const candidate of candidates) {
    const normalized = normalizeWhitespace(candidate).replace(/^[-*]\s*/, "");
    if (normalized) {
      return trimToLength(normalized, 72);
    }
  }

  return `${repo.fullName} 在 GitHub Trending 中获得了明显社区关注`;
}

function buildRepositoryIdentityText(repo) {
  const primaryDescription = repo.description || repo.readmeHighlight || extractUsefulSentences(repo.readmeText, 1)[0];
  return [repo.fullName, primaryDescription]
    .filter(Boolean)
    .join("\n")
    .toLowerCase();
}

function inferIntentProfile(repo) {
  const source = buildRepositoryIdentityText(repo);

  for (const rule of INTENT_RULES) {
    if (rule.keywords.some((keyword) => containsKeyword(source, keyword))) {
      return rule;
    }
  }

  if (repo.isFocus) {
    return {
      what: `${topicLabel(repo)}工具`,
      oneLine: `围绕${topicLabel(repo)}提供可直接使用的开源实现`,
      how: `通过可复用组件和标准化入口，把${topicLabel(repo)}接入真实工作流`,
      why: `更快把${topicLabel(repo)}接入真实工作流`,
      problem: `${topicLabel(repo)}从概念走向落地时的工程化与执行问题`,
      highlights: [],
    };
  }

  return {
    what: `${repo.fullName} 开源项目`,
    oneLine: `${repo.fullName} 聚焦${topicLabel(repo)}，提供可直接采用的开源实现`,
    how: `通过清晰的项目入口和可复用实现，降低${topicLabel(repo)}场景的使用门槛`,
    why: "降低目标场景的实现与采用成本",
    problem: "具体场景里的效率、协作或工程落地问题",
    highlights: [],
  };
}

function sentenceFromCandidates(candidates, fallback, maxLength = 96) {
  for (const candidate of candidates) {
    const normalized = trimToLength(normalizeWhitespace(candidate), maxLength);
    if (normalized) {
      return normalized.replace(/[。！？.!?]+$/u, "");
    }
  }

  return trimToLength(normalizeWhitespace(fallback), maxLength).replace(/[。！？.!?]+$/u, "");
}

function findMicroRuleForTrend(trend) {
  if (!trend) {
    return null;
  }

  return (
    MICRO_ANALYSIS_RULES.find((rule) => rule.labels.includes(trend.name)) ||
    MICRO_ANALYSIS_RULES.find((rule) =>
      (trend.routeLabels || []).some((label) => rule.labels.includes(label)),
    ) ||
    null
  );
}

function inferRepositorySignals(repo, microRule) {
  if (!microRule) {
    return [];
  }

  const source = buildRepositorySignalText(repo);
  return microRule.prioritySignals.filter((signal) =>
    (PRIORITY_SIGNAL_HINTS[signal] || []).some((keyword) => containsKeyword(source, keyword)),
  );
}

function buildMacroTrendAlignment(repo, macroTrends) {
  const matches = (macroTrends || [])
    .map((trend) => {
      const match = trendMatchForRepository(repo, trend.rule || TREND_RULE_MAP.get(trend.id) || trend);
      return {
        trend,
        signalScore: match.signalScore,
      };
    })
    .filter((entry) => entry.signalScore > 0)
    .sort((left, right) => right.signalScore - left.signalScore || right.trend.totalDeltaStars - left.trend.totalDeltaStars);

  return matches[0]?.trend || null;
}

function buildDetailedRepositorySignalText(repo) {
  return [
    repo.fullName,
    repo.description,
    repo.readmeHighlight,
    ...extractUsefulSentences(repo.readmeText, 18),
    repo.trendingSnippet,
    repo.language,
    ...(repo.focusLabels || []),
    ...(repo.themes || []),
    ...(repo.techTags || []),
  ]
    .filter(Boolean)
    .join("\n")
    .toLowerCase();
}

function matchCoreHighlightRule(source, rule) {
  if (rule.requireSecurity && !["security", "pentest", "pentesting", "vulnerability"].some((keyword) => source.includes(keyword))) {
    return null;
  }

  if (rule.all && !rule.all.every((keyword) => source.includes(keyword))) {
    return null;
  }

  if (rule.any && !rule.any.some((keyword) => source.includes(keyword))) {
    return null;
  }

  if (rule.allGroups && !rule.allGroups.every((group) => group.some((keyword) => source.includes(keyword)))) {
    return null;
  }

  const regexMatch = rule.regex ? source.match(rule.regex) : null;
  if (rule.regex && !regexMatch) {
    return null;
  }

  return typeof rule.text === "function" ? rule.text(regexMatch) : rule.text;
}

function fallbackHighlightFromTag(tag) {
  const mapping = {
    Agent: "支持 Agent 自主执行与任务编排",
    "AI Coding": "面向真实代码库提供 AI 编程辅助",
    MCP: "通过 MCP 接入 Agent 与外部工具",
    RAG: "通过检索增强补充关键上下文",
    Workflow: "把多步骤任务组织成可复用工作流",
    Infra: "提供可部署、可复用的工程基础设施",
    Rust: "使用 Rust 强化性能与运行稳定性",
    "Self-Hosted": "支持本地或自托管部署",
    Video: "覆盖视频内容生成与处理链路",
    Audio: "覆盖音频识别、生成与处理链路",
    安全: "提供自动化安全检测与验证能力",
    隐私: "强化隐私保护与本地数据控制",
    Research: "把研究分析方法沉淀为可复用流程",
    Evaluation: "提供评测、验证与结果对比机制",
    数据采集: "自动采集并结构化多平台数据",
  };
  return mapping[tag] || `围绕${tag}提供可复用的工程能力`;
}

function buildCoreHighlights(repo, microRule, intent) {
  const source = buildDetailedRepositorySignalText(repo);
  const highlights = [];
  const seen = new Set();

  const add = (value) => {
    const text = sentenceFromCandidates([value], "", 58);
    if (!text || seen.has(text)) {
      return;
    }
    seen.add(text);
    highlights.push(text);
  };

  for (const highlight of intent.highlights || []) {
    add(highlight);
    if (highlights.length >= 3) {
      return highlights;
    }
  }

  for (const rule of CORE_HIGHLIGHT_RULES) {
    const match = matchCoreHighlightRule(source, rule);
    if (match) {
      add(match);
    }
    if (highlights.length >= 3) {
      return highlights;
    }
  }

  for (const signal of inferRepositorySignals(repo, microRule)) {
    add(SIGNAL_HIGHLIGHT_TEXT[signal]);
    if (highlights.length >= 3) {
      return highlights;
    }
  }

  for (const tag of repo.techTags || []) {
    add(fallbackHighlightFromTag(tag));
    if (highlights.length >= 3) {
      return highlights;
    }
  }

  const fallbackCandidates = [
    `围绕${intent.what}提供开源实现`,
    `针对${intent.problem.replace(/的问题$/u, "")}优化使用流程`,
    repo.language ? `以 ${repo.language} 构建可复用的工程入口` : "提供可复用、易接入的工程入口",
    "通过清晰定位降低项目理解与采用门槛",
  ];

  for (const candidate of fallbackCandidates) {
    add(candidate);
    if (highlights.length >= 3) {
      break;
    }
  }

  return highlights.slice(0, 3);
}

function isCodeKnowledgeGraphProject(source) {
  return source.includes("codebase") && source.includes("knowledge graph") && source.includes("mcp");
}

function isAiPentestProject(source) {
  return ["pentest", "pentesting", "penetration testing"].some((keyword) => source.includes(keyword)) &&
    ["agent", "autonomous ai"].some((keyword) => source.includes(keyword));
}

function buildWhatValue(repo, intent, source) {
  if (isCodeKnowledgeGraphProject(source)) {
    return "面向 AI 编程 Agent 的本地代码知识图谱与 MCP 服务";
  }

  if (isAiPentestProject(source)) {
    return "自动执行真实攻击验证的开源 AI 渗透测试 Agent";
  }

  if (source.includes("browser") && source.includes("agent") && source.includes("automation")) {
    return "面向 AI Agent 的浏览器自动化运行环境";
  }

  if (source.includes("bluetooth") && source.includes("mesh") && source.includes("chat")) {
    return "不依赖中心服务器的蓝牙 Mesh 聊天工具";
  }

  if (source.includes("code review")) {
    return "面向研发流程的自动化代码审查工具";
  }

  if (["model router", "llm router", "openai-compatible"].some((keyword) => source.includes(keyword))) {
    return "统一接入并路由多模型服务的代理层";
  }

  return intent.what;
}

function buildHowValue(repo, intent, source, highlights) {
  if (isCodeKnowledgeGraphProject(source)) {
    return "把代码库索引为持久知识图谱，再通过 MCP 暴露搜索、架构、调用链和影响分析能力";
  }

  if (isAiPentestProject(source)) {
    return "让多 Agent 在隔离环境中运行侦察、利用和 PoC 验证，并把结果接入开发流程";
  }

  if (intent.how) {
    return intent.how;
  }

  const signalNames = (repo.techTags || []).slice(0, 3);
  if (signalNames.length > 0) {
    return `通过${signalNames.join("、")}等能力组织执行链路，${intent.why}`;
  }

  return `通过${highlights.slice(0, 2).join("，")}，${intent.why}`;
}

function buildOneLineSummary(repo, intent, source) {
  if (isCodeKnowledgeGraphProject(source)) {
    return "为 AI 编程 Agent 构建本地代码知识图谱，省 Token 看懂大仓库";
  }

  if (isAiPentestProject(source)) {
    return "开源 AI 渗透测试 Agent，自动发现、验证并辅助修复漏洞";
  }

  if (source.includes("browser") && source.includes("agent") && source.includes("automation")) {
    return "面向 AI Agent 的轻量浏览器运行时，让网页自动化更快、更省资源";
  }

  if (source.includes("bluetooth") && source.includes("mesh") && source.includes("chat")) {
    return "通过蓝牙 Mesh 建立离线聊天网络，不依赖账号、手机号或中心服务器";
  }

  if (source.includes("code review")) {
    return "自动理解代码变更并给出审查意见，把代码评审接入日常研发流程";
  }

  if (["model router", "llm router", "openai-compatible"].some((keyword) => source.includes(keyword))) {
    return "用统一接口路由多个模型服务，降低切换、容灾与接入成本";
  }

  if (source.includes("video") && ["workflow", "pipeline", "production", "editing"].some((keyword) => source.includes(keyword))) {
    return "把视频素材、生成、剪辑与发布串成可重复执行的内容生产工作流";
  }

  if (source.includes("crawler") || source.includes("scraper")) {
    return "自动采集并结构化多平台内容，降低数据收集与维护成本";
  }

  if (source.includes("self-hosted") && ["meeting", "transcription", "whisper"].some((keyword) => source.includes(keyword))) {
    return "可自托管的 AI 会议助手，在本地完成录音转写、摘要与会议知识整理";
  }

  return intent.oneLine || `${intent.what}，${intent.why}`;
}

function buildRepositoryAnalysis(repo, macroTrend) {
  const intent = inferIntentProfile(repo);
  const microRule = findMicroRuleForTrend(macroTrend);
  const source = buildRepositoryIdentityText(repo);
  const coreHighlights = buildCoreHighlights(repo, microRule, intent);
  const what = sentenceFromCandidates(
    [buildWhatValue(repo, intent, source)],
    `${repo.fullName} 是一个${intent.what}开源工具`,
    96,
  );
  const how = sentenceFromCandidates(
    [buildHowValue(repo, intent, source, coreHighlights)],
    `通过可复用的工程能力，${intent.why}`,
    132,
  );
  const oneLineSummary = sentenceFromCandidates(
    [buildOneLineSummary(repo, intent, source)],
    `${intent.what}开源工具，${intent.why}`,
    86,
  );
  const matchedSignals = inferRepositorySignals(repo, microRule);

  return {
    oneLineSummary,
    what,
    how,
    coreHighlights,
    projectIntro: what,
    problemScenario: how,
    technicalHighlight: coreHighlights.join("；"),
    whyHot: coreHighlights.join("；"),
    insightText: oneLineSummary,
    macroTrendName: macroTrend?.name || "",
    microRuleId: microRule?.id || "",
    validatesTrend: matchedSignals.length > 0,
  };
}

function buildSummary(repo, analysis = buildRepositoryAnalysis(repo, null)) {
  const highlights = (analysis.coreHighlights || []).slice(0, 3);
  return trimToLength(
    `一句话读懂：${analysis.oneLineSummary}。` +
      `what：${analysis.what}。` +
      `how：${analysis.how}。` +
      `why：${highlights.map((item, index) => `${index + 1}）${item}`).join("；")}。`,
    420,
  );
}

function summarizeRepository(repo) {
  const readmeHighlight = repo.readmeHighlight || pickReadmeHighlight(repo.readmeText, repo.description);
  const prepared = { ...repo, readmeHighlight };
  const analysis = buildRepositoryAnalysis(prepared, null);
  return {
    ...prepared,
    analysis,
    summary: buildSummary(prepared, analysis),
  };
}

function topEntries(counts, limit = 3) {
  return Object.entries(counts)
    .filter(([, value]) => value > 0)
    .sort((left, right) => right[1] - left[1])
    .slice(0, limit);
}

function topLabels(entries, limit = 5) {
  return entries
    .slice(0, limit)
    .map(([label]) => label)
    .filter(Boolean);
}

function formatTrendRepresentative(repo) {
  return `${repo.fullName}（${repo.deltaLabel}${formatCount(repo.deltaStars)}）`;
}

function trendMatchForRepository(repo, rule) {
  const sourceText = repo.signalText || buildRepositorySignalText(repo);
  const keywordHits = rule.keywords.filter((keyword) => containsKeyword(sourceText, keyword));
  const tagHits = (repo.techTags || []).filter((label) => rule.tagLabels.includes(label));
  const themeHits = (repo.themes || []).filter((label) => rule.themeLabels.includes(label));
  const focusHits = (repo.focusLabels || []).filter((label) => rule.focusLabels.includes(label));
  const signalScore = keywordHits.length * 2 + tagHits.length * 2 + themeHits.length * 2 + focusHits.length * 2;

  return {
    repo,
    keywordHits,
    tagHits,
    themeHits,
    focusHits,
    signalScore,
  };
}

function aggregateTrendKeywords(matches) {
  const keywordCounts = {};

  for (const match of matches) {
    for (const label of match.tagHits) {
      keywordCounts[label] = (keywordCounts[label] ?? 0) + 2;
    }
    for (const label of match.repo.techTags || []) {
      keywordCounts[label] = (keywordCounts[label] ?? 0) + 1;
    }
    for (const label of match.repo.themes || []) {
      keywordCounts[label] = (keywordCounts[label] ?? 0) + 1;
    }
    if (match.repo.language) {
      keywordCounts[match.repo.language] = (keywordCounts[match.repo.language] ?? 0) + 1;
    }
  }

  return topLabels(topEntries(keywordCounts, 6), 5);
}

function buildTrendCandidate(rule, repos) {
  const matches = repos
    .map((repo) => trendMatchForRepository(repo, rule))
    .filter((match) => match.signalScore > 0)
    .sort((left, right) => right.repo.deltaStars - left.repo.deltaStars || right.signalScore - left.signalScore);

  if (matches.length === 0) {
    return null;
  }

  const totalDeltaAll = repos.reduce((sum, repo) => sum + repo.deltaStars, 0);
  const totalDeltaStars = matches.reduce((sum, match) => sum + match.repo.deltaStars, 0);
  const densityScore = matches.reduce((sum, match) => sum + match.signalScore, 0);
  const averageSignalScore = densityScore / Math.max(1, matches.length);
  const coverageShare = matches.length / Math.max(1, repos.length);
  const deltaShare = totalDeltaStars / Math.max(1, totalDeltaAll);
  const normalizedDensity = Math.min(averageSignalScore / 8, 1);
  const score = coverageShare * 45 + deltaShare * 35 + normalizedDensity * 20;

  return {
    id: rule.id,
    name: rule.name,
    score,
    rule,
    keywords: aggregateTrendKeywords(matches),
    representativeRepos: matches.slice(0, 3).map((match) => match.repo),
    repoCount: matches.length,
    totalDeltaStars,
    overview: rule.overview,
    what: rule.what,
    why: rule.why,
    how: rule.how,
    risk: rule.risk,
    routeLabels: rule.routeLabels || [],
    matchedRepoNames: matches.map((match) => match.repo.fullName),
  };
}

function overlapRatio(left, right) {
  const leftSet = new Set(left.matchedRepoNames);
  const rightSet = new Set(right.matchedRepoNames);
  let intersection = 0;

  for (const value of leftSet) {
    if (rightSet.has(value)) {
      intersection += 1;
    }
  }

  return intersection / Math.max(1, Math.min(leftSet.size, rightSet.size));
}

function buildFallbackTrend(repos) {
  const keywordCounts = {};
  const topRepos = [...repos].sort((left, right) => right.deltaStars - left.deltaStars).slice(0, 3);

  for (const repo of repos) {
    for (const label of repo.techTags || []) {
      keywordCounts[label] = (keywordCounts[label] ?? 0) + 1;
    }
    for (const label of repo.themes || []) {
      keywordCounts[label] = (keywordCounts[label] ?? 0) + 1;
    }
    if (repo.language) {
      keywordCounts[repo.language] = (keywordCounts[repo.language] ?? 0) + 1;
    }
  }

  return {
    id: "fallback-engineering-signal",
    name: "社区热度集中在可快速落地的工程化项目",
    score: 0,
    rule: null,
    keywords: topLabels(topEntries(keywordCounts, 6), 5),
    representativeRepos: topRepos,
    repoCount: repos.length,
    totalDeltaStars: repos.reduce((sum, repo) => sum + repo.deltaStars, 0),
    overview: "榜单热度并未集中在单一赛道，而是集中在那些能把能力快速转化为真实交付结果的工程化项目。",
    what: "高增长项目共同指向“可部署、可协作、可复用”的工程化演进方向。",
    why: "这说明社区比起概念展示，更关心能否把新能力接入真实业务、团队流程与交付链路。",
    how: "支撑这一方向的底层方法通常是标准接口、模块化组件、自动化流程和更低门槛的部署方式。",
    risk: "风险在于，工程化叙事容易掩盖真实能力边界，若缺少效果验证和长期维护，热度可能快于沉淀速度。",
    routeLabels: [],
    matchedRepoNames: repos.map((repo) => repo.fullName),
  };
}

function buildTrendAnalysisItems(repos, period) {
  const config = PERIOD_CONFIG[period];
  const candidates = TREND_RULES.map((rule) => buildTrendCandidate(rule, repos))
    .filter(Boolean)
    .sort((left, right) => right.score - left.score || right.totalDeltaStars - left.totalDeltaStars);

  const selected = [];
  for (const candidate of candidates) {
    if (selected.length >= 2) {
      break;
    }
    if (selected.some((existing) => overlapRatio(existing, candidate) >= 0.8)) {
      continue;
    }
    selected.push(candidate);
  }

  if (selected.length === 0 && repos.length > 0) {
    selected.push(buildFallbackTrend(repos));
  }

  const items = selected.map((trend) => ({
    ...trend,
    keywordLine: trend.keywords.join("、"),
    representativeLine: trend.representativeRepos.map((repo) => formatTrendRepresentative(repo)).join("、"),
    shortValueLine: trend.overview,
    valueLine: `${trend.overview} 本期该趋势覆盖 ${trend.repoCount} 个项目，合计 ${config.deltaLabel}${formatCount(
      trend.totalDeltaStars,
    )}。`,
  }));

  const lead = items[0];
  const overview = lead
    ? `${lead.overview} 这说明当前 GitHub Trending 的焦点，正在向“${lead.name}”这类更成体系的技术方向收敛。`
    : "当前 GitHub Trending 的焦点，集中在能快速落地、可复用、可工程化的技术方向。";
  const risk = items
    .map((trend) => trend.risk)
    .filter(Boolean)
    .slice(0, 2)
    .join(" ");

  return {
    overview,
    risk,
    items,
  };
}

function buildTrendAnalysisLines(repos, period) {
  return buildTrendAnalysisItems(repos, period).items.map(
    (trend, index) =>
      `趋势 ${index + 1}：${trend.name}。宏观 What：${trend.what}。宏观 Why：${trend.why}。宏观 How：${trend.how}。代表项目：${trend.representativeLine}。`,
  );
}

function buildTrendAnalysis(repos, period) {
  const analysis = buildTrendAnalysisItems(repos, period);

  return [
    "🔥 核心技术趋势洞察",
    analysis.overview,
    "",
    "📊 趋势拆解分析",
    analysis.items
      .map(
      (trend, index) =>
        [
          `${index + 1}. 🎯 宏观 What (演进方向)：${trend.name}`,
          `- 核心关键词：${trend.keywordLine}`,
          `- 💡 宏观 Why (核心驱动力)：${trend.why}`,
          `- ⚙️ 宏观 How (底层支撑)：${trend.how}`,
          `- 🏆 代表项目：${trend.representativeLine}`,
        ].join("\n"),
      )
      .join("\n\n"),
    "",
    "⚠️ 潜在风险与冷思考",
    analysis.risk || "当前趋势仍需警惕概念包装、工程化承诺过度和真实落地效果不足的问题。",
  ].join("\n");
}

function focusBadge(repo) {
  if (!repo.isFocus) {
    return "";
  }
  return ` 【重点关注：${repo.focusLabels.join("、")}】`;
}

function formatProjectTitle(repo) {
  return `${repo.rank}. [${repo.fullName}](${repo.projectLink})${focusBadge(repo)}`;
}

function renderRepositoryEntry(repo) {
  const analysis = repo.analysis || {};
  const highlights = (analysis.coreHighlights || []).slice(0, 3);
  return [
    `### ${formatProjectTitle(repo)}`,
    `- 项目链接：${repo.projectLink}`,
    `- Star：${formatCount(repo.stars)}`,
    `- ${repo.deltaLabel}：${formatCount(repo.deltaStars)}`,
    `- 一句话读懂：${analysis.oneLineSummary || analysis.insightText || "待补充"}`,
    `- 核心价值：`,
    `  - **what**：${analysis.what || analysis.projectIntro || "待补充"}`,
    `  - **how**：${analysis.how || analysis.problemScenario || "待补充"}`,
    `  - **why**：`,
    ...(highlights.length > 0
      ? highlights.map((highlight, index) => `    ${index + 1}. ${highlight}`)
      : ["    1. 待补充", "    2. 待补充", "    3. 待补充"]),
  ].join("\n");
}

function renderMarkdownReport({ period, date, repos }) {
  const config = PERIOD_CONFIG[period];
  return [
    `# ${config.titleLabel} | ${date}`,
    "",
    `> 数据来源：[GitHub Trending ${period}](https://github.com/trending?since=${period})`,
    "",
    "## 整体趋势分析",
    buildTrendAnalysis(repos, period),
    "",
    "## 项目清单",
    repos.map((repo) => renderRepositoryEntry(repo)).join("\n\n"),
    "",
  ].join("\n");
}

async function mapWithConcurrency(items, concurrency, handler) {
  const results = new Array(items.length);
  let nextIndex = 0;

  async function worker() {
    while (nextIndex < items.length) {
      const currentIndex = nextIndex;
      nextIndex += 1;
      results[currentIndex] = await handler(items[currentIndex], currentIndex);
    }
  }

  const workers = Array.from({ length: Math.min(concurrency, items.length) }, () => worker());
  await Promise.all(workers);
  return results;
}

async function enrichRepository(repo) {
  try {
    const html = await fetchText(repo.projectLink);
    return {
      ...repo,
      ...extractReadmeTextFromHtml(html),
      fetchWarning: "",
    };
  } catch (error) {
    return {
      ...repo,
      readmeText: "",
      readmeName: "",
      readmeHighlight: "",
      readmeSource: "fetch-failed",
      fetchWarning: error.message,
    };
  }
}

function resolvePeriods(periodSelection) {
  if (Array.isArray(periodSelection)) {
    return normalizePeriodSelection(periodSelection);
  }
  return normalizePeriodSelection(periodSelection || "all");
}

function mergePeriodRepositories(existingRepositories, currentRepositories, selectedPeriods) {
  const selected = new Set(resolvePeriods(selectedPeriods));
  const retained = Array.isArray(existingRepositories)
    ? existingRepositories.filter(
      (repository) => PERIOD_ORDER.includes(repository.period) && !selected.has(repository.period),
    )
    : [];
  const current = Array.isArray(currentRepositories) ? currentRepositories : [];

  return [...retained, ...current].sort((left, right) => {
    const periodDelta = PERIOD_ORDER.indexOf(left.period) - PERIOD_ORDER.indexOf(right.period);
    if (periodDelta !== 0) {
      return periodDelta;
    }
    return Number(left.rank || 0) - Number(right.rank || 0);
  });
}

async function mergeDashboardCache(cacheDir, selectedPeriods, currentRepositories) {
  let existingRepositories = [];
  try {
    existingRepositories = JSON.parse(
      await readFile(path.join(cacheDir, "enriched-repositories.json"), "utf8"),
    );
  } catch {
    // A clean report date has no enriched cache to preserve.
  }

  return mergePeriodRepositories(existingRepositories, currentRepositories, selectedPeriods);
}

async function loadDashboardSnapshots(outputDir, currentDate, currentRepos) {
  const cacheRoot = path.join(outputDir, "cache");
  const snapshots = new Map();

  try {
    const entries = await readdir(cacheRoot, { withFileTypes: true });
    for (const entry of entries) {
      if (!entry.isDirectory() || !/^\d{4}-\d{2}-\d{2}$/u.test(entry.name)) {
        continue;
      }

      try {
        const content = await readFile(
          path.join(cacheRoot, entry.name, "enriched-repositories.json"),
          "utf8",
        );
        const repositories = JSON.parse(content);
        if (Array.isArray(repositories) && repositories.length > 0) {
          snapshots.set(entry.name, repositories);
        }
      } catch {
        // Ignore incomplete or invalid historical cache directories.
      }
    }
  } catch {
    // The first dashboard generation has no cache history yet.
  }

  snapshots.set(currentDate, currentRepos);
  return [...snapshots.entries()]
    .map(([snapshotDate, repositories]) => ({
      date: snapshotDate,
      repositories,
      periods: [...new Set(repositories.map((repository) => repository.period).filter(Boolean))],
    }))
    .sort((left, right) => left.date.localeCompare(right.date));
}

async function writeDashboard({ outputDir, date, repos }) {
  const dashboardDir = path.join(outputDir, "dashboard");
  const historyDir = path.join(dashboardDir, "history");
  const assetSourceDir = path.join(TOOLKIT_ROOT, "assets", "dashboard");
  const assetOutputDir = path.join(dashboardDir, "assets");
  const stylesheet = await readFile(path.join(TOOLKIT_ROOT, "assets", "dashboard", "styles.css"), "utf8");
  const snapshots = await loadDashboardSnapshots(outputDir, date, repos);
  const snapshotMetadata = snapshots.map((snapshot) => ({
    date: snapshot.date,
    periods: snapshot.periods,
  }));
  const latestSnapshot = snapshots.at(-1);

  await mkdir(assetOutputDir, { recursive: true });
  await mkdir(historyDir, { recursive: true });
  await writeUtf8File(
    path.join(dashboardDir, "index.html"),
    renderDashboardHtml(latestSnapshot.repositories, latestSnapshot.date, {
      currentDate: latestSnapshot.date,
      snapshotMetadata,
      assetBase: "./assets",
      stylesheetHref: "./styles.css",
      historyPathPrefix: "./history/",
    }),
  );
  await writeUtf8File(path.join(dashboardDir, "styles.css"), stylesheet);

  for (const snapshot of snapshots) {
    await writeUtf8File(
      path.join(historyDir, `${snapshot.date}.html`),
      renderDashboardHtml(snapshot.repositories, snapshot.date, {
        currentDate: snapshot.date,
        snapshotMetadata,
        assetBase: "../assets",
        stylesheetHref: "../styles.css",
        historyPathPrefix: "./",
      }),
    );
  }

  for (const asset of await readdir(assetSourceDir)) {
    await copyFile(path.join(assetSourceDir, asset), path.join(assetOutputDir, asset));
  }

  return path.join(dashboardDir, "index.html");
}

async function runAnalysis(options) {
  const periods = resolvePeriods(options.periods ?? options.period);
  const outputDir = path.resolve(options.outputDir);
  const cacheDir = path.join(outputDir, "cache", options.date);

  await mkdir(cacheDir, { recursive: true });

  const trendingByPeriod = {};
  for (const period of periods) {
    const html = await fetchText(`https://github.com/trending?since=${period}`);
    const parsed = parseTrendingHtml(html, period);
    trendingByPeriod[period] = parsed;
    await writeUtf8File(
      path.join(cacheDir, `trending-${period}.json`),
      `${JSON.stringify(parsed, null, 2)}\n`,
    );
  }

  const uniqueRepos = [];
  const seen = new Set();
  for (const period of periods) {
    for (const repo of trendingByPeriod[period]) {
      if (!seen.has(repo.fullName)) {
        seen.add(repo.fullName);
        uniqueRepos.push(repo);
      }
    }
  }

  const enrichedRepos = await mapWithConcurrency(uniqueRepos, 4, enrichRepository);
  const classifiedRepos = enrichedRepos.map((repo) => classifyRepository(repo));
  const enrichedMap = new Map(classifiedRepos.map((repo) => [repo.fullName, repo]));
  const reports = [];
  const dashboardRepos = [];

  for (const period of periods) {
    const periodRepos = trendingByPeriod[period]
      .map((repo) => summarizeRepository({ ...enrichedMap.get(repo.fullName), ...repo }))
      .sort((left, right) => left.rank - right.rank);
    const trendAnalysis = buildTrendAnalysisItems(periodRepos, period);
    const repos = periodRepos.map((repo) => {
      const analysis = buildRepositoryAnalysis(repo, buildMacroTrendAlignment(repo, trendAnalysis.items));
      return {
        ...repo,
        analysis,
        summary: buildSummary(repo, analysis),
        trendAnalysis: {
          overview: trendAnalysis.overview,
          risk: trendAnalysis.risk,
          items: trendAnalysis.items,
        },
      };
    });

    const markdown = renderMarkdownReport({ period, date: options.date, repos });
    const markdownPath = path.join(outputDir, `${options.date}-${period}.md`);

    await writeUtf8File(markdownPath, markdown, true);

    dashboardRepos.push(...repos);
    reports.push({
      period,
      markdownPath,
      repoCount: repos.length,
      focusCount: repos.filter((repo) => repo.isFocus).length,
      warnings: repos.filter((repo) => repo.fetchWarning).map((repo) => ({
        repo: repo.fullName,
        warning: repo.fetchWarning,
      })),
    });
  }

  const cachedDashboardRepos = await mergeDashboardCache(cacheDir, periods, dashboardRepos);
  await writeUtf8File(
    path.join(cacheDir, "enriched-repositories.json"),
    `${JSON.stringify(cachedDashboardRepos, null, 2)}\n`,
  );

  const dashboardPath = await writeDashboard({
    outputDir,
    date: options.date,
    repos: cachedDashboardRepos,
  });

  return {
    reports,
    cacheDir,
    dashboardPath,
    uniqueRepoCount: uniqueRepos.length,
  };
}

export {
  buildTrendAnalysis,
  buildTrendAnalysisLines,
  classifyRepository,
  extractReadmeTextFromHtml,
  mergePeriodRepositories,
  normalizePeriodSelection,
  parseArgs,
  parseTrendingHtml,
  renderMarkdownReport,
  runAnalysis,
  summarizeRepository,
  usage,
  writeDashboard,
};
