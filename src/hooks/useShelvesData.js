// src/hooks/useShelvesData.js
import { useEffect, useState } from 'react';
import { getAllShelfOfWarehouse } from '../services/shelf.service';
import parseToken from '@/utils/parseToken';

export default function useShelvesData() {
    const [shelvesData, setShelvesData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchData();
    }, []);

    async function fetchData() {
        try {
            setLoading(true);
            const token = parseToken('tokenUser');
            const warehouse = parseToken('warehouse');
            const headers = {
                token: `Bearer ${token.accessToken}`,
                employeeID: token.employeeID,
                warehouseID: warehouse.warehouseID,
            };
            const res = await getAllShelfOfWarehouse({
                warehouseID: warehouse.warehouseID,
                headers,
            });
            if (res.status === 'OK') {
                setShelvesData(res.data);
            } else {
                setError(res.message || 'Fetch error');
            }
        } catch (err) {
            setError(err.message || 'Fetch error');
        } finally {
            setLoading(false);
        }
    }

    return { shelvesData, loading, error, refetch: fetchData };
}
