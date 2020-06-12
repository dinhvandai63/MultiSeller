pragma solidity ^0.6.1;
contract DepositBuyer {
    address payable private owner;
    address payable private seller;
    address payable private shipper;
    address private contractSeller;
    mapping (address => uint) private balances;

    modifier onlySellerContract{
        require(msg.sender == contractSeller);
        _;
    }
    constructor(address payable _seller, address payable _shipper, address _contract_seller) payable public {
        owner = msg.sender;    
        seller = _seller;
        shipper = _shipper;
        //addres main contract
        contractSeller = _contract_seller;
        balances[msg.sender] = msg.value;

    }
    
    function getowner() external view returns(address payable) {
        // require(msg.sender==owner);
        return owner;    
    }

    function getEther() private view returns(uint) {
       return  balances[owner];    
    }
    //refund full money to owner
    function refundToBuyerTrue() onlySellerContract payable external {
        uint etherI = getEther();
        balances[owner] = 0;
        owner.transfer(etherI);
    }
    
    //refund full money to owner
    function refundToBuyerFail() onlySellerContract payable external {
        // require(msg.sender==owner, "wrong address");
        //send buyer 50%
        uint eOwner = getEther()/2;
        balances[owner] = 0;

        seller.transfer(eOwner);
        //send shipper 50%
        shipper.transfer(eOwner);
    }
}