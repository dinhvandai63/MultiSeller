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
        return App.getPackage();
    },
    getPackage: function () {
        web3.eth.getAccounts(function (error, accounts) {
            if (error) {
                App.showError(error);
            }
            App.currentAccount = accounts[2];
            try {
                App.contracts.Seller.deployed().then(async function (instance) {
                    //content information of package
                    let packages = [[]];
                    let total_package = 0;
                    if (App.currentAccount.length) {
                        //get total number packages
                        total_package = await instance.getTotalPackage.call({ from: App.currentAccount });
                        App.total_package_p = total_package;
                        //create UI form
                        App.crateFormShowItem(total_package); 
                        //add event in button buy
                        App.bindEvents(total_package);
                        //get value from contract
                        for (i = 0; i < total_package; i++) {
                            packages[i] = await instance.getPackage.call(i, { from: App.currentAccount });
                        } 
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
            $('#buyer_Name'+i).text("Name: "+packages[i][1]);
            $('#buyer_Price'+i).text("Price: " + packages[i][2]);
            $('#buyer_Details'+i).text("Details: " + packages[i][3]);
            $('#buyer_Status'+i).text("Status: " + packages[i][4]);
        }  
    },
    bindEvents: function (total_packages) {
        for(i=0;i<total_packages;i++){
            $('#btnBuy'+i).click(App.buyItem);
        }
    },
    buyItem: async function () {
        //funtion get id package when  user click
        //this.id is name of id button user just clicked
        //last character in id is index package
        let id_element = this.id;
        let index_package = id_element[id_element.length-1];
        $name = $('#buyer_Name'+index_package).text().slice("Name: ".length);
        $price = $('#buyer_Price'+index_package).text().slice("Price: ".length);
        $details = $('#buyer_Details'+index_package).text().slice("Details: ".length);
        var $name_temp = confirm("you buyer Item: " + $name);
        //repair for request
        if ($name_temp) {
            var add_delivery = prompt("Address");
            //make sure address delivy available
            if (add_delivery != null) {
                try {
                    let req = new XMLHttpRequest();
                    //change, request create output0, output1, pk, vk
                    //set id package
                    App.id_item = index_package;
                    
                    let url_parameter_item = App.id_item + "/" + $name + "/" + $price + "/" + $details;

                    var t0 = performance.now()
                    req.open("get", "http://localhost:3000/buyitem/" + url_parameter_item, false);
                    req.setRequestHeader("Content-Type", "application/json; charset=UTF-8");
                    req.send();
                    //receive response from server local, output0, output1
                    var t1 = performance.now()
                    console.log("Call to doSomething took " + (t1 - t0) + " milliseconds.")

                    let obj = JSON.parse(req.responseText);
                   
                    /// update contract Seller
                    App.contracts.Seller.deployed().then(async function (instance) {
                        try {
                            //deploy verifier
                            await AppVerifier.init(true)
                            //deploy contract buyer deposit

                            var keys = Object.keys(instance);

                            await AppBuyerDeposit.init($price,instance.address)
                            var output0 = obj.output0;
                            var output1 = obj.output1;
                            var id_item_temp = App.id_item;
                            var address_verifyTx = AppVerifier.addressVerifier;
                            var address_buyer_deposit = AppBuyerDeposit.addressBuyerDeposit;
                            if (AppBuyerDeposit.currentAccount.length) {
                                // uint _id,string memory _address, address _address_verifyTx,
                                // address payable _address_buyer_deposit
                                console.log("buyerItem infor:",id_item_temp,
                                    add_delivery,
                                    address_verifyTx,
                                    address_buyer_deposit,
                                    output0,
                                    output1,
                                    AppBuyerDeposit.currentAccount);
                                await instance.buyItem.sendTransaction(
                                    id_item_temp,
                                    add_delivery,
                                    address_verifyTx,
                                    address_buyer_deposit,
                                    output0,
                                    output1,
                                    { from: AppBuyerDeposit.currentAccount });
                                alert("buy Item: " + $name + " success!");
                            }
                        } catch (err) {
                            console.log("errror when update conract: " + err);
                        }
                    })
                } catch (error) {
                    console.log("error buyer Item: " + error);
                }
            }else{
                alert("Address not null")
            }
        }
    },
    init: async function () {
        return await App.initWeb3();
    },
    crateFormShowItem: function (total_item) {
        var i = 0;
        for(j=0; j< total_item;j++){


			//add div
		  	var div_seller_main = document.createElement("div"); 
		  	div_seller_main.className = "col-4 px-0 mt-0 p-3"
            div_seller_main.id = "seller_main"+i;
            document.body.appendChild(div_seller_main); 
            
			//add div
		  	var div_seller = document.createElement("div"); 
		  	div_seller.className = "mycard mt-0"
			div_seller.id = "seller"+i;

			//add name, price, detail, btnBuy
			var h1_name = document.createElement("h1");
			h1_name.id = "buyer_Name"+i;
            h1_name.className = "text-center";
			h1_name.innerHTML = "Tailored Jeans";

			var p_price = document.createElement("p"); 
			p_price.id = "buyer_Price"+i;
			p_price.className = "price pl-3";
			p_price.innerHTML = "10";

			var p_details = document.createElement("p"); 
			p_details.id = "buyer_Details"+i;
            p_details.className = "pl-3";
			p_details.innerHTML = "Some text about the jeans.";

            var p_status = document.createElement("p"); 
            p_status.id = "buyer_Status"+i;
            p_status.className = "pl-3";
            p_status.innerHTML = "Some text about the jeans.";

			var p_ = document.createElement("p"); 
			p_.id = "pContentButton"+i;
            p_.className = "mb-0";

			var button_buy = document.createElement("button"); 
			button_buy.type = "button";
			button_buy.id = "btnBuy"+i;	
			button_buy.innerHTML = "Buy";

            document.getElementById("seller").appendChild(div_seller_main)
			document.getElementById(div_seller_main.id).appendChild(div_seller)
			document.getElementById(div_seller.id).appendChild(h1_name);
			document.getElementById(div_seller.id).appendChild(p_price);
			document.getElementById(div_seller.id).appendChild(p_details);
            document.getElementById(div_seller.id).appendChild(p_status);
			document.getElementById(div_seller.id).appendChild(p_);
			document.getElementById(p_.id).appendChild(button_buy);
 			i++;
        }
    },
}

///////////////////////////Verifier//////////////////////////////////

AppVerifier = {
    web3Provider: null,
    contracts: {},
    currentAccount: {},
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
            AppVerifier.contracts.Verifier = TruffleContract(VerifierdArtifact);
            AppVerifier.contracts.Verifier.setProvider(AppVerifier.web3Provider);
        })
        if (AppVerifier.not_new) {
            return await AppVerifier.initContractNewVerifier();
        }     
    },
    initContractNewVerifier: async function () {
        await web3.eth.getAccounts(async function (error, accounts) {
            if (error) {
                console.log("get account in verifier false" + error);
            }
            AppVerifier.currentAccount = accounts[2];
        }).then( async function () { 
            await AppVerifier.contracts.Verifier.new({ from: AppVerifier.currentAccount }).then(instance => {
                AppVerifier.addressVerifier = instance.address;
            }).catch(err => {
                console.log('error', err);
            });
        })
    },
    //if input true, will create new contract
    //false is not create
    init: async function (_new_or_not) {
        AppVerifier.not_new = _new_or_not;
        return await AppVerifier.initWeb3();
    }
}

//////////////////////buyer deposit
AppBuyerDeposit = {
    web3Provider: null,
    contracts: {},
    currentAccount: {},
    accountShipper: {},
    accountSeller: {},
    addressBuyerDeposit: 0,
    addressMainContract: 0,//Main contract is contract Seller
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
        await web3.eth.getAccounts(function (error, accounts) {
            if (error) {
                console.log(error);
            }
            AppBuyerDeposit.accountSeller = accounts[1];
            AppBuyerDeposit.currentAccount = accounts[2];
            AppBuyerDeposit.accountShipper = accounts[3];
            
        }).then( async function () { 
            //deposit
            let price_value = (AppBuyerDeposit.price * 5) / 10;
            console.log("deposti buyer: ", App.currentAccount, AppBuyerDeposit.accountShipper, AppBuyerDeposit.currentAccount)
            await AppBuyerDeposit.contracts.DepositBuyer.new(AppBuyerDeposit.accountSeller, AppBuyerDeposit.accountShipper, 
                AppBuyerDeposit.addressMainContract, { value: price_value, from: AppBuyerDeposit.currentAccount }).then(instance => {
                AppBuyerDeposit.addressBuyerDeposit = instance.address;
            }).catch(err => {
                console.log('error', err);
            });
        })
    },
    init: async function (_price, _address_main_contract) {
        AppBuyerDeposit.price = _price;
        AppBuyerDeposit.addressMainContract = _address_main_contract;
        return await AppBuyerDeposit.initWeb3();

    }
}
$(function () {
    $(window).load(function () {
        console.log( "ready 2!" );
        App.init(); 
    });
});
