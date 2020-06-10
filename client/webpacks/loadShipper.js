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
            if (error) {
                App.showError(error);
            }
            App.currentAccount = accounts[3];
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
            $('#shipper_Name'+i).text("Name: "+packages[i][1]);
            $('#shipper_Price'+i).text("Price: "+packages[i][2]);
            $('#shipper_Address'+i).text("Address: "+packages[i][3]);
            $('#shipper_status'+i).text("Status: "+packages[i][4]);
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
        $name = $('#shipper_Name'+index_package).text().slice("Name: ".length);

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
                console.log("address deposit shipper:", _address)
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
        $name = $('#shipper_Name'+index_package).text().slice("Name: ".length);
        
        await App.contracts.Seller.deployed().then(async function (instance) {
            if (App.currentAccount.length) {
                await instance.getAddressVerifier.call(index_package, { from: App.currentAccount }).then(async function (instance) {
                    App.address_verifier_p = instance; 
                    await AppVerifier.watchStatus(instance);                
                })
            }
        })
    },
    init: async function () {
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
			div_seller.id = "seller"+i;
            div_seller.className = "mycard col-4 px-0 mt-0 mx-3";            
			document.body.appendChild(div_seller); 

			//add name, price, detail, btnBuy
			var h1_name = document.createElement("h1");
			h1_name.id = "shipper_Name"+i;
            h1_name.className = "text-center";
			h1_name.innerHTML = "Tailored Jeans";

			var p_price = document.createElement("p"); 
			p_price.id = "shipper_Price"+i;
			p_price.className = "price pl-3";
			p_price.innerHTML = "10";

			var p_shipper_address = document.createElement("p"); 
			p_shipper_address.id = "shipper_Address"+i;
            p_shipper_address.className = "pl-3";
			p_shipper_address.innerHTML = "Lorem jeamsun denim lorem jeansum.";

            var p_status = document.createElement("p"); 
            p_status.id = "shipper_status"+i;
            p_status.className = "pl-3";
            p_status.innerHTML = "Lorem jeamsun denim lorem jeansum.";

			var p_ = document.createElement("p"); 
			p_.id = "pContentButton"+i;
            p_.className = "mb-0";

			var button_ship = document.createElement("button"); 
			button_ship.type = "button";
			button_ship.id = "btnShip"+i;	
            button_ship.innerHTML = "Ship Item";
            
            var button_check_status = document.createElement("button"); 
			button_check_status.type = "button";
			button_check_status.id = "btnShipCheckStatus"+i;	
			button_check_status.innerHTML = "Check Status";
            

            document.getElementById("seller").appendChild(div_seller)			
			document.getElementById(div_seller.id).appendChild(h1_name);
			document.getElementById(div_seller.id).appendChild(p_price);
			document.getElementById(div_seller.id).appendChild(p_shipper_address);
            document.getElementById(div_seller.id).appendChild(p_status);
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

            AppShipperDeposit.contracts.DepositShipper.new( accounts[1],  accounts[2],{
                value: price_value, from: AppShipperDeposit.currentAccount
            }).then(instance => {
                console.log("shipper depost: ",  accounts[1],  accounts[2], AppShipperDeposit.currentAccount);
                console.log("shipper depost address: ", instance.address);
                AppShipperDeposit.addressShipperDeposit = instance.address;
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
        web3 = new Web3(AppVerifier.web3Provider);
        return await AppVerifier.initContractVerifier();
    },
    initContractVerifier: async function () {
        await $.getJSON('Verifier.json', function (data) {
            var VerifierdArtifact = data;
            json_api = data;
            AppVerifier.contracts.Verifier = TruffleContract(VerifierdArtifact);
            AppVerifier.contracts.Verifier.setProvider(AppVerifier.web3Provider);
        })
    },
    watchStatus: async function (address_verifier) {
        await AppVerifier.init();
        web3.eth.getAccounts(async function (error, accounts) {
            if (error) {
                console.log(error);
            }
            AppVerifier.currentAccount = accounts[3];
            AppVerifier.contracts.Verifier.at(address_verifier).then(async function (instance) {
                if (AppVerifier.currentAccount.length) {
                    await $.getJSON('Verifier.json', function (data) {
                        web3socket = new Web3(new Web3.providers.WebsocketProvider("ws://127.0.0.1:7545"));
                        contract =new web3socket.eth.Contract(data["abi"],instance.address);
                        var track = contract.events.Verified((err, result)=>{
                            console.log(result)
                        })
                    })
                }
            }).catch(err => {
                console.log('error', err);
            });
        })
    },
    //if input false, will create new contract
    //true is not create
    init: async function () {
        return await AppVerifier.initWeb3();
    }
}
$(function () {
    $(window).load(function () {
        App.init();   
    });
});