// scripts/deploy.js

async function main() {
    const { ethers } = require("hardhat");

    const LibraryFactory = await ethers.getContractFactory("Library");
    const library = await LibraryFactory.deploy();
  
    await library.deployed();
  
    console.log("Library contract deployed to:", library.address);
    console.log("Deployed by:", library.deployTransaction.from);
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
