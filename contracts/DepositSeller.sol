pragma solidity  ^0.6.1;
import './DepositShipper.sol';

contract DepositSeller {
    //owner is address seller
    address payable owner;
    address public contract_seller;    
    mapping (address => uint) public balances;
    //_address is address real in the world, ship will tranfer packeage to
    constructor(address _contract_seller) payable public {
        owner = msg.sender;    
        contract_seller = _contract_seller;
        balances[msg.sender] = msg.value;
    }

    function getEther() public view returns(uint) {
       return  balances[owner];    
    }

    function getowner() public view returns(address payable) {
       return owner;    
    }

    //refund full money to owner
    function refundToSellerTrue() payable public {
        owner.transfer(getEther());
        balances[owner] -= getEther();
    }
    //refund full money to owner Fail
    function refundToSellerFail() payable public {
        owner.transfer(getEther());
        balances[owner] -= getEther();
    }
}