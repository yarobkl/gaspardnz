import { useEffect, useState } from "react";
import { supabase } from "../services/supabaseClient.js";

const ALLOWED_TABLES = new Set([
  "packages",
  "partners",
  "news_posts",
  "vip_clients",
  "wedding_inspirations",
  "style_month",
  "promotions",
  "media_assets",
  "site_content",
  "content_albums",
]);

export function usePublicCollection(table, {
  fallback = [],
  select = "*",
  filters = [],
  orderBy = "sort_order",
  ascending = true,
  enabled = true,
} = {}) {
  const [rows, setRows] = useState(fallback);
  const [source, setSource] = useState("fallback");
  const [loading, setLoading] = useState(Boolean(enabled));

  useEffect(() => {
    if (!enabled || !ALLOWED_TABLES.has(table)) {
      setRows(fallback);
      setSource("fallback");
      setLoading(false);
      return undefined;
    }

    let alive = true;
    const load = async () => {
      let query = supabase.from(table).select(select).eq("published", true);
      for (const filter of filters) {
        if (filter?.type === "eq") query = query.eq(filter.column, filter.value);
        if (filter?.type === "gte") query = query.gte(filter.column, filter.value);
        if (filter?.type === "lte") query = query.lte(filter.column, filter.value);
        if (filter?.type === "is") query = query.is(filter.column, filter.value);
      }
      if (orderBy) query = query.order(orderBy, { ascending });
      const { data, error } = await query;
      if (!alive) return;
      if (!error && Array.isArray(data) && data.length) {
        setRows(data);
        setSource("supabase");
      } else {
        setRows(fallback);
        setSource("fallback");
      }
      setLoading(false);
    };

    load();
    const channel = supabase
      .channel(`public-${table}-${Math.random().toString(36).slice(2)}`)
      .on("postgres_changes", { event: "*", schema: "public", table }, load)
      .subscribe();

    return () => {
      alive = false;
      supabase.removeChannel(channel);
    };
  }, [table, enabled, select, orderBy, ascending, JSON.stringify(filters), JSON.stringify(fallback)]);

  return { rows, source, loading };
}
