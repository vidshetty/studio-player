const { app, BrowserWindow, ipcMain } = require("electron");
const localShortcut = require("electron-localshortcut");
const path = require("path");
let screen, isMaximized = false, anotherScreen, isFullScreen = false;


const create = () => {
    screen = new BrowserWindow({
        // width: 1320,
        width: 1400,
        // height: 660,
        height: 800,
        // height: 700,
        // frame: false,
        frame: false,
        resizable: false,
        center: true,
        webPreferences: {
            nodeIntegration: true,
            preload: `${__dirname}/preload.js`
        },
        // backgroundColor: "#131313",
        backgroundColor: "#121212",
        show: false,
        icon: __dirname + "/aquamarinelogo.png"
    });

    // screen.setThumbarButtons([
    //     {
    //         tooltip: "Play",
    //         icon: path.join(__dirname, "/playwhite.png"),
    //         click: () => { 
                
    //         }
    //     }
    // ]);

    // screen.loadURL(`file://${path.join(__dirname,"../build/index.html")}`);
    // screen.loadURL("http://localhost:5000");
    screen.loadURL("http://localhost:3000");
    // screen.loadURL("https://brokennews.herokuapp.com");
    // screen.loadURL("https://studioserver-backup.herokuapp.com");
    // screen.webContents.openDevTools();

    screen.once("ready-to-show",() => {
        // screen.maximize();
        // isMaximized = true;
        setTimeout(() => {
            screen.show();
            // localShortcut.register(screen,"Fn+F11",() => {
            //     console.log("full screen");
            // })
        },500);
    });

    screen.on("close",() => {
        screen = null;
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
    screen.minimize();
};

const maximize = () => {
    console.log("ismaximised",isMaximized);
    if (isMaximized) {
        screen.unmaximize();
        isMaximized = false;
    } else {
        screen.maximize();
        isMaximized = true;
    }
};

const close = () => {
    screen.close();
};

const toggleFullScreen = () => {
    screen.setFullScreen(!isFullScreen);
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