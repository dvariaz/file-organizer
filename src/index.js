const path = require("path");
const fs = require("fs");
const { promisify } = require("util");
const colors = require("colors");
const readFolderAbsolute = promisify(require("readdir-absolute"));
const { app, BrowserWindow, ipcMain, ipcRenderer, Menu } = require("electron");
const {
  renameFiles,
  makeDir,
  makeThumbnail,
  pathData,
} = require("./utils/utils.js");

var files = [];

let mainWindow;

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require("electron-squirrel-startup")) {
  // eslint-disable-line global-require
  app.quit();
}

const menu = Menu.buildFromTemplate([]);

Menu.setApplicationMenu(menu);

const createWindow = () => {
  // Create the browser window.
  mainWindow = new BrowserWindow({
    width: 800,
    height: 450,
    webPreferences: {
      nodeIntegration: false, // is default value after Electron v5
      contextIsolation: true, // protect against prototype pollution
      enableRemoteModule: false, // turn off remote
      preload: path.join(__dirname, "preload.js"), // use a preload script
    },
  });

  // and load the index.html of the app.
  mainWindow.loadFile(path.join(__dirname, "index.html"));

  // mainWindow.setResizable(false);

  if (!app.isPackaged) {
    // Open the DevTools.
    mainWindow.webContents.openDevTools();
  }
};

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.

app.on("ready", async () => {
  if (app.isPackaged) {
    console.log("PRODUCTION MODE\n".green);
    files = process.argv.slice(2);
  } else {
    console.log("DEVELOPMENT MODE\n".green);
    try {
      let folderContent = await readFolderAbsolute(
        path.join(__dirname, "../samples")
      );
      files = folderContent
        .filter(
          (filename) =>
            path.extname(filename) != "" &&
            !path.basename(filename).includes("@THUMB")
        )
        .slice(1, 4);
      console.log(`TEST FILES:`.yellow, files);
    } catch (err) {
      console.log("Error leyendo directorio de samples: ", err);
    }
  }
  createWindow();
});

ipcMain.on("page-ready", () => {
  mainWindow.webContents.send("file-list", files);
});

ipcMain.on("organize-files", async (event, data) => {
  let { ref, thumbnail } = data;
  // console.log(data);
  //TODO: Revisar que pasa cuando hay una referencia existente y se quiere solamente añadir las nuevas fotos a la carpeta sin necesidad de un thumbnail
  //TODO: Solucionar problemas de asincronismo
  makeDir(path.dirname(files[0]), ref);
  await makeThumbnail(thumbnail, ref);
  renameFiles(files, ref);
  event.reply("event-reply", { evt: "rename-files", ok: true });
});

ipcMain.on("close-app", () => {
  mainWindow.close();
});

// Quit when all windows are closed.
app.on("window-all-closed", () => {
  // On OS X it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and import them here.
