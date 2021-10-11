import { ERC20Client } from "casper-erc20-js-client";
import { constants, helpers, utils } from "casper-js-client-helper";
import { decodeBase16, KeyValue, Signer, RuntimeArgs, CLValueBuilder, CasperClient, DeployUtil } from "casper-js-sdk";

import { installWasmFile, contractCallFn, signDeploy } from './utils'
import { ERC20SignerClient } from './erc20signer-client'

const {
  fromCLMap,
  toCLMap,
  installContract,
  setClient,
  contractSimpleGetter,
  createRecipientAddress
} = helpers;

const { DEFAULT_TTL } = constants;

const PRE_DEPOSIT_WASM_PATH = './pre_deposit.wasm'

export class WCSPRClient extends ERC20SignerClient {

  async withdraw(publicKey, withdrawAmount, paymentAmount, ttl = DEFAULT_TTL) {
    const runtimeArgs = RuntimeArgs.fromMap({
      cspr_amount: CLValueBuilder.u512(withdrawAmount),
    });

    return await this.contractCall({
      entryPoint: "withdraw",
      publicKey,
      paymentAmount,
      runtimeArgs,
      cb: deployHash => this.addPendingDeploy("withdraw", deployHash),
      ttl,
    });
  }

  async deposit(publicKey, wcsprContractHash, depositAmount, paymentAmount) {
    const runtimeArgs = RuntimeArgs.fromMap({
      cspr_amount: CLValueBuilder.u512(depositAmount),
      wcspr_contract_hash_key: CLValueBuilder.key(CLValueBuilder.byteArray(decodeBase16(wcsprContractHash)))
    });

    const deployHash = await installWasmFile({
      chainName: this.chainName,
      paymentAmount,
      nodeAddress: this.nodeAddress,
      publicKey,
      pathToContract: PRE_DEPOSIT_WASM_PATH,
      runtimeArgs,
    });
    return deployHash;
  }
}
