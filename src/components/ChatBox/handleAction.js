export const handleAction = (payload, navigate) => {
    const { tag, ...restPayload } = payload;
    switch (tag) {
        case 'VIEW_DETAIL_PRODUCT':
            const { product_code } = restPayload;
            navigate(`/products?productID=${product_code}`);
            break;
        case 'VIEW_NEWLY_PROPOSAL':
            const { proposalID } = restPayload;
            navigate(`/proposal-import-list?proposalID=${proposalID}`);
            break;
        default:
            break;
    }
};
