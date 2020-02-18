/////////////////////////////Shipper Deposit///////////////////////
AppShipperDeposit = {
    web3Provider: null,
    contracts: {},
    currentAccount: {},
    addressShipperDeposit: 0,
    price: 0,
    name_item: "",
    address_dilivery: "",
    address_verifyTx: 0,
    app_not_deposit: false,
    initWeb3: async function () {
        if (process.env.MODE == 'development' || typeof window.web3 === 'undefined') {
            AppShipperDeposit.web3Provider = new Web3.providers.HttpProvider(process.env.LOCAL_NODE);
        }
        else {
            AppShipperDeposit.web3Provider = web3.currentProvider;
        }
        web3 = new Web3(AppShipperDeposit.web3Provider);
        return await AppShipperDeposit.initContractSellerDeposit();
    },
    initContractSellerDeposit: async function () {
        await $.getJSON('DepositShipper.json', function (data) {
            var ShipperDepositArtifact = data;
            AppShipperDeposit.contracts.DepositShipper = TruffleContract(ShipperDepositArtifact);
            AppShipperDeposit.contracts.DepositShipper.setProvider(AppShipperDeposit.web3Provider);
        })
        if (!AppShipperDeposit.app_not_deposit) {
            console.log("in app deposit: " + AppShipperDeposit.app_not_deposit);
            return await AppShipperDeposit.initContractShipperDepositNextStep();
        }
    },
    initContractShipperDepositNextStep: async function () {
        web3.eth.getAccounts(function (error, accounts) {
            if (error) {
                console.log(error);
            }

            AppShipperDeposit.currentAccount = accounts[3];
            let price_value = ((AppShipperDeposit.price * 3 * 1000000000000000000) / 10) +
                (AppShipperDeposit.price * 1000000000000000000);

            console.log("in here Shipper deposit: " + price_value);
            console.log("in here Shipper deposit account: " + AppShipperDeposit.currentAccount);
            AppShipperDeposit.contracts.DepositShipper.new({
                value: price_value, from: AppShipperDeposit.currentAccount
            }).then(instance => {
                //instance.address is address contract created
                AppShipperDeposit.addressShipperDeposit = instance.address;
                console.log("contract seller deposit: " + instance.address);
            }).catch(err => {
                console.log('error DepositShipper: ' + err);
            });
        })
    },

    init: async function (_price) {
        AppShipperDeposit.price = _price;
        AppShipperDeposit.app_not_deposit = false;

        return await AppShipperDeposit.initWeb3();
    }
}