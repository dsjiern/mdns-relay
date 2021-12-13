const MDNS = require('multicast-dns')

const Manager = require('./manager')

const { ab2str } = require('./conv')

module.exports = class Listener {
	constructor (interfaces) {
		this.interfaces = interfaces

		this.manager = new Manager()

		this.mdns = MDNS({
			interfaces,
			reuseAddr: true
		})

		this.mdns.on('response', (response, rinfo) => {
			response.answers = response.answers.map(r => ({
				...r,
				data: r.type !== 'TXT' ? r.data : r.data.map(d => ab2str(d))
			}))

			response.additionals = response.additionals.map(r => ({
				...r,
				data: r.type !== 'TXT' ? r.data : r.data.map(d => ab2str(d))
			}))

			if (response.answers.length === 0 && response.additionals.length === 0) return

			const tmp = [...response.answers, ...response.additionals]

			tmp.forEach(r => this.manager.add(r))
		})
	}

	getManager = () => this.manager
}
