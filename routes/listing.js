const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync.js");
const {listingSchema,reviewSchema} = require("../schema.js");
const ExpressError = require("../utils/ExpressError.js");
const Listing = require("../models/listing.js");
const {isLoggedIn}=require("../middleware.js");

const validateListing = (req,res,next)=>{
  let{error}=listingSchema.validate(req.body);
  if(error){
    let errMsg = error.details.map((el)=>el.message).join(",");
    throw new ExpressError(404,error);
  }else{
    next();
  }
};

router.get("/", wrapAsync(async (req, res) => {
  const allListings = await Listing.find({});
  res.render("listings/index", { allListings }); 
}));

router.get("/new",isLoggedIn,(req,res)=>{
    res.render("listings/new");
});
//show route
router.get("/:id",wrapAsync(async (req,res)=>{
    let {id} = req.params;
  const listing = await Listing.findById(id).populate("reviews").populate("owner");
  if(!listing){
    req.flash("failure","Listing does not exist");
    res.redirect("/listings");
  }
  console.log(listing);
  res.render("listings/show",{listing});
}));

router.post("/",isLoggedIn,validateListing,wrapAsync(async(req,res,next)=>{
  
    const newListing = new Listing(req.body.listing);
    newListing.owner=req.user._id;
    await newListing.save();
    req.flash("success","New Listing Created!");
    res.redirect("/listings");
}));

router.get("/:id/edit",isLoggedIn,wrapAsync(async(req,res)=>{
    let {id} = req.params;
  const listing = await Listing.findById(id);
  res.render("listings/edit",{listing});

}));
router.put("/:id",isLoggedIn,validateListing,wrapAsync(async(req,res)=>{
    let {id} = req.params;
     await Listing.findByIdAndUpdate(id,{...req.body.listing});
     res.redirect(`/listings/${id}`);
}));
//delete
router.delete("/:id",isLoggedIn,wrapAsync(async(req,res)=>{
    let {id} = req.params;
    let deletedListItem=  await Listing.findByIdAndDelete(id);
    req.flash("success"," Listing Deleted!");
     res.redirect("/listings");
}));
module.exports=router;