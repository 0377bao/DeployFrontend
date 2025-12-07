export const styleMessage = {
    style: {
        fontSize: '1.5rem',
    },
};

export const mapperRole = {
    'Quản trị viên': {
        roleID: 1,
        roleName: 'SYSTEM_ADMIN',
    },
    'Quản lý kho': {
        roleID: 2,
        roleName: 'WARE_MANAGER',
    },
    'Nhân viên xuất hàng': {
        roleID: 4,
        roleName: 'STOCK_DISPATCHER',
    },
    'Nhân viên nhận hàng': {
        roleID: 3,
        roleName: 'STOCK_RECEIVER',
    },
    'Kế toán': {
        roleID: 5,
        roleName: 'ACCOUNTANT',
    },
};

export const formatRole = {
    SYSTEM_ADMIN: 'Quản trị viên',
    WARE_MANAGER: 'Quản lý kho',
    STOCK_RECEIVER: 'Nhân viên nhận hàng',
    STOCK_DISPATCHER: 'Nhân viên xuất hàng',
    ACCOUNTANT: 'Kế toán',
};

export const formatStatusProduct = {
    AVAILABLE: 'Đang kinh doanh',
    OUT_OF_STOCK: 'Hàng trong kho đã hết',
    DISCONTINUED: 'Ngừng kinh doanh',
};

export const formatStatusProposal = {
    PENDING: 'Chờ phê duyệt',
    APPROVED: 'Đã phê duyệt',
    REFUSE: 'Từ chối',
    COMPLETED: 'Đã hoàn thành',
};

export const formatStatusOrderPurchase = {
    COMPLETED: 'Đã hoàn thành',
    INCOMPLETE: 'Chưa hoàn thành',
    CANCELED: 'Đã huỷ',
};

export const formatTypeOrderPurchase = {
    NORMAL: 'Phiếu nhập mới',
    SUPPLEMENT: 'Phiếu bổ sung',
};

export const formatStatusOrderPurchaseMissing = {
    PENDING: 'Đang xử lý',
    RESOLVED: 'Đã giải quyết',
    CANCELED: 'Đã hủy',
};

export const formatStatusInventoryCheck = {
    PENDING: 'Chờ phê duyệt',
    PENDING_CHECK: 'Chờ kiểm kê',
    COMPLETED: 'Đã phê duyệt',
    REFUSE: 'Từ chối',
};

export const formatStatusOrderPurchaseMissingInventoryCheck = {
    BALANCED: 'Đủ sản phẩm',
    DISCREPANCY: 'Chênh lệch',
};

export const formatStatusInventoryCheckDetail = {
    MATCHED: 'Đủ sản phẩm',
    SHORTAGE: 'Thiếu sản phẩm',
    SURPLUS: 'Dư sản phẩm',
};

export const typeTransaction = {
    PURCHASE: 'Nhập hàng',
    RELEASE: 'Xuất hàng',
    INVENTORY_CHECK: 'Kiểm kê hàng',
};

export const formatStatusOrderRelease = {
    PENDING: 'Chờ phê duyệt',
    PENDING_PICK: 'Đang chờ lấy hàng',
    COMPLETED: 'Đã hoàn thành',
    REFUSE: 'Từ chối',
};
