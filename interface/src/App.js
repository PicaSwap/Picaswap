import './App.css';
import 'foundation-sites/dist/css/foundation.min.css';


import React, {useState} from "react";
import {
  BrowserRouter as Router,
  Switch,
  Route,
  Link as LinkRouter,
  useRouteMatch,
} from "react-router-dom";

import { Menu, MenuItem, Link, Button, Colors } from 'react-foundation';

function CustomNavLink({ label, to }) {
    let match = useRouteMatch({
      path: to,
      exact: true
    });

  return (
    <MenuItem isActive={!!match}>
      <LinkRouter to={to}>{label}</LinkRouter>
    </MenuItem>
  )
}

export default function App() {
  return (
    <Router>
      <div>
        <br/>
        <div className="align-center flex-container margin-top-1">
          <Menu>
            <CustomNavLink to="/" label="Swap" />
            <CustomNavLink to="/pools" label="Liquidity Pools" />
            <CustomNavLink to="/stake" label="Farm PICAS" />
            <CustomNavLink to="/wcspr" label="WCSPR" />
          </Menu>
        </div>
        <br/>
        <br/>
        <br/>

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
    </Router>
  );
}

function Swap() {
  return (
    <div className="text-center">
      <h2>Swap</h2>
    </div>
  )
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

function Wcspr() {

  const [mode, setMode] = useState("wrap")
  const [amount, setAmount] = useState("wrap")

  return (
    <div className="text-center">
      <div>
            <Link isHollow={mode !== 'wrap'} onClick={()=>setMode("wrap")}>Wrap CSPR</Link>
            <Link isHollow={mode !== 'unwrap'} onClick={()=>setMode("unwrap")}>UnWrap CSPR</Link>

            <input placeholder="Amount" type="number" value={amount} onChange={(e) => {setAmount(parseFloat(e.target.value))}} style={{width: '200px', margin: "10px auto"}} />

            <Button color={Colors.WARNING}>{mode}</Button>
      </div>
    </div>
  )

}
