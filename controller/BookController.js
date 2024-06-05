const ensureAuthorization = require("../auth");
const jwt = require("jsonwebtoken");
const conn = require("../mariadb");
const { StatusCodes } = require("http-status-codes");

const allBooks = (req, res) => {
  let allBooksRes = {};
  let { category_id, news, limit, currentPage } = req.query;

  // limit : page 당 도서 수
  // currentPage : 현재 몇 페이지
  limit = parseInt(limit);
  currentPage = parseInt(currentPage);
  category_id = parseInt(category_id);
  let offset = limit * (currentPage - 1);

  console.log(limit, currentPage);
  let sql = `SELECT SQL_CALC_FOUND_ROWS *, (SELECT count(*) FROM likes WHERE liked_book_id = books.id) AS likes FROM books`;
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
  sql += ` LIMIT ? OFFSET ? `;
  values.push(limit, offset);

  const result = {};

  console.log(sql, values);
  conn.query(sql, values, (err, results) => {
    if (err) {
      console.log(err);
      return res.status(StatusCodes.BAD_REQUEST).end();
    }
    if (results.length) {
      allBooksRes.books = results;
    } else {
      return res.status(StatusCodes.NOT_FOUND).end();
    }
  });

  sql = `SELECT found_rows();`;

  conn.query(sql, (err, results) => {
    if (err) {
      console.log(err);
      return res.status(StatusCodes.BAD_REQUEST).end();
    }
    let pagination = {};
    pagination.currentPage = parseInt(currentPage);
    pagination.totalCount = results[0]["found_rows()"];

    allBooksRes.pagination = pagination;
    res.status(StatusCodes.OK).json(allBooksRes);
  });
};

const booksDetail = (req, res) => {
  let book_id = req.params.id;
  book_id = parseInt(book_id);

  let authorization = ensureAuthorization(req, res);

  if (authorization instanceof jwt.TokenExpiredError) {
    return res.status(StatusCodes.UNAUTHORIZED).json({
      message: "로그인 세션 만료. 다시 로그인 필요",
    }); // 미인증상태
  } else if (authorization instanceof jwt.JsonWebTokenError) {
    return res.status(StatusCodes.BAD_REQUEST).json({
      message: "토큰이 이상하네요. 이 해커야",
    });
  } else {
    let book_id = req.params.id;
    let sql = `SELECT *,
    (SELECT count(*) FROM likes WHERE liked_book_id = books.id) AS likes,
    (SELECT EXISTS (SELECT * FROM likes WHERE user_id = ? AND liked_book_id = ?)) AS liked
    FROM books
    LEFT JOIN category ON books.category_id = category.category_id
    WHERE books.id = ?`;
    let values = [authorization.id, book_id, book_id];
    if (authorization instanceof ReferenceError) {
      sql = `SELECT *,
      (SELECT count(*) FROM likes WHERE liked_book_id = books.id) AS likes
      FROM books
      LEFT JOIN category ON books.category_id = category.category_id
      WHERE books.id = ?`;
      values = [book_id];
    }
    conn.query(sql, values, (err, results) => {
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
  }
};

module.exports = {
  allBooks,
  booksDetail,
};
