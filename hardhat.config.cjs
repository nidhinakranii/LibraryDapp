// hardhat.config.js

require("dotenv").config();
require("@nomiclabs/hardhat-ethers");

module.exports = {
  solidity: "0.8.10",
  paths: {
    artifacts: "./src/artifacts",
  },
  networks: {
    fuji: {
      url: "https://quaint-green-cherry.avalanche-testnet.quiknode.pro/61620aa241785ec33ddaebbfe8ffe2e801732308/ext/bc/C/rpc/",
      accounts: [
        "c43dee3b700c00cd339b9eed2a87edfc3b5501b62a915dbb074d8da36154ff6b",
      ],
      chainId: 43113,
    },
  },
};
