const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const fs = require('fs');

const sanitizeFilename = (filename) => {
  const safeName = String(filename || 'export.pdf')
    .replace(/[<>:"/\\|?*\x00-\x1F]/g, '_')
    .trim();

  return safeName || 'export.pdf';
};

const getUniqueFilePath = (directory, filename) => {
  const safeFilename = sanitizeFilename(filename);
  const parsed = path.parse(safeFilename);
  let candidate = path.join(directory, safeFilename);
  let counter = 1;

  while (fs.existsSync(candidate)) {
    candidate = path.join(directory, `${parsed.name} (${counter})${parsed.ext}`);
    counter += 1;
  }

  return candidate;
};

ipcMain.handle('export-pdf', async (event, { html, filename }) => {
  const pdfWindow = new BrowserWindow({
    show: false,
    width: 794,
    height: 1123,
    webPreferences: {
      sandbox: true,
      contextIsolation: true,
    },
  });

  try {
    await pdfWindow.loadURL(`data:text/html;charset=utf-8,${encodeURIComponent(html)}`);
    await pdfWindow.webContents.executeJavaScript(`
      Promise.all([
        document.fonts ? document.fonts.ready : Promise.resolve(),
        Promise.all(Array.from(document.images).map((img) => {
          if (img.complete) return Promise.resolve();
          if (img.decode) return img.decode().catch(() => undefined);
          return new Promise((resolve) => {
            img.onload = resolve;
            img.onerror = resolve;
          });
        })),
      ])
    `);
    const pdfBuffer = await pdfWindow.webContents.printToPDF({
      printBackground: true,
      preferCSSPageSize: true,
    });
    const outputPath = getUniqueFilePath(app.getPath('downloads'), filename);
    await fs.promises.writeFile(outputPath, pdfBuffer);
    return { ok: true, path: outputPath };
  } finally {
    pdfWindow.destroy();
  }
});

const createWindow = () => {
  const win = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    },
    // ウィンドウ左上のアイコン設定
    icon: path.join(__dirname, 'icon.ico') 
  });

  // メニューバーを消す場合（お好みで）
  win.setMenuBarVisibility(false);

  if (process.env.NODE_ENV === 'development') {
    win.loadURL('http://localhost:5173');
  } else {
    win.loadFile(path.join(__dirname, 'dist', 'index.html'));
  }
};

app.whenReady().then(() => {
  createWindow();
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
