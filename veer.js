const	
https = require('https'),
    	fs = require('fs'),
    	express=require('express'),
    	bodyParser=require('body-parser'),
    	iconv = require('iconv-lite'),
    	cheerio = require('cheerio'),
    	request = require('request');
// let url='https://www.qqtn.com/tx/weixintx_1.html';//地址

// let https=express();
// https.use(bodyParser.json())
// https.use(bodyParser.urlencoded({ extended: true }));
let count=1;

function init(){
	let a=1;
	let timer=setInterval(function(){
		if(a>10){//下载十页
			clearInterval(timer)
		}else{			
			console.log('第 ' + a + ' 个爬虫请求发出');
			url='https://www.veer.com/query/photo/?phrase=%E8%A1%A8%E6%83%85&page='+a+'&perpage=100&key=A9QD4J';
			console.log(url)
			acction(url,a);
			a++;
		}
	},1000*5)
}

init();//初始化

function acction(url,a){
	https.get(url,(res)=>{
		console.log('statusCode:', res.statusCode);
  		console.log('headers:', res.headers);
		let chunks=[],//节流集合
			size=0;
		res.on('data',(chunk)=>{
			process.stdout.write(chunk);
			console.log(111)
			chunks.push(chunk);
			size+=chunk.length;
			console.log(chunk)
		})
		res.on('error',(err)=>{
			console.log(err)
		})
		// res.on('end',()=>{
		// 	let data=Buffer.concat(chunks,size);
		// 	console.log(data)
		// 	// let utf8Buffer=iconv.decode(data,'gb2312')
		// 	let html=data.toString();
		// 	// console.log(html)
		// 	let $ = cheerio.load(html);
		// 	let results=[];//数据集合

		// 	// 分析html 
		// 	$('.search_results').find('.image_section').each(i => {
		// 		// console.log(i)	
		// 		let map={};
		// 		// map.name=$('.g-gxlist-imgbox li').eq(i).find('a').attr('title');//标题
		// 		map.img=$('.image_section').eq(i).find('.search_result_asset_link img').attr('src');//图片地址
		// 		console.log(map.img,i)
		// 		// map.time=$('.g-gxlist-imgbox li').eq(i).find('a em').text();//时间
		// 		// map.zan=$('.g-gxlist-imgbox li').eq(i).find('a b').text();//时间

		// 		//获取图片地址后缀
		// 		let houzui=map.img.substring(map.img.lastIndexOf('.'),map.img.length)
		// 		// console.log(map.img)
		// 		doloadImg(map.img,i,houzui)
				
		// 		results.push(map);
		// 	})
		// 	// console.log(results)
		// 	fs.writeFile('./public/veer/jobs.txt', JSON.stringify(results).trim().replace(/^\[/, a == 1 ? '[' : '').replace(/\]$/, a == 11 ? ']' : ','), { 'flag': 'a' }, function(err) {
	 //            // if(err) {throw err;}
	 //            console.log('写入成功');
	 //        });
		// 	console.log('数据传输完毕')
		// })
	})
}

//下载保存图片
function doloadImg(urls,name,houzui){//图片地址和文件名称
	https.get(urls,(res)=>{
		let imgData='';
		res.setEncoding('binary');//设置编码 否则图片下载下来并不能显示

		res.on('data',function(chunk){
			imgData+=chunk;
		})

		res.on('end',()=>{
			fs.writeFile('./public/veer/images/'+name+houzui,imgData,'binary',function(err){
				if(err){
					// console.log(err)
					console.log('下载失败')
				}else{
					// console.log('下载成功！')
				}
			})
		})
	})
}