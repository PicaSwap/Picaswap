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
  decodeBase16,
} from "casper-js-sdk";

import { ERC20SignerClient } from "./clients/erc20signer-client";
import { WCSPRClient } from "./clients/wcspr-client";
import { StakeClient } from "./clients/staking-client";
import { utils, helpers} from "casper-js-client-helper";
import { BigNumber } from '@ethersproject/bignumber';

import { PICAS_CONTRACT_HASH, WCSPR_CONTRACT_HASH, STAKE_CONTRACT_HASH, NODE_ADDRESS, CHAIN_NAME } from './constants.js'
import { format } from './clients/utils'


async function approvePicas(clPK, amount) {
  const erc20 = new ERC20SignerClient(
    NODE_ADDRESS,
    CHAIN_NAME,
    undefined
  );
  const contractHash = "hash-05c4704c3ec15d7c1e71f9e12755babd24cbc1d5141a471e2ae19f269c781cbb"
  await erc20.setContractHash(contractHash.slice(5));
  const contract_hash = WCSPR_CONTRACT_HASH.slice(5);
  const spender = CLValueBuilder.byteArray(decodeBase16(contract_hash))
  await erc20.approve(clPK, amount, spender, 10**9)
}

async function getPicasBalance(pk) {
  const erc20 = new ERC20SignerClient(
    NODE_ADDRESS,
    CHAIN_NAME,
    undefined
  );
  const contractHash = PICAS_CONTRACT_HASH
  await erc20.setContractHash(contractHash.slice(5));
  const clPK = CLPublicKey.fromHex(pk);
  return await erc20.getBalance(clPK)
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
  return await erc20.getBalance(clPK);
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
    const clPK = CLPublicKey.fromHex(pk);

    // ask for approval first
    await approvePicas(clPK, stakeAmount*10**9, 10**9)

    const client = await initClient()
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
        setLoadingPicas(true)
        setLoadingPicas(true)

        setWCSPRBalance(await getWCSPRBalance(pk))
        setLoadingWCSPRBalance(false)

        setPicas(await getPicasBalance(pk))
        setLoadingPicas(false)

        const client = await initClient()

        setLoadingBalance(true)
        const balance = await client.getBalance(CLPublicKey.fromHex(pk))
        setBalance(balance)
        setLoadingBalance(false)
        console.log('balance', balance)

        setLoadingRewards(true)
        const rewards = await client.estimatedRewards(CLPublicKey.fromHex(pk))
        setRewards(rewards)
        setLoadingRewards(false)
        console.log('rewards', rewards)
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
