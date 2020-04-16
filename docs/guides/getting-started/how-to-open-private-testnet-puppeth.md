---
id: how-to-open-private-testnet-puppeth
title: Setup Private Testnet With Puppeth
sidebar_label: Setup with Puppeth
---

This guide describes how to deploy child chain connected to private root chain with `Puppeth`.

`Puppeth` is handy tool for deploying Ethereum node. We added additional features to `Puppeth` in `plasma-evm`. For setting `ChildChain` with `Puppeth`, you need to setup `RootChain` first. If you did not setup the `RootChain`, must do [Setup rootchain](how-to-open-private-testnet-rootchain#setup-rootchain).

Keywords in `Puppeth` are as follows.

- `sealnode` : operator node, miner node

- `boodnode` : user node, sending transactions to operator node and synchronize with it.

## Setup Environment for 'Puppeth'

> If you are using `ganache` as `RootChain`, you should use initialized accounts for operator and challenger in `ganache`.

### 1. Setup Network

Since user node is kind of proxy node, you must expose port `30306`, `8547`, `8548` to outside.

For example, in AWS EC2, you have to change setting as follows.

![AWS EC2 Instance Network Setting](assets/guides_private_testnet_network.png)

### 2. Setup Docker & Docker-Compose

In order to use `Puppeth`, `Docker` and `docker-compose` must be installed in remote machine.

To install `Docker` on other operating systems(If remote machine OS is not Ubuntu 18.04), check [this](https://docs.docker.com/install/#supported-platforms).

```bash
~$ sudo apt-get remove docker docker-engine docker.io containerd runc -y
~$ sudo apt-get update
~$ sudo apt-get install apt-transport-https ca-certificates curl gnupg-agent software-properties-common -y
~$ curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo apt-key add -
~$ sudo add-apt-repository "deb [arch=amd64] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable"
~$ sudo apt-get update && sudo apt-get install docker-ce docker-ce-cli containerd.io docker-compose -y
```

To check `Docker` installed successfully, run following command.

```bash
~$ sudo docker version
Client: Docker Engine - Community
 Version:           19.03.6
 API version:       1.40
 Go version:        go1.12.16
 Git commit:        369ce74a3c
 Built:             Thu Feb 13 01:27:49 2020
 OS/Arch:           linux/amd64
 Experimental:      false

Server: Docker Engine - Community
 Engine:
  Version:          19.03.6
  API version:      1.40 (minimum version 1.12)
  Go version:       go1.12.16
  Git commit:       369ce74a3c
  Built:            Thu Feb 13 01:26:21 2020
  OS/Arch:          linux/amd64
  Experimental:     false
 containerd:
  Version:          1.2.10
  GitCommit:        b34a5c8af56e510852c35414db4c1f4fa6172339
 runc:
  Version:          1.0.0-rc8+dev
  GitCommit:        3e425f80a8c931f88e6d94a8c831b9d5aa481657
 docker-init:
  Version:          0.18.0
  GitCommit:        fec3683
```

If you use Ubuntu 18.04 instance of AWS EC2, set `ubuntu`, default account, to run `docker` command without `sudo`.

Make sure that you set permission with following command.(You Must)

```bash
~$ sudo usermod -aG docker ubuntu
```

### 3. Register Keyfile for SSH

For Remote Ubuntu machine such as AWS EC2, you need keyfile for SSH access.

You should have keyfile in remote environment for deploying node with `Puppeth`.

Run following command in local to send your keyfile, e.g `key.pem`, to remote.

```bash
local-machine ~$ scp -i ~/.ssh/key.pem ~/.ssh/key.pem ubuntu@<Remote Instance IP>:/home/ubuntu/.ssh/id_rsa
```

If the keyfile is copied successfully, you can access its localhost with SSH in remote machine.

You can check whether the keyfile is registered correctly with following command in remote terminal.

```bash
~$ ssh ubuntu@localhost
Welcome to Ubuntu 18.04.3 LTS (GNU/Linux 4.15.0-1057-aws x86_64)

 * Documentation:  https://help.ubuntu.com
 * Management:     https://landscape.canonical.com
 * Support:        https://ubuntu.com/advantage

  System information as of Tue Feb 1 00:00:00 UTC 2020

  System load:  0.0               Processes:              108
  Usage of /:   9.2% of 29.02GB   Users logged in:        1
  Memory usage: 25%               IP address for eth0:    172.31.18.103
  Swap usage:   0%                IP address for docker0: 172.17.0.1


54 packages can be updated.
32 updates are security updates.

~$
```

### 4. Download and Compile Source Code

 You can get source code from [here](https://github.com/onther-tech/plasma-evm)

 Download source code and compile `plasma-evm` with following command.

```bash
~$ git clone https://github.com/onther-tech/plasma-evm
~$ cd plasma-evm && make all
```

> If you get errors such as `make: *** ..`, you did not configure build environment. Do [setup RootChain](how-to-open-private-testnet-rootchain#setup-rootchain) first.

`puppeth` binary will be created at `plasma-evm/build/bin/` after compilement.

### 5. Deploy RootChain Contract

Before running `Putppeth`, make `genesis` file including address of the `RootChain Contract`. You can get `genesis.json` after deloying `RootChain Contract` with command `deploy` same as in [Setup Rootchain in Private Testnet -  2. Deploy RootChain Contract](how-to-open-private-testnet-manually#2-deploy-rootchain-contract).

> You can find an example of `genesis.json` in [faraday.json](https://github.com/Onther-Tech/plasma-evm-networks/blob/master/faraday-testnet/faraday.json).

Make `deploy.rootchain.sh` with following command.

```bash
plasma-evm$ cat > deploy.rootchain.sh << "EOF"
#!/bin/bash
OPERATOR_KEY="86e60281da515184c825c3f46c7ec490b075af1e74607e2e9a66e3df0fa22122"
OPERATOR="0x5e3230019fed7ab462e3ac277e7709b9b2716b4f"

DATADIR=pls.data

ROOTCHAIN_IP=127.0.0.1

# Deploy contracts at rootchain
echo "Deploy rootchain contract and others"
make geth && build/bin/geth \
    --nousb \
    --datadir $DATADIR \
    --rootchain.url "ws://$ROOTCHAIN_IP:8546" \
    --unlock $OPERATOR \
    --password pwd.pass \
    --rootchain.sender $OPERATOR \
    --stamina.operatoramount 1 \
    --stamina.mindeposit 0.5 \
    --stamina.recoverepochlength 120960 \
    --stamina.withdrawaldelay 362880 \
    deploy "./genesis-operator1.json" 16 true 4096

# you can checkout "$geth deploy --help" for more information
EOF
```

Run`deploy.rootchain.sh` with following command.

```bash
plasma-evm$ bash deploy.rootchain.sh
```

`genesis.json` file will be located at `plasma-evm` directory.

## Setup & Start Puppeth

### 1. Run Puppeth

Run Puppeth with command `build/bin/puppeth`.

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

### 2. Setup `genesis` file

For deploying nodes, `Puppeth` needs the `genesis.json` created with [Setup With Puppeth - 5. Deploy RootcChain Contract](how-to-open-private-testnet-puppeth#5-Deploy-RootChain-Contract).

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
> plasma-evm/genesis.json
```

If `genesis.json` is imported successfully, following message will be printed and it will return to start screen on `Puppeth` console.

```text
INFO [12-12|05:45:32.124] Imported genesis block
```

### 3. Add Remote Machine

If you want to install on your local MacOS environment, not remote machine, you should allow to `Remote Login` in MacOS system preferences.
For`Remote Login` allowed, check [macOS User Guide - Allow a remote computer to access your Mac](https://support.apple.com/guide/mac-help/mchlp1066/mac)

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

## Deploy Node Container

### 1. Deploy `ethstats` Container

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

### 2. Deploy User Node Container

You cannot deploy user node container without `Ethstats`. Make sure that you did [1. Deploy `ethstats` Container](how-to-open-private-testnet-puppeth#1-deploy-ethstats-container)

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

    1. Tear down Nginx on ubuntu@localhost
    2. Tear down Ethstats on ubuntu@localhost
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
> ws://172.17.0.1:8546
```

If `RootChain` is running on remote host such as AWS, insert ip address of `Docker bridge network`(default: 172.17.0.1)

If `bootnode` container cannot find `RootChain` address, use one of ip addresses of host machine with following command.

```bash
~$ ifconfig | grep "inet "
    inet 172.17.0.1  netmask 255.255.0.0  broadcast 172.17.255.255
    inet 172.18.0.1  netmask 255.255.0.0  broadcast 172.18.255.255
    inet 172.31.9.133  netmask 255.255.240.0  broadcast 172.31.15.255
    inet 127.0.0.1  netmask 255.0.0.0
```

> If you use `127.0.0.1`, Usernode could not reach `RootChain` running on host because cannot see its network.

Insert websocket address of `RootChain`(e.g `ws://172.17.0.1:8546`) to `What URL to listen on root chain JSONRPC`

```text
Do you want expose HTTP JSONRPC endpoint (y/n)? (default=no)
> y

Which TCP port to expose? (default=8545)
> 8547

Which is virtual hostname? (default=172.17.0.1,localhost)
> 172.17.0.1
```

Insert `yes` on `HTTP JSONRPC endpoint` console for users to access to the node.

```text
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
Step 3/4 : RUN   echo $'geth --cache 512 init --rootchain.url ws://172.17.0.1:8546 /genesis.json' > geth.sh && echo $'exec geth --syncmode="full" --networkid 16 --rootchain.url ws://172.17.0.1:8546 --rpc --rpcaddr \'0.0.0.0\' --rpcport 8545 --rpcapi eth,net,debug --rpccorsdomain "*" --rpcvhosts=localhost --ws --wsorigins \'*\' --wsaddr \'0.0.0.0\' --wsport 8546 --cache 512 --port 30306 --nat extip:52.198.169.75 --maxpeers 512 --lightpeers=256 --lightserv=50 --ethstats \'tokamak-mynode:ubuntu@localhost\'    --miner.gastarget 0 --miner.gaslimit 0 --miner.gasprice 0' >> geth.sh
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

### 3. Deploy Operator Node Container

Setup operator node for mining blocks in `ChildChain`.`Ethstats` and `Usernode`(=`bootnode`) containers should be running before starting to setup operator node with `Puppeth`.

```text
+----------------------+---------------+----------+--------------------------+--------------------------+
|       SERVER         |    ADDRESS    | SERVICE  |          CONFIG          |          VALUE           |
+----------------------+---------------+----------+--------------------------+--------------------------+
| ubuntu@52.198.169.75 | 52.198.169.75 | bootnode | Data directory           | /home/ubuntu/.pls.user   |
|                      |               |          | Ethstats username        | usernode                 |
|                      |               |          | JSONRPC VHOST            | 52.198.169.75,localhost  |
|                      |               |          | Listener port            | 30306                    |
|                      |               |          | Peer count (all total)   | 512                      |
|                      |               |          | Peer count (light nodes) | 256                      |
|                      |               |          | Root chain JSONRPC URL   | ws://172.17.0.1:8546     |
|                      |               |          | ------------------------ | ------------------------ |
|                      |               | ethstats | Banned addresses         |                          |
|                      |               |          | Login secret             | onther                   |
|                      |               |          | Website address          | 52.198.169.75            |
|                      |               |          | Website listener port    | 80                       |
|                      |               |          | ------------------------ | ------------------------ |
|                      |               | nginx    | Shared listener port     | 80                       |
+----------------------+---------------+----------+--------------------------+--------------------------+

What would you like to do? (default = stats)
1. Show network stats
2. Manage existing genesis
3. Manage tracked machines
4. Deploy network components
> 4

 1. Tear down Nginx on ubuntu@localhost
 2. Tear down Ethstats on ubuntu@localhost
 3. Tear down Bootnode on ubuntu@localhost
 4. Deploy new network component
> 4

What would you like to deploy? (recommended order)
1. Ethstats  - Network monitoring tool
2. Bootnode  - Entry point of the network
3. Sealer    - Full node minting new blocks
4. Explorer  - Chain analysis webservice
5. Wallet    - Browser wallet for quick sends
6. Faucet    - Crypto faucet to give away funds
7. Dashboard - Website listing above web-services
> 3

Which server do you want to interact with?
1. ubuntu@52.198.169.75
2. Connect another server
> 1

What URL to listen on root chain JSONRPC?
> ws://172.17.0.1:8546
```

Insert websocket address of `RootChain` same as in the user node.

```text
Do you want expose HTTP JSONRPC endpoint (y/n)? (default=no)
> n

Do you want expose WebSocket JSONRPC endpoint (y/n)? (default=no)
> n

Where should data be stored on the remote machine?
> /home/ubuntu/.pls.oper

Where should the ethash mining DAGs be stored on the remote machine?
> /home/ubuntu/.pls.dag

```

`Docker` container and host shares the directory as inserted in `~ be stored on the remote machine?`, it can be accessed in host machine.

```text
Which TCP/UDP port to listen on? (default = 30305)
> 30307

How many peers to allow connecting? (default = 50)
> 50

How many light peers to allow connecting? (default = 0)
> 0

What should the node be called on the stats page?
> operator

Please paste the operator's key JSON:
> {"address":"b79749f25ef64f9ac277a4705887101d3311a0f4","crypto":{"cipher":"aes-128-ctr","ciphertext":"8b750c93fdecb295568a3a8f73531d2ce019393a65328de204bbdcae93ee7ba5","cipherparams":{"iv":"1c09cf80049e26f45d06f6d659df5194"},"kdf":"scrypt","kdfparams":{"dklen":32,"n":262144,"p":1,"r":8,"salt":"9eb4b1b5b1374d977fec0754eac926fde62723b5ce2dd304b707db034199007f"},"mac":"42e15aa26aa6bb3e274c518530f75f02d385cb4706bc639a95913a4f33134eb8"},"id":"8be79bc9-06ea-4328-8d9c-89440f19a25d","version":3}

What's the unlock password for the account? (won't be echoed)
>

Please paste the challenger's key JSON:
> {"address":"3616be06d68dd22886505e9c2caaa9eca84564b8","crypto":{"cipher":"aes-128-ctr","ciphertext":"58a35baf690ae21cd25af78141adf8282f731e5ac287e4e8703112e59484d0a4","cipherparams":{"iv":"1664f876800c39715641de011b6c7193"},"kdf":"scrypt","kdfparams":{"dklen":32,"n":262144,"p":1,"r":8,"salt":"9609b8b7c9f5082120306fdb0e7c69973869da60a7989a3f049e4cb93aa9871f"},"mac":"cfbd7959e0bc5a19493a8413f30a8ff450e4a28caff60d389df6718b17c8abaf"},"id":"1d9853e8-9478-4390-8f5c-f8d10447f749","version":3}

What's the unlock password for the account? (won't be echoed)
>
```

You must use accounts that have enough balance in `RootChain` for operator and challenger account.

```text
What gas limit should empty blocks target (MGas)? (default = 7.500)
> 7.5

What gas limit should full blocks target (MGas)? (default = 10.000)
> 10

What gas price should the operator require (GWei)? (default = 1.000)
> 1
```

Use default parameters for others.

> We recommend to increase value of `What gas limit should full blocks target?` so that operator node can mine more transaction per block.

```text
Building sealnode
Step 1/7 : FROM onthertech/plasma-evm:latest
latest: Pulling from onthertech/plasma-evm
Digest: sha256:aa8029de17fb3da6c390545df4e05abae109ec6a45f12ecb22a0e0063b1aa276
Status: Downloaded newer image for onthertech/plasma-evm:latest
---> 1576e54d80ef
Step 2/7 : ADD genesis.json /genesis.json
---> 1087509c762e
Step 3/7 : ADD operator.json /operator.json
---> 714dd1c15216
Step 4/7 : ADD challenger.json /challenger.json
---> b03d83cf4459
Step 5/7 : ADD signer.pass /signer.pass
---> 2ba822bdd81b
Step 6/7 : RUN   echo $'geth --cache 512 init --rootchain.url ws://172.17.0.1:8546 /genesis.json' > geth.sh && echo 'mkdir -p /root/.ethereum/keystore/' >> geth.sh &&   echo 'cp /operator.json /root/.ethereum/keystore/' >> geth.sh && echo 'cp /challenger.json /root/.ethereum/keystore/' >> geth.sh && echo $'exec geth --syncmode="full" --networkid 16 --rootchain.url ws://172.17.0.1:8546 --operator 0xb79749F25Ef64F9AC277A4705887101D3311A0F4 --rootchain.challenger 0x3616BE06D68dD22886505e9c2CaAa9EcA84564b8   --cache 512 --port 30305 --nat extip:52.198.169.75 --maxpeers 50  --ethstats \'tokamak-operator:ubuntu@52.198.169.75'   --unlock 0xb79749F25Ef64F9AC277A4705887101D3311A0F4,0x3616BE06D68dD22886505e9c2CaAa9EcA84564b8 --password /signer.pass --mine --miner.gastarget 7500000 --miner.gaslimit 10000000 --miner.gasprice 1000000000' >> geth.sh
---> Running in 9d7f43a35d30
Removing intermediate container 9d7f43a35d30
---> 30948ea415b2
Step 7/7 : ENTRYPOINT ["/bin/sh", "geth.sh"]
---> Running in aba79252703b
Removing intermediate container aba79252703b
---> 0c3f6aa8d7ed
Successfully built 0c3f6aa8d7ed
Successfully tagged tokamak/sealnode:latest
Creating tokamak_sealnode_1 ...
Creating tokamak_sealnode_1 ... done
```

If operator node successfully deployed, above message will be printed.

### Check Deployed Containers

`Ethstats`, `Bootnode`, `Nginx` and `Sealnode` Containers are deployed by `Puppeth` with this instruction.

Deployed container result will be like below in `Puppeth` console.

```text
+----------------------+---------------+----------+------------------------------+----------------------------------------------+
|        SERVER        |    ADDRESS    | SERVICE  |            CONFIG            |                     VALUE                    |
+----------------------+---------------+----------+------------------------------+----------------------------------------------+
| ubuntu@52.198.169.75 | 52.198.169.75 | bootnode | Data directory               | /home/ubuntu/.pls.user                       |
|                      |               |          | Ethstats username            | usernode                                     |
|                      |               |          | JSONRPC VHOST                | 52.198.169.75,localhost                      |
|                      |               |          | Listener port                | 30306                                        |
|                      |               |          | Peer count (all total)       | 512                                          |
|                      |               |          | Peer count (light nodes)     | 256                                          |
|                      |               |          | Root chain JSONRPC URL       | ws://172.17.0.1:8546                         |
|                      |               |          | ---------------------------- | -------------------------------------------- |
|                      |               | ethstats | Banned addresses             |                                              |
|                      |               |          | Login secret                 | onther                                       |
|                      |               |          | Website address              | 52.198.169.75                                |
|                      |               |          | Website listener port        | 80                                           |
|                      |               |          | ---------------------------- | -------------------------------------------- |
|                      |               | nginx    | Shared listener port         | 80                                           |
|                      |               |          | ---------------------------- | -------------------------------------------- |
|                      |               | sealnode | CHallenger account           | 0x3616BE06D68dD22886505e9c2CaAa9EcA84564b8   |
|                      |               |          | Data directory               | /home/ubuntu/.pls.oper                       |
|                      |               |          | Ethstats username            | operator                                     |
|                      |               |          | Gas ceil  (target maximum)   | 10.000 MGas                                  |
|                      |               |          | Gas floor (baseline target)  | 7.500 MGas                                   |
|                      |               |          | Gas price (minimum accepted) | 1.000 GWei                                   |
|                      |               |          | Listener port                | 30307                                        |
|                      |               |          | Operator account             | 0xb79749F25Ef64F9AC277A4705887101D3311A0F4   |
|                      |               |          | Peer count (all total)       | 50                                           |
|                      |               |          | Peer count (light nodes)     | 0                                            |
|                      |               |          | Root chain JSONRPC URL       | ws://172.17.0.1:8546                         |
+----------------------+---------------+----------+------------------------------+----------------------------------------------+
```

![Plasma-evm Private Testnet Architecture](assets/guides_private_testnet_puppeth.png)
