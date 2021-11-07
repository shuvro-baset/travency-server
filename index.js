const express = require('express');
const { MongoClient } = require('mongodb');
const cors = require('cors');
require('dotenv').config();
const ObjectId = require('mongodb').ObjectId;
const app = express();
const port = process.env.PORT || 5000;

// use cors into my app 
app.use(cors());
// receive json data from frontend
app.use(express.json());

// database connection url
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.oh18i.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });


async function run() {
  
    try {
      await client.connect();
      // database name
      const database = client.db("travencyDb");
      // Tours collections
      const toursCollection = database.collection("tours");
      // Booking Tour collection
      const bookingToursCollection = database.collection("bookingTours")
        
      // GET API for all tour collections
      app.get('/home', async (req, res) => {
        const cursor = toursCollection.find({});
        const tours = await cursor.toArray();
        res.send(tours);
        
      });

      // POST API for new tour
      app.post('/add-tours', async (req, res) => {
        const tours = req.body;
        console.log('hit the post api', tours);

        const result = await toursCollection.insertOne(tours);
        res.json(result)
    });

    // GET API for single tour information for booking 
      app.get('/tour-book/:id', async (req, res) => {
        const id = req.params.id;
        const query = { _id: ObjectId(id) };
        const tour = await toursCollection.findOne(query);
        res.send(tour);
      });


    // POST API for booking tour
    app.post('/tour-book', async (req, res) => {
      const tourBookingData = req.body;
      const tourBooking = await bookingToursCollection.insertOne(tourBookingData);
      console.log('load tour with id: ', res);
      res.send(tourBooking);
    })


    // GET API for single user tours
    app.get('/my-tours', async (req, res) => {
      const cursor = bookingToursCollection.find({})
      const tours = await cursor.toArray();
      res.send(tours)

    })

    // GET API for all booking tours
    app.get('/manage-all-tours', async (req, res) => {
      const cursor = bookingToursCollection.find({})
      const tours = await cursor.toArray();
      res.send(tours)
    })
     
    // DELETE API
    app.delete('/my-tours/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const result = await bookingToursCollection.deleteOne(query);
      res.json(result);
  })

    // UPDATE  API
    app.put('/update-status/:id', async (req, res) => {
      const id = req.params.id;
      // console.log('updating.... ', id)
      const status = req.body.status;
      const query = { _id: ObjectId(id) }; // filtering user's object
      const options = { upsert: true }; // update and insert

      const updateDoc = { // set data
          $set: {
              status: status
          },
      };
      const result = await bookingToursCollection.updateOne(query, updateDoc, options) // updating 
      res.json(result) // send response to frontend
    });

    } finally {
    //   await client.close();
    }
  }
  run().catch(console.dir);






app.get('/', (req, res) => {
    res.send("welcome to travency server site ..... ")
})



// listen on port 5000
app.listen(port, ()=>{
    console.log("listening on port", port);
})