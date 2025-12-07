import toast from 'react-hot-toast';
import { styleMessage } from '../constants';
import request from '../utils/httpRequest';
import parseToken from '../utils/parseToken';

export const validatePayloadCreateReceipt = (payload) => {
    if (!payload.proposalID) {
        toast.error('Vui lòng chọn phiếu đề xuất', styleMessage);
        return false;
    }
    if (!payload.orderPurchaseID) {
        toast.error('Vui lòng tạo mã phiếu', styleMessage);
        return false;
    }
    if (payload.orderPurchaseDetails.length === 0) {
        toast.error('Vui lòng thêm danh sách sản phẩm cần nhập', styleMessage);
        return false;
    }
    for (const item of payload.orderPurchaseDetails) {
        if (!item.batchID) {
            toast.error('Vui lòng nhập mã lô', styleMessage);
            return false;
        }
        if (!item.supplierID) {
            toast.error('Vui lòng nhập mã nhà cung cấp', styleMessage);
            return false;
        }
        if (!item.productID) {
            toast.error('Vui lòng nhập mã sản phẩm', styleMessage);
            return false;
        }
        if (!item.unitID) {
            toast.error('Vui lòng chọn đơn vị tính', styleMessage);
            return false;
        }
        if (!item.manufactureDate) {
            toast.error('Vui lòng nhập ngày sản xuất tại phần thêm chi tiết', styleMessage);
            return false;
        }
        if (!item.expiryDate) {
            toast.error('Vui lòng nhập ngày hết hạn tại phần thêm chi tiết', styleMessage);
            return false;
        }
        if (!item.actualQuantity) {
            toast.error('Vui lòng nhập số lượng sản phẩm thực tế', styleMessage);
            return false;
        }
        if (item.positions.length == 0) {
            toast.error('Vui lòng chọn vị trí lưu trữ taok phần thêm chi tiết', styleMessage);
            return false;
        }
    }
    return true;
};

export const saveReceipt = async (payload) => {
    try {
        const token = parseToken('tokenUser');
        const res = await request.post(
            '/api/order-purchase/create-order-purchase',
            {
                ...payload,
                employeeID: token.employeeID,
            },
            {
                headers: {
                    token: `Bearer ${token.accessToken}`,
                    employeeID: token.employeeID,
                    warehouseID: token.warehouseID,
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

export const fetchOrderMissing = async (warehouseID) => {
    console.log(warehouseID);
    try {
        const token = parseToken('tokenUser');
        console.log(token);

        const res = await request.get(`/api/order-purchase-missing/filter`, {
            headers: {
                token: `Bearer ${token.accessToken}`,
                employeeID: token.employeeID,
            },
            params: {
                warehouseID: warehouseID,
                employeeID: token.employeeID,
                status: 'PENDING',
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

export const fetchOrderMissingById = async (orderMissingID) => {
    try {
        const token = parseToken('tokenUser');
        const warehouse = parseToken('warehouse');
        const warehouseID = warehouse.warehouseID;

        const res = await request.get(`/api/order-purchase-missing/get-by-id/${orderMissingID}`, {
            headers: {
                token: `Bearer ${token.accessToken}`,
                employeeID: token.employeeID,
            },
            params: {
                warehouseID: warehouseID,
                employeeID: token.employeeID,
                status: 'PENDING',
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
export const filterOrderMissing = async (params) => {
    try {
        const token = parseToken('tokenUser');
        const warehouse = parseToken('warehouse');
        const warehouseID = warehouse.warehouseID;

        const res = await request.get(`/api/order-purchase-missing/filter`, {
            headers: {
                token: `Bearer ${token.accessToken}`,
                employeeID: token.employeeID,
                warehouseID: warehouseID,
            },
            params: {
                warehouseID: warehouseID,
                employeeID: token.employeeID,
                ...params,
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

export const fetchOrderPurchase = async (page = 1) => {
    try {
        const token = parseToken('tokenUser');
        const warehouse = parseToken('warehouse');

        const res = await request.get(`/api/order-purchase/get-all-order-purchase`, {
            headers: {
                token: `Bearer ${token.accessToken}`,
                employeeID: token.employeeID,
                warehouseID: warehouse.warehouseID,
            },
            params: {
                employeeID: token.employeeID,
                page: page,
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

export const filterOrderPurchase = async (filter) => {
    try {
        const token = parseToken('tokenUser');
        const warehouse = parseToken('warehouse');

        const res = await request.get(`/api/order-purchase/filter-order-purchase`, {
            headers: {
                token: `Bearer ${token.accessToken}`,
                employeeID: token.employeeID,
                warehouseID: warehouse.warehouseID,
            },
            params: {
                ...filter,
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

export const validatePayloadCreateReceiptMissing = (payload) => {
    if (!payload.orderPurchaseID) {
        toast.error('Vui lòng tạo mã phiếu', styleMessage);
        return false;
    }
    for (const item of payload.orderPurchaseDetails) {
        if (!item.batchID) {
            toast.error('Vui lòng nhập mã lô', styleMessage);
            return false;
        }
        if (!item.manufactureDate) {
            toast.error('Vui lòng nhập ngày sản xuất', styleMessage);
            return false;
        }
        if (!item.expiryDate) {
            toast.error('Vui lòng nhập ngày hết hạn', styleMessage);
            return false;
        }
        if (!item.actualQuantity) {
            toast.error('Vui lòng nhập số lượng nhập bù', styleMessage);
            return false;
        }
    }
    return true;
};

export const saveOrderRelease = async (payload) => {
    try {
        const token = parseToken('tokenUser');
        const warehouse = parseToken('warehouse');
        const res = await request.post(
            'api/order-release/create',
            {
                ...payload,
                warehouseID: warehouse.warehouseID,
                employeeID: token.employeeID,
            },
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

export const filterOrderRelease = async (params) => {
    try {
        const token = parseToken('tokenUser');
        const warehouse = parseToken('warehouse');
        const res = await request.post(
            '/api/order-release/filter-order-release',
            {
                ...params,
                warehouseID: warehouse.warehouseID,
            },
            {
                headers: {
                    token: `Bearer ${token.accessToken}`,
                    employeeID: token.employeeID,
                    warehouseID: warehouse.warehouseID,
                },
            },
        );
        return res.data;
    } catch (err) {
        throw new Error(err.response.data);
    }
};

export const checkOrderReleaseID = async (orderReleaseID) => {
    try {
        const token = parseToken('tokenUser');
        const res = await request.get(`/api/order-release/check-order-release-id/${orderReleaseID}`, {
            headers: {
                token: `Bearer ${token.accessToken}`,
                employeeID: token.employeeID,
                warehouseID: token.warehouseID,
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

export const suggestExportProduct = async ({ payload }) => {
    try {
        const token = parseToken('tokenUser');
        const res = await request.post(`/api/order-release/suggest-export`, payload, {
            headers: {
                token: `Bearer ${token.accessToken}`,
                employeeID: token.employeeID,
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
