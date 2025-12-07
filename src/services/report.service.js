import toast from 'react-hot-toast';
import request from '../utils/httpRequest';
import parseToken from '../utils/parseToken';

export const getReportStockWarehouse = async (option = { quarter: '', year: '' }) => {
    try {
        const token = parseToken('tokenUser');
        const warehouse = parseToken('warehouse');
        const res = await request.post(
            '/api/report',
            {
                ...option,
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
        toast.error(
            Array.isArray(err.response.data.message) ? err.response.data.message[0] : err.response.data.message,
        );
        throw new Error(err);
    }
};
