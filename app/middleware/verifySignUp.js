const db = require("../models");
const ROLES = db.ROLES;
const User = db.user;

// username , email 중복 체크
checkDuplicateUsernameOrEmail = (req, res, next) => {
    User.findOne({
        where: {
            username: req.body.username,
        },
    }).then((user) => {
        if (user) {
            res.status(400).send({
                message: "Fail! Username is already in use...",
            });
            return;
        }
    });
    User.findOne({
        where: {
            email: req.body.email,
        },
    }).then((user) => {
        if (user) {
            res.status(400).send({
                message: "Fail! Email is already in use...",
            });
            return;
        }
        next();
    });
};

// request 에 roles가 존재하는지 체크
checkRolesExisted = (req, res, next) => {
    if (req.body.roles) {
        for (let i = 0; i < req.body.roles.length; i++) {
            if (!ROLES.includes(req.body.roles[i])) {
                res.status(400).send({
                    message: "Fail! Role does not exist = " + req.body.roles[i],
                });
                return;
            }
        }
    }
    next();
};

// verify 에 필요한 2가지 함수를 담는다
const verifySignUp = {
    checkDuplicateUsernameOrEmail: checkDuplicateUsernameOrEmail,
    checkRolesExisted: checkRolesExisted,
};

module.exports = verifySignUp;
