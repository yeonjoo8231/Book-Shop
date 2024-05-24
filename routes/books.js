const express = require("express");
const router = express.Router();
const { allBooks, booksDetail } = require("../controller/BookController");

// 전체 도서 조회
router.get("/", allBooks);
// 개별 도서 조회
router.get("/:id", booksDetail);

module.exports = router;
