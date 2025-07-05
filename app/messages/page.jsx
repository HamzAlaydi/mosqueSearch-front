"use client";

import React, { Suspense } from "react";
import Messages from "./MessagesPage"; // Move your code into this file

export default function MessagesWrapper() {
  return (
    <Suspense fallback={<div>Loading messages...</div>}>
      <Messages />
    </Suspense>
  );
}
