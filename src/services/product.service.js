import toast from 'react-hot-toast';
import request from '../utils/httpRequest';
import parseToken from '../utils/parseToken';
import { styleMessage } from '../constants';
import { uploadImage } from '../utils/uploadImage';
export const fetchProduct = async (page = 1) => {
    try {
        // call api
        const tokenUser = parseToken('tokenUser');
        const res = await request.get('/api/product/list', {
            params: {
                page,
            },
            headers: {
                token: `Bearer ${tokenUser.accessToken}`,
                employeeid: tokenUser.employeeID,
            },
        });
        return res?.data?.products || [];
    } catch (err) {
        throw new Error(err);
    }
};

export const fetchProductById = async (productID) => {
    try {
        const tokenUser = parseToken('tokenUser');
        const res = await request.get(`/api/product?productID=${productID}`, {
            headers: {
                token: `Bearer ${tokenUser.accessToken}`,
                employeeid: tokenUser.employeeID,
            },
        });
        return res?.data?.product || null;
    } catch {
        return null;
    }
};

export const getProductById = async (productID, warehouseID) => {
    try {
        const token = parseToken('tokenUser');

        const res = await request.get(`/api/product?productID=${productID}`, {
            headers: {
                token: `Bearer ${token.accessToken}`,
                employeeID: token.employeeID,
                warehouseID: warehouseID,
            },
        });
        return res;
    } catch (err) {
        toast.error(
            Array.isArray(err.response.data.message) ? err.response.data.message[0] : err.response.data.message,
            styleMessage,
        );
        console.log(err);

        return err;
    }
};

export const fetchAllProductCanExport = async (status = 'AVAILABLE') => {
    try {
        const token = parseToken('tokenUser');
        const res = await request.post(
            '/api/product/filter-option',
            {
                status,
            },
            {
                headers: {
                    token: `Bearer ${token.accessToken}`,
                    employeeid: token.employeeID,
                },
            },
        );
        return res?.data?.data || [];
    } catch (err) {
        console.log(err);
        return err;
    }
};

export const createProduct = async (data) => {
    try {
        const token = parseToken('tokenUser');
        const warehouse = parseToken('warehouse');
        const image = await uploadImage(data.image);
        const res = await request.post(
            '/api/product/create-product',
            { ...data, image },
            {
                headers: {
                    token: `Bearer ${token.accessToken}`,
                    employeeID: token.employeeID,
                    warehouseID: warehouse.warehouseID,
                },
            },
        );
        return res;
    } catch (err) {
        toast.error(
            Array.isArray(err.response.data.message) ? err.response.data.message[0] : err.response.data.message,
            styleMessage,
        );
        console.log(err);

        return err;
    }
};

export const getProductCanExportById = async (productID, warehouseID) => {
    try {
        const token = parseToken('tokenUser');

        const res = await request.get(`/api/product/export/${productID}`, {
            headers: {
                token: `Bearer ${token.accessToken}`,
                employeeID: token.employeeID,
                warehouseID: warehouseID,
            },
        });
        return res;
    } catch (err) {
        toast.error(
            Array.isArray(err.response.data.message) ? err.response.data.message[0] : err.response.data.message,
            styleMessage,
        );
        console.log(err);

        return err;
    }
};
