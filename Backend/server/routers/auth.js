const express = require('express');
const router = express.Router(); // ✅ แก้ตรงนี้






router.post('/login',(req, res)=>{
    res.send('GET login jaa')

})

module.exports = router;