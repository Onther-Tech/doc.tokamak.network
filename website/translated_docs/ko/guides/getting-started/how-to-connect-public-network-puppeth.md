---
id: how-to-connect-public-testnet-puppeth
title: Connect to Public Testnet with Puppeth
sidebar_label: With Puppeth
---

`plasma-evm` 에서 제공하는 노드 배포 유틸리티 프로그램인 `Puppeth`를 통해 사용자 노드를 설정 한다.

## `Puppeth` 준비 및 실행하기

### 소스코드 다운로드 및 컴파일하기

`plasma-evm`에서 제공하는 `Puppeth`는 여러 노드를 손쉽게 배포 할 수 있는 기능을 제공하고 있다. 아래 과정은 [https://github.com/onther-tech/plasma-evm](https://github.com/onther-tech/plasma-evm) 기준으로 설명한다.

만약 해당 저장소가 없다면 아래 명령어를 통해서 소스코드를 복제 하고 컴파일을 수행한다.

```bash
$ git clone https://github.com/onther-tech/plasma-evm
$ cd plasma-evm && make all
```

컴파일이 정상적으로 완료되면, `puppeth` 실행파일은 `plasma-evm/build/bin/` 에 위치한다.

### `Puppeth` 실행하기

 `puppeth`를 실행하기 위해 `build/bin/puppeth` 명령어를 입력하여 실행한다.

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

자신이 설정하고 싶은 임의의 `NETWORK NAME`을 입력한다.
입력한 `NETWORK NAME` 은 `Puppeth`가 네트워크 설정을 구별하기 위해 `~/.puppeth/<NETWORK NAME>` 파일로 저장된다.
`Puppeth` 실행시 입력한 `NETWORK NAME`과 동일한 이름의 파일이 `~/.puppeth/` 에 위치하고 있으면, 해당 파일에 저장된 설정값을 불러온다.

>  불가피하게 `puppeth` 종료 / 재시작 하는 경우 동일한 `NETWORK NAME`을 입력하여 마지막으로 저장된 상태를 불러 올 수 있다.

다음, [페러데이 사용자 노드 연결하기](how-to-connect-public-testnet-puppeth#%ED%8E%98%EB%9F%AC%EB%8D%B0%EC%9D%B4-%EC%82%AC%EC%9A%A9%EC%9E%90-%EB%85%B8%EB%93%9C-%EC%97%B0%EA%B2%B0%ED%95%98%EA%B8%B0)는 계속해서 `puppeth` 실행화면 내에서 작업을 수행한다.

## 페러데이 사용자 노드 연결하기

### 1. `genesis` 설정하기

페러데이 테스트넷 사용자 노드를 연결하기 위해서는 오퍼레이터 노드의 `genesis` 파일이 필요하다.

해당 `genesis` 파일은 [github.com/onther-tech/plasma-evm-networks](https://github.com/Onther-Tech/plasma-evm-networks/tree/master/faraday-testnet) 의 [`faraday.json`](https://github.com/Onther-Tech/plasma-evm-networks/blob/master/faraday-testnet/faraday.json)를 통해 확인 할 수 있다.

`puppeth`는 `genesis` 파일을 http를 통해 불러 올 수 있다. 따라서,  `github` 에 업로드되어 있는 `faraday.json` 파일을 사용한다.

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

정상적으로 `genesis` 파일이 임포트(Import)되면 아래와 같은 메시지가 출력되고 `puppeth` 초기 선택화면으로 돌아간다.

```text
INFO [12-12|05:45:32.124] Imported genesis block
```

### 2. 리모트 머신 추가하기

`Puppeth`를 통해 사용자 노드를 배포하기 위해서는 리모트 머신에 `Docker`가 설치되어 있어야한다.

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
> IP 주소 대신 도메인 주소(e.g. user@tokamak.network)를 입력하는 경우, 정상적으로 진행되나 Nginx가 구문을 파싱하지 못하여 에러가 발생한다. 따라서 리모트 머신의 IP 주소를 사용한다.

> 리모트 머신 접속을 위해 인증서-키 파일을 사용하는경우 `onther:onther_private.pem@localhost` 와 같은 형태로 입력하여 사용한다.

### 3. `Ethstats` 컨테이너 배포하기

`Puppeth`는 `Ethstats`의 컨테이너 정보가 없는 경우 다른 노드 배포가 진행 되지 않는다. 따라서 `Ethstats` 노드를 가장 먼저 배포해주어야 한다.

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

`Ethstats` 서버 연결을 위한 리버스 프록시(Reverse Proxy)가 먼저 구성된다. 계속해서 `Ethstats` 컨테이너를 생성하기 위해 `Ethstats`가 사용할 도메인 주소(또는 IP 주소)과 비밀번호를 입력한다.

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

`Puppeth`내에서 `Bootnode`는 사용자 노드를 말한다.

그리고 사용자 노드는 `Ethstats` 정보를 가지고 있어야 배포가 가능하다.

따라서, [3. Ethstats 컨테이너 배포하기](how-to-connect-public-testnet-puppeth#3-ethstats-%EC%BB%A8%ED%85%8C%EC%9D%B4%EB%84%88-%EB%B0%B0%ED%8F%AC%ED%95%98%EA%B8%B0)를 먼저 수행해 주어야 한다.

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
> wss://rinkeby.infura.io/ws/v3/< PROJECT ID >
```

`~root chain JSONRPC`는 `Infura` 에서 제공하고 있는 `Rinkeby Testnet` 주소를 사용한다.
접속 가능한 `Infura`의 `Rinkeby Testnet` 주소가 없는 경우 [퍼블릭 테스트넷 연결 준비하기](how-to-connect-public-testnet-prepare)에 ["Rinkeby 루트체인 접속 주소 생성하기"](how-to-connect-public-testnet-prepare#rinkeby-%EB%A3%A8%ED%8A%B8%EC%B2%B4%EC%9D%B8-%EC%A0%91%EC%86%8D-%EC%A3%BC%EC%86%8C-%EC%83%9D%EC%84%B1%ED%95%98%EA%B8%B0)를 수행하여 접속가능한 주소를 얻는다.

```text
Do you want expose HTTP JSONRPC endpoint (y/n)? (default=no)
> y

Which TCP port to expose? (default=8545)
> 8547

Which is virtual hostname? (default=localhost)
> localhost
```

## 페러데이 사용자 노드 컨테이너

사용자 노드가 정상적으로 배포된 경우 아래와 같은 `Puppeth` 화면을 보게 된다.

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
