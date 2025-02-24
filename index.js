require('dotenv').config()
const express = require('express');
const cors = require('cors');
const app = express();

const port = process.env.PORT || 5000;
const { MongoClient, ServerApiVersion } = require('mongodb');


app.use(cors());
app.use(express.json());








const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.slbhc.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;





const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

async function run() {
    try {
        await client.connect(); 
        console.log("Connected to MongoDB!");

        const tasksCollection = client.db("taskManagerDB").collection("tasks");



        app.get("/tasks", async (req, res) => {
            const tasks = await tasksCollection.find().toArray();
            res.send(tasks);
        });
        

    

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