
const { mutipleMongooseToObject ,mongooseToObject } = require('@utils/mongoose');
const crypto = require('crypto');
const passport = require('passport');
const UserService = require('../services/UserService');


class AuthController{
    viewRegistration(req,res,next){
        res.render('registration');
    }
    async register(req, res, next) {
        const { username, email, password } = req.body;
        try {
            const user = await UserService.registerUser(username, email, password);
            req.logIn(user, (err) => {
                if (err) {
                    return next(err);
                }
                return res.status(201).json('Login is successful'); // Redirect về trang chủ sau khi xác thực
            });
        } catch (error) {
            if (error.message === 'Username already exists' || error.message === 'Email already exists'|| error.message === 'Invalid email format') {
                return res.status(400).json({ message: error.message });
            }
            next(error);
        }
    }
    // [GET] /confirm/:token
    async confirmAccount(req, res, next) {
        try {
            const user = await UserService.confirmAccount(req.params.token);
            res.redirect('/');
        } catch (error) {
            res.status(400).json({ message: error.message });
        }
    }
    // [GET] /forgot-password
    viewForgotPassword(req, res, next) {
        res.render('forgot-password');
    }

    // [POST] /forgot-password
    async forgotPassword(req, res, next) {
        const { email } = req.body;
        try {
            const user = await UserService.findUserByEmail(email);
            if (!user) {
                return res.status(404).json({ message: 'User not found' });
            }
            await UserService.sendVerificationCodeWithSendGrid(req, user);
            res.json({ message: 'Verification code sent to your email' });
        } catch (error) {
            next(error);
        }
    }

    // [POST] /verify-code
    async verifyCode(req, res, next) {
        const { email, verificationCode } = req.body;
        try {
            const token = await UserService.verifyCode(req, email, verificationCode);
            res.json({ token });
        } catch (error) {
            res.status(400).json({ message: error.message });
        }
    }

    // [GET] /reset-password/:token
    viewResetPassword(req, res, next) {
        res.render('reset-password', { token: req.params.token });
    }

    // [POST] /reset-password/:token
    async resetPassword(req, res, next) {
        const { password, confirmPassword } = req.body;
        if (password !== confirmPassword) {
            return res.status(400).json({ message: 'Passwords do not match' });
        }
        try {
            const user = await UserService.resetPassword(req.params.token, password);
            res.redirect('/login');
        } catch (error) {
            res.status(400).json({ message: error.message });
        }
    }
    // [GET] /verify
    async waitingForConfirmation(req, res, next) {
        const user = mongooseToObject(await UserService.findUserByUserId(req.user._id));
        UserService.sendConfirmationEmailWithSendGrid(user);
        res.render('waiting-confirmation', {
            username: user.username,
            email: user.email,
            message: 'A new confirmation email has been sent.',
        })
    }
    // [GET] /check-confirmation
    async checkConfirmation (req, res,next) {
        const user = await UserService.findUserByUserId(req.user._id);
        if (user && user.isConfirmed) {
             res.json({ isConfirmed: true });
        } else {
             res.json({ isConfirmed: false });
        }
    }
    // [POST] /resend-confirmation
    async reSendConfirmation(req, res, next) {
        const user = await UserService.findUserByUserId(req.user._id);

        if (!user) {
            return res.status(404).send('User not found');
        }

        if (user.isConfirmed) {
            return res.redirect('/');
        }

        // Gửi lại email xác nhận
        await UserService.sendConfirmationEmailWithSendGrid(user);

        res.render('waiting-confirmation', {
            username: user.username,
            email: user.email,
            message: 'A new confirmation email has been sent.',
        })
    }
    // [GET] /login
    viewLogin(req, res, next) {
        if(req.isAuthenticated()){
            return res.redirect('/');
        }
        const email = req.flash('email')[0] || '';
        res.render('login', { email });
    }
    // [POST] /login
    async login(req, res, next) {
        passport.authenticate('local', (err, user, info) => {
            if (err) {
                return next(err);
            }
            if (!user) {
                req.flash('error_msg', 'Sai email hoặc mật khẩu');
                req.flash('email', req.body.email);
                return res.redirect('/login');
            }
            req.logIn(user, (err) => {
                if (err) {
                    return next(err);
                }
                if (!user.isConfirmed) {
                    return res.redirect('/verify'); // Redirect đến trang xác thực email
                }
                return res.redirect('/');
            });
        })(req, res, next);
    }
    // [GET] /logout
    logout (req, res,next){
        req.logout((err) => {
            if (err) {
                return res.status(500).send('Error logging out');
            }
            res.redirect('/login'); // Chuyển hướng về trang đăng nhập
        });
    };

}

module.exports = new AuthController();