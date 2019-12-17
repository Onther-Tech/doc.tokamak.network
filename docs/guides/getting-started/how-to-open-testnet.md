---
id: guides_getting-started_how-to-open-testnet
title: How to open testnet
sidebar_label: How to open testnet
---
Plasma-evm Private Network 구성에 대해 Ubuntu 18.04 를 기준으로 작성되었다.

![Plasma-evm Private Testnet Architecture](assets/guides_private-testnet.png)

## Setup environment

golang이 구성되어 있지 않은 경우 아래를 수행하여 plasam-evm 컴파일 가능한 환경을 만들어 준다.

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
    
    ```shell
    # ~/.profile
    ....
    
    export GOROOT=/usr/local/go
    export GOPATH=$HOME/plasma
    export PATH=$GOPATH/bin:$GOROOT/bin:$PATH
    ```

## Setup rootchain

이더리움 테스트 체인인 ganache 또한 rootchain으로 사용할 수 있으나, 편의상 스크립트가 설정되어 있는 onther-tech/go-ethereum 를 사용한다.

rootchain에서 사용할 Operator와 Challenger 계정에 ETH 잔고가 있어야 한다. 특히, <U>Challenger 계정에 최소 0.5 ETH 이상이</U> 있어야 오퍼레이터 노드가 정상적으로 실행된다.

만약 Operator 계정의 ETH 잔고가 부족한 경우, Operator는 rootchain에 Tx를 전송 할 수 없게 되어  플라즈마 체인이 멈출 수 있으므로 주의해야 한다.

1. **Rootchain 으로 사용 할 go-ethereum 을 다운로드 한다.**
    ```bash
    $ git clone github.com/Onther-Tech/go-ethereum
    $ cd go-ethereum
    ```

2. **Running Script 확인** [Optional]

    onther-tech/go-ethereum 에 위치하고 있는 `run.rootchain.sh` 스크립트는 아래와 같다.

    ```bash
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
    ```
    `bash deploy.rootchain.sh` 를 통해서 `genesis.json` 파일을 생성한다.

    생성된 파일은 동일하게 `plasma-evm` 폴더 내에 위치한다.
    이 스크립트를 통해 생성되는 오퍼레이터와 첼린저 계정 정보는 다음과 같다.

    OPERATOR : 0x71562b71999873DB5b286dF957af199Ec94617F7

    CHALLENGER : 0x3616BE06D68dD22886505e9c2CaAa9EcA84564b8

3. **Run Rootchain**

    ```bash
    go-ethereum$ bash run.rootchain.sh
    ```

## Setup childchain (plasma-evm)

rootchain 으로 ganache 테스트체인을 사용하는 경우, ganache에서 생성된 계정을 Operator와 Challenger 로 사용하여야 한다.

### Manual
[Setup rootchain](guides_getting-started_how-to-open-testnet#setup-rootchain) 과정을 통해서 rootchain이 실행되고 있어야 한다. 
Operator 노드 실행시 JSON-RPC 사용하려면 `--rpc` flag를 사용하면 되지만, Operator 노드는 Operator 계정이 포함되어 있는 Keystore를 사용하므로  하지만 (가급적 보안을 위해) Operator 와 Usernode 를 구성한다.

**Run Operator Node** 

rootchain에 Operator Account의 잔고가 충분히 있어야 한다.
    
1. **Deploy Rootchain contract**

    deploy 커맨드의 입력인자로 [출력할 genesis 파일 이름] [ChainID] [Pre-Asset] [Epoch] 이다.

    ChainID : 고유 체인 숫자이다.

    Pre-Asset : Genesis 파일에 미리 PETH를 부여할지에 대한 여부이다. true인 경우 Plasma체인내의 Operator 계정에 PETH 잔고가 생성된다.

    Epoch : RootChain에 커밋할 Plasma 체인의 블록 갯수 이다. 4096의 경우 Plasma 체인의 4096블록 마다 rootchain에 1회 Tx를 전송한다.

    ```scripts
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
    ```

2. **Initialize**

    생성한 `Genesis.json` 파일
    ```bash
    plasama-evm$ geth init
    ```

3. **Create Operator Account Keystore**

    ```bash
    # Generate Operator Keyfile
    plasma-evm$ build/bin/geth account importKey b71c71a67e1177ad4e901695e1b4b9ee17ae16c6668d313eac2f96dbcda3f291 --datadir ./chaindata
    ```

    Plasma-evm의 geth 커맨드의 경우 private key hash 만으로 keystore 파일을 생성할 수 있다.

    ```bash
    INFO [08-27|16:14:38.878] Bumping default cache on mainnet         provided=1024 updated=4096
    INFO [08-27|16:14:38.879] Maximum peer count                       ETH=50 LES=0 total=50
    INFO [08-27|16:14:38.905] Set options for submitting a block       mingaspirce=1000000000 maxgasprice=100000000000 resubmit=0s
    Your new account is locked with a password. Please give a password. Do not forget this password.
    Passphrase:
    Repeat passphrase:
    ```

4. **Run node**

    만약, Operator Keystore 파일에 암호가 걸려 있는경우 `signer.pass` 파일 내부에 패스워드를 기록해주어야 한다. 암호가 없는 경우 signer.pass 는 아무런 내용이 없는 빈파일이 된다.

    Operator 노드 실행시 앞으로 구성해줄 Usernode의 enode 주소를 먼저 설정해 주도록 한다.

    ```bash
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
        --bootnodes "enode://4966a7e4621c2c0b1b1b3295b4a35ccc4224ba1d529bf5aa2323e4650f6075bd5eb6618372b2579965819347307f1f97315ce91b09ca342d60c2e98ad88db9f3@127.0.0.1:30307"
        --mine \
        --miner.gastarget 7500000 \
        --miner.gaslimit 10000000
    ```

**Run User Node**

사용자 노드는 Challenger Account를 flag에 추가 여부에 따라 Challenger 역할 을 수행하는 노드와 그렇지 않은 노드로 구분할 수 있다.

> Challenger Account는 최소한 의 Ether Amount(기본값은 0.5 ETH) 이상 예치되어 있는 경우 Challenger Account로 등록하여 사용할 수 있다.

1. **Get Repository & Compile**

    소스파일을 다운로드 받은 후 실행가능한 파일을 컴파일 한다.

    ```bash
    $ git clone https://github.com/onther-tech/plasma-evm
    $ cd plasma-evm
    plasma-evm$ make geth
    ```

2. **Initialize**

    Operator가 생성하여 공유한 genesis file을 사용한다.
    
    rootchain.url은 rootchain 컨트렉트가 배포된 체인의 Endpoint를 설정하여 준다.
    (여기서는 Local 환경에서 자신이 실행하고 있는 RootChain의 접속URL을 사용한다.)

    ```bash
    plasma-evm$ build/bin/geth init \
                --datadir ./chaindata \
                --rootchain.url ws://localhost:8546 \
                genesis.json
    ```

3. **Generate bootkey**

    Operator 노드에서 실행시 미리 지정한 enode 주소를 생성할 수 있도록 `boot.key`파일을 미리 생성해 둔다.

    ```bash
    plasma-evm$ echo "e854e2f029be6364f0f961bd7571fd4431f99355b51ab79d23c56506f5f1a7c3" > boot.key
    ```

4. **Run Node**

    Initialize를 반드시 수행해 주어야 하며, 동일한 datadir 을 사용하여야 한다.

    만약, Challenger도 같이 운영한다고 한다면 `--rootchain.challenger [Address]` 에 rootchain account를 추가해둔다.

    ```bash
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
        --nodekey boot.key \
        --port 30307 \
        --nat extip:::1 \
        --maxpeers 50
    ```

    > syncmode는 "full" 또는 "archive"를 선택해주어야 Operator 노드와 싱크가 된다.

    > 만약 geth의 Keystore를 직접 사용하는 경우 (즉, `--unlock [Address]` 사용시 ) 같이 `--allow-insecure-unlock` 추가해 준다.


### Puppeth

Plasma-evm 에서 보다 편하게 노드를 구성할 수 있도록 도와주는 프로그램이다.

**Deploy Rootchain contract And Generate genesis file**

Puppeth를 실행하기 이전에 rootchain에 필요한 컨트렉트와 genesis 파일을 생성한다.
[Manual](guides_getting-started_how-to-open-testnet#manual) 방법 과 동일하게 `deploy` 커맨드를 사용하여 Rootchain contract을 배포한후 Genesis 파일을 생성하는 스크립트를 작성한다.

```script
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

`bash deploy.rootchain.sh` 를 통해서 `genesis.json` 파일을 생성한다.

생성된 파일은 동일하게 `plasma-evm` 폴더 내에 위치한다.

**Prepare Puppeth**

plasma-evm 에서 제공하는 puppeth에는 Plasma-evm 여러 노드를 손쉽게 배포 할 수 있는 기능을 제공하고 있다. 아래 작업은 [https://github.com/onther-tech/plasma-evm](https://github.com/onther-tech/plasma-evm) 기준으로 설명한다.

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

자신이 지정하고 싶은 임의의 네트워크 이름을 입력한다.
이 `network name` 은 네트워크를 식별하기 위해 `~/.puppeth/[network name]` 파일로 저장된다.
다음 실행시 동일한 이름으로 입력하게 되면 해당 파일의 설정값이 그대로 로드된다.

**Setup for Boodnode**

먼저 Puppeth를 사용하기 위해서는 원격 머신에 Docker가 설치 되어 있어야 한다. 이 문서에서는 로컬 환경에 Docker가 설치 되어 있음을 전제로 하도록 하겠다. 
Host 환경별로 Docker 설치에 관해서는 [외부 문서](https://docs.docker.com/install/#supported-platforms)를 참고한다.

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
    > /home/ubuntu/plasma-evm/genesis.json
    ```

    제대로 import  되는 경우 아래와 같은 메시지가 출력되고 초기 선택화면으로 돌아간다.

    ```text
    INFO [12-12|05:45:32.124] Imported genesis block
    ```
    
2. **Add remote server**

    앞서 이야기 하였듯 Puppeth를 통한 Plasma-evm 노드를 배포하기 위해서는 원격 리모트 머신에 Docker가 설치되어 있어야하며 통신이 가능해야한다. 자신의 MacOS에 설치하는 경우라고 한다면 우선 원격 컴퓨터가 MacOS에 접근하도록 허용해 주어야 한다. 이부분은 apple에서 제공하는 [macOS 사용 설명서](https://support.apple.com/ko-kr/guide/mac-help/mchlp1066/mac) 부분을 참고한다.

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
    Info : IP address 대신 Domain을 입력하는 경우 Nginx가 구문을 파싱하지 못한다. 따라서 가급적이면 IP 를 직접 넣어준다.
    Info : 키 파일을 사용하는경우 `onther:onther_private.pem@localhost` 와 같은 형태로 입력하여 사용한다.

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
    > ws://127.0.0.1:8546
    ```

    rootchain JSONRPC는 localhost에서 작동하고 있는 Node 주소를 적어준다.

    ```text
    Do you want expose HTTP JSONRPC endpoint (y/n)? (default=no)
    > y
    
    Which TCP port to expose? (default=8545)
    > 8547
    
    Which is virtual hostname? (default=localhost)
    > localhost
    ```

    Bootnode를 접근하여 Transaction을 보내려면 HTTP JSONRPC endpoint를 반드시 열어주어야 한다.

    HTTP JSONRPC endpoint를 공개하는 경우 해당 Node의 keystore를 사용할 수 없다. 즉, geth 실행시 Keystore 접근 하는 Flag를 사용하는 경우 실행 되지 않도록 되어 있다.
    
    ```
    Where should data be stored on the remote machine?
    > /home/ubuntu/.pls.data.user
    
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

**Setup for Sealnode**

실제 블록을 생성하는 Operator(=sealnode) 노드를 구성한다. Sealnode 생성 이전에 ethstats, bootnode가 구성되어 있어야 한다.

```text
What would you like to do? (default = stats)
1. Show network stats
2. Manage existing genesis
3. Manage tracked machines
4. Deploy network components
> 4

1. Tear down Ethstats on onther@localhost
2. Tear down Bootnode on onther@localhost
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

Do you want expose HTTP JSONRPC endpoint (y/n)? (default=no)
>

Do you want expose WebSocket JSONRPC endpoint (y/n)? (default=no)
>

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

Please paste the operator's key JSON:
> {"address":"0x71562b71999873DB5b286dF957af199Ec94617F7","crypto":{"cipher":"aes-128-ctr","ciphertext":"","cipherparams":{"iv":"ad242d84297ce345ccb112aeef4c7260"},"kdf":"scrypt","kdfparams":{"dklen":32,"n":262144,"p":1,"r":8,"salt":""},"mac":"0ff7dce77d97b028116ffc8b813cb9811427aa571943903a746a4209a8193e7d"},"id":"f5b9dbf8-4015-4efa-8b1b-c31f5a657d82","version":3}

What's the unlock password for the account? (won't be echoed)
>

Please paste the challenger's key JSON:
> {"address":"3616be06d68dd22886505e9c2caaa9eca84564b8","crypto":{"cipher":"aes-128-ctr","ciphertext":"","cipherparams":{"iv":"a6645d1042360127f00d3496e44e542e"},"kdf":"scrypt","kdfparams":{"dklen":32,"n":262144,"p":1,"r":8,"salt":""},"mac":"1c8372bd858186872bd7d5558773b7e4c7f4c8ba90450228e5f7819cfec9dacf"},"id":"dfd37a93-4dd4-4c2a-b65e-0077d185906a","version":3}

What's the unlock password for the account? (won't be echoed)
>

What gas limit should empty blocks target (MGas)? (default = 7.500)
> 7.5

What gas limit should full blocks target (MGas)? (default = 10.000)
> 10

What gas price should the operator require (GWei)? (default = 1.000)
> 1

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

**Checking Deployed Containers**

로컬 환경을 원격으로 가정하고 Ethstats, Bootnode, Nginx 컨테이너를 생성하였다. 

결과 화면은 아래와 같이 Puppeth에서 조회 된다.

```text
+-------------+---------------+----------+------------------------------+----------------------------------+
|   SERVER    |    ADDRESS    | SERVICE  |            CONFIG            |               VALUE              |
+-------------+---------------+----------+------------------------------+----------------------------------+
|   onther    | localhost     | sealnode | Data directory               | /home/ubuntu/.pls.oper           |
|             |               |          | Ethstats username            | tokamak-operator                 |
|             |               |          | Listener port                | 30307                            |
|             |               |          | Peer count (all total)       | 512                              |
|             |               |          | Peer count (light nodes)     | 256                              |
|             |               |          | Root chain JSONRPC URL       | ws://127.0.0.1:8546              |
|             |               |          | ---------------------------- | -------------------------------- |
|             |               | bootnode | Data directory               | /home/ubuntu/.pls.user           |
|             |               |          | Ethstats username            | tokamak-usernode                 |
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