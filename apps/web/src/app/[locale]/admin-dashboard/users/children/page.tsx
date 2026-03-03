import React from "react";
import ChildrenPage from "./ChildrenPage";
import { getAllChildren } from "@/src/lib/progress-service/server-api";

export default async function page() {
  // Fetch data on the server
  const childrenData = await getAllChildren({ limit: 10 }).catch(() => ({
    children: [],
    pagination: { total: 0, page: 1, pageSize: 10, hasMore: false },
  }));
  
  // Ensure pagination is always defined
  const normalizedData = {
    children: childrenData.children,
    pagination: childrenData.pagination || {
      total: 0,
      page: 1,
      pageSize: 10,
      hasMore: false,
    },
  };
  

  return <ChildrenPage childrenData={normalizedData} />;
}
