pragma solidity >=0.4.5;
import './DepositSeller.sol';
import './DepositBuyer.sol';
import './DepositShipper.sol';

contract Seller{
    address payable private seller;
    uint public id = 0;

    struct output_zksnark {
        uint output_0;
        uint output_1;
    }
    struct Package {
        string name;
        uint price;
        string details;
        string address_delivery;
        string current_ower;
    }
    //use when seller verifyTx;
    mapping(uint => output_zksnark) output_zksnarks;

    mapping(uint => uint) flag_buyer;
    mapping(uint => uint) flag_shipper;
    mapping(uint => uint) flag_seller;

    mapping(uint => Package) packages;
    mapping(uint => address payable) mapping_buyer;
    mapping(uint => address) mapping_verifyTx;
    mapping(uint => address payable) mapping_seller_deposit;
    mapping(uint => address payable) mapping_buyer_deposit;
    mapping(uint => address payable) mapping_shipper_deposit;
    modifier onlySeller{
        require(msg.sender == seller);
        _;
    }
    constructor() public payable{
        seller = msg.sender;    
    }  
   function setPackage(string memory _name, uint  _price,string memory _details) onlySeller public{
        packages[id].name = _name;
        packages[id].price = _price;
        packages[id].details = _details;
        packages[id].current_ower = "seller";
        if(id == 1000000000000000000){
            id=0;
        }
        id++;
   }

   function getPackage(uint _id) public view 
   returns(uint index, string memory _name, uint  _price,string memory _details){
        return(
        _id,
        packages[_id].name,
        packages[_id].price,
        packages[_id].details);
   }
   function getCurrentOwer(uint _id) public view 
   returns(string memory _details){
        return(
        packages[_id].current_ower);
   }
    //get package selled for shipper
    function getPackageSelledForShipper(uint _id) onlySeller public view 
    returns(uint index, string memory _name, uint  _price,string memory address_delivery){
        //require(mapping_seller_deposit[_id] != 0x0000000000000000000000000000000000000000,"Package was not bought");
        if(mapping_seller_deposit[_id] != 0x0000000000000000000000000000000000000000)
            return( _id,
                packages[_id].name,
                packages[_id].price,
                packages[_id].address_delivery);
        else
            return( 0, "", 0, "");
    }
    //get package selled for seller
    function getPackageSelled(uint _id) onlySeller public view 
    returns(uint index, string memory _name, uint  _price,string memory address_delivery, string memory details){
    //    require(mapping_buyer[_id] != 0x0000000000000000000000000000000000000000,"Package was not bought");
        if(mapping_buyer[_id] != 0x0000000000000000000000000000000000000000)
            return(
            _id,
            packages[_id].name,
            packages[_id].price,
            packages[_id].address_delivery,
            packages[_id].details
            );
        else
            return(
            0,
            "",
            0,
            "",
            "");
    }
    //get package for verify
    function getPackageVerifier(uint _id) onlySeller public view 
    returns(uint index, string memory _name, uint  _price,string memory _details,
            uint out0, uint out1){
        // require(mapping_buyer[_id] != 0x0000000000000000000000000000000000000000,"Package was not bought"); 
        return(
        _id,
        packages[_id].name,
        packages[_id].price,
        packages[_id].details,
        output_zksnarks[_id].output_0,
        output_zksnarks[_id].output_1);
    }


    function getTotalPackage() onlySeller public view 
    returns(uint total_packages){
            return(id);
    }
     //get address buyer deposit
    function getBuyerDepositAddress(uint _id) public view returns(address payable){
        return mapping_buyer_deposit[_id];
    }
    //get address verifier content verifiTx
    function getAddressVerifier(uint _id) public view returns(address){
        return mapping_verifyTx[_id];
    }
    //get address seller_deposit_to
    function getSellerDepositAddress(uint _id) public view returns(address payable){
        return mapping_seller_deposit[_id];
    }
    //get address seller_deposit_to
    function setSellerDepositAddress(uint _id, address payable _address) public{
        mapping_seller_deposit[_id] = _address;
        packages[_id].current_ower = "selled";
    }
    
    //get address seller_deposit_to
    function getShipperrDepositAddress(uint _id) public view returns(address payable){
        return mapping_shipper_deposit[_id];
    }
    //get address seller_deposit_to
    function setShipperDepositAddress(uint _id, address payable _address) public{
        mapping_shipper_deposit[_id] = _address;
    } 
    //get id buyerItem, return address in Ethereum
    function getBuyerAddress(uint _id) public view returns(address){
        require(id > _id);
        return(mapping_buyer[_id]);
    }

    //get set out0, out1
    function setOutput(uint _id, uint _out0, uint _out1) public returns(bool){
        if(_out0 > 0 && _out1 > 0){
            output_zksnarks[_id].output_0 = _out1;
             output_zksnarks[_id].output_1 = _out1;
            return(true);
        }
        return(false);
    }
    //get address seller_deposit_to
    function getOutput(uint _id) public view returns(uint _out0, uint _out1){
        return( output_zksnarks[_id].output_0,  output_zksnarks[_id].output_1);
    }

    //start buyer action
    //_address is address will delivery to
    function buyItem(uint _id,string memory _address, address _address_verifyTx,
    address payable _address_buyer_deposit, uint _out0, uint _out1) 
    public returns(string memory _name, uint  _price,string memory _details, string memory _address_real){
        //require Package available
        require(packages[_id].price > 0,"Package unavailable");
        //make sure no one buy it before
        require(mapping_buyer[_id] == 0x0000000000000000000000000000000000000000,"Package bought");
       
        mapping_buyer[_id] = msg.sender;
        packages[_id].address_delivery = _address;
        mapping_verifyTx[_id] = _address_verifyTx;
        mapping_buyer_deposit[_id] = _address_buyer_deposit;
        output_zksnarks[_id].output_0 = _out0;
        output_zksnarks[_id].output_1 = _out1;

        packages[_id].current_ower = "buyer";
        return(
            packages[_id].name,
            packages[_id].price,
            packages[_id].details,
            _address);
    }
    
     //run address seller_deposit_to
    function runRefundTrue(uint _id) public{
        address payable seller_deposit_temp = mapping_seller_deposit[_id];
        address payable buyer_deposit_temp =  mapping_buyer_deposit[_id];
        address payable shipper_deposit_temp =  mapping_shipper_deposit[_id];
        //refund seller
        DepositSeller(seller_deposit_temp).refundToSellerTrue();
        //refund buyer
        DepositBuyer(buyer_deposit_temp).refundToBuyerTrue();
        //refund seller
        address payable seller_temp = DepositSeller(seller_deposit_temp).getOwer();
        DepositShipper(shipper_deposit_temp).refundToShipperAndSellerTrue(seller_temp);
    }
    
    //run address seller_deposit_to
    function runRefundShipperFail(uint _id) public{
        address payable seller_deposit_temp = mapping_seller_deposit[_id];
        address payable buyer_deposit_temp =  mapping_buyer_deposit[_id];
        address payable shipper_deposit_temp =  mapping_shipper_deposit[_id];
        //refund seller
        DepositSeller(seller_deposit_temp).refundToSellerTrue();
        //refund buyer
        DepositBuyer(buyer_deposit_temp).refundToBuyerTrue();
        //refund buyer and seller
        address payable seller_temp = DepositSeller(seller_deposit_temp).getOwer();
        DepositShipper(shipper_deposit_temp).refundToSellerAndBuyerSHF(seller_temp, mapping_buyer[_id]);
    }
    
    
    //run address seller_deposit_to
    function runRefundBuyerFail(uint _id) public{
        address payable seller_deposit_temp = mapping_seller_deposit[_id];
        address payable buyer_deposit_temp =  mapping_buyer_deposit[_id];
        address payable shipper_deposit_temp =  mapping_shipper_deposit[_id];
        address payable seller_temp = DepositSeller(seller_deposit_temp).getOwer();
        address payable shipper_temp = DepositSeller(shipper_deposit_temp).getOwer();

        //refund seller
        DepositSeller(seller_deposit_temp).refundToSellerTrue();
        //refund buyer
        DepositBuyer(buyer_deposit_temp).refundToBuyerFail(seller_temp, shipper_temp);
        //refund buyer and seller
        DepositShipper(shipper_deposit_temp).refundToShipperAndSellerTrue(seller_temp);
    }
    
      
     //get flag buyer
    // function getFlagBuyer(uint _id) public view returns(memory string value){
    //     return flag_buyer[_id];
    // }
    //set flag buyer
    function setFlagBuyer(uint _id, uint _flag) public{
        flag_buyer[_id] = _flag;
        //1 ok
        //2 shipperF
        //3 buyerF
        if(flag_buyer[_id]==1 && flag_shipper[_id]==1 && flag_seller[_id]==1){
            runRefundTrue(_id);
        }else if(flag_buyer[_id]==2 && flag_seller[_id]==2){
            runRefundShipperFail(_id);
        }else if(flag_shipper[_id]==3 && flag_seller[_id]==3){
            runRefundShipperFail(_id);
        }    
    }

     //get flag buyer
    // function getFlagShipper(uint _id) public view returns(bool){
    //     return flag_shipper[_id];
    // }
    //set flag buyer
    function setFlagShipper(uint _id, uint _flag) public{
        flag_shipper[_id] = _flag;
        //1 ok
        //2 shipperF
        //3 buyerF
        if(flag_buyer[_id]==1 && flag_shipper[_id]==1 && flag_seller[_id]==1){
            runRefundTrue(_id);
        }else if(flag_buyer[_id]==2 && flag_seller[_id]==2){
            runRefundShipperFail(_id);
        }else if(flag_shipper[_id]==3 && flag_seller[_id]==3){
            runRefundShipperFail(_id);
        }       
    }

     //get flag buyer
    // function getFlagShipper(uint _id) public view returns(bool){
    //     return flag_shipper[_id];
    // }
    //set flag buyer
    function setFlagSeller(uint _id, uint _flag) public{
        flag_seller[_id] = _flag;
        //1 ok
        //2 shipperF
        //3 buyerF
        if(flag_buyer[_id]==1 && flag_shipper[_id]==1 && flag_seller[_id]==1){
            runRefundTrue(_id);
        }else if(flag_buyer[_id]==2 && flag_seller[_id]==2){
            runRefundShipperFail(_id);
        }else if(flag_shipper[_id]==3 && flag_seller[_id]==3){
            runRefundShipperFail(_id);
        }       
    }

    function setShipperOwner(uint _id) public{
        packages[_id].current_ower = "shipper";
    }

    function setDone(uint _id) public{
        packages[_id].current_ower = "Done";
    }
    function resetPakcageData(uint _id) public{
        packages[_id].name = "";
        packages[_id].price = 0;
        packages[_id].details = "";
    }
}
