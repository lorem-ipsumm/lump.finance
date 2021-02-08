import React, { useEffect, useState } from 'react';
import "../css/loading.css";

/**
 * Loading screen
 */
export default function Loading(props: {message?: string}) {

    const[loadingMessage, setLoadingMessage] = useState<string>("Loading");




    useEffect(() => {

        if (props.message)
            setLoadingMessage(props.message);

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

    }, [props.message]);

    if (loadingMessage)
        return (
            <div className="loading-wrapper page-wrapper stretch">
                <div className="loading">
                    <span>{loadingMessage}</span>
                </div>

                <div className="loading-message">
                    <span>This is taking a while... If this cotinues try refreshing the page.</span>
                </div>
            </div> 
        );
    else 
        return (
            <div className="loading-wrapper page-wrapper">
                <div className="loading">
                    <span>{loadingMessage}</span>
                </div>

                <div className="loading-message">
                    <span>This is taking a while... If this cotinues try refreshing the page.</span>
                </div>
            </div> 
        );
}

