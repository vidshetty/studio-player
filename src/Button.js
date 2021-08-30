import "./css/teststyles.css";
import React from "react";


const Button = props => {
    const createRipple = e => {
        const button = e.currentTarget;
        // const circle = button.getElementsByClassName("ripple")[0];
        const circle = button.lastChild;
        const diameter = Math.max(button.clientWidth, button.clientHeight);
        const radius = diameter / 2;
        const dimen = button.getBoundingClientRect();
        circle.style.width = circle.style.height = `${diameter}px`;
        circle.style.left = `${e.clientX - (dimen.left + radius)}px`;
        circle.style.top = `${e.clientY - (dimen.top + radius)}px`;
        circle.classList.remove("hidden");
        circle.classList.add("play");
        setTimeout(() => {
            circle.classList.remove("play");
            circle.classList.add("hidden");
        }, 600);
    };

    const handleClick = e => {
        createRipple(e);
        props.onClick(e);
    };

    return(
        <div className={props.className} onClick={handleClick} title={props.title}
        style={{ outline: "none", position: "relative", overflow: "hidden" }}>
            {props.children}
            <span className="ripple hidden"></span>
        </div>
    );
};


export default Button;