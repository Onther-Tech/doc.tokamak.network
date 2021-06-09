---
id: how-to-deploy-uniswapv2-to-optimism
title: How to deploy Uniswap V2 to Optimistic Rollup
sidebar_label: Deploy Uniswap V2 to Optimistic Rollup
---

This document contains the process of deploying Smart Contracts to Tokamak Optimistic Rollup. The test was conducted on Mac OS and the Tokamak Optimism Testnet uses Rinkeby.

## Porting Process

There are three major modifications required to make existing solidity projects work on OVMs.

1. `Tooling updates`: OVM is currently operating on Waffle V3. If you are using an older version of Waffle, you need to upgrade it to V3, and if you are using a different framework, you need to migrate.
2. `Test suite updates`: In addition to updates to the tool, some test codes must be modified to account for differences between EVM and OVM, and must support execution on local OVM nodes.
3. `Contract and compiler modification`: Due to differences between EVM and OVM, it may be necessary to change the solidity contract or compiler settings.

Detailed procedures for the above tasks can be found in the [Onther blog](https://medium.com/onther-tech/porting-solidity-contracts-to-optimism-a-guide-using-uniswap-v2-29b85be668d1).

## Set Contract and service

## Download source code and Install Package

Copy the source code, install the packages, and compile the contract using the command below.

```bash
$ git clone https://github.com/Onther-Tech/Uniswap-v2-core-optimism.git
$ cd Uniswap-v2-core-optimism && yarn && yarn compile:ovm
```

If the package is installed, you can proceed to the next step.

```javascript
const ethers = require('ethers')
const { getContractFactory } = require('@eth-optimism/contracts')

const factory = (name, ovm = false) => {
  const artifact = require(`./build/${name}.json`)
  return new ethers.ContractFactory(artifact.abi, artifact.bytecode)
}

// const factory__L2_UniswapV2ERC20 = factory('UniswapV2ERC20', true)
const factory__L2_UniswapV2Factory = factory('UniswapV2Factory', true)
const factory__L2_UniswapV2Pair = factory('UniswapV2Pair', true)

async function main() {
  // L2 messenger address is always the same.
  const l2MessengerAddress = '0x4200000000000000000000000000000000000007'
  const l2RpcProvider = new ethers.providers.JsonRpcProvider('https://testnet1.optimism.tokamak.network')

  const key = '<private key>'
  const l2Wallet = new ethers.Wallet(key, l2RpcProvider)

  console.log('Deploying L2 UniswapV2Factory...')
  const L2_UniswapV2Factory = await factory__L2_UniswapV2Factory.connect(l2Wallet).deploy(
    l2MessengerAddress,
  )
  const l2FactoryHash = await L2_UniswapV2Factory.deployTransaction.wait()
  console.log('L2UniswapV2Factory Contract address: ', l2FactoryHash.contractAddress);

  console.log('Deploying L2 UniswapV2Pair...')
  const L2_UniswapV2Pair = await factory__L2_UniswapV2Pair.connect(l2Wallet).deploy(
  )
  const l2PairHash = await L2_UniswapV2Pair.deployTransaction.wait();
  console.log('L2UniswapV2Pair Contract address: ', l2PairHash.contractAddress);
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error)
    process.exit(1)
  })
```

Enter the account's private key for deployment in `<private key>` and run the deployment script using the following command:

```bash
$ node deploy_script.js
```

When the deployment is terminated normally, the following results can be confirmed.

```
Deploying L2 UniswapV2Factory...
L2UniswapV2Factory Contract address: 0x70e0bA845a1A0F2DA3359C97E0285013525FFC49
Deploying L2 UniswapV2Pair...
L2UniswapV2Pair Contract address: 0x4826533B4897376654Bb4d4AD88B7faFD0C98528
```

