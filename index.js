require('dotenv').config()
const express = require('express');
const cors = require('cors');
const app = express();

const port = process.env.PORT || 5000;
const { MongoClient, ServerApiVersion } = require('mongodb');


app.use(cors());
app.use(express.json());








const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.slbhc.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
// const client = new MongoClient(uri, {
//     serverApi: {
//         version: ServerApiVersion.v1,
//         strict: true,
//         deprecationErrors: true,
//     }
// });

// async function run() {
//     try {

//         // Connect the client to the server	(optional starting in v4.7)
//         await client.connect();
//         // Send a ping to confirm a successful connection


//         const tasksCollection = client.db("taskManagerDB").collection("tasks");

//         app.post("/tasks", async (req, res) => {
//             const taskData = req.body;
//             const result = await tasksCollection.insertOne(taskData);
//             res.send(result);
//         });



//         await client.db("admin").command({ ping: 1 });
//         console.log("Pinged your deployment. You successfully connected to MongoDB!");
//     } finally {
//         // Ensures that the client will close when you finish/error
//         // await client.close();
//     }
// }





// async function run() {
//     try {
//         // Connect to MongoDB before defining routes
//         await client.connect();
//         console.log("Connected to MongoDB!");

//         const tasksCollection = client.db("taskManagerDB").collection("tasks");

//         app.post("/tasks", async (req, res) => {
//             try {
//                 const taskData = req.body;
//                 const result = await tasksCollection.insertOne(taskData);
//                 res.send(result);
//             } catch (error) {
//                 console.error("Error inserting task:", error);
//                 res.status(500).send({ message: "Internal Server Error" });
//             }
//         });

//     } catch (error) {
//         console.error("Error connecting to MongoDB:", error);
//     }
// }

// run();








// run().catch(console.dir);



















const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

async function run() {
    try {
        await client.connect(); // Keep connection open
        console.log("Connected to MongoDB!");

        const tasksCollection = client.db("taskManagerDB").collection("tasks");

        app.post("/tasks", async (req, res) => {
            try {
                const taskData = req.body;
                const result = await tasksCollection.insertOne(taskData);
                res.send(result);
            } catch (error) {
                console.error("Error inserting task:", error);
                res.status(500).send({ message: "Internal Server Error" });
            }
        });

    } catch (error) {
        console.error("Error connecting to MongoDB:", error);
    }
}
run();












































app.get('/', (req, res) => {
    res.send('Student Task Manager is Running')
})

app.listen(port, () => {
    console.log(`Task manager is running at : ${port}`)
})