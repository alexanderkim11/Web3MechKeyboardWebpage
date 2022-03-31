import { ethers } from "ethers";

import abi from "../utils/Keyboards.json"

const contractAddress = '0x3ec6b10DBd5A69c2C70eb46b0c0786a10952FFb8';
const contractABI = abi.abi;

export default function getKeyboardsContract(ethereum) {
  if(ethereum) {
    const provider = new ethers.providers.Web3Provider(ethereum);
    const signer = provider.getSigner();
    return new ethers.Contract(contractAddress, contractABI, signer);
  } else {
    return undefined;
  }
}
