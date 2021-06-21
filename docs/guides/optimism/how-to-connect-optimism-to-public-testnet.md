---
id: how-to-connect-optimism-to-public-testnet
title: How to connect Optimistic Rollup to public testnet
sidebar_label: Connect Optimistic Rollup
---

This document contains the process of deploying Optimism, an optimistic rollup of the L2 solution, to the Rinkeby testnet.

## Preparations

### Rinkeby Testnet Endpoint

[infura.io](https://infura.io) is used to connect nodes of the Linkeby testnet.
To create an Infura endpoint, refer to a [document](https://infura.io/docs).

endpoint: `https://rinkeby.infura.io/v3/<API KEY>`

### Rinkeby Testnet Account Privatekey

Three accounts are required to run Optimism. Prepare the account's private key with sufficient balance.

### AWS EC2 Instance

Run the L2 chain on `AWS EC2`. This document uses the [Amazon Linux 2](https://aws.amazon.com/ko/about-aws/whats-new/2017/12/introducing-amazon-linux-2/) operating system.
You can create an AWS EC2 instance by referring to a [document](https://aws.amazon.com/ko/ec2/getting-started/)]

## Install

### Connect to AWS EC2

Connect to `AWS EC2` and start the installation. Enter your own `SSH key` and `EC2 address`.
The SSH connection user of `Amazon Linux 2` is `ec2-user`.

```bash
ssh -i <ssh key> ec2-user@ec2-xx-xx-xx-xx.ap-northeast-2.compute.amazonaws.com
```

### Install Docker

Install `docker` on EC2 and give execution permission to `ec2-user` account. Make the docker service run automatically at startup.

```bash
sudo amazon-linux-extras install -y docker

sudo service docker start

sudo usermod -a -G docker ec2-user

sudo chkconfig docker on
```

### Install Docker Compose

Download docker compose and run it.

```bash
sudo curl -L https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m) -o /usr/local/bin/docker-compose

sudo chmod +x /usr/local/bin/docker-compose
```

When the installation is complete, run it directly to test whether it works normally.

```bash
docker version

docker-compose version
```

### Clone optimism-deploy repository

Clone the [optimism-deploy](https://github.com/Onther-Tech/optimism-deploy) repository, which allows you to run optimism quickly and easily.

```bash
git clone https://github.com/Onther-Tech/optimism-deploy

cd optimism-deploy
```

The directory structure is as follows.

<pre>
.
├── README.md
├── data
├── docker-compose-local.yml
├── docker-compose.yml
├── envs
│   ├── batches.env
│   ├── dtl.env
│   └── geth.env
└── optimism.sh
</pre>

* `data`: Data generated while driven by Optimism is stored
* `docker-compose-local.yml`: Driving Optimism in Local L1 Chain
* `docker-compose.yml`: Driving Optimism in Remote Chain
* `env`: Optimism packages environment variable files
* `optimism.sh`: A shell script that makes it easy to run Optimism

### Create environment variable file

Create an environment variable file required to run Optimism. Copy the `.env.example` file and use it.

```bash
cp .env.example .env
```

Change the contents prepared before `.env`. Enter 'Rinkeby testnet endpoint' and 'private key of 3 accounts'.

**.env**

```
L1_NODE_WEB3_URL=https://rinkeby.infura.io/v3/<API KEY>

...

DEPLOYER_PRIVATE_KEY=<private key>
SEQUENCER_PRIVATE_KEY=<private key>
RELAYER_PRIVATE_KEY=<private key>
```

### Optimism smart contract deployment

After all the `.env` files have been modified, the contract required to run Optimism is distributed.

```bash
docker run --name deploy_contract --env-file .env ethereumoptimism/deployer:0.3.4
```

After execution, all smart contracts are deployed on the Linkeby testnet and terminated.
After completion, import `addresses.json` and `state-dump.latest.json` files.

```bash
mkdir -p data/contract_dumps

docker cp deploy_contract:/opt/optimism/packages/contracts/dist/dumps/addresses.json data/contract_dumps/

docker cp deploy_contract:/opt/optimism/packages/contracts/dist/dumps/state-dump.latest.json data/contract_dumps/
```

### Execution Optimism

After execution, deploy all smart contracts on the Rinkeby testnet and exit.
After completion, import `addresses.json` and `state-dump.latest.json` files.

```bash
docker-compose  up -d

docker-compose logs -f
```

You can check whether it is operating normally through the log.

### Use `optimism.sh`

Using `optimism.sh`, you can conveniently run Optimism.
After creating a `.env` file, use `optimism.sh`.

The usage is as follows.

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
        --clear, -c: clear data
        --datadir <data path>
```

**Start Optimism**

```
./optimism.sh up
```

**Finish Optimism**

```
./optimism.sh down
```

**Show Logs**

```
./optimism.sh logs
```
