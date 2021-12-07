const {Blockchain,Miner,Transaction,FakeNet} = require('spartan-gold');
const NftArtist = require('./nft-artist.js');
const NftBuyer = require('./nft-buyer');
const NftBroker = require('./nft-broker.js');
const NftBlock = require('./nft-block.js');
const fs = require("fs");
const Jimp = require("jimp");
const { clear } = require('console');
const { exit } = require('process');


let fakeNet = new FakeNet();

// Clients and miners
let manglobe = new NftBuyer({name: "Studio Manglobe", net: fakeNet});
let madhouse = new NftBuyer({name: "Studio Madhouse", net: fakeNet});
let shinichiro = new NftBroker({name: "Shinichiro", net: fakeNet});
let minnie = new Miner({name: "Minnie", net: fakeNet});
let mickey = new Miner({name: "Mickey", net: fakeNet});

// Artist creating an NFT
let nujabes = new NftArtist({name: "Nujabes", net: fakeNet});

// Creating genesis block
let genesis = Blockchain.makeGenesis({
  blockClass: NftBlock,
  transactionClass: Transaction,
  clientBalanceMap: new Map([
    [manglobe,233], [madhouse, 500], [nujabes,500], [minnie,500], [mickey,500], [shinichiro, 200] 
  ]),
});

function showBalances(client) {
  console.log(`Studio Manglobe:  ${client.lastBlock.balanceOf(manglobe.address)}`);
  console.log(`Studio Madhouse:  ${client.lastBlock.balanceOf(madhouse.address)}`);
  console.log(`Minnie: ${client.lastBlock.balanceOf(minnie.address)}`);
  console.log(`Mickey: ${client.lastBlock.balanceOf(mickey.address)}`);
  console.log(`Nujabes: ${client.lastBlock.balanceOf(nujabes.address)}`);
}


console.log("Initial balances:");
showBalances(manglobe);

fakeNet.register(manglobe, minnie, mickey, nujabes);

// Miners start mining.
minnie.initialize(); mickey.initialize();

// Artist creates her NFT.
setTimeout(() => {
  console.log("CREATING NFT");
  nujabes.createNft({
    artistName: nujabes.name,  title: "Battlecry",
    price: 20,
    royalty: 0.02,
    content: //encodeImage('/Users/nishanthuchil/Documents/cs-168/imageBasedNFT/sample2.jpg')
    `the elements compose a magnum
    opus my modus operandi amalgam`
    });
}, 2000);
nujabes.showNfts();

// Buyer approves broker to trade on behalf of him
manglobe.approveBroker(shinichiro);


setTimeout(() => {
  let nftID = manglobe.getNftIdsbyTitle(nujabes, "Battlecry");
  console.log(`${manglobe.name} buys ${nftID}`);
  shinichiro.buyNft(manglobe, nftID, nujabes);
}, 5000);

setTimeout(() => {
  console.log("Final balances:");
  showBalances(manglobe);

  console.log();
  console.log("Showing NFTs for nujabes:");
  nujabes.showNfts();

  console.log();
  console.log("Showing NFTs for Studio Manglobe:");
  manglobe.showNfts();

  console.log();
  console.log("Showing NFTs for Studio Madhouse:");
  madhouse.showNfts();

  process.exit(0);
}, 10000);