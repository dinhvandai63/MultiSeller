pragma solidity ^0.6.1;
contract DepositShipper {
    address payable private owner;
    address payable private seller;    
    address payable private buyer;  
    address private contract_seller;  
    mapping (address => uint) private balances;
    
    modifier onlySellerContract{
        require(msg.sender == contract_seller);
        _;
    }
    constructor(address payable _seller, address payable _buyer,  address _contract_seller) payable public {
        owner = msg.sender;
        seller = _seller;
        buyer = _buyer;
        contract_seller = _contract_seller;
        balances[msg.sender] = msg.value;
    }
    
    function getEther() private view returns(uint) {
       return balances[owner];    
    }
    //return address owner
    function getOwer() external view returns(address payable) {
       return owner;    
    }
    
    //refund full money to owner, and seller if sesssion successs
    function refundToShipperAndSellerTrue() onlySellerContract payable external {
        // require(msg.sender==owner, "wrong address");
        uint balance_to_shipper;
        uint shipper_balance = getEther();
        //caculate 30% deposit send to Shipper from 130% value package,
        // 30% = (value / 130) * 30
        // 30% = value * (30/130)
        balance_to_shipper = (shipper_balance*30)/130;
        balances[owner] -= balance_to_shipper;
        owner.transfer(balance_to_shipper);
        seller.transfer(getEther());
    }
    
    //shiper failse
    function refundToSellerAndBuyerSHF() onlySellerContract payable external {
        // require(msg.sender==owner, "wrong address");
        //send to seller
        uint e_to_seller;
        uint shipper_balance = getEther();

        //caculate 30% deposit send to Shipper from 130% value package,
        // 30% = (value / 130) * 30
        // 30% = value * (30/130)
        e_to_seller = (shipper_balance*15)/130;
        
        
        seller.transfer(e_to_seller);
        balances[owner] -= e_to_seller;
        buyer.transfer(e_to_seller);
        balances[owner] -= e_to_seller;
        owner.transfer(getEther());
    }
    
    //shiper failse
    function refundToShipper() onlySellerContract payable external {
        // require(msg.sender==owner, "wrong address");
        //send to seller
        owner.transfer(getEther());
        balances[owner] -= getEther();
    }
}