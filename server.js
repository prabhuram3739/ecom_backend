//Install express server

const express = require('express');
var cors = require('cors');
const path = require ('path');

const app = express();
app.use(cors());
app.use(express.static(__dirname + '/ecom_backend'));

app.get('*', function(req, res) {
    res.sendFile(path.join(__dirname+ '/ecom_backend/index.html'));
});

app.listen(process.env.PORT || 3000);