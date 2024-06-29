const { readFileSync } = require('fs');

module.exports = class Repositorio {
	constructor(){ this.pecas = JSON.parse(readFileSync('./pecas.json')); }	
	getPeca(apresentacao){ return this.pecas[apresentacao.id]; }
}
