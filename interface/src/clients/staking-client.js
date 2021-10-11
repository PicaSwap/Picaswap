import { ERC20Client } from "casper-erc20-js-client";
import { constants, helpers, utils } from "casper-js-client-helper";
import { CLAccountHash, CLKey, CLValueParsers, decodeBase16, KeyValue, Signer, RuntimeArgs, CLValueBuilder, CasperClient, DeployUtil } from "casper-js-sdk";

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


export class StakeClient extends ERC20Client {

  async estimatedRewards(publicKey) {
    // balanceOf(account)*(rewardPerToken()-userRewards[account].userRewardPerTokenPaid)/1e18 + userRewards[account].rewards;
 
    let balance
    try {
      balance = await parseInt(this.balanceOf(publicKey));
    } catch (err) {
      // exception when no tokens in user account
      return 0
    }
    const rewardPerToken = await this.queryContract("reward_per_token_stored");
    const rewardPerTokenPaid = await this.queryContractDictionary(publicKey, "user_reward_per_token_paid")
    const userRewards = await this.queryContractDictionary(publicKey, "rewards")

    return userRewards + balance * (rewardPerToken-rewardPerTokenPaid)/10**9
  }

  async stake(publicKey, stakeAmount, paymentAmount, ttl = DEFAULT_TTL) {
    const runtimeArgs = RuntimeArgs.fromMap({
      amount: CLValueBuilder.u256(stakeAmount),
    });

    return await this.contractCall({
      entryPoint: "stake",
      publicKey,
      paymentAmount,
      runtimeArgs,
      cb: deployHash => this.addPendingDeploy("stake", deployHash),
      ttl,
    });
  }

  async withdraw(publicKey, withdrawAmount, paymentAmount, ttl = DEFAULT_TTL) {
    const runtimeArgs = RuntimeArgs.fromMap({
      amount: CLValueBuilder.u256(withdrawAmount),
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

  async setContractHash(hash) {
    const { contractPackageHash, namedKeys } = await setClient(
      this.nodeAddress,
      hash,
      [
        "balances",
        "rewards",
        "user_reward_per_token_paid",
      ]
    );
    this.contractHash = hash;
    this.contractPackageHash = contractPackageHash;
    this.namedKeys = namedKeys;
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
