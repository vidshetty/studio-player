import React, { useState, useEffect, useContext } from "react";
import { Redirect } from "react-router-dom";
import "../css/opening2styles.css";
import logo2 from "../assets/latest-bluetransparent.svg";
import {
    wait,
    sendRequest,
    prefix,
    basename
} from "../common";

import {
    ResponseBarContext
} from "../index";
import { ResponseBar } from "../homepage";


// Opening
let requestTimeout = null;
let responseBarTimeout = null;
let reloadTimeout = null;


const Opening2 = () => {

    const [, setResObj] = useContext(ResponseBarContext);
    const [redirectValue, setRedirectValue] = useState(false);
    const [, setLoaderClass] = useState("opening-loader hidden");

    const request = async () => {
        const res = await sendRequest({
            method: "GET",
            endpoint: "/activateCheck"
        });
        if (res.status === "active") {
            sendRequest({
                method: "GET",
                endpoint: "/recordTime"
            });
            await wait(500);
            if (requestTimeout === null) return;
            clearTimeout(requestTimeout);
            clearTimeout(responseBarTimeout);
            clearTimeout(reloadTimeout);
            requestTimeout = null;
            responseBarTimeout = null;
            reloadTimeout = null;
            setRedirectValue(true);
        }
    };

    const call = async () => {
        await wait(1000);
        setLoaderClass("opening-loader");
        requestTimeout = setTimeout(request, 0);
        responseBarTimeout = setTimeout(() => {
            requestTimeout = null;
            setResObj(prev => {
                return { ...prev, open: true, msg: "Error connecting, reloading...." }
            });
        }, 4000);
        reloadTimeout = setTimeout(() => {
            window.location.reload();
        }, 6000);
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