import { ERC20Client } from "casper-erc20-js-client";
import { constants, helpers, utils } from "casper-js-client-helper";
import { decodeBase16, KeyValue, Signer, RuntimeArgs, CLValueBuilder, CasperClient, DeployUtil } from "casper-js-sdk";

import { installWasmFile, contractCallFn, signDeploy } from './utils'

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

export class WCSPRClient extends ERC20Client {

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

  async contractCall({
    publicKey,
    paymentAmount,
    entryPoint,
    runtimeArgs,
    cb,
    ttl = DEFAULT_TTL,
    dependencies = []
  }) {
    const deployHash = await contractCallFn({
      chainName: this.chainName,
      contractHash: this.contractHash,
      entryPoint,
      paymentAmount,
      nodeAddress: this.nodeAddress,
      publicKey,
      runtimeArgs,
      ttl,
      dependencies
    });

    if (deployHash !== null) {
      cb && cb(deployHash);
      return deployHash;
    } else {
      throw Error("Invalid Deploy");
    }
  }

}