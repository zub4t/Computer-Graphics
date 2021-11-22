// routes/index.js and users.js
import express from 'express';
var router = express.Router();
router.get('/objRender', function(req, res) {
    try {
        res.render('obj_file')

    } catch (e) {
        console.log(e)
    }
})

router.get('/camera', function(req, res) {
    try {
        res.render('camera')

    } catch (e) {
        console.log(e)
    }
})
router.get('/dynamic_camera', function(req, res) {
    try {
        res.render('dynamic_camera')

    } catch (e) {
        console.log(e)
    }
})

export default router;