import React, { useState, useEffect } from 'react';
import './SelectCharacter.css';
import LoadingIndicator from '../LoadingIndicator';
import { ethers } from 'ethers';
import { CONTRACT_ADDRESS, transformCharacterData } from '../../constants';
import myEpicGame from '../../utils/MyEpicGame.json';

const SelectCharacter = ({ setCharacterNFT }) => {
  const [characters, setCharacters] = useState([]);
  const [gameContract, setGameContract] = useState(null);
  const [mintingCharacter, setMintingCharacter] = useState(false);

  useEffect(() => {
    const { ethereum } = window;

    if (ethereum) {
      const provider = new ethers.providers.Web3Provider(ethereum);
      const signer = provider.getSigner();
      const gameContract = new ethers.Contract(
        CONTRACT_ADDRESS,
        myEpicGame.abi,
        signer
      );

      setGameContract(gameContract);
    } else {
      console.log("Ethereum object not found");
    }
  }, []);

  useEffect(() => {
    const getCharacters = async () => {
      try {
        console.log("Getting contract characters to mint");

        // call contract to get all mint-able characters
        const charactersTxn = await gameContract.getAllDefaultCharacters();
        console.log("charactersTxn: ", charactersTxn);

        // transform all characters data
        const characters = charactersTxn.map((characterData) => transformCharacterData(characterData));

        setCharacters(characters);
      } catch (error) {
        console.error("Something went wrong with fetching characters: ", error);
      }
    };

    const onCharacterMint = async (sender, tokenId, characterIndex) => {
      console.log(
        `CharacterNFTMinted - sender: ${sender} tokenId: ${tokenId.toNumber()} characterIndex: ${characterIndex}`
      );

      if (gameContract) {
        const characterNFT = await gameContract.checkIfUserHasNFT();
        console.log('CharacterNFT: ', characterNFT);
        setCharacterNFT(transformCharacterData(characterNFT));
      }
    }

    // if gameContract is ready, get the characters!
    if (gameContract) {
      getCharacters();
      gameContract.on('CharacterNFTMinted', onCharacterMint);
    }

    return () => {
      if (gameContract) {
        gameContract.off('CharacterNFTMinted', onCharacterMint);
      }
    }
  }, [gameContract]);

  // render methods
  const renderCharacters = () => {
    return (
      characters.map((char, index) => (
        <div className="character-item" key={char.name}>
          <div className="name-container">
            <p>{char.name}</p>
          </div>
          <img src={`https://cloudflare-ipfs.com/ipfs/${char.imageURI}`} alt={char.name} />
          <button
            type="button"
            className="character-mint-button"
            onClick={mintCharacterNFTAction(index)}
          >
            {`Mint ${char.name}`}
          </button>
        </div>
      ))
    )
  }

  const mintCharacterNFTAction = (characterId) => async () => {
    try {
      if (gameContract) {
        setMintingCharacter(true);
        console.log("Minting character in progress...");
        const mintTxn = await gameContract.mintCharacterNFT(characterId);
        await mintTxn.wait();
        console.log('mintTxn: ', mintTxn);
        setMintingCharacter(false);
      }
    } catch (error) {
      console.log("MintCharacterAction Error: ", error);
      setMintingCharacter(false);
    }
  }
  return (
    <div className="select-character-container">
      <h2>Mint your warrior. Choose wisely.</h2>
      {characters.length > 0 && (
        <div className="character-grid">{renderCharacters()}</div>
      )}
      {mintingCharacter && (
        <div className="loading">
          <div className="indicator">
            <LoadingIndicator />
            <p>Minting In Progress...</p>
          </div>
          <img
            src="https://64.media.tumblr.com/1140f6a2e506010e91d82eaa076e3883/171d56c416816ca4-6c/s540x810/8d281322ef4d251ed95ea6d3b7e5d69e0ddd2671.gifv"
            alt="Minting loading indicator"
          />
        </div>
      )}
    </div>
  )
}

export default SelectCharacter;