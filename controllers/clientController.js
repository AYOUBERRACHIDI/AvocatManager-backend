const Client = require('../models/Client');
const AffaireClient = require('../models/AffaireClient');

exports.getAllClients = async (req, res) => {
  try {
    const clients = await Client.aggregate([
      { $match: { avocat_id: req.avocat._id } },
      {
        $lookup: {
          from: 'affaireclients', 
          localField: '_id',
          foreignField: 'client_id',
          as: 'affaires',
        },
      },
      {
        $addFields: {
          totalAffairs: { $size: '$affaires' }, 
        },
      },
      {
        $lookup: {
          from: 'affaireclients',
          localField: '_id',
          foreignField: 'client_id',
          as: 'affaires',
          pipeline: [
            {
              $lookup: {
                from: 'affaires',
                localField: 'affaire_id',
                foreignField: '_id',
                as: 'affaire_id',
              },
            },
            { $unwind: '$affaire_id' },
            {
              $project: {
                affaire_id: {
                  titre: 1,
                  description: 1,
                  statut: 1,
                },
              },
            },
          ],
        },
      },

      {
        $project: {
          nom: 1,
          CIN: 1,
          telephone_1: 1,
          telephone_2: 1,
          adresse_1: 1,
          adresse_2: 1,
          avocat_id: 1,
          affaires: 1,
          totalAffairs: 1,
        },
      },
    ]);

    res.status(200).json(clients);
  } catch (error) {
    res.status(500).json({ message: 'خطأ في جلب العملاء', error: error.message });
  }
};

exports.getClientById = async (req, res) => {
  try {
    const client = await Client.findOne({ _id: req.params.id, avocat_id: req.avocat._id })
      .populate({
        path: 'affaires',
        populate: { path: 'affaire_id', select: 'titre description statut' },
      });

    if (!client) return res.status(404).json({ message: 'العميل غير موجود' });

    const totalAffairs = client.affaires ? client.affaires.length : 0;
    const clientWithTotal = {
      ...client.toObject(),
      totalAffairs,
    };

    res.status(200).json(clientWithTotal);
  } catch (error) {
    res.status(500).json({ message: 'خطأ في جلب العميل', error: error.message });
  }
};

exports.createClient = async (req, res) => {
  try {
    const { nom, CIN, telephone_1, telephone_2, adresse_1, adresse_2, affaires } = req.body;

    const clientData = {
      nom,
      CIN,
      telephone_1,
      telephone_2,
      adresse_1,
      adresse_2,
      avocat_id: req.avocat._id,  
      affaires: [], 
    };
    const client = new Client(clientData);
    await client.save();

    if (affaires && affaires.length > 0) {
      const affaireClientPromises = affaires.map(async (affaireId) => {
        const affaireClient = new AffaireClient({
          client_id: client._id,
          affaire_id: affaireId,
        });
        await affaireClient.save();
        return affaireClient._id;
      });

      const affaireClientIds = await Promise.all(affaireClientPromises);

      client.affaires = affaireClientIds;
      await client.save();
    }

    const populatedClient = await Client.findById(client._id).populate({
      path: 'affaires',
      populate: { path: 'affaire_id', select: 'titre description statut' },
    });
    const totalAffairs = populatedClient.affaires ? populatedClient.affaires.length : 0;
    const clientWithTotal = {
      ...populatedClient.toObject(),
      totalAffairs,
    };

    res.status(201).json(clientWithTotal);
  } catch (error) {
    res.status(400).json({ message: 'خطأ في إنشاء العميل', error: error.message });
  }
};

exports.updateClient = async (req, res) => {
  try {
    const { nom, CIN, telephone_1, telephone_2, adresse_1, adresse_2, affaires } = req.body;

    const client = await Client.findOne({ _id: req.params.id, avocat_id: req.avocat._id });
    if (!client) return res.status(404).json({ message: 'العميل غير موجود' });

    client.nom = nom || client.nom;
    client.CIN = CIN || client.CIN;
    client.telephone_1 = telephone_1 || client.telephone_1;
    client.telephone_2 = telephone_2 || client.telephone_2;
    client.adresse_1 = adresse_1 || client.adresse_1;
    client.adresse_2 = adresse_2 || client.adresse_2;

    if (affaires) {
      const existingAffaireClients = await AffaireClient.find({ client_id: client._id });
      const existingAffaireIds = existingAffaireClients.map(ac => ac.affaire_id.toString());

      const newAffaireIds = affaires.map(id => id.toString());
      const affaireIdsToAdd = newAffaireIds.filter(id => !existingAffaireIds.includes(id));
      const affaireIdsToRemove = existingAffaireIds.filter(id => !newAffaireIds.includes(id));

      if (affaireIdsToRemove.length > 0) {
        await AffaireClient.deleteMany({
          client_id: client._id,
          affaire_id: { $in: affaireIdsToRemove },
        });
      }

      if (affaireIdsToAdd.length > 0) {
        const affaireClientPromises = affaireIdsToAdd.map(async (affaireId) => {
          const affaireClient = new AffaireClient({
            client_id: client._id,
            affaire_id: affaireId,
          });
          await affaireClient.save();
          return affaireClient._id;
        });

        const newAffaireClientIds = await Promise.all(affaireClientPromises);

        const remainingAffaireClients = existingAffaireClients
          .filter(ac => !affaireIdsToRemove.includes(ac.affaire_id.toString()))
          .map(ac => ac._id);
        client.affaires = [...remainingAffaireClients, ...newAffaireClientIds];
      } else {
        client.affaires = existingAffaireClients
          .filter(ac => !affaireIdsToRemove.includes(ac.affaire_id.toString()))
          .map(ac => ac._id);
      }
    }

    await client.save();

    const populatedClient = await Client.findById(client._id).populate({
      path: 'affaires',
      populate: { path: 'affaire_id', select: 'titre description statut' },
    });
    const totalAffairs = populatedClient.affaires ? populatedClient.affaires.length : 0;
    const clientWithTotal = {
      ...populatedClient.toObject(),
      totalAffairs,
    };

    res.status(200).json(clientWithTotal);
  } catch (error) {
    res.status(400).json({ message: 'خطأ في تحديث العميل', error: error.message });
  }
};

exports.deleteClient = async (req, res) => {
  try {
    const client = await Client.findOneAndDelete({ _id: req.params.id, avocat_id: req.avocat._id });
    if (!client) return res.status(404).json({ message: 'العميل غير موجود' });
    await AffaireClient.deleteMany({ client_id: req.params.id });
    res.status(200).json({ message: 'تم حذف العميل' });
  } catch (error) {
    res.status(500).json({ message: 'خطأ في حذف العميل', error: error.message });
  }
};
exports.searchClients = async (req, res) => {
  try {
    const { query } = req.query;
    if (!query) return res.status(400).json({ message: 'Query parameter is required' });
    const clients = await Client.find({
      nom: { $regex: query, $options: 'i' }, 
    }).limit(5).select('nom');
    res.status(200).json(clients);
  } catch (error) {
    res.status(500).json({ message: 'Error searching clients', error });
  }
};