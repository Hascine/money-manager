import ExcelJS from "exceljs";
import { createClient } from "@/lib/supabase/server";
import { getAccountBalances, getPotBalances } from "@/lib/balances";
import { getAccountTypeLabels } from "@/lib/account-icons";
import { getDictionary } from "@/lib/i18n/get-language";

const CURRENCY_FORMAT = '#,##0 "IDR"';

export async function GET(request: Request, { params }: { params: Promise<{ spaceId: string }> }) {
  const { spaceId } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return new Response("Unauthorized", { status: 401 });

  const url = new URL(request.url);
  const type = url.searchParams.get("type");
  const category = url.searchParams.get("category");
  const start = url.searchParams.get("start");
  const end = url.searchParams.get("end");
  const isFiltered = Boolean(type || category || start || end);
  const scope = url.searchParams.get("scope") === "filtered" && isFiltered ? "filtered" : "all";

  const workbook = new ExcelJS.Workbook();
  workbook.creator = "Finora";
  workbook.created = new Date();

  // --- Transactions sheet -------------------------------------------------
  let txQuery = supabase
    .from("transactions")
    .select("type, amount, transaction_date, note, categories(name), accounts(name)")
    .eq("space_id", spaceId)
    .is("deleted_at", null);

  if (scope === "filtered") {
    if (type === "income" || type === "expense") txQuery = txQuery.eq("type", type);
    if (category === "uncategorized") txQuery = txQuery.is("category_id", null);
    else if (category) txQuery = txQuery.eq("category_id", category);
    if (start) txQuery = txQuery.gte("transaction_date", start);
    if (end) txQuery = txQuery.lte("transaction_date", end);
  }
  txQuery = txQuery.order("transaction_date", { ascending: false });

  const { data: transactions } = await txQuery;

  const txSheet = workbook.addWorksheet("Transactions");
  txSheet.columns = [
    { header: "Date", key: "date", width: 14 },
    { header: "Type", key: "type", width: 14 },
    { header: "Account", key: "account", width: 20 },
    { header: "Category", key: "category", width: 20 },
    { header: "Amount", key: "amount", width: 16 },
    { header: "Note", key: "note", width: 30 },
  ];
  txSheet.getRow(1).font = { bold: true };
  for (const tx of transactions ?? []) {
    txSheet.addRow({
      date: tx.transaction_date,
      type: tx.type,
      account: tx.accounts?.name ?? "",
      category: tx.categories?.name ?? "",
      amount: tx.amount,
      note: tx.note ?? "",
    });
  }
  txSheet.getColumn("amount").numFmt = CURRENCY_FORMAT;

  // A filtered export is just the one sheet — Budgeting/Accounts don't have
  // a meaningful "filtered by category/date" view of their own.
  if (scope === "all") {
    const t = await getDictionary();
    const typeLabels = getAccountTypeLabels(t);

    const [{ data: accounts }, accountBalances, { data: pots }, potBalances] = await Promise.all([
      supabase
        .from("accounts")
        .select("id, name, type, provider, is_active, include_in_total_balance")
        .eq("space_id", spaceId)
        .is("deleted_at", null)
        .order("created_at"),
      getAccountBalances(spaceId),
      supabase.from("pots").select("id, name").eq("space_id", spaceId).is("deleted_at", null).order("created_at"),
      getPotBalances(spaceId),
    ]);

    const accSheet = workbook.addWorksheet("Accounts");
    accSheet.columns = [
      { header: "Name", key: "name", width: 20 },
      { header: "Type", key: "type", width: 14 },
      { header: "Provider", key: "provider", width: 18 },
      { header: "Balance", key: "balance", width: 16 },
      { header: "Included in Total", key: "included", width: 16 },
      { header: "Active", key: "active", width: 10 },
    ];
    accSheet.getRow(1).font = { bold: true };
    for (const acc of accounts ?? []) {
      accSheet.addRow({
        name: acc.name,
        type: typeLabels[acc.type] ?? acc.type,
        provider: acc.provider ?? "",
        balance: accountBalances.get(acc.id) ?? 0,
        included: acc.include_in_total_balance ? "Yes" : "No",
        active: acc.is_active ? "Yes" : "No",
      });
    }
    accSheet.getColumn("balance").numFmt = CURRENCY_FORMAT;

    const potSheet = workbook.addWorksheet("Budgeting");
    potSheet.columns = [
      { header: "Name", key: "name", width: 20 },
      { header: "Balance", key: "balance", width: 16 },
    ];
    potSheet.getRow(1).font = { bold: true };
    for (const pot of pots ?? []) {
      potSheet.addRow({ name: pot.name, balance: potBalances.get(pot.id) ?? 0 });
    }
    potSheet.getColumn("balance").numFmt = CURRENCY_FORMAT;
  }

  const buffer = await workbook.xlsx.writeBuffer();
  const filename = scope === "filtered" ? `finora-transactions-${start ?? ""}-${end ?? ""}.xlsx` : `finora-export.xlsx`;

  return new Response(buffer, {
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}
