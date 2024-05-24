const conn = require("../mariadb");
const { StatusCodes } = require("http-status-codes");

const allBooks = (req, res) => {
  let { category_id } = req.query;
  if (category_id) {
    category_id = parseInt(category_id);
    let sql = `SELECT * FROM books WHERE category_id = ?`;
    conn.query(sql, category_id, (err, results) => {
      if (err) {
        console.log(err);
        return res.status(StatusCodes.BAD_REQUEST).end();
      }
      if (results.length) {
        res.status(StatusCodes.OK).json(results);
      } else {
        res.status(StatusCodes.NOT_FOUND).end();
      }
    });
  } else {
    let sql = `SELECT * FROM books`;

    conn.query(sql, (err, results) => {
      if (err) {
        return res.status(StatusCodes.BAD_REQUEST).end();
      }
      res.status(StatusCodes.OK).json(results);
    });
  }
};

const booksDetail = (req, res) => {
  let { id } = req.params;
  id = parseInt(id);
  let sql = `SELECT * FROM books WHERE id = ?`;
  conn.query(sql, id, (err, results) => {
    if (err) {
      console.log(err);
      return res.status(StatusCodes.BAD_REQUEST).end();
    }
    if (results[0]) {
      res.status(StatusCodes.OK).json(results[0]);
    } else {
      res.status(StatusCodes.NOT_FOUND).end();
    }
  });
};

module.exports = {
  allBooks,
  booksDetail,
};
