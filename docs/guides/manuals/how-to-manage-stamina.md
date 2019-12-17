---
id: guides_manuals_how-to-manage-stamina
title: How to manage STAMINA
sidebar_label: How to manage STAMINA
---
> This Document Work In Progress

## 1. **GET PETH**

- 접속 가능한 Endpoint (https:/wallet.faraday.tokamak.network) 을 시작포인트로 하여 Plasma-evm 내에 PETH를 STAMINA 컨트렉트에 대해 Deposit하여 STAMINA를 얻는 방법에 대해서 Step-by-Step으로 설명
    - 3가지 타입의 PETH Base Asset // 개념 설명에서
        1. EtherToken
        2. Requestable ERC20
        3. Requestable Wrapper ERC20
    - Plasma Wallet에서 Enter Process
- Faraday Testnet의 경우 [https://faucet.faraday.tokamak.network](https://faucet.faraday.tokamak.network) 를 통해서 PETH를 얻을 수 있다.

### 2-a **Self Staking Stamina**

자기 자신의 PETH를 Staking 하여 Stamina를 얻을 수 있다

1. Metamask Network 선택 : Faraday
2. Plasma-Wallet의 S Dashboard 선택
3. [Optional] Min Deposit 확인
    
    토카막 플라즈마 체인의 Operator 정책마다 다르므로 확인해보아야 한다. 해당 값 미만으로는 Stamina를 위한 PETH 전송이 불가능하다.

4. Deposit 함수 선택
5. Deposit 값 입력
6. Tx 전송 및 생성된 Stamina 확인.

### 2-b **Get From Operator**

토카막 플라즈마 체인을 운영하는 오퍼레이터마다 스테미나 정책이 다르다. Operator가 지원하는 Stamina 운영정책에 따라 Delegator로 지정 될 수 있다. 

Faraday Testnet의 경우 Delegator 등록 페이지를 따로 운영하고 있으며,
아래는 Faraday Testnet 체인에서 사용할 수 있는 Stamina를 확인 하는 방법이다.

1. Metamask Network 선택 : Faraday
2. Input address에 자신의 Address를 입력하고 stamina를 get 한다.