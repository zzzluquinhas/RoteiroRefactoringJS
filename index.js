const { readFileSync } = require('fs');

function formatarMoeda(valor){
	return new Intl.NumberFormat("pt-BR",
		{ style: "currency", currency: "BRL",
			minimumFractionDigits: 2 }).format(valor/100);
}

class Repositorio {
	constructor(){ this.pecas = JSON.parse(readFileSync('./pecas.json')); }	
	getPeca(apresentacao){ return this.pecas[apresentacao.id]; }
}

class ServicoCalculoFatura {

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

function gerarFaturaStr (fatura, calc) {
	let faturaStr = `Fatura ${fatura.cliente}\n`;
	for (let apre of fatura.apresentacoes) {
		faturaStr += `  ${calc.repo.getPeca(apre).nome}: ${formatarMoeda(calc.calcularTotalApresentacao(apre))} (${apre.audiencia} assentos)\n`;
	}
	faturaStr += `Valor total: ${formatarMoeda(calc.calcularTotalFatura(fatura.apresentacoes))}\n`;
	faturaStr += `Créditos acumulados: ${calc.calcularTotalCreditos(fatura.apresentacoes)} \n`;
	return faturaStr;
}

function gerarFaturaHTML(fatura, calc){
	let faturaHTML = `<html>\n`;
	faturaHTML += `<p>Fatura ${fatura.cliente}</p>\n`;
	faturaHTML += "<ul>\n";
	for (let apre of fatura.apresentacoes) {
		faturaHTML += `<li>${calc.repo.getPeca(apre).nome}: ${formatarMoeda(calc.calcularTotalApresentacao(apre))} (${apre.audiencia} assentos)</li>\n`;
	}
	faturaHTML += `</ul>\n`;
	faturaHTML += `<p>Valor total: ${formatarMoeda(calc.calcularTotalFatura(fatura.apresentacoes))}</p>\n`;
	faturaHTML += `<p>Créditos acumulados: ${calc.calcularTotalCreditos(fatura.apresentacoes)}</p>\n`;
	faturaHTML += `</html>\n`
	return faturaHTML;
}

const faturas = JSON.parse(readFileSync('./faturas.json'));
const calc = new ServicoCalculoFatura(new Repositorio());
const faturaStr = gerarFaturaStr(faturas, calc);
// const faturaHTML = gerarFaturaHTML(faturas, pecas);
console.log(faturaStr);
// console.log(faturaHTML);
