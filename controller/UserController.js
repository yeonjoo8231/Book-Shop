const conn = require("../mariadb");
const { StatusCodes } = require("http-status-codes");
const jwt = require("jsonwebtoken");
const cryto = require("crypto");
const dotenv = require("dotenv");
dotenv.config();

const join = (req, res) => {
  const { email, password } = req.body;
  let sql = `INSERT INTO users (email, password, salt) VALUES (?, ?, ?)`;

  const salt = cryto.randomBytes(10).toString("base64");
  const hashPassword = cryto
    .pbkdf2Sync(password, salt, 10000, 10, "sha512")
    .toString("base64");
  let values = [email, hashPassword, salt];

  conn.query(sql, values, (err, results) => {
    if (err) {
      console.log(err);
      return res.status(StatusCodes.BAD_REQUEST).end();
    }
    res.status(StatusCodes.CREATED).json({
      message: "회원가입 성공",
    });
  });
};

module.exports = {
  join,
};
