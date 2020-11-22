'use strict';
const path = require('path');
const tf = require('@tensorflow/tfjs-node');

const SKIN_CLASSES = {
    0: 'akiec, Actinic Keratoses',
    1: 'bcc, Basal Cell Carcinoma',
    2: 'bkl, Benign Keratosis',
    3: 'df, Dermatofibroma',
    4: 'mel, Melanoma',
    5: 'nv, Melanocytic Nevi',
    6: 'vasc, Vascular skin lesion'
  
  };

const multer = require("multer");
const storage = multer.memoryStorage(); 
const upload = multer({ storage: storage }).single('file');

exports.detection = async function(req, res) {
    console.log("file://" + path.join(__dirname, "../models/model.json"));

    upload(req, res, err => {
        detect(req, res, err);
    });
}

async function detect(req, res, err) {
    if (!req.file){
        return res.json({ "success": "False", "Message": "No Image Uploaded" });
    }

    var model = await tf.loadLayersModel("file://" + path.join(__dirname, "../models/model.json"));
    var image  = req.file;
    console.log(image);
    var tensor = tf.node.decodeImage(image.buffer)
    .resizeNearestNeighbor([224,224])
    .toFloat();
    
    
    var offset = tf.scalar(127.5);
    
    tensor = tensor.sub(offset)
    .div(offset)
    .expandDims();

    let predictions = await model.predict(tensor).data();
    let top3 = Array.from(predictions)
        .map(function (p, i) { // this is Array.map
            return {
                probability: p,
                className: SKIN_CLASSES[i] // we are selecting the value from the obj
            };
                
            
        }).sort(function (a, b) {
            return b.probability - a.probability;
                
        }).slice(0, 3);
    
    return res.json({"top_3" : top3});
}