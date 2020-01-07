---
id: how-to-open-private-testnet-puppeth
title: Puppeth 사용하여 프라이빗 테스트넷 설정하기
sidebar_label: Puppeth 사용하여 부모-자식체인 설정
---

`Puppeth`란 이더리움 노드 배포를 쉽게 할 수 있는 유틸리티 프로그램이다. `plasma-evm`의 `Puppeth`는 토카막 노드를 쉽게 구성 할 수 있도록 추가된 기능이 탑재 되어 있다. `Puppeth`를 사용하여 자식 체인을 설정하려면 이미 구동중인 루트체인이 필요하다. 테스트로 쓸 루트체인이 필요하다면 [루트체인 설정하기](how-to-open-private-testnet-rootchain#%EB%B6%80%EB%AA%A8-%EC%B2%B4%EC%9D%B8-%EC%84%A4%EC%A0%95%ED%95%98%EA%B8%B0)를 먼저 진행하고 이 가이드 문서를 진행하는 것이 바람직하다.

이 가이드는 `Puppeth`를 사용하여 특정한 루트체인에 연결된 토카막 자식체인을 배포하는 과정을 담고 있다.

시작 하기 전에, `Puppeth`에서 사용되는 용어를 먼저 정리하면 아래와 같다.

- `sealnode` : 오퍼레이터 노드, 블록을 생성하는 마이너 노드로 볼 수 있다.

- `boodnode` : 사용자 노드, JSON-RPC를 통해 트랜잭션 정보를 받아 오퍼레이터 노드에 전달한고 오퍼레이터 노드에서 생성된 블록들을 동기화 한다.

## `Puppeth` 준비하기

> 루트체인으로 `ganache` 테스트체인을 사용하는 경우, `ganache` 실행시 생성된 계정을 오퍼레이터(Operator)와 챌린저(Challenger)로 지정해 사용하여야 한다.

### 1. 소스코드 다운로드 및 컴파일하기

`plasma-evm`이 제공하는 `Puppeth`를 이용하면 여러 노드를 손쉽게 배포 할 수 있다. 아래 작업은 [https://github.com/onther-tech/plasma-evm](https://github.com/onther-tech/plasma-evm) 기준으로 진행된다. 먼저 다음 명령어를 통해서 소스코드를 복제하고 `plasma-evm`을 컴파일을 진행한다.

```bash
$ git clone https://github.com/onther-tech/plasma-evm
$ cd plasma-evm && make all
```

컴파일을 마치면 `puppeth` 실행파일은 `plasma-evm/build/bin/` 에 위치하게 된다.

### 2.  루트체인 컨트렉트 배포하기

`Puppeth`를 실행하기 이전에 자식체인과 연결될 루트체인 컨트렉트를 배포하고 해당 정보를 담은 `genesis` 파일을 생성한다. [프라이빗 테스트넷 직접 설정하기 - 1. 루트체인 컨트렉트 배포하기](how-to-open-private-testnet-manually#1-%EB%A3%A8%ED%8A%B8%EC%B2%B4%EC%9D%B8-%EC%BB%A8%ED%8A%B8%EB%A0%89%ED%8A%B8-%EB%B0%B0%ED%8F%AC%ED%95%98%EA%B8%B0) 와 같이 `deploy` 커맨드를 사용하여 루트체인 contract을 배포한후 `genesis.json` 파일을 생성하는 스크립트를 작성한다.

> 해당 genesis.json 파일의 예시는 [faraday.json](https://github.com/Onther-Tech/plasma-evm-networks/blob/master/faraday-testnet/faraday.json) 에서 확인할 수 있다.

```sh
# deploy.rootchain.sh
#!/usr/bin bash

OPERATOR_KEY="b71c71a67e1177ad4e901695e1b4b9ee17ae16c6668d313eac2f96dbcda3f291"
KEY2="78ae75d1cd5960d87e76a69760cb451a58928eee7890780c352186d23094a115"
KEY3="067394195895a82e685b000e592f771f7899d77e87cc8c79110e53a2f0b0b8fc"
KEY4="ae03e057a5b117295db86079ba4c8505df6074cdc54eec62f2050e677e5d4e66"
KEY5="eda4515e1bc6c08e8606b51ffb6ffe70b3fe76781ed49872285e484064e3b634"
CHALLENGER_KEY="78ae75d1cd5960d87e76a69760cb451a58928eee7890780c352186d23094a114"

DATADIR=pls.data
OPERATOR="0x71562b71999873DB5b286dF957af199Ec94617F7"
CHALLENGER="0x3616BE06D68dD22886505e9c2CaAa9EcA84564b8"

ROOTCHAIN_IP=localhost # Onther Ropsten Geth Node IP.

# Deploy contracts at rootchain
echo "Deploy rootchain contract and others"
make geth && build/bin/geth \
    --rootchain.url "ws://$ROOTCHAIN_IP:8546" \
    --operator.key $OPERATOR_KEY \
    --datadir $DATADIR \
    deploy "./genesis.json" 16 true 4096

# deploy params : chainID, isInitialAsset, Epochlength
# you can checkout "$geth deploy --help" for more information
```

위 스크립트를 저장하고 아래 명령어로 실행한다.

```bash
plasma-evm$ bash deploy.rootchain.sh
```
생성된 `genesis.json` 파일은 동일하게 `plasma-evm` 폴더 내에 자리잡게 된다.


### 3. `Puppeth` 실행하기

puppeth를 실행하기 위해서 `build/bin/puppeth` 명령어를 입력한다.( go1.13 버전을 사용하는 것을 추천한다)

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

자신이 지정하고 싶은 임의의 네트워크 이름을 입력한다.
입력한 `Network name` 은 네트워크를 식별하기 위해 `~/.puppeth/<network name>` 파일로 저장된다.
다음 실행시 동일한 이름으로 입력하게 되면 해당 파일의 설정값을 불러온다.

> 사용자 노드와 오퍼레이터 노드 설정시 불가피하게 재시작 하는 경우 동일한 `network name`을 입력하므로써 이전 상태 저장값을 불러 올 수 있다.

사용자 노드와 오퍼레티어 노드 설정하는 방법에서는 계속해서 `puppeth` 실행화면에서 작업을 수행한다.

##  사용자 노드 설정하기

사용자 노드의 `enode` 주소를 `Puppeth`에서 관리하므로 [프라이빗 테스트넷 직접 설정하는 법](how-to-open-private-testnet-manually)과 다르게 사용자 노드를 먼저 설정한다.

`Puppeth`를 사용하기 위해서는 원격 머신에 Docker가 설치 되어 있어야 한다. 로컬 환경에 `Docker`가 설치 되어 있음을 전제 한다.
호스트 머신 환경별 `Docker` 설치에 관해서는 [외부 문서](https://docs.docker.com/install/#supported-platforms)를 참고한다.

### 1. `genesis` 파일 불러오기

`Puppeth`를 이용해 노드들을 설정하기 위해서는 `genesis.json`파일이 필요하다.

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
> /home/ubuntu/plasma-evm/genesis.json
```

`genesis.json` 파일이 제대로 임포트(import) 되는 경우 아래와 같은 메시지가 출력되고 초기 선택화면으로 돌아간다.

```text
INFO [12-12|05:45:32.124] Imported genesis block
```

### 2. 리모트 머신 추가하기

만약 MacOS 환경에 설치하고자 한다면, 원격 컴퓨터가 MacOS에 접근을 허용해야 한다.
이부분은 apple에서 제공하는 [macOS 사용 설명서](https://support.apple.com/ko-kr/guide/mac-help/mchlp1066/mac) 부분을 참고한다.

```text
What would you like to do? (default = stats)
    1. Show network stats
    2. Configure new genesis
    3. Track new remote server
    4. Deploy network components
> 3

What is the remote server's address ([username[:identity]@]hostname[:port])?
> onther@localhost

The authenticity of host 'localhost:22 ([::1]:22)' can't be established.
SSH key fingerprint is ff:00:ff:00:ff:00:ff:00:ff:00:ff:00:ff:00:ff:00 [MD5]
Are you sure you want to continue connecting (yes/no)? yes
What's the login password for Jin at onther@localhost? (won't be echoed)
> [insert password of user]

INFO [08-01|03:30:30.787] Starting remote server health-check      server=onther@localhost
+-------------+---------------+----------+-----------------------+---------------+
|   SERVER    |    ADDRESS    | SERVICE  |        CONFIG         |     VALUE     |
+-------------+---------------+----------+-----------------------+---------------+
|   onther    | localhost     |          |                       |               |
+-------------+---------------+----------+-----------------------+---------------+
```

> IP 주소 대신 도메인(Domain) 주소를 입력하는 경우 생성되는 `Nginx`가 구문을 파싱하지 못한다. 따라서 IP 주소를 직접 넣어준다.

SSH키 파일을 사용하는경우 `onther:onther_private.pem@localhost` 와 같은 형태로 입력하여 사용한다.

### 3. `Ethstats` 컨테이터 배포하기

`Puppeth`는 `ethstats`에 관한 정보가 없는 경우 실행이 되지 않는다. 따라서 `ethstats` 노드를 먼저 배포해야 한다.

```text
+-------------+---------------+----------+-----------------------+---------------+
|   SERVER    |    ADDRESS    | SERVICE  |        CONFIG         |     VALUE     |
+-------------+---------------+----------+-----------------------+---------------+
|   onther    | localhost     |          |                       |               |
+-------------+---------------+----------+-----------------------+---------------+

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
> yes

INFO [01-01|00:00:00.000] Deploying nginx reverse-proxy            server=localhost port=80
Building nginx
Step 1/1 : FROM jwilder/nginx-proxy
    ---> 46fc9150cb48
Successfully built 46fc9150cb48
Successfully tagged faraday/nginx:latest
Creating faraday_nginx_1 ...
Creating faraday_nginx_1 ... done
```

`Ethstats` 서버 연결을 위한 리버스 프록시(Reverse Proxy)가 먼저 구성된다. 계속해서 `Ethstats` 컨테이너를 생성하기 위해 도메인 주소(또는 IP 주소)와 비밀번호를 입력해준다.

```text
Proxy deployed, which domain to assign? (default = localhost)
> localhost
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

### 4. 사용자 노드 컨테이너 배포하기

`Ethstats` 정보를 가지고 있어야 사용자 노드 컨테이너 생성이 가능하다. 따라서, 3번 과정을 먼저 수행해야 한다.

```text
+-------------+---------------+----------+------------------------------+---------------+
|   SERVER    |    ADDRESS    | SERVICE  |            CONFIG            |     VALUE     |
+-------------+---------------+----------+------------------------------+---------------+
|   onther    | localhost     | ethstats | Banned addresses             |               |
|             |               |          | Login secret                 | onther        |
|             |               |          | Website address              | localhost     |
|             |               |          | Website listener port        | 80            |
|             |               |          | ---------------------------- | ------------- |
|             |               | nginx    | Shared listener port         | 80            |
+-------------+---------------+----------+------------------------------+---------------+

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
> 2

Which server do you want to interact with?
    1. onther@localhost
    2. Connect another server
> 1

What URL to listen on root chain JSONRPC?
> ws://127.0.0.1:8546
```

루트체인 JSONRPC에 로컬 머신에서 작동중인 루트체인 웹소켓(websocket) 주소를 적어준다.(`ws://127.0.0.1:8546`)

```text
Do you want expose HTTP JSONRPC endpoint (y/n)? (default=no)
> y

Which TCP port to expose? (default=8545)
> 8547

Which is virtual hostname? (default=localhost)
> localhost
```

사용자가 노드에 접근해 트랜잭션 보내려면 `HTTP JSONRPC endpoint` 콘솔에 `yes`를 선택해야 한다.

```
Where should data be stored on the remote machine?
> /home/ubuntu/.pls.user

Which TCP/UDP port to listen on? (default = 30305)
> 30306

How many peers to allow connecting? (default = 512)
> 512

How many light peers to allow connecting? (default = 256)
> 256

What should the node be called on the stats page?
> tokamak-usernode

Building bootnode
Step 1/4 : FROM onthertech/plasma-evm:latest
latest: Pulling from onthertech/plasma-evm
Digest: sha256:aa8029de17fb3da6c390545df4e05abae109ec6a45f12ecb22a0e0063b1aa276
Status: Downloaded newer image for onthertech/plasma-evm:latest
    ---> 1576e54d80ef
Step 2/4 : ADD genesis.json /genesis.json
    ---> 5c5992d4f1a2
Step 3/4 : RUN   echo $'geth --cache 512 init --rootchain.url ws://127.0.0.1:8546 /genesis.json' > geth.sh && 	echo $'exec geth --syncmode="full" --networkid 16 --rootchain.url ws://127.0.0.1:8546 --rpc --rpcaddr \'0.0.0.0\' --rpcport 8545 --rpcapi eth,net,debug --rpccorsdomain "*" --rpcvhosts=localhost --ws --wsorigins \'*\' --wsaddr \'0.0.0.0\' --wsport 8546 --cache 512 --port 30306 --nat extip:localhost --maxpeers 512 --lightpeers=256 --lightserv=50 --ethstats \'tokamak-mynode:onther@localhost\'    --miner.gastarget 0 --miner.gaslimit 0 --miner.gasprice 0' >> geth.sh
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

## 오퍼레이터 노드 설정하기
자식체인의 블록을 생성하는 오퍼레이터 노드를 구성한다. `Puppeth`를 사용하여 오퍼레이터 노드 설정하기 이전에 `Ethstats`과 사용자 노드(=`bootnode`)가 미리 구성되어 있어야 한다.

```text
What would you like to do? (default = stats)
1. Show network stats
2. Manage existing genesis
3. Manage tracked machines
4. Deploy network components
> 4

1. Tear down Ethstats on onther@localhost
2. Tear down Bootnode on onther@localhos
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
> 3

Which server do you want to interact with?
1. onther@localhost
2. Connect another server
> 1

What URL to listen on root chain JSONRPC?
> ws://127.0.0.1:8546
```

사용자 노드와 동일한 루트체인 `JSONRPC` 주소를 입력한다.

```text
Do you want expose HTTP JSONRPC endpoint (y/n)? (default=no)
> no

Do you want expose WebSocket JSONRPC endpoint (y/n)? (default=no)
> no

Where should data be stored on the remote machine?
> /home/ubuntu/.pls.oper

Where should the ethash mining DAGs be stored on the remote machine?
> /home/ubuntu/.pls.dag

Which TCP/UDP port to listen on? (default = 30305)
> 30307

How many peers to allow connecting? (default = 50)
> 50

How many light peers to allow connecting? (default = 0)
> 0

What should the node be called on the stats page?
> tokamak-operator
```

`~ be stored on the remote machine?` 에서 입력하는 디렉토리 주소는 `Docker` 컨테이너와 호스트가 공유하는 디렉토리로서 호스트 머신에서도 접근이 가능하다.

```
Please paste the operator's key JSON:
> {"address":"0x71562b71999873DB5b286dF957af199Ec94617F7","crypto":{"cipher":"aes-128-ctr","ciphertext":"","cipherparams":{"iv":"ad242d84297ce345ccb112aeef4c7260"},"kdf":"scrypt","kdfparams":{"dklen":32,"n":262144,"p":1,"r":8,"salt":""},"mac":"0ff7dce77d97b028116ffc8b813cb9811427aa571943903a746a4209a8193e7d"},"id":"f5b9dbf8-4015-4efa-8b1b-c31f5a657d82","version":3}

What's the unlock password for the account? (won't be echoed)
>

Please paste the challenger's key JSON:
> {"address":"3616be06d68dd22886505e9c2caaa9eca84564b8","crypto":{"cipher":"aes-128-ctr","ciphertext":"","cipherparams":{"iv":"a6645d1042360127f00d3496e44e542e"},"kdf":"scrypt","kdfparams":{"dklen":32,"n":262144,"p":1,"r":8,"salt":""},"mac":"1c8372bd858186872bd7d5558773b7e4c7f4c8ba90450228e5f7819cfec9dacf"},"id":"dfd37a93-4dd4-4c2a-b65e-0077d185906a","version":3}

What's the unlock password for the account? (won't be echoed)
>
```

오퍼레이터와 챌린저 계정은 루트체인에 잔고(Balance)가 있는 계정을 사용해야 한다.

```
What gas limit should empty blocks target (MGas)? (default = 7.500)
> 7.5

What gas limit should full blocks target (MGas)? (default = 10.000)
> 10

What gas price should the operator require (GWei)? (default = 1.000)
> 1
```

나머지는 기본값을 사용한다.

필요한 경우 `What gas limit should full blocks target?`의 값를 높여 오퍼레이터 노드가 생성하는 블록에서 더 많은 트랜잭션을 처리 할 수 있도록 한다.

```
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
Step 6/7 : RUN   echo $'geth --cache 512 init --rootchain.url ws://127.0.0.1:8546 /genesis.json' > geth.sh && 	echo 'mkdir -p /root/.ethereum/keystore/' >> geth.sh &&   echo 'cp /operator.json /root/.ethereum/keystore/' >> geth.sh && 	echo 'cp /challenger.json /root/.ethereum/keystore/' >> geth.sh && 	echo $'exec geth --syncmode="full" --networkid 16 --rootchain.url ws://127.0.0.1:8546 --operator 0x71562b71999873DB5b286dF957af199Ec94617F7 --rootchain.challenger 0x3616BE06D68dD22886505e9c2CaAa9EcA84564b8   --cache 512 --port 30305 --nat extip:127.0.0.1 --maxpeers 50  --ethstats \'tokamak-operator:onther@127.0.0.1\'   --unlock 0x71562b71999873DB5b286dF957af199Ec94617F7,0x3616BE06D68dD22886505e9c2CaAa9EcA84564b8 --password /signer.pass --mine --miner.gastarget 7500000 --miner.gaslimit 10000000 --miner.gasprice 1000000000' >> geth.sh
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

오퍼레이터 노드가 정상적으로 배포되는 경우 위와 같은 결과가 출력된다.


### 배포한 컨테이너 확인

`Puppeth`를 통해 로컬 환경에 `Ethstats`, `Bootnode`, `Nginx` 그리고 `Sealnode` 컨테이너를 생성하였다.

`Puppeth`에서의 컨테이너 조회 결과는 다음과 같다.

```text
+-------------+---------------+----------+------------------------------+----------------------------------------------------+
|   SERVER    |    ADDRESS    | SERVICE  |            CONFIG            |                        VALUE                       |
+-------------+---------------+----------+------------------------------+----------------------------------------------------+
|   onther    | localhost     | sealnode | CHallenger account           | 0x3616be06d68dd22886505e9c2caaa9eca84564b8         |
|             |               |          | Data directory               | /home/ubuntu/.pls.oper                             |
|             |               |          | Ethstats username            | tokamak-operator                                   |
|             |               |          | Gas ceil  (target maximum)   | 10.000 MGas                                        |
|             |               |          | Gas floor (baseline target)  | 7.500 MGas                                         |
|             |               |          | Gas price (minimum accepted) | 1.000 GWei                                         |
|             |               |          | Listener port                | 30305                                              |
|             |               |          | Operator account             | 0x71562b71999873DB5b286dF957af199Ec94617F7         |
|             |               |          | Peer count (all total)       | 50                                                 |
|             |               |          | Peer count (light nodes)     | 0                                                  |
|             |               |          | Root chain JSONRPC URL       | ws://127.0.0.1:8546                                |
|             |               |          | ---------------------------- | -------------------------------------------------- |
|             |               | bootnode | Data directory               | /home/ubuntu/.pls.user                             |
|             |               |          | Ethstats username            | tokamak-usernode                                   |
|             |               |          | JSONRPC HTTP port            | 8547                                               |
|             |               |          | JSONRPC VHOST                | localhost                                          |
|             |               |          | Listener port                | 30306                                              |
|             |               |          | Peer count (all total)       | 512                                                |
|             |               |          | Peer count (light nodes)     | 256                                                |
|             |               |          | Root chain JSONRPC URL       | ws://127.0.0.1:8546                                |
|             |               |          | ---------------------------- | -------------------------------------------------- |
|             |               | ethstats | Banned addresses             |                                                    |
|             |               |          | Login secret                 | onther                                             |
|             |               |          | Website address              | localhost                                          |
|             |               |          | Website listener port        | 80                                                 |
|             |               |          | ---------------------------- | -------------------------------------------------- |
|             |               | nginx    | Shared listener port         | 80                                                 |
+-------------+---------------+----------+------------------------------+----------------------------------------------------+
```

![Plasma-evm Private Testnet Architecture](assets/guides_private_testnet_puppeth.png)
