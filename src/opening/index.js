import React, { useState, useEffect, useContext } from "react";
import { Redirect } from "react-router-dom";
import "../css/opening2styles.css";
import logo2 from "../assets/latest-bluetransparent.svg";

import { APIService } from "../api-service";

import {
    wait,
    prefix,
    basename
} from "../common";

import {
    ResponseBarContext
} from "../index";
import { ResponseBar } from "../homepage";


// // Opening
// let requestTimeout = null;
// let responseBarTimeout = null;
// let reloadTimeout = null;


const Opening2 = () => {

    const [, setResObj] = useContext(ResponseBarContext);
    const [redirectValue, setRedirectValue] = useState(false);
    const [, setLoaderClass] = useState("opening-loader hidden");

    // const request = async () => {
    //     const res = await APIService.activateCheck();
    //     if (res.status === "active") {
    //         APIService.recordTime();
    //         await wait(500);
    //         if (requestTimeout === null) return;
    //         clearTimeout(requestTimeout);
    //         clearTimeout(responseBarTimeout);
    //         clearTimeout(reloadTimeout);
    //         requestTimeout = null;
    //         responseBarTimeout = null;
    //         reloadTimeout = null;
    //         setRedirectValue(true);
    //     }
    // };

    // const call = async () => {
    //     await wait(1000);
    //     setLoaderClass("opening-loader");
    //     requestTimeout = setTimeout(request, 0);
    //     responseBarTimeout = setTimeout(() => {
    //         requestTimeout = null;
    //         setResObj(prev => {
    //             return { ...prev, open: true, msg: "Error connecting, reloading...." }
    //         });
    //     }, 4000);
    //     reloadTimeout = setTimeout(() => {
    //         window.location.reload();
    //     }, 6000);
    // };

    const setErrorOnRepeat = () => {
        setInterval(() => {
            setResObj(prev => {
                return { ...prev, open: true, msg: "Something went wrong, try again later!" };
            });
        }, 1000);
    };

    const call = async () => {
        await wait(1000);
        setLoaderClass("opening-loader");
        let breakOut = false;
        for (let i=0; i<3 && !breakOut; i++) {
            (async () => {
                const res = await APIService.activateCheck();
                if (res.status === "active") {
                    APIService.recordTime();
                    await wait(500);
                    breakOut = true;
                    setRedirectValue(true);
                }
            })();
            setTimeout(() => {
                if (breakOut) return;
                setResObj(prev => {
                    return { ...prev, open: true, msg: "Error connecting, trying again...." };
                });
            }, 4000);
            await wait(6000);
        }
        if (!breakOut) setErrorOnRepeat();
    };

    useEffect(() => {
        call();
    }, []);

    if (redirectValue) {
        return <Redirect to={`${prefix}${basename}/homescreen`} />;
    }
    return(
        <div className="mainwindow">
            <div className="logo-container">
                <div className="logo">
                    <img src={logo2} alt="StudioMusic" />
                </div>
                <div style={{ width: "100%", height: "15px" }}></div>
            </div>
            <ResponseBar/>
        </div>
    );

};


export default Opening2;