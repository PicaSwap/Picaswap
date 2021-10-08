import { ERC20Client } from "casper-erc20-js-client";
import { constants, helpers } from "casper-js-client-helper";
import { RuntimeArgs } from "casper-js-sdk";

const {
  fromCLMap,
  toCLMap,
  installContract,
  setClient,
  contractSimpleGetter,
  contractCallFn,
  createRecipientAddress
} = helpers;

const { DEFAULT_TTL } = constants;

const PRE_DEPOSIT_WASM_PATH = 'xxx'

export class WCSPRClient extends ERC20Client {

  async function withdraw(
    keys,
    withdrawAmount,
    paymentAmount
    ttl = DEFAULT_TTL
  ) {
    const runtimeArgs = RuntimeArgs.fromMap({
      cspr_amount: CLValueBuilder.u256(withdrawAmount),
    });

    return await this.contractCall({
      entryPoint: "withdraw",
      keys,
      paymentAmount,
      runtimeArgs,
      cb: deployHash => this.addPendingDeploy("withdraw", deployHash),
      ttl,
    });
  }

  async function installPreDepositContract(keys, paymentAmount) {
    const runtimeArgs = RuntimeArgs.fromMap({});

    return await installContract(
      this.chainName,
      this.nodeAddress,
      keys,
      runtimeArgs,
      paymentAmount,
      PRE_DEPOSIT_WASM_PATH
    ); 
  }

  // this one has to be callsed with address of pre-deposit contract
  async function deposit(
    keys,
    depositAmount,
    paymentAmount
    ttl = DEFAULT_TTL
  ) {
    const runtimeArgs = RuntimeArgs.fromMap({
      cspr_amount: CLValueBuilder.u256(withdrawAmount),
    });

    return await this.contractCall({
      entryPoint: "deposit",
      keys,
      paymentAmount,
      runtimeArgs,
      cb: deployHash => this.addPendingDeploy("deposit", deployHash),
      ttl,
    });
  }

}
