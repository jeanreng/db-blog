const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const _ = require("lodash");
require("dotenv").config(); 
const mongoose = require("mongoose");
const srvr = process.env.N1_KEY; 
const srvrCred = process.env.N1_SECRET; 
const dbName = "db-blog";
const mongoDB = `mongodb+srv://${srvr}:${srvrCred}@cluster0.8wcz7kl.mongodb.net/${dbName}?retryWrites=true&w=majority`;

const homeStartingContent = "Lacus";
const aboutContent = "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.";
const contactContent = "Scelerisque.";

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

mongoose.connect(mongoDB, {useNewUrlParser: true, useUnifiedTopology: true})
  .then(() => {
    console.log("Connected to MongoDB");
  })
  .catch((err) => {
    console.log("Error connecting to MongoDB: ", err);
  });

const postSchema = {
  title: String,
  content: String
};

const Post = mongoose.model("Post", postSchema);

app.get("/", async function(req, res){
  try {
    const posts = await Post.find({});
    res.render("home", {
      startingContent: homeStartingContent,
      posts: posts
    });
  } catch (err) {
    console.log("Error retrieving posts: ", err);
    res.status(500).send("Error retrieving posts");
  }
});

app.get("/about", function(req, res){
  res.render("about", {aboutContent: aboutContent});
});

app.get("/contact", function(req, res){
  res.render("contact", {contactContent: contactContent});
});

app.get("/compose", function(req, res){
  res.render("compose");
});

app.post("/compose", async function(req, res){
  const post = new Post({
    title: req.body.postTitle,
    content: req.body.postBody
  });

  try {
    await post.save();
    res.redirect("/");
  } catch (err) {
    console.log("Error saving post: ", err);
    res.status(500).send("Error saving post");
  }
});

app.get("/posts/:postId", async function(req, res){
  const requestedPostId = req.params.postId;
  Post.findOne({_id: requestedPostId}, function(err, post){
    res.render("post", {
      title: post.title,
      content: post.content
    });
  });
});

app.listen(process.env.PORT || 3000, function() {
  console.log(`Server started on port ${process.env.PORT}`);
});
