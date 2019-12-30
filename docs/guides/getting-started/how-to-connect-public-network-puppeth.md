---
id: how-to-connect-public-testnet-puppeth
title: Puppeth 사용하여 퍼블릭 테스트넷 연결하기
sidebar_label: Puppeth 사용하여 연결하기
---

`plasma-evm` 에서 제공하는 노드 배포 유틸리티 프로그램인 `puppeth`를 통해 사용자 노드를 연결한다.

## `puppeth` 준비 및 실행하기

> 루트체인으로 `Rinkeby` 테스트넷을 사용하므로 `Rinkeby` 테스트넷에서 오퍼레이터(Operator)와 챌린저(Challenger)의 계정에 이더리움 잔고(Balance)가 필요하다.

### 소스코드 다운로드 및 컴파일하기

`plasma-evm`에서 제공하는 `Puppeth`에는 여러 노드를 손쉽게 배포 할 수 있는 기능을 제공하고 있다. 아래 작업은 [https://github.com/onther-tech/plasma-evm](https://github.com/onther-tech/plasma-evm) 기준으로 설명한다.

만약 해당 저장소가 없다면 아래 명령어를 통해서 소스코드를 복제 하고 컴파일을 수행한다.

```bash
$ git clone https://github.com/onther-tech/plasma-evm
$ cd plasma-evm && make all
```

컴파일을 완료하면 `puppeth` 실행파일은 `plasma-evm/build/bin/` 에 위치한다.

### `puppeth` 실행하기

컴파일을 완료하면 실행파일은 `plasma-evm/build/bin/` 에 위치한다. puppeth를 실행하기 위해서는 `build/bin/puppeth` 명령어를 입력하여 실행한다. ( go1.13 버전을 사용하는 것을 추천한다)

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
입력한 `Network name` 은 네트워크를 식별하기 위해 `~/.puppeth/[network name]` 파일로 저장된다.
다음 실행시 동일한 이름으로 입력하게 되면 해당 파일의 설정값을 불러온다.

> 사용자 노드와 오퍼레이터 노드 설정시 불가피하게 재시작 하는 경우 동일한 `network name`을 입력하므로써 이전 상태 저장값을 불러 올 수 있다.

사용자 노드 설정하는 방법에서는 계속해서 `puppeth` 실행화면에서 작업을 수행한다.

## 페러데이 사용자 노드 연결하기


### 1. `genesis` 설정하기

    `Puppeth`를 통해서 페러데이 테스트넷 사용자 노드를 연결하기 위해 오퍼레이터 노드의 `genesis` 파일이 필요하다.

    `github` 에 업로드되어 있는 `faraday.json` 파일을 사용한다.

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

    제대로 import  되는 경우 아래와 같은 메시지가 출력되고 초기 선택화면으로 돌아간다.

    ```text
    INFO [12-12|05:45:32.124] Imported genesis block
    ```

### 2. 리모트 머신 추가하기

`Puppeth`를 통해 사용자 노드를 배포하기 위해서는 원격 리모트 머신에 `Docker`가 설치되어 있어야한다.

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
> IP address 대신 Domain을 입력하는 경우 Nginx가 구문을 파싱하지 못한다. 따라서 원격 머신의 IP 를 직접 넣어준다.

> 키 파일을 사용하는경우 `onther:onther_private.pem@localhost` 와 같은 형태로 입력하여 사용한다.

### 3. `Ethstats` 컨테이너 배포하기

`Puppeth`에서 기본적으로 `ethstats`의 정보가 없는 경우 진행이 되지 않는다. 따라서 `ethstats` 노드를 먼저 배포해주어야 한다

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

`Ethstats` 서버 연결을 위한 리버스 프록시(Reverse Proxy)가 먼저 구성된다. 계속해서 `Ethstats` 컨테이너를 생성하기 위해 도메인 주소(또는 IP 주소)과 비밀번호를 입력해준다

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

오퍼레이터 외에 사용하는 노드들을 Bootnode(또는 Usernode)라고 한다. 기능적으로 마이닝을 할 수 없는 노드이다. Ethstats 정보를 가지고 있어야 Deploy가 가능하다.

3번 과정을 먼저 수행해 주어야 한다.

```text
+-------------+---------------+----------+------------------------------+---------------+
|   SERVER    |    ADDRESS    | SERVICE  |            CONFIG            |     VALUE     |
+-------------+---------------+----------+------------------------------+---------------+
|   onther    | localhost     | ethstats | Banned addresses             |               |
|             |               |          | Login secret                 | onther        |
|             |               |          | Website address              | localhost     |
|             |               |          | Website listener port        | 80            |
|             |               |          | ---------------------------- | -----[------- |
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
> wss://rinkeby.infura.io/ws/v3/[PROJECT ID]
```

rootchain JSONRPC는 Infura에서 제공하고 있는 Rinkeby Testnet 을 입력해준다.
Infura 계정이 없는 경우 [Run User Node](guides_getting-started_how-to-connect-public-network#run-user-node)에서 `1. Get rootchain Endpoint` 를 수행하여 접속가능한 URL 을 얻는다.

```text
Do you want expose HTTP JSONRPC endpoint (y/n)? (default=no)
> y

Which TCP port to expose? (default=8545)
> 8547

Which is virtual hostname? (default=localhost)
> localhost
```

## 페러데이 사용자 노드 컨테이너

사용자 노드가 정상적으로 배포된 경우 아래와 같은 `Puppeth` 화면을 보게 된다가

```text
+-------------+---------------+----------+------------------------------+----------------------------------+
|   SERVER    |    ADDRESS    | SERVICE  |            CONFIG            |               VALUE              |
+-------------+---------------+----------+------------------------------+----------------------------------+
|   onther    | localhost     | bootnode | Data directory               | /home/ubuntu/.pls.user           |
|             |               |          | Ethstats username            | faraday-usernode                 |
|             |               |          | JSONRPC HTTP port            | 8547                             |
|             |               |          | JSONRPC VHOST                | localhost                        |
|             |               |          | Listener port                | 30306                            |
|             |               |          | Peer count (all total)       | 512                              |
|             |               |          | Peer count (light nodes)     | 256                              |
|             |               |          | Root chain JSONRPC URL       | ws://127.0.0.1:8546              |
|             |               |          | ---------------------------- | -------------------------------- |
|             |               | ethstats | Banned addresses             |                                  |
|             |               |          | Login secret                 | onther                           |
|             |               |          | Website address              | localhost                        |
|             |               |          | Website listener port        | 80                               |
|             |               |          | ---------------------------- | -------------------------------- |
|             |               | nginx    | Shared listener port         | 80                               |
+-------------+---------------+----------+------------------------------+----------------------------------+
```
