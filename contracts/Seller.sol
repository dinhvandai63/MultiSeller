pragma solidity ^0.6.1;
import './DepositSeller.sol';
import './DepositBuyer.sol';
import './DepositShipper.sol';

contract Seller{
    address payable private seller;
    uint public id = 0;

    struct OutputZksnark {
        uint output_0;
        uint output_1;
    }
    struct Package {
        string name;
        uint price;
        string details;
        string address_delivery;
        string status;
    }
    //use when seller verifyTx;
    mapping(uint => OutputZksnark) outputZksnarks;

    mapping(uint => uint) flagBuyer;
    mapping(uint => uint) flagShipper;
    mapping(uint => uint) flagSeller;

    mapping(uint => Package) packages;
    mapping(uint => address payable) mappingBuyer;
    mapping(uint => address) mappingVerifyTx;
    
    mapping(uint => address payable) mappingSellerDeposit;
    mapping(uint => address payable) mappingBuyerDeposit;
    mapping(uint => address payable) mappingShipperDeposit;
    modifier onlySeller{
        require(msg.sender == seller);
        _;
    }
    constructor() public{
        seller = msg.sender;    
    }  
   function setPackage(string calldata name, uint  price,string calldata details) external{
        packages[id].name = name;
        packages[id].price = price;
        packages[id].details = details;
        packages[id].status = "Sell";
        if(id == 1e18){
            id = 0;
        }
        id++;
   }

   function getPackage(uint idPackage) external view 
   returns(uint index, string memory name, uint  price,string memory details, string memory status){
        return(
        idPackage,
        packages[idPackage].name,
        packages[idPackage].price,
        packages[idPackage].details,
        packages[idPackage].status);
   }
   function getCurrentOwer(uint idPackage) external view 
   returns(string memory details){
        return(
        packages[idPackage].status);
   }
    //get package selled for shipper
    function getPackageSelledForShipper(uint idPackage) external view 
    returns(uint index, string memory name, uint  price,string memory address_delivery, string memory status){
        //require(mappingSellerDeposit[idPackage] != 0x0000000000000000000000000000000000000000,"Package was not bought");
        if(mappingSellerDeposit[idPackage] != address(0x0))
            return( idPackage,
                packages[idPackage].name,
                packages[idPackage].price,
                packages[idPackage].address_delivery,
                packages[idPackage].status);
        else
            return( 0, "", 0, "", "");
    }
    //get package selled for seller
    function getPackageSelled(uint idPackage) external view 
    returns(uint index, string memory name, uint  price,string memory address_delivery, string memory details, string memory status){
    //    require(mappingBuyer[idPackage] != 0x0000000000000000000000000000000000000000,"Package was not bought");
        if(mappingBuyer[idPackage] != address(0x0))
            return(
            idPackage,
            packages[idPackage].name,
            packages[idPackage].price,
            packages[idPackage].address_delivery,
            packages[idPackage].details,
            packages[idPackage].status
            );
        else
            return(0, "", 0, "", "", "");
    }
    //get package for verify
    function getPackageVerifier(uint idPackage) external view 
    returns(uint index, string memory name, uint  price,string memory details,
            uint out0, uint out1){
        // require(mappingBuyer[idPackage] != 0x0000000000000000000000000000000000000000,"Package was not bought"); 
        if(idPackage<1e18){
            return(
            idPackage,
            packages[idPackage].name,
            packages[idPackage].price,
            packages[idPackage].details,
            outputZksnarks[idPackage].output_0,
            outputZksnarks[idPackage].output_1);
        }else{
            return(0,"",0,"",0,0);
        }
       
    }


    function getTotalPackage() external view 
    returns(uint total_packages){
            return(id);
    }
     //get address buyer deposit
    function getBuyerDepositAddress(uint idPackage) external view returns(address payable){
        return mappingBuyerDeposit[idPackage];
    }
    //get address verifier content verifiTx
    function getAddressVerifier(uint idPackage) external view returns(address){
        return mappingVerifyTx[idPackage];
    }
    //get address seller_deposit_to
    function getSellerDepositAddress(uint idPackage) external view returns(address payable){
        return mappingSellerDeposit[idPackage];
    }
    //get address seller_deposit_to
    function setSellerDepositAddress(uint idPackage, address payable addressSellerDeposit) external{
        mappingSellerDeposit[idPackage] = addressSellerDeposit;
        packages[idPackage].status = "Selled";
    }
    
    //get address seller_deposit_to
    function getShipperrDepositAddress(uint idPackage) external view returns(address payable){
        return mappingShipperDeposit[idPackage];
    }
    //get address seller_deposit_to
    function setShipperDepositAddress(uint idPackage, address payable addressSellerDeposit) external{
        mappingShipperDeposit[idPackage] = addressSellerDeposit;
        packages[idPackage].status = "Ship";
    } 
    //get idPackage buyerItem, return address in Ethereum
    function getBuyerAddress(uint idPackage) external view returns(address){
        require(idPackage > idPackage);
        return(mappingBuyer[idPackage]);
    }

    //get set out0, out1
    function setOutput(uint idPackage, uint out0, uint out1) external returns(bool){
        if(out0 > 0 && out1 > 0){
            outputZksnarks[idPackage].output_0 = out1;
             outputZksnarks[idPackage].output_1 = out1;
            return(true);
        }
        return(false);
    }
    //get address seller_deposit_to
    function getOutput(uint idPackage) external view returns(uint out0, uint out1){
        return( outputZksnarks[idPackage].output_0,  outputZksnarks[idPackage].output_1);
    }

    //start buyer action
    //addressSellerDeposit is address will delivery to
    function buyItem(uint idPackage,string calldata addressSellerDeposit, address addressVerifyTx,
    address payable addressBuyerDeposit, uint out0, uint out1) 
    external returns(string memory name, uint  price,string memory details, string memory _address_real){
        //require Package available
        require(packages[idPackage].price > 0,"Package unavailable");
        //make sure no one buy it before
        require(mappingBuyer[idPackage] == address(0x0),"Package bought");
       
        mappingBuyer[idPackage] = msg.sender;
        packages[idPackage].address_delivery = addressSellerDeposit;
        mappingVerifyTx[idPackage] = addressVerifyTx;
        mappingBuyerDeposit[idPackage] = addressBuyerDeposit;
        outputZksnarks[idPackage].output_0 = out0;
        outputZksnarks[idPackage].output_1 = out1;

        packages[idPackage].status = "Bought";
        return(
            packages[idPackage].name,
            packages[idPackage].price,
            packages[idPackage].details,
            addressSellerDeposit);
    }
    
     //run address seller_deposit_to
    function runRefundTrue(uint idPackage) public{
        address payable seller_deposit_temp = mappingSellerDeposit[idPackage];
        address payable buyer_deposit_temp =  mappingBuyerDeposit[idPackage];
        address payable shipper_deposit_temp =  mappingShipperDeposit[idPackage];
        //refund seller
        DepositSeller(seller_deposit_temp).refundToSellerTrue();
        //refund buyer
        DepositBuyer(buyer_deposit_temp).refundToBuyerTrue();
        //refund seller
        DepositShipper(shipper_deposit_temp).refundToShipperAndSellerTrue();
    }
    
    //run address seller_deposit_to
    function runRefundShipperFail(uint idPackage) public{
        address payable seller_deposit_temp = mappingSellerDeposit[idPackage];
        address payable buyer_deposit_temp =  mappingBuyerDeposit[idPackage];
        address payable shipper_deposit_temp =  mappingShipperDeposit[idPackage];
        //refund seller
        DepositSeller(seller_deposit_temp).refundToSellerTrue();
        //refund buyer
        DepositBuyer(buyer_deposit_temp).refundToBuyerTrue();
        //refund buyer and seller
        DepositShipper(shipper_deposit_temp).refundToSellerAndBuyerSHF();
    }
    
    
    //run address seller_deposit_to
    function runRefundBuyerFail(uint idPackage) public{
        address payable seller_deposit_temp = mappingSellerDeposit[idPackage];
        address payable buyer_deposit_temp =  mappingBuyerDeposit[idPackage];
        address payable shipper_deposit_temp =  mappingShipperDeposit[idPackage];


        //refund seller
        DepositSeller(seller_deposit_temp).refundToSellerTrue();
        //refund buyer
        DepositBuyer(buyer_deposit_temp).refundToBuyerFail();
        //refund buyer and seller
        DepositShipper(shipper_deposit_temp).refundToShipper();
    }
    
      
     //get flag buyer
    // function getFlagBuyer(uint idPackage) public view returns(memory string value){
    //     return flagBuyer[idPackage];
    // }
    //set flag buyer
    function setFlagBuyer(uint idPackage, uint flag) external{
        flagBuyer[idPackage] = flag;
        //1 ok
        //2 shipperF
        //3 buyerF
        if(flagBuyer[idPackage]==1 && flagShipper[idPackage]==1 && flagSeller[idPackage]==1){
            runRefundTrue(idPackage);
        }else if(flagBuyer[idPackage]==2 && flagSeller[idPackage]==2){
            runRefundShipperFail(idPackage);
        }else if(flagShipper[idPackage]==3 && flagSeller[idPackage]==3){
            runRefundBuyerFail(idPackage);
        }    
    }

     //get flag buyer
    // function getFlagShipper(uint idPackage) public view returns(bool){
    //     return flagShipper[idPackage];
    // }
    //set flag buyer
    function setFlagShipper(uint idPackage, uint flag) external{
        flagShipper[idPackage] = flag;
        //1 ok
        //2 shipperF
        //3 buyerF
        if(flagBuyer[idPackage]==1 && flagShipper[idPackage]==1 && flagSeller[idPackage]==1){
            runRefundTrue(idPackage);
        }else if(flagBuyer[idPackage]==2 && flagSeller[idPackage]==2){
            runRefundShipperFail(idPackage);
        }else if(flagShipper[idPackage]==3 && flagSeller[idPackage]==3){
            runRefundBuyerFail(idPackage);
        }       
    }

     //get flag buyer
    // function getFlagShipper(uint idPackage) public view returns(bool){
    //     return flagShipper[idPackage];
    // }
    //set flag buyer
    function setFlagSeller(uint idPackage, uint flag) external{
        flagSeller[idPackage] = flag;
        //1 ok
        //2 shipperF
        //3 buyerF
        if(flagBuyer[idPackage]==1 && flagShipper[idPackage]==1 && flagSeller[idPackage]==1){
            runRefundTrue(idPackage);
        }else if(flagBuyer[idPackage]==2 && flagSeller[idPackage]==2){
            runRefundShipperFail(idPackage);
        }else if(flagShipper[idPackage]==3 && flagSeller[idPackage]==3){
            runRefundBuyerFail(idPackage);
        }       
    }

    function setShipperOwner(uint idPackage) external{
        packages[idPackage].status = "Shipper";
    }

    function setDone(uint idPackage) external{
        packages[idPackage].status = "Done";
    }
    function resetPakcageData(uint idPackage) external{
        packages[idPackage].name = "";
        packages[idPackage].price = 0;
        packages[idPackage].details = "";
    }
}
