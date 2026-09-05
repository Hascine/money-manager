-- Bug 1: pot_balances only ever subtracted expense-type transactions tagged
-- with a pot, but a transfer's outgoing leg is type 'transfer_out' — since
-- 022 lets transfers carry a pot_id too, a pot-tagged transfer never drew
-- the pot down. Widened to match income/expense + transfer_in/transfer_out.
create or replace view pot_balances
with (security_invoker = true) as
select
  p.id as pot_id,
  p.space_id,
  coalesce(sum(
    case
      when pe.type in ('allocation', 'transfer_in') then pe.amount
      when pe.type = 'transfer_out' then -pe.amount
    end
  ), 0)
  + coalesce((
      select sum(t.amount) from transactions t
      where t.pot_id = p.id and t.type in ('income', 'transfer_in') and t.deleted_at is null
    ), 0)
  - coalesce((
      select sum(t.amount) from transactions t
      where t.pot_id = p.id and t.type in ('expense', 'transfer_out') and t.deleted_at is null
    ), 0)
  as balance
from pots p
left join pot_entries pe on pe.pot_id = p.id and pe.deleted_at is null
where p.deleted_at is null
group by p.id;
