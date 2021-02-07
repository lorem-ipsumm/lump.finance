import React, { useState, useEffect } from 'react';
import "../css/newCreator.css";
import { Info, Link, User, } from 'react-feather';
import db from '../components/firestore';
import Loading from '../components/Loading';
import { useHistory } from "react-router-dom";
import { ethers } from 'ethers';
import axios from 'axios';

/**
 * Form for creating new creator pages
 */
function NewCreator(props: {poolFactory: ethers.Contract, connectedAddress: string}) {


    const[displayName, setDisplayName] = useState<string>("");
    const[bio, setBio] = useState<string>("");
    const[links, setLinks] = useState<string[]>(["", ""]);
    const history = useHistory();
    const[numLinks, setNumLinks] = useState<number>(0);

    // get latest gas prices 
    async function getGasPrice(speed?: string) {
        
        // make request w/ axios
        const price = await axios.get('https://ethgasstation.info/api/ethgasAPI.json?api-key=' + process.env.DEFI_PULSE_KEY)

        if (speed === "fastest")
            return(parseInt(price.data.fastest)/10);
        else if (speed === "fast")
            return(parseInt(price.data.fast)/10);
        else 
            return(parseInt(price.data.average)/10);

    }

    // handle form submission
    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {

        // prevent refresh
        e.preventDefault();

        // get current gas prices
        const gasPrice = await getGasPrice();

        // get all of the link inputs
        let inputs = document.querySelectorAll(".link-input");
        console.log(inputs);

        let socialLinks = [];

        // go through the inputs and get the links
        for (let i = 0; i < inputs.length; i++) {
            let input:HTMLInputElement = inputs[i] as HTMLInputElement;
            if (input.value !== "")
                socialLinks.push(input.value);
        }


        // create a new pool
        try {
            const tx = await props.poolFactory.newPool(props.connectedAddress,{gasPrice: 5 * 1e9});
            await tx.wait();
        } catch (err) {
            console.log(err);
            return;
        }

        const pools = await props.poolFactory.getPools();

        // Add a new document in collection "cities"
        db.collection("users").doc(props.connectedAddress).set({
            name: displayName,
            bio: bio,
            links: socialLinks,
            pool: pools[pools.length - 1]
        })
        .then(function() {
            history.push("/creator/" + props.connectedAddress);
        })
        .catch(function(error) {
            console.error("Error writing document: ", error);
        });

    }


    // run on load
    useEffect(() => {


    }, []);


    if (props.connectedAddress !== "") {
        return (
            <div className="page-wrapper">
                <form onSubmit={(e) => handleSubmit(e)} className="creator-form">
                    <div className="input-section">
                        <div className="label-wrapper">
                            <User/>
                            <label>Display Name</label>
                        </div>
                        <input type="text" placeholder="John Doe Art" onChange={(e) => setDisplayName(e.target.value)}></input>
                    </div>
                    <div className="input-section">
                        <div className="label-wrapper">
                            <Info/>
                            <label>Bio</label>
                        </div>
                        <textarea placeholder="Input a short & sweet bio describing who you are and what you do" onChange={(e) => setBio(e.target.value)}></textarea>
                    </div>
                    <div className="input-section">
                        <div className="label-wrapper">
                            <Link/>
                            <label>Social Links</label>
                        </div>
                        {links.map((link, i) => (
                            <input className="link-input" key={i} type="text" placeholder="youtube.com/JohnDoeTV" ></input>
                        ))} 
                        <button type="button" onClick={() => setLinks([...links, ""])} className="btn-new-link">Add Another Link</button>
                    </div>
                    <button type="submit" value="Submit" >Submit</button>
                    <span className="notice">*All of this can be updated later. After submitting you will be asked to pay a transaction fee for a new pool to be created for you. Once your transaction is submitted you'll be good to go!</span>
                </form>
            </div>
        );
    } else {
        return(<Loading/>)
    }
}
    
export default NewCreator;

