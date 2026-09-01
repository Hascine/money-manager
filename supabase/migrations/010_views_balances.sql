-- Balance is always computed, never stored (same philosophy as ERD v1).
-- security_invoker is load-bearing: without it these views run with the view
-- owner's privileges and bypass RLS on accounts/transactions entirely.

create view account_balances
with (security_invoker = true) as
select
  a.id as account_id,
  a.space_id,
  a.initial_balance + coalesce(sum(
    case
      when t.type in ('income', 'transfer_in') then t.amount
      when t.type in ('expense', 'transfer_out') then -t.amount
    end
  ), 0) as balance
from accounts a
left join transactions t on t.account_id = a.id and t.deleted_at is null
where a.deleted_at is null
group by a.id;

create view space_balances
with (security_invoker = true) as
select space_id, sum(balance) as total_balance
from account_balances
group by space_id;
