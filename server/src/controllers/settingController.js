
const Setting = require('../models/Setting');

// Get saved settings
exports.getSettings = async (req, res) => {
  try {
    let settings = await Setting.findOne();

    if (!settings) {
      settings = await Setting.create({
        businessName: 'StockLite ERP',
        phone: '',
        address: ''
      });
    }

    res.json(settings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Save settings
exports.updateSettings = async (req, res) => {
  try {
    const { businessName, phone, address } = req.body;

    if (!businessName || !businessName.trim()) {
      return res.status(400).json({
        message: 'Business name is required.'
      });
    }

    let settings = await Setting.findOne();

    if (!settings) {
      settings = new Setting();
    }

    settings.businessName = businessName.trim();
    settings.phone = (phone || '').trim();
    settings.address = (address || '').trim();

    await settings.save();

    res.json({
      message: 'Settings saved successfully.',
      settings
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
