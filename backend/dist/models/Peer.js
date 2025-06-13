"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Peer = void 0;
class Peer {
    constructor(id, socket) {
        this.id = id;
        this.socket = socket;
        this.transports = new Map();
        this.producers = new Map();
        this.consumers = new Map();
    }
    addTransport(transport) {
        this.transports.set(transport.id, transport);
    }
    getTransport(transportId) {
        return this.transports.get(transportId);
    }
    removeTransport(transportId) {
        const transport = this.getTransport(transportId);
        if (transport) {
            transport.close();
            return this.transports.delete(transportId);
        }
        return false;
    }
    addProducer(producer) {
        this.producers.set(producer.id, producer);
    }
    getProducer(producerId) {
        return this.producers.get(producerId);
    }
    removeProducer(producerId) {
        const producer = this.getProducer(producerId);
        if (producer) {
            producer.close();
            return this.producers.delete(producerId);
        }
        return false;
    }
    addConsumer(consumer) {
        this.consumers.set(consumer.id, consumer);
    }
    getConsumer(consumerId) {
        return this.consumers.get(consumerId);
    }
    removeConsumer(consumerId) {
        const consumer = this.getConsumer(consumerId);
        if (consumer) {
            consumer.close();
            return this.consumers.delete(consumerId);
        }
        return false;
    }
    close() {
        // Close all transports (which also closes producers and consumers)
        this.transports.forEach((transport) => transport.close());
        this.transports.clear();
        this.producers.clear();
        this.consumers.clear();
    }
    toJSON() {
        return {
            id: this.id,
            transports: Array.from(this.transports.keys()),
            producers: Array.from(this.producers.keys()),
            consumers: Array.from(this.consumers.keys()),
        };
    }
}
exports.Peer = Peer;
