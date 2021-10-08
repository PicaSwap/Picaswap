import { ERC20Client } from "casper-erc20-js-client";
import { constants, helpers, utils } from "casper-js-client-helper";
import { Signer, RuntimeArgs, CLValueBuilder, CasperClient, DeployUtil } from "casper-js-sdk";

const {
  fromCLMap,
  toCLMap,
  installContract,
  setClient,
  contractSimpleGetter,
  createRecipientAddress
} = helpers;

const { DEFAULT_TTL } = constants;

const PRE_DEPOSIT_WASM_PATH = 'xxx'

export class WCSPRClient extends ERC20Client {

  async withdraw(publicKey, withdrawAmount, paymentAmount, ttl = DEFAULT_TTL) {
    const runtimeArgs = RuntimeArgs.fromMap({
      cspr_amount: CLValueBuilder.u256(withdrawAmount),
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

  async installPreDepositContract(publicKey, paymentAmount) {
    const runtimeArgs = RuntimeArgs.fromMap({cspr_amount: CLValueBuilder.string("cspr_amount")});

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

  // this one has to be callsed with address of pre-deposit contract
  async deposit(
    publicKey,
    depositAmount,
    paymentAmount,
    ttl = DEFAULT_TTL
  ) {
    const runtimeArgs = RuntimeArgs.fromMap({
      cspr_amount: CLValueBuilder.u256(depositAmount),
    });

    return await this.contractCall({
      entryPoint: "deposit",
      publicKey,
      paymentAmount,
      runtimeArgs,
      cb: deployHash => this.addPendingDeploy("deposit", deployHash),
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

}

export const signDeploy = async (deploy, publicKey) => {
  const deployJSON = DeployUtil.deployToJson(deploy)
  debugger;
  const publicKeyHex = publicKey.toHex();
  const signedDeployJSON = await Signer.sign(deployJSON, publicKeyHex, publicKeyHex);
  const signedDeploy = DeployUtil.deployFromJson(signedDeployJSON).unwrap();
  return signedDeploy
}

export const installWasmFile = async ({
  nodeAddress,
  publicKey,
  chainName,
  pathToContract,
  runtimeArgs,
  paymentAmount,
}) => {
  const client = new CasperClient(nodeAddress);

  // Set contract installation deploy (unsigned).
  let deploy = DeployUtil.makeDeploy(
    new DeployUtil.DeployParams(
      publicKey,
      chainName
    ),
    DeployUtil.ExecutableDeployItem.newModuleBytes(
      utils.getBinary(pathToContract),
      runtimeArgs
    ),
    DeployUtil.standardPayment(paymentAmount)
  );

  // Sign deploy
  deploy = await signDeploy(deploy, publicKey);

  // Dispatch deploy to node
  return await client.putDeploy(deploy);
};


export const contractCallFn = async ({
  nodeAddress,
  publicKey,
  chainName,
  contractHash,
  entryPoint,
  runtimeArgs,
  paymentAmount,
  ttl,
  dependencies = []
}: IContractCallParams) => {
  const client = new CasperClient(nodeAddress);
  const contractHashAsByteArray = utils.contractHashToByteArray(contractHash);

  const dependenciesBytes = dependencies.map((d: string) => Uint8Array.from(Buffer.from(d, "hex")));

  let deploy = DeployUtil.makeDeploy(
    new DeployUtil.DeployParams(publicKey, chainName, 1, ttl, dependenciesBytes),
    DeployUtil.ExecutableDeployItem.newStoredContractByHash(
      contractHashAsByteArray,
      entryPoint,
      runtimeArgs
    ),
    DeployUtil.standardPayment(paymentAmount)
  );

  // Sign deploy.
  deploy = await signDeploy(deploy, publicKey);

  // Dispatch deploy to node.
  return await client.putDeploy(deploy);
};
