import React, { Fragment, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import classNames from 'classnames/bind';
import styles from './SidebarItem.module.scss';
import { ArrowBigRight, ChevronLeft, ChevronRight } from 'lucide-react';
import { useSelector } from 'react-redux';

const cx = classNames.bind(styles);

const SidebarItem = ({ id, title, iconName, path, location, subMenu = [], changeDropItem, itemDrop, roles }) => {
    const Icon = iconName ? iconName : Fragment;
    const { user } = useSelector((state) => state.AuthSlice);

    const checkRoleUser = (roles) => {
        const userRoles = user?.empRole?.map((role) => role.roleName) || [];
        return roles.some((role) => userRoles.includes(role) || roles.includes('PUBLIC'));
    };

    const divRef = useRef();
    const handleScrollSubmenu = () => {
        if (itemDrop.includes(id)) {
            changeDropItem(itemDrop.filter((item) => item !== id));
        } else {
            changeDropItem([...itemDrop, id]);
        }
    };

    useEffect(() => {
        const checkDrop = itemDrop.includes(id);
        if (divRef.current) {
            if (checkDrop) {
                divRef.current.style.height = divRef.current.scrollHeight + 'px';
                divRef.current.style.animation = `slice 1s ease-in-out`;
                divRef.current.classList.add(cx('active'));
            } else {
                divRef.current.style.height = '35px';
                divRef.current.classList.remove(cx('active'));
            }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [itemDrop]);

    return (
        <>
            {subMenu.length > 0 ? (
                <div ref={divRef} className={cx('wrapper-menu-route')}>
                    <div className={cx('header-submenu')} onClick={handleScrollSubmenu}>
                        {iconName && <Icon size={18} />}
                        <span className={cx('title')}>{title}</span>
                        <ChevronRight className={cx('chevron-icon')} size={20} />
                    </div>
                    {subMenu.map((subItem, index) => {
                        const SubIcon = subItem.iconName ? subItem.iconName : Fragment;
                        return checkRoleUser(subItem.roles) ? (
                            <Link
                                key={index}
                                to={`${subItem.path}`}
                                className={cx('wrapper-link', {
                                    active: subItem.path == location,
                                    submenu: true,
                                })}
                                onClick={() => changeDropItem([id])}
                            >
                                {subItem.iconName && <SubIcon size={18} />}
                                <span className={cx('title')}>{subItem.title}</span>
                            </Link>
                        ) : null;
                    })}
                </div>
            ) : checkRoleUser(roles) ? (
                <div className={cx('header-submenu')}>
                    <Link
                        to={`${path}`}
                        className={cx('wrapper-link', {
                            active: path == location,
                        })}
                    >
                        {iconName && <Icon size={18} />}
                        <span className={cx('title')}>{title}</span>
                    </Link>
                </div>
            ) : null}
        </>
    );
};

export default SidebarItem;
