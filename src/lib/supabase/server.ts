/** DUMMY SERVER-SIDE SUPABASE CLIENT (NO REAL DB) */

// Dummy query builder
class DummyQueryBuilder {
  private table: string;
  private selectFields: string = "*";
  private orderField?: string;
  private orderAsc: boolean = true;
  private data: any[] = [];

  constructor(table: string, data: any[] = []) {
    this.table = table;
    this.data = data;
  }

  select(fields?: string) {
    this.selectFields = fields || "*";
    return this;
  }

  order(field: string, options?: { ascending?: boolean }) {
    this.orderField = field;
    this.orderAsc = options?.ascending ?? true;
    return this;
  }

  eq(field: string, value: any) {
    this.data = this.data.filter((row) => row[field] === value);
    return this;
  }

  single() {
    return this;
  }

  async then(callback: any) {
    // Apply ordering
    if (this.orderField) {
      this.data.sort((a: any, b: any) => {
        const aVal = a[this.orderField!];
        const bVal = b[this.orderField!];
        if (this.orderAsc) {
          return aVal > bVal ? 1 : -1;
        } else {
          return aVal < bVal ? 1 : -1;
        }
      });
    }
    return callback({ data: this.data, error: null });
  }
}

// Dummy server client
export function createClient() {
  return {
    from: (table: string) => {
      // Return mock data based on table name
      const mockData: Record<string, any[]> = {
        batches: [
          {
            id: "1",
            batch_no: "BTH-001",
            product_name: "Paracetamol 500mg",
            created_at: new Date().toISOString(),
            release_status: "pending",
            prod_status: "pending",
          },
          {
            id: "2",
            batch_no: "BTH-002",
            product_name: "Ibuprofen 400mg",
            created_at: new Date().toISOString(),
            release_status: "released",
            prod_status: "released",
          },
        ],
        users: [
          {
            id: "demo-user",
            name: "Demo User",
            email: "demo@example.com",
            role: "admin",
            is_active: true,
          },
        ],
        stability_studies: [
          {
            id: "1",
            batch_id: "1",
            created_at: new Date().toISOString(),
            parameters: [],
            results: [],
            batch: { batch_no: "BTH-001", product_name: "Paracetamol 500mg" },
          },
        ],
      };

      const data = mockData[table] || [];
      return new DummyQueryBuilder(table, JSON.parse(JSON.stringify(data)));
    },
    auth: {
      getUser: async () => ({
        data: { user: { id: "demo-user" } },
        error: null,
      }),
    },
  };
}

// Service-role client (dummy version)
export function createServiceClient() {
  return createClient();
}
