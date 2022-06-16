const db = require("../models");
const config = require("../config/auth.config");
const { user: User, role: Role, refreshToken: RefreshToken } = db;
const Op = db.Sequelize.Op;
let jwt = require("jsonwebtoken");
let bcrypt = require("bcryptjs");
exports.signup = (req, res) => {
    User.create({
        username: req.body.username,
        email: req.body.email,
        password: bcrypt.hashSync(req.body.password, 8),
    })
        .then((user) => {
            if (req.body.roles) {
                Role.findAll({
                    where: {
                        name: {
                            [Op.or]: req.body.roles,
                        },
                    },
                }).then((roles) => {
                    user.setRoles(roles).then(() => {
                        res.send({ message: "User was refistered successfully!" });
                    });
                });
            } else {
                user.setRoles([1]).then(() => {
                    res.send({ message: "User was registered successfully!" });
                });
            }
        })
        .catch((err) => {
            res.status(500).send({ message: err.message });
        });
};

exports.signin = (req, res) => {
    User.findOne({
        where: {
            username: req.body.username,
        },
    })
        .then(async (user) => {
            if (!user) {
                return res.status(404).send({ message: "User Not found." });
            }
            let passwordIsValid = bcrypt.compareSync(
                // db 비밀번호, 입력비밀번호 비교
                req.body.password,
                user.password
            );
            if (!passwordIsValid) {
                return response.status(401).send({
                    accessToken: null,
                    message: "Invalid Password",
                });
            }
            const token = jwt.sign({ id: user.id }, config.secret, {
                expiresIn: config.jwtExpiration, // jwt 만료시간 config에서 제어
            });
            let refreshToken = await RefreshToken.createToken(user);
            let authorities = [];
            user.getRoles().then((roles) => {
                for (let i = 0; i < roles.length; i++) {
                    authorities.push("ROLE_" + roles[i].name.toUpperCase());
                }
                res.status(200).send({
                    // Signin Response
                    id: user.id,
                    username: user.username,
                    email: user.email,
                    roles: authorities,
                    accessToken: token,
                    refreshToken: refreshToken,
                });
            });
        })
        .catch((err) => {
            res.status(500).send({ message: err.message });
        });
};

exports.refreshToken = async (req, res) => {
    const { refreshToken: requestToken } = req.body;
    if (requestToken == null) {
        return res.status(403).json({ message: "Refresh Token is required" });
    }
    try {
        let refreshToken = await RefreshToken.findOne({ where: { token: requestToken } });
        console.log(refreshToken);
        if (!refreshToken) {
            res.status(403).json({ message: "Refresh Token is not in Database" });
            return;
        }
        if (RefreshToken.verifyExpiration(refreshToken)) {
            RefreshToken.destroy({ where: { id: refreshToken.id } });
            res.status(403).json({
                message: "Refresh token was expired. Please make a new signin request",
            });
            return;
        }
        const user = await refreshToken.getUser();
        let newAccessToken = jwt.sign({ id: user.id }, config.secret, {
            expiresIn: config.jwtExpiration,
        });
        return res.status(200).json({
            accessToken: newAccessToken,
            refreshToken: refreshToken.token,
        });
    } catch (err) {
        return res.status(500).send({ message: err });
    }
};
