pragma solidity  ^0.6.1;
contract DepositShipper {
    address payable private owner;

    address payable private seller;    

    address payable private buyer;  


    constructor(address payable _seller, address payable _buyer) payable public {
        owner = msg.sender;
        seller = _seller;
        buyer = _buyer;
    }
    
    function getEther() public view returns(uint) {
       return address(this).balance;    
    }
    //return address owner
    function getOwer() public view returns(address payable) {
       return owner;    
    }
    
    //refund full money to owner, and seller if sesssion successs
    function refundToShipperAndSellerTrue() payable public {
        // require(msg.sender==owner, "wrong address");
        uint balance_to_shipper;
        uint shipper_balance = getEther();
        //caculate 30% deposit send to Shipper from 130% value package,
        // 30% = (value / 130) * 30
        // 30% = value * (30/130)
        balance_to_shipper = (shipper_balance*2307692308)/10000000000;
        owner.transfer(balance_to_shipper);
        seller.transfer(getEther());
    }
    
    //shiper failse
    function refundToSellerAndBuyerSHF() payable public {
        // require(msg.sender==owner, "wrong address");
        //send to seller
        uint e_to_seller;
        uint shipper_balance = getEther();

        //caculate 30% deposit send to Shipper from 130% value package,
        // 30% = (value / 130) * 30
        // 30% = value * (30/130)
        e_to_seller = (shipper_balance*1153846154)/10000000000;
        seller.transfer(e_to_seller);
        buyer.transfer(e_to_seller);

        owner.transfer(getEther());
    }
}