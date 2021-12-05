"use strict";

const { exit } = require('process');
const { Client } = require('spartan-gold');

const constants = require('./nft-flags');

module.exports = class NftBuyer extends Client {

    /**
     * Post a transaction creating a new NFT owned by the client.
     */
  
    sellNft() {
      this.log("Not implemented: sellNft");
    }
  
    buyNft(nftID, owner, artist = owner) {
      // Posting a transaction to transfer the NFT.
        console.log("HElllooo");
        let reqdNft = this.lastBlock.nfts.get(nftID);
        let price = reqdNft.price;
        let ogOwner = this.lastBlock.nftDb.get(nftID);
        let ogArtist = this.lastBlock.nftToArtistMap.get(nftID);
        console.log("Artist: "+reqdNft.artistName+" price: "+price);
        console.log("Values of owner: "+ogOwner+" value of artist: "+ogArtist);
        if(ogOwner != ogArtist){
            console.log("Happening------");
            let royalty = price * reqdNft.royalty;
            super.postTransaction([{ amount: royalty, address: artist.address }]);
            price -= royalty;
        }
        console.log("Transaction done");
        super.postTransaction([{ amount: price, address: owner.address }]);
        let buyer = this.address;
        let seller = owner.address;
        let buyerOwnedNfts = this.lastBlock.nftOwnerMap.get(buyer) || new Set(); // using set coz searching and deletion efficiency
        let newNftOwnerMap = this.lastBlock.nftOwnerMap;
        let newNftDb = this.lastBlock.nftDb;
        if(!buyerOwnedNfts.has(nftID)) {
            buyerOwnedNfts.add(nftID);
            newNftOwnerMap.set(buyer, buyerOwnedNfts);
        }
        newNftDb.set(nftID, buyer);

        // Removing nft from sender
        let sellerOwnedNfts = newNftOwnerMap.get(seller) || new Set();
        //let newSellerOwnedNfts = this.lastBlock.nftOwnerMap;
        sellerOwnedNfts.delete(nftID);
        newNftOwnerMap.set(seller, sellerOwnedNfts);
        // this.postGenericTransaction({
        //     data: {
        //         type: constants.TRANSFER_NFT,
        //         nftID: nftID,
        //         owner: ogOwner
        //     }
        // });
        for(let [key, value] of newNftDb.entries()){
            console.log(key,value);
        }
        console.log("Now wrapping");
        let json2 = {};
        newNftOwnerMap.forEach((value, key) => {
            json2[key] = JSON.stringify(Array.from(value));
        });
        let json1 = {};
        newNftDb.forEach((value, key) => {
            json1[key] = JSON.stringify(value);
        });
        let obj1 = JSON.stringify(json1);
        let obj2 = JSON.stringify(json2);
        console.log("JSON1 is: "+obj1);
        console.log("JSON2 is: "+obj2);
        this.postGenericTransaction({
            data: {
                type: constants.UPDATE_MAPS,
                nftDb: obj1,
                nftOwnerMap: obj2
                //sellerNft: newSellerOwnedNfts
            }
        });
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

    approveBroker(broker){
        broker.setClient(this);
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