module.exports = {
    home : function (req, res, next) {
        var homeObject = {};
        homeObject.isAuthenticated = req.isAuthenticated();
        if (req.isAuthenticated()) {
            homeObject.name = req.user.local.firstName;
        }
        res.render('pages/home', { data: homeObject });
    }
};