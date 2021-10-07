import React, { useState, useEffect } from "react";

import {
  Signer,
  CasperClient,
  CLPublicKey,
  CLAccountHash,
  CLByteArray,
  CLKey,
  CLString,
  CLTypeBuilder,
  CLValue,
  CLValueBuilder,
  CLValueParsers,
  CLMap,
  DeployUtil,
  EventName,
  EventStream,
  Keys,
  RuntimeArgs,
} from "casper-js-sdk";

import { utils, helpers} from "casper-js-client-helper";

const NODE_ADDRESS = "http://54.183.43.215:7777"

async function getBalanceOf(publicKey) {
  console.log('getBalanceOf')
  console.log(helpers)
  const result = await utils.contractDictionaryGetter(
    NODE_ADDRESS,
    publicKey,
    "balances"
  );
  return result.toString();
}

async function getActivePublicKey() {
  let pk = await Signer.getActivePublicKey().catch(
    (err) => {
      //alert("Please install Signer, make sure the site is connected, there is an active key, and signer is unlocked")
      //Signer.sendConnectionRequest()
    }
  );
  return pk
}

export function Wcspr() {

  const [mode, setMode] = useState("wrap")
  const [balance, setBalance] = useState(undefined)
  const [amount, setAmount] = useState("wrap")

  async function swap(){
    const pk = await getActivePublicKey()
  }

  useEffect(()=>{
    async function getBalance() {
      setBalance(undefined)
      const pk = await getActivePublicKey()
      console.log('pk', pk)
      if (pk) {
        const balance = await getBalanceOf(pk)
        console.log(balance)
        setBalance(balance)
      }
    }
    getBalance()
    
  }, [mode])

  return (
    <div className="text-center">
      <div>
            <ul className="">
            <li className="inline-block">
            <button className={`mx-2 text-sm border  px-2 py-1 ${mode === 'wrap' && "bg-blue-100"}`} onClick={()=>setMode("wrap")}>Wrap CSPR</button>
            </li>
            <li className="inline-block">
            <button className={`mx-2 text-sm border  px-2 py-1 ${mode === 'unwrap' && "bg-blue-100"}`} onClick={()=>setMode("unwrap")}>UnWrap CSPR</button>
            </li>
            </ul>

            <div className="mt-10">
              <div>Balance: {balance !== undefined ? balance : 'N/A'}</div>
              <input className="p-1" placeholder="Amount" type="number" value={amount} onChange={(e) => {setAmount(parseFloat(e.target.value))}} style={{width: '200px', margin: "10px auto"}} />

              <button className="ml-2 py-1 px-5 border bg-green-500 text-white capitalize" onClick={swap}>{mode}</button>
            </div>
      </div>
    </div>
  )

}
