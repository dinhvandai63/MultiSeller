pragma solidity  ^0.6.1;
contract DepositBuyer {
    address payable public owner;
    address payable private seller;
    address payable private shipper;

    constructor(address payable _seller, address payable _shipper) payable public {
        owner = msg.sender;    
        seller = _seller;
        shipper = _shipper;
    }
    
    function getowner() public view returns(address payable) {
        // require(msg.sender==owner);
        return owner;    
    }

    //refund full money to owner
    function refundToBuyerTrue() payable external {
        owner.transfer(address(this).balance);
    }
    
    //refund full money to owner
    function refundToBuyerFail() payable external {
        // require(msg.sender==owner, "wrong address");
        //send buyer 50%
        seller.transfer(address(this).balance/2);
        //send shipper 50%
        shipper.transfer(address(this).balance);
    }
}