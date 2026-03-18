import { Suspense } from "react";

import HomePageClient from "@/app/HomePageClient";

export default function HomePage() {
  return (
    <Suspense>
      <HomePageClient />
    </Suspense>
  );
}

