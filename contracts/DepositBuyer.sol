pragma solidity  >=0.5.3;
contract DepositBuyer {
    address payable public owner;
    address private contract_seller;

    constructor(address _contract_seller) payable public {
        owner = msg.sender;    
        contract_seller = _contract_seller;
    }
    
    function getowner() public view returns(address payable) {
        require(msg.sender==owner);
        return owner;    
    }

    //refund full money to owner
    function refundToBuyerTrue() payable external {
        require(msg.sender==owner);
        address(owner).transfer(address(this).balance);
        
    }
    
    //refund full money to owner
    function refundToBuyerFail(address payable _seller, address payable _shipper) payable external {
        require(msg.sender==owner);
        require(_seller!=0x0000000000000000000000000000000000000000);
        require(_shipper!=0x0000000000000000000000000000000000000000);
        //send buyer 50%
        address(_seller).transfer(address(this).balance/2);
        //send shipper 50%
        address(_shipper).transfer(address(this).balance);
    }
}