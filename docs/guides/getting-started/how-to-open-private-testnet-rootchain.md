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

### Download Source Code of RootChain

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
ADDR0="0x71562b71999873DB5b286dF957af199Ec94617F7";
ADDR1="0x3cd9f729c8d882b851f8c70fb36d22b391a288cd";
ADDR2="0x57ab89f4eabdffce316809d790d5c93a49908510";
ADDR3="0x6c278df36922fea54cf6f65f725267e271f60dd9";

KEY0="b71c71a67e1177ad4e901695e1b4b9ee17ae16c6668d313eac2f96dbcda3f291";
KEY1="bfaa65473b85b3c33b2f5ddb511f0f4ef8459213ada2920765aaac25b4fe38c5";
KEY2="067394195895a82e685b000e592f771f7899d77e87cc8c79110e53a2f0b0b8fc";
KEY3="ae03e057a5b117295db86079ba4c8505df6074cdc54eec62f2050e677e5d4e66";

make geth && build/bin/geth \
  --dev \
  --dev.period 1 \
  --dev.faucetkey "$KEY0,$KEY1,$KEY2,$KEY3" \
  --rpc \
  --rpcport 8545 \
  --rpcapi eth,debug,net \
  --rpcaddr 0.0.0.0 \
  --ws \
  --wsport 8546 \
  --wsaddr 0.0.0.0 \
  --wsapi eth,debug,net \
  --miner.gastarget 7500000 \
  --miner.gasprice "10"
```

These accounts in above script has roles as follows.

- ADDR0 : TON stake manager, Deployer and Owner of TON sktaing contracts.
- ADDR1 : Operator1, Operator childchain1 and Attendee of TON staking.
- ADDR2 : Operator2, Operator childchain2 and Attendee of TON staking.
- ADDR3 : Challenger, Block validator and Challenger for a childchain.

### Run RootChain

Run `run.rootchain.sh` in `go-ethereum` to start rootchain running on local network.

```bash
go-ethereum$ bash run.rootchain.sh
```

## Setup TON stake contracts

Setup an environment for TON staking test in rootchain which it already setup in previous step.

In this parts for How to using `staking` and `manage-staking` command in `plasma-evm`. these commands are quite useful for developer and Operator.

Let assume that one manager and two operators for staking in TON staking private testnet.

The manager deploy and manage contracts for TON staking.

The operators stakes and un-stakes TON token, also they are oprating their own plasma chain.

### Download Repository and Compile

First of all, Download `plasma-evm` repository with following below commands.

```bash
go-ethereum $ cd ~
$ git clone -b v0.0.0-rc6.0 https://github.com/onther-tech/plasma-evm
$ cd plasma-evm
plasma-evm $
```

This document well tested in [v0.0.0-rc6.0 : 16e9e0310fa180a360a870dac88e1c098489826b](https://github.com/Onther-Tech/plasma-evm/tree/16e9e0310fa180a360a870dac88e1c098489826b) commit of master branch.

As following command, make executable binary file `geth` of `Plasma-evm`.

```bash
plasma-evm $ make geth
```

If you successfully compiled, The binary file `geth` will be located in `plasma-evm/build/bin`.

### Generate accounts for Manager and Operators

Create accounts for test.

```bash
plasma-evm $ build/bin/geth --nousb account importKey b71c71a67e1177ad4e901695e1b4b9ee17ae16c6668d313eac2f96dbcda3f291 \
            --datadir ./.pls.staking/manager
```

Press enter twice, to insert empty string password for convinient test.

```bash
INFO [01-01|00:00:00.000] Maximum peer count                       ETH=50 LES=0 total=50
INFO [01-01|00:00:00.000] Set options for submitting a block       mingaspirce=1000000000 maxgasprice=100000000000 resubmit=0s
Your new account is locked with a password. Please give a password. Do not forget this password.
Password:
Repeat password:
Address: {71562b71999873db5b286df957af199ec94617f7}
```

As following command, create accounts for two operators.

```bash
plasma-evm $ build/bin/geth --nousb account importKey bfaa65473b85b3c33b2f5ddb511f0f4ef8459213ada2920765aaac25b4fe38c5 \
            --datadir ./.pls.staking/operator1
```

```bash
plasma-evm $ build/bin/geth --nousb account importKey 067394195895a82e685b000e592f771f7899d77e87cc8c79110e53a2f0b0b8fc \
            --datadir ./.pls.staking/operator2
```

As following below command, create empty password file as `pwd.pass` for all accounts we created.

```bash
plasma-evm $ echo "" > pwd.pass
```

### Deploy TON Stake manager contract

`deployManagers` sub-command is in `manage-staking`, It is for deploying or management about contracts of TON staking by manager, not operator.

`deployManagers` command required two input arguments, `withdrawalDelay` and `seigPerBlock`, to run.

The description of the input parameters is as follows.

`withdrawalDelay` : Unit is the number of blocks in rootchain. Send `requestWithdrawal` transaction in order to convert staked WTON to un-staked WTON then it can be processed after this number of blocks in rootchain. For example, Let assume that this parameter set as `10`. If the request withdrawal tx processed in 100 block in rootchain, It can be valid `processRequest` transaction for this request after 110 block in rootchain.

`seigPerBlock` : The amount of maximum seigniorage of TON per block. This parameter is effect to total inflation of TON token.

```bash
plasma-evm $ make geth && build/bin/geth --nousb manage-staking deployManagers 10 1.5 \
            --datadir ./.pls.staking/manager \
            --rootchain.url ws://127.0.0.1:8546 \
            --unlock 0x71562b71999873DB5b286dF957af199Ec94617F7 \
            --password pwd.pass \
            --rootchain.sender 0x71562b71999873DB5b286dF957af199Ec94617F7
```

As following above command, All contracts for TON stake will be deployed.

```bash
INFO [01-01|00:00:00.000] Maximum peer count                       ETH=50 LES=0 total=50
INFO [01-01|00:00:00.000] Unlocking developer account              address=0x0000000000000000000000000000000000000000
INFO [01-01|00:00:00.000] Operator account is unlocked             address=0x71562b71999873DB5b286dF957af199Ec94617F7
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

### Deploy PowerTON contract

Deploy `PowerTON` contract with the following command.

An input argument of `deployPowerTON` sub-command is powerton round time. Set it 60 seconds for testing.

The powerton round time refers to a cycle in which un-issued seigniorage distributed as powerton rule. For example, If it set `60s`, an operator who receives un-issued seigniorage of TON is selected every 60 seconds.

More information about `PowerTon` in [Here]().

```bash
plasma-evm $ build/bin/geth --nousb manage-staking deployPowerTON 60s \
            --datadir ./.pls.staking/manager \
            --rootchain.url ws://127.0.0.1:8546 \
            --unlock 0x71562b71999873DB5b286dF957af199Ec94617F7 \
            --password pwd.pass \
            --rootchain.sender 0x71562b71999873DB5b286dF957af199Ec94617F7
```

### Information of deployed contracts

The information of deployed contracts with sub-command `deployManager` of `manage-staking` command is saved in `.pls.staking/manager` as rawdb.

As following command, Extract all information about deployed stake contract in rootchain then save in `manager.json` file.

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

Total 6 contract addresses, include `PowerTON` contract address, are stored in `manager.json`.

## Setup TON Stake

### Activate PowerTON

Use `startPowerTON`, a sub-command of `manage-staking`, to activate `PowerTON` which has the rule of un-issued seigniorage of TON.

As following command, Send transaction for activating `PowerTON`.

```bash
plasma-evm $ build/bin/geth --nousb manage-staking startPowerTON \
            --datadir ./.pls.staking/manager \
            --rootchain.url ws://127.0.0.1:8546 \
            --unlock 0x71562b71999873DB5b286dF957af199Ec94617F7 \
            --password pwd.pass \
            --rootchain.sender 0x71562b71999873DB5b286dF957af199Ec94617F7

INFO [01-01|00:00:00.000] Maximum peer count                       ETH=50 LES=0 total=50
INFO [01-01|00:00:00.000] Unlocking developer account              address=0x0000000000000000000000000000000000000000
INFO [01-01|00:00:00.000] Operator account is unlocked             address=0x71562b71999873DB5b286dF957af199Ec94617F7
INFO [01-01|00:00:00.000] Set options for submitting a block       mingaspirce=1000000000 maxgasprice=100000000000 resubmit=0s
INFO [01-01|00:00:00.000] Allocated cache and file handles         database=/home/ubuntu/plasma-evm/.pls.staking/manager/geth/stakingdata cache=16.00MiB handles=16
INFO [01-01|00:00:00.000] PowerTON started                         PowerTON=0xBcDfc870Ea0C6463C6EBb2B2217a4b32B93BCFB7
```

## Next

The process of setup the rootchain is practically the same as setup ethereum based private blockchain.
However, we are not just creating a single private blockchain, but have deployed various smart contracts for setup the layer-2 Tokamak plasma. Let's construct a layer-2 Tokamak plasma which connected the rootchain through following [Setup Childchain](https://docs.tokamak.network/docs/en/guides/getting-started/how-to-open-private-testnet-manually)

<!--## Architecture Diagram ![Architecture after Setup RootChain](assets/guides_private_testnet_rootchain.png)-->
