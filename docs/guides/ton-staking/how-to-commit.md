---
id: how-to-commit
title: Commit to Rootchain
sidebar_label: How to Commit
---

This document contains the process of operating an operator by using `Staking-script`.

This script provide `commit`, `stake`, `unstake`, `restake`, `withdrawal` function.

> In order to carry out this process, you must own an operator in the process of staking.

## Prepare Script

### Source Code Download & Package Installation

Use the command below to clone the source code and install the packages.


```bash
$ git clone https://github.com/Onther-Tech/staking-script.git
$ cd staking-script && npm install
```

After you have finished installing the package, you can now proceed to the next step.

## Modify Contract Address
> This document will explain based on Rinkeby. If you want to proceed on the Mainnet, you can set the network as the mainnet.

Commit requires the address of the contract distributed by the operator.
Use the command below to modify the `config.js` file.

```bash
$ vi config.js
```
The contents of `config.js` are as follows.

```javascript
const config = {
  'mainnet': {
    'network': '1',
    'contractAddress': {
      'rootchain': '',
      'managers': {
        'DepositManager': '',
        'TON': '',
        'WTON': '',
      },
    },
  },
  'rinkeby': {
    'network': '4',
    'contractAddress': {
      'rootchain': '0xfe40ecbd972675d3d6766d94d04373bf9d8896b6',
      'managers': {
        "TON":"0x3e136394a481f8c9595d63a1fa70d25c7f388c2c",
        "WTON":"0x36bba598ca0b329eb4162ba011086d09111b4702",
        "DepositManager":"0x95ff08f500ecb391778a3096ec767bdb18e17cf6",
        "RootChainRegistry":"0x8dc9d372ebd9ed0d8f991226eaaf331ad11dbb4d",
        "SeigManager":"0x32ccc91e3dd884090a580f45172c62393bd858c5",
        "PowerTON":"0x4cc9b4cf3a4a6f8e7cadf8fcd442873c3f71ab73"
      },
    },
  },
};

exports.getConfig = function () {
  
  return config.rinkeby;
}
```

Where each contract's address must be changed to match the address distributed by the operator concerned. Although it is explained based on `rinkeby`, if you want to use mainnet, you need to change `config.rinkeby` to `config.mainnet`.

## Change Private Key

The next step is enter the operator's private key.

```bash
$ vi app.js
```

Near line 54 in `app.js` is as follows.

```javascript
53  const logger = Logger(verbose);
54  const privatekey = "<insert private key>";
55  const { web3, from } = loadWeb3FromMnemonic(providerUrl, privatekey);
```

From here, you can change the value of the 54th line 'confident key' to the operator's private key.

## Prepare Infura

Use your own infura URL which you got from ["Requirements for Connecting Public Testnet - Get Endpoint URL of `RootChain` Node"](how-to-connect-public-testnet-prepare#get-endpoint-url-of-rootchain-node) for `~ root chain JSONRPC?`.

## How to use it
You are now ready to use that script. This can be done by entering the following form.
```bash
$ node app.js --provider-url https://rinkeby.infura.io/v3/*** -k <privateKey> -f <function name> -p <parameter>
```

### Parameters
The following parameters are provided by the `staking-script`.

```
-f, --function-name [value], required. function to call
-i, --network-id [value], required for infura. ethereum network id. 1 for mainsale, 3 for rinkeby.
-p, --parameters [value]>, `arguments for function split by comma. default ${ defaultParameters }`, parseParams
-l, --provider-url [url], `web3 provider url. default ${ defaultProviderUrl }`
-L, --gas-limit [value], `gas limit for transaction. default ${ defaultGasLimit }`
-P, --gas-price [value], `gas price for transaction. default ${ defaultGasPrice }`
-N, --nonce [value], `nonce for transaction. default ${ defaultNonce }`
-v, --verbose, show debug logging
-k, --pk [value], required. transaction sender.
```

And, here are default parameters.
```javascript
const defaultParameters = [];
const defaultProviderUrl = "http://localhost:8545";
const defaultWeiAmount = 0;
const defaultGasLimit = 4500000;
const defaultGasPrice = 20e9;
const defaultNonce = null;
```

The functions supported by 'Staking-script' are as follows.
### Commit
```
node app.js --provider-url https://rinkeby.infura.io/v3/*** -k <privateKey> -f commit
```
### Stake
stake 1 TON

If you want to stake 1 TON, insert 1e18 as a parameter.
```
node app.js --provider-url https://rinkeby.infura.io/v3/*** -k <privateKey> -f approveAndCall -p 1000000000000000000
```

### Unstake
Unstake 1 TON

> unstake uses ray as a unit of token, so if you want unstake 1 TON, You have to insert 1e27 instead 1e18 as a parameter.
```
node app.js --provider-url https://rinkeby.infura.io/v3/*** -k <privateKey> -f requestWithdrawal -p 1000000000000000000000000000
```

### Restake
When you want to restake the token, use this method.
```
node app.js --provider-url https://rinkeby.infura.io/v3/*** -k <privateKey> -f redepositMulti
```

### Withdrawal
When you want to withdraw token, use this method.
```
node app.js --provider-url https://rinkeby.infura.io/v3/*** -k <privateKey> -f processRequests
```

When the commit is successfully completed, the following logs will be output:

```text
{"tx":"0xca6b29f1f64239c0072ecd2db3bbcedef58259bc2694de8e1a75e9fec501ade0","receipt":{"blockHash":"0xbe2c1990f5efee0f18c56f16a32d375f01ca016d8acb1b2c40f5dbf6532dc815","blockNumber":6871009,"contractAddress":null,"cumulativeGasUsed":705612,"from":"0xf30eadcdc68f9551fe943a685c23fa07fde4b417","gasUsed":396475,
...
```
