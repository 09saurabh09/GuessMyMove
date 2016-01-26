module.exports = {
    home : function (req, res, next) {
        console.log(req.session);
        console.log(req.user);
        console.log(req.isAuthenticated());
        var homeObject = {};
        homeObject.isAuthenticated = req.isAuthenticated();
        if (req.isAuthenticated()) {
            homeObject.name = req.user.local.firstName;
        }
        console.log(homeObject);
        res.render('pages/home', { data: homeObject });
    }
};