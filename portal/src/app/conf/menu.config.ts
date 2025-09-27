// menu.config.ts
export interface MenuItem {
  title: string;
  link: string;
  icon: string;
}

export const MENU_CONFIG: { [key: string]: MenuItem[] } = {
  manage: [
    { title: '用户列表', link: '/manage/list', icon: 'user' },
    { title: '角色管理', link: '/manage/roles', icon: 'team' },
    {
      title: '权限设置',
      link: '/manage/permissions',
      icon: 'safety-certificate',
    },
  ],
  orders: [
    { title: '待处理订单', link: '/orders/pending', icon: 'shopping-cart' },
    { title: '已完成订单', link: '/orders/completed', icon: 'check-circle' },
    { title: '退款管理', link: '/orders/refunds', icon: 'dollar' },
  ],
  settings: [
    { title: '基本设置', link: '/settings/basic', icon: 'setting' },
    { title: '邮件配置', link: '/settings/email', icon: 'mail' },
    { title: '日志查看', link: '/settings/logs', icon: 'file-search' },
  ],
};
