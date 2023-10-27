const express = require('express');
const { MongoClient } = require('mongodb');
const cors = require('cors'); // Import the cors middleware
const app = express();
const url = "mongodb://127.0.0.1:27017/";
const client = new MongoClient(url);

const port = 3001;

// Use the cors middleware to enable cross-origin requests
app.use(express.json());
app.use(cors());


client.connect().then(() => {
    console.log('Connected to MongoDB');
}).catch(err => {
    console.error('MongoDB connection error:', err);
});

app.get('/candidates', async (req, res) => {
    const candidates = await getCandidates();
    res.json(candidates);
});

app.get('/candidates/ballots', async (req, res) => {
    const candidatesWithBallots = await getCandidatesWithBallots();
    res.json(candidatesWithBallots);
});

app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});

async function getCandidates() {
    let values = [];
    console.log('getCandidates');   
    const database = client.db('voting'); 
    const candidates = database.collection('candidates');
    const cursor = candidates.find({}).sort({ name: 1}); 
    while ( await cursor.hasNext()) {
        values.push( await cursor.next());
    }
    return values;
}
async function getCandidatesWithBallots() {

    let values = []; //STUB: write me

    const database = client.db('voting');
    const candidates = database.collection('candidates');
    const ballots = database.collection('voters');
    const cursor = candidates.find({}).sort( { name: 1});
    while ( await cursor.hasNext()) {
        let thisCandidate = await cursor.next();
        const query = { "ballot.name":thisCandidate.name };
        const matchingVotes = await ballots.countDocuments( query );
         values.push( { "_id":thisCandidate._id, "name": thisCandidate.name+ ' '+matchingVotes, "ballots": matchingVotes});
    }
    const query2 ={ "ballot": null};
    const matchingVotes = await ballots.countDocuments(query2);
    values.push( { "_id":0, "name":"not voted", "ballots": matchingVotes });
    return values;
}
