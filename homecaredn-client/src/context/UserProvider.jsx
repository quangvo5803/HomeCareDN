import { useState, useCallback, useMemo } from 'react';
import { userService } from '../services/userService';
import UserContext from './UserContext'
import { toast } from 'react-toastify';
import { handleApiError } from '../utils/handleApiError';
import PropTypes from 'prop-types';
import { withMinLoading } from '../utils/withMinLoading';

export const UserProvider = ({ children }) => {

    const [users, setUsers] = useState([]);
    const [totalUsers, setTotalUsers] = useState(0);
    const [loading, setLoading] = useState(false);

    const executeFetch = useCallback(
        async ({
            PageNumber = 1,
            PageSize = 10,
            SortBy,
            FilterRoleName,
            Search,
        } = {}) => {
            try {
                const data = await userService.getAll({
                    PageNumber,
                    PageSize,
                    SortBy,
                    FilterRoleName,
                    Search,
                });
                const items = data.items || [];
                setUsers(items);
                setTotalUsers(data.totalCount || 0);
                return items;
            } catch (err) {
                toast.error(handleApiError(err));
                setUsers([]);
                setTotalUsers(0);
                return [];
            }
        },
        []
    );

    const fetchUsers = useCallback(
        async (params = {}) => {
            return await withMinLoading(() => executeFetch(params), setLoading);
        },
        [executeFetch]
    );

    const contextValue = useMemo(
        () => ({
            users,
            totalUsers,
            loading,
            fetchUsers,
        }),
        [
            users,
            totalUsers,
            loading,
            fetchUsers,
        ]
    );

    return (
        <UserContext.Provider value={contextValue}>
            {children}
        </UserContext.Provider>
    )
};
UserProvider.propTypes = { children: PropTypes.node.isRequired };