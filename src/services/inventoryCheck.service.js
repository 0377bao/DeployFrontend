import toast from 'react-hot-toast';
import { styleMessage } from '../constants';
import request from '../utils/httpRequest';
import parseToken from '../utils/parseToken';

export const getAllInventoryCheck = async (warehouseID, currentPage) => {
    try {
        const token = parseToken('tokenUser');
        console.log(token);

        const res = await request.get(`/api/inventory-check/get-all-inventory-checks`, {
            headers: {
                token: `Bearer ${token.accessToken}`,
                employeeID: token.employeeID,
                warehouseID: token.warehouseID,
            },
            params: {
                warehouseID: warehouseID,
                page: currentPage,
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
export const updateInventoryCheck = async (status, inventoryCheckID) => {
    try {
        const token = parseToken('tokenUser');
        const warehouse = parseToken('warehouse');

        const res = await request.post(
            `/api/inventory-check/update-inventory-checks`,
            {
                warehouseID: warehouse.warehouseID,
                status: status,
                inventoryCheckID: inventoryCheckID,
            },
            {
                headers: {
                    token: `Bearer ${token.accessToken}`,
                    employeeID: token.employeeID,
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
export const getFilterInventoryCheck = async ({
    warehouseID,
    inventoryCheckID,
    status,
    checkStatus,
    createdAt,
    employeeName,
    currentPage,
}) => {
    try {
        const token = parseToken('tokenUser');
        console.log(token);

        const res = await request.get(`/api/inventory-check/filter-inventory-checks`, {
            headers: {
                token: `Bearer ${token.accessToken}`,
                employeeID: token.employeeID,
                warehouseID: token.warehouseID,
            },
            params: {
                warehouseID: warehouseID,
                inventoryCheckID: inventoryCheckID,
                status: status,
                checkStatus: checkStatus,
                createdAt: createdAt,
                employeeName: employeeName,
                page: currentPage,
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
