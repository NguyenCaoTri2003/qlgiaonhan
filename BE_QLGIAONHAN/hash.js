const bcrypt = require("bcrypt");

(async () => {
  const hash = await bcrypt.hash("Nhigia@2016", 10);
  console.log(hash);
})();