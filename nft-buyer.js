"use strict";

const { Client } = require('spartan-gold');

const constants = require('./nft-flags');

module.exports = class NftBuyer extends Client {

    /**
     * Post a transaction creating a new NFT owned by the client.
     */
  
    sellNft() {
      this.log("Not implemented: sellNft");
    }
  
    buyNft(nftID, artist) {
      // Posting a transaction to transfer the NFT.

      this.postGenericTransaction({
        fee: 0,
        data: {
          type: constants.BUY_NFT,
          nftID: nftID
        },
      });
      super.postTransaction([{ amount: 20, address: artist.address }]);
    }
  
    getNftIds() {
    //   console.log("Last Block owner list: ");
    //   console.log(this.lastConfirmedBlock.nftOwnerMap);
      return this.lastBlock.nftOwnerMap.get(this.address);
    }

    getNftIdsbyTitle(artist, title){
        console.log("Map is: "+this.lastBlock.titleToId.get(String(artist.name+title)));
        return this.lastBlock.titleToId.get(String(artist.name+title));
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