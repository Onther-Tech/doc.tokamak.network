---
id: guides_getting-started_how-to-connect-public-network
title: How to connect public testnet
sidebar_label: How to connect public testnet
---

Onther에서 운영하고 있는 Tokamak Testnet인 Faraday에 연결하는 노드구성 방법이다.

모든 Tokamak Plasma 체인이 그러하듯 Faraday Testnet의 경우도 Operator 이외에 블록생성할 수 없도록 구성되어 있다. 따라서, 이 가이드에서는 Faraday Testnet에 연결된 Usernode(bootnode)를 생성하는 과정을 다룬다.

Usernode를 구성하는 방법은 크게 두 가지로 자신의 컴퓨터 환경에서 직접 실행하는 [`Manually`](guides_getting-started_how-to-connect-public-network#Manually) 방식과 유틸리티인 puppeth를 사용하여 원격 머신에 설치되어 있는 docker를 기반으로 Usernode 컨테이너를 생성해주는 [`Puppeth`](guides_getting-started_how-to-connect-public-network#puppeth)를 방식이 있다.

## Manually
로컬 환경은 Ubuntu 18.04 를 기준으로 작성되었다.

### Setup environment

golang 컴파일 환경이 구성되어 있지 않은 경우 아래를 수행하여 plasam-evm 컴파일 가능하도록 한다.

1. **OS update**
    ```bash
    ~$ apt-get update && apt-get upgrade -y
    ~$ apt-get install curl wget -y
    ```

2. **go install (go 1.13.4)**

    go 실행파일은 `/usr/local/` 경로 아래 위치하게 된다.
    ```bash
    ~$ wget https://dl.google.com/go/go1.13.4.linux-amd64.tar.gz
    ~$ tar -xvf go1.13.4.linux-amd64.tar.gz
    ~$ mv go /usr/local
    ```

3. **GOPATH && GOROOT setting**
GOPATH로 사용할 디렉토리를 생성하고 환경변수를 설정한다.
    ```bash
    ~$ export GOROOT=/usr/local/go
    ~$ mkdir -p $HOME/plasma
    ~$ export GOPATH=$HOME/plasma
    ~$ export PATH=$GOPATH/bin:$GOROOT/bin:$PAT
    ```

    재부팅시에도 해당 환경변수를 자동적으로 설정되도록 `.profile` 파일에 등록 해두는 것이 좋다.
    
    ```sh
    # ~/.profile
    ....
    
    export GOROOT=/usr/local/go
    export GOPATH=$HOME/plasma
    export PATH=$GOPATH/bin:$GOROOT/bin:$PATH
    ```

### Run User Node
Usernode를 실행하기에 앞서 rootchain으로 사용하고 있는 체인에 접근할 수 있는 노드가 필요하다.
이 가이드에서는 Infura 서비스를 통해 Faraday Testnet의 rootchain인 Rinkeby 노드에 접속한다.
만약, Infura 계정이 없는 [infura.io](https://infura.io/)사이트에서 가입을 통해 endpoint URL을 얻을 수 있다.

1. **[Optional] Get rootchain(Rinkeby testnet) Endpoint**

    사이트 가입이 완료된 경우, Dashboard의 "CREATE NEW PROJECT" 를 클릭하여 생성.
    아래와 같이 `PROJECT ID`를 조합하여 rootchain URL을 구성한다.

    `wss://rinkeby.infura.io/ws/v3/[PROJECT ID]`

    ![Infura node ID](assets/guides_create-infura-node.png)
    예) `wss://rinkeby.infura.io/ws/v3/c8a90eabc71448d1aaf6779752a22d26`

    만약 자신이 운영하고 있는 Rinkeby Testnet 노드가 존재하는 경우 사용 가능하다.

2. **Genesis Initialize**

    공개되어 있는 Faraday testnet의 Genesis파일을 사용한다.
    [Faraday Testnet Genesis](https://github.com/Onther-Tech/plasma-evm-networks/tree/master/faraday-testnet) 파일은 onther-tech github에 위치하고 있다.

    rootchain.url은 rootchain 컨트렉트가 배포된 체인의 websocket Endpoint를 사용한다.

    아래 커맨드를 통해서 genesis 파일을 초기화 시켜준다.
    
    ```bash
    plasma-evm$ build/bin/geth init \
                --datadir ./chaindata \
                --rootchain.url wss://rinkeby.infura.io/ws/v3/[PROJECT ID] \
                https://raw.githubusercontent.com/Onther-Tech/plasma-evm-networks/master/faraday-testnet/faraday.json
    ```

    `--datadir` flag를 통해서 체인데이터가 저장될 위치를 설정할 수 있다. 이 경로는 plasma-evm 실행시 동일해야 한다.

3. **Run Node**

    Initialize 시 사용한 datadir과 동일한 주소를 사용해주어야 한다.
    만약, 로컬환경에서 Keystore를 사용하고 싶은 경우 실행시 `--allow-insecure-unlock` 를 추가하여 실행한다. 

    ```bash
    plasma-evm$ build/bin/geth \
        --datadir ./chaindata \
        --syncmode="full" \
        --networkid 16 \
        --rootchain.url wss://rinkeby.infura.io/ws/v3/[PROJECT ID] \
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

    > `--syncmode` 가 `full` 이어야 한다. full mode 일때만 싱크된다.

    Faraday Testnet 의 최신 상태가 궁금한 경우 [Faraday Explorer](http://explorer.faraday.tokamak.network/)를 참고한다.


## Puppeth

Plasma-evm 에서 제공하는 노드 배포 유틸리티 프로그램인 puppeth를 사용하여 usernode를 구성하는 방법이다.

### **Prepare Puppeth**

먼저 Puppeth를 사용하기 위해서는 원격 머신에 Docker가 설치 되어 있어야 한다. 이 문서에서는 로컬 환경에 Docker가 설치 되어 있음을 전제로 하도록 하겠다. 
Host 머신 환경별] Docker 설치에 관해서는 [외부 문서](https://docs.docker.com/install/#supported-platforms)를 참고한다.

Puppeth를 사용하려면 plasma-evm에 소스코드를 가지고 컴파일 함으로써 실행파일을 얻을 수 있다. 이 글에서는 [https://github.com/onther-tech/plasma-evm](https://github.com/onther-tech/plasma-evm) 사용한다.

만약 해당 리포지토리가 없다면 아래 명령어를 통해서 소스코드를 복제 하고 컴파일을 수행한다.

```bash
$ git clone https://github.com/onther-tech/plasma-evm
$ cd plasma-evm && make all
```

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

네트워크 이름을 입력한다. 입력된 네트워크 이름은 `~/.puppeth/[network-name]`으로 파일이 생성되며 puppeth 재실행시 이미 생성된 파일 이름을 입력하면 파일에 저장된 값을 불러온다.

### Deploy Usernode


1. **Genesis setup**

    Puppeth를 통해서 자신의 Usernode를 설정하기 위해서는 genesis.json파일이 필요하다.
    
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
    
2. **Add remote server**

    Puppeth를 사용하여 Plasma-evm 노드를 배포하기 위해서는 원격 리모트 머신에 Docker가 설치되어 있어야한다.

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

3. **Deploy Ethstats**

    Puppeth 에서 기본적으로 ethstats의 정보가 없는 경우 진행이 되지 않는다. 동일한 네트워크 내에 ethstats 노드를 먼저 배포해주어야 한다.

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

    Ethstats 서버 연결을 위한 Reverse Proxy가 먼저 구성된다. 계속해서 Ethstats 노드를 생성하기 위해 Domain(or IP address)과 비밀번호를 입력해준다.

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

4. **Deploy Bootnode**
    
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

5. **Result**

    Usernode(Bootnode)가 정상적으로 배포된 경우 아래와 같은 Puppeth 화면을 보게 된다.

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