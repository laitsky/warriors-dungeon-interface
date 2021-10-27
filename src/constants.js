export const CONTRACT_ADDRESS = '0xF848754c1D86B87AD7Af0d92aD5a2C3a475bbF86';

export const transformCharacterData = (characterData) => {
  return {
    name: characterData.name,
    imageURI: characterData.imageURI,
    hp: characterData.hp.toNumber(),
    maxHp: characterData.maxHp.toNumber(),
    attackDamage: characterData.attackDamage.toNumber()
  }
}