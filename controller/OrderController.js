// const conn = require("../mariadb");
const mariadb = require("mysql2/promise");
const { StatusCodes } = require("http-status-codes");

const order = async (req, res) => {
  const conn = await mariadb.createConnection({
    host: "localhost",
    user: "root",
    password: "root",
    database: "Bookshop",
    dateStrings: true,
  });
  const { items, delivery, totalQuantity, totalPrice, userId, firstBookTitle } =
    req.body;

  let delivery_id;
  let order_id;

  // delivery 테이블 삽입
  let sql = `INSERT INTO delivery (address, receiver, contact) VALUES (?, ?, ?)`;
  let values = [delivery.address, delivery.receiver, delivery.contact];
  let [results] = await conn.execute(sql, values);
  // query 설명을 보면 매개변수 2개만 받고 있다. 콜백함수는 안돌아간다는 뜻
  // 대신에 return해서 결과값을 보내준다.
  delivery_id = results.insertId;

  // order 테이블 삽입
  sql = `INSERT INTO orders (book_title, total_quantity, total_price, user_id, delivery_id) VALUES (?, ?, ?, ?, ?);`;
  values = [firstBookTitle, totalQuantity, totalPrice, userId, delivery_id];
  [results] = await conn.execute(sql, values);
  order_id = results.insertId;

  // items를 가지고 장바구니에서 book_id, quantity 조회
  sql = `SELECT book_id, quantity FROM cartItems WHERE id IN (?)`;
  let [orderItems, fields] = await conn.query(sql, [items]);

  // orderedBook 테이블 삽입
  sql = `INSERT INTO oderedBook (order_id, book_id, quantity) VALUES ?`;
  values = [];
  orderItems.forEach((item) => {
    values.push([order_id, item.book_id, item.quantity]);
  });
  results = await conn.query(sql, [values]);
  // 배열을 넣는게 제일 최근에 바뀐 문법이라 execute로 안바꾸고 그냥 query를 쓴다.

  let result = await deleteCartItems(conn, items);
  console.log(result);
  return res.status(StatusCodes.OK).json(result);
};

const deleteCartItems = async (conn, items) => {
  let sql = `DELETE FROM cartItems WHERE id IN (?)`;
  let result = await conn.query(sql, [items]);
  return result;
};

const getOrders = async (req, res) => {
  const conn = await mariadb.createConnection({
    host: "localhost",
    user: "root",
    password: "root",
    database: "Bookshop",
    dateStrings: true,
  });
  let sql = `
    SELECT
    orders.id,
    created_at,
    address,
    receiver,
    contact,
    book_title,
    total_quantity,
    total_price
    FROM orders
    LEFT JOIN delivery
    ON orders.delivery_id = delivery.id`;
  let [rows, fields] = await conn.query(sql);
  return res.status(StatusCodes.OK).json(rows);
};
const getOrderDetail = async (req, res) => {
  let { id } = req.params;

  const conn = await mariadb.createConnection({
    host: "localhost",
    user: "root",
    password: "root",
    database: "Bookshop",
    dateStrings: true,
  });
  let sql = `
    SELECT
    books.id,
    title,
    author,
    price,
    quantity
    FROM oderedBook
    LEFT JOIN books
    ON oderedBook.book_id = books.id
    WHERE order_id = ?`;
  let [rows, fields] = await conn.query(sql, [id]);
  return res.status(StatusCodes.OK).json(rows);
};

module.exports = {
  order,
  getOrders,
  getOrderDetail,
};
