import React, { useState, useEffect } from "react";

export function Swap() {

  const [tokenFrom, setTokenFrom] = useState(undefined)
  const [tokenTo, setTokenTo] = useState(undefined)

  const [mode, setMode] = useState("wrap")
  const [balance, setBalance] = useState(undefined)
  const [amount, setAmount] = useState("wrap")

  const coins = [
    {name: "WCSPR", contract: "xxx"},
    {name: "PICAS", contract: "zzz"},
  ]

  async function swap(){
  }

  return (
    <div className="text-center">
      <h4>Swap</h4>
      <div className="mt-5">
        <div className="flex justify-end mr-12">
           From: 
           <select className="px-4 mx-2 w-36 h-10" onChange={(e)=>{setTokenFrom(e.target.value)}} value={tokenFrom}>
              <option value={undefined}>Select</option>
              {coins.filter(item => item.contract && item.contract != tokenTo).map(token => <option value={token.contract}>{token.name}</option>)} 
           </select>
          <div className="inline-block">
            <input type="number" placeholder="amount" className="p-2" />
            <div className="text-right">
            <span className="text-xs">balance: N/A</span>
            </div>
          </div>
        </div>

        <div className="flex justify-end mr-12 mt-8">
           To: 
           <select className="px-4 mx-2 w-36 h-10" onChange={(e)=>{setTokenTo(e.target.value)}} value={tokenTo}>
              <option value={undefined}>Select</option>
              {coins.filter(item => item.contract && item.contract != tokenFrom).map(token => <option value={token.contract}>{token.name}</option>)} 
           </select>
          <div className="inline-block">
            <input type="number" placeholder="amount" className="p-2" />
            <div className="text-right">
            <span className="text-xs">balance: N/A</span>
            </div>
          </div>
        </div>

        <button className="mt-10 ml-2 py-2 px-10 border bg-green-500 text-white" onClick={swap}>Swap</button>
      </div>
    </div>
  )

}
