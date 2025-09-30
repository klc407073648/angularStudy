// menu.config.ts
export interface MenuItem {
  title: string;
  link: string;
  icon: string;
  permission?: string; // 添加权限字段
  roles?: ('admin' | 'user')[]; // 添加角色字段
}

export const MENU_CONFIG: { [key: string]: MenuItem[] } = {
  manage: [
    {
      title: 'menu.userList',
      link: '/manage/list',
      icon: 'user',
      permission: 'manage.list.view',
      roles: ['admin', 'user'],
    },
    {
      title: 'menu.roleManagement',
      link: '/manage/roles',
      icon: 'team',
      permission: 'manage.roles.view',
      roles: ['admin'],
    },
    {
      title: 'menu.permissionSettings',
      link: '/manage/permissions',
      icon: 'safety-certificate',
      permission: 'manage.permissions.view',
      roles: ['admin'],
    },
  ],
  orders: [
    {
      title: 'menu.pendingOrders',
      link: '/orders/pending',
      icon: 'shopping-cart',
      permission: 'orders.pending.view',
      roles: ['admin'],
    },
    {
      title: 'menu.completedOrders',
      link: '/orders/completed',
      icon: 'check-circle',
      permission: 'orders.completed.view',
      roles: ['admin'],
    },
    {
      title: 'menu.refundManagement',
      link: '/orders/refunds',
      icon: 'dollar',
      permission: 'orders.refunds.view',
      roles: ['admin'],
    },
  ],
  settings: [
    {
      title: 'menu.basicSettings',
      link: '/settings/basic',
      icon: 'setting',
      permission: 'settings.basic.view',
      roles: ['admin'],
    },
    {
      title: 'menu.emailConfig',
      link: '/settings/email',
      icon: 'mail',
      permission: 'settings.email.view',
      roles: ['admin'],
    },
    {
      title: 'menu.logView',
      link: '/settings/logs',
      icon: 'file-search',
      permission: 'settings.logs.view',
      roles: ['admin'],
    },
  ],
};
