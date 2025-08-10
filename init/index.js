const mongoose = require('mongoose');
main().catch(err => console.log(err));

async function main() {
  await mongoose.connect('mongodb://127.0.0.1:27017/wanderlust');
}

const Listing = require("../models/listing.js");
const initData = require("./data.js");

const initDb = async ()=>{
    await Listing.deleteMany({});
    initData.data = initData.data.map((obj)=>({
      ...obj,owner:"6898267e3a78cf1c2b733376"
    }))
    await Listing.insertMany(initData.data);
};

initDb();