require('dotenv').config()
const express = require('express');
const cors = require('cors');
const app = express();

const port = process.env.PORT || 5000;
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');


app.use(cors({ origin: "http://localhost:5173", credentials: true }));

// app.use(cors());
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







        app.delete("/tasks/:id", async (req, res) => {
            try {
                const taskId = req.params.id;
        
                // Validate ObjectId
                if (!ObjectId.isValid(taskId)) {
                    return res.status(400).send({ success: false, message: "Invalid task ID" });
                }
        
                const result = await tasksCollection.deleteOne({ _id: new ObjectId(taskId) });
        
                if (result.deletedCount === 1) {
                    res.send({ success: true, message: "Task deleted successfully" });
                } else {
                    res.status(404).send({ success: false, message: "Task not found" });
                }
            } catch (error) {
                console.error("Error deleting task:", error);
                res.status(500).send({ message: "Internal Server Error" });
            }
        });
        







        
        app.put("/tasks/:id", async (req, res) => {
            try {
                const taskId = req.params.id;
        
                if (!ObjectId.isValid(taskId)) {
                    return res.status(400).send({ success: false, message: "Invalid task ID" });
                }
        
                const updatedTask = req.body;
        
                const result = await tasksCollection.updateOne(
                    { _id: new ObjectId(taskId) },
                    { $set: updatedTask }
                );
        
                if (result.modifiedCount === 1) {
                    res.send({ success: true, message: "Task updated successfully" });
                } else {
                    res.status(404).send({ success: false, message: "Task not found or no changes made" });
                }
            } catch (error) {
                console.error("Error updating task:", error);
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