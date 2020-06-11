pragma solidity  ^0.6.1;
contract DepositBuyer {
    address payable public owner;
    address payable public seller;
    address payable public shipper;
    address public contract_seller;
    mapping (address => uint) public balances;

    modifier onlySellerContract{
        require(msg.sender == contract_seller);
        _;
    }
    constructor(address payable _seller, address payable _shipper, address _contract_seller) payable public {
        owner = msg.sender;    
        seller = _seller;
        shipper = _shipper;
        //addres main contract
        contract_seller = _contract_seller;
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
    function refundToBuyerTrue() onlySellerContract payable external {
        owner.transfer(getEther());
        balances[owner] -= getEther();
    }
    
    //refund full money to owner
    function refundToBuyerFail() onlySellerContract payable external {
        // require(msg.sender==owner, "wrong address");
        //send buyer 50%
        seller.transfer(getEther()/2);
        balances[owner] -= getEther()/2;

        //send shipper 50%
        shipper.transfer(getEther());
    }
}