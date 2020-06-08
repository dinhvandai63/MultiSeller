var Web3 = require('web3');
var TruffleContract = require('truffle-contract');

App = {
    web3Provider: null,
    contracts: {},
    currentAccount: {},
    accountSeller: {},
    accountBuyer: {},
    accountShipper: {},
    id_item: 0,
    output0_p: 0,
    output1_p: 0,
    total_package_p: 0,
    package_verifier_p: [],
    initWeb3: async function () {
        if (process.env.MODE == 'development' || typeof window.web3 === 'undefined') {
            App.web3Provider = new Web3.providers.HttpProvider(process.env.LOCAL_NODE);
        }
        else {
            App.web3Provider = web3.currentProvider;
        }
        web3 = new Web3(App.web3Provider);
        return await App.initContractSeller();
    },
    initContractSeller: async function () {
        await $.getJSON('Seller.json', function (data) {
            var SellerArtifact = data;
            App.contracts.Seller = TruffleContract(SellerArtifact);
            App.contracts.Seller.setProvider(App.web3Provider);
        })
        return App.bindEvent();
    },
    bindEvent: function () {
        $('#Confirm_btnSellerok').click(App.Confirm_btnSellerok);
        $('#Confirm_btnSellerFailShipper').click(App.Confirm_btnSellerFailShipper);
        $('#Confirm_btnSellerFailBuyer').click(App.Confirm_btnSellerFailBuyer);

        $('#Confirm_btnShipperok').click(App.Confirm_btnShipperok);
        $('#Confirm_btnShipperFailBuyer').click(App.Confirm_btnShipperFailBuyer);
        $('#Confirm_btnBuyerok').click(App.Confirm_btnBuyerok);
        $('#Confirm_btnBuyerFailShipper').click(App.Confirm_btnBuyerFailShipper);
    },
    Confirm_btnSellerok: async function () {
        $name = $('#Confirm_ShipFail').val();
        web3.eth.getAccounts(function (error, accounts) {
            if (error) {
                console.log("error"+error);
            }
            App.accountSeller = accounts[1];
            App.contracts.Seller.deployed().then(async function (instance) {
                //save save package in contract
                //!@!@!@!@
                await instance.setFlagSeller.sendTransaction($name, 1, { from: App.accountSeller })
               alert($name);
            }).then(function (result) {
                // App.showMessage('Saved Successfully');
                // alert("Add Item Success!")
            }).catch(function (error) {
                // App.showError(error);
                // alert(error);
            })
        })
    },
    Confirm_btnSellerFailShipper: async function () {
        $name = $('#Confirm_ShipFail').val();
        web3.eth.getAccounts(function (error, accounts) {
            if (error) {
                console.log("error"+error);
            }
            App.accountSeller = accounts[1];
            App.contracts.Seller.deployed().then(async function (instance) {
                //save save package in contract
            await instance.setFlagSeller.sendTransaction($name, 2, { from: App.accountSeller })
               alert($name);
            }).then(function (result) {
                // App.showMessage('Saved Successfully');
                // alert("Add Item Success!")
            }).catch(function (error) {
                // App.showError(error);
                // alert(error);
            })
        })
    },
    Confirm_btnSellerFailBuyer: async function () {
        $name = $('#Confirm_ShipFail').val();
        web3.eth.getAccounts(function (error, accounts) {
            if (error) {
                console.log("error"+error);
            }
            App.accountSeller = accounts[1];
            App.contracts.Seller.deployed().then(async function (instance) {
                //save save package in contract
                await instance.setFlagSeller.sendTransaction($name, 3, { from: App.accountSeller })
               alert($name);
            }).then(function (result) {
                // App.showMessage('Saved Successfully');
                // alert("Add Item Success!")
            }).catch(function (error) {
                // App.showError(error);
                // alert(error);
            })
        })
    },
    Confirm_btnShipperok: async function () {
        $name = $('#Confirm_ShipFail').val();
        web3.eth.getAccounts(function (error, accounts) {
            if (error) {
                console.log("error"+error);
            }
            App.accountShipper = accounts[3];
            App.contracts.Seller.deployed().then(async function (instance) {
                //save save package in contract
                await instance.setFlagShipper.sendTransaction($name, 1, { from: App.accountShipper })
               alert($name);
            }).then(function (result) {
                // App.showMessage('Saved Successfully');
                // alert("Add Item Success!")
            }).catch(function (error) {
                // App.showError(error);
                // alert(error);
            })
        })
    },
    Confirm_btnShipperFailBuyer: async function () {
        $name = $('#Confirm_ShipFail').val();
        web3.eth.getAccounts(function (error, accounts) {
            if (error) {
                console.log("error"+error);
            }
            App.accountShipper = accounts[3];
            App.contracts.Seller.deployed().then(async function (instance) {
                //save save package in contract
                await instance.setFlagShipper.sendTransaction($name, 3, { from: App.accountShipper })
               alert($name);
            }).then(function (result) {
                // App.showMessage('Saved Successfully');
                // alert("Add Item Success!")
            }).catch(function (error) {
                // App.showError(error);
                // alert(error);
            })
        })
    },
    
    Confirm_btnBuyerok: async function () {
        $name = $('#Confirm_ShipFail').val();
        web3.eth.getAccounts(function (error, accounts) {
            if (error) {
                console.log("error"+error);
            }
            App.accountBuyer = accounts[2];
            App.contracts.Seller.deployed().then(async function (instance) {
                //save save package in contract
                await instance.setFlagBuyer.sendTransaction($name, 1, { from: App.accountBuyer })
               alert($name);
            }).then(function (result) {
                // App.showMessage('Saved Successfully');
                // alert("Add Item Success!")
            }).catch(function (error) {
                // App.showError(error);
                // alert(error);
            })
        })
    },
    
    Confirm_btnBuyerFailShipper: async function () {
        $name = $('#Confirm_ShipFail').val();
        web3.eth.getAccounts(function (error, accounts) {
            if (error) {
                console.log("error"+error);
            }
            App.accountBuyer = accounts[2];
            App.contracts.Seller.deployed().then(async function (instance) {
                //save save package in contract
                await instance.setFlagBuyer.sendTransaction($name, 2, { from: App.accountBuyer })
               alert($name);
            }).then(function (result) {
                // App.showMessage('Saved Successfully');
                // alert("Add Item Success!")
            }).catch(function (error) {
                // App.showError(error);
                // alert(error);
            })
        })
    },
    /*
    actor: who you are: selelr, buyer, shipper
    your flag: 
        1,2,3
        1 ok
        2 shipperF
        3 buyerF
    index package
    */
    template: async function (_actor, _flag) {
        $name = $('#Confirm_ShipFail').val();
        web3.eth.getAccounts(function (error, accounts) {
            if (error) {
                console.log("error"+error);
            }
            App.contracts.Seller.deployed().then(async function (instance) {
                switch(_actor){
                    case "Seller":
                        App.accountSeller = accounts[1];
                        break;
                    case "Buyer":
                        App.accountBuyer = accounts[2];
                        break;
                    case "Shipper":
                        App.accountShipper = accounts[3];
                        break;
                    default:
                        break;
                }
                //save save package in contract
                await instance.setFlagBuyer.sendTransaction($name, 2, { from: App.accountSeller })
            }).then(function (result) {
                // App.showMessage('Saved Successfully');
                alert(result)
            }).catch(function (error) {
                // App.showError(error);
                alert(error);
            })
        })
    },
    init: async function () {
        return await App.initWeb3();
    },
}

$(function () {
    $(window).load(function () {
        App.init();   
    });
});