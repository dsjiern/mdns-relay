const dgram = require('dgram')
const Airplay = require('./airplay')

const fs = require('fs')
const yaml = require('yaml')

const file = fs.readFileSync('./config.yml', 'utf8')
const config = yaml.parse(file)
const interfaces = [...(config?.airplay?.input||[]), ...(config?.airprint?.input||[])].filter((a, i, arr) => arr.findIndex(b => b === a) === i).map(i => i.replace(/\/\d*$/, ''))
const output = [...(config?.airplay?.output||[]), ...(config?.airprint?.output||[])].filter((a, i, arr) => arr.findIndex(b => b === a) === i)

const Listener = require('./listener')
const listener = new Listener(interfaces)

const sockets = {}
output.forEach(o => {
	sockets[o] = dgram.createSocket({
		type: 'udp4',
		reuseAddr: true
	})

	sockets[o].bind(5353, o, () => {
		sockets[o].setMulticastInterface(o)
	})
})


setInterval(() => {
	if (!config?.airplay?.output) return

	const a = listener.getManager().airplay(config?.airplay?.input)

	config.airplay.output.forEach(o => {
		a.forEach(ap => ap.broadcast(sockets[o]))
	})
}, (config?.airplay?.time||30)*1000)

setInterval(() => {
	if (!config?.airprint?.output) return

	const a = listener.getManager().airprint(config?.airprint?.input)

	config.airprint.output.forEach(o => {
		a.forEach(ap => ap.broadcast(sockets[o]))
	})
}, (config?.airprint?.time||15)*1000)
