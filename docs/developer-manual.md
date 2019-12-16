---
id: developer-manual
title: Plasma-evm 개발자 메뉴얼
sidebar_label: 개발자 메뉴얼 
---

# plasma-evm 개발자 사용법

Tags: plasma-evm
Urgent?: Y
Writers: Jason Hwang, Jin S

---

# npm `plasma-evm-contracts`

- startEnter
- startExit
- ...

# How to open Private Testnet

Plasma-evm Private 구성에 대해 Ubuntu 18.04 를 기준으로 작성되었다.

![plasma%20evm/Plasma-evm-private-testnet.png](plasma%20evm/Plasma-evm-private-testnet.png)

## Setup Environment - Optional

Ubuntu 18.04 기준으로, golang이 구성되어 있지 않은 경우 아래를 수행하여 plasam-evm 컴파일 가능한 환경을 만들어 준다.

1. OS update

        ~$ apt-get update && apt-get upgrade -y
        
        ~$ apt-get install curl wget -y

2. go install (go 1.13.4)

    go 실행파일은 `/usr/local/` 경로 아래 위치하게 된다.

        ~$ wget https://dl.google.com/go/go1.13.4.linux-amd64.tar.gz
        
        ~$ tar -xvf go1.13.4.linux-amd64.tar.gz
        
        ~$ mv go /usr/local

3. GOPATH && GOROOT setting
GOPATH로 사용할 디렉토리를 생성하고 환경변수를 설정한다.

        ~$ export GOROOT=/usr/local/go
        
        ~$ mkdir -p $HOME/plasma
        
        ~$ export GOPATH=$HOME/plasma
        
        ~$ export PATH=$GOPATH/bin:$GOROOT/bin:$PATH

    재부팅시에도 해당 환경변수를 자동적으로 설정되도록 `.profile` 파일에 등록 해두는 것이 좋다.

        #~/.profile
        ..
        
        export GOROOT=/usr/local/go
        export GOPATH=$HOME/plasma
        export PATH=$GOPATH/bin:$GOROOT/bin:$PATH

## Setup rootchain

이더리움 테스트 체인인 ganache 또한 rootchain으로 사용할 수 있으나, 편의상 스크립트가 설정되어 있는 onther-tech/go-ethereum 를 사용한다.

중요한점은 rootchain 에서 Operator와 Challenger가 계정에 ETH 잔고가 있어야 한다. 그리고 Challenger 계정에는 최소 0.5 ETH 이상이 있어야 오퍼레이터 노드가 정상적으로 실행된다. 

1. Rootchain 으로 사용 할 go-ethereum 을 다운로드 한다.

        $ git clone github.com/Onther-Tech/go-ethereum
        $ cd go-ethereum

2. Running Script 확인[Optional]

    onther-tech/go-ethereum 에 위치하고 있는 `[run.rootchain.sh](http://run.rootchain.sh)` 스크립트는 아래와 같다.

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
          --miner.gastarget 7500000 \
          --miner.gasprice "10" \
          --rpc \
          --rpcport 8545 \
          --rpcapi eth,debug,net\
          --ws \
          --wsport 8546

    이 스크립트를 통해 생성되는 오퍼레이터와 첼린저 계정 정보는 다음과 같다.

    OPERATOR : 

    CHALLENGER :

    만약, ganache 테스트체인을 사용하는 경우, operator와 challenger 

3. Run Rootchain

    go-ethereum$ bash run.rootchain.sh	

## Setup childchain (plasma-evm)

### Manually

- Plasma-evm 다운로드부터 쭉쭉쭉
- [ TODO ] Usernode 추가

### Puppeth

- Puppeth 사용해서 네트워크 구성품 설정

- Prepare Puppeth
plasma-evm 에서 제공하는 puppeth에는 추가적인 기능이 포함되어 있다. 따라서 아래 작업은 [https://github.com/onther-tech/plasma-evm](https://github.com/onther-tech/plasma-evm) 기준으로 설명한다.
만약 해당 리포지토리가 없다면 아래 명령어를 통해서 소스코드를 복제 하고 컴파일을 수행한다.

        $ git clone https://github.com/onther-tech/plasma-evm
        $ cd plasma-evm && make all

    ( go1.13 버전을 사용하는 것을 추천한다.)
    컴파일을 완료하면 실행파일은 `plasma-evm/build/bin/` 에 위치한다.
    puppeth를 실행하기 위해서는 `build/bin/puppeth` 명령어를 입력하여 실행한다.

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

    자신이 지정하고 싶은 임의의 네트워크 이름을 입력한다.
    이 `network name` 은 네트워크를 식별하기 위해 `~/.puppeth/[network name]` 파일로 저장된다.
    다음 실행시 동일한 이름으로 입력하게 되면 해당 파일의 설정값이 그대로 로드된다.

- Setup for Boodnode 
먼저 Puppeth를 사용하기 위해서는 원격 머신에 Docker가 설치 되어 있어야 한다. 이 문서에서는 로컬 환경에 Docker가 설치 되어 있음을 전제로 하도록 하겠다. 
Host 환결별 Docker 설치에 관해서는 [외부 문서](https://docs.docker.com/install/#supported-platforms)를 참고한다.
    1. Genesis setup

        Puppeth를 통해서 자신의 Usernode를 설정하기 위해서는 genesis.json파일이 필요하다. Rinkeby 테스트넷 체인을 Rootchain으로 사용하고 있는 Faraday Testnet의 geneis.json 파일은 [github.com/onther-tech/plasma-evm-network](https://github.com/Onther-Tech/plasma-evm-networks/tree/master/faraday-testnet) 에 위치하고 있다.

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

        제대로 import  되는 경우 아래와 같은 메시지가 출력되고 초기 선택화면으로 돌아간다.

            INFO [12-12|05:45:32.124] Imported genesis block

    2. Add remote server
    앞서 이야기 하였듯 Puppeth를 통한 Plasma-evm 노드를 배포하기 위해서는 원격 리모트 머신에 Docker가 설치되어 있어야하며 통신이 가능해야한다. 자신의 MacOS에 설치하는 경우라고 한다면 우선 원격 컴퓨터가 MAC에 접근하도록 허용해 주어야 한다. 이부분은 apple에서 제공하는 [macOS 사용 설명서](https://support.apple.com/ko-kr/guide/mac-help/mchlp1066/mac) 부분을 참고한다.

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

        Info : IP address 대신 Domain을 입력하는 경우 Nginx가 구문을 파싱하지 못한다. 따라서 가급적이면 IP 를 직접 넣어준다.
        Info : 키 파일을 사용하는경우 `onther:onther_private.pem@localhost` 와 같은 형태로 입력하여 사용한다.

    3. Deploy Ethstats
    Puppeth 에서 기본적으로 ethstats의 정보가 없는 경우 진행이 되지 않는다. 동일한 네트워크 내에 ethstats 노드를 먼저 배포해주어야 한다.

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

        Ethstats 서버 연결을 위한 Reverse Proxy가 먼저 구성된다. 계속해서 Ethstats 노드를 생성하기 위해 Domain(or IP address)과 비밀번호를 입력해준다.

            Proxy deployed, which domain to assign? (default = localhost)
            > localhost
            What should be the secret password for the API? (must not be empty)
            > onther
            
            Found orphan containers (faraday_nginx_1) for this project. If you removed or renamed this service in your compose file, you can run this command with the --remove-orphans flag to clean it up.
            Building ethstats
            Step 1/2 : FROM puppeth/ethstats:latest
             ---> fb62abe59cb2
            Step 2/2 : RUN echo 'module.exports = {trusted: ["54.180.128.41", "52.79.245.79", "13.125.10.20"], banned: [], reserved: ["yournode"]};' > lib/utils/config.js
             ---> Running in ac7e749c51f5
            Removing intermediate container ac7e749c51f5
             ---> 276dd2683d00
            Successfully built 276dd2683d00
            Successfully tagged faraday/ethstats:latest
            Creating faraday_ethstats_1 ...
            Creating faraday_ethstats_1 ... done

    4. Deploy Bootnode
    오퍼레이터 외에 사용하는 노드들을 Bootnode(또는 Usernode)라고 한다. 기능적으로 마이닝을 할 수 없는 노드이다. Ethstats 정보를 가지고 있어야 Deploy가 가능하다.
    Warn : 3번 과정을 먼저 수행해 주어야 한다.

            +-------------+---------------+----------+------------------------------+---------------+
            |   SERVER    |    ADDRESS    | SERVICE  |            CONFIG            |     VALUE     |
            +-------------+---------------+----------+------------------------------+---------------+
            |   onther    | localhost     | ethstats | Banned addresses             |               |
            |             |               |          | Login secret                 | ??????        |
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
            > wss://rinkeby.infura.io/ws/v3/[PROJECT SECRET]

        Rootchain JSONRPC는 rootchain으로 사용되고 있는 Rinkeby 테스트넷 endpoint를 사용한다. [Infura](https://infura.io/)가 제공하는 네트워크 endpoint로 입력한다. 자신이 운영하고 있는 Rinkeby 노드가 있다면 해당 접근 endpoint를 입력해도 무방하다.

            Do you want expose HTTP JSONRPC endpoint (y/n)? (default=no)
            > y
            
            Which TCP port to expose? (default=8545)
            > 8545
            
            Which is virtual hostname? (default=localhost)
            > localhost

        Bootnode를 접근하여 Transaction을 보내려면 HTTP JSONRPC endpoint를 반드시 열어주어야 한다.
        Info : HTTP JSONRPC endpoint를 공개하는 경우 해당 Node의 keystore를 사용할 수 없다. 즉, geth 실행시 Keystore 접근 하는 Flag를 사용하는 경우 실행 되지 않도록 되어 있다.

            Where should data be stored on the remote machine?
            > /home/ubuntu/.pls.data
            
            Which TCP/UDP port to listen on? (default = 30305)
            > 30305
            
            How many peers to allow connecting? (default = 512)
            > 512
            
            How many light peers to allow connecting? (default = 256)
            > 256
            
            What should the node be called on the stats page?
            > faraday-mynode
            
            Building bootnode
            Step 1/4 : FROM onthertech/plasma-evm:latest
            latest: Pulling from onthertech/plasma-evm
            Digest: sha256:aa8029de17fb3da6c390545df4e05abae109ec6a45f12ecb22a0e0063b1aa276
            Status: Downloaded newer image for onthertech/plasma-evm:latest
             ---> 1576e54d80ef
            Step 2/4 : ADD genesis.json /genesis.json
             ---> 5c5992d4f1a2
            Step 3/4 : RUN   echo $'geth --cache 512 init --rootchain.url wss://rinkeby.infura.io/ws/v3/ /genesis.json' > geth.sh && 	echo $'exec geth --syncmode="full" --networkid 16 --rootchain.url wss://rinkeby.infura.io/ws/v3/ --rpc --rpcaddr \'0.0.0.0\' --rpcport 8545 --rpcapi eth,net,debug --rpccorsdomain "*" --rpcvhosts=localhost --ws --wsorigins \'*\' --wsaddr \'0.0.0.0\' --wsport 8546 --cache 512 --port 30305 --nat extip:localhost --maxpeers 512 --lightpeers=256 --lightserv=50 --ethstats \'faraday-mynode:onther@localhost\'    --miner.gastarget 0 --miner.gaslimit 0 --miner.gasprice 0' >> geth.sh
             ---> Running in 826cf2fe881a
            Removing intermediate container 826cf2fe881a
             ---> ed4330e0d27f
            Step 4/4 : ENTRYPOINT ["/bin/sh", "geth.sh"]
             ---> Running in 49f1003114a2
            Removing intermediate container 49f1003114a2
             ---> 120072c6f2ee
            Successfully built 120072c6f2ee
            Successfully tagged faraday/bootnode:latest
            Creating faraday_bootnode_1 ...
            Creating faraday_bootnode_1 ... done

        Where should data be stored .. 에 입력되는 경로의 경우 원격 머신 호스트에서 체인 데이터 파일을 저장하는 경로로 bootnode의 도커 컨테이너와 공유하고 있는 디렉토리 이다. 
        따라서 원격 이미 존재하는 경우 새로 생성되지 않고 그대로 사용하기 때문에 이미 원격머신에 생성되어 있지 않은 디렉토리를 사용하는 것이 좋다.

    - Setup for Sealnode
    실제 블록을 생성하는 Operator 노드를 구성한다. Sealnode 생성 이전에 ethstats, bootnode가 구성되어 있어야 한다.
        1. 
    1. Checking Deployed Containers [ TODO ] Add Operator node
    이 글에서는 로컬 환경을 원격으로 가정하고 Ethstats, Bootnode, Nginx 컨테이너를 생성하였다. 결과 화면은 아래와 같이 Puppeth에서 조회 된다.

            +-------------+---------------+----------+------------------------------+----------------------------------+
            |   SERVER    |    ADDRESS    | SERVICE  |            CONFIG            |               VALUE              |
            +-------------+---------------+----------+------------------------------+----------------------------------+
            |   onther    | localhost     | bootnode | Data directory               | /home/ubuntu/.pls.user           |
            |             |               |          | Ethstats username            | rankingball-usernode             |
            |             |               |          | JSONRPC HTTP port            | 8545                             |
            |             |               |          | JSONRPC VHOST                | localhost                        |
            |             |               |          | Listener port                | 30305                            |
            |             |               |          | Peer count (all total)       | 512                              |
            |             |               |          | Peer count (light nodes)     | 256                              |
            |             |               |          | Root chain JSONRPC URL       | wss://rinkeby.infura.io/ws/v3/   |
            |             |               |          | ---------------------------- | -------------------------------- | 
            |             |               | ethstats | Banned addresses             |                                  |
            |             |               |          | Login secret                 | ??????                           |
            |             |               |          | Website address              | localhost                        |
            |             |               |          | Website listener port        | 80                               |
            |             |               |          | ---------------------------- | -------------------------------- |
            |             |               | nginx    | Shared listener port         | 80                               |
            +-------------+---------------+----------+------------------------------+----------------------------------+
            

[TODO] 완성은 sealnode 가 나타나야 한다.

## How to register requestable contract in `RootChain`

- truffle 로 배포하는 과정
- faraday testnet / private testnet 별로 등록

# How to connect to public network

- bootnode 접속정보 공개

---

- 사용법
    - API - `npm plasma-evm-contracts`
        - contract abi + ?
    - **How to open testnet**

        [TODO] Private Plasma Testnet + bootnode + operator +

    - **Deploy requestable contract in faraday testnet**

         Rinkeby 테스트넷을 RootChain으로 사용하고 있는 Faraday 테스트넷은 아래와 같은 구조를 가지고 있다.

        [TODO] 프라이빗 환경에 맞는 경로로 수정.

        ![plasma%20evm/Faraday_Testnet_Architecture.jpg](plasma%20evm/Faraday_Testnet_Architecture.jpg)

        Setup for Boodnode 과정을 진행한경우 로컬 환경에 Faraday Usernode를 사용하여도 된다. (http://localhost:8545)

        Requestable-simple-token은 Plasma-evm 체인으로 Enter/Exit이 가능한 ERC20토큰으로 매우 단순한 구조를 가지고 있다. 이 세션에서는 해당 컨트렉트를 배포하고 연결하는

        Faraday Public API인 [https://api.faraday.tokamak.network를](https://api.faraday.tokamak.network를) Truffle Endpoint로 사용하여 Requestable 컨트렉을 배포할 수 있다.

        1. Prepare Contract Repos

                $ git clone https://github.com/Onther-Tech/requestable-simple-token/
                $ cd requestable-simple-token
                requestable-simple-token$ npm install 
                requestable-simple-token$ truffle compile

        2. Modify Endpoints

            [ TODO ] Local 환경 기준으로 접속정보 수정.

                # requestable-simple-token/truffle-config.js
                module.exports = {
                  networks: {
                    rootchain: {
                      host: 'wss://rinkeby.infura.io/ws/v3/[API KEY]',
                      port: 8545, // Check Port Number
                      gas: 7500000,
                      gasPrice: 1e9,
                      network_id: '*', // eslint-disable-line camelcase
                      websocket: true,
                    },
                    plasma: {
                      host: 'https://api.faraday.tokamak.network', // linux can directly access container ip address
                      gas: 4500000,
                      gasPrice: 1e9,
                      network_id: 16, // eslint-disable-line camelcase
                    },

        3. Deploy Requestable-simple-token at Rootchain

                # Token deploy into rootchain
                requestable-simple-token$ truffle migrate --reset --network plasma
                Using network 'rootchain'.
                
                Running migration: 1_initial_migration.js
                  Deploying Migrations...
                  ... 0x977bf8281453238b9da6e959aaee5beba96f68094005e74050edad0d8ea54565
                  Migrations: 0xe213d8b68ca3d01e51a6dba669de59ac9a8359ee
                Saving successful migration to network...
                  ... 0xaad4143f11787fdc55ae565e5befb16dd6df5a64a766d9c288f4225a8840235b
                Saving artifacts...
                Running migration: 2_deploy_contracts.js
                  Deploying RequestableSimpleToken...
                  ... 0xe4f578d8316428929f045c3ef82d6426e46e005ecd0f361eef9f138ecb5579ad
                  RequestableSimpleToken: 0x2139b5baf855eee55cdb5f19df50583585581ead
                Saving successful migration to network...
                  ... 0x26ca4cd6800e69779270e6cc24859ff2f243a1ceb97e61329bb46ea731f01b70
                Saving artifacts..

            배포된 RequestableSimpleToken 주소를 기록해둔다.

        4. Deploy Requestable-simpletoken at Childchain(Plasma-evm)

                # Token deploy into rootchain
                requestable-simple-token$ truffle migrate --reset --network plasma
                Using network 'plasma'.
                
                Running migration: 1_initial_migration.js
                  Replacing Migrations...
                  ... 0xc64be3520cd99a9a32d828a558234915c252ca294927f2089021cb3b16667541
                  Migrations: 0x3a220f351252089d385b29beca14e27f204c296a
                Saving successful migration to network...
                  ... 0x9db26ff84bafdfba4ccbe12bf105410e69f48737763373befe84a6b7fa4d6bbb
                Saving artifacts...
                Running migration: 2_deploy_contracts.js
                  Replacing RequestableSimpleToken...
                  ... 0x8f91715d603979a20134ab93388229ddbe65940a37b38fd2f3dded7886c07e03
                  RequestableSimpleToken: 0x537e697c7ab75a26f9ecf0ce810e3154dfcaaf44
                Saving successful migration to network...
                  ... 0x982d5b1a960b49270ac81d63bf5f27a1c5db9e87c25c372808c03aa4efbc3360
                Saving artifacts...

            배포된 RequestableSimpleToken 주소를 기록해둔다.

        5. Token Contract Mapping
        Rootchain에 배포되어 있는 rootchain 컨트렉트에서 `mapRequestableContractByOperator` 메소드를 통해 양쪽 체인간 토큰 주소를 연결한다. Operator만 가능하다.*

        예를 들어, Rootchain에 0x4321.. 주소를 가진 토큰 SMPL 있고, Childchain에 0x1234... 주소를 가진 토큰 SMPL 이 있다고 가정하자. 이때 Rootchain contract에서 `mapRequestableContractByOperator` 함수 입력인자로 (0x4321..., 0x1234...) 를 입력해주면 Childchain 에 토큰주소로 연결해준다.

            [truffle-console]
            Rootchain contract ( RootChain ) : 0xEF9e687255b20D714fbf0fe5082f53a05473D569
            RequestableSimpleToken ( RootChain ) : 0x2139b5baf855eee55cdb5f19df50583585581ead
            RequestableSimpleToken ( ChildChain ) : 0x537e697c7ab75a26f9ecf0ce810e3154dfcaaf44

                plasma-evm-contracts$ truffle console --network rootchain
                truffle(rootchain)> root = RootChain.at("0x880ec53af800b5cd051531672ef4fc4de233bd5d")
                // 중략 
                  allEvents: [Function: bound ],
                  address: '0x880ec53af800b5cd051531672ef4fc4de233bd5d',
                  transactionHash: null }
                truffle(rootchain)> root.mapRequestableContractByOperator("0x2139b5baf855eee55cdb5f19df50583585581ead", "0x537e697c7ab75a26f9ecf0ce810e3154dfcaaf44")
                // 중략
                // mapping 확인
                truffle(rootchain)> root.requestableContracts("0x2139b5baf855eee55cdb5f19df50583585581ead")
                '0x537e697c7ab75a26f9ecf0ce810e3154dfcaaf44'

            ~~* Rootchain contract는 Operator만 가능하므로 Rootchain과 Childchain 양쪽 모두 배포 완료되면 info@onther.io 로 두 컨트렉트 주소를 보내주시기 바랍니다.~~

    - **How to Setup Private Plasma-evm Client** (**Plasma-evm client**)

        ![plasma%20evm/Plasma-evm_Local-env_(3).png](plasma%20evm/Plasma-evm_Local-env_(3).png)

        참고 Local Environment Setup...
        [https://www.notion.so/onther/Local-Environment-Setup-ed1884ec74bc4237a6a9ba8b2c6a446d](https://www.notion.so/onther/Local-Environment-Setup-ed1884ec74bc4237a6a9ba8b2c6a446d)

        - [ Optional ] Setup Environment- TMI래... 마상
            1. OS update

                    ~$ apt-get update && apt-get upgrade -y
                    
                    ~$ apt-get install curl wget -y

            2. go install (go 1.13.4)

                go 실행파일은 `/usr/local/` 경로 아래 위치하게 된다.

                    ~$ wget https://dl.google.com/go/go1.13.4.linux-amd64.tar.gz
                    
                    ~$ tar -xvf go1.13.4.linux-amd64.tar.gz
                    
                    ~$ mv go /usr/local

            3. GOPATH && GOROOT setting
            GOPATH로 사용할 디렉토리를 생성하고 환경변수를 설정한다.

                    ~$ export GOROOT=/usr/local/go
                    
                    ~$ mkdir -p $HOME/plasma
                    
                    ~$ export GOPATH=$HOME/plasma
                    
                    ~$ export PATH=$GOPATH/bin:$GOROOT/bin:$PATH

                재부팅시에도 해당 환경변수를 자동적으로 설정되도록 `.profile` 파일에 등록 해두는 것이 좋다.

                    #~/.profile
                    ..
                    
                    export GOROOT=/usr/local/go
                    export GOPATH=$HOME/plasma
                    export PATH=$GOPATH/bin:$GOROOT/bin:$PATH

                go-ethereum을 대체할 수 있는 ganache 또한 rootchain으로 사용할 수 있으나, 편의상 스크립트가 설정되어 있는 onther-tech/go-ethereum 를 사용한다.

                1. Rootchain 으로 사용 할 go-ethereum 을 다운로드 한다.

                        $ git clone github.com/Onther-Tech/go-ethereum
                        $ cd go-ethereum

                2. Compile 

                        go-ethereum$ make geth

        - **Running node**
            - RootChain Node

                Run

                    go-ethereum$ bash run.rootchain.sh

            - Operator node

                RootChain에 Operator Account의 잔고가 충분히 있어야 한다.

                1. Deploy Rootchain contract

                    deploy 커맨드의 입력인자로 [출력할 genesis 파일 이름] [ChainID] [Pre-Asset] [Epoch] 이다.

                    ChainID : 고유 체인 숫자이다.

                    Pre-Asset : Genesis 파일에 미리 PETH를 부여할지에 대한 여부이다. true인 경우 Plasma체인내의 Operator 계정에 PETH 잔고가 생성된다.

                    Epoch : Rootchain에 커밋할 Plasma 체인의 블록 갯수 이다. 4096의 경우 Plasma 체인의 4096블록 마다 Rootchain에 1회 Tx를 전송한다.

                        #!/usr/bin/env bash
                        
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

                2. Initialize

                        geth init

                3. Create Operator Account Keystore

                        # Generate Operator Keyfile
                        plasma-evm$ build/bin/geth account importKey b71c71a67e1177ad4e901695e1b4b9ee17ae16c6668d313eac2f96dbcda3f291 --datadir ./chaindata

                    [ TODO ] Keystore 파일 생성하는 경우 추가 + mnemonic  

                    Plasma-evm의 geth 커맨드의 경우 private key hash 만으로 keystore 파일을 생성할 수 있다.

                        INFO [08-27|16:14:38.878] Bumping default cache on mainnet         provided=1024 updated=4096
                        INFO [08-27|16:14:38.879] Maximum peer count                       ETH=50 LES=0 total=50
                        INFO [08-27|16:14:38.905] Set options for submitting a block       mingaspirce=1000000000 maxgasprice=100000000000 resubmit=0s
                        Your new account is locked with a password. Please give a password. Do not forget this password.
                        Passphrase:
                        Repeat passphrase:
                        

                4. Run node

                    만약, Operator Keystore 파일에 암호가 걸려 있는경우 `signer.pass` 파일 내부에 패스워드를 기록해주어야 한다. 암호가 없는 경우 signer.pass 는 아무런 내용이 없는 빈파일이 된다.

                        plasma-evm$ build/bin/geth \
                          --datadir ./chaindata \
                          --syncmode="full" \
                          --networkid 16 \
                          --rootchain.url ws://localhost:8546 \
                          --operator 0x71562b71999873DB5b286dF957af199Ec94617F7 \
                          --port 30306 \
                          --nat extip:::1 \
                          --maxpeers 50 \
                          --unlock 0x71562b71999873DB5b286dF957af199Ec94617F7 \
                          --password signer.pass \
                          --mine \
                          --miner.gastarget 7500000 \
                          --miner.gaslimit 10000000
                        

                [ TODO ]

                - ref stake & delegate section
                - Run private testnet

                    - **deploy rootchain contract — PETH 연결지을 ERC20**
                    - deploy requestable contract in private testnet

            - User node ( + Challenger )

                사용자 노드는 Challenger Account를 Flag에 추가 여부에 따라 Challenger 역할 을 수행하는 노드와 그렇지 않은 노드로 구분할 수 있다.

                - Setup challenger account

                    먼저, Challenger Account는 최소한 의 Ether Amount(기본값은 0.5 ETH) 이상 예치되어 있는 경우 Challenge Account로 등록하여 사용할 수 있다.

                - TODO: byzantine fault detector
                - **Node Setup**
                    1. **Get Repository & Compile**
                    소스파일을 다운로드 받은 후 실행가능한 파일을 컴파일 한다.

                            $ git clone https://github.com/onther-tech/plasma-evm
                            $ cd plasma-evm
                            plasma-evm$ make geth

                    2. **Initialize**
                    Operator가 생성하여 공유한 genesis file을 사용한다.
                    rootchain.url은 rootchain 컨트렉트가 배포된 체인의 Endpoint를 설정하여 준다.
                    (여기서는 Local 환경에서 자신이 실행하고 있는 RootChain의 접속URL을 사용한다.)

                            plasma-evm$ build/bin/geth init \
                            						--datadir ./chaindata \
                            						--rootchain.url ws://localhost:8546 \
                            						genesis.json

                    3. **Run Node**

                        Initialize를 반드시 수행해 주어야 하며, 동일한 datadir 을 사용하여야 한다.

                        만약, Challenger도 같이 운영한다고 한다면 `--rootchain.challenger [Address]` 에 rootchain account를 추가해둔다.

                            plasma-evm$ build/bin/geth \
                              --datadir ./chaindata \
                              --syncmode="full" \
                              --networkid 16 \
                              --rootchain.url ws://localhost:8546 \
                              --rpc \
                              --rpcaddr '0.0.0.0' \
                              --rpcport 8547 \
                              --rpcapi eth,net,debug \
                              --rpccorsdomain "*" \
                              --rpcvhosts=localhost \
                              --ws \
                              --wsorigins '*' \
                              --wsaddr '0.0.0.0' \
                              --wsport 8548 \
                              --port 30306 \
                              --nat extip:::1 \
                              --maxpeers 50 
                            

                        WARN : syncmode는 "full" 또는 "archive"를 선택해주어야 Operator 노드와 싱크가 된다.

                        INFO : 만약 geth의 Keystore를 직접 사용하는 경우 (즉, `--unlock [Address]` 사용시 ) 같이 `--allow-insecure-unlock` 추가해 준다.

    - **How to Setup Public Network Plasma-evm Client**

        [TODO] ; 각구성별 파라미터 테이블 정도로 정리. + refer → usernode setting
        rootchain을 메인넷 또는 이더리움 테스트체인에 연결하여 누구나 접근 가능한(Enter/Exit 가능한) 체인을 구성하는 방법에 대해서 기술

        - Rinkeby - Plasma-evm
        - Mainnet - Plasma-evm
        - Mainnet - Plasam-evm - Plasma-evm (3rd layer possible)

- command line options
[ TODO ] 나중에 추가..
    - TODO: TON staking option — cli 부분 추가되어야 함
