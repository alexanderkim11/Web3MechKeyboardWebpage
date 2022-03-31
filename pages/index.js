import PrimaryButton from "../components/primary-button";
import abi from "../utils/Keyboards.json"
import Keyboard from "../components/keyboard";
import { ethers } from "ethers";
import addressesEqual from "../utils/addressesEqual";
import { UserCircleIcon } from "@heroicons/react/solid"
import TipButton from "../components/tip-button"
import getKeyboardsContract from "../utils/getKeyboardsContract"
import { toast } from "react-hot-toast"
import { useState, useEffect, createContext, useContext } from "react";
import { useMetaMaskAccount } from '../components/meta-mask-account-provider.js';


export default function Home() {
  const { ethereum, connectedAccount, connectAccount } = useMetaMaskAccount();
  const [keyboards, setKeyboards] = useState([]);
  const [newKeyboard, setNewKeyboard] = useState("");
  const [keyboardsLoading, setKeyboardsLoading] = useState(false);

  const keyboardsContract = getKeyboardsContract(ethereum);

  const contractAddress = '0x3ec6b10DBd5A69c2C70eb46b0c0786a10952FFb8';
  const contractABI = abi.abi;
  
  const getKeyboards = async () => {
    if (keyboardsContract && connectedAccount) {
      setKeyboardsLoading(true);
      try {
        const keyboards = await keyboardsContract.getKeyboards();
        console.log('Retrieved keyboards...', keyboards)
  
        setKeyboards(keyboards)
      } finally {
        setKeyboardsLoading(false);
      }
    }
  }

  useEffect(() => getKeyboards(), [!!keyboardsContract, connectedAccount])

  const addContractEventHandlers = () => {
    if (keyboardsContract && connectedAccount) {
      keyboardsContract.on('KeyboardCreated', async (keyboard) => {
        if (connectedAccount && !addressesEqual(keyboard.owner, connectedAccount)) {
          toast('Somebody created a new keyboard!', { id: JSON.stringify(keyboard) });
        }
        await getKeyboards();
      })
  
      keyboardsContract.on('TipSent', (recipient, amount) => {
        if (addressesEqual(recipient, connectedAccount)) {
          toast(`You received a tip of ${ethers.utils.formatEther(amount)} eth!`, { id: recipient + amount });
        }
      })
    }
  }
  
  
  useEffect(addContractEventHandlers, [!!keyboardsContract, connectedAccount]);

  const submitCreate = async (e) => {
    e.preventDefault();

    if (!keyboardsContract) {
      console.error('KeyboardsContract object is required to create a keyboard');
      return;
    }
    setMining(true);
    try {
      const provider = new ethers.providers.Web3Provider(ethereum);
      const signer = provider.getSigner();
      const keyboardsContract = new ethers.Contract(contractAddress, contractABI, signer);
  
      const createTxn = await keyboardsContract.create(keyboardKind, isPBT, filter)
      console.log('Create transaction started...', createTxn.hash)
  
      await createTxn.wait();
      console.log('Created keyboard!', createTxn.hash);
  
      Router.push('/');
    } finally {
      setMining(false);
    }
  }


  if (!ethereum) {
    return <p>Please install MetaMask to connect to this site</p>
  }
  
  if (!connectedAccount) {
    return <PrimaryButton onClick={connectAccount}>Connect MetaMask Wallet</PrimaryButton>
  }

  if (keyboards.length > 0) {
    return (
      <div className="flex flex-col gap-4">
        <PrimaryButton type="link" href="/create">Create a Keyboard!</PrimaryButton>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 p-2">
        {keyboards.map(
  ([kind, isPBT, filter, owner], i) => (
    <div key={i} className="relative">
      <Keyboard kind={kind} isPBT={isPBT} filter={filter} />
      <span className="absolute top-1 right-6">
      {addressesEqual(owner, connectedAccount) ?
        <UserCircleIcon className="h-5 w-5 text-indigo-100" /> :
        <TipButton keyboardsContract={keyboardsContract} index={i} />
      }
      </span>
    </div>
  )
)}

        </div>
      </div>
    )
  }


  
  // this is the new one
  if (keyboardsLoading) {
    return (
      <div className="flex flex-col gap-4">
        <PrimaryButton type="link" href="/create">Create a Keyboard!</PrimaryButton>
        <p>Loading Keyboards...</p>
      </div>
    )
  }

  // No keyboards yet
  return (
    <div className="flex flex-col gap-4">
      <PrimaryButton type="link" href="/create">Create a Keyboard!</PrimaryButton>
      <p>No keyboards yet!</p>
    </div>
  )
  
}