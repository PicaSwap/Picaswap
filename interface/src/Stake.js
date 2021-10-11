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

import { ERC20Client } from "casper-erc20-js-client";
import { WCSPRClient } from "./clients/wcspr-client";
import { StakeClient } from "./clients/staking-client";
import { utils, helpers} from "casper-js-client-helper";
import { BigNumber } from '@ethersproject/bignumber';

import { PICAS_CONTRACT_HASH, WCSPR_CONTRACT_HASH, STAKE_CONTRACT_HASH, NODE_ADDRESS, CHAIN_NAME } from './constants.js'
import { format } from './clients/utils'


async function getPicasBalance(pk) {
  const erc20 = new ERC20Client(
    NODE_ADDRESS,
    CHAIN_NAME,
    undefined
  );
  const contractHash = PICAS_CONTRACT_HASH
  await erc20.setContractHash(contractHash.slice(5));
  const clPK = CLPublicKey.fromHex(pk);

  let balance
  try {
    balance = await erc20.balanceOf(clPK);
  } catch (err) {
    // exception when no tokens in user account
    balance = 0; 
  }
  return BigNumber.from(balance)
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

  let balance
  try {
    balance = await erc20.balanceOf(clPK);
  } catch (err) {
    // exception when no tokens in user account
    balance = 0; 
  }
  return BigNumber.from(balance)
}


export function Stake({ pk }) {

  console.log('PK', pk)

  const [message, setMessage] = useState(undefined)

  const [isLoadingBalance, setLoadingBalance] = useState(false)
  const [isLoadingWCSPRBalance, setLoadingWCSPRBalance] = useState(false)
  const [isLoadingRewards, setLoadingRewards] = useState(false)
  const [isLoadingPicas, setLoadingPicas] = useState(false)

  const [isProcessing, setProcessing] = useState(false)

  const [wcsprBalance, setWCSPRBalance] = useState(undefined)
  const [balance, setBalance] = useState(undefined)
  const [rewards, setRewards] = useState(undefined)
  const [picas, setPicas] = useState(undefined)

  const [stakeAmount, setStakeAmount] = useState(undefined)
  const [withdrawAmount, setWithdrawAmount] = useState(undefined)

  async function initClient(){
    const contractHash = STAKE_CONTRACT_HASH.slice(5)
    const stakeClient = new StakeClient(
      NODE_ADDRESS,
      CHAIN_NAME,
      undefined
    );
    await stakeClient.setContractHash(contractHash);
    const clPK = CLPublicKey.fromHex(pk);
    return stakeClient
  }

  async function stake(){
    setMessage('')
    setProcessing(true)
    // TODO: ask for approval first
    const client = await initClient()
    const clPK = CLPublicKey.fromHex(pk);
    const deployHash = await client.stake(clPK, stakeAmount*10**9, 10**9)
    setMessage(`Stake is completed. Balance will be updated within 10min. Transaction hash: ${deployHash}`)
    setProcessing(false)
  }

  async function withdraw(){
    setMessage('')
    setProcessing(true)
    const client = await initClient()
    const clPK = CLPublicKey.fromHex(pk);
    const deployHash = await client.withdraw(clPK, stakeAmount*10**9, 10**9)
    setMessage(`Withdraw is completed. Balance will be updated within 10min. Transaction hash: ${deployHash}`)
    setProcessing(false)
  }

  useEffect(()=>{
    async function getBalance() {

        setLoadingWCSPRBalance(true)
        setWCSPRBalance(await getWCSPRBalance(pk))
        setLoadingWCSPRBalance(false)

        setLoadingPicas(true)
        setPicas(await getPicasBalance(pk))
        setLoadingPicas(false)

        /*
        const client = await initClient()

        setLoadingBalance(true)
        const balance = await client.balanceOf(CLPublicKey.fromHex(pk))
        setBalance(balance)
        setLoadingBalance(false)
        console.log('balance', balance)

        setLoadingRewards(true)
        const rewards = await client.estimatedRewards(CLPublicKey.fromHex(pk))
        setRewards(rewards)
        setLoadingRewards(false)
        console.log('rewards', rewards)
        */
    }
    if (pk) {
      getBalance()
    }
    
  }, [pk])

  const maxDepositText = 'Max: ' + (wcsprBalance === undefined ? "N/A" : format(wcsprBalance))
  const maxWithdrawText = 'Max: ' + (balance === undefined ? "N/A" : format(balance))

  return (
    <div className="text-left">
      <div>
            <div className="text-center">Stake WCSPR and earn PICAS</div>

            <div className="mt-6">

            <div className="text-sm mb-8 text-gray-700">
              <div>
                Staked: {balance === undefined ? 'N/A' : format(balance)} <small>WCSPR</small>
                {isLoadingBalance && <span className="text-xs ml-2">loading</span>}
              </div>
              <div>
                Rewards Pending: {rewards === undefined ?  'N/A' : format(rewards)} <small>PICAS</small>
                {isLoadingRewards && <span className="text-xs ml-2">loading</span>}
              </div>
              <div>
                balance: {picas === undefined ?  'N/A' : format(picas)} <small>PICAS</small>
                {isLoadingPicas && <span className="text-xs ml-2">loading</span>}
              </div>
            </div>

            <input className="p-1" placeholder={maxDepositText} type="number" value={stakeAmount} onChange={(e) => {setStakeAmount(parseFloat(e.target.value))}} style={{width: '200px', margin: "10px auto"}} />

              <button className={`ml-2 py-1 px-5 border bg-green-500 text-white capitalize disabled:opacity-50 ${!pk && 'opacity-50'}`} disabled={!pk} onClick={stake}>Stake</button>

            <input className="p-1" placeholder={maxWithdrawText} type="number" value={withdrawAmount} onChange={(e) => {setWithdrawAmount(parseFloat(e.target.value))}} style={{width: '200px', margin: "10px auto"}} />

              <button className={`ml-2 py-1 px-5 border bg-green-500 text-white capitalize disabled:opacity-50 ${!pk && 'opacity-50'}`} disabled={!pk} onClick={withdraw}>Withdraw & Claim All Rewards</button>


              {isProcessing && <div className="mt-2 text text-yellow-400">Processing...</div>}
              {message && <div className="mt-2 text-xs text-yellow-600">{message}</div>}

            </div>

      </div>
    </div>
  )

}
