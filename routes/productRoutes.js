const express = require('express');
const Product = require('../models/product');

const router = express.Router();
const TAX_RATE = 0.15;

const parsePrice = (value, fieldName) => {
    const numericValue = Number(value);
    if (!Number.isFinite(numericValue) || numericValue < 0) {
        throw new Error(`${fieldName} must be a non-negative number`);
    }
    return numericValue;
};

const parseId = (value) => {
    const numericValue = Number(value);
    if (!Number.isInteger(numericValue) || numericValue <= 0) {
        throw new Error('id must be a positive integer');
    }
    return numericValue;
};

const formatProduct = (productDoc) => {
    const {
        id,
        product1Price,
        product2Price,
        product3Price,
        taxRate,
        totalWithTax
    } = productDoc;

    return { id, product1Price, product2Price, product3Price, taxRate, totalWithTax };
};

router.get('/products', async (req, res) => {
    try {
        const products = await Product.find({}).sort({ id: -1 }).lean();
        res.json(products.map(formatProduct));
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

router.get('/products/:id', async (req, res) => {
    try {
        const lookupId = parseId(req.params.id);
        const product = await Product.findOne({ id: lookupId }).lean();
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }
        res.json(formatProduct(product));
    } catch (err) {
        const statusCode = err.message.includes('id must') ? 400 : 500;
        res.status(statusCode).json({ message: err.message });
    }
});

router.post('/products', async (req, res) => {
    try {
        const product1Price = parsePrice(req.body.product1Price, 'product1Price');
        const product2Price = parsePrice(req.body.product2Price, 'product2Price');
        const product3Price = parsePrice(req.body.product3Price, 'product3Price');

        const subtotal = product1Price + product2Price + product3Price;
        const totalWithTax = Number((subtotal * (1 + TAX_RATE)).toFixed(2));

        const lastProduct = await Product.findOne(
            { id: { $exists: true } },
            { id: 1 }
        )
            .sort({ id: -1 })
            .lean();

        let nextId = 1;
        if (lastProduct && lastProduct.id !== undefined) {
            const lastIdNumeric = Number(lastProduct.id);
            if (Number.isFinite(lastIdNumeric)) {
                nextId = lastIdNumeric + 1;
            }
        }

        const productRecord = await Product.create({
            id: nextId,
            product1Price,
            product2Price,
            product3Price,
            taxRate: TAX_RATE,
            totalWithTax
        });

        res.status(201).json(formatProduct(productRecord.toObject()));
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

module.exports = router;
