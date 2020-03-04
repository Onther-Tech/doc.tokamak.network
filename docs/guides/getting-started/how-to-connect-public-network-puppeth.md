---
id: how-to-connect-public-testnet-puppeth
title: Connect to Public Testnet with Puppeth
sidebar_label: With Puppeth
---

You can set user node with `Puppeth` in `plasma-evm`.

## Install and Run `Puppeth`

### Download and Compile Source Code

`Puppeth` is handy tool for deploying Ethereum node. We added additional features to `Puppeth` in `plasma-evm` for deploying Tokamak node easily.

Download source code from [https://github.com/onther-tech/plasma-evm](https://github.com/onther-tech/plasma-evm). Then, compile `Puppeth` .

```bash
$ git clone https://github.com/onther-tech/plasma-evm
$ cd plasma-evm && make all
```

After compilement, `Puppeth` binary will be located at `plasma-evm/build/bin/`.

### Run `Puppeth`
 
Run `Puppeth` with following command.

```text
plasma-evm$ build/bin/puppeth
+-----------------------------------------------------------+
| Welcome to puppeth, your Ethereum private network manager |
|                                                           |
| This tool lets you create a new Ethereum network down to  |
| the genesis block, bootnodes, miners and ethstats servers |
| without the hassle that it would normally entail.         |
|                                                           |
| Puppeth uses SSH to dial in to remote servers, and builds |
| its network components out of Docker containers using the |
| docker-compose toolset.                                   |
+-----------------------------------------------------------+

Please specify a network name to administer (no spaces, hyphens or capital letters please)
>
```

You can use unique name for `NETWORK NAME` in Puppeth console.
The `NETWORK NAME` will be saved in `~/.puppeth/<NETWORK NAME>` file for Puppeth to recognize network.

> When starting Puppeth, you can apply old setting by inserting `NETWORK NAME` used before.

Following instructions are on `puppeth` console.

## Connect User Node to Faraday Testnet

### 1. Setup `genesis` file

In order to connect user node to Faraday testnet, you need `genesis` file of operator node.

`Puppeth` can load `genesis` file via http.

It will use `faraday.json` on `github` as `genesis`.

You can check the `genesis` file in [`faraday.json`](https://github.com/Onther-Tech/plasma-evm-networks/blob/master/faraday-testnet/faraday.json) at [github.com/onther-tech/plasma-evm-networks](https://github.com/Onther-Tech/plasma-evm-networks/tree/master/faraday-testnet).

```text
What would you like to do? (default = stats)
    1. Show network stats
    2. Configure new genesis
    3. Track new remote server
    4. Deploy network components
> 2

What would you like to do? (default = create)
    1. Create new genesis from scratch
    2. Import already existing genesis
> 2

Where's the genesis file? (local file or http/https url)
> https://raw.githubusercontent.com/Onther-Tech/plasma-evm-networks/master/faraday-testnet/faraday.json
```

If `genesis.json` is imported successfully, following message will be printed and it will return to start screen on `Puppeth` console.

```text
INFO [12-12|05:45:32.124] Imported genesis block
```

### 2. Add Remote Machine

You must install `Docker` in remote machine in order to use `Puppeth`.
About installing `Docker` depending on host environment, check [here](https://docs.docker.com/install/#supported-platforms).

Add local environment to remote server at `Puppeth` console.

```text
What would you like to do? (default = stats)
    1. Show network stats
    2. Configure new genesis
    3. Track new remote server
    4. Deploy network components
> 3

What is the remote server's address ([username[:identity]@]hostname[:port])?
> ubuntu@<Public IP address>

```

> You should NOT use `localhost(127.0.0.1)` as  `remote  server's address` input. Because nodes are looking each other with `<Public IP address>`.

```text
The authenticity of host '52.198.169.75:22 (52.198.169.75:22)' can't be established.
SSH key fingerprint is ff:00:ff:00:ff:00:ff:00:ff:00:ff:00:ff:00:ff:00 [MD5]
Are you sure you want to continue connecting (yes/no)? yes

INFO [02-25|00:00:00.000] Starting remote server health-check      server=ubuntu@52.198.169.75
+----------------------+---------------+---------+--------+-------+
|        SERVER        |    ADDRESS    | SERVICE | CONFIG | VALUE |
+----------------------+---------------+---------+--------+-------+
| ubuntu@52.198.169.75 | 52.198.169.75 |         |        |       |
+----------------------+---------------+---------+--------+-------+
```

> If you insert domain address instead of ip address, `Nginx` which is used for reverse proxy server, cannot parse domain syntax. You must insert ip address. 

If you connect to remote server with a keyfile for `SSH`, you should insert it in form of `onther:onther_private.pem@localhost` in console.

### 3. Deploy `Ethstats` Container

Puppeth cannot be started without `Ethstats`. Thus, you must deploy `ethstats` node first.

```text
+----------------------+---------------+---------+--------+-------+
|        SERVER        |    ADDRESS    | SERVICE | CONFIG | VALUE |
+----------------------+---------------+---------+--------+-------+
| ubuntu@52.198.169.75 | 52.198.169.75 |         |        |       |
+----------------------+---------------+---------+--------+-------+

What would you like to do? (default = stats)
    1. Show network stats
    2. Manage existing genesis
    3. Manage tracked machines
    4. Deploy network components
> 4

What would you like to deploy? (recommended order)
    1. Ethstats  - Network monitoring tool
    2. Bootnode  - Entry point of the network
    3. Sealer    - Full node minting new blocks
    4. Explorer  - Chain analysis webservice
    5. Wallet    - Browser wallet for quick sends
    6. Faucet    - Crypto faucet to give away funds
    7. Dashboard - Website listing above web-services
> 1

Which server do you want to interact with?
    1. onther@localhost
    2. Connect another server
> 1

Which port should ethstats listen on? (default = 80)
> 80

Allow sharing the port with other services (y/n)? (default = yes)
> y

INFO [01-01|00:00:00.000] Deploying nginx reverse-proxy            server=localhost port=80
Building nginx
Step 1/1 : FROM jwilder/nginx-proxy
    ---> 46fc9150cb48
Successfully built 46fc9150cb48
Successfully tagged faraday/nginx:latest
Creating faraday_nginx_1 ...
Creating faraday_nginx_1 ... done
```

First, it configures reverse proxy to access `Ethstats` server. Insert domain address(or ip address) and password to keep deploying `Ethstats` container.

```text
Proxy deployed, which domain to assign? (default = localhost)
> 52.198.169.75
What should be the secret password for the API? (must not be empty)
> onther

Found orphan containers (faraday_nginx_1) for this project. If you removed or renamed this service in your compose file, you can run this command with the --remove-orphans flag to clean it up.
Building ethstats
Step 1/2 : FROM puppeth/ethstats:latest
    ---> fb62abe59cb2
Step 2/2 : RUN echo 'module.exports = {trusted: [], banned: [], reserved: ["yournode"]};' > lib/utils/config.js
    ---> Running in ac7e749c51f5
Removing intermediate container ac7e749c51f5
    ---> 276dd2683d00
Successfully built 276dd2683d00
Successfully tagged faraday/ethstats:latest
Creating faraday_ethstats_1 ...
Creating faraday_ethstats_1 ... done
```

### 4. Deploy User Node Container

You cannot deploy user node container without `Ethstats`. Make sure that you did [3. Deploy `Ethstats` Container](how-to-connect-public-testnet-puppeth#3-deploy-ethstats-container).

```text
+----------------------+---------------+----------+-----------------------+---------------+
|        SERVER        |    ADDRESS    | SERVICE  |        CONFIG         |     VALUE     |
+----------------------+---------------+----------+-----------------------+---------------+
| ubuntu@52.198.169.75 | 52.198.169.75 | ethstats | Banned addresses      |               |
|                      |               |          | Login secret          | onther        |
|                      |               |          | Website address       | 52.198.169.75 |
|                      |               |          | Website listener port | 80            |
|                      |               |          | --------------------- | ------------- |
|                      |               | nginx    | Shared listener port  | 80            |
+----------------------+---------------+----------+-----------------------+---------------+

What would you like to do? (default = stats)
    1. Show network stats
    2. Manage existing genesis
    3. Manage tracked machines
    4. Deploy network components
> 4

    1. Tear down Nginx on ubuntu@52.198.169.75
    2. Tear down Ethstats on ubuntu@52.198.169.75
    3. Deploy new network component
> 3

What would you like to deploy? (recommended order)
    1. Ethstats  - Network monitoring tool
    2. Bootnode  - Entry point of the network
    3. Sealer    - Full node minting new blocks
    4. Explorer  - Chain analysis webservice
    5. Wallet    - Browser wallet for quick sends
    6. Faucet    - Crypto faucet to give away funds
    7. Dashboard - Website listing above web-services
> 2

Which server do you want to interact with?
    1. ubuntu@52.198.169.75
    2. Connect another server
> 1

What URL to listen on root chain JSONRPC?
> wss://rinkeby.infura.io/ws/v3/[PROJECT ID]
```

<!-- TODO Update Infura-->

Use your own infura URL which you got from ["Requirements for Connecting Public Testnet - Get Endpoint URL of `RootChain` Node"](how-to-connect-public-testnet-prepare#get-endpoint-url-of-rootchain-node) for `~ root chain JSONRPC?`.

```text
Do you want expose HTTP JSONRPC endpoint (y/n)? (default=no)
> y

Which TCP port to expose? (default=8545)
> 8547

Which is virtual hostname? (default=172.17.0.1,localhost)
> 172.17.0.1
```

Insert `yes` on `HTTP JSONRPC endpoint` console for users to access to the node.

```
Do you want expose WebSocket JSONRPC endpoint (y/n)? (default=no)
> y

Which TCP port to expose? (default=8546)
> 8548

Where should data be stored on the remote machine?
> /home/ubuntu/.pls.user

Which TCP/UDP port to listen on? (default = 30305)
> 30306

How many peers to allow connecting? (default = 512)
> 512

How many light peers to allow connecting? (default = 256)
> 256

What should the node be called on the stats page?
> usernode

Building bootnode
Step 1/4 : FROM onthertech/plasma-evm:latest
latest: Pulling from onthertech/plasma-evm
Digest: sha256:aa8029de17fb3da6c390545df4e05abae109ec6a45f12ecb22a0e0063b1aa276
Status: Downloaded newer image for onthertech/plasma-evm:latest
    ---> 1576e54d80ef
Step 2/4 : ADD genesis.json /genesis.json
    ---> 5c5992d4f1a2
Step 3/4 : RUN   echo $'geth --cache 512 init --rootchain.url wss://rinkeby.infura.io/ws/v3/... /genesis.json' > geth.sh && echo $'exec geth --syncmode="full" --networkid 16 --rootchain.url wss://rinkeby.infura.io/ws/v3/... --rpc --rpcaddr \'0.0.0.0\' --rpcport 8545 --rpcapi eth,net,debug --rpccorsdomain "*" --rpcvhosts=localhost --ws --wsorigins \'*\' --wsaddr \'0.0.0.0\' --wsport 8546 --cache 512 --port 30306 --nat extip:52.198.169.75 --maxpeers 512 --lightpeers=256 --lightserv=50 --ethstats \'tokamak-mynode:ubuntu@localhost\' --miner.gastarget 0 --miner.gaslimit 0 --miner.gasprice 0' >> geth.sh
    ---> Running in 826cf2fe881a
Removing intermediate container 826cf2fe881a
    ---> ed4330e0d27f
Step 4/4 : ENTRYPOINT ["/bin/sh", "geth.sh"]
    ---> Running in 49f1003114a2
Removing intermediate container 49f1003114a2
    ---> 120072c6f2ee
Successfully built 120072c6f2ee
Successfully tagged tokamak/bootnode:latest
Creating tokamak_bootnode_1 ...
Creating tokamak_bootnode_1 ... done
```

Insert `usernode` for node name shown in `Ethstats`, and use default parameters for others.

## Faraday User Node Container

If user node was deployed successfully, you can see below message from `Puppeth`.

```text
+----------------------+---------------+----------+--------------------------+-----------------------------------+
|       SERVER         |    ADDRESS    | SERVICE  |          CONFIG          |                VALUE              |
+----------------------+---------------+----------+--------------------------+-----------------------------------+
| ubuntu@52.198.169.75 | 52.198.169.75 | bootnode | Data directory           | /home/ubuntu/.pls.user            |
|                      |               |          | Ethstats username        | usernode                          |
|                      |               |          | JSONRPC VHOST            | 52.198.169.75,localhost           |
|                      |               |          | Listener port            | 30306                             |
|                      |               |          | Peer count (all total)   | 512                               |
|                      |               |          | Peer count (light nodes) | 256                               |
|                      |               |          | Root chain JSONRPC URL   | wss://rinkeby.infura.io/ws/v3/... |
|                      |               |          | ------------------------ | --------------------------------- |
|                      |               | ethstats | Banned addresses         |                                   |
|                      |               |          | Login secret             | onther                            |
|                      |               |          | Website address          | 52.198.169.75                     |
|                      |               |          | Website listener port    | 80                                |
|                      |               |          | ------------------------ | --------------------------------- |
|                      |               | nginx    | Shared listener port     | 80                                |
+----------------------+---------------+----------+--------------------------+-----------------------------------+
