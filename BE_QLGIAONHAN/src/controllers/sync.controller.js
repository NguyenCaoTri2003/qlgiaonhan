const { mapNhigiaToOrder } = require("../utils/nhigia.mapper");
const { fetchNhigiaOrders } = require("../services/nhigia.service");
const { upsertOrder } = require("../services/order-sync.service");

// exports.syncOrders = async (req, res) => {
//   try {
//     const data = await fetchNhigiaOrders();

//     for (const item of data) {
//       const mapped = mapNhigiaToOrder(item);
//       await upsertOrder(mapped);
//     }

//     res.json({ message: "Sync thành công", total: data.length });
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// };

exports.syncOrders = async (req, res) => {
  try {
    const data = await fetchNhigiaOrders();

    for (const item of data) {
      const mapped = mapNhigiaToOrder(item);
      await upsertOrder(mapped);
    }

    res.json({
      message: "Sync thành công",
      total: data.length,
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};