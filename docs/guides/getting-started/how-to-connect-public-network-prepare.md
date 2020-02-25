---
id: how-to-connect-public-testnet-prepare
title: 퍼블릭 테스트넷 연결 준비하기
sidebar_label: 연결 준비하기
---

페러데이(Faraday)는 온더(Onther)에서 운영하고 있는 토카막 테스트넷(Tokamak Testnet)의 이름이다.

모든 토카막 자식체인과 같이 페러데이 테스트넷도 오퍼레이터(Operator)만 자식체인의 블록을 생성할 수 있다.<br>
이 가이드에서는 페러데이 테스트넷에 연결된 사용자 노드를 설정하는 방법에 대해 다룬다.

사용자 노드를 설정하는 방법은 크게 두 가지 이다.<br>
첫번째 방법은 [로컬 환경에서 직접 실행하는 방법 (퍼블릿 테스트넷 직접 연결하기)](how-to-connect-public-testnet-manually) 이고, <br>
두번째 방법은 [`puppeth`를 사용하여 실행하는 방법 (Puppeth 사용하여 퍼블릭 테스트넷 연결하기)](how-to-connect-public-testnet-manually) 이다.

## 환경 설정하기

Ubuntu 18.04 를 기준으로 작성되었다.

golang이 구성되어 있지 않은 경우, 아래를 수행하여 plasam-evm 컴파일 가능한 환경을 만든다.

### 1. golang(go 1.13.4) 설치 및 컴파일 환경설정

아래 명령어를 순차적으로 실행하여, go 실행파일을 `/usr/local/` 경로 아래 위치하게 한다.

```bash
~$ sudo apt-get update && sudo apt-get install make build-essential -y
~$ wget https://dl.google.com/go/go1.13.4.linux-amd64.tar.gz
~$ tar -xvf go1.13.4.linux-amd64.tar.gz
~$ sudo mv go /usr/local
```

### 3. GOPATH && GOROOT 설정하기

GOPATH로 사용할 디렉토리를 생성하고, 환경변수를 설정한다.

```bash
~$ export GOROOT=/usr/local/go
~$ mkdir -p $HOME/plasma
~$ export GOPATH=$HOME/plasma
~$ export PATH=$GOPATH/bin:$GOROOT/bin:$PATH
```

재부팅시에도 위의 환경변수를 자동적으로 설정되도록 하려면,  `~/.profile` 파일에 환경변수를 등록 해두는 것이 좋다.

```sh
# ~/.profile
....

export GOROOT=/usr/local/go
export GOPATH=$HOME/plasma
export PATH=$GOPATH/bin:$GOROOT/bin:$PATH
```

## 루트체인 접속 주소
사용자 노드를 실행하기 위해 루트체인에 접근할 수 있는 노드, 즉, 루트체인 접속 주소가 필요하다.<br>
이 가이드에서는 `Infura`가 제공하고 있는 테스트넷 노드를 사용한다. `Infura` 서비스를 통해 페러데이 테스트넷의 루트체인인 `Rinkeby` 테스트넷에 접속 가능한 주소를 가지고 있어야 한다.

만약, `Infura` 계정이 없는 [infura.io](https://infura.io/)사이트에서 가입을 통해 접속 주소(URL)을 얻을 수 있다.

### `Rinkeby` 루트체인 접속 주소 생성하기

사이트 가입이 완료된 경우, `Dashboard`의 `"CREATE NEW PROJECT"` 를 클릭하여 프로젝트를 생성한다.

그 다음, 아래와 같이 `PROJECT ID`를 조합하여 루트체인 접속 주소를 구성한다.

`wss://rinkeby.infura.io/ws/v3/[PROJECT ID]`

![Infura node ID](assets/guides_create-infura-node.png)
예) `wss://rinkeby.infura.io/ws/v3/c8a90eabc71448d1aaf6779752a22d26`

만약 자신이 운영하고 있는 Rinkeby Testnet 노드에 접속 가능하다면, <br> 해당 노드의 접속 주소를 위 `Infura` 접속 주소 대신 사용 가능하다.
