---
id: how-to-build-new-optimism-layer2
title: Build new Optimism layer2
sidebar_label: Build new Optimism layer2
---

이 문서는 L2 솔루션의 옵티미스틱 롤업인 옵티미즘을 링키비(Rinkeby) 테스트넷에 배포하는 과정을 담고 있다.

## 준비사항

### 링키비 엔드포인트

링키비(Rinkeby) 테스트넷의 노드를 연결하기 위해서 [infura.io](https://infura.io)를 이용한다.
Infura 엔드포인트를 생성하기 위해서는 이 [문서](https://infura.io/docs)를 참조한다.

엔드포인트: `https://rinkeby.infura.io/v3/<API KEY>`

### 링키비 Account Privatekey

옵티미즘을 구동시키기 위해서는 3개의 Account가 필요하다. 잔액이 충분한 Account의 프라이빗키를 준비한다.

### AWS EC2 인스턴스

L2 체인을 `AWS EC2`에 구동시킨다. 본 문서는 [Amazon Linux 2](https://aws.amazon.com/ko/about-aws/whats-new/2017/12/introducing-amazon-linux-2/) 운영체제를 사용한다.
[이 문서](https://aws.amazon.com/ko/ec2/getting-started/)를 참조해 AWS EC2 인스턴스를 생성할 수가 있다.

## 설치

### AWS EC2에 접속

`AWS EC2`에 접속하여 설치를 시작한다. 자신의 `SSH 키`와 `EC2 주소`를 입력한다.
`Amazon Linux 2`의 SSH 접속 사용자는 `ec2-user` 이다.

```bash
ssh -i <ssh key> ec2-user@ec2-xx-xx-xx-xx.ap-northeast-2.compute.amazonaws.com
```

### Docker 설치

EC2에 `docker`를 설치하고 `ec2-user` 계정에 실행권한을 부여한다. 시작시 자동으로 docker 서비스가 실행되도록 한다.

```bash
sudo amazon-linux-extras install -y docker

sudo service docker start

sudo usermod -a -G docker ec2-user

sudo chkconfig docker on
```

### Docker Compose 설치

docker compose를 다운 받아서 실행할 수 있도록 한다.

```bash
sudo curl -L https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m) -o /usr/local/bin/docker-compose

sudo chmod +x /usr/local/bin/docker-compose
```

설치가 모두 완료되었으면 직접 실행하여 정상적으로 구동되는지 테스트 한다.

```bash
docker version

docker-compose version
```

### Develop Tools 설치

Amazon Linux2 OS에 Development Tool을 설치한다.

```
sudo yum groupinstall -y "Development Tools"
```

### optimism-deploy 레파지토리 복제

optimism을 쉽고 빠르게 구동시킬 수 있는 [optimism-deploy](https://github.com/Onther-Tech/optimism-deploy) 레파지토리를 복제한다.

```bash
git clone https://github.com/Onther-Tech/optimism-deploy

cd optimism-deploy
```

디렉토리의 구조는 다음과 같다.

<pre>
.
├── README.md
├── data
├── docker-compose-l1chain.yml
├── docker-compose-local.yml
├── docker-compose-metrics.yml
├── docker-compose-rpc-proxy.yml
├── docker-compose.yml
├── envs
│   ├── batches.env
│   ├── dtl.env
│   ├── geth.env
│   └── metrics.env
├── garafana-l2geth.json
├── metrics
│   ├── grafana
│   │   └── provisioning
│   │       ├── dashboards
│   │       │   └── config.yml
│   │       └── datasources
│   │           ├── influxdb.yml
│   │           └── prometheus.yml
│   ├── prometheus
│   │   └── prometheus.yml
│   └── scripts
│       └── dashboard-sync.py
└── optimism.sh
</pre>

* `data`: 옵티미즘에 구동되면서 생성되는 데이터가 저장
* `docker-compose-l1chain.yml`: optimism을 구동시키기 위한 l1chain 구동
* `docker-compose-local.yml`: Local 환경에서 L1 Chain과 옵티미즘을 구동
*  `docker-compose-metrics.yml`: geth metrics 구동
*  `docker-compose-rpc-proxy.yml`: RPC Proxy 구동
* `docker-compose.yml`: Remote Chain에 옵티미즘을 구동
* `env`: 옵티미즘 패키지들의 환경변수 파일
* `garafana-l2geth.json`: Garafana Dashboard 설정 파일`
* `metrics`: metrics를 위한 설정
* `optimism.sh`: 옵티미즘 구동을 쉽게 할 수 있는 쉘스크립트

### 환경변수 파일 생성

옵티미즘 구동에 필요한 환경변수 파일을 작성한다. `.env.example` 파일을 복사하여 사용한다.

```bash
cp .env.example .env
```

`.env`에 앞서 준비했던 내용으로 변경한다. `링키비(Rinkeby) 테스트넷 엔드포인트` 와 `3개 계정의 프라이빗키`를 입력한다.

**.env**

```
L1_NODE_WEB3_URL=https://rinkeby.infura.io/v3/<API KEY>

...

DEPLOYER_PRIVATE_KEY=<private key>
SEQUENCER_PRIVATE_KEY=<private key>
RELAYER_PRIVATE_KEY=<private key>
```

### 옵티미즘 스마트 컨트렉트 배포

`.env` 파일을 모두 수정했으면 옵티미즘 구동에 필요한 컨트렉트를  배포한다.

```bash
docker run --name deploy_contract --env-file .env onthertech/optimism.deployer
```
실행 후 링키비(Rinkeby) 테스트넷에 모든 스마트 컨트렉트를 배포하고 종료된다.
종료후에는 `addresses.json`과 `state-dump.latest.json` 파일을 가져온다.

```bash
mkdir -p data/contract_dumps

docker cp deploy_contract:/opt/optimism/packages/contracts/dist/dumps/addresses.json data/contract_dumps/

docker cp deploy_contract:/opt/optimism/packages/contracts/dist/dumps/state-dump.latest.json data/contract_dumps/
```

### 옵티미즘 실행

스마트 컨트렉트가 모두 배포되고 컨트렉트 주소파일이 생성되면 옵티미즘의 패키지들을 구동시킨다.

```bash
docker-compose  up -d

docker-compose logs -f
```

Log를 통해서 정상적으로 동작되는 것을 확인 할 수가 있다.

### `optimism.sh` 이용

`optimism.sh` 를 사용하면 편리하게 옵티미즘을 구동시킬 수가 있다.
`.env` 파일을 생성후에 `optimism.sh`를 이용한다.

사용법은 다음과 같다.

```
$ ./optimism.sh help

Usage:
  ./optimism.sh [Flags]
     [Flags]
        up
        down
        logs
        help
        --env-file <environment file> (default: .env)
        --tag, -t: <TAG> (default: latest)
        --clear, -c: clear data
        --datadir <data path>
        --metrics, -m: with metrics
```

**옵티미즘 시작**

```
./optimism.sh up
```

**옵티미즘 종료**

```
./optimism.sh down
```

**로그확인**

```
./optimism.sh logs
```
