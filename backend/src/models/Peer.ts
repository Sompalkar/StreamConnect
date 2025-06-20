import type { Socket } from "socket.io"
import type { types } from "mediasoup"

export class Peer {
  id: string
  socket: Socket
  transports: Map<string, types.WebRtcTransport>
  producers: Map<string, types.Producer>
  consumers: Map<string, types.Consumer>

  constructor(id: string, socket: Socket) {
    this.id = id
    this.socket = socket
    this.transports = new Map()
    this.producers = new Map()
    this.consumers = new Map()
  }

  addTransport(transport: types.WebRtcTransport): void {
    this.transports.set(transport.id, transport)
  }

  getTransport(transportId: string): types.WebRtcTransport | undefined {
    return this.transports.get(transportId)
  }

  removeTransport(transportId: string): boolean {
    const transport = this.getTransport(transportId)
    if (transport) {
      transport.close()
      return this.transports.delete(transportId)
    }
    return false
  }

  addProducer(producer: types.Producer): void {
    this.producers.set(producer.id, producer)
  }

  getProducer(producerId: string): types.Producer | undefined {
    return this.producers.get(producerId)
  }

  removeProducer(producerId: string): boolean {
    const producer = this.getProducer(producerId)
    if (producer) {
      producer.close()
      return this.producers.delete(producerId)
    }
    return false
  }

  addConsumer(consumer: types.Consumer): void {
    this.consumers.set(consumer.id, consumer)
  }

  getConsumer(consumerId: string): types.Consumer | undefined {
    return this.consumers.get(consumerId)
  }

  removeConsumer(consumerId: string): boolean {
    const consumer = this.getConsumer(consumerId)
    if (consumer) {
      consumer.close()
      return this.consumers.delete(consumerId)
    }
    return false
  }

  close(): void {
    // Close all transports (which also closes producers and consumers)
    this.transports.forEach((transport) => transport.close())

    this.transports.clear()
    this.producers.clear()
    this.consumers.clear()
  }

  toJSON() {
    return {
      id: this.id,
      transports: Array.from(this.transports.keys()),
      producers: Array.from(this.producers.keys()),
      consumers: Array.from(this.consumers.keys()),
    }
  }
}
