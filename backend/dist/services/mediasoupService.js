"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.mediasoupService = void 0;
const mediasoup_1 = require("mediasoup");
class MediasoupService {
    constructor() {
        this.worker = null;
        this.initialized = false;
        this.initializing = null;
    }
    initialize() {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.initialized)
                return;
            if (this.initializing)
                return this.initializing;
            this.initializing = new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                try {
                    this.worker = yield (0, mediasoup_1.createWorker)({
                        logLevel: "warn",
                        logTags: ["info", "ice", "dtls", "rtp", "srtp", "rtcp"],
                        rtcMinPort: 10000,
                        rtcMaxPort: 10100,
                    });
                    console.log(`Mediasoup worker created with pid ${this.worker.pid}`);
                    this.initialized = true;
                    resolve();
                }
                catch (error) {
                    console.error("Failed to create mediasoup worker:", error);
                    reject(error);
                }
            }));
            return this.initializing;
        });
    }
    getWorker() {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.initialized) {
                yield this.initialize();
            }
            if (!this.worker) {
                throw new Error("Mediasoup worker not initialized");
            }
            return this.worker;
        });
    }
    createRouter() {
        return __awaiter(this, void 0, void 0, function* () {
            const worker = yield this.getWorker();
            return worker.createRouter({
                mediaCodecs: [
                    {
                        kind: "audio",
                        mimeType: "audio/opus",
                        clockRate: 48000,
                        channels: 2,
                    },
                    {
                        kind: "video",
                        mimeType: "video/VP8",
                        clockRate: 90000,
                        parameters: {
                            "x-google-start-bitrate": 1000,
                        },
                    },
                ],
            });
        });
    }
    close() {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.worker) {
                yield this.worker.close();
                this.worker = null;
                this.initialized = false;
                this.initializing = null;
            }
        });
    }
}
exports.mediasoupService = new MediasoupService();
