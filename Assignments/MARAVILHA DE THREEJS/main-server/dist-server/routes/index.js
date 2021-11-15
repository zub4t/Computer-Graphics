"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _express = _interopRequireDefault(require("express"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

// routes/index.js and users.js
var router = _express["default"].Router();

router.get('/objRender', function (req, res) {
  try {
    res.render('obj_file');
  } catch (e) {
    console.log(e);
  }
});
router.get('/camera', function (req, res) {
  try {
    res.render('camera');
  } catch (e) {
    console.log(e);
  }
});
var _default = router;
exports["default"] = _default;