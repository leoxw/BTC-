# BTC Explorer - MySQL Backend Setup

## 项目结构

这是一个比特币价格追踪应用，现在使用MySQL数据库存储数据。

- **前端**: React + Vite 应用
- **后端**: Node.js + Express API
- **数据库**: MySQL

## 数据库配置

### 连接信息
- 主机: `66.103.198.158`
- 端口: `19306`
- 数据库: `btc`
- 用户名: `btcusr`
- 密码: `pBrFY8sDRiepQZMR`

### 初始化数据库

首先，连接到数据库并执行初始化脚本：

```bash
mysql -h 66.103.198.158 -P 19306 -u btcusr -pBrFY8sDRiepQZMR btc < backend/init-db.sql
```

或者在MySQL客户端中：

```sql
source backend/init-db.sql
```

这将创建以下表：
- `users` - 存储管理员用户
- `news_events` - 存储新闻事件
- `price_data` - 存储价格历史数据
- `sessions` - 存储会话信息

默认管理员用户：
- 用户名: `leo`
- 密码: `123456`

## 后端API设置

### 1. 安装依赖

```bash
cd backend
npm install
```

### 2. 启动后端服务

```bash
npm start
# 或使用开发模式（需要Node.js 20+）
npm run dev
```

后端API将运行在 `http://localhost:3001`

## 前端设置

### 1. 安装依赖

```bash
npm install
```

### 2. 启动前端服务

```bash
npm run dev
```

前端应用将运行在 `http://localhost:5173`

## API端点

### 认证相关
- `POST /api/auth/login` - 管理员登录
- `POST /api/auth/verify` - 验证会话
- `POST /api/auth/logout` - 登出
- `POST /api/auth/change-password` - 修改密码

### 新闻事件
- `GET /api/news?lang=en` - 获取新闻事件
- `POST /api/news/update` - 更新新闻事件（需要认证）

### 价格数据
- `GET /api/prices?days=max` - 获取价格数据
- `POST /api/prices/upload` - 上传价格数据（需要认证）

## 默认数据

系统包含默认的比特币价格数据（2010-2026）和多语言新闻事件数据。

首次运行时，可以通过管理员后台的"Price Data"选项卡上传CSV数据。

## 故障排除

### 数据库连接问题
- 检查数据库服务是否运行
- 验证连接信息是否正确
- 确保防火墙允许连接

### API连接问题
- 确保后端服务正在运行（端口3001）
- 检查CORS配置

### 前端开发服务器
- 确保Node.js已安装（建议v18+）
- 检查端口5173是否可用