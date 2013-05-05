var express = require('express'),
    mongoose = require('mongoose'),
    config = require('./config'),
    app = module.exports = express.createServer(),
    invitation = require('./models/invitation.js'),
    vote = require('./models/vote.js'),
    ejsMiddleware = require('ejs-middleware');
   
app.use(express.bodyParser());
mongoose.connect(config.creds.mongoose_auth);

var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function callback() {
    // yay!
});

var invitationSchema = new mongoose.Schema({
    title: String,
    choices: [{ id: Number, displayText: String}],
    votes: [{ name: String, choices: []}]
});

var Invitation = mongoose.model('Invitation', invitationSchema)
var ObjectId = mongoose.Types.ObjectId;

app.get('/invitations/:id', function (req, res) {
    var myId = ObjectId(req.params.id);
    var result = Invitation.findById(myId, function (err, result) {
        result ? res.send(result)
       : res.send(404);
    });
});

app.post('/invitations', function (req, res) {
    var tranInvitation = new invitation(req.body);
    var newInvitation = new Invitation(tranInvitation);
    newInvitation.save(function () {
        res.header('Location', 'http://' + req.headers.host + app.set('basepath') + req.url + '/' + newInvitation.id);
        res.send({ id: newInvitation.id }, 201);
    });

});

app.post('/invitations/:id/votes', function (req, res) {
    var myId = ObjectId(req.params.id);
    var result = Invitation.findById(myId, function (err, invitation) {
        if (invitation) {
            invitation.votes.push(new vote(req.body));
            invitation.save(function () {
                app.emit('invitationUpdate', invitation);
                res.send(200);
            });
        }
        else {
            res.send(404);
        }
    });
});

/*

http://stackoverflow.com/questions/5024787/update-model-with-mongoose-express-nodejs
http://stackoverflow.com/questions/12664008/mongoose-upserting-documents-with-nested-models?rq=1

//partially working vote implementation
app.post('/invitations/:id/votes', function (req, res) {
    var myId = ObjectId(req.params.id);
    var result = Invitation.findById(myId, function (err, invitation) {
        if (invitation) {
            invitation.votes = new vote(req.body);
            invitation.save(function () {
                app.emit('invitationUpdate', invitation);
                res.send(200);
            });
        }
        else {
            res.send(404);
        }
    });

});

app.post('/invitations/:id/votes', function (req, res) {
    var myId = ObjectId(req.params.id);
    var myVote = new vote(req.body);
    var result = Invitation.findById(myId, function (err, invitation) {
        if (invitation) {
            invitation.votes.push({
                votes: myVote
            });
            invitation.save(function () {
                app.emit('invitationUpdate', invitation);
                res.send(200);
            });
        }
        else {
            res.send(404);
        }
    });
});
app.post('/invitations/:id/votes', function (req, res) {
    var myId = ObjectId(req.params.id);
    var result = Invitation.findById(myId, function (err, invitation) {
        if (invitation) {
            var myVote = new vote(req.body);
            invitation.update({ _id: invitation._id }, { $push: { "votes": myVote} }, function (err, numAffected, rawResponse) {
                app.emit('invitationUpdate', invitation);
                res.send(200);
            });
        }
        else {
            res.send(404);
        }
    });
});



var firstInvitation = new Invitation({ title: 'Coming for badminton this friday?', choices: [{id: 1, displayText:'Yes'}, {id: 2, displayText:'No'}] });
console.log(firstInvitation.title + ", " + firstInvitation.id + ", " + firstInvitation.choices[0].displayText) // 'invitations'

 firstInvitation.save(function () {
    //res.send(req.body);
    console.log(firstInvitation.title + ", " + firstInvitation.id + ", " + firstInvitation.choices[0].displayText) // 'invitations'
  });

  app.get('/invitations/:id', function(req, res) {
    var result = db.load(req.params.id);
    result ? res.send(result)
           : res.send(404);
});

app.post('/invitations', function(req, res) {
    var newInvitation = new invitation(req.body);
    //db.save(newInvitation);

    res.header('Location', 'http://' + req.headers.host + app.set('basepath') + req.url + '/' + newInvitation.id)
    res.send({ id: newInvitation.id }, 201);
});

app.post('/invitations/:id/votes', function(req, res) {
    var invitation = db.load(req.params.id);
    if (invitation) {
        invitation.votes.push(new vote(req.body));
        db.save(invitation);
        app.emit('invitationUpdate', invitation);
        res.send(200);
    } else {
        res.send(404);
    }
});


// ----
// Add test data for demo
db.save(new invitation(
    { title: 'Stockholm Node.js user group dinner - June 2012', choices: [{ displayText: 'Tue 12th' }, { displayText: 'Wed 13th' }, { displayText: 'Thu 14th' }, { displayText: 'Fri 15th' }] }, 
    'test' // ID
));
*/