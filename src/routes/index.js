const authRoute=require('../components/auth/auth');
const dashboardRoute=require('../components/dashboard/dashboardRoute');
const pagesRoute=require('../components/pages/pagesRoute');

const settingRouter=require('../components/setting/settingRoute');
function router(app)
{
   app.use('/', authRoute);
   app.use('/pages', pagesRoute);
   app.use('/setting', settingRouter);
   app.use('/dashboard', dashboardRoute);


}

module.exports = router