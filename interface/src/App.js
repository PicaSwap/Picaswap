import './index.css';
import './App.css';


import React, { useState, useEffect } from "react";
import {
  BrowserRouter as Router,
  Switch,
  Route,
  Link as LinkRouter,
  useRouteMatch,
} from "react-router-dom";

import {
  Signer,
} from "casper-js-sdk";


import { Wcspr } from './Wcspr.js'
import { Swap } from './Swap.js'


function CustomNavLink({ label, to }) {
    let match = useRouteMatch({
      path: to,
      exact: true
    });

  const activeClass = "mx-2 text-sm inline-block border border-gray-300 rounded py-1 px-3 bg-blue-500 text-white"
  const normalClass = "mx-2 text-sm inline-block border border-gray rounded hover:border-gray-200 text-blue-500 hover:bg-gray-200 py-1 px-3"

  return (
    <LinkRouter to={to}>
      <li className={!!match ? activeClass : normalClass}>
        {label}
      </li>
    </LinkRouter>
  )
}

export default function App() {

  const [pk, setPk] = useState(undefined)

  async function getActivePublicKey() {
    let pk = await Signer.getActivePublicKey().catch(
      (err) => {
        alert("Please install Signer, make sure the site is connected, there is an active key, and signer is unlocked")
        Signer.sendConnectionRequest()
      }
    );
    if (pk) setPk(pk)
  }

  return (
    <Router>
    <div className="bg-blue-100 min-h-screen">
      <div className="container mx-auto">
        <div className="flex justify-between">
          <h1 className="text-xxl p-5">PicaSwap.io - DEX for Casper</h1>
          <button onClick={getActivePublicKey} className="m-5 underline text-blue-500 text-sm">{pk ? "Connected" : "Connect Wallet"}</button>
        </div>

        <div className="filter drop-shadow-lg bg-gray-100 py-1 mt-10 rounded-lg m-auto" style={{width: "32rem"}}>
          <div className="flex justify-center m-2">
            <ul className="flex">
              <CustomNavLink to="/" label="Swap" />
              <CustomNavLink to="/pools" label="Liquidity Pools" />
              <CustomNavLink to="/stake" label="Farm PICAS" />
              <CustomNavLink to="/wcspr" label="WCSPR" />
            </ul>
          </div>
        </div>
        <div className="filter drop-shadow-lg bg-gray-100 p-5 mt-10 rounded-lg m-auto" style={{width: "32rem", minHeight: "22rem"}}>

          <Switch>
            <Route exact path="/">
              <Swap/>
            </Route>
            <Route path="/pools">
              <Pools/>
            </Route>
            <Route path="/wcspr">
              <Wcspr/>
            </Route>
          </Switch>

        </div>
      </div>
    </div>
    </Router>
  );
}



function Pools() {
  return (
    <div className="text-center">
      <h2>Pools</h2>
    </div>
  )

}

function Stake() {
  return (
    <div className="text-center">
      <h2>Stake</h2>
    </div>
  )

}
