/*处理未捕获异常的模块*/
const http=require('http')

const throwCount={
  uncaughtException:0,
  unhandledRejection:0,
}
//捕获错误信息
function handleUncaughtException(error,options){
  throwCount.uncaughtException+=1
  options.onError(error,'uncaughtException',throwCount.uncaughtException)
  if(throwCount.uncaughtException>1) return
  handleError(options)
}
//捕获 Promise 错误信息
function handleUnhandledRejection(error,options){
  throwCount.unhandledRejection+=1
  options.onError(error,'unhandledRejection',throwCount.unhandledRejection)
  if(throwCount.unhandledRejection>1) return
  handleError(options)
}

//遍历传入的 servers，监听 request 事件，在 未捕获错误触发 后，如果 client 继续发送 request，就关闭当前的 request，防止阻塞
function handleError(options){
  const {servers,killTimeout}=options
  for(let i=0;i<servers.length;i++){
    const server=servers[i]
    console.log(server instanceof http.Server,'aa28')
    //关闭当前请求的连接
    //todo:http.js 已经能自动关闭 connection 了?
    if(server instanceof http.Server){

      server.on('request',(request,response)=>{
        console.log(request.url,'request34');
        request.shouldKeepAlive=false
        response.shouldKeepAlive=false
        if(!response._header){
          response.setHeader('Connection','close')
        }
      })
    }
    //延迟退出
    const timer=setTimeout(()=>{
      process.exit(1)
    },killTimeout)

    if(timer && timer.unref){
      timer.unref()
    }
  }
}

//options={
//  killTimeout:Number 超时时间
//  onError:Function 处理 error 的 callback
//  servers:Array HttpServer
// }

//优雅地处理 error
function graceful(options={}){
  //默认超时时间为 30s
  // const {killTimeout=30*1000,onError=function(){},servers=[]}=options
  const {killTimeout=5*1000,onError=function(){},servers=[]}=options
  const opt={}
  opt.killTimeout=killTimeout
  opt.onError=onError
  opt.servers=servers
  //uncaughtException 用来监听未捕获的错误信息
  process.on('uncaughtException',error=> handleUncaughtException(error,options))
  //uncaughtRejection 用来监听未捕获的 Promise 错误信息
  process.on('unhandledRejection',error=> handleUnhandledRejection(error,options))

}

module.exports=graceful
