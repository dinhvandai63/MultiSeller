pragma solidity ^0.6.1;

import './DepositShipper.sol';

contract DepositSeller {
    //owner is address seller
    address payable owner;
    address private contract_seller;    
    mapping (address => uint) private balances;
    //_address is address real in the world, ship will tranfer packeage to
    modifier onlySellerContract{
        require(msg.sender == contract_seller);
        _;
    }
    
    constructor(address _contract_seller) payable public {
        owner = msg.sender;    
        contract_seller = _contract_seller;
        balances[msg.sender] = msg.value;
    }

    function getEther() private view returns(uint) {
       return  balances[owner];    
    }

    function getowner() external view returns(address payable) {
       return owner;    
    }

    //refund full money to owner
    function refundToSellerTrue() onlySellerContract payable external {
        uint eOwner = getEther();
        balances[owner] = 0;
        owner.transfer(eOwner);
    }
    //refund full money to owner Fail
    function refundToSellerFail() onlySellerContract payable external {
        uint e_ower = getEther();
        balances[owner] = 0;
        owner.transfer(e_ower);
    }
}