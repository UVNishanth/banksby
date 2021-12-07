"use strict";

const { exit } = require('process');
const { Client } = require('spartan-gold');

const constants = require('./nft-flags');

module.exports = class NftArtist extends Client {

    /**
     * Post a transaction creating a new NFT owned by the client.
     */
    createNft(nft) {
      this.postGenericTransaction({
        data: {
          flag: constants.CREATE_NFT,
          nft: nft,
        }
      });
    }

    getNftImage(nftId){
      let buf = this.lastBlock.nfts.get(nftId);
      console.log("JSON is: "+buf.content);
      return Buffer.from(JSON.parse(buf.content).data);
    }
  
    getNftIds() {
      console.log("Last Block owner list: ");
      console.log(this.lastBlock.nftOwnerMap);
      return this.lastBlock.nftOwnerMap.get(this.address);
    }
  
    showNfts() {
      let nftList = this.lastBlock.getOwnersNftList(this.address);
      nftList.forEach(nftID => {
        let nft = this.lastBlock.getNft(nftID);
        console.log(`
        artist: ${nft.artistName} 
        piece: "${nft.title}"
        ---x----x-----x-----x------
        ${nft.content}
        `);
      });
    }
  }