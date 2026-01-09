const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const express = require("express");
const cors = require("cors");
require("dotenv").config();
const port = process.env.PORT || 3000;

const app = express();
app.use(cors());
// app.use(
//   cors({
//     origin: [
//       "https://rentwheels-frontend.netlify.app", // frontend production URL
//       "http://localhost:5173", // local dev
//     ],
//     credentials: true,
//   })
// );
app.use(express.json());

const uri = process.env.MONGODB_URI;

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    await client.connect();

    const database = client.db("carRental");
    const carServices = database.collection("services");
    const bookingsCollection = database.collection("bookings");

    app.post("/cars", async (req, res) => {
      const car = req.body;
      console.log(car);
      const result = await carServices.insertOne(car);
      res.send(result);
    });

    //get services from data
    app.get("/services", async (req, res) => {
      const { category } = req.query;
      const query = {};
      if (category) {
        query.category = category;
      }
      const result = await carServices.find(query).toArray();
      res.send(result);
    });

    //Featured Cars
    app.get("/featured", async (req, res) => {
      const { category } = req.query;
      const query = {};
      if (category) {
        query.category = category;
      }
      const result = await carServices
        .find(query)
        .sort({ createdAt: -1 })
        .limit(6)
        .toArray();
      res.send(result);
    });

    // app.get('/services/:id', async(req, res) => {
    //     const id = req.params.id;
    //     const query = {_id: new ObjectId(id)};
    //     const result = await carServices.findOne(query);
    //     res.send(result);
    // })

    app.get("/myListings/:id", async (req, res) => {
      const id = req.params.id;
      console.log("getting specific listing", id);
      const query = { _id: new ObjectId(id) };
      console.log(query);
      const result = await carServices.findOne(query);
      res.send(result);
    });

    app.get("/myBookings/:id", async (req, res) => {
      const id = req.params.id;
      console.log("getting specific booking", id);
      const query = { _id: new ObjectId(id) };
      console.log(query);
      const result = await carServices.findOne(query);
      res.send(result);
    });

    app.get("/myListings", async (req, res) => {
      const { email } = req.query;
      const query = { email: email };
      const result = await carServices.find(query).toArray();
      res.send(result);
    });
    // app.get('/myBookings', async (req, res) => {
    //   const {email} = req.query;
    //   const query = {email: email}
    //   const result = await carServices.find(query).toArray();
    //   res.send(result);
    // })

    //Update booking
    app.put("/update/:id", async (req, res) => {
      const updatedListing = req.body;
      const id = req.params;
      console.log("updating listing", updatedListing);
      const query = { _id: new ObjectId(id) };
      const updateListing = {
        $set: updatedListing,
      };
      const result = await carServices.updateOne(query, updateListing);
      res.send(result);
    });

    //delete
    app.delete("/delete/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await carServices.deleteOne(query);
      res.send(result);
    });

    app.delete("/delete/booking/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await bookingsCollection.deleteOne(query);
      res.send(result);
    });

    //post a order/booking
    app.post("/bookings", async (req, res) => {
      const data = req.body;
      const { productId: id } = data;
      console.log("booking data: ", data);
      const existing = await bookingsCollection.findOne({ productId: id });
      console.log("existing booking: ", existing);
      if (existing) {
        console.log("Booking already exists for this productId:", id);
        return res.status(409).send({
          success: false,
          message: "This car is already booked",
        });
      }
      console.log("after the block");
      const result = await bookingsCollection.insertOne(data);
      res.status(201).send({
        success: true,
        message: "Booking successful",
        insertedId: result.insertedId,
      });
    });

    //get bookings/orders for a person
    app.get("/mybookings", async (req, res) => {
      const { email } = req.query;
      if (!email) return res.send([]);

      const bookings = await bookingsCollection
        .find({ renterEmail: email })
        .toArray();
      res.send(bookings);
    });

    //bookings with unique id
    app.get("/bookingscheck", async (req, res) => {
      const { id } = req.query;
      let query = {};
      if (id) {
        query = { productId: id };
      }
      const bookings = await bookingsCollection.find(query).toArray();
      res.send(bookings);
    });
    // app.get("/bookings/:email", async (req, res) => {
    //   const {email} = req.params;
    //   const query = { renterEmail : email };
    //   const result = await bookingsCollection.findOne(query).toArray();
    //   res.send(result);
    // });

    //get distinct bookings/orders
    // app.get("/bookings/car/:carId", async (req, res) => {
    //   const carId = req.params.id;

    //   try{
    //     const booking = await bookingsCollection.findOne({ productId: carId});

    //     res.send(booking);
    //   }
    //   catch(err)
    //   {
    //     console.error(err);
    //     res.status(500).send({message: 'Internal Server Error'});
    //   }
    // });

    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // await client.close();
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Hello, World!");
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
