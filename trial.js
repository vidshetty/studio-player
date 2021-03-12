const wait = time => {
    return new Promise((resolve,) => {
        setTimeout(resolve, time);
    });
};

class Timer{
    constructor(delay, callback) {
        this.time = delay;
        this.timeoutTimer = 0;
        this.intervalTimer = 0;
        this.secondsTracker = 0;
        this.callback = callback;
        this.done = false;
    }

    startInterval = () => {
        clearInterval(this.intervalTimer);
        this.intervalTimer = setInterval(() => {
            this.secondsTracker++;
            console.log("sec",this.secondsTracker);
        },1000);
    };

    start = (t = this.time) => {
        console.log("time in start",t);
        this.startInterval();
        clearTimeout(this.timeoutTimer);
        this.timeoutTimer = setTimeout(() => {
            this.callback();
            this.done = true;
            clearInterval(this.intervalTimer);
        },t*1000);
    };

    pause = () => {
        clearTimeout(this.timeoutTimer);
        clearInterval(this.intervalTimer);
    }

    ispausable = () => {
        return !this.done;
    }

    continue = () => {
        let diff = this.time - this.secondsTracker;
        this.start(diff);
    };
}

const cb = () => {
    console.log("ultimate callback function");
};

// (async () => {

//     const timer = new Timer(10,cb);
//     timer.start();
//     await wait(2000);
//     console.log(timer.ispausable());
//     await wait(5000);
//     timer.pause();
//     await wait(5000);
//     timer.continue();
//     await wait(10000);
//     console.log(timer.ispausable())

// })();

function trial (age) {
    let name = "Vidhata";
    this.age = age;

    this.display = () => {
        console.log(`${name} ${this.age}`);
    };

    this.change = (w) => {
        name = w;
    };
}

const app = new trial(22);
app.change("somrthing");
app.display();