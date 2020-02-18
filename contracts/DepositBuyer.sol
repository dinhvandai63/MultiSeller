pragma solidity  >=0.4.21 <0.6.0;
contract DepositBuyer {
    address payable public ower;
    address private contract_seller;

    constructor(address _contract_seller) payable public {
        ower = msg.sender;    
        contract_seller = _contract_seller;
    }
    
    function getOwer() public view returns(address payable) {
        if(msg.sender==ower || msg.sender==contract_seller){
            return ower;    
        }
    }

    //refund full money to ower
    function refundToBuyerTrue() payable external {
        if(msg.sender==contract_seller){
            address(ower).transfer(address(this).balance);
        }
    }
    
    //refund full money to ower
    function refundToBuyerFail(address payable _seller, address payable _shipper) payable external {
        if(msg.sender == ower && _seller!=0x0000000000000000000000000000000000000000 && _shipper!=0x0000000000000000000000000000000000000000){
            //send buyer 50%
            address(_seller).transfer(address(this).balance/2);
            //send shipper 50%
            address(_shipper).transfer(address(this).balance);
        }
    }
}