import { ERC20Client } from "casper-erc20-js-client";
import { constants, helpers, utils } from "casper-js-client-helper";
import { decodeBase16, KeyValue, Signer, RuntimeArgs, CLValueBuilder, CasperClient, DeployUtil } from "casper-js-sdk";


export const signDeploy = async (deploy, publicKey) => {
  const deployJSON = DeployUtil.deployToJson(deploy)
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


  const file = await fetch(pathToContract)
  console.log(file)
  const bytes = await file.arrayBuffer()
  console.log(bytes)
  const contractContent = new Uint8Array(bytes)
  console.log(contractContent)

  // Set contract installation deploy (unsigned).
  let deploy = DeployUtil.makeDeploy(
    new DeployUtil.DeployParams(
      publicKey,
      chainName
    ),
    DeployUtil.ExecutableDeployItem.newModuleBytes(
      contractContent,
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

export const format = (big) => {
  console.log(big)
  if (big && big.div) {
    return big.div(10**9).toNumber() 
  } else {
    return big
  }
}
