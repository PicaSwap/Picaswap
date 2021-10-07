import React, { useState, useEffect } from "react";

export function Swap() {

  const [mode, setMode] = useState("wrap")
  const [balance, setBalance] = useState(undefined)
  const [amount, setAmount] = useState("wrap")

  async function swap(){
  }

  return (
    <div className="text-center">
      <h4>Swap</h4>
      <div>
            <div>Balance: {balance !== undefined ? balance : 'N/A'}</div>
            <input placeholder="Amount" type="number" value={amount} onChange={(e) => {setAmount(parseFloat(e.target.value))}} style={{width: '200px', margin: "10px auto"}} />

            <button onClick={swap}>{mode}</button>
      </div>
    </div>
  )

}
