const express = require('express');
const cors = require('cors');
const router = express.Router();
const {database} = require('../config/helpers');

var corsOptions = {
    origin: '*',
    optionsSuccessStatus: 200 // some legacy browsers (IE11, various SmartTVs) choke on 204
}

/* Get All products */
router.get('/', cors(corsOptions), function(req, res) {
  let page = (req.query.page != undefined && req.query.page != 0) ? req.query.page : 1; // set the current page
  const limit = (req.query.limit != undefined && req.query.limit != 0) ? req.query.limit : 10; // Set the limit of items per page
  let startValue;
  let endValue;

  if(page > 0) {
    startValue = (page * limit) - limit; //0, 10, 20, 30 ...
    endValue = page * limit;
  } else {
    startValue = 0;
    endValue = 10;
  }

  database.table('products as p')
      .join([{
        table:'categories as c',
        on: 'c.id = p.cat_id'
      }])
      .withFields(['c.title as category',
      'p.title as name',
          'p.price',
          'p.quantity',
          'p.description',
          'p.image',
          'p.id'
      ])
      .slice(startValue, endValue)
      .sort({id: .1})
      .getAll()
      .then(prods => {
        if(prods.length > 0) {
            res.status(200).json({
                count: prods.length,
                products: prods
            });
        } else {
            res.json({message: 'No products found'})
        }
      }).catch(err => console.log(err));
});

/* Get All categories */
router.get('/categories', cors(corsOptions), function(req, res) {

    database.table('categories as c')
        .withFields(['c.title as category',
            'c.id as id'
        ])
        .sort({id: .1})
        .getAll()
        .then(category => {
            if(category.length > 0) {
                res.status(200).json({
                    count: category.length,
                    categories: category
                });
            } else {
                res.json({message: 'No categories found'})
            }
        }).catch(err => console.log(err));
});

/* Get the single product */
router.get('/:prodId', cors(corsOptions), (req,res) => {
    let productId = req.params.prodId;

    database.table('products as p')
        .join([{
            table:'categories as c',
            on: 'c.id = p.cat_id'
        }])
        .withFields(['c.title as category',
            'p.title as name',
            'p.price',
            'p.quantity',
            'p.description',
            'p.image',
            'p.images',
            'p.id'
        ])
        .filter({'p.id': productId})
        .get(productId)
        .then(prod => {
            if(prod) {
                res.status(200).json(prod);
            } else {
                res.json({message: `No product found with product id ${productId}`})
            }
        }).catch(err => console.log(err));


});

/* Get ALl products from a particular category */
router.get('/category/:catName', (req, res) => {
    let page = (req.query.page != undefined && req.query.page != 0) ? req.query.page : 1; // set the current page
    const limit = (req.query.limit != undefined && req.query.limit != 0) ? req.query.limit : 10; // Set the limit of items per page
    let startValue;
    let endValue;

    //Fetch the category name from the url
    let cat_title = req.params.catName;

    if(page > 0) {
        startValue = (page * limit) - limit; //0, 10, 20, 30 ...
        endValue = page * limit;
    } else {
        startValue = 0;
        endValue = 10;
    }

    database.table('products as p')
        .join([{
            table:'categories as c',
            on: `c.id = p.cat_id WHERE c.title like '%${cat_title}%'`
        }])
        .withFields(['c.title as category',
            'p.title as name',
            'p.price',
            'p.quantity',
            'p.description',
            'p.image',
            'p.id'
        ])
        .slice(startValue, endValue)
        .sort({id: .1})
        .getAll()
        .then(prods => {
            if(prods.length > 0) {
                res.status(200).json({
                    count: prods.length,
                    products: prods
                });
            } else {
                res.json({message: `No products found from ${cat_title} category.`})
            }
        }).catch(err => console.log(err));
});



module.exports = router;
