const port = 5000;
const express = require("express");
const myapp = express();
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken")
const multer = require("multer")
const path = require("path");
const cors = require("cors");

myapp.use(express.json());
myapp.use(cors());

// DataBase Connection with MongoDB

mongoose.connect("mongodb+srv://<db_username>:<db_password>@cluster0.jwevy.mongodb.net/e-commerce")
    .then(() => {
        console.log("DB Connection Succesfull")
    })
    .catch((err) => {
        console.log("DB Connection Failed " + err);

    })

// API Create

myapp.get("/", (req, res) => {
    res.send("Express App is Running")
})

// Multer storage configuration
const Storage = multer.diskStorage({
    destination: "./upload/images",
    filename: (req, file, cb) => {
        return cb(null, `${file.fieldname}_${Date.now()}${path.extname(file.originalname)}`);
    }
});

const upload = multer({
    storage: Storage
});

// Serving images statically
myapp.use('/images', express.static("upload/images"));

// Creating upload endpoint for images
myapp.post("/upload", upload.single("product"), (req, res) => {
    if (req.file) {
        res.json({
            success: 1,
            image_url: `http://localhost:${port}/images/${req.file.filename}`
        });
    }
});

// Schema for porducts
const Product = mongoose.model("Product", {
    id: {
        type: Number,
        required: true,
    },
    name: {
        type: String,
        required: true,
    },
    image: {
        type: String,
        required: true,
    },
    category: {
        type: String,
        required: true,
    },
    new_price: {
        type: Number,
        required: true,
    },
    old_price: {
        type: Number,
        required: true,
    },
    date: {
        type: Date,
        default: Date.now,
    },
    available: {
        type: Boolean,
        default: true,
    },
})

// Adding Products to database
myapp.post("/addproduct", async (req, res) => {

    let products = await Product.find({});
    let id;

    if (products.length > 0) {
        let last_product_array = products.slice(-1);
        let last_product = last_product_array[0];
        id = last_product.id + 1;
    } else {
        id = 1;
    }

    const product = new Product({
        id: id,
        name: req.body.name,
        image: req.body.image,
        category: req.body.category,
        new_price: req.body.new_price,
        old_price: req.body.old_price,
    });
    console.log(product);
    await product.save();
    console.log("Saved");

    res.json({
        success: true,
        name: req.body.name,
    })
})

// Creating API for limiting products
myapp.post("/removeproduct", async (req, res) => {
    await Product.findOneAndDelete({ id: req.body.id })
    console.log("Removed");
    res.json({
        success: true,
        name: req.body.name
    })
})

// Creating API for getting all products
myapp.get("/allproducts", async (req, res) => {
    let products = await Product.find({})
    console.log("All Products Fetched");
    res.send(products);
})

// Schema creating for user model
const Users = mongoose.model("Users", {
    name: {
        type: String,
    },
    email: {
        type: String,
        unique: true
    },
    password: {
        type: String,
    },
    cartData: {
        type: Object,
    },
    date: {
        type: Date,
        default: Date.now,
    }
})

// Creating Endpoint for Registering user
myapp.post("/signup", async (req, res) => {
    let check = await Users.findOne({ email: req.body.email });
    if (check) {
        return res.status(400).json({ success: false, errors: "Existing User Found With Same Email Address" })
    }
    let cart = {};
    for (let i = 0; i < 300; i++) {
        cart[i] = 0;
    }
    const user = new Users({
        name: req.body.username,
        email: req.body.email,
        password: req.body.password,
        cartData: cart,
    });

    await user.save();

    const data = {
        user: {
            id: user.id
        }
    }
    const token = jwt.sign(data, 'secret_ecom');
    res.json({ success: true, token })
})

// creating endpoint for user login
myapp.post("/login", async (req, res) => {
    let user = await Users.findOne({ email: req.body.email });
    if (user) {
        const passCompare = req.body.password === user.password;
        if (passCompare) {
            const data = {
                user: {
                    id: user.id
                }
            }
            const token = jwt.sign(data, "secret_ecom");
            res.json({ success: true, token })
        }
        else {
            res.json({ success: false, errors: "Wrong Password" });
        }
    }
    else {
        res.json({ success: false, errors: "Wrong Email Id" });
    }
})

// creating end point for newcollection data
myapp.get('/newcollections', async (req, res) => {
    let products = await Product.find({});
    let newcollection = products.slice(1).slice(-8);
    console.log("New Collection Fetched");
    res.send(newcollection);
})

// creating endpoint for popular in women
myapp.get('/popularinwomen', async (req, res) => {
    let products = await Product.find({ category: "Women" });
    let popular_in_women = products.slice(0, 4);
    console.log("Popular in Women Fetched");
    res.send(popular_in_women);
})

//creating middlewarev to fetch user

const fetchUser = async (req, res, next) => {
    const token = req.header('auth-token');
    if (!token) {
        res.status(401).send({ errors: "Please authenticate using a valid token" });
    }
    else {

        try {
            const data = jwt.verify(token, 'secret_ecom');
            req.user = data.user;
            next();
        }
        catch (error) {
            res.status(401).send({ errors: "Please authenticate using a valid token" })
        }
    }
}

//creating endpoint for adding products in cartdata
myapp.post('/addtocart', fetchUser, async (req, res) => {
    console.log("Added", req.body.itemId);
    let userData = await Users.findOne({ _id: req.user.id });
    userData.cartData[req.body.itemId] = userData.cartData[req.body.itemId] + 1;
    await Users.findOneAndUpdate({ _id: req.user.id }, { cartData: userData.cartData });
    res.send("Added")
})

//creating endpoint for remove products in cartdata
myapp.post('/removefromcart', fetchUser, async (req, res) => {
    console.log("Removed", req.body.itemId)
    let userData = await Users.findOne({ _id: req.user.id });
    if (userData.cartData[req.body.itemId] > 0)
        userData.cartData[req.body.itemId] = userData.cartData[req.body.itemId] - 1;
    await Users.findOneAndUpdate({ _id: req.user.id }, { cartData: userData.cartData });
    res.send("Removed")
})

//creating endpoint for get products in cartdata
myapp.post('/getcart', fetchUser, async (req, res) => {
    console.log("Getting cart data");
    let userData = await Users.findOne({ _id: req.user.id });
    res.json(userData.cartData);
})


// Server Running
myapp.listen(port, (error) => {
    if (!error) {
        console.log("Server Running on Port " + port)
    } else {
        console.log("Error " + error);
    }
})
