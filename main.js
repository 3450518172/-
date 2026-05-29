process.on('uncaughtException', (error) => {
  console.error('已拦截垃圾报错:', error.message);
});

const { app, BrowserWindow, globalShortcut, protocol } = require('electron');
const path = require('path');
const fs = require('fs'); // 🎯 引入文件系统模块，用于读写本地位置配置

const SCHEMES_TO_BLOCK = ['bytedance', 'snssdk', 'snssdk1128', 'tiktok', 'douyin'];
protocol.registerSchemesAsPrivileged(
  SCHEMES_TO_BLOCK.map(scheme => ({ scheme, privileges: { supportFetchAPI: true, corsEnabled: true } }))
);

let mainWindow;
let currentOpacity = 0.8;
let configPath; // 配置文件路径

// 辅助函数：读取上次保存的窗口位置和大小
function getSavedWindowState() {
  try {
    if (fs.existsSync(configPath)) {
      const data = fs.readFileSync(configPath, 'utf8');
      return JSON.parse(data);
    }
  } catch (e) {
    console.error('读取位置配置失败:', e);
  }
  // 如果没有保存过，返回默认的初始大小和屏幕居中状态
  return { width: 800, height: 600, x: undefined, y: undefined };
}

// 辅助函数：保存当前窗口的位置和大小
function saveWindowState() {
  if (!mainWindow) return;
  try {
    // 获取当前窗口的几何信息
    const bounds = mainWindow.getBounds();
    fs.writeFileSync(configPath, JSON.stringify(bounds), 'utf8');
    console.log('窗口位置及大小已成功记忆:', bounds);
  } catch (e) {
    console.error('保存位置配置失败:', e);
  }
}

function createWindow() {
  // 🎯 在用户数据目录下定义一个名为 window-state.json 的隐藏配置文件
  configPath = path.join(app.getPath('userData'), 'window-state.json');
  
  // 获取历史记忆状态
  const savedState = getSavedWindowState();

  mainWindow = new BrowserWindow({
    width: savedState.width,
    height: savedState.height,
    x: savedState.x,
    y: savedState.y,
    transparent: true,
    frame: false,
    skipTaskbar: true,
    alwaysOnTop: true,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true, 
      backgroundThrottling: false, 
      webviewTag: true,
      partition: 'persist:moyu'
    }
  });

  mainWindow.loadFile('index.html');
  mainWindow.setOpacity(currentOpacity);

  // 核心协议拦截，防止抖音弹窗
  SCHEMES_TO_BLOCK.forEach(scheme => {
    mainWindow.webContents.session.protocol.handle(scheme, (request) => {
      return new Response('', { status: 204 });
    });
  });

  // 🎯 核心改动：在窗口即将关闭、或者移动/缩放调整大小时，实时记住位置
  mainWindow.on('close', () => {
    saveWindowState();
  });
  mainWindow.on('move', () => {
    saveWindowState();
  });
  mainWindow.on('resize', () => {
    saveWindowState();
  });

  // 鼠标离开窗口，瞬间完全透明并允许鼠标穿透
  mainWindow.on('blur', () => {
    if (mainWindow) {
      mainWindow.setOpacity(0.0);       
      mainWindow.setIgnoreMouseEvents(true); 
    }
  });

  // 鼠标回到窗口，恢复你当前调好的透明度
  mainWindow.on('focus', () => {
    if (mainWindow) {
      mainWindow.setOpacity(currentOpacity);
      mainWindow.setIgnoreMouseEvents(false); 
    }
  });

  mainWindow.on('closed', function () {
    mainWindow = null;
  });
}

function updateOpacity(delta) {
  if (!mainWindow) return;
  let nextOpacity = currentOpacity + delta;
  if (nextOpacity < 0.1) nextOpacity = 0.1;
  if (nextOpacity > 1.0) nextOpacity = 1.0;
  currentOpacity = parseFloat(nextOpacity.toFixed(2));
  mainWindow.setOpacity(currentOpacity);
}

app.whenReady().then(() => {
  createWindow();

  // 快捷键 1：Alt + 向上箭头 (增加 5% 透明度)
  globalShortcut.register('Alt+Up', () => {
    updateOpacity(0.05);
  });

  // 快捷键 2：Alt + 向下箭头 (降低 5% 透明度)
  globalShortcut.register('Alt+Down', () => {
    updateOpacity(-0.05);
  });

  // 快捷键 3：Alt + S 全局唤醒
  globalShortcut.register('Alt+S', () => {
    if (mainWindow) mainWindow.focus();
  });

  // 快捷键 4：F 瞬间无痕闪退（闪退前也会完美触发销毁记忆）
  globalShortcut.register('F', () => {
    if (mainWindow) {
      saveWindowState(); // 闪退前赶紧记一下
      mainWindow.destroy(); 
    }
    app.quit();
  });
});

app.on('will-quit', () => {
  globalShortcut.unregisterAll();
});

app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit();
});