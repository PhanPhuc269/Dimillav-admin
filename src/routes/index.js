const authRoute=require('../components/auth/auth');
const dashboardRoute=require('../components/dashboard/dashboardRoute');
const pagesRoute=require('../components/pages/pagesRoute');

const settingRouter=require('../components/setting/settingRoute');
const productRouter=require('../components/product/productRoute');
const orderRouter=require('../components/order/orderRoute');
const reportRouter=require('../components/report/reportRoute');
const accountRoute=require('../components/account/accountRoute');

function router(app)
{
   app.use('/', dashboardRoute);
   app.use('/auth', authRoute);
   app.use('/pages', pagesRoute);
   app.use('/setting', settingRouter);
   app.use('/order', orderRouter);
   app.use('/product', productRouter);
   app.use('/report', reportRouter);
   app.use('/account', accountRoute);

}

module.exports = router