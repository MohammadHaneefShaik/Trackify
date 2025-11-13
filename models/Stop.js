const mongoose = require('mongoose');

const stopSchema = new mongoose.Schema({
  busId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Bus',
    required: true
  },
  stopName: {
    type: String,
    required: true
  },
  latitude: {
    type: Number,
    required: true
  },
  longitude: {
    type: Number,
    required: true
  },
  order: {
    type: Number,
    required: true
  }
});


const stopModel = mongoose.model('stops', stopSchema);
module.exports = stopModel;
