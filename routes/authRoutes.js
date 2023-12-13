

const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const User = mongoose.model("User");
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

require('dotenv').config();

router.post('/signup', async (req, res) => {
    console.log('sent by client-',req.body);

    try {
        const { name, email, password, dob } = req.body;
        if (!email || !password || !name || !dob) {
            return res.status(422).send({ error: "Please fill all the fields" });
        }

        const savedUser = await User.findOne({ email: email });

        if (savedUser) {
            return res.status(422).send({ error: "Invalid Credentials as this email already exsists" });
        } 

        const user = new User({
            name,
            email,
            password,
            dob  
        });

        await user.save();

        const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET);
        res.send({ token });
    } catch (err) {
        console.log('db err ', err);
        return res.status(422).send({ error: err.message });
    }
});

router.post('/signin', async (req, res) => {
    // console.log('sent by client-',req.body);

    const {email, password} = req.body;
    if (!email || !password) {
        return res.status(422).json({error: "Please add email or password"});
    }
    const savedUser=await User.findOne({ email: email })
    if (!savedUser) {
        return res.status(422).json({error: "Invaid Credentials"});
    }
    try {
        bcrypt.compare(password, savedUser.password, (err, result) => {
            if (result) {
                console.log("password matched");
                const token =jwt.sign({ _id: savedUser._id }, process.env.JWT_SECRET);
                res.send({token});
            }
            else {
                console.log('Password does not match');
                return res.status(422).json({ error: "Invalid Credentials"});

            }
        })
    }
    catch(err) {
        console.log(err);
    }
})

module.exports = router;
