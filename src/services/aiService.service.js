import toast from 'react-hot-toast';
import request from '../utils/httpRequest';
import parseToken from '../utils/parseToken';
import { styleMessage } from '../constants';

export const chatWithBot = async (payload) => {
    try {
        const token = parseToken('tokenUser');
        const warehouse = parseToken('warehouse');

        const res = await request.post(
            `/api/dialog-flow-cx/chat`,
            { ...payload },
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

export const initChatBox = async () => {
    try {
        const token = parseToken('tokenUser');
        const warehouse = parseToken('warehouse');

        const res = await request.post(
            `/api/dialog-flow-cx/init`,
            {},
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
