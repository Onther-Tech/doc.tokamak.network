---
id: how-to-open-private-testnet-rootchain
title: Setup Rootchain in Private Testnet
sidebar_label: Setup Rootchain
---

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

### Check Script of RootChain

`run.rootchain.sh` in `onther-tech/go-ethereum` is as follows.

```bash
# plasam-evm/run.rootchain.sh
OPERATOR_PRIV_KEY="b71c71a67e1177ad4e901695e1b4b9ee17ae16c6668d313eac2f96dbcda3f291"
CHALLENGER_KEY="78ae75d1cd5960d87e76a69760cb451a58928eee7890780c352186d23094a114"

ADDR0="0x5df7107c960320b90a3d7ed9a83203d1f98a811d";
ADDR1="0x3cd9f729c8d882b851f8c70fb36d22b391a288cd";
ADDR2="0x57ab89f4eabdffce316809d790d5c93a49908510";
ADDR3="0x6c278df36922fea54cf6f65f725267e271f60dd9";

KEY0="78ae75d1cd5960d87e76a69760cb451a58928eee7890780c352186d23094a115";
KEY1="bfaa65473b85b3c33b2f5ddb511f0f4ef8459213ada2920765aaac25b4fe38c5";
KEY2="067394195895a82e685b000e592f771f7899d77e87cc8c79110e53a2f0b0b8fc";
KEY3="ae03e057a5b117295db86079ba4c8505df6074cdc54eec62f2050e677e5d4e66";

make geth && build/bin/geth \
  --dev \
  --dev.period 1 \
  --dev.faucetkey "$OPERATOR_PRIV_KEY,$KEY0,$KEY1,$KEY2,$KEY3,$CHALLENGER_KEY" \
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

Accounts used in the script are as follows.

- Operator : 0x71562b71999873DB5b286dF957af199Ec94617F7

- Challenger : 0x3616BE06D68dD22886505e9c2CaAa9EcA84564b8

### Run RootChain

Run `run.rootchain.sh` in `go-ethereum` to start rootchain running on local network.

```bash
go-ethereum$ bash run.rootchain.sh
```

## Architecture Diagram
![Architecture after Setup RootChain](assets/guides_private_testnet_rootchain.png)
