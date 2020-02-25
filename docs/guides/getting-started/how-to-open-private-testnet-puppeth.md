---
id: how-to-open-private-testnet-puppeth
title: Puppeth 사용하여 프라이빗 테스트넷 설정하기
sidebar_label: Puppeth 사용하여 루트-자식체인 설정
---

이 가이드는 `Puppeth`를 사용하여 프라이빗 루트체인에 연결된 토카막 자식체인을 배포하는 과정을 다룬다.

`Puppeth`란 이더리움 노드 배포를 쉽게 할 수 있는 유틸리티 프로그램이다. `plasma-evm`의 `Puppeth`는 토카막 노드를 쉽게 구성 할 수 있도록 추가된 기능이 탑재 되어 있다. `Puppeth`를 사용하여 자식 체인을 설정하려면 이미 구동중인 루트체인이 필요하다. 테스트로 사용할 루트체인이 필요하다면 [루트체인 설정](how-to-open-private-testnet-rootchain#%EB%B6%80%EB%AA%A8-%EC%B2%B4%EC%9D%B8-%EC%84%A4%EC%A0%95%ED%95%98%EA%B8%B0)를 먼저 진행한다.

`Puppeth`에서 사용되는 용어를 먼저 정리하면 아래와 같다.

- `sealnode` : 오퍼레이터 노드, 블록을 생성하는 마이너 노드.

- `boodnode` : 사용자 노드, 트랜잭션을 오퍼레이터 노드에 전달하고 오퍼레이터 노드 동기화.

## `Puppeth` 환경 준비

> 루트체인으로 `ganache` 테스트체인을 사용하는 경우, `ganache` 실행시 생성된 계정을 오퍼레이터와 챌린저로 사용한다.

### 1. 네트워크 설정

사용자노드는 일종의 프록시 노드로서 `30306`, `8547`, `8548` 포트에 대해 외부에서 접속 할 수 있도록 설정해 주어야 한다.

예를들어, AWS EC2 사용한다면 아래와 같이 보안설정을 변경해 주어야 한다.

![AWS EC2 Instance Network Setting](assets/guides_private_testnet_network.png)

### 2. Docker & Docker compose 설정 
`Puppeth`를 사용하기 위해서는 원격 머신에 `Docker`와 `docker-compose`가 설치 되어 있어야 한다.

Ubuntu 18.04 이외에 운영체제별 `Docker` 설치에 관해서는 [외부 문서](https://docs.docker.com/install/#supported-platforms)를 참고한다.

다음은 Ubuntu 18.04 에서 Docker 설치를 위한 명령어이다.

```bash
~$ sudo apt-get remove docker docker-engine docker.io containerd runc -y
~$ sudo apt-get update
~$ sudo apt-get install apt-transport-https ca-certificates curl gnupg-agent software-properties-common -y
~$ curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo apt-key add -
~$ sudo add-apt-repository "deb [arch=amd64] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable"
~$ sudo apt-get update && sudo apt-get install docker-ce docker-ce-cli containerd.io docker-compose -y
```

아래 명령어를 실행함으로써 `Docker` 설치가 정상적으로 이루어졌는지 확인한다.
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

AWS EC2의 Ubuntu 18.04 인스턴스를 사용하는 경우, 기본 계정인 `ubuntu`를 `sudo` 없이 `docker` 명령어를 사용할 수 있도록 한다.

아래 명령어를 통해, 반드시 권한 설정을 해준다.

```bash
~$ sudo usermod -aG docker ubuntu
```

### 3. 원격 접속 키파일 등록

AWS EC2 와 같은 원격 Ubuntu 환경은 SSH 원격접속에 키파일이 필요하다.

`Puppeth`도 마찬가지로 SSH 원격접속에 키파일이 필요하다, 따라서 원격 환경내에 자신의 키파일을 가지고 있어야 한다.

자신이 등록한 키파일(e.g : `key.pem`)을 원격 환경에 전송하려면 자신의 로컬환경에서 아래 명령어를 실행한다.

```bash
local-machine ~$ scp -i ~/.ssh/key.pem ~/.ssh/key.pem ubuntu@<Remote Instance IP>:/home/ubuntu/.ssh/id_rsa
```

키파일이 정상적으로 복사되었다면 원격 환경에서 localhost SSH 접속이 가능하다.

원격환경 터미널 내에서 아래 명령어를 사용하여 올바른 키파일이 등록되어 있는지 확인한다.

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

### 4. 소스코드 다운로드 및 컴파일

 [https://github.com/onther-tech/plasma-evm](https://github.com/onther-tech/plasma-evm) 기준으로 진행된다.

 다음 명령어를 통해서 소스코드를 복제하고 `plasma-evm`을 컴파일을 진행한다.

```bash
~$ git clone https://github.com/onther-tech/plasma-evm
~$ cd plasma-evm && make all
```

> `make: *** ..` 에러 발생의 경우, 빌드환경이 구성되지 않은 상태이므로 [루트체인 설정](how-to-open-private-testnet-rootchain#%EB%B6%80%EB%AA%A8-%EC%B2%B4%EC%9D%B8-%EC%84%A4%EC%A0%95%ED%95%98%EA%B8%B0)를 진행한다.

컴파일을 마치면 `puppeth` 실행파일이 `plasma-evm/build/bin/` 에 생성된다.

### 5.  루트체인 컨트랙트 배포

`Puppeth`를 실행하기 전에, 자식체인이 사용할 루트체인 컨트랙트를 배포하고 해당 정보를 담은 `genesis` 파일을 생성한다. [프라이빗 테스트넷 직접 설정 - 2. 루트체인 컨트랙트 배포](how-to-open-private-testnet-manually#2-루트체인-컨트랙트-배포) 와 같이 `deploy` 커맨드를 사용하여 루트체인 컨트랙트 배포 후 `genesis.json` 파일을 생성한다.

> 해당 genesis.json 파일의 예시는 [faraday.json](https://github.com/Onther-Tech/plasma-evm-networks/blob/master/faraday-testnet/faraday.json) 에서 확인할 수 있다.

아래 커맨드로 `deploy.rootchain.sh` 스크립트 파일을 생성한다.

```bash
plasma-evm$ tee deploy.rootchain.sh <<'EOF'
#!/bin/bash

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
make geth && build/bin/geth --nousb \
    --rootchain.url "ws://$ROOTCHAIN_IP:8546" \
    --operator.key $OPERATOR_KEY \
    --datadir $DATADIR \
    deploy "./genesis.json" 16 true 4096

# deploy params : chainID, isInitialAsset, Epochlength
# you can checkout "$geth deploy --help" for more information
EOF
```

아래 명령어로 `deploy.rootchain.sh` 실행한다.

```bash
plasma-evm$ bash deploy.rootchain.sh
```

생성된 `genesis.json` 파일은 `plasma-evm` 폴더에 위치한다.

## Puppeth 실행 및 설정

### 1. `Puppeth` 실행

`build/bin/puppeth` 명령어로 `puppeth`를 실행한다.

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

자신이 정하고 싶은 임의의 `NETWORK NAME`을 입력한다.
입력한 `NETWORK NAME` 은 `Puppeth`가 네트워크를 식별하기 위해 `~/.puppeth/<NETWORK NAME>` 파일로 저장된다.

> `Puppeth`를 시작할때 이전에 사용한 `NETWORK NAME`을 입력하면 저장된 설정 값이 적용된다.

아래 [사용자 노드](how-to-open-private-testnet-puppeth)와 [오퍼레이터 노드 설정]((how-to-open-private-testnet-puppeth#오퍼레이터-노드-설정)) 과정은 `puppeth` 실행화면에서 작업을 수행한다.

### 2. `genesis` 파일 설정

`Puppeth`를 이용해 노드들을 설정하기 위해서 [Puppeth 준비 - 2. 루트체인 컨트랙트 배포](how-to-open-private-testnet-puppeth#2--루트체인-컨트랙트-배포)를 통해 생성한 `genesis.json` 파일이 필요하다.

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

### 3. 리모트 머신 추가

만약 MacOS 환경에 설치하고자 한다면, MacOS 운영체제 원격 로그인을 허용해야 한다.
이부분은 apple에서 제공하는 [macOS 사용 설명서 - Mac에서 원격 로그인 설정하기](https://support.apple.com/ko-kr/guide/mac-help/mchlp1066/mac) 부분을 참고한다.

`Puppeth` 화면에서 로컬 환경을 리모트 머신으로서 추가한다.

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

> 해당 주소를 통해 각 노드의 IP주소를 참고하기 때문에, 원격 접속 주소 사용시 `localhost(=127.0.0.1)` 사용하면 안된다.
  가급적 공인 IP(Public IP)를 사용한다.

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

> IP 주소 대신 도메인(Domain) 주소를 입력하는 경우, 리버스 프록시(Reverse Proxy) 서버로 사용되는 `Nginx`가 도메인 구문을 파싱하지 못한다. 따라서 IP 주소를 직접 넣어준다.

SSH키 파일을 사용하는경우 `onther:onther_private.pem@localhost` 와 같은 형태로 입력한다.

## 노드 컨테이너 배포

### 1. `Ethstats` 컨테이터 배포

`Puppeth`는 `ethstats`에 관한 정보가 없는 경우 실행 되지 않는다. 따라서 `ethstats` 노드를 먼저 배포해야 한다.

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

`Ethstats` 서버 연결을 위한 리버스 프록시가 먼저 구성된다. 계속해서 `Ethstats` 컨테이너를 생성하기 위해 도메인 주소(또는 IP 주소)와 비밀번호를 입력해준다.

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

### 2. 사용자 노드 컨테이너 배포

`Ethstats` 정보가 있어야 사용자 노드 컨테이너 생성이 가능하다. 따라서, [3. Ethstats 컨테이터 배포](how-to-open-private-testnet-puppeth#3-ethstats-컨테이터-배포)를 반드시 먼저 수행한다.

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

AWS와 같은 원격 호스트에서 `rootchain`이 작동중이라면, `Docker bridge network`의 IP 주소를 적어준다.(기본값 172.17.0.1)

만약, 생성된 `bootnode` 컨테이너가 rootchain 주소를 못찾는 경우 아래 명령어를 통해서 호스트 머신의 IP들 중 하나를 사용한다.

```bash
~$ ifconfig | grep "inet "
    inet 172.17.0.1  netmask 255.255.0.0  broadcast 172.17.255.255
    inet 172.18.0.1  netmask 255.255.0.0  broadcast 172.18.255.255
    inet 172.31.9.133  netmask 255.255.240.0  broadcast 172.31.15.255
    inet 127.0.0.1  netmask 255.0.0.0
```

> `127.0.0.1` 를 사용하는 경우, usernode 자신을 네트워크를 보게 되므로 호스트에서 동작중인 rootchain에 접속이 불가능하다.

`What URL to listen on root chain JSONRPC`에 입력 값으로 루트체인 웹소켓(websocket) 주소를 적어준다.( e.g `ws://172.17.0.1:8546`)

```text
Do you want expose HTTP JSONRPC endpoint (y/n)? (default=no)
> y

Which TCP port to expose? (default=8545)
> 8547

Which is virtual hostname? (default=172.17.0.1,localhost)
> 172.17.0.1
```

사용자가 해당 노드에 접근하도록 `HTTP JSONRPC endpoint` 콘솔에 `yes`를 입력 한다.

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
Step 3/4 : RUN   echo $'geth --cache 512 init --rootchain.url ws://172.17.0.1:8546 /genesis.json' > geth.sh && 	echo $'exec geth --syncmode="full" --networkid 16 --rootchain.url ws://172.17.0.1:8546 --rpc --rpcaddr \'0.0.0.0\' --rpcport 8545 --rpcapi eth,net,debug --rpccorsdomain "*" --rpcvhosts=localhost --ws --wsorigins \'*\' --wsaddr \'0.0.0.0\' --wsport 8546 --cache 512 --port 30306 --nat extip:52.198.169.75 --maxpeers 512 --lightpeers=256 --lightserv=50 --ethstats \'tokamak-mynode:ubuntu@localhost\'    --miner.gastarget 0 --miner.gaslimit 0 --miner.gasprice 0' >> geth.sh
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

나머지는 기본값을 입력하고, `Ethstats`에서 보여질 사용자 노드의 이름으로 `usernode`로 입력한다.

### 3. 오퍼레이터 노드 설정
자식체인의 블록을 생성하는 오퍼레이터 노드를 설정한다. `Puppeth`를 사용하여 오퍼레이터 노드 설정하기 이전에 `Ethstats`과 사용자 노드(=`bootnode`)가 미리 구성되어 있어야 한다.

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

사용자 노드와 동일한 루트체인 웹소켓(websocket) 주소를 입력한다.

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

`~ be stored on the remote machine?` 에서 입력하는 디렉토리 주소는 `Docker` 컨테이너와 호스트가 공유하는 디렉토리로, 호스트 머신에서 접근이 가능하다.

```

Which TCP/UDP port to listen on? (default = 30305)
> 30307

How many peers to allow connecting? (default = 50)
> 50

How many light peers to allow connecting? (default = 0)
> 0

What should the node be called on the stats page?
> operator

Please paste the operator's key JSON:
> {"address":"71562b71999873db5b286df957af199ec94617f7","crypto":{"cipher":"aes-128-ctr","ciphertext":"8b750c93fdecb295568a3a8f73531d2ce019393a65328de204bbdcae93ee7ba5","cipherparams":{"iv":"1c09cf80049e26f45d06f6d659df5194"},"kdf":"scrypt","kdfparams":{"dklen":32,"n":262144,"p":1,"r":8,"salt":"9eb4b1b5b1374d977fec0754eac926fde62723b5ce2dd304b707db034199007f"},"mac":"42e15aa26aa6bb3e274c518530f75f02d385cb4706bc639a95913a4f33134eb8"},"id":"8be79bc9-06ea-4328-8d9c-89440f19a25d","version":3}

What's the unlock password for the account? (won't be echoed)
>

Please paste the challenger's key JSON:
> {"address":"3616be06d68dd22886505e9c2caaa9eca84564b8","crypto":{"cipher":"aes-128-ctr","ciphertext":"58a35baf690ae21cd25af78141adf8282f731e5ac287e4e8703112e59484d0a4","cipherparams":{"iv":"1664f876800c39715641de011b6c7193"},"kdf":"scrypt","kdfparams":{"dklen":32,"n":262144,"p":1,"r":8,"salt":"9609b8b7c9f5082120306fdb0e7c69973869da60a7989a3f049e4cb93aa9871f"},"mac":"cfbd7959e0bc5a19493a8413f30a8ff450e4a28caff60d389df6718b17c8abaf"},"id":"1d9853e8-9478-4390-8f5c-f8d10447f749","version":3}

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

> `What gas limit should full blocks target?`의 값를 높여 오퍼레이터 노드가 생성하는 블록에서 더 많은 트랜잭션을 처리 할 수 있도록 한다.

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
Step 6/7 : RUN   echo $'geth --cache 512 init --rootchain.url ws://172.17.0.1:8546 /genesis.json' > geth.sh && 	echo 'mkdir -p /root/.ethereum/keystore/' >> geth.sh &&   echo 'cp /operator.json /root/.ethereum/keystore/' >> geth.sh && 	echo 'cp /challenger.json /root/.ethereum/keystore/' >> geth.sh && 	echo $'exec geth --syncmode="full" --networkid 16 --rootchain.url ws://172.17.0.1:8546 --operator 0x71562b71999873DB5b286dF957af199Ec94617F7 --rootchain.challenger 0x3616BE06D68dD22886505e9c2CaAa9EcA84564b8   --cache 512 --port 30305 --nat extip:52.198.169.75 --maxpeers 50  --ethstats \'tokamak-operator:ubuntu@52.198.169.75'   --unlock 0x71562b71999873DB5b286dF957af199Ec94617F7,0x3616BE06D68dD22886505e9c2CaAa9EcA84564b8 --password /signer.pass --mine --miner.gastarget 7500000 --miner.gaslimit 10000000 --miner.gasprice 1000000000' >> geth.sh
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

`Puppeth`를 통해 `Ethstats`, `Bootnode`, `Nginx` 그리고 `Sealnode` 컨테이너가 생성되었다.

`Puppeth`에서의 컨테이너 조회 결과는 다음과 같다.

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
|                      |               |          | Operator account             | 0x71562b71999873DB5b286dF957af199Ec94617F7   |
|                      |               |          | Peer count (all total)       | 50                                           |
|                      |               |          | Peer count (light nodes)     | 0                                            |
|                      |               |          | Root chain JSONRPC URL       | ws://172.17.0.1:8546                         |
+----------------------+---------------+----------+------------------------------+----------------------------------------------+
```

![Plasma-evm Private Testnet Architecture](assets/guides_private_testnet_puppeth.png)
