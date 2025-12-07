import { styleMessage } from '../constants';
import request from '../utils/httpRequest';
const HTTP_SHELF = '/api/shelf/get-shelf-of-warehouse/';
import toast from 'react-hot-toast';

export const getAllShelfOfWarehouse = async ({ warehouseID, headers }) => {
    try {
        const res = await request.get(`${HTTP_SHELF}${warehouseID}`, {
            headers: {
                ...headers,
            },
        });
        return res.data;
    } catch (err) {
        toast.error(
            Array.isArray(err.response.data.message) ? err.response.data.message[0] : err.response.data.message,
            styleMessage,
        );
        console.log(err);

        return err;
    }
};
