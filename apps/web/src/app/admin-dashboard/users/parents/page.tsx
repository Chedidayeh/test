import React from "react";
import {
  getParents,
} from "@/src/lib/auth-service/server-api";
import ParentsPage from "./ParentsPage";


export default async function page() {
  const [parentsData] = await Promise.all([
    getParents({ limit: 10, offset: 0 }).catch(() => ({
      parents: [],
      pagination: { total: 0, page: 1, pageSize: 10, hasMore: false },
    })),
  ]);

  return (
    <ParentsPage
      initialData={parentsData.parents}
      initialPagination={parentsData.pagination}
    />
  );
}
