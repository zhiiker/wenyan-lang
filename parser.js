try{
var fs = require('fs')
var hanzi2num = require('./hanzi2num')
var hanzi2pinyin = require('./hanzi2pinyin')
}catch(e){}

const NUMBER_KEYWORDS = "又零一二三四五六七八九十百千万亿兆京分厘毫丝忽微".split("")

var KEYWORDS = {
	"吾有":["decl","uninit"],
	"有":["decl","init"],
	"數":["type","num"],
	"列":["type","arr"],
	"言":["type","str"],
	"術":["type","fun"],
	"爻":["type","bol"],
	"書之":["print"],
	"名之曰":["name"],
	"施":["call"],
	"曰":["assgn"],
	"噫":["discard"],
	"。":["endl"],

	"昔之":["rassgn",'a'],
	"今":["rassgn",'b'],
	"是矣":["rassgn",'c'],
	"其":["ans"],
	
	"乃得":["ctrl","ret"],
	"乃歸空無":["ctrl","retvoid"],
	"是謂":["ctrl","funend0"],
	"之術也":["ctrl","funend1"],
	"必先得":["ctrl","funarg"],
	"是術曰":["ctrl","funbody"],
	"欲行是術":["ctrl","funstart"],
	"也":["ctrl","end"],
	"凡":["ctrl","for"],
	"中之":["ctrl","forin"],
	"恆為是":["ctrl","whiletrue"],
	"為是":["ctrl","whilen0"],
	"遍":["ctrl","whilen1"],
	"乃止":["ctrl","break"],

	"若非":["ctrl","else"],
	"若":["ctrl","if"],
	"者":["ctrl","conj"],

	"夫":["expr"],

	"等於":["cmp","=="],
	"弗等於":["cmp","!="],
	"弗大於":["cmp","<="],
	"弗小於":["cmp",">="],
	"大於":["cmp",">"],
	"小於":["cmp","<"],


	"加":["op","+"],
	"減":["op","-"],
	"乘":["op","*"],
	"除":["op","/"],
	"中有陽乎":["lop","||"],
	"中無陰乎":["lop","&&"],
	"變":["not"],

	"以":["operand","l"],
	"於":["operand","r"],

	"之長":["ctnr","len"],
	"之":["ctnr","subs"],
	"充":["ctnr","push"],
	"銜":["ctnr","cat"],
	"其餘":["ctnr","rest"],

	"陰":["bool",false],
	"陽":["bool",true],

	"批曰":["comment"],

}
var ke = Object.entries(KEYWORDS);
ke.sort((a,b)=>b[0].length-a[0].length);
KEYWORDS=Object.fromEntries(ke);
const SYNONYMS = {
	"今有":"吾有",
	"云云":"也",
	"。":"",
	"乃行是術曰":"是術曰",
}

function preprocess(txt){
	txt = txt.replace(/[\n\r\t ]/g,"");

	txt = txt.replace(/「「/g,"【").replace(/」」/g,"】");
	var s = txt.replace(/[「」]/g,"$").split("$");
	
	var t = "";
	for (var i = 0; i < s.length; i++){
		if (i % 2 == 0){
			var u = s[i].replace(/[【】]/g,"$").split("$");
			for (var j = 0;j < u.length; j++){
				if (j % 2 == 0){
					for (var k in SYNONYMS){
						u[j] = u[j].replace(new RegExp(k,'g'),SYNONYMS[k])
					}
					t += u[j];
				}else{
					t += "【"+u[j]+"】"
				}
			}
		}else{
			t += "「"+s[i]+"」"
		}
	}
	return t;
}

function assert(b){
	if (!b){
		console.log("Parse Error");
		// process.exit();
	}
}
var tmpVarCnt = 0;
var randVarCnt = 0;
function randVar(){
	randVarCnt++;
	return "_rand"+randVarCnt;
}
function currTmpVar(){
	return "_ans"+tmpVarCnt;
}
function nextTmpVar(){
	tmpVarCnt++;
	return "_ans"+tmpVarCnt;
}
function prevTmpVar(n){
	return "_ans"+(tmpVarCnt-n+1);
}


function wy2tokens(txt){
	var tokens = [];
	var tok = "";
	var idt = false;
	var num = false;
	var data = false;
	var i = 0;

	function enddata(){
		if (data){
			tokens.push(["data",tok]);
			data = false;
			tok = "";
		}
	}
	function endnum(){
		if (num){
			tokens.push(["num",hanzi2num(tok)])
			tok = ""
			num = false;
		}
	}

	while (i < txt.length){
		if (txt[i] == "「"){
			enddata();
			endnum();
			idt = true;
			tok="";
		}else if (txt[i] == "」"){
			tokens.push(["iden",tok])
			idt = false;
			tok = "";
		}else if (txt[i]=="【"){
			enddata();
			endnum();
			idt = true;
			tok="";
		}else if (txt[i]=="】"){
			tokens.push(["lit",tok])
			idt = false;
			tok = "";
		}else{
			if (idt){
				tok += txt[i]

			}else if (num){
				if (NUMBER_KEYWORDS.includes(txt[i])){
					tok += txt[i]
				}else{
					endnum();
					i--;
				}
			}else{
				var ok = false;
				for (var k in KEYWORDS){
					ok = true;
					for (var j = 0; j < k.length; j++){
						if (txt[i+j] != k[j]){
							ok = false;
							break;
						}
					}
					if (ok){
						enddata();
						tokens.push(KEYWORDS[k])
						i += k.length-1;
						break;
					}
				}
				if (!ok){
					if (NUMBER_KEYWORDS.includes(txt[i])){
						num = true;
						tok = txt[i];
					}else{
						tok += txt[i];
						data = true;
					}
				}
			}
		}
		i++;
	}
	if (tok.length){
		if (num){
			tokens.push(["num",hanzi2num(tok)]);
		}else if (data){
			tokens.push(["data",tok]);
		}else{
			assert(false);
		}
	}
	return tokens;
}

var iden2pinyin={}
function tokenRomanize(tokens){
	function noDup(x){
		for (var k in iden2pinyin){
			if (iden2pinyin[k]==x){
				return false;
			}
		}
		return true;
	}
	function isRoman(x){
		return x.replace(/[a-zA-Z\.]/g,'').length==0;
	}
	for (var i = 0; i < tokens.length; i++){
		if (tokens[i][0]=="iden" && !isRoman(tokens[i][1])){
			var r = iden2pinyin[tokens[i][1]]
			var key = tokens[i][1];
			if (r != undefined){
				tokens[i][1]=r;
			}else{
				r=hanzi2pinyin(tokens[i][1])
				while(!noDup(r)){
					r+="_";
				}
				tokens[i][1]=r
			}
			iden2pinyin[key]=r;
		}
	}
}

function tokens2asc(tokens){

	var asc = []
	var i = 0;
	while (i < tokens.length){
		if (tokens[i][0]=="decl" && tokens[i][1] == "uninit"){
			assert(tokens[i+1][0]=="num")
			assert(tokens[i+2][0] == "type")
			var x = {op:"var",count:tokens[i+1][1],type:tokens[i+2][1],values:[],names:[]};
			i+=3;
			while (tokens[i]&&tokens[i][0] == "assgn"){
				x.values.push(tokens[i+1]);
				i+=2;
			}
			if (tokens[i]&&tokens[i][0] == "name"){
				x.names.push(tokens[i+1][1]);
				i+=2;
			}
			while (tokens[i]&&tokens[i][0] == "assgn"){
				x.names.push(tokens[i+1][1]);
				i+=2;
			}
			asc.push(x);

		}else if (tokens[i][0]=="decl" && tokens[i][1] == "init"){
			assert(tokens[i+1][0]=="type");
			assert((tokens[i+2][0] == "data" || tokens[i+2][0] == "num"));

			var x = {op:"var",count:1,type:tokens[i+1][1],values:[tokens[i+2]]};
			i+=3;
			if (tokens[i][0] == "name"){
				x.names = [tokens[i+1][1]];
				i+=2;
			}
			asc.push(x);
		}else if (tokens[i][0]=="print"){
			asc.push({op:"print"});
			i++;
		}else if (tokens[i][0]=="ctrl"&&tokens[i][1]=="funstart"){
			var x = {op:"fun",arity:0,args:[]};
			i++;
			if (tokens[i][0]=="ctrl"&&tokens[i][1]=="funarg"){
				i++;
				while (!(tokens[i][0]=="ctrl"&&tokens[i][1]=="funbody")){
					if (tokens[i][0]=="num"){
						assert(tokens[i+1][0]=="type")
						var typ = tokens[i+1][1];
						var cnt = tokens[i][1];
						x.arity+=cnt
						i+=2;
						for (var j = 0; j < cnt; j++){
							assert(tokens[i+j*2][0]=="assgn");
							assert(tokens[i+j*2+1][0]=="iden");
							x.args.push({name:tokens[i+j*2+1][1],type:typ});
						}
						i+=cnt*2;
					}
				}
				
			}
			asc.push(x)
		}else if (tokens[i][0]=="ctrl"&&tokens[i][1]=="funbody"){
			asc.push({op:"funbody"});
			i++;
		}else if (tokens[i][0]=="ctrl"&&tokens[i][1]=="funend0"){
			assert(tokens[i+2][0]=="ctrl"&&tokens[i+2][1]=="funend1"&&tokens[i+1][0]=="iden")
			asc.push({op:"funend"});
			i+=3;
		}else if (tokens[i][0]=="ctrl"&&tokens[i][1]=="if"){
			var x = {op:"if",test:[]};
			i++;
			while(!(tokens[i][0]=="ctrl"&&tokens[i][1]=="conj")){
				x.test.push(tokens[i])
				i++;
			}
			i++;
			asc.push(x)
		}else if (tokens[i][0]=="ctrl"&&tokens[i][1]=="end"){
			asc.push({op:"end"})
			i++;
		}else if (tokens[i][0]=="ctrl"&&tokens[i][1]=="ret"){
			asc.push({op:"return",value:tokens[i+1]})
			i+=2;
		}else if (tokens[i][0]=="ctrl"&&tokens[i][1]=="retvoid"){
			asc.push({op:"return"})
			i+=1;
		}else if (tokens[i][0]=="ctrl"&&tokens[i][1]=="break"){
			asc.push({op:"break"});
			i+=1;
		}else if (tokens[i][0]=="ctrl"&&tokens[i][1]=="else"){
			asc.push({op:"else"})
			i+=1;
		}else if (tokens[i][0]=="op"){
			assert(tokens[i+2][0]=="operand")
			var x = {op:"op"+tokens[i][1]};
			if (tokens[i+2][1]=="l"){
				x.lhs=tokens[i+1];
				x.rhs=tokens[i+3];
			}else{
				x.lhs=tokens[i+3];
				x.rhs=tokens[i+1];
			}
			asc.push(x)
			i+=4
		}else if (tokens[i][0]=="not"){
			asc.push({op:"not",value:tokens[i+1]});
			i+=2;
		}else if (tokens[i][0]=="name"){
			assert(tokens[i+1][0]=="iden")
			var x = {op:"name",names:[tokens[i+1][1]]};
			i+=2;
			while(tokens[i]&&tokens[i][0]=="assgn"){
				x.names.push(tokens[i+1][1]);
				i+=2;
			}
			asc.push(x);
		}else if (tokens[i][0]=="call"){
			var x = {op:"call",fun:tokens[i+1][1],args:[]};
			i+=2;
			while(tokens[i]&&tokens[i][0]=="operand"&&tokens[i][1]=="r"){
				x.args.push(tokens[i+1]);
				i+=2;
			}
			asc.push(x);
		}else if (tokens[i][0]=="ctnr"&&tokens[i][1]=="push"){
			assert(tokens[i+2][0]=="operand"&&tokens[i+2][1]=="l");
			var x = {op:"push",container:tokens[i+1][1],values:[tokens[i+3]]};
			i+=4;
			while (tokens[i]&&tokens[i][0]=="operand"&&tokens[i][1]=="l"){
				x.values.push(tokens[i+1]);
				i+=2;
			}
			asc.push(x);

		}else if (tokens[i][0]=="expr"&&tokens[i+2][0]=="ctnr"&&tokens[i+2][1]=="subs"){
			assert(tokens[i+1][0]=="iden");
			var x = {op:"subscript",container:tokens[i+1][1],value:tokens[i+3]};
			asc.push(x);
			i+=4;
		}else if (tokens[i][0]=="expr"&&tokens[i+2][0]=="ctnr"&&tokens[i+2][1]=="len"){
			assert(tokens[i][0]=="iden");
			var x = {op:"length",container:tokens[i+1][1]}
			asc.push(x);
			i+=3;
		}else if (tokens[i][0]=="expr"&&tokens[i+3]&&tokens[i+3][0]=="lop"){
			var x = {op:"op"+tokens[i+3][1],lhs:tokens[i+1],rhs:tokens[i+2]}
			asc.push(x);
			i+=4;
		}else if (tokens[i][0]=="ctnr"&&tokens[i][1]=="cat"){
			var x = {op:"cat",containers:[tokens[i+1][1]]}
			i+=2;
			while(tokens[i][0]=="operand"&&tokens[i][1]=="l"){
				x.containers.push(tokens[i+1][1]);
				i+=2;
			}
			asc.push(x)
		}else if (tokens[i][0]=="ctrl"&&tokens[i][1]=="for"&&tokens[i+2][0]=="ctrl"&&tokens[i+2][1]=="forin"){
			var x = {op:"for",container:tokens[i+1][1],iterator:tokens[i+3][1]}
			i+=4;
			asc.push(x)
		}else if (tokens[i][0]=="ctrl"&&tokens[i][1]=="whiletrue"){
			asc.push({op:"whiletrue"});
			i++;
		}else if (tokens[i][0]=="ctrl"&&tokens[i][1]=="whilen0"){
			assert(tokens[i+2][1]=="whilen1");
			asc.push({op:"whilen",value:tokens[i+1]});
			i+=3;
		}else if (tokens[i][0]=="rassgn"&&tokens[i][1]=="a"){
			var x = {op:"reassign",lhs:tokens[i+1]}
			if (tokens[i+2][0]=="ctnr"&&tokens[i+2][1]=="subs"){
				x.rhs = tokens[i+6];
				x.lhssubs = tokens[i+3];
				i+=8;
			}else{
				assert(tokens[i+2][0]=="ctrl"&&tokens[i+2][1]=="conj");
				x.rhs = tokens[i+4];
				i+=6;
			}
			asc.push(x)
		}else if (tokens[i][0]=="discard"){
			asc.push({op:"discard"});
			i++;
		}else if (tokens[i][0]=="comment"){
			asc.push({op:"comment",value:tokens[i+1]});
			i+=2;
		}else{
			console.log("Unrecognized",tokens[i])
			i++;
		}
	}
	return asc;
}

function asc2js(asc){

	var js = ""
	var prevfun="";
	var curlvl = 0;
	var lastparenlvl=-1;
	var strayvar = 0;
	for (var i = 0; i < asc.length; i++){
		var a = asc[i];
		if (a.op == 'var'){
			for (var j = 0; j < a.count; j++){
				if (a.values[j]==undefined){
					a.values[j]=[]
				}
				var name = a.names[j]
				var value = a.values[j][1]
				if (name==undefined){
					name = nextTmpVar();
					strayvar ++;
				}
				if (a.values[j][0]=="lit"){
					value=`"${value}"`
				}
				if (value==undefined){

					if (a.type=="arr"){
						value="[]"
					}else if (a.type=="num"){
						value="0"
					}else if (a.type=="str"){
						value=`""`
					}else if (a.type=="bol"){
						value="false"
					}else if (a.type=="fun"){
						value="()=>0"
						prevfun=name;
					}
				}
				js += `var ${name}=${value};`
			}
		}else if (a.op == 'print'){
			js += `console.log(`;
			for (var j = 0; j < strayvar; j++){
				js += `${prevTmpVar(strayvar-j)}`
				if (j != strayvar-1){
					js += ","
				}
			}
			js+=");";
			strayvar = 0;
		}else if (a.op == 'fun'){
			js += prevfun+`=function(`
			for (var j = 0; j < a.arity; j++){
				js+=a.args[j].name;
				if (j != a.arity-1){
					js+=","
				}
			}
			js+=")"
		}else if (a.op == "funbody"){
			js += "{"
			curlvl++;
		}else if (a.op == "funend"){
			js += "};"
			curlvl--;
		}else if (a.op == "end"){
			js += "}"
			curlvl--;
			if (lastparenlvl == curlvl){
				js += ")";
				lastparenlvl = -1;
			}
			js += ";"
			
		}else if (a.op == "if"){
			js += "if (";
			var j = 0;
			while (j < a.test.length){
				if (a.test[j][0] == "cmp"){
					js += a.test[j][1]
				}else if (a.test[j][0] == "ctnr"){
					if (a.test[j][1]=="subs"){
						if (a.test[j+1][1]=="rest"){
							js += ".slice(1)"
						}else{
							js += "["+(a.test[j+1][1])+"-1]"
						}
						j++;
					}else if (a.test[j][1]=="len"){
						js += ".length"
					}
				}else{
					js+=a.test[j][1]
				}
				j++;
			}
			js += "){"
			curlvl++;
		}else if (a.op == "else"){
			js += "}else{"
		}else if (a.op == "return"){
			if (a.value){
				js += `return ${a.value[1]};`;
			}else{
				js += `return;`;
			}
		}else if (a.op.startsWith("op")){
			
			js += `var ${nextTmpVar()}=${a.lhs[1]}${a.op.slice(2)}${a.rhs[1]};`
			strayvar ++;
		}else if (a.op == "name"){
			
			for (var j = 0; j < a.names.length; j++){
				js += `var ${a.names[j]}=${prevTmpVar(strayvar-j)};`
			}
			strayvar-=a.names.length;
		}else if (a.op == "call"){
			js += `var ${nextTmpVar()}=${a.fun}(${a.args.map(x=>x[1]).join(",")});`
			strayvar ++;
		}else if (a.op == "subscript"){
			var idx =a.value[1];
			if (a.value[0]=="ctnr" && idx=="rest"){
				js += `var ${nextTmpVar()}=${a.container}.slice(1);`
				strayvar ++;
			}else{
				js += `var ${nextTmpVar()}=${a.container}[${idx}-1];`
				strayvar ++;
			}
		}else if (a.op == "cat"){
			js += `var ${nextTmpVar()}=${a.containers[0]}.concat(`+a.containers.slice(1).join(").concat(")+");"
			strayvar ++;
		}else if (a.op == "push"){
			js += `${a.container}.push(${a.values.map(x=>x[1]).join(",")});`
		}else if (a.op == "for"){
			if (a.container){
				js += `${a.container}.forEach(function(${a.iterator}){`
				lastparenlvl = curlvl
			}else{
				console.log("for loop varient not implemented yet")
				process.exit();
			}
			curlvl++;
		}else if (a.op == "whiletrue"){
			js += "while (true){";
			curlvl++;
		}else if (a.op == "whilen"){
			var v = randVar();
			js += `for (var ${v}=0;${v}<${a.value[1]};${v}++){`;
			curlvl++;
		}else if (a.op == "break"){
			js += "break;";
		}else if (a.op == "not"){
			js += `var ${nextTmpVar()}=!${a.value[1]};`
			strayvar++;
		}else if (a.op == "reassign"){
			var rhs = a.rhs;
			if (rhs[0]=="ans"){
				strayvar--;
				rhs[1] = currTmpVar();
			}
			var lhs = a.lhs[1];
			if (a.lhssubs){
				lhs += `[${a.lhssubs[1]}-1]`
			}
			js += `${lhs}=${rhs[1]};`
		}else if (a.op == "discard"){
			strayvar = 0;
		}else if (a.op == "comment"){
			js += `/*${a.value[1]}*/`
		}else{
			console.log(a.op)
		}
		// js+="\n"
	}
	return js;	
}

function compile(lang,txt,options={}){
	txt = preprocess(txt);

	console.log("\n\n=== [PASS 0] PREPROCESSER ===");
	console.log(txt);

	var tokens = wy2tokens(txt);

	console.log("\n\n=== [PASS 1] TOKENIZER ===");
	console.dir(tokens,{ depth: null , 'maxArrayLength': null})

	if (options.romanizeIdentifiers){
		tokenRomanize(tokens);
	}

	var asc = tokens2asc(tokens);

	console.log("\n\n=== [PASS 3] ABSTRACT SYNTAX CHAIN ===");
	console.dir(asc,{ depth: null , 'maxArrayLength': null})

	console.log("\n\n=== [PASS 4] COMPILER ===");
	var targ;
	if (lang == "js"){
		targ = asc2js(asc);
		console.log(targ);
	}else{
		console.log("Target language not supported.")
	}
	return targ;
}

try{
    module.exports = {KEYWORDS,NUMBER_KEYWORDS,SYNONYMS,compile};
}catch(e){}


