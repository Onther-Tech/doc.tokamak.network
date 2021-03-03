---
id: how-to-set-candidate
title: How to Set Candidate
sidebar_label: How to Set Candidate
---

The document contains information on how to deploy and set up smart contracts to become candidates for Tokamak DAO Governance.

It must be registered as Candidate to become a member of the Tokamak DAO Governance Committee. Therefore, if you wish to become a member of the Committee, you must register Candidate by means of guidance in that document.

There are two ways to become a Candidate. The first method is to use EOA, and the second method is to use 'Layer2' contract from Tokamak Network.

The guide was performed on Mac OS and Linux 16.04.

## Preparation

## Download source code and Install Package

First of all, `Tokamak DAO Contract` should be downloaded through github and installed with packages.

```bash
$ git clone https://github.com/Onther-Tech/tokamak-dao-contracts.git
$ cd tokamak-dao-contracts
$ git submodule update --init --recursive
$ npm install
```

If the package is installed, you can proceed to the next step.

Truffle is used to compile and distribute contracts. If truffle is not installed, install it through the command below.

```bash
$ npm install -g truffle
```

The versions of Truffle, Node.js, Web3.js used in the script are as follows.

```bash
Truffle v5.1.42 (core: 5.1.42)
Solidity - 0.5.12 (solc-js)
Node v13.8.0
Web3.js v1.2.1
```

### Ethereum Mainnet Access Endpoint

The Ethereum mainnet access endpoint is required to deploy the Candidate contract. Although there are many ways, it is easy to use node addresses provided through 'Infura'. It secures address that can be accessed through 'Infura'.

If you don't have an 'Infura' account, you can get a access endpoint (URL) through [infura.io] (https://infura.io/)) membership.

When joining the site is completed, click `CREATE NEW PROJECT` of `Dashboard` to create a project.

Next, `ENDPOINTS` address that combines `PROJECT ID` is used as below.

`https://mainnet.infura.io/v3/[ProjectID] `

![Infura node ID](assets/guides_create-infura-node.png)
ex) `https://mainnet.infura.io/ws/v3/07b1363d79a94e30af61da848ecfa194`

If you have an Ethereum node that you operate, you can use that node's access address instead of the `Infura` address.

## Create Candidate by using EOA

It is recommended that you check the gas price through [Eth Gas Station](https://ethgasstation.info/) before contract deployment. Check the gas cost and adjust the gas cost in `truffle-config.js`.

```javascript
46  mainnet: {
47    provider: () => new PrivateKeyProvider(process.env.MAINNET_PRIVATE_KEY, process.env.MAINNET_PROVIDER_URL),
48    network_id: 1, // eslint-disable-line camelcase
49    gasPrice: <adjust gas price>,
50    skipDryRun: true,
51  },
```
Now, Candidate can be created when Ethereum private key and Ethereum mainnet access address are ready.

```bash
tokamak-dao-contracts $ bash deploy/deploy.sh <mainnet-provider-url> deploy-candidate <private-key> <candidate-name>
```

<candidate-name> is the name of a Candidate that is entered to make it easier to distinguish it from other Candidate.

## Register Layer2 as Candidate

A second method of registering Candidate is to register the existing Layer2 contract as Candidate. The method is as follows.

```bash
tokamak-dao-contracts $ bash deploy/deploy.sh <mainnet-provider-url> <private-key> register-layer2 <candidate-name> <layer2-contract>
```

To register Layer2 as a Candidate, additional addresses for Layer2 contracts distributed as factors are required.

## Result

Once the entire process is successfully completed, you can access [Tokamak DAO](https://dao.tokamak.network) to check the registered Candidate.