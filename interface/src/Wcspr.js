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

import { WCSPRClient } from "./wcspr-client";
import { utils, helpers} from "casper-js-client-helper";

const WCSPR_CONTRACT_HASH = 'hash-80bdcf7eb09c2437783291289b08f7c94adfdc833a9c9b56532fb955c3c71aec'

const NODE_ADDRESS = "https://picaswap.io/.netlify/functions/cors?url=http://159.65.118.250:7777/rpc";
const CHAIN_NAME = 'casper-test'
const EVENT_STREAM_ADDRESS = "https://picaswap.io/.netlify/functions/cors?url=http://159.65.118.250:7777/rpc";

function format(big) {
  if (big && big.div) {
    return big.div(10**9).toNumber() 
  } else {
    return big
  }
}


async function getCSPRBalance(pk) {
  const clPK = CLPublicKey.fromHex(pk);
  const client = new CasperClient(NODE_ADDRESS)
  let balance
  try {
    // exception when no tokens in user account
    balance = await client.balanceOfByPublicKey(clPK)
  } catch(err) {
    balance = 0
  }
  return balance
}

async function getWCSPRBalance(pk) {
  const erc20 = new WCSPRClient(
    NODE_ADDRESS,
    CHAIN_NAME,
    undefined
  );
  const contractHash = WCSPR_CONTRACT_HASH
  await erc20.setContractHash(contractHash.slice(5));
  const clPK = CLPublicKey.fromHex(pk);
  const name = await erc20.name();
  console.log('name', name)

  let balance
  try {
    balance = await erc20.balanceOf(clPK);
  } catch (err) {
    // exception when no tokens in user account
    balance = 0; 
  }
  return balance
}


export function Wcspr({ pk }) {

  console.log('wcspr PK', pk)

  const [isLoadingCSPRBalance, setLoadingCSPRBalance] = useState(false)
  const [isLoadingWCSPRBalance, setLoadingWCSPRBalance] = useState(false)

  const [wcsprBalance, setWCSPRBalance] = useState(undefined)
  const [csprBalance, setCSPRBalance] = useState(undefined)

  const [amount, setAmount] = useState(0)
  const [mode, setMode] = useState("wrap")

  async function swap(){
    const contractHash = WCSPR_CONTRACT_HASH.slice(5)
    if (mode === 'unwrap') {
       const erc20 = new WCSPRClient(
        NODE_ADDRESS,
        CHAIN_NAME,
        undefined
      );
      await erc20.setContractHash(contractHash);
      const clPK = CLPublicKey.fromHex(pk);
      await erc20.withdraw(clPK, amount*10**9, 10**9)
      alert('UnWrap is completed, it can take up to 10 minutes to update balance')
    }

    if (mode === 'wrap') {
      const erc20 = new WCSPRClient(
        NODE_ADDRESS,
        CHAIN_NAME,
        undefined
      );
      const clPK = CLPublicKey.fromHex(pk);
      erc20.deposit(clPK, contractHash, amount*10**9, 10**9)
      alert('Wrap is completed, it can take up to 10 minutes to update balance')
    }
  }

  useEffect(()=>{
    async function getBalance() {

      if (mode == 'wrap' && pk) {
        setCSPRBalance(undefined)

        setLoadingCSPRBalance(true)
        const csprBalance = await getCSPRBalance(pk)
        setLoadingCSPRBalance(false)

        console.log(csprBalance)
        setCSPRBalance(csprBalance)
      }

      if (mode == 'unwrap' && pk) {
        setWCSPRBalance(undefined)

        setLoadingWCSPRBalance(true)
        const balance = await getWCSPRBalance(pk)
        setLoadingWCSPRBalance(false)

        console.log(balance)
        setWCSPRBalance(balance)
      }

    }
    getBalance()
    
  }, [mode, pk])

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

            <div className="mt-16">

              { mode == 'wrap' && <div>CSPR Balance: {csprBalance !== undefined ? format(csprBalance) : 'N/A'} {isLoadingCSPRBalance && <span className="text-xs ml-2">loading</span>}</div>}
              { mode == 'unwrap' && <div>WCSPR Balance: {wcsprBalance !== undefined ? format(wcsprBalance) : 'N/A'} {isLoadingWCSPRBalance && <span className="text-xs ml-2">loading</span>}</div>}

              <input className="p-1" placeholder="Amount" type="number" value={amount} onChange={(e) => {setAmount(parseFloat(e.target.value))}} style={{width: '200px', margin: "10px auto"}} />

              <button className={`ml-2 py-1 px-5 border bg-green-500 text-white capitalize disabled:opacity-50 ${!pk && 'opacity-50'}`} disabled={!pk} onClick={swap}>{mode}</button>
            </div>
      </div>
    </div>
  )

}
