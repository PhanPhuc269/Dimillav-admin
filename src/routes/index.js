const authRoute=require('../components/auth/auth');
const dashboardRoute=require('../components/dashboard/dashboardRoute');
const pagesRoute=require('../components/pages/pagesRoute');

const settingRouter=require('../components/setting/settingRoute');
const productRouter=require('../components/product/productRoute');

function router(app)
{
   app.use('/', dashboardRoute);
   app.use('/auth', authRoute);
   app.use('/pages', pagesRoute);
   app.use('/setting', settingRouter);
   app.use('/product', productRouter);



}

module.exports = router