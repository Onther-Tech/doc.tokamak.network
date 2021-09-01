---
id: natasha-faucet
title: Natasha faucet
sidebar_label: Natasha faucet
---

In Natasha Optimism, you pay specific ERC20 token for Layer2 transaction fee, not Ether. This document explains how to get fee token on L1 and move it to L2 to use the testnet.

## Setup

Clone and install the repository as below.

```bash
git clone https://github.com/Onther-Tech/natasha-faucet-example.git
cd natasha-faucet-example
yarn install
```

## Configuration

Copy `.env.example` file to `.env` file, and insert below variables.

* RINKEBY_NODE_WEB3_URL: Insert Rinkeby RPC Endpoint URL.
* PRIVATE_KEY: Insert your private key corresponding to your ethereum address.

## Faucet

Run the script as below. After all transactions in the script are processed, you can get the token to be used as fee.

```bash
yarn faucet
```
