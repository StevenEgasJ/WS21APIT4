const port = 4011;
const express = require('express');
const app = express();
const mongoose = require('mongoose');

mongoose.connect('mongodb+srv://juhuh3001_db_user:Espe123@cluster0.olchaay.mongodb.net/Products?retryWrites=true&w=majority&appName=Cluster0');

const db=mongoose.connection;
db.on('error', (error)=> console.error(error));
db.once('open', () => console.log('System connected to MongoDb Database'));
app.use(express.json());

const productRoutes = require('./routes/productRoutes');
app.use('/productstore', productRoutes);
app.listen(port, () => {
    console.log(`Product pricing service is running on port ${port}`);
});
module.exports = app;