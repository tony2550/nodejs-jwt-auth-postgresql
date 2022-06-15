module.exports = {
    HOST: "localhost",
    USER: "test1",
    PASSWORD: "12345",
    DB: "express1",
    dialect: "postgres",
    pool: {
        max: 5,
        min: 0,
        acquire: 30000,
        idle: 10000,
    },
};
