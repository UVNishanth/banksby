const {Blockchain,Miner,Transaction,FakeNet} = require('spartan-gold');
const NftArtist = require('./nft-artist.js');
const NftBuyer = require('./nft-buyer')
const NftBlock = require('./nft-block.js');
const { clear } = require('console');

let fakeNet = new FakeNet();

// Clients and miners
let manglobe = new NftBuyer({name: "Studio Manglobe", net: fakeNet});
let minnie = new Miner({name: "Minnie", net: fakeNet});
let mickey = new Miner({name: "Mickey", net: fakeNet});

// Artist creating an NFT
let nujabes = new NftArtist({name: "Nujabes", net: fakeNet});

// Creating genesis block
let genesis = Blockchain.makeGenesis({
  blockClass: NftBlock,
  transactionClass: Transaction,
  clientBalanceMap: new Map([
    [manglobe,233], [nujabes,500], [minnie,500], [mickey,500], 
  ]),
});

function showBalances(client) {
  console.log(`Studio Manglobe:  ${client.lastBlock.balanceOf(manglobe.address)}`);
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
    royalty: 0.2,
    content: `
    The elements compose a magum
    opus my modus operandi amalgam`
    });
}, 2000);

nujabes.showNfts();

setTimeout(() => {
  let nftID = manglobe.getNftIdsbyTitle(nujabes, "Battlecry");
  console.log(`***Transferring NFT ${nftID}***`);
  //nujabes.transferNft(manglobe.address, nftID);
  manglobe.buyNft(nftID, nujabes);
}, 5000);

// Print out the final balances after it has been running for some time.
setTimeout(() => {
  console.log();
  console.log(`Minnie has a chain of length ${minnie.currentBlock.chainLength}:`);
  console.log("Final balances (manglobe's perspective):");
  showBalances(manglobe);

  console.log();
  console.log("Showing NFTs for nujabes:");
  nujabes.showNfts(nujabes.address);

  console.log();
  console.log("Showing NFTs for Studio Manglobe:");
  manglobe.showNfts(manglobe.address);

  process.exit(0);
}, 10000);