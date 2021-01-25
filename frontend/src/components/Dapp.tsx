import React, { useState, useEffect } from 'react';
// import DeckPreview from '../components/DeckPreview';
// import Loading from './Loading';
import "../css/main.css";
import "../css/resize.css";
import Creator from './Creator';
import Loading from './Loading';
import Particles from 'react-particles-js';

/**
 * Home page that contains a grid of decks, a search bar,
 * and a filter button
 */
export function Dapp() {

    const[creatorLoaded, setCreatorLoaded] = useState(false);

    // parameters for particles
    const params = {
	    "particles": {
	        "number": {
	            "value": 50
	        },
	        "size": {
	            "value": 1
	        }
        },
        "line_linked": {
            "enable": false
        },
	    "interactivity": {
	        "events": {
	            "onhover": {
	                "enable": true,
	                "mode": "repulse"
	            }
	        }
	    }
	}

    // run on load
    useEffect(() => {

        // get decks
        // getDecks();

        setCreatorLoaded(true);

    }, []);


   if (!creatorLoaded) {
       return(
            <div className="page-wrapper">
                <Loading/>
            </div>
       );
    } else {
        return(
            <div className="page-wrapper">
                <Particles params={params}/>
                <Creator/>
            </div>
        );
    }
    
}



