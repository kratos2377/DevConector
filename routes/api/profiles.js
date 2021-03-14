const express = require('express');
const { check , validationResult } = require('express-validator');
const router = express.Router();
const auth = require('../../middleware/auth');
const Profile = require('../../models/Profile');
const User = require('../../models/User');

//Personal Profile
router.get('/me' , auth, async (req , res) => {
   try{
const profile = await Profile.findOne({user: req.user.id}).populate('user' ,
['name' , 'avatar']);

if(!profile){
    return res.status(400).jsonp({msg: 'There is no profile for this user'});
}
   } catch(err){
       console.error(err.message);
       if(err.kind == 'ObjectId'){
        return res.status(400).jsonp({msg: 'There is no profile for this user'});
       }
       res.status(500).send('Server Error 1');
   }
});

//Update Or make A new Profile

router.post('/' , [ auth, [
    check('status' , 'Status is Required').not().isEmpty(),
    check('skills' , 'Skills is Required').not().isEmpty()
]] , async (req,res) => {
    const errors = validationResult(req);
    if(!errors.isEmpty()){
        return res.status(400).json({errors: errors.array()});
    }

    const {
        company,
        website,
        location,
        bio,
        status,
        githubusername,
        skills,
        youtube,
        facebook,
        twitter,
        instagram,
        linkedin
    } = req.body;
  // Build Profile object

  const profileFields = {};
  profileFields.user = req.user.id;
  if(company) profileFields.company = company;
  if(website) profileFields.website = website;
  if(location) profileFields.location = location;
  if(bio) profileFields.bio = bio;
  if(status) profileFields.status = status;
  if(githubusername) profileFields.githubusername = githubusername;

  if(skills){
      profileFields.skills = skills.split(',').map(skill => skill.trim());
  }

  // Social Object

  profileFields.social ={}
  if(youtube) profileFields.social.youtube = youtube;
  if(twitter) profileFields.social.twitter = twitter;
  if(facebook) profileFields.social.facebook = facebook;
  if(linkedin) profileFields.social.linkedin = linkedin;
  if(instagram) profileFields.social.instagram = instagram;

   try{
       let profile = await Profile.findOne({user: req.user.id});

       if(profile){
           profile = await Profile.findOneAndUpdate({user: req.user.id} , {$set: profileFields},
            {new: true} );

            return res.json(profile);

       }

       
       profile = new Profile(profileFields);
       await profile.save();
       res.json(profile);



   } catch(err){
       console.error(err.message);
       res.status(500).send('Server Error 3');
   }
});


//Get All Profiles
router.get('/' , async (req,res)=> {
   try{
       const profiles = await Profile.find().populate('user' , ['name' , 'avatar']);
       res.json(profiles);

   } catch(err){
       console.error(err.message);
       res.status(500).send('Server Error 1');
   }
});

// Get Profile By User ID
router.get('/user/:user_id' , async (req,res)=> {
    try{
        const profiles = await Profile.findOne({user: req.params.user_id}).populate('user' , ['name' , 'avatar']);

           if(!profiles) return res.status(400).json({msg: "There is No profile for this user"});  

        res.json(profiles);
 
    } catch(err){
        console.error(err.message);
        res.status(500).send('Server Error 2');
    }
 });


 //Delete User Profile
 router.delete('/' , auth , async (req, res) => {
   try{
   await Profile.findOneAndRemove({user: req.user.id});
   await User.findOneAndRemove({ _id: req.user.id});
   res.json({msg: 'User Removed'});
   } catch(err){
     console.error(err.message);
     res.status(500).send('Server Error');
   }


 });

 //Add Profile experience
 router.put('/experience' , [auth , [
     check('title' , 'Title is Required').not().isEmpty(),
     check('company' , 'Company is Required').not().isEmpty(),
     check('From' , 'From Date is Required').not().isEmpty()

 ] ] , async (req, res)=>{
     const errors = validationResult(req);

     if(!errors.isEmpty()){
         return res.status(400).json({errors: errors.array()});
     }

     const {
         title,
         company,
         location,
         from,
         to,
         current,
         description
     } = req.body;

     const newExp = {
         title,
         company,
         location,
         from,
         to,
         current,
         description
     }

     try {
         const profile = await Profile.findOne({user: req.user.id});
         profile.experience.unshift(newExp);
         await profile.save();
         res.json(profile);

     } catch(err){
         console.error(err.message);
         res.status(500).send('Server Error');
     }
 });

 // Delete Experience from profile
 router.delete('/experience/:exp_id' ,auth, async (req, res)=>{

  
    try {
        const profile = await Profile.findOne({user: req.user.id});
        
        const removeIndex = profile.experience.map(item=> item.id).indexof(req.params.exp_id);
           
        profile.experience.splice(removeIndex , 1);
        await profile.save();
        res.json(profile);
    } catch(err){
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});


// Add education to profile
router.put('/education' , [auth , [
    check('school' , 'School is Required').not().isEmpty(),
    check('degree' , 'Degree is Required').not().isEmpty(),
    check('fieldofstudy' , 'Field of Study is Required').not().isEmpty(),
    check('From' , 'From Date is Required').not().isEmpty()

] ] , async (req, res)=>{
    const errors = validationResult(req);

    if(!errors.isEmpty()){
        return res.status(400).json({errors: errors.array()});
    }

    const {
       school,
       degree,
       fieldofstudy,
       from,
       to,
       current,
       description
    } = req.body;

    const newEdu = {
        school,
       degree,
       fieldofstudy,
       from,
       to,
       current,
       description
    }

    try {
        const profile = await Profile.findOne({user: req.user.id});
        profile.education.unshift(newEdu);
        await profile.save();
        res.json(profile);

    } catch(err){
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// Delete Education from profile
router.delete('/education/:edu_id' ,auth, async (req, res)=>{

 
   try {
       const profile = await Profile.findOne({user: req.user.id});
       const removeIndex = profile.education.map(item=> item.id).indexof(req.params.edu_id);
       profile.education.splice(removeIndex , 1);
       await profile.save();
       res.json(profile);
       
   } catch(err){
       console.error(err.message);
       res.status(500).send('Server Error');
   }
});


module.exports = router;