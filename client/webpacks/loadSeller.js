var Web3 = require('web3');
var TruffleContract = require('truffle-contract');

App = {
    web3Provider: null,
    contracts: {},
    currentAccount: {},
    id_item: 0,
    // address_buyer_deposit_p: 0,
    address_verifier_p: 0,
    // address_seller_deposit_p: 0,
    // address_shiper_deposit_p: 0,
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
        return App.bindEvents();
    },
    bindEventsPackageSelled : function (total_packages) {
        for(i=0;i<total_packages;i++){
            $('#SellerConfirm_btnConfirmSell'+i).click(App.confirmSell);
            $('#SellerConfirm_btnConfirmVerifyTx'+i).click(App.confirmVerifier);
        }
    },
    //~~~~~~~~~~
    bindEvents: function () {
        //load package selled
        App.getPackageSelled()

        $('#btnAddPackage').click(App.setPackage);
    }, 
    getPackage: function () {
        web3.eth.getAccounts(function (error, accounts) {
            if (error) {
                App.showError(error);
            }
            App.currentAccount = accounts[1];
            try {
                App.contracts.Seller.deployed().then(async function (instance) {
                    let packages = [];
                    let total_package = 0;
                    if (App.currentAccount.length) {
                        //get total number packages
                        total_package = await instance.getTotalPackage.call({ from: App.currentAccount });
                        //create UI

                        //show value to UI
                        packages = await instance.getPackage.call({ from: App.currentAccount });
                    }
                })
            } catch (error) {
                console.log("error getPackage: " + error);
            }
        })
    },
    getPackageVerifier: async function (index) {
        try {
            await App.contracts.Seller.deployed().then(async function (instance) {
                let packages_verifier = [];
                if (App.currentAccount.length) {
                    await instance.getPackageVerifier.call(index, { from: App.currentAccount }).then(async function (instance) {
                        App.package_verifier_p = instance;                 
                    })
                    await instance.getAddressVerifier.call(index, { from: App.currentAccount }).then(async function (instance) {
                        App.address_verifier_p = instance;                 
                    })
                }
            })
        } catch (error) {
            console.log("error getPackageVerifier: " + error);
        }
    },
    //get package selled
    getPackageSelled: function () {
        web3.eth.getAccounts(function (error, accounts) {
            console.log("2. App.getpackage");
            if (error) {
                App.showError(error);
            }
            App.currentAccount = accounts[1];
            try {
                App.contracts.Seller.deployed().then(async function (instance) {
                    //content information of package
                    let packages = [[]];
                    let total_package = 0;
                    if (App.currentAccount.length) {
                        //get total number packages
                        total_package = await instance.getTotalPackage.call({ from: App.currentAccount });
                        App.total_package_p = total_package;
                        //get value from contract
                        for (i = 0; i < total_package; i++) {
                            packages[i] = await instance.getPackageSelled.call(i, { from: App.currentAccount });                   
                        } 
                        for (i = 0; i < total_package; i++) {
                            if(packages[i][1] =="" ){
                                packages.splice(i,1);
                            }
                        }
                         //create UI form
                         App.crateFormShowItem(packages); 
                         //add event in button buy
                         App.bindEventsPackageSelled(packages.length);
                        //show item to UI
                        App.showPackageSelled(packages);
                    }
                   
                })
            } catch (error) {
                console.log("error getPackage: " + error);
            }
        })
    },  
    showPackage: function (packages) {
        App.id_item = packages[0];
        $('#buyer_Name').val(packages[1]);
        $('#buyer_Price').val(packages[2]);
        $('#buyer_Details').val(packages[3]);
        // $('#errorHolder').hide();
        // $('#errorHolder').html("what about").show();
    },
    showPackageSelled: function (packages) {
        for(i=0;i<packages.length;i++){
            $('#SellerConfirm_Name'+i).text("Name: "+packages[i][1]);
            $('#SellerConfirm_Price'+i).text("Price: "+packages[i][2]);
            $('#SellerConfirm_Delivery'+i).text("Address: "+packages[i][3]);
            $('#SellerConfirm_Details'+i).text("Details: "+packages[i][4]);
            $('#SellerConfirm_Status'+i).text("Status: "+packages[i][5]);
        }  
        // $('#errorHolder').hide();
        // $('#errorHolder').html("what about").show();
    },
    showPackageShip: function (packages) {
        $('#shipper_Name').val(packages[0]);
        $('#shipper_Price').val(packages[1]);
        $('#shipper_Address').val(packages[2]);
        // $('#errorHolder').hide();
        // $('#errorHolder').html("what about").show();
    },
    setPackage: function () {
        //get input from UI
        $name = $('#Name').val();
        $price = $('#Price').val();
        $details = $('#Details').val();
        //check value and setPackage in Contract Seller
        if ($('#Name').val() && $('#Price').val() && $('#Details').val()) {
            web3.eth.getAccounts(function (error, accounts) {
                if (error) {
                    App.showError(error);
                }
                App.currentAccount = accounts[1];
                App.contracts.Seller.deployed().then(async function (instance) {
                    //save save package in contract
                    await instance.setPackage.sendTransaction($name, $price, $details, { from: App.currentAccount })
                     ///send request to server run zokrates to create proof
                     //get index package
                    total_package = await instance.getTotalPackage.call({ from: App.currentAccount });
                    
                    console.log("this index: "+total_package);
                    console.log(total_package);
                    let id = total_package - 1;
                    let name = $name ;
                    let price = $price;
                    let details = $details;
                    let req = new XMLHttpRequest();
                    let url_parameter_item = id + "/" + name + "/" + price +
                    "/" + details;
                    req.open("get", "http://localhost:3000/save-file/" + url_parameter_item, false);
                    req.setRequestHeader("Content-Type", "application/json; charset=UTF-8");
                    req.send();
                    //receive response from server local, output0, output1
                    console.log("response saveFile");
                    console.log(req.status);
                    let obj = JSON.parse(req.responseText);
                    console.log("this value: server return: ")
                    console.log(obj);
                   
                }).then(function (result) {
                    App.showMessage('Saved Successfully');
                    alert("Add Item Success!")
                }).catch(function (error) {
                    App.showError(error);
                    alert(error);
                })
            })
        }
        else {
            App.showError('Error: Name is required.');
        }
    },
    setOwerPackage: function (_id) {
        web3.eth.getAccounts(function (error, accounts) {
            if (error) {
                App.showError(error);
            }
            App.currentAccount = accounts[1];
            App.contracts.Seller.deployed().then(async function (instance) {
                await instance.setShipperOwner.sendTransaction(_id, { from: App.currentAccount })
            }).catch(function (error) {
                App.showError(error);
                alert(error);
            })
        })
    },
    //create form html with javascript
    crateFormShowItem: function (packages) {
        var i = 0;
        for(j=0; j< packages.length;j++){
            if(packages[0][0]==undefined){
                break;
            }
            //add div
            var div_seller_main = document.createElement("div"); 
            div_seller_main.className = "col-4 px-0 mt-0 p-3"
			div_seller_main.id = "seller_main"+i;
			document.body.appendChild(div_seller_main);

		  	var div_seller = document.createElement("div"); 
		  	div_seller.className = "mycard mt-0"
			div_seller.id = "seller"+i;

			//add name, price, detail, btnBuy
			var h1_name = document.createElement("h1");
			h1_name.id = "SellerConfirm_Name"+i;
			h1_name.innerHTML = "Tailored Jeans";
            h1_name.className = "text-center";

			var p_price = document.createElement("p"); 
			p_price.id = "SellerConfirm_Price"+i;
			p_price.className = "price pl-3";
			p_price.innerHTML = "10";

			var p_details = document.createElement("p"); 
			p_details.id = "SellerConfirm_Details"+i;
            p_details.className = "pl-3";
			p_details.innerHTML = "Some text about the jeans.";
            
            var p_address_delivery = document.createElement("p"); 
			p_address_delivery.id = "SellerConfirm_Delivery"+i;
            p_address_delivery.className = "pl-3";
			p_address_delivery.innerHTML = "Can Tho";
            
            var p_status = document.createElement("p"); 
            p_status.id = "SellerConfirm_Status"+i;
            p_status.className = "pl-3";
            p_status.innerHTML = "Some text about the jeans.";

            var p_ = document.createElement("p"); 
			p_.id = "pContentButton"+i;
            p_.className = "mb-0    ";

			var button_confirm = document.createElement("button"); 
			button_confirm.type = "button";
			button_confirm.id = "SellerConfirm_btnConfirmSell"+i;	
			button_confirm.innerHTML = "Confirm";
            
            var button_verify = document.createElement("button"); 
			button_verify.type = "button";
			button_verify.id = "SellerConfirm_btnConfirmVerifyTx"+i;	
            button_verify.innerHTML = "Verify";
            
            document.getElementById("seller").appendChild(div_seller_main)
            document.getElementById(div_seller_main.id).appendChild(div_seller)
			document.getElementById(div_seller.id).appendChild(h1_name);
			document.getElementById(div_seller.id).appendChild(p_price);
            document.getElementById(div_seller.id).appendChild(p_details);
            document.getElementById(div_seller.id).appendChild(p_address_delivery);
            document.getElementById(div_seller.id).appendChild(p_status);
            
			document.getElementById(div_seller.id).appendChild(p_);
            document.getElementById(p_.id).appendChild(button_confirm);
            document.getElementById(p_.id).appendChild(button_verify);  
 			i++;
        }
    },
    confirmSell: async function () {
        //funtion get id package when  user click
        //this.id is name of id button user just clicked
        //last character in id is index package
        let id_element = this.id;
        let index_package = id_element[id_element.length-1];
        //get infor form UI
        let name = $('#SellerConfirm_Name'+index_package).text().slice("Name: ".length);
        
        let price = $('#SellerConfirm_Price'+index_package).text().slice("Price: ".length);
        let address_delivery = $('#SellerConfirm_Delivery'+index_package).text().slice("Address: ".length);
        let address_contract_verifyTx = 0;

        //get address_verifyTx
        App.contracts.Seller.deployed().then(async function (instance) {
            address_contract_verifyTx = await instance.getAddressVerifier.call(index_package, { from: App.currentAccount });
            //create contract and deposit 
            await AppSellerDeposit.init(price, instance.address);
        }).then( async function () { 

            seller_deposit_address = AppSellerDeposit.addressSellerDeposit;
            console.log("3.3 address seller deposit: " + seller_deposit_address);
            //update contract seller, add address contract 
            await App.contracts.Seller.deployed().then(async function (instance) {
                try {
                    if (App.currentAccount.length) {
                        // uint _id,string memory _address, address _address_verifyTx,
                        // address payable _address_buyer_deposit
                        await instance.setSellerDepositAddress.sendTransaction(
                            index_package,
                            seller_deposit_address,
                            { from: AppSellerDeposit.currentAccount }).then(alert("confirm success!"));
                    }
                } catch (error) {
                    console.log("errror when update conract in confirm sell: " + error);
                }
                console.log("3.4 address seller deposit: " + seller_deposit_address);
            })

        })
    },
    confirmVerifier: async function () {
        try { 
            let id_element = this.id;
            let index_package = id_element[id_element.length-1];
            ///read data package and out0, out1         
            await App.getPackageVerifier(index_package);    
            await App.setOwerPackage(index_package);    
            var req = new XMLHttpRequest();
            var url_parameter_item = index_package;
            req.open("get", "http://localhost:3000/read-infor-package/" + url_parameter_item, false);
            req.setRequestHeader("Content-Type", "application/json; charset=UTF-8");
            req.send();
            
            //receive response from server local, output0, output1
            var obj = JSON.parse(req.responseText);
     
            console.log("step 4"+index_package)
            let id = App.package_verifier_p[0];
            let name = App.package_verifier_p[1];
            let price = App.package_verifier_p[2];
            let details = App.package_verifier_p[3]; // $('#SellerConfirm_Delivery').val();
            let out0 = App.package_verifier_p[4];
            let out1 = App.package_verifier_p[5];
            
            ///send request to server run zokrates to create proof
            url_parameter_item = id + "/" + name + "/" + price +
                "/" + details + "/" + out0 + "/" + out1;
            var t0 = performance.now()
            req.open("get", "http://localhost:3000/runverifyTx/" + url_parameter_item, false);
            req.setRequestHeader("Content-Type", "application/json; charset=UTF-8");
            req.send();
            var t1 = performance.now()
            console.log("Call to doSomething took " + (t1 - t0) + " milliseconds.")
            
            console.log(req.responseText)
            //receive response from server local, output0, output1
            obj = JSON.parse(req.responseText);
            ///read proof
            let obj_proof = obj.proof_data.proof;
            let obj_input = obj.proof_data.inputs;
            ///get ID contract verifier
            let address_verifier = App.address_verifier_p;
            ///run function verifyTx
            AppVerifier.runVerifyTx(address_verifier, obj_proof.a, obj_proof.b, obj_proof.c, obj_input)
            ///read status
            ///show status to UI
            console.log(status);
        } catch (error) {
            console.log("confirm sell item error: " + error);
            alert(error);
        }
    },
    showMessage: function (msg) {
        $('#errorHolder').hide();
    },
    showError: function (err) {
        $('#errorHolder').html(err.toString());
        $('#errorHolder').show();
    },
    init: async function () {
        return await App.initWeb3();
        // App.loadMessage();          
    }
}

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
    addressMainContract: 0,
    initWeb3: async function () {
        if (process.env.MODE == 'development' || typeof window.web3 === 'undefined') {
            AppSellerDeposit.web3Provider = new Web3.providers.HttpProvider(process.env.LOCAL_NODE);
        }
        else {
            AppSellerDeposit.web3Provider = web3.currentProvider;
        }
        web3 = new Web3(AppSellerDeposit.web3Provider);
        console.log("4.2 sthis step");
        return await AppSellerDeposit.initContractSellerDeposit();
    },
    initContractSellerDeposit: async function () {
        await $.getJSON('DepositSeller.json', function (data) {
            var SellerDepositArtifact = data;
            AppSellerDeposit.contracts.DepositSeller = TruffleContract(SellerDepositArtifact);
            AppSellerDeposit.contracts.DepositSeller.setProvider(AppSellerDeposit.web3Provider);
            console.log("4.3 sthis step");
        })
        if (!(AppSellerDeposit.app_not_deposit)) {
            console.log("in app not deposit: " + AppSellerDeposit.app_not_deposit);
            console.log("4.4 sthis step");
            return await AppSellerDeposit.initContractSellerDepositNextStep();
        }
    },
    initContractSellerDepositNextStep: async function () {
        await web3.eth.getAccounts(function (error, accounts) {
            if (error) {
                console.log(error);
            }
            AppSellerDeposit.currentAccount = accounts[1];
            //string memory _name, string memory _name_item,
            // uint _price, string memory _address,address _address_verifyTx
        }).then(async function(){
            let price_value = AppSellerDeposit.price;

            await AppSellerDeposit.contracts.DepositSeller.new(AppSellerDeposit.addressMainContract,{
                value: price_value, from: AppSellerDeposit.currentAccount
            }).then(instance => {
                //instance.address is address contract created
                AppSellerDeposit.addressSellerDeposit = instance.address;
                console.log("seller deposit: ", AppSellerDeposit.addressMainContract, AppSellerDeposit.currentAccount)
                //set value for contract seller deposit  
                // instance.setValueFirst.sendTransaction(
                //     AppSellerDeposit.name_item,
                //     AppSellerDeposit.price,
                //     AppSellerDeposit.address_dilivery,
                //     AppSellerDeposit.address_verifyTx,
                //     { from: AppSellerDeposit.currentAccount })
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
            AppSellerDeposit.currentAccount = accounts[1];
            try {
                AppSellerDeposit.contracts.DepositSeller.at(App.address_seller_deposit_p).then(async function (instance) {
                    let packages = [];
                    if (AppSellerDeposit.currentAccount.length) {
                        packages = await instance.getPackage.call({ from: AppSellerDeposit.currentAccount });
                    }
                    App.showPackageShip(packages);
                })
            } catch (error) {
                console.log("error getPackageShip: " + error);
            }
        })
    },
    //string memory _name, string memory _name_item,
    // uint _price, string memory _address,address _address_verifyTx
    //_address is address will dilivery in the real world
    init: async function (_price, _address_main_contract) {
        AppSellerDeposit.price = _price;
        AppSellerDeposit.app_not_deposit = false;
        AppSellerDeposit.addressMainContract = _address_main_contract;

        return await AppSellerDeposit.initWeb3();

    },
    init_notdeposit: async function (_deposit_or_not) {
        AppSellerDeposit.app_not_deposit = _deposit_or_not;
        return await AppSellerDeposit.initWeb3();
    }
}


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
        
        if (!AppVerifier.not_new) {
            return await AppVerifier.initContractNewVerifier();
        }
    },
    initContractNewVerifier: async function () {
        await web3.eth.getAccounts(async function (error, accounts) {
            if (error) {
                console.log("get account in verifier false" + error);
            }
            AppVerifier.currentAccount = accounts[1];
            AppVerifier.contracts.Verifier.new({ from: AppVerifier.currentAccount }).then(instance => {
                AppVerifier.addressVerifier = instance.address;
            }).catch(err => {
                console.log('error', err);
            });
        })
    },
    runVerifyTx: async function (address_verifier, a, b, c, input) {
        await AppVerifier.init(true);
        web3.eth.getAccounts(function (error, accounts) {
            if (error) {
                console.log(error);
            }
            AppVerifier.currentAccount = accounts[1];
            AppVerifier.contracts.Verifier.at(address_verifier).then(async function (instance) {
                console.log("this instance::");
                console.log(instance)
                if (AppVerifier.currentAccount.length) {
                    let status = instance.verifyTx.sendTransaction(a, b, c, input, { from: AppVerifier.currentAccount })
                    status.then(
                        // Log the fulfillment value
                        function(val) {    
                            alert("this status verifiTx: " + val.receipt.status);
                            console.log(val);
                        })
                    .catch(
                        // Log the rejection reason
                        function(reason) {
                            console.log('Handle rejected promise ('+reason+') here.');
                    });
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
        return await AppVerifier.initWeb3();
    }
}
$(function () {
    $(window).load(function () {
        $('#errorHolder').hide();
        $('#output').hide();
        App.init();
    });
});