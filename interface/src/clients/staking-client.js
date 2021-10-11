import { ERC20Client } from "casper-erc20-js-client";
import { constants, helpers, utils } from "casper-js-client-helper";
import { CLAccountHash, CLKey, CLValueParsers, decodeBase16, KeyValue, Signer, RuntimeArgs, CLValueBuilder, CasperClient, DeployUtil } from "casper-js-sdk";

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


export class StakeClient extends ERC20SignerClient {

  async getRewardRate() {
    return await this.queryContract("reward_rate");
  }

  async estimatedRewards(publicKey) {
    // balanceOf(account)*(rewardPerToken()-userRewards[account].userRewardPerTokenPaid)/1e18 + userRewards[account].rewards;
 
    const balance = await this.getBalance(publicKey);
    if (!balance) {
      return 0
      console.log('no staked balance')
    }

    const rewardPerToken = await this.queryContract("reward_per_token_stored");
    console.log('rewardPerToken', rewardPerToken)
    const rewardPerTokenPaid = await this.queryContractDictionary(publicKey, "user_reward_per_token_paid")
    console.log('rewardPerTokenPaid', rewardPerTokenPaid)
    const userRewards = await this.queryContractDictionary(publicKey, "rewards")
    console.log('userRewards', 'userRewards')

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

}
