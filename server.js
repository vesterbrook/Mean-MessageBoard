var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
// var session = require('express-session');
var path = require('path');

app.use(express.static(path.join(__dirname + "/static")));
app.use(bodyParser.urlencoded({extended: true}));
// app.use(session({secret: 'thorisHot'}));

app.set('views',path.join(__dirname, './views'));
app.set('view engine', 'ejs');

mongoose.connect('mongodb://localhost/messageBoard');
mongoose.Promise = global.Promise;

var Schema = mongoose.Schema;
var messageSchema = new mongoose.Schema({
    comments: [{type: Schema.Types.ObjectId, ref: 'Comment'}],
    name: {type: String, required: true, minlength: 2},
    message: {type: String, required: true, minlength:2}
})
var commentSchema = new mongoose.Schema({
    _message: {type: Schema.Types.ObjectId, ref: 'Post'},
    name: {type: String, required: true, minlength: 2},
    comment: {type: String, required: true, minlength:2}
})


mongoose.model('Message', messageSchema);
mongoose.model('Comment', commentSchema);

var Message = mongoose.model('Message')
var Comment = mongoose.model('Comment')

app.get('/', function(req, res){
    Message.find({}).populate('comments')
    .exec(function(err, messages){
    res.render("index", {"messages": messages});

    });

    });

    app.post('/createMessage', function(req,res){
        var message = new Message(req.body)
        message.save(function(err){
            if(err){
                console.log('Something went wrong');
                Message.find({}).exec(function(err, messages){
                    if(err) throw err;
                    res.render("index", {"messages": messages, errors: messages.errors})

                })
            } else {
                console.log('successfully added a message!');
                res.redirect('/')
            }

        })
    
    })
    
    app.post('/createComment/:id', function(req, res){
        Message.findOne({_id: req.params.id}, function(err, message){
            var comment = new Comment({name: req.body.name, comment: req.body.comment});
            comment._message = message._id;
            message.comments.push(comment);
            comment.save(function(err){
                message.save(function(err){
                    if(err) {
                        console.log('Something went wrong!');
                        Message.find({}).exec(function(err, messages){
                            if(err) throw err;
                            res.render("index", {"messages": messages, errors: messages.errors})

                        })
                    }
                    else {
                        console.log('successfully added a comment');
                        res.redirect('/');
                    }
                });
            });
        });
    });
    
app.listen(8000, function(){
    console.log("listening on port 8000");
})
