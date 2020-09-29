const express = require('express');
const cors = require('cors');
const router = express.Router();
const {database} = require('../config/helpers');

var corsOptions = {
    origin: '*',
    optionsSuccessStatus: 200 // some legacy browsers (IE11, various SmartTVs) choke on 204
}

let Razorpay = require('razorpay');

const RazorpayConfig ={
    key_id: 'rzp_test_VcmlXqZi26TnP0',
    key_secret: 'umA2DsU8gEOKuwBxxy49OKd3'
}

var instance = new Razorpay(RazorpayConfig);

module.exports.config = RazorpayConfig;
module.exports.instance = instance;
module.exports = router;