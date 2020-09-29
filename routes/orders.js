const express = require('express');
const cors = require('cors');
const router = express.Router();
const {database} = require('../config/helpers');
const razorpayInstance = require('razorpay');

var corsOptions = {
    origin: '*',
    optionsSuccessStatus: 200 // some legacy browsers (IE11, various SmartTVs) choke on 204
}

const Razorpay = require('razorpay');

const RazorpayConfig ={
    key_id: 'rzp_test_VcmlXqZi26TnP0',
    key_secret: 'umA2DsU8gEOKuwBxxy49OKd3'
}

var instance = new Razorpay({
    key_id: 'rzp_test_VcmlXqZi26TnP0',
    key_secret: 'umA2DsU8gEOKuwBxxy49OKd3'
});
// GET ALL ORDERS
router.get('/', cors(corsOptions),  (req, res) => {
  database.table('orders_details as od')
      .join([
        {
          table: 'orders as o',
          on: 'o.id = od.order_id'
        },
        {
          table: 'products as p',
          on: 'p.id = od.product_id'
        },
        {
          table: 'users as u',
          on: 'u.id = o.user_id'
        }
      ])
      .withFields(['o.id', 'p.title as name', 'p.description', 'p.price', 'p.image', 'od.quantity as quantityOrdered', 'u.username'])
      .getAll()
      .then(orders => {
        if (orders.length > 0) {
          res.status(200).json(orders);
        } else {
          res.json({message: "No orders found"});
        }

      }).catch(err => res.json(err));
});

// Get Single Order
router.get('/:id', cors(corsOptions),  async (req, res) => {
  let orderId = req.params.id;
    console.log("Order response:", orderId);
  database.table('orders_details as od')
      .join([
        {
          table: 'orders as o',
          on: 'o.id = od.order_id'
        },
        {
          table: 'products as p',
          on: 'p.id = od.product_id'
        },
        {
          table: 'users as u',
          on: 'u.id = o.user_id'
        }
      ])
      .withFields(['o.id', 'p.title as name', 'p.description', 'p.price', 'p.image', 'od.quantity as quantityOrdered', 'u.username'])
      .filter({'o.id': orderId})
      .getAll()
      .then(orders => {
          console.log("Order response:", orders);
        if (orders.length > 0) {
          res.json(orders);
        } else {
          res.json({message: `No orders found with ${orderId}`});
        }

      }).catch(err => res.json(err));
});

// Place New Order
router.post('/new', cors(corsOptions),  async (req, res) => {
  let {userId, products, razorpay_order_id, razorpay_payment_id, razorpay_signature} = req.body;

  if (userId !== null && userId > 0 && !isNaN(userId)) {
    database.table('orders')
        .insert({
            user_id: userId
        }).then((newOrderId) => {
      if (newOrderId > 0) {
        /* using async to avoid usage of then with the await */
        products.forEach(async (p) => {
            let data = await database.table('products').filter({id: p.id}).withFields(['quantity']).get();
          let inCart = parseInt(p.inCart);

          // Deduct the number of pieces ordered from the quantity in database

          if (data !== undefined && data.quantity > 0) {
            data.quantity = data.quantity - inCart;

            if (data.quantity < 0) {
              data.quantity = 0;
            }

          } else {
            data.quantity = 0;
          }

          // Insert order details w.r.t the newly created order Id
          database.table('orders_details')
              .insert({
                order_id: newOrderId,
                product_id: p.id,
                quantity: inCart,
                  razorpay_order_id: razorpay_order_id,
                  razorpay_payment_id: razorpay_payment_id,
                  razorpay_signature: razorpay_signature
              }).then(newId => {
            database.table('products')
                .filter({id: p.id})
                .update({
                  quantity: data.quantity
                }).then(successNum => {
            }).catch(err => console.log(err));
          }).catch(err => console.log(err));
        });

      } else {
        res.json({message: 'New order failed while adding order details', success: false});
      }
      res.json({
        message: `Order successfully placed with order id ${newOrderId}`,
        success: true,
          order_id: newOrderId,
        razorpay_order_id: razorpay_order_id,
        products: products
      })
    }).catch(err => res.json(err));
  }

  else {
    res.json({message: 'New order failed', success: false});
  }

});

// Fake Payment Gateway Call
router.post('/payment', cors(corsOptions),  async (req, res) => {
  setTimeout(() => {
      let params = req.body;
      instance.orders.create(params, function(err, order) {
          if(order) {
              res.status(200).json({data: order, success: true});
          } else {
              console.log(err);
          }
      });
}, 3000);
});

//Verify the payment
router.post("/payment/verify", (req,res) => {
    body=req.body.razorpay_order_id + "|" + req.body.razorpay_payment_id;
    var crypto = require("crypto");
    var expectedSignature = crypto.createHmac('sha256', 'umA2DsU8gEOKuwBxxy49OKd3').update(body.toString()).digest('hex');
    var response = {"status": false};

    if(expectedSignature === req.body.razorpay_signature) {
        response = {"status": true};
        console.log("Signature Verification Status:", response.status);
        res.status(200).json(response);
    }
});





module.exports.config = RazorpayConfig;
module.exports.instance = instance;
module.exports = router;

