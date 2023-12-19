// 导入 request 模块
const request = require('request')

// 自动匹配运单号所属的物流公司
function autoComNumber(orderno) {
  const url = `https://www.kuaidi100.com/autonumber/autoComNum?resultv2=1&text=${orderno}`
  return new Promise(function(resolve, reject) {
    request(url, (err, response, body) => {
      if (err) return reject({ status: 500, msg: err.message })
      // resolve(body)
      // console.log(body.num)
      body = JSON.parse(body)
      if (body.auto.length <= 0) return reject({ status: 501, msg: '无对应的物流公司' })
      resolve({ status: 200, msg: body.auto[0], comCode: body.auto[0].comCode })
    })
  })
}

async function getLogisticsInfo(req, res) {
  const result = await autoComNumber(req.params.orderno)

  if (result.status !== 200) {
    return {
      meta: {
        status: 500,
        message: '获取物流信息失败！'
      }
    }
  }

  const dataUrl = `https://www.kuaidi100.com/query?type=${result.comCode}&postid=${req.params.orderno}&temp=0.2595247267684455`
  request(dataUrl, (err, response, body) => {
    if (err) {
      return res.send({
        meta: {
          status: 501,
          message: '获取物流信息失败！'
        }
      })
    }
    // 获取物流信息成功
    return res.send({
      meta: {
        status: 200,
        message: '获取物流信息成功！'
      },
      data: (JSON.parse(body)).data
    })
  })
}

module.exports = {
  getLogisticsInfo
}
