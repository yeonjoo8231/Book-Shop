const conn = require("../mariadb");
const { StatusCodes } = require("http-status-codes");

const allBooks = (req, res) => {
  let { category_id, news, limit, currentPage } = req.query;

  // limit : page 당 도서 수
  // currentPage : 현재 몇 페이지
  limit = parseInt(limit);
  currentPage = parseInt(currentPage);
  category_id = parseInt(category_id);
  let offset = limit * (currentPage - 1);

  console.log(limit, currentPage);
  let sql = `SELECT * FROM books`;
  let values = [];

  if (category_id && news) {
    sql += ` WHERE category_id = ? AND pub_date BETWEEN DATE_SUB(NOW(), INTERVAL 1 MONTH) AND NOW()`;
    values = [category_id];
  } else if (category_id) {
    sql += ` WHERE category_id = ?`;
    values = [category_id];
  } else if (news) {
    sql += ` WHERE pub_date BETWEEN DATE_SUB(NOW(), INTERVAL 1 MONTH) AND NOW()`;
  }
  sql += ` LIMIT ? OFFSET ?`;
  values.push(limit, offset);

  conn.query(sql, values, (err, results) => {
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
};

const booksDetail = (req, res) => {
  let { id } = req.params;
  id = parseInt(id);
  let sql = `SELECT * FROM books LEFT JOIN category ON books.category_id = category.id WHERE books.id = ?`;
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
