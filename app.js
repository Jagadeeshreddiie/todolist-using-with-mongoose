const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require('mongoose');
const _ = require('lodash');


const app = express();
app.use(bodyParser.urlencoded({ extended: true }));
app.set('view engine', 'ejs');
app.use(express.static('public'));
mongoose.connect("mongodb+srv://Jagadeesh:jagadeesh@cluster0.ddgzpxz.mongodb.net/todolist");

//schema

const itemsSchema = {
    name: 'String'
};

//model with todo as collection as name
const todo = mongoose.model('todo', itemsSchema);

//creating documents using the above model
const doc1 = new todo({
    name: 'Welcome to the Todo-list'
});
const doc2 = new todo({
    name: 'Press + to add a new item'
});
const doc3 = new todo({
    name: 'press <-- to delete the item'
});

const todoitems = [doc1, doc2, doc3];

const listSchema = {
    name: 'String',
    listitems: [itemsSchema]
};

const List = mongoose.model('list', listSchema);
// Main root for main page


app.get('/', function (req, res) {
    //if there is no repeated default items in the database, then insert or else display the default items..
    todo.find({}, function (err, item) {
        if (item.length === 0) {
            todo.insertMany(todoitems, function (err) {
                if (err) {
                    console.log('error occured in inserting')
                }
                else {
                    console.log('successful inserting default items..')
                }
            });
            res.redirect('/');
        }
        else {
            res.render('list', { listhead: "Today", listitem: item });
        }
    });
});

app.post('/', function (req, res) {
    var inputres = _.capitalize(req.body.inputitem);
    var buttonres = req.body.button;
    
    if (inputres != '') {
        const dbitem = new todo({
            name: inputres
        });
        if (buttonres === 'Today') {
            dbitem.save();
            res.redirect('/');
        }
        else {
            List.findOne({ name: buttonres }, function (err, result) {
                result.listitems.push(dbitem);
                result.save();
                console.log('success in pushing');
                res.redirect('/' + buttonres);
            });

        }
    }
    else {
        res.redirect('/');
    }

})

app.post('/delete', function (req, res) {
    const itemid = req.body.checkbox;
    const listname = req.body.listname;
    if (listname === 'Today') {
        todo.findByIdAndDelete(itemid, function (err) {
            if (err) {
                console.log('error in deleting');
            }
            else {
                console.log('succesful in deleting');
                res.redirect('/');
            }
        });
    }
    else{
        List.findOneAndUpdate({name:listname},{$pull:{listitems:{_id:itemid}}},function(err,result){
            if(!err){
                console.log('successfully updated')
                res.redirect('/'+listname)
            }
        });
    }
});

app.get('/:dynamic', function (req, res) {
    const listParam = _.capitalize(req.params.dynamic);
    List.findOne({ name: listParam }, function (err, result) {
        if (!err) {
            if (!result) {
                const list = new List({
                    name: listParam,
                    listitems: todoitems
                });
                list.save();
                res.redirect('/' + listParam);
            }
            else {
                res.render('list', { listhead: result.name, listitem: result.listitems });
            }
        }
    });

});

app.get('/about', function (req, res) {
    res.render('about');
});
app.listen(3000, function () {
    console.log("server started at 3000..")
});














// app.post('/', function (req, res) {
//     var item = req.body.item;
//     if (item != ''){
//         if (req.body.button === 'New List') {
//             const dbitem=new todo({
//                 name:item
//             });
//             dbitem.save();
//             // newitems.push(item);
//             res.redirect('/work');
//         }
//         else {
//             const dbitem=new todo({
//                 name:item
//             });
//             dbitem.save();
//             // items.push(item);
//             res.redirect('/');
//         }
//     }
//     else if (req.body.button === 'New List'){
//         res.redirect('/work');
//     }
//     else{
//         res.redirect('/');
//     }
// });



// workList page route

// app.get('/work', function (req, res) {
//     res.render('list', { listhead: 'New List', listitem: item });
// });

// about section route

