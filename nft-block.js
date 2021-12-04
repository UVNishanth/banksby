"use strict";

const { type } = require('os');
const { Block, utils } = require('spartan-gold');

const constants = require('./nft-flags');
module.exports = class NftBlock extends Block {

  constructor(rewardAddr, prevBlock, target, coinbaseReward) {
    super(rewardAddr, prevBlock, target, coinbaseReward);

    // Tracking NFTs
    if(this.isGenesisBlock()){
        this.nfts = new Map();
        this.titleToId = new Map();
        this.artistDb = new Map();
        this.nftOwnerMap = new Map();
        this.nftDb = new Map();
        this.nftToArtistMap = new Map();
    }
    else{
        this.nfts = prevBlock.nfts;
        this.artistDb = prevBlock.artistDb;
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
    if(tx.data.type == undefined) return true;
    //console.log("type of buyer:"+typeof(tx.data.buyer));
    //console.log("tx is : "+tx.data.nftID);
    switch (tx.data.type) {

      case constants.CREATE_NFT: 
        this.createNft(tx.from, tx.id, tx.data.nft);
        break;

      case constants.BUY_NFT:
        this.buyNft(tx.from, tx.data.nftID);
        break;

      default:
        throw new Error(`Unrecognized type: ${tx.data.type}`);
    }

    // Transaction added successfully.
    return true;
  }

  /**
   * When rerunning a block, we must also replaying any NFT
   * related transactions.
   * 
   * @param {Block} prevBlock - The previous block in the blockchain, used for initial balances.
   * 
   * @returns {Boolean} - True if the block's transactions are all valid.
   */
  rerun(prevBlock) {
    this.nftToArtistMap = prevBlock.nftToArtistMap;
    this.nfts = prevBlock.nfts;
    this.nftOwnerMap = prevBlock.nftOwnerMap;
    this.artistDb = prevBlock.artistDb;
    this.nftDb = prevBlock.nftDb;
    this.titleToId = prevBlock.titleToId;
    return super.rerun(prevBlock);
  }

  // creates the fundraiser ID using the artist ID and the project ID
  
  createNft(artist, txID, nft) {
    // The ID of an NFT is the hash of the owner address and
    // the transaction ID.
    let nftID = utils.hash(`${artist}  ${txID}`);
    this.nfts.set(nftID, nft);
    this.titleToId.set(String(nft.artistName+nft.title), nftID);
    console.log("Mappig here: ");
    for(let [key,value] of this.titleToId.entries()){
      console.log(key,value);
    }
    
    // Adding NFT to artists list.
    let artistNfts = this.artistDb.get(artist) || []; // using array coz insertion efficiency reqd
    if (!artistNfts.includes(nftID)) {
      artistNfts.push(nftID);
      this.artistDb.set(artist, artistNfts);
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

  buyNft(buyer, nftID){
  // Adding NFT to receiver's list.
    console.log("NFTS list: ");
    this.nfts.forEach((key, value) => {
      console.log(key+": "+value);
    });
    let reqdNft = this.getNft(nftID);
    let price = reqdNft.price;
    let owner = this.nftDb.get(nftID);
    let artist = this.nftToArtistMap.get(nftID);
    console.log("Type of owner: "+typeof(owner)+" type of artist: "+typeof(artist));
    console.log("Values of owner: "+owner+" value of artist: "+artist);
    if(owner == artist){
      console.log("Type of buyer is: "+typeof(buyer));
      //buyer.postTransaction([{ amount: price, address: artist.address }]);
      this.transferNft(buyer, artist, nftID)
    }
    // else{
    //   let share = 
    // }
  } 

  transferNft(buyer, seller, nftID) {
    let buyerOwnedNfts = this.nftOwnerMap.get(buyer) || new Set(); // using set coz searching and deletion efficiency
    if(!buyerOwnedNfts.has(nftID)) {
        buyerOwnedNfts.add(nftID);
        this.nftOwnerMap.set(buyer, buyerOwnedNfts);
    }
    this.nftDb.set(nftID, buyer);

    // Removing nft from sender
    let sellerOwnedNfts = this.nftOwnerMap.get(seller) || new Set();
    sellerOwnedNfts.delete(nftID);
    this.nftOwnerMap.set(seller, sellerOwnedNfts);
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