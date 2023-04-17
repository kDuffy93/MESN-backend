var express = require('express');
var router = express.Router();
const passport = require('passport');
const User = require('../../models/user');

// Register function



router.post('/', (req, res) => {
    User.register(new User({
            username: req.body.username,
            password: req.body.password
        }), 
        (err, user) => {
            if (err) {
                console.log(err);
                res.status(400).json(err);
            }
            else {
                  res.status(200).json(user);
            }
        });
});

module.exports = router;
