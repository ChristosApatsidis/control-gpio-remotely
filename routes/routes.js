const express = require('express');
const router = express.Router();
const menu = require('./menu.json')

router.get('/', function (req, res) {
  let data = {
    title: 'Home',
    url: req.url,
    menu: menu
  }
  res.render('pages/index', data )
})

router.get('/settings', function (req, res) {
  let data = {
    title: 'Settings',
    url: req.url,
    menu: menu
  }
  res.render('pages/settings', data )
})

module.exports = router