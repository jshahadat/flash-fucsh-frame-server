const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config();
const jwt = require('jsonwebtoken');
const app = express();
const port = process.env.PORT || 5000;

// middleweare

app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.qhhqtot.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });



function verifyJWT(req, res, next) {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
        return res.status(401).send({ message: 'Unauthorized access' });
    }
    const token = authHeader.split(' ')[1];

    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, function (err, decoded) {
        if (err) {
            return res.status(403).send({ message: 'Forbidden access' });
        }
        req.decoded = decoded;
        next();
    })
}

async function run() {
    try {


        const serviceCollection = client.db('crossFitCrew').collection('services');
        const reviewsCollection = client.db('crossFitCrew').collection('reviews')



        app.post('/jwt', (req, res) => {
            const user = req.body;
            const token = jwt.sign(user, process.env.ACESS_TOKEN_SECRET, { expiresIn: '1d' })
            res.send({ token })
        })



        app.get('/service', async (req, res) => {
            const query = {}
            const cursor = serviceCollection.find(query);

            const services = await cursor.limit(3).toArray();
            res.send(services);
        });



        app.get('/services', async (req, res) => {
            const query = {}
            const cursor = serviceCollection.find(query);
            const services = await cursor.toArray();
            res.send(services);
        });







        app.post('/service', async (req, res) => {
            const servic = req.body;
            const result = await serviceCollection.insertOne(servic);
            res.send(result);
        });







        app.get('/services/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const service = await serviceCollection.findOne(query);
            res.send(service);
        });





        app.get('/reviews', async (req, res) => {

            let query = {};

            if (req.query.email) {
                query = {
                    email: req.query.email
                }
            }
            const cursor = reviewsCollection.find(query).sort({ time: -1 });
            const review = await cursor.toArray();
            res.send(review);
        });







        app.get('/editreview/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const review = await reviewsCollection.findOne(query);
            res.send(review);
        });






        app.get('/reviews/:id', async (req, res) => {
            // const query = {}
            const id = req.params.id;
            console.log(id);
            const query = { serviceId: id };

            const cursor = reviewsCollection.find(query).sort({ time: -1 });
            const reviews = await cursor.toArray();
            res.send(reviews);
        });




        // app.get('editreview/:id', async (req, res) => {
        //     const id = req.params.id;
        //     const query = { _id: ObjectId(id) };
        //     const review = await reviewsCollection.findOne(query);
        //     res.send(review);
        // })




        app.post('/reviews', async (req, res) => {
            const review = req.body;
            const result = await reviewsCollection.insertOne(review);
            res.send(result);
        });


        app.put('/editreview/:id', async (req, res) => {
            const id = req.params.id;
            const filter = { _id: ObjectId(id) };
            const user = req.body;
            console.log(user);
            const option = { upsert: true };
            const updatedUser = {
                $set: {
                    name: user.name,
                    email: user.email,
                    img: user.img,
                    title: user.title
                }
            }
            const result = await reviewsCollection.updateOne(filter, updatedUser, option);
            res.send(result);
        })


        app.delete('/reviews/:id', verifyJWT, async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const result = await reviewsCollection.deleteOne(query);
            res.send(result);
        })

    }
    finally {

    }
}
run().catch(err => console.error(err))

app.get('/', (req, res) => {
    res.send('assignment eleventh server is running');
})

app.listen(port, () => {
    console.log(`assignment port running on:${port}`);
})

