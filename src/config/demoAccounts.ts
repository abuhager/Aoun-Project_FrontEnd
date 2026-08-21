export interface DemoAccount {
  label: string;
  icon: string;
  email: string;
  password: string;
  buttonClassName: string;
}

const DEMO_PASSWORD = '1870547aA';

export const DEMO_ACCOUNTS: readonly DemoAccount[] = Object.freeze([
  {
    label: 'مسؤول',
    icon: '🛡️',
    email: 'admin@aoun.jo',
    password: DEMO_PASSWORD,
    buttonClassName: 'bg-primary/10 text-primary hover:bg-primary/20',
  },
  {
    label: 'متبرع',
    icon: '🎁',
    email: 'donor@gmail.com',
    password: DEMO_PASSWORD,
    buttonClassName: 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100',
  },
  {
    label: 'طالب',
    icon: '🎓',
    email: 'sara@student.ju.edu.jo',
    password: DEMO_PASSWORD,
    buttonClassName: 'bg-sky-50 text-sky-700 hover:bg-sky-100',
  },
]);
