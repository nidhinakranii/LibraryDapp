// SPDX-License-Identifier: GPL-3.0
pragma solidity 0.8.10;


interface IERC20 {
    function transfer(address to, uint256 value) external returns (bool);
    function transferFrom(address from, address to, uint256 value) external returns (bool);
    function balanceOf(address account) external view returns (uint256);
}

contract Bank{
    IERC20 public Token0;
    mapping(address => uint) balance;

   constructor (address _token0) {

    
       Token0 = IERC20(_token0);
        
    }
 


     function depositFor(uint256 amount) external {

        require(Token0.transferFrom(msg.sender, address(this), amount), "transfer failed");
        
        balance[msg.sender] += amount;

    }


    function withdrawal(uint amount) external {

        require(balance[msg.sender] >= amount, "insufficient amount");

        balance[msg.sender] -= amount;

        require(Token0.transfer(msg.sender, amount), "transfer failed");

}



    
}



contract Ballot {
  


  IERC20 public govToken;
  IERC20 public wrappedGovToken;


   bytes32 public proposal =  keccak256("e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855");
   uint public proposalCount_For_proposal;
   uint public total_for_vote;
   uint public total_against_vote;
   uint public threshold;

    address public admin;

   enum state {
    pass,
    fail
   }


    mapping(address => mapping(bytes32 => bool)) public vote; 
    mapping(bytes32 => state) public Result;





   constructor(address _govToken, uint _threshold) {

       govToken = IERC20(_govToken);
       threshold = _threshold;
       admin = msg.sender;
   }


   function voteForProposal(bytes32 _proposal, bool _b ) external {

       
        require(_proposal == proposal, "incorrect proposal");
        require( !vote[msg.sender][_proposal], "already voted");

        vote[msg.sender][_proposal] = true;

        if (_b) {

            total_for_vote +=  govToken.balanceOf(msg.sender);
        }
        else

            total_against_vote += govToken.balanceOf(msg.sender);
        }   



    function calculateResult() external {


        require(msg.sender == admin, "not authorized");


        if (total_for_vote > threshold && total_for_vote > total_against_vote) {


            Result[proposal] = state.pass;

        } else {


            Result[proposal] = state.fail;
        }


         

        

    }




 
    
   }

























