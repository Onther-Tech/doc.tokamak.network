---
id: how-to-connect-public-testnet-manually
title: How to connect public testnet manually
sidebar_label: Menually
---

## Faraday User Node

### 1. Initialization

For starting Faraday user node, you need to have `genesis` file to initialize. You can find `genesis` file in [`faraday.json`](https://github.com/Onther-Tech/plasma-evm-networks/blob/master/faraday-testnet/faraday.json) at [github.com/onther-tech/plasma-evm-networks](https://github.com/Onther-Tech/plasma-evm-networks/tree/master/faraday-testnet).

`rootchain.url` is websocket address of `Rinkeby` testnet.

Initialize user node with following command.

```bash
plasma-evm$ build/bin/geth init \
            --datadir ./chaindata \
            --rootchain.url wss://rinkeby.infura.io/ws/v3/<PROJECT ID> \
            https://raw.githubusercontent.com/Onther-Tech/plasma-evm-networks/master/faraday-testnet/faraday.json
```

You can set location of chain data with `--datadir` flag. **This path must be same as in running plasma-evm**.

### 2. Run User Node

You should use same `datadir` as in [1. Initialization](how-to-connect-public-testnet-manually#1-initialization).

Start user node with following command.

```bash
plasma-evm$ build/bin/geth \
    --datadir ./chaindata-user \
    --syncmode="full" \
    --networkid 16 \
    --rootchain.url wss://rinkeby.infura.io/ws/v3/<PROJECT ID> \
    --rpc \
    --rpcaddr '127.0.0.1' \
    --rpcport 8547 \
    --rpcapi eth,net,debug \
    --rpccorsdomain "*" \
    --rpcvhosts=localhost \
    --ws \
    --wsorigins '*' \
    --wsaddr '127.0.0.1' \
    --wsport 8548 \
    --port 30307 \
    --nat extip:::1 \
    --maxpeers 50
```

Chain data of user node will be stored on `plasma-evm/chaindata`.

> You must set `--syncmode` to `full` for synchronizing blocks with other nodes.

> If you want to use both `rpc` and `keystore`, add `--allow-insecure-unlock` to the command.

You can check status of Faraday testnet in [here](http://ethstats.faraday.tokamak.network/).