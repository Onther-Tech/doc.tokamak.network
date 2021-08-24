---
id: optimism-build-environment
title: Build Optimism Environment
sidebar_label: Build Optimism Environment
---

해당 문서는 옵티미즘 레이어2를 위한 스마트 컨트랙트 개발 환경을 구성하는 방법을 담고 있다.

## 들어가기 전에

옵티미즘 레이어2 솔루션은 EVM과 호환되는 스마트 컨트랙트 실행 환경을 갖추고 있기 때문에, 레이어1의 스마트 컨트랙트 개발 환경과 거의 동일한 환경으로 레이어2 스마트 컨트랙트를 개발하고 배포할 수 있다. 아래에서는 레이어2 스마트 컨트랙트 개발을 위해 필요한 환경 구성 방법을 설명한다.

옵티미즘 레이어2를 활용하는 아주 간단한 예제를 [ㅁㅁ](ㅁㅁ)에서 참고할 수 있다.

## Layer1/2 Environment

옵티미즘 레이어2를 위한 스마트 컨트랙트 개발을 위해서는 레이어1, 레이어2 뿐만 아니라 각 레이어를 연결시키는 서비스들이 필요하다. 필요한 구성 요소들은 docker를 활용해 사용할 수 있으며, 아래와 같은 명령으로 개발 환경을 빌드하고 실행할 수 있다.

```bash
git clone https://github.com/Onther-Tech/optimism.git
cd optimism
yarn install

cd ops
export COMPOSE_DOCKER_CLI_BUILD=1 # these environment variables significantly speed up build time
export DOCKER_BUILDKIT=1
docker-compose build

docker-compose up -d
```

## package.json

Solidity 코드를 레이어2용 스마트 컨트랙트로 컴파일하기 위해 optimism의 hardhat plugin을 사용해야 하며, 아래 방법 중 한 가지 방법으로 추가할 수 있다.

### shell script

```bash
yarn add @eth-optimism/hardhat-ovm
```

### add dependency

```javascript
// package.json

...
"devDependencies": {
  "@eth-optimism/hardhat-ovm": "^0.2.2",
  ...
}
```

## hardhat.config.ts

옵티미즘 레이어2에 대한 정보를 hardhat 설정 파일에 등록하여, 네트워크 옵션에 따라 옵티미즘 레이어2를 위한 스마트 컨트랙트를 빌드할 수 있도록 아래 내용을 추가한다. 

```javascript
// hardhat.config.ts

import '@nomiclabs/hardhat-waffle'
import '@eth-optimism/hardhat-ovm'

...

module.exports = {
  solidity: "0.7.6",
  networks: {
    // Add this network to your config!
    optimism: {
       url: 'http://127.0.0.1:8545',
       accounts: { mnemonic: 'test test test test test test test test test test test junk' },
       gasPrice: 15000000,          
       ovm: true // This sets the network as using the ovm and ensure contract will be compiled against that.
    }
  }
}
```

## 스마트 컨트랙트 컴파일

아래와 같이 `optimism` 네트워크 옵션으로 컴파일 할 경우 옵티미즘 레이어2용 스마트 컨트랙트가 컴파일된다.

```bash
npx hardhat --network optimism compile
```

## 스마트 컨트랙트 테스트

위와 같이 컴파일한 스마트 컨트랙트를 활용하여 레이어2 환경에서 스마트 컨트랙트를 테스트해볼 수 있다. 단, 테스트를 실행하기 전에 테스트를 위한 레이어1/2 환경이 실행되어 있어야 한다.

```bash
npx hardhat --network optimism test
```
