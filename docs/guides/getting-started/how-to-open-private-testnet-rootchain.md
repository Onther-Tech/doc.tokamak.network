---
id: how-to-open-private-testnet-rootchain
title: Setup Rootchain in Private Testnet
sidebar_label: Setup Rootchain
---

## Intro

This document contains how to setup layer-2 blockchain based on private blockchain as rootchain.
The rootchain is a basechain of Tokamak network, using layer-2 blockchain based on plasma. For more details refer to ["What is Plasma"](https://docs.tokamak.network/docs/en/learn/basic/tokamak-network#what-is-plasma)

## Setup Local Environment

This Instructions are provided for Linux(Ubuntu 18.04)

If you have to install golang, please follow next instruction to compile plasma-evm.

### System Update and Install Required Packages

Setting compilation environment by running following command.

```shell
~$ sudo apt-get update && sudo apt-get install tar wget make git build-essential -y
```

### Setup Golang Environment

Run following command, go will be installed at `/usr/local/`.


```shell
~$ wget https://dl.google.com/go/go1.13.4.linux-amd64.tar.gz
~$ tar -xvf go1.13.4.linux-amd64.tar.gz
~$ sudo mv go /usr/local
```

Make a directory for GOPATH, set envrionment variables.

```bash
~$ export GOROOT=/usr/local/go
~$ mkdir -p $HOME/plasma
~$ export GOPATH=$HOME/plasma
~$ export PATH=$GOPATH/bin:$GOROOT/bin:$PATH
```

We recommend to register environment variables to `~/.profile` file, in order to keep this setting permanently.

```sh
# ~/.profile
....

export GOROOT=/usr/local/go
export GOPATH=$HOME/plasma
export PATH=$GOPATH/bin:$GOROOT/bin:$PATH
```

## Setup RootChain

We recommend to use `onther-tech/go-ethereum` since it has a script for running rootchain.

Operator and challenger account to be used in root chain must have enough ether balance. Note that operator node will run successfully only when challenger account has <U>at least 0.5 ETH.</U>

If operator account balance is too low, it cannot submit blocks to root chain.

### Downloading Source Code for RootChain

Download `go-ethereum` to be used for rootchain.

```bash
~$ git clone https://github.com/Onther-Tech/go-ethereum
~$ cd go-ethereum
```

This document well tested [4bf7d7e315e19a2b31683935e866ae952b32ab7d](https://github.com/Onther-Tech/go-ethereum/tree/4bf7d7e315e19a2b31683935e866ae952b32ab7d) commit of master branch.

As following command, set same commit hash in the source.

```bash
go-ethereum $ git reset 4f497552092e2d061c8636b58737bc462ba4a3d
```

### Check Script of RootChain

`run.rootchain.sh` in `onther-tech/go-ethereum` is as follows.

```bash
# go-ethereum/run.rootchain.sh
#!/bin/bash
ADDR0="0xb79749F25Ef64F9AC277A4705887101D3311A0F4"
ADDR1="0x5E3230019fEd7aB462e3AC277E7709B9b2716b4F"
ADDR2="0x515B385bDc89bCc29077f2B00a88622883bfb498"
ADDR3="0xC927A0CF2d4a1B59775B5D0A35ec76d099e1FaD4"
ADDR4="0x48aFf0622a866d77651eAaA462Ea77b5F39D0ae1"
ADDR5="0xb715125A08140AEA83588a4b569599cde4a0a336"
ADDR6="0x499De281cd965781F1422b7cB73367C15DC416D2"
ADDR7="0xaA60af9BD19dc7438fd19457955C52982D070D27"
ADDR8="0x37da08b6Cd15c3aE905A25Df57B6841A5D80aC93"
ADDR9="0xec4A610a07e81264e8f7F1CAeAe522fEdD7e59c1"

KEY0="2628ca66087c6bc7f9eff7d70db7413d435e170040e8342e67b3db4e55ce752f"
KEY1="86e60281da515184c825c3f46c7ec490b075af1e74607e2e9a66e3df0fa22122"
KEY2="b77b291fab2b0a9e03b5ee0fb0f1140ff41780e93a39e534d54a05ccfad3eead"
KEY3="54a93b74538a7ab51062c7314ea9838519acae6b4ea3d47a7f367e866010364d"
KEY4="434e494f59f6228481256c0c88a375eef2c57be70e612576f302337f48a4634b"
KEY5="c85ab6a568ce788082664c0c17f86e332793895750455090f30f4578e4d20f9a"
KEY6="83d58f7a18e85b728bf5b00ce92d0d8491ae51a962331c8626e51ac32ba8b5f7"
KEY7="85a7751420007fba52e23eca493ac40c770b63c7a16f27ffec39fa01061bc435"
KEY8="5c148c5ba69b7b5c4e53d222e74e6edbbea72f3744fe2ab770320ae70b8d42c0"
KEY9="65d2ecce5d466cb3f9e0ca9acdf53575047ca71527f7c2ed2ab0de620918b2e7"

# ...

make geth && build/bin/geth \
  --datadir $DATADIR \
  --dev \
  --dev.period $PERIOD \
  --dev.faucetkey $KEY0,$KEY1,$KEY2,$KEY3,$KEY4,$KEY5,$KEY6,$KEY7,$KEY8,$KEY9 \
  --miner.gastarget 100000000 \
  --miner.gasprice "10" \
  --rpc \
  --rpcport $HTTP_PORT  \
  --rpcapi eth,debug,net \
  --ws \
  --wsport $WS_PORT
```

These accounts in above script has roles as follows.

- ADDR0 : TON stake manager, Deployer and Owner of TON sktaing contracts.
- ADDR1 : Operator1, Operator childchain1 and Attendee of TON staking.
- ADDR2 : Operator2, Operator childchain2 and Attendee of TON staking.
- ADDR3 : Challenger, Block validator and Challenger for a childchain.
- ADDR4-9 : Extra accounts for testing.

### Run RootChain

Run `run.rootchain.sh` in `go-ethereum` to start rootchain running on local network.

```bash
go-ethereum$ bash run.rootchain.sh
```

## Setup TON stake contracts

Setup an environment for TON staking test in rootchain which it already setup in previous step.

In this parts for How to using `staking` and `manage-staking` command in `plasma-evm`. these commands are quite useful for developer and Operator.

Let's assume that there are one manager and two operators for this TON staking test on private testnet.

The manager deploys and manages contract for TON staking.

The operators stake and un-stake TON token, and also operate their own plasma chain.

### Downloading Source Code for Plasma-evm

First, download `plasma-evm` repository with the following commands.

```bash
go-ethereum $ cd ~
$ git clone -b v0.0.0-rc7.4 https://github.com/onther-tech/plasma-evm
$ cd plasma-evm
plasma-evm $
```

This document well tested in [v0.0.0-rc7.4 : 3e4a453930aa26c71a0e56167a98aa1a832ac4b0](https://github.com/Onther-Tech/plasma-evm/tree/v0.0.0-rc7.4) commit of master branch.

As following command, make executable binary file `geth` of `Plasma-evm`.

```bash
plasma-evm $ make geth
```

If you successfully compiled, The binary file `geth` will be located in `plasma-evm/build/bin`.

### Generating Accounts for Managers and Operators

Create test accounts.

```bash
plasma-evm $ build/bin/geth --nousb account importKey 2628ca66087c6bc7f9eff7d70db7413d435e170040e8342e67b3db4e55ce752f \
            --datadir ./.pls.staking/manager
```

Press enter twice, to insert empty string password for convinient test.

```bash
INFO [01-01|00:00:00.000] Maximum peer count                       ETH=50 LES=0 total=50
INFO [01-01|00:00:00.000] Set options for submitting a block       mingaspirce=1000000000 maxgasprice=100000000000 resubmit=0s
Your new account is locked with a password. Please give a password. Do not forget this password.
Password:
Repeat password:
Address: {b79749F25Ef64F9AC277A4705887101D3311A0F4}
```

Create accounts for two operators following the command below.

```bash
plasma-evm $ build/bin/geth --nousb account importKey 86e60281da515184c825c3f46c7ec490b075af1e74607e2e9a66e3df0fa22122 \
            --datadir ./.pls.staking/operator1
```

```bash
plasma-evm $ build/bin/geth --nousb account importKey b77b291fab2b0a9e03b5ee0fb0f1140ff41780e93a39e534d54a05ccfad3eead \
            --datadir ./.pls.staking/operator2
```

As following command, create an empty password file as `pwd.pass` for all accounts created.

```bash
plasma-evm $ echo "" > pwd.pass
```

### Deploy TON Stake Manager Contract

Deploy staking related contracts on a running rootchain.

`deployManagers` s is a sub-command of `manage-staking`. It is used by managers for deploying or managing TON staking contracts.

`deployManagers` command requires two input arguments to run, `withdrawalDelay` and `seigPerBlock`.

The description of the input parameters is as follows.

`withdrawalDelay` : Unit is the number of blocks in rootchain. In order to unstake WTON, you need to send a `requestWithdrawal` transaction which will be processed after this number of blocks in rootchain. For example, let's assume that this parameter is set as `10`. If the request withdrawal tx was processed in block `100` in rootchain, the `processRequest` transaction will be executed in block `110` which unstakes WTON.

`seigPerBlock` : The maximum amount of TON seigniorage per block. This parameter affects total inflation of TON token.

```bash
plasma-evm $ make geth && build/bin/geth --nousb manage-staking deployManagers 10 1.5 \
            --datadir ./.pls.staking/manager \
            --rootchain.url ws://127.0.0.1:8546 \
            --unlock 0xb79749F25Ef64F9AC277A4705887101D3311A0F4 \
            --password pwd.pass \
            --rootchain.sender 0xb79749F25Ef64F9AC277A4705887101D3311A0F4
```

The above command will deploy all contracts for staking TON.

```bash
INFO [01-01|00:00:00.000] Maximum peer count                       ETH=50 LES=0 total=50
INFO [01-01|00:00:00.000] Unlocking developer account              address=0x0000000000000000000000000000000000000000
INFO [01-01|00:00:00.000] Operator account is unlocked             address=0xb79749F25Ef64F9AC277A4705887101D3311A0F4
INFO [01-01|00:00:00.000] Set options for submitting a block       mingaspirce=1000000000 maxgasprice=100000000000 resubmit=0s
INFO [01-01|00:00:00.000] Allocated cache and file handles         database=/home/ubuntu/plasma-evm/.pls.staking/manager/geth/stakingdata cache=16.00MiB handles=16
INFO [01-01|00:00:00.000] 1. deploy TON contract
INFO [01-01|00:00:00.000] TON deployed                             addr=0x3A220f351252089D385b29beca14e27F204c296A tx=0f9edc…149995
INFO [01-01|00:00:00.000] 2. deploy WTON contract
INFO [01-01|00:00:00.000] WTON deployed                            addr=0xdB7d6AB1f17c6b31909aE466702703dAEf9269Cf tx=b951fc…ab742c
INFO [01-01|00:00:00.000] 3. deploy RootChainRegistry
INFO [01-01|00:00:00.000] RootChainRegistry deployed               addr=0x537e697c7AB75A26f9ECF0Ce810e3154dFcaaf44 tx=1455b1…8db599
INFO [01-01|00:00:00.000] 4. deploy DepositManager
INFO [01-01|00:00:00.000] DepositManager deployed                  addr=0x880EC53Af800b5Cd051531672EF4fc4De233bD5d tx=34f04d…713bee
INFO [01-01|00:00:00.000] 5. deploy SeigManager
INFO [01-01|00:00:00.000] SeigManager deployed                     addr=0x3Dc2cd8F2E345951508427872d8ac9f635fBe0EC tx=fd415d…bbcb15
INFO [01-01|00:00:00.000] 6. add WTON minter role to SeigManager
INFO [01-01|00:00:00.000] Set WTON minter to SeigManager           tx=4084ca…ec3718
INFO [01-01|00:00:00.000] 7. add TON minter role to WTON
INFO [01-01|00:00:00.000] Set TON minter to WTON                   tx=628885…e96b75
INFO [01-01|00:00:00.000] 8. Setting SeigManager address to target contracts targets="[DepositManager WTON]"
INFO [01-01|00:00:00.000] Set SeigManager to target cotnract       target=DepositManager tx=9435d0…c15c3a
INFO [01-01|00:00:00.000] Set SeigManager to target cotnract       target=WTON           tx=4f26fc…ffacb4
INFO [01-01|00:00:00.000] Staking manager contract deployed        TON=0x3A220f351252089D385b29beca14e27F204c296A WTON=0xdB7d6AB1f17c6b31909aE466702703dAEf9269Cf RootChainRegistry=0x537e697c7AB75A26f9ECF0Ce810e3154dFcaaf44 DepositManager=0x880EC53Af800b5Cd051531672EF4fc4De233bD5d SeigManager=0x3Dc2cd8F2E345951508427872d8ac9f635fBe0EC
```

### Deploy PowerTON Contract

Deploy `PowerTON` contract with the following command.

`deployPowerTON` sub-command is the round time of powerTON. Set to 60 seconds for testing.

The powerTON round time refers to the cycle in which un-issued seigniorage is distributed based on the rules. For example, If it is set to `60s`, an operator who receives un-issued seigniorage of TON is selected every 60 seconds.

More information about powerTon is available [Here]().

```bash
plasma-evm $ build/bin/geth --nousb manage-staking deployPowerTON 60s \
            --datadir ./.pls.staking/manager \
            --rootchain.url ws://127.0.0.1:8546 \
            --unlock 0xb79749F25Ef64F9AC277A4705887101D3311A0F4 \
            --password pwd.pass \
            --rootchain.sender 0xb79749F25Ef64F9AC277A4705887101D3311A0F4
```

### Data of Deployed Contracts

Data of deployed contracts is saved in `.pls.staking/manager` as rawdb through sub-command `deployManager` of `manage-staking` command.

The following command extracts all information about deployed stake contract in rootchain and saves them in `manager.json` file.

```bash
plasam-evm $ build/bin/geth --nousb manage-staking getManagers manager.json --datadir ./.pls.staking/manager

INFO [01-01|00:00:00.000] Maximum peer count                       ETH=50 LES=0 total=50
INFO [01-01|00:00:00.000] Set options for submitting a block       mingaspirce=1000000000 maxgasprice=100000000000 resubmit=0s
INFO [01-01|00:00:00.000] Allocated cache and file handles         database=/home/ubuntu/plasma-evm/.pls.staking/manager/geth/stakingdata ca
che=16.00MiB handles=16
INFO [01-01|00:00:00.000] Exporting manager contracts              path=manager.json
INFO [01-01|00:00:00.000] Exported manager contracts               path=manager.json
{
  "TON": "0x3a220f351252089d385b29beca14e27f204c296a",
  "WTON": "0xdb7d6ab1f17c6b31909ae466702703daef9269cf",
  "DepositManager": "0x880ec53af800b5cd051531672ef4fc4de233bd5d",
  "RootChainRegistry": "0x537e697c7ab75a26f9ecf0ce810e3154dfcaaf44",
  "SeigManager": "0x3dc2cd8f2e345951508427872d8ac9f635fbe0ec",
  "PowerTON": "0xbcdfc870ea0c6463c6ebb2b2217a4b32b93bcfb7"
}
```

A total of six contract addresses, including `powerTON` contract address, is stored in `manager.json`.

## Setting up TON Stake Contracts

### Activating PowerTON

`startPowerTON`, which is a sub-command of `manage-staking`, is used to activate `powerTON`, a rule of distributing un-issued seigniorage of TON.

Send a transaction for activating `powerTON` through the following command.

```bash
plasma-evm $ build/bin/geth --nousb manage-staking startPowerTON \
            --datadir ./.pls.staking/manager \
            --rootchain.url ws://127.0.0.1:8546 \
            --unlock 0xb79749F25Ef64F9AC277A4705887101D3311A0F4 \
            --password pwd.pass \
            --rootchain.sender 0xb79749F25Ef64F9AC277A4705887101D3311A0F4

INFO [01-01|00:00:00.000] Maximum peer count                       ETH=50 LES=0 total=50
INFO [01-01|00:00:00.000] Unlocking developer account              address=0x0000000000000000000000000000000000000000
INFO [01-01|00:00:00.000] Operator account is unlocked             address=0xb79749F25Ef64F9AC277A4705887101D3311A0F4
INFO [01-01|00:00:00.000] Set options for submitting a block       mingaspirce=1000000000 maxgasprice=100000000000 resubmit=0s
INFO [01-01|00:00:00.000] Allocated cache and file handles         database=/home/ubuntu/plasma-evm/.pls.staking/manager/geth/stakingdata cache=16.00MiB handles=16
INFO [01-01|00:00:00.000] PowerTON started                         PowerTON=0xBcDfc870Ea0C6463C6EBb2B2217a4b32B93BCFB7
```

## Next

The process of setup the rootchain is practically the same as setup ethereum based private blockchain.
However, we are not just creating a single private blockchain, but have deployed various smart contracts for setup the layer-2 Tokamak plasma. Let's construct a layer-2 Tokamak plasma which connected the rootchain through following [Setup Childchain](https://docs.tokamak.network/docs/en/guides/getting-started/how-to-open-private-testnet-manually)

<!--## Architecture Diagram ![Architecture after Setup RootChain](assets/guides_private_testnet_rootchain.png)-->
