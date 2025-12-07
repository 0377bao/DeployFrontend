export const handleAction = (payload, navigate) => {
    const { tag, ...restPayload } = payload;
    switch (tag) {
        case 'VIEW_DETAIL_PRODUCT':
            const { product_code } = restPayload;
            navigate(`/products?productID=${product_code}`);
            break;
        default:
            break;
    }
};
