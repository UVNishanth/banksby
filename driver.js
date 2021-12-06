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

// function reduceSize(image){
//   // Base64 string
//   const data = fs.readFileSync(image, "base64");
//   // Convert base64 to buffer => <Buffer ff d8 ff db 00 43 00 ...
//   //const buffer = Buffer.from(data, "base64");
//   console.log("HAHAHA");
//   Jimp.read('/Users/nishanthuchil/Documents/cs-168/imageBasedNFT/input/sample1.jpg').then((err, res) => {
//     if (err) throw new Error(err);
//     res.quality(50).write('./sample2.jpg');
// });

//}

function encodeImage(file) {
  // read binary data
  var bitmap = fs.readFileSync(file);
  console.log("Print bitmap: ");
  console.log(bitmap);
  // convert binary data to base64 encoded string
  let xyz =  JSON.stringify(bitmap);
  return xyz;
}

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
  console.log("***CREATING NFT***");
  nujabes.createNft({
    artistName: nujabes.name,  title: "Battlecry",
    price: 20,
    royalty: 0.02,
    content:
    `
    The elements compose a magnum
    opus my modus operandi amalgam
    `
    });
}, 2000);
nujabes.showNfts();
manglobe.approveBroker(shinichiro);


setTimeout(() => {
  let nftID = manglobe.getNftIdsbyTitle(nujabes, "Battlecry");
  //let image = nujabes.getNftImage(nftID);
  //fs.writeFileSync("/Users/nishanthuchil/Documents/cs-168/imageBasedNFT/output/sample1.jpg", image);

  console.log(`***Transferring NFT ${nftID}***`);
  //nujabes.transferNft(manglobe.address, nftID);
  //manglobe.buyNft(nftID, nujabes);
  shinichiro.buyNft(manglobe, nftID, nujabes);
}, 5000);

setTimeout(() => {
  console.log();
  console.log(`Minnie has a chain of length ${minnie.currentBlock.chainLength}:`);
  console.log("Final balances (manglobe's perspective):");
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

// setTimeout(() => {
//   let nftID = madhouse.getNftIdsbyTitle(nujabes, "Battlecry");
//   console.log(`***Transferring NFT ${nftID}***`);
//   //nujabes.transferNft(manglobe.address, nftID);
//   madhouse.buyNft(nftID, manglobe, nujabes);
// }, 5000);

// // Print out the final balances after it has been running for some time.
// setTimeout(() => {
//   console.log();
//   console.log(`Minnie has a chain of length ${minnie.currentBlock.chainLength}:`);
//   console.log("Final balances (manglobe's perspective):");
//   showBalances(manglobe);

//   console.log();
//   console.log("Showing NFTs for nujabes:");
//   nujabes.showNfts();

//   console.log();
//   console.log("Showing NFTs for Studio Manglobe:");
//   manglobe.showNfts();

//   console.log();
//   console.log("Showing NFTs for Studio Madhouse:");
//   madhouse.showNfts();

//   process.exit(0);
// }, 10000);