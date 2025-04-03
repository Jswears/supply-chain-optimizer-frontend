import { redirect } from 'next/navigation';

export default function Home() {
  // Redirect to the products dashboard page
  redirect('/dashboard/products');
}
