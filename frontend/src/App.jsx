import { useEffect, useState } from "react";
import {
  getCurrentWalletConnected,
  connectWallet,
  addWalletListener,
  getTxCount,
  approveBulkTransfer,
  createAccount,
} from "./web3";

function App() {
  const [wallet, setWallet] = useState(null);
  const [connectLoading, setConnectLoading] = useState(false);

  const bootstrap = async () => {
    try {
      const walletAddress = await getCurrentWalletConnected();
      if (walletAddress) {
        setWallet(walletAddress);
      }
    } catch (error) {
      console.log("BOOTSTRAP ERROR", error.message);

      window.alert(
        "There has been an error setting up the application for you, please reload the page"
      );
    }
  };

  useEffect(() => {
    bootstrap();
    addWalletListener(
      (address) => {
        setWallet(address);
        return;
      },
      () => window.alert("There has been an error")
    );
  }, []);

  return (
    <section>
      <p>APP READY</p>
      {wallet ? (
        <>
          <button onClick={() => getTxCount()}>{wallet}</button>
          <div>
            <button
              onClick={async () => {
                try {
                  await approveBulkTransfer(wallet);
                } catch (error) {
                  console.log(error);
                }
              }}
            >
              approveBulkTransfer
            </button>
          </div>
          <div>
            <button
              onClick={async () => {
                try {
                  await createAccount();
                } catch (error) {
                  console.log(error);
                }
              }}
            >
              CREATE ACCOUNT
            </button>
          </div>
        </>
      ) : (
        <button
          onClick={() => {
            setConnectLoading(true);
            connectWallet()
              .then((address) => setWallet(address))
              .catch((err) => {
                console.log("CONNECTION ERROR", err);
                window.alert("There has been an error connecting your wallet");
              });
            setConnectLoading(false);
          }}
          disabled={connectLoading}
        >
          {connectLoading ? "Connecting Wallet..." : "Connect Metamask Wallet"}
        </button>
      )}
    </section>
  );
}

export default App;
