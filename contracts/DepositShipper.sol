pragma solidity  >=0.4.21 <0.6.0;
contract DepositShipper {
    address payable private ower;
    address private contract_seller;    

    // address private buyer;
    // string private name;
    // uint code_ship_success;
    // uint code_ship_fail;
    
    constructor() payable public {
        ower = msg.sender;
        // code_ship_success = random(14);
        // code_ship_fail = random(52);
    }
    
    // //get code_ship_success
    // function getCodeShipSuccess() public view returns(uint) {
    //    return code_ship_success;    
    // }
    
    // //get_code_ship_fail
    // function getCodeShipFail() public view returns(uint) {
    //    return code_ship_fail;    
    // }
    
    function getEther() public view returns(uint) {
       return address(this).balance;    
    }

    // function getName() public view returns(string memory) { 
    //    return name;    
    // }
    //return address ower
    function getOwer() public view returns(address payable) {
       return ower;    
    }
    function sendEther(address payable _address) public {
        address(_address).transfer(1 ether);
    }
    
    function random(uint seed) public view returns (uint) {
        uint result = uint(keccak256(abi.encodePacked(block.difficulty,seed+now)))%123456;
        if(result < 100000){
            result+=123456;
        }
        return result;
    }
    
    //refund full money to ower, and seller if sesssion successs
    function refundToShipperAndSellerTrue(address payable _seller) payable public {
        uint balance_to_shipper;
        uint shipper_balance = getEther();
        //caculate 30% deposit send to Shipper from 130% value package,
        // 30% = (value / 130) * 30
        // 30% = value * (30/130)
        balance_to_shipper = (shipper_balance*2307692308)/10000000000;
        address(ower).transfer(balance_to_shipper);
        address(_seller).transfer(getEther());
    }
    
    //shiper failse
    function refundToSellerAndBuyerSHF(address payable _seller, address payable _buyer) payable public {
        //send to seller
        uint e_to_seller;
        uint shipper_balance = getEther();

        //caculate 30% deposit send to Shipper from 130% value package,
        // 30% = (value / 130) * 30
        // 30% = value * (30/130)
        e_to_seller = (shipper_balance*1153846154)/10000000000;
        address(_seller).transfer(e_to_seller);
        address(_buyer).transfer(e_to_seller);

        address(ower).transfer(getEther());
    }
}