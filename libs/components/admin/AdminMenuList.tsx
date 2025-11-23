import ExpandLess from '@mui/icons-material/ExpandLess';
import ExpandMore from '@mui/icons-material/ExpandMore';
import { List, ListItemButton, ListItemIcon, ListItemText } from '@mui/material';
import Collapse from '@mui/material/Collapse';
import Typography from '@mui/material/Typography';
import cookies from 'js-cookie';
import Link from 'next/link';
import { useRouter, withRouter } from 'next/router';
import { ChatsCircle, User, UserCircleGear } from 'phosphor-react';
import { useEffect, useState } from 'react';
import useDeviceDetect from '../../hooks/useDeviceDetect';

const AdminMenuList = (props: any) => {
  const router = useRouter();
  const device = useDeviceDetect();
  const [mobileLayout, setMobileLayout] = useState(false);
  const [openSubMenu, setOpenSubMenu] = useState('Users');
  const [openMenu, setOpenMenu] = useState(
    typeof window === 'object' ? cookies.get('admin_menu') === 'true' : false,
  );
  const [clickMenu, setClickMenu] = useState<any>([]);
  const [clickSubMenu, setClickSubMenu] = useState('');

  const {
    router: { pathname },
  } = props;

  const pathnames = pathname.split('/').filter((x: any) => x);

  /** LIFECYCLES **/
  useEffect(() => {
    if (device === 'mobile') setMobileLayout(true);

    switch (pathnames[1]) {
      case 'properties':
        setClickMenu(['Properties']);
        break;
      case 'community':
        setClickMenu(['Community']);
        break;
      case 'inquiries':
        setClickMenu(['Inquiries']);
        break;
      default:
        setClickMenu(['Users']);
        break;
    }

    switch (pathnames[2]) {
      case 'logs':
        setClickSubMenu('Logs');
        break;
      case 'board_create':
        setClickSubMenu('Board Create');
        break;
      default:
        setClickSubMenu('List');
        break;
    }
  }, []);

  /** HANDLERS **/
  const subMenuChangeHandler = (target: string) => {
    if (clickMenu.find((item: string) => item === target)) {
      // setOpenSubMenu('');
      setClickMenu(clickMenu.filter((menu: string) => target !== menu));
    } else {
      // setOpenSubMenu(target);
      setClickMenu([...clickMenu, target]);
    }
  };

  const menu_set = [
    {
      title: 'Users',
      icon: <User size={20} color="#bdbdbd" weight="fill" />,
      on_click: () => subMenuChangeHandler('Users'),
    },
    {
      title: 'Properties',
      icon: <UserCircleGear size={20} color="#bdbdbd" weight="fill" />,
      on_click: () => subMenuChangeHandler('Properties'),
    },
    {
      title: 'Community',
      icon: <ChatsCircle size={20} color="#bdbdbd" weight="fill" />,
      on_click: () => subMenuChangeHandler('Community'),
    },
    {
      title: 'Inquiries',
      icon: <ChatsCircle size={20} color="#bdbdbd" weight="fill" />,
      on_click: () => subMenuChangeHandler('Inquiries'),
    },
  ];

  const sub_menu_set: any = {
    Users: [{ title: 'List', url: '/_admin/users' }],
    Properties: [{ title: 'List', url: '/_admin/properties' }],
    Community: [{ title: 'List', url: '/_admin/community' }],
    Inquiries: [{ title: 'List', url: '/_admin/inquiries' }],
  };

  return (
    <>
      {menu_set.map((item, index) => (
        <List className={'menu_wrap'} key={index} disablePadding>
          <ListItemButton
            onClick={item.on_click}
            component={'li'}
            className={clickMenu[0] === item.title ? 'menu on' : 'menu'}
            sx={{
              minHeight: 48,
              justifyContent: openMenu ? 'initial' : 'center',
              px: 2.5,
            }}
          >
            <ListItemIcon
              sx={{
                minWidth: 0,
                mr: openMenu ? 3 : 'auto',
                justifyContent: 'center',
              }}
            >
              {item.icon}
            </ListItemIcon>
            <ListItemText>{item.title}</ListItemText>
            {clickMenu.find((menu: string) => item.title === menu) ? (
              <ExpandLess />
            ) : (
              <ExpandMore />
            )}
          </ListItemButton>
          <Collapse
            in={!!clickMenu.find((menu: string) => menu === item.title)}
            className="menu"
            timeout="auto"
            component="li"
            unmountOnExit
          >
            <List className="menu-list" disablePadding>
              {sub_menu_set[item.title] &&
                sub_menu_set[item.title].map((sub: any, i: number) => (
                  <Link href={sub.url} shallow={true} replace={true} key={i}>
                    <ListItemButton
                      component="li"
                      className={
                        clickMenu[0] === item.title && clickSubMenu === sub.title ? 'li on' : 'li'
                      }
                    >
                      <Typography variant={sub.title} component={'span'}>
                        {sub.title}
                      </Typography>
                    </ListItemButton>
                  </Link>
                ))}
            </List>
          </Collapse>
        </List>
      ))}
    </>
  );
};

export default withRouter(AdminMenuList);
