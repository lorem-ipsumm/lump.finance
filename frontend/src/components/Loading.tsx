import React, { useEffect } from 'react';
import "../css/loading.css";

/**
 * Loading screen
 */
export default function Loading() {


    useEffect(() => {

        let timer = setTimeout(() => {

            // get message text element
            let message = document.getElementsByClassName("loading-message")[0];

            // make message visible
            if (message)
                message.classList.add("visible");

        }, 5000);


        // runs on component unmount
        return(() => {
            // stop timer
            clearTimeout(timer);
        });

    }, []);

    return (
        <div className="loading-wrapper page-wrapper">
            <div className="loading">
                <span>Loading</span>
            </div>

            <div className="loading-message">
                <span>This is taking a while... If this cotinues try refreshing the page.</span>
            </div>
        </div> 
    );
}

