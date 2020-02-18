//////////////////////buyer deposit
AppBuyerDeposit = {
    web3Provider: null,
    contracts: {},
    currentAccount: {},
    addressBuyerDeposit: 0,
    price: 0,
    initWeb3: async function () {
        if (process.env.MODE == 'development' || typeof window.web3 === 'undefined') {
            AppBuyerDeposit.web3Provider = new Web3.providers.HttpProvider(process.env.LOCAL_NODE);
        }
        else {
            AppBuyerDeposit.web3Provider = web3.currentProvider;
        }
        web3 = new Web3(AppBuyerDeposit.web3Provider);
        return await AppBuyerDeposit.initContractBuyerDeposit();
    },
    initContractBuyerDeposit: async function () {
        await $.getJSON('DepositBuyer.json', function (data) {
            var BuyerDepositArtifact = data;
            AppBuyerDeposit.contracts.DepositBuyer = TruffleContract(BuyerDepositArtifact);
            AppBuyerDeposit.contracts.DepositBuyer.setProvider(AppBuyerDeposit.web3Provider);
        })
        return await AppBuyerDeposit.initContractBuyerDepositNextStep();
    },
    initContractBuyerDepositNextStep: async function () {
        web3.eth.getAccounts(function (error, accounts) {
            if (error) {
                console.log(error);
            }
            AppBuyerDeposit.currentAccount = accounts[2];
            let price_value = (AppBuyerDeposit.price * 3 * 1000000000000000000) / 10;
            AppBuyerDeposit.contracts.DepositBuyer.new({ value: price_value, from: AppBuyerDeposit.currentAccount }).then(instance => {
                // console.log("your addresss contract verifier");
                // console.log(instance.address);
                AppBuyerDeposit.addressBuyerDeposit = instance.address;
            }).catch(err => {
                console.log('error', err);
            });
        })
    },
    buyerDeposit: function (address, price_item) {
        //using account AppBuyerDeposit
        try {
            AppBuyerDeposit.contracts.DepositBuyer.at(address).then(async function (instance) {
                if (AppBuyerDeposit.currentAccount.length) {
                    await instance.sendEther.sendTransaction(address, price_item, { from: App.currentAccount })
                }
            })
        } catch (error) {
            console.log("error buyerDeposit: " + error);
        }
    },
    init: async function (_price) {
        AppBuyerDeposit.price = _price;
        return await AppBuyerDeposit.initWeb3();

    }
}