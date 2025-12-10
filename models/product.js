const mongoose = require('mongoose');

const productSchema = new mongoose.Schema(
    {
        id: { type: Number, required: true, unique: true, min: 1 },
        product1Price: { type: Number, required: true, min: 0 },
        product2Price: { type: Number, required: true, min: 0 },
        product3Price: { type: Number, required: true, min: 0 },
        taxRate: { type: Number, default: 0.15, immutable: true },
        totalWithTax: { type: Number, required: true, min: 0 }
    },
    {
        collection: 'Products',
        versionKey: false,
        timestamps: false
    }
);

module.exports = mongoose.model('Product', productSchema);
