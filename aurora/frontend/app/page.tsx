import dynamic from "next/dynamic";

const Dashboard = dynamic(
  () => import("./dashboard/Dashboard"),
  { ssr: false }
);

export default function HomePage() {
  return <Dashboard />;
}
