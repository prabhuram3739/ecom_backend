const express = require('express');
const {check, validationResult, body} = require('express-validator');
const router = express.Router();
const helper = require('../config/helpers');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const {database} = require('../config/helpers');


// LOGIN ROUTE
router.post('/login', [helper.hasAuthFields, helper.isPasswordAndUserMatch], (req, res) => {
    let token = jwt.sign({state: 'true', email: req.body.email, username: req.body.username}, helper.secret, {
        algorithm: 'HS512',
        expiresIn: '4h'
    });
    let userEmail = req.body.email;
    /* Get the user details */
    database.table('users as u')
        .withFields(['u.id as id',
            'u.username',
            'u.password',
            'u.email',
            'u.fname',
            'u.lname',
            'u.age',
            'u.role',
            'u.photoUrl'
        ])
        .sort({id: .1})
        .filter({'u.email': userEmail})
        .getAll()
        .then(user => {
           if(user.length > 0) {
                res.status(200).json({
                    count: user.length,
                    id: user[0]['id'],
                    token: token,
                    auth: true,
                    email: req.body.email,
                    username: req.body.username,
                    fname: user[0]['fname'],
                    lname: user[0]['lname'],
                    age: user[0]['age'],
                    role: user[0]['role'],
                    photoUrl: user[0]['photoUrl']
                });
            } else {
                res.json({message: 'No user found'})
            }
        }).catch(err => console.log(err));
    //res.json({});
});

// REGISTER ROUTE
router.post('/register', [
    check('email').isEmail().not().isEmpty().withMessage('Field can\'t be empty')
        .normalizeEmail({all_lowercase: true}),
    check('password').escape().trim().not().isEmpty().withMessage('Field can\'t be empty')
        .isLength({min: 6}).withMessage("must be 6 characters long"),
    body('email').custom(value => {
        return helper.database.table('users').filter({
            $or:
                [
                    {email: value}, {username: value.split("@")[0]}
                ]
        }).get().then(user => {
            if (user) {
                return Promise.reject('Email / Username already exists, choose another one.');
            }
        })
    })
], async (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        return res.status(422).json({errors: errors.array()});
    } else {

        let email = req.body.email;
        let username = email.split("@")[0];
        let password = await bcrypt.hash(req.body.password, 10);
        let fname = req.body.fname;
        let lname = req.body.lname;

        /**
         * ROLE 777 = ADMIN
         * ROLE 555 = CUSTOMER
         **/
        helper.database.table('users').insert({
            username: username,
            password: password,
            email: email,
            role: 555,
            lname: lname || null,
            fname: fname || null
        }).then(lastId => {
            if (lastId > 0) {
                res.status(201).json({message: 'Registration successful.'});
            } else {
                res.status(501).json({message: 'Registration failed.'});
            }
        }).catch(err => res.status(433).json({error: err}));
    }
});


module.exports = router;
