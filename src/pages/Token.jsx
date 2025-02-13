
import React, { useState, useEffect } from 'react';

import { useMemo } from "react";
import {
  ConnectionProvider,
  WalletProvider,
} from "@solana/wallet-adapter-react";
import {
  WalletModalProvider,
  WalletMultiButton,
} from "@solana/wallet-adapter-react-ui";
import { WalletAdapterNetwork } from "@solana/wallet-adapter-base";
import { clusterApiUrl } from "@solana/web3.js";
import { useWallet, useConnection
} from "@solana/wallet-adapter-react";


import "@solana/wallet-adapter-react-ui/styles.css";

import * as SolanaWeb3 from "@solana/web3.js";
import * as splToken from "@solana/spl-token";


const Token = () => {
    const wallet = useWallet();



    const [transferAmount, setTransferAmount] = useState(0);
  
  
  
  
  
  
  
  
  
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
              throw error;
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
  
        alert("Please connect your wallet first.");
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
    
    
    const handleTransferClick = async () => {
      // if (wallet.connected) { 
      //     await transfer('7GVhtvwWeVZxKgXwTexDGtzxXGFcxLzkeXzRS5cRfwmD', transferAmount);
      // } else {
      //     alert("Please connect your wallet first. At handle transfer");
      // }
             await transfer('7GVhtvwWeVZxKgXwTexDGtzxXGFcxLzkeXzRS5cRfwmD', transferAmount * Math.pow(10, 6));
  
    };
  return (
    <div>      <h3>Transfer the SPL-Token</h3>

    <WalletMultiButton />

    {/* Input for transfer amount */}
    <input 
      type="number" 
      value={transferAmount} 
      onChange={(e) => setTransferAmount(Number(e.target.value))} 
    />

    {/* Button to trigger the transfer */}
    <button onClick={handleTransferClick}>Transfer Tokens</button></div>
  )
}

export default Token