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

import { WCSPRClient } from "./clients/wcspr-client";
import { utils, helpers} from "casper-js-client-helper";
import { BigNumber } from '@ethersproject/bignumber';
import { format } from './clients/utils'
import { WCSPR_CONTRACT_HASH, NODE_ADDRESS, CHAIN_NAME, CASPER_FEE } from './constants.js'


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
  return await erc20.getBalance(clPK)
}


export function Wcspr({ pk }) {

  console.log('wcspr PK', pk)

  const [message, setMessage] = useState(undefined)

  const [isLoadingCSPRBalance, setLoadingCSPRBalance] = useState(false)
  const [isLoadingWCSPRBalance, setLoadingWCSPRBalance] = useState(false)

  const [isProcessing, setProcessing] = useState(false)

  const [wcsprBalance, setWCSPRBalance] = useState(undefined)
  const [csprBalance, setCSPRBalance] = useState(undefined)

  const [amount, setAmount] = useState(0)
  const [mode, setMode] = useState("wrap")

  async function swap(){
    setMessage('')

    setProcessing(true)
    const contractHash = WCSPR_CONTRACT_HASH.slice(5)
    if (mode === 'unwrap') {
       const erc20 = new WCSPRClient(
        NODE_ADDRESS,
        CHAIN_NAME,
        undefined
      );
      await erc20.setContractHash(contractHash);
      const clPK = CLPublicKey.fromHex(pk);
      const deployHash = await erc20.withdraw(clPK, amount*10**9, CASPER_FEE)
      setMessage(`UnWrap is completed. Balance will be updated within 10min. Transaction hash: ${deployHash}`)
    }

    if (mode === 'wrap') {
      const erc20 = new WCSPRClient(
        NODE_ADDRESS,
        CHAIN_NAME,
        undefined
      );
      const clPK = CLPublicKey.fromHex(pk);
      const deployHash = await erc20.deposit(clPK, contractHash, amount*10**9, CASPER_FEE)
      setMessage(`Wraping is completed. Balance will be updated within 10min. Transaction hash: ${deployHash}`)
    }
    setProcessing(false)
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

              {isProcessing && <div className="mt-2 text text-yellow-400">Processing...</div>}
              {message && <div className="mt-2 text-xs text-yellow-600">{message}</div>}

            </div>

      </div>
    </div>
  )

}
