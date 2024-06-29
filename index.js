const { readFileSync } = require('fs');

function gerarFaturaStr (fatura, pecas) {
	function calcularTotalApresentacao(apresentacao){
		let total = 0;

		switch (getPeca(apresentacao).tipo) {
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
				throw new Error(`Peça desconhecia: ${getPeca(apresentacao).tipo}`);
		}
		
		return total;
	}
	
	function formatarMoeda(valor){
		return new Intl.NumberFormat("pt-BR",
			{ style: "currency", currency: "BRL",
				minimumFractionDigits: 2 }).format(valor/100);
	}

	function getPeca(apresentacao){
		return pecas[apresentacao.id];
	}

	function calcularCredito(apresentacao){
		let creditos = 0;
		creditos += Math.max(apresentacao.audiencia - 30, 0);
		if (getPeca(apresentacao).tipo === "comedia") 
			creditos += Math.floor(apresentacao.audiencia / 5);
		return creditos
	}

	function calcularTotalFatura(){
		let totalFatura = 0;
		for (let apresentacao of fatura.apresentacoes) {
			totalFatura += calcularTotalApresentacao(apresentacao);
		}
		return totalFatura;
	}

	function calcularTotalCreditos(){
		let totalCreditos = 0;
		for (let apresentacao of fatura.apresentacoes) {
			totalCreditos += calcularCredito(apresentacao);
		}
		return totalCreditos;
	}

	let faturaStr = `Fatura ${fatura.cliente}\n`;
	for (let apre of fatura.apresentacoes) {
		faturaStr += `  ${getPeca(apre).nome}: ${formatarMoeda(calcularTotalApresentacao(apre))} (${apre.audiencia} assentos)\n`;
	}
	faturaStr += `Valor total: ${formatarMoeda(calcularTotalFatura())}\n`;
	faturaStr += `Créditos acumulados: ${calcularTotalCreditos()} \n`;
	return faturaStr;
  }

const faturas = JSON.parse(readFileSync('./faturas.json'));
const pecas = JSON.parse(readFileSync('./pecas.json'));
const faturaStr = gerarFaturaStr(faturas, pecas);
console.log(faturaStr);
