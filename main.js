const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('path');
const fs = require('fs');

const sanitizeFilename = (filename) => {
  const safeName = String(filename || 'export.pdf')
    .replace(/[<>:"/\\|?*\x00-\x1F]/g, '_')
    .trim();

  return safeName || 'export.pdf';
};

const ensureExtension = (filePath, extension) => {
  if (!extension || path.extname(filePath)) return filePath;
  return `${filePath}.${extension.replace(/^\./, '')}`;
};

const showExportSaveDialog = async ({ browserWindow, filename, extension, filters }) => {
  const result = await dialog.showSaveDialog(browserWindow, {
    defaultPath: path.join(app.getPath('downloads'), sanitizeFilename(filename)),
    filters,
  });

  if (result.canceled || !result.filePath) {
    return null;
  }

  return ensureExtension(result.filePath, extension);
};

ipcMain.handle('save-export-file', async (event, { content, filename, extension, filters }) => {
  const outputPath = await showExportSaveDialog({
    browserWindow: BrowserWindow.fromWebContents(event.sender),
    filename,
    extension,
    filters,
  });

  if (!outputPath) return { ok: false, canceled: true };

  await fs.promises.writeFile(outputPath, content, 'utf8');
  return { ok: true, path: outputPath };
});

ipcMain.handle('export-pdf', async (event, { html, filename, extension, filters }) => {
  const outputPath = await showExportSaveDialog({
    browserWindow: BrowserWindow.fromWebContents(event.sender),
    filename,
    extension,
    filters,
  });

  if (!outputPath) return { ok: false, canceled: true };

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
