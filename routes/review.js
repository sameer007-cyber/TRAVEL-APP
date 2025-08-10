const express = require("express");
const router = express.Router({mergeParams:true});
const wrapAsync = require("../utils/wrapAsync.js");
const {listingSchema,reviewSchema} = require("../schema.js");
const ExpressError = require("../utils/ExpressError.js");
const Review = require("../models/review.js");

const validateReview = (req,res,next)=>{
  let{error}=reviewSchema.validate(req.body);
  if(error){
    let errMsg = error.details.map((el)=>el.message).join(",");
    throw new ExpressError(404,error);
  }else{
    next();
  }
};

//reviews
router.post("/",validateReview,wrapAsync(async(req,res)=>{
  let listing = await Listing.findById(req.params.id);
  let newReview =  new Review (req.body.review);
  listing.reviews.push(newReview);

  await newReview.save();
  await listing.save();
  res.redirect(`/listings/${listing._id}`);
}));

router.delete("/:reviewId",wrapAsync(async(req,res,next)=>{
  let{id,reviewId}=req.params;

  await Listing.findByIdAndUpdate(id,{$pull:{reviews:reviewId}});
  await Review.findById(reviewId);

  res.redirect(`/listings/${id}`)
}))

module.exports=router;