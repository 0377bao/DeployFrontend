import { styleMessage } from '../constants';
import request from '../utils/httpRequest';
import toast from 'react-hot-toast';
import parseToken from '../utils/parseToken';

export const searchCustomer = async (customerID) => {
    try {
        const res = await request.get(`/api/customer/find/${customerID}`);
        return res?.data?.data || null;
    } catch (error) {
        console.error('Error searching customer:', error);
        throw new Error(error.response.data);
    }
};

export const getAllCustomer = async (page) => {
    try {
        const res = await request.get('/api/customer/list', {
            params: {
                page,
            },
        });
        return res?.data || null;
    } catch (err) {
        console.log(err);
        toast.error(
            Array.isArray(err.response.data.message) ? err.response.data.message[0] : err.response.data.message,
            styleMessage,
        );
        return err;
    }
};

export const filterCustomer = async (optionFilter = {}) => {
    try {
        const res = await request.post('/api/customer/filter', {
            ...optionFilter,
        });
        return res?.data?.data || [];
    } catch (err) {
        console.log(err);
        return err;
    }
};

export const fetchListHistoryOrderCustomer = async (customerID, page = 1) => {
    try {
        const token = parseToken('tokenUser');
        const warehouse = parseToken('warehouse');
        const res = await request.post(
            `/api/customer/history-customer`,
            {
                customerID: customerID,
                page,
            },
            {
                headers: {
                    token: `Beare ${token.accessToken}`,
                    employeeid: token.employeeID,
                    warehouseid: warehouse.warehouseID,
                },
            },
        );
        return res.data || null;
    } catch (err) {
        console.log(err);
        return err;
    }
};

export const getAllCustomerNotPagination = async () => {
    try {
        const res = await request.get('/api/customer/list-not-pagination');
        return res?.data?.data || [];
    } catch (err) {
        console.log(err);
        toast.error(
            Array.isArray(err.response.data.message) ? err.response.data.message[0] : err.response.data.message,
            styleMessage,
        );
        return err;
    }
};
