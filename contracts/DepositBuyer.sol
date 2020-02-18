pragma solidity >=0.4.5;
contract DepositBuyer {
    address payable public ower;
    address private contract_seller;

    constructor(address _contract_seller) payable public {
        ower = msg.sender;    
        contract_seller = _contract_seller;
    }
    
    function getEther() public view returns(uint) {
       return address(this).balance;    
    }

    function getOwer() public view returns(address payable) {
       return ower;    
    }

    //refund full money to ower
    function refundToBuyerTrue() payable public {
        address(ower).transfer(getEther());
    }
    
    //refund full money to ower
    function refundToBuyerFail(address payable _seller, address payable _shipper) payable public {
        //send buyer 50%
        address(_seller).transfer(getEther()/2);
        //send shipper 50%
        address(_shipper).transfer(getEther());
    }
}