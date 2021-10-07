import React, { useState, useEffect } from "react";

import { Menu, MenuItem, Link, Button, Colors } from 'react-foundation';

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

/*
const contractDictionaryGetter = async (nodeAddress, dictionaryItemKey, seedUref) => {
  const stateRootHash = await getStateRootHash(nodeAddress);

  const client = new CasperServiceByJsonRPC(nodeAddress);

  const storedValue = await client.getDictionaryItemByURef(
    stateRootHash,
    dictionaryItemKey,
    seedUref
  );

  if (storedValue && storedValue.CLValue instanceof CLValue) {
    return storedValue.CLValue!.value();
  } else {
    throw Error("Invalid stored value");
  }
};

*/
async function getBalanceOf(account) {
  return 0
  /*
  const key = new CLKey(new CLAccountHash(account.toAccountHash()));
  const keyBytes = CLValueParsers.toBytes(key).unwrap();
  const itemKey = Buffer.from(keyBytes).toString("base64");
  const result = await utils.contractDictionaryGetter(
    this.nodeAddress,
    itemKey,
    this.namedKeys!.balances
  );
  return result.toString();
*/
}

async function getActivePublicKey() {
  let pk = await Signer.getActivePublicKey().catch(
    (err) => {
      alert("Please install Signer, make sure the site is connected, there is an active key, and signer is unlocked")
      Signer.sendConnectionRequest()
    }
  );
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
      if (pk) {
        await getBalanceOf(pk)
      }

    }
    
  }, [mode])

  return (
    <div className="text-center">
      <div>
            <Link isHollow={mode !== 'wrap'} onClick={()=>setMode("wrap")}>Wrap CSPR</Link>
            <Link isHollow={mode !== 'unwrap'} onClick={()=>setMode("unwrap")}>UnWrap CSPR</Link>

            <div>Balance: {balance ? balance : 'N/A'}</div>
            <input placeholder="Amount" type="number" value={amount} onChange={(e) => {setAmount(parseFloat(e.target.value))}} style={{width: '200px', margin: "10px auto"}} />

            <Button onClick={swap} color={Colors.WARNING}>{mode}</Button>
      </div>
    </div>
  )

}
