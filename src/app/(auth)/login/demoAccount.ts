export interface DemoAccount {
  id: "admin" | "donor" | "student";
  label: string;
  icon: string;
  email: string;
  password: string;
  buttonClassName: string;
}
