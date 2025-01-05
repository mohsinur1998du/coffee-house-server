const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
dotenv.config();
const app = express();
const port = process.env.PORT || 5000;

//______________middleware

app.use(cors());
app.use(express.json());

//______________mongodb connection

const uri = process.env.MONGO_URI;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();



// _______________________created collections
    
    const database = client.db("coffeeDB");
    const coffeeCollection = database.collection("coffee");

     const userCollection = client.db("coffeeDB").collection("users");




    //  ___________________coffee api start

    //get data
    app.get("/coffee", async (req, res) => {
      try {
        const result = await coffeeCollection.find().toArray();
        res.status(200).send(result);
      } catch (error) {
        console.error("Error fetching coffee:", error);
        res.status(500).json({ error: "Failed to fetch coffee" });
      }
    });

    


    app.get("/coffee/:id" , async(req, res)=>{
      try{
        const id = req.params.id;
        const query = {_id: new ObjectId(id)}
        const result= await coffeeCollection.findOne(query);
        res.status(200).send(result);
    }catch(error){
        res.send(error.message)
    }}
  )


  app.put("/coffee/:id", async(req, res)=>{
    try {
      const id = req.params.id;
    const query = {_id: new ObjectId(id)}
    const updatedCoffee = req.body;
    
    const docInfo = {
      $set: updatedCoffee
    }
    const result = await coffeeCollection.updateOne(query, docInfo);
    res.status(200).send(result);
    } catch (error) {
        console.error("Error updating coffee:", error.message);
    }
  })


    app.post("/coffee", async (req, res) => {
      try {
        const newCoffee = req.body;
        const result = await coffeeCollection.insertOne(newCoffee);
        res.status(201).json(result);
      } catch (error) {
        console.error("Error inserting coffee:", error);
        res.status(500).json({ error: "Failed to insert coffee" });
      }
    });

    app.delete("/coffee/:id", async (req, res) => {
      const id = req.params.id;
      try {
        const query = { _id: new ObjectId(id) };
        const result = await coffeeCollection.deleteOne(query);
        res.send(result);
      } catch (error) {
        res.send(error.message);
      }
    });

// ____________________Coffee api end
    





//___________________user related apis start

app.get("/single_user", async(req, res)=>{
  
  const {email }= req.body;
  
  const result = await userCollection.findOne({email : email});
  res.json(result);
})




app.get("/users", async(req, res)=>{
  
  // const {email }= req.body;
  
  const result = await userCollection.find().toArray();
  res.json(result);
})




app.patch("/users", async(req, res)=>{
  const {lastSignInTime, email} = req.body
  const filter = {email : email};

  const updateDocument = {
    $set: {
      lastSignInTime: lastSignInTime,
    },
 };

const result = await userCollection.updateOne(filter, updateDocument);
res.send(result);
})



app.delete("/users/:id", async(req, res)=>{
  const id = req.params.id;
  const query = {_id : new ObjectId(id)};
  const result = await userCollection.deleteOne(query);
  res.status(200).json({ success: true, message: 'User deleted successfully' });
})



app.post("/users", async(req, res)=>{

    const newUser = req.body;
    console.log(newUser);


    const result = await userCollection.insertOne(newUser);
    res.json(result)

  

})







    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

//______________routes

app.get("/", (req, res) => {
  res.send("Coffee making server is running");
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
