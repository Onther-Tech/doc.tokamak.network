---
id: optimism-build-environment
title: Build Optimism Environment
sidebar_label: Build Optimism Environment
---

This document contains how to make local development environment for Layer2 smart contract.

Since Tokamak optimism layer2 solution has an EVN-compatible smart contract execution environment, it is possible to develop and deploy layer2 smart contracts in almost the same environment as the layer1. Below, you can see how to configure the environment required for layer2 smart contract development.

You can see a very simple [example](https://github.com/Onther-Tech/optimism-example) using Tokamak optimism layer2.

## Layer1/2 Environment

In order to develop smart contracts for layer2, you need services that connect each layer as well as layer1 and layer2. You can use the components using docker like below.

```bash
git clone https://github.com/Onther-Tech/optimism.git
cd optimism
yarn install

cd ops
export COMPOSE_DOCKER_CLI_BUILD=1 # these environment variables significantly speed up build time
export DOCKER_BUILDKIT=1
docker-compose build

docker-compose up -d
```

## package.json

In order to compile solidity code into layer2 smart contract, you need to use optimism's hardhat plugin. You can add it by one of the methods below.

### shell script

```bash
yarn add @eth-optimism/hardhat-ovm
```

### add dependency

```javascript
// package.json

...
"devDependencies": {
  "@eth-optimism/hardhat-ovm": "^0.2.2",
  ...
}
```

## hardhat.config.ts

Register the information about layer2 on the hardhat.config file, and add the following contents so that you can build smart contracts for layer2 according to the network option.

```javascript
// hardhat.config.ts

import '@nomiclabs/hardhat-waffle'
import '@eth-optimism/hardhat-ovm'

...

module.exports = {
  solidity: "0.7.6",
  networks: {
    // Add this network to your config!
    optimism: {
       url: 'http://127.0.0.1:8545',
       accounts: { mnemonic: 'test test test test test test test test test test test junk' },
       gasPrice: 15000000,          
       ovm: true // This sets the network as using the ovm and ensure contract will be compiled against that.
    }
  }
}
```

## Compile smart contract

When compiling with layer2 network option as shown below, smart contracts for layer2 are compiled.

```bash
npx hardhat --network optimism compile
```

## Test smart contract

You can test smart contracts on layer2 by using the compiled smart contracts as above. But before executing test, layer 1/2 environments must be running for the test.

```bash
npx hardhat --network optimism test
```
