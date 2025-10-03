import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const port = parseInt(process.argv[2]) || process.env.PORT || 8080;
const distPath = path.join(__dirname, 'dist');

const server = http.createServer((req, res) => {
  // 设置 CORS 头
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // 处理路径 - 支持 /math-game/ 基础路径
  let requestPath = req.url;

  // 移除 /math-game/ 前缀（如果存在）
  if (requestPath.startsWith('/math-game/')) {
    requestPath = requestPath.substring('/math-game'.length);
  }

  // 处理根路径
  if (requestPath === '/') {
    requestPath = '/index.html';
  }

  let filePath = path.join(distPath, requestPath);

  // 调试日志
  console.log(`请求: ${req.url} -> ${requestPath} -> ${filePath}`);

  // 检查文件是否存在
  if (!fs.existsSync(filePath)) {
    // 尝试添加 .html 扩展名
    if (!filePath.endsWith('.html') && fs.existsSync(filePath + '.html')) {
      filePath += '.html';
      console.log(`添加 .html 扩展名: ${filePath}`);
    } else {
      console.log(`❌ 文件未找到: ${requestPath} -> ${filePath}`);
      res.writeHead(404);
      res.end(`File not found: ${requestPath}`);
      return;
    }
  }

  console.log(`✅ 返回文件: ${filePath}`);

  // 读取文件内容
  const ext = path.extname(filePath);
  const contentType = {
    '.html': 'text/html',
    '.js': 'application/javascript',
    '.css': 'text/css',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.ico': 'image/x-icon',
    '.json': 'application/json',
    '.wasm': 'application/wasm',
    '.webmanifest': 'application/manifest+xml'
  };

  res.writeHead(200, {
    'Content-Type': contentType[ext] || 'text/plain'
  });

  const readStream = fs.createReadStream(filePath);
  readStream.pipe(res);
});

server.listen(port, () => {
  console.log(`🚀 静态服务器启动成功！`);
  console.log(`📍 访问地址: http://localhost:${port}`);
  console.log(`📁 服务目录: ${distPath}`);
  console.log('');
  console.log('💡 使用 Ctrl+C 停止服务器');
}).on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.log(`❌ 端口 ${port} 已被占用，尝试使用端口 ${port + 1}...`);
    server.listen(port + 1);
  } else {
    console.error('❌ 服务器启动失败:', err);
    process.exit(1);
  }
});