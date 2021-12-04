"use strict";

const { Client } = require('spartan-gold');

const constants = require('./nft-flags');

module.exports = class NftArtist extends Client {

    /**
     * Post a transaction creating a new NFT owned by the client.
     */
    createNft(nft) {
      this.postGenericTransaction({
        fee: 0,
        data: {
          type: constants.CREATE_NFT,
          nft: nft,
        },
      });
    }
  
    sellNft() {
      this.log("Not implemented: sellNft");
    }
  
    transferNft(receiver, nftID) {
      // Posting a transaction to transfer the NFT.
      this.postGenericTransaction({
        fee: 0,
        data: {
          type: constants.NFT_TRANSFER,
          receiver: receiver,
          nftID: nftID
        },
      });
    }
  
    getNftIds() {
      console.log("Last Block owner list: ");
      console.log(this.lastBlock.nftOwnerMap);
      return this.lastBlock.nftOwnerMap.get(this.address);
    }
  
    /**
     * Post a transaction transferring an NFT to a new owner.
     */
    showNfts() {
      let nftList = this.lastBlock.getOwnersNftList(this.address);
      nftList.forEach(nftID => {
        let nft = this.lastBlock.getNft(nftID);
        console.log(`
        ${nft.artistName}'s "${nft.title}"
        ------------------------------------
        ${nft.content}
        `);
        console.log();
      });
    }
  }