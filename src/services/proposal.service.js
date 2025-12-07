import toast from 'react-hot-toast';
import request from '../utils/httpRequest';
import parseToken from '../utils/parseToken';
import { styleMessage } from '../constants';

export const fetchProposal = async (type = 'warehouse', id, status = 'COMPLETED', page = 1) => {
    try {
        const option = {};
        if (type == 'warehouse') option.warehouseID = id;
        else option.employeeIDCreate = id;
        const token = parseToken('tokenUser');
        const warehouse = parseToken('warehouse');
        const res = await request.post(
            '/api/proposal/filter-proposal',
            {
                status,
                page,
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

export const fetchProposalMissingOrderPurchase = async () => {
    try {
        const token = parseToken('tokenUser');

        const warehouse = parseToken('warehouse');
        const res = await request.get('/api/proposal/get-proposal-missing', {
            params: {
                warehouseID: warehouse.warehouseID,
            },
            headers: {
                token: `Bearer ${token.accessToken}`,
                employeeid: token.employeeID,
                warehouseid: warehouse.warehouseID,
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

export const fetchFilterProposal = async (params) => {
    try {
        const token = parseToken('tokenUser');
        const warehouse = parseToken('warehouse');
        const res = await request.post(
            '/api/proposal/filter-proposal',
            {
                ...params,
                warehouseID: warehouse.warehouseID,
            },
            {
                headers: {
                    token: `Bearer ${token.accessToken}`,
                    employeeid: token.employeeID,
                    warehouseid: warehouse.warehouseID,
                },
            },
        );
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

export const createOrderReleaseProposal = async (data) => {
    try {
        const tokenUser = parseToken('tokenUser');
        const warehouse = parseToken('warehouse');
        const res = await request.post('/api/proposal/create-release-proposal', data, {
            headers: {
                token: `Bearer ${tokenUser.accessToken}`,
                employeeID: tokenUser.employeeID,
                warehouseID: warehouse.warehouseID,
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

export const getAllOrderReleaseProposal = async (page = 1, optionFilter = {}) => {
    try {
        const tokenUser = parseToken('tokenUser');
        const warehouse = parseToken('warehouse');
        const res = await request.get('/api/proposal/get-release-proposal', {
            params: {
                page,
                ...optionFilter,
            },
            headers: {
                token: `Bearer ${tokenUser.accessToken}`,
                employeeid: tokenUser.employeeID,
                warehouseid: warehouse.warehouseID,
            },
        });
        return res.data;
    } catch (err) {
        console.log(err);
        toast.error(
            Array.isArray(err.response.data.message) ? err.response.data.message[0] : err.response.data.message,
            styleMessage,
        );

        return err;
    }
};

export const getOrderReleaseProposal = async (orderReleaseProposalID) => {
    try {
        const tokenUser = parseToken('tokenUser');
        const warehouse = parseToken('warehouse');
        const res = await request.get(`/api/proposal/get-release-proposal-detail/${orderReleaseProposalID}`, {
            headers: {
                token: `Bearer ${tokenUser.accessToken}`,
                employeeid: tokenUser.employeeID,
                warehouseid: warehouse.warehouseID,
            },
        });
        return res.data.data;
    } catch (err) {
        console.log(err);
        toast.error(
            Array.isArray(err.response.data.message) ? err.response.data.message[0] : err.response.data.message,
            styleMessage,
        );
        return err;
    }
};

export const updateStatusOrderReleaseProposal = async (data) => {
    try {
        const tokenUser = parseToken('tokenUser');
        const warehouse = parseToken('warehouse');
        const res = await request.post('/api/proposal/approve-release-proposal', data, {
            headers: {
                token: `Bearer ${tokenUser.accessToken}`,
                employeeID: tokenUser.employeeID,
                warehouseID: warehouse.warehouseID,
            },
        });
        return res;
    } catch (err) {
        console.log(err);
        toast.error(
            Array.isArray(err.response.data.message) ? err.response.data.message[0] : err.response.data.message,
            styleMessage,
        );
        return err;
    }
};

export const searchOrderReleaseProposal = async (orderReleaseProposalID, option = {}) => {
    try {
        const tokenUser = parseToken('tokenUser');
        const res = await request.post(
            '/api/proposal/search-release-proposal',
            {
                orderReleaseProposalID,
                ...option,
            },
            {
                headers: {
                    token: `Bearer ${tokenUser.accessToken}`,
                    employeeID: tokenUser.employeeID,
                },
            },
        );
        return res;
    } catch (err) {
        console.log(err);
        toast.error(
            Array.isArray(err.response.data.message) ? err.response.data.message[0] : err.response.data.message,
            styleMessage,
        );
        return err;
    }
};

export const getAllOrderReleaseProposalCanApply = async () => {
    try {
        const tokenUser = parseToken('tokenUser');
        const warehouse = parseToken('warehouse');
        const res = await request.get('/api/proposal/get-release-order-proposals-can-apply', {
            headers: {
                token: `Bearer ${tokenUser.accessToken}`,
                employeeid: tokenUser.employeeID,
                warehouseid: warehouse.warehouseID,
            },
        });
        return res.data.data;
    } catch (err) {
        console.log(err);
        toast.error(
            Array.isArray(err.response.data.message) ? err.response.data.message[0] : err.response.data.message,
            styleMessage,
        );

        return err;
    }
};
