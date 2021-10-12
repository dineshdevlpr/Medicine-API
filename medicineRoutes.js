const express = require('express')
const router = require("express").Router();
const mongodb = require("mongodb").MongoClient;
var randomstring = require("randomstring");
require("dotenv").config();
const multer  = require('multer');
// var path = require('path');
var csv = require('csvtojson');

const dbURL = process.env.DB_URL

var storage = multer.diskStorage({  
    destination:(req,file,cb)=>{  
        cb(null,'./uploads');  
    }
  });  
  
  var uploads = multer({storage:storage});  
  
  var app = express();


//   upload csvFile to upload the data into database
  router.post("/uploadCSV", uploads.single("csvFile"), async (req, res) => {
  
      //convert csvfile to json data
      csv()
        .fromFile(req.file.path)
        .then((csvData) => {
            mongodb.connect(
                dbURL,
                { useNewUrlParser: true, useUnifiedTopology: true },
                (err, client) => {
                  if (err) throw err;
          
                  client
                    .db("Medical-App")
                    .collection("medicines")
                    .insertMany(csvData, (err, res) => {
                      if (err) throw err;
          
                      console.log(`Inserted: ${res.insertedCount} rows into mongoDB database`);
                      client.close();
                    });
                }
              );
        });
    })


    // search using particular string i.e., searchString
    router.get('/searchMedicine/:searchString', async (req, res) => {
        try {
            let client = await mongodb.connect(dbURL);
            let db = client.db("Medical-App");
            let data = db.collection("medicines").find({
                $text:
                  {
                    $search: req.params.searchString,
                    $language: "none",
                    $caseSensitive: false,
                    $diacriticSensitive: false
                  }
              });
            if (data) {
                res.status(200).json(data.c_name);
            } else {
                res.status(404).json({ message: "No Data Found" })
            }
            client.close();
        } catch (error) {
            console.log(error)
            res.status(500)
        }
    
    })

    // router.get('/searchMedicine/:searchString', async (req, res) => {
    //     try {
    //         let client = await mongodb.connect(dbURL);
    //         let db = client.db("Medical-App");
    //         let data = db.collection("medicines").find({ sku: { $regex: /^req.params.searchString/i } });
    //         if (data) {
    //             res.status(200).json(data.c_name);
    //         } else {
    //             res.status(404).json({ message: "No Data Found" })
    //         }
    //         client.close();
    //     } catch (error) {
    //         console.log(error)
    //         res.status(500)
    //     }
    
    // })

    

    // get data using unique code
    router.get('/getMedicineDetails/:uniqueID', async (req, res) => {
        try {
            let client = await mongodb.connect(dbURL);
            let db = client.db("Medical-App");
            let data = db.collection("medicines").find({c_unique_code:req.params.uniqueID});
            if (data) {
                res.status(200).json(data);
            } else {
                res.status(404).json({ message: "No Data Found" })
            }
            client.close();
        } catch (error) {
            console.log(error)
            res.status(500)
        }
    
    })



    // placing order
    router.post("/placeorder", async (req, res) => {
    try {
        let orderId = randomstring.generate()
      let client = await mongodb.connect(dbURL);
      let db = client.db("Medical-App");
      await db.collection("orders").insertOne({ orderID : orderId , c_unique_code: req.body.c_unique_code , quantity: req.body.quantity , c_name: req.body.c_name });
  
        if(res.status = 200){
            console.log("Order Successfully Placed")
        }else {
            console.log("Order did not Placed")
      }
    } catch (err) {
      console.log(err);
      res.sendStatus(500);
    }
  });




    // created for checking purpose

    // router.get('/all', async (req, res) => {
    //     try {
    //         let client = await mongodb.connect(dbURL);
    //         let db = client.db("Medical-App");
    //         let data = db.collection("medicines").find();
    //         if (data) {
    //             res.status(200).json(data);
    //         } else {
    //             res.status(404).json({ message: "No Data Found" })
    //         }
    //         client.close();
    //     } catch (error) {
    //         console.log(error)
    //         res.status(500)
    //     }
    
    // })



module.exports = router;