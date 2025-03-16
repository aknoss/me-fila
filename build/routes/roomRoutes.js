"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.roomRoutes = void 0;
var express_1 = __importDefault(require("express"));
var roomControllers_1 = require("../controllers/roomControllers");
var auth_1 = require("../middleware/auth");
var roomRoutes = express_1.default.Router();
exports.roomRoutes = roomRoutes;
roomRoutes.post("/", roomControllers_1.createRoom);
roomRoutes.get("/:roomId", roomControllers_1.getRoom);
roomRoutes.delete("/:roomId", auth_1.authenticateHost, roomControllers_1.deleteRoom);
