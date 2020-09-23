const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const cors = require('cors');
const bodyParser = require('body-parser');
const swaggerJSDoc = require('swagger-jsdoc');
const swaggerUI = require('swagger-ui-express');

const app = express();

const swaggerOptions = {
    swaggerDefinition: {
        info: {
            title: "Shop API",
            description: "Backend Api",
            contact: {
                name: 'Amazing Developer'
            },
            servers: "http://localhost:3636"
        }
    },
    apis: ["app.js", ".routes/*.js"]
};

const swaggerDocs = swaggerJSDoc(swaggerOptions);
app.use('/api/docs', swaggerUI.serve, swaggerUI.setup(swaggerDocs));
app.use(bodyParser.json()); // for parsing application/json
//Import Routes
const usersRouter = require('./routes/users');
const productsRoute = require('./routes/products');
const authRouter = require('./routes/auth');
const ordersRoute = require('./routes/orders');
const paymentRoute = require('./routes/razorpay');

app.use(cors( {
    origin: "*",
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    allowedHeaders: 'Content-Type, Authorization, Origin, X-Requested-With, Accept'
}));

app.use(logger('combined'));

// Add headers
app.use(function (req, res, next) {

    // Website you wish to allow to connect
    res.setHeader('Access-Control-Allow-Origin', '*');

    // Request methods you wish to allow
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');

    // Request headers you wish to allow
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');

    // Set to true if you need the website to include cookies in the requests sent
    // to the API (e.g. in case you use sessions)
    res.setHeader('Access-Control-Allow-Credentials', true);

    // Pass to next layer of middleware
    next();
});

// Use Routes
app.use('/api/users', usersRouter);
app.use('/api/products', productsRoute);
app.use('/api/auth', authRouter);
app.use('/api/orders', ordersRoute);
app.use('/api/payment/order', paymentRoute);




app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', productsRoute);
app.use('/orders', ordersRoute);
app.listen(process.env.PORT || 3000);
module.exports = app;
