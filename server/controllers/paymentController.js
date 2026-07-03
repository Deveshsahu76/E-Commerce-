const Razorpay = require("razorpay");

const createOrder = async (req, res) => {
  try {
    const { amount = 0, currency = "INR", receipt } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({ success: false, message: "Invalid amount" });
    }

    const instance = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    });

    const options = {
      amount: Math.round(Number(amount) * 100), // amount in paise
      currency,
      receipt: receipt || `rcpt_${Date.now()}`,
    };

    const order = await instance.orders.create(options);

    return res.status(201).json({ success: true, order, key: process.env.RAZORPAY_KEY_ID });
  } catch (error) {
    console.error("PAYMENT ERROR:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { createOrder };
