const mongoose = require('mongoose');

const hdAddressIndexSchema = new mongoose.Schema({
  // Single document to track last used index
  lastUsedIndex: {
    type: Number,
    default: -1,
    required: true,
  },
  network: {
    type: String,
    enum: ['mainnet', 'testnet', 'shasta', 'nile'],
    default: 'testnet',
    unique: true,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Ensure only one document exists
hdAddressIndexSchema.statics.getOrCreate = async function(network = 'mainnet') {
  let indexDoc = await this.findOne({ network });
  if (!indexDoc) {
    indexDoc = new this({ network, lastUsedIndex: -1 });
    await indexDoc.save();
  }
  return indexDoc;
};

module.exports = mongoose.model('HDAddressIndex', hdAddressIndexSchema);
