import toast from 'react-hot-toast';
import { styleMessage } from '../constants';
import request from '../utils/httpRequest';
import parseToken from '../utils/parseToken';

export const getBoxDetails = async (warehouseID, boxID) => {
    try {
        const token = parseToken('tokenUser');
        console.log(token);

        const res = await request.get(`/api/batch/box-details`, {
            headers: {
                token: `Bearer ${token.accessToken}`,
                employeeID: token.employeeID,
                warehouseID: token.warehouseID,
            },
            params: {
                boxID: boxID,
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

export const getBoxesByBatchID = async (batchID) => {
    try {
        const token = parseToken('tokenUser');
        const warehouse = parseToken('warehouse');
        const res = await request.get(`/api/batch-box/get-all-box-by-batch-id`, {
            headers: {
                token: `Bearer ${token.accessToken}`,
                employeeID: token.employeeID,
                warehouseID: warehouse.warehouseID,
            },
            params: {
                batchID: batchID,
            },
        });
        return res?.data?.boxes || [];
    } catch (err) {
        toast.error(err.message, styleMessage);
        console.log(err);
        return err;
    }
};
