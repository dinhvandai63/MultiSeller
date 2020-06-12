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
    constructor() public payable{
        seller = msg.sender;    
    }  
   function setPackage(string memory name, uint  price,string memory Details) external{
        packages[id].name = name;
        packages[id].price = price;
        packages[id].details = Details;
        packages[id].status = "Sell";
        if(id == 1e18){
            id=0;
        }
        id++;
   }

   function getPackage(uint id) external view 
   returns(uint index, string memory name, uint  price,string memory details, string memory status){
        return(
        id,
        packages[id].name,
        packages[id].price,
        packages[id].details,
        packages[id].status);
   }
   function getCurrentOwer(uint id) external view 
   returns(string memory Details){
        return(
        packages[id].status);
   }
    //get package selled for shipper
    function getPackageSelledForShipper(uint id) external view 
    returns(uint index, string memory name, uint  price,string memory address_delivery, string memory status){
        //require(mappingSellerDeposit[id] != 0x0000000000000000000000000000000000000000,"Package was not bought");
        if(mappingSellerDeposit[id] != address(0x0))
            return( id,
                packages[id].name,
                packages[id].price,
                packages[id].address_delivery,
                packages[id].status);
        else
            return( 0, "", 0, "", "");
    }
    //get package selled for seller
    function getPackageSelled(uint id) external view 
    returns(uint index, string memory name, uint  price,string memory address_delivery, string memory details, string memory status){
    //    require(mappingBuyer[id] != 0x0000000000000000000000000000000000000000,"Package was not bought");
        if(mappingBuyer[id] != address(0x0))
            return(
            id,
            packages[id].name,
            packages[id].price,
            packages[id].address_delivery,
            packages[id].details,
            packages[id].status
            );
        else
            return(0, "", 0, "", "", "");
    }
    //get package for verify
    function getPackageVerifier(uint id) external view 
    returns(uint index, string memory name, uint  price,string memory Details,
            uint out0, uint out1){
        // require(mappingBuyer[id] != 0x0000000000000000000000000000000000000000,"Package was not bought"); 
        if(id<1e18){
            return(
            id,
            packages[id].name,
            packages[id].price,
            packages[id].details,
            outputZksnarks[id].output_0,
            outputZksnarks[id].output_1);
        }else{
            return(0,"",0,"",0,0);
        }
       
    }


    function getTotalPackage() external view 
    returns(uint total_packages){
            return(id);
    }
     //get address buyer deposit
    function getBuyerDepositAddress(uint id) external view returns(address payable){
        return mappingBuyerDeposit[id];
    }
    //get address verifier content verifiTx
    function getAddressVerifier(uint id) external view returns(address){
        return mappingVerifyTx[id];
    }
    //get address seller_deposit_to
    function getSellerDepositAddress(uint id) external view returns(address payable){
        return mappingSellerDeposit[id];
    }
    //get address seller_deposit_to
    function setSellerDepositAddress(uint id, address payable addressSellerDeposit) external{
        mappingSellerDeposit[id] = addressSellerDeposit;
        packages[id].status = "Selled";
    }
    
    //get address seller_deposit_to
    function getShipperrDepositAddress(uint id) external view returns(address payable){
        return mappingShipperDeposit[id];
    }
    //get address seller_deposit_to
    function setShipperDepositAddress(uint id, address payable addressSellerDeposit) external{
        mappingShipperDeposit[id] = addressSellerDeposit;
        packages[id].status = "Ship";
    } 
    //get id buyerItem, return address in Ethereum
    function getBuyerAddress(uint id) external view returns(address){
        require(id > id);
        return(mappingBuyer[id]);
    }

    //get set out0, out1
    function setOutput(uint id, uint out0, uint out1) external returns(bool){
        if(out0 > 0 && out1 > 0){
            outputZksnarks[id].output_0 = out1;
             outputZksnarks[id].output_1 = out1;
            return(true);
        }
        return(false);
    }
    //get address seller_deposit_to
    function getOutput(uint id) external view returns(uint out0, uint out1){
        return( outputZksnarks[id].output_0,  outputZksnarks[id].output_1);
    }

    //start buyer action
    //addressSellerDeposit is address will delivery to
    function buyItem(uint id,string memory addressSellerDeposit, address addressVerifyTx,
    address payable addressBuyerDeposit, uint out0, uint out1) 
    external returns(string memory name, uint  price,string memory Details, string memory _address_real){
        //require Package available
        require(packages[id].price > 0,"Package unavailable");
        //make sure no one buy it before
        require(mappingBuyer[id] == address(0x0),"Package bought");
       
        mappingBuyer[id] = msg.sender;
        packages[id].address_delivery = addressSellerDeposit;
        mappingVerifyTx[id] = addressVerifyTx;
        mappingBuyerDeposit[id] = addressBuyerDeposit;
        outputZksnarks[id].output_0 = out0;
        outputZksnarks[id].output_1 = out1;

        packages[id].status = "Bought";
        return(
            packages[id].name,
            packages[id].price,
            packages[id].details,
            addressSellerDeposit);
    }
    
     //run address seller_deposit_to
    function runRefundTrue(uint id) public{
        address payable seller_deposit_temp = mappingSellerDeposit[id];
        address payable buyer_deposit_temp =  mappingBuyerDeposit[id];
        address payable shipper_deposit_temp =  mappingShipperDeposit[id];
        //refund seller
        DepositSeller(seller_deposit_temp).refundToSellerTrue();
        //refund buyer
        DepositBuyer(buyer_deposit_temp).refundToBuyerTrue();
        //refund seller
        DepositShipper(shipper_deposit_temp).refundToShipperAndSellerTrue();
    }
    
    //run address seller_deposit_to
    function runRefundShipperFail(uint id) public{
        address payable seller_deposit_temp = mappingSellerDeposit[id];
        address payable buyer_deposit_temp =  mappingBuyerDeposit[id];
        address payable shipper_deposit_temp =  mappingShipperDeposit[id];
        //refund seller
        DepositSeller(seller_deposit_temp).refundToSellerTrue();
        //refund buyer
        DepositBuyer(buyer_deposit_temp).refundToBuyerTrue();
        //refund buyer and seller
        DepositShipper(shipper_deposit_temp).refundToSellerAndBuyerSHF();
    }
    
    
    //run address seller_deposit_to
    function runRefundBuyerFail(uint id) public{
        address payable seller_deposit_temp = mappingSellerDeposit[id];
        address payable buyer_deposit_temp =  mappingBuyerDeposit[id];
        address payable shipper_deposit_temp =  mappingShipperDeposit[id];


        //refund seller
        DepositSeller(seller_deposit_temp).refundToSellerTrue();
        //refund buyer
        DepositBuyer(buyer_deposit_temp).refundToBuyerFail();
        //refund buyer and seller
        DepositShipper(shipper_deposit_temp).refundToShipper();
    }
    
      
     //get flag buyer
    // function getFlagBuyer(uint id) public view returns(memory string value){
    //     return flagBuyer[id];
    // }
    //set flag buyer
    function setFlagBuyer(uint id, uint flag) external{
        flagBuyer[id] = flag;
        //1 ok
        //2 shipperF
        //3 buyerF
        if(flagBuyer[id]==1 && flagShipper[id]==1 && flagSeller[id]==1){
            runRefundTrue(id);
        }else if(flagBuyer[id]==2 && flagSeller[id]==2){
            runRefundShipperFail(id);
        }else if(flagShipper[id]==3 && flagSeller[id]==3){
            runRefundBuyerFail(id);
        }    
    }

     //get flag buyer
    // function getFlagShipper(uint id) public view returns(bool){
    //     return flagShipper[id];
    // }
    //set flag buyer
    function setFlagShipper(uint id, uint flag) external{
        flagShipper[id] = flag;
        //1 ok
        //2 shipperF
        //3 buyerF
        if(flagBuyer[id]==1 && flagShipper[id]==1 && flagSeller[id]==1){
            runRefundTrue(id);
        }else if(flagBuyer[id]==2 && flagSeller[id]==2){
            runRefundShipperFail(id);
        }else if(flagShipper[id]==3 && flagSeller[id]==3){
            runRefundBuyerFail(id);
        }       
    }

     //get flag buyer
    // function getFlagShipper(uint id) public view returns(bool){
    //     return flagShipper[id];
    // }
    //set flag buyer
    function setFlagSeller(uint id, uint flag) external{
        flagSeller[id] = flag;
        //1 ok
        //2 shipperF
        //3 buyerF
        if(flagBuyer[id]==1 && flagShipper[id]==1 && flagSeller[id]==1){
            runRefundTrue(id);
        }else if(flagBuyer[id]==2 && flagSeller[id]==2){
            runRefundShipperFail(id);
        }else if(flagShipper[id]==3 && flagSeller[id]==3){
            runRefundBuyerFail(id);
        }       
    }

    function setShipperOwner(uint id) external{
        packages[id].status = "Shipper";
    }

    function setDone(uint id) external{
        packages[id].status = "Done";
    }
    function resetPakcageData(uint id) external{
        packages[id].name = "";
        packages[id].price = 0;
        packages[id].details = "";
    }
}
