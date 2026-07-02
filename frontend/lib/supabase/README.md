# Supabase Client Configuration

This module configures the official Supabase JavaScript client for the **Offerly** frontend, using the Next.js 15 App Router architecture.

---

## 1. Directory Structure

```
frontend/lib/supabase/
├── client.ts      # Browser client implementation
├── server.ts      # Server-side client helper (Route handlers, actions, server components)
├── types.ts       # Database schemas types declaration
└── README.md      # Integration guidelines
```

---

## 2. Setup & Environment Configurations

The client requires the following environment parameters. These should be defined in your `.env.local` file:

```bash
NEXT_PUBLIC_SUPABASE_URL="https://your-project-id.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="your-anon-key-string"
```

*Note: In Next.js, keys prefixed with `NEXT_PUBLIC_` are safely compiled for evaluation in client-side code bundles.*

---

## 3. Integration & Usage Guide

### 3.1 Browser Client (Client Components)
Use the standard singleton browser client inside client components (`"use client"`):

```typescript
"use client";

import { supabase } from "@/lib/supabase/client";
import { useEffect, useState } from "react";

export default function UserProfile() {
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    async function getProfile() {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data } = await supabase
          .from("users")
          .select("*")
          .eq("id", user.id)
          .single();
        setProfile(data);
      }
    }
    getProfile();
  }, []);

  // ...
}
```

### 3.2 Server Client (Server Components, Actions, & Route Handlers)
For server-side code, import the asynchronous factory `createClient()`. This automatically coordinates reading and writing session tokens to cookies:

```typescript
import { createClient } from "@/lib/supabase/server";

export default async function JobDetailsPage() {
  // Await client initialization
  const supabase = await createClient();
  
  // Fetch columns
  const { data: jobs } = await supabase
    .from("jobs")
    .select("*, companies(*)");

  return (
    <div>
      {/* Render jobs list */}
    </div>
  );
}
```
