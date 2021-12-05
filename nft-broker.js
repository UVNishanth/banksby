"use strict";

const { exit } = require('process');
const { Client } = require('spartan-gold');

const constants = require('./nft-flags');

module.exports = class NftBroker extends Client {

    /**
     * Post a transaction creating a new NFT owned by the client.
     */

    constructor(...args){
        super(...args);
        this.clients = new Set();
    }

    setClient(client){
        this.clients.add(client);
    }

    buyNft(client, nftID, owner, artist=owner){
        if(!this.clients.has(client)){
            throw new Error(`${this.name} is not authorized to buy for ${client.name}`);
        }
        client.buyNft(nftID, owner, artist);
    }
    
    
    getNftIds() {
    //   console.log("Last Block owner list: ");
    //   console.log(this.lastConfirmedBlock.nftOwnerMap);
      return this.lastBlock.nftOwnerMap.get(this.address);
    }

    getNftIdsbyTitle(artist, title){
        console.log("Map is: ");
        for (let [key, value] of this.lastBlock.titleToId){
            console.log(key,value);
        }
        //console.log("Map is: "+this.lastBlock.titleToId.get(String(artist.name+title)));
        console.log("Key is: "+String(artist.name+title));
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
          artist: ${nft.artistName} 
          piece: "${nft.title}"
          ---x----x-----x-----x------
          ${nft.content}
          `);
        });
      }
  }