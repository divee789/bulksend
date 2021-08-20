import Web3 from "web3";
import Diveeabi from "./artifacts/DiveeToken.json";
import BulkSendabi from "./artifacts/BulkSend.json";

const web3 = new Web3("https://data-seed-prebsc-1-s1.binance.org:8545");

const DiveeAddress = process.env.REACT_APP_DIVEE_TOKEN_ADDRESS;
const BulkSendAddress = process.env.REACT_APP_BULKSEND_CONTRACT_TOKEN_ADDRESS;

export const connectWallet = async () => {
  if (window.ethereum) {
    try {
      const addressesArray = await window.ethereum.request({
        method: "eth_requestAccounts",
      });
      if (addressesArray.length === 0) {
        throw new Error("No wallet addresses found");
      }

      return addressesArray[0];
    } catch (err) {
      console.log(error);
      if (err.code === 4001) {
        // EIP-1193 userRejectedRequest error
        // If this happens, the user rejected the connection request.
        throw new Error("User rejected connection request");
      }
      throw new Error(err.message);
    }
  } else {
    console.log("NO WINDOW FOUND");

    throw new Error("Ethereum wallet not found");
  }
};

export const addWalletListener = (callback, error) => {
  if (window.ethereum) {
    window.ethereum.on("accountsChanged", (accounts) => {
      if (accounts.length > 0) {
        callback(accounts[0]);
      } else {
        callback(null);
      }
    });
  } else {
    error();
  }
};

export const getTxCount = async () => {
  const instance = await getInstance("a", "a");
  const numTweets = await instance.methods.txCount().call();
  console.log(numTweets);
  return numTweets;
};

export const getInstance = async (artifact, address) => {
  const contract = artifact === "divee" ? Diveeabi : BulkSendabi;
  const networkId = await web3.eth.net.getId();
  const networkData = contract.networks[networkId];
  console.log("DEPLOYED ADDRESS", networkData.address);
  if (networkData) {
    return new web3.eth.Contract(
      contract.abi,
      address === "divee" ? DiveeAddress : BulkSendAddress
    );
  }
};

export const approveBulkTransfer = async (walletAddress) => {
  const instance = await getInstance("divee", "divee");
  await instance.methods.approve(BulkSendAddress, 100000000).send({
    from: walletAddress,
  });
};

export const bulkTransfer = async (
  walletAddress,
  addresses,
  tokenAddress,
  amount
) => {
  const instance = await getInstance("", "");
  await instance.methods
    .bulkTransfer(0.1, 2, tokenAddress, addresses, [amount])
    .send({
      from: walletAddress,
    });
};

export const getTokenTotalSupply = async () => {
  const instance = await getInstance("divee", "divee");
  const x = await instance.methods.totalSupply().call();
  console.log(x);
  return x;
};

export const getCurrentWalletConnected = async () => {
  if (window.ethereum) {
    try {
      const addressArray = await window.ethereum.request({
        method: "eth_accounts",
      });
      if (addressArray.length > 0) {
        return addressArray[0];
      } else {
        return null;
      }
    } catch (err) {
      throw new Error(err.message);
    }
  } else {
    throw new Error("Ethereum wallet not found");
  }
};

export const sendTransaction = async (
  contractAddress,
  walletAddress,
  method
) => {
  const nonce = await web3.eth.getTransactionCount(walletAddress, "latest");
  const parameters = {
    to: contractAddress, // Required except during contract publications.
    from: walletAddress, // must match user's active address.
    data: method.encodeABI(),
    nonce: nonce,
  };

  const signedTx = await web3.eth.accounts.signTransaction(
    parameters,
    process.env.REACT_APP_PRIVATE_KEY
  );

  web3.eth.sendSignedTransaction(
    signedTx.rawTransaction,
    function (error, hash) {
      if (!error) {
        console.log("🎉 The hash of your transaction is: ", hash);
        return hash;
      } else {
        console.log(
          "❗Something went wrong while submitting your transaction:",
          error
        );
        throw new Error(error.message);
      }
    }
  );
};
