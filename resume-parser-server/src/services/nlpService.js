const axios = require("axios");

exports.parseResume = async (filePath) => {
  const response = await axios.post("http://localhost:5001/parse", {
    filePath,
  });
  return response.data;
};
