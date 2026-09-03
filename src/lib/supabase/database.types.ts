// Hand-authored to match supabase/migrations/*.sql.
// Regenerate from the real database once the local stack has run at least once:
//   supabase gen types typescript --local > src/lib/supabase/database.types.ts

export type SpaceType = "PERSONAL" | "COLLABORATIVE";
export type MemberRole = "owner" | "admin" | "member" | "viewer";
export type AccountType = "cash" | "bank" | "ewallet" | "saving" | "other";
export type CategoryType = "income" | "expense";
export type TransactionType = "income" | "expense" | "transfer_in" | "transfer_out";
export type PotEntryType = "allocation" | "transfer_in" | "transfer_out";

// Every table/view below declares a Relationships array because
// @supabase/postgrest-js's GenericTable/GenericView require it — see
// node_modules/@supabase/postgrest-js/src/types/common/common.ts.

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          display_name: string;
          avatar_url: string | null;
          onboarding_completed_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          display_name: string;
          avatar_url?: string | null;
        };
        Update: {
          display_name?: string;
          avatar_url?: string | null;
          onboarding_completed_at?: string | null;
        };
        Relationships: [];
      };
      spaces: {
        Row: {
          id: string;
          type: SpaceType;
          name: string;
          created_by: string;
          created_at: string;
          updated_at: string;
          deleted_at: string | null;
        };
        Insert: never;
        Update: {
          name?: string;
          deleted_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "spaces_created_by_fkey";
            columns: ["created_by"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      space_members: {
        Row: {
          id: string;
          space_id: string;
          profile_id: string;
          role: MemberRole;
          invited_by: string | null;
          joined_at: string;
          created_at: string;
          updated_at: string;
          deleted_at: string | null;
        };
        Insert: never;
        Update: {
          role?: MemberRole;
          deleted_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "space_members_space_id_fkey";
            columns: ["space_id"];
            isOneToOne: false;
            referencedRelation: "spaces";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "space_members_profile_id_fkey";
            columns: ["profile_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      space_invites: {
        Row: {
          id: string;
          space_id: string;
          code: string;
          role: MemberRole;
          created_by: string;
          max_uses: number | null;
          uses_count: number;
          expires_at: string | null;
          revoked_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          space_id: string;
          role?: MemberRole;
          created_by: string;
          max_uses?: number | null;
          expires_at?: string | null;
        };
        Update: {
          revoked_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "space_invites_space_id_fkey";
            columns: ["space_id"];
            isOneToOne: false;
            referencedRelation: "spaces";
            referencedColumns: ["id"];
          },
        ];
      };
      accounts: {
        Row: {
          id: string;
          space_id: string;
          name: string;
          type: AccountType;
          provider: string | null;
          account_number: string | null;
          initial_balance: number;
          is_active: boolean;
          created_by: string;
          created_at: string;
          updated_at: string;
          deleted_at: string | null;
        };
        Insert: {
          space_id: string;
          name: string;
          type: AccountType;
          provider?: string | null;
          account_number?: string | null;
          initial_balance?: number;
          is_active?: boolean;
          created_by: string;
        };
        Update: {
          name?: string;
          type?: AccountType;
          provider?: string | null;
          account_number?: string | null;
          initial_balance?: number;
          is_active?: boolean;
          deleted_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "accounts_space_id_fkey";
            columns: ["space_id"];
            isOneToOne: false;
            referencedRelation: "spaces";
            referencedColumns: ["id"];
          },
        ];
      };
      categories: {
        Row: {
          id: string;
          space_id: string;
          name: string;
          type: CategoryType;
          parent_id: string | null;
          is_active: boolean;
          created_at: string;
          updated_at: string;
          deleted_at: string | null;
        };
        Insert: {
          space_id: string;
          name: string;
          type: CategoryType;
          parent_id?: string | null;
          is_active?: boolean;
        };
        Update: {
          name?: string;
          is_active?: boolean;
          deleted_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "categories_space_id_fkey";
            columns: ["space_id"];
            isOneToOne: false;
            referencedRelation: "spaces";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "categories_parent_id_fkey";
            columns: ["parent_id"];
            isOneToOne: false;
            referencedRelation: "categories";
            referencedColumns: ["id"];
          },
        ];
      };
      transactions: {
        Row: {
          id: string;
          space_id: string;
          account_id: string;
          category_id: string | null;
          pot_id: string | null;
          created_by: string;
          type: TransactionType;
          amount: number;
          transaction_date: string;
          note: string | null;
          created_at: string;
          updated_at: string;
          deleted_at: string | null;
        };
        Insert: {
          account_id: string;
          category_id?: string | null;
          pot_id?: string | null;
          created_by: string;
          type: "income" | "expense";
          amount: number;
          transaction_date: string;
          note?: string | null;
        };
        Update: {
          category_id?: string | null;
          pot_id?: string | null;
          amount?: number;
          transaction_date?: string;
          note?: string | null;
          deleted_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "transactions_account_id_fkey";
            columns: ["account_id"];
            isOneToOne: false;
            referencedRelation: "accounts";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "transactions_category_id_fkey";
            columns: ["category_id"];
            isOneToOne: false;
            referencedRelation: "categories";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "transactions_pot_id_fkey";
            columns: ["pot_id"];
            isOneToOne: false;
            referencedRelation: "pots";
            referencedColumns: ["id"];
          },
        ];
      };
      transfers: {
        Row: {
          id: string;
          from_account_id: string;
          to_account_id: string;
          from_space_id: string;
          to_space_id: string;
          out_transaction_id: string;
          in_transaction_id: string;
          amount: number;
          transfer_date: string;
          note: string | null;
          created_by: string;
          created_at: string;
          updated_at: string;
          deleted_at: string | null;
        };
        Insert: never;
        Update: never;
        Relationships: [
          {
            foreignKeyName: "transfers_from_account_id_fkey";
            columns: ["from_account_id"];
            isOneToOne: false;
            referencedRelation: "accounts";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "transfers_to_account_id_fkey";
            columns: ["to_account_id"];
            isOneToOne: false;
            referencedRelation: "accounts";
            referencedColumns: ["id"];
          },
        ];
      };
      pots: {
        Row: {
          id: string;
          space_id: string;
          name: string;
          created_by: string;
          created_at: string;
          updated_at: string;
          deleted_at: string | null;
        };
        Insert: {
          space_id: string;
          name: string;
          created_by: string;
        };
        Update: {
          name?: string;
          deleted_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "pots_space_id_fkey";
            columns: ["space_id"];
            isOneToOne: false;
            referencedRelation: "spaces";
            referencedColumns: ["id"];
          },
        ];
      };
      pot_entries: {
        Row: {
          id: string;
          pot_id: string;
          space_id: string;
          type: PotEntryType;
          amount: number;
          note: string | null;
          entry_date: string;
          created_by: string;
          created_at: string;
          deleted_at: string | null;
        };
        Insert: {
          pot_id: string;
          space_id: string;
          type: PotEntryType;
          amount: number;
          note?: string | null;
          entry_date?: string;
          created_by: string;
        };
        Update: {
          deleted_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "pot_entries_pot_id_fkey";
            columns: ["pot_id"];
            isOneToOne: false;
            referencedRelation: "pots";
            referencedColumns: ["id"];
          },
        ];
      };
    };
    Views: {
      account_balances: {
        Row: {
          account_id: string;
          space_id: string;
          balance: number;
        };
        Relationships: [];
      };
      space_balances: {
        Row: {
          space_id: string;
          total_balance: number;
        };
        Relationships: [];
      };
      pot_balances: {
        Row: {
          pot_id: string;
          space_id: string;
          balance: number;
        };
        Relationships: [];
      };
    };
    Functions: {
      get_transfer_targets: {
        Args: { p_source_space_id: string };
        Returns: {
          account_id: string;
          account_name: string;
          account_type: AccountType;
          space_id: string;
          space_name: string;
          space_type: SpaceType;
          owner_display_name: string | null;
        }[];
      };
      create_transfer: {
        Args: {
          p_from_account_id: string;
          p_to_account_id: string;
          p_amount: number;
          p_transfer_date: string;
          p_note?: string | null;
        };
        Returns: string;
      };
      update_transfer: {
        Args: {
          p_transfer_id: string;
          p_amount: number;
          p_transfer_date: string;
          p_note?: string | null;
        };
        Returns: undefined;
      };
      delete_transfer: {
        Args: { p_transfer_id: string };
        Returns: undefined;
      };
      create_collaborative_space: {
        Args: { p_name: string };
        Returns: string;
      };
      redeem_invite: {
        Args: { p_code: string };
        Returns: string;
      };
    };
    Enums: {
      space_type: SpaceType;
      member_role: MemberRole;
      account_type: AccountType;
      category_type: CategoryType;
      transaction_type: TransactionType;
      pot_entry_type: PotEntryType;
    };
  };
}
