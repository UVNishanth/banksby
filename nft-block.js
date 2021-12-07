"use strict";

const { type } = require('os');
const { exit } = require('process');
const { Block, utils } = require('spartan-gold');

const constants = require('./nft-flags');
module.exports = class NftBlock extends Block {

  constructor(rewardAddr, prevBlock, target, coinbaseReward) {
    super(rewardAddr, prevBlock, target, coinbaseReward);

    // Tracking NFTs
    if(this.isGenesisBlock()){
        this.nfts = new Map();            // database of nfts in the system
        this.titleToId = new Map();       // Map of title+artist to nftID
        this.artistMap = new Map();       // Artist Map storing arrays of nftds created
        this.nftOwnerMap = new Map();     // Owner Map storing arrays of nftds owned
        this.nftDb = new Map();           // NFTID to owner mapping for quick check
        this.nftToArtistMap = new Map();  // NFT to artist mapping
    }
    else{
        this.nfts = prevBlock.nfts;
        this.artistMap = prevBlock.artistMap;
        this.nftOwnerMap = prevBlock.nftOwnerMap;
        this.nftDb = prevBlock.nftDb;
        this.nftToArtistMap = prevBlock.nftToArtistMap;
        this.titleToId = prevBlock.titleToId;
    }
    
    
  }

  /**
   * This method extends the parent method with support for gold locking transactions.
   * 
   * @param {Transaction} tx - A locking transaction.
   * @param {StakeClient} client - Used for printing debug messages.
   * 
   * @returns Success of adding transaction to the block.
   */
  addTransaction(tx, client) {
    let prev = super.addTransaction(tx, client);
    if(!prev){
        return false;
    }
    if(tx.data.flag == undefined) return true;
    switch (tx.data.flag) {

      case constants.CREATE_NFT: 
        this.createNft(tx.from, tx.id, tx.data.nft);
        break;

      case constants.UPDATE_MAPS:
        let nftOwnerMap = new Map(Object.entries(JSON.parse(tx.data.nftOwnerMap))); 
        nftOwnerMap.forEach((value, key) => {
          nftOwnerMap.set(key, new Set(JSON.parse(value)));
        });
        let nftDb = new Map(Object.entries(JSON.parse(tx.data.nftDb)));
        nftDb.forEach((value, key) => {
          nftDb.set(key, JSON.parse(value));
        });
        this.updateMap(nftDb, nftOwnerMap);
        break;

      default:
        throw new Error(`Unknown type: ${tx.data.type}`);
    }

    // Transaction added successfully.
    return true;
  }

  // to make sure block reruns with data of prevBlock
  rerun(prevBlock) {
    this.nftToArtistMap = prevBlock.nftToArtistMap;
    this.nfts = prevBlock.nfts;
    this.nftOwnerMap = prevBlock.nftOwnerMap;
    this.artistMap = prevBlock.artistMap;
    this.nftDb = prevBlock.nftDb;
    this.titleToId = prevBlock.titleToId;
    return super.rerun(prevBlock);
  }

  
  createNft(artist, txID, nft) {
    
    let nftID = utils.hash(`${artist}  ${txID}`);
    this.nfts.set(nftID, nft);
    this.titleToId.set(String(nft.artistName+nft.title), nftID);
    console.log("Mappig here: ");
    for(let [key,value] of this.titleToId.entries()){
      console.log(key,value);
    }
    
    // Adding NFT to artists list.
    let artistNfts = this.artistMap.get(artist) || []; // using array coz insertion efficiency reqd
    if (!artistNfts.includes(nftID)) {
      artistNfts.push(nftID);
      this.artistMap.set(artist, artistNfts);
    }
    this.nftToArtistMap.set(nftID, artist);

    // making artist the first owner
    let ownedNfts = this.nftOwnerMap.get(artist) || new Set();  // using set coz searching and deletion efficiency
    if (!ownedNfts.has(nftID)) {
      ownedNfts.add(nftID);
      this.nftOwnerMap.set(artist, ownedNfts);
    }
    this.nftDb.set(nftID, artist);
  }
 
  updateMap(nftDb, nftOwnerMap) {
    this.nftDb = new Map(nftDb);
    this.nftOwnerMap = new Map(nftOwnerMap);
    return;
  }

  getNft(nftID) {
    return this.nfts.get(nftID);
  }

  getNftId(title, artName, nftList) { 
    var nftIdent;
    nftList.forEach(nftID => {
      let nft = this.getNft(nftID);
      if (nft.artistName === artName) {
        if (nft.title === title) {
          nftIdent = nftID;
        }
      }
    });
    return nftIdent;
  }

  getOwnersNftList(owner) {
    return this.nftOwnerMap.get(owner) || [];
  }

};