module.exports = class ServicoCalculoFatura {

	constructor(repo){ this.repo = repo; }

	calcularTotalApresentacao(apresentacao){
		let total = 0;
	
		switch (this.repo.getPeca(apresentacao).tipo) {
			case "tragedia":
				total = 40000;
				if (apresentacao.audiencia > 30) {
					total += 1000 * (apresentacao.audiencia - 30);
				}
				break;
			case "comedia":
				total = 30000;
				if (apresentacao.audiencia > 20) {
					total += 10000 + 500 * (apresentacao.audiencia - 20);
				}
				total += 300 * apresentacao.audiencia;
				break;
			default:
				throw new Error(`Peça desconhecia: ${this.repo.getPeca(apresentacao).tipo}`);
		}
		
		return total;
	}
	
	calcularTotalFatura(apresentacoes){
		let totalFatura = 0;
		for (let apresentacao of apresentacoes) {
			totalFatura += this.calcularTotalApresentacao(apresentacao);
		}
		return totalFatura;
	}
	
	calcularCredito(apresentacao){
		let creditos = 0;
		creditos += Math.max(apresentacao.audiencia - 30, 0);
		if (this.repo.getPeca(apresentacao).tipo === "comedia") 
			creditos += Math.floor(apresentacao.audiencia / 5);
		return creditos
	}
	
	calcularTotalCreditos(apresentacoes){
		let totalCreditos = 0;
		for (let apresentacao of apresentacoes) {
			totalCreditos += this.calcularCredito(apresentacao);
		}
		return totalCreditos;
	}
}