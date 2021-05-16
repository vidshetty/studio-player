const { app, BrowserWindow, ipcMain, screen } = require("electron");
const localShortcut = require("electron-localshortcut");
const path = require("path");
let window, isMaximized = false, anotherScreen, isFullScreen = false;


const create = () => {
    const { width, height } = screen.getPrimaryDisplay().workAreaSize;
    console.log("width",width,"height",height);
    // const finalWidth = width > 1500 ? 1500 : 0;
    // const finalHeight = height > 790 ? 790 : 0;
    const finalWidth = width > 1600 ? 1600 : 0;
    const finalHeight = height > 860 ? 860 : 0;

    const config = {
        width: finalWidth,
        height: finalHeight,
        frame: false,
        resizable: false,
        center: true,
        webPreferences: {
            nodeIntegration: true,
            preload: `${__dirname}/preload.js`
        },
        backgroundColor: "#000000",
        show: false,
        icon: __dirname + "/bluelogo-small.png"
    };
    if (!finalHeight === 0 || finalWidth === 0) {
        delete config.width;
        delete config.height;
    }
    
    window = new BrowserWindow(config);

    // screen.setThumbarButtons([
    //     {
    //         tooltip: "Play",
    //         icon: path.join(__dirname, "/playwhite.png"),
    //         click: () => { 
                
    //         }
    //     }
    // ]);

    window.loadURL(`file://${path.join(__dirname,"../build/index.html")}`);
    // screen.loadURL("http://localhost:5000");
    // window.loadURL("http://localhost:3000");
    // window.loadURL("https://brokennews.herokuapp.com");
    // screen.loadURL("https://studioserver-backup.herokuapp.com");
    // window.webContents.openDevTools();

    window.once("ready-to-show",() => {
        // isMaximized = true;
        setTimeout(() => {
            window.show();
            // if (finalHeight === 0 || finalWidth === 0) {
                window.maximize();
            // }
            // localShortcut.register(screen,"Fn+F11",() => {
            //     console.log("full screen");
            // })
        },500);
    });

    window.on("close",() => {
        window = null;
        app.quit();
    });
};

const openNew = () => {
    anotherScreen = new BrowserWindow({
        width: 1300,
        height: 600,
        frame: true,
        resizable: false,
        backgroundColor: "#121212",
        show: true,
        // icon: __dirname + "/aquamarinelogo.png"
    });

    anotherScreen.loadURL("https://brokennews.herokuapp.com");
    // screen.webContents.openDevTools();

    // anotherScreen.once("ready-to-show",() => {
    //     // screen.maximize();
    //     // isMaximized = true;
    //     setTimeout(() => {
    //         anotherScreen.show();
    //     },500);
    // });

    anotherScreen.on("close",() => {
        anotherScreen = null;
    });
};

const minimize = () => {
    window.minimize();
};

const maximize = () => {
    console.log("ismaximised",isMaximized);
    if (isMaximized) {
        window.unmaximize();
        isMaximized = false;
    } else {
        window.maximize();
        isMaximized = true;
    }
};

const close = () => {
    window.close();
};

const toggleFullScreen = () => {
    window.setFullScreen(!isFullScreen);
    isFullScreen = !isFullScreen;
};


app.on("ready",create);

app.on("activate",() => {
    if (BrowserWindow.getAllWindows().length === 0) {
        create();
    }
});

ipcMain.on("minimize", minimize);
ipcMain.on("close", close);
ipcMain.on("maximize", maximize);
ipcMain.on("opennew",() => {
    openNew();
});
ipcMain.on("full",toggleFullScreen);
ipcMain.on("response",(e,res) => console.log("res",res));

// ipcMain.on("paused",() => {
//     screen.setThumbarButtons([
//         {
//             tooltip: "Play",
//             icon: path.join(__dirname, "/playwhite.png"),
//             click () { 
//                 console.log("play now");
//                 // ipcMain.emit("playagain");
//                 screen.webContents.send("playagain");
//             }
//         }
//     ]);
// });

// ipcMain.on("playing",() => {
//     screen.setThumbarButtons([
//         {
//             tooltip: "Pause",
//             icon: path.join(__dirname, "/pausewhite.png"),
//             click () { 
//                 console.log("pause now");
//                 // ipcMain.emit("pauseagain");
//                 screen.webContents.send("pauseagain");
//             }
//         }
//     ]);
// });