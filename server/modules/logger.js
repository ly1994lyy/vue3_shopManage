var log4js = require('log4js');

log4js.configure({
  appenders: { cheese: { type: 'file', filename: 'cheese.log' } },
  categories: { default: { appenders: ['cheese'], level: 'error' } }
});

exports.logger = function (level) {
    var logger = log4js.getLogger("cheese");
    logger.level = 'debug';
    return logger;
};

// 配合 express 使用的方法
// exports.use = function (app, level) {
//     app.use(log4js.connectLogger(log4js.getLogger('logInfo'), {
//         level: levels[level] || levels['debug'],
//         format: ':method :url :status'
//     }));
// };