import { useContext } from "react";
import ansem from "../assets/start.png";
import DepositButton from "./DepositButton";
import CharacterSelection from "./CharacterSelection";
import React, { useState, useEffect, useRef } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import {
  SoundTypes,
  dodgeProbs,
  imageSets,
  sounds,
  PunchesConfig,
  SPEED,
  WIN_PUNCHES
} from "./gameConfig"; // Assuming these are extracted to a config file
import { Howl } from "howler";

import ansemPunch from "../assets/idlee.png";
import t3ansemPunch from "../assets/t33.png";
import upansemPunch from "../assets/uppercut.png";
import "./Homepage.css";
import cook_dodge_1 from "../assets/dodge_1_rev.png";
import cook_dodge_2 from "../assets/dodge_2_rev.png";
import ansem_dodge_1 from "../assets/dodge_1.png";
import ansem_dodge_2 from "../assets/dodge_2.png";
import cook_t3_pwrup from "../assets/t33_rev.png";
import t3_cook_win from "../assets/t3_cook_win.png";
import t1ansemPunch from "../assets/T1-Ansem-Punch2.png";
import t2ansemPunch from "../assets/Tier_22.png";
import opponent_t1 from "../assets/cook_punch_t1.png";
import opponent_t2 from "../assets/cook_punch_t2.png";
import GameOverPopup from "./GameOverPopUp";
import winImage from "../assets/win.png";
import loseImage from "../assets/lose.png";
import loseImage_cook from "../assets/lose_cook.png";
import { Context } from "../App";



import "@solana/wallet-adapter-react-ui/styles.css";

import * as SolanaWeb3 from "@solana/web3.js";
import * as splToken from "@solana/spl-token";
import DepostiWifPopUp from "./DepostiWifPopUp";
import Error from "./Error";

//import jwt from "jsonwebtoken";
import sign from "jwt-encode";


export default function GameImage({ updateLeaderboard }) {
  const containerRef = useRef(null);

  const intervalRef = useRef(null);

  const wallet = useWallet();
  const [punches, setPunches] = useState(0);
  


  // const [currentImageArray, setCurrentImageArray] = useState(imageSets.default);
  // const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const [currentImage, setCurrentImage] = useState(imageSets.default[0]);
  const [flipImages, setFlipImages] = useState(false);
  const {wifAmount, setWifAmount, player, setPlayer} = useContext(Context);
  const [referredBy, setReferredBy] = useState('');
  const [tweetImage, setTweetImage] = useState(t3_cook_win);
  const [isOpen, setIsOpen] = useState(false);
  const [isNew, setIsNew] = useState(false);
  const [SNSlink, setSNSLink] = useState("");
  const [dodges, setdodges] = useState(0);
  const [isOpenWIFD, setIsOpenWIFD] = useState(false);
  const [loggerBuf, setLoggerBuf] = useState([]);
  const playSound = (soundType, forcePlay = false) => {
    if (soundType === "background" && soundRef.current[soundType].playing()) {
      return;
    }

    if (forcePlay || soundType !== SoundTypes.PUNCH) {
      soundRef.current[soundType].stop();
    }

    soundRef.current[soundType].play();
  };
  const soundRef = useRef({
    punch: new Howl({ src: [sounds[SoundTypes.PUNCH]], volume: 0.5 }),
    win: new Howl({ src: [sounds[SoundTypes.WIN]], volume: 0.5 }),
    lose: new Howl({ src: [sounds[SoundTypes.LOSE]], volume: 0.5 }),
    bell: new Howl({ src: [sounds[SoundTypes.BELL]], volume: 0.5 }),
    tier3: new Howl({ src: [sounds[SoundTypes.TIER3]], volume: 0.5 }),
    dodge: new Howl({src: [sounds[SoundTypes.dodge]], volume:0.5}),
    background: new Howl({ src: [sounds.background], loop: true, volume: 0.1 }),
  });



  useEffect(() => {
    const handlePunchSound = () => {
      setTimeout(() => {
        containerRef.current.classList.add("cameraShake");
        setTimeout(() => {
          containerRef.current.classList.remove("cameraShake");
        }, 50 / SPEED); // remove the class after 75ms
      }, 30 / SPEED); // add the class 200ms before the punch sound plays
    };

    soundRef.current.punch.on("play", (id, seek) => {
      setTimeout(handlePunchSound, seek / SPEED - 1 / SPEED); // add cameraShake 100ms before playback
    });

    return () => {
      soundRef.current.punch.off("play", handlePunchSound);
    };
  }, [soundRef, containerRef]);
  useEffect(() => {
    // Try to play background music on load
    try {
      soundRef.current.background.play();
    } catch (error) {
      console.error("Background music failed to play:", error);
    }

    return () => {
      soundRef.current.background.stop(); // Stop background sound on unmount
    };
  }, []);

  useEffect(() => {
 // Trigger transition when the component mounts or when `err` prop changes

    // Start the timeout when the component mounts or when `err` prop changes
    const timeout = setTimeout(() => {
      setLoggerBuf(b => {
        const newArray = [...b]; // Create a shallow copy of the array to avoid mutating the original array
        newArray.shift();
        return newArray; // Return the modified array
    });
    }, 10000); // 10 seconds

    // Clear the timeout when the component unmounts or when isVisible becomes false
    return () => {clearTimeout(timeout)};
  }, [loggerBuf]); // Re-run the effect when `err` prop changes
//////////////////////////////  TOKEN TRANSFER //////////////////////////////////////////

const tokenMintAddress = 'Gh9ZwEmdLJ8DscKNTkTqPbNwLNNBjuSzaG9Vp2KGtKJr';
// const toAddress = '7GVhtvwWeVZxKgXwTexDGtzxXGFcxLzkeXzRS5cRfwmD';


const getOrCreateAssociatedTokenAccount = async (connection,
  mint,
  owner) => {
    const associatedToken = await splToken.getAssociatedTokenAddress(mint, owner);

    let account;
    try{
      account = await splToken.getAccount(connection, associatedToken);
    }catch (error){
      if (error instanceof splToken.TokenAccountNotFoundError || error instanceof splToken.TokenInvalidAccountOwnerError){
        try{
          const transaction = new SolanaWeb3.Transaction().add(
            splToken.createAssociatedTokenAccountInstruction(
              wallet.publicKey,
              associatedToken,
              owner,
              mint
            )
          );
          
          await wallet.sendTransaction(transaction, connection);
        }catch(error){

        }
        account = await splToken.getAccount(connection, associatedToken);
      }else{
        throw error;
      }
    }
    return account;
}
const transfer= async (toAddress,amount)=> {
  //if (!wallet.connected || !wallet.publicKey) {
    if (!wallet.connected) {
      setLoggerBuf(b => {
        const arr = [...b];
        arr.push({
          error: "Please Connect Wallet",
          color: "red"
        });
        return arr;
      });
    return;
  }
const connection = new SolanaWeb3.Connection("https://api.devnet.solana.com/");
const mintPublicKey = new SolanaWeb3.PublicKey(tokenMintAddress);  
const {TOKEN_PROGRAM_ID} = splToken;
const fromTokenAccount = await getOrCreateAssociatedTokenAccount(
                connection,
                mintPublicKey,
                wallet.publicKey
              );
const destPublicKey = new SolanaWeb3.PublicKey(toAddress);
const associatedDestinationTokenAddr = await getOrCreateAssociatedTokenAccount(
                connection,
                mintPublicKey,
                destPublicKey
              );
//const instructions: solanaWeb3.TransactionInstruction[] = [];
const instructions = [];

instructions.push(
                splToken.createTransferInstruction(
                  fromTokenAccount.address,
                  associatedDestinationTokenAddr.address,
                  wallet.publicKey,
                  amount,
                  [],
                  TOKEN_PROGRAM_ID
                )
              );

const transaction = new SolanaWeb3.Transaction().add(...instructions);
const blockhash = await connection.getLatestBlockhash();
transaction.feePayer = wallet.publicKey;
transaction.recentBlockhash = blockhash.blockhash;
//change1
const signed = await wallet.signTransaction(transaction);
const transactionSignature = await connection.sendRawTransaction(
                signed.serialize(),
              { skipPreflight: true }
              );
// const transactionSignature = await connection.sendRawTransaction(
//                 transaction.serialize(),
//                 { skipPreflight: true }
//               );
              const strategy = {
                blockhash: blockhash.blockhash,
                lastValidBlockHeight: blockhash.lastValidBlockHeight,
                signature: transactionSignature
              }
              await connection.confirmTransaction(strategy);
              console.log("Confirmed");
}
///////////////////////////////////////////////////////////////////////


  const handleDeposit = async () => {
    if (!wallet.connected) {
      // Check if wallet is connected
      setLoggerBuf(b => {
        const arr = [...b];
        arr.push({
          error: "Please Connect Wallet",
          color: "red"
        });
        return arr;
      });
      return;
    }

    if (!player) {
      // Check if player is selected
      setLoggerBuf(b => {
        const arr = [...b];
        arr.push({
          error: "Please select a player.",
          color: "red"
        });
        return arr;
      });
      return;
    }

    // const inputWif = prompt("Enter WIF amount (positive number):");
    // const wif = Number(inputWif);
    if (isNaN(wifAmount) || wifAmount <= 0) {
      setLoggerBuf(b => {
        const arr = [...b];
        arr.push({
          error: "Please enter a positive number for WIF amount.",
          color: "red"
        });
        return arr;
      });
      return;
    }

    if (!isNaN(wifAmount) && wifAmount > 0 && player) {
      const wif = wifAmount;
      playSound(SoundTypes.BELL);
      setWifAmount(wif);
      console.log(wifAmount);
      let minPunches, maxPunches, imageArr_p1, imageArr_p2;

      if (wif > 0) {
        // removed the condition wif <= 40
        ({ minPunches, maxPunches, imageArr_p1, imageArr_p2 } =
          wif <= 1
            ? PunchesConfig[0] // t1
            : wif < 41
              ? PunchesConfig[1] // t2
              : PunchesConfig[2]); // t3
        const randPunches = generatePunches(minPunches, maxPunches);

        

        if (player === "ansem") {
          setFlipImages(false);
          // setCurrentImageArray(imageArr_p1);
          setCurrentImage(imageArr_p1[0]);
          handleImageUpdate(randPunches, imageArr_p1, randPunches, wif);
        } else if (player === "kook") {
          setFlipImages(true);
          // setCurrentImageArray(imageArr_p2);
          setCurrentImage(imageArr_p2[0]);
          handleImageUpdate(randPunches, imageArr_p2, randPunches, wif);
        }

        const ngrokUrl = 'https://6070-103-21-125-86.ngrok-free.app';


        const handleSendData = async () => {
          console.log('randPunches:', randPunches);
          console.log('wif:', wif);
          console.log('referredBy:', referredBy);
        
          const data = {
            wallet_address: wallet.publicKey.toString(),
            punches: randPunches,
            tokens: wif,
            referredBy: referredBy 
          };


         const token = sign(data, 'scrt_key');
         const userWon = randPunches > 13;
         if (userWon) { 
          const finishPayload = {
            wallet_address: wallet.publicKey.toString(),
            win: 1 // Set to 1 if the user won
          };
          try {
            const finishResponse = await fetch(ngrokUrl+'/api/finish', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'ngrok-skip-browser-warning': 'true'

              },
              body: JSON.stringify(finishPayload),
            });
            if (!finishResponse.ok) {
              throw new Error('Failed to send finish data');
            }
            console.log('Finish Data Sent Successfully');
          } catch (error) {
            console.error('Error sending finish data:', error);
          }
        }

         await sendData(token);
          
        };


        const sendData = async (userData) => {
          try {
            const response = await fetch(ngrokUrl+'/api/wallet', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'ngrok-skip-browser-warning': 'true'
              },
              body: JSON.stringify({ token: userData }),
            });
        
            if (!response.ok) {
              throw new Error('Failed to send data');
            }
        
            const responseData = await response.json();
            console.log('Server Response:', responseData);
            
            //return responseData; 
        
          } catch (error) {
            console.error('Error sending data:', error);
          }
        };

        const getLeaderboardData = async () => {
          try {
            const leaderboardResponse = await fetch(ngrokUrl + '/api/leaderboard', {
              headers: {
                'ngrok-skip-browser-warning': 'true' // or any other value
              }
            });
            if (!leaderboardResponse.ok) {
              throw new Error('Failed to fetch leaderboard data');
            }
            const leaderboardData = await leaderboardResponse.json();
            console.log('Leaderboard Data:', leaderboardData);
            // Perform calculations for top 10 players based on the received data
            
            updateLeaderboard(leaderboardData);
          } catch (error) {
            console.error('Error fetching leaderboard data:', error);
          }
        };

        await handleSendData();
        await getLeaderboardData();


      }
    }
  };
  const cleanup = (imageSet, npunch, wif) => {
    clearInterval(intervalRef.current);
    intervalRef.current = null;
    setFlipImages(false);
    // setCurrentImageArray(
    //   player === "ansem" ? imageSets.result_ansem : imageSets.result_cook,
    // );
    // setCurrentImageIndex(npunch > 35 ? 1 : 0);
    console.log(npunch);
    setCurrentImage(player === "ansem" ? imageSets.result_ansem[npunch > WIN_PUNCHES ? 1 : 0] : imageSets.result_cook[npunch > WIN_PUNCHES ? 1 : 0]);
    playSound(npunch > 35 ? SoundTypes.WIN : SoundTypes.LOSE);
    if (!(imageSet === imageSets.cook_t3 || imageSet === imageSets.ansem_t3)) {
      playSound(SoundTypes.PUNCH);
    }

    setSNSLink(generateLink(npunch, wif));
    setTimeout(() => {
      setIsOpen(true);
    }, 1500);
    
    setTweetImage(npunch > WIN_PUNCHES ? player === "ansem" ? winImage : t3_cook_win : player==="kook" ? loseImage : loseImage_cook);
    setPlayer(null);
    handleDefault();
    // resume background music
    setPunches(0);
    setdodges(0);
  };
  useEffect(() => {
    console.log(wifAmount);
  }, [wifAmount]);

  const render = (currentImages) => {
    let dodge_sound_played = false;
    for (let i = 0; i < currentImages.length; i++) {
      setTimeout(
        () => {
          //excluding dodge sequence from flip
          if (
            currentImages[i] === cook_t3_pwrup ||
            currentImages[i] === t3_cook_win
          ) {
            setFlipImages(false); // Set flip images to false
          } else if (
            currentImages[i] === ansem_dodge_1 ||
            currentImages[i] === ansem_dodge_2 ||
            currentImages[i] === cook_dodge_1 ||
            currentImages[i] === cook_dodge_2
          ) {
            if (!dodge_sound_played){setTimeout(() => playSound(SoundTypes.dodge), 2 / SPEED); dodge_sound_played=true;};
            setFlipImages(false);
          } else if (player === "kook") {
            setFlipImages(true); // Reset flip for cook
          }

          if (
            currentImages[i] === t3ansemPunch ||
            currentImages[i] === cook_t3_pwrup
          ) {
            soundRef.current.tier3.play();
          } else if (
            !(
              currentImages[i] === ansem_dodge_1 ||
              currentImages[i] === ansem_dodge_2 ||
              currentImages[i] === cook_dodge_1 ||
              currentImages[i] === cook_dodge_2 ||
              currentImages[i] === ansemPunch
            )
          ) {
            // Play punch sound for all but the last image
            dodge_sound_played = false;
            setTimeout(() => playSound(SoundTypes.PUNCH), 2 / SPEED);
            if((
              player === "kook" && !(currentImages[i] === t1ansemPunch ||currentImages[i] === t2ansemPunch)
            ) || (
              player==="ansem" && !(currentImages[i] === opponent_t1 || currentImages[i] === opponent_t2)
            )){
              setPunches((p) => p + 1);
            }else{
              setdodges((d) => d + 1);
            }
          }
          if (currentImage !== currentImages[i]){
            setCurrentImage(currentImages[i])
          }
        },
        ((i % 4)) *
          (currentImages[i] === upansemPunch ||
          currentImages[i] === t3_cook_win
            ? 800 / SPEED
            : 750 / SPEED),
      );
    }
  }
  const randomizeAndSetPunchSequence = (imageSet, runCount, maxRuns) => {
    let currentImages = [...imageSet];

    if (imageSet === imageSets.ansem_t1 || imageSet === imageSets.cook_t1) {
      const dodges = Math.random() < dodgeProbs.t1 ? true : false;
      if (dodges) {
        currentImages =
          player === "ansem"
            ? Math.random() < 0.5
              ? imageSets.ansem_dodge_1
              : imageSets.ansem_dodge_2
            : Math.random() < 0.5
              ? imageSets.cook_dodge_1
              : imageSets.cook_dodge_2;
      }
    } else if (
      imageSet === imageSets.ansem_t2 ||
      imageSet === imageSets.cook_t2
    ) {
      const dodges = Math.random() < dodgeProbs.t2 ? true : false;
      if (dodges) {
        currentImages =
          player === "ansem"
            ? Math.random() < 0.5
              ? imageSets.ansem_dodge_1
              : imageSets.ansem_dodge_2
            : Math.random() < 0.5
              ? imageSets.cook_dodge_1
              : imageSets.cook_dodge_2;
      } else {
        const numPunches = Math.random() < 0.5 ? 1 : 2;
        const punches = shuffleArray(imageSet.slice(1)).slice(0, numPunches);
        currentImages = [imageSet[0], ...punches];
      }
    } else if (
      imageSet === imageSets.ansem_t3 ||
      imageSet === imageSets.cook_t3
    ) {
      if (runCount + 1 !== maxRuns) {
        const dodges = Math.random() < dodgeProbs.t3 ? true : false;
        currentImages =
          Math.random() > 0.5
            ? player === "ansem"
              ? imageSets.ansem_t1
              : imageSets.cook_t1
            : player === "ansem"
              ? imageSets.ansem_t2
              : imageSets.cook_t2;
        if (dodges) {
          currentImages =
            player === "ansem"
              ? Math.random() < 0.5
                ? imageSets.ansem_dodge_1
                : imageSets.ansem_dodge_2
              : Math.random() < 0.5
                ? imageSets.cook_dodge_1
                : imageSets.cook_dodge_2;
        }
      }
    }
    return currentImages;
  };

  const handleImageUpdate = (maxRuns, imageSet, npunch, wif) => {
    let runCount = 0;
    let delay = 0;
    clearInterval(intervalRef.current);
    const id = setInterval(
      async () => {
        if (runCount >= maxRuns) {
          //cleanup
          cleanup(imageSet, npunch, wif);
          return;
        }

        let currentImages = randomizeAndSetPunchSequence(
          imageSet,
          runCount,
          maxRuns,
        );
        if (currentImages.includes(cook_dodge_1) || currentImages.includes(cook_dodge_2) || currentImages.includes(ansem_dodge_1) || currentImages.includes(ansem_dodge_2)){
          delay = 800;
        }else if (delay != 0){
          delay = 0;
        }
        // setCurrentImageArray(currentImages);
        setCurrentImage(currentImage[0]);
        render(currentImages);

        runCount++;
      },
      delay / SPEED + 2000 / SPEED,
    );
    intervalRef.current = id;
  };
  // Fisher-Yates (Knuth) shuffle function for array randomization
  function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));

      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  }

  const handleDefault = () => {
    clearInterval(intervalRef.current);
    const id = setInterval(() => {
      // setCurrentImageIndex(0);
      // setCurrentImageArray(imageSets.default);
      setCurrentImage(imageSets.default[0]);
    }, 2000 / SPEED);
    intervalRef.current = id;
  };

  const generatePunches = (minPunches, maxPunches) => {
    return (
      Math.floor(Math.random() * (maxPunches - minPunches + 1)) + minPunches
    );
  };


  const closePopUp = () => {
    setIsOpen(false);
    setSNSLink("");
    setWifAmount(0);
  };

  const generateLink = (npunch, wif) => {
    const text = `I landed ${npunch} punches and donated ${wif} !!!!`;
    return `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&image=${tweetImage}`
  }

  const [characterSelection, setCharacterSelection] = useState(false);
  const handleOnDeposit = () => {
    setCharacterSelection(true);
  }

  const onCharacterSelected = async() => {
    if (!wallet.connected) {
      // Check if wallet is connected
      setLoggerBuf(b => {
        const arr = [...b];
        arr.push({
          error: "Please connect a wallet.",
          color: "red"
        });
        return arr;
      });
      return;
    }

    if (!player) {
      // Check if player is selected
      setLoggerBuf(b => {
        const arr = [...b];
        arr.push({
          error: "Please select a player",
          color: "red"
        });
        return arr;
      });
      return;
    }
    setIsOpenWIFD(true);
  }

  const onCloseWIFD = async () => {
    try {
      if (!wallet.connected) {
        // Check if wallet is connected
        setLoggerBuf(b => {
          const arr = [...b];
          arr.push({
            error: "Please connect wallet.",
            color: "red"
          });
          return arr;
        });
        return;
      }
  
      if (!player) {
        setLoggerBuf(b => {
          const arr = [...b];
          arr.push({
            error: "Please select a player.",
            color: "red"
          });
          return arr;
        });
        return;
      }
  
      // const inputWif = prompt("Enter WIF amount (positive number):");
      // const wif = Number(inputWif);
      if (isNaN(wifAmount) || wifAmount <= 0) {
        setLoggerBuf(b => {
          const arr = [...b];
          arr.push({
            error: "Please enter a positive number for WIF amount.",
            color: "red"
          });
          return arr;
        });
        return;
      }
  
      if (!isNaN(wifAmount) && wifAmount > 0 && player) {
        await transfer('7GVhtvwWeVZxKgXwTexDGtzxXGFcxLzkeXzRS5cRfwmD', wifAmount * Math.pow(10, 6));
        setIsOpenWIFD(false);
        setCharacterSelection(false);
        await handleDeposit();
      }
    } catch (error) {
      // Handle wallet transaction rejection error
      setLoggerBuf(b => {
        const arr = [...b];
        arr.push({
          error: error,
          color: "red"
        });
        return arr;
      });
      // alert("Transaction was rejected. Please try again or check your wallet settings.");
      console.error("Wallet transaction rejected:", error);
    }
  }


  
  return (
    <>
    <GameOverPopup isOpen={isOpen} onClose={closePopUp} image={tweetImage} link={SNSlink} />
    {isOpenWIFD && <DepostiWifPopUp onClose={onCloseWIFD} setOpen={setIsOpenWIFD}/>}
    <div ref={containerRef} className="image-container relative overflow-hidden">
      {currentImage !== ansem && <div className="absolute left-7 text-3xl custom-heading"><p>Punches Landed: {punches}</p><p>dodges: {dodges}</p></div>}
      {!characterSelection && currentImage === ansem && <div className="absolute bottom-8 scale-[135%]"><DepositButton text="Play" onDeposit={handleOnDeposit} isDisabled={false}/></div>}
      {characterSelection ? 
        <div className="">
          <CharacterSelection/>
          <DepositButton className="absolute bottom-8 right-[31.25%]" text="Start Game" onDeposit={onCharacterSelected} isDisabled={false}/>
        <input
        type="text"
        value={referredBy}
        onChange={(e) => setReferredBy(e.target.value)}
        placeholder="   Enter Referral Address"
        className="absolute bottom-1 right-[38%]"
      />
        </div> 
        :       
        <img
          src={currentImage}
          alt="Game character"
          className={`${flipImages ? "scale-x-[-1]" : ""}`}
        />
      }
    </div>
    <div className="absolute z-[1000] bottom-0 left-0 space-y-2">
    {loggerBuf && loggerBuf.map((l) => {
      return (
          <Error err={typeof l.error === 'string' ? l.error : l.error.message} color={l.color} />
      )
    })}
    </div>
    </>
  );
}
// {!characterSelection && currentImageArray[currentImageIndex] === ansem && <div className="absolute bottom-8 scale-[135%]"><DepositButton onDeposit={handleOnDeposit} isDisabled={false}/></div>}

