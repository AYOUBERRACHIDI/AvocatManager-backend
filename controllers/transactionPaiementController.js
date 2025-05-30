const TransactionPaiement = require('../models/TransactionPaiement');

exports.getAllTransactionsPaiement = async (req, res) => {
  try {
    const transactions = await TransactionPaiement.find().populate('paiement_id');
    res.status(200).json(transactions);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching transactionsPaiement', error });
  }
};

exports.getTransactionPaiementById = async (req, res) => {
  try {
    const transaction = await TransactionPaiement.findById(req.params.id).populate('paiement_id');
    if (!transaction) return res.status(404).json({ message: 'TransactionPaiement not found' });
    res.status(200).json(transaction);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching transactionPaiement', error });
  }
};

exports.createTransactionPaiement = async (req, res) => {
  try {
    const transaction = new TransactionPaiement(req.body);
    await transaction.save();
    res.status(201).json(transaction);
  } catch (error) {
    res.status(400).json({ message: 'Error creating transactionPaiement', error });
  }
};

exports.updateTransactionPaiement = async (req, res) => {
  try {
    const transaction = await TransactionPaiement.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    }).populate('paiement_id');
    if (!transaction) return res.status(404).json({ message: 'TransactionPaiement not found' });
    res.status(200).json(transaction);
  } catch (error) {
    res.status(400).json({ message: 'Error updating transactionPaiement', error });
  }
};

exports.deleteTransactionPaiement = async (req, res) => {
  try {
    const transaction = await TransactionPaiement.findByIdAndDelete(req.params.id);
    if (!transaction) return res.status(404).json({ message: 'TransactionPaiement not found' });
    res.status(200).json({ message: 'TransactionPaiement deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting transactionPaiement', error });
 

 };
};