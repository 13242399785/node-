// console.log('hello world!');
const 
    https = require('https'),
    fs = require('fs'),
    path = require('path'),    
    express=require('express'),
    app=express(),
    cheerio = require('cheerio');

//设置跨域访问
app.all('*', function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "X-Requested-With");
    res.header("Access-Control-Allow-Methods","PUT,POST,GET,DELETE,OPTIONS");
    res.header("X-Powered-By",' 3.2.1');
    res.header("Content-Type", "application/json;charset=utf-8");
    next();
 });

class crawlData {

    constructor ( page ) {

        this.currentPage = 1;
        this.page = page;

        this.baseUrl = 'https://www.liepin.com/zhaopin/?isAnalysis=&dqs=&pubTime=&salary=&subIndustry=&industryType=&compscale=&key=%E5%89%8D%E7%AB%AF%E5%BC%80%E5%8F%91&init=-1&searchType=1&headckid=b41b3a1f788e456c&compkind=&fromSearchBtn=2&sortFlag=15&ckid=e0769e995864e9e1&degradeFlag=0&jobKind=&industries=&clean_condition=&siTag=D_7XS8J-xxxQY6y2bMqEWQ%7EfA9rXquZc5IkJpXC-Ycixw&d_sfrom=search_prime&d_ckId=ec6119ede4a8421d04cde68240799352&d_curPage=';

        this.init();
    }
    init () {
        let _self = this;

        let time = setInterval(function () {

            if(_self.currentPage > _self.page) {
                clearInterval(time);
            }
            else{
                console.log('第 ' + _self.currentPage + ' 个爬虫请求发出');
                _self.getDataPackage(_self.baseUrl + (_self.currentPage + 1) + '&d_pageSize=40&d_headId=ad878683a46e56bca93e6f921e59a95&curPage=' + _self.currentPage, _self.currentPage);
                _self.currentPage ++;
            }

        }, 1000 * 2);
    }
    getDataPackage (url, curPage) {
        console.log(url);
        let _self = this;
        https.get(url, function(response){
            var chunks = [];
            var size = 0;
            response.on('data',function(chunk){
                chunks.push(chunk);
                size += chunk.length;
            });
            response.on('end',function(){
                let data = Buffer.concat(chunks, size);
                let html = data.toString();

                let $ = cheerio.load(html);
                let result = [];

                $('.sojob-list').find('.job-info').each(i => {
                    let map = {};
                    //  个人基本信息
                    map.name = $('.job-info').eq(i).find('h3').attr('title');

                    let baseOthersInfo = $('.job-info').eq(i).find('.condition').attr('title');
                    baseOthersInfo = baseOthersInfo.split("_");

                    map.reward = baseOthersInfo[0];
                    map.area = baseOthersInfo[1];
                    map.experience = baseOthersInfo[2];

                    //  公司信息
                    let companyTagDom = $('.company-info').eq(i).find('.temptation').find('span');
                    let companyTag = [];
                    companyTagDom.each(i => {
                        companyTag.push(companyTagDom.eq(i).text());
                    });
                    let companyInfo = {
                        name: $('.company-info').eq(i).find('.company-name a').attr('title'),
                        href: $('.company-info').eq(i).find('.company-name a').attr('href'),
                        type: $('.company-info').eq(i).find('.industry-link a').text(),
                        tag: companyTag.join(',')
                    }
                    map.company = companyInfo;
                    result.push(map);
                    map = {};
                });
                let dataStr = JSON.stringify(result).trim().replace(/^\[/, curPage == 1 ? '[' : '').replace(/\]$/, curPage == _self.page ? ']' : ',');
                console.log(dataStr)
                fs.readFile('./public/jobs1.txt', function (err, data) {
                    if (err) {
                        return console.error(err);
                    }
                    app.get('/getList',function(req,res){
                        console.log(data.toString())
                        res.send(data.toString())
                    })
                    console.log("异步读取:"+data.toString())
                })
                fs.writeFile('./public/jobs1.txt', dataStr, { 'flag': 'a' }, function(err) {
                    // if(err) {throw err;}
                    console.log('写入成功');
                });
            });
        });
    }
}
//  一个数据包40条，这里是99 * 40 = 3960条

//首页配置
app.get('/',function(req,res){
    // res.send('<h1 style="text-align:center;position:absolute;top:50%;color:red;">welcome to 首页!</h1>')
    res.send(new crawlData(1))
})
//静态文件
app.use(express.static(path.join(__dirname, 'public')))

var server=app.listen(6767,function(data){
    var host=server.address().address;
    var port =server.address().port;
    console.log("Look: http://%s:%s","192.168.5.147",port)
})