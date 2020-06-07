pragma solidity  ^0.6.1;
contract DepositBuyer {
    address payable public owner;
    address payable public seller;
    address payable public shipper;
    mapping (address => uint) public balances;

    constructor(address payable _seller, address payable _shipper) payable public {
        owner = msg.sender;    
        seller = _seller;
        shipper = _shipper;
        balances[msg.sender] = msg.value;

    }
    
    function getowner() public view returns(address payable) {
        // require(msg.sender==owner);
        return owner;    
    }

    function getEther() public view returns(uint) {
       return  balances[owner];    
    }
    //refund full money to owner
    function refundToBuyerTrue() payable external {
        owner.transfer(getEther());
        balances[owner] -= getEther();
    }
    
    //refund full money to owner
    function refundToBuyerFail() payable external {
        // require(msg.sender==owner, "wrong address");
        //send buyer 50%
        seller.transfer(getEther()/2);
        balances[owner] -= getEther()/2;

        //send shipper 50%
        shipper.transfer(getEther());
    }
}