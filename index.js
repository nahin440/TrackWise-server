require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const cron = require('node-cron');
const nodemailer = require('nodemailer');

const app = express();
app.use(cors({ origin: "http://localhost:5173", credentials: true }));
app.use(express.json());

const port = process.env.PORT || 5000;

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
        const expensesCollection = client.db("taskManagerDB").collection("expenses");
        const budgetCollection = client.db("taskManagerDB").collection("budgets");

        // Reminder Email Configuration
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS,
            }
        });
















        const currentTime = new Date();
const tasks = await tasksCollection.find({ reminder: true, emailSent: false }).toArray();

for (const task of tasks) {
    const [hours, minutes] = task.reminderTime.split(':');
    const reminderDate = new Date();
    reminderDate.setHours(hours, minutes, 0, 0);

    // Convert all times to UTC
    const currentTimeUTC = new Date(currentTime.toUTCString());
    const reminderThresholdUTC = new Date(reminderDate.getTime() - 10 * 60000);

    console.log(`Current Time: ${currentTimeUTC}`);
    console.log(`Reminder Time: ${reminderDate}`);
    console.log(`Reminder Threshold: ${reminderThresholdUTC}`);

    if (currentTimeUTC >= reminderThresholdUTC && currentTimeUTC < reminderDate) {
        try {
            await transporter.sendMail({
                from: '"Task Manager" <your-email@gmail.com>',
                to: task.email,
                subject: `Reminder: ${task.title}`,
                text: `Hi ${task.displayName},\n\nThis is a reminder for your task "${task.title}" due at ${task.reminderTime}.\n\nTask Manager Team`
            });

            await tasksCollection.updateOne(
                { _id: new ObjectId(task._id) },
                { $set: { emailSent: true } }
            );
            console.log(`Email sent for task: ${task.title}`);
        } catch (error) {
            console.error('Error sending email:', error);
        }
    }
}






















        // Run a cron job every minute to check for reminders
        cron.schedule('* * * * *', async () => {
            console.log('Cron job running at:', new Date().toLocaleTimeString());

            try {
                const currentTime = new Date();
                const tasks = await tasksCollection.find({ reminder: true, emailSent: false }).toArray();

                for (const task of tasks) {
                    const [hours, minutes] = task.reminderTime.split(':');
                    const reminderDate = new Date();
                    reminderDate.setHours(hours, minutes, 0, 0);

                    // Calculate 10 minutes before reminder time
                    const reminderThreshold = new Date(reminderDate.getTime() - 10 * 60000);

                    if (currentTime >= reminderThreshold && currentTime < reminderDate) {
                        await transporter.sendMail({
                            from: '"Task Manager" <your-email@gmail.com>',
                            to: task.email,
                            subject: `Reminder: ${task.title}`,
                            text: `Hi ${task.displayName},\n\nThis is a reminder for your task "${task.title}" due at ${task.reminderTime}.\n\nTask Manager Team`
                        });

                        // Mark email as sent
                        await tasksCollection.updateOne(
                            { _id: task._id },
                            { $set: { emailSent: true } }
                        );
                    }
                }
            } catch (error) {
                console.error('Error in reminder service:', error);
            }
        });

        // Task CRUD operations
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
                res.status(500).send({ message: "Internal Server Error" });
            }
        });

        app.delete("/tasks/:id", async (req, res) => {
            try {
                const taskId = req.params.id;
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
                res.status(500).send({ message: "Internal Server Error" });
            }
        });

        app.put("/tasks/:id", async (req, res) => {
            try {
                const taskId = req.params.id;
                if (!ObjectId.isValid(taskId)) {
                    return res.status(400).json({ success: false, message: "Invalid task ID" });
                }

                const updatedTask = req.body;
                const existingTask = await tasksCollection.findOne({ _id: new ObjectId(taskId) });

                if (!existingTask) {
                    return res.status(404).json({ success: false, message: "Task not found" });
                }

                if (existingTask.reminderTime !== updatedTask.reminderTime) {
                    updatedTask.emailSent = false;
                }

                const result = await tasksCollection.updateOne(
                    { _id: new ObjectId(taskId) },
                    { $set: updatedTask }
                );

                if (result.modifiedCount === 1) {
                    return res.status(200).json({ success: true, message: "Task updated successfully" });
                } else {
                    return res.status(404).json({ success: false, message: "Task not found or no changes made" });
                }
            } catch (error) {
                return res.status(500).json({ success: false, message: "Internal Server Error" });
            }
        });

        // Expense CRUD operations
        app.post("/expenses", async (req, res) => {
            try {
                const expenseData = req.body;
                const result = await expensesCollection.insertOne(expenseData);
                res.send(result);
            } catch (error) {
                res.status(500).send({ message: "Internal Server Error" });
            }
        });

        app.get("/expenses", async (req, res) => {
            try {
                const expenses = await expensesCollection.find().toArray();
                res.send(expenses);
            } catch (error) {
                res.status(500).send({ message: "Internal Server Error" });
            }
        });

        // Budget endpoints
        app.post('/budget', async (req, res) => {
            try {
                const budgetData = req.body;
                const query = { email: budgetData.email };
                const update = { $set: budgetData };
                const options = { upsert: true };

                const result = await budgetCollection.updateOne(query, update, options);
                res.send(result);
            } catch (error) {
                res.status(500).send({ message: "Internal Server Error" });
            }
        });

        // app.put('/budget', async (req, res) => {
            
        //     try {
        //         const budgetData = req.body;
        //         const filter = { email: budgetData.email };
        //         const update = { $set: budgetData };

                const result = await budgetCollection.updateOne(filter, update);
                res.send(result);
            } catch (error) {
                res.status(500).send({ message: "Internal Server Error" });
            }
        });

        app.get('/budget', async (req, res) => {
            try {
                const email = req.query.email;
                const result = await budgetCollection.findOne({ email: email });
                res.send(result);
            } catch (error) {
                res.status(500).send({ message: "Internal Server Error" });
            }
        });

    } catch (error) {
        console.error("Database connection error:", error);
    }
}

run().catch(console.dir);

app.listen(port, () => {
    console.log(`Task manager is running at : ${port}`);
});
