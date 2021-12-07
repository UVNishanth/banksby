const {Blockchain,Miner,Transaction,FakeNet} = require('spartan-gold');
const NftArtist = require('./nft-artist.js');
const NftBuyer = require('./nft-buyer');
const NftBlock = require('./nft-block.js');
const fs = require("fs");
const { clear } = require('console');
const { exit } = require('process');


let fakeNet = new FakeNet();

// Clients and miners
let manglobe = new NftBuyer({name: "Studio Manglobe", net: fakeNet});
let madhouse = new NftBuyer({name: "Studio Madhouse", net: fakeNet});
let minnie = new Miner({name: "Minnie", net: fakeNet});
let mickey = new Miner({name: "Mickey", net: fakeNet});

// Artist creating an NFT
let nujabes = new NftArtist({name: "Nujabes", net: fakeNet});

// Creating genesis block
let genesis = Blockchain.makeGenesis({
  blockClass: NftBlock,
  transactionClass: Transaction,
  clientBalanceMap: new Map([
    [manglobe,233], [madhouse, 500], [nujabes,500], [minnie,500], [mickey,500]
  ]),
});

function encodeImage(file) {
  // read binary data
  let bitmap = fs.readFileSync(file);
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
  console.log(" CREATING NFT ");
  nujabes.createNft({
    artistName: nujabes.name,  title: "Battlecry",
    price: 20,
    royalty: 0.02,
    content: encodeImage('/Users/nishanthuchil/Documents/cs-168/imageBasedNFT/sample2.jpg')
    });
}, 2000);
nujabes.showNfts();


setTimeout(() => {
  let nftID = manglobe.getNftIdsbyTitle(nujabes, "Battlecry");
  let image = nujabes.getNftImage(nftID);
  fs.writeFileSync("/Users/nishanthuchil/Documents/cs-168/imageBasedNFT/sample1.jpg", image);
}, 5000);