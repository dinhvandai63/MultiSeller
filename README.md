# ZeroD
## Getting Started
    *introduce project*
## Architecture
    *architecture project*
## Compatibility
    
|         | Version |
|---------|---------|
| nodejs  | 10.21.0 |
| npm     | 6.14.5  |
| truffle | 5.1.34  |
| Solidity| 0.5.16  |
| Web3    | 1.2.1   |
| zokrat  | 0.5.3   |

## Setup environment
### ethereum test network
download and run ganache from [ganache](https://www.trufflesuite.com/ganache)
### nodejs
```sudo apt install nodejs```

```sudo apt install npm ```

```npm install -g truffle ```
### zokrat for zksnark
```curl -LSfs get.zokrat.es | sh```

## Run project
### clone source
```git clone git@github.com:dinhvandai63/ZeroD.git```
### install package nodejs
```npm install```
### build contract and deploy to ganache
```truffle migrate```
### run project
```sudo npm run dev```
