import toast from 'react-hot-toast';
import { styleMessage } from '../constants';
import request from '../utils/httpRequest';
import parseToken from '../utils/parseToken';

export const filter = async (filters) => {
    try {
        const token = parseToken('tokenUser');
        const warehouse = parseToken('warehouse');

        const res = await request.get(`/api/batch-move-log/filter`, {
            headers: {
                token: `Bearer ${token.accessToken}`,
                employeeID: token.employeeID,
                warehouseID: warehouse.warehouseID,
            },
            params: filters,
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
