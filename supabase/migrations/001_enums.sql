-- Finora core enums

create type space_type as enum ('PERSONAL', 'COLLABORATIVE');
create type member_role as enum ('owner', 'admin', 'member', 'viewer');
create type account_type as enum ('cash', 'bank', 'ewallet', 'saving', 'other');
create type category_type as enum ('income', 'expense');
create type transaction_type as enum ('income', 'expense', 'transfer_in', 'transfer_out');
