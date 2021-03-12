function run() {
    var count = 0;
    function call() {
        console.log("count",count);
        count++;
    };
    call();
};

const customMap = (list, mapFunc) => {
    const final = [];
    for (let each of list) {
        const res = mapFunc(each);
        final.push(res);
    }
    return final;
};

// setInterval(run,1000);

const one = () => {
    console.time();
    const list = [1,2,3,4,5];
    const res = list.map(each => {
        let i = 100;
        while(i>0) {
            // console.log(each,i);
            i--;
        }
        return each;
    });
    console.log(res);
    console.timeEnd();
};

const two = async () => {
    console.time();
    const list = [1,2,3,4,5];
    // const res = customMap(list,async each => {
    //     let i = 100;
    //     console.log(each);
    //     while(i>0) {
    //         // console.log(each,i);
    //         console.log(each,i)
    //         i--;
    //     }
    //     return each;
    // });
    const res = await Promise.all(
        customMap(list,async each => {
            let i = 100;
            console.log(each);
            while(i>0) {
                // console.log(each,i);
                console.log(each,i)
                i--;
            }
            return each;
        })
    );
    console.log(res);
    console.timeEnd();
};

// one();
two();