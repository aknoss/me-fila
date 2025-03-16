"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var express_1 = __importDefault(require("express"));
var dotenv_1 = __importDefault(require("dotenv"));
var morgan_1 = __importDefault(require("morgan"));
var roomRoutes_1 = require("./routes/roomRoutes");
var logger_1 = require("./logger");
dotenv_1.default.config();
var app = (0, express_1.default)();
app.use(express_1.default.json());
app.use((0, morgan_1.default)("tiny", {
    stream: { write: function (message) { return logger_1.logger.info(message.trim()); } },
}));
app.use("/room", roomRoutes_1.roomRoutes);
app.get("/", function (_req, res) {
    res.json({
        data: { message: "Welcome to the Me Fila API. Check docs for how to use." },
        error: null,
    });
});
app.use(function (error, _req, res, _next) {
    logger_1.logger.error("Something went wrong!", {
        error: {
            message: error.message,
            code: 500,
            stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
        },
    });
    res.status(500).json({
        data: null,
        error: {
            message: "Something went wrong!",
            code: 500,
        },
    });
});
var port = process.env.PORT;
app.listen(port, function () {
    logger_1.logger.info("Server is running port ".concat(port));
});
