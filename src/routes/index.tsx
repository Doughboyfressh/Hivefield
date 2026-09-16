import { createFileRoute } from "@tanstack/react-router";
import { HiveApp } from "@/components/hive/hive-app";

export const Route = createFileRoute("/")({ component: Home });

function Home() {
  return <HiveApp />;
}
