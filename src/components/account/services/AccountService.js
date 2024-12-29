const User = require('@components/auth/models/Admin');
const fs = require('fs');
const path = require('path');
const jwt = require('jsonwebtoken');
require('dotenv').config();

class AccountService {
    async getAccounts(query, page=1, limit=3, sortField, sortOrder) {
        const searchQuery = query ? {
            $or: [
                { name: new RegExp(query, 'i') },
                { email: new RegExp(query, 'i') }
            ]
        } : {};

        // Đặt giá trị mặc định cho sortField nếu không xác định
        const validSortFields = ['name', 'email', 'registrationTime'];
        if (!validSortFields.includes(sortField)) {
            sortField = 'name'; // Giá trị mặc định
        }

        const options = {
            page: parseInt(page, 10) || 1,
            limit: parseInt(limit, 10) || 10,
            sort: { [sortField]: sortOrder === 'desc' ? -1 : 1 } // Sắp xếp theo trường và thứ tự
        };
        
        const result = await User.paginate(searchQuery, options);


        // Tạo token cho mỗi tài khoản
        const accountsWithToken = result.docs.map((account) => {
            const token = jwt.sign({ id: account._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
            return {
                ...account.toObject(),
                token, // Thêm token vào tài khoản
            };
        });

        return { ...result, docs: accountsWithToken }; // Trả về danh sách kèm token
    }
    async banAccount(token, reason) {
        try {
            // Giải mã token để lấy ID tài khoản
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            const accountId = decoded.id;
    
            // Tìm tài khoản trong cơ sở dữ liệu
            const account = await User.findById(accountId);
    
            if (!account) {
                return { success: false, message: 'Account not found.' };
            }
    
            // Cập nhật trạng thái tài khoản
            account.status = 'banned';
            account.banReason = reason || 'No reason provided';
            await account.save();
    
            return {
                success: true,
                account: {
                    id: account._id,
                    username: account.username,
                    status: account.status,
                    banReason: account.banReason,
                },
            };
        } catch (error) {
            console.error('Service Error:', error);
            throw new Error('Failed to ban account.');
        }
    }
    async banAccountList(tokens, reason) {
        try {
            const accountIds = tokens.map((token) => {
                const decoded = jwt.verify(token, process.env.JWT_SECRET);
                return decoded.id;
            });
    
            // Cập nhật trạng thái cho danh sách tài khoản
            const result = await User.updateMany(
                { _id: { $in: accountIds } },
                { status: 'banned', banReason: reason || 'No reason provided' }
            );
    
            return { success: true, modifiedCount: result.nModified };
        } catch (error) {
            console.error('Service Error:', error);
            throw new Error('Failed to ban accounts.');
        }
    }
    async unbanAccount(token) {
        try {
            // Giải mã token để lấy ID tài khoản
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            const accountId = decoded.id;
    
            // Tìm tài khoản trong cơ sở dữ liệu
            const account = await User.findById(accountId);
    
            if (!account) {
                return { success: false, message: 'Account not found.' };
            }
    
            // Cập nhật trạng thái tài khoản
            account.status = 'active';
            account.banReason = null;
            await account.save();
    
            return {
                success: true,
                account: {
                    id: account._id,
                    username: account.username,
                    status: account.status,
                    banReason: account.banReason,
                },
            };
        } catch (error) {
            console.error('Service Error:', error);
            throw new Error('Failed to unban account.');
        }
    }
    async unbanAccountList(tokens) {
        try {
            const accountIds = tokens.map((token) => {
                const decoded = jwt.verify(token, process.env.JWT_SECRET);
                return decoded.id;
            });
    
            // Cập nhật trạng thái cho danh sách tài khoản
            const result = await User.updateMany(
                { _id: { $in: accountIds } },
                { status: 'active', banReason: null }
            );
    
            return { success: true, modifiedCount: result.nModified };
        } catch (error) {
            console.error('Service Error:', error);
            throw new Error('Failed to unban accounts.');
        }
    }
}

module.exports = new AccountService();


