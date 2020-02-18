var Web3 = require('web3');
var TruffleContract = require('truffle-contract');

App = {
    web3Provider: null,
    contracts: {},
    currentAccount: {},
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
        return App.getPackageShip();
    },
    getPackageShip: function () {
        web3.eth.getAccounts(function (error, accounts) {
            console.log("2. App.getpackage");
            if (error) {
                App.showError(error);
            }
            App.currentAccount = accounts[0];
            try {
                App.contracts.Seller.deployed().then(async function (instance) {
                    //content information of package
                    let packages = [[]];
                    let temp_arr_need_delete = [];
                    let total_package = 0;
                    if (App.currentAccount.length) {
                        //get total number packages
                        total_package = await instance.getTotalPackage.call({ from: App.currentAccount });
                        App.total_package_p = total_package;
                        //get value from contract
                        for (i = 0; i < total_package; i++) {
                            packages[i] = await instance.getPackageSelledForShipper.call(i, { from: App.currentAccount });
                        } 
                        //delete package not verify

                        for (i = 0; i < total_package; i++) {
                            if(packages[i][1] == "" ){
                                packages.splice(i,1);
                            }
                        }                   
                        //create UI form
                        App.createFormShowItem(packages); 
                        //add event in button buy
                        App.bindEvents(total_package);
                        //show item to UI
                        App.showPackage(packages);
                    }
                   
                })
            } catch (error) {
                console.log("error getPackage: " + error);
            }
        })
    },  
    showPackage: function (packages) {
        for(i=0;i<packages.length;i++){
            $('#shipper_Name'+i).text(packages[i][1]);
            $('#shipper_Price'+i).text(packages[i][2]);
            $('#shipper_Address'+i).text(packages[i][3]);
        }  
    },
    bindEvents: function (total_packages) {
        for(i=0;i<total_packages;i++){
            $('#btnShip'+i).click(App.requireShipPackage);
            $('#btnShipCheckStatus'+i).click(App.requireCheckStatus);
        }
    },
    requireShipPackage: async function () {
        //funtion get id package when  user click
        //this.id is name of id button user just clicked
        //last character in id is index package
        let id_element = this.id;
        let index_package = id_element[id_element.length-1];
        $name = $('#shipper_Name'+index_package).text();

        var $name_temp = confirm("you buyer ship item: " + $name);
        
        App.contracts.Seller.deployed().then(async function (instance) {
            try {
                //get price
                let package = [];
                package = await instance.getPackageSelledForShipper.call(index_package, { from: App.currentAccount });
                let price = package[2];
                await AppShipperDeposit.init(price, index_package)
                alert("deposit: "+$name+" success!")
            } catch (err) {
                console.log("errror when update conract: " + err);
            }
        })
    },
    setShipperDeposit: async function (_id, _address) {
        App.contracts.Seller.deployed().then(async function (instance) {
            try {
                package = await instance.setShipperDepositAddress.sendTransaction(_id, _address, {  from: App.currentAccount  });
                alert("set deposit: "+$name+" success!")
            } catch (err) {
                console.log("errror when update conract: " + err);
            }
        })
    },
    requireCheckStatus: async function () {
        //funtion get id package when  user click
        //this.id is name of id button user just clicked
        //last character in id is index package
        let id_element = this.id;
        let index_package = id_element[id_element.length-1];
        $name = $('#shipper_Name'+index_package).text();
        
        await App.contracts.Seller.deployed().then(async function (instance) {
            if (App.currentAccount.length) {
                await instance.getAddressVerifier.call(index_package, { from: App.currentAccount }).then(async function (instance) {
                    console.log("step 2")
                    App.address_verifier_p = instance; 
                    await AppVerifier.watchStatus(instance);                
                })
            }
        })
    },
    init: async function () {
        console.log( "1. App.init");
        return await App.initWeb3();
    },
    createFormShowItem: function (packages) {
        var i = 0;
        for(j=0; j< packages.length;j++){
            if(packages[0][1]==undefined){
                break;
            }
			//add div
		  	var div_seller = document.createElement("div"); 
		  	div_seller.className = "card"
			div_seller.id = "seller"+i;
			document.body.appendChild(div_seller); 

			//add name, price, detail, btnBuy
			var h1_name = document.createElement("h1");
			h1_name.id = "shipper_Name"+i;
			h1_name.innerHTML = "Tailored Jeans";

			var p_price = document.createElement("p"); 
			p_price.id = "shipper_Price"+i;
			p_price.className = "price";
			p_price.innerHTML = "10";

			var p_shipper_address = document.createElement("p"); 
			p_shipper_address.id = "shipper_Address"+i;
			p_shipper_address.innerHTML = "Lorem jeamsun denim lorem jeansum.";

			var p_ = document.createElement("p"); 
			p_.id = "pContentButton"+i;

			var button_ship = document.createElement("button"); 
			button_ship.type = "button";
			button_ship.id = "btnShip"+i;	
            button_ship.innerHTML = "Ship Item";
            
            var button_check_status = document.createElement("button"); 
			button_check_status.type = "button";
			button_check_status.id = "btnShipCheckStatus"+i;	
			button_check_status.innerHTML = "Check Status";
			
			document.getElementById(div_seller.id).appendChild(h1_name);
			document.getElementById(div_seller.id).appendChild(p_price);
			document.getElementById(div_seller.id).appendChild(p_shipper_address);
			document.getElementById(div_seller.id).appendChild(p_);
            document.getElementById(p_.id).appendChild(button_ship);
            document.getElementById(p_.id).appendChild(button_check_status);
 			i++;
        }
    },
}


// A $( document ).ready() block.
AppShipperDeposit = {
    web3Provider: null,
    contracts: {},
    currentAccount: {},
    addressShipperDeposit: 0,
    price: 0,
    name_item: "",
    address_dilivery: "",
    address_verifyTx: 0,
    app_deposit: true,
    initWeb3: async function () {
        if (process.env.MODE == 'development' || typeof window.web3 === 'undefined') {
            AppShipperDeposit.web3Provider = new Web3.providers.HttpProvider(process.env.LOCAL_NODE);
        } else {
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
        if (AppShipperDeposit.app_deposit) {
            console.log("in app deposit: " + AppShipperDeposit.app_deposit);
            return await AppShipperDeposit.initContractShipperDepositNextStep();
        }
    },
    initContractShipperDepositNextStep: async function () {
        web3.eth.getAccounts(function (error, accounts) {
            if (error) {
                console.log(error);
            }

            AppShipperDeposit.currentAccount = accounts[3];
            let price_value = (AppShipperDeposit.price * 13)/10;

            console.log("in here Shipper deposit: " + price_value);
            console.log("in here Shipper deposit account: " + AppShipperDeposit.currentAccount);
            AppShipperDeposit.contracts.DepositShipper.new({
                value: price_value, from: AppShipperDeposit.currentAccount
            }).then(instance => {
                //instance.address is address contract created
                AppShipperDeposit.addressShipperDeposit = instance.address;
                console.log("contract seller deposit: " + instance.address);
                console.log("id package: "+ AppShipperDeposit.id);
                //set address shipper deposit
                App.setShipperDeposit(AppShipperDeposit.id, instance.address)
            }).catch(err => {
                console.log('error DepositShipper: ' + err);
            });
        })
    },

    init: async function (_price, _id) {
        AppShipperDeposit.price = _price;
        AppShipperDeposit.app_deposit = true;
        AppShipperDeposit.id = _id;
        return await AppShipperDeposit.initWeb3();
    }
}

//for shipper listen event verify form contract verify
////////////////Verify TX
// /////////////////////////Verifier//////////////////////////////////
AppVerifier = {
    web3Provider: null,
    contracts: {},
    currentAccount: {},
    json_api: null,
    addressVerifier: 0,
    not_new: false,
    initWeb3: async function () {
        if (process.env.MODE == 'development' || typeof window.web3 === 'undefined') {
            AppVerifier.web3Provider = new Web3.providers.HttpProvider(process.env.LOCAL_NODE);
        }
        else {
            AppVerifier.web3Provider = web3.currentProvider;
        }
        console.log("thi initweb3 111");
        web3 = new Web3(AppVerifier.web3Provider);
        return await AppVerifier.initContractVerifier();
    },
    initContractVerifier: async function () {
        await $.getJSON('Verifier.json', function (data) {
            console.log("this api verifier: 1");
            console.log("thi initcontractVerifier 112");
            var VerifierdArtifact = data;
            json_api = data;
            AppVerifier.contracts.Verifier = TruffleContract(VerifierdArtifact);
            AppVerifier.contracts.Verifier.setProvider(AppVerifier.web3Provider);
        })
        
        if (!AppVerifier.not_new) {
            console.log("init contract verifier");
            // console.log("thi initcontractVerifier 113");

            return await AppVerifier.initContractNewVerifier();
        }
       
    },
    initContractNewVerifier: async function () {
        await web3.eth.getAccounts(async function (error, accounts) {
            if (error) {
                console.log("get account in verifier false" + error);
            }
            AppVerifier.currentAccount = accounts[0];
            console.log("initContractNewVerifier " + AppVerifier.currentAccount);
            AppVerifier.contracts.Verifier.new({ from: AppVerifier.currentAccount }).then(instance => {
                console.log("your addresss contract verifier");
                console.log(instance.address);
                AppVerifier.addressVerifier = instance.address;
            }).catch(err => {
                console.log('error', err);
            });
        })
    },
    watchStatus: async function (address_verifier) {
        console.log("watchStatus is collecd ste 7: ");
        await AppVerifier.init(true);
        web3.eth.getAccounts(async function (error, accounts) {
            if (error) {
                console.log(error);
            }
            console.log("watchStatus is collecd 8:");
            AppVerifier.currentAccount = accounts[3];
            AppVerifier.contracts.Verifier.at(address_verifier).then(async function (instance) {
                if (AppVerifier.currentAccount.length) {
                    console.log("current Account 9: ");
                    await $.getJSON('Verifier.json', function (data) {
                        console.log("this api verifier: ");
                        console.log("thi initcontractVerifier 10: get json and instance");
                        web3socket = new Web3(new Web3.providers.WebsocketProvider("ws://127.0.0.1:7545"));
                        contract =new web3socket.eth.Contract(data["abi"],instance.address);
                        console.log("that instance");
                        console.log(instance.address)
                        console.log("event from contract verifier: ~~~~~~~~~listen");
                        var track = contract.events.Verified((err, result)=>{
                            console.log(result)
                        })
                        console.log(track)
                    })
                }
            }).catch(err => {
                console.log('error', err);
            });
        })
    },
    //if input false, will create new contract
    //true is not create
    init: async function (_new_or_not) {
        AppVerifier.not_new = _new_or_not;
        console.log("110 in here verifier~: " + _new_or_not);
        return await AppVerifier.initWeb3();
    }
}
$(function () {
    $(window).load(function () {
        App.init();   
    });
});