import toast from 'react-hot-toast';
import parseToken from '../utils/parseToken';
import request from '../utils/httpRequest';
import { styleMessage } from '../constants';

export const getAllBaseUnitsProduct = async () => {
    try {
        const token = parseToken('tokenUser');
        const warehouse = parseToken('warehouse');
        const warehouseID = warehouse.warehouseID;

        const res = await request.get(`/api/base-unit-product/get-all`, {
            headers: {
                token: `Bearer ${token.accessToken}`,
                employeeID: token.employeeID,
                warehouseID: warehouseID,
            },
        });
        return res.data || null;
    } catch (err) {
        toast.error(
            Array.isArray(err.response.data.message) ? err.response.data.message[0] : err.response.data.message,
            styleMessage,
        );
        console.log(err);

        return err;
    }
};
