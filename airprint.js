const dnsPacket = require('dns-packet')

module.exports = class Airprint {
	constructor (name, host, ip, txt) {
		this.name = name
		this.host = host
		this.ip = ip
		this.txt = txt
	}

	toQuery = () => {
		const name = `${this.name}._ipp._tcp.local`
		const host = `${this.host}.local`

		return dnsPacket.encode({
			type: 'query',
			id: 0,
			questions: [
				{
					name,
					type: 'ANY',
					class: 'IN'
				}
			],
			authorities: [
				{
					name,
					type: 'SRV',
					flush: false,
					ttl: 120,
					data: {
						target: host,
						port: 7000
					}
				}
			]
		})
	}

	toResponse = () => {
		const name = `${this.name}._ipp._tcp.local`
		const host = `${this.host}.local`

		return dnsPacket.encode({
			type: 'response',
			id: 0,
			answers: [
				{
					name,
					type: 'TXT',
					flush: true,
					ttl: 4500,
					data: this.txt
				},
				{
					name: '_printer._tcp.local',
					type: 'PTR',
					data: `${this.name}._printer._tcp.local`,
					ttl: 4500
				},
				{
					name: `${this.name}._printer._tcp.local`,
					type: 'SRV',
					data: {
						priority: 0,
						weight: 0,
						port: 0,
						target: host
					},
					flush: true,
					ttl: 120
				},
				{
					name: `${this.name}._printer._tcp.local`,
					type: 'TXT',
					flush: true,
					ttl: 4500,
					data: []
				},
				{
					name: '_ipp._tcp.local',
					type: 'PTR',
					data: name,
					ttl: 4500
				},
				{
					name,
					type: 'SRV',
					data: {
						priority: 0,
						weight: 0,
						port: 631,
						target: host
					},
					flush: true,
					ttl: 120
				},
				{
					name: '_cups._sub._ipp._rcp.local',
					type: 'PTR',
					data: name,
					ttl: 4500
				},
				{
					name: '_print._sub._ipp._tcp.local',
					type: 'PTR',
					data: name,
					ttl: 4500
				},
				{
					name: '_universal._sub._ipp._tcp.local',
					type: 'PTR',
					data: name,
					ttl: 4500
				}
			],
			additionals: [
				{
					name: host,
					type: 'A',
					data: this.ip,
					flush: true,
					ttl: 120
				}
			]
		})
	}

	broadcast = async (socket) => {
		if (!socket) return

		const bc = '224.0.0.251'

		return new Promise((resolve, reject) => {
			socket.send(this.toQuery(), 5353, bc, (err, len) => {
				if (err) return reject(err)
				socket.send(this.toResponse(), 5353, bc, (err, len) => {
					if (err) return reject(err)
					resolve()
				})
			})
		})
	}
}
