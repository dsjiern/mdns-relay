const Airplay = require('./airplay')
const Airprint = require('./airprint')
const Netmask = require('netmask').Netmask

module.exports = class Manager {
	constructor() {
		this.packets = []
	}

	add = (packet) => {
		const index = this.packets.findIndex(p => p.type === packet.type && p.name === packet.name)

		if (index === -1) {
			this.packets.push(packet)
		} else {
			this.packets[index] = packet
		}
	}

	find = (name, type) => {
		return this.packets.find(p => p.type === type && p.name === name)
	}

	airplay = (interfaces) => {
		const ap = this.packets.filter(p => p.type === 'TXT' && !!p.name.match("_airplay._tcp.local$")).map(a => {
			const name = a.name.replace(/\._airplay\._tcp\.local/, '').replace(/ \(\d*\)$/,'')

			const srv = this.packets.find(p => p.type === 'SRV' && p.name === a.name)

			const host = srv?.data?.target?.replace(/\.local/, '')

			const _a = this.packets.find(p => p.type === 'A' && p.name === `${host}.local`)

			const ip = _a?.data

			return {
				name,
				host,
				ip,
				txt: a.data
			}
		}).filter(p => p.host && p.ip).filter(p => {
			if (!interfaces) return false;

			return !!interfaces.find(i => {
				const block = new Netmask(i)
				return block.contains(p.ip)
			})
		})

		return ap.map(a => new Airplay(a.name, a.host, a.ip, a.txt))
	}

	airprint = (interfaces) => {
		const ap = this.packets.filter(p => p.type === 'TXT' && !!p.name.match("_ipp._tcp.local$")).map(a => {
			const name = a.name.replace(/\._ipp._tcp.local/, '').replace(/ \(\d*\)$/, '')

			const srv = this.packets.find(p => p.type === 'SRV' && p.name === a.name)

			const host = srv?.data?.target?.replace(/\.local/, '')

			const _a = this.packets.find(p => p.type === 'A' && p.name === `${host}.local`)

			const ip = _a?.data

			return {
				name,
				host,
				ip,
				txt: a.data
			}
		}).filter(p => p.host && p.ip).filter(p => {
			if (!interfaces) return false;

			return !!interfaces.find(i => {
				const block = new Netmask(i)
				return block.contains(p.ip)
			})
		})

		return ap.map(a => new Airprint(a.name, a.host, a.ip, a.txt))
	}
}
