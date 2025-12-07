import toast from 'react-hot-toast';
import request, { post } from '../utils/httpRequest';
import parseToken from '../utils/parseToken';
import { styleMessage } from '../constants';

export const getAllCategories = async (page = 1) => {
    try {
        const token = parseToken('tokenUser');
        const result = await request.get(`/api/category-product/get-all-categories?page=${page}`, {
            headers: {
                token: `Beare ${token.accessToken}`,
                employeeid: token.employeeID,
            },
        });
        return result.data || null;
    } catch (err) {
        console.log(err);
        return;
    }
};

export const createCategoryProduct = async ({ categoryID, categoryName }) => {
    try {
        const token = parseToken('tokenUser');
        const result = await post(
            '/api/category-product/create-category',
            {
                categoryID,
                categoryName,
            },
            token.accessToken,
            token.employeeID,
        );
        toast.success(result.message, styleMessage);
        return result || null;
    } catch (err) {
        console.log(err);
        toast.error('Tạo nhóm sản phẩm không thành công', styleMessage);
        return;
    }
};

export const searchCategoryProduct = async (keyword) => {
    try {
        const token = parseToken('tokenUser');
        const res = await request.post(
            '/api/category-product/search-category',
            {
                categoryID: keyword,
            },
            {
                headers: {
                    token: `Beare ${token.accessToken}`,
                    employeeid: token.employeeID,
                },
            },
        );
        return res.data || null;
    } catch (err) {
        console.log(err);
        toast.error(err.response.data.message, styleMessage);
        return err.response.data;
    }
};
export const getAllCategoriesForCreateProduct = async () => {
    try {
        const token = parseToken('tokenUser');
        const res = await request.get(`/api/category-product/all-categories-create-product`, {
            headers: {
                token: `Beare ${token.accessToken}`,
                employeeid: token.employeeID,
            },
        });
        return res.data || null;
    } catch (err) {
        toast.error(
            Array.isArray(err.response.data.message) ? err.response.data.message[0] : err.response.data.message,
            styleMessage,
        );
        console.log(err);
        return err.response.data;
    }
};
