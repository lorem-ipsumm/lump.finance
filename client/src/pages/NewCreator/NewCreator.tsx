import React, { useState, useEffect } from 'react';
import "./newCreator.css";
import { Info, Link, User, } from 'react-feather';
// import db from '../components/firestore';
import Loading from '../../components/Loading/Loading';
import { ethers } from 'ethers';
import axios from 'axios';
import { useEthers } from '@usedapp/core';
import addresses from "../../data/addresses.json";
import abis from "../../data/abis.json";
import { createClient } from '@supabase/supabase-js';

/**
 * Form for creating new creator pages
 */
function NewCreator() {

    const[displayName, setDisplayName] = useState<string>("");
    const[bio, setBio] = useState<string>("");
    const[links, setLinks] = useState<string[]>(["", ""]);
    const[numLinks, setNumLinks] = useState<number>(0);
    // TODO: turn into react hook to grab in other components
    const supabaseUrl = 'https://jrhbzfyqzasjvzswomvz.supabase.co'
    const supabaseKey:string = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoiYW5vbiIsImlhdCI6MTYzNjY1NzI0NywiZXhwIjoxOTUyMjMzMjQ3fQ.xztJS8cv7ENBYR9Np0CJZIiY5ucpTZaMlMPFALsuVB4';
    const supabase = createClient(supabaseUrl, supabaseKey);

    const {
        library,
        account
    } = useEthers();

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

        // no wallet connected
        const wallet = library ? library : new ethers.providers.JsonRpcProvider('https://restless-quiet-brook.quiknode.pro/e94faf0f8b90596f37e70f5c94d68c5009095d44/');

        // prevent refresh
        e.preventDefault();

        // get current gas prices
        // const gasPrice = await getGasPrice();

        // get all of the link inputs
        let inputs = document.querySelectorAll(".link-input");

        let socialLinks = [];

        // go through the inputs and get the links
        for (let i = 0; i < inputs.length; i++) {
            let input:HTMLInputElement = inputs[i] as HTMLInputElement;
            if (input.value !== "")
                socialLinks.push(input.value);
        }

        if (library && account) {

            // get the factory contract
            const poolFactory = new ethers.Contract(
                addresses.PoolFactory,
                [
                    "function newPool(address owner) external",
                    "function getPools() public view"
                ],
                library.getSigner()
            );

            // create a new pool
            try {
                const tx = await poolFactory.newPool(account);
                await tx.wait();
            } catch (err) {
                console.log(err);
                return;
            }

            const pools = await poolFactory.getPools();

            const { data, error } = await supabase
            .from('users')
            .insert([
                { 
                    address: account,
                    name: displayName,
                    bio: bio,
                    links: socialLinks,
                    pool: pools[pools.length - 1]
                }
            ])

            if (error) console.log(error);
        }

    }


    // run on load
    useEffect(() => {

        // if (props.connectedAddress === "")
            // history.push("/creator/0x39a7baa3fcb68ad38377ea4ebb402296dd69d981");


    }, []);


    if (account) {
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

