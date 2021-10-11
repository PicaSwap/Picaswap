import { ERC20Client, ERC20Events } from "casper-erc20-js-client";
import { constants, utils, helpers } from "casper-js-client-helper";
import { CLAccountHash, CLKey, CLValueParsers, decodeBase16, KeyValue, Signer, RuntimeArgs, CLValueBuilder, CasperClient, DeployUtil } from "casper-js-sdk";
import { BigNumber } from '@ethersproject/bignumber';

import { contractCallFn, signDeploy } from './utils'

const { DEFAULT_TTL } = constants;
const { createRecipientAddress, contractSimpleGetter } = helpers;

export class ERC20SignerClient extends ERC20Client {

  async getBalance(publicKey) {
    let balance
    try {
      balance = await parseInt(this.balanceOf(publicKey));
    } catch (err) {
      // exception when no tokens in user account
      return 0
    }
    return balance ? BigNumber.from(balance) : 0
  }

  async approve(publicKey, approveAmount, spender, paymentAmount, ttl = DEFAULT_TTL) {
    const runtimeArgs = RuntimeArgs.fromMap({
      spender: createRecipientAddress(spender),
      amount: CLValueBuilder.u256(approveAmount),
    });

    return await this.contractCall({
      entryPoint: "approve",
      publicKey,
      paymentAmount,
      runtimeArgs,
      cb: deployHash => this.addPendingDeploy(ERC20Events.Approve, deployHash),
      ttl,
    });
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

  async queryContract(key) {
     return await contractSimpleGetter(
      this.nodeAddress,
      this.contractHash,
      [key]
    );
  }

  async queryContractDictionary(publicKey, namedKey) {
    const key = new CLKey(new CLAccountHash(publicKey.toAccountHash()));
    const keyBytes = CLValueParsers.toBytes(key).unwrap();
    const itemKey = Buffer.from(keyBytes).toString("base64");
    const result = await utils.contractDictionaryGetter(
      this.nodeAddress,
      itemKey,
      this.namedKeys[namedKey]
    );
    return result.toString();
  }

}
