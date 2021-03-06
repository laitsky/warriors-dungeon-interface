import React, { useEffect, useState } from 'react';
import twitterLogo from './assets/twitter-logo.svg';
import './App.css';

import Arena from './Components/Arena';
import SelectCharacter from './Components/SelectCharacter';
import LoadingIndicator from './Components/LoadingIndicator';
import { ethers } from 'ethers';

// Constants
import { CONTRACT_ADDRESS, transformCharacterData } from './constants';
import myEpicGame from './utils/MyEpicGame.json';
const TWITTER_HANDLE = '_buildspace';
const TWITTER_LINK = `https://twitter.com/${TWITTER_HANDLE}`;

const App = () => {
  const [currentAccount, setCurrentAccount] = useState(null);
  const [characterNFT, setCharacterNFT] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isRinkeby, setIsRinkeby] = useState(true);

  const checkIfWalletIsConnected = async () => {
    try {
      // making sure we have access to window.ethereum object
      const { ethereum } = window;

      if (!ethereum) {
        console.error("Make sure you have metamask!");
        return;
      } else {
        const accounts = await ethereum.request({ method: 'eth_accounts' });

        if (accounts.length !== 0) {
          const account = accounts[0];
          setCurrentAccount(account);
        } else {
          console.error("No authorized account found");
        }
      }
    } catch (error) {
      console.error(error);
    }
  }

  const connectWalletAction = async () => {
    try {
      const { ethereum } = window;
      if (!ethereum) {
        alert("Get Metamask!");
        return;
      }

      // request access to account
      const accounts = await ethereum.request({
        method: 'eth_requestAccounts',
      });

      setCurrentAccount(accounts[0]);
    } catch (error) {
      console.error(error);
    }
  }

  // render method
  const renderContent = () => {
    if (isLoading) {
      return <LoadingIndicator />
    }
    // scenario 1: user has not connected to the app
    if (!isRinkeby) {
      return <h1 style={{color: 'white'}}>Please connect to Rinkeby Network</h1>
    } else if (!currentAccount) {
      return (
        <div className="connect-wallet-container">
          <img
            src="https://64.media.tumblr.com/ddeb17c9e8a5e685d4c99acbdbd4f769/171d56c416816ca4-f4/s400x600/aadccdf1eecfca54d0bebdf368ac9d05acbb199b.gifv"
            alt="Dynasty Warriors Gif"
          />
          <button
            className="cta-button connect-wallet-button"
            onClick={connectWalletAction}
          >
            Connect wallet to get started
          </button>
        </div>
      )
      // scenario 2: user connected but have no character NFT
    } else if (currentAccount && !characterNFT) {
      return (
        <SelectCharacter setCharacterNFT={setCharacterNFT} />
      )
      // scenario 3: user connected with character NFT
    } else if (currentAccount && characterNFT) {
      return <Arena characterNFT={characterNFT} setCharacterNFT={setCharacterNFT} />;
    }
  }

  useEffect(() => {
    if (window.ethereum) {
      window.ethereum.on('networkChanged', () => {
        if (+window.ethereum.networkVersion !== 4) { // 4: Rinkeby Testnet 
          setIsRinkeby(false);
        }
      });
    }
    if (currentAccount !== null) {
      setIsLoading(true);
    }
    checkIfWalletIsConnected();
  }, []);

  useEffect(() => {
    const fetchNFTMetadata = async () => {
      const { ethereum } = window;

      const provider = new ethers.providers.Web3Provider(ethereum);
      const signer = provider.getSigner();
      const gameContract = new ethers.Contract(
        CONTRACT_ADDRESS,
        myEpicGame.abi,
        signer
      );

      const warriorNFT = await gameContract.checkIfUserHasNFT();
      if (warriorNFT.name) {
        setCharacterNFT(transformCharacterData(warriorNFT));
      } else {
        console.error("No warrior NFT found");
      }

      setIsLoading(false);
    };

    if (currentAccount) {
      fetchNFTMetadata();
    }
  }, [currentAccount]);

  return (
    <div className="App">
      <div className="container">
        <div className="header-container">
          <p className="header gradient-text">?????? Warriors Dungeon ??????</p>
          <p className="sub-text">Team up to protect the our kingdom!</p>
          {renderContent()}
        </div>
        <div className="footer-container">
          <img alt="Twitter Logo" className="twitter-logo" src={twitterLogo} />
          <a
            className="footer-text"
            href={TWITTER_LINK}
            target="_blank"
            rel="noreferrer"
          >{`built with @${TWITTER_HANDLE}`}</a>
        </div>
      </div>
    </div>
  );
};

export default App;
