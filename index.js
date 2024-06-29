const { readFileSync } = require('fs');

function formatarMoeda(valor){
	return new Intl.NumberFormat("pt-BR",
		{ style: "currency", currency: "BRL",
			minimumFractionDigits: 2 }).format(valor/100);
}

function getPeca(pecas, apresentacao){
	return pecas[apresentacao.id];
}

function calcularTotalApresentacao(pecas, apresentacao){
	let total = 0;

	switch (getPeca(pecas, apresentacao).tipo) {
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
			throw new Error(`Peça desconhecia: ${getPeca(pecas, apresentacao).tipo}`);
	}
	
	return total;
}

function calcularTotalFatura(pecas, apresentacoes){
	let totalFatura = 0;
	for (let apresentacao of apresentacoes) {
		totalFatura += calcularTotalApresentacao(pecas, apresentacao);
	}
	return totalFatura;
}

function calcularCredito(pecas, apresentacao){
	let creditos = 0;
	creditos += Math.max(apresentacao.audiencia - 30, 0);
	if (getPeca(pecas, apresentacao).tipo === "comedia") 
		creditos += Math.floor(apresentacao.audiencia / 5);
	return creditos
}

function calcularTotalCreditos(pecas, apresentacoes){
	let totalCreditos = 0;
	for (let apresentacao of apresentacoes) {
		totalCreditos += calcularCredito(pecas, apresentacao);
	}
	return totalCreditos;
}

function gerarFaturaStr (fatura, pecas) {
	let faturaStr = `Fatura ${fatura.cliente}\n`;
	for (let apre of fatura.apresentacoes) {
		faturaStr += `  ${getPeca(pecas, apre).nome}: ${formatarMoeda(calcularTotalApresentacao(pecas, apre))} (${apre.audiencia} assentos)\n`;
	}
	faturaStr += `Valor total: ${formatarMoeda(calcularTotalFatura(pecas, fatura.apresentacoes))}\n`;
	faturaStr += `Créditos acumulados: ${calcularTotalCreditos(pecas, fatura.apresentacoes)} \n`;
	return faturaStr;
}

function gerarFaturaHTML(fatura, pecas){
	let faturaHTML = `<html>\n`;
	faturaHTML += `<p>Fatura ${fatura.cliente}</p>\n`;
	faturaHTML += "<ul>\n";
	for (let apre of fatura.apresentacoes) {
		faturaHTML += `<li>${getPeca(pecas, apre).nome}: ${formatarMoeda(calcularTotalApresentacao(pecas, apre))} (${apre.audiencia} assentos)</li>\n`;
	}
	faturaHTML += `</ul>\n`;
	faturaHTML += `<p>Valor total: ${formatarMoeda(calcularTotalFatura(pecas, fatura.apresentacoes))}</p>\n`;
	faturaHTML += `<p>Créditos acumulados: ${calcularTotalCreditos(pecas, fatura.apresentacoes)}</p>\n`;
	faturaHTML += `</html>\n`
	return faturaHTML;
}

const faturas = JSON.parse(readFileSync('./faturas.json'));
const pecas = JSON.parse(readFileSync('./pecas.json'));
const faturaStr = gerarFaturaStr(faturas, pecas);
const faturaHTML = gerarFaturaHTML(faturas, pecas);
console.log(faturaStr);
console.log(faturaHTML);
