const fs= require("fs-extra");
exports.deleteFile = filePath => {
  fs.unlink(filePath)
}

