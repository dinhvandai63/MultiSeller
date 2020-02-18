/////////////////Seller Deposit
AppSellerDeposit = {
    web3Provider: null,
    contracts: {},
    currentAccount: {},
    addressSellerDeposit: 0,
    price: 0,
    name_item: "",
    address_dilivery: "",
    address_verifyTx: 0,
    app_not_deposit: false,
    initWeb3: async function () {
        if (process.env.MODE == 'development' || typeof window.web3 === 'undefined') {
            AppSellerDeposit.web3Provider = new Web3.providers.HttpProvider(process.env.LOCAL_NODE);
        }
        else {
            AppSellerDeposit.web3Provider = web3.currentProvider;
        }
        web3 = new Web3(AppSellerDeposit.web3Provider);
        return await AppSellerDeposit.initContractSellerDeposit();
    },
    initContractSellerDeposit: async function () {
        await $.getJSON('DepositSeller.json', function (data) {
            var SellerDepositArtifact = data;
            AppSellerDeposit.contracts.DepositSeller = TruffleContract(SellerDepositArtifact);
            AppSellerDeposit.contracts.DepositSeller.setProvider(AppSellerDeposit.web3Provider);
            console.log("you app not deposit: " + AppSellerDeposit.app_not_deposit);
        })
        if (!(AppSellerDeposit.app_not_deposit)) {
            console.log("in app not deposit: " + AppSellerDeposit.app_not_deposit);
            return await AppSellerDeposit.initContractSellerDepositNextStep();
        }
    },
    initContractSellerDepositNextStep: async function () {
        web3.eth.getAccounts(function (error, accounts) {
            if (error) {
                console.log(error);
            }
            AppSellerDeposit.currentAccount = accounts[1];
            let price_value = (AppSellerDeposit.price * 3 * 1000000000000000000) / 10;
            console.log("in here seller deposit: " + price_value);
            //string memory _name, string memory _name_item,
            // uint _price, string memory _address,address _address_verifyTx
            AppSellerDeposit.contracts.DepositSeller.new({
                value: price_value, from: AppSellerDeposit.currentAccount
            }).then(instance => {
                //instance.address is address contract created
                AppSellerDeposit.addressSellerDeposit = instance.address;
                //set value for contract seller deposit  
                console.log("contract seller deposit: " + instance.address);
                console.log();
                instance.setValueFirst.sendTransaction(
                    AppSellerDeposit.name_item,
                    AppSellerDeposit.price,
                    AppSellerDeposit.address_dilivery,
                    AppSellerDeposit.address_verifyTx,
                    { from: AppSellerDeposit.currentAccount })
            }).catch(err => {
                console.log('error', err);
            });
        })
    },
    getPackageShip: async function () {
        web3.eth.getAccounts(function (error, accounts) {
            if (error) {
                console.log(error);
            }
            AppSellerDeposit.currentAccount = accounts[0];
            try {

                console.log("App.addressSellerDeposit: "+App.address_seller_deposit_p);
                AppSellerDeposit.contracts.DepositSeller.at(App.address_seller_deposit_p).then(async function (instance) {
                    let packages = [];
                    if (AppSellerDeposit.currentAccount.length) {
                        packages = await instance.getPackage.call({ from: AppSellerDeposit.currentAccount });
                    }
                    console.log("this getpackage ship: "+packages[0]+" ~ "+packages[2]);
                    App.showPackageShip(packages);
                })
            } catch (error) {
                console.log("error getPackageShip: " + error);
            }

        })
    },
    setAddressDelivery: function () {
        web3.eth.getAccounts(function (error, accounts) {
            if (error) {
                console.log(error);
            }
            AppSellerDeposit.currentAccount = accounts[3];
            try {
                AppSellerDeposit.contracts.DepositSeller.at(App.address_seller_deposit_p).then(async function (instance) {
                    let status;
                    if (App.currentAccount.length) {
                        status = await instance.shipPackage.sendTransaction({ from: AppSellerDeposit.currentAccount });
                        console.log("update setAddressDelivery " + status.receipt.status);

                        //update address shipper depsosit to Contract SellerDeposit
                        let price_item_temp = $('#shipper_Price').val();
                        console.log("shipper price: " + price_item_temp);

                        AppShipperDeposit.init(price_item_temp);
                        await sleep(1000);
                        App.init();
                        await sleep(1000);
                        
                        await AppSellerDeposit.setAddressShipperDeposit();
                        console.log("address shipper deposit: "+AppShipperDeposit.addressShipperDeposit);
                        await App.setAddressDepostInCTSeller(AppShipperDeposit.addressShipperDeposit);
                        // AppShipperDeposit.addressShipperDeposit();

                        
                        await alert("setPackage ship success!")
                    }
                })
            } catch (error) {
                console.log("error getPackageShip: " + error);
            }
        })
    },
    setAddressShipperDeposit: async function () {
        web3.eth.getAccounts(function (error, accounts) {
            if (error) {
                console.log(error);
            }
            //make sure account set address shipper deposit is account[3]
            AppShipperDeposit.currentAccount = accounts[3];
            try {
                AppSellerDeposit.contracts.DepositSeller.at(App.address_seller_deposit_p).then(async function (instance) {
                    let status;
                    if (App.currentAccount.length) {
                        status = await instance.setAddressShipperDeposit.sendTransaction(AppShipperDeposit.addressShipperDeposit, { from: AppShipperDeposit.currentAccount });
                        console.log("update setaddress shipper deposit in contract seller deposit " + status.receipt.status);
                    
                    }
                })
            } catch (error) {
                console.log("error getPackageShip: " + error);
            }

        })
    },
    //string memory _name, string memory _name_item,
    // uint _price, string memory _address,address _address_verifyTx
    //_address is address will dilivery in the real world
    init: async function (_name_item, _price, _address_dilivery, _address_verifyTx) {
        AppSellerDeposit.name_item = _name_item;
        AppSellerDeposit.price = _price;
        AppSellerDeposit.address_dilivery = _address_dilivery;
        AppSellerDeposit.address_verifyTx = _address_verifyTx;
        AppSellerDeposit.app_not_deposit = false;

        return await AppSellerDeposit.initWeb3();

    },
    init_notdeposit: async function (_deposit_ornot) {
        AppSellerDeposit.app_not_deposit = _deposit_ornot;
        return await AppSellerDeposit.initWeb3();
    }
}