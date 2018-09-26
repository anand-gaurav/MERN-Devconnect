const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const passport = require("passport");
const validateProfileInput = require("../../validations/profile");
const validateExperienceInput = require("../../validations/experience");
const validateEducationInput = require("../../validations/education");
const request = require("request");
const keys = require("../../config/keys");

//Load Profile Model
const User = require("../../models/User");
const Profile = require("../../models/Profile");

//@route  GET api/profile/test
//@desc   Test profiles route
//@access Public
router.get("/test", (req, res) => res.json({ msg: "Profile works" }));

//@route  GET api/profile/
//@desc   Get user profile
//@access Private
router.get(
  "/",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    const errors = {};
    Profile.findOne({ user: req.user.id })
      .populate("user", ["name", "avatar"])
      .then(profile => {
        if (!profile) {
          errors.noprofile = "There is no profile for this user";
          res.status(404).json(errors);
        } else {
          res.json(profile);
        }
      })
      .catch(err => res.status(404).json(err));
  }
);

//@route  POST api/profile/
//@desc   Create user profile
//@access Private
router.post(
  "/",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    const { errors, isValid } = validateProfileInput(req.body);
    //Check validation
    if (!isValid) {
      return res.status(400).json(errors);
    }

    const profileFields = {};
    profileFields.user = req.user.id;
    if (req.body.handle) profileFields.handle = req.body.handle;
    if (req.body.company) profileFields.company = req.body.company;
    if (req.body.website) profileFields.website = req.body.website;
    if (req.body.location) profileFields.location = req.body.location;
    if (req.body.bio) profileFields.bio = req.body.bio;
    if (req.body.status) profileFields.status = req.body.status;
    if (req.body.githubusername)
      profileFields.githubusername = req.body.githubusername;
    // Skills - Split into array
    if (typeof req.body.skills !== undefined) {
      profileFields.skills = req.body.skills.split(",");
    }
    //Social
    profileFields.social = {};
    if (req.body.youtube) profileFields.social.youtube = req.body.youtube;
    if (req.body.twitter) profileFields.social.twitter = req.body.twitter;
    if (req.body.linkedin) profileFields.social.linkedin = req.body.linkedin;
    if (req.body.facebook) profileFields.social.facebook = req.body.facebook;
    if (req.body.instagram) profileFields.social.instagram = req.body.instagram;
    console.log(profileFields);
    Profile.findOne({ user: req.user.id }).then(profile => {
      if (profile) {
        Profile.findOneAndUpdate(
          { user: req.user.id },
          { $set: profileFields },
          { new: true }
        )
          .then(profile => res.json(profile))
          .catch(err => res.status(400).json(err));
      } else {
        // Create

        //Check if handle exists
        Profile.findOne({ handle: req.body.handle })
          .then(profile => {
            if (profile) {
              errors.handle = "Handle already exists";
              res.status(400).json(errors);
            }

            //Save profile
            new Profile(profileFields)
              .save()
              .then(profile => res.json(profile))
              .catch(err => {
                console.log(err);
                res.status(400).json(err);
              });
          })
          .catch(err => res.status(400).json(err));
      }
    });
  }
);
//@route  GET api/profile/handle/:handle
//@desc   Get profile by handle
//@access Public

router.get("/all", (req, res) => {
  const errors = {};
  Profile.find()
    .populate("user", ["name", "avatar"])
    .then(profiles => {
      if (!profiles) {
        errors.noprofile = "There are no profiles";
        return res.status(404).json(errors);
      }
      res.json(profiles);
    })
    .catch(err =>
      res.status(404).json({ profile: "There is no profile for this user" })
    );
});

//@route  GET api/profile/handle/:handle
//@desc   Get profile by handle
//@access Public
router.get("/handle/:handle", (req, res) => {
  const errors = {};
  Profile.findOne({ handle: req.params.handle })
    .populate("user", ["name", "avatar"])
    .then(profile => {
      if (!profile) {
        errors.noprofile = "There is no profile for this user";
        return res.status(404).json(errors);
      } else {
        res.json(profile);
      }
    })
    .catch(err =>
      res.status(404).json({ profile: "There is no profile for this user" })
    );
});

//@route  GET api/profile/user/:user_id
//@desc   Get profile by user ID
//@access Public
router.get("/user/:user_id", (req, res) => {
  const errors = {};
  Profile.findOne({ user: req.params.user_id })
    .populate("user", ["name", "avatar"])
    .then(profile => {
      if (!profile) {
        errors.noprofile = "There is no profile for this user";
        return res.status(404).json(errors);
      } else {
        res.json(profile);
      }
    })
    .catch(err =>
      res.status(404).json({ profile: "There is no profile for this user" })
    );
});

//@route  POST api/profile/experience
//@desc   Add experience to user profile
//@access Private
router.post(
  "/experience",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    const { errors, isValid } = validateExperienceInput(req.body);
    //Check validation
    if (!isValid) {
      return res.status(400).json(errors);
    }
    Profile.findOne({ user: req.user.id }).then(profile => {
      if (profile) {
        const newExp = {
          title: req.body.title,
          company: req.body.company,
          location: req.body.location,
          from: req.body.from,
          to: req.body.to,
          current: req.body.current,
          description: req.body.description
        };

        //Add exp to profile
        profile.experience.unshift(newExp);
        profile.save().then(profile => res.json(profile));
      }
    });
  }
);

//@route  POST api/profile/education
//@desc   Add education to user profile
//@access Private
router.post(
  "/education",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    const { errors, isValid } = validateEducationInput(req.body);
    //Check validation
    if (!isValid) {
      return res.status(400).json(errors);
    }
    Profile.findOne({ user: req.user.id }).then(profile => {
      if (profile) {
        const newEdu = {
          school: req.body.school,
          degree: req.body.degree,
          fieldofstudy: req.body.fieldofstudy,
          from: req.body.from,
          to: req.body.to,
          current: req.body.current,
          description: req.body.description
        };

        //Add education to profile
        profile.education.unshift(newEdu);
        profile.save().then(profile => res.json(profile));
      }
    });
  }
);

//@route  DELETE api/profile/experience/:exp_id
//@desc   Delete experience from user profile
//@access Private
router.delete(
  "/experience/:exp_id",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    Profile.findOne({ user: req.user.id })
      .then(profile => {
        // Get remove index
        const removeIndex = profile.experience
          .map(item => item.id)
          .indexOf(req.params.exp_id);

        // Splice out of array
        profile.experience.splice(removeIndex, 1);

        // Save
        profile.save().then(profile => res.json(profile));
      })
      .catch(err => res.status(404).json(err));
  }
);

//@route  DELETE api/profile/education/:edu_id
//@desc   Delete education from user profile
//@access Private
router.delete(
  "/education/:edu_id",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    Profile.findOne({ user: req.user.id })
      .then(profile => {
        if (profile) {
          // Get remove index
          const removeIndex = profile.education
            .map(item => item.id)
            .indexOf(req.params.edu_id);
          //Splice out of array
          profile.education.splice(removeIndex, 1);
          profile.save().then(profile => res.json(profile));
        }
      })
      .catch(err => res.status(404).json(err));
  }
);

//@route  DELETE api/profile
//@desc   Delete user & profile
//@access Private
router.delete(
  "/",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    Profile.findOneAndRemove({ user: req.user.id })
      .then(() => {
        User.findOneAndRemove({ _id: req.user.id }).then(() => {
          res.json({ success: true });
        });
      })
      .catch(err => res.status(404).json(err));
  }
);

// @route       GET api/profile/github/:username/:count/:sort
// @desc        Get github data from github api
// @access      Public
router.get("/github/:username/:count/:sort", (req, res) => {
  username = req.params.username;
  clientId = keys.clientId;
  clientSecret = keys.clientSecret;
  count = req.params.count;
  sort = req.params.sort;
  const options = {
    url: `https://api.github.com/users/${username}/repos?per_page=${count}&sort=${sort}&client_id=${clientId}&client_secret=${clientSecret}`,
    headers: {
      "User-Agent": "request"
    }
  };
  function callback(error, response, body) {
    if (!error && response.statusCode == 200) {
      const info = JSON.parse(body);
      res.json(info);
    }
  }
  request(options, callback);
});

module.exports = router;
