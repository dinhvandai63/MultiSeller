pragma solidity  >=0.4.21 <0.6.0;
import './DepositShipper.sol';

contract DepositSeller {
    //ower is address seller
    address payable ower;
    address private contract_seller;    
    // string name;
    // //address_verifyTx is contract verify use Zokrates
    // address public address_verifyTx;
    // address public shipper;
    // address payable public id_buyer_deposit;
    // address payable public id_shipper_deposit;
    
    // Package public package;
    
    // struct Package {
    //     string name;
    //     uint price;
    //     string address_delivery;
    // }
    
    //_address is address real in the world, ship will tranfer packeage to
    constructor(address _contract_seller) payable public {
        ower = msg.sender;    
        contract_seller = _contract_seller;
    }

    // function setValueFirst(string memory _name_item, uint _price, string memory _address,address _address_verifyTx) public
    // {  
    //     package.name = _name_item;
    //     package.price = _price;
    //     package.address_delivery = _address;
    //     address_verifyTx = _address_verifyTx;
    // }
    // function setPackage(string memory _name, uint  _price) public{
    //     package.name = _name;
    //     package.price = _price;
    // }

    // function getPackage() public view 
    // returns( string memory _name, uint  _price, string memory address_delivery){
    //     return(
    //     package.name,
    //     package.price,
    //     package.address_delivery);
    // }
    // //set address shipper deposit
    // function setAddressShipperDeposit(address payable _address_shipper_Deposit) public{
    //    id_shipper_deposit = _address_shipper_Deposit;
    // }

    function getEther() public view returns(uint) {
       return address(this).balance;    
    }

    function getOwer() public view returns(address payable) {
       return ower;    
    }

    // function getName() public view returns(string memory) { 
    //    return name;    
    // }
    
    // //set Id address shipper, and deposit
    // function shipPackage() public returns(bool) {
    //     require(shipper == 0x0000000000000000000000000000000000000000,"Package Shiped");
    //     require(ower != msg.sender,"seller don't ship package");
    //     shipper = msg.sender;
    //     return true;    
    // }
    //refund full money to ower
    function refundToSellerTrue() payable public {
        address(ower).transfer(getEther());
    }
    //refund full money to ower Fail
    function refundToSellerFail() payable public {
        address(ower).transfer(getEther());
    }
}