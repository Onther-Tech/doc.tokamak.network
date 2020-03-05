---
id: how-to-connect-public-testnet-prepare
title: Requirements for Connecting Public Testnet
sidebar_label: Requirements
---

Faraday is public testnet of Tokamak Network operated by Onther.

Same as all tokamak child chain, only operator can mine blocks in Faraday testent. This guide explains how to setup user node connected to the testnet.

You can take either way of below to setup user node.
1. [Connect to public testnet in local environment](how-to-connect-public-testnet-manually)
2. [Connect to public testnet with `Puppeth`](how-to-connect-public-testnet-puppeth)

## System Update and Install Required Packages

Setup compilement environment with following command.

```shell
~$ sudo apt-get update && sudo apt-get install tar wget make git build-essential -y
```

### Set Golang Environment

Run following command in order.

Install Go compiler at `/usr/local/` by running following command.

```bash
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

## Get Endpoint URL of `RootChain` Node

For running user node, you need to access to `RootChain`. There are many ways, but we recommend to use testnet node address served by `Infura`

If you do not have `Infura` account, sign up in [infura.io](https://infura.io/).

### Generate `Rinkeby` `RootChain` Address

Login to `Infura`, and click `"CREATE NEW PROJECT"` of `Dashboard` to create new project.

Configure `RootChain` address as below.

`wss://rinkeby.infura.io/ws/v3/[PROJECT ID]`

![Infura node ID](assets/guides_create-infura-node.png)

Ex) `wss://rinkeby.infura.io/ws/v3/c8a90eabc71448d1aaf6779752a22d26`

If you already have your own node of Rinkeby testnet, you can use it instead of `Infura`.